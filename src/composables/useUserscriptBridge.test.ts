import { afterEach, describe, it, expect, vi } from 'vitest';
import { createApp, h } from 'vue';
import { useUserscriptBridge, EXPECTED_SCRIPT_VERSION } from './useUserscriptBridge';
import type { UserscriptRequestPayload, UserscriptResponsePayload } from './useUserscriptBridge';

const PONG_EVENT = 'miska-userscript-pong';
const REQUEST_EVENT = 'miska-userscript-request';
const RESPONSE_EVENT = 'miska-userscript-response';

afterEach(() => {
  vi.useRealTimers();
});

/** 挂载一个真实 Vue 应用以触发 onMounted/onUnmounted，模拟浏览器环境。 */
const mountBridge = () => {
  let bridge: ReturnType<typeof useUserscriptBridge> | null = null;
  const app = createApp({
    setup() {
      bridge = useUserscriptBridge();
      return () => h('div');
    },
  });
  const el = document.createElement('div');
  app.mount(el);
  return { bridge: bridge!, unmount: () => app.unmount() };
};

/** 模拟油猴脚本回发响应。 */
const respond = (requestId: string, payload: Partial<UserscriptResponsePayload>): void => {
  window.dispatchEvent(
    new CustomEvent<UserscriptResponsePayload>(RESPONSE_EVENT, {
      detail: {
        requestId,
        status: 200,
        statusText: 'OK',
        responseText: '',
        ...payload,
      },
    }),
  );
};

/** 捕获页面发出的 request 事件，模拟油猴脚本侧监听。 */
const captureRequests = (): UserscriptRequestPayload[] => {
  const list: UserscriptRequestPayload[] = [];
  window.addEventListener(REQUEST_EVENT, (e) => {
    list.push((e as CustomEvent<UserscriptRequestPayload>).detail);
  });
  return list;
};

describe('useUserscriptBridge', () => {
  it('pong 后激活并记录版本号', () => {
    const { bridge, unmount } = mountBridge();
    expect(bridge.probing.value).toBe(true);

    window.dispatchEvent(new CustomEvent(PONG_EVENT, { detail: { version: EXPECTED_SCRIPT_VERSION } }));

    expect(bridge.active.value).toBe(true);
    expect(bridge.version.value).toBe(EXPECTED_SCRIPT_VERSION);
    expect(bridge.probing.value).toBe(false);
    expect(bridge.stale.value).toBe(false);
    unmount();
  });

  it('握手超时后保持未激活', () => {
    vi.useFakeTimers();
    const { bridge, unmount } = mountBridge();
    expect(bridge.probing.value).toBe(true);

    vi.advanceTimersByTime(501);

    expect(bridge.active.value).toBe(false);
    expect(bridge.probing.value).toBe(false);
    unmount();
  });

  it('版本与期望不一致时标记 stale', () => {
    const { bridge, unmount } = mountBridge();

    window.dispatchEvent(new CustomEvent(PONG_EVENT, { detail: { version: '0.9.9' } }));

    expect(bridge.active.value).toBe(true);
    expect(bridge.stale.value).toBe(true);
    unmount();
  });

  it('request 发出请求事件并按 requestId 关联响应', async () => {
    const { bridge, unmount } = mountBridge();
    window.dispatchEvent(new CustomEvent(PONG_EVENT, { detail: { version: '1.0.0' } }));

    const requests = captureRequests();
    const p = bridge.request({ method: 'GET', url: 'https://a.example/x', headers: {} });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe('https://a.example/x');

    respond(requests[0].requestId, { status: 200, statusText: 'OK', responseText: '{"ok":1}' });

    await expect(p).resolves.toMatchObject({ status: 200, responseText: '{"ok":1}' });
    unmount();
  });

  it('并发请求乱序返回时各自关联到自己的状态码', async () => {
    const { bridge, unmount } = mountBridge();
    window.dispatchEvent(new CustomEvent(PONG_EVENT, { detail: { version: '1.0.0' } }));

    const requests = captureRequests();
    const p1 = bridge.request({ method: 'GET', url: 'https://a.example/1', headers: {} });
    const p2 = bridge.request({ method: 'POST', url: 'https://a.example/2', headers: {}, body: '{}' });
    expect(requests).toHaveLength(2);

    // 乱序：先回第二个（200），再回第一个（401）
    respond(requests[1].requestId, { status: 200, responseText: 'ok' });
    respond(requests[0].requestId, { status: 401, statusText: 'Unauthorized', responseText: '{"error":"bad"}' });

    await expect(p2).resolves.toMatchObject({ status: 200 });
    await expect(p1).resolves.toMatchObject({ status: 401 });
    unmount();
  });

  it('未知 requestId 的响应被忽略，不影响真实请求', async () => {
    const { bridge, unmount } = mountBridge();
    window.dispatchEvent(new CustomEvent(PONG_EVENT, { detail: { version: '1.0.0' } }));

    const requests = captureRequests();
    const p = bridge.request({ method: 'GET', url: 'https://a.example/x', headers: {} });

    // 先发一个未知 requestId 的响应，不应匹配 pending
    respond('unknown-id', { status: 200, responseText: 'ignored' });
    await Promise.resolve();

    // 真实响应仍然可解析
    respond(requests[0].requestId, { status: 200, responseText: 'real' });
    await expect(p).resolves.toMatchObject({ responseText: 'real' });
    unmount();
  });

  it('未激活时 request 立即拒绝', async () => {
    const { bridge, unmount } = mountBridge();

    await expect(
      bridge.request({ method: 'GET', url: 'https://a.example/x', headers: {} }),
    ).rejects.toThrow(/未激活/);
    unmount();
  });

  it('请求超过 20s 未响应则超时拒绝', async () => {
    vi.useFakeTimers();
    const { bridge, unmount } = mountBridge();
    window.dispatchEvent(new CustomEvent(PONG_EVENT, { detail: { version: '1.0.0' } }));

    const p = bridge.request({ method: 'GET', url: 'https://a.example/slow', headers: {} });
    const assertion = expect(p).rejects.toThrow(/超时/);

    await vi.advanceTimersByTimeAsync(20001);

    await assertion;
    unmount();
  });

  it('卸载时拒绝在途请求', async () => {
    const { bridge, unmount } = mountBridge();
    window.dispatchEvent(new CustomEvent(PONG_EVENT, { detail: { version: '1.0.0' } }));

    const p = bridge.request({ method: 'GET', url: 'https://a.example/x', headers: {} });
    const assertion = expect(p).rejects.toThrow(/已卸载/);

    unmount();

    await assertion;
  });
});

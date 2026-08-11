import { computed, onMounted, onUnmounted, ref } from 'vue';

/** 页面 → 油猴脚本：代发 HTTP 请求的载荷。 */
export interface UserscriptRequestPayload {
  requestId: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

/** 油猴脚本 → 页面：HTTP 响应载荷。status 为 0 表示传输层失败（网络/超时/非法 URL）。 */
export interface UserscriptResponsePayload {
  requestId: string;
  status: number;
  statusText: string;
  responseText: string;
  error?: string;
}

const PING_EVENT = 'miska-userscript-ping';
const PONG_EVENT = 'miska-userscript-pong';
const REQUEST_EVENT = 'miska-userscript-request';
const RESPONSE_EVENT = 'miska-userscript-response';

const HANDSHAKE_TIMEOUT_MS = 500;
const REQUEST_TIMEOUT_MS = 20000;

/** 与 public/userscripts/api-key-checker.user.js 的 @version 保持一致。 */
export const EXPECTED_SCRIPT_VERSION = '1.2.0';

// secure context（https / localhost）下用 crypto.randomUUID，否则回落时间戳 + 随机串。
const genRequestId = (): string => {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const readDetail = <T,>(event: Event): T => (event as CustomEvent<T>).detail;

/**
 * 与油猴脚本之间的桥接：握手检测激活状态，并把 HTTP 请求转发给脚本用
 * GM_xmlhttpRequest 代发（绕过浏览器 CORS），再按 requestId 关联回传响应。
 */
export const useUserscriptBridge = () => {
  const active = ref(false);
  const probing = ref(false);
  const version = ref('');
  const stale = computed(() => version.value !== '' && version.value !== EXPECTED_SCRIPT_VERSION);

  interface Pending {
    resolve: (value: UserscriptResponsePayload) => void;
    reject: (reason: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }
  const pending = new Map<string, Pending>();
  let handshakeTimer: ReturnType<typeof setTimeout> | null = null;

  const handlePong = (event: Event): void => {
    const detail = readDetail<{ version?: unknown }>(event);
    if (typeof detail.version === 'string') version.value = detail.version;
    if (handshakeTimer) {
      clearTimeout(handshakeTimer);
      handshakeTimer = null;
    }
    probing.value = false;
    active.value = true;
  };

  const handleResponse = (event: Event): void => {
    const detail = readDetail<Partial<UserscriptResponsePayload>>(event);
    const requestId = detail.requestId;
    if (typeof requestId !== 'string' || !requestId) return;
    const p = pending.get(requestId);
    if (!p) return; // 未知/过期 requestId，忽略
    pending.delete(requestId);
    clearTimeout(p.timer);
    p.resolve({
      requestId,
      status: typeof detail.status === 'number' ? detail.status : 0,
      statusText: typeof detail.statusText === 'string' ? detail.statusText : '',
      responseText: typeof detail.responseText === 'string' ? detail.responseText : '',
      error: typeof detail.error === 'string' ? detail.error : undefined,
    });
  };

  const request = (
    req: Omit<UserscriptRequestPayload, 'requestId'>,
  ): Promise<UserscriptResponsePayload> =>
    new Promise<UserscriptResponsePayload>((resolve, reject) => {
      if (!active.value) {
        reject(new Error('用户脚本未激活，无法代发请求'));
        return;
      }
      const requestId = genRequestId();
      const timer = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error('用户脚本请求超时（20s），请重试或刷新页面'));
      }, REQUEST_TIMEOUT_MS);
      pending.set(requestId, { resolve, reject, timer });
      window.dispatchEvent(
        new CustomEvent<UserscriptRequestPayload>(REQUEST_EVENT, {
          detail: { ...req, requestId },
        }),
      );
    });

  const detect = (): void => {
    active.value = false;
    version.value = '';
    probing.value = true;
    if (handshakeTimer) clearTimeout(handshakeTimer);
    handshakeTimer = setTimeout(() => {
      probing.value = false;
      active.value = false;
    }, HANDSHAKE_TIMEOUT_MS);
    window.dispatchEvent(new CustomEvent(PING_EVENT));
  };

  onMounted(() => {
    window.addEventListener(PONG_EVENT, handlePong);
    window.addEventListener(RESPONSE_EVENT, handleResponse);
    detect();
  });

  onUnmounted(() => {
    if (handshakeTimer) {
      clearTimeout(handshakeTimer);
      handshakeTimer = null;
    }
    window.removeEventListener(PONG_EVENT, handlePong);
    window.removeEventListener(RESPONSE_EVENT, handleResponse);
    for (const p of pending.values()) {
      clearTimeout(p.timer);
      p.reject(new Error('用户脚本桥接已卸载'));
    }
    pending.clear();
  });

  return { active, probing, version, stale, request, detect };
};

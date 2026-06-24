export const THREAD_DEFAULT = 4;
export const THREAD_MIN = 1;
export const THREAD_MAX = 32;
export const LOOP_DEFAULT = 1;
export const LOOP_INFINITE = 0; // 0 means ∞

export interface ThreadInfo {
  id: number;
  loaded: number;
  total: number; // bytes assigned to this range
  speedBps: number;
  status: 'pending' | 'running' | 'done' | 'error';
  error?: string;
}

export interface OverallProgress {
  threads: ThreadInfo[];
  totalLoaded: number;
  totalBytes: number; // server-reported file size (0 if unknown)
  aggregateSpeedBps: number;
  elapsedMs: number;
  currentLoop: number;
  totalLoops: number; // -1 means ∞
  finished: boolean;
}

export const SOURCE_GROUPS = [
  {
    label: '🦄 默认测速源',
    key: 'default',
    children: [
      { label: '朝夕光年游戏 (默认)', value: 'https://lf5-j1gamecdn-cn.dailygn.com/obj/lf-game-lf/gdl_app_2682/1233880772355.mp4' },
    ],
  },
  {
    label: '⚡ 极速专线',
    key: 'fast',
    children: [
      { label: 'OPPO商城', value: 'https://dsfs.oppo.com/oppo/shop-pc-v2/main/js/9fb472f.js' },
    ],
  },
  {
    label: '🐧 腾讯系列',
    key: 'tencent',
    children: [
      { label: '英雄联盟', value: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg' },
      { label: '穿越火线', value: 'https://ossweb-img.qq.com/upload/webplat/info/cf/20230717/653421385804853.png' },
      { label: '腾讯视频', value: 'https://puui.qpic.cn/vpic_cover/g3346tki83w/g3346tki83w_hz.jpg' },
      { label: 'WeGame', value: 'https://wegame.gtimg.com/g.55555-r.c4663/wegame-home/sc02-03.514d7db8.png' },
    ],
  },
  {
    label: '🛒 阿里系列',
    key: 'alibaba',
    children: [
      { label: '阿里系', value: 'https://gw.alicdn.com/tfscom/TB1fASCxhjaK1RjSZKzXXXVwXXa.jpg' },
      { label: '阿里云资源', value: 'https://img.alicdn.com/imgextra/i1/O1CN01xA4P9S1JsW2WEg0e1_!!6000000001084-2-tps-2880-560.png' },
      { label: '钉钉', value: 'https://gw.alicdn.com/tfs/TB1k07QUoY1gK0jSZFCXXcwqXXa-810-450.png' },
      { label: '夸克网盘', value: 'https://cloud.video.taobao.com/play/u/null/p/1/e/6/t/1/442087612070.mp4' },
      { label: '夸克浏览器', value: 'https://image.uc.cn/s/uae/g/3o/broccoli/resource/202401/zry_video.mp4' },
    ],
  },
  {
    label: '🏢 字节系列',
    key: 'bytedance',
    children: [
      { label: '今日头条', value: 'https://lf9-static.bytednsdoc.com/obj/eden-cn/uhbfnupkbps/video/earth_v6.mp4' },
      { label: '字节跳动', value: 'https://lf1-cdn-tos.bytescm.com/obj/static/ies/bytedance_official/_next/static/images/8-4@2x-f85835b5e482bccf94c824067caac899.png' },
    ],
  },
  {
    label: '📡 运营商系列',
    key: 'carrier',
    children: [
      { label: '❌ 天翼云桌面', value: 'https://desk.ctyun.cn:8999/desktop-prod/software/windows_tob_client/15/64/202030001/CtyunClouddeskUniversal_2.3.0_202030001_x86_20240327104015_Setup.exe', disabled: true },
      { label: '移动云盘', value: 'https://yun.mcloud.139.com/hongseyunpan/2.43G.zip' },
      { label: '移动云盘图片', value: 'https://img.mcloud.139.com/material_prod/material_media/20221128/1669626861087.png' },
    ],
  },
  {
    label: '🎮 腾讯游戏',
    key: 'tencent-games',
    children: [
      { label: '王者荣耀数据', value: 'https://game.gtimg.cn/images/yxzj/matchdata/heroRank.js' },
      { label: '金铲铲之战', value: 'https://jcc.qq.com/act/a20231206jccm/web/images/bg.jpg' },
      { label: '云顶之弈资源', value: 'https://game.gtimg.cn/images/lol/tft/champions/Set12/Ahri.png' },
    ],
  },
  {
    label: '🎮 米哈游',
    key: 'mihoyo',
    children: [
      { label: '原神官网', value: 'https://ys.mihoyo.com/main/_nuxt/img/bg.1d6fed3.jpg' },
      { label: '崩坏：星穹铁道', value: 'https://sr.mihoyo.com/fab/2023/2/10/1041940_bg.jpg' },
      { label: '❌ 绝区零', value: 'https://zzz.mihoyo.com/fab/2024/1/1/1041940_bg.jpg', disabled: true },
    ],
  },
  {
    label: '🏢 华为系',
    key: 'huawei',
    children: [
      { label: '❌ 华为应用市场', value: 'https://appimg.dbankcdn.com/hwmarket/files/application/icon144/5c0e2e5e8f2d4f6e9a1b2c3d4e5f6a7b.png', disabled: true },
      { label: '华为消费者业务', value: 'https://consumer.huawei.com/content/dam/huawei-cbg-site/cn/mkt/pdp/phones/mate60-pro/images/kv.jpg' },
    ],
  },
  {
    label: '🏢 小米系',
    key: 'xiaomi',
    children: [
      { label: '小米CDN', value: 'https://cdn.cnbj1.fds.api.mi-img.com/miio.files/commonfile_png_5c0e2e5e8f2d4f6e9a1b2c3d4e5f6a7b.png' },
    ],
  },
  {
    label: '🏢 OPPO系',
    key: 'oppo',
    children: [
      { label: 'OPPO软件商店', value: 'https://dsfs.oppo.com/oppo/shop-pc-v2/main/js/9fb472f.js' },
      { label: 'OPPO资源', value: 'https://dsfs.oppo.com/store/resource/5c0e2e5e8f2d4f6e9a1b2c3d4e5f6a7b.png' },
    ],
  },
  {
    label: '🎬 其他视频/应用',
    key: 'other',
    children: [
      { label: '爱奇艺', value: 'https://static-d.iqiyi.com/ext/common/iQIYIMedia_000.dmg' },
      { label: '❌ 好看视频', value: 'https://vd3.bdstatic.com/mda-pm9zn07ydwzhfw85/1080p/cae_h264/1702252000350219836/mda-pm9zn07ydwzhfw85.mp4', disabled: true },
      { label: '网易我的世界', value: 'https://x19.gdl.netease.com/MCLauncher_publish_1.8.0.35383.exe' },
      { label: '京东', value: 'https://img20.360buyimg.com/babel/jfs/t20271006/227634/23/27810/35856/67027beeF0cffb9fc/e68cd03835b91103.png' },
    ],
  },
];

/** Flat list of non-disabled sources + custom option at the end */
export const CUSTOM_VALUE = '__custom__';
export const ALL_SOURCES: { label: string; value: string }[] = [
  ...SOURCE_GROUPS.flatMap((g) => g.children.filter((c) => !c.disabled).map((c) => ({ label: c.label, value: c.value }))),
  { label: '自定义链接', value: CUSTOM_VALUE },
];

export function formatSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const s = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2);
  return `${s} ${units[i]}`;
}

export function formatSpeed(bps: number): string {
  const mbps = (bps * 8) / 1_000_000;
  return `${mbps.toFixed(2)} Mbps`;
}

/** Append a random query param to prevent HTTP caching */
function cacheBust(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_t=${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Map HTTP status codes to Chinese error messages */
function httpStatusLabel(code: number): string {
  if (code >= 200 && code < 300) return '';
  const map: Record<number, string> = {
    301: '资源已永久移走',
    302: '资源临时移走',
    307: '临时重定向',
    308: '永久重定向',
    400: '请求格式错误',
    401: '未授权',
    403: '服务器拒绝访问',
    404: '文件不存在',
    405: '请求方法不允许',
    406: '无法接受',
    408: '请求超时',
    410: '资源已永久删除',
    413: '请求实体过大',
    416: '范围请求无效',
    429: '请求过于频繁（被限速）',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂不可用',
    504: '网关超时',
    505: 'HTTP 版本不支持',
  };
  return map[code] || `未知错误 (HTTP ${code})`;
}

/** Minimum file size (bytes) to enable multi-thread download */
const MIN_SIZE_FOR_MULTI = 1 * 1024 * 1024; // 1 MB

/**
 * Probe the file: send a 1-byte Range request to check Range support and get total file size.
 * Throws on non-2xx / non-206.
 */
async function probeFile(url: string, signal: AbortSignal): Promise<{ totalSize: number; acceptsRanges: boolean }> {
  const res = await fetch(cacheBust(url), { headers: { Range: 'bytes=0-0' }, signal });

  if (res.status === 206) {
    // Range supported — extract total from Content-Range
    const cr = res.headers.get('Content-Range') || '';
    const m = cr.match(/\/\d+$/);
    const totalSize = m ? parseInt(m[0].slice(1), 10) : 0;
    await res.body?.cancel();
    return { totalSize, acceptsRanges: true };
  }

  if (res.ok) {
    // Range not supported — get size from Content-Length
    const cl = res.headers.get('Content-Length');
    const totalSize = cl ? parseInt(cl, 10) : 0;
    await res.body?.cancel();
    return { totalSize, acceptsRanges: false };
  }

  // Non-200/206 — fail
  const label = httpStatusLabel(res.status);
  throw new Error(label || `服务器返回 ${res.status}`);
}

/**
 * Split `totalSize` into `n` roughly-equal byte ranges.
 */
function splitRanges(totalSize: number, n: number): { start: number; end: number }[] {
  const part = Math.ceil(totalSize / n);
  const ranges: { start: number; end: number }[] = [];
  for (let i = 0; i < n; i++) {
    const start = i * part;
    if (start >= totalSize) break;
    const end = Math.min(start + part - 1, totalSize - 1);
    ranges.push({ start, end });
  }
  return ranges;
}

/**
 * A single thread: downloads its byte range and calls `onProgress` periodically.
 */
async function runSingleThread(
  url: string,
  range: { start: number; end: number } | null,
  threadId: number,
  onProgress: (loaded: number, speedBps: number) => void,
  signal: AbortSignal,
): Promise<{ loaded: number; status: 'done' | 'error'; error?: string }> {
  const headers: Record<string, string> = {};
  let expectedTotal = 0;
  if (range) {
    headers['Range'] = `bytes=${range.start}-${range.end}`;
    expectedTotal = range.end - range.start + 1;
  }

  let res: Response;
  try {
    res = await fetch(cacheBust(url), { headers, signal });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { loaded: 0, status: 'error', error: '已手动停止' };
    }
    return { loaded: 0, status: 'error', error: String(err) };
  }

  // Handle non-2xx responses
  if (res.status === 206) {
    // Range request accepted — proceed
  } else if (res.ok) {
    // Server returned full file (200) despite Range header — still usable
    const cl = res.headers.get('Content-Length');
    expectedTotal = cl ? parseInt(cl, 10) : 0;
  } else {
    return { loaded: 0, status: 'error', error: httpStatusLabel(res.status) || `HTTP ${res.status}` };
  }

  const reader = res.body?.getReader();
  if (!reader) {
    return { loaded: 0, status: 'error', error: '无法读取响应体' };
  }

  let loaded = 0;
  const threadStart = performance.now();
  let lastReport = threadStart;
  let lastBytes = 0;
  let lastSpeed = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      loaded += value.length;

      const now = performance.now();
      const dt = (now - lastReport) / 1000;
      const speed = dt >= 0.08 ? (loaded - lastBytes) / dt : lastSpeed;
      if (dt >= 0.08) {
        lastReport = now;
        lastBytes = loaded;
        lastSpeed = speed;
        onProgress(loaded, speed);
      }
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { loaded, status: 'error', error: '已手动停止' };
    }
    return { loaded, status: 'error', error: String(err) };
  }

  // Report final average speed
  const totalSec = (performance.now() - threadStart) / 1000;
  const avgSpeed = totalSec > 0 ? loaded / totalSec : 0;
  onProgress(loaded, avgSpeed);
  return { loaded, status: 'done' };
}

/**
 * Run one loop of the multi-thread download test.
 * Probes the file, then fans out N threads in parallel.
 */
async function runOneLoop(
  url: string,
  threadCount: number,
  onThreadUpdate: (id: number, info: Partial<ThreadInfo>) => void,
  signal: AbortSignal,
): Promise<{ totalLoaded: number; totalBytes: number }> {
  // Probe
  const { totalSize, acceptsRanges } = await probeFile(url, signal);

  const useMulti = acceptsRanges && totalSize >= MIN_SIZE_FOR_MULTI;
  const actualCount = useMulti ? Math.min(threadCount, THREAD_MAX) : 1;

  // Determine ranges
  const allRanges = useMulti ? splitRanges(totalSize, actualCount) : [];

  // Init threads
  for (let i = 0; i < actualCount; i++) {
    const range = allRanges[i];
    onThreadUpdate(i, {
      status: 'running',
      total: range ? range.end - range.start + 1 : totalSize,
    });
  }

  const tasks = Array.from({ length: actualCount }, (_, i) =>
    runSingleThread(
      url,
      allRanges[i] || null,
      i,
      (loaded, speedBps) => onThreadUpdate(i, { loaded, speedBps, status: 'running' }),
      signal,
    ).then((r) => {
      onThreadUpdate(i, {
        loaded: r.loaded,
        status: r.status === 'done' ? 'done' : 'error',
        error: r.error,
      });
      return r;
    }),
  );

  // Yield so Vue can flush init-state threads before downloads begin
  await new Promise(r => setTimeout(r, 0));

  const results = await Promise.all(tasks);
  const totalLoaded = results.reduce((s, r) => s + r.loaded, 0);

  return { totalLoaded, totalBytes: totalSize };
}

/**
 * Multi-thread multi-loop download speed test.
 *
 * @param url        - The file URL to test
 * @param threadCount- Number of concurrent threads (1–32)
 * @param loopCount  - Number of loops (LOOP_INFINITE / 0 = ∞)
 * @param onProgress - Called ~every 200ms with a snapshot
 * @param signal     - AbortSignal to cancel the whole test
 */
export async function runMultiLoop(
  url: string,
  threadCount: number,
  loopCount: number,
  onProgress: (p: OverallProgress) => void,
  signal: AbortSignal,
): Promise<void> {
  const startTime = performance.now();
  const maxLoops = loopCount === LOOP_INFINITE ? Infinity : loopCount;
  const isInfinite = loopCount === LOOP_INFINITE;

  let loop = 0;
  let globalTotalLoaded = 0;

  while (loop < maxLoops) {
    if (signal.aborted) {
      // Build final snapshot
      const elapsedMs = performance.now() - startTime;
      const aggSpeed = elapsedMs > 0 ? (globalTotalLoaded / (elapsedMs / 1000)) : 0;
      onProgress({
        threads: [],
        totalLoaded: globalTotalLoaded,
        totalBytes: 0,
        aggregateSpeedBps: aggSpeed,
        elapsedMs,
        currentLoop: loop,
        totalLoops: isInfinite ? -1 : maxLoops,
        finished: true,
      });
      return;
    }

    const loopThreads: ThreadInfo[] = [];

    try {
      const result = await runOneLoop(url, threadCount, (id, info) => {
        // Update or insert thread info
        const idx = loopThreads.findIndex((t) => t.id === id);
        const existing = idx >= 0 ? loopThreads[idx] : { id, loaded: 0, total: 0, speedBps: 0, status: 'pending' as const };
        const updated = { ...existing, ...info };
        if (idx >= 0) loopThreads[idx] = updated;
        else loopThreads.push(updated);

        const loaded = loopThreads.reduce((s, t) => s + t.loaded, 0);
        globalTotalLoaded = loaded;
        const elapsedMs = performance.now() - startTime;
        const aggSpeed = elapsedMs > 0 ? (loaded / (elapsedMs / 1000)) : 0;

        onProgress({
          threads: [...loopThreads],
          totalLoaded: loaded,
          totalBytes: loopThreads.reduce((s, t) => s + t.total, 0),
          aggregateSpeedBps: aggSpeed,
          elapsedMs,
          currentLoop: loop + 1,
          totalLoops: isInfinite ? -1 : maxLoops,
          finished: false,
        });
      }, signal);
    } catch (err: unknown) {
      const elapsedMs = performance.now() - startTime;
      onProgress({
        threads: loopThreads,
        totalLoaded: globalTotalLoaded,
        totalBytes: 0,
        aggregateSpeedBps: elapsedMs > 0 ? (globalTotalLoaded / (elapsedMs / 1000)) : 0,
        elapsedMs,
        currentLoop: loop + 1,
        totalLoops: isInfinite ? -1 : maxLoops,
        finished: true,
      });

      if (err instanceof Error && err.message === '已手动停止') return;
      throw err;
    }

    loop++;
    globalTotalLoaded = loopThreads.reduce((s, t) => s + t.loaded, 0);

    // Brief pause between loops — let the UI catch up
    if (loop < maxLoops) {
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  // Final snapshot after all loops
  const elapsedMs = performance.now() - startTime;
  const aggSpeed = elapsedMs > 0 ? (globalTotalLoaded / (elapsedMs / 1000)) : 0;
  onProgress({
    threads: [],
    totalLoaded: globalTotalLoaded,
    totalBytes: 0,
    aggregateSpeedBps: aggSpeed,
    elapsedMs,
    currentLoop: loop,
    totalLoops: isInfinite ? -1 : maxLoops,
    finished: true,
  });
}

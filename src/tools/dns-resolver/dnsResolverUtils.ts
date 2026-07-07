// 全国区域 → EDNS 客户端子网 IP 地址库
// 用于通过 DoH 接口模拟从不同区域发起 DNS 查询
export const REGION_IPS: Record<string, string> = {
  // === 华北 ===
  '北京-电信': '114.249.0.1', '北京-联通': '114.240.0.1', '北京-移动': '111.192.0.1',
  '天津-电信': '117.8.0.1', '天津-联通': '111.161.0.1', '天津-移动': '111.30.0.1',
  '河北-石家庄-电信': '123.180.0.1', '河北-石家庄-联通': '60.0.0.1', '河北-石家庄-移动': '111.11.0.1',
  '山西-太原-电信': '113.200.0.1', '山西-太原-联通': '124.165.0.1', '山西-太原-移动': '111.52.0.1',
  '内蒙古-呼和浩特-电信': '121.56.0.1', '内蒙古-呼和浩特-联通': '116.113.0.1', '内蒙古-呼和浩特-移动': '111.23.0.1',
  // === 东北 ===
  '辽宁-沈阳-电信': '113.225.0.1', '辽宁-沈阳-联通': '113.226.0.1', '辽宁-沈阳-移动': '111.163.0.1',
  '吉林-长春-电信': '122.136.0.1', '吉林-长春-联通': '119.48.0.1', '吉林-长春-移动': '111.26.0.1',
  '黑龙江-哈尔滨-电信': '113.0.0.1', '黑龙江-哈尔滨-联通': '113.2.0.1', '黑龙江-哈尔滨-移动': '111.164.0.1',
  // === 华东 ===
  '上海-电信': '58.34.0.1', '上海-联通': '112.64.0.1', '上海-移动': '117.144.0.1',
  '江苏-南京-电信': '58.212.0.1', '江苏-南京-联通': '153.0.0.1', '江苏-南京-移动': '112.0.0.1',
  '浙江-杭州-电信': '115.192.0.1', '浙江-杭州-联通': '115.196.0.1', '浙江-杭州-移动': '112.10.0.1',
  '安徽-合肥-电信': '61.190.0.1', '安徽-合肥-联通': '218.22.0.1', '安徽-合肥-移动': '112.26.0.1',
  '福建-福州-电信': '59.56.0.1', '福建-福州-联通': '27.148.0.1', '福建-福州-移动': '112.48.0.1',
  '江西-南昌-电信': '113.194.0.1', '江西-南昌-联通': '220.175.0.1', '江西-南昌-移动': '111.72.0.1',
  '山东-济南-电信': '113.121.0.1', '山东-济南-联通': '113.120.0.1', '山东-济南-移动': '111.14.0.1',
  // === 华中 ===
  '河南-郑州-电信': '115.48.0.1', '河南-郑州-联通': '115.51.0.1', '河南-郑州-移动': '120.194.0.1',
  '湖北-武汉-电信': '113.56.0.1', '湖北-武汉-联通': '113.57.0.1', '湖北-武汉-移动': '112.16.0.1',
  '湖南-长沙-电信': '113.218.0.1', '湖南-长沙-联通': '58.20.0.1', '湖南-长沙-移动': '110.52.0.1',
  // === 华南 ===
  '广东-广州-电信': '14.144.0.1', '广东-广州-联通': '112.90.0.1', '广东-广州-移动': '112.5.0.1',
  '广东-深圳-电信': '113.80.0.1', '广东-深圳-联通': '27.38.0.1', '广东-深圳-移动': '120.197.0.1',
  '广西-南宁-电信': '116.252.0.1', '广西-南宁-联通': '153.37.0.1', '广西-南宁-移动': '111.12.0.1',
  '海南-海口-电信': '124.225.0.1', '海南-海口-联通': '150.255.0.1', '海南-海口-移动': '111.29.0.1',
  // === 西南 ===
  '重庆-电信': '119.84.0.1', '重庆-联通': '113.248.0.1', '重庆-移动': '111.0.0.1',
  '四川-成都-电信': '118.112.0.1', '四川-成都-联通': '119.4.0.1', '四川-成都-移动': '112.44.0.1',
  '贵州-贵阳-电信': '114.135.0.1', '贵州-贵阳-联通': '58.42.0.1', '贵州-贵阳-移动': '111.85.0.1',
  '云南-昆明-电信': '112.112.0.1', '云南-昆明-联通': '14.204.0.1', '云南-昆明-移动': '111.60.0.1',
  '西藏-拉萨-电信': '113.62.0.1', '西藏-拉萨-联通': '221.13.0.1', '西藏-拉萨-移动': '111.46.0.1',
  // === 西北 ===
  '陕西-西安-电信': '113.140.0.1', '陕西-西安-联通': '113.142.0.1', '陕西-西安-移动': '111.18.0.1',
  '甘肃-兰州-电信': '118.180.0.1', '甘肃-兰州-联通': '116.178.0.1', '甘肃-兰州-移动': '111.7.0.1',
  '青海-西宁-电信': '125.72.0.1', '青海-西宁-联通': '139.170.0.1', '青海-西宁-移动': '111.44.0.1',
  '宁夏-银川-电信': '222.75.0.1', '宁夏-银川-联通': '42.63.0.1', '宁夏-银川-移动': '111.50.0.1',
  '新疆-乌鲁木齐-电信': '110.152.0.1', '新疆-乌鲁木齐-联通': '116.178.0.1', '新疆-乌鲁木齐-移动': '111.16.0.1',
  // === 港澳台 ===
  '香港': '203.145.0.1', '澳门': '202.175.0.1', '台湾-台北': '114.32.0.1',
};

// 区域分组定义
interface AreaGroup {
  area: string;
  provinces: string[];
}

const AREA_GROUPS: AreaGroup[] = [
  { area: '华北', provinces: ['北京', '天津', '河北', '山西', '内蒙古'] },
  { area: '东北', provinces: ['辽宁', '吉林', '黑龙江'] },
  { area: '华东', provinces: ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东'] },
  { area: '华中', provinces: ['河南', '湖北', '湖南'] },
  { area: '华南', provinces: ['广东', '广西', '海南'] },
  { area: '西南', provinces: ['重庆', '四川', '贵州', '云南', '西藏'] },
  { area: '西北', provinces: ['陕西', '甘肃', '青海', '宁夏', '新疆'] },
  { area: '港澳台', provinces: ['香港', '澳门', '台湾'] },
];

export const AREA_ORDER = AREA_GROUPS.map((g) => g.area);

/** 根据区域名推断所属大区 */
export const detectArea = (name: string): string => {
  for (const g of AREA_GROUPS) {
    if (g.provinces.some((p) => name.startsWith(p))) return g.area;
  }
  return '其他';
};

/** 根据区域名推断运营商 */
export const detectIsp = (name: string): string => {
  if (name.includes('电信')) return '电信';
  if (name.includes('联通')) return '联通';
  if (name.includes('移动')) return '移动';
  return '';
};

export interface RegionInfo {
  name: string;
  ip: string;
  area: string;
  isp: string;
}

export type DnsStatus = 'pending' | 'running' | 'done' | 'error';

export interface RegionResult {
  region: RegionInfo;
  status: DnsStatus;
  ips: string[];
  ttl: number | null;
  error?: string;
  elapsedMs: number;
}

/** 将 REGION_IPS 解析为结构化的区域列表（保持插入顺序） */
export const REGIONS: RegionInfo[] = Object.entries(REGION_IPS).map(([name, ip]) => ({
  name,
  ip,
  area: detectArea(name),
  isp: detectIsp(name),
}));

export const DOH_ENDPOINT = 'https://dns.alidns.com/resolve';

export const DEFAULT_CONCURRENCY = 8;
export const MIN_CONCURRENCY = 1;
export const MAX_CONCURRENCY = 32;

export type IspFilter = 'all' | '电信' | '联通' | '移动' | '其他';
export type AreaFilter = 'all' | string;

export const ISP_OPTIONS: { label: string; value: IspFilter }[] = [
  { label: '全部线路', value: 'all' },
  { label: '电信', value: '电信' },
  { label: '联通', value: '联通' },
  { label: '移动', value: '移动' },
  { label: '其他', value: '其他' },
];

export const AREA_OPTIONS: { label: string; value: AreaFilter }[] = [
  { label: '全部区域', value: 'all' },
  ...AREA_ORDER.map((a) => ({ label: a, value: a as AreaFilter })),
];

/** 按运营商 + 大区过滤区域 */
export const filterRegions = (
  regions: RegionInfo[],
  isp: IspFilter,
  area: AreaFilter,
): RegionInfo[] => {
  let r = regions;
  if (isp === '其他') {
    r = r.filter((x) => x.isp === '');
  } else if (isp !== 'all') {
    r = r.filter((x) => x.isp === isp);
  }
  if (area !== 'all') r = r.filter((x) => x.area === area);
  return r;
};

/** 将区域名拆分为运营商标签 + 显示名，例如 "北京-电信" → { isp: "电信", display: "北京" } */
export const splitRegionName = (name: string): { isp: string; display: string } => {
  const idx = name.lastIndexOf('-');
  if (idx < 0) return { isp: '', display: name };
  const last = name.slice(idx + 1);
  if (last === '电信' || last === '联通' || last === '移动') {
    return { isp: last, display: name.slice(0, idx) };
  }
  return { isp: '', display: name };
};

export interface IpDistributionEntry {
  ip: string;
  count: number;
  percentage: number; // 0-100
}

/** 统计已完成结果中各 IP 的出现次数与占比（按次数降序） */
export const computeIpDistribution = (results: RegionResult[]): IpDistributionEntry[] => {
  const counts = new Map<string, number>();
  let total = 0;
  for (const r of results) {
    if (r.status !== 'done') continue;
    for (const ip of r.ips) {
      counts.set(ip, (counts.get(ip) ?? 0) + 1);
      total++;
    }
  }
  if (total === 0) return [];
  const entries: IpDistributionEntry[] = [];
  for (const [ip, count] of counts) {
    entries.push({ ip, count, percentage: (count / total) * 100 });
  }
  entries.sort((a, b) => b.count - a.count);
  return entries;
};

/** 将区域列表按大区分组，保持 AREA_ORDER 顺序 */
export const groupByArea = (regions: RegionInfo[]): { area: string; regions: RegionInfo[] }[] => {
  const map = new Map<string, RegionInfo[]>();
  for (const r of regions) {
    if (!map.has(r.area)) map.set(r.area, []);
    map.get(r.area)!.push(r);
  }
  return AREA_ORDER
    .filter((a) => map.has(a))
    .map((a) => ({ area: a, regions: map.get(a)! }));
};

interface ParsedAnswers {
  ips: string[];
  ttl: number | null;
}

/** 从 DoH JSON 响应中提取 A 记录 IP 列表与最小 TTL */
export const extractAnswers = (data: unknown): ParsedAnswers => {
  const obj = data as Record<string, unknown> | null;
  if (!obj) return { ips: [], ttl: null };
  const answers = obj['Answer'];
  if (!Array.isArray(answers)) return { ips: [], ttl: null };

  const ips: string[] = [];
  let ttl: number | null = null;
  for (const a of answers) {
    const rec = a as Record<string, unknown> | null;
    if (!rec) continue;
    // type 1 = A 记录
    if (rec['type'] === 1) {
      const ip = String(rec['data'] ?? '').trim();
      if (ip) ips.push(ip);
      const t = Number(rec['TTL']);
      if (Number.isFinite(t) && (ttl === null || t < ttl)) ttl = t;
    }
  }
  return { ips, ttl };
};

export interface DnsQueryResult {
  ips: string[];
  ttl: number | null;
  elapsedMs: number;
}

/** 通过阿里 DoH 接口查询指定区域的 A 记录解析结果 */
export const queryDns = async (
  domain: string,
  ip: string,
  signal?: AbortSignal,
): Promise<DnsQueryResult> => {
  const start = performance.now();
  const url = new URL(DOH_ENDPOINT);
  url.searchParams.set('name', domain);
  url.searchParams.set('type', 'A');
  url.searchParams.set('edns_client_subnet', ip);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/dns-json' },
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json() as Record<string, unknown>;
  const status = Number(data['Status'] ?? 0);
  // 3 = NXDOMAIN（域名不存在）
  if (status === 3) {
    throw new Error('域名不存在');
  }
  if (status !== 0) {
    throw new Error(`DNS 查询失败 (Status ${status})`);
  }

  const { ips, ttl } = extractAnswers(data);
  return { ips, ttl, elapsedMs: performance.now() - start };
};

/** 以受限并发运行一组异步任务，保持结果顺序 */
export const runPool = async <T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
  signal?: AbortSignal,
): Promise<T[]> => {
  const results: T[] = new Array(tasks.length);
  let cursor = 0;
  const size = Math.min(concurrency, tasks.length);
  const workers = Array.from({ length: size }, async () => {
    while (true) {
      if (signal?.aborted) return;
      const i = cursor++;
      if (i >= tasks.length) return;
      results[i] = await tasks[i]();
    }
  });
  await Promise.all(workers);
  return results;
};

/**
 * 并发查询所有区域的 DNS 解析结果。
 * 每个区域开始/完成时通过 onResult 回调实时上报。
 */
export const runAllRegions = async (
  domain: string,
  regions: RegionInfo[],
  concurrency: number,
  onResult: (index: number, result: RegionResult) => void,
  signal: AbortSignal,
): Promise<void> => {
  const tasks = regions.map((region, index) => async (): Promise<void> => {
    if (signal.aborted) return;
    onResult(index, { region, status: 'running', ips: [], ttl: null, elapsedMs: 0 });
    if (signal.aborted) return;
    try {
      const { ips, ttl, elapsedMs } = await queryDns(domain, region.ip, signal);
      if (signal.aborted) return;
      onResult(index, { region, status: 'done', ips, ttl, elapsedMs });
    } catch (err: unknown) {
      if (signal.aborted) return;
      const message =
        err instanceof DOMException && err.name === 'AbortError'
          ? '已取消'
          : err instanceof Error
            ? err.message
            : String(err);
      onResult(index, { region, status: 'error', ips: [], ttl: null, error: message, elapsedMs: 0 });
    }
  });
  await runPool(tasks, concurrency, signal);
};

/** 简单的域名格式校验 */
export const isValidDomain = (domain: string): boolean =>
  /^[\w.-]+\.[a-zA-Z]{2,}$/.test(domain);

/** 清洗用户输入：去除协议、路径、端口 */
export const cleanDomain = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];

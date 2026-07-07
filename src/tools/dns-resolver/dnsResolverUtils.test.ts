import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  REGION_IPS,
  REGIONS,
  AREA_ORDER,
  detectArea,
  detectIsp,
  filterRegions,
  groupByArea,
  splitRegionName,
  computeIpDistribution,
  AREA_OPTIONS,
  extractAnswers,
  queryDns,
  runPool,
  runAllRegions,
  isValidDomain,
  cleanDomain,
} from './dnsResolverUtils';
import type { RegionResult } from './dnsResolverUtils';

beforeEach(() => {
  vi.restoreAllMocks();
});

const mockFetch = (...responses: Array<Record<string, unknown>>): void => {
  const fn = vi.fn();
  for (const r of responses) fn.mockResolvedValueOnce(r);
  globalThis.fetch = fn as unknown as typeof fetch;
};

describe('detectArea', () => {
  it('maps provinces to their area', () => {
    expect(detectArea('北京-电信')).toBe('华北');
    expect(detectArea('辽宁-沈阳-联通')).toBe('东北');
    expect(detectArea('上海-移动')).toBe('华东');
    expect(detectArea('广东-深圳-电信')).toBe('华南');
    expect(detectArea('香港')).toBe('港澳台');
  });

  it('returns 其他 for unknown prefixes', () => {
    expect(detectArea('未知地区')).toBe('其他');
  });
});

describe('detectIsp', () => {
  it('detects 电信/联通/移动 from name', () => {
    expect(detectIsp('北京-电信')).toBe('电信');
    expect(detectIsp('北京-联通')).toBe('联通');
    expect(detectIsp('北京-移动')).toBe('移动');
  });

  it('returns empty string for 港澳台 entries', () => {
    expect(detectIsp('香港')).toBe('');
    expect(detectIsp('台湾-台北')).toBe('');
  });
});

describe('REGIONS', () => {
  it('parses every entry in REGION_IPS', () => {
    expect(REGIONS.length).toBe(Object.keys(REGION_IPS).length);
    expect(REGIONS.length).toBe(99);
  });

  it('assigns every region to a known area', () => {
    for (const r of REGIONS) {
      expect(AREA_ORDER).toContain(r.area);
    }
  });

  it('preserves ip and name', () => {
    const beijing = REGIONS.find((r) => r.name === '北京-电信');
    expect(beijing?.ip).toBe('114.249.0.1');
  });
});

describe('filterRegions', () => {
  it('returns all regions when both filters are "all"', () => {
    expect(filterRegions(REGIONS, 'all', 'all')).toHaveLength(REGIONS.length);
  });

  it('filters by ISP', () => {
    const telecom = filterRegions(REGIONS, '电信', 'all');
    expect(telecom.every((r) => r.isp === '电信')).toBe(true);
    expect(telecom.length).toBe(32); // 32 电信 entries (港澳台 不计入)
  });

  it('filters by area', () => {
    const hmt = filterRegions(REGIONS, 'all', '港澳台');
    expect(hmt.every((r) => r.area === '港澳台')).toBe(true);
    expect(hmt).toHaveLength(3);
  });

  it('combines ISP + area filters', () => {
    const beijingTelecom = filterRegions(REGIONS, '电信', '华北');
    expect(beijingTelecom.every((r) => r.isp === '电信' && r.area === '华北')).toBe(true);
    // 华北 5 省 × 电信 = 5
    expect(beijingTelecom).toHaveLength(5);
  });

  it('filters "其他" to regions without a known ISP (港澳台 entries)', () => {
    const others = filterRegions(REGIONS, '其他', 'all');
    expect(others.every((r) => r.isp === '')).toBe(true);
    expect(others).toHaveLength(3); // 香港、澳门、台湾-台北
  });
});

describe('AREA_OPTIONS', () => {
  it('starts with 全部区域 option followed by all areas in order', () => {
    expect(AREA_OPTIONS[0]).toEqual({ label: '全部区域', value: 'all' });
    expect(AREA_OPTIONS.slice(1).map((o) => o.value)).toEqual(AREA_ORDER);
  });
});

describe('splitRegionName', () => {
  it('splits province-isp into isp tag + display name', () => {
    expect(splitRegionName('北京-电信')).toEqual({ isp: '电信', display: '北京' });
    expect(splitRegionName('上海-联通')).toEqual({ isp: '联通', display: '上海' });
  });

  it('keeps city in display name for province-city-isp', () => {
    expect(splitRegionName('河北-石家庄-电信')).toEqual({ isp: '电信', display: '河北-石家庄' });
    expect(splitRegionName('广东-深圳-移动')).toEqual({ isp: '移动', display: '广东-深圳' });
  });

  it('returns empty isp for 港澳台 entries', () => {
    expect(splitRegionName('香港')).toEqual({ isp: '', display: '香港' });
    expect(splitRegionName('台湾-台北')).toEqual({ isp: '', display: '台湾-台北' });
  });
});

describe('computeIpDistribution', () => {
  const mk = (status: RegionResult['status'], ips: string[]): RegionResult =>
    ({ region: REGIONS[0], status, ips, ttl: null, elapsedMs: 0 });

  it('returns empty list when no done results', () => {
    expect(computeIpDistribution([])).toEqual([]);
    expect(computeIpDistribution([mk('pending', [])])).toEqual([]);
    expect(computeIpDistribution([mk('error', [])])).toEqual([]);
  });

  it('counts each IP occurrence across done results and sorts by count desc', () => {
    const results = [
      mk('done', ['1.1.1.1']),
      mk('done', ['1.1.1.1']),
      mk('done', ['2.2.2.2']),
    ];
    const dist = computeIpDistribution(results);
    expect(dist).toEqual([
      { ip: '1.1.1.1', count: 2, percentage: (2 / 3) * 100 },
      { ip: '2.2.2.2', count: 1, percentage: (1 / 3) * 100 },
    ]);
  });

  it('counts multiple IPs from a single result independently', () => {
    const results = [mk('done', ['1.1.1.1', '2.2.2.2'])];
    const dist = computeIpDistribution(results);
    expect(dist).toEqual([
      { ip: '1.1.1.1', count: 1, percentage: 50 },
      { ip: '2.2.2.2', count: 1, percentage: 50 },
    ]);
  });

  it('ignores non-done results when counting', () => {
    const results = [
      mk('done', ['1.1.1.1']),
      mk('running', ['1.1.1.1']),
      mk('error', ['2.2.2.2']),
    ];
    const dist = computeIpDistribution(results);
    expect(dist).toEqual([{ ip: '1.1.1.1', count: 1, percentage: 100 }]);
  });
});

describe('groupByArea', () => {
  it('groups regions by area in AREA_ORDER', () => {
    const groups = groupByArea(REGIONS);
    expect(groups.map((g) => g.area)).toEqual(AREA_ORDER);
    expect(groups[0].area).toBe('华北');
    expect(groups[0].regions.length).toBe(15);
  });

  it('skips areas with no regions', () => {
    const onlyHmt = filterRegions(REGIONS, 'all', '港澳台');
    const groups = groupByArea(onlyHmt);
    expect(groups).toHaveLength(1);
    expect(groups[0].area).toBe('港澳台');
  });
});

describe('extractAnswers', () => {
  it('returns empty ips/ttl when there are no Answer records', () => {
    expect(extractAnswers({ Status: 0 })).toEqual({ ips: [], ttl: null });
    expect(extractAnswers(null)).toEqual({ ips: [], ttl: null });
  });

  it('extracts A record IPs and minimum TTL', () => {
    const data = {
      Status: 0,
      Answer: [
        { name: 'example.com.', type: 1, TTL: 300, data: '1.2.3.4' },
        { name: 'example.com.', type: 1, TTL: 600, data: '5.6.7.8' },
        { name: 'example.com.', type: 5, TTL: 100, data: 'ns1.example.com.' },
      ],
    };
    expect(extractAnswers(data)).toEqual({ ips: ['1.2.3.4', '5.6.7.8'], ttl: 300 });
  });

  it('returns empty list for non-array Answer', () => {
    expect(extractAnswers({ Answer: 'nope' })).toEqual({ ips: [], ttl: null });
  });
});

describe('queryDns', () => {
  it('sends edns_client_subnet and returns parsed IPs', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Status: 0, Answer: [{ type: 1, TTL: 60, data: '9.9.9.9' }] }),
    });
    globalThis.fetch = fetchFn as unknown as typeof fetch;

    const r = await queryDns('example.com', '114.249.0.1');
    expect(r.ips).toEqual(['9.9.9.9']);
    expect(r.ttl).toBe(60);
    expect(fetchFn).toHaveBeenCalledOnce();
    const calledUrl = fetchFn.mock.calls[0][0] as string;
    expect(calledUrl).toContain('name=example.com');
    expect(calledUrl).toContain('type=A');
    expect(calledUrl).toContain('edns_client_subnet=114.249.0.1');
  });

  it('throws on non-2xx response', async () => {
    mockFetch({ ok: false, status: 500 });
    await expect(queryDns('example.com', '1.1.1.1')).rejects.toThrow('HTTP 500');
  });

  it('throws 域名不存在 on NXDOMAIN (Status 3)', async () => {
    mockFetch({ ok: true, json: async () => ({ Status: 3 }) });
    await expect(queryDns('example.com', '1.1.1.1')).rejects.toThrow('域名不存在');
  });

  it('throws on other non-zero DNS status', async () => {
    mockFetch({ ok: true, json: async () => ({ Status: 2 }) });
    await expect(queryDns('example.com', '1.1.1.1')).rejects.toThrow('DNS 查询失败 (Status 2)');
  });
});

describe('runPool', () => {
  it('runs all tasks and preserves order', async () => {
    const tasks = [1, 2, 3, 4, 5].map((n) => async () => n * 10);
    const results = await runPool(tasks, 2);
    expect(results).toEqual([10, 20, 30, 40, 50]);
  });

  it('respects concurrency limit', async () => {
    let active = 0;
    let maxActive = 0;
    const tasks = Array.from({ length: 10 }, () => async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 10));
      active--;
      return 0;
    });
    await runPool(tasks, 3);
    expect(maxActive).toBeLessThanOrEqual(3);
  });

  it('handles empty task list', async () => {
    expect(await runPool([], 3)).toEqual([]);
  });

  it('stops scheduling when signal aborts', async () => {
    const ac = new AbortController();
    let started = 0;
    const tasks = Array.from({ length: 10 }, () => async () => {
      started++;
      await new Promise((r) => setTimeout(r, 20));
      return started;
    });
    setTimeout(() => ac.abort(), 30);
    await runPool(tasks, 2, ac.signal);
    // Some tasks may start, but not all 10
    expect(started).toBeLessThan(10);
  });
});

describe('runAllRegions', () => {
  it('reports running then done for each region on success', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Status: 0, Answer: [{ type: 1, TTL: 60, data: '1.1.1.1' }] }),
    });
    globalThis.fetch = fetchFn as unknown as typeof fetch;

    const events: { index: number; status: string }[] = [];
    const ac = new AbortController();
    await runAllRegions(
      'example.com',
      [REGIONS[0], REGIONS[1]],
      2,
      (i, r) => events.push({ index: i, status: r.status }),
      ac.signal,
    );

    expect(events).toContainEqual({ index: 0, status: 'running' });
    expect(events).toContainEqual({ index: 0, status: 'done' });
    expect(events).toContainEqual({ index: 1, status: 'running' });
    expect(events).toContainEqual({ index: 1, status: 'done' });
  });

  it('reports error when fetch fails', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('boom'));
    globalThis.fetch = fetchFn as unknown as typeof fetch;

    const ac = new AbortController();
    const collected: RegionResult[] = [];
    await runAllRegions(
      'example.com',
      [REGIONS[0]],
      1,
      (_i, r) => collected.push(r),
      ac.signal,
    );
    expect(collected.some((r) => r.status === 'error' && r.error === 'boom')).toBe(true);
  });

  it('skips remaining tasks after abort', async () => {
    const fetchFn = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        // Never resolves on its own; abort will reject via signal
        setTimeout(() => resolve({ ok: true, json: async () => ({ Status: 0 }) }), 1000);
      });
    });
    globalThis.fetch = fetchFn as unknown as typeof fetch;

    const ac = new AbortController();
    const events: RegionResult[] = [];
    setTimeout(() => ac.abort(), 30);
    await runAllRegions(
      'example.com',
      [REGIONS[0], REGIONS[1], REGIONS[2]],
      1,
      (_i, r) => events.push(r),
      ac.signal,
    );
    // The first task starts as running; aborted fetch rejects and we early-return without onResult
    expect(events.some((e) => e.status === 'done')).toBe(false);
  });
});

describe('isValidDomain', () => {
  it('accepts well-formed domains', () => {
    expect(isValidDomain('example.com')).toBe(true);
    expect(isValidDomain('sub.example.co.uk')).toBe(true);
  });

  it('rejects malformed input', () => {
    expect(isValidDomain('')).toBe(false);
    expect(isValidDomain('notadomain')).toBe(false);
    expect(isValidDomain('https://example.com')).toBe(false);
  });
});

describe('cleanDomain', () => {
  it('strips protocol, path, and port', () => {
    expect(cleanDomain('https://example.com/path')).toBe('example.com');
    expect(cleanDomain('http://example.com:8080/x')).toBe('example.com');
    expect(cleanDomain('EXAMPLE.COM/')).toBe('example.com');
  });

  it('passes plain domain through (lowercased)', () => {
    expect(cleanDomain('Example.COM')).toBe('example.com');
  });
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { EXPECTED_SCRIPT_VERSION } from '@/composables/useUserscriptBridge';

const scriptPath = resolve(process.cwd(), 'public/userscripts/api-key-checker.user.js');
const script = readFileSync(scriptPath, 'utf-8');

describe('userscript 元数据与桥接版本一致', () => {
  it('声明了 GM_xmlhttpRequest 授权', () => {
    expect(script).toContain('@grant        GM_xmlhttpRequest');
  });

  it('覆盖工具站主域名与 keorigin 品牌域名', () => {
    expect(script).toContain('@match        https://tools.misaka-network.top/*');
    expect(script).toContain('@match        https://*.misaka-network.top/*');
    expect(script).toContain('@match        https://*.keorigin.com/*');
  });

  it('@version 与 EXPECTED_SCRIPT_VERSION 保持一致', () => {
    const match = script.match(/@version\s+(\S+)/);
    expect(match?.[1]).toBe(EXPECTED_SCRIPT_VERSION);
  });
});

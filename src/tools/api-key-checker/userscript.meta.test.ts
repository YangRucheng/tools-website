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

  it('覆盖两个工具站精确域名（含 localhost 便于本地开发）', () => {
    expect(script).toContain('@match        https://tools.misaka-network.top/*');
    expect(script).toContain('@match        https://tools.keorigin.com/*');
    expect(script).toContain('@match        http://localhost/*');
    expect(script).toContain('@match        http://127.0.0.1/*');
    expect(script).not.toContain('@match        https://*.misaka-network.top/*');
    expect(script).not.toContain('@match        https://*.keorigin.com/*');
  });

  it('声明了更新链接（@updateURL / @downloadURL）', () => {
    expect(script).toContain('@updateURL    https://tools.misaka-network.top/userscripts/api-key-checker.user.js');
    expect(script).toContain('@downloadURL  https://tools.misaka-network.top/userscripts/api-key-checker.user.js');
  });

  it('@version 与 EXPECTED_SCRIPT_VERSION 保持一致', () => {
    const match = script.match(/@version\s+(\S+)/);
    expect(match?.[1]).toBe(EXPECTED_SCRIPT_VERSION);
  });
});

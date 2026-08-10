// ==UserScript==
// @name         大模型密钥检查 · CORS 直连桥接
// @name:en      API Key Checker - CORS Bridge
// @namespace    https://tools.misaka-network.top/userscripts
// @version      1.0.0
// @description  为「大模型密钥检查」工具提供 GM_xmlhttpRequest 直连，绕过浏览器 CORS。安装后请刷新页面。
// @description:en  CORS bridge for the API Key Checker tool. Refresh the page after install.
// @author       Misaka Network
// @match        https://tools.misaka-network.top/*
// @match        https://*.misaka-network.top/*
// @match        https://*.keorigin.com/*
// @match        http://localhost/*
// @match        http://127.0.0.1/*
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-start
// ==/UserScript==

// 安全提示：@connect * 允许脚本在已匹配站点上向任意 URL 发起请求（含自定义端点、携带 API Key）。
// 安装时 Tampermonkey 会弹出宽泛授权确认，属预期行为。仅安装/信任来自本工具站的脚本。
(function () {
  'use strict';

  // 与 src/composables/useUserscriptBridge.ts 中 EXPECTED_SCRIPT_VERSION 保持一致
  var VERSION = '1.0.0';

  if (typeof GM_xmlhttpRequest === 'undefined') {
    console.warn('[miska-userscript] GM_xmlhttpRequest unavailable, bridge disabled.');
    return;
  }

  function emit(type, detail) {
    window.dispatchEvent(new CustomEvent(type, { detail: detail }));
  }

  // 页面 → 脚本：握手探测（document-start 即注册，早于页面 app mount）
  window.addEventListener('miska-userscript-ping', function () {
    emit('miska-userscript-pong', { version: VERSION });
  });

  // 页面 → 脚本：发起 HTTP 请求
  window.addEventListener('miska-userscript-request', function (e) {
    var detail = e.detail || {};
    var requestId = detail.requestId;
    if (typeof requestId !== 'string' || !requestId) return;

    var url = detail.url;
    if (typeof url !== 'string' || !url) {
      emit('miska-userscript-response', {
        requestId: requestId,
        status: 0,
        statusText: 'Invalid URL',
        responseText: '',
        error: 'Invalid URL',
      });
      return;
    }

    GM_xmlhttpRequest({
      method: typeof detail.method === 'string' ? detail.method.toUpperCase() : 'GET',
      url: url,
      headers: detail.headers && typeof detail.headers === 'object' ? detail.headers : {},
      data: typeof detail.body === 'string' ? detail.body : undefined,
      timeout: 20000,
      nofail: true, // 自行处理错误，抑制 Tampermonkey 网络失败通知
      onload: function (res) {
        emit('miska-userscript-response', {
          requestId: requestId,
          status: res.status,
          statusText: res.statusText || '',
          responseText: typeof res.responseText === 'string' ? res.responseText : '',
        });
      },
      onerror: function (res) {
        emit('miska-userscript-response', {
          requestId: requestId,
          status: 0,
          statusText: 'Network error',
          responseText: '',
          error: res && res.error ? String(res.error) : 'Network error',
        });
      },
      ontimeout: function () {
        emit('miska-userscript-response', {
          requestId: requestId,
          status: 0,
          statusText: 'Timeout',
          responseText: '',
          error: 'Timeout',
        });
      },
    });
  });
})();

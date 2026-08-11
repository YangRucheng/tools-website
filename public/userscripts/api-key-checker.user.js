// ==UserScript==
// @name         大模型密钥检查 · CORS 直连桥接
// @name:en      API Key Checker - CORS Bridge
// @namespace    https://tools.misaka-network.top/userscripts
// @version      1.2.0
// @description  为「大模型密钥检查」工具提供 GM_xmlhttpRequest 直连，绕过浏览器 CORS。安装后请刷新页面。
// @description:en  CORS bridge for the API Key Checker tool. Refresh the page after install.
// @author       Misaka Network
// @match        https://tools.misaka-network.top/*
// @match        https://tools.keorigin.com/*
// @match        http://localhost/*
// @match        http://127.0.0.1/*
// @updateURL    https://tools.misaka-network.top/userscripts/api-key-checker.user.js
// @downloadURL  https://tools.misaka-network.top/userscripts/api-key-checker.user.js
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-start
// ==/UserScript==

// 安全提示：@connect * 允许脚本在已匹配站点上向任意 URL 发起请求（含自定义端点、携带 API Key）。
// 安装时 Tampermonkey 会弹出宽泛授权确认，属预期行为。仅安装/信任来自本工具站的脚本。
(function () {
  'use strict';

  // 与 src/composables/useUserscriptBridge.ts 中 EXPECTED_SCRIPT_VERSION 保持一致
  var VERSION = '1.2.0';

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

  // 调试输出：打印大模型接口的请求输入与响应输出，便于排查。
  // 请求头中的 Authorization / x-api-key 自动打码，避免 API Key 明文出现在控制台。
  function maskSensitiveHeaders(headers) {
    var masked = {};
    Object.keys(headers || {}).forEach(function (key) {
      var value = headers[key];
      var lower = key.toLowerCase();
      if ((lower === 'authorization' || lower === 'x-api-key') && typeof value === 'string') {
        masked[key] = value.slice(0, 6) + '…' + value.slice(-4) + '（已打码）';
      } else {
        masked[key] = value;
      }
    });
    return masked;
  }

  function logRequest(method, url, headers, body) {
    console.groupCollapsed('[miska-userscript] 请求 →', method, url);
    console.log('请求头:', maskSensitiveHeaders(headers));
    console.log('请求体:', typeof body === 'string' && body ? body : '(无)');
    console.groupEnd();
  }

  function logResponse(url, status, statusText, responseText) {
    console.groupCollapsed('[miska-userscript] 响应 ←', status, url);
    console.log('响应体:', typeof responseText === 'string' && responseText ? responseText : '(空)');
    console.groupEnd();
  }

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

    var method = typeof detail.method === 'string' ? detail.method.toUpperCase() : 'GET';
    var headers = detail.headers && typeof detail.headers === 'object' ? detail.headers : {};
    var body = typeof detail.body === 'string' ? detail.body : undefined;
    logRequest(method, url, headers, body);

    GM_xmlhttpRequest({
      method: method,
      url: url,
      headers: headers,
      data: body,
      timeout: 20000,
      nofail: true, // 自行处理错误，抑制 Tampermonkey 网络失败通知
      onload: function (res) {
        var responseText = typeof res.responseText === 'string' ? res.responseText : '';
        logResponse(url, res.status, res.statusText || '', responseText);
        emit('miska-userscript-response', {
          requestId: requestId,
          status: res.status,
          statusText: res.statusText || '',
          responseText: responseText,
        });
      },
      onerror: function (res) {
        console.error('[miska-userscript] 请求失败:', url, res && res.error ? res.error : 'Network error');
        emit('miska-userscript-response', {
          requestId: requestId,
          status: 0,
          statusText: 'Network error',
          responseText: '',
          error: res && res.error ? String(res.error) : 'Network error',
        });
      },
      ontimeout: function () {
        console.error('[miska-userscript] 请求超时:', url);
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

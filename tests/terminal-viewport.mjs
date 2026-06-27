/**
 * 终端视图适配测试
 * 
 * 验证终端在手机端的尺寸适配逻辑正确
 * 用法: node tests/terminal-viewport.mjs
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, "../src/styles.css");
const css = readFileSync(cssPath, "utf-8");

let passed = 0;
let failed = 0;

function check(desc, condition) {
  if (condition) {
    console.log(`  ✅ ${desc}`);
    passed++;
  } else {
    console.log(`  ❌ ${desc}`);
    failed++;
  }
}

console.log("═".repeat(50));
console.log(" 终端视图适配测试");
console.log("═".repeat(50));

// ── 1. 终端容器 ──

console.log("\n── 终端容器尺寸 ──");

check(
  "Base: .terminal-wrap 有 flex: 1 填充剩余空间",
  /\.terminal-wrap\s*\{[^}]*flex:\s*1/.test(css)
);

check(
  "Base: .terminal-wrap grid 行: 26px toolbar + 1fr host",
  /\.terminal-wrap\s*\{[^}]*grid-template-rows:\s*26px\s+1fr/.test(css)
);

check(
  "Base: .terminal-host 有 min-height: 80px",
  /\.terminal-host\s*\{[^}]*min-height:\s*80px/.test(css)
);

check(
  "Base: .terminal-host 有 max-width: 100%",
  /\.terminal-host\s*\{[^}]*max-width:\s*100%/.test(css)
);

check(
  "Base: .xterm 有 max-width: 100%",
  /\.xterm\s*\{[^}]*max-width:\s*100%/.test(css)
);

check(
  "Base: .xterm-viewport 有 overflow-x: hidden",
  /\.xterm-viewport\s*\{[^}]*overflow-x:\s*hidden/.test(css)
);

// ── 2. 工作区容器 ──

console.log("\n── 工作区容器 ──");

check(
  "Base: .workspace 是 flex 列布局",
  /\.workspace\s*\{[^}]*display:\s*flex/.test(css)
);

check(
  "Base: .workspace height = 100vh - 44px (减去顶栏)",
  /height:\s*calc\(100vh\s*-\s*44px\)/.test(css)
);

check(
  "Base: .center-stack 有 flex: 1",
  /\.center-stack\s*\{[^}]*flex:\s*1/.test(css)
);

check(
  "Base: .center-stack 有 min-height: 0",
  /\.center-stack\s*\{[^}]*min-height:\s*0/.test(css)
);

// ── 3. 桌面端适配 ──

console.log("\n── 桌面端适配 ──");

const desktopSection = css.match(/@media \(min-width: 521px\)[\s\S]*?@media\s/s);

check(
  "Desktop: .terminal-wrap grid 行: 28px toolbar + 1fr host",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.terminal-wrap\s*\{[^}]*grid-template-rows:\s*28px\s+1fr/.test(css)
);

check(
  "Desktop: .terminal-host min-height: 100px",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.terminal-host\s*\{[^}]*min-height:\s*100px/.test(css)
);

check(
  "Desktop: .terminal-host padding: 6px",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.terminal-host\s*\{[^}]*padding:\s*6px/.test(css)
);

check(
  "Desktop: .xterm font-size: 13px",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.xterm\s*\{[^}]*font-size:\s*13px/.test(css)
);

check(
  "Desktop: .center-stack 是 grid 布局",
  /@media[^}]*min-width:\s*521px[\s\S]*?\.center-stack\s*\{[^}]*display:\s*grid/.test(css)
);

// ── 4. 手机端字体 ──

console.log("\n── 字体适配 ──");

check(
  "Mobile: .xterm font-size: 12px (BASE)",
  /\.xterm\s*\{[^}]*font-size:\s*12px/.test(css)
);

check(
  "Desktop: .xterm font-size: 13px (521px+)",
  /@media[^}]*min-width:\s*521px[\s\S]*?font-size:\s*13px[^}]*!important/.test(css)
);

// ── 5. 结果 ──

console.log("\n" + "─".repeat(50));
console.log(` 通过: ${passed} / ${passed + failed}  失败: ${failed}`);
console.log("─".repeat(50));

process.exit(failed > 0 ? 1 : 0);

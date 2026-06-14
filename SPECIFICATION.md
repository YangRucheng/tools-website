# 代码规范

> 本规范定义编码约定与架构模式。功能会迭代，规范不轻易变更——新增代码必须遵守。

---

## 1. 命名约定

| 类别 | 风格 | 示例 |
|------|------|------|
| Vue 组件文件 | PascalCase | `CopyButton.vue`, `AppSidebar.vue` |
| TypeScript 模块 | camelCase | `jsonUtils.ts`, `useTheme.ts` |
| 工具目录 | 简短小写 | `base64/`, `timestamp/`, `jwt/` |
| Composable 函数 | `use` 前缀 | `useTheme`, `useClipboard` |
| 工具函数 | 动词开头 | `encodeBase64`, `validateUuid`, `formatJson` |
| 事件处理函数 | `handle` 前缀 | `handleCopy`, `handleShare` |
| 主执行函数 | `run` | 工具的入口执行逻辑 |
| 重置函数 | `clear` | 恢复工具状态至默认值 |
| 常量 | SCREAMING_SNAKE_CASE | `CATEGORY_META`, `STORAGE_PREFIX` |
| 类型 / 接口 | PascalCase | `Tool`, `JsonResult` |
| 枚举 | PascalCase | `Category` |
| 工具注册变量 | 统一 `tool` | `const tool: Tool = { ... }` |

---

## 2. 函数风格

**全部使用箭头函数。禁止 `function` 关键字。**

```ts
// ✅ 正确
export const encodeBase64 = (text: string): Base64Result => { ... };
const handleCopy = async () => { ... };

// ❌ 错误
export function encodeBase64(text: string): Base64Result { ... }
```

### 2.1 泛型箭头函数

`.ts` 文件中泛型箭头函数须加尾随逗号：

```ts
// ✅ 正确
export const useToolStorage = <T extends Record<string, unknown>,>(...): ... => { ... };

// ❌ 可能被误解析
export const useToolStorage = <T extends Record<string, unknown>>(...): ... => { ... };
```

### 2.2 对象方法

```ts
export const storage = {
  get<T>(key: string, fallback: T): T { ... },
  set<T>(key: string, value: T): void { ... },
};
```

---

## 3. 类型规范

### 3.1 禁止 `any`

全项目 `any` 使用量必须为 **零**。需要动态类型时使用 `unknown`，并在消费处收窄：

```ts
// ✅ 正确
export interface ToolShareState {
  [key: string]: unknown;
}

// 消费时进行类型守卫
if (typeof s.input === 'string') input.value = s.input;
```

### 3.2 类型标注要求

- 所有函数参数和返回值**必须有**明确类型
- Props 使用纯类型语法：`defineProps<{ ... }>()`
- Emits 使用新式长格式：`defineEmits<{ event: [payload] }>()`
- Ref 通过泛型指定类型：`ref<string>('')`
- `as` 断言仅用于明确收窄，不得绕过类型检查

---

## 4. 组件规范

### 4.1 文件结构

```vue
<script setup lang="ts">
// ① Vue 核心（ref, computed, inject, watch, onMounted）
// ② UI 库（naive-ui 组件）
// ③ 本地工具函数 + 类型
// ④ 通用组件
// ⑤ Composables
// ⑥ 共享类型
// ⑦ 状态（useToolStorage → ref → inject → computed）
// ⑧ 方法
// ⑨ 生命周期 & watchers
</script>

<template>
  <!-- 模板 -->
</template>

<style scoped>
  /* 组件专属样式 */
</style>
```

### 4.2 组件粒度

- 出现 **3 次以上**的重复 UI 结构必须抽象为公共组件
- 公共组件放在 `src/components/common/`
- 布局组件放在 `src/components/layout/`
- 工具专用组件放在对应工具目录内

### 4.3 Props / Emits

```ts
defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
```

### 4.4 v-model

子组件实现双向绑定时，Props 定义 `modelValue`，Emits 定义 `'update:modelValue'`，二者缺一不可。

---

## 5. Composable 规范

### 5.1 命名与结构

```ts
export const useXxx = () => {
  // ① 状态
  const state = ref(...);

  // ② 计算属性
  const derived = computed(() => ...);

  // ③ 方法
  const action = () => { ... };

  // ④ 仅返回模板所需
  return { state, derived, action };
};
```

- 文件名与导出函数名一致：`useClipboard.ts` → `export const useClipboard = () =>`
- 所有 composable 以 `use` 开头
- 返回对象只暴露模板或调用方实际使用的成员

---

## 6. 工具开发规范

### 6.1 目录结构

```
src/tools/<name>/
├── index.ts               # 注册入口
├── <name>Utils.ts         # 纯函数逻辑
├── <name>Utils.test.ts    # 单元测试
└── <name>Tool.vue         # UI 组件
```

### 6.2 注册入口模板

```ts
import { registerTool } from '@/tools/registry';
import { Category } from '@/tools/types';
import type { Tool, ToolShareState } from '@/tools/types';

const tool: Tool = {
  id: '<kebab-case-id>',
  name: '<中文名称>',
  category: Category.XXX,
  route: '/<route>',
  description: '<描述>',
  keywords: ['<关键词>', ...],
  component: () => import('./<Name>Tool.vue'),
  encodeShareState: (s) => JSON.stringify(s),
  decodeShareState: (e) => JSON.parse(e) as ToolShareState,
};

registerTool(tool);
```

- 变量名**必须**为 `tool`
- `component` **必须**使用动态 import（懒加载）
- 注册后须在 `src/tools/index.ts` 中补充 side-effect import

### 6.3 Utils 文件规范

- 纯函数，不导入 Vue 任何模块
- 每类操作定义 Result 接口：`{ success: boolean; data?: T; error?: string }`
- 返回值统一用 Result 接口，不在 utils 中处理 UI 展示逻辑

### 6.4 工具 UI 组件模板

每个工具组件遵循结构：

```
ToolLayout
├── ModeToggle / ToolOptionsBar（可选：操作模式、选项）
├── IoLayout
│   ├── #input  → ToolInput + ErrorAlert
│   └── #output → ResultPanel + CopyButton
└── .tool-actions → 清除按钮 + 执行按钮
```

关键点：
- 外层用 `<ToolLayout :title="...">`
- 有输入/输出对比的工具用 `<IoLayout>`
- 按钮区使用全局 CSS 类 `tool-actions`，**不**自行定义该样式
- 分享状态恢复统一使用 `useSharedStateRestore`

---

## 7. 分享（Share）功能

### 7.1 编码流程

```
ToolShareState → JSON.stringify → TextEncoder → base64url → URL ?state= 参数
```

### 7.2 工具集成三步

1. **index.ts**：实现 `encodeShareState` / `decodeShareState`
2. **组件**：inject `setToolState`，每次执行后调用 `updateShareState()`
3. **恢复**：使用 `useSharedStateRestore({ ref1, ref2 }, onRestored)` 自动还原 URL 携带的状态

### 7.3 状态同步

用 `watch([...refs], () => updateShareState())` 监听关键状态变更，保持 URL 参数同步。

---

## 8. CSS 规范

### 8.1 设计 Token

所有颜色、间距、圆角、字体通过 CSS 变量统一管理，集中于 `src/styles/tokens.css`：

| 前缀 | 用途 |
|------|------|
| `--app-bg-` | 背景色 |
| `--app-text-` | 文本色 |
| `--app-primary-` | 主色调 |
| `--app-surface-` | 面板/卡片背景 |
| `--app-border` | 边框色 |
| `--app-spacing-` | 间距阶梯（xs/sm/md/lg/xl） |
| `--app-radius-` | 圆角 |
| `--app-font-mono` | 等宽字体栈 |
| `--app-sidebar-` | 侧边栏 |

### 8.2 全局工具类

以下类定义在全局样式中，全项目直接使用，**禁止**在各组件中重复定义：

```css
.icon-inner {
  display: inline-flex;
  align-items: center;
  color: currentColor;
}

.tool-actions {
  display: flex;
  gap: var(--app-spacing-sm);
  align-items: center;
  justify-content: flex-start;
  margin-top: var(--app-spacing-md);
}
```

组件 `scoped` 样式中仅可覆盖差异项（如 `margin-right`、`color`），不得重复定义 `display`、`align-items` 等基础规则。

### 8.3 暗色模式

通过 `[data-theme="dark"]` 修改 CSS 变量即可适配暗色模式。组件不需要额外的 `@media` 查询或颜色硬编码。

---

## 9. 导入顺序

所有文件导入按以下分组，组间空行分隔：

```
① Vue 核心（ref, computed, inject 等）
② 第三方 UI 库（naive-ui 组件）
③ 本地工具函数 + 类型（import type）
④ 通用组件（@/components/common/）
⑤ Composables（@/composables/）
⑥ 共享类型（@/tools/types）
```

---

## 10. 测试规范

### 10.1 文件位置与命名

```
src/tools/<name>/
├── <name>Utils.ts
├── <name>Utils.test.ts   ← 与源文件同级
└── ...
```

### 10.2 结构

```ts
import { describe, it, expect } from 'vitest';

describe('functionName', () => {
  it('正常情况', () => { ... });
  it('空输入', () => { ... });
  it('无效输入', () => { ... });
});
```

### 10.3 最低覆盖

每个导出函数至少覆盖：正常输入、空输入、无效输入。枚举类参数测试每个枚举值。

---

## 11. 路由

- 使用 Hash 模式（`createWebHashHistory`）
- 首页路径 `/`，工具路径 `/<tool-route>`
- 工具路由由 registry 自动生成，**不需**手动添加

---

## 12. 状态持久化

- 工具状态通过 `useToolStorage('<tool-id>', defaults)` 管理
- Storage key 自动加前缀 `tool-state:`
- `clear()` 方法重置所有字段至默认值
- **禁止**在组件中直接操作 `localStorage`

---

## 13. 检查清单

新增代码前逐项确认：

- [ ] 所有函数使用箭头函数（无 `function` 关键字）
- [ ] 无 `any` 类型标注
- [ ] 函数参数和返回值有明确类型
- [ ] 工具注册变量名为 `tool`
- [ ] 工具使用动态 import 懒加载
- [ ] 已在 `src/tools/index.ts` 添加 import
- [ ] 使用 `useSharedStateRestore` 处理分享恢复
- [ ] 按钮区使用全局 CSS 类 `tool-actions`
- [ ] 图标内联使用全局 CSS 类 `icon-inner`，scoped 中仅覆盖差异
- [ ] 导入顺序符合第 9 节
- [ ] 已编写测试（至少正常/空/无效三类输入）
- [ ] `vue-tsc --noEmit` 通过
- [ ] `vite build` 通过
- [ ] `vitest run` 全部通过

---

## 14. 禁止事项

- ❌ `function` 关键字
- ❌ `any` 类型
- ❌ 多处重复相同的 CSS 规则块
- ❌ Utils 文件中导入 Vue 或组件
- ❌ 组件中直接操作 `localStorage`
- ❌ 工具组件使用同步 import
- ❌ 修改无关代码的格式或风格

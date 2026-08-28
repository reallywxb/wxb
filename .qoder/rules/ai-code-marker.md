# AI 生成代码标记规范

## 优先级：P0（必须遵守）

## 适用场景

任何由 AI 生成或辅助生成的代码片段。

## 规则描述

所有 AI 生成的代码**必须**添加 AI 标记：

- 以 `AI-GENERATED-BEGIN` 开头
- 以 `AI-GENERATED-END` 结尾
- 必须标注以下注释信息：
  - `@date`：生成日期（格式 YYYY-MM-DD）
  - `@prompt`：精简描述触发该代码生成的问题/需求
  - `@description`：结合生成的代码，精简描述代码的功能

## 示例

```typescript
// AI-GENERATED-BEGIN
// @date 2026-07-21
// @prompt 实现用户列表导出功能
// @description 调用后端导出接口，通过 Blob 触发浏览器文件下载
export const handleExport = async () => {
  const res = await exportUserList(queryParams.value);
  const blob = new Blob([res], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '用户列表.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
};
// AI-GENERATED-END
```

## Vue SFC 中的示例

```vue
<script lang="ts" setup>
// AI-GENERATED-BEGIN
// @date 2026-07-21
// @prompt 创建用户管理主页面
// @description 基于 useSpdGrid 生成用户列表表格，含搜索表单和操作列
import { Page } from '@vben/common-ui';
import { useSpdGrid } from '#/components/spd';
// ... 其余代码
// AI-GENERATED-END
</script>
```

## 注意事项

- `@prompt` 应精简描述问题，不超过一行
- `@description` 应精简描述代码功能，不超过两行
- 标记注释使用当前文件的注释语法（TS/JS 用 `//`，HTML 模板用 `<!-- -->`）

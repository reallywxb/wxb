# QWEN.md

## 项目概述

**spd-v4-ui** 是一个基于 [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) v5.5.5 的中后台管理系统前端项目，采用 **Monorepo** 架构，使用 **Vue 3** + **Vite 6** + **TypeScript** + **Ant Design Vue** 技术栈构建。

**核心业务场景**：为 SPD（医疗供应链管理）场景定制的业务系统，包含采购计划、仓库管理、药品管理、医供体管理、用户管理等模块。

## 技术栈

| 类别      | 技术                                       |
| --------- | ------------------------------------------ |
| 框架      | Vue 3 + TypeScript                         |
| 构建工具  | Vite 6 + Turbo (Monorepo)                  |
| Monorepo  | pnpm workspace                             |
| UI 组件库 | Ant Design Vue 4.x                         |
| 表格组件  | VXE Table 4.x                              |
| 状态管理  | Pinia                                      |
| 路由      | Vue Router 4.x                             |
| 表单校验  | Vee Validate + Zod                         |
| 样式      | Tailwind CSS + SCSS + Less                 |
| 国际化    | Vue I18n                                   |
| 代码规范  | ESLint + Prettier + Stylelint + Commitlint |

## 核心文档参考地址

| 资源 | 地址 |
| --- | --- |
| VXE Table v4 文档 | https://vxetable.cn/v4/#/component/grid/checkbox/reserve |
| Vben 框架文档 | https://doc.vben.pro/guide/introduction/vben.html |
| Vben 组件文档 | https://doc.vben.pro/components/common-ui/vben-form.html |
| Ant Design Vue 组件库 | https://www.antdv.com/components/overview |

## 项目结构

```
spd-v4-ui/
├── apps/
│   ├── backend-mock/        # 后端 Mock 服务
│   └── newrepo/             # 主应用（SPD 业务系统）
│       └── src/
│           ├── adapter/     # 适配器（表单、UI 组件封装）
│           ├── api/         # API 接口定义
│           ├── components/  # 公共组件（含 spd 业务组件）
│           ├── hooks/       # 自定义 Hooks
│           ├── router/      # 路由配置
│           ├── store/       # Pinia 状态管理
│           ├── views/       # 页面视图
│           │   └── modules/ # 业务模块（spd 业务在此）
│           ├── locales/     # 国际化
│           └── utils/       # 工具函数
├── internal/                # 内部配置包（lint、vite 配置等）
├── packages/                # 公共组件和工具包
│   ├── @core/               # Vben 核心包
│   ├── business/            # 业务组件
│   ├── chc/                 # 自定义组件库（ChcSelect、ChcGrid 等）
│   └── effects/             # 效果组件
├── scripts/                 # 构建和部署脚本
├── docs/                    # 文档
├── package.json             # 根级 pnpm 配置
├── turbo.json               # Turbo 构建配置
└── pnpm-workspace.yaml      # pnpm workspace 定义
```

## 关键命令

```bash
# 安装依赖
pnpm install

# 开发模式（选择要运行的应用）
pnpm dev

# 仅启动 newrepo 应用开发
pnpm -F @vben/newrepo run dev

# 构建所有应用
pnpm build

# 仅构建 newrepo
pnpm build:newrepo

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 类型检查
pnpm check:type

# 单元测试
pnpm test:unit

# E2E 测试
pnpm test:e2e
```

## 核心开发约定

### 表格组件选择：useChcGrid vs useSpdGrid

项目中提供两个表格 Hook，**选择依据如下**：

| 场景 | 使用 |
| --- | --- |
| **SPD 业务模块**（API 需设置 `Content-Type: application/x-www-form-urlencoded`） | **useSpdGrid**（优先） |
| 非 SPD 通用业务 | **useChcGrid** |
| 高度定制需求 | **useChcGrid** |

**useSpdGrid 特点**：

- 自动设置请求头 `Content-Type: application/x-www-form-urlencoded; charset=UTF-8`
- 自动处理分页参数（`pageNum`, `pageSize`）
- 自动处理排序参数（`sort`, `dir`）
- 自动处理返回数据（统一转换 `records`/`rows` 字段）
- 默认配置：复选框行高亮、紧凑表单布局

**useSpdGrid 基本用法**：

```typescript
import { useSpdGrid } from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { formDefaultOptions, gridDefaultOptions } from '#/components/spd';

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: { autoLoad: false },
    }),
  },
  {
    id: 'gridId',
    queryUrl: '/api/query.do',
    gridColumns: [
      /* 列定义 */
    ],
    formSchema: [
      /* 表单字段定义 */
    ],
  },
);
```

**useChcGrid 额外参数**：支持自定义出入参转换函数：

```typescript
const [CustomGrid, customGridApi] = useChcGrid(
  {
    /* 配置 */
  },
  {
    /* 选项 */
  },
  (res: any) => ({ total: res.total, records: res.data }), // 出参处理
  (params: any) => ({ ...params, page: params.current }), // 入参处理
);
```

### 表单配置规范

#### FormItem 项定义

```typescript
const formSchema = [
  {
    component: 'Input', // 组件类型
    fieldName: 'name', // 字段名
    label: '姓名', // 标签
    rules: 'required', // 校验规则
    componentProps: {
      // 组件属性
      placeholder: '请输入姓名',
    },
    defaultValue: undefined, // 默认值
    dependencies: {
      // 依赖关系
      triggerFields: ['orgId'],
      show: (values) => values.orgId !== undefined,
    },
    formItemClass: 'col-start-1', // CSS 类（用于控制换行）
  },
];
```

**常用组件类型**：

- `Input` / `InputPassword` / `Textarea` - 文本输入
- `ChcSelect` - 字典下拉（支持远程数据、分页、依赖联动）
- `ApiTreeSelect` - 异步树形选择
- `DatePicker` / `RangePicker` - 日期选择
- `Switch` - 开关
- `RadioGroup` / `CheckboxGroup` - 单选/复选框组

#### ChcSelect 组件核心配置

| 属性                        | 说明                        |
| --------------------------- | --------------------------- |
| `dictUrl`                   | 字典接口地址                |
| `options`                   | 直接传入固定选项            |
| `showSearch`                | 是否支持搜索                |
| `paginate`                  | 是否开启分页                |
| `triggerFields`             | 依赖联动字段                |
| `labelField` / `valueField` | 自定义 label/value 字段映射 |
| `autoChooseFirstOption`     | 自动选择第一项              |
| `blackList`                 | 黑名单（不可选项）          |
| `afterFetch`                | 数据获取后处理函数          |

#### 表单布局

- `wrapperClass: 'grid-cols-3'` — 每行 3 列
- `layout: 'horizontal'` — 水平布局（label 和 input 同行）
- `formItemClass: 'col-start-1'` — **强制元素从第 1 列开始（换行）**
- `showCollapseButton` — 是否显示展开/收起按钮
- `compact: true` — 紧凑模式

### 表格 Column 定义

```typescript
const gridColumns = [
  { title: '序号', type: 'seq', width: 50, align: 'center' },
  {
    field: 'productCode',
    title: '药品编码',
    minWidth: 100,
    sortable: true,
  },
  {
    field: 'status',
    title: '状态',
    formatter: (params: any) => {
      return params.row.status === 'Y' ? '启用' : '停用';
    },
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' }, // 自定义操作列
    fixed: 'right',
    title: '操作',
    width: 150,
  },
];
```

### 新增/编辑/查看功能实现

推荐使用 **Modal 弹窗模式**：

```vue
<script lang="ts" setup>
import { ref } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';
import { message } from 'ant-design-vue';

const [Modal, modalApi] = useVbenModal({
  onConfirm() {
    /* 或自定义提交 */
  },
});

const [BaseForm, baseFormApi] = useVbenForm({
  schema: [
    /* 表单字段 */
  ],
  layout: 'horizontal',
  showDefaultActions: false,
});

async function onSubmit() {
  const result = await baseFormApi.validate();
  if (result.valid) {
    const formData = await baseFormApi.getValues();
    // 调用 API 提交
    // await saveApi(formData);
    message.success('保存成功');
    modalApi.close();
  }
}
</script>

<template>
  <Modal title="新增">
    <BaseForm />
    <template #prepend-footer>
      <Button type="primary" @click="onSubmit">提交</Button>
    </template>
  </Modal>
</template>
```

### Ref 使用注意事项

在 Vue 3 `<script setup>` 中，所有 `ref` 变量访问时必须加 `.value`：

```typescript
// ✅ 正确
currentRow.value = scope.row;

// ❌ 错误（会覆盖 ref 对象）
currentRow = scope.row;
```

### 模板字符串语法

模板字符串必须正确使用 `${}` 包裹变量：

```typescript
// ✅ 正确
return `${baseUrl}/api?siteAttachId=${currentRow.value.siteAttachId}`;

// ❌ 错误（语法错误）
return `${baseUrl}/api?siteAttachId=currentRow.value.siteAttachId`;
```

### 提交规范

提交信息遵循 **Angular 规范**：

```
feat(module): 新功能描述
fix(module): Bug 修复描述
refactor(module): 重构描述
style(module): 代码风格修改（不影响运行）
perf(module): 性能优化描述
docs(module): 文档描述
chore(module): 依赖更新/配置修改
```

## 环境要求

| 依赖    | 版本               |
| ------- | ------------------ |
| Node.js | >= 20.10.0         |
| pnpm    | >= 9.12.0          |
| 浏览器  | Chrome 80+（推荐） |

## 开发注意事项

1. **更改配置后请清空缓存**，否则可能不生效
2. **SPD 业务模块优先使用 `useSpdGrid`**，可享受开箱即用的 API 参数处理
3. 表格返回数据格式需包含 `total` 和 `records`（或 `rows`）字段
4. 表单 `dependencies` 依赖关系中 `show` 函数可控制字段显示/隐藏
5. 操作列使用 `slots: { default: 'action' }` 自定义按钮
6. 所有 API 调用建议在 `#/api/` 目录下统一管理
7. Mock 数据放在 `src/mock/` 目录下

## AI 代码生成规范

> **强制要求**：所有 AI 生成的代码，必须添加以下标记：

```typescript
// AI-GENERATED-BEGIN
// @date 2026-04-20
// @prompt 精简描述触发 AI 生成的问题
// @description 结合生成的代码，精简描述功能
// AI-GENERATED-END
```

**标记说明**：

- `AI-GENERATED-BEGIN` — AI 生成代码的开始标记
- `AI-GENERATED-END` — AI 生成代码的结束标记
- `@date` — 生成日期
- `@prompt` — 精简描述触发 AI 生成的问题
- `@description` — 结合生成的代码，精简描述代码的功能

## 代码注释规范

- **注释比例**：代码注释量需达到 **30% 的中文注释**
- **注释语言**：使用中文进行注释
- **注释内容**：描述代码的功能、逻辑和注意事项

## 开发规范文档索引

> 以下文档位于 `.trae/skills/code-skills/reference/` 目录下，是项目开发的核心规范参考。

### 一、页面类型规范

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| 带tab的主页面 | `.trae/skills/code-skills/reference/带tab的主页面.md` | 使用 `SpdPage` + `PageInnerTabs` 实现多Tab页面布局 |
| 单个表格主页面 | `.trae/skills/code-skills/reference/单个表格主页面.md` | 标准的单表格页面，包含搜索表单、表格、操作按钮 |
| 父子表主页面 | `.trae/skills/code-skills/reference/父子表主页面.md` | 使用 `PageSplitLazy` 分割主从表格数据展示 |

### 二、表单配置规范

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| FormItem项定义 | `.trae/skills/code-skills/reference/表单配置-FormItem项定义.md` | 表单字段定义、组件类型列表、ChcSelect 完整 API |
| 字段定义 | `.trae/skills/code-skills/reference/表单配置-字段定义.md` | 表单字段定义规范 |
| 依赖关系 | `.trae/skills/code-skills/reference/表单配置-依赖关系.md` | 字段级联、动态显示/隐藏、ChcSelect 联动配置 |
| 自定义配置 | `.trae/skills/code-skills/reference/表单配置-自定义配置.md` | 表单自定义配置项 |
| 高级查询 | `.trae/skills/code-skills/reference/表单配置-高级查询.md` | 高级搜索表单配置 |

### 三、表格配置规范

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| Column定义 | `.trae/skills/code-skills/reference/表格配置-Column定义.md` | 表格列定义、格式化、排序、固定列、操作列 |
| 表格自定义配置 | `.trae/skills/code-skills/reference/表格配置-表格自定义配置.md` | 表格自定义配置项 |
| 头部功能区 | `.trae/skills/code-skills/reference/表格配置-头部功能区.md` | `toolbar-actions` / `toolbar-tools` 插槽、`showZoomBtn` / `showCustomBtn` |

### 四、功能按钮与逻辑

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| 新增按钮 | `.trae/skills/code-skills/reference/功能按钮与逻辑分析-新增按钮.md` | `showAddBtn` 配置、`commonFormOptions` 新增表单配置 |
| 导出功能 | `.trae/skills/code-skills/reference/功能按钮与逻辑分析-导出功能.md` | `showExportBtn` 配置、`handleExport` 使用、自定义导出按钮 |
| 表格操作列 | `.trae/skills/code-skills/reference/功能按钮与逻辑分析-表格操作列.md` | `cellRender` 操作列配置、`CustomCellMenu`、权限控制 |

### 五、新增功能实现方式

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| 弹窗模式 | `.trae/skills/code-skills/reference/新增功能实现-弹窗模式.md` | 使用 Modal 弹窗实现新增/编辑表单 |
| Drawer模式 | `.trae/skills/code-skills/reference/新增功能实现-drawer模式.md` | 使用 Drawer 抽屉实现新增/编辑表单 |
| 页面模式 | `.trae/skills/code-skills/reference/新增功能实现-页面模式.md` | 使用独立页面实现新增/编辑表单 |

### 六、表单优化

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| 新增表单优化 | `.trae/skills/code-skills/reference/新增表单优化.md` | 新增表单最佳实践 |
| 编辑表单调整 | `.trae/skills/code-skills/reference/编辑表单调整.md` | 编辑表单调整规范 |
| 查看表单优化 | `.trae/skills/code-skills/reference/查看表单优化.md` | 查看表单最佳实践 |
| 搜索表单优化 | `.trae/skills/code-skills/reference/搜索表单优化.md` | 搜索表单优化规范 |

### 七、API 与 Mock 数据

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| API 接口定义 | `.trae/skills/code-skills/reference/api.md` | API 封装规范、`requestFormClient` vs `requestClient` 区别 |
| Mock 数据 | `.trae/skills/code-skills/reference/mock.md` | Mock 数据添加规范、菜单 Mock 配置 |

### 八、表格组件选择

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| useChcGrid | `.trae/skills/code-skills/reference/useChcGrid.md` | 通用表格组件 Hook |
| useSpdGrid | `.trae/skills/code-skills/reference/useSpdGrid.md` | SPD 业务专用表格组件 Hook |
| 组件选择指南 | `.trae/skills/code-skills/reference/useChcGrid还是useSpdGrid.md` | 两个 Hook 的差异对比与选择建议 |

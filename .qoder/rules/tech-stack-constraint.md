# 技术栈约束

## 优先级：P1（推荐实践）

## 适用场景

编写或修改业务代码时。

## 规则描述

项目核心技术栈：

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5+（Composition API + `<script setup>`） |
| 语言 | TypeScript |
| 表格 | vxe-table v4 |
| 应用框架 | Vben Admin v5 |
| UI 组件库 | **Ant Design Vue**（业务 UI 统一使用） |
| 状态管理 | Pinia 3 |
| 路由 | Vue Router 4 |
| HTTP | Axios（封装为 requestClient / requestFormClient） |
| 样式 | TailwindCSS 3 + Sass |

## 组件库使用约束

- **业务页面 UI 组件统一使用 Ant Design Vue**
- **不主动引入 Element Plus / TDesign 组件用于业务开发**
- Element Plus 和 TDesign 仅保留全局样式引入和特定非业务组件（如 TDesign Chat 用于 AI 对话）
- 表格相关使用 vxe-table，不直接使用 Ant Design Vue 的 Table

## 参考文档

- vxe-table：https://vxetable.cn/v4/
- Vben 框架：https://doc.vben.pro/guide/introduction/vben.html
- Vben 组件：https://doc.vben.pro/components/common-ui/vben-form.html
- Ant Design Vue：https://www.antdv.com/components/overview

## 注意事项

- 若项目存在 skill，需要把 skill 同步参考
- 生成代码时应优先使用项目已封装的组件和 Hook（如 useSpdGrid、useChcGrid、ChcSelect 等）

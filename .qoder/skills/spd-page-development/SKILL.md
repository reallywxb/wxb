---
name: 'spd-page-development'
description: 'SPD 业务页面开发技能。为用户提供业务开发指导，包括新功能模块开发和现有页面优化。当用户需要从头开发功能模块或修改现有页面功能时调用。'
---

# SPD 业务页面开发

## 功能概述

本技能为用户提供 SPD 药品供应链系统的业务页面开发指导，帮助快速开发和优化业务功能模块。

## 适用场景

- 用户需要从头开发一个新的功能模块页面
- 用户需要添加、更改或优化现有页面模块的功能

## 技术栈

- Vue 3（Composition API + `<script setup lang="ts">`）
- TypeScript
- vxe-table v4（表格）
- Vben Admin v5 框架
- Ant Design Vue（UI 组件）
- useSpdGrid / useChcGrid（表格 Hook）

## 工作流程

### 1. 需求类型识别

分析用户输入内容，判断需求类型：

- **新功能开发**：从头开发一个新的功能模块
- **功能修改**：添加、更改或优化现有页面功能

### 2. 新功能开发流程

#### 2.1 需求文档解析

- 分析用户提供的需求文档
- 提取功能菜单结构及对应功能页面
- 生成树形结构用于后续菜单 Mock 数据

#### 2.2 模块页面开发

每个模块页面按以下流程生成代码：

**a. 主页面生成**

- 判断使用 useChcGrid 还是 useSpdGrid → [参考文档](reference/useChcGrid还是useSpdGrid.md)
- 根据需求选择主页面类型：
  - [带 tab 的主页面](reference/带tab的主页面.md)
  - [单个表格主页面](reference/单个表格主页面.md)
  - [父子表主页面](reference/父子表主页面.md)
  - [EditableTable 可编辑表格](reference/editableTable.md)（行内编辑明细数据场景）

**b. 页面配置完善**

- 表单配置：
  - [FormItem 项定义](reference/表单配置-FormItem项定义.md)
  - [字段定义](reference/表单配置-字段定义.md)
  - [依赖关系](reference/表单配置-依赖关系.md)
  - [自定义配置](reference/表单配置-自定义配置.md)
  - [高级查询](reference/表单配置-高级查询.md)
- 表格配置：
  - [Column 定义](reference/表格配置-Column定义.md)
  - [表格自定义配置](reference/表格配置-表格自定义配置.md)
  - [头部功能区](reference/表格配置-头部功能区.md)

**c. 功能按钮与逻辑**

- [新增按钮及逻辑](reference/功能按钮与逻辑分析-新增按钮.md)
- [导出功能](reference/功能按钮与逻辑分析-导出功能.md)
- [表格操作列](reference/功能按钮与逻辑分析-表格操作列.md)

**d. 新增功能实现**（三种模式）

- [弹窗模式](reference/新增功能实现-弹窗模式.md)
- [Drawer 模式](reference/新增功能实现-drawer模式.md)
- [页面模式](reference/新增功能实现-页面模式.md)

**e. 编辑与查看功能**

- [编辑表单调整](reference/编辑表单调整.md)
- [查看表单优化](reference/查看表单优化.md)
- [新增表单优化](reference/新增表单优化.md)
- [搜索表单优化](reference/搜索表单优化.md)

**f. API 接口与 Mock 数据**（仅在用户要求时生成）

- [API 接口定义规范](reference/api.md)
- [Mock 数据添加规范](reference/mock.md)

### 3. 功能修改与优化流程

#### 3.1 功能类型识别

- [表单依赖关系调整](reference/表单配置-依赖关系.md)
- [表格配置修改](reference/表格配置-表格自定义配置.md)
- [表单配置修改](reference/表单配置-自定义配置.md)
- [表格操作列按钮调整](reference/功能按钮与逻辑分析-表格操作列.md)
- [表格头部功能按钮修改](reference/表格配置-头部功能区.md)

#### 3.2 代码修改

针对识别出的具体功能类型，参考对应文档提供代码修改建议和实现。

## 代码生成约束

生成代码时必须遵守以下规则（详见 `.qoder/rules/`）：

1. **AI 标记**：所有生成代码用 `AI-GENERATED-BEGIN/END` 包裹，标注 @date、@prompt、@description
2. **注释率 30%**：使用中文注释
3. **目录结构**：页面放在 `apps/newrepo/src/views/modules/spd/views/` 下
4. **组件库**：统一使用 Ant Design Vue
5. **API 客户端**：SPD 业务使用 `requestFormClient`
6. **表格 Hook**：SPD 业务使用 `useSpdGrid`，通用场景使用 `useChcGrid`
7. **路由联动**：新页面须同步更新 Mock 菜单数据

## 注意事项

- 请提供详细的需求文档，以便更准确地分析和生成代码
- 对于现有页面的修改，请提供相关的代码文件路径和具体修改需求
- 若无法判断使用 useChcGrid 还是 useSpdGrid，必须询问用户
- 生成的代码为示例代码，需要根据实际项目结构进行调整

# useSpdGrid 组件 API 文档

## 组件概述

`useSpdGrid` 是一个基于 `useChcGrid` 封装的 Vue 3 组合式 API 钩子函数，用于快速构建带有搜索表单和数据表格的页面。它提供了默认的配置选项、接口参数转换和响应数据处理，简化了数据表格的开发流程。

### 核心功能

- 集成搜索表单和数据表格
- 提供默认配置选项
- 自动处理接口参数转换
- 自动处理响应数据转换
- 支持自定义事件和方法

## 基本使用方法

```typescript
import { useSpdGrid } from '@/components/spd/curd';

const [GridComponent, gridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: {
      // 表单配置
    },
    gridOptions: {
      // 表格配置
    },
  },
  {
    id: 'gridId',
    queryUrl: '/api/data',
    gridColumns: [
      // 列配置
    ],
  },
);
```

## 参数说明

### 1. options 参数

| 参数名         | 类型          | 默认值     | 必填 | 描述             |
| -------------- | ------------- | ---------- | ---- | ---------------- |
| formOptions    | VbenFormProps | 见默认配置 | 否   | 搜索表单配置     |
| gridOptions    | Object        | 见默认配置 | 否   | 表格配置         |
| showSearchForm | boolean       | true       | 否   | 是否显示搜索表单 |
| gridEvents     | Object        | {}         | 否   | 表格事件配置     |

### 2. chcOptions 参数

| 参数名                | 类型    | 默认值     | 必填 | 描述               |
| --------------------- | ------- | ---------- | ---- | ------------------ |
| id                    | string  | -          | 否   | 表格唯一标识       |
| queryUrl              | string  | -          | 是   | 数据查询接口地址   |
| gridColumns           | Array   | []         | 是   | 表格列配置         |
| formSchema            | Array   | []         | 否   | 表单字段配置       |
| defaultRequestOptions | Object  | 见默认配置 | 否   | 默认请求配置       |
| showRadioRowTag       | boolean | false      | 否   | 是否显示单选行标签 |
| childGridLinkKeys     | Array   | []         | 否   | 子表格关联键       |
| childGridApi          | Object  | -          | 否   | 子表格 API         |

### 默认配置

**formDefaultOptions**:

```typescript
{
  compact: true,
  commonConfig: {
    labelClass: 'w-[70px]',
  },
  submitButtonOptions: {
    content: '查询',
    icon: h(SearchActionIcon, {
      style: 'margin-bottom: 4px;',
    }),
    'data-testid': 'button_search',
  },
  resetButtonOptions: {
    content: '重置',
    icon: h(ResetActionIcon, {
      style: 'margin-bottom: 4px;',
    }),
    'data-testid': 'button_reset',
  },
  rangeFieldFromSuffix: 'From',
  rangeFieldToSuffix: 'To',
  showCollapseButton: true,
}
```

**gridDefaultOptions**:

```typescript
{
  checkboxConfig: {
    trigger: 'default',
    highlight: true,
  },
}
```

**defaultRequestOptions**:

```typescript
{
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
}
```

## 返回值说明

| 返回值        | 类型      | 描述                 |
| ------------- | --------- | -------------------- |
| GridComponent | Component | 表格组件             |
| gridApi       | Object    | 表格 API 对象        |
| 额外对象      | Object    | 包含导出等方法的对象 |

### gridApi 方法

| 方法名          | 参数             | 返回值  | 描述             |
| --------------- | ---------------- | ------- | ---------------- |
| query           | params: Object   | Promise | 执行查询操作     |
| reset           | -                | void    | 重置表格         |
| refresh         | -                | Promise | 刷新表格数据     |
| setLoading      | loading: boolean | void    | 设置加载状态     |
| getSelectedRows | -                | Array   | 获取选中的行数据 |
| clearSelection  | -                | void    | 清空选择         |

### 额外方法

| 方法名       | 参数      | 返回值         | 描述         |
| ------------ | --------- | -------------- | ------------ |
| handleExport | -         | Promise        | 导出表格数据 |
| FormModal    | Component | 表单模态框组件 |

## 事件说明

| 事件名           | 参数                      | 描述           |
| ---------------- | ------------------------- | -------------- |
| row-click        | row: Object, event: Event | 行点击事件     |
| cell-click       | params: Object            | 单元格点击事件 |
| selection-change | selection: Array          | 选择变化事件   |
| sort-change      | params: Object            | 排序变化事件   |
| page-change      | params: Object            | 分页变化事件   |

## 内部逻辑结构

### 核心实现

1. **配置合并**：将用户传入的配置与默认配置进行深度合并
2. **参数转换**：处理接口入参，转换分页、排序等参数
3. **响应处理**：处理接口返回数据，统一数据格式
4. **API 调用**：调用 useChcGrid 并返回结果

### 数据流程

1. 用户调用 useSpdGrid 并传入配置
2. 合并默认配置和用户配置
3. 调用 useChcGrid 获取表格组件和 API
4. 用户使用返回的组件和 API 进行操作
5. 当执行查询时，自动转换参数并发送请求
6. 接收到响应后，自动转换数据格式并更新表格

## 状态管理机制

`useSpdGrid` 内部通过 `useChcGrid` 管理状态，包括：

- 表格数据状态
- 分页状态
- 排序状态
- 选择状态
- 加载状态
- 表单状态

## 生命周期处理

- **初始化**：合并配置，创建表格组件
- **挂载**：自动加载数据（如果配置了 autoLoad: true）
- **更新**：响应配置变化，重新渲染表格
- **卸载**：清理资源，取消未完成的请求

## 关键算法

### 1. 接口参数转换

```typescript
(params: any) => {
  return {
    ...params,
    pageSize: params.size,
    pageNum: params.current,
    limit: params.size,
    start: (params.current - 1) * params.size || 0,
    cols: undefined,
    current: undefined,
    size: undefined,
    sort:
      params.sort && params.sort.length > 0
        ? params.sort[0].split(' ')[0]
        : undefined,
    dir:
      params.sort && params.sort.length > 0
        ? params.sort[0].split(' ')[1]
        : undefined,
    dep: undefined,
    __v_isRef: undefined,
    __v_isShallow: undefined,
    _rawValue: undefined,
    _value: undefined,
  };
};
```

### 2. 响应数据转换

```typescript
(res: any) => {
  return res.records && res.records.length > 0
    ? {
        total: res.total,
        records: res.records,
      }
    : {
        total: res.total,
        records: res.rows,
      };
};
```

## 使用注意事项

1. **接口返回格式**：接口返回数据需要包含 `total` 和 `records`（或 `rows`）字段
2. **分页参数**：内部会自动转换分页参数，接口需要支持 `pageNum` 和 `pageSize` 参数
3. **排序参数**：内部会自动转换排序参数，接口需要支持 `sort` 和 `dir` 参数
4. **表单配置**：表单配置会与默认配置合并，默认配置会被用户配置覆盖
5. **表格配置**：表格配置会与默认配置合并，默认配置会被用户配置覆盖

## 常见问题解答

### Q: 接口返回数据格式不符合要求怎么办？

A: 可以通过修改响应数据转换函数来适配不同的返回格式。

### Q: 如何自定义请求头？

A: 可以在 `chcOptions` 中设置 `defaultRequestOptions.headers` 来自定义请求头。

### Q: 如何实现子表格功能？

A: 可以通过设置 `childGridLinkKeys` 和 `childGridApi` 来实现子表格功能。

### Q: 如何禁用自动加载数据？

A: 可以在 `gridOptions.proxyConfig` 中设置 `autoLoad: false` 来禁用自动加载。

## 完整示例代码

### 基本使用示例

```typescript
import { useSpdGrid } from '@/components/spd/curd';
import { deepMerge } from '@/utils/util';
import {
  formDefaultOptions,
  gridDefaultOptions,
} from '@/components/spd/config';

export function useGrid() {
  const [GridComponent, gridApi, { handleExport }] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        showCollapseButton: false,
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        stripe: false,
        checkboxConfig: {
          trigger: 'row',
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
      }),
    },
    {
      id: 'productOrgEdit',
      queryUrl: 'productAction/queryProductOrg.do',
      gridColumns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        { field: 'productCode', title: '药品编码', minWidth: '100' },
        { field: 'productName', title: '药品名称', minWidth: '150' },
        { field: 'productSpec', title: '规格', minWidth: '120' },
        {
          field: 'manufacturer',
          title: '厂家',
          minWidth: '150',
          sortable: true,
        },
        { field: 'uomName', title: '采购单位', minWidth: '80', sortable: true },
      ],
    },
  );

  return {
    GridComponent,
    gridApi,
    handleExport,
  };
}
```

### 带事件处理的示例

```typescript
import { useSpdGrid } from '@/components/spd/curd';

export function useGrid() {
  const [GridComponent, gridApi] = useSpdGrid(
    {
      formOptions: {
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
      },
      gridOptions: {
        stripe: false,
        proxyConfig: {
          autoLoad: true,
        },
      },
      gridEvents: {
        'row-click': (row: any) => {
          console.log('点击了行:', row);
        },
        'selection-change': (selection: any[]) => {
          console.log('选择变化:', selection);
        },
      },
    },
    {
      id: 'parent',
      queryUrl: '/orderAction/query.do?page=inputQuery',
      gridColumns: [
        { title: '序号', type: 'seq', minWidth: 50, align: 'center' },
        {
          field: 'orderNo',
          title: '申请单号',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'dateOrdered',
          title: '申请时间',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'deliveryPlanDate',
          title: '要求送达时间',
          minWidth: '120',
          sortable: true,
        },
      ],
    },
  );

  return {
    GridComponent,
    gridApi,
  };
}
```

### 带子表格的示例

```typescript
import { useSpdGrid } from '@/components/spd/curd';

export function useGrid() {
  // 子表
  const [ChildGrid, childGridApi] = useSpdGrid(
    {
      gridOptions: {
        columns: [
          { title: '序号', type: 'seq', width: 50, align: 'center' },
          {
            field: 'productCode',
            title: '药品编码',
            minWidth: '120',
            sortable: true,
          },
          {
            field: 'productName',
            title: '药品名称',
            minWidth: '200',
            sortable: true,
          },
        ],
      },
    },
    {
      id: 'child',
      queryUrl: '/orderAction/queryChild.do',
    },
  );

  // 父表
  const [ParentGrid, parentGridApi] = useSpdGrid(
    {
      formOptions: {
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
      },
      gridOptions: {
        stripe: false,
        proxyConfig: {
          autoLoad: true,
        },
      },
    },
    {
      id: 'parent',
      queryUrl: '/orderAction/query.do',
      gridColumns: [
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'orderNo',
          title: '申请单号',
          minWidth: '100',
          sortable: true,
        },
      ],
      childGridLinkKeys: ['orderId-id'],
      childGridApi: childGridApi,
    },
  );

  return {
    ParentGrid,
    parentGridApi,
    ChildGrid,
    childGridApi,
  };
}
```

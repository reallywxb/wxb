# useChcGrid 组件文档

## 组件概述

`useChcGrid` 是一个基于 Vue 3 Composition API 的自定义 Hook，用于快速生成具有完整功能的表格组件。它基于 `useChcCrud` 和 `useVbenVxeGrid` 进行二次封装，提供了丰富的表格功能，包括：

- 表格数据的自动加载与分页
- 表格搜索表单的自动生成
- 增删改查操作的集成
- 表格列的配置与管理
- 权限控制
- 表单验证
- 自定义导出功能

## 基本使用

```vue
<template>
  <div class="p-4">
    <VxeGrid
      v-bind="gridOptions"
      :toolbar="toolbarConfig"
      :menu-config="menuConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { useChcGrid } from '#/adapter/chc-ui';

const {
  gridOptions,
  toolbarConfig,
  menuConfig,
  refreshTable,
  setTableData,
  // 其他返回值...
} = useChcGrid(
  {
    // 表格配置
    gridOptions: {
      id: 'example-table',
      columns: [
        { field: 'id', title: 'ID', width: 100 },
        { field: 'name', title: '名称', width: 180 },
        { field: 'createTime', title: '创建时间', width: 180 },
        // 更多列配置...
      ],
      // 其他表格配置...
    },
    // 表单配置
    formOptions: {
      // 表单配置...
    },
  },
  {
    // 表单schema配置
    formSchema: [
      {
        field: 'name',
        label: '名称',
        component: 'Input',
        // 其他表单字段配置...
      },
      // 更多表单字段...
    ],
    // 其他chcOptions配置...
  },
  // 处理接口查询返参为统一格式的方法
  (res) => {
    return {
      list: res.data || [],
      pagination: {
        total: res.total || 0,
        pageSize: res.pageSize || 10,
        currentPage: res.currentPage || 1,
      },
    };
  },
  // 查询参数格式化方法
  (params) => {
    return {
      ...params,
      // 自定义参数处理...
    };
  },
);
</script>
```

## API 文档

### 函数签名

```typescript
const useChcGrid = function (
  options: VxeGridProps,
  chcOptions?: SchemaColumnAndOptions,
  handleTableDataFn?: (res: any) => TableData<any>, // 处理接口查询返参为统一格式的方法
  serachParamsFormat?: (params: any) => any, // 查询参数格式化方法
  defaultConfig?: SchemaColumnAndOptions,
  isFormAreaVertical?: boolean,
);
```

### 参数说明

| 参数 | 类型 | 说明 | 是否必填 |
| --- | --- | --- | --- |
| options | VxeGridProps | 表格和表单的基础配置 | 是 |
| chcOptions | SchemaColumnAndOptions | 表单schema和其他高级配置 | 否 |
| handleTableDataFn | (res: any) => TableData<any> | 处理接口返回数据为统一格式的方法 | 否 |
| serachParamsFormat | (params: any) => any | 查询参数格式化方法 | 否 |
| defaultConfig | SchemaColumnAndOptions | 默认配置 | 否 |
| isFormAreaVertical | boolean | 表格搜索区是否上下布局 | 否 |

### options 参数结构

| 属性        | 类型   | 说明                         |
| ----------- | ------ | ---------------------------- |
| gridOptions | object | 表格配置，参考 VxeTable 文档 |
| formOptions | object | 搜索表单配置                 |

### chcOptions 参数结构

| 属性              | 类型   | 说明             |
| ----------------- | ------ | ---------------- |
| formSchema        | array  | 搜索表单字段配置 |
| viewFormOptions   | object | 查看表单配置     |
| addFormOptions    | object | 新增表单配置     |
| editFormOptions   | object | 编辑表单配置     |
| commonFormOptions | object | 通用表单配置     |

### 返回值

| 返回值           | 类型     | 说明                              |
| ---------------- | -------- | --------------------------------- |
| gridOptions      | object   | 表格配置，直接传递给 VxeGrid 组件 |
| toolbarConfig    | object   | 工具栏配置                        |
| menuConfig       | object   | 菜单配置                          |
| refreshTable     | function | 刷新表格数据                      |
| setTableData     | function | 设置表格数据                      |
| getTableData     | function | 获取表格数据                      |
| getFormData      | function | 获取表单数据                      |
| setFormData      | function | 设置表单数据                      |
| resetForm        | function | 重置表单                          |
| validate         | function | 验证表单                          |
| openModal        | function | 打开模态框                        |
| closeModal       | function | 关闭模态框                        |
| openDrawer       | function | 打开抽屉                          |
| closeDrawer      | function | 关闭抽屉                          |
| // 其他返回值... |          |                                   |

## 内部处理逻辑

1. **配置合并**：

   - 合并默认的表单配置 `formDefaultOptions` 和用户提供的 `options.formOptions`
   - 合并默认的表格配置 `gridDefaultOptions` 和用户提供的 `options.gridOptions`

2. **表单折叠逻辑**：

   - 如果 `options.formOptions?.showCollapseButton` 未定义，根据 `chcOptions?.formSchema` 的长度自动判断是否显示折叠按钮
   - 当表单项数量大于4时，显示折叠按钮

3. **表单处理**：

   - 处理 `formSchema` 中的每个字段，为其添加 `componentProps`（如果不存在）
   - 对 `componentProps` 进行包装，添加修改一些属性

4. **视图表单处理**：

   - 如果没有提供 `viewFormOptions`，则使用 `commonFormOptions` 生成
   - 为 `viewFormOptions` 添加包装类名，用于select的下拉弹窗定位
   - 对 `viewFormOptions` 中的字段进行处理，设置 `disabled: true`

5. **新增表单处理**：

   - 为 `addFormOptions` 添加包装类名，用于select的下拉弹窗定位
   - 对 `addFormOptions` 中的字段进行处理

6. **编辑表单处理**：

   - 为 `editFormOptions` 添加包装类名，用于select的下拉弹窗定位
   - 对 `editFormOptions` 中的字段进行处理

7. **通用表单处理**：

   - 为 `commonFormOptions` 添加包装类名，用于select的下拉弹窗定位
   - 对 `commonFormOptions` 中的字段进行处理

8. **生成表格组件**：
   - 调用 `useChcCrud` 生成拥有自动接口调用能力的表格组件
   - 传递必要的参数，如 `useVbenVxeGrid`、`crudApis`、`namespace`、`hasAccessByCodes` 等
   - 返回 `chcCrud.useChcGrid(options, chcOptions)` 的结果

## 配置选项

### formOptions 配置

| 属性               | 类型    | 说明                 | 默认值                 |
| ------------------ | ------- | -------------------- | ---------------------- |
| showCollapseButton | boolean | 是否显示表单折叠按钮 | 根据表单项数量自动判断 |
| // 其他表单配置... |         |                      |                        |

### gridOptions 配置

参考 VxeTable 官方文档的配置选项。

### formSchema 配置

| 属性           | 类型            | 说明     |
| -------------- | --------------- | -------- |
| field          | string          | 字段名   |
| label          | string          | 标签名   |
| component      | string          | 组件类型 |
| componentProps | object/function | 组件属性 |
| // 其他配置... |                 |          |

## 方法说明

### refreshTable()

刷新表格数据，重新从接口获取数据。

### setTableData(data)

手动设置表格数据。

**参数**：

- `data`：表格数据，格式为 `{ list: [], pagination: {} }`

### getTableData()

获取当前表格数据。

### getFormData()

获取当前表单数据。

### setFormData(data)

设置表单数据。

**参数**：

- `data`：表单数据对象

### resetForm()

重置表单数据。

### validate()

验证表单数据。

### openModal(type, data)

打开模态框。

**参数**：

- `type`：模态框类型，如 'add'、'edit'、'view'
- `data`：模态框数据

### closeModal()

关闭模态框。

### openDrawer(type, data)

打开抽屉。

**参数**：

- `type`：抽屉类型，如 'add'、'edit'、'view'
- `data`：抽屉数据

### closeDrawer()

关闭抽屉。

## 完整示例

```vue
<template>
  <div class="p-4">
    <VxeGrid
      v-bind="gridOptions"
      :toolbar="toolbarConfig"
      :menu-config="menuConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { useChcGrid } from '#/adapter/chc-ui';

const {
  gridOptions,
  toolbarConfig,
  menuConfig,
  refreshTable,
  setTableData,
  getTableData,
  getFormData,
  setFormData,
  resetForm,
  validate,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
} = useChcGrid(
  {
    gridOptions: {
      id: 'user-table',
      columns: [
        {
          field: 'id',
          title: 'ID',
          width: 100,
        },
        {
          field: 'name',
          title: '名称',
          width: 180,
        },
        {
          field: 'email',
          title: '邮箱',
          width: 200,
        },
        {
          field: 'createTime',
          title: '创建时间',
          width: 180,
          formatter: 'date',
        },
        {
          field: 'status',
          title: '状态',
          width: 100,
          formatter: (cellValue) => {
            return cellValue === 1 ? '启用' : '禁用';
          },
        },
        {
          title: '操作',
          width: 150,
          fixed: 'right',
          slots: {
            default: 'tableAction',
          },
        },
      ],
      border: true,
      showHeaderOverflow: true,
      showOverflow: true,
    },
    formOptions: {
      labelWidth: 100,
    },
  },
  {
    formSchema: [
      {
        field: 'name',
        label: '名称',
        component: 'Input',
        componentProps: {
          placeholder: '请输入名称',
        },
      },
      {
        field: 'email',
        label: '邮箱',
        component: 'Input',
        componentProps: {
          placeholder: '请输入邮箱',
        },
      },
      {
        field: 'status',
        label: '状态',
        component: 'Select',
        componentProps: {
          placeholder: '请选择状态',
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ],
        },
      },
    ],
    addFormOptions: {
      title: '新增用户',
      schema: [
        {
          field: 'name',
          label: '名称',
          component: 'Input',
          required: true,
          componentProps: {
            placeholder: '请输入名称',
          },
        },
        {
          field: 'email',
          label: '邮箱',
          component: 'Input',
          required: true,
          componentProps: {
            placeholder: '请输入邮箱',
          },
        },
        {
          field: 'status',
          label: '状态',
          component: 'Select',
          required: true,
          componentProps: {
            placeholder: '请选择状态',
            options: [
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 },
            ],
          },
        },
      ],
    },
    editFormOptions: {
      title: '编辑用户',
      schema: [
        {
          field: 'name',
          label: '名称',
          component: 'Input',
          required: true,
          componentProps: {
            placeholder: '请输入名称',
          },
        },
        {
          field: 'email',
          label: '邮箱',
          component: 'Input',
          required: true,
          componentProps: {
            placeholder: '请输入邮箱',
          },
        },
        {
          field: 'status',
          label: '状态',
          component: 'Select',
          required: true,
          componentProps: {
            placeholder: '请选择状态',
            options: [
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 },
            ],
          },
        },
      ],
    },
    viewFormOptions: {
      title: '查看用户',
      schema: [
        {
          field: 'name',
          label: '名称',
          component: 'Input',
        },
        {
          field: 'email',
          label: '邮箱',
          component: 'Input',
        },
        {
          field: 'status',
          label: '状态',
          component: 'Input',
        },
        {
          field: 'createTime',
          label: '创建时间',
          component: 'Input',
        },
      ],
    },
  },
  (res) => {
    return {
      list: res.data || [],
      pagination: {
        total: res.total || 0,
        pageSize: res.pageSize || 10,
        currentPage: res.currentPage || 1,
      },
    };
  },
  (params) => {
    return {
      ...params,
      // 可以在这里对查询参数进行自定义处理
    };
  },
);
</script>

<template #tableAction="{ row }">
  <a-button size="small" @click="openModal('view', row)"> 查看 </a-button>
  <a-button size="small" type="primary" @click="openModal('edit', row)">
    编辑
  </a-button>
  <a-button size="small" type="danger"> 删除 </a-button>
</template>
```

## 注意事项

1. **表单配置**：

   - 当 `formOptions` 中未设置 `showCollapseButton` 时，会根据 `formSchema` 的长度自动判断是否显示折叠按钮
   - 当表单项数量大于4时，会自动显示折叠按钮

2. **表单字段处理**：

   - 所有表单字段的 `componentProps` 会被自动包装，添加一些默认属性
   - 对于 `viewFormOptions`，所有字段会被自动设置为 `disabled: true`

3. **下拉弹窗定位**：

   - 为了确保下拉弹窗在有滚动条的表单内正确定位，会自动为表单添加包装类名
   - 推荐使用 `popupContainerClass` 属性来指定容器类名，而不是使用 `id` 属性（`id` 属性未来可能有其他用途）

4. **接口数据处理**：

   - 通过 `handleTableDataFn` 可以将接口返回的数据格式化为统一的格式
   - 通过 `serachParamsFormat` 可以对查询参数进行自定义处理

5. **默认配置**：
   - 如果未提供 `defaultConfig`，会使用默认配置 `{ autoLoadColumnConfig: true }`
   - 如果未提供 `isFormAreaVertical`，会使用全局配置 `IS_FORM_AREA_VERTICAL`

## 常见问题

### 1. 下拉弹窗位置不正确

**解决方案**：

- 在表单配置中添加 `popupContainerClass` 属性，指定容器类名
- 确保表单容器有固定的高度和滚动条

### 2. 表格数据格式不正确

**解决方案**：

- 使用 `handleTableDataFn` 方法将接口返回的数据格式化为统一的格式
- 确保返回的数据包含 `list` 和 `pagination` 两个属性

### 3. 查询参数需要特殊处理

**解决方案**：

- 使用 `serachParamsFormat` 方法对查询参数进行自定义处理
- 在该方法中可以添加、修改或删除查询参数

### 4. 表单验证不生效

**解决方案**：

- 在表单字段配置中添加 `required: true` 属性
- 可以添加 `rules` 属性来定义更复杂的验证规则
- 调用 `validate` 方法手动触发验证

## 总结

`useChcGrid` 是一个功能强大的表格生成 Hook，它封装了表格的常见功能，使得开发者可以更专注于业务逻辑的实现。通过合理配置 `options` 和 `chcOptions`，可以快速生成具有完整功能的表格组件，提高开发效率。

同时，`useChcGrid` 也提供了丰富的自定义选项，可以根据具体业务需求进行灵活配置。无论是简单的表格展示，还是复杂的增删改查操作，`useChcGrid` 都能满足需求。

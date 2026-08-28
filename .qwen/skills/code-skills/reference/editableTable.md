# EditableTable 组件技术开发文档

## 概述

EditableTable 是一个基于 VxeTable 封装的高性能可编辑表格组件，支持行内编辑、虚拟滚动、多种保存模式、批量操作等功能。

---

## API 总览

### Props 列表

| Prop 名称 | 类型 | 必填 | 默认值 | 说明 |
|-----------|------|------|--------|------|
| `id` | `string` | ✅ | - | 表格唯一标识符，用于列配置持久化 |
| `gridColumns` | `VxeGridProps['columns']` | ✅ | - | 表格列配置，定义所有列的显示和编辑行为 |
| `viewType` | `'add' \| 'edit' \| 'view'` | ❌ | `'add'` | 表格视图模式：add(新增)、edit(编辑)、view(查看) |
| `saveMode` | `'autoSaveRow' \| 'manualTotalSave'` | ❌ | `'autoSaveRow'` | 保存模式：自动行保存或手动整体保存 |
| `blackListField` | `string` | ❌ | `'productCode'` | 黑名单字段名，防止重复添加相同数据 |
| `gridOptions` | `Omit<VxeGridProps, 'columns' \| 'data'>` | ❌ | `{}` | 覆盖默认表格配置，如虚拟滚动、列拖拽等 |
| `formSchema` | `VbenFormProps['schema']` | ❌ | `[]` | 表头表单配置，用于搜索筛选 |
| `formOptions` | `VbenFormProps` | ❌ | `{}` | 表头表单自定义配置 |
| `singleSelectProps` | `ChcSelectOption` | ❌ | `{}` | 单选下拉组件属性覆盖 |
| `slotsConfig` | `SlotsConfig` | ❌ | `{}` | 插槽配置，控制各区域显示 |
| `saveRow` | `(row: any, scope?: any) => Promise<any>` | 条件必填 | - | 行保存方法（autoSaveRow模式必填） |
| `deleteRows` | `(rows: any[], scope?: any) => Promise<any>` | 条件必填 | - | 删除行方法（autoSaveRow模式必填） |
| `totalSave` | `(wholeData: {created, update, removed}) => Promise<any>` | ❌ | - | 整体保存方法（manualTotalSave模式使用） |
| `totalSubmit` | `(wholeData: {created, update, removed}) => Promise<any>` | ❌ | - | 整体提交方法 |
| `rowDataValidate` | `(row?: any, scope?: any) => Promise<boolean>` | ❌ | - | 行数据前端校验方法 |
| `validateIfCanAddRow` | `(val?: any, option?: any) => Promise<boolean>` | ❌ | - | 校验当前是否可以添加行 |
| `getFinalAddRowData` | `(option: any, formVal: any) => Promise<any>` | ❌ | - | 获取最终添加行数据，用于补充接口数据 |
| `handleSingleChoose` | `(val?: any, option?: any) => Promise<boolean>` | ❌ | - | 单选下拉选择时的回调，可截断默认新增逻辑 |
| `handleSearch` | `(val: string) => void` | ❌ | - | 自定义搜索处理方法 |
| `searchCheckedValidate` | `(row: any) => boolean` | ❌ | - | 搜索后校验行是否应该被选中 |
| `openBatchAddModal` | `() => void` | ❌ | - | 打开批量新增弹窗的自定义方法 |
| `batchAddModalFormOptions` | `VbenFormProps` | ❌ | - | 批量新增弹窗内的表单配置 |
| `batchAddModalGridOptions` | `SchemaColumnAndOptions` | ❌ | - | 批量新增弹窗内的表格配置 |
| `openLogModal` | `(row: any) => void` | ❌ | - | 打开操作记录弹窗的自定义方法 |
| `queryActionLogParams` | `(row: any) => {Record_ID: string; AD_Table_ID: number}` | ❌ | - | 获取操作记录查询参数 |

**必填说明**：
- ✅ 表示必填
- ❌ 表示可选
- **条件必填**表示在特定条件下必填

---

### Expose 方法列表

| 名称 | 类型 | 说明 |
|------|------|------|
| `formApi` | `ExtendedFormApi` | 获取表头表单 API，用于操作表头表单 |
| `gridApi` | `VxeGridApi` | 获取表格 API，用于操作表格数据 |
| `chcSelectRef` | `ChcSelect` | 获取顶部下拉组件引用，可操作下拉组件 |
| `blackList` | `string[]` | 获取当前黑名单数组，存储已添加的商品编码等 |
| `editFieldArr` | `string[]` | 获取可编辑字段数组，用于键盘导航 |
| `gridData` | `any[]` | 获取当前表格数据，包含所有行数据 |
| `showLoading` | `boolean` | 显示/隐藏加载状态，可读写 |
| `batchAddRef` | `Component` | 获取批量添加组件引用 |
| `initRows` | `(rows: any[]) => void` | 初始化表格数据，用于加载初始行 |
| `handleBatchChoose` | `(records: any[]) => void` | 批量选择数据添加到表格 |
| `handleDeleteRow` | `(scope: any) => void` | 删除指定行，支持单条删除 |
| `handleBatchDel` | `() => void` | 批量删除选中行（需先勾选复选框） |
| `viewLog` | `(scope: any) => void` | 查看指定行的操作记录 |
| `insertRow` | `(row: any, indexOrRow?: number \| any, cb?: Function) => void` | 在指定位置插入行，支持在指定行之前插入 |
| `handleChoose` | `(val: any, option?: any) => Promise<void>` | 手动触发单选选择逻辑，用于编程式添加行 |
| `generateUUID` | `() => string` | 生成 UUID 字符串，用于生成行唯一标识 |

---

### Events 事件列表

| 事件名 | 参数 | 说明 | 触发时机 |
|--------|------|------|----------|
| `editActivated` | `scope` - 表格作用域对象 | 行进入编辑状态 | 用户点击可编辑单元格或调用 setEditRow 时 |
| `editClose` | `scope` - 表格作用域对象 | 行退出编辑状态 | 编辑完成、保存或取消编辑时 |
| `blackListChange` | `blackList` - 当前黑名单数组 | 黑名单数据变化 | 添加或删除行时 |
| `gridDataChange` | `gridData` - 当前表格数据数组 | 表格数据变化 | 增删改行数据时 |

---

### Slots 插槽列表

| 插槽名 | 参数 | 说明 | 使用场景 |
|--------|------|------|----------|
| `action` | `scope` - 表格作用域对象 | 自定义行操作列内容 | 自定义删除按钮、添加操作按钮 |
| `toolbar-actions` | `scope` - 表格作用域对象 | 自定义工具栏左侧区域 | 添加自定义功能按钮 |
| `toolbar-tools` | `scope` - 表格作用域对象 | 自定义工具栏右侧区域 | 添加导出、打印等工具 |
| `bottom` | `scope` - 表格作用域对象 | 自定义底部区域 | 添加统计信息、分页等 |
| `empty` | - | 自定义空数据状态 | 自定义无数据时的展示 |

---

## Props 详细说明与示例

### id

**功能**：表格唯一标识符，用于列配置持久化存储。

**说明**：
- 每个 EditableTable 实例必须有唯一的 ID
- 列宽、列顺序、列可见性的配置会基于该 ID 持久化到服务器
- 建议格式：`模块名-表格用途-年月`，如 `order-detail-2024`

**示例**：
```vue
<EditableTable id="order-detail-table" />
```

---

### gridColumns

**功能**：定义表格的所有列配置，是最核心的配置项。

**说明**：
- 支持 VxeTable 的所有列配置属性
- 通过 `editRender` 配置可编辑列的编辑组件
- 通过 `slots` 配置自定义列渲染

**示例**：
```vue
<EditableTable
  :gridColumns="[
    { field: 'productCode', title: '药品编码', width: 120 },
    { 
      field: 'productName', 
      title: '药品名称', 
      width: 200,
      editRender: { name: 'ChcInput' }
    },
    {
      field: 'qtyPlaned',
      title: '数量',
      editRender: { 
        name: 'ChcInputNumber',
        props: { min: 0 }
      }
    }
  ]"
/>
```

---

### viewType

**功能**：控制表格的视图模式，决定显示哪些操作按钮。

**可选值**：
- `add`: 新增模式，显示新增、删除、保存、提交等按钮
- `edit`: 编辑模式，允许编辑已有数据
- `view`: 查看模式，只读，显示操作记录按钮

**示例**：
```vue
<EditableTable viewType="edit" />
```

---

### saveMode

**功能**：控制数据保存的时机和方式。

**可选值**：
- `autoSaveRow`: 自动行保存，编辑完成后自动调用保存接口
- `manualTotalSave`: 手动整体保存，所有编辑后统一提交

**示例**：
```vue
<EditableTable saveMode="manualTotalSave" />
```

---

### saveRow / deleteRows

**功能**：在 `autoSaveRow` 模式下必须提供的行保存和删除方法。

**示例**：
```vue
<EditableTable
  saveMode="autoSaveRow"
  :saveRow="async (row) => {
    const res = await api.saveRow(row);
    return res.data; // 返回最终行数据
  }"
  :deleteRows="async (rows) => {
    await api.deleteRows(rows.map(r => r.id));
  }"
/>
```

---

### totalSave / totalSubmit

**功能**：在 `manualTotalSave` 模式下使用的整体保存和提交方法。

**参数**：`wholeData` 包含三类数据：
- `created`: 新增的行
- `update`: 更新的行
- `removed`: 删除的行

**示例**：
```vue
<EditableTable
  saveMode="manualTotalSave"
  :totalSave="async ({ created, update, removed }) => {
    await api.batchSave({ created, update, removed });
  }"
  :totalSubmit="async ({ created, update, removed }) => {
    await api.batchSubmit({ created, update, removed });
  }"
/>
```

---

### validateIfCanAddRow

**功能**：校验当前是否可以添加行，用于前置条件校验。

**使用场景**：必须先选择某些表单项才能添加行

**示例**：
```vue
<EditableTable
  :validateIfCanAddRow="async () => {
    const formVal = await formApi.getValues();
    if (!formVal.supplierId) {
      message.error('请先选择供应商');
      return false;
    }
    return true;
  }"
/>
```

---

### getFinalAddRowData

**功能**：根据用户选择的数据，获取最终要添加到表格的行数据。

**使用场景**：需要调用接口获取商品的库存、价格等额外信息

**示例**：
```vue
<EditableTable
  :getFinalAddRowData="async (option, formVal) => {
    const res = await api.getProductDetail(option.productCode);
    return {
      ...option,
      ...res.data,
      dateOrdered: formVal.dateFrom
    };
  }"
/>
```

---

### rowDataValidate

**功能**：前端校验行数据，在保存前执行。

**返回值**：`Promise<boolean>`，`true`表示校验通过

**示例**：
```vue
<EditableTable
  :rowDataValidate="async (row) => {
    if (!row.productCode) {
      message.error('药品编码不能为空');
      return false;
    }
    if (row.qtyPlaned <= 0) {
      message.error('数量必须大于零');
      return false;
    }
    return true;
  }"
/>
```

---

### gridOptions

**功能**：覆盖默认表格配置，支持 VxeTable 的所有配置项。

**常用配置**：
- `height`: 表格高度
- `checkboxConfig`: 复选框配置
- `toolbarConfig`: 工具栏配置

**示例**：
```vue
<EditableTable
  :gridOptions="{
    height: 600,
    checkboxConfig: { trigger: 'row' },
    toolbarConfig: { zoom: true, custom: true }
  }"
/>
```

---

### singleSelectProps

**功能**：覆盖顶部单选下拉组件的默认属性。

**示例**：
```vue
<EditableTable
  :singleSelectProps="{
    dictUrl: '/custom/product/query.do',
    pageSize: 50,
    extraParams: { warehouseId: '123' }
  }"
/>
```

---

### slotsConfig

**功能**：配置各区域插槽的显示和自定义。

**类型**：`SlotsConfig`

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showSingleSelect` | `boolean` | `true` | 是否显示单选下拉 |
| `showBatchAddBtn` | `boolean` | `true` | 是否显示批量新增按钮 |
| `showBatchDelBtn` | `boolean` | `true` | 是否显示批量删除按钮 |
| `showSearchArea` | `boolean` | `true` | 是否显示搜索区域 |
| `toolbarActionsLeft` | `string` | - | 工具栏左侧插槽名 |
| `toolbarActionsRight` | `string` | - | 工具栏右侧插槽名 |
| `actionLeft` | `string` | - | 操作列左侧插槽名 |
| `actionRight` | `string` | - | 操作列右侧插槽名 |

**示例**：
```vue
<EditableTable
  :slotsConfig="{
    showSingleSelect: false,
    showBatchAddBtn: true,
    toolbarActionsLeft: 'custom-toolbar-left'
  }"
>
  <template #custom-toolbar-left>
    <Button>自定义按钮</Button>
  </template>
</EditableTable>
```

---

## Expose 详细说明与示例

### formApi

用于操作表头表单的 API，支持以下常用方法：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `getValues` | - | `Promise<Record<string, any>>` | 获取表单所有字段值 |
| `setValues` | `values: Record<string, any>` | `Promise<void>` | 设置表单字段值 |
| `setFieldValue` | `fieldName: string, value: any` | `Promise<void>` | 设置单个字段值 |
| `updateSchema` | `schema: FormSchema[]` | `void` | 动态更新表单配置 |
| `validate` | - | `Promise<boolean>` | 校验表单数据 |
| `resetForm` | - | `Promise<void>` | 重置表单 |

**示例**：
```typescript
// 获取表单值
const formData = await tableRef.value.formApi.getValues();

// 设置字段值
await tableRef.value.formApi.setFieldValue('warehouseId', '123');

// 禁用某个字段
tableRef.value.formApi.updateSchema([{
  fieldName: 'warehouseId',
  componentProps: { disabled: true }
}]);
```

---

### gridApi

表格核心 API，支持 VxeTable 的所有方法：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `getCheckboxRecords` | - | `any[]` | 获取勾选的数据 |
| `setCheckboxRow` | `row: any, checked: boolean` | `void` | 设置行勾选状态 |
| `scrollToRow` | `row: any` | `Promise<void>` | 滚动到指定行 |
| `setEditRow` | `row: any, field?: string \| boolean` | `Promise<void>` | 设置行编辑状态 |
| `clearEdit` | - | `Promise<void>` | 清除编辑状态 |
| `isEditByRow` | `row: any` | `boolean` | 判断行是否处于编辑状态 |
| `createRow` | `record: any` | `Promise<any>` | 创建新行（不添加到表格） |
| `getTableData` | - | `any[]` | 获取表格完整数据 |
| `refreshColumn` | - | `void` | 刷新列配置 |

**示例**：
```typescript
// 获取选中行
const checkedRows = tableRef.value.gridApi.getCheckboxRecords();

// 滚动到指定行
await tableRef.value.gridApi.scrollToRow(row);

// 设置行编辑状态
await tableRef.value.gridApi.setEditRow(row, true);

// 判断行是否在编辑状态
const isEditing = tableRef.value.gridApi.isEditByRow(row);
```

---

### initRows

**功能**：初始化表格数据，用于加载初始行。

**示例**：
```typescript
// 初始化数据
tableRef.value.initRows([
  { id: 1, productCode: 'P001', productName: '药品A' },
  { id: 2, productCode: 'P002', productName: '药品B' }
]);
```

---

### insertRow

在指定位置插入新行。

**参数说明**：
- `row`: 要插入的行数据对象
- `indexOrRow`: 
  - `number` 类型：插入位置的索引，0表示第一行，-1表示末尾
  - `object` 类型：参考行对象，新行将插入到该参考行之前
- `cb`: 插入成功后的回调函数，参数为新行对象

**示例**：
```typescript
// 在表格开头插入行
tableRef.value.insertRow({ productCode: 'P001', productName: '药品A' }, 0);

// 在表格末尾插入行
tableRef.value.insertRow({ productCode: 'P002', productName: '药品B' }, -1);

// 在特定行之前插入
tableRef.value.insertRow(
  { productCode: 'P003', productName: '药品C' },
  existingRow,  // 在existingRow之前插入
  (newRow) => {
    console.log('插入成功，新行数据:', newRow);
  }
);
```

---

### handleChoose

手动触发单选选择逻辑，用于编程式添加行。

**参数说明**：
- `val`: 选择值（如商品编码）
- `option`: 选择项的完整数据对象

**示例**：
```typescript
// 手动添加商品
tableRef.value.handleChoose('P001', {
  productCode: 'P001',
  productName: '药品A',
  price: 100
});
```

**注意**：该方法会触发 `validateIfCanAddRow` 和 `getFinalAddRowData` 等回调。

---

### handleDeleteRow

**功能**：删除指定行，支持单条删除。

**示例**：
```typescript
// 删除指定行
tableRef.value.handleDeleteRow({ 
  row: rowData, 
  $grid: tableRef.value.gridApi 
});
```

---

### handleBatchDel

**功能**：批量删除选中行（需先勾选复选框）。

**示例**：
```typescript
// 批量删除
tableRef.value.handleBatchDel();
```

---

### viewLog

**功能**：查看指定行的操作记录。

**示例**：
```typescript
// 查看操作记录
tableRef.value.viewLog({ row: rowData });
```

---

### handleBatchChoose

**功能**：批量选择数据添加到表格。

**示例**：
```typescript
// 批量添加选择的记录
tableRef.value.handleBatchChoose(records);
```

---

### 其他 Expose 属性

**示例**：
```typescript
// 获取黑名单
const blacklist = tableRef.value.blackList;
// ['P001', 'P002']

// 获取可编辑字段
console.log(tableRef.value.editFieldArr);
// ['productName', 'quantity', 'price']

// 获取表格数据
const data = tableRef.value.gridData;

// 显示/隐藏加载状态
tableRef.value.showLoading = true;

// 获取顶部下拉组件引用
const selectRef = tableRef.value.chcSelectRef;
selectRef.focus();

// 获取批量添加组件引用
const batchAdd = tableRef.value.batchAddRef;

// 生成UUID
const uuid = tableRef.value.generateUUID();
```

---

## Events 详细说明与示例

### editActivated

**说明**：行进入编辑状态时触发，可在此更新行内组件的查询参数。

**示例**：
```vue
<EditableTable 
  @edit-activated="(scope) => {
    // 更新供应商下拉查询参数
    vendorParams.value.productId = scope.row.productId;
  }" 
/>
```

---

### editClose

**说明**：行退出编辑状态时触发，自动保存模式下会在此调用 saveRow。

**示例**：
```vue
<EditableTable 
  @edit-close="(scope) => {
    console.log('编辑结束:', scope.row);
  }" 
/>
```

---

### blackListChange

**说明**：黑名单变化时触发，可用于联动禁用表单项等操作。

**示例**：
```vue
<EditableTable 
  @blackListChange="(list) => {
    // 有数据时禁用仓库选择
    formApi.updateSchema([{
      fieldName: 'warehouseId',
      componentProps: { disabled: list.length > 0 }
    }]);
  }" 
/>
```

---

### gridDataChange

**说明**：表格数据变化时触发。

**示例**：
```vue
<EditableTable 
  @gridDataChange="(data) => {
    console.log('表格数据变化:', data.length);
  }" 
/>
```

---

## Slots 详细说明与示例

### action

**说明**：自定义行操作列，覆盖默认的"删行"和"操作记录"按钮。

**示例**：
```vue
<EditableTable>
  <template #action="scope">
    <Button @click="customAction(scope.row)">自定义操作</Button>
    <Button @click="handleDeleteRow(scope)">删除</Button>
  </template>
</EditableTable>
```

---

### toolbar-actions

**说明**：自定义工具栏左侧区域，与单选下拉、批量添加按钮并列。

**示例**：
```vue
<EditableTable>
  <template #toolbar-actions="scope">
    <Button>导入Excel</Button>
    <Button>导出模板</Button>
  </template>
</EditableTable>
```

---

### toolbar-tools

**说明**：自定义工具栏右侧区域，与搜索框并列。

**示例**：
```vue
<EditableTable>
  <template #toolbar-tools="scope">
    <Button>导出Excel</Button>
    <Button>打印</Button>
  </template>
</EditableTable>
```

---

### bottom

**说明**：自定义底部区域。

**示例**：
```vue
<EditableTable>
  <template #bottom="scope">
    <div class="flex justify-between p-4">
      <span>共 {{ scope.data.length }} 条数据</span>
      <span>合计金额: {{ totalAmount }}</span>
    </div>
  </template>
</EditableTable>
```

---

### empty

**说明**：自定义空数据状态。

**示例**：
```vue
<EditableTable>
  <template #empty>
    <div class="text-center">
      <EmptyIcon />
      <p>暂无数据，请点击上方按钮添加</p>
    </div>
  </template>
</EditableTable>
```

---

## 数据状态说明

表格行数据包含以下内部状态字段：

### $status
- **类型**: `'saved' | 'insert' | 'error'`
- **说明**:
  - `saved`: 已保存状态，背景色白色
  - `insert`: 新增状态，背景色浅绿色 (#CEFFE4)
  - `error`: 错误状态，背景色浅红色 (#FFE2E2)
  - 正在编辑的行背景色为浅蓝色 (#E0FFFC)

### $uuid
- **类型**: `string`
- **说明**: 行唯一标识，自动生成

### loading
- **类型**: `boolean`
- **说明**: 行加载状态

---

## 保存模式详解

### autoSaveRow 模式
**适用场景**: 需要实时保存每次编辑的场景

**工作流程**:
1. 用户编辑行数据
2. 退出编辑时自动调用 `saveRow` 方法
3. 保存成功后更新行数据状态为 `saved`
4. 保存失败则标记为 `error` 状态

**代码示例**:
```vue
<EditableTable
  saveMode="autoSaveRow"
  :saveRow="async (row) => {
    const res = await api.updateRow(row);
    if (res.success) {
      message.success('保存成功');
      return res.data;
    }
    throw new Error(res.message);
  }"
  :deleteRows="async (rows) => {
    await api.deleteRows(rows.map(r => r.id));
  }"
/>
```

### manualTotalSave 模式
**适用场景**: 批量操作后统一提交的场景

**工作流程**:
1. 用户自由编辑、新增、删除行
2. 组件内部跟踪 `created`、`update`、`removed` 三类数据
3. 点击"保存"或"提交"按钮时调用 `totalSave` 或 `totalSubmit`

**代码示例**:
```vue
<EditableTable
  saveMode="manualTotalSave"
  :totalSave="async ({ created, update, removed }) => {
    // 批量保存
    if (created.length > 0) {
      await api.batchCreate(created);
    }
    if (update.length > 0) {
      await api.batchUpdate(update);
    }
    if (removed.length > 0) {
      await api.batchDelete(removed);
    }
    message.success('保存成功');
    // 刷新表格数据
    await refreshTable();
  }"
  :totalSubmit="async ({ created, update, removed }) => {
    // 批量提交（可能有额外业务逻辑）
    await api.batchSubmit({ created, update, removed });
    message.success('提交成功');
  }"
/>
```

---

## 键盘快捷键

### 表格编辑快捷键

| 快捷键 | 说明 | 触发场景 |
|--------|------|----------|
| `F2` | 进入编辑流程：编辑错误行 → 编辑新增行 → 打开下拉 | 全局 |
| `Ctrl + E` | 同 F2 | 全局 |
| `Ctrl + F` | 同 F2 | 全局 |
| `Delete` | 删除当前编辑行 | 当前有正在编辑的行 |
| `Enter` | 保存当前编辑行，继续下一行编辑 | 当前有正在编辑的行 |
| `Tab` | 在可编辑字段间循环切换（正向） | 当前有正在编辑的行 |
| `Shift + Tab` | 在可编辑字段间循环切换（反向） | 当前有正在编辑的行 |
| `Ctrl + ↑` (上箭头) | 切换到上一行编辑，循环切换 | 全局，支持在未编辑情况下直接进入编辑状态 |
| `Ctrl + ↓` (下箭头) | 切换到下一行编辑，循环切换 | 全局，支持在未编辑情况下直接进入编辑状态 |

**Ctrl + 上下箭头快捷键详细说明**：

该快捷键用于在表格行之间快速切换编辑状态，支持循环切换：

- **未编辑状态下**：
  - `Ctrl + ↑`：滚动到底部，编辑最后一行
  - `Ctrl + ↓`：滚动到顶部，编辑第一行

- **编辑状态下**：
  - `Ctrl + ↑`：
    - 若当前编辑的是第一行 → 切换到最后一行编辑（循环）
    - 若当前编辑的不是第一行 → 切换到上一行编辑
  - `Ctrl + ↓`：
    - 若当前编辑的是最后一行 → 切换到第一行编辑（循环）
    - 若当前编辑的不是最后一行 → 切换到下一行编辑

- **记忆功能**：切换编辑行时会保持当前聚焦的字段，新行编辑时自动聚焦到相同字段

### 下拉组件分页快捷键

| 快捷键 | 说明 | 适用场景 |
|--------|------|----------|
| `←` (左箭头) | 下拉分页切换到上一页 | 单个添加下拉组件、行编辑 ChcSelect 组件（支持分页时） |
| `→` (右箭头) | 下拉分页切换到下一页 | 单个添加下拉组件、行编辑 ChcSelect 组件（支持分页时） |

**说明**：
- 当下拉数据存在分页时（`paginate: true`），可通过左右方向键快速切换页码
- 适用于顶部单个添加商品的下拉组件以及表格行内的 ChcSelect 编辑组件
- 无需鼠标点击分页按钮，提升数据选择效率
- **注意**：行内编辑时，若下拉组件打开，左右箭头优先用于下拉分页切换，而非字段切换

**键盘快捷键触发逻辑说明**：

1. **编辑状态检测**：所有快捷键在触发前会检测当前是否有正在编辑的行
2. **状态切换**：
   - 有编辑行时：执行保存/删除/字段切换等操作
   - 无编辑行时：`Ctrl+上下箭头`可主动进入编辑状态
3. **自动保存模式**：`Enter` 和 `Delete` 会触发自动保存流程
4. **手动保存模式**：`Enter` 仅切换到下一行，不自动保存
5. **焦点记忆**：`Tab` 和 `Ctrl+上下箭头` 会保持当前字段焦点

---

## 列配置持久化

组件支持列宽、列顺序、列可见性的持久化存储。

**实现原理**:
- 通过 `id` prop 生成唯一存储键：`EditableTable-${location.pathname}`
- 调用 `saveDataTableColumnConfig` 保存配置
- 调用 `queryDataTableColumnConfig` 恢复配置

**示例**:
```vue
<EditableTable id="order-detail-2024" />
```

---

## 完整示例（采购计划单据明细）

以下示例展示了 EditableTable 在采购计划场景的完整使用：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table.js';
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';
import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { EditableTable } from '#/components/editableTable';
import { $t } from '#/locales';
import { handleAllPrice, handlePriceToFixedTwo, handlePrice } from '#/utils/util';
import { getOrderPlanStorage, queryOrderPlanLineInfo, saveDo, saveLine } from './api';

const route = useRoute();
const urlParams: any = route.meta?.urlParams || {};
const currentHandleRow = defineModel<any>('currentHandleRow', { required: true });
const detailConfig = defineModel<DetailInfo | undefined>('detailConfig');
const currentTab = defineModel<number>('currentTab', { required: true });

const editableTableRef = ref<InstanceType<typeof EditableTable>>();
const wareHouseOption = ref<any>({});
const vendorParams = ref({
  productId: '',
  isNoProtocolPo: wareHouseOption.value.isNoProtocolPo,
  isBPartnerProductControl: wareHouseOption.value.isBPartnerProductControl,
  noProtocolPricePoSource: 'M',
});

const selectParams = ref<{ [key: string]: any }>({
  replenishSource: 'P',
  warehouseId: currentHandleRow.value.warehouseId || undefined,
  bpartnerId: currentHandleRow.value.applyBPartnerId || undefined,
});

/**
 * 表格列配置
 */
const gridColumns = ref<VxeGridProps['columns']>([
  { type: 'checkbox', title: '', width: 40, align: 'center' },
  { title: '序号', type: 'seq', width: 40, align: 'center', sortable: true },
  {
    field: 'productCode',
    minWidth: 100,
    title: $t('purchasePlan.buyPlan.productCode'),
    align: 'center',
    sortable: true,
  },
  {
    field: 'productName',
    minWidth: 160,
    title: $t('purchasePlan.buyPlan.productName1'),
    sortable: true,
  },
  {
    field: 'productSpec',
    minWidth: 60,
    title: $t('purchasePlan.buyPlan.productSpec'),
    sortable: true,
  },
  {
    field: 'uomName',
    minWidth: 60,
    title: $t('purchasePlan.buyPlan.uomName'),
    sortable: true,
  },
  {
    field: 'qtyPlaned',
    minWidth: 90,
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
        onChange(_: any, scope: any) {
          const currentRow = scope.row;
          if (currentRow.isGift === 'Y') {
            currentRow.lineAmt = 0;
          } else {
            currentRow.lineAmt = handleAllPrice(currentRow.price, currentRow.qtyPlaned);
          }
        },
      },
    },
    title: $t('purchasePlan.buyPlan.qtyPlaned'),
    sortable: true,
    align: 'right',
  },
  {
    field: 'price',
    minWidth: 90,
    title: $t('purchasePlan.buyPlan.price'),
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.price);
    },
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
        onChange(_: any, scope: any) {
          const currentRow = scope.row;
          if (currentRow.isGift === 'Y') {
            currentRow.lineAmt = 0;
          } else {
            currentRow.lineAmt = handleAllPrice(currentRow.price, currentRow.qtyPlaned);
          }
        },
      },
    },
    sortable: true,
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 80,
    title: $t('purchasePlan.buyPlan.lineAmt'),
    sortable: true,
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.lineAmt);
    },
    align: 'right',
  },
  {
    field: 'vendorId',
    minWidth: 180,
    title: $t('purchasePlan.buyPlan.vendorId'),
    sortable: true,
    formatter: ({ row }: any) => {
      return row.vendorName;
    },
    editRender: {
      name: 'ChcSelect',
      props: {
        dictUrl: '/orderPlanAction/productVendor.do',
        extraParams: vendorParams.value,
        onChange(val: any, option: any, scope: any) {
          scope.row.vendorId = val;
          scope.row.vendorName = option.label;
        },
        getPopupContainer: () =>
          document.querySelector('.buyPlanEditable .vxe-table--main-wrapper'),
        labelField: 'name',
        valueField: 'id',
        afterFetch(data: any) {
          return data.rows;
        },
      },
    },
  },
  {
    field: 'isGift',
    minWidth: 90,
    title: `是否${$t('purchasePlan.buyPlan.isGift')}`,
    sortable: true,
    editRender: {
      name: 'ChcSelect',
      props: {
        getPopupContainer: () =>
          document.querySelector('.buyPlanEditable .vxe-table--main-wrapper'),
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' },
        ],
        onChange(val: any, _: any, scope: any) {
          scope.row.isGift = val;
          const currentRow = scope.row;
          if (currentRow && currentRow.isGift === 'Y') {
            currentRow.lineAmt = 0;
          } else {
            currentRow.price = currentRow.price || currentRow.pricePo || currentRow.pricePO;
            const priceObj = handlePrice(currentRow.price);
            currentRow.lineAmt =
              priceObj.numberCountAfterDot > 0
                ? (priceObj.val * 10 ** priceObj.numberCountAfterDot *
                    handlePrice(currentRow.qtyPlaned).val) /
                  10 ** priceObj.numberCountAfterDot
                : handlePrice(currentRow.qtyPlaned).val * priceObj.val;
          }
        },
      },
    },
    formatter: ({ row }: any) => {
      return row.isGift === 'Y' ? '是' : '否';
    },
  },
  {
    field: 'manufacturer',
    minWidth: 120,
    title: $t('purchasePlan.buyPlan.manufacturer'),
    sortable: true,
  },
  {
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: '操作',
    width: detailConfig.value?.type === 'view' ? 90 : 85,
  },
]);

/**
 * 表头表单配置
 */
const formSchema: VbenFormProps['schema'] = [
  {
    component: 'Input',
    fieldName: 'orderPlanNo',
    componentProps: () => {
      return { disabled: true };
    },
    defaultValue: currentHandleRow.value?.orderPlanNo || undefined,
    label: $t('purchasePlan.buyPlan.orderNo'),
    formItemClass: 'pb-2',
  },
  {
    component: 'DatePicker',
    fieldName: 'deliveryPlanDate',
    label: $t('purchasePlan.buyPlan.deliveryPlanDate'),
    componentProps: () => {
      return {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DD HH:mm',
        disabled: detailConfig.value?.type === 'view',
      };
    },
    defaultValue:
      detailConfig.value?.type === 'add'
        ? dayjs(dayjs().format('YYYY-MM-DD'))
            .add(1, 'day')
            .add(10, 'hour')
            .format('YYYY-MM-DD HH:mm')
        : currentHandleRow.value.deliveryPlanDate,
    formItemClass: 'pb-2',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      autoChooseFirstOption: detailConfig.value?.type === 'add',
      dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
      placeholder: `请选择${$t('purchasePlan.buyPlan.warehouseName')}`,
      onChange(val: any, option: any) {
        wareHouseOption.value = option;
        selectParams.value.warehouseId = val;
      },
      showSearch: true,
      paginate: false,
      disabled: !!currentHandleRow.value!.orderPlanId,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      allowClear: true,
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    formItemClass: 'pb-2',
    fieldName: 'warehouseId',
    label: $t('purchasePlan.buyPlan.warehouseName'),
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
      placeholder: `请选择${$t('purchasePlan.buyPlan.applyBPartnerName')}`,
      onChange(val: any) {
        selectParams.value.bpartnerId = val;
      },
      showSearch: true,
      paginate: false,
      immediate: false,
      labelField: 'name',
      valueField: 'id',
      allowClear: false,
      disabled:
        detailConfig.value?.type === 'edit' ||
        detailConfig.value?.type === 'view' ||
        !!currentHandleRow.value!.orderPlanId,
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    formItemClass: 'pb-2',
    fieldName: 'applyBPartnerId',
    label: $t('purchasePlan.buyPlan.applyBPartnerName'),
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/refList.do?id=154',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: `请选择${$t('purchasePlan.buyPlan.priorityRuleName')}`,
        paginate: false,
        filterByFrontEnd: true,
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        disabled: detailConfig.value?.type === 'view',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    formItemClass: 'pb-2',
    fieldName: 'priorityRule',
    defaultValue:
      detailConfig.value?.type === 'add'
        ? '5'
        : currentHandleRow.value.priorityRule,
    label: $t('purchasePlan.buyPlan.priorityRuleName'),
  },
  {
    component: 'Input',
    fieldName: 'description',
    componentProps: {
      disabled: detailConfig.value?.type === 'view',
    },
    label: $t('purchasePlan.buyPlan.description'),
    defaultValue:
      detailConfig.value?.type === 'add'
        ? undefined
        : currentHandleRow.value.description,
    formItemClass: 'pb-2 col-span-1',
  },
];

/**
 * 行进入编辑时的回调
 * 更新行内 ChcSelect 下拉的查询参数
 */
const handleEditActivated = (scope: any) => {
  vendorParams.value.productId = scope.row.productId;
};

/**
 * 初始化表格数据
 */
onMounted(() => {
  if (currentHandleRow.value.orderPlanId) {
    editableTableRef.value!.showLoading = true;
    queryOrderPlanLineInfo({
      orderPlanId: currentHandleRow.value.orderPlanId,
      isActive: 'Y',
    }).then(async (res) => {
      if (res.success) {
        editableTableRef.value?.initRows(res.rows);
        editableTableRef.value!.showLoading = false;
      } else {
        message.error(res.msg);
      }
    });
  }
  editableTableRef.value?.formApi.setFieldValue(
    'warehouseId',
    currentHandleRow.value.warehouseId,
  );
});

/**
 * 校验是否可以添加行（必须先选择仓库和需求仓库）
 */
const validateIfCanAddRow = () => {
  return new Promise<boolean>((resolve) => {
    editableTableRef.value?.formApi.getValues().then((temFormData) => {
      const formValues: { [key: string]: any } = {
        applyBPartnerId:
          temFormData.applyBPartnerId || currentHandleRow.value.applyBPartnerId,
        warehouseId:
          temFormData.warehouseId || currentHandleRow.value.warehouseId,
      };
      const requiredFields = [
        {
          field: 'applyBPartnerId',
          label: $t('purchasePlan.buyPlan.applyBPartnerName'),
        },
        {
          field: 'warehouseId',
          label: $t('purchasePlan.buyPlan.warehouseName'),
        },
      ];
      let errorMsg: string = '';
      for (const { field, label } of requiredFields) {
        if (!formValues[field]) {
          errorMsg = label;
          break;
        }
      }
      if (errorMsg) {
        message.warning(`请先选择${errorMsg}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * 根据用户选择获取新增行数据
 * 调用接口获取库存等补充信息
 */
const getAddRowData = (option: any, formValue: any) => {
  return new Promise((resolve) => {
    getOrderPlanStorage({
      warehouseId: formValue.warehouseId,
      productId: option.productId,
    }).then((response) => {
      resolve({
        ...option,
        ...response,
        isGift: 'N',
        qtyPlaned: 0,
      });
    });
  });
};

/**
 * 行数据前端校验
 */
function rowDataValidate(row: any) {
  return new Promise<boolean>((resolve, reject) => {
    if (
      wareHouseOption.value.isLPackageQtyPO === 'Y' &&
      row.lPackageQty > 0 &&
      row.qtyPlaned % row.lPackageQty > 0
    ) {
      message.error('采购数量不是大包装的倍数!');
      reject(new Error('采购数量不是大包装的倍数!'));
    } else if (row.qtyPlaned <= 0) {
      message.error('采购数量必须大于零!');
      reject(new Error('采购数量必须大于零!'));
    } else if (row.vendorId) {
      resolve(true);
    } else {
      message.error('请选择供应商！');
      reject(new Error('请选择供应商！'));
    }
  });
}

/**
 * 构建查询参数
 */
const queryparams = (
  type: 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  rows.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (item[key] === undefined || item[key] === null) {
        delete item[key];
      }
    });
  });
  lineData =
    type === 'saveDo'
      ? JSON.stringify({ created: [], updated: [], removed: [...rows] })
      : JSON.stringify(rows[0]);
  return {
    orderPlanId: currentHandleRow.value.orderPlanId || 0,
    warehouseId: formValues.warehouseId,
    priorityRule: formValues.priorityRule,
    deliveryPlanDate: formValues.deliveryPlanDate,
    applyBPartnerId: formValues.applyBPartnerId,
    description: formValues.description,
    isCrossDocking: urlParams.isCrossDocking,
    isPackaged: urlParams.isPackaged,
    receiptType: urlParams.receiptType,
    isShortPo: urlParams.isShortPo,
    type: urlParams.type,
    lineData,
  };
};

/**
 * 单行保存方法
 */
const saveRow = (row: any) => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi
      .getValues()
      .then((res: any) => {
        const params = queryparams('saveLine', res, [row]);
        saveLine(params)
          .then((res) => {
            // 新增时更新订单 ID
            if (!currentHandleRow.value.orderPlanId) {
              currentHandleRow.value = { orderPlanId: res.id };
              editableTableRef.value?.formApi.setFieldValue(
                'orderPlanNo',
                res.orderPlanNo,
              );
            }
            // 查询更新后的行数据
            queryOrderPlanLineInfo({ orderPlanId: res.id, isActive: 'Y' })
              .then((resIn) => {
                const newRow = resIn.rows.find(
                  (item: any) => item.orderPlanLineId === res.lineId,
                );
                resolve(newRow);
              })
              .catch((error) => {
                row.loading = false;
                reject(error);
              });
          })
          .catch((error) => {
            row.loading = false;
            reject(error);
          });
      })
      .catch((error: any) => {
        row.loading = false;
        reject(error);
      });
  });
};

/**
 * 批量删除行方法
 */
const deleteRows = (rows: any[]) => {
  return new Promise((resolve) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, rows);
      saveDo(params).then((res) => {
        resolve(res);
      });
    });
  });
};

/**
 * 表格额外配置
 */
const gridOptions: VxeGridProps = {
  toolbarConfig: {
    zoom: true,
    custom: true,
  },
  cellStyle: (scope: any) => {
    const finalStyle: { [key: string]: number | string } = {
      color: '',
      backgroundColor: '',
    };
    if (
      editableTableRef.value?.editFieldArr?.includes(scope.column.field) &&
      detailConfig.value?.type !== 'view'
    ) {
      finalStyle.backgroundColor = '#D7FFF5';
    }
    if (
      scope.column.field === 'price' &&
      scope.row.price !== scope.row.priceList
    ) {
      finalStyle.color = 'red';
    }
    return finalStyle;
  },
};

/**
 * 整体保存方法
 */
const totalSave = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, []);
      saveDo(params)
        .then(() => {
          currentTab.value = 0;
          resolve(true);
        })
        .catch((error) => {
          console.error(error.msg);
          reject(error);
        });
    });
  });
};

/**
 * 整体提交方法
 */
const totalSubmit = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then((res: any) => {
      const params = queryparams('saveDo', res, []);
      saveDo({ ...params, doCommit: 'Y' })
        .then(() => {
          currentTab.value = 1;
          resolve(true);
        })
        .catch((error) => {
          console.error(error.msg);
          reject(error);
        });
    });
  });
};

/**
 * 批量添加弹窗表格配置
 */
const batchAddModalGridOptions: SchemaColumnAndOptions = {
  gridColumns: [
    { type: 'checkbox', title: '', width: 50, align: 'center' },
    { field: 'productCode', minWidth: 110, sortable: true, title: '药品编码' },
    { field: 'productName', minWidth: 135, sortable: true, title: '药品名称' },
    { field: 'productSpec', minWidth: 80, sortable: true, title: '规格' },
    { field: 'manufacturer', minWidth: 120, sortable: true, title: '厂家' },
    { field: 'uomName', minWidth: 60, sortable: true, title: '单位' },
    { field: 'price', minWidth: 100, sortable: true, align: 'right', title: '采购价' },
    { field: 'vendorName', minWidth: 180, sortable: true, title: '供应商' },
    { field: 'storageQty', minWidth: 70, sortable: true, align: 'right', title: '库存' },
  ],
  dataTableId: '/productAction/query.do',
};

/**
 * 批量添加弹窗表单配置
 */
const batchAddModalFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '编码、名称、拼首码、规格',
        allowClear: true,
      },
      fieldName: 'productName',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '生产厂家',
        allowClear: true,
      },
      fieldName: 'manufacturer',
    },
    {
      component: 'ChcSelect',
      componentProps: {
        placeholder: '供应商',
        allowClear: true,
        dictUrl: '/baseHandleAction/vendor.do',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        paginate: false,
        filterByFrontEnd: true,
        labelField: 'name',
        valueField: 'id',
        immediate: true,
        afterFetch: (res: any) => {
          return { ...res, rows: undefined, records: res.rows };
        },
      },
      fieldName: 'vendor',
    },
  ],
};

/**
 * 操作日志查询参数
 */
const queryActionLogParams = (row: any) => {
  return {
    AD_Table_ID: 1_000_359,
    Record_ID: row.orderPlanLineId,
  };
};

/**
 * 黑名单变化回调（添加数据后禁用仓库选择）
 */
const handleBlackListChange = (blackList: string[]) => {
  editableTableRef.value?.formApi.updateSchema([
    {
      fieldName: 'warehouseId',
      componentProps: {
        disabled: !!currentHandleRow.value!.orderPlanId || blackList.length > 0,
      },
    },
    {
      fieldName: 'applyBPartnerId',
      componentProps: {
        disabled:
          detailConfig.value?.type === 'edit' ||
          detailConfig.value?.type === 'view' ||
          !!currentHandleRow.value!.orderPlanId ||
          blackList.length > 0,
      },
    },
  ]);
};
</script>

<template>
  <div class="h-full">
    <EditableTable
      class="buyPlanEditable"
      ref="editableTableRef"
      id="buyPlanEditableTable"
      :row-data-validate="rowDataValidate"
      :grid-columns="gridColumns"
      :grid-options="gridOptions"
      :view-type="detailConfig?.type"
      :form-schema="formSchema"
      @edit-activated="handleEditActivated"
      :single-select-props="{
        extraParams: selectParams,
        filterField: 'productCode',
        queryModelValueField: 'model',
        refreshOptionsWhenOpenDropdown: true,
      }"
      :validateIfCanAddRow="validateIfCanAddRow"
      :get-final-add-row-data="getAddRowData"
      :save-row="saveRow"
      :delete-rows="deleteRows"
      :totalSave="totalSave"
      :totalSubmit="totalSubmit"
      :batchAddModalGridOptions="batchAddModalGridOptions"
      :batchAddModalFormOptions="batchAddModalFormOptions"
      :queryActionLogParams="queryActionLogParams"
      @blackListChange="handleBlackListChange"
    >
    </EditableTable>
  </div>
</template>
```

### 示例关键点解析

#### 1. 列配置 (gridColumns)
- 包含普通列（productCode、productName）和编辑列（qtyPlaned、price、vendorId、isGift）
- 编辑列使用 `editRender.name` 指定编辑组件类型
- `ChcInputNumber` 支持数值输入，通过 `onChange` 实现金额联动计算
- `ChcSelect` 支持下拉选择，通过 `extraParams` 和 `onChange` 实现供应商选择

#### 2. 表头表单 (formSchema)
- 包含订单号（只读）、计划配送日期、仓库、需求仓库、优先规则、供应商、备注等字段
- 使用 `ChcSelect` 组件实现仓库和供应商的联动选择
- `componentProps.onChange` 监听值变化，更新 `selectParams` 传递给商品下拉

#### 3. 编辑激活回调 (handleEditActivated)
- 行进入编辑时，更新 `vendorParams.productId`，确保行内供应商下拉根据当前行商品查询

#### 4. 添加校验 (validateIfCanAddRow)
- 校验是否选择了仓库和需求仓库，未选择时提示并阻止添加

#### 5. 行数据获取 (getAddRowData)
- 用户选择商品后，调用 `getOrderPlanStorage` 接口获取库存信息
- 返回合并后的完整行数据对象

#### 6. 行数据校验 (rowDataValidate)
- 校验采购数量是否为大包装倍数（根据仓库配置）
- 校验采购数量是否大于零
- 校验是否选择了供应商

#### 7. 单行保存 (saveRow)
- 获取表头表单数据构建请求参数
- 调用 `saveLine` 接口保存单行
- 新增订单时更新订单 ID 和订单号
- 保存成功后重新查询该行最新数据并返回

#### 8. 批量删除 (deleteRows)
- 获取表头表单数据构建请求参数
- 调用 `saveDo` 接口批量删除

#### 9. 整体保存和提交 (totalSave / totalSubmit)
- 获取表头表单数据构建请求参数
- 提交时添加 `doCommit: 'Y'` 参数标记为提交操作
- 成功后切换到列表页

#### 10. 批量添加配置 (batchAddModalGridOptions / batchAddModalFormOptions)
- 弹窗表格包含药品编码、名称、规格、厂家、单位、采购价、供应商、库存等列
- 弹窗表单包含商品名称、厂家、供应商筛选条件

#### 11. 操作日志参数 (queryActionLogParams)
- 返回 AD_Table_ID 和 Record_ID 供日志查询接口使用

#### 12. 黑名单变化回调 (handleBlackListChange)
- 添加商品后，黑名单长度 > 0，禁用仓库和需求仓库选择，防止数据混乱

---

## 注意事项

1. **必填属性**: `id` 和 `gridColumns` 是必填属性
2. **保存模式**: 使用 `autoSaveRow` 模式时，`saveRow` 和 `deleteRows` 方法必须提供
3. **行数据标识**: 每行数据会自动添加 `$uuid` 和 `$status` 字段，避免使用同名业务字段
4. **性能优化**: 大数据量场景建议使用 `virtualYConfig` 已默认开启虚拟滚动
5. **列编辑**: 只有配置了 `editRender` 或 `slots.edit` 的列才能编辑
6. **黑名单**: 通过 `blackListField` 指定字段，防止重复添加相同数据
7. **批量操作**: 批量添加和删除操作会维护黑名单列表的同步

---

## 虚拟滚动配置

组件默认开启垂直虚拟滚动：

```ts
virtualYConfig: {
  enabled: true
}
```

这允许表格在渲染大数据量时保持流畅性能，支持万级数据同时编辑而不影响用户体验。

---

## 列拖拽配置

组件默认支持列拖拽排序：

```ts
columnConfig: {
  drag: true,
  resizable: true
}
```

用户可以通过拖拽列头调整列顺序，配置会自动持久化到服务器。

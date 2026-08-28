# 表单配置-FormItem项定义

## 功能模块概述

FormItem项定义是表单配置的核心组成部分，用于定义表单中的各个输入字段。它规定了表单字段的类型、属性、验证规则等信息，是构建表单界面的基础。

**主要用途**：

- 定义表单字段的基本信息（如标签、字段名）
- 配置字段的组件类型（如输入框、下拉选择等）
- 设置字段的默认值和验证规则
- 控制字段的显示状态和行为

**应用场景**：

- 搜索表单配置
- 新增/编辑表单配置
- 查看表单配置
- 任何需要用户输入的界面

## 核心实现原理

### 技术架构

FormItem项定义采用配置化的方式，通过数组形式定义表单中的各个字段。每个FormItem对象包含以下核心属性：

1. **component**：指定字段使用的组件类型
2. **fieldName**：字段名称，用于数据绑定
3. **label**：字段标签，显示在表单上
4. **componentProps**：组件的属性配置
5. **defaultValue**：字段的默认值
6. **dependencies**：字段间的依赖关系
7. **required**：是否必填
8. **disabled**：是否禁用

### 数据流程

1. 表单初始化时，根据FormItem配置渲染各个表单字段
2. 用户输入数据时，表单组件捕获输入并更新内部状态
3. 表单提交时，收集所有FormItem的值并进行验证
4. 验证通过后，将数据提交到后端或进行其他处理

## 标准实现步骤

### 前置条件

- 已安装并配置好相关组件库（Ant Design Vue、Vben组件等）
- 已了解项目中使用的表单组件类型和配置方式

### 实现步骤

1. **确定表单字段**：根据业务需求确定需要的表单字段
2. **选择组件类型**：为每个字段选择合适的组件类型
3. **配置FormItem**：为每个字段创建FormItem配置对象
4. **设置组件属性**：根据组件类型配置相应的属性
5. **添加验证规则**：为需要验证的字段添加验证规则
6. **配置依赖关系**：为有依赖关系的字段配置dependencies
7. **设置默认值**：为需要默认值的字段设置defaultValue

## 完整代码示例

### 基本FormItem配置示例

```typescript
// 搜索表单配置示例
const formSchema = [
  // 文本输入框
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入姓名',
      'data-testid': 'Input-name', // 用于UI自动化的属性
    },
    fieldName: 'name',
    label: '姓名',
  },

  // 下拉选择框
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ],
      placeholder: '请选择',
    },
    fieldName: 'isActive',
    label: '是否有效',
  },

  // 字典下拉选择框
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/datatable/getDict/sys.user.userType',
        paginate: false,
      };
    },
    fieldName: 'userType',
    label: '用户类型',
  },

  // 带依赖关系的下拉选择框
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: 'sys/dept/deptList/{{orgId}}',
        showSearch: true,
        triggerFields: ['orgId'],
        triggerFieldKeys: {
          orgId: 'orgId',
        },
        dependencies: deptIdDependencies.value,
      };
    },
    dependencies: {
      triggerFields: ['orgId'],
      trigger(values: any) {
        deptIdDependencies.value.orgId = values.orgId;
        // 清空依赖字段的值
        formApi?.setFieldValue?.('deptId', undefined);
      },
    },
    fieldName: 'deptId',
    label: '部门',
  },
];
```

### 新增/编辑表单配置示例

```typescript
// 新增/编辑表单配置
export const addFormOptions = {
  formSchema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '姓名',
      required: true, // 必填字段
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: '登录名',
      required: true,
    },
    {
      component: 'Password',
      fieldName: 'password',
      label: '密码',
      required: true,
    },
    {
      component: 'ChcSelect',
      componentProps: {
        dictUrl: '/sys/org/pageOrgList',
        showSearch: true,
        placeholder: '请选择',
        allowClear: true,
        paginate: true,
      },
      fieldName: 'orgId',
      label: '机构',
      required: true,
    },
  ],
  labelWidth: 100,
};
```

### 查看表单配置示例

```typescript
// 查看表单配置
export const viewFormOptions = {
  formSchema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '姓名',
      disabled: true, // 查看模式下禁用
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: '登录名',
      disabled: true,
    },
    {
      component: 'ChcSelect',
      componentProps: {
        dictUrl: '/sys/org/pageOrgList',
        disabled: true,
      },
      fieldName: 'orgId',
      label: '机构',
    },
  ],
  labelWidth: 100,
};
```

## 组件/API说明

### 表单组件完整列表

| 组件名称 | 对应 antd-vue 组件 | 用途 | 适用场景 |
| --- | --- | --- | --- |
| ApiSelect | Select | 异步下拉选择框 | 从后端API获取选项的选择 |
| ApiTreeSelect | TreeSelect | 异步树形选择框 | 从后端API获取树形结构选项的选择 |
| AutoComplete | AutoComplete | 自动完成输入框 | 带自动提示的文本输入 |
| ChcSelect | 自定义组件 | 字典下拉选择框 | 从后端字典接口获取选项的选择 |
| ChcSelectNew | 自定义组件 | 字典下拉选择框 | 与ChcSelect相同 |
| Checkbox | Checkbox | 复选框 | 单个布尔值选择 |
| CheckboxGroup | CheckboxGroup | 复选框组 | 多个选项的多选 |
| DateGroup | 自定义组件 | 日期范围选择器 | 日期范围选择 |
| DatePicker | DatePicker | 日期选择器 | 单个日期输入 |
| DefaultButton | Button | 默认按钮 | 普通操作按钮 |
| Divider | Divider | 分隔线 | 表单区域分隔 |
| IconPicker | 自定义组件 | 图标选择器 | 选择图标 |
| Input | Input | 文本输入框 | 姓名、登录名等文本输入 |
| InputNumber | InputNumber | 数字输入框 | 数值输入 |
| InputPassword | InputPassword | 密码输入框 | 密码输入 |
| InputSearch | InputSearch | 搜索输入框 | 带搜索按钮的输入框 |
| Mentions | Mentions | 提及输入框 | @提及功能 |
| PrimaryButton | Button | 主要按钮 | 重要操作按钮 |
| Quill | 自定义组件 | 富文本编辑器 | 富文本内容编辑 |
| Radio | Radio | 单选框 | 单个单选选项 |
| RadioGroup | RadioGroup | 单选框组 | 多个选项的单选 |
| RangePicker | RangePicker | 日期范围选择器 | 日期范围选择 |
| Rate | Rate | 评分组件 | 评分输入 |
| Select | Select | 下拉选择框 | 固定选项的选择 |
| SelectHook | 自定义组件 | 带钩子的选择框 | 特殊业务逻辑的选择 |
| Space | Space | 间距组件 | 组件间距控制 |
| Switch | Switch | 开关 | 布尔值选择 |
| Textarea | Textarea | 文本域 | 多行文本输入 |
| TimeGroup | 自定义组件 | 时间范围选择器 | 时间范围选择 |
| TimePicker | TimePicker | 时间选择器 | 单个时间输入 |
| TreeSelect | TreeSelect | 树形选择框 | 树形结构选项的选择 |
| Upload | Upload | 上传组件 | 文件上传 |

### 组件属性配置详解

#### Input组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| placeholder | string | "请输入" | 占位文本 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| maxLength | number | - | 最大输入长度 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| prefix | string / VNode | - | 前缀 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| suffix | string / VNode | - | 后缀 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| size | string | - | 输入框大小 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| type | string | "text" | 输入框类型 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |

#### Select组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| options | array | [] | 选项数组 | [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| placeholder | string | "请选择" | 占位文本 | [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| allowClear | boolean | false | 是否允许清空 | [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| mode | string | - | 选择模式（multiple/tags） | [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| size | string | - | 选择框大小 | [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| showSearch | boolean | false | 是否支持搜索 | [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |

## ChcSelect 组件详细说明

ChcSelect 是项目中使用频率最高的下拉选择组件，具有远程数据查询和多下拉项依赖联动等特殊功能。本章节将详细介绍 ChcSelect 组件的使用方法和配置选项。

### 核心功能

1. **远程数据查询**：通过 `dictUrl` 从后端接口获取数据
2. **多下拉项依赖联动**：支持基于其他表单字段的值动态更新下拉选项
3. **分页功能**：支持下拉列表分页加载数据
4. **搜索功能**：支持前端和后端搜索
5. **自定义数据处理**：支持数据获取前后的自定义处理
6. **黑名单功能**：支持设置不可选的选项
7. **自动选择第一项**：支持自动选择下拉列表的第一项
8. **全选功能**：支持添加全选项
9. **数据缓存**：支持缓存已选择的项
10. **自定义选项列**：支持自定义下拉选项的显示列

### API 属性

| 属性 | 类型 | 默认值 | 描述 | 适用场景 |
| --- | --- | --- | --- | --- |
| `dictUrl` | string | "" | 字典数据接口地址 | 从后端获取下拉数据 |
| `options` | Array<DictData> | [] | 直接传入选项数据 | 固定选项的下拉选择 |
| `showSearch` | boolean | true | 是否支持搜索 | 需要搜索功能的场景 |
| `placeholder` | string | "请选择" | 占位文本 | 所有场景 |
| `allowClear` | boolean | true | 是否允许清空 | 需要清空功能的场景 |
| `paginate` | boolean | false | 是否分页 | 数据量较大的场景 |
| `pageSize` | number | 20 | 下拉分页每页数量 | 分页场景 |
| `filterByFrontEnd` | boolean | true | 是否前端过滤 | 数据量较小的场景 |
| `filterField` | string | "query" | 搜索时传递给接口的字段名 | 后端搜索场景 |
| `immediate` | boolean | true | 是否立即加载数据 | 需要页面加载时就显示数据的场景 |
| `triggerFields` | string[] | [] | 触发字段数组 | 依赖联动场景 |
| `triggerFieldKeys` | object | {} | 触发字段映射 | 依赖联动场景 |
| `dependencies` | object | {} | 依赖数据 | 依赖联动场景 |
| `formatInterfaceData` | function | undefined | 数据格式化函数 | 需要自定义数据格式的场景 |
| `apiType` | string | "get" | 接口请求方式 | 需要 POST 请求的场景 |
| `autoChooseFirstOption` | boolean | false | 是否自动选择第一项 | 需要默认值的场景 |
| `beforeFetch` | function | undefined | 数据获取前处理函数 | 需要预处理请求参数的场景 |
| `afterFetch` | function | undefined | 数据获取后处理函数 | 需要处理返回数据的场景 |
| `blackList` | any[] | [] | 黑名单，不可选项 | 需要限制某些选项的场景 |
| `showChooseAll` | boolean string number | undefined | 是否显示全选项 | 需要全选功能的场景 |
| `chooseAllLabel` | string | "全部" | 全选项的标签 | 全选功能场景 |
| `onlySearchDataWhenDependencesChange` | boolean | false | 仅在依赖项变化时加载数据 | 复杂依赖场景 |
| `optionColumns` | SelectOptionColumns | [] | 自定义选项列配置 | 需要复杂显示的场景 |
| `paramsMap` | object | {} | 参数映射 | 需要映射参数的场景 |
| `queryDataApi` | function | undefined | 自定义查询接口 | 需要自定义数据获取逻辑的场景 |
| `refreshOptionsWhenOpenDropdown` | boolean | false | 下拉框打开时刷新数据 | 需要最新数据的场景 |
| `requestConfig` | RequestClientConfig | {} | 自定义接口配置 | 需要特殊请求配置的场景 |
| `requestContentType` | ContentType | undefined | 请求的 Content-Type | 需要特殊 Content-Type 的场景 |
| `labelField` | string | "label" | label 对应的字段名 | 自定义数据结构的场景 |
| `valueField` | string | "value" | value 对应的字段名 | 自定义数据结构的场景 |
| `extraParams` | object | {} | 额外参数 | 需要传递额外参数的场景 |
| `onLoad` | function | undefined | 数据加载完成回调 | 需要在数据加载后执行逻辑的场景 |

### 方法

| 方法               | 参数                 | 返回值        | 描述             |
| ------------------ | -------------------- | ------------- | ---------------- |
| `fetchApi`         | resetQuery?: boolean | Promise<void> | 手动触发数据加载 |
| `focus`            | -                    | void          | 使选择框获得焦点 |
| `blur`             | -                    | void          | 使选择框失去焦点 |
| `pageChange`       | value: number        | void          | 分页变化时触发   |
| `getSelectOptions` | -                    | DictData[]    | 获取当前选项列表 |

### 事件

| 事件                    | 参数                    | 描述                  |
| ----------------------- | ----------------------- | --------------------- |
| `change`                | value: any, option: any | 选择值变化时触发      |
| `search`                | value: string           | 搜索时触发            |
| `focus`                 | e: any                  | 获得焦点时触发        |
| `blur`                  | e: any                  | 失去焦点时触发        |
| `dropdownVisibleChange` | open: boolean           | 下拉框显示/隐藏时触发 |
| `pageChange`            | value: number           | 分页变化时触发        |
| `load`                  | options: DictData[]     | 数据加载完成时触发    |

### 基本用法示例

#### 1. 基础远程数据查询

```typescript
{
  component: 'ChcSelect',
  componentProps: {
    dictUrl: '/api/dict/userType',
    placeholder: '请选择用户类型',
    allowClear: true,
    showSearch: true
  },
  fieldName: 'userType',
  label: '用户类型'
}
```

#### 2. 带分页的远程数据查询

```typescript
{
  component: 'ChcSelect',
  componentProps: {
    dictUrl: '/api/dict/largeData',
    placeholder: '请选择数据',
    paginate: true,
    pageSize: 10,
    showSearch: true
  },
  fieldName: 'largeData',
  label: '大数据'
}
```

#### 3. 依赖联动示例

```typescript
// 机构选择
{
  component: 'ChcSelect',
  componentProps: {
    dictUrl: '/api/dict/orgList',
    placeholder: '请选择机构',
    allowClear: true
  },
  fieldName: 'orgId',
  label: '机构'
},
// 部门选择（依赖机构）
{
  component: 'ChcSelect',
  componentProps: () => {
    return {
      dictUrl: 'api/dict/deptList/{{orgId}}',
      showSearch: true,
      placeholder: '请选择部门',
      allowClear: true,
      triggerFields: ['orgId'],
      triggerFieldKeys: {
        orgId: 'orgId'
      },
      dependencies: deptDependencies.value
    };
  },
  dependencies: {
    triggerFields: ['orgId'],
    trigger(values: any) {
      deptDependencies.value.orgId = values.orgId;
      // 清空部门值
      formApi?.setFieldValue?.('deptId', undefined);
    }
  },
  fieldName: 'deptId',
  label: '部门'
}
```

### 高级用法示例

#### 1. 自定义数据处理

```typescript
{
  component: 'ChcSelect',
  componentProps: {
    dictUrl: '/api/dict/customData',
    placeholder: '请选择自定义数据',
    beforeFetch: (params) => {
      // 预处理请求参数
      params.extraParam = 'value';
      return params;
    },
    afterFetch: (data) => {
      // 处理返回数据
      return {
        total: data.count,
        records: data.items.map(item => ({
          label: item.name,
          value: item.id,
          extra: item.extra
        }))
      };
    },
    formatInterfaceData: (data) => {
      // 格式化接口数据
      return {
        total: data.total,
        records: data.data
      };
    }
  },
  fieldName: 'customData',
  label: '自定义数据'
}
```

#### 2. 自定义选项列

```typescript
{
  component: 'ChcSelect',
  componentProps: {
    dictUrl: '/api/dict/productList',
    placeholder: '请选择产品',
    optionColumns: [
      {
        name: 'code',
        header: '产品编码',
        width: 100,
        align: 'center'
      },
      {
        name: 'name',
        header: '产品名称',
        width: 150
      },
      {
        name: 'price',
        header: '价格',
        width: 80,
        align: 'right'
      }
    ]
  },
  fieldName: 'productId',
  label: '产品'
}
```

#### 3. 全选功能

```typescript
{
  component: 'ChcSelect',
  componentProps: {
    dictUrl: '/api/dict/regionList',
    placeholder: '请选择地区',
    showChooseAll: true,
    chooseAllLabel: '全部地区'
  },
  fieldName: 'region',
  label: '地区'
}
```

#### 4. 黑名单功能

```typescript
{
  component: 'ChcSelect',
  componentProps: {
    dictUrl: '/api/dict/userList',
    placeholder: '请选择用户',
    blackList: ['1', '2', '3'] // 这些值对应的选项将不可选
  },
  fieldName: 'userId',
  label: '用户'
}
```

### 依赖联动实现原理

ChcSelect 组件的依赖联动功能通过以下机制实现：

1. **依赖配置**：通过 `triggerFields` 指定依赖的字段名，通过 `triggerFieldKeys` 指定依赖字段在接口参数中的映射关系

2. **依赖数据传递**：通过 `dependencies` 属性接收依赖字段的当前值

3. **依赖变化监听**：组件内部监听 `dependencies` 的变化，当依赖字段值变化时自动重新加载数据

4. **动态 URL**：支持在 `dictUrl` 中使用 `{{fieldName}}` 占位符，动态替换为依赖字段的值

### 注意事项

1. **性能优化**：对于数据量较大的场景，建议启用分页功能 (`paginate: true`)，并合理设置 `pageSize`

2. **依赖联动**：当使用依赖联动时，确保正确配置 `triggerFields` 和 `triggerFieldKeys`，并通过 `dependencies` 传递依赖数据

3. **数据格式化**：当接口返回的数据格式不符合要求时，使用 `formatInterfaceData` 或 `afterFetch` 进行处理

4. **搜索优化**：对于数据量较小的场景，使用前端过滤 (`filterByFrontEnd: true`) 可以提高搜索性能；对于数据量较大的场景，建议使用后端搜索

5. **缓存机制**：组件内置了选中项的缓存机制，确保在分页切换时保留已选中的项

6. **类型一致性**：组件会自动处理 `modelValue` 和选项值的类型一致性，确保值的比较和匹配正确

### 常见问题与解决方案

#### 问题1：依赖联动不生效

**解决方案**：

- 确保正确配置了 `triggerFields` 和 `triggerFieldKeys`
- 确保通过 `dependencies` 传递了依赖数据
- 检查 `dictUrl` 中的占位符是否正确

#### 问题2：数据加载失败

**解决方案**：

- 检查 `dictUrl` 是否正确
- 检查接口返回的数据格式是否符合要求
- 使用 `formatInterfaceData` 处理数据格式

#### 问题3：搜索功能不生效

**解决方案**：

- 确保设置了 `showSearch: true`
- 对于后端搜索，确保 `filterByFrontEnd: false`，并检查 `filterField` 是否正确
- 对于前端搜索，确保 `filterByFrontEnd: true`

#### 问题4：分页功能不生效

**解决方案**：

- 确保设置了 `paginate: true`
- 检查接口是否支持分页参数（current, size）
- 确保接口返回的数据包含 total 字段

#### 问题5：选中项在分页切换后消失

**解决方案**：

- 确保接口返回的数据中包含已选中项的数据
- 对于分页场景，组件会自动缓存已选中的项，但需要确保接口能够根据 value 查询到对应的数据

#### DatePicker组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| placeholder | string | "请选择日期" | 占位文本 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |
| size | string | - | 选择器大小 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |
| format | string | "YYYY-MM-DD" | 日期格式 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |
| type | string | "date" | 选择器类型 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |

#### RangePicker组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| placeholder | array | ["开始日期", "结束日期"] | 占位文本 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |
| size | string | - | 选择器大小 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |
| format | string | "YYYY-MM-DD" | 日期格式 | [Ant Design Vue DatePicker](https://www.antdv.com/components/date-picker-cn/) |

#### Checkbox组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| checked | boolean | false | 是否选中 | [Ant Design Vue Checkbox](https://www.antdv.com/components/checkbox-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Checkbox](https://www.antdv.com/components/checkbox-cn/) |
| indeterminate | boolean | false | 半选状态 | [Ant Design Vue Checkbox](https://www.antdv.com/components/checkbox-cn/) |

#### CheckboxGroup组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| options | array | [] | 选项数组 | [Ant Design Vue Checkbox](https://www.antdv.com/components/checkbox-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Checkbox](https://www.antdv.com/components/checkbox-cn/) |

#### Radio组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| checked | boolean | false | 是否选中 | [Ant Design Vue Radio](https://www.antdv.com/components/radio-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Radio](https://www.antdv.com/components/radio-cn/) |
| value | any | - | 单选框的值 | [Ant Design Vue Radio](https://www.antdv.com/components/radio-cn/) |

#### RadioGroup组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| options | array | [] | 选项数组 | [Ant Design Vue Radio](https://www.antdv.com/components/radio-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Radio](https://www.antdv.com/components/radio-cn/) |
| size | string | - | 单选框大小 | [Ant Design Vue Radio](https://www.antdv.com/components/radio-cn/) |

#### Switch组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| checked | boolean | false | 是否选中 | [Ant Design Vue Switch](https://www.antdv.com/components/switch-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Switch](https://www.antdv.com/components/switch-cn/) |
| size | string | - | 开关大小 | [Ant Design Vue Switch](https://www.antdv.com/components/switch-cn/) |
| checkedChildren | string / VNode | - | 选中时的内容 | [Ant Design Vue Switch](https://www.antdv.com/components/switch-cn/) |
| unCheckedChildren | string / VNode | - | 未选中时的内容 | [Ant Design Vue Switch](https://www.antdv.com/components/switch-cn/) |

#### InputNumber组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| placeholder | string | "请输入" | 占位文本 | [Ant Design Vue InputNumber](https://www.antdv.com/components/input-number-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue InputNumber](https://www.antdv.com/components/input-number-cn/) |
| min | number | - | 最小值 | [Ant Design Vue InputNumber](https://www.antdv.com/components/input-number-cn/) |
| max | number | - | 最大值 | [Ant Design Vue InputNumber](https://www.antdv.com/components/input-number-cn/) |
| step | number | 1 | 步长 | [Ant Design Vue InputNumber](https://www.antdv.com/components/input-number-cn/) |
| size | string | - | 输入框大小 | [Ant Design Vue InputNumber](https://www.antdv.com/components/input-number-cn/) |

#### Textarea组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| placeholder | string | "请输入" | 占位文本 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| rows | number | 3 | 行数 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |
| maxLength | number | - | 最大输入长度 | [Ant Design Vue Input](https://www.antdv.com/components/input-cn/) |

#### TimePicker组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| placeholder | string | "请选择时间" | 占位文本 | [Ant Design Vue TimePicker](https://www.antdv.com/components/time-picker-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue TimePicker](https://www.antdv.com/components/time-picker-cn/) |
| format | string | "HH:mm:ss" | 时间格式 | [Ant Design Vue TimePicker](https://www.antdv.com/components/time-picker-cn/) |
| size | string | - | 选择器大小 | [Ant Design Vue TimePicker](https://www.antdv.com/components/time-picker-cn/) |

#### TreeSelect组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| treeData | array | [] | 树形数据 | [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| placeholder | string | "请选择" | 占位文本 | [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| allowClear | boolean | false | 是否允许清空 | [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| size | string | - | 选择框大小 | [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| showSearch | boolean | false | 是否支持搜索 | [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |

#### Upload组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| action | string | - | 上传地址 | [Ant Design Vue Upload](https://www.antdv.com/components/upload-cn/) |
| disabled | boolean | false | 是否禁用 | [Ant Design Vue Upload](https://www.antdv.com/components/upload-cn/) |
| multiple | boolean | false | 是否支持多文件上传 | [Ant Design Vue Upload](https://www.antdv.com/components/upload-cn/) |
| accept | string | - | 接受的文件类型 | [Ant Design Vue Upload](https://www.antdv.com/components/upload-cn/) |
| maxCount | number | - | 最大上传文件数量 | [Ant Design Vue Upload](https://www.antdv.com/components/upload-cn/) |

#### ApiSelect组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| api | string / function | - | API地址或获取数据的函数 | 基于 [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| placeholder | string | "请选择" | 占位文本 | 基于 [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| allowClear | boolean | false | 是否允许清空 | 基于 [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| disabled | boolean | false | 是否禁用 | 基于 [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |
| showSearch | boolean | true | 是否支持搜索 | 基于 [Ant Design Vue Select](https://www.antdv.com/components/select-cn/) |

#### ApiTreeSelect组件属性

| 属性 | 类型 | 默认值 | 描述 | 文档链接 |
| --- | --- | --- | --- | --- |
| api | string / function | - | API地址或获取数据的函数 | 基于 [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| placeholder | string | "请选择" | 占位文本 | 基于 [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| allowClear | boolean | false | 是否允许清空 | 基于 [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| disabled | boolean | false | 是否禁用 | 基于 [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |
| showSearch | boolean | true | 是否支持搜索 | 基于 [Ant Design Vue TreeSelect](https://www.antdv.com/components/tree-select-cn/) |

## 常见问题与解决方案

### 问题1：表单字段不显示

**解决方案**：

- 检查FormItem配置是否正确添加到formSchema数组中
- 确保component属性值正确，与项目中可用的组件名称一致
- 检查字段的visible属性是否被设置为false

### 问题2：ChcSelect组件无法获取数据

**解决方案**：

- 检查dictUrl是否正确
- 确保接口返回的数据格式正确（通常需要包含records字段）
- 检查是否需要设置formatInterfaceData函数来转换数据格式
- 确认用户是否有访问该接口的权限

### 问题3：字段依赖关系不生效

**解决方案**：

- 确保正确配置了dependencies属性
- 对于ChcSelect组件，确保配置了triggerFields和triggerFieldKeys
- 检查trigger函数是否正确更新了依赖数据
- 确认依赖字段的componentProps中正确使用了dependencies值

### 问题4：表单验证不生效

**解决方案**：

- 确保设置了required: true
- 对于复杂验证，需要添加rules属性
- 检查验证规则的格式是否正确
- 确认表单提交时是否调用了验证方法

### 问题5：默认值不显示

**解决方案**：

- 确保设置了defaultValue属性
- 检查defaultValue的类型是否与字段类型匹配
- 对于动态默认值，考虑使用函数返回默认值

## 最佳实践

1. **组件选择**：根据字段类型选择合适的组件，如文本输入使用Input，选择使用Select等
2. **属性配置**：根据业务需求配置组件属性，如placeholder、allowClear等
3. **依赖关系**：合理配置字段间的依赖关系，提高用户体验
4. **验证规则**：为必填字段添加验证规则，确保数据的完整性
5. **性能优化**：对于ChcSelect组件，合理设置paginate和filterByFrontEnd属性
6. **代码组织**：将表单配置分离到单独的文件中，提高代码可维护性
7. **注释说明**：为复杂的表单配置添加注释，便于后续维护
8. **测试属性**：添加data-testid属性，便于UI自动化测试

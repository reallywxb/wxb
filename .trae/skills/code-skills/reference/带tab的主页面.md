# 带tab的主页面功能模块

## 功能模块概述与用途说明

带tab的主页面是一种常见的页面布局模式，用于在一个页面中组织多个相关的子功能模块。通过顶部的tab切换，可以在同一页面内展示不同的内容，提高用户体验和页面利用率。

**主要用途**：

- 组织具有逻辑关联的多个功能模块
- 减少页面跳转，提高操作流畅度
- 清晰展示功能分类，便于用户导航
- 支持详情页模式，实现列表与详情的无缝切换

## 核心实现原理与架构设计

### 架构设计

带tab的主页面采用以下架构：

1. **SpdPage组件**：作为主页面容器，负责整体布局和tab管理
2. **PageInnerTabs组件**：实现顶部tab切换功能
3. **子页面组件**：每个tab对应一个子页面组件，负责具体功能实现
4. **状态管理**：通过v-model绑定实现父子组件间的状态同步

### 核心原理

1. **Tab配置**：通过headerTabs数组定义tab的标签、值和禁用状态
2. **Tab切换**：通过currentTab变量控制当前激活的tab
3. **内容渲染**：使用插槽（slot）机制，根据currentTab的值渲染对应内容
4. **详情页模式**：通过goToDetailPage方法实现从列表页到详情页的切换

## 标准实现步骤与最佳实践

### 实现步骤

1. **定义tab配置**：创建headerTabs数组，定义每个tab的label、value和disabled状态
2. **初始化状态变量**：定义currentTab、currentHandleRow和detailConfig等状态变量
3. **引入子页面组件**：导入各个tab对应的子页面组件
4. **使用SpdPage组件**：在模板中使用SpdPage组件，绑定相关属性
5. **定义插槽内容**：为每个tab定义对应的插槽内容，渲染子页面组件
6. **实现tab切换逻辑**：通过v-model:current-tab实现tab切换
7. **实现详情页跳转**：使用goToDetailPage方法实现从列表到详情的跳转

### 最佳实践

1. **Tab命名规范**：tab标签应简洁明了，准确反映对应功能
2. **Tab顺序合理**：按照功能使用频率和逻辑关系排列tab顺序
3. **状态管理清晰**：使用ref和defineModel进行状态管理，确保状态同步
4. **组件拆分合理**：每个tab对应一个独立的子组件，提高代码可维护性
5. **详情页配置完整**：确保detailConfig包含必要的配置信息

## 完整的代码示例

### 主页面示例

```vue
<script lang="ts" setup>
import { ref } from 'vue';

// 页面布局组件
import SpdPage from '#/components/spd/page/spdPageNew.vue';

// 导入子页面组件
import Tab1Component from './tab1.vue';
import Tab2Component from './tab2.vue';
import Tab3Component from './tab3.vue';
import DetailComponent from './detail.vue';

// 头部tab数组
const headerTabs = ref([
  {
    label: 'Tab 1',
    value: 0,
    disabled: false,
  },
  {
    label: 'Tab 2',
    value: 1,
    disabled: false,
  },
  {
    label: 'Tab 3',
    value: 2,
    disabled: false,
  },
  {
    label: '详情页',
    value: 3,
    disabled: true,
  },
]);

// 当前显示的tab
const currentTab = ref<number>(0);

// 跳转编辑页时，标记当前正在处理的行数据
const currentHandleRow = ref<any>(undefined);

// 编辑查看页面的配置信息
const detailConfig = ref<DetailInfo | undefined>(undefined);
</script>

<template>
  <SpdPage
    v-model:current-tab="currentTab"
    v-model:header-tabs="headerTabs"
    v-model:current-handle-row="currentHandleRow"
    v-model:detail-config="detailConfig"
  >
    <!-- Tab 1 内容 -->
    <template #headerTab-0="scope">
      <Tab1Component
        v-show="currentTab === 0"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[0] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
        :get-detail-page-config="scope.getDetailPageConfig"
      />
    </template>

    <!-- Tab 2 内容 -->
    <template #headerTab-1="scope">
      <Tab2Component
        v-show="currentTab === 1"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[1] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
        :get-detail-page-config="scope.getDetailPageConfig"
      />
    </template>

    <!-- Tab 3 内容 -->
    <template #headerTab-2="scope">
      <Tab3Component
        v-show="currentTab === 2"
        v-model:current-tab="currentTab"
        :this-tab="headerTabs[2] as PageTab"
        :go-to-detail-page="scope.goToDetailPage"
      />
    </template>

    <!-- 详情页内容 -->
    <template #headerTab-3>
      <DetailComponent
        v-if="currentTab === 3"
        v-model:current-tab="currentTab"
        v-model:current-handle-row="currentHandleRow"
        v-model:detail-config="detailConfig"
        :this-tab="headerTabs[3] as PageTab"
      />
    </template>
  </SpdPage>
</template>

<style scoped></style>
```

### 子页面组件示例

**说明**：示例代码中的表格组件统一使用的useChcGrid，实际使用请根据上文判断是使用useChcGrid还是useSpdGrid

```vue
<script lang="ts" setup>
import { ref } from 'vue';
import { useChcGrid } from '#/adapter/chc-ui';

const props = defineProps<{
  currentTab: number;
  thisTab: PageTab;
  goToDetailPage: (
    row: any,
    detailPageConfig: DetailInfo,
    callBack?: () => void,
  ) => void;
  getDetailPageConfig?: () => any;
}>();

const emit = defineEmits<{
  (e: 'update:currentTab', value: number): void;
}>();

// 生成表格组件
const [ChcGrid] = useChcGrid(
  {},
  {
    gridColumns: [
      { field: 'index', fixed: 'left', title: '序号', type: 'seq', width: 50 },
      { field: 'id', minWidth: 100, sortable: true, title: 'ID' },
      { field: 'name', minWidth: 100, sortable: true, title: 'Name' },
      { field: 'value', minWidth: 100, sortable: true, title: 'Value' },
      {
        align: 'center',
        cellRender: {
          attrs: {
            onClick: onActionClick,
          },
          name: 'CustomCellMenu',
          options: ['view'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 120,
      },
    ],
    formSchema: [],
    id: 'tab.example',
    dataTableId: 'tab.example',
    showToolbar: false,
    showAddBtn: false,
    showExportBtn: false,
  },
);

// 处理自定义操作
function onActionClick({ code, row }: any) {
  switch (code) {
    case 'view': {
      handleViewDetail(row);
      break;
    }
    default: {
      break;
    }
  }
}

// 跳转到详情页
const handleViewDetail = (row: any) => {
  props.goToDetailPage(row, {
    sourcePage: props.currentTab,
    type: 'view',
    detailTitle: '查看详情',
  });
};
</script>

<template>
  <div class="p-4">
    <h3>{{ thisTab.label }}</h3>
    <div class="mt-4">
      <ChcGrid />
    </div>
  </div>
</template>

<style scoped></style>
```

## 相关组件/API的使用说明

### SpdPage组件

**属性**：

- `currentTab`：当前激活的tab值（v-model）
- `headerTabs`：tab配置数组（v-model）
- `currentHandleRow`：当前处理的行数据（v-model）
- `detailConfig`：详情页配置信息（v-model）
- `mode`：页面模式，可选值为'default'或'noTab'，默认为'default'

**插槽**：

- `headerTab-{value}`：对应tab值的内容插槽，提供goToDetailPage和getDetailPageConfig方法

### PageInnerTabs组件

**属性**：

- `tabs`：tab配置数组
- `current`：当前激活的tab值（v-model）

### 类型定义

```typescript
// Tab配置类型
type PageTab = {
  disabled?: boolean;
  label: string;
  value: number;
};

// 详情页配置类型
type DetailInfo = {
  sourcePage: number;
  type: 'add' | 'edit' | 'view';
  detailTitle: string;
  // 其他配置项...
};
```

## 常见问题与解决方案

### 问题1：tab切换后子组件数据不更新

**解决方案**：

- 确保子组件使用正确的v-show或v-if条件
- 对于需要重置数据的场景，在tab切换时添加watch监听

### 问题2：详情页跳转后无法返回

**解决方案**：

- 确保detailConfig包含正确的sourcePage值
- 检查SpdPage组件中的handleBack方法是否正常工作

### 问题3：tab禁用状态不生效

**解决方案**：

- 确保headerTabs数组中disabled属性设置正确
- 检查PageInnerTabs组件是否正确处理disabled状态

### 问题4：子组件无法访问goToDetailPage方法

**解决方案**：

- 确保在插槽中正确传递goToDetailPage方法
- 检查子组件是否正确接收props

## 代码优化建议

1. **类型定义优化**：创建统一的类型定义文件，避免重复定义
2. **状态管理优化**：对于复杂状态，考虑使用Pinia进行管理
3. **组件复用**：提取通用的tab页面逻辑，减少代码重复
4. **性能优化**：对于大型应用，考虑使用keep-alive缓存tab内容
5. **错误处理**：添加适当的错误处理和边界情况检查

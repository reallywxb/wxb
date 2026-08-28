<script lang="ts" setup>
import { computed, onMounted, provide, ref, shallowRef } from 'vue';

import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Card, Input, Tree } from 'ant-design-vue';

import RootComponent from './components/rootComponent.vue';
import SectionComponent from './components/sectionComponent.vue';
import WarehouseComponent from './components/warehouseComponent.vue';
import ZoneComponent from './components/zoneComponent.vue';
import { TREE_CONTEXT_KEY, useTree } from './index';

// 使用 shallowRef 避免不必要的深度响应式代理
const componentMap = shallowRef({
  root: RootComponent,
  warehouseType: RootComponent,
  warehouse: WarehouseComponent,
  zone: ZoneComponent,
  section: SectionComponent,
});

const treeRootRef = ref<HTMLElement>();

const {
  keyword,
  treeData,
  selectedNode,
  expandedKeys,
  queryWarehouseTree,
  expand,
  onExpand,
  onDrop,
  refreshTree,
  getNodePathIds,
} = useTree({ treeRootRef });

// 计算属性，根据 selectedNode.type 动态决定要渲染哪个组件
const activeComponent = computed(() => {
  const type = selectedNode.value?.type;
  // 返回映射中的组件，如果没有匹配则可以返回一个默认/空组件
  return type
    ? componentMap.value[type as keyof typeof componentMap.value]
    : null;
});

// 计算属性，用于高亮显示树的选中项
const selectedKeys = computed(() => {
  return selectedNode.value ? [selectedNode.value.key] : [];
});

// 树节点点击事件处理器
const handleTreeSelect = (keys: string[], { node }: any) => {
  console.warn('点击节点:', node.dataRef, keys);
  if (keys.length > 0) {
    // 更新整个 selectedNode 对象，而不是只更新ID
    selectedNode.value = {
      id: node.dataRef.id,
      text: node.dataRef.text,
      type: node.dataRef.type,
      key: node.dataRef.key,
    };
  }
};

// 使用类型安全的 provide
provide(TREE_CONTEXT_KEY, {
  refreshTree,
  selectedNode,
  getNodePathIds,
});

// 搜索按钮点击事件处理器
const search = () => {
  queryWarehouseTree();
};

onMounted(() => {
  search();
});
</script>

<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    header-class="px-3 py-2"
    class="bg-[#fff] dark:bg-[#1c1e23]"
  >
    <PageSplit
      :distribute="0.2"
      :line-thickness="6"
      :is-vertical="true"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <Card title="仓库管理" class="card">
          <div ref="treeRootRef" class="tree-container">
            <div class="tree-container--header pb-[0.5rem]">
              <Input
                allow-clear
                v-model:value.lazy="keyword"
                placeholder="回车搜索"
                @press-enter="search()"
                @clear="search()"
                data-testid="input_search"
              />
              <Button
                type="primary"
                @click="expand()"
                data-testid="button_expand"
              >
                {{ expandedKeys.length > 0 ? '收起' : '展开' }}
              </Button>
              <Button
                type="primary"
                @click="refreshTree()"
                data-testid="button_refresh"
              >
                刷新
              </Button>
            </div>
            <Tree
              class="department-tree"
              draggable
              v-model:expanded-keys="expandedKeys"
              :selected-keys="selectedKeys"
              auto-expand-parent
              :tree-data="treeData"
              :field-names="{
                children: 'children',
                label: 'text',
                key: 'key',
                value: 'value',
              }"
              block-node
              @select="handleTreeSelect"
              @drop="onDrop"
              @expand="onExpand"
              data-testid="tree_department"
            >
              <template #title="{ text }">
                <span
                  v-text="text"
                  :style="
                    keyword && text.includes(keyword)
                      ? {
                          padding: '0 4px',
                          borderRadius: '4px',
                          backgroundColor: '#FFE6B0',
                        }
                      : null
                  "
                ></span>
              </template>
            </Tree>
          </div>
        </Card>
      </template>
      <template #second>
        <component :is="activeComponent" :key="selectedNode?.key" />
      </template>
    </PageSplit>
  </Page>
</template>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  width: calc(100% - 16px);
  height: 100%;

  ::v-deep(.ant-card-body) {
    flex: 1;
    min-height: 0;
  }
}

.tree-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  &--header {
    display: flex;
    gap: 0.5rem;
  }

  ::v-deep(.ant-tree) {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
}

::v-deep(.ant-tree-node-content-wrapper) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  // background-color: pink;
}
</style>
<style lang="scss" scoped>
.ant-tree.department-tree {
  .ant-tree-treenode {
    align-items: center;
    width: 100%;
    padding: 2px;

    .ant-tree-switcher {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ant-tree-checkbox {
      margin-block-start: 0;
    }

    .ant-tree-node-content-wrapper {
      display: inline-block;
      width: 100%;
      height: 24px;
      line-height: 24px;
    }
    //&.ant-tree-treenode-selected {
    //  .ant-tree-node-content-wrapper {
    //
    //
    //    flex: 1;
    //    height: 24px;
    //    line-height: 24px;
    //  }
    //}
  }
}
</style>

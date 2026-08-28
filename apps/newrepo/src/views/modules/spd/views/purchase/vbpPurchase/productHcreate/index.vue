<script lang="ts" setup>
import type { TreeNode } from './api';

import { computed, onMounted, provide, useTemplateRef } from 'vue';

import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  MdiLightDelete,
  SvgCopyIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page, useVbenModal } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Card, Input, Tooltip, Tree } from 'ant-design-vue';

import { TREE_CONTEXT_KEY, useHCTree } from './index';
import AddAndEditBatchFormModalComp from './modals/addAndEditBatchFormModal.vue';
import CopyFormModalComp from './modals/copyFormModal.vue';
import RightViewComponent from './rightViewComponent.vue';

interface TreeSelectInfo {
  event: Event;
  selected: boolean;
  node: {
    [key: string]: any;
    dataRef: TreeNode;
  };
  selectedNodes: TreeNode[];
  nativeEvent: MouseEvent;
}

const rightViewComponentRef =
  useTemplateRef<InstanceType<typeof RightViewComponent>>('rightViewComponent');

// 计算属性，用于高亮显示树的选中项
const selectedKeys = computed(() => {
  return selectedNode.value ? [selectedNode.value.key] : [];
});

// 树节点点击事件处理器
const handleTreeSelect = (keys: string[], info: TreeSelectInfo) => {
  console.warn('点击节点:', keys, info.node.dataRef);
  if (keys.length > 0) {
    const nodeData = info.node.dataRef;
    // 判断是否选中的是父节点(国采/省采/市采/其他)
    const isParentNode = [
      'parent-C',
      'parent-N',
      'parent-O',
      'parent-P',
    ].includes(nodeData.key);
    if (isParentNode) {
      // 点击的是父节点
      console.warn('点击的是父节点:', nodeData.text);
      // 检查父节点是否有子节点
      if (nodeData.children && nodeData.children.length > 0) {
        // 如果有子节点，选中第一个子节点
        const firstChild = nodeData.children[0] as TreeNode;
        selectedNode.value = {
          id: firstChild.id,
          text: firstChild.text,
          type: firstChild.type,
          key: firstChild.key,
          vbpBatchId: firstChild.vbpBatchId!,
        };
        console.warn('自动选中的第一个子节点:', firstChild);
        // 调用右侧组件的初始化数据方法
        rightViewComponentRef.value?.initData(selectedNode.value);
      } else {
        console.warn('父节点没有子节点,不加载数据');
      }
    } else {
      selectedNode.value = {
        id: nodeData.id,
        text: nodeData.text,
        type: nodeData.type,
        key: nodeData.key, // String(keys[0])
        vbpBatchId: nodeData.vbpBatchId!,
      };
      // 点击的是子节点
      console.warn('选中批次节点:', selectedNode.value);
      // 切点切换加载右侧数据
      rightViewComponentRef.value?.initData(selectedNode.value);
    }
  }
};

// 搜索按钮点击事件处理器
const search = () => {
  batchQuery();
};

// 新增和编辑对话框
const [AddAndEditBatchFormModal, addAndEditBatchFormModalApi] = useVbenModal({
  class: 'w-[600px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: AddAndEditBatchFormModalComp,
  draggable: true,
});

// 复制
const [CopyFormModal, copyFormModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: CopyFormModalComp,
  draggable: true,
  footer: true,
});

const {
  treeState,
  treeData,
  selectedNode,
  expandedKeys,
  batchQuery,
  expand,
  onExpand,
  onDrop,
  refreshTree,
  handleAdd,
  handleEdit,
  handleDelete,
  handleCopy,
} = useHCTree({
  addAndEditBatchFormModalApi,
  copyFormModalApi,
  rightViewComponentRef,
});

// 使用类型安全的 provide
provide(TREE_CONTEXT_KEY, {
  refreshTree,
  selectedNode,
});

onMounted(() => {
  search();
});
</script>

<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    header-class="px-3 py-2"
    style="background-color: white"
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
        <AddAndEditBatchFormModal />
        <CopyFormModal />
        <Card title="集采批次" class="card">
          <div class="tree-container">
            <div class="tree-container--header pb-[0.5rem]">
              <div class="flex items-center">
                <span class="mr-[0.5rem] flex-shrink-0">状态:</span>
                <ChcSelect
                  v-model="treeState.status"
                  placeholder="请选择状态"
                  class="w-full"
                  :paginate="false"
                  :immediate="false"
                  :filter-by-front-end="true"
                  :show-search="true"
                  filter-field="label"
                  label-field="label"
                  value-field="value"
                  :options="[
                    { label: '全部', value: '' },
                    { label: '执行中', value: 'Y' },
                    { label: '未执行', value: 'N' },
                    { label: '已结束', value: 'CO' },
                  ]"
                  @change="search()"
                  data-testid="select_status"
                />
              </div>
              <div class="flex items-center">
                <span class="mr-[0.5rem] flex-shrink-0">名称:</span>
                <Input
                  allow-clear
                  v-model:value.lazy="treeState.name"
                  placeholder="回车搜索"
                  @press-enter="search()"
                  @clear="search()"
                  data-testid="input_tree_search"
                />
              </div>
              <div class="flex items-center gap-[0.5rem]">
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
              <div class="action-buttons flex items-center gap-[0.5rem]">
                <Tooltip title="新增">
                  <Button
                    type="primary"
                    shape="circle"
                    size="middle"
                    @click="handleAdd"
                    data-testid="button_tree_add"
                  >
                    <template #icon><AntdPlusCircleTwotone /></template>
                  </Button>
                </Tooltip>
                <Tooltip title="编辑">
                  <Button
                    type="primary"
                    shape="circle"
                    size="middle"
                    @click="handleEdit"
                    data-testid="button_tree_edit"
                  >
                    <template #icon><AntdEditOutlined /></template>
                  </Button>
                </Tooltip>
                <Tooltip title="删除">
                  <Button
                    type="primary"
                    shape="circle"
                    size="middle"
                    danger
                    @click="handleDelete"
                    data-testid="button_tree_delete"
                  >
                    <template #icon><MdiLightDelete /></template>
                  </Button>
                </Tooltip>
                <Tooltip title="复制">
                  <Button
                    type="primary"
                    shape="circle"
                    size="middle"
                    @click="handleCopy"
                    data-testid="button_tree_copy"
                  >
                    <template #icon><SvgCopyIcon /></template>
                  </Button>
                </Tooltip>
              </div>
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
                title: 'text',
                key: 'key',
              }"
              block-node
              @select="handleTreeSelect"
              @drop="onDrop"
              @expand="onExpand"
              data-testid="tree_batchVBPAction"
            >
              <template #title="{ text, dateRange, remark }">
                <span :title="remark || text" style="cursor: pointer">
                  <span
                    :style="
                      treeState.name && text.includes(treeState.name)
                        ? {
                            padding: '0 4px',
                            borderRadius: '4px',
                            backgroundColor: '#FFE6B0',
                          }
                        : null
                    "
                  >
                    {{ text }}
                  </span>
                  <!-- 如果有日期范围,显示日期范围 -->
                  <span v-if="dateRange" class="date-range">
                    ({{ dateRange }})
                  </span>
                </span>
              </template>
            </Tree>
          </div>
        </Card>
      </template>
      <template #second>
        <RightViewComponent
          ref="rightViewComponent"
          :tree-node-data="selectedNode"
        />
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
    flex-direction: column;
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
}

/* 日期范围样式 */
// .date-range {
//   font-weight: normal;
//   color: #666;
//   font-size: 12px;
//   margin-left: 4px;
// }
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
  }
}

.action-buttons {
  ::v-deep(.ant-btn > svg) {
    margin-bottom: 3px;
  }
}
</style>

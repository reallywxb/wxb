<script lang="ts" setup>
// const parentTableParams = ref<{ [key: string]: any }>({});
import { AntdPlusCircleTwotone } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Card, Tree } from 'ant-design-vue';

import { importProductType } from '#/views/modules/spd/views/operation/product/api';
import CommonImportModal from '#/views/modules/spd/views/operation/product/common/modals/commonImportModal.vue';

import { useGrid, useImportModal, useTree } from './index';

const { importModalRef, templateUrl } = useImportModal();

const { Grid, treeData, currentCategory, queryTree, gridApi, refresh } =
  useTree();

const {
  handleCreation,
  handleModification,
  handleDel,
  formOptions,
  ModificationModal,
} = useGrid(refresh, currentCategory, gridApi);

queryTree();
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
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <Card title="商品分类" class="card">
          <div class="tree-container">
            <div class="tree-container--header pb-[0.5rem]">
              <Button
                type="primary"
                shape="round"
                @click="queryTree()"
                data-testid="button_refresh"
              >
                刷新
              </Button>
            </div>
            <Tree
              class="department-tree"
              default-expand-all
              :selected-keys="[currentCategory?.id]"
              auto-expand-parent
              :tree-data="treeData"
              :field-names="{
                children: 'children',
                label: 'text',
                key: 'id',
                value: 'value',
              }"
              @select="
                (keys, { node }) => {
                  currentCategory = node.dataRef;
                }
              "
              data-testid="tree_department"
            >
              <template #title="{ text }">
                <span v-text="text"></span>
              </template>
            </Tree>
          </div>
        </Card>
      </template>
      <template #second>
        <Card class="card" :title="currentCategory?.text">
          <Grid>
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleCreation()"
                data-testid="button_add"
              >
                新增
                <template #icon>
                  <AntdPlusCircleTwotone style="margin-bottom: 2px" />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleModification()"
                data-testid="button_edit"
              >
                修改
              </Button>
              <Button
                type="primary"
                danger
                class="mr-[0.5rem]"
                @click="handleDel()"
                data-testid="button_delete"
              >
                删除
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="importModalRef?.open()"
                data-testid="button_import"
              >
                导入
              </Button>
            </template>
          </Grid>
        </Card>
      </template>
    </PageSplit>
  </Page>
  <ModificationModal :form-options="formOptions" :after-submit="refresh" />
  <CommonImportModal
    keyword="商品分类"
    :http-request="(params: any) => importProductType(params)"
    :template-url="templateUrl"
    :after-submit="gridApi.query"
    filename="商品分类维护模板"
    ref="importModalRef"
  />
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

.sub-endemic {
  display: flex;
  flex-direction: column;
  height: 100%;

  .grid-container {
    flex: 1;
    min-height: 0;
  }
}
</style>
<style lang="scss">
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

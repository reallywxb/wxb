<script setup lang="tsx">
import { reactive } from 'vue';

import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  AntdSettingOutlined,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, TabPane, Tabs, Tooltip } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';
import DepartmentTree from '#/views/modules/sys/views/common/tree/DepartmentTree.vue';
import { queryOrgTree } from '#/views/modules/sys/views/org/api/org';

import { useGridOptions } from './gridOptions';
import { useCommonModal } from './index';
import { searchFormOptions } from './searchFormOptions';

// const {} = useTree();

const tableSearchExtraParams = reactive<{ parentId: number | string }>({
  parentId: '',
});

function onSelect(ids: Array<number | string>, { node }: any) {
  tableSearchExtraParams.parentId = node.dataRef?.id as number | string;

  gridApi.query();
}

const [Grid, gridApi] = useCommonGrid(
  {
    formOptions: searchFormOptions,
    gridOptions: useGridOptions(),
  },
  {
    dataTableId: '/datatable/data/page/sys.org',
    tableSearchExtraParams,
  },
);

const {
  settingModalRef,
  modificationModalRef,
  formOption,
  handleAdd,
  handleEdit,
  handleSetting,
  rebuildNode,
  rebuildCode,
  settingFormOption,
  activeKey,
  settingTabOptions,
  onTabChange,
} = useCommonModal(gridApi);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :is-vertical="true"
      :distribute="0.2"
      :line-thickness="4"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <DepartmentTree
          @select="onSelect"
          class="aside-tree"
          :request="queryOrgTree"
        />
      </template>
      <template #second>
        <Grid>
          <template #toolbar-actions>
            <Button type="primary" @click="handleAdd" class="mr-2">
              新增
              <template #icon>
                <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
              </template>
            </Button>
            <Button type="primary" @click="rebuildNode()" class="mr-2">
              重建树层级
            </Button>
            <Button type="primary" @click="rebuildCode()"> 重建搜索码 </Button>
          </template>
          <template #action="{ row }">
            <Tooltip effect="dark" title="编辑" placement="top">
              <Button type="link" @click="handleEdit(row)">
                <template #icon>
                  <AntdEditOutlined class="mb-[2px] text-[16px]" />
                </template>
              </Button>
            </Tooltip>
            <Tooltip effect="dark" title="设置" placement="top">
              <Button type="link" @click="handleSetting(row)">
                <template #icon>
                  <AntdSettingOutlined class="mb-[2px] text-[16px]" />
                </template>
              </Button>
            </Tooltip>
          </template>
        </Grid>
      </template>
    </PageSplit>
    <CommonFormModal
      :after-submit="gridApi.reload"
      :form-option="formOption"
      ref="modificationModalRef"
    />

    <CommonFormModal
      :after-submit="gridApi.reload"
      :form-option="settingFormOption"
      :modal-option="{
        closeOnClickModal: false,
      }"
      ref="settingModalRef"
    >
      <template #default="{ Form }">
        <Tabs v-model:active-key="activeKey" @change="onTabChange">
          <!--eslint-disable-next-line vue/valid-v-for-->
          <TabPane v-for="item in settingTabOptions" v-bind="item" />
        </Tabs>
        <component :is="Form" class="h-[400px]" />
      </template>
    </CommonFormModal>
  </Page>
</template>

<style lang="scss" scoped>
.system-container {
  display: flex;
  flex-direction: row;

  .aside-tree {
    width: 200px;
    margin-right: 8px;
    border-radius: 8px;
  }

  .splitter {
    flex: 1;
    min-width: 0;
  }
}
</style>

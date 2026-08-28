<script setup lang="tsx">
import { reactive } from 'vue';

import {
  AntdEditOutlined,
  AntdEyeTwotone,
  AntdPlusCircleTwotone,
  MdiLightDelete,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Tooltip } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid.ts';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';
import DepartmentTree from '#/views/modules/sys/views/common/tree/DepartmentTree.vue';
import { queryDeptTree } from '#/views/modules/sys/views/dept/api/dept.ts';

import { useGridOptions, useSubGridOptions } from './gridOptions';
import { useCommonModal } from './index';
import { searchFormOptions } from './searchFormOptions';

// const {} = useTree();

const mainTableParams = reactive<{ deptId: number | string }>({
  deptId: '',
});

const parentTableParams = reactive<{ userId: number | string }>({
  userId: '',
});

function onSelect(ids: Array<number | string>, { node }: any) {
  mainTableParams.deptId = node.dataRef?.id as number | string;

  gridApi.query();

  subGridApi.grid.remove();

  subGridApi.grid.pagerConfig.total = 0;
}

const [Grid, gridApi] = useCommonGrid(
  {
    formOptions: searchFormOptions,
    gridOptions: useGridOptions(),
    gridEvents: {
      radioChange({ row }: { row: any }) {
        parentTableParams.userId = row?.id;
        if (parentTableParams.userId) subGridApi.query();
        else subGridApi.grid.reloadData([]);
      },
    },
  },
  {
    dataTableId: '/datatable/data/page/sys.user',
    // parentTableParams: mainTableParams,
  },
);

const [SubGrid, subGridApi] = useCommonGrid(
  {
    gridOptions: useSubGridOptions(),
  },
  {
    id: 'user_son',
    dataTableId: '/datatable/data/page/sys.userRole',
    parentTableParams,
  },
);

const {
  modificationModalRef,
  subModificationModalRef,
  formOption,
  subFormOption,
  handleView,
  handleAdd,
  handleEdit,
  handleDel,

  handleSubAdd,
  handleSubEdit,
  handleSubDel,
} = useCommonModal(gridApi, subGridApi);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <div class="system-container h-full">
      <DepartmentTree
        @select="onSelect"
        class="aside-tree"
        :request="queryDeptTree"
      />
      <PageSplit
        class="splitter"
        :is-vertical="false"
        :distribute="0.5"
        :line-thickness="4"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <Grid>
            <template #toolbar-actions>
              <Button type="primary" @click="handleAdd()">
                新增
                <template #icon>
                  <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
                </template>
              </Button>
            </template>
            <template #action="{ row }">
              <Tooltip effect="dark" title="查看" placement="top">
                <Button type="link" @click="handleView(row)">
                  <template #icon>
                    <AntdEyeTwotone class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </Tooltip>

              <Tooltip effect="dark" title="编辑" placement="top">
                <Button type="link" @click="handleEdit(row)">
                  <template #icon>
                    <AntdEditOutlined class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </Tooltip>
              <Tooltip effect="dark" title="删除" placement="top">
                <Button type="link" danger @click="handleDel(row)">
                  <template #icon>
                    <MdiLightDelete class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </Tooltip>
            </template>
          </Grid>
        </template>
        <template #second>
          <SubGrid>
            <template #toolbar-actions>
              <Button
                :disabled="!parentTableParams.userId"
                type="primary"
                @click="handleSubAdd(parentTableParams.userId)"
              >
                新增
                <template #icon>
                  <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
                </template>
              </Button>
            </template>
            <template #action="{ row }">
              <Tooltip effect="dark" title="编辑" placement="top">
                <Button type="link" @click="handleSubEdit(row)">
                  <template #icon>
                    <AntdEditOutlined class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </Tooltip>
              <Tooltip effect="dark" title="删除" placement="top">
                <Button type="link" danger @click="handleSubDel(row)">
                  <template #icon>
                    <MdiLightDelete class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </Tooltip>
            </template>
          </SubGrid>
        </template>
      </PageSplit>
    </div>
    <CommonFormModal
      :after-submit="gridApi.reload"
      :form-option="formOption"
      ref="modificationModalRef"
    />
    <CommonFormModal
      :after-submit="subGridApi.reload"
      :form-option="subFormOption"
      ref="subModificationModalRef"
    />
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

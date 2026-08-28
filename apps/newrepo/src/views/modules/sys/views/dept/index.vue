<script lang="ts" setup>
import { reactive } from 'vue';

import {
  AntdEditOutlined,
  AntdEyeTwotone,
  AntdPlusCircleTwotone,
  MdiLightDelete,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, Tooltip } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid.ts';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';
import DepartmentTree from '#/views/modules/sys/views/common/tree/DepartmentTree.vue';
import { queryDeptTree } from '#/views/modules/sys/views/dept/api/dept.ts';

import { gridOptions } from './gridOptions.ts';
import { useCommonModal } from './index.ts';
import { searchFormOptions } from './searchFormOptions.ts';

const parentTableParams = reactive<{ parentId: number | string }>({
  parentId: '',
});

function onSelect(ids: Array<number | string>, { node }: any) {
  parentTableParams.parentId = node.dataRef?.id as number | string;

  gridApi.query();
}

const [Grid, gridApi] = useCommonGrid(
  {
    formOptions: searchFormOptions,
    gridOptions,
  },
  {
    dataTableId: '/datatable/data/page/sys.dept',
    parentTableParams,
  },
);

const {
  modificationModalRef,
  formOption,
  handleView,
  handleAdd,
  handleEdit,
  handleDel,
} = useCommonModal(gridApi);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <div class="system-container h-full">
      <DepartmentTree
        @select="onSelect"
        class="aside-tree"
        :request="queryDeptTree"
      />
      <Grid class="splitter">
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
    </div>
    <CommonFormModal
      :after-submit="gridApi.reload"
      :form-option="formOption"
      ref="modificationModalRef"
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

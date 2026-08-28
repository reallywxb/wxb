<script setup lang="tsx">
import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  MdiLightDelete,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, Tooltip } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid.ts';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';

import { useGridOptions } from './gridOptions';
import { useCommonModal } from './index';
import { searchFormOptions } from './searchFormOptions';

// const {} = useTree();

const [Grid, gridApi] = useCommonGrid(
  {
    formOptions: searchFormOptions,
    gridOptions: useGridOptions(),
  },
  {
    dataTableId: 'datatable/data/page/sys.tenant',
  },
);

const { modificationModalRef, formOption, handleAdd, handleEdit, handleDel } =
  useCommonModal(gridApi);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
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
    <CommonFormModal
      :after-submit="gridApi.reload"
      :form-option="formOption"
      ref="modificationModalRef"
    />
  </Page>
</template>

<style lang="scss" scoped>
.page {
  height: calc(100% - 12px);
  overflow: hidden;
}
</style>

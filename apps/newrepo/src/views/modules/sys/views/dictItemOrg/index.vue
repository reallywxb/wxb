<script lang="ts" setup>
import { ref } from 'vue';

import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  MdiLightDelete,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, Tooltip } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid.ts';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';

import { gridOptions } from './gridOptions.ts';
import { useCommonModal } from './index.ts';
import { searchFormOptions } from './searchFormOptions.ts';

const selectedCount = ref(0);

function onCheckboxChange() {
  selectedCount.value = gridApi.grid.getCheckboxRecords().length;
}

const [Grid, gridApi] = useCommonGrid(
  {
    formOptions: searchFormOptions,
    gridOptions,
    gridEvents: {
      checkboxChange: onCheckboxChange,
      checkboxAll: onCheckboxChange,
    },
  },
  {
    dataTableId: '/datatable/data/page/sys.dictItemOrg',
  },
);

const {
  dictCopyModalRef,
  dictCopyFormOption,
  modificationModalRef,
  formOption,
  handleAdd,
  handleCopyDict,
  batchDelete,
  handleEdit,
  handleDel,
  clearSelection,
} = useCommonModal(gridApi);
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
        <Button type="primary" @click="handleCopyDict()" class="ml-[10px]">
          字典引入
          <template #icon>
            <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
          </template>
        </Button>
        <Button type="primary" danger @click="batchDelete()" class="ml-[10px]">
          批量删除
          <template #icon>
            <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <span>当前表格已选择 {{ selectedCount }} 项</span>

        <Button type="link" @click="clearSelection()"> 清空 </Button>
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
    <CommonFormModal
      :after-submit="gridApi.reload"
      :form-option="dictCopyFormOption"
      ref="dictCopyModalRef"
    />
  </Page>
</template>

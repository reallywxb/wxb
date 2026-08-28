<script lang="ts" setup>
import { reactive } from 'vue';

import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  MdiLightDelete,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Tooltip } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid.ts';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';

import { gridOptions, subGridOptions } from './gridOptions.ts';
import { useCommonModal } from './index.ts';
import { searchFormOptions } from './searchFormOptions.ts';

const parentTableParams = reactive({
  employeeId: '',
});
const [Grid, gridApi] = useCommonGrid(
  {
    formOptions: searchFormOptions,
    gridOptions,
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        parentTableParams.employeeId = row.id;
        subGridApi.query();
      },
    },
  },
  {
    dataTableId: '/datatable/data/page/sys.employee',
  },
);

const [SubGrid, subGridApi] = useCommonGrid(
  {
    gridOptions: {
      ...subGridOptions,
    },
  },
  {
    dataTableId: '/datatable/data/page/sys.employeePartTime',
    parentTableParams,
  },
);

const {
  subModificationModalRef,
  modificationModalRef,
  formOption,
  subFormOption,
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
    <PageSplit
      :is-vertical="false"
      :distribute="0.6"
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
              type="primary"
              @click="handleSubAdd()"
              :disabled="!parentTableParams.employeeId"
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

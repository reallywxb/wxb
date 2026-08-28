<script lang="ts" setup>
import {
  AntdEditOutlined,
  AntdEyeTwotone,
  AntdPlusCircleTwotone,
  AntdSettingOutlined,
  MdiLightDelete,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, Tooltip } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid.ts';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';
import PermissionGridModal from '#/views/modules/sys/views/common/modals/permissionGridModal.vue';

import { gridOptions } from './gridOptions.ts';
import { useCommonModal, usePermissionModal } from './index.ts';
import { searchFormOptions } from './searchFormOptions.ts';

const [Grid, gridApi] = useCommonGrid(
  {
    formOptions: searchFormOptions,
    gridOptions,
  },
  {
    dataTableId: 'datatable/data/page/sys.role',
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

const { handlePermission, permissionModalRef } = usePermissionModal();
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
        <Tooltip effect="dark" title="权限设置" placement="top">
          <Button type="link" @click="handlePermission(row)">
            <template #icon>
              <AntdSettingOutlined class="mb-[2px] text-[16px]" />
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
    <PermissionGridModal
      :after-submit="gridApi.reload"
      ref="permissionModalRef"
    />
  </Page>
</template>

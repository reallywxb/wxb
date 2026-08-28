<script lang="ts" setup>
import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  AntdSettingOutlined,
  MdiLightDelete,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, Tooltip } from 'ant-design-vue';

import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';

import { useCommonModal, useGrid } from './index';

const { Grid, gridApi } = useGrid();

const {
  modificationModalRef,
  formOption,
  handleAdd,
  handleEdit,
  handleDel,
  handleCache,
  handleSyncMenu,
} = useCommonModal(gridApi);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <Grid>
      <template #toolbar-actions>
        <Button type="primary" @click="handleAdd()" class="mr-1">
          新增
          <template #icon>
            <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
          </template>
        </Button>
        <!-- <Button type="primary" @click="handleCache()" class="mr-1">
          清除缓存
          <template #icon>
            <AntdSettingOutlined class="mb-[2px] text-[16px]" />
          </template>
        </Button>
        <Button type="primary" @click="handleSyncMenu()" class="mr-1">
          同步菜单
          <template #icon>
            <AntdSettingOutlined class="mb-[2px] text-[16px]" />
          </template>
        </Button> -->
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
  </Page>
  <CommonFormModal
    :after-submit="gridApi.reload"
    :form-option="formOption"
    ref="modificationModalRef"
  />
</template>

<style lang="scss" scoped>
.tabs {
  height: 100%;

  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
</style>

<script lang="ts" setup>
import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  MdiLightDelete,
  PlusOutlined,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, Tooltip } from 'ant-design-vue';

import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';

import { useCommonModal, useGrid } from './index';
import ImportModal from './modals/importModal.vue';

const { Grid, gridApi } = useGrid();

const {
  modificationModalRef,
  formOption,
  contentFormOption,
  contentModalRef,
  importModalRef,
  handleAdd,
  handleEdit,
  handleDel,
  handleContent,
  handleUpload,
  handleDownload,
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
        <Tooltip effect="dark" title="编辑内容" placement="top">
          <Button type="link" danger @click="handleContent(row)">
            <template #icon>
              <PlusOutlined class="mb-[2px] text-[16px]" />
            </template>
          </Button>
        </Tooltip>
        <Tooltip effect="dark" title="上传" placement="top">
          <Button type="link" danger @click="handleUpload(row)">
            <template #icon>
              <PlusOutlined class="mb-[2px] text-[16px]" />
            </template>
          </Button>
        </Tooltip>
        <Tooltip effect="dark" title="下载" placement="top">
          <Button type="link" danger @click="handleDownload(row)">
            <template #icon>
              <PlusOutlined class="mb-[2px] text-[16px]" />
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

  <CommonFormModal
    :modal-option="{
      confirmText: '保存',
    }"
    :form-option="contentFormOption"
    ref="contentModalRef"
  />
  <ImportModal ref="importModalRef" />
</template>

<style lang="scss" scoped>
.tabs {
  height: 100%;

  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
</style>

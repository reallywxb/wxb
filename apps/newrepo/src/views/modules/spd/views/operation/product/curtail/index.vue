<script lang="ts" setup>
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { importCurtail } from '#/views/modules/spd/views/operation/product/api';
import CommonImportModal from '#/views/modules/spd/views/operation/product/common/modals/commonImportModal.vue';

import { useGrid, useImportModal, useModificationModal } from './index';

const { ParentGrid, parentGridApi, handleExport } = useGrid();

const {
  modificationFormOptions,
  ModificationModal,
  handleBatchModification,
  handleReset,
} = useModificationModal({
  parentGridApi,
});

const { importModalRef, templateUrl } = useImportModal();

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ParentGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleBatchModification()"
          data-testid="button_batchModify"
        >
          批量修改
          <!--              <template #icon>-->
          <!--                <SvgPrintFillIcon />-->
          <!--              </template>-->
        </Button>
        <Button
          ghost
          danger
          type="primary"
          class="mr-[0.5rem]"
          @click="handleReset()"
          data-testid="button_reset"
        >
          重置
          <!--              <template #icon>-->
          <!--                <SvgPrintFillIcon />-->
          <!--              </template>-->
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="importModalRef?.open()"
          data-testid="button_import"
        >
          导入
          <!--              <template #icon>-->
          <!--                <SvgPrintFillIcon />-->
          <!--              </template>-->
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleExport?.()"
          data-testid="button_export"
        >
          导出
          <!--              <template #icon>-->
          <!--                <SvgPrintFillIcon />-->
          <!--              </template>-->
        </Button>
      </template>
    </ParentGrid>
  </Page>
  <ModificationModal
    :form-options="modificationFormOptions"
    :after-submit="parentGridApi.query"
  />
  <CommonImportModal
    keyword="采购限量"
    :http-request="(params: any) => importCurtail(params)"
    :template-url="templateUrl"
    :after-submit="parentGridApi.query"
    ref="importModalRef"
  />
</template>

<script lang="ts" setup>
import type { CrudGridOptions } from '#/types/common';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useChcGrid } from '#/adapter/chc-ui.ts';

defineOptions({
  name: 'CommonGridModal',
});

const props = defineProps<{
  afterSubmit?: () => void;
  gridOption: CrudGridOptions<deptDto>;
}>();

interface Param {
  title: string;
  data: any;
}

const param = ref<Param>();

const [Grid, gridApi] = useChcGrid({
  gridOptions: props.gridOption,
});

const [Modal, modalApi] = useVbenModal({
  class: 'w-[800px]',
  showCancelButton: false,
  showConfirmButton: false,
  onCancel() {
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      param.value = modalApi.getData() as Param;

      setTimeout(() => {
        gridApi.grid.loadData(param.value.data);
      });
    }
  },
});

defineExpose({ modalApi, gridApi });
</script>
<template>
  <Modal :title="param?.title">
    <Grid />
  </Modal>
</template>

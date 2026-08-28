<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      // cellConfig: {
      //   height: 32,
      // },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'ColumnName',
        minWidth: 120,
        sortable: true,
        title: '变更列',
      },
      {
        field: 'OldValue',
        minWidth: 120,
        sortable: true,
        title: '旧值',
      },
      {
        field: 'NewValue',
        minWidth: 120,
        sortable: true,
        title: '新值',
      },
      {
        field: 'UpdatedBy',
        minWidth: 120,
        sortable: true,
        title: '操作人',
      },
      {
        field: 'Updated',
        minWidth: 120,
        sortable: true,
        title: '操作时间',
      },
    ],
    dataTableId: '/changeLogHandleAction/queryChangeLog.do',
    id: 'queryProductOrgLog',
    tableSearchExtraParams: {},
    getTableArrDataFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const data = ref();
const title = ref('');
const productOrgId = ref<null | number | string>(null);

const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  confirmDisabled: false,
  showCancelButton: true,
  showConfirmButton: false,
  cancelText: '关闭',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      if (data.value.openType === 'viewChangeLog') {
        title.value = '变更日志';
        productOrgId.value = data.value.formData.productOrgId;
        nextTick(() => {
          ChcGridApi.query({ Record_ID: productOrgId.value, tableName: "M_Product_Org"  });
        });
        ChcGridApi.query({ Record_ID: productOrgId.value, tableName: "M_Product_Org" });
      }
    } else {
      title.value = '';
      productOrgId.value = null;
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst confirm-text="确定" :title="title">
    <ChcGrid style="height: 600px" />
  </ModalFirst>
</template>

<style scoped lang="scss">
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>

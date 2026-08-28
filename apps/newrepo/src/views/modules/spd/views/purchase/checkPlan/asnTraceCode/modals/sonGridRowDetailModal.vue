<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalTitle = ref('');
const modalData = ref<Record<string, any>>({});
const currentEditRow = ref();
const currentField = ref();
const EDITABLE_FIELDS = new Set(['serNo']);
const handleEditActivated = (scope: any) => {
  // 用于获取当前正在操作行和列的赋值
  currentEditRow.value = cloneDeep(toRaw(scope.row));
  currentField.value = cloneDeep(toRaw(scope.column.field));
};
const handleEditClosed = (scope: any) => {
  if (scope.column.field === 'serNo') {
    const oldVal = currentEditRow.value.serNo;
    const newVal = scope.row.serNo;
    console.warn('handleEditClosed oldVal', oldVal);
    console.warn('handleEditClosed newVal', newVal);
    console.warn('handleEditClosed currentEditRow', currentEditRow.value);

    const isSame = oldVal === newVal;
    console.warn('handleEditClosed 是否相等', isSame);
    if (!isSame) {
      handleSave(cloneDeep(toRaw(scope.row)));
    }
  }
};
const handleSave = async (row: any) => {
  try {
    await requestFormClient.post('/packageAction/updatePackage.do', {
      packageId: row.packageId,
      serNo: row.serNo,
    });
    message.success('保存成功');
    await chcGridApi.grid.clearEdit();
    chcGridApi.query();
  } catch (error) {
    console.warn('handleSave 保存失败', error);
  } finally {
    currentEditRow.value = null;
    currentField.value = '';
  }
};
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      keepSource: true,
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'dblclick', // dblclick
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      cellStyle: ({ column }: { column: any }) => {
        if (EDITABLE_FIELDS.has(column.field)) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      editActivated: handleEditActivated,
      editClosed: handleEditClosed,
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'packageNo',
        title: '包装号',
        width: '200',
        sortable: false,
      },
      {
        field: 'qtyDelivered',
        title: '数量',
        width: '70',
        sortable: false,
        align: 'right',
      },
      {
        field: 'serNo',
        title: '厂家码',
        width: '100',
        sortable: false,
        editRender: {
          name: 'VxeInput',
          props: {},
        },
      },
      {
        field: 'checkerName',
        title: '验收人',
        width: '100',
        sortable: false,
      },
      {
        field: 'checkTime',
        title: '验收时间',
        width: '120',
        sortable: false,
      },
      {
        field: 'putawayName',
        title: '上架人',
        width: '100',
        sortable: false,
      },
      {
        field: 'putawayTime',
        title: '上架时间',
        width: '120',
        sortable: false,
      },
      {
        field: 'rejectReasonName',
        title: '拒收原因',
        width: '120',
        sortable: false,
      },
    ],
    formSchema: [],
    queryUrl: '/asnAction/queryPackageDetail.do',
    id: 'sonGridRowDetailModal',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      params.asnLineId = modalData.value?.row?.asnLineId;
      params.checkStatus = modalData.value?.checkStatus;
      params.isPutaway = modalData.value?.isPutaway;
      params.orderLineId = modalData.value?.row?.orderLineId;
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      console.warn('afterFetchFn params.rows', params.rows);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  confirmText: '确认',
  showCancelButton: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },

  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const mData = modalApi.getData<Record<string, any>>();
      modalData.value = {};
      modalData.value = mData;
      console.warn('modalData', modalData);
      modalTitle.value = mData.modalTitle || modalTitle.value;
      console.warn('onOpenChange modalData', modalData.value);

      setTimeout(() => {
        chcGridApi.query();
      }, 200);
    }
  },
  async onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
});
onMounted(() => {});
</script>
<template>
  <Modal class="h-[500px] w-[900px]" :title="modalTitle">
    <div class="h-full">
      <ChcGrid />
    </div>
  </Modal>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>

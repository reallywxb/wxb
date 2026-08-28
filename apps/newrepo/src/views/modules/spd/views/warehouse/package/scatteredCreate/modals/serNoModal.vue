<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

import { message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const modalData = ref<Record<string, any>>({});
const EDITABLE_FIELDS = new Set(['serNo']);

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
      pagerConfig: {
        enabled: false,
      },
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'dblclick',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      seqConfig: {
        seqMethod: ({ rowIndex }: { rowIndex: number }) => {
          return rowIndex + 1;
        },
      },
      keepSource: true,
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
      editActivated: (scope: any) => {
        console.warn('editActivated', scope);
      },
      editClosed: (scope: any) => {
        console.warn('editClosed', scope);
      },
    },
  },
  {
    id: 'scatteredCreate_sero',
    showCustomBtn: true,
    showZoomBtn: true,
    gridColumns: [
      {
        type: 'seq',
        width: '50',
        align: 'center',
        title: '序号',
      },
      {
        field: 'serNo',
        title: '厂家码',
        sortable: false,
        align: 'right',
        editRender: {
          name: 'VxeInput',
          props: {},
        },
      },
    ],
  },
);
const handlePrint = (ids: (number | string)[]) => {
  Modal.confirm({
    title: '打印提示',
    content: '确认打印？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${ids.join(',')}`,
      });
    },
    onCancel() {},
  });
};
const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '取消',
  confirmText: '提交',
  zIndex: 1000,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      setTimeout(() => {
        ChcGridApi.grid.reloadData([]);
        const tableData = [];
        const qty = modalData.value?.params.qty || 0;
        for (let i = 0; i < qty; i++) {
          tableData.push({
            serNo: '',
          });
        }
        ChcGridApi.grid.reloadData(tableData);
      }, 200);
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const submitRows: any[] = ChcGridApi.grid.getTableData().fullData || [];
    const unProxyRows = toRaw(submitRows);
    console.warn('onConfirm submitRows:', submitRows);
    console.warn('onConfirm unProxyRows:', unProxyRows);
    let error = false;
    const sernos: any[] = [];
    const check: Record<string, any> = {};
    unProxyRows.forEach((item, index) => {
      if (!item.serNo || item.serNo === '') {
        message.warning(`第${index + 1}行数据为空！`);
        error = true;
      } else {
        sernos.push(item.serNo);
        check[item.serNo] = item.serNo;
      }
    });
    if (Object.keys(check).length === 0) {
      message.warning('厂家码为空！');
      return;
    }
    if (unProxyRows.length !== Object.keys(check).length) {
      message.warning('厂家码有重复！');
      return;
    }
    if (error) {
      return;
    }
    const params = {
      ...modalData.value?.params,
      sernos: JSON.stringify(sernos),
    };
    console.warn('onConfirm params:', params);
    Modal.confirm({
      title: '提示',
      content: '确认加工？',
      onOk: async () => {
        try {
          const res = await requestFormClient.post(
            'packageAction/createPackageFromScatter.do',
            params,
          );
          console.warn('onConfirm res', res);
          handlePrint(res.data);
          modalApi.close();
          modalData.value?.callback();
        } catch (error) {
          console.warn('err', error);
        }
      },
    });
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst title="厂家码采集">
    <ChcGrid />
  </ModalFirst>
</template>

<style scoped lang="less">
.checkStyle {
  margin: 5px;
}
</style>

<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalTitle = ref('选择包装');
const modalData = ref<Record<string, any>>({});

const [ChcGridUI, ChcGridApi] = useSpdGrid(
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
    }),
    // 添加表格事件监听
    gridEvents: {},
  },
  {
    gridColumns: [
      {
        type: 'checkbox',
        width: 60,
        align: 'center',
      },
      {
        field: 'packageNo',
        title: '包装号',
        width: 100,
        sortable: false,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '90',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '90',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '100',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        width: '50',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '40',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        width: '80',
        sortable: false,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '80',
        sortable: false,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '120',
        sortable: true,
      },
      {
        field: 'price',
        title: '进价',
        width: '70',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: 100,
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '90',
        sortable: false,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        disabled: true,
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {
            placeholder: '编码/拼音码/名称',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: () => {
          return {
            placeholder: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '请选择',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        componentProps: () => {
          return {
            placeholder: '批号',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'storageStatus',
        label: '库存状态',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            placeholder: '请选择',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'inoutNo',
        label: '入库单号',
        componentProps: () => {
          return {
            placeholder: '入库单号',
          };
        },
      },
    ],
    queryUrl: '/packageAction/query.do',
    id: 'orderCreatePackage_choosePkg',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);

      const warehouseId = modalData.value.warehouseId;
      if (!warehouseId || warehouseId === '') {
        message.warning('调出仓库不可为空!');
        return;
      }
      params.warehouseId = warehouseId;
      params.packageStatus = 'S'; // 在库
      params.isPicking = 'N';
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
  cancelText: '关闭',
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
        ChcGridApi.formApi.setValues({
          warehouseId: mData.warehouseId,
        });
      }, 200);
    }
  },
  async onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
    const checkedRows = ChcGridApi.grid.getCheckboxRecords();
    const unProxyRows: any[] = toRaw(checkedRows);
    console.warn('onConfirm checkedRows', checkedRows);
    console.warn('onConfirm unProxyRows', unProxyRows);
    if (isEmpty(unProxyRows)) {
      message.warning('请选择一条记录');
      return;
    }
    const selectedRows: any[] = modalData.value?.checkedRows || [];
    let error = false;
    selectedRows.forEach((item) => {
      if (Number(item.warehouseId) !== Number(modalData.value.warehouseId)) {
        message.warning('与已选包装的仓库与当前仓库不一致!');
        error = true;
      }
    });
    if (error) {
      return;
    }
    // let errorMsg = '';
    let duplicateCount = 0;
    // let successCount = 0;
    (unProxyRows as any[]).forEach((item: any) => {
      if (Number(item.warehouseId) !== Number(modalData.value.warehouseId)) {
        // errorMsg +=
        //   `第${index + 1}行,${item.productName}(${item.productCode})` +
        //   `仓库错误!<br>`;
        error = true;
        return;
      }
      // 判断有没有扫过
      let hasScaned = false;
      selectedRows.forEach((o) => {
        if (o.packageNo === item.packageNo) {
          hasScaned = true;
        }
      });
      if (hasScaned) {
        duplicateCount++;
      } else {
        selectedRows.unshift(item);
        // successCount++;
      }
    });
    if (error) {
      return;
    }
    modalApi.close();
    modalData.value?.callback(selectedRows);
    if (duplicateCount > 0) {
      message.warning(`有${duplicateCount}个包装已在选择列表中！`);
    }
  },
});
onMounted(() => {});
</script>
<template>
  <Modal class="h-[800px] w-[80%]" confirm-text="确定" :title="modalTitle">
    <div class="h-full">
      <ChcGridUI />
    </div>
  </Modal>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>

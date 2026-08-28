<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
const route = useRoute();

// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
});
const cache = {};
const gridData = ref<Record<string, any>[]>([]);
const totalQty = ref<number>(0);
const resetState = () => {
  ChcGridApi.formApi.resetForm();
  totalQty.value = 0;
  gridData.value = [];
  ChcGridApi.grid.reloadData([]);
};
// 映射接口返回到表单字段
const mapResToFormValues = (d: Record<string, any>) => ({
  productName: d.productName ?? d.ProductName ?? '',
  productCode: d.productCode ?? d.ProductCode ?? '',
  productSpec: d.productSpec ?? d.productSpecName ?? d.Spec ?? '',
  modelNo: d.modelNo ?? d.ModelNo ?? '',
  vendorName: d.vendorName ?? d.VendorName ?? '',
  uomName: d.uomName ?? d.UomName ?? d.unitName ?? '',
  manufacturer: d.manufacturer ?? d.manufacture ?? d.manufactureName ?? '',
  lot: d.lot ?? d.Lot ?? '',
  guaranteeDate: d.guaranteeDate ?? d.GuaranteeDate ?? d.expireDate ?? '',
});
const getListData = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.packageNo) {
    return message.warning('请输入包装号');
  }
  const submitRows: any[] = ChcGridApi.grid.getTableData().fullData || [];
  if (formValues.revertScan) {
    // 反扫

    gridData.value = submitRows.filter(
      (item) => item.packageNo !== formValues.packageNo,
    );
    ChcGridApi.grid.reloadData(gridData.value);
    // 当已无任何行时，清空回显和缓存
    if (gridData.value.length === 0) {
      ChcGridApi.formApi.setValues({
        productName: '',
        productCode: '',
        productSpec: '',
        modelNo: '',
        vendorName: '',
        uomName: '',
        manufacturer: '',
        lot: '',
        guaranteeDate: '',
      });
    }
    ChcGridApi.formApi.setValues({
      packageNo: '',
    });
    return;
  }
  let hasScanned = false;
  submitRows.forEach((item) => {
    if (item.packageNo === formValues.packageNo) {
      hasScanned = true;
    }
  });
  if (hasScanned) {
    message.warning('不可重复扫描');
    return;
  }

  try {
    const res = await requestFormClient.post('/packageAction/query.do', {
      packageNo: formValues.packageNo,
      isQueryProductUom: 'Y',
      packageStatus: 'S',
      isAccurate: 'Y',
    });
    console.warn('getListData res', res);
    if (res.total === 0) {
      message.warning('未找到包装信息');
      resetState();

      return;
    }
    const data = res.rows[0] || {};
    if (!cache.lot) {
      // 如果没有记录批号等信息则记录批号等信息
      cache.lot = data.Lot;
      cache.productCode = data.ProductCode;
    }
    if (cache.lot === data.Lot && cache.productCode === data.ProductCode) {
      const clonedRows = deepClone(submitRows);
      clonedRows.push({
        packageNo: formValues.packageNo,
        qty: data.qty,
        qtyText: data.qtyText,
      });
      gridData.value = clonedRows;
      ChcGridApi.grid.reloadData(gridData.value);
      // 回显表单数据
      ChcGridApi.formApi.setValues({
        ...mapResToFormValues(data),
      });
      setTotalQty();
      ChcGridApi.formApi.setValues({
        packageNo: '',
      });
    } else {
      message.warning('与已扫药品不一致');
    }
  } catch (error) {
    console.error(error);
  }
};
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // fieldMappingTime: [
      //   ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      // ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
      showDefaultActions: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
      seqConfig: {
        seqMethod: ({ rowIndex }: { rowIndex: number }) => {
          return rowIndex + 1;
        },
      },
    }),

    // 添加表格事件监听
    gridEvents: {
      editClosed: (scope: any) => {
        console.warn('editClosed', scope);
        // setLeaveQty();
      },
    },
  },
  {
    gridColumns: [
      {
        type: 'seq',
        width: '50',
        align: 'center',
        title: '序号',
      },
      {
        field: 'packageNo',
        title: '包装号',
        // width: '250',
        sortable: false,
      },
      {
        field: 'qty',
        title: '数量',
        // width: '200',
        align: 'right',
        sortable: false,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: () => {
          return {
            placeholder: '',
            onPressEnter: (e) => {
              console.warn('onPressEnter', e);
              // 在这里处理回车事件 组织默认请求
              e.preventDefault && e.preventDefault();
              e.stopPropagation && e.stopPropagation();
              getListData();
            },
          };
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'revertScan',
        label: '反扫',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
        disabled: true,
        componentProps: () => {
          return {
            placeholder: ' ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productCode',
        label: '药品编码',
        disabled: true,
        componentProps: () => {
          return {
            placeholder: ' ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productSpec',
        label: '规格',
        disabled: true,
        componentProps: () => {
          return {
            placeholder: ' ',
          };
        },
      },
      // {
      //   component: 'Input',
      //   fieldName: 'modelNo',
      //   label: '型号',
      //   disabled: true,
      //   componentProps: () => {
      //     return {
      //       placeholder: ' ',
      //     };
      //   },
      // },
      {
        component: 'Input',
        fieldName: 'vendorName',
        label: '供应商',
        disabled: true,
        componentProps: () => {
          return {
            placeholder: ' ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'uomName',
        label: '单位',
        disabled: true,
        componentProps: () => {
          return {
            placeholder: ' ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'manufacturer',
        label: '厂家',
        disabled: true,
        componentProps: () => {
          return {
            placeholder: ' ',
          };
        },
      },

      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        disabled: true,
        componentProps: () => {
          return {
            placeholder: ' ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'guaranteeDate',
        label: '效期',
        disabled: true,
        componentProps: () => {
          return {
            placeholder: ' ',
          };
        },
      },
      // {
      //   component: 'DateGroup',
      //   fieldName: 'guaranteeDate',
      //   label: '效期',
      //   disabled: true,
      //   componentProps: () => {
      //     return {
      //       disabled: true,
      //       placeholder: ' ',
      //     };
      //   },
      // },
    ],
    id: 'packageMerge',

    // showCustomBtn: true,
    // showZoomBtn: true,
  },
);
const setTotalQty = () => {
  let total = 0;
  const submitRows: any[] = ChcGridApi.grid.getTableData().fullData || [];
  submitRows?.forEach((item) => {
    if (!Number.isNaN(item.qty)) {
      total = total + item.qty;
    }
  });
  totalQty.value = total;
};

const handleSubmit = async () => {
  const submitRows: any[] = ChcGridApi.grid.getTableData().fullData || [];
  console.warn('handleSubmit submitRows:', submitRows);
  const params: Record<string, any> = {};
  const line: any[] = [];
  submitRows.forEach((item) => {
    if (item.packageNo) {
      line.push({ packageNo: item.packageNo });
    }
  });
  if (line.length === 0) {
    message.error('请录入数据');
    return;
  }
  params.line = line;
  Modal.confirm({
    title: '提醒',
    content: '确认并包吗',
    onOk: async () => {
      try {
        const res = await requestFormClient.post('/packageAction/merge.do', {
          data: JSON.stringify(params),
        });
        resetState();
        globalPrintStore.print({
          pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}packageAction/printPackageDoc.do?id='${res.data.join(',')}`,
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleSubmit"
          class="mr-[0.5rem]"
          data-testid="button_submit"
        >
          确认
        </Button>
      </template>
      <template #toolbar-tools>
        <span class="">总数量：{{ totalQty }}</span>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.date-group-container) {
  background-color: #3236390a;
}

::v-deep(.date-group-container):hover {
  border-color: #e4e4e7 !important;
}
</style>

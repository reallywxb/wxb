<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';
import { cloneDeep, isEmpty, isFunction, isObject } from '@vben/utils';

import { Button, InputNumber, message, Modal } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import { formSchema } from './options';

const route = useRoute();
const globalPrintStore = useGlobalPrintStore();
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const isNarcotic = urlParams.isNarcotic || undefined;
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  chcGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});
const extParams = ref<any>({
  isNarcotic,
  specShowType: 'warehouse',
  isLack: 'Y',
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};

// 辅助函数
function resolvePropsFn(cp: any): () => any {
  return isFunction(cp) ? cp : () => (isObject(cp) ? cp : {});
}

// 处理表单院区和仓库级联
const handleFormSchema = () => {
  const schema = cloneDeep(formSchema);
  schema?.forEach((item: any) => {
    if (item.fieldName === 'departmentId') {
      const baseFn = resolvePropsFn(item.componentProps);
      item.componentProps = () => {
        const props = baseFn() as any;
        const originalAfterFetch = props?.afterFetch;
        return {
          ...props,
          allowClear: true,
          afterFetch: (res: any, ...rest: any[]) => {
            chcGridApi.formApi?.setFieldValue(
              'departmentId',
              isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
            );
            const result = isFunction(originalAfterFetch)
              ? originalAfterFetch(res, ...rest)
              : res;
            if (!isFirstLoaded.value) {
              searchController.sign(1);
            }
            return result;
          },
        };
      };
    }
    if (item.fieldName === 'warehouseId') {
      const baseFn = resolvePropsFn(item.componentProps);
      item.componentProps = () => {
        const props = baseFn() as any;
        const originalAfterFetch = props?.afterFetch;
        return {
          ...props,
          immediate: false,
          afterFetch: (res: any, ...rest: any[]) => {
            chcGridApi.formApi?.setFieldValue(
              'warehouseId',
              isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
            );
            const result = isFunction(originalAfterFetch)
              ? originalAfterFetch(res, ...rest)
              : res;
            if (!isFirstLoaded.value) {
              searchController.sign(2);
            }
            return result;
          },
        };
      };
      item.dependencies = {
        triggerFields: ['departmentId', 'regionId'],
        trigger(values: Record<string, any>) {
          nextTick(() => {
            const hasGetRef =
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
            if (hasGetRef) {
              const warehouseSelectRef =
                chcGridApi.formApi.getFieldComponentRef('warehouseId');
              if (warehouseSelectRef && warehouseSelectRef.params) {
                warehouseSelectRef.params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                warehouseSelectRef.fetchApi();
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
              }
            }
          });
        },
      };
    }
  });
  return schema;
};

const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
      // virtualYConfig: {
      //   enabled: false,
      // },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      stripe: false,
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      // {
      //   type: 'radio',
      //   title: '单选',
      //   minWidth: 50,
      //   align: 'center',
      //   visible: false,
      // },
      {
        field: 'bpartnerName',
        title: '申请仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '上级仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '申请数量',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyReceiveLeft',
        title: '未发数量',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'StorageQty',
        title: '上级仓库数量',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '115',
        sortable: true,
      },
      {
        field: 'origDocumentNo',
        title: '来源单号',
        minWidth: '115',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '申请时间',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'lineStatusName',
        title: '申请状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '200',
        sortable: true,
      },
    ],
    formSchema: handleFormSchema(),
    dataTableId:
      'orderAction/queryDetail.do?orderType=WO&page=short&specShowType=from&returnDoc=N',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'main',
    autoSelectFirstRow: false,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'DescriptionModal-descriptionModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: DescriptionModalComp,
      // },
      // 'ScatterCreateModal-scatterCreateModalApi': {
      //   connectedComponent: ScatterCreateComp,
      // },
    },
  },
);
const summarizeRef = ref();

const handlePrint = async () => {
  // 获取选中的记录
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择要打印的记录');
    return;
  }
  // const formValues = await chcGridApi.formApi.getValues();
  // console.warn('formValues', formValues);
  // const { bpartnerId, warehouseId, dateFrom, dateTo, orderNo } = formValues;
  // if (!bpartnerId) {
  //   message.error('请选择申请仓库');
  //   return;
  // }
  // if (!warehouseId) {
  //   message.error('请选择上级仓库');
  //   return;
  // }
  // 获取选中的 orderId 列表（去重）
  const paramLine: any[] = [];
  records.forEach((data: any) => {
    paramLine.push(data.orderId);
  });
  const uniqueParamLine = [...new Set(paramLine)];
  console.warn('uniqueParamLine', uniqueParamLine);
  Modal.confirm({
    title: '打印提示',
    content: `确认打印请领缺货吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderShortDocByOrderId.do?orderId=${encodeURIComponent(uniqueParamLine.join(','))}`,
      });
    },
    onCancel() {},
  });
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #qtyProcessDefault="scope">
        <InputNumber
          v-model:value="scope.row.qtyProcess"
          class="w-full"
          :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}`"
        />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handlePrint"
          data-testid="button_print"
        >
          打印
          <template #icon>
            <SvgPrintFillIcon />
          </template>
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleExport"
          data-testid="button_export"
        >
          导出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

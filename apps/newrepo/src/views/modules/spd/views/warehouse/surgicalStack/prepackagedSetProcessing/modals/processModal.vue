<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import sernoModalUI from '../../surgicalPackage/modals/sernoModal.vue';
import { createPacakgeBySurgical } from '../api';

const emit = defineEmits(['confirm']);

const [sernoModal, sernoModalApi] = useVbenModal({
  connectedComponent: sernoModalUI,
});

const productData = ref<any>({});
const title = ref('加工套包');
const [ProductModal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      productData.value = modalApi.getData<Record<string, any>>();

      if (productData.value.surgicalTypeId) {
        setTimeout(() => {
          // bug635 院区和执行仓库不做回显处理
          // ChcGridApi.formApi.setValues(productData.value);
          let count =
            productData.value.levelMin - productData.value.packageCount;
          if (!count || count < 1) {
            count = 1;
          }
          ChcGridApi.formApi.setFieldValue('count', count);
          ChcGridApi.query({
            warehouseId: productData.value.warehouseId,
            surgicalTypeId: productData.value.surgicalTypeId,
            isShowStorage: 'Y',
          });
        }, 100);
      }
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});

const departmentId = ref('');
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,

      wrapperClass: 'grid-cols-2',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // stripe: true,
      keepSource: true,
      pagerConfig: {
        enabled: true,
      },
      proxyConfig: {
        // autoLoad: true,
      },
    }),
  },
  {
    id: 'parentTable',
    queryUrl: `surgicalProductAction/queryDetail.do?`,
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'storageQty',
        title: '库存数量',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'stackType',
        title: '分包标识',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'serNos',
        title: '厂家码',
        minWidth: '100',
        sortable: true,
        slots: { default: 'serNos' },
        formatter({ row }: any) {
          if (row.isSerNo === 'Y') {
            return row.serNos?.length || 0;
          }
          return '';
        },
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            showChooseAll: false,
            placeholder: '请选择院区',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('departmentId', val, option);
              departmentId.value = val;
            },
            // mode: 'multiple',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // if (!departmentId.value) {
              //   ChcGridApi.formApi.getFieldComponentRef(
              //     'warehouseId',
              //   ).params.dependencies = {
              //     regionId: -1,
              //     departmentId: -1,
              //   };
              //   ChcGridApi.formApi
              //     ?.getFieldComponentRef('warehouseId')
              //     ?.fetchApi();
              // }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            showChooseAll: false,
            dictUrl:
              '/baseHandleAction/warehouse.do?accessAll=Y&level3=N&regionId={{departmentId}}',
            // showSearch: true,
            placeholder: '请选择执行仓库',
            triggerFields: ['departmentId'],
            paginate: false,
            // disabled: true,
            allowClear: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            console.warn(values);
            const c = isFieldComponentRefExist('warehouseId');
            if (c) {
              const refInst = ChcGridApi.formApi?.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `/baseHandleAction/warehouse.do?accessAll=Y&level3=N&regionId=${values?.departmentId}&departmentId=${values.departmentId}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst.fetchApi();
                }
              }
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        formItemClass: 'col-start-1',
        fieldName: 'warehouseId',
        label: '执行仓库',
      },
      {
        component: 'InputNumber',
        fieldName: 'count',
        label: '包数',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'surgicalTypeName',
        label: '术式类型',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'bpartnerName',
        label: '执行科室',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
    ],
    gridEvents: {},
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
  },
);

function onSubmit() {
  ChcGridApi.formApi.getValues().then((res: any) => {
    if (!productData.value.surgicalReplenishId) {
      message.warn('缺少术式');
      return;
    }
    if (!res.warehouseId) {
      message.warn('缺少仓库！');
      return;
    }
    const tableData = ChcGridApi.grid.getData<Record<string, any>>();

    if (tableData.length === 0) {
      message.warn('请输入商品明细！');
      return;
    }
    const productSerNoArray: any = [];
    const productSerNos: any = {};
    tableData.forEach((record: any) => {
      if (record.productId && record.serNos) {
        const serNos = productSerNos[record.productId];
        productSerNos[record.productId] = serNos || [];

        record.serNos.forEach((serno: any) => {
          productSerNos[record.productId].push(serno.serNo);
        });
      }
    });
    for (const p in productSerNos) {
      productSerNoArray.push({ productId: p, serNos: productSerNos[p] });
    }
    const params = {
      productSerNos: JSON.stringify(productSerNoArray),
      warehouseId: productData.value.warehouseId,
      replenishId: productData.value.surgicalReplenishId,
      treatmentId: 0,
    };
    createPacakgeBySurgical({
      ...res,
      ...params,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '操作成功',
        });
        modalApi.close();
        emit('confirm');
      }
    });
  });
}

const editData: any = ref({});
const handleEditSerNo = (scope: any) => {
  editData.value = scope.row;

  sernoModalApi.setData(scope.row).open();
};
const handleSernoConfirm = (data: any) => {
  ChcGridApi.grid.setRow(editData.value, { serNos: data });
};
</script>
<template>
  <ProductModal class="w-[1000px]" :title="title" title-tooltip="">
    <Page content-class="p-[0.5rem]" auto-content-height :height-offset="300">
      <sernoModal @confirm="handleSernoConfirm" />
      <!-- <searchModal @confirm="searchConfirm" /> -->
      <ChcGrid>
        <template #serNos="scope">
          <a
            v-if="scope.row.isSerNo === 'Y'"
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleEditSerNo(scope)"
            :data-testid="`button_sernos_${scope.rowIndex}_processModal`"
          >
            {{ scope.row.serNos?.length || 0 }}
          </a>
        </template>
      </ChcGrid>
    </Page>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_processModal"
      >
        提交
      </Button>
    </template>
  </ProductModal>
</template>

<style lang="less" scoped>
::v-deep(.input-nostyle .ant-input) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  pointer-events: none; // 禁用输入框的点击事件
}

::v-deep(.input-nostyle .ant-input:focus) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  outline: none !important;
  box-shadow: none !important;
}
</style>

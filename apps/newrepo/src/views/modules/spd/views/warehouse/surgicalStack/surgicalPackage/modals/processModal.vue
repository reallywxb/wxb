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

import { createPacakgeBySurgical } from '../api';
import sernoModalUI from './sernoModal.vue';

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
      console.warn('productData.value:', productData.value);
      if (productData.value.surgicalTypeId) {
        setTimeout(() => {
          ChcGridApi.formApi.setValues({
            ...productData.value,
            bpartnerId: productData.value.applyBpartnerId,
            kdBpatnerName: productData.value.bpartnerName,
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

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,

      wrapperClass: 'grid-cols-3',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // stripe: true,
      keepSource: true,
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
      proxyConfig: {
        // autoLoad: true,
      },

      cellStyle(scope: any) {
        if (scope.row.storageQty < scope.row.qty) {
          return {
            color: 'red',
          };
        }
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
              if (!departmentId.value) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: -1,
                  departmentId: -1,
                };
                ChcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
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
            dictUrl:
              '/baseHandleAction/warehouse.do?accessAll=Y&level3=N&selectDefault=Y',
            // showSearch: true,
            placeholder: '请选择加工仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: false,
            allowClear: true,
            onChange(val: any) {
              if (val) {
                ChcGridApi.formApi.getValues().then((res: any) => {
                  ChcGridApi.query({
                    warehouseId: res.warehouseId,
                    surgicalTypeId: productData.value.surgicalTypeId,
                    isShowStorage: 'Y',
                  });
                });
              }
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            console.warn(values);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        formItemClass: 'col-start-1',
        fieldName: 'warehouseId',
        label: '加工仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/departmentBPartner.do',
            // dictUrl: '/baseHandleAction/customer.do?isDepartment=Y&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择执行科室',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            showChooseAll: false,
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },

        fieldName: 'bpartnerId',
        label: '执行科室',
      },
      {
        component: 'Input',
        fieldName: 'kdBpatnerName',
        label: '开单科室',
        formItemClass: 'input-nostyle ',
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
        fieldName: 'surgeryNo',
        label: '手术单号',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'surgeryTime',
        label: '手术时间',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '患者姓名',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'patientSex',
        label: '患者性别',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'patientAge',
        label: '患者年龄',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'patientPhoneNo',
        label: '患者电话',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'bedNo',
        label: '床号',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'doctorName',
        label: '主刀医生',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
    ],

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
    if (!productData.value.treatmentId) {
      message.warn('请选择手术！');
      return;
    }
    if (!res.warehouseId) {
      message.warn('请选择仓库！');
      return;
    }
    if (!res.bpartnerId) {
      message.warn('请选择执行科室！');
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
      treatmentId: productData.value.treatmentId,
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
            :data-testid="`button_serNos_${scope.rowIndex}_processModal`"
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
  pointer-events: none;
}

::v-deep(.input-nostyle .ant-input:focus) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  outline: none !important;
  box-shadow: none !important;
}
</style>

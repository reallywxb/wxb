<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Modal as AntModal, Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { saveDo } from '../api';

const emit = defineEmits(['confirm']);

const parentData = ref<any>({});
const title = ref('添加');
let action = 'add';
const [Modal, modalApi] = useVbenModal({
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
      parentData.value = modalApi.getData<Record<string, any>>();
      productCareId.value = parentData.value.productCareId || 0;
      title.value = parentData.value.productCareId ? '添加养护品种' : '添加';
      action = parentData.value.productCareId ? 'addProductCare' : 'add';
      console.warn('parentData.value:', parentData.value, productCareId.value);
      if (parentData.value.productCareId) {
        setTimeout(() => {
          // ChcGridApi.formApi.getValues().then((res: any) => {
          //   ChcGridApi.query({ ...res });
          // });
          ChcGridApi.formApi.setValues(parentData.value);
          ChcGridApi.formApi.updateSchema([
            {
              fieldName: 'departmentId',
              disabled: true,
            },
            {
              fieldName: 'warehouseId',
              disabled: true,
            },
          ]);
        }, 100);
      } else {
        setTimeout(() => {
          ChcGridApi.formApi.updateSchema([
            {
              fieldName: 'departmentId',
              disabled: false,
            },
            {
              fieldName: 'warehouseId',
              disabled: false,
            },
          ]);
        }, 100);
      }
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});

const productCareId = ref(0);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['receiptDateFrom', 'receiptDateTo'], 'YYYY-MM-DD'],
        [
          'guaranteeDate',
          ['guaranteeDateFrom', 'guaranteeDateTo'],
          'YYYY-MM-DD',
        ],
      ],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      commonConfig: {
        labelClass: 'w-[90px]',
      },
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
    id: 'documentModalTable',
    queryUrl: `/productCareAction/queryStorageDetail.do`,
    gridColumns: [
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'productCode', title: '药品编码', width: 120, sortable: true },
      { field: 'productName', title: '药品名称', width: 220, sortable: true }, // 其中 edit 的名字需要与弹窗里div的名字一致
      { field: 'productSpec', title: '规格', width: 150, sortable: true },
      {
        field: 'modelNo',
        title: '型号',
        width: 150,
        sortable: true,
        visible: false,
      },
      { field: 'manufacturer', title: '厂家', width: 150, sortable: true },
      { field: 'certificateNo', title: '注册证号', width: 150, sortable: true },
      { field: 'uomName', title: '单位', width: 70, sortable: true },
      { field: 'lot', title: '批号', width: '110', sortable: true },
      { field: 'guaranteeDate', title: '效期', width: '110', sortable: true },

      {
        field: 'qtyOnHand',
        title: '库存数量',
        width: 90,
        align: 'right',
        sortable: true,
      },
      { field: 'careLevelName', title: '养护级别', width: 90, sortable: true },
      { field: 'receiptDate', title: '入库日期', width: 90, sortable: true },
      {
        field: 'lastCaredTime',
        title: '上次养护日期',
        width: 120,
        sortable: true,
      },
      { field: 'vendorName', title: '供应商', width: '180', sortable: true },
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

            placeholder: '请选择院区',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            immediate: true,
            labelField: 'name',
            // disabled: productCareId.value === 0,
            valueField: 'id',
            afterFetch(res: any) {
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
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            // showSearch: true,
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            allowClear: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            // disabled: !!productCareId.value,

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
        fieldName: 'warehouseId',
        label: '仓库',
      },
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '入库日期',
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/warehouseAction/sectionList.do',

            // showSearch: true,
            placeholder: '请选择库区',
            triggerFields: ['warehouseId'],
            paginate: false,
            allowClear: true,

            immediate: true,
            labelField: 'name',
            valueField: 'id',
            showChooseAll: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          trigger(values: any) {
            console.warn(values);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('sectionId') &&
              ChcGridApi.formApi?.getFieldComponentRef('sectionId').params
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'sectionId',
              ).params.dependencies = {
                warehouseId: values.warehouseId,
              };
              setTimeout(() => {
                ChcGridApi.formApi
                  ?.getFieldComponentRef('sectionId')
                  ?.fetchApi();
              }, 100);
              ChcGridApi.formApi?.setFieldValue('sectionId', undefined);
            }
          },
        },
        fieldName: 'sectionId',
        label: '库区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000587',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择养护级别',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'careLevel',
        label: '养护级别',
      },
      {
        component: 'DateGroup',
        fieldName: 'guaranteeDate',
        label: '有效日期',

        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/warehouseAction/locatorList.do',
            // showSearch: true,
            placeholder: '请选择货位',
            triggerFields: ['warehouseId', 'sectionId', 'type'],
            paginate: false,
            allowClear: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            showChooseAll: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId', 'sectionId', 'type'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('locatorId') &&
              ChcGridApi.formApi?.getFieldComponentRef('locatorId').params &&
              values.warehouseId
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'locatorId',
              ).params.dictUrl = values.sectionId
                ? `/warehouseAction/wareLocatorList.do`
                : '/warehouseAction/locatorList.do';
              ChcGridApi.formApi.getFieldComponentRef(
                'locatorId',
              ).params.dependencies = {
                warehouseId: values.warehouseId,
                sectionId: values.sectionId,
                type: values.sectionId ? 'locator' : undefined,
              };
              setTimeout(() => {
                ChcGridApi.formApi
                  ?.getFieldComponentRef('locatorId')
                  ?.fetchApi();
              }, 100);
              ChcGridApi.formApi?.setFieldValue('locatorId', undefined);
            }
          },
        },
        fieldName: 'locatorId',
        label: '货位',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        defaultValue: 'Y',
        fieldName: 'isNeedCare',
        label: '需养护商品',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择库存状态',
            paginate: false,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'storageStatus',
        label: '库存状态',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
    ],
    beforeFetchFn: (params) => {
      return {
        ...params,
        productCareId: productCareId.value || undefined,
      };
    },
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
    const checkedRows = ChcGridApi.grid.getCheckboxRecords();
    if (checkedRows.length === 0) {
      message.error('请选择商品');
      return;
    }
    const params = {
      productCareId: productCareId.value || undefined,
      warehouseId: res.warehouseId,
      lines: JSON.stringify(
        checkedRows.map((item: any) => ({
          attributeSetInstanceId: item.attributeSetInstanceId,
          storageQty: item.qtyOnHand,
        })),
      ),
    };
    saveDo(params).then((res: any) => {
      if (res && res.success) {
        productCareId.value = res.data.productCareId;
        AntModal.confirm({
          title: '提示',
          content: '操作成功，是否继续添加养护品种？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            ChcGridApi.formApi.getValues().then((res: any) => {
              ChcGridApi.query({ ...res });
            });
          },
          onCancel: () => {
            modalApi.close();
            emit('confirm', action === 'add');
          },
        });
      }
    });
  });
}
</script>
<template>
  <Modal class="w-[1200px]" :title="title" title-tooltip="">
    <Page content-class="p-[0.5rem]" auto-content-height :height-offset="300">
      <ChcGrid />
    </Page>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_documentModal"
      >
        添加
      </Button>
    </template>
  </Modal>
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
  pointer-events: none;
}
</style>

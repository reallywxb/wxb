<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { receiveAsnLineBatch, rePutawayLine } from './api';
import { commonFormOptions, viewFormOptions } from './options';
import LazySearch from '#/utils/LazySearch';
import { isEmpty } from '@vben/utils';
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  const formValues = await ChcGridApi?.formApi?.getValues();
  ChcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.query({ ...formValues });
  isFirstLoaded.value = true;
});
onMounted(() => {
  searchController.sign(3);
});

const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  isGift?: string;
}>({});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['checkTimeFrom', 'checkTimeTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: async (values) => {
        console.warn('values', values);
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        ChcGridApi.reload(formValues);
        // ChcGridApi.formApi.getValues().then((res: any) => {
        //   console.log('getValues', res);
        //   ChcGridApi.query({ ...res });
        // });
      },
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
    gridEvents: {
      // 单个复选框变化事件
      // checkboxChange: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
      // // 全选/全不选事件
      // checkboxAll: ({ records }: { records: any[] }) => {
      //   calculateSelectedAmount(records);
      // },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'asnNo',
        minWidth: 90,
        sortable: true,
        title: '配送单号',
      },
      {
        field: 'applyBPartnerName',
        minWidth: 150,
        sortable: true,
        title: '需求仓库',
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'productName',
        minWidth: 120,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 90,
        sortable: true,
        title: '规格',
      },
      // {
      //   field: 'modelNo',
      //   minWidth: 90,
      //   sortable: true,
      //   title: '型号',
      // },
      {
        field: 'manufacturer',
        minWidth: 110,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'productControlLevelName',
        minWidth: 90,
        sortable: true,
        title: '商品组',
      },
      {
        field: 'uomName',
        minWidth: 60,
        sortable: true,
        title: '单位',
      },
      {
        field: 'BaseUOM',
        minWidth: 90,
        sortable: true,
        title: '最小单位',
        formatter: ({ row }: any) => {
          return row.BaseUOM;
        },
      },

      {
        field: 'qtyArrived',
        minWidth: 90,
        sortable: true,
        title: '到货数量',
        align: 'right',
      },
      {
        field: 'qtyPutawayed',
        minWidth: 110,
        sortable: true,
        title: '已上架数量',
        align: 'right',
      },
      {
        field: 'qtyRejected',
        minWidth: 110,
        sortable: true,
        title: '已拒收数量',
        align: 'right',
      },
      {
        field: 'lot',
        minWidth: 80,
        sortable: true,
        title: '批号',
      },
      {
        field: 'guaranteeDate',
        minWidth: 100,
        sortable: true,
        title: '效期',
      },
      {
        field: 'bpartnerName',
        minWidth: 120,
        sortable: true,
        title: '供应商',
      },
      {
        field: 'locatorName',
        minWidth: 120,
        sortable: true,
        title: '上架货位',
      },
      {
        field: 'checkTime',
        minWidth: 120,
        sortable: true,
        title: '上架时间',
      },
      {
        field: 'description',
        minWidth: 120,
        sortable: true,
        title: '备注',
      },
      {
        field: 'lineAmt',
        minWidth: 90,
        sortable: true,
        title: '到货金额',
        align: 'right',
      },
      {
        field: 'receivedLineAmt',
        minWidth: 110,
        sortable: true,
        title: '已验收金额',
        align: 'right',
      },
      {
        field: 'priceActual',
        minWidth: 90,
        sortable: true,
        title: '采购价',
        align: 'right',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '验收时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        label: '院区',
        fieldName: 'departmentId',
        component: 'ChcSelect',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              searchController.sign(1);
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        label: '收货仓库',
        fieldName: 'warehouseId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
            // showSearch: true,
            placeholder: '请选择采购仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }

              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            nextTick(() => {
              const cond =
                ChcGridApi.formApi?.getFieldComponentRef &&
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                ChcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                ChcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  departmentId: values?.departmentId || -1,
                  regionId: values?.departmentId || -1,
                };
                ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                const timer = setTimeout(() => {
                  clearTimeout(timer);
                  ChcGridApi.formApi
                    ?.getFieldComponentRef('warehouseId')
                    ?.fetchApi();
                }, 100);
              }
            });
          },
        },
      },
      {
        label: '需求仓库',
        fieldName: 'applyBPartnerId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择需求仓库',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('applyBPartnerId', val, option);
            },
            // mode: 'multiple',
            showChooseAll: '',
            defaultValue: '',
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
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
            // mode: 'multiple',
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            defaultValue: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '供应商',
      },
      {
        component: 'Input',
        fieldName: 'deliveryNo',
        label: '配送单号',
        componentProps: {
          placeholder: '请输入配送单号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000448',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择入库类型',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            showChooseAll: '',
            defaultValue: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'receiptType',
        label: '入库类型',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
    ],
    dataTableId: '/asnAction/queryDetail.do?asnType=PO&page=receiveConfirm',
    id: 'upConfirm',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'CommonImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
      //   // 连接抽离的组件
      //   connectedComponent: ImportModalComp,
      // }),
    },
  },
);

// 审核通过处理函数
const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  // console.warn(111_111_111_111_111, selectedRows);
  if (selectedRows.length === 0) {
    message.warning('请先选择要确认的数据');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '入库确认',
    content: `是否确认通过勾选的 ${selectedRows.length} 条数据？`,
    onOk: async () => {
      try {
        const asnLineIds = selectedRows.map((row) => row.asnLineId);
        // const params = new URLSearchParams();
        // params.append('asnLineIds', JSON.stringify(asnLineIds));
        const params = {
          asnLineIds: JSON.stringify(asnLineIds),
        };
        // console.warn('params', params);
        await receiveAsnLineBatch(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('receiveAsnLineBatch111', res);
              // 刷新表格数据
              ChcGridApi.query();
              message.success('确认成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('确认失败');
      }
    },
  });
};

// 作废处理函数
const handleCancel = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要取消的数据');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '取消上架',
    content: `是否取消勾选的 ${selectedRows.length} 条数据？`,
    onOk: async () => {
      try {
        const asnLineIds = selectedRows.map((row) => row.asnLineId);
        // const params = new URLSearchParams();
        // params.append('asnLineIds', JSON.stringify(asnLineIds));
        const params = {
          asnLineIds: JSON.stringify(asnLineIds),
          isCancel: 'Y',
        };
        console.warn('params', params);
        await rePutawayLine(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('取消上架成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('取消上架失败');
      }
    },
  });
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleApprove"
          data-testid="button_approve"
        >
          入库确认
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleCancel"
          data-testid="button_cancel"
        >
          取消上架
        </Button>
        <!-- <Button type="primary" @click="handleImport" class="mr-[0.5rem]">
        导 入
      </Button> -->
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导 出
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

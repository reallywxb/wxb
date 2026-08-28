<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
// import { useRoute } from 'vue-router';

import {
  SearchActionIcon,
  SvgBackIcon,
  SvgDeleteIcon,
  SvgSquareTickIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import { isEmpty } from '@vben/utils';
import LazySearch from '#/utils/LazySearch';

import ImportModalComp from './importModal.vue';
import PackageDetailModalComp from './packageDetailModal.vue';
import ScanModalComp from './scanModal.vue';

// const route = useRoute();
// const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const returnDoc = urlParams.returnDoc || '';
// const rejectDoc = urlParams.rejectDoc || '';
// const orderType = urlParams.orderType || '';
const parentTableParams = ref<{ [key: string]: any }>({
  headerId: undefined,
  productName: undefined,
});
const isFirstLoaded = ref(false);
// 初始化查询控制器
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
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
// 子表
const [ChildGrid, childGridApi, { PackageDetailModal, packageDetailModalApi }] =
  useSpdGrid(
    {
      formOptions: {
        fieldMappingTime: [
          ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ],
      },
      gridOptions: {
        editConfig: {
          enabled: true,
          trigger: 'click',
          mode: 'row',
          autoClear: false,
        },
        proxyConfig: {
          autoLoad: false,
        },
        pagerConfig: {
          enabled: false,
        },
        checkboxConfig: {
          trigger: 'row',
        },
      },
    },
    {
      gridColumns: [
        {
          field: 'index',
          title: '序号',
          width: 50,
          align: 'center',
          formatter(scope: any) {
            return scope.rowIndex + 1;
          },
        },
        { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
        //   {
        // 	"field" : "movementPlanLineId",
        // 	"hidden" : true
        // },
        {
          field: 'productCode',
          title: '药品编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'productName',
          title: '药品名称',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'productSpec',
          title: '规格',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'manufacturer',
          title: '厂家',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '单位',
          minWidth: '75',
          sortable: true,
        },
        {
          field: 'unitPackQty',
          title: '定数',
          minWidth: '80',
          align: 'right',
          sortable: true,
          visible: false,
        },
        {
          field: 'qtyLeft',
          title: '待移库数量',
          minWidth: '110',
          align: 'right',
          sortable: true,
        },
        {
          field: 'qtyConfirm',
          title: '本次确认数量',
          minWidth: '110',
          align: 'right',
          // edit: 'number',
          sortable: false,
          // readOnly(record) {
          //   return record.isStoragePackage == 'Y';
          // },
        },
        {
          field: 'qtyCancel',
          title: '本次取消数量',
          minWidth: '130',
          align: 'right',
          editRender: {},
          slots: {
            edit: 'qtyCancelEdit',
          },
          // edit: 'number',
          sortable: false,
        },
        {
          field: 'isStoragePackage',
          title: '包装管理',
          visible: false,
          // hidden: true,
          minWidth: '110',
        },
        {
          field: 'packagePlaned',
          title: '指示包数',
          align: 'right',
          minWidth: '80',
        },
        {
          field: 'qtyPlaned',
          title: '指示数量',
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'qtyConfirmed',
          title: '已移库数量',
          align: 'right',
          minWidth: '120',
          slots: {
            default: 'qtyConfirmed_default',
          },
          // hover: true,
          sortable: true,
        },
        {
          field: 'qtyCancelled',
          title: '已取消数量',
          align: 'right',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'locatorName',
          title: '原货位',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'toLocatorName',
          title: '目标货位',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'storageStatusName',
          title: '原状态',
          minWidth: '130',
          // verify: 'required',
        },
        {
          field: 'toStorageStatusName',
          title: '目标状态',
          minWidth: '130',
          // verify: 'required',
        },
        {
          field: 'lot',
          title: '批号',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          minWidth: '120',
          sortable: true,
        },
      ],
      // showExportBtn: true,
      id: 'child',
      showCustomBtn: true,
      showZoomBtn: true,
      queryUrl: 'movementPlanAction/queryDetail.do?page=confirm',
      beforeFetchFn: (params) => {
        if (!parentTableParams.value.headerId) {
          return false;
        }

        return { ...params, ...parentTableParams.value };
      },
      afterFetchFn: (params) => {
        return {
          ...params,
          records: params.rows,
        };
      },
      customModals: {
        'PackageDetailModal-packageDetailModalApi': {
          connectedComponent: PackageDetailModalComp,
        },
      },
    },
  );
// 父表
const [
  ChcGrid,
  chcGridApi,
  { ScanModal, scanModalApi, ImportModal, importModalApi },
] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      handleSubmit: handleFormSubmit,
      handleReset: async () => {
        await chcGridApi.formApi.resetForm();
        const formValues = await chcGridApi.formApi.getValues();
        chcGridApi.formApi.setLatestSubmissionValues(formValues);
        chcGridApi.query(formValues);
      },
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    queryUrl: `movementPlanAction/query.do?page=confirm`,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
      },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      //    {
      // 	"field" : "movementPlanId",
      // 	"hidden" : true
      // },
      {
        field: 'movementPlanNo',
        title: '计划单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'datePlaned',
        title: '计划时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '135',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '计划时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            .subtract(1, 'week')
            // .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
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
              chcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
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
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
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
        fieldName: 'warehouseId',
        label: '仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                chcGridApi.formApi?.getFieldComponentRef &&
                typeof chcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                chcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                chcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'documentNo',
        label: '计划单号',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        componentProps: () => {
          return {
            placeholder: '编码/拼音码/名称',
          };
        },
        label: '药品',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        showScanBtn.value = !!(row && row.packageCount > 0);
        if (row && row.movementPlanId) {
          parentTableParams.value.headerId = row.movementPlanId;
          childGridApi.reload({ headerId: row.movementPlanId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.headerId = 0;
          childGridApi.grid.remove();
          // childGridApi.query({ headerId: row.movementPlanId });
        }
      },
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'ScanModal-scanModalApi': {
        // 连接抽离的组件
        connectedComponent: ScanModalComp,
      },
      'ImportModal-importModalApi': {
        connectedComponent: ImportModalComp,
      },
    },
    // customModals: {
    //   'PackageDetailModal-packageDetailModalApi': {
    //     // 连接抽离的组件
    //     connectedComponent: PackageDetailModalComp,
    //   },
    //   'ScanModal-scanModalApi': {
    //     // 连接抽离的组件
    //     connectedComponent: ScanModalComp,
    //   },
    //   'ChangeLocatorModal-changeLocatorModalApi': {
    //     // 连接抽离的组件
    //     connectedComponent: ChangeLocatorModalComp,
    //   },
    // },
  },
);

// 子表查询
const handleSearch = () => {
  childGridApi.reload({
    headerId: parentTableParams.value.headerId,
    productName: parentTableParams.value.productName,
  });
};
// 移库确认
const handleConfirmBtn = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择需要确认的移库计划！');
  }
  const params: { [key: string]: any } = {};
  params.movementPlanId = record.movementPlanId;
  const lineRecords = childGridApi.grid.getFullData();
  const lineData: any[] = [];
  let hasError = false;
  lineRecords.forEach((record: any) => {
    const qtyConfirm = record.qtyConfirm ?? 0;
    const qtyCancel = record.qtyCancel ?? 0;

    if (qtyConfirm < 0) {
      hasError = true;
      return message.error(`商品【${record.productName}】移库数量不能小于0！`);
    }
    if (qtyCancel < 0) {
      hasError = true;
      return message.error(`商品【${record.productName}】取消数量不能小于0！`);
    }
    if (Number(qtyConfirm) + Number(qtyCancel) !== Number(record.qtyLeft)) {
      hasError = true;
      return message.error(
        `商品【${record.productName}】未完成移库！确认数量：${
          qtyConfirm
        } 加取消数量:${qtyCancel} 不等于待移库数量：${record.qtyLeft}`,
      );
    }
    lineData.push({
      movementPlanLineId: record.movementPlanLineId,
      qtyConfirm: record.qtyConfirm,
      qtyCancel: record.qtyCancel,
    });
  });
  if (hasError) {
    return null;
  }
  params.lineData = JSON.stringify(lineData);
  Modal.confirm({
    title: '提示',
    content: '确认移库？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('movementPlanAction/confirm.do', params)
        .then(() => {
          message.success('移库成功!');
          chcGridApi.query();
        });
    },
    onCancel() {},
  });
};
// 作废
const handleVoidBtn = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择需作废的移库计划！');
  }
  const params: { [key: string]: any } = {};
  params.movementPlanId = record.movementPlanId;
  Modal.confirm({
    title: '提示',
    content: '确认作废移库计划？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('movementPlanAction/voidIt.do', params)
        .then(() => {
          message.success('作废成功!');
          chcGridApi.query();
        });
    },
    onCancel() {},
  });
};
const showScanBtn = ref(false);
const handleScanBtn = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择移库计划！');
  }
  scanModalApi
    ?.setData({
      tableId: 'scanModal',
      movementPlanId: record.movementPlanId,
      warehouseId: record.warehouseId,
      reloadParentTable(flag: boolean) {
        if (flag) {
          handleFormSubmit();
        } else {
          handleSearch();
        }
      },
    })
    .open();
};
const handleCancelBtn = () => {
  const records = childGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择移库的商品！');
  }
  const temp: any[] = [];
  records.forEach((content: any) => {
    temp.push(content.movementPlanLineId);
  });
  const params: { [key: string]: any } = {};
  params.movementPlanLineId = JSON.stringify(temp);
  requestFormClient.post('/movementPlanAction/cancel.do', params).then(() => {
    message.success('取消成功！');
    handleSearch();
  });
};
const handleQtyConfirmedClick = (scope: any) => {
  packageDetailModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      movementPlanLineId: scope.row?.movementPlanLineId,
      ...scope.row,
    })
    .open();
};
const handleImport = () => {
  importModalApi?.open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ImportModal />
          <ScanModal />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleImport"
                data-testid="Button_导入_mvplanConfirm"
              >
                导入
                <template #icon>
                  <UploadActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                v-if="showScanBtn"
                @click="handleScanBtn"
                data-testid="Button_扫码移库_mvplanConfirm"
              >
                扫码移库
                <template #icon>
                  <SvgSquareTickIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleConfirmBtn"
                data-testid="Button_移库确认_mvplanConfirm"
              >
                移库确认
                <template #icon>
                  <SvgSquareTickIcon />
                </template>
              </Button>

              <Button
                type="primary"
                danger
                class="mr-[0.5rem]"
                @click="handleVoidBtn"
                data-testid="Button_作废_mvplanConfirm"
              >
                作废
                <template #icon>
                  <SvgDeleteIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <PackageDetailModal />
          <ChildGrid>
            <template #qtyConfirmed_default="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyConfirmedClick(scope)"
                :data-testid="`a_qtyConfirmed_${scope.rowIndex}_mvplanConfirm`"
              >
                {{ scope.row.qtyConfirmed }}
              </a>
            </template>
            <template #qtyCancelEdit="scope">
              <InputNumber
                v-model:value="scope.row.qtyCancel"
                class="w-full"
                :data-testid="`InputNumber_qtyCancel_${scope.rowIndex}_mvplanConfirm`"
              />
            </template>
            <template #qtyProcessDefault="scope">
              <InputNumber
                class="w-full"
                :min="0"
                v-model:value="scope.row.qtyProcess"
                :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}_mvplanConfirm`"
              />
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="Input_productName_mvplanConfirm"
              />
              <Button
                type="primary"
                @click="handleSearch"
                class="mr-[0.5rem]"
                data-testid="Button_搜索_mvplanConfirm"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                danger
                class="mr-[0.5rem]"
                @click="handleCancelBtn"
                data-testid="Button_取消移库_mvplanConfirm"
              >
                取消移库
                <template #icon>
                  <SvgBackIcon />
                </template>
              </Button>
            </template>
          </ChildGrid>
        </template>
      </PageSplitLazy>
    </div>
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
</style>

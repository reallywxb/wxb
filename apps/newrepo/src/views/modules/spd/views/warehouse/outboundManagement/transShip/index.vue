<script lang="ts" setup>
import type { ChangeEvent } from '#/types/antd';

import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgSquareTickIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import PackageDetailModalComp from './packageDetailModal.vue';
import ScanConfirmModalComp from './scanConfirmModal.vue';
import { isEmpty } from '@vben/utils';
import { ChcSelect } from '@vben/chc-ui';
import LazySearch from '#/utils/LazySearch';

const route = useRoute();

const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const asnRegType = ref(urlParams.ASNRegType || 'OUT');
const parentTableParams = ref<{ [key: string]: any }>({
  asnId: undefined,
});
const tableSearchExtraParams = ref({
  productName: '',
});
const departmentId = ref<number | string>('');
// 子表
const [ChildGrid, childGridApi, { PackageDetailModal, packageDetailModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ],
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        proxyConfig: {
          autoLoad: false,
        },
        pagerConfig: {
          enabled: true,
        },
      }),
    },
    {
      gridColumns: [
        {
          field: 'index',
          title: '序号',
          minWidth: 50,
          align: 'center',
          formatter(scope: any) {
            return scope.rowIndex + 1;
          },
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
          minWidth: '130',
          sortable: true,
        },
        {
          field: 'modelNo',
          title: '型号',
          minWidth: '130',
          sortable: true,
          visible: false, //  TODO:medicine cancel
        },
        {
          field: 'manufacturer',
          title: '生产厂家',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '单位',
          minWidth: '70',
          sortable: true,
        },
        {
          field: 'qtyArrived',
          title: '配送数量',
          minWidth: '100',
          align: 'right',
          // hover: true,
          sortable: true,
          slots: { default: 'qtyArrived' },
        },
        {
          field: 'replenishPackageQty',
          title: '定数',
          minWidth: '80',
          sortable: true,
          align: 'right',
          visible: false, //  TODO:medicine cancel
        },
        {
          field: 'packageCountArrived',
          title: '配送包数',
          minWidth: '100',
          align: 'right',
          visible: false, //  TODO:medicine cancel
        },
        {
          field: 'priceActual',
          title: '采购价',
          minWidth: '100',
          sortable: true,
          align: 'right',
        },
        {
          field: 'lineAmt',
          title: '行金额',
          minWidth: '100',
          sortable: true,
          align: 'right',
        },
        {
          field: 'lot',
          title: '批号',
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'guaranteeDate',
          title: '效期',
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'locatorName',
          title: '货位',
          minWidth: '120',
          sortable: true,
          visible: false, //  TODO:medicine cancel
        },
      ],
      id: 'child',
      queryUrl: '/asnAction/queryDetail.do?specShowType=from',
      parentTableParams: parentTableParams.value,
      tableSearchExtraParams: tableSearchExtraParams.value,
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

const isFirstLoaded = ref(false); // 是否已初次加载完
const selectController = new LazySearch(2, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  chcGridApi?.formApi?.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    chcGridApi.query({ ...res });
  });
});
onMounted(() => {
  selectController.sign(2);
});
// 父表
const [ChcGrid, chcGridApi, { ScanConfirmModal, scanConfirmModalApi }] =
  useSpdGrid(
    {
      formOptions: {
        fieldMappingTime: [
          ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ],
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        handleSubmit: async () => {
          const formValues = await chcGridApi.formApi.getValues();
          chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          chcGridApi.query(formValues);
        },
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
      queryUrl:
        '/asnAction/query.do?page=transship&isSurgery=N&asnType=WO,MO,WR,SR&asnRegType=OUT',
      gridColumns: [
        { title: '单选', type: 'radio', visible: false },
        {
          title: '序号',
          type: 'seq',
          width: 50,
          align: 'center',
        },
        { title: '', type: 'checkbox', width: 50, align: 'center' },
        {
          field: 'orderNo',
          title: '申请单号',
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'asnNo',
          title: '配送单号',
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'created',
          title: '配送时间',
          minWidth: '160',
          sortable: true,
        },
        {
          field: 'fromWarehouseName',
          title: '发货仓库',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'warehouseName',
          title: '收货仓库',
          minWidth: '130',
          sortable: true,
        },
        {
          field: 'asnStatusName',
          title: '收货状态',
          minWidth: '100',
        },
        {
          field: 'productControlLevelName',
          title: '管控类型',
          // hidden: !isProductControlLevel,
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'totalAmt',
          title: '金额',
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'workOutName',
          title: '出库工人',
          minWidth: '100',
          // hidden: asnRegType == 'OUT',
          visible: false,
        },
        {
          field: 'workOutTime',
          title: '出库时间',
          minWidth: '150',
          // hidden: asnRegType == 'OUT',
          visible: false,
        },
        {
          field: 'createdByName',
          title: '操作人',
          minWidth: '150',
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
          fieldName: 'dateArrived',
          label: '申请时间',
          defaultValue: [
            dayjs(dayjs().format('YYYY-MM-DD')).format('YYYY-MM-DD'),
          ],
          formItemClass: 'col-span-1',
        },
        {
          fieldName: 'departmentId',
          label: '院区',
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl:
                '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
              placeholder: '请选择院区',
              paginate: false,
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              autoChooseFirstOption: true,
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
        },
        {
          fieldName: 'fromWarehouseId',
          label: '发货仓库',
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
              placeholder: '请选择发货仓库',
              paginate: false,
              triggerFields: ['departmentId', 'regionId'],
              showChooseAll: '',
              immediate: false,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          dependencies: {
            triggerFields: ['departmentId', 'regionId'],
            async trigger(values: any) {
              const cond = !!(
                chcGridApi.formApi && chcGridApi.formApi.getFieldComponentRef
              );

              if (cond) {
                const fromWarehouseIdRef =
                  chcGridApi.formApi?.getFieldComponentRef<
                    InstanceType<typeof ChcSelect>
                  >('fromWarehouseId');
                if (fromWarehouseIdRef) {
                  if (values?.departmentId) {
                    fromWarehouseIdRef.params.dependencies = {
                      departmentId: values.departmentId,
                      regionId: values.departmentId,
                    };
                    const selectOptions = await fromWarehouseIdRef.fetchApi();
                    // 选第一个不是全部的id
                    const item = selectOptions.filter(
                      (o: Record<string, any>) => !isEmpty(o?.id),
                    )?.[0];
                    chcGridApi.formApi?.setFieldValue(
                      'fromWarehouseId',
                      item?.id || undefined,
                    );
                    if (!isFirstLoaded.value) {
                      selectController.sign(1);
                    }
                  } else {
                    fromWarehouseIdRef.clearOptions();
                    chcGridApi.formApi?.setFieldValue(
                      'fromWarehouseId',
                      undefined,
                    );
                  }
                }
              }
            },
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y',
              placeholder: '请选择收货仓库',
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
          defaultValue: '',
          fieldName: 'warehouseId',
          label: '收货仓库',
          // dependencies: {
          //   triggerFields: ['departmentId', 'regionId'],
          //   trigger(values: any, formApi: any) {
          //     console.warn('values', values, formApi);
          //     // formApi?.setFieldValue('warehouseId', undefined);
          //     if (
          //       chcGridApi.formApi?.getFieldComponentRef &&
          //       typeof chcGridApi.formApi?.getFieldComponentRef ===
          //         'function' &&
          //       chcGridApi.formApi?.getFieldComponentRef('warehouseId')
          //     ) {
          //       chcGridApi.formApi.getFieldComponentRef(
          //         'warehouseId',
          //       ).params.dependencies = {
          //         regionId: values.departmentId,
          //         departmentId: values.departmentId,
          //       };
          //       chcGridApi.formApi
          //         ?.getFieldComponentRef('warehouseId')
          //         ?.fetchApi();
          //       chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
          //     }
          //   },
          // },
        },
        {
          component: 'Input',
          fieldName: 'asnNo',
          label: '配送单号',
        },
        {
          component: 'Input',
          fieldName: 'orderNo',
          label: '申请单号',
        },
        {
          component: 'Input',
          fieldName: 'productName',
          label: '药品',
        },
      ],
      gridEvents: {
        radioChange: async ({ row }: { row: any }) => {
          if (row && row.asnId) {
            parentTableParams.value.asnId = row.asnId;
            await chcGridApi.grid.clearCheckboxRow();
            chcGridApi.grid.setCheckboxRow(row, true);
          } else {
            parentTableParams.value.asnId = '';
          }
        },
      },
      showRadioRowTag: true,
      afterFetchFn: (params) => {
        return {
          ...params,
          records: params.rows,
        };
      },
      customModals: {
        'ScanConfirmModal-scanConfirmModalApi': {
          connectedComponent: ScanConfirmModalComp,
        },
      },
    },
  );
const handleSearch = () => {
  childGridApi.reload();
};
const childSearchIptChange = (e: ChangeEvent) => {
  tableSearchExtraParams.value.productName = (
    e.target as HTMLInputElement
  )?.value;
};
const handleQtyArrivedClick = (scope: any) => {
  console.warn('点击qtyArrived:', scope.row, scope.row.qtyArrived);
  packageDetailModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      ...scope.row,
    })
    .open();
};
const handleConfirmBtn = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  let title = '';
  title = asnRegType.value === 'OUT' ? '出库' : '入库';
  if (!records || records.length === 0) {
    return message.error(`请选择${title}单！`);
  }
  const asnIds: any[] = records.map((item: any) => item.asnId);
  scanConfirmModalApi
    ?.setData({
      callBack() {
        chcGridApi.query();
      },
      asnIds,
      type: asnRegType.value,
    })
    .open();
  // const asnIds: any[] = records.map((item: any) => item.asnId);
  // records
  // $.each(records, (i, data) => {
  //   asnIds.push(data.asnId);
  // });

  // const cfg = {
  //   type: asnRegType.value,
  //   indexdg: dg1,
  //   asnIds,
  // };
  // App.show({
  //   title: `扫码${title}交接人`,
  //   url: 'pages/v3/spd/common/asn/worker_scan.html',
  //   height: '300px',
  //   width: '350px',
  //   maxmin: true,
  //   cfg,
  // });
};
</script>

<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    footer-class="bg-[#f1f3f6] pb-[0.5rem] pl-[0.5rem] pr-[0.5rem] pt-[0]"
  >
    <div class="h-[calc(100%-36px)]">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ScanConfirmModal />
          <ChcGrid class="flex-1 overflow-hidden" />
        </template>
        <template #second>
          <PackageDetailModal />
          <ChildGrid class="pt-[4px]">
            <template #qtyArrived="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyArrivedClick(scope)"
                :data-testid="`button_qtyArrived_${scope.rowIndex}`"
              >
                {{ scope.row.qtyArrived }}
              </a>
            </template>
            <!-- <template #qtyProcessDefault="scope">
              <InputNumber
                class="w-full"
                :min="0"
                v-model="scope.row.qtyProcess"
              />
              <span style="color: red">{{ scope.row.qtyProcess }}</span>
            </template> -->
            <template #toolbar-actions>
              <Input
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                @change="childSearchIptChange"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
            <!-- <template #bottom>
              <div class="flex items-center justify-center pt-[10px]">
                <div class="flex gap-[10px]">
                  <Button type="primary" @click="handleConfirmBtn">
                    扫码交接
                    <template #icon>
                      <SvgSquareTickIcon />
                    </template>
                  </Button>
                </div>
              </div>
            </template> -->
          </ChildGrid>
        </template>
      </PageSplitLazy>
    </div>
    <template #footer>
      <div
        class="flex w-full items-center justify-center border-t border-gray-200 bg-[#fff] pb-[6px] pt-[6px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handleConfirmBtn"
            data-testid="button_confirmBtn"
          >
            扫码交接
            <template #icon>
              <SvgSquareTickIcon />
            </template>
          </Button>
        </div>
      </div>
    </template>
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

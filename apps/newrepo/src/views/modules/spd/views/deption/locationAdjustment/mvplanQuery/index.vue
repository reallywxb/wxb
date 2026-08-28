<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
// import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import PackageDetailModalComp from './packageDetailModal.vue';

const globalPrintStore = useGlobalPrintStore();
// const route = useRoute();
// const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
// const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const returnDoc = urlParams.returnDoc || '';
// const rejectDoc = urlParams.rejectDoc || '';
// const orderType = urlParams.orderType || '';
const parentTableParams = ref<{ [key: string]: any }>({
  headerId: undefined,
  productName: undefined,
});
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
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
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
      //  {
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
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'isStoragePackage',
        title: '包装管理',
        visible: false,
        // hidden: true,
        minWidth: '110',
      },
      {
        field: 'qtyPlaned',
        title: '指示数量',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyConfirmed',
        title: '已移动数量',
        minWidth: '120',
        align: 'right',
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
        minWidth: '100',
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
        // "verify":"required"
      },
      {
        field: 'toStorageStatusName',
        title: '目标状态',
        minWidth: '130',
        // "verify":"required"
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'lineStatusName',
        title: '状态',
        minWidth: '80',
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
      },
    ],
    showExportBtn: true,
    id: 'child',
    queryUrl: 'movementPlanAction/queryDetail.do',
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
  },
);
// 父表
const [ChcGrid, chcGridApi, { PackageDetailModal, packageDetailModalApi }] =
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
      queryUrl: `movementPlanAction/query.do`,
      gridColumns: [
        { title: '单选', type: 'radio', visible: false },
        {
          title: '序号',
          type: 'seq',
          width: 50,
          align: 'center',
        },
        // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
        //     {
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
          field: 'docStatusName',
          title: '单据状态',
          minWidth: '120',
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
              dictUrl: '/baseHandleAction/warehouse.do',
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
                  chcGridApi.formApi?.getFieldComponentRef('warehouseId')
                    .params;
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
          label: '药品',
        },
      ],
      gridEvents: {
        radioChange: async ({ row }: { row: any }) => {
          if (row && row.movementPlanId) {
            parentTableParams.value.headerId = row.movementPlanId;
            childGridApi.reload({ headerId: row.movementPlanId });
            await chcGridApi.grid.clearCheckboxRow();
            chcGridApi.grid.setCheckboxRow(row, true);
          } else {
            // 父表没数据，子表要清空
            parentTableParams.value.headerId = undefined;
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
        'PackageDetailModal-packageDetailModalApi': {
          closable: true,
          draggable: true,
          // 连接抽离的组件
          connectedComponent: PackageDetailModalComp,
        },
      },
    },
  );

const handleSearch = () => {
  childGridApi.reload({
    headerId: parentTableParams.value.headerId,
    productName: parentTableParams.value.productName,
  });
};
const handlePrint = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择移库计划！');
  }

  const paramLine: any[] = [];
  paramLine.push(record.movementPlanId);
  Modal.confirm({
    title: '打印提示',
    content: '确认打印出库单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/movementPlanAction/printMovementPlanDoc.do?id=${paramLine}`,
      });
    },
    onCancel() {},
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
          <PackageDetailModal />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrint"
                data-testid="button_Print"
              >
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <ChildGrid>
            <template #qtyConfirmed_default="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyConfirmedClick(scope)"
                :data-testid="`button_qtyconfirmed_${scope.rowIndex}`"
              >
                {{ scope.row.qtyConfirmed }}
              </a>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                class="mr-[0.5rem]"
                data-testid="button_Search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
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

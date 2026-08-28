<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import actionLogModal from './modals/actionLogModal.vue';

const userStore = useUserStore();
const route = useRoute();
const urlParams = route.meta?.urlParams || {};
const asnType = urlParams?.asnType || '';
const currentDeptId = ref<any>(undefined);

const globalPrintStore = useGlobalPrintStore();
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
const parentTableParams = ref<{ [key: string]: any }>({
  asnId: undefined,
  productName: undefined,
});
const formSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const formReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};
// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: {
      // fieldMappingTime: [
      //   ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      // ],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
    },
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
        field: 'qtyArrived',
        title: '配送数量',
        align: 'right',
        minWidth: '90',
        sortable: true,
        slots: { default: 'qtyArrived' },
      },
      {
        field: 'qtyCheckLeft',
        title: '待验收数量',
        align: 'right',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qtyChecked',
        title: '已验收数量',
        align: 'right',
        minWidth: '100',
        sortable: false,
        slots: { default: 'qtyChecked' },
      },
      {
        field: 'qtyPutawayLeft',
        title: '待上架数量',
        minWidth: '100',
        align: 'right',
        sortable: false,
      },
      {
        field: 'qtyPutawayed',
        title: '已上架数量',
        minWidth: '100',
        align: 'right',
        sortable: false,
      },
      {
        field: 'qtyReceived',
        minWidth: 90,
        sortable: true,
        title: '入库数量',
        align: 'right',
      },
      {
        field: 'qtyRejected',
        title: '拒收数量',
        align: 'right',
        width: '90',
        sortable: true,
        // summary: true,
      },
      {
        field: 'qtyReturned',
        title: '拒收回库数量',
        width: '130',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageCountArrived',
        title: '配送包数',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageCountCheckLeft',
        title: '待验收包数',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageCountChecked',
        title: '已验收包数',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageCountPutawayLeft',
        title: '待上架包数',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageCountPutawayed',
        title: '已上架包数',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageCountRejected',
        title: '拒收包数',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceActual',
        title: '采购价',
        minWidth: '75',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineAmt',
        title: '行金额',
        minWidth: '75',
        align: 'right',
        sortable: true,
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
        field: 'locatorName',
        title: '货位',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'checkerName',
        title: '验收人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'checkTime',
        title: '验收时间',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'putawayName',
        minWidth: '100',
        sortable: true,
        title: '上架人',
      },
      {
        field: 'putawayTime',
        title: '上架时间',
        minWidth: '100',
        // edit: 'text',
        sortable: true,
      },
      // {
      //   align: 'center',
      //   field: 'action',
      //   slots: { default: 'action' },
      //   fixed: 'right',
      //   headerAlign: 'center',
      //   showOverflow: false,
      //   title: '操作',
      //   width: 180,
      // },
    ],
    id: 'child',
    queryUrl: '/asnAction/queryDetail.do?specShowType=from',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.asnId) {
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
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [
        ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: formSubmit,
      handleReset: formReset,
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
      checkboxConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    // queryUrl: '/asnAction/query.do?isSurgery=N&asnType=WO,MO,WR,SR',
    queryUrl: `/asnAction/query.do?isSurgery=N&asnType=${asnType}`,
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'asnNo',
        title: '配送单号',
        minWidth: '100',
        sortable: true,
      },
      // TOOD: 1375 add 拣货单号
      {
        field: 'pickListNo',
        title: '拣货单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '配送时间',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'fromWarehouseName',
        title: '发货仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '收货仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'asnStatusName',
        title: '收货状态',
        sortable: true,
        width: '100',
      },
      {
        field: 'productControlLevelName',
        visible: userStore.userInfo.isProductControlLevel,
        minWidth: 90,
        sortable: true,
        title: '药品组',
      },
      {
        field: 'totalAmt',
        minWidth: 80,
        sortable: true,
        title: '金额',
        align: 'right',
      },
      {
        field: 'createdByName',
        title: '操作人',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'workOutName',
        title: '出库工人',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'workOutTime',
        title: '出库时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'workInName',
        title: '入库工人',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'workInTime',
        title: '入库时间',
        minWidth: '150',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '配送时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
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
            placeholder: '请选择收货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // 只有当前院区有值时，才自动选中第一个仓库
              // 重置时 currentDeptId 会被清空，此处不会执行，从而避免误选
              if (currentDeptId.value && res?.rows?.[0]?.id) {
                chcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  res.rows[0].id,
                );
              }
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
            currentDeptId.value = values?.departmentId;
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
                  departmentId: values?.departmentId || -1,
                  regionId: values?.departmentId || -1,
                };
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                chcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '收货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y',
            placeholder: '请选择发货仓库',
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
        // defaultValue: '',
        fieldName: 'fromWarehouseId',
        label: '发货仓库',
      },
      {
        component: 'Input',
        fieldName: 'asnNo',
        componentProps: {
          placeholder: '请输入配送单号',
        },
        label: '配送单号',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        componentProps: {
          placeholder: '请输入申请单号',
        },
        label: '申请单号',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        componentProps: {
          placeholder: '请输入药品',
        },
        label: '药品',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000565',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择收货状态',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
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
        fieldName: 'asnStatus',
        label: '收货状态',
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
            placeholder: '请选择是否已打印',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isPrinted',
        label: '已打印',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        // console.log('radioChange:', row);
        if (row && row.asnId) {
          parentTableParams.value.asnId = row.asnId;
          childGridApi.reload({ asnId: row.asnId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.asnId = 0;
          // 删除子表的数据
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'ChooseLotModal-chooseLotModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: ChooseLotModalComp,
      // },
      // 'CheckUserModal-checkUserModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: CheckUserModalComp,
      // },
    },
  },
);

const handleSearch = () => {
  childGridApi.reload({
    asnId: parentTableParams.value.asnId,
    productName: parentTableParams.value.productName,
  });
};
const handlePrint = () => {
  const record = chcGridApi.grid.getCheckboxRecords();
  if (record.length === 0) {
    message.error('请选择需要打印的数据');
    return;
  }
  const asnId = record.map((row) => row.asnId).join(',');
  Modal.confirm({
    title: '打印提示',
    content: '确认打印配送单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/asnAction/printAsnDoc.do?id=${asnId}`,
      });
    },
    onCancel() {},
  });
};
const handlePrintUndersupply = () => {
  const record = chcGridApi.grid.getCheckboxRecords();
  if (record.length === 0) {
    message.error('请选择需要打印的数据');
    return;
  }
  if (record.length > 1) {
    message.error('请选择一条数据打印欠品单');
    return;
  }
  const asnId = record.map((row) => row.asnId)[0];
  Modal.confirm({
    title: '打印提示',
    content: '确认打印欠品单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/asnAction/printOrderShortDoc.do?asnId=${asnId}`,
      });
    },
    onCancel() {},
  });
};

const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});
const handleQtyArrivedClick = (scope: any, type: string) => {
  console.warn('点击qtyArrived:', scope.row, scope.row.qtyArrived);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      clickType: type,
      ...scope.row,
    })
    .open();
};
onMounted(() => {
  // formSubmit();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <ActionLogModal />
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handlePrint"
                data-testid="button_printAsn"
              >
                打印配送单
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
              <Button
                style="margin-left: 10px"
                type="primary"
                @click="handlePrintUndersupply"
                data-testid="button_printUndersupply"
              >
                打印欠品单
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <ChildGrid>
            <template #qtyProcessDefault="scope">
              <InputNumber
                class="w-full"
                :min="0"
                v-model="scope.row.qtyProcess"
                :data-testid="`input_qtyProcess_${scope.rowIndex}`"
              />
              <span style="color: red">{{ scope.row.qtyProcess }}</span>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                style="margin-top: 10px"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                style="margin-top: 10px"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
            <template #qtyArrived="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyArrivedClick(scope, 'qtyArrived')"
                :data-testid="`button_qtyArrived_${scope.rowIndex}`"
              >
                {{ scope.row.qtyArrived }}
              </a>
            </template>
            <template #qtyChecked="scope">
              <a
                href="javascript:void(0)"
                class="cursor-pointer text-blue-600 underline hover:text-blue-800"
                @click="handleQtyArrivedClick(scope, 'qtyChecked')"
                :data-testid="`button_qtyChecked_${scope.rowIndex}`"
              >
                {{ scope.row.qtyChecked }}
              </a>
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

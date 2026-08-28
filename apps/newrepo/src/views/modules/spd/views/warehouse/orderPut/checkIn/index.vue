<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon, SearchActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, Input, InputGroup, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { addFormOptions } from './addFormOptions';
import addModalUi from './addModal/index.vue';
import { batchCheck } from './api';
import ChangeLocatorModalComp from './changeLocatorModal.vue';
import codeCheckModal from './codeCheck/codeCheckModal.vue';
import FormModal from './FormModal.vue';
import actionLogModal from './modals/actionLogModal.vue';
import { commonFormOptions, viewFormOptions } from './options';
import TemFormModal from './temCheck/FormModal.vue';
import { temFormOptions } from './temCheck/temFormOptions';

const userStore = useUserStore();
const route = useRoute();
const urlParams = route.meta?.urlParams || {};
const asnType = urlParams?.asnType || 'WO,SR,WR,MO';

class LazySelect {
  callBack;
  count;
  nowNum = 0;
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign() {
    this.nowNum++;
    if (this.nowNum === this.count) {
      this.callBack();
    }
  }
}
const selectController = new LazySelect(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});

const isFirstLoaded = ref(false);
const extParams = ref<{
  approvalStatus?: string;
  commitStatus?: string;
  isGift?: string;
}>({});

const [CodeCheckModal, codeCheckModalApi] = useVbenModal({
  connectedComponent: codeCheckModal,
  confirmText: '验收',
});

const [
  ChcGrid,
  ChcGridApi,
  { handleExport, ChangeLocatorModal, changeLocatorModalApi },
] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
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
        autoLoad: true,
      },
      cellStyle: ({ row }: { row: any }) => {
        if (row.error) {
          return { color: 'red' };
        }
        return {};
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
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
      },
      {
        field: 'orderDate',
        minWidth: 120,
        sortable: true,
        title: '申请时间',
      },
      {
        field: 'insurance',
        minWidth: 120,
        sortable: true,
        title: '医保编码',
      },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'standardCode',
        minWidth: 120,
        sortable: true,
        title: '贯标编码',
        visible: false, // TODO:medicine cancel 贯标码
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
      {
        field: 'manufacturer',
        minWidth: 120,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'productControlLevelName',
        minWidth: 90,
        sortable: true,
        visible: userStore.userInfo.isProductControlLevel,
        title: '药品组',
      },
      {
        field: 'uomName',
        minWidth: 60,
        sortable: true,
        title: '单位',
      },
      {
        field: 'qtyCheckLeft',
        minWidth: 100,
        sortable: true,
        title: '待验收数量',
        align: 'right',
        slots: { default: 'qtyCheckLeft' },
      },
      {
        field: 'qtyArrived',
        minWidth: 90,
        sortable: true,
        title: '到货数量',
        align: 'right',
        slots: { default: 'qtyArrived' },
      },
      {
        field: 'qtyChecked',
        minWidth: 100,
        sortable: true,
        title: '已验收数量',
        align: 'right',
      },
      {
        field: 'qtyRejected',
        minWidth: 100,
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
        field: 'productionDate',
        minWidth: 120,
        sortable: true,
        title: '生产日期',
      },
      {
        field: 'asnTypeName',
        minWidth: 100,
        sortable: true,
        title: '申请类型',
      },
      {
        field: 'deliveryNo',
        minWidth: 120,
        sortable: true,
        title: '配送单号',
      },
      {
        field: 'departmentName',
        minWidth: 120,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 120,
        sortable: true,
        title: '入库仓库',
      },
      {
        field: 'locatorName',
        minWidth: 120,
        sortable: true,
        title: '入库货位',
        slots: {
          default: 'locatorName',
        },
      },
      {
        field: 'bpartnerName',
        minWidth: 120,
        sortable: true,
        title: '申请单位',
      },
      {
        field: 'description',
        minWidth: 120,
        sortable: true,
        title: '备注',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        // visible: detailInfo.value?.type === 'edit',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 180,
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
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do',
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
        // defaultValue: '',
        fieldName: 'warehouseId',
        label: '收货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            allowClear: true,

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
        fieldName: 'fromWarehouseId',
        label: '申请仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000326',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择申请类型',
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
        fieldName: 'asnType',
        label: '申请类型',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        componentProps: {
          placeholder: '请输入申请单号',
        },
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
    dataTableId: `/asnAction/queryDetail.do?isSurgery=N&page=check`,
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
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      return {
        ...params,
        asnType: params.asnType || asnType,
      };
    },
    customModals: {
      'ChangeLocatorModal-changeLocatorModalApi': {
        // 连接抽离的组件
        connectedComponent: ChangeLocatorModalComp,
      },
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
    message.warning('请先选择数据');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '批量收货',
    content: `是否确认通过勾选的 ${selectedRows.length} 条数据？`,
    onOk: async () => {
      try {
        const asnLineIds = selectedRows.map((row) => row.asnLineId);
        // const params = new URLSearchParams();
        // params.append('asnLineIds', JSON.stringify(asnLineIds));
        const params = {
          asnLineId: JSON.stringify(asnLineIds),
        };
        // console.warn('params', params);
        await batchCheck(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('batchCheck', res);
              // 刷新表格数据
              ChcGridApi.query();
              message.success('收货成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('收货失败');
      }
    },
  });
};

const [OrgFormModal, modalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: FormModal,
});
const [TemCheckFormModal, temModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: TemFormModal,
});

const handleCancel = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择数据');
    return;
  }
  const asnLineIds = selectedRows.map((row) => row.asnLineId);
  const params = {
    asnLineIds: JSON.stringify(asnLineIds),
  };
  console.warn('params', params);

  const asnLineId = selectedRows.map((row: any) => row.asnLineId);
  modalApi
    .setData({
      formData: {
        asnLineId: JSON.stringify(asnLineId),
      },
      openType: 'close',
    })
    .open();
};

async function refreshTable() {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    ChcGridApi.query({ ...resData });
  });
}

const handleCodeChoose = async (records: any[]) => {
  console.warn('records', records);
};
// 验收温度
const handleTemCheck = async (scope: any) => {
  console.warn('scope', scope);
  temModalApi
    .setData({
      formData: {
        asnLineId: JSON.stringify(scope.row?.asnLineId),
      },
      openType: 'close',
    })
    .open();
};

// 扫码验收
const handleCodeCheck = (scope: any) => {
  console.warn('scope', scope);
  codeCheckModalApi!
    .setData({
      warehouseId: scope.row.warehouseId,
      productCode: scope.row.productCode,
      productName: scope.row.productName,
      asnLineId: scope.row.asnLineId,
      asnId: scope.row.asnId,
      lot: scope.row.lot,
      guaranteeDate: scope.row.guaranteeDate,
      replenishSource: 'P',
      type: 'add',
      handleCodeChoose,
    })
    .open();
};
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

const handleQtyArrivedClick = (scope: any) => {
  console.warn('点击qtyArrived:', scope.row, scope.row.qtyArrived);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      ...scope.row,
    })
    .open();
};
const handleQtyCheckLeftClick = (scope: any) => {
  console.warn('点击handleQtyCheckLeftClick:', scope.row, scope.row.qtyArrived);
  actionLogModalApi!
    .setData({
      ...scope.row,
      qtyType: 'checkIn',
    })
    .open();
};

const [addModal, addModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addModalUi,
  draggable: true,
});

const handleAdd = (scope: any) => {
  console.warn('scope', scope.row);
  addModalApi
    .setData({
      ChcGridApi,
      openType: 'add',
      formData: {
        showForm: true,
        showFormLast: false,
        showLot: scope.row.asnType !== 'WR',
        ...scope.row,
      },
    })
    .open();
};

// 修改验收货位
const handleChangeLocator = (row: any) => {
  // console.log('handleChangeLocator:locatorName', row);
  changeLocatorModalApi
    ?.setData({
      lineData: row,
      callBack(val: any) {
        row.locatorId = val.id;
        row.locatorName = val.name;
      },
    })
    .open();
};

onMounted(() => {
  console.warn('urlParams', selectController);
  // ChcGridApi.formApi.getValues().then((res: any) => {
  //   ChcGridApi.query({ ...res });
  // });
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <ActionLogModal />
    <addModal :after-submit="refreshTable" />
    <OrgFormModal
      :after-submit="refreshTable"
      :add-form-options="addFormOptions"
    />
    <TemCheckFormModal
      :after-submit="refreshTable"
      :add-form-options="temFormOptions"
    />
    <CodeCheckModal @close="refreshTable" />
    <ChangeLocatorModal />
    <ChcGrid>
      <template #qtyCheckLeft="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleQtyCheckLeftClick(scope)"
          :data-testid="`button_qtyCheckLeft_${scope.rowIndex}`"
        >
          {{ scope.row.qtyCheckLeft }}
        </a>
      </template>
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
      <template #locatorName="scope">
        <InputGroup compact>
          <Input
            v-model:value="scope.row.locatorName"
            class="readOnly"
            disabled
            style="width: calc(100% - 28px)"
            :data-testid="`input_locatorName_${scope.rowIndex}`"
          />
          <Button
            @click="handleChangeLocator(scope.row)"
            :data-testid="`button_changeLocator_${scope.rowIndex}`"
          >
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </InputGroup>
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleApprove"
          data-testid="button_approve"
        >
          批量收货
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleCancel"
          data-testid="button_cancel"
        >
          批量拒收
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
      <template #action="scope">
        <Button
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleTemCheck(scope)"
          :data-testid="`button_temCheck_${scope.rowIndex}`"
        >
          输入温度
        </Button>
        <Button
          type="primary"
          v-if="scope.row.isStoragePackage === 'Y'"
          danger
          @click="handleCodeCheck(scope)"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_codeCheck_${scope.rowIndex}`"
        >
          扫码验收
        </Button>
        <Button
          type="primary"
          v-if="scope.row.isStoragePackage !== 'Y'"
          danger
          style="background-color: #3717bb94"
          @click="handleAdd(scope)"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_add_${scope.rowIndex}`"
        >
          收货
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

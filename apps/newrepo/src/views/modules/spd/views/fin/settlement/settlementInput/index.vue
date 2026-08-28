<script lang="ts" setup>
import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import {
  AddActionIcon,
  EditActionIcon,
  IconfontBasicView,
  SearchActionIcon,
  SvgDeleteIcon,
  UploadCloudIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import {
  createSettlement,
  deleteLine,
  delSettlement,
  modifyPrice,
  submitSettlement,
} from '#/views/modules/spd/views/fin/settlement/api';
import { priceAdjustmentFormOptions } from '#/views/modules/spd/views/fin/settlement/common/options';
import chooseProductModalUi from '#/views/modules/spd/views/operation/packageUnitChange/changeApply/modals/chooseProductModal.vue';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import settlementDetailModal from './modals/settlementDetailModal.vue';
import settlementLineDetailModal from './modals/settlementLineDetailModal.vue';

const parentTableParams = ref<{ [key: string]: any }>({});
const globalPrintStore = useGlobalPrintStore();
// 子表
const [ChildGrid, childGridApi, { FormModal: RoleFormModal }] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        { title: '单选', type: 'radio', visible: false },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
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
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'modelNo',
          title: '型号',
          minWidth: '150',
          sortable: true,
          visible: false,
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
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'qty',
          title: '结算数量',
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'price',
          title: '结算开票价',
          formatter: ({ row }: any) => handlePriceToFixedTwo(row.price),
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'pricePO',
          title: '结算入库价',
          formatter: ({ row }: any) => handlePriceToFixedTwo(row.pricePO),
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'origPricePo',
          title: '采购入库价',
          formatter: ({ row }: any) => handlePriceToFixedTwo(row.origPricePo),
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'lineAmt',
          title: '结算金额',
          formatter: ({ row }: any) => handlePriceToFixedTwo(row.lineAmt),
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'origPricePoAmt',
          title: '采购入库金额',
          formatter: ({ row }: any) =>
            handlePriceToFixedTwo(row.origPricePoAmt),
          minWidth: '120',
          align: 'right',
          sortable: true,
        },
        {
          field: 'amountAdj',
          title: '调价金额',
          formatter: ({ row }: any) => handlePriceToFixedTwo(row.amountAdj),
          minWidth: '90',
          align: 'right',
          sortable: true,
        },
        {
          field: 'diffAmt',
          title: '尾差金额',
          formatter: ({ row }: any) => handlePriceToFixedTwo(row.diffAmt),
          minWidth: '100',
          align: 'right',
          sortable: true,
        },
        {
          field: 'qtySettleLeft',
          title: '未结数量',
          minWidth: '90',
          align: 'right',
          sortable: true,
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
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'invoiceRule',
          title: '分票规则',
          minWidth: '120',
          sortable: true,
        },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: $t('system.menu.operation'),
          width: 100,
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
    },
  },
  {
    parentTableParams,
    id: 'settlementInput_son',
    dataTableId: 'settlementAction/queryLine.do',
    beforeFetchFn: (params) => {
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
  },
);
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['settlementDateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        trigger: 'cell',
        highlight: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'settlementInput',
    // api地址
    dataTableId: '/settlementAction/query.do?page=input',
    showRadioRowTag: true,
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 0,
        align: 'center',
        visible: false,
      },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'settlementNo',
        title: '结算单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'settlementDate',
        title: '结算时间',
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '采购仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'endDate',
        title: '截止日期',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '结算金额',
        format: '0.00',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'origPricePoTotalAmt',
        title: '采购入库金额',
        format: '0.00',
        minWidth: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'totalAmountAdj',
        title: '调价金额',
        format: '0.00',
        minWidth: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'totalDiffAmt',
        title: '尾差金额',
        // format: '0.000##',
        minWidth: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'isNeedInvoice',
        title: '需开票',
        minWidth: '80',
        formatter: ({ cellValue }: any) => (cellValue === 'Y' ? '是' : '否'),
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
        minWidth: '160',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },

      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 190,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'settlementDateRange',
        label: $t('fin.settlement.settlementInput.settlementDateRange'),
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: $t('fin.settlement.settlementInput.warehouseId'),
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
            placeholder: `请选择${$t('fin.settlement.settlementInput.warehouseId')}`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: `请选择供应商`,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isNeedInvoice',
        label: '需开票',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isNeedPay',
        label: '有调价',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: ``,
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
      },
    ],
    gridEvents: {
      radioChange: onRadioChange,
    },
    afterFetchFn: (res: any) => {
      console.warn('afterFetchFn res', res);
      if (isEmpty(res?.rows)) {
        childGridApi?.grid?.reloadData([]);
      }
      return { ...res, rows: undefined, records: res.rows };
    },
    // childGridLinkKeys: ['userId-id'],
    // childGridApi: childGridApi,
  },
);

async function onRadioChange({ row }: { row: any }) {
  if (row && row.settlementId) {
    parentTableParams.value.settlementId = row.settlementId;
    childGridApi.reload({
      settlementId: parentTableParams.value.settlementId,
    });
    await ChcGridApi.grid.clearCheckboxRow();
    ChcGridApi.grid.setCheckboxRow(row, true);
  } else {
    parentTableParams.value.settlementId = undefined;
    childGridApi.grid.remove(childGridApi.grid.getFullData());
  }
}

function del() {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确定要删除结算单吗？`,
    okType: 'danger',
    onOk: async () => {
      try {
        await delSettlement({
          settlementId: JSON.stringify(
            selectedRows.map(({ settlementId }) => settlementId),
          ),
        });

        message.success('删除成功');

        ChcGridApi.query();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

function handleDelChild() {
  const selectedRow = childGridApi.grid.getRadioRecord();

  if (!selectedRow) {
    message.error('请选择一条行记录');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    okType: 'danger',
    onOk: async () => {
      try {
        await deleteLine({
          id: selectedRow.settlementLineId,
        });

        message.success('删除成功');
        handleSearch();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

const productName = ref('');
const handleSearch = () => {
  if (!parentTableParams.value.settlementId) {
    return;
  }
  childGridApi.reload({
    settlementId: parentTableParams.value.settlementId,
    productName: productName.value,
  });
};

// 新增 编辑 表单提交之后执行
function refreshTable() {
  ChcGridApi.query();
}

// 子表 - 调整结算价对话框
const [SettlementPriceAdjustmentModal, settlementPriceAdjustmentModalApi] =
  useVbenModal({
    class: 'w-[400px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

function adjustSettlementPrice() {
  const selectedRow = childGridApi.grid.getRadioRecord();

  if (!selectedRow) {
    message.error('请选择一条行记录');
    return;
  }

  settlementPriceAdjustmentModalApi
    .setData({
      title: '调整结算价',
      form: {
        price: selectedRow.price,
      },
      submit: (params: any) =>
        modifyPrice({
          ...params,
          id: selectedRow.settlementLineId,
        }),
    })
    .open();
}

const addSettlementModalRef = ref<
  | (Record<string, any> & {
      formApi?: ExtendedFormApi;
      modalApi: ExtendedModalApi;
    })
  | undefined
>();

const handleAdd = () => {
  addSettlementModalRef.value?.modalApi
    .setData({
      title: '生成结算单',
      form: {
        productId: '',
      },
      submit({ warehouseId, ...params }) {
        params.warehouseId = warehouseId?.join(',');
        return createSettlement(params);
      },
    })
    .open();
};

// 选择药品
const [ChooseProductModal, ChooseProductModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  draggable: true,
  connectedComponent: chooseProductModalUi,
});

// 父表结算明细modal
const [SettlementDetailModal, settlementDetailModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: settlementDetailModal,
  draggable: true,
});
// 结算明细
const handleSettlementDetail = (row: any) => {
  console.warn('handleSettlementDetail', row);
  settlementDetailModalApi
    .setData({
      settlementId: row.settlementId,
    })
    .open();
};

// 子表结算明细modal
const [SettlementLineDetailModal, settlementLineDetailModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 链接抽离的组件
  connectedComponent: settlementLineDetailModal,
  draggable: true,
});

// 子表结算明细
const handleSettlementLineDetail = (row: any) => {
  console.warn('handleSettlementLineDetail', row);
  settlementLineDetailModalApi
    .setData({
      settlementlineId: row.settlementLineId,
    })
    .open();
};

const formOptions: VbenFormProps = {
  layout: 'horizontal',
  schema: [
    {
      component: 'DatePicker',
      fieldName: 'endDate',
      componentProps: () => {
        return {
          valueFormat: 'YYYY-MM-DD',
        };
      },
      defaultValue: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      label: '截止日期',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
      },
      fieldName: 'isPrecious',
      label: '高值',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
      },
      fieldName: 'isFee',
      label: '是否计价',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
      },
      fieldName: 'isBid',
      label: '是否中标',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          mode: 'multiple',
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
          // showSearch: true,
          placeholder: '请选择采购仓库',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      // defaultValue: 1_000_007,
      fieldName: 'warehouseId',
      label: '采购仓库',
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
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'vendorId',
      label: '供应商',
    },
    {
      component: 'InputSearch',
      componentProps: {
        maxLength: 50,
        placeholder: '请输入',
        onSearch(productCode = '') {
          ChooseProductModalApi.setData({
            productCode,
            callback({
              productId,
              productCode,
              productName,
            }: Record<string, any>) {
              addSettlementModalRef.value?.formApi?.setValues({
                productId,
                productCode: `${productCode}_${productName}`,
              });
            },
          }).open();
        },
      },
      fieldName: 'productCode',
      label: '药品',
    },

    /* !!!必须保留此对象，防止最终获取表单数据时不返回手动设置的productId*/
    {
      component: 'Input',
      fieldName: 'productId',
      formItemClass: 'hidden',
    },
    {
      component: 'Switch',
      componentProps: {
        checkedChildren: '是',
        checkedValue: 'Y',
        unCheckedChildren: '否',
        unCheckedValue: 'N',
        style: {
          width: '40px',
        },
      },
      fieldName: 'isSettleOdd',
      label: '结算零头',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '备注',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

/**
 * 页面弹窗表单配置
 */

function submit() {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认提交吗？`,
    onOk: async () => {
      try {
        await submitSettlement({
          settlementId: JSON.stringify(
            selectedRows.map(({ settlementId }) => settlementId),
          ),
        });

        message.success('提交成功');

        ChcGridApi.query();
      } catch {
        message.error('提交失败');
      }
    },
  });
}

onMounted(() => {
  ChcGridApi.formApi.getValues().then((values) => {
    ChcGridApi.query(values);
  });
});
const handlePrintDetail = (row: any) => {
  const headerId = row.settlementId;
  Modal.confirm({
    title: '打印提示',
    content: '确认打印结算明细吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/settlementAction/printSettlementLineDetail.do?id=${headerId}`,
      });
    },
    onCancel() {},
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <commonFormModalComp
          ref="addSettlementModalRef"
          :form-options="formOptions"
          :after-submit="refreshTable"
        />
        <SettlementDetailModal />
        <SettlementPriceAdjustmentModal
          :after-submit="handleSearch"
          :form-options="priceAdjustmentFormOptions"
        />
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleAdd()"
              class="mr-[0.5rem]"
              data-testid="button_add"
            >
              生成
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="submit()"
              data-testid="button_submit"
            >
              <template #icon>
                <UploadCloudIcon />
              </template>
              提交
            </Button>
            <Button
              ghost
              danger
              class="mr-[0.5rem]"
              @click="del()"
              data-testid="button_parent_del"
            >
              删除
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
          </template>
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleSettlementDetail(scope.row)"
              :data-testid="`button_settlementDetail_${scope.rowIndex}`"
            >
              结算明细
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handlePrintDetail(scope.row)"
              :data-testid="`button_printDetail_${scope.rowIndex}`"
            >
              打印明细
              <template #icon>
                <EditActionIcon />
              </template>
            </Button>
            <!-- <Button
              ghost
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleDelChild(scope.row)"
            >
              删除
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button> -->
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <RoleFormModal />
        <SettlementLineDetailModal />
        <ChildGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入药品名称"
              @keyup.enter="handleSearch()"
              allow-clear
              data-testid="input_productName"
            />
            <Button
              type="primary"
              @click="handleSearch()"
              data-testid="button_child_search"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
            <Button
              ghost
              danger
              class="mx-[6px]"
              @click="handleDelChild()"
              data-testid="button_child_del"
            >
              删除行
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
            <Button
              ghost
              type="primary"
              class="mr-[6px]"
              @click="adjustSettlementPrice()"
              data-testid="button_adjustSettlementPrice"
            >
              调整结算价
              <template #icon>
                <EditActionIcon />
              </template>
            </Button>
          </template>
          <template #action="scope">
            <Button
              ghost
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleSettlementLineDetail(scope.row)"
              :data-testid="`button_settlementLineDetail_${scope.rowIndex}`"
            >
              结算明细
              <template #icon>
                <IconfontBasicView />
              </template>
            </Button>
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
  <ChooseProductModal />
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

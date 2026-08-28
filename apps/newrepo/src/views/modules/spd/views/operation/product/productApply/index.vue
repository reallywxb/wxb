<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { EditActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import approvalModalUI from './modals/approvalModal.vue';
import productModalUI from './modals/productModal.vue';
import rejectModalUI from './modals/rejectModal.vue';

//

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;

const urlParams: any = {
  productControlLevel: urlParamsObj?.productControlLevel || '',
  hiddenField: urlParamsObj?.hiddenField || '',
  page: urlParamsObj?.page || '',
};

const [productModal, productModalApi] = useVbenModal({
  connectedComponent: productModalUI,
});

const [approvalModal, approvalModalApi] = useVbenModal({
  connectedComponent: approvalModalUI,
});

const [rejectModal, rejectModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rejectModalUI,
  draggable: true,
});

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // 提交函数
      handleSubmit: () => {
        if (selectRow.value.productCode) {
          roleGridApi.formApi.getValues().then((res: any) => {
            roleGridApi.query({ ...res });
          });
        }
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
      cellStyle(scope: any) {
        if (scope.column.field === 'isActive' && scope.row.isActive === 'N') {
          return {
            color: 'red',
          };
        }
        if (scope.row.isActive === 'N') {
          return {
            color: 'gray',
          };
        }
        if (
          scope.row.certValidTo &&
          dayjs(scope.row.certValidTo).isBefore(dayjs(), 'day')
        ) {
          return {
            color: 'red',
          };
        }
      },
    }),
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        // hover: true,
        sortable: true,
      },
      {
        field: 'name',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'medicineName',
        title: '通用名',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '120',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '120',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturerName',
        title: '生产厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'pricePO',
        title: '采购价',
        width: '70',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePo);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceList',
        title: '零售价',
        width: '70',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceList);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'uomName',
        title: '采购单位',
        width: '120',
        sortable: true,
      },
      {
        field: 'baseUOMName',
        title: '最小单位',
        width: '120',
        sortable: true,
      },
      {
        field: 'baseUOMQty',
        title: '转换比',
        width: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'defaultVendorName',
        title: '默认供应商',
        width: '130',
        sortable: true,
      },
      {
        field: 'certificateNo',
        title: '批准文号',
        width: '110',
        // hover: true,
      },
      {
        field: 'certValidTo',
        title: '批准文号效期',
        width: '110',
        // render: function (item) {
        //   if (item.certValidTo) {
        //     if (new Date(item) < new Date()) return 'red';
        //   }
        //   return '';
        // },
      },
      {
        field: 'standardCode',
        title: '贯标编码',
        width: '220',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
      },
      {
        field: 'productStateCode',
        title: '商品本位码',
        width: '100',
      },
      {
        field: 'markCode',
        title: '省标编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'cityBidCode',
        title: '市标编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'isBulkPurchase',
        title: '带量采购',
        width: '120',

        formatter: ({ row }: any) => {
          return row.isBulkPurchase === 'Y' ? '是' : '否';
        },
        sortable: true,
      },

      {
        field: 'isOnLine',
        title: '是否线上',
        width: '120',
        sortable: true,
        formatter: ({ row }: any) => {
          return row.isOnLine === 'Y' ? '是' : '否';
        },
      },

      {
        field: 'contractDateFrom',
        title: '合同开始日期',
        width: '120',
        sortable: true,
      },
      {
        field: 'contractDateTo',
        title: '合同结束日期',
        width: '150',
        sortable: true,
      },
      {
        field: 'isActive',
        title: '是否有效',
        width: '120',
        sortable: true,

        formatter: ({ row }: any) => {
          return row.isActive === 'Y' ? '是' : '否';
        },
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'productSpec',
        label: '规格',
        componentProps: {
          placeholder: '请输入规格',
        },
      },
      {
        component: 'Input',
        fieldName: 'manufacturerName',
        label: '厂家',
        componentProps: {
          placeholder: '请输入厂家',
        },
      },
      // {
      //   component: 'Input',
      //   fieldName: 'modelNo',
      //   label: '型号',
      //   componentProps: {
      //     placeholder: '请输入型号',
      //   },
      // },
      {
        component: 'Input',
        fieldName: 'certificateNo',
        label: '注册证号',
        componentProps: {
          placeholder: '请输入注册证号',
        },
      },
    ],
    id: 'child',
    beforeFetchFn: (params) => {
      if (isEmpty(selectRow.value?.productCode)) {
        return false;
      }
      return {
        ...params,
        productCode: selectRow.value.productCode,
      };
    },
    queryUrl: '/productAction/queryProduct.do',
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },

      cellStyle(scope: any) {
        const kerArr = [
          'productName',
          'medicineName',
          'productSpec',
          'manufacturer',
          'pricePo',
          'priceList',
          'uomName',
          'baseUomName',
          'packageQty',
          'vendorName',
          'certificateNo',
          'productStateCode',
          'productUserCode',
          'isBulkPurchase',
          'contractDateFrom',
        ];
        const keyObj: any = {
          model: 'mModelNo',
          certificateValidDate: 'certvalidto',
          contractDateFrom: 'mContractDateTo',
          isOnLine: 'mIsOnline',
        };
        const filed = scope.column.field;
        if (!filed) return;

        const mFiled = `m${filed.charAt(0).toUpperCase() + filed.slice(1).toLowerCase()}`;
        const MFiled = `m${filed.charAt(0).toUpperCase() + filed.slice(1)}`;

        if (
          scope.row.productCode &&
          kerArr.includes(filed) &&
          scope.row[filed] !== (scope.row[mFiled] || scope.row[MFiled])
        ) {
          return {
            color: 'red',
          };
        }
        let isRed = false;
        Object.keys(keyObj).forEach((key) => {
          isRed =
            scope.row.productCode && scope.row[key] !== scope.row[keyObj[key]];
        });
        if (isRed) {
          return {
            color: 'red',
          };
        }
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: `/productAction/queryProductApply.do?page=approve`,
    showRadioRowTag: true,
    gridColumns: [
      {
        type: 'radio',
        width: 120,
        fixed: 'left',
        visible: false,
      },
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'isNew',
        title: '申请类型',
        width: '120',
        sortable: true,
        formatter: ({ row }: any) => {
          return row.isNew > 0 ? '修改' : '新增';
        },
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',

        sortable: true,
      },
      {
        field: 'medicineName',
        title: '通用名',
        width: '150',

        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '120',

        sortable: true,
      },
      {
        field: 'model',
        title: '型号',
        width: '100',
        visible: false,
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '150',

        sortable: true,
      },
      {
        field: 'pricePo',
        title: '采购价',
        width: '120',

        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        width: '120',

        sortable: true,
      },
      {
        field: 'uomName',
        title: '采购单位',
        width: '120',

        sortable: true,
      },
      {
        field: 'baseUomName',
        title: '最小单位',
        width: '120',

        sortable: true,
      },
      {
        field: 'packageQty',
        title: '转换比',
        width: '120',

        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '130',

        sortable: true,
      },
      {
        field: 'certificateNo',
        title: '批准文号',

        width: '110',
      },
      {
        field: 'certificateValidDate',
        title: '批准文号效期',

        width: '150',
      },
      {
        field: 'productStateCode',
        title: '商品本位码',

        width: '100',
      },
      {
        field: 'productUserCode',
        title: '用户自编码',

        width: '120',
        sortable: true,
      },
      {
        field: 'isBulkPurchase',
        title: '带量采购',

        width: '120',
        sortable: true,
        formatter: ({ row }: any) => {
          return row.isBulkPurchase === 'Y' ? '是' : '否';
        },
      },

      {
        field: 'isOnLine',
        title: '是否线上',
        width: '120',

        sortable: true,

        formatter: ({ row }: any) => {
          return row.isOnLine === 'Y' ? '是' : '否';
        },
      },

      {
        field: 'contractDateFrom',
        title: '合同开始日期',
        width: '120',

        sortable: true,
      },
      {
        field: 'contractDateTo',
        title: '合同结束日期',
        width: '120',

        sortable: true,
      },
      {
        field: 'nextProductCode',
        title: '自动生成编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productApplyId',
        title: '申请单号',
        width: '120',
        sortable: true,
      },
      {
        field: 'siteProductApplyId',
        title: '来源单据号',
        width: '120',
        sortable: true,
      },
      {
        field: 'isActive',
        title: '是否批准',
        width: '120',
        sortable: true,
        visible: urlParams.page === 'query',

        formatter: ({ row }: any) => {
          return row.isActive === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isApproved',
        title: '是否审批',
        width: '120',
        sortable: true,

        visible: urlParams.page === 'query',

        formatter: ({ row }: any) => {
          return row.isApproved === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'docstatus',
        title: '状态',
        width: '90',
        sortable: true,
      },
      {
        field: 'applyTime',
        title: '申请时间',
        width: '120',
      },
      {
        field: 'checkUser',
        title: '初审人',
        visible:
          urlParams.page === 'secondApprove' || urlParams.page === 'query',
        width: '100',
      },
      {
        field: 'checkTime',
        title: '初审时间',
        visible:
          urlParams.page === 'secondApprove' || urlParams.page === 'query',
        width: '120',
      },
      {
        field: 'checkRemark',
        title: '初审备注',
        visible:
          urlParams.page === 'secondApprove' || urlParams.page === 'query',
        width: '150',
      },
      {
        field: 'approveUser',
        title: '审批人',
        width: '100',
      },
      {
        field: 'approveTime',
        title: '审批时间',
        width: '120',
      },
      {
        field: 'description',
        title: '审批备注',
        width: '150',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'certificateNo',
        label: '批准文号',
        componentProps: {
          placeholder: '请输入批准文号',
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        formItemClass: 'col-span-1',
      },
      // TODO:medicine cancel 贯标码
      // {
      //   component: 'Input',
      //   fieldName: 'standardCode',
      //   label: '贯标编码',
      //   componentProps: {
      //     placeholder: '请输入贯标编码',
      //   },
      // },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/vendor.do',
            // showSearch: true,
            placeholder: '请选择供应商',
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
        fieldName: 'vendorId',
        label: '供应商',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '新增' },
              { value: 'N', label: '修改' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isNew',
        label: '申请类型',
      },
    ],

    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        if (row && row.productCode) {
          selectRow.value = row;
          roleGridApi.query();
        } else {
          // 父表没数据，子表要清空
          roleGridApi.grid.remove();
          selectRow.value = {};
        }
      },
    },
    afterFetchFn: (params) => {
      roleGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
};

const handleEdit = (scope: any) => {
  productModalApi.setData(scope.row).open();
};

const handleApproval = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  const update: any = [];
  const productCodes: any = [];
  selectedRows.forEach((row: any) => {
    update.push(row.productApplyId);
    productCodes.push(row.nextProductCode);
  });
  let type = 'add'; // 单个可以修改生成的编码
  if (update.length > 1) {
    type = 'batch';
  }
  approvalModalApi
    .setData({
      ids: update,
      productCodes,
      rows: selectedRows,
      page: urlParams.page,
      type,
    })
    .open();
};

const handleReject = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  const update: any = [];
  selectedRows.forEach((row: any) => {
    update.push(row.productApplyId);
  });

  rejectModalApi
    .setData({
      ids: JSON.stringify(update),
      isApprove: 'N',
      page: urlParams.page,
    })
    .open();
};
const selectRow = ref<any>({});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <productModal @confirm="handleQuery" />
      <approvalModal @confirm="handleQuery" />
      <rejectModal @close="handleQuery" />

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
                @click="handleApproval"
                class="mr-[0.5rem]"
                data-testid="button_approval"
              >
                批准
              </Button>
              <Button
                type="primary"
                @click="handleReject"
                data-testid="button_reject"
              >
                拒绝
              </Button>
            </template>
            <template #action="scope">
              <Button
                ghost
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleEdit(scope)"
                :data-testid="`button_edit_${scope.rowIndex}`"
              >
                编辑
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid />
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

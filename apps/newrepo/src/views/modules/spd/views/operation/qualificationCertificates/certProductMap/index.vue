<script lang="ts" setup>
import type { ParentTableItem } from './modals/api';

import { nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { SvgCloseIcon, SvgDeleteIcon, SvgSaveIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

import actionLogModal from './modals/actionLogModal.vue';
import { deleteActive, updateActive } from './modals/api';
import previewImageUi from './modals/previewImageModel.vue';

const userStore = useUserStore();
const route = useRoute();
const urlParams = route.meta?.urlParams || {};

const [PreviewImageModal, PreviewImageModalApi] = useVbenModal({
  class: 'w-[850px]',
  draggable: true,
  closable: true,
  connectedComponent: previewImageUi,
});

const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

const fatherTableCheckedRow = ref<Record<string, any>>({});
// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ['dateGun', ['certValidFrom', 'certValidTo'], 'YYYY-MM-DD'],
      ],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
      // rowStyle:() => {}
      // cellStyle: () => {}
    }),
  },
  {
    gridColumns: [
      {
        type: 'radio',
        width: 60,
        visible: false,
        title: '单选',
      },
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
        field: 'productcode',
        title: '药品编码',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        minWidth: 200,
        sortable: true,
        visible: false, // TODO:medicine cancel 型号
      },
      {
        field: 'manufacturer',
        title: '生产企业',
        sortable: true,
        minWidth: 120,
      },
      // { field: 'uomName', title: '单位', sortable: true, minWidth: 100 },
      {
        field: 'isActive',
        title: '是否启用',
        minWidth: 110,
        sortable: true,
        formatter(scope: any) {
          return scope.row.isActive === 'Y' ? '是' : '否';
        },
      },
    ],
    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    queryUrl: '/productMapAction/query.do',
    beforeFetchFn: (params) => {
      return {
        ...params,
        productId: fatherTableCheckedRow.value.productId || 0,
      };
    },
    afterFetchFn: (params) => {
      // 数据加载成功后，自动选中第一行
      if (params.rows && params.rows.length > 0) {
        nextTick(() => {
          roleGridApi.grid.setRadioRow(params.rows[0]);
        });
      }
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
      fieldMappingTime: [
        ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ['dateGun', ['certValidFrom', 'certValidTo'], 'YYYY-MM-DD'],
      ],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      sortConfig: {
        defaultSort: {
          // field: 'priorityRuleName',
          // order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'parent',
    // queryUrl:
    //   '/asnAction/query.do?page=transship&isSurgery=N&asnType=WO,MO,WR,SR&asnRegType=IN',
    queryUrl: '/certAction/query.do',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      { field: 'bpartnerName', title: '供应商', minWidth: 110, sortable: true },
      { field: 'certNo', title: '证照号码', minWidth: 110, sortable: true },
      { field: 'asnNo', title: '证照号码', minWidth: 110, sortable: true },
      {
        field: 'productName',
        title: '产品名称',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'manufacturerName',
        title: '生产企业',
        minWidth: 100,
        sortable: true,
      },
      { field: 'certDate', title: '发证日期', minWidth: 100, sortable: true },
      {
        field: 'certValidTo',
        title: '有效日期',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'productTypeName',
        title: '产品类型',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'certTypeName',
        title: '证照类型',
        minWidth: 110,
        sortable: true,
      },
      { field: 'description', title: '备注', minWidth: 150, sortable: true },
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
        fieldName: 'certNo',
        label: '证照号码',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000477',
            placeholder: '请选择证照类型',
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
        fieldName: 'certType',
        label: '证照类型',
      },
      {
        component: 'Input',
        fieldName: 'manufacturerName',
        label: '生产企业名称',
      },
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '发证日期',
        defaultValue: [],
        // defaultValue: [
        //   dayjs(dayjs().format('YYYY-MM-DD'))
        //     .subtract(2, 'year')
        //     .subtract(2, 'week')
        //     .subtract(1, 'day')
        //     .format('YYYY-MM-DD'),
        // ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '产品名称',
      },
      {
        component: 'Input',
        fieldName: 'productCode',
        label: '产品编码',
      },
      {
        component: 'DateGroup',
        fieldName: 'dateGun',
        label: '有效日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(2, 'year')
            .subtract(2, 'week')
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
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
    ],
    gridEvents: {
      radioChange: ({ row }: { row: ParentTableItem }) => {
        if (row && row.productId) {
          fatherTableCheckedRow.value = deepClone(row);
          roleGridApi.reload({ productId: row.productId });
        } else {
          // 父表没数据，子表要清空
          fatherTableCheckedRow.value = {};
          roleGridApi.grid.remove();
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

// const handleSearch = () => {
//   roleGridApi.query({
//     asnId: parentTableParams.value.asnId,
//     productName: parentTableParams.value.productName,
//   });
// };

// async function refreshTable() {
//   ChcGridApi.formApi.getValues().then((resData: any) => {
//     console.warn('getValues', resData);
//     ChcGridApi.query({ ...resData });
//   });
// }

// 查看图片
const handlePriview = (row: any) => {
  console.warn('row', row);
  PreviewImageModalApi.setData({
    imageList: row.filePaths,
  }).open();
};

// 关联药品
const handleQtyArrivedClick = () => {
  console.warn('点击handleQtyArrivedClick');
  if (!fatherTableCheckedRow.value.productId) {
    message.warning('请先选择要关联的证照');
    return;
  }
  actionLogModalApi!
    .setData({
      ctProductId: fatherTableCheckedRow.value.productId,
      callBack: () => {
        ChcGridApi.query();
      },
    })
    .open();
};
// 启用
const handleApprove = () => {
  console.warn('点击handleApprove');
  const selectedRow = roleGridApi.grid.getRadioRecord(true);
  console.warn('selectedRow===>', selectedRow);
  if (!selectedRow || !selectedRow.mapId) {
    message.warning('请选择一条记录！');
  }
  updateActive({
    isActive: 'Y',
    productMapId: selectedRow.mapId,
  }).then((res) => {
    if (res && res.success) {
      message.success('启用成功');
      roleGridApi.query({
        productId: fatherTableCheckedRow.value.productId,
      });
    }
  });
};
// 作废
const handleCancel = () => {
  console.warn('点击handleCancel');
  const selectedRow = roleGridApi.grid.getRadioRecord(true);
  if (!selectedRow || !selectedRow.mapId) {
    message.warning('请先选择要作废的 记录！');
    return;
  }
  updateActive({
    isActive: 'N',
    productMapId: selectedRow.mapId,
  }).then((res) => {
    if (res && res.success) {
      message.success('作废成功');
      roleGridApi.query({
        productId: fatherTableCheckedRow.value.productId,
      });
    }
  });
};
// 删除
const handleDel = () => {
  console.warn('点击handleDel');
  const selectedRow = roleGridApi.grid.getRadioRecord(true);
  if (!selectedRow || !selectedRow.mapId) {
    message.warning('请选择一条记录！');
    return;
  }
  deleteActive({
    productMapId: selectedRow.mapId,
  }).then((res) => {
    if (res && res.success) {
      message.success('删除成功');
      roleGridApi.query({
        productId: fatherTableCheckedRow.value.productId,
      });
    }
  });
};

onMounted(() => {
  console.warn('urlParams:', urlParams, userStore);
  ChcGridApi.query();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PreviewImageModal />
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
            <template #action="scope">
              <Button
                type="primary"
                class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handlePriview(scope.row)"
                :data-testid="`button_viewImage_${scope.rowIndex}`"
              >
                查看图片
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleQtyArrivedClick"
                data-testid="button_associateGoods"
              >
                关联药品
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleApprove"
                data-testid="button_enable"
              >
                启用
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleCancel"
                data-testid="button_cancel"
              >
                作废
                <template #icon>
                  <SvgCloseIcon />
                </template>
              </Button>
              <Button
                type="primary"
                danger
                class="mr-[0.5rem]"
                @click="handleDel"
                data-testid="button_delete"
              >
                删除
                <template #icon>
                  <SvgDeleteIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
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

::v-deep(.row--radio td) {
  background-color: #85b8f3 !important;
}
</style>

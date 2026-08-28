<script lang="ts" setup>
import { computed, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import cuModalUi from './modals/cuModal.vue';

const userStore = useUserStore();
const route = useRoute();

// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
console.warn('userStore', userStore);

const [CuModal, cuModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: cuModalUi,
  draggable: true,
});

const checkedRow = ref<Record<string, any>>({});
const rowBtnVisible = computed(() => {
  if (
    checkedRow.value?.docStatus === 'WC' ||
    checkedRow.value?.docStatus === 'CO' ||
    checkedRow.value?.docStatus === 'NA'
  ) {
    return false;
  }
  console.warn('rowBtnVisible');
  return true;
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
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
    }),
  },
  {
    id: 'packageUnitChangeApply',
    // api地址
    queryUrl: '/packUnitChangeApplyAction/query.do?page=input',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        align: 'center',
        width: 50,
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        align: 'center',
        width: 50,
      },
      {
        field: 'warehouseName',
        title: '申请库位',
        width: '120',
        sortable: true,
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
        width: '250',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '150',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '150',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '72',
        sortable: true,
      },
      {
        field: 'changeTypeName',
        title: '变更类型',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'oldPackUnitText',
        title: '原定数',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packUnitText',
        title: '申请定数',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'oldPackageUnitTopLimit',
        title: '原定数包上限',
        width: '115',
        align: 'right',
        sortable: true,
      },
      {
        field: 'packageUnitTopLimit',
        title: '定数包上限',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'docStatus',
        title: '审批状态',
        width: '110',
        align: 'right',
        sortable: true,
        formatter: ({ cellValue }) => {
          if (cellValue === 'DR') {
            return '新建';
          }
          if (cellValue === 'WC') {
            return '待审核';
          }
          if (cellValue === 'WA') {
            return '待审批';
          }
          if (cellValue === 'NA') {
            return '未批准';
          }
          if (cellValue === 'AP') {
            return '待执行';
          }
          if (cellValue === 'CO') {
            return '已完成';
          }
          return '';
        },
      },
      {
        field: 'rejectreason',
        title: '拒绝原因',
        width: '110',
        align: 'right',
        sortable: true,
      },
      {
        field: 'description',
        title: '申请原因',
        width: '150',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '申请人',
        width: '100',
        sortable: true,
      },
      {
        field: 'checkedbyname',
        title: '审核人',
        width: '100',
        sortable: true,
      },
      {
        field: 'approvedbyname',
        title: '审批人',
        width: '100',
        sortable: true,
      },
      {
        field: 'completedbyname',
        title: '执行人',
        width: '100',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '申请时间',
        defaultValue: [
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'), // 七天前
        ],
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '',
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
        fieldName: 'warehouseId',
        label: '申请库位',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            placeholder: '',
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
      },
      {
        component: 'ChcSelect',
        fieldName: 'docStatus',
        label: '申请状态',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            options: [
              { value: '', label: '全部' },
              { value: 'DR', label: '新建' },
              { value: 'WC', label: '待审核' },
              { value: 'WA', label: '待审批' },
              { value: 'PA', label: '待执行' },
              { value: 'NA', label: '未批准' },
              { value: 'CO', label: '已完成' },
            ],
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: `编码/拼音码/名称`,
            defaultValue: '',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: (d: any) => {
        console.warn('radioChange', d);
        checkedRow.value = {};
        checkedRow.value = toRaw(d.row);
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('getTableArrDataFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleAdd = () => {
  cuModalApi
    .setData({
      modalTitle: '添加',
      modalType: 'ADD',
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
const handleEdit = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择一条记录！');
    return;
  }
  cuModalApi
    .setData({
      modalTitle: '修改',
      modalType: 'EDIT',
      row: unProxyRow,
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
const handleDel = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择申请单');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    onOk: async () => {
      try {
        await requestFormClient.post(`/packUnitChangeApplyAction/delete.do`, {
          applyId: unProxyRow.packUnitChangeApplyID,
        });

        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};
const handleSubmit = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  if (isEmpty(unProxyRow)) {
    message.warning('请选择申请单');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '确认提交申请单吗？',
    onOk: async () => {
      try {
        await requestFormClient.post('/packUnitChangeApplyAction/commit.do', {
          packUnitChangeApplyID: unProxyRow.packUnitChangeApplyID,
        });
        message.success('提交成功');
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <CuModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add"
        >
          新建
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          v-show="rowBtnVisible"
          type="primary"
          @click="handleEdit"
          class="mr-[0.5rem]"
          data-testid="button_edit"
        >
          修改
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          v-show="rowBtnVisible"
          type="primary"
          danger
          @click="handleDel"
          class="mr-[0.5rem]"
          data-testid="button_delete"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
        <Button
          v-show="rowBtnVisible"
          type="primary"
          @click="handleSubmit"
          class="mr-[0.5rem]"
          data-testid="button_submit"
        >
          提交
        </Button>
      </template>
    </ChcGrid>
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

<script lang="ts" setup>
import { nextTick, onMounted, provide, unref } from 'vue';
import { useRoute } from 'vue-router';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import rejectModalUi from './modals/rejectModal.vue';

const userStore = useUserStore();

const route = useRoute();

// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数

console.warn('urlParams', urlParams);

onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
});
const [RejectModal, RejectModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: rejectModalUi,
  draggable: true,
});
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi?.formApi?.getFieldComponentRef &&
    typeof ChcGridApi?.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi?.formApi?.getFieldComponentRef(fieldName) &&
    ChcGridApi?.formApi?.getFieldComponentRef(fieldName).params
  );
};
const fetchSelectOptions = (fieldName: string, params: Record<string, any>) => {
  const c = isFieldComponentRefExist(fieldName);
  if (c) {
    const refInst = ChcGridApi.formApi.getFieldComponentRef(
      fieldName,
    ) as unknown as SelectComponentRef;
    if (refInst && refInst.params) {
      Object.assign(refInst.params, params);
      if (typeof refInst?.fetchApi === 'function') {
        refInst.fetchApi();
      }
    }
  }
};
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
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
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
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'unitChangeApprove',
    // api地址
    queryUrl: '/packUnitChangeApplyAction/query.do?page=approve',
    gridColumns: [
      {
        type: 'radio',
        width: '50',
        align: 'center',
        title: '单选',
        visible: false,
      },
      {
        type: 'seq',
        width: '50',
        align: 'center',
        title: '序号',
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
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
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
            defaultValue: '',
            afterFetch(res: any) {
              nextTick(() => {
                fetchSelectOptions('warehouseId', {
                  dictUrl: `/baseHandleAction/warehouse.do?readWrite=Y&level1=N&regionId=${-1}`,
                });
              });
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '申请库位',
        componentProps: () => {
          return {
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            placeholder: '请选择申请库位',
            paginate: false,
            showChooseAll: '',
            // immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            const c = isFieldComponentRefExist('warehouseId');
            console.warn('isFieldComponentRefExist warehouseId', c);
            if (c) {
              const refInst = ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `/baseHandleAction/warehouse.do?readWrite=Y&level1=N&regionId=${values?.departmentId || -1}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst?.fetchApi();
                  ChcGridApi?.formApi?.setFieldValue('warehouseId', undefined);
                }
              }
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '',
          };
        },
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const refreshFatherTable = () => {
  ChcGridApi.query();
};
provide('refreshFatherTable', refreshFatherTable);
const handleApprove = async () => {
  const row: any = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handleApprove row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: '确认批准申请？',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        await requestFormClient.post('/packUnitChangeApplyAction/approve.do', {
          applyId: JSON.stringify([row.packUnitChangeApplyID]),
        });
        message.success('批准申请成功！');
        ChcGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
    onCancel() {},
  });
};
const handleReject = async () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handleReject row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  RejectModalApi.setData({
    row: unref(row),
  }).open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <RejectModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_approve"
        >
          批 准
          <!-- <template #icon>
            <CheckOutlined />
          </template> -->
        </Button>
        <Button
          type="primary"
          danger
          @click="handleReject"
          class="mr-[0.5rem]"
          data-testid="button_reject"
        >
          拒 绝
          <!-- <template #icon>
            <DeleteOutlined />
          </template> -->
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

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>

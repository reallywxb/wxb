<script lang="ts" setup>
import { toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
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

const userStore = useUserStore();
console.warn('userStore', userStore);
const route = useRoute();

const urlParams = (route.meta?.urlParams as Record<string, any>) || {};

console.warn('urlParams', urlParams);
// const isFirstLoaded = ref(false); // 是否已初次加载完

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
    id: 'changeExecute',
    // api地址
    queryUrl: '/packUnitChangeApplyAction/query.do?page=execute',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        align: 'center',
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
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        defaultValue: '',
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
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
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
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {
            placeholder: '',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('radioChange', row);
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);

      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleExecute = async () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(row);
  console.warn('handleSubmit unProxyRow', unProxyRow);
  if (isEmpty(row)) {
    message.warning('请选择申请记录');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: '确认执行？',
    onOk: async () => {
      try {
        await requestFormClient.post('/packUnitChangeApplyAction/complete.do', {
          applyId: unProxyRow.packUnitChangeApplyID,
        });
        message.success('执行成功！');
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
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExecute"
          class="mr-[0.5rem]"
          data-testid="button_Execute"
        >
          执行
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>

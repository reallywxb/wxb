<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
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
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';
import GetMedcineModalComp from './modals/getMedcineModal.vue';

const route = useRoute();

const userStore = useUserStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const page = urlParams?.page;
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 创建响应式变量用于院区接口的hospitalId参数传递
// @description 创建extraParams响应式对象，用于动态传递hospitalId参数到院区接口
const departmentExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});
// AI-GENERATED-END

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  setTimeout(() => {
    // 触发自动查询
    searchController.sign();
  }, 200);
  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
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
    id: 'CHS',
    // api地址
    queryUrl: '/ygcgProductAction/query.do',
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'orgName',
        title: '客户名称',
        width: '120',
        sortable: false,
      },
      {
        field: 'departmentName',
        title: '院区',
        width: '120',
        sortable: false,
      },
      {
        field: 'ybjkstatus',
        title: '上传',
        width: '70',
        sortable: false,
        formatter({ row }) {
          return row.ybjkstatus === 'Y' ? '已上传' : '未上传';
        },
      },
      {
        field: 'ygcg_orderline_id',
        title: '平台订单行号',
        width: '110',
        sortable: false,
      },
      {
        field: 'warehouseName',
        title: '仓库名称',
        width: '130',
        sortable: false,
      },
      {
        field: 'med_list_codg',
        title: '医疗目录编码',
        width: '100',
        sortable: false,
      },
      {
        field: 'inv_chg_type',
        title: '库存变更类型',
        width: '100',
        sortable: false,
        formatter({ row }) {
          // 101	调拨入库
          // 102	调拨出库
          // 103	盘盈
          // 104	盘损
          // 105	销毁
          // 106	其他入库
          // 107	其他出库
          // 108	初始化入库
          // 109	商品退货出库
          // 110	赠药入库
          // 111	赠药退回出库
          //
          const type = row.inv_chg_type;
          let result = '';
          switch (type) {
            case '101': {
              result = '调拨入库';
              break;
            }
            case '102': {
              result = '调拨出库';
              break;
            }
            case '103': {
              result = '盘盈';
              break;
            }
            case '104': {
              result = '盘损';
              break;
            }
            case '105': {
              result = '销毁';
              break;
            }
            case '106': {
              result = '其他入库';
              break;
            }
            case '107': {
              result = '其他出库';
              break;
            }
            case '108': {
              result = '初始化入库';
              break;
            }
            case '109': {
              result = '商品退货出库';
              break;
            }
            case '110': {
              result = '赠药入库';
              break;
            }
            case '111': {
              result = '赠药退回出库';
              break;
            }
            default: {
              result = '';
              break;
            }
          }
          return result;
        },
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '120',
        sortable: false,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '120',
        sortable: false,
      },
      {
        field: 'fixmedins_hilist_id',
        title: '药品编码',
        width: '150',
        sortable: false,
      },
      {
        field: 'fixmedins_hilist_name',
        title: '药品名称',
        width: '120',
        sortable: false,
      },
      {
        field: 'fixmedins_bchno',
        title: '批次流水号',
        width: '100',
        sortable: false,
      },
      {
        field: 'pric',
        title: '单价',
        width: '100',
        sortable: false,
      },
      {
        field: 'cnt',
        title: '数量',
        width: '150',
        sortable: false,
      },
      {
        field: 'rx_flag',
        title: '处方药标志',
        width: '90',
        sortable: false,
        formatter({ row }) {
          return row.rx_flag === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'trdn_flag',
        title: '拆零标志',
        width: '100',
        sortable: false,
        formatter({ row }) {
          return row.trdn_flag === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'inv_chg_time',
        title: '库存变更时间',
        width: '120',
        sortable: false,
      },
      {
        field: 'inv_chg_opter_name',
        title: '库存变更经办人姓名',
        width: '150',
        sortable: false,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '订单日期',
        defaultValue: [
          // 2天前
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(2, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
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
        fieldName: 'orgId',
        label: '医院',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/orgList.do',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
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
            // AI-GENERATED-BEGIN
            // @date 2026-07-16
            // @prompt 使用extraParams传递hospitalId参数到院区接口
            // @description 配置extraParams为响应式对象，使接口能够接收到hospitalId参数
            extraParams: departmentExtraParams.value,
            // AI-GENERATED-END
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // AI-GENERATED-BEGIN
        // @date 2026-07-16
        // @prompt 实现院区与医院的联动
        // @description 使用dependencies配置联动逻辑，当orgId变化时更新院区接口的hospitalId参数并重新获取数据
        dependencies: {
          triggerFields: ['orgId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                ChcGridApi.formApi?.getFieldComponentRef &&
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                ChcGridApi.formApi?.getFieldComponentRef('departmentId') &&
                ChcGridApi.formApi?.getFieldComponentRef('departmentId').params;
              if (cond) {
                // 更新extraParams中的hospitalId
                departmentExtraParams.value.hospitalId = values?.orgId || '';
                // 设置依赖参数
                ChcGridApi.formApi.getFieldComponentRef(
                  'departmentId',
                ).params.dependencies = {
                  hospitalId: values?.orgId || '',
                };
                // 重新调用接口获取数据
                ChcGridApi.formApi
                  ?.getFieldComponentRef('departmentId')
                  ?.fetchApi();
                // 清空院区字段已选择的值
                ChcGridApi.formApi?.setFieldValue('departmentId', '');
              }
            });
          },
        },
        // AI-GENERATED-END
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '采购仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择采购仓库',
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              const rows =
                res.rows?.filter((item: any) => item.warehouseType === '1') ||
                [];
              return { ...res, rows: undefined, records: rows };
            },
          };
        },
      },

      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'ygcgOrderLineId',
        label: '平台订单行号',
        componentProps: () => {
          return {};
        },
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {
      page,
    },
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

const handleUpload = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleUpload rows:', rows);
  console.warn('handleUpload rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ids = rawRows.map((row: any) => row.id).join(',');
  const params = {
    id: ids,
  };
  Modal.confirm({
    title: '提示',
    content: `确认上传?`,
    onOk: async () => {
      try {
        console.warn('handleUpload params:', params);
        await requestFormClient
          .post('/ygcgProductAction/upload.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
              ChcGridApi.query();
            }
          });
      } catch (error) {
        console.error('上传失败', error);
      }
    },
  });
};

const [GetMedcineModal, getMedcineModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: GetMedcineModalComp,
  draggable: true,
});
const handleGetMedcine = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  getMedcineModalApi
    .setData({
      orgId: formValues.orgId, // 医院ID
      callback() {
        ChcGridApi.query();
      },
    })
    .open();
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <GetMedcineModal />
    <ChcGrid>
      <template #toolbar-actions>
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
        <Button
          type="primary"
          @click="handleUpload"
          class="mr-[0.5rem]"
          data-testid="button_upload"
        >
          上传
        </Button>
        <Button
          type="primary"
          @click="handleGetMedcine"
          class="mr-[0.5rem]"
          data-testid="button_getMedcine"
        >
          生成医保局3502
        </Button>
      </template>
    </ChcGrid>
  </Page>
</template>

<style lang="less" scoped>
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

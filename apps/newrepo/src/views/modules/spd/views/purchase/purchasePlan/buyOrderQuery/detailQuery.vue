<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';

import { ExportActionIcon, viewActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import { addFormOptions } from './addFormOptions';
import { urgeOrderDo } from './api';
import actionLogModal from './modals/actionLogModal.vue';
import FormModal from './modals/FormModal.vue';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab: PageTab;
  }>(),
  {},
);

const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

const [OrgFormModal, modalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: FormModal,
});

const extParams = ref<{}>({});
const totalAmount = ref(0);

const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
          ['dateApprove', ['dateApprovalFrom', 'dateApprovalTo'], 'YYYY-MM-DD'],
        ],
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        handleSubmit: async (values: any) => {
          console.warn('values', values);
          const formValues = await ChcGridApi.formApi.getValues();
          // AI-GENERATED-BEGIN
          // @date 2026-07-03
          // @prompt 多选配送状态传参需要逗号拼接
          // @description 多选字段 deliveryStatus 返回数组，需转为逗号分隔的字符串以适配后端 formdata 传参
          if (Array.isArray(formValues.deliveryStatus)) {
            formValues.deliveryStatus = formValues.deliveryStatus.join(',');
          }
          // AI-GENERATED-END
          ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          ChcGridApi.reload(formValues);
        },
        handleReset: async () => {
          await ChcGridApi.formApi.resetForm();
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.formApi.setLatestSubmissionValues(formValues);
          ChcGridApi.reload(formValues);
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        checkboxConfig: {
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
      }),
      // formOptions: {
      //   fieldMappingTime: [
      //     ['dateOrdered', ['dateCommitFrom', 'dateCommitTo'], 'YYYY-MM-DD'],
      //     ['dateApprove', ['dateApprovalFrom', 'dateApprovalTo'], 'YYYY-MM-DD'],
      //   ],
      //   compact: true,
      //   layout: 'horizontal',
      //   submitButtonOptions: {
      //     content: '查询',
      //   },
      // },
      // gridOptions: {
      //   checkboxConfig: {
      //     highlight: true,
      //   },
      //   proxyConfig: {
      //     autoLoad: false,
      //   },
      // },
    },
    {
      gridColumns: [
        { type: 'checkbox', title: '多选', width: 50, align: 'center' },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'lineStatusName',
          minWidth: 120,
          sortable: true,
          title: '订单明细状态',
        },
        {
          field: 'warehouseName',
          minWidth: 150,
          sortable: true,
          title: '采购仓库',
        },
        {
          field: 'targetWarehouse',
          minWidth: 150,
          sortable: true,
          title: '需求仓库',
        },
        {
          // TODO:medicine change 药品编码
          field: 'productCode',
          minWidth: 120,
          sortable: true,
          title: '药品编码',
        },
        {
          // TODO:medicine change 药品名称
          field: 'productName',
          minWidth: 100,
          sortable: true,
          title: '药品名称',
        },
        {
          field: 'productSpec',
          minWidth: 90,
          sortable: true,
          title: '规格',
        },
        // {
        //   field: 'modelNo',
        //   minWidth: 90,
        //   sortable: true,
        //   title: '型号',
        // },
        {
          field: 'uomName',
          minWidth: 60,
          sortable: true,
          title: '单位',
        },
        {
          // TODO:medicine add 最小单位
          field: 'minUnitName',
          minWidth: 90,
          sortable: true,
          title: '最小单位',
        },
        {
          field: 'deliveryStatusName',
          minWidth: 90,
          sortable: true,
          title: '配送状态',
        },
        {
          field: 'receiveStatusName',
          minWidth: 90,
          sortable: true,
          title: '验收状态',
        },
        {
          field: 'qtyOrdered',
          minWidth: 90,
          sortable: true,
          title: '采购数量',
          align: 'right',
        },
        {
          field: 'qtyConfirmed',
          minWidth: 90,
          sortable: true,
          title: '答复数量',
          align: 'right',
        },
        {
          field: 'qtyCancelled',
          minWidth: 90,
          sortable: true,
          title: '缺货数量',
          align: 'right',
        },
        {
          field: 'qtyArrived',
          minWidth: 90,
          sortable: true,
          title: '配送数量',
          align: 'right',
        },
        {
          field: 'qtyReceived',
          minWidth: 90,
          sortable: true,
          title: '验收数量',
          align: 'right',
        },
        {
          field: 'qtyUnFinished',
          minWidth: 100,
          sortable: true,
          title: '未结算数量',
          align: 'right',
        },
        {
          field: 'priceActual',
          minWidth: 90,
          sortable: true,
          title: '采购价',
          align: 'right',
        },
        {
          field: 'lineAmt',
          minWidth: 90,
          sortable: true,
          title: '采购金额',
          align: 'right',
        },
        {
          field: 'vendorName',
          minWidth: 100,
          sortable: true,
          title: '供应商',
        },
        {
          field: 'orderPlanNo',
          minWidth: 120,
          sortable: true,
          title: '采购计划单号',
        },
        {
          field: 'orderNo',
          minWidth: 120,
          sortable: true,
          title: '采购订单单号',
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          // TODO:medicine change 医保药品编码
          field: 'insurance',
          minWidth: 120,
          sortable: true,
          title: '医保药品编码',
        },
        {
          field: 'manufacturer',
          minWidth: 110,
          sortable: true,
          title: '生产厂家',
        },
        {
          field: 'isCrossDocking',
          minWidth: 90,
          sortable: true,
          title: '是否直供',
          formatter({ row }: any) {
            return row.isCrossDocking === 'Y' ? '是' : '否';
          },
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
          component: 'DateGroup',
          fieldName: 'dateOrdered',
          label: '计划提交时间',
          defaultValue: [
            dayjs(dayjs().format('YYYY-MM-DD'))
              .subtract(7, 'day')
              .format('YYYY-MM-DD'),
          ],
        },
        {
          component: 'DateGroup',
          fieldName: 'dateApprove',
          label: '计划审核时间',
          defaultValue: [
            dayjs(dayjs().format('YYYY-MM-DD'))
              .subtract(7, 'day')
              .format('YYYY-MM-DD'),
          ],
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
              // showSearch: true,
              placeholder: '请选择采购仓库',
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
          fieldName: 'warehouseId',
          label: '采购仓库',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择需求仓库',
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
          fieldName: 'applyBPartnerId',
          label: '需求仓库',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000369',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择采购来源',
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
          fieldName: 'sourceType',
          label: '采购来源',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000291',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择订单明细状态',
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
          fieldName: 'lineStatus',
          label: '订单明细状态',
        },
        {
          // TODO:medicine change 药品
          component: 'Input',
          fieldName: 'productName',
          label: '药品',
          componentProps: {
            placeholder: '请输入药品',
          },
        },
        {
          // TODO:medicine change 医保药品编码
          component: 'Input',
          fieldName: 'insurance',
          label: '医保药品编码',
          componentProps: {
            placeholder: '请输入医保药品编码',
          },
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
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              defaultValue: '',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          fieldName: 'vendorId',
          label: '供应商',
        },
        // TODO:medicine delete 高值
        // {
        //   component: 'ChcSelect',
        //   componentProps: () => {
        //     return {
        //       // autoChooseFirstOption: true,
        //       // dictUrl: '/orderPlanAction/commit.do',
        //       options: [
        //         { value: '', label: '全部' },
        //         { value: 'Y', label: '是' },
        //         { value: 'N', label: '否' },
        //       ],
        //       placeholder: '请选择高值',
        //       defaultValue: '',
        //       paginate: false,
        //       filterByFrontEnd: true,
        //       showChooseAll: '',
        //       immediate: true,
        //     };
        //   },
        //   fieldName: 'isPrecious',
        //   label: '高值',
        // },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000646',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择配送状态',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              showChooseAll: '',
              defaultValue: [],
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              mode: 'multiple',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          fieldName: 'deliveryStatus',
          label: '配送状态',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000647',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择验收状态',
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
          fieldName: 'receiveStatus',
          label: '验收状态',
        },
        {
          component: 'Input',
          fieldName: 'orderId',
          label: '采购订单单号',
          componentProps: {
            placeholder: '请输入采购订单单号',
          },
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
              placeholder: `请选择是否直供`,
              defaultValue: '',
              paginate: false,
              filterByFrontEnd: true,
              showChooseAll: '',
              immediate: true,
            };
          },
          fieldName: 'isCrossDocking',
          label: '是否直供',
        },
      ],
      dataTableId: '/orderAction/queryDetail.do?page=close',
      id: 'infoDetail',
      commonFormOptions,
      viewFormOptions,
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      beforeFetchFn: (params) => {
        return {
          ...params,
          orderType: 'PO',
        };
      },
      afterFetchFn: (params) => {
        // totalAmount.value = params.totalPrice || 0;
        let amout = 0;
        params.rows?.forEach((item: any) => {
          if (item.totalAmt) {
            amout += Number.parseFloat(item.totalAmt);
          }
        });
        totalAmount.value = Number(amout.toFixed(2));
        setTimeout(() => {
          calculateSummarize();
        }, 200);
        console.warn('afterFetchFn:', params.totalPrice);
        return {
          ...params,
          records: params.rows,
        };
      },
      customModals: {
        'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
          // 连接抽离的组件
          connectedComponent: ImportModalComp,
        }),
      },
    },
  );

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '采购总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

const handleDetail = (scope: any) => {
  // importModalApi?.open();
  console.warn(importModalApi);
  console.warn('scope', scope);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderLineId: scope.row?.orderLineId,
    })
    .open();
};
const handleCloseLine = async (scope: any) => {
  console.warn('scope', scope);
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要关闭的数据');
    return;
  }
  const orderLineId = selectedRows.map((row: any) => row.orderLineId);
  // const orderLineId = scope.row?.orderLineId;
  // if (!orderLineId) {
  //   message.warning('无法获取订单ID');
  //   return;
  // }
  modalApi
    .setData({
      dataTableId: '/orderAction/closeLine.do',
      formData: {
        orderLineId: JSON.stringify(orderLineId),
      },
      openType: 'close',
    })
    .open();
};

const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要催单的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '催单',
    content: `确定要催单选中的 ${selectedRows.length} 条单据吗？`,
    onOk: async () => {
      try {
        const orderIds = selectedRows.map((row: any) => row.orderId);
        // const params = new URLSearchParams();
        // params.append('orderIds', JSON.stringify(orderIds));
        const params = {
          orderIds: JSON.stringify(orderIds),
        };
        await urgeOrderDo(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('催单', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('催单成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('催单失败');
      }
    },
  });
};

async function refreshTable() {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    ChcGridApi.query({ ...resData });
  });
}
const currentTab = defineModel<number>('currentTab', { required: true });
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <ImportModal />
    <OrgFormModal
      :after-submit="refreshTable"
      :add-form-options="addFormOptions"
    />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleCloseLine"
          data-testid="button_close_detailQuery"
        >
          关闭
        </Button>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_urge_detailQuery"
        >
          催单
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_detailQuery"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span style="margin-left: 20px">采购总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>

      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          data-testid="button_operation_record_detailQuery"
        >
          操作记录
          <template #icon>
            <viewActionIcon />
          </template>
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>

<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';

import { EditActionIcon, SvgBackIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { DatePicker, Button, message, Modal as antModal } from 'ant-design-vue';

import dayjs from 'dayjs';

import ProcurementPlanFormModalComp from './ProcurementPlanFormModal.vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { createMoPlan } from '../api';

// const props = withDefaults(
//   defineProps<{
//     // getDetailPageConfig: () => {
//     //   detailPageType: 'edit' | 'view' | undefined;
//     //   detailPageValue: number;
//     // };
//     goToDetailPage: (row: any, detailPageConfig: DetailInfo) => void;
//     thisTab: PageTab;
//   }>(),
//   {},
// );

const handleReset = () => {
  chcGridApi.grid.remove();
  isAutoCreated.value = false;
};
const isAutoCreated = ref(false);

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const extParams = ref<{
  // replenishDays: number | string;
}>({
  // replenishDays: 7,
});
const selectedNum = ref(0);
const total = ref(0);
// 要求送达时间
const deliveryPlanDate = ref(
  dayjs(dayjs().format('YYYY-MM-DD'))
    .add(1, 'day')
    .add(10, 'hour')
    .format('YYYY-MM-DD HH:mm'),
);

// AI-GENERATED-BEGIN
// @date 2026-06-18
// @prompt 连接ProcurementPlanFormModal弹窗
// @description 使用connectedComponent连接采购计划表单弹窗组件
const [ProcurementPlanFormModal, procurementPlanModalApi] = useVbenModal({
  connectedComponent: ProcurementPlanFormModalComp,
});

// 处理采购计划表单确认回调（暂不使用）
const handleProcurementPlanConfirm = async (values: Record<string, any>) => {
  const selectedRows = chcGridApi.grid.getCheckboxRecords(true);
  const { deliveryPlanDate } = values;

  try {
    await createMoPlan({
      lines: JSON.stringify(selectedRows),
      ordrType: 'WO',
      isPackaged: 'N',
      deliveryPlanDate,
    }).then((res) => {
      if (res && res.success) {
        chcGridApi.formApi.getValues().then((resData: any) => {
          chcGridApi.query({ ...resData });
        });
        message.success('提交成功');
      } else {
        message.error(res.msg || '失败');
      }
    });
  } catch {
    message.error('提交失败');
  }
};

// AI-GENERATED-END

const [ChcGridUI, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      // handleSubmit,
      handleReset,
      submitButtonOptions: {
        content: '试算',
      },
      handleSubmit: async () => {
        const formValues = await chcGridApi.formApi.getValues();
        chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        chcGridApi.reload(formValues);
      },
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        highlight: true,
      },
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
      },
    },
  },
  {
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      {
        title: '序号',
        type: 'seq',
        width: 40,
        align: 'center',
        sortable: true,
      },

      {
        field: 'productName',
        minWidth: 150,
        title: '药品名称',
        sortable: true,
      },

      {
        field: 'productSpec',
        minWidth: 100,
        title: '规格',
        sortable: true,
      },

      {
        field: 'manufacturer',
        minWidth: 130,
        title: '厂家',
        sortable: true,
      },
      {
        field: 'uomName',
        minWidth: 80,
        title: '单位',
        sortable: true,
      },
      {
        field: 'pricePo',
        title: '进价',
        width: 80,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePo);
        },
        sortable: true,
      },

      {
        field: 'poWarehouseName',
        minWidth: 120,
        title: '采购仓库',

        sortable: true,
      },
      {
        field: 'crossWarehouseName',
        minWidth: 120,
        title: '需求仓库',
        sortable: true,
      },
      // {
      //   field: 'dkQtyOnhand',
      //   minWidth: 120,
      //   title: '大库库存',

      //   sortable: true,
      // },
      {
        field: 'crossWarehouseQty',
        minWidth: 120,
        title: '需求仓库库存',
        align: 'right',
        sortable: true,
      },
      {
        field: 'totalQtyOnhand',
        minWidth: 120,
        title: '全院库存',
        align: 'right',
        sortable: true,
      },
      {
        field: 'maintainDays',
        minWidth: 120,
        title: '维持天数',
        align: 'right',
        sortable: true,
      },
      {
        field: 'shipmentQty',
        minWidth: 120,
        title: '消耗数量',
        align: 'right',
        sortable: true,
      },
      {
        field: 'moveingQty',
        minWidth: 120,
        title: '在途数量',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyPlan',
        minWidth: 120,
        title: '需采购数量',
        align: 'right',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
          },
        },
        sortable: true,
      },
      {
        field: 'lPackageQty',
        title: '大包装数',
        width: 120,
        align: 'right',
        sortable: true,
      },
      {
        field: 'mPackageQty',
        title: '中包装数',
        align: 'right',
        width: 80,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: 100,
      },

      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 150,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择采购仓库',
            paginate: false,
            allowClear: true,
            disabled: isAutoCreated.value,
            // onChange(val: any, option: any) {
            //   extParams.value.bpartnerId_text = option.name;
            // },
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
        fieldName: 'applyBPartnerId',
        label: '需求仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            disabled: isAutoCreated.value,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'InputNumber',
        fieldName: 'replenishDays',
        label: '备库天数',
        componentProps: () => {
          return {
            placeholder: '请输入备库天数',
            disabled: isAutoCreated.value,
            // defaultValue: 7,
          };
        },
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            disabled: isAutoCreated.value,
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isNeedPlan',
        label: '需采购',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            defaultValue: '',
            disabled: isAutoCreated.value,
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isShipment',
        label: '有消耗',
      },
    ],
    dataTableId:
      '/autoPlanAction/getTryComputeApplyData.do?isCrossDocking=&isPackaged=N',
    id: 'autoCreat',
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      total.value = params.total || 0;
      isAutoCreated.value = true;
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const calculateSelectedAmount = (selectedRows: any[]) => {
  selectedNum.value = selectedRows.length;
};

const handleCancelEdit = (scope: any) => {
  chcGridApi.grid.clearEdit(scope.row);
};

const handleCreated = () => {
  const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要生成采购的数据');
    return;
  }

  // 有选中数据才弹出确认框
  antModal.confirm({
    title: '确认生成',
    content: `总共${selectedRows.length}行`,
    onOk: async () => {
      try {
        await createMoPlan({
          lines: JSON.stringify(selectedRows),
          ordrType: 'WO',
          isPackaged: 'N',
          deliveryPlanDate: deliveryPlanDate.value,
        })
          .then((res) => {
            if (res && res.success) {
              chcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                chcGridApi.query({ ...resData });
              });
              message.success('提交成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('提交失败');
      }
    },
  });
};
// 编辑采购计划
const handleEdit = async (scope: any) => {
  chcGridApi.grid.setEditRow(scope.row, true);
};

const handleSave = async (scope: any) => {
  if (!(scope.row.qtyPlan > 0)) {
    return message.error('申请数量必须大于零!');
  }
  scope.$grid.clearEdit();
};

const hasEditStatus = (row: any) => {
  return chcGridApi.grid?.isEditByRow(row);
};

onMounted(() => {});
</script>
<template>
  <!-- class="w-[500px]" -->
  <!-- :style="{
      height: contentIsMaximize ? 'calc(100vh - 38px)' : 'calc(100vh - 158px)',
      overflowY: 'hidden',
    }" -->
  <Modal class="h-[800px] w-[80%]" title="智能生成采购计划">
    <div class="h-full">
      <ChcGridUI>
        <template #action="scope">
          <Button
            v-if="!hasEditStatus(scope.row)"
            type="primary"
            ghost
            @click="handleEdit(scope)"
            :loading="scope.row.loading"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            :data-testid="`button_edit_${scope.rowIndex}_autoCreatPlanModal`"
          >
            编辑
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>

          <Button
            v-if="
              hasEditStatus(scope.row) ||
              scope.$grid.isUpdateByRow(scope.row) ||
              scope.$grid.isInsertByRow(scope.row)
            "
            :loading="scope.row.loading"
            type="primary"
            ghost
            @click="handleSave(scope)"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            :data-testid="`button_save_${scope.rowIndex}_autoCreatPlanModal`"
          >
            保存
            <template #icon>
              <SvgSaveIcon />
            </template>
          </Button>
          <Button
            v-if="
              hasEditStatus(scope.row) && !scope.$grid.isInsertByRow(scope.row)
            "
            type="primary"
            ghost
            @click="handleCancelEdit(scope)"
            :loading="scope.row.loading"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            :data-testid="`button_cancel_${scope.rowIndex}_autoCreatPlanModal`"
          >
            取消
            <template #icon>
              <SvgBackIcon />
            </template>
          </Button>
        </template>
        <template #toolbar-tools>
          <div class="flex w-[100%] items-center justify-start gap-2">
            <div class="flex flex-1 flex-wrap items-center justify-start gap-3">
              <span class="whitespace-nowrap">
                总合计：<span class="text-red-600">{{ total }}行</span>
              </span>
              <span class="whitespace-nowrap">
                已勾选：<span class="text-red-600">{{ selectedNum }}行</span>
              </span>
              <span class="flex-1 truncate whitespace-nowrap text-red-600">
                采购数量：【非直配（药房库备中非采购补货的品种）：药房的消耗-药房的库存-大库的库存-在途库存】
              </span>
            </div>
            <div class="flex min-w-[450px] items-center gap-[10px]">
              <!-- AI-GENERATED-BEGIN -->
              <!-- @date 2026-06-18 -->
              <!-- @prompt 添加要求送达时间选择器 -->
              <!-- @description 在生成采购计划按钮左侧添加label和DatePicker用于选择送达时间 -->
              <label
                class="leading-1 mb-[1px] mr-2 flex w-[90px] flex-shrink-0 items-center justify-end pl-[4px] text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                送达时间
              </label>
              <DatePicker
                v-model:value="deliveryPlanDate"
                show-time
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                style="width: 200px"
              />
              <!-- AI-GENERATED-END -->
              <Button
                type="primary"
                @click="handleCreated"
                data-testid="button_created_autoCreatPlanModal"
              >
                生成采购计划
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
            </div>
          </div>
        </template>
      </ChcGridUI>
    </div>

    <!-- AI-GENERATED-BEGIN -->
    <!-- @date 2026-06-18 -->
    <!-- @prompt 添加采购计划表单弹窗 -->
    <!-- @description 使用useVbenModal的connectedComponent连接采购计划表单弹窗组件 -->
    <ProcurementPlanFormModal @confirm="handleProcurementPlanConfirm" />
    <!-- AI-GENERATED-END -->
  </Modal>
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

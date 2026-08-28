<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { EditActionIcon, SvgBackIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { DatePicker, Button, message, Modal as antModal } from 'ant-design-vue';
import dayjs from 'dayjs';

import ProcurementPlanFormModalComp from './modals/ProcurementPlanFormModal.vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { createMoPlan } from './api';

// AI-GENERATED-BEGIN
// @date 2026-06-18
// @prompt 添加要求送达时间字段和弹窗组件
// @description 添加deliveryPlanDate用于绑定DatePicker值，保留弹窗组件暂不使用
const [ProcurementPlanFormModal, procurementPlanModalApi] = useVbenModal({
  connectedComponent: ProcurementPlanFormModalComp,
});

// 要求送达时间
const deliveryPlanDate = ref(
  dayjs(dayjs().format('YYYY-MM-DD'))
    .add(1, 'day')
    .add(10, 'hour')
    .format('YYYY-MM-DD HH:mm'),
);

// 处理采购计划表单确认回调（暂不使用）
const handleProcurementPlanConfirm = async (values: Record<string, any>) => {
  const selectedRows = chcGridApi.grid.getCheckboxRecords(true);
  const { deliveryPlanDate: date } = values;

  try {
    await createMoPlan({
      lines: JSON.stringify(selectedRows),
      orderType: 'WO',
      isPackaged: 'N',
      deliveryPlanDate: date,
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

const handleReset = () => {
  chcGridApi.grid.remove();

  isAutoCreated.value = false;
  total.value = 0;
  selectedNo.value = 0;
};
const isAutoCreated = ref(false);
const formData = ref<any>({});

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
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // 每次打开弹窗时重置统计数据
      total.value = 0;
      selectedNo.value = 0;
      noetMessage.value = '补货数量：【流水数量】';

      const modalData = modalApi.getData<Record<string, any>>();
      formData.value = modalData;
      Object.assign(
        secondaryWarehouseExtraParams.value,
        formData.value.secondaryWarehouseExtraParams || {},
      );
      setTimeout(() => {
        chcGridApi.formApi?.setFieldValue(
          'departmentId',
          formData.value.departmentId || undefined,
        );
        chcGridApi.formApi?.setFieldValue(
          'toWarehouseId',
          formData.value.toWarehouseId || undefined,
        );
        chcGridApi.formApi?.setFieldValue(
          'toWarehouseId',
          formData.value.toWarehouseId || undefined,
        );
      }, 0);
    }
  },
});
const extParams = ref<{
  isPackaged: string;
  replenishDays: number | string;
}>({
  replenishDays: 7,
  isPackaged: 'N',
});

const selectedNo = ref(0);
const total = ref(0);
// 二级仓库下拉请求的额外入参
const INITIAL_SECONDARY_WAREHOUSE_EXTRA_PARAMS = {
  level2: '',
  level3: '',
  level4: '',
};
const secondaryWarehouseExtraParams = ref<{
  level2: number | string;
  level3: number | string;
  level4: number | string;
}>({
  ...INITIAL_SECONDARY_WAREHOUSE_EXTRA_PARAMS,
});

const [ChcGrid, chcGridApi] = useSpdGrid(
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
      commonConfig: {
        labelClass: 'w-[90px]',
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
        // autoLoad: true,
      },
    }),
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        calculateSelectedAmountHandle(records);
      },

      // 全选/全不选事件
      checkboxAll: ({ records }: { records: any[] }) => {
        calculateSelectedAmountHandle(records);
      },
    },
  },
  {
    gridColumns: [
      {
        type: 'checkbox',
        title: '',
        width: 40,
        fixed: 'left',
        align: 'center',
      },
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
        sortable: true,
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePo);
        },
      },
      {
        field: 'toWarehouseName',
        minWidth: 120,

        title: '请领仓库',
        sortable: true,
      },

      {
        field: 'departmentName',
        minWidth: 80,
        title: '院区',

        sortable: true,
      },
      {
        field: 'warehouseName',
        minWidth: 120,
        title: '上级仓库',

        sortable: true,
      },
      {
        field: 'dkQtyOnhand',
        minWidth: 120,
        title: '大库库存',
        align: 'right',
        sortable: true,
      },
      {
        field: 'ejkQtyOnhand',
        minWidth: 120,
        title: '请领库库存',
        align: 'right',
        sortable: true,
      },
      {
        field: 'levelReplenishQty',
        minWidth: 90,
        title: '补货点',
        align: 'right',
        sortable: true,
      },
      {
        field: 'levelMaxQty',
        minWidth: 90,
        title: '库存上限',
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
        title: '请领数量',
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
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            disabled: isAutoCreated.value,

            placeholder: '请选择院区',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            immediate: true,
            showChooseAll: '',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        fieldName: 'toWarehouseId',
        label: '申请仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            disabled: isAutoCreated.value,
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              const warehouseType = option.warehouseType;
              // toWarehouseParams.value = {};
              Object.entries(secondaryWarehouseExtraParams.value).forEach(
                ([key, value]) => {
                  secondaryWarehouseExtraParams.value[
                    key as keyof typeof secondaryWarehouseExtraParams.value
                  ] = '';
                  console.warn('key', key, 'value', value);
                },
              );
              if (warehouseType && warehouseType > 1) {
                for (let i = 1; i < warehouseType; i++) {
                  secondaryWarehouseExtraParams.value[
                    `level${i}` as keyof typeof secondaryWarehouseExtraParams.value
                  ] = 'Y';
                }
              }

              chcGridApi.formApi?.setFieldValue(
                'warehouseId',
                option.parentId || undefined,
              );
            },
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('toWarehouseId')
            ) {
              chcGridApi.formApi.getFieldComponentRef(
                'toWarehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              chcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
              chcGridApi.formApi?.setFieldValue(
                'toWarehouseId',
                formData.value.toWarehouseId || undefined,
              );
              formData.value.toWarehouseId = '';
            }
          },
        },
      },

      {
        fieldName: 'warehouseId',
        label: '上级仓库',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
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
            triggerFields: ['toWarehouseId'],
            extraParams: secondaryWarehouseExtraParams.value,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['toWarehouseId'],
          trigger(values) {
            console.warn(values);
            if (
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId').params
            ) {
              chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                toWarehouseId: values.toWarehouseId,
              };
              chcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              chcGridApi.formApi?.setFieldValue(
                'warehouseId',
                formData.value.warehouseId || undefined,
              );
              formData.value.warehouseId = '';
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
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
        label: '需请领',
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
        fieldName: 'isHaveQty',
        label: '大库有库存:',
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
        label: '有消耗:',
      },
      {
        component: 'Switch',
        componentProps: {
          disabled: isAutoCreated.value,
          onChange(val: any) {
            noetMessage.value = val
              ? `补货数量：【流水数量-当前库存数量】`
              : '补货数量：【流水数量】';
          },
          options: [
            {
              label: '是',
              value: 'Y',
            },
            {
              label: '否',
              value: '',
            },
          ],
          placeholder: '请选择',
          style: {
            width: '40px',
          },
        },
        defaultValue: 'false',
        fieldName: 'subOrdering',
        label: '减去在途数量',
      },
    ],
    id: 'autoCreateOrderTable',
    dataTableId:
      '/autoPlanAction/getTryMoApplyData.do?isMaxMinLevelReplenish=Y',
    // commonFormOptions,
    // viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      total.value = params.total || 0;
      isAutoCreated.value = true;
      console.warn('afterFetchFn:', params.totalPrice);
      // const
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const calculateSelectedAmountHandle = (selectedRows: any[]) => {
  selectedNo.value = selectedRows.length;
};

const handleCancelEdit = (scope: any) => {
  // chcGridApi.grid.reloadRow(scope.row);
  // chcGridApi.grid.revertData(scope.row);
  chcGridApi.grid.clearEdit(scope.row);

  chcGridApi.grid.setRow(scope.row, {
    qtyPlan: '',
  });
};

const handleCreated = () => {
  const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要仓库请领单的数据');
    return;
  }

  const index = selectedRows.findIndex((row) => row.qtyPlan <= 0);
  if (index !== -1) {
    return message.error(`选中的第${index + 1}行请领数量必须大于零!`);
  }

  // 有选中数据才弹出确认框
  antModal.confirm({
    title: '确认请领',
    content: `总共${selectedRows.length}行`,
    onOk: async () => {
      try {
        const orderIds = selectedRows.map((row) => row.orderId);
        const params = {
          orderId: JSON.stringify(orderIds),
        };
        console.warn('params:', params);
        await createMoPlan({
          lines: JSON.stringify(selectedRows),
          orderType: 'WO',
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
  console.warn('scope.row22222222:', scope.row, chcGridApi);
  chcGridApi.grid.setEditRow(scope.row, true);
};

const handleSave = async (scope: any) => {
  if (!(scope.row.qtyPlan > 0)) {
    return message.error('请领数量必须大于零!');
  }
  scope.$grid.clearEdit();
};

const hasEditStatus = (row: any) => {
  return chcGridApi.grid?.isEditByRow(row);
};

const noetMessage = ref('补货数量：【流水数量】');
onMounted(() => {});
</script>
<template>
  <!-- class="w-[500px]" -->
  <!-- :style="{
      height: contentIsMaximize ? 'calc(100vh - 38px)' : 'calc(100vh - 158px)',
      overflowY: 'hidden',
    }" -->
  <Modal
    class="h-[800px] w-[80%]"
    title="生成自动计划"
  >
    <div class="h-full">
      <ChcGrid>
        <template #action="scope">
          <Button
            v-if="!hasEditStatus(scope.row)"
            type="primary"
            ghost
            @click="handleEdit(scope)"
            :loading="scope.row.loading"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            :data-testid="`button_edit_${scope.rowIndex}_autoCreatOrder`"
          >
            编辑
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>

          <Button
            v-if="
              hasEditStatus(scope.row) && !scope.$grid.isInsertByRow(scope.row)
            "
            :loading="scope.row.loading"
            type="primary"
            ghost
            @click="handleSave(scope)"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            :data-testid="`button_save_${scope.rowIndex}_autoCreatOrder`"
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
            :data-testid="`button_cancel_${scope.rowIndex}_autoCreatOrder`"
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
              <span class="">
                总合计：<span class="text-red-600">{{ total }}行</span>
              </span>
              <span class="">
                已勾选：<span class="text-red-600">{{ selectedNo }}行</span>
              </span>
              <span class="flex-1 truncate text-red-600">
                {{ noetMessage }}
              </span>
            </div>
            <div class="flex items-center gap-[10px]">
              <!-- AI-GENERATED-BEGIN -->
              <!-- @date 2026-06-18 -->
              <!-- @prompt 添加要求送达时间选择器 -->
              <!-- @description 在生成请领计划按钮左侧添加label和DatePicker用于选择送达时间 -->
              <label
                class="leading-1 mr-2 flex w-[90px] flex-shrink-0 items-center justify-end text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-bold"
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
                data-testid="button_generate_order_autoCreatOrder"
              >
                生成请领计划
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
            </div>
          </div>
        </template>
      </ChcGrid>
    </div>

    <!-- AI-GENERATED-BEGIN -->
    <!-- @date 2026-06-18 -->
    <!-- @prompt 添加采购计划表单弹窗 -->
    <!-- @description 使用useVbenModal的connectedComponent连接独立的采购计划表单弹窗组件 -->
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

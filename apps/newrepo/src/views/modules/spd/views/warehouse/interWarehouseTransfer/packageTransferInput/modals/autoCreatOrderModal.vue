<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { EditActionIcon, SvgBackIcon, SvgSaveIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Modal as antModal, Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { createMoPlan } from '../api';

const props = defineProps<{
  queryData: any;
}>();

const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
const urlParams: any = {
  specShowType: urlParamsObj?.specShowType || '',
  productControlLevel: urlParamsObj?.productControlLevel || '',
  hiddenField: urlParamsObj?.hiddenField || '',
  isPackaged: urlParamsObj?.isPackaged,
  showStorage: urlParamsObj?.showStorage || 'N',
  showPrice: urlParamsObj?.showPrice || 'Y',
  isUseMonthlyWO: urlParamsObj?.isUseMonthlyWO || 'N',
  productCategoryIds: urlParamsObj?.productCategoryIds,
  isMaxMinLevelReplenish: urlParamsObj?.isMaxMinLevelReplenish || '',
  isStoragePackage: urlParamsObj?.isStoragePackage,
};

const handleReset = () => {
  chcGridApi.grid.remove();
  isAutoCreated.value = false;
};
const isAutoCreated = ref(false);
const noetMessage = ref('补货数量：【流水数量】');
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

const selectedNum = ref(0);
const total = ref(0);

const [ChcGridUI, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      handleReset,
      submitButtonOptions: {
        content: '试算',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
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
        checkMethod: (scope: any) => {
          return !!scope.row.qtyPlan;
        },
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
        autoLoad: true,
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
      {
        type: 'checkbox',
        title: '',
        width: 40,
        align: 'center',
        fixed: 'left',
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
        field: 'productCode',
        title: '药品编码',
        width: 100,
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
        align: 'right',
        width: 80,
        sortable: true,
      },

      {
        field: 'toWarehouseName',
        minWidth: 120,
        title: '请领仓库',

        sortable: true,
      },
      {
        field: 'departmentName',
        minWidth: 120,
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
        visible: urlParams.isMaxMinLevelReplenish !== 'Y',
        sortable: true,
      },
      {
        field: 'levelMaxQty',
        minWidth: 90,
        title: '库存上限',
        visible: urlParams.isMaxMinLevelReplenish !== 'Y',
        sortable: true,
      },

      {
        field: 'shipmentQty',
        minWidth: 120,
        title: '消耗数量',

        sortable: true,
      },
      {
        field: 'moveingQty',
        minWidth: 120,
        title: '在途数量',

        sortable: true,
      },
      // {
      //   field: 'replenishPackageQty',
      //   minWidth: 90,
      //   title: '定数',
      //   visible: urlParams.isPackaged === 'Y',
      //   sortable: true,
      // },

      {
        field: 'qtyPlanPackage',
        minWidth: 120,
        title: '请领包数',
        visible: urlParams.isPackaged === 'Y',
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
        field: 'qtyPlan',
        minWidth: 120,
        title: '请领数量',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
          },
        },
      },
      {
        field: 'lPackageQty',
        title: '大包装数',
        width: 120,
        sortable: true,
      },
      {
        field: 'mPackageQty',
        title: '中包装数',
        width: 80,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y',
            // showSearch: true,
            placeholder: '请选择申请仓库',
            disabled: true,
            defaultValue: props.queryData.toWarehouseId,
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              // selectController.sign();
            },
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'toWarehouseId',
        label: '申请仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            disabled: true,
            defaultValue: props.queryData.departmentId,
            placeholder: '请选择院区',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('departmentId', val, option);
              // selectController.sign();
            },
            // mode: 'multiple',
            immediate: true,
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
        component: 'ChcSelect',

        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            // showSearch: true,
            placeholder: '请选择采购仓库',
            paginate: false,
            allowClear: true,
            defaultValue: props.queryData.warehouseId,
            disabled: true,
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
        label: '上级仓库',
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
        required: true,
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
          onChange() {
            getNoetMessage();
          },
          placeholder: '请选择',
          style: {
            width: '40px',
          },
        },
        defaultValue: 'false',
        fieldName: 'subStorage',
        label: '减去当前库存',
      },
      {
        component: 'Switch',
        componentProps: {
          disabled: isAutoCreated.value,
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
          onChange() {
            getNoetMessage();
          },
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
    dataTableId:
      '/autoPlanAction/getTryMoApplyData.do?isMaxMinLevelReplenish=N',
    id: 'autoCreateOrderTable',
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      return {
        ...params,
        toWarehouseId: props.queryData.toWarehouseId,
        warehouseId: props.queryData.warehouseId,
        start: undefined,
        limit: 0,
      };
    },
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

const getNoetMessage = () => {
  chcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    let msg = '补货数量：【流水数量';
    if (resData.subStorage === true) {
      msg = `${msg}-当前库存数量`;
    }
    if (resData.subOrdering === true) {
      msg = `${msg}-在途数量`;
    }
    noetMessage.value = `${msg}】`;
  });
};

const calculateSelectedAmount = (selectedRows: any[]) => {
  selectedNum.value = selectedRows.length;
};

const handleCancelEdit = (scope: any) => {
  chcGridApi.grid.clearEdit(scope.row);
};

const handleCreated = () => {
  const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要生成请领的数据');
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
          ordrType: 'MO',
          isPackaged: 'N',
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
  <Modal class="h-[800px] w-[80%]" title="按流水自动创建调拨">
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
            :data-testid="`button_edit_${scope.rowIndex}_autoCreatOrderModal`"
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
            :data-testid="`button_save_${scope.rowIndex}_autoCreatOrderModal`"
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
            :data-testid="`button_cancel_${scope.rowIndex}_autoCreatOrderModal`"
          >
            取消
            <template #icon>
              <SvgBackIcon />
            </template>
          </Button>
        </template>
        <template #toolbar-tools>
          <div class="flex w-[100%] items-center justify-between pt-[10px]">
            <div class="flex flex-1 flex-wrap">
              <span class="pr-[100px]">
                总合计：<span class="text-red-600">{{ total }}行</span>
              </span>
              <span class="pr-[100px]">
                已勾选：<span class="text-red-600">{{ selectedNum }}行</span>
              </span>
              <span class="w-[300px] text-red-600">
                {{ noetMessage }}
              </span>
            </div>
            <div class="flex gap-[10px]">
              <Button
                type="primary"
                @click="handleCreated"
                data-testid="button_generate_order_autoCreatOrderModal"
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
  </Modal>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>

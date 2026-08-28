<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  SvgSquareTickIcon,
  // ResetActionIcon,
  // SvgBatchJobIcon,
  // SvgCloseIcon,
  // SvgGearIcon,
  // SvgSaveIcon,
  // UploadCloudIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page } from '@vben/common-ui';
import { cloneDeep, isFunction, isObject } from '@vben/utils';

import { Button, InputNumber, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

import { formSchema } from './options';

const route = useRoute();
// const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const orderType = urlParams.orderType || '';
// const movementType = urlParams.movementType || '';
// const returnNegative = urlParams.returnNegative || '';
// const isExchange = urlParams.isExchange || '';
const isNarcotic = urlParams.isNarcotic || undefined;
const extParams = ref<any>({
  isNarcotic,
  specShowType: 'warehouse',
});

const departmentId = ref<number | string | undefined>(undefined);
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};

// 辅助函数
function resolvePropsFn(cp: any): () => any {
  return isFunction(cp) ? cp : () => (isObject(cp) ? cp : {});
}

// 处理表单院区和仓库级联
const handleFormSchema = () => {
  // 深拷贝
  const schema = cloneDeep(formSchema);
  schema?.forEach((item: any) => {
    if (item.fieldName === 'departmentId') {
      // 保存原始的 componentProps 函数
      const baseFn = resolvePropsFn(item.componentProps);
      console.warn('baseFn=====>', baseFn);
      // 始终保持 componentProps 为“函数返回对象”
      item.componentProps = () => {
        // 执行原始函数获取基础props
        const props = baseFn() as any;
        const originalOnChange = props?.onChange;
        const originalAfterFetch = props?.afterFetch;
        return {
          ...props,
          onChange: (val: any, ...rest: any[]) => {
            departmentId.value = val; // 更新响应式变量
            isFunction(originalOnChange) && originalOnChange(val, ...rest);
          },
          afterFetch: (res: any, ...rest: any[]) => {
            return isFunction(originalAfterFetch)
              ? originalAfterFetch(res, ...rest)
              : res;
          },
        };
      };
    }
    if (item.fieldName === 'warehouseId') {
      // 保存原始的 componentProps 函数
      const baseFn = resolvePropsFn(item.componentProps);
      item.componentProps = () => {
        // 执行原始函数获取基础props
        const props = baseFn() as any;
        const originalAfterFetch = props?.afterFetch;
        return {
          ...props, // 展开所有原始props
          afterFetch: (res: any, ...rest: any[]) => {
            if (res.rows?.length) {
              const firstOption = res.rows[0];
              chcGridApi.formApi?.setFieldValue('warehouseId', firstOption.id);
            }
            return isFunction(originalAfterFetch)
              ? originalAfterFetch(res, ...rest)
              : res;
          },
        };
      };
      item.dependencies = {
        triggerFields: ['departmentId', 'regionId'],
        trigger(values: Record<string, any>) {
          console.warn(values, 'warehouseId trigger');
          if (
            chcGridApi.formApi?.getFieldComponentRef &&
            typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
            chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
            chcGridApi.formApi?.getFieldComponentRef('warehouseId').params
          ) {
            chcGridApi.formApi.getFieldComponentRef(
              'warehouseId',
            ).params.dependencies = {
              departmentId: values.departmentId,
              regionId: values.departmentId,
            };
            chcGridApi.formApi?.getFieldComponentRef('warehouseId')?.fetchApi();
            chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
          }
        },
      };
    }
  });
  return schema;
};
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      showCollapseButton: false,
      commonConfig: {
        labelClass: 'w-[40px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: true,
      },
      pagerConfig: {
        enabled: true,
      },
      editConfig: {
        enabled: true,
        trigger: 'click',
        mode: 'row',
        autoClear: false,
      },
      // virtualYConfig: {
      //   enabled: false,
      // },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
      cellStyle(scope: any) {
        if (scope.column.field === 'toLocatorId') {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: () => {},
      // 全选/全不选事件
      checkboxAll: () => {},
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        }
      },
    },
  },
  {
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        type: 'radio',
        title: '单选',
        minWidth: 50,
        align: 'center',
        visible: false,
      },
      { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: true,
      },
      {
        field: 'packageCount',
        title: '指示包数',
        minWidth: '90',
        align: 'right',
        sortable: false,
      },
      {
        field: 'qtyOnHand',
        title: '指示数量',
        minWidth: '90',
        align: 'right',
        sortable: false,
      },
      {
        field: 'locatorName',
        title: '货位',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'toLocatorId',
        title: '目标货位',
        minWidth: '120',
        editRender: {},
        slots: {
          edit: 'toLocatorIdEdit',
        },
        formatter({ row }: any) {
          return row.toLocatorName;
        },
        // hidden : true,
        sortable: true,
      },
      // {
      //   field: 'toLocatorName',
      //   title: '目标货位',
      //   minWidth: '120',
      //   // "edit" : "ProductPopWin",
      //   sortable: false,
      // },
      {
        field: 'isStoragePackage',
        title: '管理包装',
        minWidth: '110',
        align: 'right',
        // hidden : true,
        visible: false,
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '90',
        sortable: true,
      },
    ],
    formSchema: handleFormSchema(),
    queryUrl: 'movementPlanAction/queryStorage.do',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'main',
    autoSelectFirstRow: false,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'DescriptionModal-descriptionModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: DescriptionModalComp,
      // },
      // 'ScatterCreateModal-scatterCreateModalApi': {
      //   connectedComponent: ScatterCreateComp,
      // },
    },
  },
);
const handleSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  // 获取表格选中的数据
  const warehouseId = formValues.warehouseId;
  if (!warehouseId) {
    return message.error('请选择仓库！');
  }
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择一条记录');
  }
  let flag = true;
  let msg = '';
  const data: any[] = [];
  records.forEach((record: any, index: number) => {
    if (!record.toLocatorId) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `没有目标货位`;
      flag = false;
      return;
    }
    if (record.toLocatorId === record.locatorId) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `原货位与目标货位一样`;
      flag = false;
      return;
    }
    record.qtyPlaned = record.qtyOnHand;
    data.push(record);
  });

  if (!flag) {
    return message.error(msg);
  }
  if (data.length === 0) {
    return message.error('请录入指示数量！');
  }
  const params: { [key: string]: any } = {};
  params.created = JSON.stringify(data);
  params.warehouseId = warehouseId;
  requestFormClient.post('movementPlanAction/batchSave.do', params).then(() => {
    message.success('指示成功！');
    handleFormSubmit();
  });
};
onMounted(() => {
  console.warn('urlParams');
  // chcGridApi.query();
});
</script>
<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    footer-class="bg-[transparent] pb-[0.5rem] pl-[0.5rem] pr-[0.5rem] pt-[0]"
  >
    <ChcGrid class="h-[calc(100%-40px)]">
      <template #toLocatorIdEdit="scope">
        <ChcSelect
          v-model="scope.row.toLocatorId"
          class="w-full"
          dict-url="/warehouseAction/locatorList.do"
          placeholder="请选择"
          :paginate="false"
          @change="
            (_: any, option: any) => {
              scope.row.toLocatorName = option.label;
            }
          "
          :show-search="true"
          :extra-params="{
            isScatter: 'Y',
            warehouseId: scope.row.warehouseId,
            // sort: 'id',
            // dir: 'asc',
          }"
          :immediate="true"
          label-field="name"
          value-field="id"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            }
          "
          :option-columns="[
            {
              header: '货位ID',
              name: 'id',
              width: 110,
            },
            {
              header: '货位名称',
              name: 'name',
              width: 120,
            },
          ]"
          :data-testid="`ChcSelect_toLocatorId_${scope.rowIndex}_mvplanInput`"
        />
      </template>
      <template #qtyProcessDefault="scope">
        <InputNumber
          v-model:value="scope.row.qtyProcess"
          class="w-full"
          :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}_mvplanInput`"
        />
      </template>
      <!-- <template #toolbar-actions>
        <Button type="primary" class="mr-[0.5rem]" @click="handleExport">
          打印
          <template #icon>
            <SvgPrintFillIcon />
          </template>
        </Button>
      </template> -->
    </ChcGrid>
    <template #footer>
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pb-[6px] pt-[6px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handleSubmit"
            data-testid="button_submit_mvplanInput"
          >
            指示
            <template #icon>
              <SvgSquareTickIcon />
            </template>
          </Button>
        </div>
      </div>
    </template>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';

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

import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

// import { useRoute } from 'vue-router';
import BatchSetModalComp from './choosePackage.vue';
import { formSchema } from './options';

const departmentId = ref<number | string | undefined>(undefined);
// const route = useRoute();
// const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
// const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const orderType = urlParams.orderType || '';
// const movementType = urlParams.movementType || '';
// const returnNegative = urlParams.returnNegative || '';
// const isExchange = urlParams.isExchange || '';
// const isNarcotic = urlParams.isNarcotic || undefined;
const extParams = ref<any>({
  isQuality: 'N',
});
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

function isFieldComponentRefExist(fieldName: string): Boolean {
  return !!(
    chcGridApi.formApi?.getFieldComponentRef &&
    typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
    chcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
}
// 处理表单院区和仓库级联
const handleFormSchema = () => {
  const schema = cloneDeep(formSchema)!;
  schema.forEach((item) => {
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
          const hasGetRef = isFieldComponentRefExist('warehouseId');
          if (hasGetRef) {
            const warehouseSelectRef =
              chcGridApi.formApi.getFieldComponentRef('warehouseId');
            if (warehouseSelectRef && warehouseSelectRef.params) {
              warehouseSelectRef.params.dependencies = {
                departmentId: values.departmentId,
                regionId: values.departmentId,
              };
            }
            chcGridApi.formApi?.getFieldComponentRef('warehouseId')?.fetchApi();
            chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
          }
        },
      };
    }
  });
  return schema;
};

const [ChcGrid, chcGridApi, { BatchSetModal, batchSetModalApi }] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      commonConfig: {
        // labelClass: 'w-[90px]',
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
        if (
          scope.column.field === 'packagePlaned' ||
          scope.column.field === 'storageStatusToName'
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        // if (
        //   scope.column.field === 'price' &&
        //   scope.row.price !== scope.row.priceList
        // ) {
        //   return {
        //     color: 'red',
        //   };
        // }
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: () => {
        chcGridApi.grid.clearEdit();
      },
      // 全选/全不选事件
      checkboxAll: () => {
        chcGridApi.grid.clearEdit();
      },
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
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
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
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '150',
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
        field: 'packagePlaned',
        title: '变更包数',
        minWidth: '90',
        editRender: {},
        slots: {
          edit: 'packagePlanedEdit',
        },
        // edit: 'number',
        sortable: false,
      },
      {
        field: 'qtyPlaned',
        title: '变更数量',
        minWidth: '90',
        sortable: false,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'storageStatusToName',
        title: '目标库存状态',
        minWidth: 120,
        slots: {
          edit: 'storageStatusToNameEdit',
        },
        editRender: {},
        formatter({ row }: any) {
          return row.storageStatusToName;
        },
        //  edit:'select',
        //  autoEdit:'false',
        //  addnull:'false',
        //  url:'/baseHandleAction/refList.do?id=1000346&validation=ad_ref_list.value in('+"'H'"+','+"'S'"+','+"'R'"+','+"'W'"+')',
        //  verify:"required"
      },
      {
        field: 'storageStatus',
        minWidth: '100',
        // hidden: true,
        visible: false,
        sortable: true,
      },
      {
        field: 'packageCount',
        title: '可用包数',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        title: '可用库存',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '货位',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'action',
        fixed: 'right',
        title: '操作',
        align: 'center',
        width: 110,
        slots: { default: 'action' },
      },
    ],
    // formSchema,
    formSchema: handleFormSchema(),
    queryUrl: 'movementPlanAction/queryStoragePackage.do',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'main',
    autoSelectFirstRow: true,
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
      'BatchSetModal-batchSetModalApi': {
        // 连接抽离的组件
        connectedComponent: BatchSetModalComp,
      },
    },
  },
);
// 点击指定包装
const handleChoosePackage = (row: any) => {
  batchSetModalApi
    ?.setData({
      record: row,
      callback() {
        handleFormSubmit();
        message.success('变更成功！');
      },
    })
    .open();
};
// 点击提交
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
    if (
      !record.qtyPlaned ||
      record.qtyPlaned === '' ||
      record.qtyPlaned === '0'
    ) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `没有变更数量`;
      flag = false;
      return;
    }

    if (!record.toStorageStatus) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `没有目标库存状态`;
      flag = false;
      return;
    }

    if (record.toStorageStatus === record.storageStatus) {
      msg =
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `存货状态与目标存货库存状态一样`;
      flag = false;
      return;
    }

    if (record.warehouseId !== warehouseId) {
      msg +=
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `仓库错误!<br>`;
      flag = false;
    }
    if (record.qtyPlaned > record.qtyOnHand) {
      msg +=
        `第${index + 1}行,${record.productName}(${record.productCode})` +
        `变更数量>可用库存!<br>`;
      flag = false;
    }
    record.toLocatorId = record.locatorId;
    data.push(record);
  });
  if (!flag) {
    return message.error(msg);
  }
  if (data.length === 0) {
    return message.error('请录入变更数量！');
  }
  const params: { [key: string]: any } = {};
  params.created = JSON.stringify(data);
  params.warehouseId = warehouseId;
  Modal.confirm({
    title: '提醒',
    content: '变更库存状态：是否确认提交？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post(`movementPlanAction/create.do`, params)
        .then(() => {
          message.success('变更成功！');
          handleFormSubmit();
        });
    },
    onCancel() {},
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
    <BatchSetModal />
    <ChcGrid class="h-[calc(100%-40px)]">
      <template #packagePlanedEdit="scope">
        <InputNumber
          v-model:value="scope.row.packagePlaned"
          class="w-full"
          placeholder="请输入"
          @change="
            (val) => {
              scope.row.qtyPlaned = scope.row.unitPackQty * Number(val);
            }
          "
          :data-testid="`InputNumber_packagePlaned_${scope.rowIndex}`"
        />
      </template>

      <template #storageStatusToNameEdit="scope">
        <ChcSelect
          v-model="scope.row.toStorageStatus"
          class="w-full"
          dict-url="/baseHandleAction/refList.do?id=1000346&validation=ad_ref_list.value%20in(%27H%27,%27S%27,%27R%27,%27W%27)"
          placeholder="请选择"
          :paginate="false"
          :show-search="true"
          :extra-params="{
            // isScatter: 'Y',
            // warehouseId: scope.row.warehouseId,
            // sort: 'id',
            // dir: 'asc',
          }"
          @change="
            (_, option) => {
              scope.row.storageStatusToName = option.label;
            }
          "
          :immediate="true"
          label-field="name"
          value-field="id"
          :after-fetch="
            (res: any) => {
              return { ...res, rows: undefined, records: res.rows };
            }
          "
          :data-testid="`ChcSelect_storageStatusToName_${scope.rowIndex}`"
        />
      </template>
      <template #descriptionEdit="scope">
        <Input
          v-model:value="scope.row.description"
          placeholder="请输入备注"
          :data-testid="`input_description_${scope.rowIndex}`"
        />
      </template>
      <template #action="scope">
        <Button
          type="primary"
          class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleChoosePackage(scope.row)"
          ghost
          :data-testid="`button_package_${scope.rowIndex}`"
        >
          指定包装
        </Button>
      </template>
    </ChcGrid>
    <template #footer>
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pb-[6px] pt-[6px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handleSubmit"
            data-testid="button_commit"
          >
            提交
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

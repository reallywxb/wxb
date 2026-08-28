<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SvgSquareTickIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import {
  Button,
  Checkbox,
  Input,
  InputNumber,
  message,
  Modal,
} from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
// import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

const action = 'movementAction';
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

const uniqueArray = (array: any[]) => {
  const seen = new Set();
  return array.filter((item) => {
    if (seen.has(item.name)) {
      return false;
    } else {
      seen.add(item.name);
      return true;
    }
  });
};
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      showDefaultActions: false,
      showCollapseButton: false,
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
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
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        summarizeRef.value.refreshNumber(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ checked }: any) => {
        if (checked) {
          summarizeRef.value.refreshNumber(
            chcGridApi.grid.getCheckboxRecords(),
          );
        } else {
          summarizeRef.value.refreshNumber([]);
        }
      },
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
          summarizeRef.value.refreshNumber([row]);
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
      // { type: 'checkbox', title: '多选', width: 50, align: 'center' },
      {
        field: 'packageNo',
        title: '包装号',
        minWidth: 200,
        sortable: false,
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '100',
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
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        minWidth: '70',
        align: 'right',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '70',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
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
        field: 'locatorName',
        title: '货位',
        minWidth: '90',
        sortable: false,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
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
            onChange(val: any) {
              departmentId.value = val;
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows?.length) {
                const firstOption = res.rows[0];
                chcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  firstOption.id,
                );
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: '',
        fieldName: 'warehouseId',
        label: '仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              console.warn(
                chcGridApi.formApi.getFieldComponentRef('warehouseId'),
                55,
              );
              chcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              // chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择目标货位',
            paginate: false,
            showChooseAll: '',
            // immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              const rows = uniqueArray(res.rows);
              return { ...res, rows: undefined, records: rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          trigger(values: any) {
            const refInst =
              chcGridApi.formApi.getFieldComponentRef &&
              typeof chcGridApi.formApi.getFieldComponentRef === 'function'
                ? (chcGridApi.formApi.getFieldComponentRef(
                    'locatorIdTo',
                  ) as unknown as SelectComponentRef)
                : undefined;
            if (refInst && refInst.params) {
              refInst.params.dictUrl = `/warehouseAction/locatorList.do?warehouseId=${
                values.warehouseId
              }`;
              if (typeof refInst.fetchApi === 'function') {
                refInst.fetchApi();
              }
            }
          },
        },
        defaultValue: '',
        fieldName: 'locatorIdTo',
        label: '目标货位',
      },
    ],
    dataTableId:
      'orderAction/queryDetail.do?orderType=WO&page=short&specShowType=from&returnDoc=N',
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
const summarizeRef = ref();
const scanStatus = ref({
  invertSectionChecked: false,
  scannedCount: 0,
  scanInputVal: '',
});
const handleScan = async (e: KeyboardEvent) => {
  const packageNo = (e.target as HTMLInputElement).value;
  if (!packageNo) {
    return message.error('请输入包装号');
  }
  if (scanStatus.value.invertSectionChecked) {
    // 反扫
    const records = chcGridApi.grid.getFullData();
    // 判断有没有扫过
    records.forEach((data: any) => {
      if (data.packageNo === packageNo) {
        chcGridApi.grid.remove(data);
        return false;
      }
    });
    scanStatus.value.scanInputVal = '';
    scanStatus.value.scannedCount = chcGridApi.grid.getFullData().length;
  } else {
    // 非反扫
    const formValues = await chcGridApi.formApi.getValues();
    const warehouseId = formValues.warehouseId;
    if (!warehouseId) {
      return message.error('请选择仓库！');
    }
    const records = chcGridApi.grid.getFullData();
    // 判断有没有扫过
    let hasScaned = false;
    records.forEach((data: any) => {
      if (data.packageNo === packageNo) {
        hasScaned = true;
      }
    });
    if (hasScaned) {
      return message.error(`包装号重复：${packageNo}`);
    }
    requestFormClient
      .post('packageAction/query.do', {
        packageNo,
      })
      .then((result) => {
        if (result.rows && result.rows.length > 0) {
          const record = result.rows[0];
          if (record.packageStatus !== 'S' && record.packageStatus !== 'D') {
            message.error(`扫码失败，包装不在库：${packageNo}`);
          } else if (warehouseId && warehouseId !== record.warehouseId) {
            message.error(`扫码失败，包装不在当前仓库：${packageNo}`);
          } else {
            records.unshift(record);
            chcGridApi.grid.reloadData(records);
            scanStatus.value.scannedCount = records.length;
            scanStatus.value.scanInputVal = '';
          }
        } else {
          message.error(`扫码失败，包装未找到：${packageNo}`);
        }
      });
  }
};
const handleSubmitBtn = async () => {
  const records = chcGridApi.grid.getFullData();
  const paramRecords: any[] = [];
  records.forEach((data: any) => {
    if (data.packageNo) {
      paramRecords.push(data.packageNo);
    }
  });
  if (paramRecords.length === 0) {
    return message.error('包装号不可为空！');
  }
  const formValues = await chcGridApi.formApi.getValues();
  const warehouseId = formValues.warehouseId;
  if (!warehouseId) {
    return message.error('请选择仓库！');
  }
  const locatorToId = formValues.locatorIdTo;
  if (!locatorToId) {
    return message.error('请选择目标货位！');
  }
  const params: { [key: string]: any } = {};
  params.warehouseId = warehouseId;
  params.locatorToId = locatorToId;
  params.packageNo = JSON.stringify(paramRecords);
  Modal.confirm({
    title: '提示',
    content: '确认移库？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient.post(`${action}/movePackage.do`, params).then(() => {
        message.success('移库成功!');
        chcGridApi.grid.remove(records);
        scanStatus.value.scannedCount = 0;
        // scanStatus.value.scanInputVal = '';
      });
    },
    onCancel() {},
  });
};
onMounted(() => {
  console.warn('urlParams');
});
</script>
<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    footer-class="bg-[transparent] pb-[0.5rem] pl-[0.5rem] pr-[0.5rem] pt-[0]"
  >
    <ChcGrid>
      <template #qtyProcessDefault="scope">
        <InputNumber
          v-model:value="scope.row.qtyProcess"
          class="w-full"
          :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}`"
        />
      </template>
      <template #toolbar-actions>
        <div>
          <Input
            v-model:value="scanStatus.scanInputVal"
            placeholder="请输入包装号"
            class="mr-[6px] w-[280px]"
            allow-clear
            autofocus
            @press-enter="handleScan"
            data-testid="input_scanInputVal"
          />
          <Checkbox
            v-model:checked="scanStatus.invertSectionChecked"
            data-testid="Checkbox_invertSectionChecked"
          >
            反选
          </Checkbox>
          <span
            style="
              padding-left: 20px;
              font-size: 14px;
              color: rgb(50 54 57 / 82%);
            "
          >
            已扫包数：{{ scanStatus.scannedCount }}
          </span>
        </div>
      </template>
    </ChcGrid>
    <template #footer>
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pb-[6px] pt-[6px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handleSubmitBtn"
            data-testid="button_SubmitBtn"
          >
            确认移库
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
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

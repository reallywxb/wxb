<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';

import { SearchActionIcon, SvgSquareTickIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { cloneDeep, isEmpty, isFunction, isObject } from '@vben/utils';

import { Button, Input, InputGroup, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import ChangeLocatorModalComp from './changeLocatorModal.vue';
import { formSchema, gridColumns } from './options';
import PackageDetailModalComp from './packageDetailModal.vue';
import ScanModalComp from './scanModal.vue';
import dayjs from 'dayjs';
const extParams = ref<{}>({});
const selectedAmount = ref(0);
const totalAmount = ref(0);
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  chcGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});
const formSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};

const [
  ChcGrid,
  chcGridApi,
  {
    PackageDetailModal,
    packageDetailModalApi,
    ScanModal,
    scanModalApi,
    ChangeLocatorModal,
    changeLocatorModalApi,
  },
] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: formSubmit,
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
        updateButtonStatus();
      },
      // 全选/全不选事件
      checkboxAll: ({ records }: { records: any[] }) => {
        calculateSelectedAmount(records);
        updateButtonStatus();
      },
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
          updateButtonStatus();
        }
      },
    },
  },
  {
    gridColumns,
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'docDate', // 默认实际查询参数 dateFrom，dateTo
        label: '配送日期',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        fieldName: 'departmentId',
        label: '院区',
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
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }

              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouseBPartner.do?readWrite=Y',
            placeholder: '请选择发货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch: (res: any) => {
              chcGridApi.formApi?.setFieldValue(
                'bpartnerId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }

              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '发货仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: Record<string, any>) {
            nextTick(() => {
              const cond = !!(
                chcGridApi.formApi?.getFieldComponentRef &&
                typeof chcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                chcGridApi.formApi?.getFieldComponentRef('bpartnerId') &&
                chcGridApi.formApi?.getFieldComponentRef('bpartnerId').params
              );
              if (cond) {
                const refInst =
                  chcGridApi.formApi.getFieldComponentRef('bpartnerId');
                if (refInst && refInst.params) {
                  refInst.params.dependencies = {
                    regionId: values?.departmentId || -1,
                    departmentId: values?.departmentId || -1,
                  };
                  const timer = setTimeout(() => {
                    clearTimeout(timer);
                    refInst?.fetchApi();
                  }, 200);
                }
              }
            });
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'asnNo',
        label: '配送单号',
        componentProps: {
          placeholder: '请输入配送单号',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
    ],
    queryUrl:
      '/asnAction/queryDetail.do?page=rejectReceive&specShowType=from&asnType=WO,MO,WR',
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    afterFetchFn: (params) => {
      totalAmount.value = params.totalPrice || 0;
      console.warn('afterFetchFn:', params.totalPrice);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'PackageDetailModal-packageDetailModalApi': {
        // 连接抽离的组件
        connectedComponent: PackageDetailModalComp,
      },
      'ScanModal-scanModalApi': {
        // 连接抽离的组件
        connectedComponent: ScanModalComp,
      },
      'ChangeLocatorModal-changeLocatorModalApi': {
        // 连接抽离的组件
        connectedComponent: ChangeLocatorModalComp,
      },
    },
  },
);
const showScanBtn = ref(false);
const updateButtonStatus = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    showScanBtn.value = false;
  } else {
    let hasPackage = false;
    for (const record of records) {
      if (record.isStoragePackage === 'Y') {
        hasPackage = true;
      }
    }
    showScanBtn.value = !!hasPackage;
  }
};
const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = total;
};
// 点击发货数量查看包装信息
const handleQtyArrivedClick = (scope: any) => {
  if (scope.row.isStoragePackage === 'Y') {
    packageDetailModalApi!
      .setData({
        warehouseId: scope.row?.warehouseId,
        orderPlanLineId: scope.row?.orderPlanLineId,
        ...scope.row,
      })
      .open();
  } else {
    message.error('无包装信息！');
  }
};
// 修改验收货位
const handleChangeLocator = (row: any) => {
  // console.log('handleChangeLocator:locatorName', row);
  changeLocatorModalApi
    ?.setData({
      lineData: row,
      callBack(val: any) {
        row.locatorId = val.id;
        row.locatorName = val.name;
      },
    })
    .open();
};

const handleConfirmBtn = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择确认的信息！');
    return;
  }
  const temp: any[] = [];
  records.forEach((content: any) => {
    temp.push(content.asnLineId);
  });
  const params: { [key: string]: any } = {};
  params.asnLineId = JSON.stringify(temp);
  const modalInstance = Modal.confirm({
    title: '提示',
    content: '确认入库吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      modalInstance.update({
        okButtonProps: { loading: true },
      });
      try {
        await requestFormClient.post('asnAction/returnReceive.do', params);
        message.success('确认成功!');
        chcGridApi.query();
        modalInstance.destroy();
      } catch (error) {
        console.error('确认入库失败:', error);
      } finally {
        modalInstance.update({
          okButtonProps: { loading: false },
        });
      }
      return Promise.reject();
    },
    onCancel() {},
  });
};
const handleScanBtn = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择收货的单据！');
  }
  scanModalApi
    ?.setData({
      tableId: 'scanModal',
      asnId: records[0].asnId,
      reloadParentTable() {
        formSubmit();
      },
    })
    .open();
};
</script>
<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    footer-class="bg-[transparent] pb-[0.5rem] pl-[0.5rem] pr-[0.5rem] pt-[0]"
  >
    <ChangeLocatorModal />
    <ScanModal />
    <PackageDetailModal />
    <ChcGrid class="h-[calc(100%-40px)]">
      <template #locatorNameDefault="scope">
        <InputGroup compact>
          <Input
            v-model:value="scope.row.locatorName"
            class="readOnly"
            disabled
            style="width: calc(100% - 28px)"
            :data-testid="`input_locatorName_${scope.rowIndex}_asnRejectReceive`"
          />
          <Button
            @click="handleChangeLocator(scope.row)"
            :data-testid="`button_changeLocator_${scope.rowIndex}_asnRejectReceive`"
          >
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </InputGroup>
      </template>
      <!-- SearchActionIcon -->
      <template #qtyArrived="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleQtyArrivedClick(scope)"
          :data-testid="`link_qtyArrived_${scope.rowIndex}_asnRejectReceive`"
        >
          {{ scope.row.qtyArrived }}
        </a>
      </template>
      <!-- <template #toolbar-tools>
        <span>勾选金额：{{ selectedAmount }}元</span>
        <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span>
      </template> -->
    </ChcGrid>
    <template #footer>
      <div
        class="flex w-full items-center justify-center border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] pb-[6px] pt-[6px]"
      >
        <div class="flex gap-[10px]">
          <Button
            type="primary"
            @click="handleScanBtn"
            v-show="showScanBtn"
            data-testid="button_scan_asnRejectReceive"
          >
            扫码入库
            <template #icon>
              <SvgSquareTickIcon />
            </template>
          </Button>
          <Button
            type="primary"
            @click="handleConfirmBtn"
            data-testid="button_confirm_asnRejectReceive"
          >
            入库确认
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

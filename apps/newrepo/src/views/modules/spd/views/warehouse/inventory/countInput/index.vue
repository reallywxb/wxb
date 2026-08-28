<script lang="ts" setup>
import { computed, nextTick, provide, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import {
  SvgDeleteIcon,
  SvgPrintFillIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Modal as AntModal,
  Button,
  message,
  Modal,
  RadioButton,
  RadioGroup,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import importModal from './modals/importModal.vue';
import lotTable from './tables/lotTable.vue';
import taponeTable from './tables/taponeTable.vue';

const globalPrintStore = useGlobalPrintStore();
const route = useRoute();

const userStore = useUserStore();
console.warn('onMounted', userStore.userInfo);
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});
console.warn('searchController', searchController);
const [ImportModal, ImportModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 链接抽离的组件
  connectedComponent: importModal,
  draggable: true,
});
const fatherTableCheckedRow = ref<Record<string, any>>({});
provide('fatherTableCheckedRow', fatherTableCheckedRow);
const scanBtnVisible = computed(() => {
  if (isEmpty(fatherTableCheckedRow.value)) {
    return false;
  }
  if (fatherTableCheckedRow.value?.packageLineCount === undefined) {
    return false;
  }
  const c = fatherTableCheckedRow.value!.packageLineCount > 0;
  return c;
});
const taponeTableRef = useTemplateRef('taponeTableRef');
const lotTableRef = useTemplateRef('lotTableRef');

const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    ChcGridApi.formApi?.getFieldComponentRef &&
    typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
    ChcGridApi.formApi?.getFieldComponentRef(fieldName)
  );
};

const fetchSelectOptions = (fieldName: string, params: Record<string, any>) => {
  const c = isFieldComponentRefExist(fieldName);
  if (c) {
    const refInst = ChcGridApi.formApi.getFieldComponentRef(
      fieldName,
    ) as unknown as SelectComponentRef;
    if (refInst && refInst.params) {
      Object.assign(refInst.params, params);
      if (typeof refInst?.fetchApi === 'function') {
        refInst.fetchApi();
      }
    }
  }
};

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
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'countInput',
    // api地址
    queryUrl: '/inventoryPlanAction/query.do?page=process',
    gridColumns: [
      {
        type: 'radio',
        title: '单选',
        width: 50,
        visible: false,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'inventoryPlanNo',
        title: '盘点计划号',
        width: '110',
        sortable: true,
      },
      {
        field: 'docDate',
        title: '计划时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '盘点仓库',
        width: '120',
        sortable: true,
      },
      {
        field: 'amtBook',
        title: '账存总金额',
        width: '100',
        align: 'right',

        sortable: true,
      },
      {
        field: 'amtCount',
        title: '实存总金额',
        width: '100',
        align: 'right',

        sortable: true,
      },
      {
        field: 'ioAmt',
        title: '报损金额',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'iiAmt',
        title: '报溢金额',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'diffAmt',
        title: '差异金额',
        width: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        // width: '150',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '计划时间',
        defaultValue: [
          // 七天前
          dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',

        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            defaultValue: '',
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign();
                nextTick(() => {
                  fetchSelectOptions('warehouseId', {
                    dictUrl: `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${-1}`,
                  });
                });
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        // defaultValue: '',
        componentProps: () => {
          return {
            // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            autoChooseFirstOption: true,
            placeholder: '请选择仓库',
            paginate: false,
            showChooseAll: '',
            // immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(value: any) {
              console.warn('warehouseId onChange', value);
              searchController.sign();
            },
            afterFetch(res: any) {
              if (!isEmpty(res.rows)) {
                const firstOption = res.rows[0];
                ChcGridApi?.formApi?.setFieldValue(
                  'warehouseId',
                  firstOption.id,
                );
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId'],
          trigger(values: any) {
            console.warn('trigger values', values);
            const c = isFieldComponentRefExist('warehouseId');
            console.warn('isFieldComponentRefExist warehouseId', c);
            if (c) {
              const refInst = ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ) as unknown as SelectComponentRef;
              if (refInst && refInst.params) {
                refInst.params.dictUrl = `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${values?.departmentId || -1}`;
                if (typeof refInst?.fetchApi === 'function') {
                  refInst.fetchApi();
                  ChcGridApi?.formApi?.setFieldValue('warehouseId', undefined);
                }
              }
            }
          },
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        fatherTableCheckedRow.value = row;
        // 无论如何，先清空子表
        taponeTableRef.value?.clearData();
        lotTableRef.value?.clearData();
        if (!isEmpty(row)) {
          // 如果选中了行，再去加载新数据
          if (taponeTableRef.value) {
            taponeTableRef.value.getData({
              inventoryPlanId: row.inventoryPlanId,
              warehouseId: row.warehouseId,
            });
          }
          if (lotTableRef.value) {
            lotTableRef.value.getData({
              inventoryPlanId: row.inventoryPlanId,
              warehouseId: row.warehouseId,
            });
          }
        }
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      if (isEmpty(params.rows)) {
        fatherTableCheckedRow.value = {};
        taponeTableRef.value?.clearData();
        lotTableRef.value?.clearData();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const SonTableTabsVal = {
  Tapone: 'tapone',
  Lot: 'lot',
};
const sonTableTabs = ref([
  {
    label: '盘点明细',
    value: SonTableTabsVal.Tapone,
    disabled: false,
  },
  {
    label: '损溢结果',
    value: SonTableTabsVal.Lot,
    disabled: false,
  },
]);
const currentSonTableTab = ref<
  (typeof SonTableTabsVal)[keyof typeof SonTableTabsVal]
>(SonTableTabsVal.Tapone);

const refreshFatherTable = () => {
  ChcGridApi.query();
};
provide('refreshFatherTable', refreshFatherTable);
const handleDel = () => {
  if (isEmpty(fatherTableCheckedRow.value)) {
    message.warning('请选择盘点计划');
    return;
  }
  const params = {
    inventoryPlanId: fatherTableCheckedRow.value.inventoryPlanId,
  };
  Modal.confirm({
    title: '提示',
    content: '确认作废？',
    onOk: async () => {
      try {
        await requestFormClient.post(`/inventoryPlanAction/cancel.do`, params);
        ChcGridApi.query();
      } catch (error) {
        console.warn('err', error);
      }
    },
  });
};

const handleSubmit = () => {
  if (isEmpty(fatherTableCheckedRow.value)) {
    message.warning('请选择盘点计划');
    return;
  }
  const taboneCheckedRows: Record<string, any>[] =
    taponeTableRef.value?.getCheckedRows() || [];
  // for (const [i, taboneCheckedRow] of taboneCheckedRows.entries()) {
  //   if (taboneCheckedRow.processed === 'N') {
  //     message.warning(`第${i + 1}行未完成盘点!`);
  //     return;
  //   }
  // }
  Modal.confirm({
    title: '提示',
    content: '提交盘点计划吗？',
    onOk: async () => {
      try {
        const res = await requestFormClient.post(
          'inventoryPlanAction/commit.do',
          {
            inventoryPlanId: fatherTableCheckedRow.value.inventoryPlanId,
          },
        );
        if (res.data && res.data.inventoryCount > 0) {
          message.success(
            `提交成功，已生成${res.data.inventoryCount}个损溢申请！`,
          );
        } else {
          message.success('提交成功');
        }
        ChcGridApi.query();
      } catch (error) {
        console.warn(error);
      }
    },
  });
};
const handleImport = () => {
  // TODO:导入 无模板文件未测试，需要成功的样例测试
  if (isEmpty(fatherTableCheckedRow.value)) {
    message.warning('请选择盘点计划');
    return;
  }
  ImportModalApi.setData({
    inventoryPlanId: fatherTableCheckedRow.value.inventoryPlanId,
  }).open();
};
const handlePrint = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handlePrint row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const headerId = row.inventoryPlanId;
  AntModal.confirm({
    title: '打印提示',
    content: '确认打印盘点单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inventoryPlanAction/printInventoryPlanDoc.do?id=${JSON.stringify(headerId)}`,
      });
    },
    onCancel() {},
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ImportModal @import-success="refreshFatherTable" />
    <PageSplitLazy
      :distribute="0.4"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              danger
              @click="handleDel"
              class="mr-[0.5rem]"
              data-testid="button_delete_countInput"
            >
              作 废
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
            <Button
              v-show="!scanBtnVisible"
              type="primary"
              @click="handleImport"
              class="mr-[0.5rem]"
              data-testid="button_import_countInput"
            >
              导 入
              <template #icon>
                <UploadActionIcon />
              </template>
            </Button>
            <!-- <Button
              v-show="scanBtnVisible"
              type="primary"
              @click="handleScan"
              class="mr-[0.5rem]"
            >
              扫码盘点
            </Button> -->
            <Button
              type="primary"
              @click="handlePrint"
              class="mr-[0.5rem]"
              data-testid="button_print_countInput"
            >
              打 印
              <template #icon>
                <SvgPrintFillIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleSubmit"
              class="mr-[0.5rem]"
              data-testid="button_submit_countInput"
            >
              提 交
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <div
          class="relative box-border flex h-full w-full flex-col items-start justify-start"
        >
          <div class="mb-3 box-border w-full bg-white p-[8.4px_8px]">
            <RadioGroup v-model:value="currentSonTableTab" button-style="solid">
              <template v-for="item in sonTableTabs" :key="item.value">
                <RadioButton :value="item.value" :disabled="item.disabled">
                  {{ item.label }}
                </RadioButton>
              </template>
            </RadioGroup>
          </div>
          <div class="bg-pink relative box-border w-full flex-1">
            <div class="absolute box-border h-full w-full">
              <taponeTable
                ref="taponeTableRef"
                v-show="currentSonTableTab === SonTableTabsVal.Tapone"
                v-model:current-tab="currentSonTableTab"
                :this-tab="sonTableTabs[0] as PageTab"
                :refresh-father-table="refreshFatherTable"
                :scan-btn-visible="scanBtnVisible"
              />
              <lotTable
                ref="lotTableRef"
                v-show="currentSonTableTab === SonTableTabsVal.Lot"
                v-model:current-tab="currentSonTableTab"
                :this-tab="sonTableTabs[1] as PageTab"
              />
            </div>
          </div>
        </div>
      </template>
    </PageSplitLazy>
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

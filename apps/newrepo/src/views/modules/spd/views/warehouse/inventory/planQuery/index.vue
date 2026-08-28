<script lang="ts" setup>
import { nextTick, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import {
  Button,
  message,
  Modal,
  RadioButton,
  RadioGroup,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import lotTable from './tables/lotTable.vue';
import taponeTable from './tables/taponeTable.vue';

const globalPrintStore = useGlobalPrintStore();
const route = useRoute();
const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};

console.warn('urlParams', urlParams);
// AI-GENERATED-BEGIN
// @date 2026-07-03
// @prompt 院区默认选择第一个
// @description 修改isFirstLoaded初始值为true，用于控制首次加载时自动选择默认值
const isFirstLoaded = ref(false); // 是否已初次加载完，初始为true用于自动选择默认值
// AI-GENERATED-END

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(3, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});
onMounted(() => {
  searchController.sign(3);
});
const fatherTableCheckedRow = ref<Record<string, any>>({});
const taponeTableRef = useTemplateRef('taponeTableRef');
const lotTableRef = useTemplateRef('lotTableRef');
// AI-GENERATED-BEGIN
// @date 2026-07-03
// @prompt 使用extraParams方式传递仓库筛选参数
// @description 定义仓库筛选参数对象，通过extraParams传递给仓库下拉框
const warehouseExtraParams = ref<Record<string, any>>({});
// AI-GENERATED-END

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
    id: 'inventory_planQuery',
    // api地址
    queryUrl: '/inventoryPlanAction/query.do?page=query',
    gridColumns: [
      {
        type: 'radio',
        width: '50',
        align: 'center',
        title: '单选',
        visible: false,
      },
      {
        type: 'seq',
        title: '序号',
        width: '50',
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
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '盘点仓库',
        width: '120',
        sortable: true,
      },
      {
        field: 'docStatusName',
        title: '计划状态',
        width: '100',
        sortable: true,
      },
      {
        field: 'amtBook',
        title: '账存总金额',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'amtCount',
        title: '实存总金额',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'ioAmt',
        title: '报损金额',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'iiAmt',
        title: '报溢金额',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'diffAmt',
        title: '差异金额',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'diffrentRate',
        title: '差异率',
        width: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'createdByName',
        title: '创建人',
        width: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        width: '160',
        sortable: true,
      },
      {
        field: 'commitUserName',
        title: '提交人',
        width: '100',
        sortable: true,
      },
      {
        field: 'commitTime',
        title: '提交时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'completeUserName',
        title: '确认人',
        width: '100',
        sortable: true,
      },
      {
        field: 'completeTime',
        title: '确认时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'rejectReason',
        title: '拒绝原因',
        width: '150',
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
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              ChcGridApi.formApi?.setFieldValue('departmentId', res.rows[0].id);
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        // 仓库等级入参没有用到，没有任何用
        component: 'ChcSelect',
        fieldName: 'warehouseLevel',
        label: '仓库等级',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: false,
            options: [
              {
                label: '全部',
                value: '',
              },
              {
                value: '1',
                label: '一级库',
              },
              {
                value: '2',
                label: '二级库',
              },
              {
                value: '3',
                label: '三级库',
              },
            ],
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择仓库',
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            // AI-GENERATED-BEGIN
            // @date 2026-07-03
            // @prompt 使用extraParams方式传递仓库筛选参数
            // @description 通过extraParams传递院区和仓库等级筛选参数
            extraParams: warehouseExtraParams.value,
            // AI-GENERATED-END
            afterFetch(res: any) {
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'warehouseLevel'],
          trigger(values: any) {
            console.warn('trigger values', values);
            // AI-GENERATED-BEGIN
            // @date 2026-07-03
            // @prompt 修改院区、仓库等级与仓库的联动方式，使用extraParams方式
            // @description 通过更新extraParams对象传递筛选参数，并调用fetchApi重新获取仓库数据
            Object.keys(warehouseExtraParams.value).forEach((key) => {
              warehouseExtraParams.value[key] = undefined;
            });
            warehouseExtraParams.value.regionId = values?.departmentId || -1;
            warehouseExtraParams.value.departmentId =
              values?.departmentId || -1;
            if (values?.warehouseLevel) {
              warehouseExtraParams.value[`level${values.warehouseLevel}`] = 'Y';
            }
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              const refInst =
                ChcGridApi.formApi.getFieldComponentRef('warehouseId');
              if (typeof refInst?.fetchApi === 'function') {
                refInst.fetchApi();
                ChcGridApi.formApi?.setFieldValue('warehouseId', '');
              }
            }
            // AI-GENERATED-END
          },
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        fatherTableCheckedRow.value = {};
        fatherTableCheckedRow.value = row;
        taponeTableRef.value?.clearData();
        lotTableRef.value?.clearData();
        if (!isEmpty(row)) {
          if (taponeTableRef.value) {
            taponeTableRef.value.getData({
              inventoryPlanId: row.inventoryPlanId,
            });
          }
          if (lotTableRef.value) {
            lotTableRef.value.getData({
              inventoryPlanId: row.inventoryPlanId,
            });
          }
        }
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      return {
        ...params,
        warehouseLevel: undefined,
      };
    },
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

// const submitLoading = ref(false);
// const handleSubmit = () => {
//   if (submitLoading.value) {
//     message.warning('请勿重复操作！');
//     return;
//   }
//   if (isEmpty(fatherTableCheckedRow.value)) {
//     message.warning('请选择盘点计划');
//     return;
//   }
//   const params: Record<string, any> = {
//     inventoryPlanId: fatherTableCheckedRow.value.inventoryPlanId,
//   };
//   Modal.confirm({
//     content: '确认盘点结果吗？',
//     onOk: () => {
//       submitLoading.value = true;
//       requestFormClient
//         .post(`/inventoryPlanAction/complete.do`, params)
//         .then((res) => {
//           if (res.data && res.data.inventoryCount > 0) {
//             message.success(
//               `确认成功，已生成${res.data.inventoryCount}个损溢申请！`,
//             );
//           } else {
//             message.success('确认成功');
//           }
//           ChcGridApi.query();
//         })
//         .catch((error) => {
//           console.warn('err', error);
//         })
//         .finally(() => {
//           submitLoading.value = false;
//         });
//     },
//     title: '确定',
//   });
// };

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

// 打印盘点计划
const handlePrintPlanDoc = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handlePrintPlanDoc row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const headerId = row.inventoryPlanId;
  Modal.confirm({
    title: '打印提示',
    content: '确认打印盘点单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inventoryPlanAction/printInventoryPlanDoc.do?id=${headerId}`,
      });
    },
    onCancel() {},
  });
};

// 打印损溢结果
const handlePrintPlanResultDoc = () => {
  const row = ChcGridApi.grid.getRadioRecord(true);
  console.warn('handlePrintPlanResultDoc row:', row);
  if (isEmpty(row)) {
    message.warning('请选择一条记录');
    return;
  }
  const headerId = row.inventoryPlanId;
  Modal.confirm({
    title: '打印提示',
    content: '确认打印盘点结果吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inventoryPlanAction/printInventoryPlanResultDoc.do?id=${headerId}`,
      });
    },
    onCancel() {},
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid>
          <template #toolbar-actions>
            <!-- <Button type="primary" @click="handleSubmit" class="mr-[0.5rem]">
              确认
            </Button> -->
            <Button
              type="primary"
              @click="handlePrintPlanDoc"
              class="mr-[0.5rem]"
              data-testid="button_handlePrintPlanDoc"
            >
              打印盘点计划
              <template #icon>
                <SvgPrintFillIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handlePrintPlanResultDoc"
              class="mr-[0.5rem]"
              data-testid="button_handlePrintPlanResultDoc"
            >
              打印损溢结果
              <template #icon>
                <SvgPrintFillIcon />
              </template>
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <div
          class="relative box-border flex h-full w-full flex-col items-start justify-start"
        >
          <div class="mb-3 box-border w-full bg-white p-[8.4px_8px]">
            <RadioGroup
              v-model:value="currentSonTableTab"
              button-style="solid"
              data-testid="RadioGroup_currentSonTableTab"
            >
              <template v-for="item in sonTableTabs" :key="item.value">
                <RadioButton
                  :value="item.value"
                  :disabled="item.disabled"
                  :data-testid="`RadioButton_${item.value}`"
                >
                  {{ item.label }}
                </RadioButton>
              </template>
            </RadioGroup>
          </div>
          <!-- absolute h-[calc(100%_-_45px)] -->
          <div class="bg-pink relative box-border w-full flex-1">
            <div class="absolute box-border h-full w-full">
              <taponeTable
                ref="taponeTableRef"
                v-show="currentSonTableTab === SonTableTabsVal.Tapone"
                v-model:current-tab="currentSonTableTab"
                :this-tab="sonTableTabs[0] as PageTab"
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

<style scoped>
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

<script lang="ts" setup>
import { nextTick, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

import { SvgDeleteIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
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

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import lotTable from './tables/lotTable.vue';
import taponeTable from './tables/taponeTable.vue';

const route = useRoute();

const userStore = useUserStore();
console.warn('userStore', userStore.userInfo);
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};

console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    console.warn('searchController getValues', res);
    ChcGridApi.query({ ...res });
  });
});

const fatherTableCheckedRow = ref<Record<string, any>>({});
const taponeTableRef = useTemplateRef('taponeTableRef');
const lotTableRef = useTemplateRef('lotTableRef');
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
    id: 'inventory_countConfirm',
    // api地址
    queryUrl: '/inventoryPlanAction/query.do?page=confirm',
    gridColumns: [
      {
        type: 'radio',
        width: '50',
        align: 'center',
        title: '单选',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

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
        field: 'createdByName',
        title: '创建人',
        width: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        width: '150',
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
        field: 'description',
        title: '备注',
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
        fieldName: 'warehouseId',
        label: '仓库',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(value: any) {
              console.warn('warehouseId onChange', value);
              searchController.sign();
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        console.warn('父表格 radioChange', row);
        // 请求子表  多个子表请求
        fatherTableCheckedRow.value = {};
        fatherTableCheckedRow.value = row;
        if (isEmpty(row)) {
          return;
        }
        console.warn('fatherTableCheckedRow', fatherTableCheckedRow.value);
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
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      if (isEmpty(params.rows)) {
        fatherTableCheckedRow.value = {};
        taponeTableRef.value?.removeData();
        lotTableRef.value?.removeData();
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const submitLoading = ref(false);
const handleSubmit = () => {
  if (submitLoading.value) {
    message.warning('请勿重复操作！');
    return;
  }
  if (isEmpty(fatherTableCheckedRow.value)) {
    message.warning('请选择盘点计划');
    return;
  }
  const params: Record<string, any> = {
    inventoryPlanId: fatherTableCheckedRow.value.inventoryPlanId,
  };
  Modal.confirm({
    content: '确认盘点结果吗？',
    onOk: () => {
      submitLoading.value = true;
      requestFormClient
        .post(`/inventoryPlanAction/complete.do`, params)
        .then((res) => {
          if (res.data && res.data.inventoryCount > 0) {
            message.success(
              `确认成功，已生成${res.data.inventoryCount}个损溢申请！`,
            );
          } else {
            message.success('确认成功');
          }
          ChcGridApi.query();
        })
        .catch((error) => {
          console.warn('err', error);
        })
        .finally(() => {
          submitLoading.value = false;
        });
    },
    title: '确定',
  });
};
const isDeling = ref(false);
const handleDel = () => {
  if (isDeling.value) {
    message.warning('请勿重复操作！');
    return;
  }
  if (isEmpty(fatherTableCheckedRow.value)) {
    message.warning('请选择盘点计划');
    return;
  }
  const params: Record<string, any> = {
    inventoryPlanId: fatherTableCheckedRow.value.inventoryPlanId,
  };
  Modal.confirm({
    content: '确认退回？',
    onOk: () => {
      isDeling.value = true;
      requestFormClient
        .post(`/inventoryPlanAction/returnStatus.do`, params)
        .then(() => {
          ChcGridApi.query();
        })
        .catch((error) => {
          console.warn('err', error);
        })
        .finally(() => {
          isDeling.value = false;
        });
    },
    title: '确定',
  });
};
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
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
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
              @click="handleSubmit"
              class="mr-[0.5rem]"
              data-testid="button_confirm"
            >
              确认
            </Button>
            <Button
              type="primary"
              danger
              @click="handleDel"
              class="mr-[0.5rem]"
              data-testid="button_cancel"
            >
              退回
              <template #icon>
                <SvgDeleteIcon />
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

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { readTips } from './api';
import detailModalUI from './modals/detailModal.vue';

const [detailModal, detailModalApi] = useVbenModal({
  connectedComponent: detailModalUI,
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD 00:00'],
      ],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
    }),
  },
  {
    id: 'parent',
    queryUrl: '/userTipsAction/pcTips.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'AD_USER_TIPS_ID',
        title: '消息编号',
        width: '85',
        sortable: true,
      },
      {
        field: 'Title',
        title: '标题',
        width: '200',
        sortable: true,
      },
      {
        field: 'Created',
        title: '时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'Content',
        title: '消息内容',
        minWidth: '550',
        sortable: true,
        slots: {
          default: 'Content',
        },
        // hover: true,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
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
        fieldName: 'isRead',
        label: '是否已阅',
      },
    ],
    gridEvents: {},
    afterFetchFn: (params) => {
      const rows =
        params.rows?.map((item: any) => {
          return {
            ...item,
          };
        }) || [];

      return {
        ...params,
        records: rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        isActive: params.isActive ? 'Y' : undefined,
      };
    },
  },
);

onMounted(() => {
  handleQuery();
});

const typeData = ref<any>({});

const handleEdit = (scope: any) => {
  typeData.value = scope.row;
  detailModalApi.setData(typeData.value).open();
  readTips({ ids: scope.row.AD_USER_TIPS_ID });
};

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <detailModal :type-data="typeData" @close="handleQuery" />
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #Content="scope">
          <a
            href="javascript:void(0)"
            class="cursor-pointer text-blue-600 underline hover:text-blue-800"
            @click="handleEdit(scope)"
            :data-testid="`button_Content_${scope.rowIndex}_messageList`"
          >
            {{ scope.row.Content }}
          </a>
        </template>
      </ChcGrid>
    </div>
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
</style>

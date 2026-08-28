<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { useRoute } from 'vue-router';

import { EditActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import detailModalUI from './modals/detailModal.vue';
// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');

const [detailModal, detailModalApi] = useVbenModal({
  connectedComponent: detailModalUI,
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
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
    queryUrl: '/queueHandleAction/query.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'serverName',
        title: '服务器编号',
        width: '200',
        sortable: true,
      },
      {
        field: 'queueTypeName',
        title: '队列类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'queueStatusName',
        title: '队列状态',
        width: '100',
        sortable: true,
      },
      { field: 'msgGroup', title: '消息分组', width: '100' },
      { field: 'queueId', title: '消息ID', width: '100' },
      { field: 'msgId', title: '消息编号', width: '100' },
      { field: 'msgType', title: '消息类型', width: '200' },
      { field: 'msgTime', title: '消息时间', width: '200', sortable: true },
      { field: 'timeOut', title: '超时时间', width: '110' },
      { field: 'description', title: '描述', width: '150' },
      { field: 'errorMsg', title: '错误消息', width: '100' },
      {
        field: 'isActive',
        title: '有效的',
        width: '70',
        formatter: ({ row }: any) => {
          return row.isActive === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'runNow',
        title: '立即运行',
        width: '80',
        formatter: ({ row }: any) => {
          return row.runNow === 'Y' ? '是' : '否';
        },
      },
      { field: 'msgSign', title: '消息签名', width: '100' },

      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=800107',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择服务器编号',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            showChooseAll: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'serverId',
        label: '服务器编号',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=800105',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择队列类型',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            showChooseAll: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'queueType',
        label: '队列类型',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=800106',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择处理状态',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            immediate: true,
            labelField: 'name',
            showChooseAll: '',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'processStatus',
        label: '处理状态',
      },
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [dayjs().format('YYYY-MM-DD')],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'msgGroup',
        label: '消息分组',
        componentProps: {
          placeholder: '请输入消息分组',
        },
      },
      {
        component: 'Input',
        fieldName: 'msgType',
        label: '消息类型',
        componentProps: {
          placeholder: '请输入消息类型',
        },
      },
      {
        component: 'Input',
        fieldName: 'msgId',
        label: '消息编号',
        componentProps: {
          placeholder: '请输入消息编号',
        },
      },
      {
        component: 'Input',
        fieldName: 'description',
        label: '描述',
        componentProps: {
          placeholder: '请输入描述',
        },
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
        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleEdit(scope)"
            data-testid="button_edit"
          >
            编辑
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
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

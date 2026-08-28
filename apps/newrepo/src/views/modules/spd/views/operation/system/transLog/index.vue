<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { EditActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { processDo } from './api';
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
    queryUrl: '/transLogAction/query.do',
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
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'transTypeName',
        title: '消息类型',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'transResultName',
        title: '处理状态',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'transLogId',
        title: '消息编号',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'transMethod',
        title: '调用方法',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'transTime',
        title: '消息时间',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'msgContent',
        title: '消息内容',
        minWidth: '200',
        formatter: ({ row }: any) => {
          if (row.msgContent instanceof Object) {
            return JSON.stringify(row.msgContent);
          }
          return row.msgContent;
        },
        sortable: true,
      },
      {
        field: 'msgResult',
        title: '调用结果',
        minWidth: '140',
        formatter: ({ row }: any) => {
          if (row.msgContent instanceof Object) {
            return JSON.stringify(row.msgResult);
          }
          return row.msgResult;
        },
        sortable: true,
      },
      { field: 'description', title: '描述', minWidth: '100', sortable: true },
      {
        field: 'isActive',
        title: '有效的',
        minWidth: '80',
        formatter: ({ row }: any) => {
          return row.isActive === 'Y' ? '是' : '否';
        },
        sortable: true,
      },
      { field: 'oppars', title: '调用参数名', minWidth: '100', sortable: true },
      { field: 'opargs', title: '调用参数值', minWidth: '100', sortable: true },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 150,
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
            dictUrl: '/baseHandleAction/refList.do?id=1000353',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择消息类型',
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
        fieldName: 'transType',
        label: '消息类型',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000489',
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
        fieldName: 'transResult',
        label: '处理状态',
      },
      {
        component: 'Input',
        fieldName: 'transMethod',
        label: '调用方法',
        componentProps: {
          placeholder: '请输入调用方法',
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '消息时间',
        componentProps: {
          valueFormat: 'YYYY-MM-DD 00:00',
          format: 'YYYY-MM-DD 00:00',
        },
        defaultValue: [dayjs().format('YYYY-MM-DD 00:00')],
        formItemClass: 'col-span-1',
      },

      {
        component: 'Input',
        fieldName: 'transLogId',
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

const handleProcess = (scope: any) => {
  Modal.confirm({
    title: '提示',
    content: '确认处理数据？',
    onOk: () => {
      processDo({ transLogIds: JSON.stringify([scope.row.transLogId]) }).then(
        (res) => {
          if (res && res.success) {
            message.success('数据处理成功！');
            handleQuery();
          }
        },
      );
    },
  });
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
            :data-testid="`button_edit_${scope.rowIndex}_index`"
          >
            编辑
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleProcess(scope)"
            :data-testid="`button_process_${scope.rowIndex}_index`"
          >
            处理
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

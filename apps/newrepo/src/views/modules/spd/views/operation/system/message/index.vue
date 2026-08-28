<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  EditActionIcon,
  ResetActionIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { batchImportMessage, revertMessage } from './api';
import detailModalUI from './modals/detailModal.vue';

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
    queryUrl: '/ediMessageHandleAction/query.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'serverName',
        title: '服务器编号',
        width: '200',
        sortable: true,
      },
      { field: 'msgType', title: '消息类型', minWidth: '170', sortable: true },
      { field: 'msgGroup', title: '消息分组', minWidth: '90', sortable: true },
      { field: 'msgTime', title: '消息时间', minWidth: '140' },
      { field: 'recordNo', title: '记录号', minWidth: '90' },
      { field: 'tableName', title: '表', minWidth: '100' },
      { field: 'messageId', title: '记录ID', width: '90' },
      { field: 'processStatusName', title: '处理状态', minWidth: '90' },
      { field: 'lastProcessTime', title: '上次处理时间', width: '140' },
      {
        field: 'isLegacy',
        title: '期初',
        minWidth: '60',
        sortable: true,
        formatter: ({ row }: any) => {
          return row.isLegacy === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isActive',
        title: '有效的',
        minWidth: '80',
        formatter: ({ row }: any) => {
          return row.isActive === 'Y' ? '是' : '否';
        },
      },
      { field: 'retryCount', title: '重试次数', minWidth: '90' },
      { field: 'processMsg', title: '处理消息', minWidth: '100' },
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
        component: 'Input',
        fieldName: 'msgType',
        label: '消息类型',
        componentProps: {
          placeholder: '请输入消息类型',
        },
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000354',
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
        label: '消息时间',
        defaultValue: [dayjs().format('YYYY-MM-DD')],
        formItemClass: 'col-span-1',
      },

      {
        component: 'Input',
        fieldName: 'recordNo',
        label: '记录号',
        componentProps: {
          placeholder: '请输入记录号',
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

const handleImport = () => {
  // importModalApi.open();
  const checkBorArr = ChcGridApi.grid.getCheckboxRecords() || [];
  if (checkBorArr.length > 0) {
    // importModalApi.open();
    const messageIds = checkBorArr.map((item: any) => item.messageId);
    batchImportMessage({ messageIds: JSON.stringify({ messageIds }) }).then(
      (res) => {
        if (res && res.success) {
          message.success(
            `共处理${res.data.totalCnt}消息，其中${
              res.data.errorCnt
            }个消息处理失败`,
          );
          handleQuery();
        }
      },
    );
  } else {
    message.warning('请选择一条记录');
  }
};

const handleReset = () => {
  const checkBorArr = ChcGridApi.grid.getCheckboxRecords() || [];
  const hasProcessData = checkBorArr.some(
    (item: any) => item.processStatus === 'Y',
  );
  if (hasProcessData) {
    message.warning('已处理消息不能重置状态');
    return;
  }
  if (checkBorArr.length > 0) {
    // importModalApi.open();
    const messageIds = checkBorArr.map((item: any) => item.messageId);
    revertMessage({ messageIds: JSON.stringify({ messageIds }) }).then(
      (res) => {
        if (res && res.success) {
          message.success('操作成功');
          handleQuery();
        }
      },
    );
  } else {
    message.warning('请选择一条记录');
  }
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
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleImport"
            class="mr-[0.5rem]"
            data-testid="button_import"
          >
            导入
            <template #icon>
              <UploadActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            danger
            @click="handleReset"
            class="mr-[0.5rem]"
            data-testid="button_reset"
          >
            重置
            <template #icon>
              <ResetActionIcon />
            </template>
          </Button>
        </template>
        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleEdit(scope)"
            :data-testid="`button_edit_${scope.rowIndex}`"
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

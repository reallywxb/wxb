<script lang="ts" setup>
import type { NotificationItem } from '@vben/chc-ui';

import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { ref, watch } from 'vue';

import { usePreferences } from '@vben/preferences';
import { useSsoStore, useUserStore } from '@vben/stores';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useChcGrid } from '#/adapter/chc-ui';
import { getMyMessageList, readMessage } from '#/api/core/user';
import { useMessageStore } from '#/store/message';

const ssoStore = useSsoStore();
const userStore = useUserStore();
interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}
const messageStore = useMessageStore();
const { contentIsMaximize } = usePreferences();
const formOptions: VbenFormProps = {
  wrapperClass: 'grid-cols-4',
  showCollapseButton: false,
  // 默认展开
  // fieldMappingTime: [
  //   [
  //     'changeDate',
  //     ['changeDateStartTime', 'changeDateEndTime'],
  //     'YYYY-MM-DD HH:mm:ss',
  //   ],
  //   ['changeTime', ['changeTimeStartTime', 'changeTimeEndTime'], null],
  // ],
};
const cols = [
  { id: 'messageTime' },
  { id: 'messageType', dict: true },
  { id: 'content' },
  { id: 'orgId', dict: true },
  { id: 'isRead' },
  { id: 'id' },
  { id: 'createdBy' },
  { id: 'createTime' },
  { id: 'updatedBy' },
  { id: 'updateTime' },
  { id: 'versionstamp' },
];
const gridOptions: VxeTableGridOptions<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  exportConfig: {},
  height: 'auto',
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const midFormValue = {
          isRead: !!formValues.isRead[0],
          messageTime: formValues.messageTime.join(','),
          messageType: formValues.messageType,
        };
        const res = await getMyMessageList({
          cols: cols || [],
          current: page.currentPage,
          size: page.pageSize,
          sort: sort.value,
          start: page.pageSize * (page.currentPage - 1),
          ...midFormValue,
        });
        return {
          total: res.total,
          items: res.records,
        };
      },
    },
  },
  toolbarConfig: {
    custom: true,
    // export: true,
    refresh: true,
    // resizable: true,
    // search: true,
    zoom: true,
  },
};
const sort = ref<string[]>(['id desc']);
const [Grid, gridApi] = useChcGrid(
  {
    formOptions,
    gridOptions,
  },
  {
    formSchema: [
      {
        // 日期区间组件
        component: 'DateGroup',
        // 配置日期区间组件属性
        componentProps: {
          // 这里可以传antd-vue date-picker 或者 time-picker 组件内的属性进行配置
          // showTime: true, // 是否显示时分秒
          valueFormat: 'YYYY-MM-DD',
        },
        // 配置日期区间组件初始值
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
          '',
        ],
        fieldName: 'messageTime',
        label: '变更日期',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/sys/message/getMessageTypeDictList',
            showChooseAll: true,
            placeholder: '请选择消息类型',
            paginate: false,
          };
        },
        fieldName: 'messageType',
        label: '消息类型',
      },
      {
        component: 'CheckboxGroup',
        componentProps: {
          name: 'cname',
          options: [
            {
              label: '',
              value: true,
            },
          ],
          onchange: () => {
            gridApi.formApi.submitForm();
          },
          class: 'pt-[4px] ml-[4px]',
        },
        defaultValue: [],
        fieldName: 'isRead',
        label: '是否已阅',
      },
    ],
    gridColumns: [
      {
        title: '序号',
        type: 'seq',
        width: 100,
        className: ({ row }: { row: any }) => {
          if (row.isRead === false) {
            return 'UnRead';
          }
        },
      },
      {
        field: 'messageTime',
        title: '消息时间',
        sortable: true,
        className: ({ row }: { row: any }) => {
          if (row.isRead === false) {
            return 'UnRead';
          }
        },
      },
      {
        field: 'messageType',
        title: '消息类型',
        sortable: true,
        className: ({ row }: { row: any }) => {
          if (row.isRead === false) {
            return 'UnRead';
          }
        },
      },
      {
        field: 'content',
        title: '内容',
        className: ({ row }: { row: any }) => {
          if (row.isRead === false) {
            return 'UnRead';
          }
        },
      },
      {
        field: 'orgId',
        title: '消息机构',
        sortable: true,
        className: ({ row }: { row: any }) => {
          if (row.isRead === false) {
            return 'UnRead';
          }
        },
        formatter: (val: FormatterObj) => {
          return val.row.orgName;
        },
      },
      {
        field: 'isRead',
        title: '是否已阅',
        sortable: true,
        className: ({ row }: { row: any }) => {
          if (row.isRead === false) {
            return 'UnRead';
          }
        },
        formatter: (val: FormatterObj) => {
          return val.cellValue === true ? '是' : '否';
        },
      },
    ],
    gridEvents: {
      sortChange: ({ field, order }: { field: string; order: string }) => {
        sort.value = order ? [`${field} ${order}`] : [];
        gridApi.query();
      },
      cellClick: ({ row }: { row: any }) => {
        if (!row.isRead) {
          // 发送接口，同时将当前行的消息设为已读
          readMessage([row.id]).then(() => {
            messageStore.setMessageList(
              messageStore.messageList.map((itemIn: NotificationItem) => {
                return itemIn.id === row.id
                  ? { ...itemIn, isRead: true }
                  : itemIn;
              }),
            );
            row.isRead = true;
          });
        }
      },
    },
  },
);
let count = 1;
function handleSend() {
  messageStore.websocketConnection.send(
    JSON.stringify({
      id: userStore.userInfo?.id,
      to: 10_295,
      message: {
        id: count++,
        orgId: 30 + count++,
        orgName: '测试机构111',
        messageTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        messageType: `消息类型${count++}`,
        messageTypeName: null,
        messageGroup: 'credit',
        messageGroupName: '信用中心',
        content: '苏州市立医院发生超信情况，当前信用额度0，已用额度24309',
        url: null,
        mobileUrl: null,
        isRead: false,
        readTime: null,
        sender: '系统',
        source: '事件中心',
      },
    }),
  );
}
watch(
  () => messageStore.messageList,
  (val) => {
    // console.log('messageStore.messageList', val);
    const tableData = gridApi.grid.getTableData().tableData;
    // 遍历所有pinia里的消息，将当前页面的消息状态做更新
    for (const element of val) {
      for (const tableDatum of tableData) {
        if (element.id === tableDatum.id) {
          tableDatum.isRead = element.isRead;
        }
      }
    }
  },
  { deep: true },
);
</script>

<template>
  <div
    :style="{
      height: ssoStore.isInPortal
        ? 'calc(100vh - 60px)'
        : contentIsMaximize
          ? 'calc(100vh - 38px)'
          : 'calc(100vh - 88px)',
      overflowY: 'hidden',
      padding: '12px',
    }"
  >
    <Grid>
      <template #toolbar-actions>
        <!-- v-if="userStore.userInfo.id === 1" -->
        <Button type="primary" v-if="false" @click="handleSend">
          发送websocket消息
        </Button>
      </template>
    </Grid>
  </div>
</template>

import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

const columns: CrudColsType = [
  { fixed: 'left', title: '序号', type: 'seq', width: 50 },
  {
    dict: true,
    field: 'messageTime',
    title: '消息时间',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'orgId_name',
    title: '机构',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'messageType_name',
    title: '消息类型',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'messageGroup_name',
    title: '消息分组',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'content',
    title: '消息内容',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'url',
    title: 'PC端链接地址',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'url',
    title: '移动端链接地址',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'readCount',
    title: '阅读数',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'sender',
    title: '发送人',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'source',
    title: '消息来源',
    minWidth: 100,
    sortable: true,
  },
  {
    align: 'center',
    field: 'action',
    slots: {
      default: 'action',
    },
    fixed: 'right',
    width: 140,
    title: '操作',
  },
];

export const gridOptions: CrudGridOptions<deptDto> = {
  proxyConfig: {
    autoLoad: true,
  },
  columns,
};

export const subGridOptions: CrudGridOptions<deptDto> = {
  columns: [
    { fixed: 'left', title: '序号', type: 'seq', width: 50 },
    {
      dict: true,
      field: 'userId_name',
      title: '用户',
      minWidth: 100,
      sortable: true,
    },
    {
      dict: true,
      field: 'isRead',
      title: '是否已阅',
      minWidth: 100,
      sortable: true,
    },
    {
      dict: true,
      field: 'readTime',
      title: '阅读时间',
      minWidth: 100,
      sortable: true,
    },
    {
      align: 'center',
      field: 'action',
      slots: {
        default: 'action',
      },
      fixed: 'right',
      width: 140,
      title: '操作',
    },
  ],
};

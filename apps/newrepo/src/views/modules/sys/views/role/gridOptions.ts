import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

const columns: CrudColsType = [
  { fixed: 'left', title: '序号', type: 'seq', width: 50 },
  { field: 'id', title: '角色编码', minWidth: 100, sortable: true },
  { field: 'name', title: '角色名称', minWidth: 100, sortable: true },
  {
    field: 'isPublic',
    title: '下级机构可见',
    minWidth: 100,
    sortable: true,
    formatter: ({ cellValue }) => {
      return cellValue ? '是' : '否';
    },
  },
  {
    field: 'isActive',
    formatter: ({ cellValue }) => {
      return cellValue ? '启用' : '禁用';
    },
    minWidth: 100,
    width: 70,
    title: '状态',
    sortable: true,
  },
  { field: 'remark', title: '角色描述', minWidth: 100, sortable: true },
  {
    dict: true,
    field: 'createdBy_name',
    title: '创建人',
    minWidth: 100,
    sortable: true,
  },
  { field: 'createTime', title: '创建时间', minWidth: 100, sortable: true },
  {
    dict: true,
    field: 'updatedBy_name',
    title: '更新人',
    minWidth: 100,
    sortable: true,
  },
  {
    dict: true,
    field: 'updateTime',
    title: '更新日期',
    minWidth: 100,
    sortable: true,
  },
  {
    align: 'center',
    slots: {
      default: 'action',
    },
    field: 'action',
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

import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

const columns: CrudColsType = [
  { fixed: 'left', title: '序号', type: 'seq', width: 50 },
  { sortable: true, field: 'orgId_name', title: '机构', minWidth: 100 },
  { sortable: true, field: 'code', title: '岗位编码', minWidth: 100 },
  { sortable: true, field: 'name', title: '岗位名称', minWidth: 100 },
  {
    sortable: true,
    field: 'positionType_name',
    title: '岗位类别',
    minWidth: 100,
  },
  { sortable: true, field: 'remark', title: '备注', minWidth: 100 },
  {
    sortable: true,
    field: 'isActive',
    title: '是否启用',
    minWidth: 100,
    formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
  },
  { sortable: true, field: 'createdBy_name', title: '创建人', minWidth: 100 },
  { sortable: true, field: 'createTime', title: '创建时间', minWidth: 130 },
  {
    align: 'center',
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
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
    { field: 'orgId_name', title: '机构', minWidth: 100, sortable: true },
    { field: 'roleId_name', title: '角色', minWidth: 100, sortable: true },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      width: 140,
      title: '操作',
    },
  ],
};

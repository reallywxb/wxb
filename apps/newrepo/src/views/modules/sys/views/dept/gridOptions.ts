import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

const columns: CrudColsType = [
  { fixed: 'left', title: '序号', type: 'seq', width: 50 },
  { field: 'code', title: '编码', minWidth: 100, sortable: true },
  { field: 'name', title: '名称', minWidth: 100, sortable: true },
  { dict: true, field: 'parentId_name', title: '上级部门', sortable: true },
  {
    field: 'isActive',
    title: '状态',
    width: 100,
    formatter: ({ cellValue }) => {
      return cellValue ? '启用' : '停用';
    },
    sortable: true,
  },
  { dict: true, field: 'createdBy_name', title: '创建人', sortable: true },
  { dict: true, field: 'createTime', title: '创建日期', sortable: true },
  { dict: true, field: 'updatedBy_name', title: '更新人', sortable: true },
  { dict: true, field: 'updateTime', title: '更新日期', sortable: true },
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

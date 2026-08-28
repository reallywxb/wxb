import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'label',
      title: '名称',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'id',
      title: '菜单编码',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'component',
      title: '页面',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'path',
      title: '路径',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'url',
      title: 'url',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'queryUrl',
      title: '待办url',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'icon',
      title: '图标',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'keepAlive',
      width: 120,
      sortable: true,
      title: '保持页面状态',
      formatter: ({ cellValue }: any) => {
        return cellValue ? '是' : '否';
      },
    },
    {
      field: 'openType',
      title: '打开方式',
      minWidth: 90,
      sortable: true,
      formatter: (params: any) => {
        return params.row.openType_name;
      },
    },
    {
      field: 'permissions',
      title: '按钮权限',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'parentId',
      title: '父菜单ID',
      minWidth: 100,
      sortable: true,
      formatter: (params: any) => {
        return params.row.parentId_name;
      },
    },
    {
      field: 'sort',
      title: '排序值',
      minWidth: 80,
      sortable: true,
    },
    {
      field: 'isLeaf',
      width: 90,
      sortable: true,
      title: '叶子节点',
      formatter: ({ cellValue }: any) => {
        return cellValue ? '是' : '否';
      },
    },
    {
      field: 'isHidden',
      width: 90,
      sortable: true,
      title: '是否隐藏',
      formatter: ({ cellValue }: any) => {
        return cellValue ? '是' : '否';
      },
    },
    {
      field: 'isSystem',
      width: 90,
      sortable: true,
      title: '系统预置',
      formatter: ({ cellValue }: any) => {
        return cellValue ? '是' : '否';
      },
    },
    {
      field: 'isActive',
      width: 90,
      sortable: true,
      title: '是否有效',
      formatter: ({ cellValue }: any) => {
        return cellValue ? '是' : '否';
      },
    },
    {
      field: 'remark',
      title: '备注',
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
      width: 180,
      title: '操作',
    },
  ];

  return {
    proxyConfig: {
      autoLoad: true,
    },
    radioConfig: {
      highlight: true,
      trigger: 'row',
    },
    columns,
  };
};

import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'templateType_name',
      width: 140,
      title: '模板类型',
      sortable: true,
    },
    {
      field: 'name',
      minWidth: 100,
      title: '名称',
      sortable: true,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: '备注',
      sortable: true,
    },

    {
      field: 'isActive',
      width: 100,
      sortable: true,
      title: '是否启用',
      formatter: ({ cellValue }: any) => {
        return cellValue === 'Y' ? '是' : '否';
      },
    },

    {
      field: 'createTime',
      width: 140,
      title: '创建时间',
      sortable: true,
    },
    {
      field: 'updateTime',
      width: 140,
      title: '更新时间',
      sortable: true,
    },
    // "id"
    // "创建人"
    // "修改人"
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

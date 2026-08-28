import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      title: '路由名称',
      field: 'routeName',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '路由ID',
      field: 'routeId',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '断言',
      field: 'predicates',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '过滤器',
      field: 'filters',
      minWidth: 100,
      sortable: true,
    },
    {
      title: 'uri',
      field: 'uri',
      minWidth: 100,
      sortable: true,
    },
    {
      title: '排序',
      field: 'sort',
      minWidth: 100,
      sortable: true,
    },
    {
      field: 'isActive',
      width: 100,
      sortable: true,
      title: '是否有效',
      formatter: ({ cellValue }: any) => {
        return cellValue ? '是' : '否';
      },
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

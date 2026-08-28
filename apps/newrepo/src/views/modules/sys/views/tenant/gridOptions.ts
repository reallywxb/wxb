import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const useGridOptions = (): CrudGridOptions<deptDto> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'code', minWidth: 100, title: '租户编码', sortable: true },
    { field: 'name', minWidth: 100, title: '租户名称', sortable: true },
    {
      field: 'isActive',
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
      minWidth: 100,
      title: '是否启用',
      sortable: true,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: '备注',
    },
    {
      align: 'center',
      field: 'action',
      fixed: 'right',
      minWidth: 140,
      title: '操作',
      slots: { default: 'action' },
    },
  ];

  return {
    proxyConfig: {
      autoLoad: true,
    },
    columns,
    // proxyConfig: {
    //   ajax: {
    //     query: async ({ page }, formValues) => {
    //       const res = await dataTableProcess('md.whUser/page', {
    //         current: page.currentPage,
    //         size: page.pageSize,
    //         orgId: userStore.userInfo?.orgId,
    //         ...formValues,
    //       });
    //       return {
    //         total: res.total,
    //         items: res.records,
    //       };
    //     },
    //   },
    // },
  };
};

import type { CrudGridOptions } from '#/types/common';
import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const useGridOptions = (): CrudGridOptions<deptDto> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'code', minWidth: 100, title: '编码', sortable: true },
    { field: 'name', minWidth: 100, title: '名称', sortable: true },
    { field: 'fullName', minWidth: 150, title: '全称', sortable: true },
    {
      field: 'type_name',
      minWidth: 90,
      title: '机构类型',
      sortable: true,
      // formatter: ({ cellValue }: any) => {
      //   return cellValue ? sexMap[cellValue] : '';
      // },
    },
    { field: 'contact', minWidth: 80, title: '联系人', sortable: true },
    { field: 'phone', minWidth: 100, title: '联系电话', sortable: true },
    { field: 'fax', minWidth: 100, title: '传真', sortable: true },
    { field: 'email', minWidth: 100, title: '邮件地址', sortable: true },
    { field: 'zipCode', minWidth: 100, title: '邮编', sortable: true },
    { field: 'address', minWidth: 100, title: '联系地址', sortable: true },
    {
      field: 'parentId_name',
      minWidth: 100,
      title: '上级机构',
      sortable: true,
    },
    { field: 'hierachy', minWidth: 60, title: '层级', sortable: true },
    { field: 'value', minWidth: 100, title: '搜索码', sortable: true },
    {
      field: 'isActive',
      minWidth: 100,
      title: '是否有效',
      formatter: ({ cellValue }: any) => {
        return cellValue ? '是' : '否';
      },
      sortable: true,
    },
    { field: 'remark', minWidth: 100, title: '备注', sortable: true },
    {
      align: 'center',
      slots: {
        default: 'action',
      },
      field: 'action',
      fixed: 'right',
      width: 80,
      title: '操作',
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

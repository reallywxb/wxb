import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const useGridOptions = (): CrudGridOptions<deptDto> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { type: 'radio', visible: false },
    { field: 'name', minWidth: 100, title: '员工姓名', sortable: true },
    { field: 'deptId_name', minWidth: 100, title: '所属部门', sortable: true },
    { field: 'username', minWidth: 100, title: '登录名', sortable: true },
    { field: 'code', minWidth: 100, title: '用户编码', sortable: true },
    {
      field: 'sex_name',
      minWidth: 100,
      title: '性别',
      sortable: true,
    },
    { field: 'mobile', minWidth: 100, title: '联系电话', sortable: true },
    {
      field: 'isLocked',
      minWidth: 100,
      title: '是否冻结',
      formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
      sortable: true,
    },
    { field: 'lockTime', minWidth: 100, title: '冻结时间', sortable: true },
    {
      field: 'isActive',
      formatter: ({ cellValue }: any) => (cellValue ? '启用' : '停用'),
      minWidth: 100,
      title: '状态',
      sortable: true,
    },
    {
      field: 'loginFailCount',
      width: 120,
      title: '登录失败次数',
      sortable: true,
    },
    {
      align: 'center',
      // cellRender: {
      //   attrs: {
      //     nameField: 'name',
      //     onClick: onActionClick,
      //   },
      //   name: 'CellMenu',
      //   options: [
      //     { code: 'view', text: '权限查看' },
      //     'edit',
      //     { text: '管理配置', code: 'mgntConfig' },
      //     { text: '重置密码', code: 'resetPassword' },
      //   ],
      // },
      slots: {
        default: 'action',
      },
      field: 'action',
      fixed: 'right',
      width: 140,
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

export const useSubGridOptions = (): CrudGridOptions<deptDto> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'roleId_name', minWidth: 100, title: '角色', sortable: true },
    {
      field: 'action',
      fixed: 'right',
      slots: {
        default: 'action',
      },
      width: 140,
      title: '操作',
    },
  ];

  return {
    columns,
  };
};

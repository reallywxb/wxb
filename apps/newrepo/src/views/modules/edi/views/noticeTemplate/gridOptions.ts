import type { CrudColsType } from '#/types/datatable/useChcCrud';
import type { CrudGridOptions } from '#/views/modules/sys/views/types';

export const usePrimaryGridOptions = (): CrudGridOptions<any> => {
  const columns: CrudColsType = [
    { fixed: 'left', title: '序号', type: 'seq', width: 50, align: 'center' },
    { field: 'siteId', minWidth: 100, title: '站点', sortable: true },
    {
      field: 'noticeType_name',
      minWidth: 100,
      title: '通知类型',
      sortable: true,
    },
    { field: 'name', minWidth: 100, title: '名称', sortable: true },
    {
      field: 'title',
      minWidth: 100,
      title: '标题模板',
      sortable: true,
    },
    {
      field: 'content',
      minWidth: 100,
      title: '内容模板',
      sortable: true,
    },

    {
      field: 'templateId',
      minWidth: 100,
      title: '模板id',
      sortable: true,
    },
    {
      field: 'templateNo',
      minWidth: 100,
      title: '模板编号',
      sortable: true,
    },
    {
      field: 'isActive',
      width: 100,
      sortable: true,
      title: '是否有效',
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
  };
};

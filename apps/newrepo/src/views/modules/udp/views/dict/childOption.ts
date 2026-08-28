import { useAccess } from '@vben/access'; // 权限相关的hook

import { $t } from '#/locales'; // 多语言

const { hasAccessByCodes } = useAccess(); // 用于添加权限判断

export const formOptions: any = {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '字典',
      fieldName: 'dictId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.dict',
        };
      },
      rules: 'required',
    },
    {
      label: '值',
      fieldName: 'value',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '编码',
      fieldName: 'code',
      component: 'Input',
    },
    {
      label: '常量名',
      fieldName: 'identity',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '名称',
      fieldName: 'name',
      component: 'Input',
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      label: '父项值',
      fieldName: 'parentValue',
      component: 'Input',
    },
    {
      label: '序号',
      fieldName: 'sort',
      component: 'Input',
      rules: 'required',
      defaultValue: 0,
    },
    {
      label: '是否有效',
      fieldName: 'isActive',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: true,
      rules: 'required',
    },
    {
      label: '备注',
      fieldName: 'remark',
      component: 'Input',
      formItemClass: 'col-span-2',
    },
    {
      label: '创建人',
      fieldName: 'createdBy',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.user',
        };
      },
      hidden: true,
    },
    {
      label: '创建时间',
      fieldName: 'createTime',
      component: 'Input',
      hidden: true,
    },
    {
      label: '修改人',
      fieldName: 'updatedBy',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.user',
        };
      },
      hidden: true,
    },
    {
      label: '修改时间',
      fieldName: 'updateTime',
      component: 'Input',
      hidden: true,
    },
    {
      label: '租户',
      fieldName: 'tenantId',
      component: 'Input',
      defaultValue: 0,
      rules: 'required',
      hidden: true,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
};

const useGridOptions: any = function (
  handleAction: any,
  parentTableParams: any,
) {
  return {
    gridColumns: [
      {
        fixed: 'left',
        title: '选择',
        type: 'radio',
        width: 50,
        visible: false,
      },
      { field: 'index', fixed: 'left', title: '序号', type: 'seq', width: 50 },
      {
        title: '名称',
        field: 'name',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: 'ID',
        field: 'id',
        sortable: true,
        minWidth: 60,
        width: 100,
        visible: false,
      },
      {
        title: '字典',
        field: 'dictId',
        formatter: (params: any) => {
          return params.row.dictId_name;
        },
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '值',
        field: 'value',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '编码',
        field: 'code',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '是否有效',
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '常量名',
        field: 'identity',
        sortable: true,
        minWidth: 60,
        width: 90,
      },
      {
        title: '备注',
        field: 'remark',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '创建人',
        field: 'createdBy',
        formatter: (params: any) => {
          return params.row.createdBy_name;
        },
        sortable: true,
        minWidth: 60,
        width: 90,
        visible: false,
      },
      {
        title: '父项值',
        field: 'parentValue',
        sortable: true,
        minWidth: 60,
        width: 90,
      },
      {
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 60,
        width: 120,
        visible: false,
      },
      {
        title: '序号',
        field: 'sort',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '修改人',
        field: 'updatedBy',
        formatter: (params: any) => {
          return params.row.updatedBy_name;
        },
        sortable: true,
        minWidth: 60,
        width: 90,
      },
      {
        title: '修改时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        align: 'center',
        cellRender: {
          attrs: {
            onClick: ({ code, row }: OnActionClickParams) => {
              handleAction(code)(row);
            },
          },
          name: 'CustomCellMenu',
          options: [
            'view',
            {
              code: 'edit',
              show: () => {
                return hasAccessByCodes(['udp.dictItem.edit']);
              },
              text: '编辑',
            },
            {
              code: 'delete',
              show: () => {
                return hasAccessByCodes(['udp.dictItem.delete']);
              },
              text: '删除',
            },
          ],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 256,
      },
    ],
    formSchema: [
      {
        label: '值',
        fieldName: 'value',
        component: 'Input',
      },
      {
        label: '编码',
        fieldName: 'code',
        component: 'Input',
      },
      {
        label: '名称',
        fieldName: 'name',
        component: 'Input',
      },
    ],
    id: 'udp.dictItem',
    dataTableId: 'udp.dictItem',
    showToolbar: true,
    commonFormOptions: formOptions,
    showCellMenuIconBtn: false,
    showAddBtn: true,
    showCustomBtn: true,
    showExportBtn: true,
    showLogBtn: true,
    showRefreshBtn: true,
    showRadioRowTag: true,
    parentTableParams: parentTableParams ? parentTableParams.value : undefined,
  };
};
export { useGridOptions };

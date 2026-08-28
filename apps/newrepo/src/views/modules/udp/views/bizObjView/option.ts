import type { SchemaColumnAndOptions } from '@vben/chc-ui';

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
      label: '业务对象',
      fieldName: 'bizObjId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.bizObj',
        };
      },
      rules: 'required',
    },
    {
      label: '编码',
      fieldName: 'code',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '名称',
      fieldName: 'name',
      component: 'Input',
      rules: 'required',
    },
    {
      label: 'FROM语句',
      fieldName: 'fromClause',
      component: 'Input',
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      label: 'WHERE条件',
      fieldName: 'whereClause',
      component: 'Input',
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      label: '分组语句',
      fieldName: 'groupByClause',
      component: 'Input',
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      label: '排序语句',
      fieldName: 'orderByClause',
      component: 'Input',
      formItemClass: 'col-span-2',
      rules: 'required',
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

const useGridOptions: (
  handleAction: any,
  parentTableParams?: any,
) => SchemaColumnAndOptions = function (
  handleAction: any,
  parentTableParams: any
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
      },
      {
        title: 'ID',
        field: 'id',
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '业务对象',
        field: 'bizObjId',
        formatter: (params: any) => {
          return params.row.bizObjId_name;
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: '编码',
        field: 'code',
        sortable: true,
        minWidth: 60,
      },
      {
        title: '是否有效',
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: 'FROM语句',
        field: 'fromClause',
        sortable: true,
        minWidth: 60,
      },
      {
        title: '备注',
        field: 'remark',
        sortable: true,
        minWidth: 60,
      },
      {
        title: 'WHERE条件',
        field: 'whereClause',
        sortable: true,
        minWidth: 60,
      },
      {
        title: '创建人',
        field: 'createdBy',
        formatter: (params: any) => {
          return params.row.createdBy_name;
        },
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '分组语句',
        field: 'groupByClause',
        sortable: true,
        minWidth: 60,
      },
      {
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '排序语句',
        field: 'orderByClause',
        sortable: true,
        minWidth: 60,
      },
      {
        title: '修改人',
        field: 'updatedBy',
        formatter: (params: any) => {
          return params.row.updatedBy_name;
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: '修改时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 60,
      },
      {
        align: 'center',
        cellRender: {
          attrs: {
            onClick: ({ code, row }: OnActionClickParams)=> {
              handleAction(code)(row);
            },
          },
          name: 'CustomCellMenu',
          options: [
            'view',
            {
              code: 'edit',
              show: () => {
                return hasAccessByCodes(['udp.bizObjView.edit']);
              },
              text: '编辑',
            },
            {
              code: 'delete',
              show: () => {
                return hasAccessByCodes(['udp.bizObjView.delete']);
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
        label: '编码',
        fieldName: 'code',
        component: 'Input',
      },
      {
        label: '名称',
        fieldName: 'name',
        component: 'Input',
      },
      {
        label: '是否有效',
        fieldName: 'isActive',
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
              value: 'false',
            },
          ],
          placeholder: '请选择',
        },
      },
    ],
    id: 'udp.bizObjView',
    dataTableId: 'udp.bizObjView',
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

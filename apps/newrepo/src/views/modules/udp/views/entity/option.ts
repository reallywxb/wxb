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
      label: '产品组',
      fieldName: 'productSuitId',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '模块',
      fieldName: 'moduleId',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '物理表名',
      fieldName: 'tableName',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '实体名称',
      fieldName: 'name',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '实体类名',
      fieldName: 'className',
      component: 'Input',
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      label: '实体编码',
      fieldName: 'code',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '租户属性',
      fieldName: 'tenantProperty',
      component: 'Input',
    },
    {
      label: '机构属性',
      fieldName: 'orgProperty',
      component: 'Input',
    },
    {
      label: '创建人属性',
      fieldName: 'createByProperty',
      component: 'Input',
    },
    {
      label: '创建时间属性',
      fieldName: 'createTimeProperty',
      component: 'Input',
    },
    {
      label: '更新人属性',
      fieldName: 'updateByProperty',
      component: 'Input',
    },
    {
      label: '更新时间属性',
      fieldName: 'updateTimeProperty',
      component: 'Input',
    },
    {
      label: '是否有效属性',
      fieldName: 'isActiveProperty',
      component: 'Input',
    },
    {
      label: '是否树',
      fieldName: 'isTreee',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '父节点属性',
      fieldName: 'parentIdProperty',
      component: 'Input',
    },
    {
      label: '树路径属性',
      fieldName: 'treePathProperty',
      component: 'Input',
    },
    {
      label: '叶节点属性',
      fieldName: 'isLeafProperty',
      component: 'Input',
    },
    {
      label: '序号属性',
      fieldName: 'sortProperty',
      component: 'Input',
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
      label: '参考ID属性',
      fieldName: 'refId',
      component: 'Input',
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
        title: 'ID',
        field: 'id',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '产品组',
        field: 'productSuitId',
        sortable: true,
        minWidth: 60,
        width: 90,
      },
      {
        title: '模块',
        field: 'moduleId',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '物理表名',
        field: 'tableName',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '实体名称',
        field: 'name',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '实体类名',
        field: 'className',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '实体编码',
        field: 'code',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '租户属性',
        field: 'tenantProperty',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '机构属性',
        field: 'orgProperty',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '创建人属性',
        field: 'createByProperty',
        sortable: true,
        minWidth: 60,
        width: 150,
      },
      {
        title: '创建时间属性',
        field: 'createTimeProperty',
        sortable: true,
        minWidth: 60,
        width: 180,
      },
      {
        title: '更新人属性',
        field: 'updateByProperty',
        sortable: true,
        minWidth: 60,
        width: 150,
      },
      {
        title: '更新时间属性',
        field: 'updateTimeProperty',
        sortable: true,
        minWidth: 60,
        width: 180,
      },
      {
        title: '是否有效属性',
        field: 'isActiveProperty',
        sortable: true,
        minWidth: 60,
        width: 180,
      },
      {
        title: '是否树',
        field: 'isTreee',
        formatter: (params: any) => {
          return params.row.isTreee ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 90,
      },
      {
        title: '父节点属性',
        field: 'parentIdProperty',
        sortable: true,
        minWidth: 60,
        width: 150,
      },
      {
        title: '树路径属性',
        field: 'treePathProperty',
        sortable: true,
        minWidth: 60,
        width: 150,
      },
      {
        title: '叶节点属性',
        field: 'isLeafProperty',
        sortable: true,
        minWidth: 60,
        width: 150,
      },
      {
        title: '序号属性',
        field: 'sortProperty',
        sortable: true,
        minWidth: 60,
        width: 120,
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
        title: '参考ID属性',
        field: 'refId',
        sortable: true,
        minWidth: 60,
        width: 140,
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
      },
      {
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 60,
        width: 120,
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
                return hasAccessByCodes(['udp.entity.edit']);
              },
              text: '编辑',
            },
            {
              code: 'delete',
              show: () => {
                return hasAccessByCodes(['udp.entity.delete']);
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
        label: '产品组',
        fieldName: 'productSuitId',
        component: 'Input',
      },
      {
        label: '模块',
        fieldName: 'moduleId',
        component: 'Input',
      },
      {
        label: '物理表名',
        fieldName: 'tableName',
        component: 'Input',
      },
      {
        label: '实体名称',
        fieldName: 'name',
        component: 'Input',
      },
      {
        label: '实体编码',
        fieldName: 'code',
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
    id: 'udp.entity',
    dataTableId: 'udp.entity',
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

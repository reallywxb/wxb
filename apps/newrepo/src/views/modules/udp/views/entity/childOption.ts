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
      label: '实体',
      fieldName: 'entityId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.entity',
        };
      },
      rules: 'required',
    },
    {
      label: '物理列名',
      fieldName: 'columnName',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '属性名',
      fieldName: 'property',
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
      label: '数据类型',
      fieldName: 'dataType',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/udp.dataType',
        };
      },
      rules: 'required',
    },
    {
      label: '最大长度',
      fieldName: 'length',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '数字精度',
      fieldName: 'scale',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '默认值',
      fieldName: 'defaultValue',
      component: 'Input',
    },
    {
      label: '是否必填',
      fieldName: 'isMandatory',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '是否关键字',
      fieldName: 'isKey',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '是否主键',
      fieldName: 'isIdentity',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '主键生成策略',
      fieldName: 'identityStrategy',
      component: 'Input',
    },
    {
      label: '引用类型',
      fieldName: 'referenceType',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/udp.referenceType',
        };
      },
    },
    {
      label: '引用字典',
      fieldName: 'referenceDictId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl:
            '/datatable/getDict/entity:udp.dict?dictType={{referenceType}}',
        };
      },
      dependencies: {
        disabled(values) {
          return !(
            values.referenceType === 'list' || values.referenceType === 'custom'
          );
        },
        triggerFields: ['referenceType'],
      },
    },
    {
      label: '引用实体',
      fieldName: 'referenceEntityId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.entity',
        };
      },
      dependencies: {
        disabled(values) {
          return !(values.referenceType === 'table');
        },
        triggerFields: ['referenceType'],
      },
    },
    {
      label: '引用实体字段',
      fieldName: 'referenceEntityFieldId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl:
            '/datatable/getDict/entity:udp.entityField?entityId={{referenceEntityId}}',
        };
      },
      dependencies: {
        disabled(values) {
          return !(values.referenceType === 'table');
        },
        triggerFields: ['referenceType', 'referenceEntityId'],
      },
    },
    {
      label: '是否多选',
      fieldName: 'isMultiple',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
      dependencies: {
        disabled(values) {
          return !values.referenceType;
        },
        triggerFields: ['referenceType'],
      },
    },
    {
      label: '是否版本字段',
      fieldName: 'isVersion',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '是否记录日志',
      fieldName: 'isChangeLog',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '引用显示序号',
      fieldName: 'displayIndex',
      component: 'Input',
    },
    {
      label: '参考ID',
      fieldName: 'refId',
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
        visible: false,
      },
      {
        title: '实体',
        field: 'entityId',
        formatter: (params: any) => {
          return params.row.entityId_name;
        },
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '物理列名',
        field: 'columnName',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '属性名',
        field: 'property',
        sortable: true,
        minWidth: 60,
        width: 90,
      },
      {
        title: '名称',
        field: 'name',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '数据类型',
        field: 'dataType',
        formatter: (params: any) => {
          return params.row.dataType_name;
        },
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '最大长度',
        field: 'length',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '数字精度',
        field: 'scale',
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '默认值',
        field: 'defaultValue',
        sortable: true,
        minWidth: 60,
        width: 90,
      },
      {
        title: '是否必填',
        field: 'isMandatory',
        formatter: (params: any) => {
          return params.row.isMandatory ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '是否关键字',
        field: 'isKey',
        formatter: (params: any) => {
          return params.row.isKey ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 150,
      },
      {
        title: '是否主键',
        field: 'isIdentity',
        formatter: (params: any) => {
          return params.row.isIdentity ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '主键生成策略',
        field: 'identityStrategy',
        sortable: true,
        minWidth: 60,
        width: 180,
      },
      {
        title: '引用类型',
        field: 'referenceType',
        formatter: (params: any) => {
          return params.row.referenceType_name;
        },
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '引用字典',
        field: 'referenceDictId',
        formatter: (params: any) => {
          return params.row.referenceDictId_name;
        },
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '引用实体',
        field: 'referenceEntityId',
        formatter: (params: any) => {
          return params.row.referenceEntityId_name;
        },
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '引用实体字段',
        field: 'referenceEntityFieldId',
        formatter: (params: any) => {
          return params.row.referenceEntityFieldId_name;
        },
        sortable: true,
        minWidth: 60,
        width: 180,
      },
      {
        title: '是否多选',
        field: 'isMultiple',
        formatter: (params: any) => {
          return params.row.isMultiple ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 120,
      },
      {
        title: '是否版本字段',
        field: 'isVersion',
        formatter: (params: any) => {
          return params.row.isVersion ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 180,
      },
      {
        title: '是否记录日志',
        field: 'isChangeLog',
        formatter: (params: any) => {
          return params.row.isChangeLog ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 180,
      },
      {
        title: '引用显示序号',
        field: 'displayIndex',
        sortable: true,
        minWidth: 60,
        width: 180,
      },
      {
        title: '参考ID',
        field: 'refId',
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
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 60,
        width: 120,
        visible: false,
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
        visible: false,
      },
      {
        title: '修改时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 60,
        width: 120,
        visible: false,
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
                return hasAccessByCodes(['udp.entityField.edit']);
              },
              text: '编辑',
            },
            {
              code: 'delete',
              show: () => {
                return hasAccessByCodes(['udp.entityField.delete']);
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
    formSchema: [],
    id: 'udp.entityField',
    dataTableId: 'udp.entityField',
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

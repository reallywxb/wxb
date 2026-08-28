import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import { $t } from '#/locales'; // 多语言

export const BizObjFieldFormOptions: any = {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '业务模型',
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
      label: '列语句',
      fieldName: 'columnSql',
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
      label: '是否主键',
      fieldName: 'isKey',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
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
      fieldName: 'maxLength',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '最小长度',
      fieldName: 'minLength',
      component: 'Input',
    },
    {
      label: '数字精度',
      fieldName: 'scale',
      component: 'Input',
    },
    {
      label: '最大值',
      fieldName: 'maxValue',
      component: 'Input',
    },
    {
      label: '最小值',
      fieldName: 'minValue',
      component: 'Input',
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
      label: '是否多选',
      fieldName: 'isMultiple',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '是否多选查询',
      fieldName: 'isFilterMultiple',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '是否范围查询',
      fieldName: 'isFilterRange',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '查询SQL',
      fieldName: 'filterSql',
      component: 'Input',
      formItemClass: 'col-span-2',
    },
    {
      label: '字典编码',
      fieldName: 'dictId',
      component: 'Input',
    },
    {
      label: '字典地址',
      fieldName: 'dictUrl',
      component: 'Input',
    },
    {
      label: '是否允许排序',
      fieldName: 'isSortable',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: true,
      rules: 'required',
    },
    {
      label: '是否虚拟字段',
      fieldName: 'isVirtual',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '是否子实体',
      fieldName: 'isChild',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '子实体',
      fieldName: 'childEntityId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.entity',
        };
      },
      dependencies: {
        disabled(values) {
          return !values.isChild;
        },
        triggerFields: ['isChild'],
      },
    },
    {
      label: '子实体值字段',
      fieldName: 'childValueFieldId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.entityField',
        };
      },
      dependencies: {
        disabled(values) {
          return !values.isChild;
        },
        triggerFields: ['isChild'],
      },
    },
    {
      label: '子实体链接字段',
      fieldName: 'childLinkFieldId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.entityField',
        };
      },
      dependencies: {
        disabled(values) {
          return !values.isChild;
        },
        triggerFields: ['isChild'],
      },
    },
    {
      label: '子实体条件',
      fieldName: 'childCondition',
      component: 'Input',
      formItemClass: 'col-span-2',
      dependencies: {
        disabled(values) {
          return !values.isChild;
        },
        triggerFields: ['isChild'],
      },
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
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
        };
      },
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
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
        };
      },
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

const useBizObjFieldGridOptions: (
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
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '业务模型',
        field: 'bizObjId',
        formatter: (params: any) => {
          return params.row.bizObjId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '列语句',
        field: 'columnSql',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '属性名',
        field: 'property',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '名称',
        field: 'name',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否主键',
        field: 'isKey',
        formatter: (params: any) => {
          return params.row.isKey ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '数据类型',
        field: 'dataType',
        formatter: (params: any) => {
          return params.row.dataType_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '最大长度',
        field: 'maxLength',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '最小长度',
        field: 'minLength',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '数字精度',
        field: 'scale',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '最大值',
        field: 'maxValue',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '最小值',
        field: 'minValue',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '默认值',
        field: 'defaultValue',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否必填',
        field: 'isMandatory',
        formatter: (params: any) => {
          return params.row.isMandatory ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否版本字段',
        field: 'isVersion',
        formatter: (params: any) => {
          return params.row.isVersion ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '是否多选',
        field: 'isMultiple',
        formatter: (params: any) => {
          return params.row.isMultiple ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '是否多选查询',
        field: 'isFilterMultiple',
        formatter: (params: any) => {
          return params.row.isFilterMultiple ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否范围查询',
        field: 'isFilterRange',
        formatter: (params: any) => {
          return params.row.isFilterRange ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '查询SQL',
        field: 'filterSql',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '字典编码',
        field: 'dictId',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '字典地址',
        field: 'dictUrl',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否运行排序',
        field: 'isSortable',
        formatter: (params: any) => {
          return params.row.isSortable ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否虚拟字段',
        field: 'isVirtual',
        formatter: (params: any) => {
          return params.row.isVirtual ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '是否子实体',
        field: 'isChild',
        formatter: (params: any) => {
          return params.row.isChild ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '子实体',
        field: 'childEntityId',
        formatter: (params: any) => {
          return params.row.childEntityId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 130,
      },
      {
        title: '子实体值字段',
        field: 'childValueFieldId',
        formatter: (params: any) => {
          return params.row.childValueFieldId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '子实体链接字段',
        field: 'childLinkFieldId',
        formatter: (params: any) => {
          return params.row.childLinkFieldId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '子实体条件',
        field: 'childCondition',
        sortable: true,
        minWidth: 30,
        width: 100,
      },
      {
        title: '是否有效',
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '备注',
        field: 'remark',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '创建人',
        field: 'createdBy',
        formatter: (params: any) => {
          return params.row.createdBy_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '修改人',
        field: 'updatedBy',
        formatter: (params: any) => {
          return params.row.updatedBy_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '修改时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '租户',
        field: 'tenantId',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        align: 'center',
        cellRender: {
          name: 'CustomCellMenu',
          options: ['view', 'edit', 'delete', 'log'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [],
    id: 'udp.bizObjField',
    dataTableId: 'udp.bizObjField',
    showToolbar: true,
    commonFormOptions: BizObjFieldFormOptions,
    showCellMenuIconBtn: true,
    showAddBtn: true,
    showCustomBtn: true,
    showExportBtn: true,
    showLogBtn: true,
    showRefreshBtn: true,
    showRadioRowTag: true,
    parentTableParams: parentTableParams ? parentTableParams.value : undefined,
  };
};

export { useBizObjFieldGridOptions };

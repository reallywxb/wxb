import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import type { VbenFormProps } from '#/adapter/form';

import { $t } from '#/locales'; // 多语言

export const commonFormOptions: VbenFormProps = {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      dependencies: {
        triggerFields: ['productSuitId'],
        show: false,
      },
      // hidden: true,
    },
    {
      label: '产品组',
      fieldName: 'productSuitId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.productSuit',
        };
      },
      rules: 'required',
    },
    {
      label: '数据库连接',
      fieldName: 'datasourceId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.datasource',
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
      label: '包名',
      fieldName: 'packageName',
      component: 'Input',
      formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      label: 'git地址',
      fieldName: 'gitUrl',
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
      dependencies: {
        triggerFields: ['productSuitId'],
        show: false,
      },
      // hidden: true,
    },
    {
      label: '创建时间',
      fieldName: 'createTime',
      component: 'Input',
      dependencies: {
        triggerFields: ['productSuitId'],
        show: false,
      },
      // hidden: true,
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
      dependencies: {
        triggerFields: ['productSuitId'],
        show: false,
      },
      // hidden: true,
    },
    {
      label: '修改时间',
      fieldName: 'updateTime',
      component: 'Input',
      dependencies: {
        triggerFields: ['productSuitId'],
        show: false,
      },
      // hidden: true,
    },
    {
      label: '租户',
      fieldName: 'tenantId',
      component: 'Input',
      defaultValue: 0,
      rules: 'required',
      dependencies: {
        triggerFields: ['productSuitId'],
        show: false,
      },
      // hidden: true,
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
  parentTableParams: any,
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
        title: '产品组',
        field: 'productSuitId',
        formatter: (params: any) => {
          return params.row.productSuitId_name;
        },
        sortable: true,
        minWidth: 60,
        width: 90,
      },
      {
        title: '数据库连接',
        field: 'datasourceId',
        formatter: (params: any) => {
          return params.row.datasourceId_name;
        },
        sortable: true,
        minWidth: 60,
        width: 150,
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
        title: '备注',
        field: 'remark',
        sortable: true,
        minWidth: 60,
        width: 100,
      },
      {
        title: '包名',
        field: 'packageName',
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
        title: 'git地址',
        field: 'gitUrl',
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
          name: 'CustomCellMenu',
          options: ['view', 'edit', 'delete'],
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
    id: 'udp.module',
    dataTableId: 'udp.module',
    showToolbar: true,
    commonFormOptions,
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

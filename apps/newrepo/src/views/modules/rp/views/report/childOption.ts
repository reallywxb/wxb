import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import { $t } from '#/locales'; // 多语言

export const getReportSettingFormOptions: (
  mode: string
) => any = function (
  mode: string
) {
  return {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '报表',
      fieldName: 'reportId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:rp.report',
        };
      },
      rules: 'required',
    },
    {
      label: '机构',
      fieldName: 'orgId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.org',
        };
      },
      rules: 'required',
    },
    {
      label: '模板',
      fieldName: 'templateId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:rp.template',
        };
      },
      rules: 'required',
    },
    {
      label: '是否启用',
      fieldName: 'isActive',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: true,
      rules: 'required',
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
      label: '更新人',
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
      label: '更新时间',
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
      label: '仓库',
      fieldName: 'param1',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl:
            '/datatable/getDict/entity:material.warehouse?AD_Org_ID={{orgId}}',
        };
      },
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
}

const useReportSettingGridOptions: (
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
        title: 'ID',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '报表',
        field: 'reportId',
        formatter: (params: any) => {
          return params.row.reportId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '机构',
        field: 'orgId',
        formatter: (params: any) => {
          return params.row.orgId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '模板',
        field: 'templateId',
        formatter: (params: any) => {
          return params.row.templateId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否启用',
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
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
        title: '更新人',
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
        title: '更新时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '仓库',
        field: 'param1',
        sortable: true,
        minWidth: 30,
        width: 90,
        dict: true,
        dictId: 'entity:material.warehouse',
        formatter: (params: any) => {
          return params.row.param1_name;
        },
      },
      {
        title: '参数2',
        field: 'param2',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '参数3',
        field: 'param3',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '参数4',
        field: 'param4',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '参数5',
        field: 'param5',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '',
        field: '_fill_',
        minWidth: 1,
      },
      {
        align: 'center',
        cellRender: {
          name: 'CustomCellMenu',
          options: ['view','edit','delete','log'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [
    ],
    id: 'rp.reportSetting',
    dataTableId: 'rp.reportSetting',
    showToolbar: true,
    addFormOptions: getReportSettingFormOptions('add'),
    editFormOptions: getReportSettingFormOptions('edit'),
    viewFormOptions: getReportSettingFormOptions('view'),
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

export const getReportPrinterFormOptions: (
  mode: string
) => any = function (
  mode: string
) {
  return {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '报表',
      fieldName: 'reportId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:rp.report',
        };
      },
      rules: 'required',
    },
    {
      label: '机构',
      fieldName: 'orgId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.org',
        };
      },
      rules: 'required',
    },
    {
      label: '参数1',
      fieldName: 'param1',
      component: 'Input',
    },
    {
      label: '参数2',
      fieldName: 'param2',
      component: 'Input',
    },
    {
      label: '参数3',
      fieldName: 'param3',
      component: 'Input',
    },
    {
      label: '参数4',
      fieldName: 'param4',
      component: 'Input',
    },
    {
      label: '参数5',
      fieldName: 'param5',
      component: 'Input',
    },
    {
      label: '后台打印机',
      fieldName: 'printerId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:rp.printer',
        };
      },
    },
    {
      label: '是否启用',
      fieldName: 'isActive',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: true,
      rules: 'required',
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
      label: '更新人',
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
      label: '更新时间',
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
      label: '自动打印',
      fieldName: 'isAutoPrint',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: true,
      rules: 'required',
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
}

const useReportPrinterGridOptions: (
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
        title: 'ID',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '报表',
        field: 'reportId',
        formatter: (params: any) => {
          return params.row.reportId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '机构',
        field: 'orgId',
        formatter: (params: any) => {
          return params.row.orgId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '参数1',
        field: 'param1',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '参数2',
        field: 'param2',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '参数3',
        field: 'param3',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '参数4',
        field: 'param4',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '参数5',
        field: 'param5',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '后台打印机',
        field: 'printerId',
        formatter: (params: any) => {
          return params.row.printerId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '是否启用',
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
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
        title: '更新人',
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
        title: '更新时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '自动打印',
        field: 'isAutoPrint',
        formatter: (params: any) => {
          return params.row.isAutoPrint ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '',
        field: '_fill_',
        minWidth: 1,
      },
      {
        align: 'center',
        cellRender: {
          name: 'CustomCellMenu',
          options: ['view','edit','delete','log'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [
    ],
    id: 'rp.reportPrinter',
    dataTableId: 'rp.reportPrinter',
    showToolbar: true,
    addFormOptions: getReportPrinterFormOptions('add'),
    editFormOptions: getReportPrinterFormOptions('edit'),
    viewFormOptions: getReportPrinterFormOptions('view'),
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

export const getReportOrgFormOptions: (
  mode: string
) => any = function (
  mode: string
) {
  return {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '报表',
      fieldName: 'reportId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:rp.report',
        };
      },
      rules: 'required',
    },
    {
      label: '机构',
      fieldName: 'orgId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.org',
        };
      },
      rules: 'required',
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
      label: '更新人',
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
      label: '更新时间',
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
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
  };
}

const useReportOrgGridOptions: (
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
        title: 'ID',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '报表',
        field: 'reportId',
        formatter: (params: any) => {
          return params.row.reportId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '机构',
        field: 'orgId',
        formatter: (params: any) => {
          return params.row.orgId_name;
        },
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
        title: '更新人',
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
        title: '更新时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '',
        field: '_fill_',
        minWidth: 1,
      },
      {
        align: 'center',
        cellRender: {
          name: 'CustomCellMenu',
          options: ['view','edit','delete','log'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [
    ],
    id: 'rp.reportOrg',
    dataTableId: 'rp.reportOrg',
    showToolbar: true,
    addFormOptions: getReportOrgFormOptions('add'),
    editFormOptions: getReportOrgFormOptions('edit'),
    viewFormOptions: getReportOrgFormOptions('view'),
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

export const getReportRoleFormOptions: (
  mode: string
) => any = function (
  mode: string
) {
  return {
  schema: [
    {
      label: 'ID',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '报表',
      fieldName: 'reportId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:rp.report',
        };
      },
      rules: 'required',
    },
    {
      label: '机构',
      fieldName: 'orgId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.org',
        };
      },
      rules: 'required',
    },
    {
      label: '角色',
      fieldName: 'roleId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.role',
        };
      },
      rules: 'required',
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
      label: '更新人',
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
      label: '更新时间',
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
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
  };
}

const useReportRoleGridOptions: (
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
        title: 'ID',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '报表',
        field: 'reportId',
        formatter: (params: any) => {
          return params.row.reportId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '机构',
        field: 'orgId',
        formatter: (params: any) => {
          return params.row.orgId_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '角色',
        field: 'roleId',
        formatter: (params: any) => {
          return params.row.roleId_name;
        },
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
        title: '更新人',
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
        title: '更新时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '',
        field: '_fill_',
        minWidth: 1,
      },
      {
        align: 'center',
        cellRender: {
          name: 'CustomCellMenu',
          options: ['view','edit','delete','log'],
        },
        field: 'action',
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: 150,
      },
    ],
    formSchema: [
    ],
    id: 'rp.reportRole',
    dataTableId: 'rp.reportRole',
    showToolbar: true,
    addFormOptions: getReportRoleFormOptions('add'),
    editFormOptions: getReportRoleFormOptions('edit'),
    viewFormOptions: getReportRoleFormOptions('view'),
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

export { useReportSettingGridOptions,useReportPrinterGridOptions,useReportOrgGridOptions,useReportRoleGridOptions };

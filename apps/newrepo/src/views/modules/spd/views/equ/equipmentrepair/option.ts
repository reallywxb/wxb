import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import { $t } from '#/locales'; // 多语言

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
      label: '租户',
      fieldName: 'AD_Client_ID',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.tenant',
        };
      },
      rules: 'required',
      hidden: true,
    },
    {
      label: '组织',
      fieldName: 'AD_Org_ID',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.org',
        };
      },
      rules: 'required',
    },
    {
      label: '服务',
      fieldName: 'AD_Server_ID',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:ad.server',
        };
      },
      rules: 'required',
    },
    {
      label: '维修记录ID',
      fieldName: 'EQU_EquipmentRepair_ID',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '设备',
      fieldName: 'EQU_Equipment_ID',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:equ.equipment',
        };
      },
      rules: 'required',
    },
    {
      label: '创建时间',
      fieldName: 'Created',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss',
        };
      },
      rules: 'required',
      hidden: true,
    },
    {
      label: '创建人',
      fieldName: 'CreatedBy',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/ad.user_110',
        };
      },
      rules: 'required',
      hidden: true,
    },
    {
      label: '是否有效',
      fieldName: 'IsActive',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
      rules: 'required',
    },
    {
      label: '更新时间',
      fieldName: 'Updated',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss',
        };
      },
      rules: 'required',
      hidden: true,
    },
    {
      label: '更新人',
      fieldName: 'UpdatedBy',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/ad.user_110',
        };
      },
      rules: 'required',
      hidden: true,
    },
    {
      label: '版本号',
      fieldName: 'VersionStamp',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '维修单名称',
      fieldName: 'RepairOrderName',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '维修单号',
      fieldName: 'RepairOrderNo',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '报修时间',
      fieldName: 'RepairRequestTime',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss',
        };
      },
    },
    {
      label: '维修开始时间',
      fieldName: 'RepairStartTime',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss',
        };
      },
    },
    {
      label: '维修结束时间',
      fieldName: 'RepairEndTime',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss',
        };
      },
    },
    {
      label: '报修人员',
      fieldName: 'RepairPerson',
      component: 'Input',
    },
    {
      label: '报修科室',
      fieldName: 'RepairDepartment',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
        };
      },
    },
    {
      label: '维修班组',
      fieldName: 'RepairTeam',
      component: 'Input',
    },
    {
      label: '维修人员',
      fieldName: 'RepairStaff',
      component: 'Input',
    },
    {
      label: '维修级别',
      fieldName: 'RepairLevel',
      component: 'Input',
    },
    {
      label: '维修费用',
      fieldName: 'RepairCost',
      component: 'Input',
    },
    {
      label: '工作描述',
      fieldName: 'WorkDescription',
      component: 'Input',
      formItemClass: 'col-span-2',
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
        title: '租户',
        field: 'AD_Client_ID',
        formatter: (params: any) => {
          return params.row.AD_Client_ID_name;
        },
        sortable: true,
        minWidth: 30,
        width: 100,
        visible: false,
      },
      {
        title: '组织',
        field: 'AD_Org_ID',
        formatter: (params: any) => {
          return params.row.AD_Org_ID_name;
        },
        sortable: true,
        minWidth: 30,
        width: 100,
        visible: false,
      },
      {
        title: '服务',
        field: 'AD_Server_ID',
        formatter: (params: any) => {
          return params.row.AD_Server_ID_name;
        },
        sortable: true,
        minWidth: 30,
        width: 100,
        visible: false,
      },
      {
        title: '维修记录ID',
        field: 'EQU_EquipmentRepair_ID',
        sortable: true,
        key: true,
        minWidth: 30,
        width: 140,
        visible: false,
      },
      {
        title: '设备',
        field: 'EQU_Equipment_ID',
        formatter: (params: any) => {
          return params.row.EQU_Equipment_ID_name;
        },
        sortable: true,
        minWidth: 30,
        width: 100,
      },
      {
        title: '创建时间',
        field: 'Created',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '创建人',
        field: 'CreatedBy',
        formatter: (params: any) => {
          return params.row.CreatedBy_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '是否有效',
        field: 'IsActive',
        formatter: (params: any) => {
          return params.row.IsActive ? '是' : '否';
        },
        sortable: true,
        minWidth: 30,
        width: 120,
        visible: false,
      },
      {
        title: '更新时间',
        field: 'Updated',
        sortable: true,
        minWidth: 30,
        width: 120,
        visible: false,
      },
      {
        title: '更新人',
        field: 'UpdatedBy',
        formatter: (params: any) => {
          return params.row.UpdatedBy_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '版本号',
        field: 'VersionStamp',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '维修单名称',
        field: 'RepairOrderName',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '维修单号',
        field: 'RepairOrderNo',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '报修时间',
        field: 'RepairRequestTime',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '维修开始时间',
        field: 'RepairStartTime',
        sortable: true,
        minWidth: 30,
        width: 140,
      },
      {
        title: '维修结束时间',
        field: 'RepairEndTime',
        sortable: true,
        minWidth: 30,
        width: 180,
      },
      {
        title: '报修人员',
        field: 'RepairPerson',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '报修科室',
        field: 'RepairDepartment',
        formatter: (params: any) => {
          return params.row.RepairDepartment_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '维修班组',
        field: 'RepairTeam',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '维修人员',
        field: 'RepairStaff',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '维修级别',
        field: 'RepairLevel',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '维修费用',
        field: 'RepairCost',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '工作描述',
        field: 'WorkDescription',
        sortable: true,
        minWidth: 30,
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
    formSchema: [
      {
        label: '组织',
        fieldName: 'AD_Org_ID',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.org',
          };
        },
      },
      {
        label: '设备',
        fieldName: 'EQU_Equipment_ID',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:equ.equipment',
          };
        },
      },
      {
        label: '创建时间',
        fieldName: 'Created',
        component: 'DateGroup',
        componentProps: () => {
          return {
            showTime: true,
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            format: 'YYYY-MM-DD HH:mm:ss',
          };
        },
      },
      {
        label: '维修单名称',
        fieldName: 'RepairOrderName',
        component: 'Input',
      },
      {
        label: '维修单号',
        fieldName: 'RepairOrderNo',
        component: 'Input',
      },
      {
        label: '报修科室',
        fieldName: 'RepairDepartment',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
          };
        },
      },
      {
        label: '维修人员',
        fieldName: 'RepairStaff',
        component: 'Input',
      },
    ],
    permissions: {
      add: 'spd.web.equ.equipmentrepair.add',
      edit: 'spd.web.equ.equipmentrepair.edit',
      delete: 'spd.web.equ.equipmentrepair.delete',
      view: 'spd.web.equ.equipmentrepair',
      export: 'spd.web.equ.equipmentrepair.export',
    },
    id: 'equ.equipmentrepair',
    dataTableId: 'equ.equipmentrepair',
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

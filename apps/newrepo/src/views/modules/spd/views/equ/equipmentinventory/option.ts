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
      label: '盘点记录ID',
      fieldName: 'EQU_EquipmentInventory_ID',
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
      label: '盘点单名称',
      fieldName: 'InventoryOrderName',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '盘点单号',
      fieldName: 'InventoryOrderNo',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '盘点开始时间',
      fieldName: 'InventoryStartTime',
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
      label: '盘点结束时间',
      fieldName: 'InventoryEndTime',
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
      label: '盘点人员',
      fieldName: 'InventoryPerson',
      component: 'Input',
    },
    {
      label: '盘点方式',
      fieldName: 'InventoryMethod',
      component: 'Input',
    },
    {
      label: '盘点结果',
      fieldName: 'InventoryResult',
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
        title: '盘点记录ID',
        field: 'EQU_EquipmentInventory_ID',
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
        title: '盘点单名称',
        field: 'InventoryOrderName',
        sortable: true,
        minWidth: 30,
        width: 150,
      },
      {
        title: '盘点单号',
        field: 'InventoryOrderNo',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '盘点开始时间',
        field: 'InventoryStartTime',
        sortable: true,
        minWidth: 30,
        width: 180,
      },
      {
        title: '盘点结束时间',
        field: 'InventoryEndTime',
        sortable: true,
        minWidth: 30,
        width: 180,
      },
      {
        title: '盘点人员',
        field: 'InventoryPerson',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '盘点方式',
        field: 'InventoryMethod',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '盘点结果',
        field: 'InventoryResult',
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
        label: '盘点单名称',
        fieldName: 'InventoryOrderName',
        component: 'Input',
      },
      {
        label: '盘点单号',
        fieldName: 'InventoryOrderNo',
        component: 'Input',
      },
    ],
    permissions: {
      add: 'spd.web.equ.equipmentinventory.add',
      edit: 'spd.web.equ.equipmentinventory.edit',
      delete: 'spd.web.equ.equipmentinventory.delete',
      view: 'spd.web.equ.equipmentinventory',
      export: 'spd.web.equ.equipmentinventory.export',
    },
    id: 'equ.equipmentinventory',
    dataTableId: 'equ.equipmentinventory',
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

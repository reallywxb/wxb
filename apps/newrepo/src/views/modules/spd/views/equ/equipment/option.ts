import type { SchemaColumnAndOptions } from '@vben/chc-ui';

// import { useAccess } from '@vben/access'; // 权限相关的hook
import { $t } from '#/locales'; // 多语言

// const { hasAccessByCodes } = useAccess(); // 用于添加权限判断

export const formOptions: any = {
  id: `equipment-${Math.random().toString(36).slice(2)}`,
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
      label: '设备ID',
      fieldName: 'EQU_Equipment_ID',
      component: 'Input',
      rules: 'required',
      hidden: true,
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
      component: 'InputNumber',
      rules: 'required',
    },
    {
      label: '设备编码',
      fieldName: 'EquipmentCode',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '设备类型',
      fieldName: 'EquipmentType',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/list.EquipmentType',
        };
      },
      rules: 'required',
    },
    {
      label: '设备名称',
      fieldName: 'EquipmentName',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '规格',
      fieldName: 'Spec',
      component: 'Input',
    },
    // {
    //   label: '型号',
    //   fieldName: 'Model',
    //   component: 'Input',
    // },
    {
      label: '设备状态',
      fieldName: 'EquipmentStatus',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/list.EquipmentStatus',
        };
      },
      rules: 'required',
    },
    {
      label: '生产企业',
      fieldName: 'Manufacturer',
      component: 'Input',
    },
    {
      label: '品牌',
      fieldName: 'Brand',
      component: 'Input',
    },
    {
      label: '生产日期',
      fieldName: 'ProductionDate',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss',
        };
      },
    },
    // {
    //   label: '设备图片',
    //   fieldName: 'EquipmentImage',
    //   component: 'Input',
    //   formItemClass: 'col-span-2',
    // },
    {
      label: '使用寿命（年）',
      fieldName: 'ServiceLife',
      component: 'Input',
    },
    {
      label: '拼音码',
      fieldName: 'PinyinCode',
      component: 'Input',
    },
    {
      label: '采购订单号',
      fieldName: 'PurchaseOrderNo',
      component: 'Input',
    },
    {
      label: '供应商',
      fieldName: 'Supplier',
      component: 'Input',
    },
    {
      label: '采购部门',
      fieldName: 'PurchaseDepartment',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
          showChooseAll: false,
        };
      },
    },
    {
      label: '采购人',
      fieldName: 'Purchaser',
      component: 'Input',
    },
    {
      label: '需求部门',
      fieldName: 'DemandDepartment',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
          showChooseAll: false,
        };
      },
    },
    {
      label: '需求人',
      fieldName: 'Demander',
      component: 'Input',
    },
    {
      label: '购买价格（元）',
      fieldName: 'PurchasePrice',
      component: 'Input',
    },
    {
      label: '厂家联系方式',
      fieldName: 'ManufacturerContact',
      component: 'Input',
    },
    {
      label: '采购时间',
      fieldName: 'PurchaseDate',
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
      label: '院区',
      fieldName: 'HospitalArea',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
          showChooseAll: false,
        };
      },
    },
    {
      label: '存放部门',
      fieldName: 'StorageDepartment',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
          showChooseAll: false,
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
        title: '设备ID',
        field: 'EQU_Equipment_ID',
        sortable: true,
        key: true,
        minWidth: 30,
        width: 100,
        visible: false,
      },
      {
        title: '创建时间',
        field: 'Created',
        sortable: true,
        minWidth: 30,
        width: 120,
        visible: false,
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
        title: '设备编码',
        field: 'EquipmentCode',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '设备类型',
        field: 'EquipmentType',
        formatter: (params: any) => {
          return params.row.EquipmentType_name;
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '设备名称',
        field: 'EquipmentName',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '规格',
        field: 'Spec',
        sortable: true,
        minWidth: 30,
        width: 70,
      },
      // {
      //   title: '型号',
      //   field: 'Model',
      //   sortable: true,
      //   minWidth: 30,
      //   width: 100,
      //   visible: false,
      // },
      {
        title: '设备状态',
        field: 'EquipmentStatus',
        formatter: (params: any) => {
          return params.row.EquipmentStatus_name;
        },
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '生产企业',
        field: 'Manufacturer',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '品牌',
        field: 'Brand',
        sortable: true,
        minWidth: 30,
        width: 100,
      },
      {
        title: '生产日期',
        field: 'ProductionDate',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      // {
      //   title: '设备图片',
      //   field: 'EquipmentImage',
      //   sortable: true,
      //   minWidth: 30,
      //   width: 120,
      // },
      {
        title: '使用寿命（年）',
        field: 'ServiceLife',
        sortable: true,
        minWidth: 30,
        width: 130,
      },
      {
        title: '拼音码',
        field: 'PinyinCode',
        sortable: true,
        minWidth: 30,
        width: 100,
      },
      {
        title: '采购订单号',
        field: 'PurchaseOrderNo',
        sortable: true,
        minWidth: 30,
        width: 150,
      },
      {
        title: '供应商',
        field: 'Supplier',
        sortable: true,
        minWidth: 30,
        width: 140,
      },
      {
        title: '采购部门',
        field: 'PurchaseDepartment',
        formatter: (params: any) => {
          return params.row.PurchaseDepartment_name;
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '采购人',
        field: 'Purchaser',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '需求部门',
        field: 'DemandDepartment',
        formatter: (params: any) => {
          return params.row.DemandDepartment_name;
        },
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '需求人',
        field: 'Demander',
        sortable: true,
        minWidth: 30,
        width: 90,
      },
      {
        title: '购买价格（元）',
        field: 'PurchasePrice',
        sortable: true,
        minWidth: 30,
        width: 210,
      },
      {
        title: '厂家联系方式',
        field: 'ManufacturerContact',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '采购时间',
        field: 'PurchaseDate',
        sortable: true,
        minWidth: 30,
        width: 120,
      },
      {
        title: '院区',
        field: 'HospitalArea',
        formatter: (params: any) => {
          return params.row.HospitalArea_name;
        },
        sortable: true,
        minWidth: 30,
        width: 100,
      },
      {
        title: '存放部门',
        field: 'StorageDepartment',
        formatter: (params: any) => {
          return params.row.StorageDepartment_name;
        },
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
          options: [
            'view',
            'edit',
            'delete',
            // {
            //   code: 'edit',
            //   show: () => {
            //     return hasAccessByCodes(['spd.web.equ.equipment.edit']);
            //   },
            //   text: '编辑',
            // },
            // {
            //   code: 'delete',
            //   show: () => {
            //     return hasAccessByCodes(['spd.web.equ.equipment.delete']);
            //   },
            //   text: '删除',
            // },
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
        label: '设备类型',
        fieldName: 'EquipmentType',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/list.EquipmentType',
          };
        },
      },
      {
        label: '设备名称',
        fieldName: 'EquipmentName',
        component: 'Input',
      },
      {
        label: '设备状态',
        fieldName: 'EquipmentStatus',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/list.EquipmentStatus',
          };
        },
      },
      {
        label: '采购订单号',
        fieldName: 'PurchaseOrderNo',
        component: 'Input',
      },
      {
        label: '采购部门',
        fieldName: 'PurchaseDepartment',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
          };
        },
      },
      {
        label: '采购人',
        fieldName: 'Purchaser',
        component: 'Input',
      },
      {
        label: '需求部门',
        fieldName: 'DemandDepartment',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
          };
        },
      },
      {
        label: '院区',
        fieldName: 'HospitalArea',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{AD_Org_ID}}',
          };
        },
      },
    ],
    permissions: {
      add: 'spd.web.equ.equipment.add',
      edit: 'spd.web.equ.equipment.edit',
      delete: 'spd.web.equ.equipment.delete',
      view: 'spd.web.equ.equipment',
      export: 'spd.web.equ.equipment.export',
    },
    id: 'equ.equipment',
    dataTableId: 'equ.equipment',
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

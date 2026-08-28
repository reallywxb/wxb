import type { SchemaColumnAndOptions } from '@vben/chc-ui';

// import { useAccess } from '@vben/access'; // 权限相关的hook
import { $t } from '#/locales'; // 多语言

// const { hasAccessByCodes } = useAccess(); // 用于添加权限判断

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
      label: '集团',
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
      label: '机构',
      fieldName: 'AD_Org_ID',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.org',
        };
      },
      hidden: true,
      // rules: 'required',
    },
    {
      label: '组套名称',
      fieldName: 'Name',
      component: 'Input',
      // formItemClass: 'col-span-2',
      rules: 'required',
    },
    {
      label: '站点',
      fieldName: 'AD_Server_ID',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:ad.server',
        };
      },
      hidden: true,
    },
    {
      label: '供应商',
      fieldName: 'C_BPartner_ID',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:core.bpartner',
          showChooseAll: false,
        };
      },
    },
    {
      label: '创建时间',
      fieldName: 'Created',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
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
      label: '备注',
      fieldName: 'Description',
      component: 'Input',
      formItemClass: 'col-span-2',
    },

    {
      label: 'M_Surgical_Set_ID',
      fieldName: 'M_Surgical_Set_ID',
      component: 'Input',
      rules: 'required',
      hidden: true,
    },
    {
      label: '更新时间',
      fieldName: 'Updated',
      component: 'DatePicker',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
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
      label: '搜索码',
      fieldName: 'Value',
      component: 'Input',
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
        title: '集团',
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
        title: '机构',
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
        title: '站点',
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
        title: '供应商',
        field: 'C_BPartner_ID',
        formatter: (params: any) => {
          return params.row.C_BPartner_ID_name;
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
        title: '描述',
        field: 'Description',
        sortable: true,
        minWidth: 30,
        width: 100,
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
      },
      {
        title: 'M_Surgical_Set_ID',
        field: 'M_Surgical_Set_ID',
        sortable: true,
        minWidth: 30,
        width: 170,
        visible: false,
        key: true,
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
        title: '搜索码',
        field: 'Value',
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '名称',
        field: 'Name',
        sortable: true,
        minWidth: 30,
        width: 100,
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
            //     return hasAccessByCodes(['material.surgicalSet.edit']);
            //   },
            //   text: '编辑',
            // },
            // {
            //   code: 'delete',
            //   show: () => {
            //     return hasAccessByCodes(['material.surgicalSet.delete']);
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
        label: '供应商',
        fieldName: 'C_BPartner_ID',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:core.bpartner',
          };
        },
      },
      {
        label: '名称',
        fieldName: 'Name',
        component: 'Input',
      },
    ],
    permissions: {
      add: 'material.surgicalSet.add',
      edit: 'material.surgicalSet.edit',
      delete: 'material.surgicalSet.delete',
      view: 'material.surgicalSet',
      export: 'material.surgicalSet.export',
    },
    id: 'material.surgicalSet',
    dataTableId: 'material.surgicalSet',
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

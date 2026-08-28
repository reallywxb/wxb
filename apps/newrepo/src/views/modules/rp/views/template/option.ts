
import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import { $t } from '#/locales'; // 多语言
export const getFormOptions: (
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
      label: '模板类型',
      fieldName: 'templateType',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/rp.templateType',
        };
      },
      rules: 'required',
    },
    {
      label: '名称',
      fieldName: 'name',
      component: 'Input',
      rules: 'required',
    },
    {
      label: '内容',
      fieldName: 'content',
      component: 'Textarea',
      componentProps: () => {
        return {
          style: "height: 300px;" 
        };
        },
      formItemClass: 'col-span-2',
    },
    {
      label: '备注',
      fieldName: 'remark',
      component: 'Input',
      formItemClass: 'col-span-2',
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
        title: 'ID',
        field: 'id',
        key: true,
        sortable: true,
        minWidth: 30,
        width: 90,
        visible: false,
      },
      {
        title: '模板类型',
        field: 'templateType',
        formatter: (params: any) => {
          return params.row.templateType_name;
        },
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
        title: '内容',
        field: 'content',
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
      {
        label: '模板类型',
        fieldName: 'templateType',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/rp.templateType',
          };
        },
      },
      {
        label: '名称',
        fieldName: 'name',
        component: 'Input',
      },
      {
        label: '是否启用',
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
    id: 'rp.template',
    dataTableId: 'rp.template',
    showToolbar: true,
    addFormOptions: getFormOptions('add'),
    editFormOptions: getFormOptions('edit'),
    viewFormOptions: getFormOptions('view'),
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
export { useGridOptions };

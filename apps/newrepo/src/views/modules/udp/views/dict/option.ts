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
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:udp.productSuit',
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
      label: '字典类型',
      fieldName: 'dictType',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/udp.dictType',
        };
      },
      rules: 'required',
    },
    {
      label: '是否动态字典',
      fieldName: 'isDynamic',
      component: 'Switch',
      componentProps: {
        class: 'w-[50px]',
      },
      defaultValue: false,
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

const useGridOptions: any = function (
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
        title: '字典类型',
        field: 'dictType',
        formatter: (params: any) => {
          return params.row.dictType_name;
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
        title: '是否动态字典',
        field: 'isDynamic',
        formatter: (params: any) => {
          return params.row.isDynamic ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
        width: 180,
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
                return hasAccessByCodes(['udp.dict.edit']);
              },
              text: '编辑',
            },
            {
              code: 'delete',
              show: () => {
                return hasAccessByCodes(['udp.dict.delete']);
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
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:udp.productSuit',
          };
        },
      },
      {
        label: '编码',
        fieldName: 'code',
        component: 'Input',
      },
      {
        label: '名称',
        fieldName: 'name',
        component: 'Input',
      },
      {
        label: '字典类型',
        fieldName: 'dictType',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/udp.dictType',
          };
        },
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
    id: 'udp.dict',
    dataTableId: 'udp.dict',
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

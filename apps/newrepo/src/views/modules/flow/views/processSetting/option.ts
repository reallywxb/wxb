import type { SchemaColumnAndOptions } from '@vben/chc-ui';

// 权限相关的hook
import { $t } from '#/locales'; // 多语言
import { isEmpty } from '@vben/utils';

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
      label: 'id',
      fieldName: 'id',
      component: 'Input',
      rules: 'required',
      hidden: true,
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
      label: '部门',
      fieldName: 'deptId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.dept?orgId={{orgId}}',
        };
      },
      hidden: true,
    },
    {
      label: '实体',
      fieldName: 'entityCode',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/wfEntity',
        };
      },
      rules: 'required',
    },
    {
      label: '单据类型',
      fieldName: 'docType',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl:
            '/datatable/getDict/list.WfDocType?parentValue={{entityCode}}',
        };
      },
      rules: 'required',
    },
    {
      label: '仓库策略',
      fieldName: 'param1',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl:
            '/datatable/getDict/entity:material.warehousePolicy?AD_Org_ID={{orgId}}',
        };
      },
    },
    {
      label: '参数3',
      fieldName: 'param3',
      component: 'Input',
      hidden: true,
    },
    {
      label: '参数4',
      fieldName: 'param4',
      component: 'Input',
      hidden: true,
    },
    {
      label: '参数5',
      fieldName: 'param5',
      component: 'Input',
      hidden: true,
    },
    {
      label: '流程',
      fieldName: 'uniqueId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/flow.processMainUniqueId',
        };
      },
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
      label: '创建时间',
      fieldName: 'createTime',
      component: 'Input',
      hidden: true,
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
      component: 'Input',
      hidden: true,
    },
    {
      label: '租户',
      fieldName: 'tenantId',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/entity:sys.tenant',
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
        title: 'id',
        field: 'id',
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '机构',
        field: 'orgId',
        formatter: (params: any) => {
          return params.row?.orgIdName || params.row?.orgId_name;
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: '部门',
        field: 'deptId',
        formatter: (params: any) => {
          return params.row.deptId_name || params.row.deptIdName;
        },
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '实体',
        field: 'entityCode',
        formatter: (params: any) => {
          return params.row.entityCodeName || params.row.entityCode_name;
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: '单据类型',
        field: 'docType',
        sortable: true,
        minWidth: 60,
        dict: true,
        dictId: 'list.WfDocType',
        formatter: (params: any) => {
          return params.row.docTypeName || params.row.docType_name;
        },
      },
      {
        title: '仓库策略',
        field: 'param1',
        sortable: true,
        minWidth: 60,
        dict: true,
        dictId: 'entity:material.warehousePolicy',
        formatter: (params: any) => {
          return params.row.param1Name || params.row.param1_name;
        },
      },
      {
        title: '参数3',
        field: 'param3',
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '参数4',
        field: 'param4',
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '参数5',
        field: 'param5',
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '流程',
        field: 'uniqueId',
        formatter: (params: any) => {
          return params.row.uniqueIdName || params.row.uniqueId_name;
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: '是否有效',
        field: 'isActive',
        formatter: (params: any) => {
          return params.row.isActive ? '是' : '否';
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: '创建人',
        field: 'createdBy',
        formatter: (params: any) => {
          return params.row.createdBy_name;
        },
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '创建时间',
        field: 'createTime',
        sortable: true,
        minWidth: 60,
        visible: false,
      },
      {
        title: '更新人',
        field: 'updatedBy',
        formatter: (params: any) => {
          return params.row.updatedByName || params.row.updatedBy_name;
        },
        sortable: true,
        minWidth: 60,
      },
      {
        title: '更新时间',
        field: 'updateTime',
        sortable: true,
        minWidth: 60,
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
    formSchema: [
      {
        label: '机构',
        fieldName: 'orgId',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/entity:sys.org',
          };
        },
      },
      {
        label: '实体',
        fieldName: 'entityCode',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/datatable/getDict/wfEntity',
          };
        },
      },
      {
        label: '仓库策略',
        fieldName: 'param1',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/datatable/getDict/entity:material.warehousePolicy?AD_Org_ID={{orgId}}',
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
    id: 'flow.processSetting',
    dataTableId: 'flow.processSetting',
    showToolbar: true,
    commonFormOptions: formOptions,
    showCellMenuIconBtn: false,
    showAddBtn: true,
    showCustomBtn: true,
    showExportBtn: true,
    showLogBtn: true,
    showRefreshBtn: true,
    showRadioRowTag: true,
    showCellMenuIconBtn: true,
    parentTableParams: parentTableParams ? parentTableParams.value : undefined,
    afterFetchFn: (res) => {
      return {
        ...res,
        records: (res?.records || []).map((item: Record<string, any>) => {
          return {
            ...item,
            // 仓库策略
            param1: isEmpty(item?.param1)
              ? item?.param1
              : Number.parseFloat(item.param1),
          };
        }),
      };
    },
  };
};
export { useGridOptions };

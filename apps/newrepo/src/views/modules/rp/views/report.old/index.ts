import type { Ref } from 'vue';

import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, reactive, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import {
  createReport,
  createReportOrg,
  createReportPrinter,
  createReportRole,
  createReportSetting,
  delReport,
  delReportOrg,
  delReportPrinter,
  delReportRole,
  delReportSetting,
  previewReport,
  updateReport,
  updateReportOrg,
  updateReportPrinter,
  updateReportRole,
  updateReportSetting,
} from './api';
import {
  usePrimaryGridOptions,
  useReportOrgGridOptions,
  useReportPrinterGridOptions,
  useReportRoleGridOptions,
  useReportSettingGridOptions,
} from './gridOptions';
import { primarySearchFormOptions } from './searchFormOptions';

export enum Tab {
  ReportSetting,
  ReportPrinter,
  ReportOrg,
  ReportRole,
}

const createSubFnMap = {
  [Tab.ReportSetting]: createReportSetting,
  [Tab.ReportPrinter]: createReportPrinter,
  [Tab.ReportOrg]: createReportOrg,
  [Tab.ReportRole]: createReportRole,
};

const updateSubFnMap = {
  [Tab.ReportSetting]: updateReportSetting,
  [Tab.ReportPrinter]: updateReportPrinter,
  [Tab.ReportOrg]: updateReportOrg,
  [Tab.ReportRole]: updateReportRole,
};
const delSubFnMap = {
  [Tab.ReportSetting]: delReportSetting,
  [Tab.ReportPrinter]: delReportPrinter,
  [Tab.ReportOrg]: delReportOrg,
  [Tab.ReportRole]: delReportRole,
};
enum ModalMode {
  add,
  edit,
  view,
}

export function useGrid() {
  const parentTableParams = reactive({
    reportId: '',
  });

  // 主表
  const [Grid, gridApi] = useCommonGrid(
    {
      formOptions: primarySearchFormOptions,
      gridOptions: usePrimaryGridOptions(),
      gridEvents: {
        radioChange({ row }: any) {
          parentTableParams.reportId = row?.id;

          reportSettingGridApi?.query();
          reportPrinterGridApi?.query();
          reportOrgGridApi?.query();
          reportRoleGridApi?.query();
        },
      },
    },
    {
      dataTableId: '/datatable/data/page/rp.report',
    },
  );

  // 子表
  const [ReportSettingGrid, reportSettingGridApi] = useCommonGrid(
    {
      gridOptions: useReportSettingGridOptions(),
    },
    {
      id: 'ReportSetting',
      dataTableId: '/datatable/data/page/rp.reportSetting',
      parentTableParams,
    },
  );

  const [ReportPrinterGrid, reportPrinterGridApi] = useCommonGrid(
    {
      gridOptions: useReportPrinterGridOptions(),
    },
    {
      id: 'ReportPrinter',
      dataTableId: '/datatable/data/page/rp.reportPrinter',
      parentTableParams,
    },
  );

  const [ReportOrgGrid, reportOrgGridApi] = useCommonGrid(
    {
      gridOptions: useReportOrgGridOptions(),
    },
    {
      id: 'ReportOrg',
      dataTableId: '/datatable/data/page/rp.reportOrg',
      parentTableParams,
    },
  );
  const [ReportRoleGrid, reportRoleGridApi] = useCommonGrid(
    {
      gridOptions: useReportRoleGridOptions(),
    },
    {
      id: 'ReportRole',
      dataTableId: '/datatable/data/page/rp.reportRole',
      parentTableParams,
    },
  );

  return {
    Grid,
    gridApi,
    ReportSettingGrid,
    reportSettingGridApi,
    ReportPrinterGrid,
    reportPrinterGridApi,
    ReportOrgGrid,
    reportOrgGridApi,
    ReportRoleGrid,
    reportRoleGridApi,
    parentTableParams,
  };
}

export function useCommonModal(
  gridApi: VxeGridApi,
  subApiList: Array<VxeGridApi>,
  {
    activeKey,
  }: {
    activeKey: Ref<string>;
  },
) {
  const modificationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const subModificationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const encryptionModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const formMode = ref<ModalMode>(ModalMode.add);

  const formOption: VbenFormProps = {
    layout: 'vertical',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
        })),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'code',
        label: '编码',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'reportGroup',
        label: '分组',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        rules: 'required',
        fieldName: 'isPrintDoc',
        label: '是否打印单据',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: true,
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl:
            'datatable/pageDict/entity:rp.template?extendFields=templateType:templateType,name:templateName&searchFields=templateType,name',
          placeholder: '请选择',
          paginate: false,
        })),
        fieldName: 'templateId',
        label: '报表模板',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: 'datatable/dict/rp.report.orgScope',
          placeholder: '请选择',
          paginate: false,
        })),
        fieldName: 'orgScope',
        label: '机构范围',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Textarea',
        fieldName: 'remark',
        label: '备注',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        // rules: 'required',
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        rules: 'required',
        fieldName: 'isActive',
        label: '是否启用',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        defaultValue: true,
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

  const subFormOption: VbenFormProps = {
    layout: 'vertical',
    schema: computed(() => {
      const tab = Number.parseInt(activeKey.value) as Tab;

      switch (tab) {
        case Tab.ReportOrg: {
          return reportOrgFormSchema;
        }
        case Tab.ReportPrinter:
        case Tab.ReportSetting: {
          return useGeneralSubFormOption(tab);
        }
        case Tab.ReportRole: {
          return reportRoleFormSchema;
        }
        default: {
          return [];
        }
      }
    }),
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-2',
  };

  const encryptionFormOption: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'Textarea',
        fieldName: 'password',
        label: '',
        componentProps: () => ({
          rows: 8,
          readonly: true,
        }),
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        hideLabel: true,
      },
    ],
    showDefaultActions: false,
  };

  const useGeneralSubFormOption = (type: Tab) =>
    [
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: '',
        rules: 'required',
        visible: true,
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: 'datatable/dict/entity:md.warehouse?orgId={{orgId}}',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
          triggerFields: ['orgId'],
        }),
        dependencies: {
          trigger(values) {
            const compRef =
              subModificationModalRef.value?.formApi?.getFieldComponentRef?.(
                'warehouseId',
              );
            if (compRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (compRef.params.dependencies.orgId) {
                subModificationModalRef.value?.formApi?.setFieldValue(
                  'warehouseId',
                  undefined,
                );
              }
              compRef.params.dependencies = {
                orgId: values.orgId,
              };
              compRef.fetchApi();
            }
          },
          triggerFields: ['orgId'],
        },
        fieldName: 'warehouseId',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '仓库',
        defaultValue: '',
        rules: 'required',
        visible: true,
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: 'datatable/dict/entity:md.owner?orgId={{orgId}}',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        dependencies: {
          trigger(values) {
            const compRef =
              subModificationModalRef.value?.formApi?.getFieldComponentRef?.(
                'ownerId',
              );
            if (compRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (compRef.params.dependencies.orgId) {
                subModificationModalRef.value?.formApi?.setFieldValue(
                  'ownerId',
                  undefined,
                );
              }
              compRef.params.dependencies = {
                orgId: values.orgId,
              };
              compRef.fetchApi();
            }
          },
          triggerFields: ['orgId'],
        },
        fieldName: 'ownerId',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '货主',
        defaultValue: '',
        visible: true,
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: 'datatable/dict/entity:md.bpartner?ownerId={{ownerId}}',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
          triggerFields: ['ownerId'],
        }),
        dependencies: {
          trigger(values) {
            const compRef =
              subModificationModalRef.value?.formApi?.getFieldComponentRef?.(
                'bpartnerId',
              );
            if (compRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (compRef.params.dependencies.ownerId) {
                subModificationModalRef.value?.formApi?.setFieldValue(
                  'bpartnerId',
                  undefined,
                );
              }
              compRef.params.dependencies = {
                ownerId: values.ownerId,
              };
              compRef.fetchApi();
            }
          },
          triggerFields: ['ownerId'],
        },
        fieldName: 'bpartnerId',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '客商',
        defaultValue: '',
        visible: true,
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl:
            'datatable/pageDict/entity:rp.template?extendFields=templateType:templateType,name:templateName&searchFields=templateType,name',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
        }),
        fieldName: 'templateId',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '报表模板',
        defaultValue: '',
        rules: 'required',
        visible: type === Tab.ReportSetting,
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        rules: 'required',
        fieldName: 'isAutoPrint',
        label: '是否自动打印',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: true,
        visible: type === Tab.ReportPrinter,
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl:
            'datatable/dict/entity:rp.printer?warehouseId={{warehouseId}}',
          placeholder: '请选择',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          afterFetch: (records: any[]) => ({ records }),
          triggerFields: ['warehouseId'],
        }),
        dependencies: {
          trigger(values) {
            const compRef =
              subModificationModalRef.value?.formApi?.getFieldComponentRef?.(
                'printerId',
              );
            if (compRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (compRef.params.dependencies.warehouseId) {
                subModificationModalRef.value?.formApi?.setFieldValue(
                  'printerId',
                  undefined,
                );
              }
              compRef.params.dependencies = {
                warehouseId: values.warehouseId,
              };
              compRef.fetchApi();
            }
          },
          triggerFields: ['warehouseId'],
        },
        fieldName: 'printerId',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        label: '打印机',
        defaultValue: '',
        visible: type === Tab.ReportPrinter,
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        rules: 'required',
        fieldName: 'isActive',
        label: '是否启用',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        defaultValue: true,
        visible: true,
      },
    ].filter((item) => item.visible) as VbenFormProps['schema'];
  const reportOrgFormSchema = [
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/dict/entity:sys.org',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'orgId',
      label: '机构',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
      rules: 'required',
    },
  ] as VbenFormProps['schema'];
  const reportRoleFormSchema = [
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/datatable/dict/entity:sys.org',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
      }),
      fieldName: 'orgId',
      label: '机构',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl: '/sys/role/roleList/{{orgId}}',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        showChooseAll: '',
        afterFetch: (records: any[]) => ({ records }),
        triggerFields: ['orgId'],
      }),
      dependencies: {
        trigger(values) {
          const compRef =
            subModificationModalRef.value?.formApi?.getFieldComponentRef?.(
              'roleId',
            );
          if (compRef?.params) {
            // 编辑时防止初始加载时清除已填写的值
            if (compRef.params.dependencies.orgId) {
              subModificationModalRef.value?.formApi?.setFieldValue(
                'roleId',
                undefined,
              );
            }
            compRef.params.dependencies = {
              orgId: values.orgId,
            };
            compRef.fetchApi();
          }
        },
        triggerFields: ['orgId'],
      },
      fieldName: 'roleId',
      label: '角色',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: '',
      rules: 'required',
    },
  ] as VbenFormProps['schema'];

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createReport(params),
      })
      .open();
  }
  function handleEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;
    modificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form,
        submit: (params: any) =>
          updateReport({
            ...params,
            id,
          }),
      })
      .open();
  }

  function handleDel({ id }: any) {
    Modal.confirm({
      title: '提示',
      content: '此操作将永久删除选中的记录, 是否继续?',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delReport(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handlePreview({ templateId }: any) {
    previewReport({ templateId }).then(() => {});
  }

  function handleSubAdd(tab: Tab) {
    formMode.value = ModalMode.add;

    const record = gridApi.grid.getRadioRecord();

    subModificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        form: {
          siteName: record.name,
        },
        submit: (params: any) =>
          createSubFnMap[tab]({
            reportId: record.id,
            ...params,
          }),
      })
      .open();
  }
  function handleSubEdit({ id, ...form }: any, tab: Tab) {
    formMode.value = ModalMode.edit;

    const record = gridApi.grid.getRadioRecord();

    subModificationModalRef.value?.modalApi
      .setData({
        title: '编辑',
        form: {
          ...form,
          siteName: record.name,
        },
        submit: (params: any) =>
          updateSubFnMap[tab]({
            ...params,
            id,
          }),
      })
      .open();
  }
  function handleSubDel({ id }: any, tab: Tab) {
    Modal.confirm({
      title: '提示',
      content: '此操作将永久删除选中的记录, 是否继续?',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delSubFnMap[tab](id);
          message.success('操作成功');

          reloadSubGrid(tab);
        } catch {}
      },
    });
  }

  function handleSubPreview({ reportId, templateId }: any, tab: Tab) {
    previewReport({ templateId }).then((data) => {
      console.warn(reportId, data, tab);
    });
  }

  function reloadSubGrid(tab: Tab) {
    subApiList[tab]?.reload();
  }

  return {
    subModificationModalRef,
    modificationModalRef,
    encryptionModalRef,
    formOption,
    subFormOption,
    encryptionFormOption,
    reloadSubGrid,
    handleAdd,
    handleEdit,
    handleDel,
    handleSubAdd,
    handleSubEdit,
    handleSubDel,
    handlePreview,
    handleSubPreview,
  };
}

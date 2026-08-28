import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';
import type { ExtendedVxeGridApi } from '@vben/plugins/src/vxe-table/types.ts';

import type { CrudGridOptions } from '#/components/datatable';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { refreshDataTable } from '#/views/modules/dev/views/datatable/api/datatable';
import { transformComponentType } from '#/views/modules/dev/views/datatable/util';

export function useCommonModal(gridApi: VxeGridApi) {
  const sqlFormModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const modelSourceModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const previewModalRef = ref<
    | (Record<string, any> & {
        gridApi?: ExtendedVxeGridApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const interfaceTestModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const inputParamRef = ref<
    | (Record<string, any> & {
        gridApi?: ExtendedVxeGridApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();
  const outputParamRef = ref<
    | (Record<string, any> & {
        gridApi?: ExtendedVxeGridApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const inputGridOption: CrudGridOptions<any> = {
    pagerConfig: {
      enabled: false,
    },
    columns: [
      {
        field: 'id',
        title: '字段名',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'fieldType',
        title: '字段类型',
        width: 100,
        sortable: true,
      },
      {
        field: 'label',
        title: '字段标签',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'hide',
        title: '是否隐藏',
        width: 100,
        sortable: true,
        formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
      },
      {
        field: 'required',
        title: '是否必填',
        width: 100,
        sortable: true,
        formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
      },
      {
        field: 'precision',
        title: '字段精度',
        width: 100,
        sortable: true,
        align: 'right',
      },
      {
        field: 'multiValue',
        title: '多选',
        minWidth: 150,
        sortable: true,
        formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
      },
      {
        field: 'defaultValue',
        title: '默认值',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'dictId',
        title: '字典编码',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'dictUrl',
        title: '字典Url',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'dictPageSize',
        title: '字典分页数',
        width: 100,
        align: 'right',
        sortable: true,
      },
      {
        field: 'maxLength',
        title: '最大长度',
        width: 100,
        align: 'right',

        sortable: true,
      },
      {
        field: 'minLength',
        title: '最小长度',
        width: 100,
        align: 'right',

        sortable: true,
      },
      {
        field: 'maxValue',
        title: '最大值',
        width: 100,
        sortable: true,
        align: 'right',
      },
      {
        field: 'minValue',
        title: '最小值',
        width: 100,
        sortable: true,
        align: 'right',
      },
      // {
      //   field: 'filterSql',
      //   title: '查询语句',
      //   minWidth: 150,
      //   sortable: true,
      // },
      // {
      //   field: 'filterOperator',
      //   title: '查询操作符',
      //   minWidth: 150,
      //   sortable: true,
      // },
      {
        field: 'remark',
        title: '备注',
        minWidth: 150,
        sortable: true,
      },
    ],
  };
  const outputGridOption: CrudGridOptions<any> = {
    pagerConfig: {
      enabled: false,
    },
    columns: [
      {
        field: 'id',
        title: '字段名',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'fieldType',
        title: '字段类型',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'label',
        title: '字段标签',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'remark',
        title: '备注',
        minWidth: 120,
        sortable: true,
      },
    ],
  };

  function genFormOption(type: 'MODEL' | 'SOURCE' = 'MODEL') {
    return {
      layout: 'vertical',
      schema: [
        {
          component: 'Input',
          fieldName: 'id',
          label: '模型编码',
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[0px] pl-[4px]',
          rules: type === 'MODEL' ? 'required' : '',
        },
        {
          component: 'Input',
          fieldName: 'title',
          label: '模型名称',
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[0px] pl-[4px]',
          rules: type === 'MODEL' ? 'required' : '',
        },
        type === 'MODEL'
          ? {
              component: 'Textarea',
              componentProps: {
                rows: 3,
              },
              fieldName: 'sql',
              label: 'sql',
              formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
              labelClass: 'leading-1 mb-[0px] pl-[4px]',
              rules: 'required',
            }
          : null,
      ].filter(Boolean),
      // 控制表单是否显示折叠按钮
      showCollapseButton: false,
      // 是否在字段值改变时提交表单
      submitOnChange: false,
      // 按下回车时是否提交表单
      submitOnEnter: false,
      wrapperClass: 'grid-cols-2',
    } as VbenFormProps;
  }

  function createFromSQL() {
    const record = gridApi.grid.getRadioRecord();

    if (!record) {
      message.error('请选择一条记录');
      return;
    }

    sqlFormModalRef.value?.modalApi
      .setData({
        dataTableId: record.id,
      })
      .open();
  }
  function showModelSource() {
    const record = gridApi.grid.getRadioRecord();

    if (!record) {
      message.error('请选择一条记录');
      return;
    }

    modelSourceModalRef.value?.modalApi
      .setData({
        dataTableId: record.id,
      })
      .open();
  }
  async function refresh() {
    gridApi.setLoading(true);
    try {
      const values = await gridApi.formApi.getValues();

      await refreshDataTable(values);

      setTimeout(async () => {
        await gridApi.reload(values);
        gridApi.setLoading(false);
      }, 200);
    } catch (error) {
      console.warn(error);
    } finally {
      setTimeout(() => {
        gridApi.setLoading(false);
      }, 500);
    }
  }

  function handlePreview({ id: dataTableId, fields }: any) {
    previewModalRef.value?.modalApi
      .setData({
        dataTableId,
        hasWfProcInstId: fields.some(({ id }: any) => id === 'wfProcInstId'),
      })
      .open();
  }
  function testInterface({ id, type, inputParameters, actionUrl }: any) {
    const record = gridApi.grid.getRadioRecord();

    interfaceTestModalRef.value?.modalApi
      .setData({
        dataTableId: record.id,
        type,
        actionUrl,
        id,
      })
      .open();

    let schema: any[] = [];

    switch (type) {
      case 'DOWNLOAD': {
        break;
      }
      case 'PROCESS': {
        schema = inputParameters.map(
          ({
            id: fieldName,
            label,
            type,
            fieldType,
            dicUrl: dictUrl,
            defaultValue,
            required,
          }) => {
            const component = transformComponentType(type || fieldType);

            return {
              component,
              fieldName,
              label,
              formItemClass: `col-span-${component === 'Textarea' || type === 'Switch' ? 2 : 1} pl-[10px] pr-[10px]`,
              componentProps: () => {
                switch (type) {
                  case 'ChcSelect': {
                    return {
                      immediate: true,
                      allowClear: true,
                      dictUrl,
                    };
                  }
                  case 'DatePicker': {
                    return {
                      showTime: true,
                      valueFormat: 'YYYY-MM-DD HH:mm:ss',
                    };
                  }
                  case 'Switch': {
                    return {
                      checkedChildren: '是',
                      unCheckedChildren: '否',
                      style: {
                        width: '40px',
                      },
                    };
                  }
                  default: {
                    return {
                      rows: 1,
                      placeholder: '请输入',
                    };
                  }
                }
              },
              defaultValue,
              rules: required ? 'required' : '',
            };
          },
        );
        break;
      }
      case 'UPLOAD': {
        schema = inputParameters.map(
          ({
            action,
            id: fieldName,
            label,
            defaultValue,
            required,
            multiple,
          }) => {
            return {
              component: 'Upload',
              fieldName,
              label,
              formItemClass: `col-span-1 pl-[10px] pr-[10px]`,
              componentProps: () => ({
                action,
                showUploadList: true,
                multiple,
              }),
              defaultValue,
              rules: required ? 'required' : '',
            };
          },
        );
        break;
      }
    }
    interfaceTestModalRef.value?.formApi?.setState((prev) => {
      return {
        ...prev,
        schema,
      };
    });
  }

  return {
    genFormOption,
    sqlFormModalRef,
    modelSourceModalRef,
    previewModalRef,
    interfaceTestModalRef,
    inputParamRef,
    outputParamRef,
    inputGridOption,
    outputGridOption,
    createFromSQL,
    showModelSource,
    refresh,
    handlePreview,
    testInterface,
  };
}

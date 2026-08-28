import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { onMounted, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import {
  createOrg,
  getSettingGroupList,
  getSettingValues,
  rebuildHierachy,
  rebuildValue,
  setSettingValues,
  updateOrg,
} from './api/org';

enum ModalMode {
  add,
  edit,
  view,
}

export interface SubTabItem {
  name: string;
  label: string;
  desc: string;
  fieldType:
    | 'Boolean'
    | 'Byte'
    | 'Date'
    | 'DateTime'
    | 'Decimal'
    | 'Double'
    | 'Float'
    | 'Int'
    | 'Long'
    | 'LongText'
    | 'Short'
    | 'Time';
  dictUrl: null | string;
  span: number;
  search: boolean;
}

const TYPICAL_IDENTIFIER = '+_+'; // 替换表单字段中的.

export function transformComponent(
  { name: fieldName, label, fieldType, dictUrl }: SubTabItem,
  show: () => boolean,
) {
  if (dictUrl) {
    return {
      component: 'ChcSelect',
      componentProps: () => ({
        dictUrl,
        paginate: false,
        afterFetch: (records: any[]) => ({ records }),
      }),
      dependencies: {
        triggerFields: ['a'],
        show,
      },
      fieldName,
      label,
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
    };
  } else
    switch (fieldType) {
      case 'Boolean': {
        return {
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
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
          defaultValue: false,
        };
      }
      case 'Byte':
      case 'Decimal':
      case 'Double':
      case 'Float':
      case 'Int':
      case 'Long':
      case 'Short': {
        return {
          component: 'InputNumber',
          componentProps: {
            placeholder: '请输入',
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      case 'Date': {
        return {
          component: 'DatePicker',
          componentProps: () => {
            return {
              valueFormat: 'YYYY-MM-DD',
            };
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      case 'DateTime': {
        return {
          component: 'DatePicker',
          componentProps: () => {
            return {
              showTime: true,
              valueFormat: 'YYYY-MM-DD HH:mm:ss',
            };
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      case 'LongText': {
        return {
          component: 'Textarea',
          componentProps: {
            placeholder: '请输入',
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      case 'Time': {
        return {
          component: 'TimePicker',
          componentProps: () => {
            return {
              valueFormat: 'HH:mm:ss',
            };
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
      default: {
        return {
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
          },
          dependencies: {
            triggerFields: ['a'],
            show,
          },
          fieldName,
          label,
          formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
          labelClass: 'leading-1 mb-[1px] pl-[4px]',
        };
      }
    }
}

export function useCommonModal(gridApi: VxeGridApi) {
  const modificationModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const settingModalRef = ref<
    | (Record<string, any> & {
        formApi?: ExtendedFormApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  const formMode = ref<ModalMode>(ModalMode.add);

  const formOption: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'Input',
        fieldName: 'code',
        label: '编码',
        rules: 'required',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        rules: 'required',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'fullName',
        label: '全称',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          allowClear: false,
          dictUrl: 'datatable/getDict/sys.org.type',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        }),
        fieldName: 'type',
        label: '机构类型',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'contact',
        label: '联系人',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'phone',
        label: '联系电话',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'fax',
        label: '传真',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'email',
        label: '邮件地址',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'zipCode',
        label: '邮编',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'Input',
        fieldName: 'address',
        label: '联系地址',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      },
      {
        component: 'ChcSelect',
        fieldName: 'parentId',
        componentProps: () => ({
          dictUrl: '/sys/org/pageOrgList?isAll=true',
          allowClear: true,
          paginate: true,
          // afterFetch({ data }: any) {
          //   return data.records.map(({ label, value }: any) => ({
          //     label,
          //     value,
          //   }));
          // },
        }),
        // componentProps: ({
        //   dictUrl: '/sys/org/pageOrgList?isAll=true',
        //   allowClear: true,
        //   pagination: true,
        //   afterFetch({ data }: any) {
        //     return data.records.map(({ label, value }: any) => ({
        //       label,
        //       value,
        //     }));
        //   },
        // }),
        label: '上级机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
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
        label: '是否有效',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        defaultValue: true,
      },
      {
        component: 'Textarea',
        fieldName: 'remark',
        label: '备注',
        formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
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

  const activeKey = ref('-1');
  const settingTabOptions = ref<
    Array<{
      items?: Array<VbenFormProps['schema']>;
      key: string;
      tab: string;
    }>
  >([
    {
      tab: '仓库一览',
      key: '-1',
      // items: [
      //   {
      //     component: 'Switch',
      //     fieldName: 'sc.bpartner.isCancellationApproval',
      //     label: '启用核销撤销审批',
      //     defaultValue: false,
      //     componentProps: () => ({
      //       checkedValue: true,
      //       checkedChildren: '是',
      //       unCheckedValue: false,
      //       unCheckedChildren: '否',
      //
      //       style: {
      //         width: '40px',
      //       },
      //     }),
      //     dependencies: {
      //       triggerFields: ['a'],
      //       show: () => activeKey.value === '-1',
      //     },
      //     rules: 'required',
      //     labelWidth: 130,
      //     formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      //     ifShow: false,
      //   },
      // ],
    },
  ]);

  const settingFormOption: VbenFormProps = {
    layout: 'vertical',
    schema: [
      {
        component: 'Switch',
        fieldName: 'sc.bpartner.isCancellationApproval',
        label: '启用核销撤销审批',
        defaultValue: false,
        componentProps: () => ({
          checkedValue: true,
          checkedChildren: '是',
          unCheckedValue: false,
          unCheckedChildren: '否',

          style: {
            width: '40px',
          },
        }),
        dependencies: {
          triggerFields: ['a'],
          show: () => activeKey.value === '-1',
        },
        rules: 'required',
        labelWidth: 130,
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
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

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createOrg(params),
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
          updateOrg({
            ...params,
            id,
          }),
      })
      .open();
  }

  function rebuildNode() {
    Modal.confirm({
      title: '提示',
      content: '确认重建树层级吗？',
      centered: true,
      onOk: async () => {
        try {
          await rebuildHierachy();
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }
  function rebuildCode() {
    Modal.confirm({
      title: '提示',
      content: '确认重建搜索码吗?',
      centered: true,
      onOk: async () => {
        try {
          await rebuildValue();
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleSetting({ id }: any) {
    getSettingValues(id)
      .then((data) => {
        settingModalRef.value?.formApi?.setValues(
          Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key.replaceAll('.', TYPICAL_IDENTIFIER),
              (function () {
                switch (value) {
                  case 'false': {
                    return false;
                  }
                  case 'true': {
                    return true;
                  }
                  default: {
                    return value;
                  }
                }
              })(),
            ]),
          ),
        );
      })
      .finally(() => {
        settingModalRef.value?.modalApi?.setState({
          loading: false,
        });
      });

    settingModalRef.value?.modalApi
      .setData({
        title: '权限设置 ',
        submit: (params: Record<string, any>) => {
          const entries = Object.entries(params).map(([key, value]) => [
            key.replaceAll(TYPICAL_IDENTIFIER, '.'),
            value,
          ]);
          return setSettingValues(id, Object.fromEntries(entries));
        },
      })
      .open();

    settingModalRef.value?.modalApi?.setState({
      loading: true,
    });
  }

  function onTabChange() {
    /* !!! tabs 切换后 重新设置表单项*/
    // settingModalRef.value?.formApi?.setState((res: any) => ({
    //   ...res,
    //   schema: schemas.value.map(({ fieldName, ...extra }) => ({
    //     ...extra,
    //     fieldName: fieldName.replaceAll('.', '_'),
    //   })),
    // }));

    settingModalRef.value?.formApi?.updateSchema(settingFormOption.schema);
  }

  onMounted(() => {
    getSettingGroupList().then((data) => {
      data
        ?.reverse()
        .forEach(
          (tab: { items: SubTabItem[]; label: string; name: string }) => {
            const groupOptions = tab.items.map((item) =>
              transformComponent(item, () => activeKey.value === tab.name),
            );

            settingFormOption.schema?.push(...groupOptions);

            settingTabOptions.value.unshift({
              tab: tab.label,
              key: tab.name,
            });
          },
        );

      settingFormOption.schema?.forEach((item) => {
        item.fieldName = item.fieldName.replaceAll('.', TYPICAL_IDENTIFIER);
      });

      settingModalRef.value?.formApi?.setState(() => settingFormOption);
    });
  });

  return {
    settingModalRef,
    modificationModalRef,
    formOption,
    handleAdd,
    handleEdit,
    handleSetting,
    rebuildNode,
    rebuildCode,
    settingFormOption,
    activeKey,
    settingTabOptions,
    onTabChange,
  };
}

export function useDynamicForm() {}

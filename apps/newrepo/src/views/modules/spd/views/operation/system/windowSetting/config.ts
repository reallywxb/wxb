import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';

import { computed, ref } from 'vue';

import { saveWindowAction } from '#/views/modules/spd/views/operation/system/windowSetting/api';

type ModalMode = (typeof ModalMode)[keyof typeof ModalMode];

const ModalMode = {
  add: 0,
  edit: 1,
  view: 2,
} as const;

export const formSchema = [
  {
    fieldName: 'windowName',
    label: '窗口名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入窗口名称',
    },
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        showSearch: true,
        placeholder: '请选择院区',
        paginate: false,
        filterByFrontEnd: true,
        allowClear: false,

        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    fieldName: 'campusId',
    defaultValue: '',
    label: '所属院区',
  },
  // {
  //   fieldName: 'isActive',
  //   label: '状态',
  //   component: 'ChcSelect',
  //   componentProps: {
  //     options: [
  //       { value: '', label: '全部' },
  //       { value: 'Y', label: '正常' },
  //       { value: 'N', label: '关闭' },
  //     ],
  //     placeholder: '',
  //     paginate: false,
  //     filterByFrontEnd: true,
  //     showChooseAll: '',
  //     immediate: true,
  //   },
  // },
];

export const gridColumns = [
  {
    align: 'center',
    title: '',
    type: 'checkbox',
    width: 50,
  },
  {
    title: '序号',
    width: 50,
    align: 'center',
    field: 'index',
    formatter(scope: any) {
      return scope.rowIndex + 1;
    },
  },
  {
    title: '窗口编号',
    field: 'windowCode',
    minWidth: 100,
    align: 'left',
  },
  {
    title: '窗口名称',
    field: 'windowName',
    minWidth: 100,
    align: 'left',
  },
  {
    title: '所属药房',
    field: 'warehouseName',
    minWidth: 150,
    align: 'left',
  },
  {
    title: '所属科室',
    field: 'departmentName',
    minWidth: 150,
  },
  {
    title: '所属院区',
    field: 'campusName',
    minWidth: 150,
    align: 'left',
  },
  {
    title: '主机IP',
    field: 'bindIp',
    width: 120,
  },
  {
    title: '打印瓶签',
    field: 'isPrintLabel',
    width: 120,
    align: 'left',
    formatter: ({ row }) => {
      return row.isPrintLabel === 'Y' ? '是' : '否';
    },
  },
  {
    title: '特殊医嘱合并拣货',
    field: 'isSpecialMerge',
    width: 120,
    align: 'left',
    formatter: ({ row }) => {
      return row.isSpecialMerge === 'Y' ? '是' : '否';
    },
  },
  // {
  //   title: '手工发药',
  //   field: 'windowStatus',
  //   width: 100,
  //   align: 'center',
  //   // formatter: ({ row }: { row: any }) => {
  //   //   return row.windowStatus === 'Y' ? '开启' : '关闭';
  //   // },
  //   editRender: {},
  //   slots: {
  //     default: 'manualDispense',
  //   },
  // },
  {
    title: '状态',
    field: 'op',
    width: 50,
    align: 'center',
    formatter: ({ row }: { row: any }) => {
      return row.isActive === 'Y' ? '启用' : '停用';
    },
  },
  {
    title: '操作',
    field: 'action',
    width: 140,
    align: 'left',
    editRender: {},
    slots: {
      default: 'actionDefault',
    },
  },
];

export function useCommonFormModal() {
  const modificationModalRef = ref<
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
        rules: 'required',
        component: 'Input',
        fieldName: 'windowCode',
        label: '窗口编号',

        componentProps: computed(() => ({
          placeholder: '请输入窗口编号',
          disabled: formMode.value === ModalMode.edit,
        })),
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        rules: 'required',
        component: 'Input',
        fieldName: 'windowName',
        label: '窗口名称',
        componentProps: {
          placeholder: '请输入窗口名称',
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/warehouseAction/queryWarehouse.do?type=mc',
          placeholder: '请选择药房',
          paginate: false,
          showSearch: true,
          filterByFrontEnd: true,
          labelField: 'name',
          valueField: 'warehouseId',
          afterFetch: ({ rows: records }: { rows: any[] }) => ({ records }),
        }),
        fieldName: 'warehouseId',
        label: '所属药房',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => ({
      //     dictUrl: '/datatable/getDict/entity:edi.site',
      //     placeholder: '请选择',
      //     paginate: false,
      //     showSearch: true,
      //     filterByFrontEnd: true,
      //     showChooseAll: '',
      //     afterFetch: (records: any[]) => ({ records }),
      //   }),
      //   fieldName: 'siteId',
      //   label: '所属科室',
      //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
      //   defaultValue: '',
      //   rules: 'required',
      // },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => ({
      //     dictUrl: '/datatable/getDict/entity:edi.site',
      //     placeholder: '请选择',
      //     paginate: false,
      //     showSearch: true,
      //     filterByFrontEnd: true,
      //     showChooseAll: '',
      //     afterFetch: (records: any[]) => ({ records }),
      //   }),
      //   fieldName: 'warehouseId',
      //   label: '所属院区',
      //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
      //   defaultValue: '',
      //   rules: 'required',
      // },
      {
        component: 'Input',
        fieldName: 'bindIp',
        label: '主机IP',
        componentProps: {
          placeholder: '请输入主机IP',
        },
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      // {
      //   component: 'Switch',
      //   componentProps: () => ({
      //     checkedValue: '1',
      //     checkedChildren: '开启',
      //     unCheckedValue: '0',
      //     unCheckedChildren: '关闭',

      //     style: {
      //       width: 'auto',
      //     },
      //   }),
      //   fieldName: 'windowStatus',
      //   label: '手工发药',
      //   formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      //   defaultValue: '1',
      // },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: 'Y',
          checkedChildren: '是',
          unCheckedValue: 'N',
          unCheckedChildren: '否',

          style: {
            width: 'auto',
          },
        }),
        fieldName: 'isActive',
        label: '是否启用',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        defaultValue: 'Y',
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: 'Y',
          checkedChildren: '是',
          unCheckedValue: 'N',
          unCheckedChildren: '否',

          style: {
            width: 'auto',
          },
        }),
        fieldName: 'isPrintLabel',
        label: '是否打印瓶签',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        defaultValue: 'N',
      },
      {
        component: 'Switch',
        componentProps: () => ({
          checkedValue: 'Y',
          checkedChildren: '是',
          unCheckedValue: 'N',
          unCheckedChildren: '否',

          style: {
            width: 'auto',
          },
        }),
        fieldName: 'isSpecialMerge',
        label: '特殊医嘱是否合并拣货',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        defaultValue: 'N',
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
        submit: (params: any) => saveWindowAction(params),
      })
      .open();
  }
  function handleEdit(form: Record<string, any>) {
    formMode.value = ModalMode.edit;

    modificationModalRef.value?.modalApi
      .setData({
        title: '编辑',
        form,
        submit: (params: any) =>
          saveWindowAction({
            ...params,
            windowId: form.windowId,
          }),
      })
      .open();
  }

  return {
    modificationModalRef,
    formOption,
    handleAdd,
    handleEdit,
  };
}

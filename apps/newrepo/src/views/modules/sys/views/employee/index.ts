import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';
import type { VxeGridApi } from '@vben/plugins/src/vxe-table/api.ts';

import { computed, ref } from 'vue';

import { message, Modal } from 'ant-design-vue';

import {
  createEmployee,
  createEmployeePartTime,
  delEmployee,
  delEmployeePartTime,
  updateEmployee,
  updateEmployeePartTime,
} from '#/views/modules/sys/views/employee/api/employee.ts';

enum ModalMode {
  add,
  edit,
  view,
}

export function useCommonModal(gridApi: VxeGridApi, subGridApi: VxeGridApi) {
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

  const formMode = ref<ModalMode>(ModalMode.add);

  const formOption: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.dept',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'deptId',
        label: '部门',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'name',
        label: '姓名',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'employeeCode',
        label: '员工编码',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/sys.employee.employeeType',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'employeeType',
        label: '员工类别',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Select',
        componentProps: {
          allowClear: true,
          options: [
            {
              label: '男',
              value: '1',
            },
            {
              label: '女',
              value: '2',
            },
          ],
          placeholder: '请选择',
        },
        fieldName: 'sex',
        label: '性别',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'DatePicker',
        componentProps: {
          allowClear: true,
          valueFormat: 'YYYY-MM-DD',
        },
        fieldName: 'birthday',
        label: '生日',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/sys.employee.idCardType',
          placeholder: '请选择',
          paginate: false,
          allowClear: true,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'idCardType',
        label: '证件类型',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'idCardNo',
        label: '证件号码',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'mobile',
        label: '手机',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'telephone',
        label: '固话',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'email',
        label: '邮箱',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.position',
          placeholder: '请选择',
          paginate: false,
          allowClear: true,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'positionId',
        label: '主岗位',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.employee',
          placeholder: '请选择',
          paginate: false,
          allowClear: true,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'supervisorId',
        label: '上级主管',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/sys.employee.dataScope',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'dataScope',
        label: '权限级别',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/pageDict/entity:sys.user',
          placeholder: '请选择',
          allowClear: true,
          paginate: false,
        })),
        fieldName: 'userId',
        label: '登录用户',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
      },
      {
        component: 'Input',
        fieldName: 'remark',
        label: '备注',
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
        fieldName: 'isActive',
        label: '是否启用',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
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
    layout: 'horizontal',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.org',
          placeholder: '请选择',
          paginate: false,
          disabled: true,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'orgId',
        label: '机构',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: computed(() => ({
          dictUrl: '/datatable/dict/entity:sys.employee',
          placeholder: '请选择',
          paginate: false,
          disabled: true,
          afterFetch: (records: any) => ({ records }),
        })),
        fieldName: 'employeeId',
        label: '员工',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'ChcSelect',
        componentProps: () => ({
          dictUrl: '/datatable/dict/entity:sys.position?orgId={{orgId}}',
          placeholder: '请选择',
          paginate: false,
          afterFetch: (data) => {
            return {
              records: data,
            };
          },
          triggerFields: ['orgId'],
        }),
        dependencies: {
          trigger(values: any) {
            const positionIdRef =
              subModificationModalRef.value?.formApi?.getFieldComponentRef(
                'positionId',
              );
            if (positionIdRef?.params) {
              // 编辑时防止初始加载时清除已填写的值
              if (positionIdRef.params.dependencies.orgId) {
                subModificationModalRef.value?.formApi?.setFieldValue(
                  'positionId',
                  undefined,
                );
              }
              positionIdRef.params.dependencies = {
                orgId: values.orgId,
              };
              positionIdRef.fetchApi();
            }
          },
          triggerFields: ['orgId'],
        },
        fieldName: 'positionId',
        label: '岗位',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
        rules: 'required',
      },
      {
        component: 'Input',
        fieldName: 'remark',
        label: '备注',
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
        fieldName: 'isActive',
        label: '是否启用',
        formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[0px] pl-[4px]',
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

  function handleAdd() {
    formMode.value = ModalMode.add;
    modificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        submit: (params: any) => createEmployee(params),
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
          updateEmployee({
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
          await delEmployee(id);
          message.success('操作成功');

          gridApi.reload();
        } catch {}
      },
    });
  }

  function handleSubAdd() {
    const { orgId, id } = gridApi.grid.getRadioRecord();

    formMode.value = ModalMode.add;
    subModificationModalRef.value?.modalApi
      .setData({
        title: '新增',
        form: { orgId, employeeId: id },
        submit: (params: any) => createEmployeePartTime(params),
      })
      .open();
  }
  function handleSubEdit({ id, ...form }: any) {
    formMode.value = ModalMode.edit;
    subModificationModalRef.value?.modalApi
      .setData({
        title: '编辑 ',
        form,
        submit: (params: any) =>
          updateEmployeePartTime({
            ...params,
            id,
          }),
      })
      .open();
  }
  function handleSubDel({ id }: any) {
    Modal.confirm({
      title: '提示',
      content: '此操作将永久删除选中的记录, 是否继续?',
      centered: true,
      okType: 'danger',
      onOk: async () => {
        try {
          await delEmployeePartTime(id);
          message.success('操作成功');

          subGridApi.reload();
        } catch {}
      },
    });
  }

  return {
    subModificationModalRef,
    modificationModalRef,
    formOption,
    subFormOption,
    handleAdd,
    handleEdit,
    handleDel,
    handleSubAdd,
    handleSubEdit,
    handleSubDel,
  };
}

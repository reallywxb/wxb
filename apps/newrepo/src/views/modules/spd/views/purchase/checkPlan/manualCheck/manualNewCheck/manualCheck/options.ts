import type { VbenFormProps } from '#/adapter/form';

export const commonFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: '姓名',
    },

    {
      component: 'Input',
      fieldName: 'username',
      label: '登录名',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: '用户编码',
    },
    {
      component: 'Input',
      fieldName: 'avatar',
      label: '头像',
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
    },
    {
      component: 'Input',
      fieldName: 'mobile',
      label: '手机',
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: '邮箱',
    },
    {
      component: 'Switch',
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
        style: {
          width: '40px',
        },
      },
      defaultValue: true,
      fieldName: 'isActive',
      label: '是否有效',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: '备注',
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
export const viewFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'Input',
      formItemClass: 'readOnly',
      componentProps: {
        disabled: true,
      },
      fieldName: 'name',
      label: '姓名',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'username',
      label: '登录名',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      componentProps: {
        disabled: true,
        autocomplete: 'autocomplete',
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'code',
      label: '用户编码',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'avatar',
      label: '头像',
    },
    {
      component: 'Select',
      componentProps: {
        disabled: true,
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
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'mobile',
      label: '手机',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'email',
      label: '邮箱',
    },
    {
      component: 'Switch',
      componentProps: {
        disabled: true,
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
        style: {
          width: '40px',
        },
      },
      defaultValue: true,
      fieldName: 'isActive',
      label: '是否有效',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      componentProps: {
        disabled: true,
      },
      formItemClass: 'col-span-2',
      label: '备注',
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

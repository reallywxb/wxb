import type { VbenFormProps } from '#/adapter/form';

// 这两个hook仅在完全使用组件自带的新增和编辑弹窗时才需要使用，用来完成新增和编辑表单的依赖交互

export const addFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/sys/org/pageOrgList',
          'data-testid': 'SelectHook-orgId', // 用于UI自动化的属性
          paginate: true,
        };
      },
      fieldName: 'orgId',
      label: '机构',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: 'sys/dept/deptList/{{orgId}}', // 数据接口地址
          fieldName: 'deptId', // 字段名
          paginate: false, // 有paginate时，会自动在接口添加分页参数
          showSearch: true, // 是否可以输入文本搜索
          'data-testid': 'SelectHook-deptId', // 用于UI自动化的属性
        };
      },
      dependencies: {
        triggerFields: ['orgId'],
      },
      fieldName: 'deptId',
      label: '部门',
    },
    {
      component: 'Input',
      componentProps: {
        'data-testid': 'Input-name', // 用于UI自动化的属性
      },
      fieldName: 'name',
      label: '姓名',
    },
    {
      component: 'Input',
      componentProps: {
        'data-testid': 'Input-username', // 用于UI自动化的属性
      },
      fieldName: 'username',
      label: '登录名',
      rules: 'required',
    },
    {
      component: 'InputPassword',
      componentProps: {
        autocomplete: 'autocomplete',
        'data-testid': 'InputPassword-password', // 用于UI自动化的属性
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/sys.user.userType',
          'data-testid': 'SelectHook-userType', // 用于UI自动化的属性
        };
      },
      fieldName: 'userType',
      label: '用户类型',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/datatable/getDict/sys.user.dataScope',
          'data-testid': 'SelectHook-dataScope', // 用于UI自动化的属性
        };
      },
      fieldName: 'dataScope',
      label: '机构权限',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        'data-testid': 'Input-code', // 用于UI自动化的属性
        allowClear: true,
      },
      fieldName: 'code',
      label: '用户编码',
    },
    {
      component: 'Input',
      componentProps: {
        'data-testid': 'Input-avatar', // 用于UI自动化的属性
      },
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
        'data-testid': 'Select-sex', // 用于UI自动化的属性
      },
      fieldName: 'sex',
      label: '性别',
    },
    {
      component: 'Input',
      componentProps: {
        'data-testid': 'Input-mobile', // 用于UI自动化的属性
      },
      fieldName: 'mobile',
      label: '手机',
    },
    {
      component: 'Input',
      componentProps: {
        'data-testid': 'Input-email', // 用于UI自动化的属性
      },
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
        'data-testid': 'Switch-isActive', // 用于UI自动化的属性
      },
      defaultValue: true,
      fieldName: 'isActive',
      label: '是否有效',
    },
    {
      component: 'Textarea',
      componentProps: {
        'data-testid': 'Textarea-remark', // 用于UI自动化的属性
      },
      fieldName: 'remark',
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
export const viewFormOptions: VbenFormProps = {
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/sys/org/pageOrgList',
          paginate: true,
          disabled: true,
          'data-testid': 'SelectHook-orgId', // 用于UI自动化的属性
        };
      },
      fieldName: 'orgId',
      label: '机构',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          disabled: true,
          dictUrl: 'sys/dept/deptList/{{orgId}}', // 数据接口地址
          fieldName: 'deptId', // 字段名
          paginate: false, // 有paginate时，会自动在接口添加分页参数
          showSearch: true, // 是否可以输入文本搜索
          'data-testid': 'SelectHook-deptId', // 用于UI自动化的属性
        };
      },
      dependencies: {
        triggerFields: ['orgId'],
      },
      fieldName: 'deptId',
      label: '部门',
    },
    {
      component: 'Input',
      // formItemClass: 'readOnly',
      componentProps: {
        disabled: true,
        'data-testid': 'Input-name', // 用于UI自动化的属性
      },
      fieldName: 'name',
      label: '姓名',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
        'data-testid': 'Input-username', // 用于UI自动化的属性
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
        'data-testid': 'InputPassword-password', // 用于UI自动化的属性
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          disabled: true,
          dictUrl: '/datatable/getDict/sys.user.userType',
          'data-testid': 'SelectHook-userType', // 用于UI自动化的属性
        };
      },
      fieldName: 'userType',
      label: '用户类型',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          disabled: true,
          dictUrl: '/datatable/getDict/sys.user.dataScope',
          'data-testid': 'SelectHook-dataScope', // 用于UI自动化的属性
        };
      },
      fieldName: 'dataScope',
      label: '机构权限',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
        'data-testid': 'Input-code', // 用于UI自动化的属性
      },
      fieldName: 'code',
      label: '用户编码',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
        'data-testid': 'Input-avatar', // 用于UI自动化的属性
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
        'data-testid': 'Select-sex', // 用于UI自动化的属性
      },
      fieldName: 'sex',
      label: '性别',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
        'data-testid': 'Input-mobile', // 用于UI自动化的属性
      },
      fieldName: 'mobile',
      label: '手机',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
        'data-testid': 'Input-email', // 用于UI自动化的属性
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
        'data-testid': 'Switch-isActive', // 用于UI自动化的属性
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
        'data-testid': 'Textarea-remark', // 用于UI自动化的属性
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

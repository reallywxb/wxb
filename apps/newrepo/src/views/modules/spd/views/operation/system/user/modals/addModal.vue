<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { getDepTree, saveAccount } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('添加用户');
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // bug-view-681 补充修改
    const { schema } = baseFormApi.getState() as VbenFormProps;

    const defaultValues = Object.fromEntries(
      schema!.map(({ fieldName, defaultValue }) => [fieldName, defaultValue]),
    );

    modalApi.setData(defaultValues);
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<Record<string, any>>();
      title.value = serviceData.value.AD_User_ID ? '修改用户' : '新增用户';
      setTimeout(() => {
        ChcGridApi.query();
        baseFormApi.setValues({
          ...serviceData.value,
          defaultDepartmentId: serviceData.value.DefaultDepartmentId,
          userCode: serviceData.value.UserCode,
          phone: serviceData.value.Phone,
        });
      }, 100);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[120px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'RealName',
      label: '用户姓名',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入用户姓名',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'Name',
      label: '登录名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入登录名称',
        };
      },
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: '登录密码',
      rules: 'required',

      componentProps: () => {
        return {
          placeholder: '请输入登录密码',
        };
      },
      dependencies: {
        triggerFields: ['UserType'],
        show: () => {
          return !serviceData.value.AD_User_ID;
        },
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/userOrgList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择机构',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          defaultValue: '',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      formItemClass: 'col-start-1',
      rules: 'required',
      fieldName: 'AD_Org_ID',
      label: '机构',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: `/baseHandleAction/refList.do?id=1000506`,
          // showSearch: true,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择用户类型',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      fieldName: 'UserType',
      label: '用户类型',
    },
    {
      component: 'InputPassword',
      fieldName: 'conPassword',
      label: '确认密码',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入确认密码',
          triggerFields: ['UserType'],
        };
      },
      dependencies: {
        triggerFields: ['UserType'],
        show: () => {
          return !serviceData.value.AD_User_ID;
        },
      },
    },
    {
      component: 'ApiTreeSelect',
      componentProps: () => {
        return {
          placeholder: '请输入部门',
          api: () => getDepTree({ userId: '-1' }),
          filterTreeNode(input: string, node: Recordable<any>) {
            if (!input || input.length === 0) {
              return true;
            }
            const title: string = node.label ?? '';
            if (!title) return false;
            return title.includes(input);
          },
          showSearch: true,
          treeNodeFilterProp: 'label',
          labelField: 'name',
          valueField: 'id',
          // treeCheckable: true,
          childrenField: 'children',
        };
      },
      formItemClass: 'col-start-1',
      fieldName: 'defaultDepartmentId',
      label: '部门',
      rules: 'required',
      dependencies: {
        triggerFields: ['isConsortium'],
        show: () => {
          // 医供体账号不显示部门 isConsortium为true
          return !serviceData.value.isConsortium;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'userCode',
      label: '员工号',
      // formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          //  autocomplete: 'off',  // 禁止自动填充
          placeholder: '请输入员工号',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'IDCard',
      label: '身份证号',
      componentProps: () => {
        return {
          placeholder: '请输入身份证号',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: '手机号码',
      componentProps: () => {
        return {
          placeholder: '请输入手机号码',
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'IsActive',
      label: '是否有效',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isDispenser',
      label: '配药人',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isVerify',
      label: '核对人',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-3',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,

      checkboxConfig: {
        highlight: true,
      },
      pagerConfig: {
        enabled: false,
      },
    }),
  },
  {
    id: 'addUserTable',
    queryUrl: '/userBaseHandleAction/queryRole.do',
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
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
        field: 'AD_Role_ID',
        title: '角色编码',
        width: '150px',
        sortable: true,
      },
      {
        field: 'RoleName',
        title: '角色名称',
        sortable: true,
      },
      {
        field: 'OrgName',
        title: '机构名称',
        width: '150px',
        sortable: true,
      },
    ],

    gridEvents: {},
    afterFetchFn: (params: any) => {
      const checkRows = params.rows.filter((item: any) => item.IsUsed === 'Y');
      if (checkRows.length > 0) {
        setTimeout(() => {
          ChcGridApi.grid.setCheckboxRow(checkRows, true);
        }, 200);
      }
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        adUserId: serviceData.value.AD_User_ID || undefined,
      };
    },
  },
);

async function onSubmit() {
  const checkedArr = ChcGridApi.grid.getCheckboxRecords();
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();

    const params: any = {
      ...formData,
      adRoleIds: checkedArr.map((item: any) => item.AD_Role_ID),
      isUpdatePassword: serviceData.value.AD_User_ID ? 'N' : 'Y',
      AD_User_ID: serviceData.value.AD_User_ID || undefined,
    };
    if (formData.defaultDepartmentId) {
      const arr = [
        {
          departmentId: formData.defaultDepartmentId,
          isChecked: true,
        },
      ];

      if (
        serviceData.value.AD_User_ID &&
        serviceData.value.DefaultDepartmentId &&
        serviceData.value.DefaultDepartmentId !== formData.defaultDepartmentId
      ) {
        arr.push({
          departmentId: serviceData.value.DefaultDepartmentId,
          isChecked: false,
        });
      }
      params.departmentUserDefaultAccess = JSON.stringify(arr);
    }

    saveAccount(params).then((res) => {
      if (res && res.success) {
        message.success({
          content: '保存成功',
        });
        modalApi.close();
        emit('close');
      }
    });
  }
}
</script>
<template>
  <Modal class="h-[800px] w-[900px]" :title="title" title-tooltip="">
    <Page content-class="p-[0.5rem]">
      <BaseForm />
      <ChcGrid class="h-[310px] w-full flex-1 overflow-hidden" />
    </Page>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_addModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>

<style lang="less" scoped>
.form-title {
  // margin-left: 20px;
  margin-bottom: 20px;
  padding: 0 10px;
  font-size: 20px;
  font-weight: 500;
}
</style>

<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { openAccount, queryOpenAccountFields } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('新增机构');
const defaultFieldData = ref<any>({});
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  closeOnClickModal: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      queryOpenAccountFields({}).then((res) => {
        defaultFieldData.value = {};
        res.rows?.forEach((config: any) => {
          config.itemList.forEach((item: any) => {
            const name = `config_${item.configItemId}`;
            defaultFieldData.value[name] =
              item.itemType === 'lookup' ? '' : item.defaultValue || '';
          });
        });
      });
      serviceData.value = modalApi.getData<Record<string, any>>();
      setTimeout(() => {
        baseFormApi.setValues(serviceData.value);
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
    // TOOD: 测试要求增加一个租户的选择下拉框
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: 'baseHandleAction/queryTenantList',
          placeholder: '请选择租户',
          paginate: false,
          // showChooseAll: '',
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.data };
          },
        };
      },
      fieldName: 'tenantId',
      label: '租户',
      // rules: 'selectRequired', // 去除租户必填校验
    },
    {
      component: 'Input',
      fieldName: 'OrgName',
      label: '机构名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入机构名称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'PrintName',
      label: '机构简称',
      componentProps: () => {
        return {
          placeholder: '请输入机构简称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'Value',
      label: '机构编码',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入机构编码',
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: `/baseHandleAction/serverList.do?validation=${encodeURIComponent("IsSelfServer!='Y'")}`,
          // showSearch: true,
          placeholder: '请选择HIS系统',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          // extraParams: {
          //   validation: "IsSelfServer!='Y'"
          // },
          showChooseAll: false,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      // rules: 'required',
      fieldName: 'AD_Server_ID',
      label: 'HIS系统',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/serverList.do',
          // showSearch: true,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择主数据系统',
          showChooseAll: false,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      // rules: 'required',
      fieldName: 'Product_Server_ID',
      label: '主数据系统',
    },
    {
      component: 'Switch',
      fieldName: 'Isactive',
      label: '是否有效',
      // formItemClass: 'input-nostyle pb-1',
      defaultValue: 'Y',
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
      component: 'Textarea',
      componentProps: () => {
        return {
          placeholder: '请输入备注',
          type: 'textarea',
        };
      },
      formItemClass: 'col-span-2',
      fieldName: 'Description',
      label: '备注',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

const [AdminForm, adminFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'w-[120px]',
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
      fieldName: 'AdminUserName',
      label: '管理员登录名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入管理员登录名称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'AdminRoleName',
      label: '管理员角色名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入管理员角色名称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'AdminPassword',
      label: '管理员登录密码',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入管理员登录密码',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'AdminConfirmPassword',
      label: '确认密码',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入确认密码',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});
async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  const adminValidateResult = await adminFormApi.validate();
  if (validateResult.valid && adminValidateResult.valid) {
    const formData = await baseFormApi.getValues();
    const adminFormData = await adminFormApi.getValues();
    const params = {
      ...formData,
      ...adminFormData,
      ...defaultFieldData.value,
    };
    // 去除Object中的undefined属性
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });
    // 过滤掉params中值为unddefined|null|''的属性
    // const filterParams = Object.fromEntries(
    //   Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''),
    // );
    openAccount(params).then((res) => {
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
  <Modal class="w-[900px]" :title="title" title-tooltip="">
    <div class="form-title">基本信息</div>
    <BaseForm />
    <div class="form-title">管理员信息</div>
    <AdminForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_addModal"
      >
        保存
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

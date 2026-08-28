<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isString } from '@vben/utils';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveOrg } from '../api';

const emit = defineEmits(['close']);
const orgData = ref<any>({});
const title = ref('编辑机构');
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
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
      orgData.value = modalApi.getData<Record<string, any>>();
      setTimeout(() => {
        baseFormApi.setValues({
          ...orgData.value,
          EntId: orgData.value.EntID,
        });
        // 租户回显
        baseFormApi.setFieldValue(
          'tenantId',
          isString(orgData.value.AD_Client_ID)
            ? Number(orgData.value.AD_Client_ID)
            : orgData.value.AD_Client_ID,
        );
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
      formItemClass: 'col-start-1',
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
      formItemClass: 'col-start-1',
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
      formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          placeholder: '请输入HIS机构编码',
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
            const rows =
              res.rows?.map((item: any) => ({
                ...item,
                id: item.id.toString(),
              })) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      formItemClass: 'col-start-1',
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
          showChooseAll: false,
          placeholder: '请选择主数据系统',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.map((item: any) => ({
                ...item,
                id: item.id.toString(),
              })) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      formItemClass: 'col-start-1',
      // rules: 'required',
      fieldName: 'Product_Server_ID',
      label: '主数据系统',
    },
    {
      component: 'Input',
      fieldName: 'RefEntID',
      label: '码上放心编码',
      formItemClass: 'col-start-1',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入RefEntId',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'EntId',
      label: 'EntId',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入EntId',
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
      fieldName: 'IsConsortium',
      label: '是否医共体',
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

async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();
    saveOrg({
      ...formData,
      AD_Org_ID: orgData.value.AD_Org_ID || undefined,
    }).then((res) => {
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
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_editModal"
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

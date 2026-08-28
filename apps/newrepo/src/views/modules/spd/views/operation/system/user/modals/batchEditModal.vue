<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { batchUpdateUser, getDepTree } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onConfirm() {},
  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<any>();
      setTimeout(() => {
        baseFormApi.setValues({
          defaultDepartmentId: '',
          UserType: '',
        });
      }, 100);
    }
  },
  onOpened() {},
});

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    labelClass: 'w-[70px]',
    componentProps: {
      class: 'w-full',
    },
  },
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: `/baseHandleAction/refList.do?id=1000506`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择用户类型',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'UserType',
      label: '用户类型',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: () => {
        return {
          placeholder: '请输入部门',
          api: () => getDepTree({ userId: '-1' }),
          filterTreeNode(input: string, node: any) {
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
          showChooseAll: false,
          valueField: 'id',
          childrenField: 'children',
        };
      },
      fieldName: 'defaultDepartmentId',
      label: '部门',
    },
  ],
  wrapperClass: 'grid-cols-2',
});

async function onSubmit() {
  const selectedUsers = serviceData.value.selectedUsers || [];
  if (selectedUsers.length === 0) {
    message.error('请选择要修改的用户');
    return;
  }

  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();

    // 检查是否至少填写了一个字段
    if (!formData.UserType && !formData.defaultDepartmentId) {
      message.warning('请至少修改用户类型或部门中的一个');
      return;
    }

    const params: any = {
      userIdList: selectedUsers.map((item: any) => item.AD_User_ID),
    };
    if (formData.UserType) {
      params.UserType = formData.UserType;
    }
    if (formData.defaultDepartmentId) {
      params.defaultDepartmentId = formData.defaultDepartmentId;
    }

    batchUpdateUser(params).then((res: any) => {
      if (res && res.success) {
        message.success({
          content: `成功修改 ${selectedUsers.length} 条记录`,
        });
        modalApi.close();
        emit('close');
      }
    });
  }
}
</script>
<template>
  <Modal class="w-[600px]" title="批量修改用户" title-tooltip="">
    <Page content-class="p-[0.5rem]">
      <p class="mb-4 text-sm text-gray-500">
        已选择
        <span class="font-medium text-blue-600">{{
          (serviceData.selectedUsers || []).length
        }}</span>
        条记录
      </p>
      <BaseForm />
    </Page>
    <template #prepend-footer>
      <Button type="primary" @click="onSubmit"> 提交 </Button>
    </template>
  </Modal>
</template>

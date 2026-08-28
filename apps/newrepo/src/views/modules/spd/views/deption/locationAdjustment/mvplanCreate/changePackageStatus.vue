<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const data = ref<any>({
  paramLine: [],
});
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    const validateResult = await baseFormApi.validate();
    if (validateResult.valid) {
      const formValues = await baseFormApi.getValues();
      requestFormClient
        .post('movementAction/batchMovePackage.do', {
          ...data.value.params,
          ...formValues,
        })
        .then(() => {
          modalApi.close();
          data.value.callback();
        });
    }
    // console.log(validateResult);
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      setTimeout(() => {
        (baseFormApi.getFieldComponentRef('checkUser2') as SelectComponentRef)
          ?.fetchApi!();
      }, 0);
    }
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[90px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  showDefaultActions: false,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/warehouseAction/warehouseUserList.do',
          placeholder: '请选择库存状态',
          paginate: false,
          // showChooseAll: '',
          immediate: false,
          labelField: 'name',
          valueField: 'id',
          handleParams: (params: any) => {
            return {
              ...params,
              dictUrl: `/baseHandleAction/refList.do?id=1000346`,
            };
          },
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      // defaultValue: '',
      rules: 'selectRequired',
      fieldName: 'storageStatusTo',
      label: '库存状态',
      formItemClass: 'pb-5 col-span-1',
    },
    // {
    //   // 组件需要在 #/adapter.ts内注册，并加上类型
    //   component: 'InputPassword',
    //   // 对应组件的参数
    //   componentProps: {
    //     placeholder: '请输入密码',
    //   },
    //   fieldName: 'password',
    //   label: '密码',
    //   formItemClass: 'pb-5 col-span-1',
    //   rules: 'required',
    // },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Modal class="w-[500px]" title="变更库存状态" title-tooltip="变更库存状态">
    <BaseForm />
  </Modal>
</template>

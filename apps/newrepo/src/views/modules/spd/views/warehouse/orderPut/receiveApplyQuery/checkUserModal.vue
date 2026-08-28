<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';

const data = ref<any>({
  paramLine: [],
});
const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    const formValues = await baseFormApi.getValues();
    await data.value.callBack(formValues);
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      setTimeout(() => {
        // console.log(
        //   'onOpenChange:',
        //   data.value,
        //   baseFormApi.getFieldComponentRef('checkUser2'),
        // );
        baseFormApi.getFieldComponentRef('checkUser2')?.fetchApi();
      }, 0);

      // baseFormApi.getFieldComponentRef('checkUser2')?.fetchApi();
    }
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[80px]',
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
          placeholder: '请选择第二作业人',
          paginate: false,
          // showChooseAll: '',
          immediate: false,
          labelField: 'name',
          valueField: 'id',
          handleParams: (params: any) => {
            return {
              ...params,
              dictUrl: `/warehouseAction/warehouseUserList.do?readWrite=Y&excludeSelf=Y&userType=${
                data.value.userType || ''
              }&warehouseId=${data.value.warehouseId}`,
            };
          },
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'checkUser2',
      label: '第二作业人',
      formItemClass: 'pb-6 col-span-1',
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'InputPassword',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
      formItemClass: 'pb-[0px] col-span-1',
      // rules: 'required',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Modal class="w-[600px]" title="双人作业" title-tooltip="双人作业">
    <BaseForm />
    <!-- <Button type="primary" @click="lockModal">锁定弹窗</Button> -->
  </Modal>
</template>

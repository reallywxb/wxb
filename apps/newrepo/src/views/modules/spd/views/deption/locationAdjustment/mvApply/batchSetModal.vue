<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';

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
      data.value.records.forEach((item: any) => {
        item.locatorIdTo = formValues.locatorIdTo;
        item.storageStatusTo = formValues.storageStatusTo;
        item.description = formValues.description;
        item.storageStatusToName = nameObj.value.storageStatusToName;
        item.locatorNameTo = nameObj.value.locatorNameTo;
      });
      modalApi.close();
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
        (baseFormApi.getFieldComponentRef('locatorIdTo') as SelectComponentRef)
          ?.fetchApi!();
      }, 0);
    }
  },
});
const nameObj = ref({
  storageStatusToName: '',
  locatorNameTo: '',
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
          placeholder: '请选择',
          paginate: false,
          allowClear: true,
          // showChooseAll: '',
          immediate: false,
          labelField: 'name',
          valueField: 'id',
          showChooseAll: false,
          handleParams: (params: any) => {
            return {
              ...params,
              dictUrl: `/warehouseAction/locatorList.do?isScatter=Y&warehouseId=${data.value.records[0].warehouseId}`,
            };
          },
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          onChange(_: any, option: any) {
            nameObj.value.locatorNameTo = option?.name;
          },
        };
      },
      rules: 'selectRequired',
      fieldName: 'locatorIdTo',
      label: '新货位',
      formItemClass: 'pb-5 col-span-1',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl:
            "/baseHandleAction/refList.do?id=1000346&validation=ad_ref_list.value in('H','S','R','N')",
          placeholder: '请选择',
          autoChooseFirstOption: true,
          paginate: false,
          // showChooseAll: '',
          immediate: true,
          showChooseAll: false,
          onChange(_: any, option: any) {
            nameObj.value.storageStatusToName = option.name;
          },
          onLoad(val: any) {
            nameObj.value.storageStatusToName = val[0].name;
          },
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'selectRequired',
      fieldName: 'storageStatusTo',
      label: '新存货状态',
      formItemClass: 'pb-5 col-span-1',
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入备注',
      },
      fieldName: 'description',
      label: '备注',
      formItemClass: 'pb-5 col-span-1',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Modal class="w-[500px]" title="批量设置" title-tooltip="批量设置">
    <BaseForm />
  </Modal>
</template>

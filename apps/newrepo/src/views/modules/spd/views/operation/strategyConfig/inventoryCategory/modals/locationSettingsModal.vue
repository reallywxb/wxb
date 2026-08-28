<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('货位设置');

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'ChcSelect',
      fieldName: 'sectionId',
      label: '库区',
      formItemClass: 'col-span-2  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: `/warehouseAction/sectionList.do?warehouseId=${
            modalData.value?.row?.warehouseId
          }`,
          placeholder: '请选择库区',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'locatorIdFrom',
      label: '开始货位',
      formItemClass: 'col-span-2 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: `/warehouseAction/locatorList.do?warehouseId=${
            modalData.value?.row?.warehouseId
          }`,
          placeholder: '请选择开始货位',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'locatorIdTo',
      label: '结束货位',
      formItemClass: 'col-span-2 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: `/warehouseAction/locatorList.do?warehouseId=${
            modalData.value?.row?.warehouseId
          }`,
          placeholder: '请选择结束货位',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
  ],
});

const isSubmiting = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '提交',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (isSubmiting.value) {
      message.warning('正在提交！');
      return false;
    }
    isSubmiting.value = true;

    const formValues = await baseFormApi.getValues();

    if (!formValues.sectionId) {
      message.warning('库区不能为空！');
      return;
    }
    const inventoryStrategyId = modalData.value?.row?.inventoryStrategyId;
    if (!inventoryStrategyId) {
      message.warning('请选择盘点策略！');
      return;
    }
    const params: Record<string, any> = {
      inventoryStrategyId,
      sectionId: formValues.sectionId,
      locatorIdFrom: formValues.locatorIdFrom,
      locatorIdTo: formValues.locatorIdTo,
    };

    console.warn('onConfirm params', params);
    try {
      await requestFormClient.post(
        '/inventoryStrategyAction/createInveStraAllocation.do',
        params,
      );
      message.success('成功');
      modalApi.close();
      baseFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.error(error);
    } finally {
      isSubmiting.value = false;
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[320px] w-[500px]">
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

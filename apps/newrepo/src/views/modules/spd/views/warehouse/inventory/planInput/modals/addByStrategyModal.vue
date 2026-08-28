<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const props = defineProps<{
  afterSubmit: () => void;
}>();

const modalData = ref<Record<string, any>>({});
const strategyExtraParams = ref({
  warehouseId: ''
})
const FormOptions: VbenFormProps = {
  compact: true,
  commonConfig: {
    colon: true,
    // 所有表单项
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
      fieldName: 'departmentId',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '院区',
      defaultValue: modalData.value.departmentId,
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          disabled: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'warehouseId',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '盘点仓库',
      defaultValue: modalData.value.warehouseId,
      disabled: true,
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'strategy',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '盘点策略',
      componentProps: () => {
        return {
          dictUrl: `/inventoryStrategyAction/listStrategy.do`,
          placeholder: '请选择',
          paginate: false,
          extraParams: strategyExtraParams.value,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'value',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          onChange(val: any, option: any) {
            console.warn('onChange val', val);
            console.warn('onChange option', option);
          },
        };
      },
    },
  ],
};

const [EditForm, FormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...FormOptions,
});

const submitLoading = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (submitLoading.value) {
      message.warning('提交中！');
      return;
    }
    const { valid } = await FormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await FormApi.getValues();
    console.warn('onConfirmformValues', formValues);
    const inventoryStrategyId = formValues.strategy;
    if (!inventoryStrategyId) {
      message.warning('请选择盘点策略！');
      return false;
    }
    const params: Record<string, any> = {};
    params.inventoryStrategyId = inventoryStrategyId;

   

    Modal.confirm({
      content: '确定要提交吗？',
      onOk: async () => {
        // 锁定弹窗，防止重复提交
        modalApi.lock();
        try {
          submitLoading.value = true;
          const res = await requestFormClient.post(
            `/inventoryPlanAction/createInventoryPlanByStrategy.do`,
            params,
          );
          if (res && res.success) {
            message.success('创建成功！');
            modalApi.close();
            props.afterSubmit();
          }
        } catch (error) {
          console.warn('err', error);
        } finally {
          submitLoading.value = false;
          modalApi.unlock();
        }
      },
      title: '确定',
    });
  },
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      console.warn('onOpenChange FormApi', FormApi);
      strategyExtraParams.value.warehouseId = modalData.value.warehouseId
      setTimeout(() => {
        FormApi.setValues({
          warehouseId: modalData.value.warehouseId,
          departmentId: modalData.value.departmentId,
        });
      }, 100);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst
    confirm-text="确定"
    title="生成盘点计划"
    class="h-[400px] w-[600px]"
  >
    <EditForm />
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>

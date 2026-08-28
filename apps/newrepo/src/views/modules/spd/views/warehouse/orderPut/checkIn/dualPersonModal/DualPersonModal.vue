<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { checkPassword } from '../api';
import { dualPersonFormOptions } from './dualPersonFormOptions';

const props = defineProps<{
  afterSubmit: (
    checkUser2: string,
    password: string,
    workerId2: number,
  ) => void;
}>();

// 存储当前的回调函数
let currentAfterSubmit:
  | ((checkUser2: string, password: string, workerId2: number) => void)
  | null = null;

const data = ref();
const warehouseId = ref('');

const lotExtraParams = ref({});

// 动态更新表单配置中的 warehouseId
const getFormOptions = (): VbenFormProps => {
  const options = { ...dualPersonFormOptions };
  // 更新 ChcSelect 组件的 extraParams
  const checkUser2Schema = options.schema?.find(
    (item) => item.fieldName === 'checkUser2',
  );
  if (
    checkUser2Schema &&
    typeof checkUser2Schema.componentProps === 'function'
  ) {
    const originalComponentProps = checkUser2Schema.componentProps;
    checkUser2Schema.componentProps = () => {
      const props = originalComponentProps();
      lotExtraParams.value = {
        ...props.extraParams,
        warehouseId: warehouseId.value,
      };
      return {
        ...props,
        extraParams: lotExtraParams.value,
        // extraParams: {
        //   ...props.extraParams,
        //   warehouseId: warehouseId.value,
        // },
      };
    };
  }
  return options;
};

const [DualPersonForm, dualPersonFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  ...getFormOptions(),
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    show: false,
  },
});

async function submitForm(values: any) {
  try {
    const res = await checkPassword({
      checkUser2: values.checkUser2,
      password: values.password,
    });

    if (res && res.success) {
      message.success('验证成功');
      modalApi.close();
      // 使用当前存储的回调函数
      if (currentAfterSubmit) {
        currentAfterSubmit(values.checkUser2, values.password, res.data);
      } else {
        props.afterSubmit(values.checkUser2, values.password, res.data);
      }
    } else {
      message.error(res?.msg || '验证失败');
    }
  } catch (error) {
    console.error('验证失败', error);
    // message.error('验证失败');
  }
}

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await dualPersonFormApi.validate();
    if (valid) {
      const values = await dualPersonFormApi.getValues();
      await submitForm(values);
    } else {
      message.error('请填写完整信息');
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const modalData = modalApi.getData<Record<string, any>>();
      data.value = modalData;

      // 存储传入的回调函数
      if (modalData?.onSuccess) {
        currentAfterSubmit = modalData.onSuccess;
      }

      // 更新 warehouseId
      if (modalData?.warehouseId) {
        warehouseId.value = modalData.warehouseId;
      }
    } else {
      // 清理回调函数
      currentAfterSubmit = null;
    }
  },
});

// 暴露 modalApi 给父组件使用
defineExpose({
  modalApi,
});

onMounted(() => {
  // 组件挂载后的初始化逻辑
});
</script>

<template>
  <Modal title="双人作业验证" :width="400">
    <DualPersonForm>
      <template v-for="(value, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </DualPersonForm>
  </Modal>
</template>

<script setup lang="ts">
import { useVbenForm, useVbenModal } from '@vben/common-ui';

import dayjs from 'dayjs';

// AI-GENERATED-BEGIN
// @date 2026-06-18
// @prompt 创建采购计划表单弹窗组件
// @description 包含要求送达时间等采购计划相关表单项的弹窗

// 表单
const [ProcurementPlanForm, procurementPlanFormApi] = useVbenForm({
  commonConfig: {
    labelWidth: 120,
  },
  schema: [
    {
      component: 'DatePicker',
      fieldName: 'deliveryPlanDate',
      label: '要求送达时间',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm',
        valueFormat: 'YYYY-MM-DD HH:mm',
        style: { width: '100%' },
      },
      defaultValue: dayjs(dayjs().format('YYYY-MM-DD'))
        .add(1, 'day')
        .add(10, 'hour')
        .format('YYYY-MM-DD HH:mm'),
    },
  ],
  showDefaultActions: false,
});

// 传递的回调
const emit = defineEmits<{
  confirm: [values: Record<string, any>];
}>();

// 弹窗
const [ProcurementPlanModal, procurementPlanModalApi] = useVbenModal({
  title: '生成请领计划',
  onConfirm: async () => {
    const values = await procurementPlanFormApi.getValues();
    emit('confirm', values);
    procurementPlanModalApi.close();
  },
});

// AI-GENERATED-END
</script>

<template>
  <ProcurementPlanModal>
    <div class="py-4">
      <ProcurementPlanForm />
    </div>
  </ProcurementPlanModal>
</template>

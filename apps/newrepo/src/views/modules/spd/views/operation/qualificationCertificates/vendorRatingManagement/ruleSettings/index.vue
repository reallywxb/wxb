<script setup lang="ts">
import { ref, toRaw } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button as AntButton,
  InputNumber as AntInputNumber,
  message,
} from 'ant-design-vue';
import { debounce } from 'lodash-es';

import { requestFormClient } from '#/api/request';

const rateList = [
  {
    fieldName: 'orderDeliveryOnTimeRate',
    label: '订单配送及时率',
  },
  {
    fieldName: 'acceptancePassRate',
    label: '验收合格率',
  },
  {
    fieldName: 'qualificationCertificatesMaintenanceRate',
    label: '资质证照维护率',
  },
  {
    fieldName: 'invoiceDeliveryOnTimeRate',
    label: '发票送达及时率',
  },
  {
    fieldName: 'hospitalRating',
    label: '院方评价',
  },
  {
    fieldName: 'stockOutRate',
    label: '缺货率',
  },
];
const rateIndexForm = ref<Record<string, number>>({
  // 订单配送及时率
  orderDeliveryOnTimeRate: 0,
  // 验收合格率
  acceptancePassRate: 0,
  // 资质证照维护率
  qualificationCertificatesMaintenanceRate: 0,
  // 发票送达及时率
  invoiceDeliveryOnTimeRate: 0,
  // 院方评价
  hospitalRating: 0,
  // 缺货率
  stockOutRate: 0,
});
const oldRateIndexForm = ref<Record<string, number>>({
  // 订单配送及时率
  orderDeliveryOnTimeRate: 0,
  // 验收合格率
  acceptancePassRate: 20,
  // 资质证照维护率
  qualificationCertificatesMaintenanceRate: 0,
  // 发票送达及时率
  invoiceDeliveryOnTimeRate: 0,
  // 院方评价
  hospitalRating: 0,
  // 缺货率
  stockOutRate: 0,
});
const init = () => {
  requestFormClient
    .post('/vendorRatingAction/queryVendorRatingRule')
    .then((res) => {
      (res.data || []).forEach((item: any) => {
        const fileName =
          rateList.find((o) => o.label === item.metricName)?.fieldName || '';

        if (fileName) {
          console.warn('item', item);
          console.warn('item fileName', fileName);
          rateIndexForm.value[fileName] = Number.parseInt(item.weightSetting);
          oldRateIndexForm.value[fileName] = Number.parseInt(
            item.weightSetting,
          );
        }
      });
    });
};
init();
// 是否进行表单提交
const isSubmitting = ref(false);
// 提交
const handleSubmit = debounce(
  async () => {
    if (isSubmitting.value) {
      return;
    }
    isSubmitting.value = true;
    try {
      const formValues = toRaw(rateIndexForm.value);
      console.warn('formValues', formValues);
      const list = Object.entries(formValues).map(([key, value]) => ({
        fieldName: key,
        weightSetting: value,
      }));
      console.warn('list', list);
      // 全部加起来必须为100
      const metricName = list
        .map(
          (item) =>
            rateList.find((o) => o.fieldName === item.fieldName)?.label || '',
        )
        .join(',');
      const weightSetting = list
        .map((item) => item.weightSetting.toString())
        .join(',');
      console.warn('metricName', metricName);
      console.warn('weightSetting', weightSetting);
      const sum = list.reduce((prev, cur) => prev + cur.weightSetting, 0);
      if (sum !== 100) {
        message.error('所有权重相加必须等于100');
        return;
      }
      await requestFormClient.post('/vendorRatingAction/saveVendorRatingRule', {
        metricName,
        weightSetting,
      });
      message.success('保存成功');
      init();
    } catch (error) {
      console.error('error', error);
    } finally {
      isSubmitting.value = false;
    }
  },
  500,
  { trailing: true, leading: true },
);
// 取消
const handleCancel = debounce(
  () => {
    if (isSubmitting.value) {
      return;
    }
    const obj = toRaw(oldRateIndexForm.value);
    rateIndexForm.value = { ...obj };
  },
  500,
  { trailing: true, leading: true },
);
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <div class="box-border h-full w-full bg-white p-4">
      <div class="box-border w-1/2">
        <div class="mb-4 box-border w-full text-left text-lg font-bold">
          评价指标
        </div>
        <div class="box-border w-full">
          <div
            class="box-border flex w-full items-center justify-start bg-[#efefef] py-2"
          >
            <div class="box-border flex-1 text-center font-bold">指标名称</div>
            <div class="box-border flex-1 text-center font-bold">权重设置</div>
          </div>
          <div
            v-for="item in rateList"
            :key="item.fieldName"
            class="box-border flex w-full items-center justify-start border-b border-solid border-[#f8f8f8] py-2"
          >
            <div class="box-border flex-1 text-center">{{ item.label }}</div>
            <div class="box-border flex flex-1 items-center justify-center">
              <AntInputNumber
                v-model:value="rateIndexForm[item.fieldName]"
                :min="0"
                :max="100"
                :step="1"
                :disabled="isSubmitting"
              />
            </div>
          </div>
        </div>
        <div
          class="box-border flex w-full items-center justify-center gap-10 pt-20"
        >
          <AntButton
            type="primary"
            @click="handleSubmit"
            :loading="isSubmitting"
          >
            保存
          </AntButton>
          <AntButton @click="handleCancel" :loading="isSubmitting">
            取消
          </AntButton>
        </div>
      </div>
    </div>
  </Page>
</template>
<style lang="less" scoped>
:deep(.ant-radio-wrapper) {
  margin-right: 20px;
}
</style>

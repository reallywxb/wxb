<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Button as AntButton, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { debounce } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

dayjs.extend(quarterOfYear);
const [QueryForm, queryFormApi] = useVbenForm({
  compact: true,
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    colon: true,
    labelWidth: 80,
  },

  layout: 'horizontal',
  wrapperClass: 'grid-cols-4',
  showDefaultActions: false,
  schema: [
    {
      component: 'ChcSelect',
      fieldName: 'vendorId',
      label: '供应商名称',
      formItemClass: 'col-span-1',
      componentProps: () => {
        return {
          placeholder: '请选择供应商名称',
          autoChooseFirstOption: false, // bug 2407
          dictUrl: '/vendorRatingAction/queryBparterList',
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'bPartnerName',
          valueField: 'bPartnerId',
          allowClear: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res?.data || [] };
          },
          onChange() {
            changeRateValues();
          },
        };
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'ratingPeriod',
      label: '考评周期',
      formItemClass: 'col-span-1',
      defaultValue: dayjs().format('YYYY-Q'),
      componentProps: () => {
        return {
          placeholder: '请选择考评周期',
          picker: 'quarter',
          format: 'YYYY年第Q季度',
          valueFormat: 'YYYY-Q',
          allowClear: false,
          onChange() {
            changeRateValues();
          },
        };
      },
    },
  ],
});

const [RateForm, rateFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },

    labelWidth: 200,
  },
  layout: 'vertical',
  wrapperClass: 'grid-cols-3',
  showDefaultActions: false,
  schema: [
    {
      component: 'RadioGroup',
      fieldName: 'priceSatisfaction',
      label: '1.价格满意度',
      formItemClass: 'col-span-3 col-start-1',
      componentProps: {
        class: 'pl-20 pt-3 ',
        options: Array.from({ length: 10 })
          .fill(0)
          .map((_, index) => ({
            label: index + 1,
            value: index + 1,
          })),
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'cooperation',
      label: '2.沟通配合度',
      formItemClass: 'col-span-3 col-start-1',
      componentProps: {
        class: 'pl-20 pt-3 ',
        options: Array.from({ length: 10 })
          .fill(0)
          .map((_, index) => ({
            label: index + 1,
            value: index + 1,
          })),
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'resolutionEfficiency',
      label: '3.问题解决效率',
      formItemClass: 'col-span-3 col-start-1',
      componentProps: {
        class: 'pl-20 pt-3 ',
        options: Array.from({ length: 10 })
          .fill(0)
          .map((_, index) => ({
            label: index + 1,
            value: index + 1,
          })),
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'emergencyResponse',
      label: '4.应急保障能力',
      formItemClass: 'col-span-3 col-start-1',
      componentProps: {
        class: 'pl-20 pt-3 ',
        options: Array.from({ length: 10 })
          .fill(0)
          .map((_, index) => ({
            label: index + 1,
            value: index + 1,
          })),
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'overallRating',
      label: '5.主观评分',
      formItemClass: 'col-span-3 col-start-1',
      componentProps: {
        class: 'pl-20 pt-3 ',
        options: Array.from({ length: 10 })
          .fill(0)
          .map((_, index) => ({
            label: index + 1,
            value: index + 1,
          })),
      },
    },
  ],
});
// 是否显示提交按钮
const isShowSubmitButton = ref(false);

const changeRateValues = async () => {
  const formValues = await queryFormApi.getValues();
  console.warn('formValues', formValues);
  try {
    const res = await requestFormClient.post(
      '/vendorRatingAction/queryVendorHospRating',
      {
        vendorId: formValues.vendorId,
        ratingPeriod: formValues.ratingPeriod,
      },
    );
    console.warn('res', res);
    const obj = res?.data[0] || {};
    isShowSubmitButton.value = isEmpty(obj);
    rateFormApi.setValues({
      priceSatisfaction: obj?.priceSatisfaction || 0,
      cooperation: obj?.cooperation || 0,
      resolutionEfficiency: obj?.resolutionEfficiency || 0,
      emergencyResponse: obj?.emergencyResponse || 0,
      overallRating: obj?.overallRating || 0,
    });
    // if (isShowSubmitButton.value) {
    //   // 表单可选择
    //   rateFormApi.setState({ commonConfig: { disabled: false } });
    // } else {
    //   // 表单禁止选择
    //   rateFormApi.setState({ commonConfig: { disabled: true } });
    // }
  } catch (error) {
    console.error('设置评价指标失败', error);
  }
};
// 是否进行表单提交
const isSubmitting = ref(false);
// 提交
const handleSubmit = debounce(
  async () => {
    const queryFormValues = await queryFormApi.getValues();
    const rateFormValues = await rateFormApi.getValues();
    if (isEmpty(queryFormValues.vendorId)) {
      message.error('请选择供应商');
      return;
    }
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    try {
      // 禁用表单
      queryFormApi.setState({ commonConfig: { disabled: true } });
      rateFormApi.setState({ commonConfig: { disabled: true } });
      console.warn('queryFormValues', queryFormValues);
      console.warn('rateFormValues', rateFormValues);
      if (!validateRatingFields(rateFormValues)) return;
      // if (isEmpty(rateFormValues.priceSatisfaction)) {
      //   message.error('价格满意度未评分');
      //   return;
      // }
      // if (isEmpty(rateFormValues.cooperation)) {
      //   message.error('沟通配合度未评分');
      //   return;
      // }
      // if (isEmpty(rateFormValues.resolutionEfficiency)) {
      //   message.error('问题解决效率未评分');
      //   return;
      // }
      // if (isEmpty(rateFormValues.emergencyResponse)) {
      //   message.error('应急保障能力未评分');
      //   return;
      // }
      // if (isEmpty(rateFormValues.overallRating)) {
      //   message.error('主观评分未评分');
      //   return;
      // }
      const params = {
        // 供应商ID
        vendorId: queryFormValues.vendorId,
        // 考评周期（年-季度）
        ratingPeriod: queryFormValues.ratingPeriod,
        // 价格满意度
        priceSatisfaction: rateFormValues.priceSatisfaction * 1,
        // 沟通配合度
        cooperation: rateFormValues.cooperation * 2,
        // 问题解决效率
        resolutionEfficiency: rateFormValues.resolutionEfficiency * 3,
        // 应急保障能力
        emergencyResponse: rateFormValues.emergencyResponse * 2,
        // 主观评分
        overallRating: rateFormValues.overallRating * 2,
      };
      const res = await requestFormClient.post(
        '/vendorRatingAction/saveVendorHospRating',
        params,
      );
      console.warn('res', res);
      message.success('提交成功');
      changeRateValues();
    } finally {
      isSubmitting.value = false;
      // 启用表单
      queryFormApi.setState({ commonConfig: { disabled: false } });
      rateFormApi.setState({ commonConfig: { disabled: false } });
    }
  },
  500,
  { trailing: true, leading: true },
);

// 定义校验配置
const RATING_FIELDS_CONFIG = [
  { field: 'priceSatisfaction', label: '价格满意度' },
  { field: 'cooperation', label: '沟通配合度' },
  { field: 'resolutionEfficiency', label: '问题解决效率' },
  { field: 'emergencyResponse', label: '应急保障能力' },
  { field: 'overallRating', label: '主观评分' },
] as const;

// 通用校验函数
const validateRatingFields = (values: Record<string, any>) => {
  for (const { field, label } of RATING_FIELDS_CONFIG) {
    const value = values[field];
    // 使用isEmpty 如果是默认值0 会导致校验无效
    if (typeof value !== 'number' || value === 0) {
      message.error(`${label}未评分`);
      return false;
    }
  }
  return true;
};
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <div class="box-border h-full w-full bg-white p-4">
      <QueryForm class="mb-4" />
      <RateForm />
      <div
        v-if="isShowSubmitButton"
        class="item-center box-border flex w-full justify-start gap-10 pl-20 pt-20"
      >
        <AntButton type="primary" @click="handleSubmit" :loading="isSubmitting">
          提交
        </AntButton>
      </div>
    </div>
  </Page>
</template>
<style lang="less" scoped>
:deep(.ant-radio-wrapper) {
  margin-right: 20px;
}
</style>

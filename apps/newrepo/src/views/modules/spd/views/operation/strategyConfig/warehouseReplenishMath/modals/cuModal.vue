<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
type ModalType = 'ADD' | 'EDIT';
const modalType = ref<ModalType>('ADD');

const [CuForm, cuFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 160,
  },
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
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
      component: 'Input',
      componentProps: {
        placeholder: '',
        maxlength: 20,
      },
      fieldName: 'replenishMathId',
      formItemClass: 'pl-[10px] pr-[10px] hidden',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: 'replenishMathId',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '',
        maxlength: 20,
      },
      fieldName: 'name',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '名称',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      fieldName: 'calculateMethod',
      label: '日均消耗计算方法',
      rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000559',
          placeholder: '请选择日均消耗计算方法',
          paginate: false,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          maxlength: 10,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入标准差系数',
        maxlength: 10,
        triggerFields: ['calculateMethod'],
      },
      fieldName: 'standardDiviationRatio',
      label: '标准差系数',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'A' || calculateMethod === 'V') {
            return true;
          }
          if (calculateMethod === 'L') {
            return false;
          }
          return false;
        },
        trigger(values) {
          console.warn('标准差系数 trigger values', values);
          if (
            values.calculateMethod === 'A' ||
            values.calculateMethod === 'V'
          ) {
            cuFormApi.setFieldValue('standardDiviationRatio', '');
          }
        },
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入周末消耗量系数',
        maxlength: 10,
        triggerFields: ['calculateMethod'],
      },
      fieldName: 'weekendRatio',
      label: '周末消耗量系数',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'A' || calculateMethod === 'V') {
            return true;
          }
          if (calculateMethod === 'L') {
            return false;
          }
          return false;
        },
        trigger(values) {
          if (
            values.calculateMethod === 'A' ||
            values.calculateMethod === 'V'
          ) {
            cuFormApi.setFieldValue('weekendRatio', '');
          }
        },
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入异常库存判断系数',
        maxlength: 10,
        triggerFields: ['calculateMethod'],
      },
      fieldName: 'unorQtyonhandRatio',
      label: '异常库存判断系数',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'A' || calculateMethod === 'V') {
            return true;
          }
          if (calculateMethod === 'L') {
            return false;
          }
          return false;
        },
        trigger(values) {
          if (
            values.calculateMethod === 'A' ||
            values.calculateMethod === 'V'
          ) {
            cuFormApi.setFieldValue('unorQtyonhandRatio', '');
          }
        },
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入异常消耗判定系数',
        maxlength: 10,
        triggerFields: ['calculateMethod'],
      },
      fieldName: 'unorConsumeRatio',
      label: '异常消耗判定系数',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'A' || calculateMethod === 'V') {
            return true;
          }
          if (calculateMethod === 'L') {
            return false;
          }
          return false;
        },
        trigger(values) {
          if (
            values.calculateMethod === 'A' ||
            values.calculateMethod === 'V'
          ) {
            cuFormApi.setFieldValue('unorConsumeRatio', '');
          }
        },
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采样天数',
        maxlength: 10,
        triggerFields: ['calculateMethod'],
      },
      fieldName: 'samplingPeriod',
      label: '采样天数',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'A') {
            return true;
          }
          if (calculateMethod === 'L' || calculateMethod === 'V') {
            return false;
          }
          return false;
        },
        trigger(values) {
          if (values.calculateMethod === 'A') {
            cuFormApi.setFieldValue('samplingPeriod', '');
          }
        },
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入补货量可接受误差',
        maxlength: 10,
        triggerFields: ['calculateMethod'],
      },
      fieldName: 'replenishAcceptdiff',
      label: '补货量可接受误差',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'A' || calculateMethod === 'V') {
            return true;
          }
          if (calculateMethod === 'L') {
            return false;
          }
          return false;
        },
        trigger(values) {
          if (
            values.calculateMethod === 'A' ||
            values.calculateMethod === 'V'
          ) {
            cuFormApi.setFieldValue('replenishAcceptdiff', '');
          }
        },
      },
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采样点',
        maxlength: 100,
        triggerFields: ['calculateMethod'],
      },
      fieldName: 'samplingPoint',
      label: '采样点（多个以,隔开）',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'A' || calculateMethod === 'L') {
            return true;
          }
          if (calculateMethod === 'V') {
            return false;
          }
          return false;
        },
        trigger(values) {
          if (values.calculateMethod === 'A') {
            cuFormApi.setFieldValue('samplingPoint', '');
          }
        },
      },
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入加权系数',
        maxlength: 100,
        triggerFields: ['calculateMethod'],
      },
      fieldName: 'samplingRate',
      label: '加权系数（多个以,隔开）',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'A' || calculateMethod === 'L') {
            return true;
          }
          if (calculateMethod === 'V') {
            return false;
          }
          return false;
        },
        trigger(values) {
          if (values.calculateMethod === 'A') {
            cuFormApi.setFieldValue('samplingRate', '');
          }
        },
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'isCalculateWeekend',
      label: '是否计算周末消耗',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: 'N',
      componentProps: () => {
        return {
          triggerFields: ['calculateMethod'],
          placeholder: '请选择是否计算周末消耗',
          paginate: false,
          options: [
            { value: 'Y', label: '是' },
            { value: 'N', label: '否' },
          ],
        };
      },
      dependencies: {
        triggerFields: ['calculateMethod'],
        disabled(values) {
          const calculateMethod = values.calculateMethod;
          if (calculateMethod === 'L') {
            return true;
          }
          if (calculateMethod === 'V' || calculateMethod === 'A') {
            return false;
          }
          return false;
        },
        trigger(values) {
          if (values.calculateMethod === 'L') {
            cuFormApi.setFieldValue('isCalculateWeekend', '');
          }
        },
      },
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: '请输入备注',
      },
      fieldName: 'description',
      formItemClass: 'col-span-2 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '备注',
    },
  ],
});

const [ModalFirst, modalApi] = useVbenModal({
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
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      modalType.value = modalData.value.modalType || modalType.value;
      if (modalType.value === 'EDIT') {
        setTimeout(() => {
          cuFormApi.setValues({
            ...toRaw(modalData.value.row),
          });
        }, 100);
      }
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await cuFormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await cuFormApi.getValues();
    console.warn('onConfirmformValues', formValues);
    if (!formValues.calculateMethod) {
      message.error('日均消耗计算方法不能为空');
      return;
    }
    if (!formValues.name) {
      message.error('名称不能为空');
      return;
    }
    const params: Record<string, any> = {
      replenishPolicyId: formValues.replenishPolicyId,
      replenishMathId: formValues.replenishMathId,
      name: formValues.name,
      calculateMethod: formValues.calculateMethod,
      standardDiviationRatio: isEmpty(formValues.standardDiviationRatio)
        ? ''
        : formValues.standardDiviationRatio,
      weekendRatio: isEmpty(formValues.weekendRatio)
        ? ''
        : formValues.weekendRatio,
      unorQtyonhandRatio: isEmpty(formValues.unorQtyonhandRatio)
        ? ''
        : formValues.unorQtyonhandRatio,
      unorConsumeRatio: isEmpty(formValues.unorConsumeRatio)
        ? ''
        : formValues.unorConsumeRatio,
      samplingPeriod: isEmpty(formValues.samplingPeriod)
        ? ''
        : formValues.samplingPeriod,
      replenishAcceptdiff: isEmpty(formValues.replenishAcceptdiff)
        ? ''
        : formValues.replenishAcceptdiff,
      samplingPoint: isEmpty(formValues.samplingPoint)
        ? ''
        : formValues.samplingPoint,
      samplingRate: isEmpty(formValues.samplingRate)
        ? ''
        : formValues.samplingRate,
      isCalculateWeekend: isEmpty(formValues.isCalculateWeekend)
        ? ''
        : formValues.isCalculateWeekend,
      description: isEmpty(formValues.description)
        ? ''
        : formValues.description,
    };

    try {
      await requestFormClient.post(
        '/replenishAction/createReplenishMath.do',
        params,
      );
      message.success('成功');
      modalApi.close();
      cuFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.error(error);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="w-[800px]">
    <CuForm />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';

import { autoAllocateProduct } from '../api';
import { h } from 'vue';
import { isEmpty } from '@vben/utils';

defineOptions({
  name: 'AutoAllocateModal',
});

interface ModalData {
  vbpBatchId: string;
  vbpProductIds: string[];
  dateFrom: string;
  dateTo: string;
  afterSubmit?: () => void;
}

const modalData = ref<ModalData>({
  vbpBatchId: '',
  vbpProductIds: [],
  dateFrom: '',
  dateTo: '',
});

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  commonConfig: {
    controlClass: 'w-full',
    colon: true,
    labelWidth: 180,
  },
  showDefaultActions: false,
  submitOnChange: false,
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'DatePicker',
      componentProps: {
        picker: 'month',
        placeholder: '请选择历史开始时间',
        valueFormat: 'YYYY-MM',
        class: 'w-full',
      },
      fieldName: 'hisDateFrom',
      label: '历史开始时间',
      rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'DatePicker',
      componentProps: {
        picker: 'month',
        placeholder: '请选择历史结束时间',
        valueFormat: 'YYYY-MM',
        class: 'w-full',
      },
      fieldName: 'hisDateTo',
      label: '历史结束时间',
      rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'InputNumber',
      fieldName: 'percentage',
      label: '目标科室选取占比（%）',
      rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: '根据时间范围取出全院所有消耗科室，选择一定百分比数量科室来完成今年的任务量。',
      componentProps: {
        min: 0,
        max: 100,
        precision: 2,
        step: 0.01,
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'deptType',
      label: '科室筛选取值规格',
      rules: z.any().refine((value: any) => !isEmpty(value), {
        message: '请选择科室筛选取值规格',
      }),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      help: () => {
        return h('div', {}, [
          h('div', {}, '按科室数量百分比选取:'),
          h(
            'div',
            {},
            '按照消耗查出N个使用该药科室，取排序后前N*选取占比%个科室进入分配池来完成今年的任务量。',
          ),
          h('div', {}, '按累计消耗百分比选取:'),
          h(
            'div',
            {},
            '科室按该药历史消耗降序排列，从第一名开始累加用量，直到累加总量≥全院该药品总消耗量*占比%，这批累加涉及的科室进入分配池来完成今年的任务量。',
          ),
        ]);
      },
      componentProps: {
        options: [
          { label: '按科室数量百分比选取', value: 0 },
          { label: '按累计消耗百分比选取', value: 1 },
        ],
      },
    },
  ],
});

const [Modal, modalApi] = useVbenModal({
  cancelText: '取消',
  confirmText: '确定',
  closable: true,
  closeOnClickModal: false,
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    modalApi.setState({ loading: true });

    const values: any = await formApi.getValues();

    try {
      const res = await autoAllocateProduct({
        vbpBatchId: modalData.value.vbpBatchId,
        vbpProductIds: modalData.value.vbpProductIds,
        dateFrom: modalData.value.dateFrom,
        dateTo: modalData.value.dateTo,
        hisDateFrom: values.hisDateFrom,
        hisDateTo: values.hisDateTo,
        targetDeptRatio: values.targetDeptRatio,
        deptFilterRule: values.deptFilterRule,
        deptType: values?.deptType,
        percentage: values?.percentage,
      } as any);
      if (!res?.success) {
        throw Error(res?.msg || '自动分配失败');
      }
      message.success(res?.msg || '自动分配成功');
      modalApi.close();
      modalData.value.afterSubmit?.();
      modalApi.setState({ loading: false });
    } catch (err) {
      console.error(err);
      // message.error(error?.message || '自动分配失败');
      modalApi.setState({ loading: false });
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData<ModalData>();
      if (data) {
        modalData.value = data;
      }
      formApi.resetForm();
    }
  },
});

defineExpose(modalApi);
</script>

<template>
  <Modal class="h-[350px] w-[620px]" title="自动分配">
    <Form />
  </Modal>
</template>

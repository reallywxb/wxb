<script lang="ts" setup>
import type { ProductVBPItem } from '../api';

import { ref } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveProductVBPAction } from '../api';
import { isEmpty } from '@vben/utils';

defineOptions({
  name: 'AddAndEditProductFormModal',
});

interface Param {
  title: string;
  parent: ProductVBPItem | undefined;
  treeNodeData: null | {
    id: string;
    key: string;
    text: string;
    type: string;
    vbpBatchId: string;
  };
  callback: () => void;
  type: 'add' | 'edit';
}
const commonUrl = '/baseHandleAction/refList.do';
const state = ref<Param>();
const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: false,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  // handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行, 值为horizontal
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

  schema: [
    {
      label: '阳采通用名',
      component: 'ChcSelect',
      fieldName: 'ygcgProductNameId',
      rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        dictUrl: '/ygcgProductNameAction/query',
        allowClear: true,
        placeholder: '请选择阳采通用名',
        immediate: false,
        paginate: true,
        filterByFrontEnd: false,
        labelField: 'productName',
        valueField: 'productNameId',
        filterField: 'productName',
        queryModelValueField: 'productNameId',
        showChooseAll: false,
        optionColumns: [
          { header: '阳采通用名', name: 'productName', width: 160 },
          { header: '规格', name: 'spec', width: 180 },
          { header: '生产厂家', name: 'manufacturer', width: 100 },
          { header: '中标价', name: 'purChasePrice', width: 80 },
        ],
        onChange: (
          e: string | undefined,
          option: Record<string, any> | undefined,
        ) => {
          console.log('e', e, option);
          formApi?.setValues({
            // 规格
            productSpec: isEmpty(option?.spec) ? '' : option?.spec,
            // 生产厂家
            manufacturer: isEmpty(option?.manufacturer)
              ? ''
              : option?.manufacturer,
            // 中标价
            price: isEmpty(option?.purChasePrice) ? '' : option?.purChasePrice,
          });
        },
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      },
    },
    {
      fieldName: 'productSpec',
      component: 'Input',
      label: '规格',
      // rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        disabled: true,
        allowClear: true,
        placeholder: '请输入规格',
      },
    },
    {
      label: '生产厂家',
      fieldName: 'manufacturer',
      component: 'Input',
      // rules: z.string().nonempty('请输入生产厂家'),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        disabled: true,
        allowClear: true,
        placeholder: '请输入生产厂家',
      },
    },
    {
      label: '中标价',
      fieldName: 'price',
      component: 'InputNumber',
      //  rules: 'required',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: {
        disabled: true,
        allowClear: true,
        placeholder: '请输入中标价',
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: `${commonUrl}?id=1000603`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            // 暂不显示金额
            const rows = (res?.rows || []).filter(
              (item: { id: string; name: string }) => item.id !== 'A',
            );
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      fieldName: 'qtyType',
      label: '使用量类型',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      // rules: z.string().nonempty('请选择使用量类型'),
      rules: 'selectRequired',
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: '请输入约定使用量',
        min: 1,
        precision: 0,
      },
      fieldName: 'qty',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '约定使用量',
      rules: z.coerce.number().min(1, '约定使用量必须大于0'),
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: `${commonUrl}?id=114`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          showChooseAll: false,
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      defaultValue: '',
      fieldName: 'baseUomId',
      label: '使用单位',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'selectRequired',
    },
    {
      component: 'Textarea',
      componentProps: {
        allowClear: true,
        placeholder: '请输入描述',
      },
      fieldName: 'remark',
      formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '备注',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  // wrapperClass: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4',
  wrapperClass: 'grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      try {
        const formValues = await formApi.getValues();
        console.warn('formValues', formValues);
        const { id } = state.value?.treeNodeData || {};
        const params: any = {
          ...formValues,
          batchId: id,
        };
        if (state.value?.type === 'edit') {
          params.vbpProductId = state.value.parent?.vbpProductId;
        }
        console.warn('onConfirm_params', params);
        await saveProductVBPAction(params);
        message.success('操作成功');
        state.value?.callback?.();
        modalApi.close();
      } catch (error) {
        console.error(error);
      }
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      state.value = modalApi.getData() as Param;
      console.warn('state.value.form', state.value);

      if (state.value?.type === 'edit') {
        setTimeout(async () => {
          await formApi.setValues({
            ...state.value?.parent,
            qty: state.value?.parent?.qtyPlaned || '',
            baseUomId: state.value?.parent?.baseUom || '',
          });

          (
            formApi?.getFieldComponentRef(
              'ygcgProductNameId',
            ) as SelectComponentRef
          )?.fetchApi?.();
        }, 300);
      } else {
        setTimeout(() => {
          (
            formApi?.getFieldComponentRef(
              'ygcgProductNameId',
            ) as SelectComponentRef
          )?.fetchApi?.();
        }, 300);
      }
    }
  },
});
</script>
<template>
  <Modal class="h-[500px] w-[700px]" :title="state?.title">
    <Form />
  </Modal>
</template>

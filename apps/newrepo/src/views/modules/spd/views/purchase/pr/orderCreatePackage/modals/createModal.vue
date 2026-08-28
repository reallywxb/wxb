<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const modalData = ref<Record<string, any>>({});

const FormOptions: VbenFormProps = {
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'Input',
      fieldName: 'warehouseName',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      label: '仓库',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'bpartnerId',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '供应商',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/vendor.do',
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return {
              ...res,
              rows: undefined,
              records: res.rows,
            };
          },
        };
      },
      dependencies: {
        // 触发字段。只有这些字段值变动时，联动才会触发
        triggerFields: ['allowPRUpdateVendor'],
        // 动态判断当前字段是否需要禁用
        disabled(values) {
          return values.allowPRUpdateVendor !== 'Y';
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'productNum',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      label: '退货包数',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'Input',
      fieldName: 'totalNum',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      label: '合计数量',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'Input',
      fieldName: 'totalPrice',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px] ',
      label: '合计金额(元)',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'returnType',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '退货类型',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000444',
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          autoChooseFirstOption: true,
          afterFetch(res: any) {
            if (isEmpty(res.rows)) {
              baseFormApi.setFieldValue('returnType', res.rows[0].id);
            }
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
    },
    {
      component: 'Textarea',
      fieldName: 'returnReason',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '退货原因',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'Input',
      fieldName: 'allowPRUpdateVendor',
      formItemClass: 'hidden',
      labelClass: '',
      componentProps: () => {
        return {
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
        };
      },
    },
  ],
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
};

const [BaseForm, baseFormApi] = useVbenForm({
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
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onCancel() {
    modalApi.close();
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      console.warn('onOpenChange baseFormApi', baseFormApi);

      // setTimeout(() => {
      let productNum = 0;
      let totalNum = 0;
      let totalPrice = 0;
      modalData.value.rows.forEach((row: any) => {
        let qtyReturn = row.qty;
        if (!qtyReturn || qtyReturn === '') {
          qtyReturn = 0;
        }
        productNum++;
        totalNum = Number(totalNum) + Number(qtyReturn);
        totalPrice = totalPrice + qtyReturn * (row.price || 0);
      });

      await baseFormApi.setValues({
        warehouseName: modalData.value.rows[0].warehouseName,
        productNum,
        totalNum,
        totalPrice: totalPrice.toFixed(2),
        allowPRUpdateVendor: modalData.value.allowPRUpdateVendor,
      });
      await baseFormApi.setFieldValue('bpartnerId', modalData.value.bpartnerId);
      // }, 100);
    }
  },
  async onConfirm() {
    if (submitLoading.value) {
      message.warning('提交中！');
      return;
    }
    const { valid } = await baseFormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await baseFormApi.getValues();
    console.warn('onConfirm formValues', formValues);

    const params: Record<string, any> = {};
    params.packageIds = JSON.stringify(
      modalData.value.rows.map((item) => item.packageId),
    );
    params.returnType = formValues.returnType;
    params.returnReason = formValues.returnReason;
    params.warehouseId = modalData.value.warehouseId;
    params.bpartnerId = formValues.bpartnerId;
    if (!params.bpartnerId) {
      message.warning('请选择供应商！');
      return;
    }
    try {
      submitLoading.value = true;
      // TODO:接口报500 参数与接口与旧项目相同  需与后端调试
      const res = await requestFormClient.post(
        '/orderReturnAction/createDirectPackagePrOrder.do',
        params,
      );
      const count = res.orderNos ? res.orderNos.length : 0;
      const orderNos = res.orderNos ? res.orderNos.join(',') : '';
      message.success(`已成功生成${count}个退货订单，订单号：${orderNos}`);
      modalApi.close();
      modalData.value?.callBack();
    } catch (error) {
      console.warn('err', error);
    } finally {
      submitLoading.value = false;
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst title="生成采退订单" class="h-[500px] w-[450px]">
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.input-nostyle .ant-input) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
}

::v-deep(.input-nostyle .ant-input:focus) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  outline: none !important;
  box-shadow: none !important;
}
//
::v-deep(.input-nostyle .ant-input-affix-wrapper) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
}

::v-deep(.input-nostyle .ant-input-affix-wrapper:focus) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  outline: none !important;
  box-shadow: none !important;
}
</style>

<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { updateProductApply } from '../api';
// import searchModalUI from './searchModal.vue';

const emit = defineEmits(['confirm']);

const productData = ref<any>({});
// application/vnd.ms-excel;base64,
const title = ref('添加');
const [ProductModal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      productData.value = modalApi.getData<Record<string, any>>();

      if (productData.value.productApplyId) {
        setTimeout(() => {
          baseFormApi.setValues(productData.value);
        }, 100);
      }
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 提交函数
  // handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'productCode',
      label: '药品编码',
      componentProps: () => {
        return {
          placeholder: '',
          disabled: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品名称',
      formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          placeholder: '请输入药品名称',
          maxLength: 30,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'medicineName',
      label: '通用名',
      componentProps: () => {
        return {
          placeholder: '请输入通用名',
          maxLength: 30,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productSpec',
      label: '规格',
      componentProps: () => {
        return {
          placeholder: '请输入规格',
          maxLength: 30,
        };
      },
    },
    // {
    //   component: 'Input',
    //   fieldName: 'model',
    //   label: '型号',
    //   componentProps: () => {
    //     return {
    //       placeholder: '请输入型号',
    //       maxLength: 30,
    //     };
    //   },
    // },
    {
      component: 'Input',
      fieldName: 'manufacturer',
      label: '生产厂家',
      componentProps: () => {
        return {
          placeholder: '请输入生产厂家',
          maxLength: 30,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productStateCode',
      label: '商品本位码',
      componentProps: () => {
        return {
          placeholder: '请输入商品本位码',
          maxLength: 30,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'uomName',
      label: '采购单位',
      componentProps: () => {
        return {
          placeholder: '请输入采购单位',
          maxLength: 10,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'baseUomName',
      label: '最小单位',
      componentProps: () => {
        return {
          placeholder: '请输入最小单位',
          maxLength: 10,
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'pricePo',
      label: '采购价',
      componentProps: () => {
        return {
          placeholder: '请输入采购价',
          maxLength: 10,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'priceList',
      label: '零售价',
      componentProps: () => {
        return {
          placeholder: '请输入零售价',
          maxLength: 10,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'certificateNo',
      label: '注册证号',
      componentProps: () => {
        return {
          placeholder: '请输入注册证号',
          maxLength: 30,
        };
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'certificateValidDate',
      label: '注册证号效期',
      componentProps: () => {
        return {
          placeholder: '请输入注册证号效期',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          maxLength: 10,
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'productStateCode',
      label: '转换比',
      componentProps: () => {
        return {
          placeholder: '请输入转换比',
          maxLength: 10,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productUserCode',
      label: '用户自编码',
      componentProps: () => {
        return {
          placeholder: '请输入用户自编码',
          maxLength: 50,
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isBulkPurchase',
      label: '带量采购',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isOnLine',
      label: '是否线上',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'contractDateFrom',
      label: '合同开始日期',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'contractDateTo',
      label: '合同结束日期',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    updateProductApply({
      ...res,
      productApplyId: productData.value.productApplyId || undefined,
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '操作成功',
        });
        modalApi.close();
        emit('confirm');
      }
    });
  });
  // message.success({
  //   content: `form values: ${JSON.stringify(values)}`,
  // });
}
</script>
<template>
  <ProductModal class="h-[700px] w-[800px]" :title="title" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_productModal"
      >
        提交
      </Button>
    </template>
  </ProductModal>
</template>

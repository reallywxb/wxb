<script lang="ts" setup>
import { h, ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveDo } from '../api';
import searchModalUI from './searchModal.vue';

const emit = defineEmits(['confirm']);

const [searchModal, searchModalApi] = useVbenModal({
  connectedComponent: searchModalUI,
});

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

      if (productData.value.surgicalTypeId) {
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
      fieldName: 'productId',
      label: '药品',
      formItemClass: 'pb-1',
      componentProps: () => {
        return {
          placeholder: '请输入药品',
          suffix: 'search', // 使用搜索图标作为后缀
          onFocus: () => {
            searchModalApi.open();
            // message.info('onFocus');
          },
        };
      },
      dependencies: {
        triggerFields: ['departmentId', 'regionId'],
        show: () => {
          return false;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'productCode',
      label: '药品',
      formItemClass: 'pb-1',
      componentProps: () => {
        return {
          placeholder: '请输入药品',
          allowClear: false,
          maxlength: 20,
          // onFocus: () => {
          //   searchModalApi.open();
          //   // message.info('onFocus');
          // },
        };
      },
      renderComponentContent: () => ({
        suffix: () =>
          h(SearchActionIcon, {
            style: { cursor: 'pointer' },
            onClick: () => {
              console.warn('点击了商品搜索图标');
              searchModalApi.open();
            },
          }),
      }),
    },
    {
      component: 'InputNumber',
      fieldName: 'qty',
      label: '数量',
      formItemClass: 'pb-1',
      componentProps: () => {
        return {
          placeholder: '请输入数量',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: '名称',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productSpec',
      label: '规格',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'manufacturer',
      label: '厂家',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'uomName',
      label: '单位',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    if (!productData.value.surgicalTypeId) {
      message.warn('请选择术式！');
      return;
    }
    if (!res.productId) {
      message.warn('请选择品种！');
      return;
    }
    if (!res.qty) {
      message.warn('请输入品种数量！');
      return;
    }

    saveDo({
      ...res,
      surgicalTypeId: productData.value.surgicalTypeId || undefined,
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

const searchConfirm = (params: any) => {
  baseFormApi.setValues(params);
};
</script>
<template>
  <ProductModal class="w-[700px]" :title="title" title-tooltip="">
    <searchModal @confirm="searchConfirm" />
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

<style lang="less" scoped>
::v-deep(.input-nostyle .ant-input) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  pointer-events: none;
}

::v-deep(.input-nostyle .ant-input:focus) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  outline: none !important;
  box-shadow: none !important;
  pointer-events: none;
}
</style>

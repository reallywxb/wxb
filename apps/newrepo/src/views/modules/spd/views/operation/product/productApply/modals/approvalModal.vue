<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { confirmProductApply } from '../api';
// import searchModalUI from './searchModal.vue';

const emit = defineEmits(['confirm']);

const productData = ref<any>({});
const showNextProductCode = ref(false);
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
      const firstRow = productData.value.rows[0];
      const obj: any = {};
      showNextProductCode.value = false;
      if (productData.value.type === 'add') {
        obj.productControlLevel = firstRow.productControlLevel;
        obj.productCategoryId = firstRow.productCategoryId;

        if (
          productData.value.productCodes.length > 0 &&
          !firstRow.productCode
        ) {
          obj.nextProductCode = productData.value.productCodes[0];
          showNextProductCode.value = true;
        }
      }
      baseFormApi.setValues(obj);
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
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/listProductServers.do',
          // showSearch: true,
          placeholder: '请选择商品站点',
          allowClear: true,
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      formItemClass: 'col-span-2 ',
      rules: 'required',
      fieldName: 'serverId',
      label: '商品站点',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/productAction/productCategoryList.do',
          // showSearch: true,
          placeholder: '请选择商品类别',
          allowClear: true,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.map((item: any) => ({
                ...item,
                id: item.id.toString(),
              })) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      formItemClass: 'col-span-2 ',
      fieldName: 'productCategoryId',
      rules: 'required',
      label: '商品类别',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=1000244',
          // showSearch: true,
          placeholder: '请选择商品组',
          allowClear: true,
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      formItemClass: 'col-span-2 ',
      fieldName: 'productControlLevel',
      rules: 'required',
      label: '商品组',
    },
    {
      component: 'Input',
      fieldName: 'nextProductCode',
      label: '自动生成编码',
      formItemClass: 'col-span-2 ',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '',
          // disabled: true,
        };
      },
      dependencies: {
        triggerFields: ['departmentId', 'regionId'],
        show: () => {
          return showNextProductCode.value;
        },
      },
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
      componentProps: () => {
        return {};
      },
      formItemClass: 'col-span-2 pb-1',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-3',
});
const onSubmit = async () => {
  const validateResult = await baseFormApi.validate();
  if (!validateResult.valid) return;
  baseFormApi.getValues().then((res: any) => {
    const param: any = {
      ids: JSON.stringify(productData.value.ids),
      page: productData.value.page,
      isApprove: 'Y',
      ...res,
    };
    param.productCodes =
      productData.value.type === 'add'
        ? JSON.stringify([res.nextProductCode])
        : JSON.stringify(productData.value.productCodes);
    confirmProductApply({
      ...param,
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
};
</script>
<template>
  <ProductModal class="h-[700px] w-[800px]" :title="title" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_approvalModal"
      >
        提交
      </Button>
    </template>
  </ProductModal>
</template>

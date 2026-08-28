<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveDo } from '../api';
// application/vnd.ms-excel;base64,
const emit = defineEmits(['confirm']);
const productIds = ref<string[]>([]);
const [Modal, modalApi] = useVbenModal({
  // showConfirmButton: false,
  // cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm: async () => {
    // message.info('onConfirm');
    // modalApi.close();
    const formValues = await baseFormApi.getValues();
    const isValidated = await baseFormApi.validate();

    if (!isValidated.valid) {
      return;
    }
    if (formValues.adjType === '1' && !formValues.effectiveTime) {
      message.error('定时调价缺少生效时间！');
      return;
    }
    const productIdArray = productIds.value.map((productId) => ({
      priceListNew: formValues.priceListNew,
      pricePONew: formValues.pricePONew,
      productId,
    }));
    if (productIdArray.length === 0) {
      message.error('缺少商品明细！');
      return;
    }
    const lineData = { created: productIdArray, updated: [], removed: [] };
    const params = {
      lineData: JSON.stringify(lineData),
      ...formValues,
    };
    saveDo(params).then((res: any) => {
      if (res && res.success) {
        message.success('保存成功！');
        emit('confirm');
        modalApi.close();
      }
    });
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    // message.info(`onOpenChange：${open}`);
    if (isOpen) {
      const data = modalApi.getData<Record<string, any>>();

      productIds.value = data.productIds;
    }
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
  // fieldMappingTime: [['rangePicker', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  // 提交函数
  handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'vertical',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000544',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择调价类型',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          defaultValue: '',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      fieldName: 'adjType',
      label: '调价类型',
    },
    {
      component: 'DatePicker',
      fieldName: 'effectiveTime',

      dependencies: {
        triggerFields: ['adjType'],
        trigger(values) {
          if (values.adjType !== '1') {
            baseFormApi.setFieldValue('effectiveTime', undefined);
          }
        },
        componentProps: async () => {
          const formdata = await baseFormApi?.getValues?.();
          return {
            disabled: formdata?.adjType !== '1' || !formdata?.adjType,
            valueFormat: 'YYYY-MM-DD 00:00:00',
            format: 'YYYY-MM-DD 00:00:00',
          };
        },
      },
      label: '生效时间',
    },
    {
      component: 'Input',
      fieldName: 'adjReason',
      label: '调价原因',
      componentProps: () => {
        return {
          placeholder: '请输入调价原因',
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'priceListNew',
      label: '新零售价',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入新零售价',
          min: 0,
          max: 1_000_000,
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'pricePONew',
      label: '新采购价',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入新采购价',
          min: 0,
          max: 1_000_000,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'adjNo',
      label: '调价文号',
      componentProps: () => {
        return {
          placeholder: '请输入调价文号',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: '备注',
      componentProps: () => {
        return {
          placeholder: '请输入备注',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>
<template>
  <Modal
    class="w-[500px]"
    title="批量调价"
    title-tooltip="上传excel文件导入数据"
  >
    <BaseForm />
  </Modal>
</template>

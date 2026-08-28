<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { Button, message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { deepClone } from '#/utils/util';

import { productPriceAdjust } from '../api';

const emit = defineEmits(['close']);
const batchData = ref<any>({});
// application/vnd.ms-excel;base64,
const priceData = ref<any>(null);
const [VBenModal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  // destroyOnClose: true,
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
      const data = modalApi.getData<Record<string, any>>() || {};
      priceData.value = deepClone(data);
      const updateSchema: any = [];

      batchData.value = {};
      const differentKeys = [];
      const keys = [
        'productName',
        'modelNo',
        'productSpec',
        'productStyleName',
        'manufacturerName',
        'certificateNo',
        'uomName',
        'pricePO',
        'priceList',
      ];
      priceData.value.selectedRows.forEach((item: any, index: number) => {
        if (index) {
          keys.forEach((key) => {
            let isDefferent = false;
            if (item[key]?.trim() !== batchData.value[key]?.trim()) {
              differentKeys.push(key);
              batchData.value[key] = '<有不同值>';
              isDefferent = true;
            }
            updateSchema.push({
              fieldName: key,
              formItemClass: `input-nostyle ${['priceList', 'pricePO'].includes(key) ? '' : 'pb-1'} ${['priceList', 'pricePO', 'uomName'].includes(key) ? '' : 'col-span-2'} ${isDefferent ? 'batch-font' : ''}`,
            });
          });
        } else {
          batchData.value = item;
        }
      });
      setTimeout(() => {
        baseFormApi.updateSchema(updateSchema);
        baseFormApi.setValues(
          priceData.value.isbatch
            ? {
                ...batchData.value,
                productCount: priceData.value.selectedRows.length,
              }
            : priceData.value.selectedRows[0],
        );
      }, 100);
      // if (priceData.value.isbatch)
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
      placeholder: '  ',
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
      formItemClass: 'input-nostyle pb-1 col-span-2',
      componentProps: () => {
        return {
          placeholder: '  ',
          // hidden: true
        };
      },
      dependencies: {
        triggerFields: ['productName', 'regionId'],
        show: () => {
          return !priceData.value.isbatch;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'productCount',
      label: '品种数',
      formItemClass: 'input-nostyle pb-1 col-span-2',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
      dependencies: {
        triggerFields: ['productName', 'regionId'],
        show: () => {
          return priceData.value.isbatch;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品名称',
      formItemClass: 'input-nostyle pb-1 col-span-2',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    // {
    //   component: 'Input',
    //   fieldName: 'modelNo',
    //   label: '型号',
    //   formItemClass: 'input-nostyle pb-1 col-span-2',
    //   componentProps: () => {
    //     return {
    //       placeholder: '  ',
    //     };
    //   },
    // },
    {
      component: 'Input',
      fieldName: 'productSpec',
      label: '规格',
      formItemClass: 'input-nostyle pb-1 col-span-2',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'productStyleName',
      label: '剂型',
      formItemClass: 'input-nostyle pb-1 col-span-2',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'manufacturerName',
      label: '生产厂家',
      formItemClass: 'input-nostyle pb-1 col-span-2',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'certificateNo',
      label: '注册证号',
      formItemClass: 'input-nostyle  pb-1 col-span-2',
      componentProps: () => {
        return {
          placeholder: '  ',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'uomName',
      label: '采购单位',
      formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'Switch',
      fieldName: 'isPurchasePriceUnify',
      label: '统一定价',
      formItemClass: 'pb-1',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          disabled: true,
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=1000544',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择调价类型',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          showChooseAll: false,
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
          const formdata = await baseFormApi.getValues();
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
      fieldName: 'adjNo',
      label: '调价文号',
      formItemClass: 'pb-1 col-span-2',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'Input',
      fieldName: 'pricePO',
      label: '原采购价格',
      formItemClass: 'input-nostyle',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'pricePONew',
      label: '新采购价格',
      rules: 'required',
      componentProps: () => {
        return {
          min: 0,
        };
      },
      dependencies: {
        triggerFields: ['isPurchasePriceUnify'],
        componentProps: async () => {
          const formdata = await baseFormApi.getValues();
          return {
            disabled: formdata?.isPurchasePriceUnify === 'N',
          };
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'priceList',
      label: '原零售价',
      formItemClass: 'input-nostyle',
      componentProps: () => {
        return {};
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'priceListNew',
      label: '新零售价',
      rules: 'required',
      componentProps: () => {
        return {
          min: 0,
        };
      },
    },

    {
      component: 'Textarea',
      fieldName: 'reason',
      label: '调价原因',
      componentProps: () => {
        return {};
      },
      formItemClass: 'col-span-2 pb-1',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

const onSubmit = async () => {
  const { valid } = await baseFormApi.validate();
  if (!valid) {
    return;
  }
  const formData: any = await baseFormApi.getValues();

  if (formData.adjType === '1' && !formData.effectiveTime) {
    return message.error('请填写生效时间');
  }
  if (formData.isPurchasePriceUnify === 'Y' && !formData.pricePONew) {
    return message.error('请填写新采购价');
  }
  if (formData.adjType === '1' && !formData.effectiveTime) {
    return message.error('新采购价需大于等于0');
  }

  const params: any = {};
  Object.keys(formData).forEach((key) => {
    if (
      formData[key] !== null &&
      formData[key] !== undefined &&
      formData[key] !== '<有不同值>'
    ) {
      params[key] = formData[key];
    }
  });
  params.productId = priceData.value.selectedRows
    .map((item: any) => item.productId)
    .join(',');
  Modal.confirm({
    title: '提醒',
    content: '此操作将更改商品和在库批次的采购价格/零售价格，确认继续吗？',
    onOk: () => {
      productPriceAdjust(params).then((res) => {
        if (res && res.success) {
          message.success({
            content: `已创建调价单【${res.priceListAdjId}】`,
            duration: 3,
          });
          modalApi.close();
          emit('close');
        } else {
          message.error(res.msg || '失败');
        }
      });
    },
  });
};
</script>
<template>
  <VBenModal
    class="w-[800px]"
    :title="priceData?.isbatch ? '批量调价' : '调价'"
  >
    <div>
      <BaseForm :class="priceData?.isbatch ? 'font-red' : ''" />
    </div>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_priceModal"
      >
        提交
      </Button>
    </template>
  </VBenModal>
</template>

<style lang="less" scoped>
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

::v-deep(.font-red .batch-font .ant-input) {
  color: red !important;
}
</style>

<script lang="ts" setup>
import type { VendorPriceRowType } from '../api';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { Button, message, Modal } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';

import { vendorPriceAdjust } from '../api';

const emit = defineEmits(['close']);
const title = ref<string>('');
const priceData = ref<any>(null);
// 定义一个常量来表示不同值的占位符，方便管理
const DIFFERENT_VALUE_PLACEHOLDER = '<有不同值>';
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
      priceData.value = modalApi.getData<Record<string, any>>();
      console.warn('priceData.value====>', priceData.value);
      title.value = priceData.value.isbatch ? '批量调价' : '调价';
      baseFormApi?.resetValidate();
      if (priceData.value.isbatch) {
        // 批量调价
        handleBatchData(priceData.value.selectedRows);
      } else {
        // 调价
        setTimeout(() => {
          baseFormApi.setValues(priceData.value.selectedRows[0]);
        }, 50);
      }
    }
  },
});

// 批量调价
const handleBatchData = (records: VendorPriceRowType[]) => {
  if (!records || records.length === 0) {
    return;
  }
  // 定义需要对比的字段
  const fieldsToCompare: (keyof VendorPriceRowType)[] = [
    'productName',
    'modelNo',
    'productSpec',
    'productStyleName',
    'manufacturerName',
    'certificateNo',
    'uomName',
    'vendorName',
    'pricePO',
  ];
  // 已第一条数据为基准
  const baseRecord: any = records[0];
  const displayRecord: Partial<VendorPriceRowType> & { [key: string]: any } = {
    ...baseRecord,
  }; // 创建副本
  const updateSchemaList: any[] = [];
  // 对比
  for (const field of fieldsToCompare) {
    // 判断后续所有记录的字段值是否与基准记录相同
    const isConsistent = records
      .slice(1)
      .every((record: VendorPriceRowType) => {
        // 处理null 或者 undefined 的情况
        const baseValue = (baseRecord[field] || '').toString().trim();
        const recordValue = (record[field] || '').toString().trim();
        return baseValue === recordValue;
      });
    // 如果字段值不一致，用占位符表示
    if (!isConsistent) {
      displayRecord[field] = DIFFERENT_VALUE_PLACEHOLDER;
      // 为不一致的字段准备 schema 更新，动态追加红色样式类
      updateSchemaList.push({
        fieldName: field,
        // 在原有 class 基础上追加 batch-font-red
        formItemClass: `${baseFormItemClassMap[field]} batch-font-red`,
      });
    }
  }
  // 将最终生成的显示对象设置到表单中
  setTimeout(() => {
    // 动态更新 schema (应用样式和显隐)
    baseFormApi.updateSchema(updateSchemaList);
    // 填充数据
    displayRecord.productCount = records.length;
    baseFormApi.setValues(displayRecord);
  }, 50); // 使用一个小的延迟
};

// 存储各字段初始的 formItemClass，用于重置和拼接
const baseFormItemClassMap: { [key: string]: string } = {
  productName: 'input-nostyle pb-1 col-span-2',
  modelNo: 'input-nostyle pb-1 col-span-2',
  productSpec: 'input-nostyle pb-1 col-span-2',
  productStyleName: 'input-nostyle pb-1 col-span-2',
  manufacturerName: 'input-nostyle pb-1 col-span-2',
  certificateNo: 'input-nostyle pb-1 col-span-2',
  uomName: 'input-nostyle pb-1 col-span-2',
  vendorName: 'input-nostyle pb-1 col-span-2',
  adjType: 'pb-1 col-span-1',
  pricePO: 'input-nostyle pb-1 col-span-1',
};

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
      dependencies: {
        triggerFields: ['productName', 'regionId'],
        show: () => {
          return priceData.value && !priceData.value.isbatch; // 非批量调价时显示
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'productCount',
      label: '记录数',
      formItemClass: 'input-nostyle pb-1 col-span-2',
      dependencies: {
        triggerFields: ['productName', 'regionId'],
        show: () => {
          return priceData.value && priceData.value.isbatch;
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品名称',
      formItemClass: baseFormItemClassMap.productName,
    },
    // {
    //   component: 'Input',
    //   fieldName: 'modelNo',
    //   label: '型号',
    //   formItemClass: baseFormItemClassMap.modelNo,
    // },
    {
      component: 'Input',
      fieldName: 'productSpec',
      label: '规格',
      formItemClass: baseFormItemClassMap.productSpec,
    },
    {
      component: 'Input',
      fieldName: 'productStyleName',
      label: '剂型',
      formItemClass: baseFormItemClassMap.productStyleName,
    },
    {
      component: 'Input',
      fieldName: 'manufacturerName',
      label: '生产厂家',
      formItemClass: baseFormItemClassMap.manufacturerName,
    },
    {
      component: 'Input',
      fieldName: 'certificateNo',
      label: '注册证号',
      formItemClass: baseFormItemClassMap.certificateNo,
    },
    {
      component: 'Input',
      fieldName: 'uomName',
      label: '采购单位',
      formItemClass: baseFormItemClassMap.uomName,
    },
    {
      component: 'Input',
      fieldName: 'vendorName',
      label: '供应商',
      formItemClass: baseFormItemClassMap.vendorName,
    },
    {
      component: 'ChcSelect',
      fieldName: 'adjType',
      label: '调价类型',
      formItemClass: baseFormItemClassMap.adjType,
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
      rules: 'selectRequired',
    },
    {
      component: 'DatePicker',
      fieldName: 'effectiveTime',
      label: '生效时间',
      formItemClass: 'pb-1 col-span-1',
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
      // rules: z
      //   .string()
      //   .optional()
      //   .nullable()
      //   .refine(
      //     async (value) => {
      //       const { adjType } = await baseFormApi.getValues();
      //       return adjType === '1' ? !!value : true;
      //     },
      //     { message: '请选择生效时间' },
      //   ),
    },
    {
      component: 'DatePicker',
      fieldName: 'expiredDate',
      label: '有效日期',
      formItemClass: 'pb-1 col-span-2',
      dependencies: {
        triggerFields: ['adjType'],
        trigger(values) {
          if (values.adjType !== '1') {
            baseFormApi.setFieldValue('expiredDate', undefined);
          }
        },
        componentProps: async () => {
          return {
            valueFormat: 'YYYY-MM-DD',
            format: 'YYYY-MM-DD',
          };
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'adjNo',
      label: '调价文号',
      formItemClass: 'pb-1 col-span-2',
    },
    {
      component: 'Input',
      fieldName: 'pricePO',
      label: '原采购价格',
      formItemClass: baseFormItemClassMap.pricePO,
    },
    {
      component: 'InputNumber',
      fieldName: 'pricePONew',
      label: '新采购价格',
      formItemClass: 'pb-6 col-span-1',
      componentProps: { min: 0 },
      rules: z
        .number({
          required_error: '请填写新采购价格',
          invalid_type_error: '请填写新采购价格',
        })
        .min(0, '新采购价需大于等于0'),
    },
    {
      component: 'Textarea',
      fieldName: 'reason',
      label: '调价原因',
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
  console.warn('formData===>', formData);
  if (formData.adjType === '1' && !formData.effectiveTime) {
    message.error('请选择生效时间');
    return;
  }
  if (formData.adjType === '1' && !formData.pricePONew) {
    message.error('请填写新采购价');
    return;
  }
  if (formData.adjType === '1' && formData.pricePONew < 0) {
    message.error('新采购价需大于等于0');
    return;
  }
  Modal.confirm({
    title: '确认提交',
    content: '此操作将更改供应商和在库批次的采购价格，确认继续吗？',
    okText: '确认',
    okType: 'primary',
    onOk: async () => {
      try {
        const selectedRecords = priceData.value.selectedRows;
        const productOrgIds = selectedRecords.map(
          (record: VendorPriceRowType) => record.productOrgId,
        );
        const params = {
          ...formData,
          productOrgId: productOrgIds.join(','),
        };
        const result = await vendorPriceAdjust(params);
        if (result?.success) {
          message.success({
            content: `已创建调价单【${result.priceListAdjIds.join(',')}】`,
            duration: 3,
          });
          modalApi.close();
          emit('close');
        } else {
          message.error(result.msg || '失败');
        }
      } catch (error) {
        console.error('调价提交失败', error);
      }
    },
  });
};
</script>
<template>
  <VBenModal class="w-[800px]" :title="title">
    <div>
      <BaseForm />
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
  pointer-events: none;
  cursor: not-allowed;
}

::v-deep(.input-nostyle .ant-input:focus) {
  border: none !important;
  background-color: transparent !important;
  outline: none !important;
  box-shadow: none !important;
  pointer-events: none;
  cursor: not-allowed;
}

::v-deep(.batch-font-red .ant-input) {
  color: red !important;
}
</style>

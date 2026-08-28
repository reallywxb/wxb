<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';
import { deepClone } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const packageData = ref<Record<string, any>>({});
const FormOptions: VbenFormProps = {
  commonConfig: {
    // 所有表单项
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  submitButtonOptions: {
    content: '确认',
  },
  actionWrapperClass: 'formActionAreaStyle',
  // wrapperClass: 'grid-cols-2',
  wrapperClass: 'grid-cols-12',
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'packageNo',
      label: '包装号',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '',
          onPressEnter: (e) => {
            console.warn('onPressEnter', e);
            // 在这里处理回车事件 组织默认请求
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            handlePackageNoEneter();
          },
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'scatteredQty',
      label: '拆零数量',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '',
          onKeyup: (e) => {
            console.warn('scatteredQty onKeyup', e);
            setLeaveQty();
          },
        };
      },
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'leavedQty',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '剩余数量',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productName', // 药品名称
      formItemClass: 'col-span-3 pl-[10px] pr-[10px] input-nostyle ',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品名称',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productCode',
      label: '药品编码',
      disabled: true,
      formItemClass: 'col-span-3 pl-[10px] pr-[10px] input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'vendorName',
      label: '供应商',
      disabled: true,
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]  input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productSpec',
      label: '规格',
      disabled: true,
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]  input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'manufacturer',
      label: '厂家',
      disabled: true,
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]  input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    // TODO:medicine cencel 型号
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: ' ',
    //   },
    //   fieldName: 'modelNo',
    //   label: '型号',
    //   disabled: true,
    //   formItemClass: 'col-span-3 pl-[10px] pr-[10px]  input-nostyle',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    // },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'uomName',
      label: '单位',
      disabled: true,
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]  input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'lot',
      label: '批号',
      disabled: true,
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]  input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'guaranteeDate',
      label: '效期',
      disabled: true,
      componentProps: () => {
        return {
          placeholder: ' ',
          // format: 'YYYY-MM-DD',
          // valueFormat: 'YYYY-MM-DD',
        };
      },

      formItemClass: 'col-span-3 pl-[10px] pr-[10px]  input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'qty',
      label: '总数量',
      disabled: true,
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]  input-nostyle',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
  ],

  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const [BaseForm, BaseFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...FormOptions,
  handleSubmit: (values) => {
    handleSubmit(values);
  },
});
const handlePackageNoEneter = async () => {
  const formValues = await BaseFormApi.getValues();
  console.warn('handlePackageNoEneter formValues', formValues);
  const packageNo = formValues.packageNo;
  if (!packageNo) {
    message.warning('请输入包装号');
    return;
  }
  try {
    const res = await requestFormClient.post('/packageAction/query.do', {
      packageNo,
      packageStatus: 'S',
      isAccurate: 'Y',
    });
    if (res.total === 0) {
      message.warning('未找到包装信息');
      return;
    }
    const data = res.rows[0];
    packageData.value = {};
    packageData.value = {
      ...deepClone(data),
    };
    BaseFormApi.setValues({
      ...data,
    });

    if (!data.qty) {
      message.warning('未找到总数量');
      return;
    }
    setLeaveQty();
  } catch (error) {
    console.error(error);
  }
};
const setLeaveQty = async () => {
  const formValues = await BaseFormApi.getValues();
  console.warn('setLeaveQty formValues', formValues);
  const totalQty = isEmpty(formValues.qty)
    ? 0
    : Number.parseInt(formValues.qty);
  console.warn('setLeaveQty totalQty', totalQty);
  if (!Number.isNaN(totalQty) && totalQty > 0) {
    const scatteredQty = isEmpty(formValues.scatteredQty)
      ? 0
      : Number.parseInt(formValues.scatteredQty);
    console.warn('setLeaveQty scatteredQty', scatteredQty);
    if (!Number.isNaN(scatteredQty)) {
      const leavedQty = totalQty - scatteredQty;
      BaseFormApi.setFieldValue('leavedQty', leavedQty);
      console.warn('setLeaveQty leavedQty', leavedQty);
    }
  }
};
const handleSubmit = async (values: any) => {
  console.warn('handleSubmit', values);

  const packageNo = values.packageNo;
  const packageId = packageData.value.packageId;
  // 零散数量
  const scatteredQty = isEmpty(values.scatteredQty) ? 0 : values.scatteredQty;
  if (isEmpty(packageNo) || scatteredQty === 0 || Number.isNaN(scatteredQty)) {
    message.warning('包装号和拆零数量不可为空！');
    return;
  }
  let totalQty = isEmpty(values.qty) ? 0 : values.qty;
  if (Number.isNaN(totalQty)) {
    totalQty = 0;
  }
  if (Number(scatteredQty) > Number(totalQty)) {
    message.warning('拆零数量不能大于包装数量！');
    return;
  }
  Modal.confirm({
    title: '提醒',
    content: '确认拆零吗？',
    onOk: async () => {
      try {
        const res = await requestFormClient.post('packageAction/splitOdd.do', {
          packageId,
          qty: scatteredQty,
        });
        BaseFormApi.resetForm();
        packageData.value = {};
        globalPrintStore.print({
          pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${res.data.join(',')}`,
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
};
</script>
<template>
  <Page
    content-class="p-[0.5rem] "
    auto-content-height
    header-class="px-3 py-2"
  >
    <div class="box-border h-full w-full bg-white p-4">
      <BaseForm />
    </div>
  </Page>
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

<script lang="ts" setup>
import { h, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

import chooseProductModalUi from './chooseProductModal.vue';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
type ModalType = 'ADD' | 'EDIT';
const modalType = ref<ModalType>('ADD');
const [ChooseProductModal, ChooseProductModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  draggable: true,
  connectedComponent: chooseProductModalUi,
});
const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    cuFormApi?.getFieldComponentRef &&
    typeof cuFormApi?.getFieldComponentRef === 'function' &&
    cuFormApi?.getFieldComponentRef(fieldName) &&
    cuFormApi?.getFieldComponentRef(fieldName).params
  );
};

const queryReplenish = async (values?: {
  productId?: number | string | undefined;
  warehouseId?: number | string | undefined;
}) => {
  const { warehouseId, productId } = values || {};
  const formValues = await cuFormApi.getValues();
  const params = {
    warehouseId,
    productId,
  };
  if (!params.warehouseId) {
    params.warehouseId = formValues.warehouseId;
  }
  if (!params.productId) {
    params.productId = formValues.productId;
  }
  try {
    const res = await requestFormClient.post(
      '/packUnitChangeApplyAction/queryReplenish.do',
      params,
    );
    console.warn('queryReplenish res', res);
    cuFormApi.setValues({
      oldPackUnit: isEmpty(res?.oldPackUnit) ? '' : res?.oldPackUnit,
      oldPackageUnitTopLimit: isEmpty(res?.oldPackageUnitTopLimit)
        ? ''
        : res?.oldPackageUnitTopLimit,
    });
  } catch (error) {
    console.error(error);
  }
};
const [CuForm, cuFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  actionWrapperClass: 'formActionAreaStyle',
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
  wrapperClass: 'grid-cols-2',
  schema: [
    {
      component: 'ChcSelect',
      fieldName: 'changeType',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '变更类型',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000517',
          placeholder: '请选择',
          paginate: false,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          autoChooseFirstOption: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      // 无任何作用 近用来控制定数包请求参数
      component: 'Input',
      componentProps: {
        placeholder: '',
      },
      fieldName: 'productId',
      formItemClass: 'pl-[10px] pr-[10px] hidden',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '商品ID',
      disabled: true,
    },
    {
      componentProps: {
        allowClear: false,
        placeholder: ' ',
        maxlength: 20,
      },
      fieldName: 'productCode', // 药品编码 productCode
      formItemClass: 'col-start-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品编码',
      rules: 'required',
      component: 'Input',
      renderComponentContent: () => ({
        suffix: () =>
          h(SearchActionIcon, {
            onClick: async () => {
              console.warn('点击了');
              const formValues = await cuFormApi.getValues();
              console.warn('formValues', formValues);
              ChooseProductModalApi.setData({
                productCode: formValues.productCode,
                callback: (row: any) => {
                  cuFormApi.setValues({
                    ...row,
                  });
                  queryReplenish({
                    warehouseId: formValues.warehouseId,
                    productId: row.productId,
                  });
                },
              }).open();
            },
          }),
      }),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      },
      fieldName: 'productName', // 药品名称
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品名称',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      },
      fieldName: 'productSpec',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '规格',
      disabled: true,
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: ' ',
    //     maxlength: 50,
    //   },
    //   fieldName: 'modelNo',
    //   formItemClass: 'pl-[10px] pr-[10px]',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   label: '型号',
    //   disabled: true,
    // },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 50,
      },
      fieldName: 'manufacturer',
      formItemClass: ' col-span-1 col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '厂家',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      },
      fieldName: 'uomName',
      formItemClass: 'col-start-1  pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '单位',
      disabled: true,
    },
    {
      component: 'ChcSelect',
      fieldName: 'warehouseId',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '仓库',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
          placeholder: '请选择',
          paginate: false,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          autoChooseFirstOption: true,
          afterFetch(res: any) {
            return {
              ...res,
              rows: undefined,
              records: (res.rows || []).map((item: any) => {
                return {
                  ...item,
                  id: Number.parseFloat(item.id),
                };
              }),
            };
          },
          onChange(value: any) {
            console.warn('仓库 value', value);
            queryReplenish();
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'packUnit',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '定数包',
      componentProps: () => {
        return {
          dictUrl: '/productAction/productPackList.do',
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          triggerFields: ['productId'],
          afterFetch(res: any) {
            return {
              ...res,
              rows: undefined,
              records: (res.rows || []).map((item: any) => {
                return {
                  ...item,
                  id: Number.parseFloat(item.id),
                };
              }),
            };
          },
        };
      },
      dependencies: {
        triggerFields: ['productId', 'changeType'],
        disabled(values) {
          return values.changeType === 'D';
        },
        // 字段变更时，都会触发该函数
        trigger(values) {
          console.warn('定数包 trigger values', values);
          console.warn('定数包 trigger  cuFormApi', cuFormApi);
          const c = isFieldComponentRefExist('packUnit');
          console.warn('定数包 trigger isFieldComponentRefExist', c);
          if (c) {
            cuFormApi.getFieldComponentRef('packUnit').params.dependencies = {
              productId: values.productId,
            };
            cuFormApi?.getFieldComponentRef('packUnit').fetchApi();
            cuFormApi.setFieldValue('packUnit', undefined);
          }
        },
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      },
      fieldName: 'oldPackUnit',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '原定数包',
      disabled: true,
    },
    {
      component: 'InputNumber',

      fieldName: 'packageUnitTopLimit',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '定数包上限',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      },
      dependencies: {
        triggerFields: ['changeType'],
        disabled(values) {
          return values.changeType === 'D';
        },
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 20,
      },
      fieldName: 'oldPackageUnitTopLimit',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '原定数包上限',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        maxlength: 100,
      },
      fieldName: 'description',
      formItemClass: 'col-span-2 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '申请原因',
    },
  ],
});

const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      modalType.value = modalData.value.modalType || modalType.value;
      if (modalType.value === 'EDIT') {
        setTimeout(() => {
          cuFormApi.setValues({
            ...toRaw(modalData.value.row),
            packUnit: isEmpty(modalData.value?.row?.packUnit)
              ? 0
              : Number.parseFloat(modalData.value?.row?.packUnit),
          });
        }, 100);
      }
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await cuFormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await cuFormApi.getValues();
    console.warn('onConfirmformValues', formValues);
    if (formValues.productId === '') {
      message.warning('请录入商品信息');
      return;
    }
    if (formValues.warehouseId === '') {
      message.warning('请录入仓库信息');
      return;
    }
    const params: Record<string, any> = {
      changeType: formValues.changeType,
      productId: formValues.productId,
      productCode: formValues.productCode,
      productName: formValues.productName,
      productSpec: formValues.productSpec,
      modelNo: formValues.modelNo,
      manufacturer: formValues.manufacturer,
      uomName: formValues.uomName,
      warehouseId: formValues.warehouseId,
      packUnit: formValues.packUnit,
      oldPackUnit: formValues.oldPackUnit,
      packageUnitTopLimit: formValues.packageUnitTopLimit,
      oldPackageUnitTopLimit: formValues.oldPackageUnitTopLimit,
      description: formValues.description,
    };

    if (
      modalType.value === 'EDIT' &&
      modalData.value?.row?.packUnitChangeApplyID
    ) {
      params.packUnitChangeId = modalData.value?.row?.packUnitChangeApplyID;
    }
    try {
      await requestFormClient.post('packUnitChangeApplyAction/save.do', params);
      message.success('成功');
      modalApi.close();
      cuFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.warn('err', error);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <ModalFirst :title="modalTitle" class="w-[800px]">
    <ChooseProductModal />
    <CuForm />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

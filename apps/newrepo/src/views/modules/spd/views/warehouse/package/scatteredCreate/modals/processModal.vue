<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { inject, onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

import serNoModalUi from './serNoModal.vue';

const refreshScatteredCreateTable = inject<() => void>(
  'refreshScatteredCreateTable',
  () => {},
);
const globalPrintStore = useGlobalPrintStore();
const modalData = ref<Record<string, any>>({});
const selectParams = ref({ warehouseId: undefined, productId: undefined });
const [SerNoModal, serNoModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: serNoModalUi,
  draggable: true,
});
const FormOptions: VbenFormProps = {
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'isSerNo',
      label: 'isSerNo',
      disabled: true,
      formItemClass: 'hidden',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productName', // 药品名称
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
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
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '药品编码',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productSpec',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '规格',
      disabled: true,
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: ' ',
    //   },
    //   fieldName: 'modelNo',
    //   formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   label: '型号',
    //   disabled: true,
    // },

    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'manufacturer',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '厂家',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'lot',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '批号',
      disabled: true,
    },
    {
      component: 'DatePicker',
      componentProps: () => {
        return {
          placeholder: '',
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
      fieldName: 'guaranteeDate',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '效期',
      disabled: true,
    },
    {
      component: 'DatePicker',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
        };
      },
      fieldName: 'productionDate',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '生产日期',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'productArea',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '产地',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'vendorName',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '供应商',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'price',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '采购价',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'isSerNoMsg',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '厂家码管理',
      defaultValue: modalData.value?.row?.isSerNo === 'Y' ? '是' : '否',
      disabled: true,
      dependencies: {
        triggerFields: ['isSerNo'],
        trigger: (values, formApi) => {
          console.warn('厂家码管理 values', values);
          const isSerNo = values.isSerNo;
          formApi.setFieldValue('isSerNo', isSerNo === 'Y' ? '是' : '否');
        },
      },
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'qtyAvailable',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '可加工数量',
      disabled: true,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'qty',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '加工数量',
      rules: 'required',
      dependencies: {
        triggerFields: ['replenishPackageQty'],
        disabled: (values) => {
          const replenishPackageQty = values.replenishPackageQty;
          return !!replenishPackageQty;
        },
        trigger: (values, formApi) => {
          console.warn('values', values);
          const packageCount = values.packageCount;
          const replenishPackageQty = values.replenishPackageQty;
          if (replenishPackageQty) {
            if (packageCount) {
              formApi.setFieldValue(
                'qty',
                Number(replenishPackageQty) * Number(packageCount),
              );
            } else {
              formApi.setFieldValue('qty', 0);
            }
          } else {
            formApi.setFieldValue('qty', 0);
          }
        },
      },
    },
    // {
    //   component: 'ChcSelect',
    //   fieldName: 'replenishPackageQty',
    //   formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
    //   labelClass: 'leading-1 mb-[0px] pl-[4px]',
    //   label: '定数',
    //   componentProps: () => {
    //     return {
    //       dictUrl: `/productAction/productPackList.do?productId=${
    //         modalData.value?.row?.productId
    //       }`,
    //       showChooseAll: false,
    //       placeholder: '请选择',
    //       paginate: false,
    //       // showChooseAll: '',
    //       allowClear: true,
    //       immediate: false,
    //       labelField: 'name',
    //       valueField: 'id',
    //       afterFetch(res: any) {
    //         return {
    //           ...res,
    //           rows: undefined,
    //           records: res.rows,
    //         };
    //       },
    //       onChange(values: any) {
    //         console.warn('定数', values);
    //         // replenishPackageQty.value = value;
    //       },
    //     };
    //   },
    //   dependencies: {
    //     triggerFields: ['isSerNo'],
    //     show: (values) => {
    //       return values.isSerNo !== 'Y';
    //     },
    //   },
    // },
    {
      component: 'InputNumber',
      fieldName: 'packageCount',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '加工包数',
      defaultValue: 1,
      rules: 'required',
      componentProps: {
        placeholder: ' ',
        onChange: async (value: any) => {
          console.warn('加工包数 value', value);
          const formValues = await FormApi.getValues();
          console.warn('加工包数 formValues', formValues);
          const packageCount = formValues.packageCount;
          const replenishPackageQty = formValues.replenishPackageQty;
          const qtyAvailable = formValues.qtyAvailable;
          if (packageCount < 0) {
            message.warning('加工包数不能小于0!');
            FormApi.setFieldValue('qty', 0);
            return;
          }
          if (packageCount % Number(1) > 0) {
            message.warning('加工包数不能为小数');
            FormApi.setFieldValue('qty', 0);
            return;
          }

          if (
            Number(replenishPackageQty) * Number(packageCount) >
            Number(qtyAvailable)
          ) {
            message.warning('加工数量大于可加工数量');
            FormApi.setFieldValue('qty', 0);
            return;
          }
          FormApi.setFieldValue(
            'qty',
            Number(replenishPackageQty) * Number(packageCount),
          );
        },
      },
      dependencies: {
        triggerFields: ['replenishPackageQty', 'isSerNo'],
        disabled: (values) => {
          const replenishPackageQty = values.replenishPackageQty;
          return !replenishPackageQty;
        },
        show: (values) => {
          return values.isSerNo !== 'Y';
        },
        trigger: (values, formApi) => {
          console.warn('values', values);
          const replenishPackageQty = values.replenishPackageQty;
          if (!replenishPackageQty) {
            formApi.setFieldValue('packageCount', 1);
          }
        },
      },
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: ' ',
      },
      fieldName: 'locatorName',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '当前货位',
      disabled: true,
    },
    {
      component: 'ChcSelect',
      fieldName: 'locatorIdTo',
      formItemClass: 'col-span-3 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '新货位',
      componentProps: () => {
        return {
          dictUrl: `/warehouseAction/locatorList.do?isScatter=N`,
          placeholder: '请选择',
          paginate: false,
          // showChooseAll: '',
          // immediate: false,
          labelField: 'name',
          valueField: 'id',
          autoChooseFirstOption: true,
          extraParams: selectParams.value,
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
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
  wrapperClass: 'grid-cols-12',
};

const [EditForm, FormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  ...FormOptions,
});
const handlePrint = (ids: (number | string)[]) => {
  Modal.confirm({
    title: '打印提示',
    content: '确认打印？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${ids.join(',')}`,
      });
      modalApi.close();
    },
    onCancel() {},
  });
};
const [ModalFirst, modalApi] = useVbenModal({
  zIndex: 800,
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await FormApi.validate();
    console.warn('onConfirm valid', valid);
    const formValues = await FormApi.getValues();
    console.warn('onConfirmformValues', formValues);
    if (!formValues.qty || formValues.qty === '' || formValues.qty === 0) {
      message.warning('加工数量不可为空！');
      return;
    }
    if (
      !formValues.qtyAvailable ||
      formValues.qtyAvailable === '' ||
      formValues.qtyAvailable === 0
    ) {
      message.warning('可加工数量异常');
      return;
    }

    if (
      Number.parseFloat(formValues.qty) >
      Number.parseFloat(formValues.qtyAvailable)
    ) {
      message.warning('加工数量大于可加工数量');
      return;
    }

    if (!formValues.locatorIdTo || formValues.locatorIdTo === '') {
      message.warning('请选择新货位');
      return;
    }

    const params = {
      warehouseId: modalData.value?.row?.warehouseId,
      productId: modalData.value?.row?.productId,
      locatorId: modalData.value?.row?.locatorId,
      storageStatus: modalData.value?.row?.storageStatus,
      locatorIdTo: formValues.locatorIdTo,
      qty: formValues.qty,
      qtyProcess: formValues.qty,
      replenishPackageQty: formValues.replenishPackageQty,
      packageCountProcess: formValues.packageCount,
      lot: modalData.value?.row?.lot,
      guaranteeDate: modalData.value?.row?.guaranteeDate,
      vendorId: modalData.value?.row?.vendorId,
      productionDate: modalData.value?.row?.productionDate,
      productArea: modalData.value?.row?.productArea,
      certificateNo: modalData.value?.row?.certificateNo,
      price: modalData.value?.row?.price,
    };
    if (
      modalData.value?.row?.isSerNo &&
      modalData.value?.row?.isSerNo === 'Y'
    ) {
      // TODO：待完善 旧代码页面打不开
      modalApi.close();
      serNoModalApi
        .setData({
          params,
          callback() {
            refreshScatteredCreateTable();
          },
        })
        .open();
    } else {
      Modal.confirm({
        title: '提示',
        content: '确认加工？',
        onOk: async () => {
          try {
            const res = await requestFormClient.post(
              'packageAction/createPackageByReplenishPackageQty.do',
              {
                data: JSON.stringify([params]),
              },
            );
            console.warn('onConfirm res', res);
            handlePrint(res.data);
            refreshScatteredCreateTable();
          } catch (error) {
            console.warn('err', error);
          }
        },
      });
    }
  },
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确定',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      selectParams.value.warehouseId = modalData.value?.row?.warehouseId
      selectParams.value.productId = modalData.value?.row?.productId
       
      console.warn('onOpenChange modalData', modalData.value);
      setTimeout(() => {
        FormApi?.resetForm();
        FormApi.setValues({
          productName: modalData.value.row.productName,
          productCode: modalData.value.row.productCode,
          productSpec: modalData.value.row.productSpec,
          modelNo: modalData.value.row.modelNo,
          manufacturer: modalData.value.row.manufacturer,
          lot: modalData.value.row.lot,
          guaranteeDate: modalData.value.row.guaranteeDate,
          productionDate: modalData.value.row.productionDate,
          productArea: modalData.value.row.productArea,
          vendorName: modalData.value.row.vendorName,
          price: modalData.value.row.price,
          qtyAvailable: modalData.value.row.qtyAvailable,
          locatorName: modalData.value.row.locatorName,
          // 紧紧用来控制显示
          isSerNo: modalData.value.row.isSerNo,
        });
      }, 200);
    }
  },
});

onMounted(() => {});
</script>
<template>
  <SerNoModal />
  <ModalFirst confirm-text="确定" title="散货加工">
    <EditForm />
  </ModalFirst>
</template>

<style scoped lang="scss">
.checkStyle {
  margin: 5px;
}
</style>

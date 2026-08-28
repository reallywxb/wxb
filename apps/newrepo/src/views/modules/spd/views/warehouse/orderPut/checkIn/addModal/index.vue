<script lang="ts" setup>
import { onMounted, ref, nextTick } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useRoute } from 'vue-router';
import { changeLot } from '../api';
import DualPersonModal from '../dualPersonModal/DualPersonModal.vue';
import { requestClient } from '#/api/request';
const route = useRoute();
const props = defineProps<{
  afterSubmit: () => void;
}>();
// 是否是中心库入库验收页面
const isCentralWarehousePage =
  route?.meta?.menuPageId === 'spd.web.wms.warehouse.input.check';
const data = ref();
const title = ref('');

// 双人作业验证弹窗
const [DualPersonModalComp, dualPersonModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: DualPersonModal,
});

// 双人作业验证成功后的回调函数
let handleDualPersonSuccess = (
  checkUser2: string,
  password: string,
  workerId2: number,
) => {
  // 这个函数会在 onConfirm 中被重新定义，这里只是占位
  console.warn('handleDualPersonSuccess', checkUser2, password, workerId2);
};

const actualQuantity = ref();
const storageQty = ref();
const qtyCheckLeft = ref();
const qtyCheck = ref();

const lotExtraParams = ref({
  limit: 0,
  lot: '',
  warehouseId: '',
  productId: '',
  guaranteeDate: '',
});
const secExtraParams = ref({
  // limit: 0,
  // value: '',
  warehouseId: '',
});

const selectParams = ref({});

const [EditForm, editFormApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  handleValuesChange: (e) => {
    console.warn('handleValuesChange', actualQuantity.value, storageQty.value);
    qtyCheckLeft.value = e.qtyCheckLeft || 0;
    qtyCheck.value = Math.min(e.qtyCheck, e.qtyCheckLeft);
    editFormApi.setValues({
      qtyReject: Math.max(qtyCheckLeft.value - qtyCheck.value, 0),
      qtyCheck: Math.min(e.qtyCheck, e.qtyCheckLeft),
    });
  },
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
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
  schema: [
    {
      label: '药品名称',
      fieldName: 'productName',
      component: 'Input',
      disabled: true,
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        bordered: false,
        style: {
          background: 'transparent',
        },
      },
    },
    {
      label: '规格',
      fieldName: 'productSpec',
      component: 'Input',
      disabled: true,
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        bordered: false,
        style: {
          background: 'transparent',
        },
      },
    },
    {
      label: '厂家',
      fieldName: 'manufacturer',
      component: 'Input',
      disabled: true,
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        bordered: false,
        style: {
          background: 'transparent',
        },
      },
    },
    {
      label: '单位',
      fieldName: 'uomName',
      component: 'Input',
      disabled: true,
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        bordered: false,
        style: {
          background: 'transparent',
        },
      },
    },
    {
      label: '批号',
      fieldName: 'lot',
      component: 'ChcSelect',
      disabled: true,
      componentProps: {
        autoChooseFirstOption: true,
        dictUrl: '/storageAction/changeLotList.do',
        extraParams: lotExtraParams.value,
        placeholder: '请选择批号',
        bordered: false,
        class: 'hide-select-arrow',
        style: {
          background: 'transparent',
        },
        paginate: false,
        showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      },
    },
    {
      label: '效期',
      fieldName: 'guaranteeDate',
      component: 'Input',
      disabled: true,
      componentProps: {
        // format: 'YYYY-MM-DD',
        // valueFormat: 'YYYY-MM-DD',
        bordered: false,
        style: {
          background: 'transparent',
        },
      },
    },
    {
      label: '待验收数量',
      fieldName: 'qtyCheckLeft',
      component: 'Input',
      disabled: true,
      componentProps: {
        allowClear: true,
        placeholder: ' ',
        style: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
    {
      label: '收货数量',
      fieldName: 'qtyCheck',
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入收货数量',
      },
    },
    {
      fieldName: 'locatorId',
      label: '上架货位',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/warehouseAction/locatorList.do',
          extraParams: secExtraParams.value,
          placeholder: '请选择上架货位',
          onChange(val: any, option: any) {
            console.warn('closeReason', val, option);
          },
          paginate: true,
          filterByFrontEnd: false,
          showChooseAll: false,
          immediate: false,
          labelField: 'name',
          valueField: 'id',
          filterField: 'productName',
          queryModelValueField: 'locatorId',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
    },
    {
      label: '拒收数量',
      fieldName: 'qtyReject',
      component: 'Input',
      disabled: true,
      componentProps: {
        allowClear: true,
        placeholder: '请输入拒收数量',
        style: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
    // 库存状态 (条件渲染)
    ...(isCentralWarehousePage
      ? [
          {
            fieldName: 'storageStatus',
            label: '库存状态',
            component: 'ChcSelect',
            rules: 'required',
            componentProps: () => {
              return {
                autoChooseFirstOption: true,
                dictUrl: '/baseHandleAction/refList.do?id=1000346',
                paginate: false,
                showChooseAll: false,
                immediate: true,
                labelField: 'name',
                valueField: 'id',
                allowClear: false,
                afterFetch(res: any) {
                  return { ...res, rows: undefined, records: res.rows };
                },
              };
            },
          },
        ]
      : []),
    {
      fieldName: 'qaResult',
      label: '验收结论',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=M_AsnLine.QAResult',
          placeholder: '合格入库',
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
    },
    {
      fieldName: 'rejectReason',
      label: '拒收原因',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/asnAction/rejectReason.do',
          placeholder: '请选择拒收原因',
          onChange(val: any, option: any) {
            console.warn('closeReason', val, option);
          },
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
    },
    {
      fieldName: 'qaState',
      label: '质量状况',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=M_AsnLine.QAResult',
          placeholder: '请选择验收结论',
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
    },
    {
      label: '验收温度',
      fieldName: 'checkTemperature',
      component: 'Input',
      formItemClass: 'col-span-1 md:col-span-2',
      componentProps: {
        allowClear: true,
        placeholder: '请输入验收温度',
        style: {
          width: '50%',
        },
      },
    },
    {
      label: '备注',
      fieldName: 'description',
      component: 'Input',
      formItemClass: 'col-span-1 md:col-span-2',
      componentProps: {
        allowClear: true,
        placeholder: '请输入备注',
      },
    },
  ],
});

const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '确认',
  class: 'w-[40%]',
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await editFormApi.validate();
    const myValues = await editFormApi.getValues();
    console.warn('values', myValues);
    console.warn('onConfirm1111', valid);
    console.warn('data.value.formData', data.value.formData);
    console.warn('data.value.formData.lot', data.value.formData.lot);
    console.warn('myValues.lot', myValues.lot);
    const ischangeLot = data.value.formData.lot === myValues.lot ? 'N' : 'Y';
    console.warn('ischangeLot.lot', ischangeLot);
    if (!valid) {
      message.error('请填写完整');
      return;
    }
    Modal.confirm({
      title: '确定',
      content: '确定要提交吗？',
      onOk: async () => {
        try {
          const values = await editFormApi.getValues();
          const params = {
            asnLineId: data.value.formData.asnLineId,
            ...values,
            isControlledProduct: data.value.formData.isControlledProduct,
            ischangeLot,
          };
          console.warn('params', params);
          // 重新定义双人作业验证成功后的回调
          handleDualPersonSuccess = (
            checkUser2: string,
            password: string,
            workerId2: number,
          ) => {
            const finalParams = {
              ...params,
              checkUser2,
              password,
              workerId2,
            };
            changeLot(finalParams)
              .then((res) => {
                if (res && res.success) {
                  message.success('成功');
                  modalApi.close();
                  props.afterSubmit();
                }
              })
              .catch((error) => {
                console.error('失败', error);
              });
          };

          if (data.value.formData.isControlledProduct === 'Y') {
            // 双人作业，需要弹出验证弹窗
            dualPersonModalApi
              .setData({
                warehouseId: data.value.formData.warehouseId,
                onSuccess: handleDualPersonSuccess,
              })
              .open();
          } else {
            // 非双人作业，直接执行
            changeLot(params)
              .then((res) => {
                if (res && res.success) {
                  message.success('成功');
                  modalApi.close();
                  props.afterSubmit();
                }
              })
              .catch((error) => {
                console.error('失败', error);
                // message.error('失败');
              });
          }
        } catch (error) {
          console.warn('err', error);
        }
      },
    });
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      console.warn('data.value', data.value);

      lotExtraParams.value.lot = data.value.formData.lot;
      lotExtraParams.value.warehouseId = data.value.formData.warehouseId;
      lotExtraParams.value.productId = data.value.formData.productId;
      lotExtraParams.value.guaranteeDate = data.value.formData.guaranteeDate;

      // secExtraParams.value.value = data.value.formData.locatorName;
      secExtraParams.value.warehouseId = data.value.formData.warehouseId;
      selectParams.value = {};
      const res = await requestClient.get('/warehouseAction/getLocator', {
        params: {
          productId: data.value.formData?.productId,
          warehouseId: data.value.formData?.warehouseId,
        },
      });
      data.value.formData.locatorId =
        res?.data?.locatorId || data.value.formData.locatorId;
      if (data.value.openType === 'add') {
        setTimeout(async () => {
          await nextTick();
          editFormApi?.getFieldComponentRef('locatorId')?.fetchApi!();
          editFormApi.setValues({
            ...data.value.formData,
            actualQuantity: data.value.formData.actualQuantity,
            storageQty: data.value.formData.storageQty,
            qtyCheck: data.value.formData.qtyCheckLeft,
            locatorId: Number(data.value.formData.locatorId),
          });
        }, 100);
        title.value = '验收';
      }
    }
  },
});
</script>
<template>
  <ModalFirst :title="title">
    <!-- <addThreeModal /> -->
    <!-- 双人作业验证弹窗 -->
    <DualPersonModalComp :after-submit="handleDualPersonSuccess" />
    <EditForm> </EditForm>
  </ModalFirst>
</template>

<style scoped lang="scss">
:deep(.hide-select-arrow .ant-select-arrow) {
  display: none;
}
</style>

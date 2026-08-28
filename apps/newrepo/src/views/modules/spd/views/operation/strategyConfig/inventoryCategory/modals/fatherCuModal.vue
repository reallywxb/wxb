<script lang="ts" setup>
import { nextTick, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

// import { QuestionOutlined } from '@ant-design/icons-vue';
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('');
type ModalType = 'ADD' | 'EDIT';
const modalType = ref<ModalType>('ADD');

const isFieldComponentRefExist = (fieldName: string) => {
  return !!(
    baseFormApi?.getFieldComponentRef &&
    typeof baseFormApi?.getFieldComponentRef === 'function' &&
    baseFormApi?.getFieldComponentRef(fieldName)
  );
};

const fetchSelectOptions = (fieldName: string, params: Record<string, any>) => {
  const c = isFieldComponentRefExist(fieldName);
  if (c) {
    const refInst = baseFormApi.getFieldComponentRef(
      fieldName,
    ) as unknown as SelectComponentRef;
    if (refInst && refInst.params) {
      Object.assign(refInst.params, params);
      if (typeof refInst?.fetchApi === 'function') {
        refInst.fetchApi();
      }
    }
  }
};
const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 170,
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
      fieldName: 'departmentId',
      label: '院区',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          placeholder: '请选择院区',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          showChooseAll: false,
          afterFetch(res: any) {
            nextTick(() => {
              fetchSelectOptions('warehouseId', {
                dictUrl: `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${-1}`,
              });
            });
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'warehouseId',
      label: '仓库',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          // dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
          placeholder: '请选择仓库',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          autoChooseFirstOption: true,
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
      dependencies: {
        triggerFields: ['departmentId'],
        trigger(values: any) {
          console.warn('trigger values', values);
          const c = isFieldComponentRefExist('warehouseId');
          console.warn('isFieldComponentRefExist warehouseId', c);
          if (c) {
            const refInst = baseFormApi.getFieldComponentRef(
              'warehouseId',
            ) as unknown as SelectComponentRef;
            if (refInst && refInst.params) {
              refInst.params.dictUrl = `/baseHandleAction/warehouse.do?readWrite=Y&regionId=${values?.departmentId || -1}`;
              if (typeof refInst?.fetchApi === 'function') {
                baseFormApi.setFieldValue('warehouseId', undefined);
                refInst.fetchApi();
              }
            }
          }
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '名称',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          placeholder: '请选择名称',
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'category',
      label: '盘点类型',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000577',
          placeholder: '请选择盘点类型',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          autoChooseFirstOption: true,
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'inventoryParticle',
      label: '盘点粒度',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000578',
          placeholder: '请选择盘点粒度',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          autoChooseFirstOption: true,
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'preciousType',
      label: '是否高值',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000579',
          placeholder: '请选择是否高值',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          autoChooseFirstOption: true,
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'valuationType',
      label: '是否计价',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000579',
          placeholder: '请选择是否计价',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          autoChooseFirstOption: true,
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
    },
  ],
});

const isSubmiting = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '关闭',
  confirmText: '提交',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      modalType.value = modalData.value.modalType || modalType.value;
      if (modalType.value === 'EDIT') {
        const rawRow = toRaw(modalData.value.row);
        setTimeout(() => {
          baseFormApi.setValues({
            ...rawRow,
          });
        }, 100);
      }
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (isSubmiting.value) {
      message.warning('正在提交！');
      return false;
    }
    isSubmiting.value = true;

    // 采购
    const formValues = await baseFormApi.getValues();

    if (formValues.name < 0) {
      message.warning('名称不能为空！');
      return;
    }
    const params: Record<string, any> = {
      ...formValues,
    };
    if (modalType.value === 'EDIT') {
      params.inventoryStrategyId = modalData.value?.row?.inventoryStrategyId;
    }
    console.warn('onConfirm params', params);
    try {
      await requestFormClient.post(
        '/inventoryStrategyAction/createInventoryStrategy.do',
        params,
      );
      message.success('成功');
      modalApi.close();
      baseFormApi.resetForm();
      modalData.value?.callback();
    } catch (error) {
      console.error(error);
    } finally {
      isSubmiting.value = false;
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[400px] w-[800px]">
    <BaseForm />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

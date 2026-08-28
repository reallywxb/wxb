<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveBacthProcess, saveProcess } from '../api';

interface ModalData {
  title: string;
  isBatch: boolean;
  productCareId: number | string;
  childDg?: { [key: string]: any; productCareLineId: number }[];
  callback?: () => void;
  [key: string]: any;
}
const emit = defineEmits(['close']);
const modalTitle = ref('');
const modalData = ref<any>({});
const commonUrl = '/baseHandleAction/refList.do';
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  closeOnClickModal: false,
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
      modalData.value = modalApi.getData<ModalData>();
      modalTitle.value = modalData.value.title;
      nextTick(() => {
        baseFormApi.setValues(modalData.value);
      });
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

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行，值为horizontal
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: `${commonUrl}?id=1000588`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择检查结果',
          paginate: false,
          filterByFrontEnd: true,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      defaultValue: 'OK',
      fieldName: 'checkResult',
      label: '检查结果',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: `${commonUrl}?id=1000589`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择养护措施',
          paginate: false,
          filterByFrontEnd: true,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'careMeasures',
      label: '养护措施',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: `${commonUrl}?id=1000590`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择质量状况',
          paginate: false,
          filterByFrontEnd: true,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'qualityState',
      label: '质量状况',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: `${commonUrl}?id=1000591`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择处理建议',
          paginate: false,
          filterByFrontEnd: true,
          // showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'processProposal',
      label: '处理建议',
    },
    {
      component: 'Input',
      fieldName: 'checkQty',
      label: '抽检数量',
      componentProps: () => {
        return {
          placeholder: '请输入抽检数量',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
async function onSubmit() {
  try {
    const formData = await baseFormApi.getValues();
    console.warn('formData:', formData);
    if (!formData.checkQty) {
      message.error({
        content: '请输入抽检数量',
      });
      return;
    }
    const data = modalData.value;
    const params: Record<string, any> = {
      ...formData,
      productCareId: data?.productCareId,
    };
    let apiToCall: Promise<any>;
    if (data.isBatch) {
      apiToCall = saveBacthProcess(params);
    } else {
      const records = data?.childDg;
      console.warn('records:', records);
      const lines = records
        .filter((item: any) => item.productCareLineId > 0)
        .map((item: any) => ({ productCareLineId: item.productCareLineId }));
      params.lines = JSON.stringify(lines);
      apiToCall = saveProcess(params);
    }
    const res = await apiToCall;
    if (res && res.success) {
      message.success({ content: '操作成功' });
      modalApi.close();
      data.callback?.();
      emit('close');
    } else {
      message.error({
        content: res?.message || '操作失败',
      });
    }
  } catch (error) {
    console.error('onSubmit error:', error);
  }
}
</script>
<template>
  <Modal class="w-[500px]" :title="modalTitle" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_save_careResultForm"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>

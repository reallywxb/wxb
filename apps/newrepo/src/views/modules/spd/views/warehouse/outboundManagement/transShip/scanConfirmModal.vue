<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';

const data = ref<any>({
  asnIds: [],
});

const handleScan = async (e: KeyboardEvent) => {
  // console.log((e.target as HTMLInputElement).value);
  await baseFormApi.resetValidate();
  const WorkerNo = (e.target as HTMLInputElement).value;
  if (!WorkerNo) {
    message.error('请输入转运人工号');
    return;
  }
  requestFormClient
    .post('movementWorkerHandleAction/query.do', {
      value: WorkerNo,
    })
    .then(async (res) => {
      if (res.rows && res.rows.length > 0) {
        const record = res.rows[0];
        baseFormApi.setFieldValue('WorkerNo', record.value);
        baseFormApi.setFieldValue('WorkerName', record.name);
      } else {
        message.error(`扫码失败，转运人未找到：${WorkerNo}`);
        baseFormApi.setFieldValue('WorkerNo', undefined);
        // await nextTick();
        // setTimeout(() => {
        //   baseFormApi.resetValidate();
        // }, 200);
      }
    })
    .catch(() => {
      // workerNoRef.value.focus();
    });

  return false;
};
// scanConfirmModal
const [ScanConfirmModal, scanConfirmModalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    scanConfirmModalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    const validateResult = await baseFormApi.validate();
    if (validateResult.valid) {
      const formValues = await baseFormApi.getValues();
      console.warn('onConfirm formValues', formValues);
      console.warn('onConfirm data', data.value);
      // requestFormClient
      //   .post('userBaseHandleAction/checkPassword.do', formValues)
      //   .then(async () => {
      //     await data.value.callBack(formValues);
      //     scanConfirmModalApi.close();
      //   });
      const params: { [key: string]: any } = {};
      const WorkerNo = formValues.WorkerNo;
      const WorkerName = formValues.WorkerName;
      if (!WorkerNo || WorkerNo === '') {
        message.warning('人员工号不可为空!');
        return;
      }
      if (!WorkerName || WorkerName === '') {
        message.warning('人员姓名不可为空!');
        return;
      }
      params.WorkerNo = WorkerNo;
      params.ASNRegType = data.value.type;
      params.asnId = JSON.stringify(data.value.asnIds);
      requestFormClient.post('asnAction/doASNReg.do', params).then(() => {
        scanConfirmModalApi.close();
        data.value.callBack();
      });
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = scanConfirmModalApi.getData<Record<string, any>>();
      setTimeout(() => {
        (baseFormApi.getFieldComponentRef('checkUser2') as SelectComponentRef)
          ?.fetchApi!();
      }, 0);
    }
  },
});
const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[90px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  showDefaultActions: false,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: () => {
        return {
          placeholder: '请输入交接人工号',
          allowClear: true,
          onPressEnter: handleScan,
        };
      },
      rules: 'required',
      fieldName: 'WorkerNo',
      label: '交接人工号',
      formItemClass: 'pb-5 col-span-1',
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入交接人姓名',
        disabled: true,
      },
      fieldName: 'WorkerName',
      label: '交接人姓名',
      formItemClass: 'pb-5 col-span-1',
      rules: 'required',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <ScanConfirmModal
    class="w-[500px]"
    title="扫码出库交接人"
    title-tooltip="扫码出库交接人"
  >
    <BaseForm>
      <!-- <template #WorkerNo="slotProps">
        <Input
          @keydown.enter="handleScan"
          ref="workerNoRef"
          v-bind="slotProps"
        />
      </template> -->
    </BaseForm>
  </ScanConfirmModal>
</template>

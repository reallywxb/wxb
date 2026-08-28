<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { nextTick, ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';
import mvplanScatterInput from '#/assets/excels/mvplanScatterInput.base64?raw';
// application/vnd.ms-excel;base64,
const base64Data = atob(mvplanScatterInput);
const byteArray = new Uint8Array(base64Data.length);
// console.log(byteArray);
for (let i = 0; i < base64Data.length; i++) {
  byteArray[i] = base64Data.codePointAt(i)!;
}
const blob = new Blob([byteArray], {
  type: 'application/vnd.ms-excel',
});
const url = URL.createObjectURL(blob);
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      // console.log('open');
      setTimeout(() => {
        // baseFormApi.setFieldValue('departmentId', '-1');
      }, 0);
    }
  },
});
const extParams = ref({ warehouseId_text: '', departmentId_text: '' });
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
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          placeholder: '请选择院区',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          paginate: false,
          showChooseAll: '',
          onChange(_: any, option: any) {
            extParams.value.departmentId_text = option?.name;
          },
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      defaultValue: '',
      fieldName: 'departmentId',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      label: '院区',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl:
            '/baseHandleAction/warehouse.do?readWrite=Y&regionId={{departmentId}}',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          // showSearch: true,
          placeholder: '请选择采购仓库',
          showChooseAll: false,
          // triggerFields: ['departmentId'],
          paginate: false,
          onChange(_: any, option: any) {
            extParams.value.warehouseId_text = option.name;
          },
          immediate: false,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          // triggerFieldKeys: {
          //   departmentId: 'regionId',
          // },
        };
      },
      dependencies: {
        triggerFields: ['departmentId'],
        async trigger(values) {
          // console.warn('baseFormApi', baseFormApi);
          await nextTick();
          if (
            baseFormApi?.getFieldComponentRef &&
            typeof baseFormApi?.getFieldComponentRef === 'function' &&
            baseFormApi?.getFieldComponentRef('warehouseId') &&
            (
              baseFormApi.getFieldComponentRef(
                'warehouseId',
              ) as SelectComponentRef
            ).params
          ) {
            (
              baseFormApi.getFieldComponentRef(
                'warehouseId',
              ) as SelectComponentRef
            ).params!.dependencies = {
              departmentId: values.departmentId,
            };
            (
              baseFormApi?.getFieldComponentRef(
                'warehouseId',
              ) as SelectComponentRef
            ).fetchApi!();
            // baseFormApi?.setFieldValue('warehouseId', undefined);
          }
        },
      },
      rules: 'required',
      // defaultValue: 1_000_007,
      fieldName: 'warehouseId',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      label: '采购仓库',
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
const fileList = ref([]);
const handleChange = async (info: UploadChangeParam<any>) => {
  const validateRes = await baseFormApi.validate();
  if (validateRes.valid) {
    baseFormApi.getValues().then((res) => {
      requestFormClient
        .upload('/movementPlanAction/importMovementPlan.do?isPackaged=N', {
          file: info.file,
          ...res,
          departmentId: res.departmentId === '-1' ? '' : res.departmentId,
          ...extParams.value,
        })
        .then((res) => {
          if (res.success) {
            message.info(res.data?.msg);
          } else {
            message.error(`导入失败:${res.msg}`);
          }
        });
    });
  } else {
    fileList.value = [];
  }

  // importPoPlanData({file:info.file})
};
const beforeUpload = () => {
  return false;
};
// function lockModal() {
//   modalApi.lock();
//   setTimeout(() => {
//     modalApi.unlock();
//   }, 3000);
// }
</script>
<template>
  <Modal class="w-[500px]" title="导入" title-tooltip="上传excel文件导入数据">
    <BaseForm />
    <div class="pl-[10px] pr-[10px]">
      <a
        :href="url"
        download="movement"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="button_download_importModal"
      >
        <AntdDownloadOutlined
          class="mr-[6px] text-[14px]"
        />散件移库计划模版下载
      </a>
      <UploadDragger
        v-model:file-list="fileList"
        name="file"
        accept=".xlsx,.xls"
        :multiple="false"
        :before-upload="beforeUpload"
        @change="handleChange"
        :show-upload-list="false"
        class="mt-[16px]"
        data-testid="button_download_importModal"
      >
        <p class="ant-upload-drag-icon flex justify-center">
          <AntdUploadloadOutlined class="text-[36px]" />
        </p>
        <p class="ant-upload-text">请将文件拖拽到此处导入</p>
        <p class="ant-upload-hint">仅支持文件后缀为.xlsx,.xls的Excel文件</p>
      </UploadDragger>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { message, UploadDragger } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import { importPoPlanData } from '#/api/system/import';
import poPlanTemplate from '#/assets/excels/poPlanTemplate.base64?raw';
// application/vnd.ms-excel;base64,
const base64Data = atob(poPlanTemplate);
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
  showConfirmButton: false,
  cancelText: '关闭',
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
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const extParams = ref({ bpartnerId_text: '', departmentId_text: '' });
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
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          placeholder: '请选择院区',
          allowClear: true,
          paginate: false,
          onChange(val: any, option: any) {
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
      // defaultValue: 1_000_007,
      fieldName: 'departmentId',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      label: '院区',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
          // showSearch: true,
          placeholder: '请选择采购仓库',
          triggerFields: ['departmentId'],
          paginate: false,
          onChange(val: any, option: any) {
            extParams.value.bpartnerId_text = option.name;
          },
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      dependencies: {
        triggerFields: ['departmentId'],
        trigger(values) {
          console.warn(values);
          if (
            baseFormApi?.getFieldComponentRef &&
            typeof baseFormApi?.getFieldComponentRef === 'function' &&
            baseFormApi?.getFieldComponentRef('warehouseId') &&
            baseFormApi?.getFieldComponentRef('warehouseId').params
          ) {
            baseFormApi.getFieldComponentRef(
              'warehouseId',
            ).params.dependencies = {
              departmentId: values.departmentId,
            };
            baseFormApi?.getFieldComponentRef('warehouseId')?.fetchApi();
            baseFormApi?.setFieldValue('warehouseId', undefined);
          }
        },
      },
      // defaultValue: 1_000_007,
      fieldName: 'warehouseId',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      label: '采购仓库',
    },
    {
      component: 'DatePicker',
      fieldName: 'deliveryPlanDate',
      componentProps: () => {
        return {
          showTime: true,
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'YYYY-MM-DD HH:mm',
        };
      },
      defaultValue: dayjs(dayjs().format('YYYY-MM-DD'))
        .add(1, 'day')
        .add(10, 'hour')
        .format('YYYY-MM-DD HH:mm'),
      label: '日期选择框',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
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
const handleChange = (info: UploadChangeParam<any>) => {
  baseFormApi.getValues().then((res) => {
    importPoPlanData({ file: info.file, ...res, ...extParams.value }).then(
      (res) => {
        if (res.success) {
          // message.success('导入成功');
          message.info(res.data?.msg);
        } else {
          message.error(`导入失败:${res.msg}`);
        }
      },
    );
  });

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
        download="order"
        class="flex text-[14px] hover:text-[#707070]"
      >
        <AntdDownloadOutlined class="mr-[6px] text-[14px]" />模版下载
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

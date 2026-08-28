<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { requestFormClient } from '#/api/request';
import excelUrl from '#/assets/excels/medcine-template-20251112.xls?url';

const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 130,
  },

  // 提交函数
  handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: false,

  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
  schema: [
    {
      component: 'Switch',
      fieldName: 'isOverWrite',
      label: '是否覆盖已有药品',

      defaultValue: false,
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] text-left',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          checkedValue: 'Y',
          unCheckedValue: 'N',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'isCreateDict',
      label: '是否自动创建字典',
      defaultValue: false,
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] text-left',
      componentProps: () => {
        return {
          checkedChildren: '是',
          unCheckedChildren: '否',
          checkedValue: 'Y',
          unCheckedValue: 'N',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'ChcSelect',
      fieldName: 'serverId',
      label: '药品站点',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px] text-left',

      componentProps: () => {
        return {
          style: {
            width: '250px',
          },
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/listProductServers.do',
          placeholder: '请选择药品站点',
          allowClear: true,
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
    },
  ],
});
function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    console.warn('onCancel');
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

const fileList = ref([]);
const handleChange = async (info: UploadChangeParam<any>) => {
  try {
    const formValues = await baseFormApi.getValues();
    const res = await requestFormClient.upload(
      '/productAction/importProduct.do?isApproved=Y',
      {
        file: info.file,
        ...formValues,
        type: 'mc',
      },
    );
    if (res.success) {
      message.success(`已成功导入${res.data.count}条数据`);
      modalApi?.getData()?.callback();
    } else {
      message.error(`导入失败:${res.msg}`);
    }
  } catch (error) {
    console.error('导入文件失败', error);
  }
};
const beforeUpload = () => {
  return false;
};
</script>
<template>
  <Modal
    class="w-[500px]"
    title="批量导入"
    title-tooltip="上传excel文件导入数据"
  >
    <BaseForm />
    <div class="pl-[10px] pr-[10px]">
      <a
        :href="excelUrl"
        download="药品目录"
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

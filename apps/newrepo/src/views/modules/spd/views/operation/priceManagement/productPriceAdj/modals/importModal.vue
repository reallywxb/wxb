<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { importPriceListAdj } from '#/api/system/import';
import excelUrl from '#/assets/excels/productPriceAdj.xls?url';

// application/vnd.ms-excel;base64,
const emit = defineEmits(['closeRefresh']);
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
      component: 'Input',
      fieldName: 'adjNo',
      label: '调价文号',
      componentProps: () => {
        return {
          placeholder: '请输入调价文号',
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000544',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择调价类型',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      fieldName: 'adjType',
      label: '调价类型',
    },
    {
      component: 'DatePicker',
      fieldName: 'effectiveTime',

      dependencies: {
        triggerFields: ['adjType'],
        trigger(values) {
          if (values.adjType !== '1') {
            baseFormApi.setFieldValue('effectiveTime', undefined);
          }
        },
        componentProps: async () => {
          const formdata = await baseFormApi?.getValues?.();
          return {
            disabled: formdata?.adjType !== '1' || !formdata?.adjType,
            valueFormat: 'YYYY-MM-DD 00:00:00',
            format: 'YYYY-MM-DD 00:00:00',
          };
        },
      },
      label: '生效时间',
    },
    {
      component: 'Input',
      fieldName: 'adjReason',
      label: '调价原因',
      componentProps: () => {
        return {
          placeholder: '请输入调价原因',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: '备注',
      componentProps: () => {
        return {
          placeholder: '请输入备注',
        };
      },
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
    if (!res.adjType) {
      message.warn('请选择调价类型');
      return;
    }
    const param: any = {
      file: info.file,
    };
    Object.keys(res).forEach((key) => {
      if (res[key]) {
        param[key] = res[key];
      }
    });
    importPriceListAdj({
      file: info.file,
      ...param,
    }).then((res) => {
      if (res.success) {
        // message.success('导入成功');
        message.info(res?.msg || res.data?.msg || '导入成功');
        // 关闭弹框 并且刷新父列表
        modalApi.close();
        emit('closeRefresh');
      } else {
        message.error(`导入失败:${res.msg}`);
      }
    });
  });
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
        :href="excelUrl"
        download="调价单录入模板"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="a_downloadTemplate_importModal"
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
        data-testid="UploadDragger_upload_importModal"
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

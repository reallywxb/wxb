<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import excelUrl from '#/assets/excels/vbp_product_import_hc.xls?url';

import { importProductVBPAction } from '../api';

defineOptions({
  name: 'ImportProductVBPModal',
});

const props = defineProps<{
  afterSubmit?: () => void;
  params: Record<string, any>;
}>();

const fileList = ref([]);

const [Form, formApi] = useVbenForm({
  layout: 'horizontal',
  commonConfig: {
    controlClass: 'w-full',
    colon: true,
  },
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: `batchVBPAction/list.do?limit=5000&productType=${props.params.type}`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'batchId',
      label: '带量批次',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
  ],
  showDefaultActions: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
});

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  closable: true,
  closeOnClickModal: false,
  onClosed() {
    modalApi.setState({
      loading: false,
    });
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {},
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      console.warn('props', props);
    }
  },
});

async function handleChange(info: UploadChangeParam<any>) {
  const { valid } = await formApi.validate();

  if (!valid) {
    message.error('请正确配置带量批次');
    return;
  }

  modalApi.setState({
    loading: true,
  });

  try {
    const { success, msg } = await importProductVBPAction({
      file: info.file,
      ...(await formApi.getValues()),
    });

    if (success) {
      message.success('导入成功');

      modalApi.close();

      props.afterSubmit?.();
    } else {
      modalApi.setState({
        loading: false,
      });

      message.error(msg);
    }
  } catch {
    message.error('导入失败');
  }
}
const beforeUpload = () => {
  return false;
};
defineExpose(modalApi);
</script>
<template>
  <Modal
    class="w-[400px]"
    title="带量商品导入"
    title-tooltip="上传excel文件导入数据"
  >
    <Form />
    <div class="pl-[10px] pr-[10px]">
      <a
        :href="excelUrl"
        download="带量商品模板"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="button_download_importWarehouseModal"
      >
        <AntdDownloadOutlined class="mr-[6px] text-[14px]" />模板下载
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
        data-testid="button_UploadDragger_importWarehouseModal"
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

<style lang="scss" scoped>
.reminder {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 14px;
  font-size: 12px;

  &:hover {
    color: #278df2;
  }
}
</style>

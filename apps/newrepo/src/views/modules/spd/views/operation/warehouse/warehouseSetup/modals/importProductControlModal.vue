<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import excelUrl from '#/assets/excels/productcontrol.xls?url';
import shipmentPackage from '#/assets/excels/shipmentPackage.base64?raw';

import { importProductControlData } from '../api';

// 定义 emit 事件
const emit = defineEmits<{
  importSuccess: [data: any[]]; // 导入成功时传递数据
}>();
// application/vnd.ms-excel;base64,
const base64Data = atob(shipmentPackage);
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
    console.warn('onCancel', url);
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
// const extParams = ref({ bpartnerId_text: '', departmentId_text: '' });
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
  schema: [],
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
    console.warn('info', info, res);
    // const testData = [
    //   {
    //     packageId: 1002977,
    //     warehouseId: 1000201,
    //     warehouseName: '中药房',
    //     productId: 1037355,
    //     productName: '阿司匹林肠溶片',
    //     productSpec: '0.1g×30片(肠溶片)/盒',
    //     modelNo: '0.1g×30片(肠溶片)/盒',
    //     manufacturer: '拜耳医药',
    //     uomName: '盒',
    //     productCode: '2002',
    //     isPrecious: 'N',
    //     packageStatus: 'O',
    //     packageStatusName: '不在库',
    //     packageNo: 'S1002977',
    //     qty: 1,
    //     qtyText: '1_盒',
    //     createdByName: 'supervis',
    //     created: '2025-09-05 14:26:59',
    //     vendorId: 1004943,
    //     vendorName: '南京国药',
    //     lot: '202400000',
    //     guaranteeDate: '2026-12-03',
    //     productionDate: '',
    //     price: 50,
    //     locatorId: '1013770',
    //     locatorName: '默认储存货位-默认储存货位',
    //     receiveTime: '2025-09-16 11:29:18',
    //     isControlledProduct: 'N',
    //     storageStatus: 'S',
    //     storageStatusName: '合格',
    //     isPicked: 'N',
    //     markCode: '省标编码',
    //     certificateNo: '国药准字',
    //     printeNum: 0,
    //     pricePo: '50',
    //     costPrice: '8',
    //     isSurgery: 'N',
    //     standardCode: 'gjbm',
    //     insurance: 'zxbm',
    //     departmentName: '江北院区',
    //   },
    // ];
    // // 将测试数据传递给父组件
    // emit('importSuccess', testData);
    // message.success('已导入测试数据');
    // // 关闭模态框
    // modalApi.close();
    importProductControlData({ file: info.file }).then((res) => {
      if (res.success) {
        // message.success('导入成功');
        // // message.info(res.data?.msg);
        // // 导入成功后，将后端返回的数据传递给父组件
        // if (res.rows && res.rows.length > 0) {
        //   emit('importSuccess', res.rows);
        // }
        if (res.data && res.data?.msg) {
          message.warn(res.data?.msg);
          emit('importSuccess', res.data?.msg);
          return;
        } else {
          message.success(res?.msg || '导入成功');
          emit('importSuccess', res.msg);
        }
        // 关闭模态框
        modalApi.close();
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
  <Modal
    class="w-[500px]"
    title="商品组导入"
    title-tooltip="上传excel文件导入数据"
  >
    <BaseForm />
    <div class="pl-[10px] pr-[10px]">
      <a
        :href="excelUrl"
        download="仓库商品组模版"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="button_download_importProductControlModal"
      >
        <AntdDownloadOutlined class="mr-[6px] text-[14px]" />仓库商品组模板下载
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
        data-testid="button_UploadDragger_importProductControlModal"
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

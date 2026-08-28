<script lang="ts" setup>
import { computed, ref } from 'vue';

import { MdiLightDelete, PlusOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, Upload } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm, z } from '#/adapter/form';

import { createInvoiceSubmit } from './api';

const data = ref<any>({});
const fileList = ref<any[]>([]);
const imageUrl = ref<string>('');
const accept = ref<string[]>(['jpg', 'png']);

// 合并图片格式
const wholeAccepts = computed(() => {
  const midArr: string[] = [];
  accept.value.forEach((item) => {
    midArr.push(`.${item}`);
    const upper = item.toUpperCase();
    !midArr.includes(`.${upper}`) && midArr.push(`.${upper}`);
  });
  return midArr;
});

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  closeOnClickModal: false,
  confirmText: '提交',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    const validateResult = await baseFormApi.validate();
    if (validateResult.valid) {
      const formValues = await baseFormApi.getValues();
      const { bpartnerId, warehouseId, lineData } = data.value.data;
      const params = {
        bpartnerId, // 供应商
        warehouseId, // 仓库
        invoiceAmt: formValues.invoiceAmt, // 待开票金额
        invoiceNo: formValues.invoiceNo, // 发票号码
        invoiceTypeNo: formValues.invoiceTypeNo, // 发票代码
        totalAmt: formValues.totalAmt, // 总金额
        dateInvoiced: formValues.dateInvoiced, // 开票日期
        description: formValues.description, // 描述
        invoiceImageBase64: imageUrl.value, // 发票图片base64
        lineData,
      };
      console.warn('submit_params', params);
      createInvoiceSubmit(params).then((res) => {
        if (res && res.success) {
          message.success('创建成功');

          modalApi.close();
        } else {
          message.error(res.msg || '创建失败');
        }
      });
      // data.value.records.forEach((item: any) => {
      //   item.invoiceAmt = formValues.invoiceAmt;
      //   item.invoiceNo = formValues.invoiceNo;
      //   item.description = formValues.description;
      //   item.storageStatusToName = nameObj.value.storageStatusToName;
      //   item.locatorNameTo = nameObj.value.locatorNameTo;
      // });
    }
    // console.log(validateResult);
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      const { data: formData } = data.value;
      imageUrl.value = '';
      setTimeout(() => {
        baseFormApi.setValues({
          invoiceAmt: formData.invoiceAmt,
        });
      }, 0);
    }
  },
});
// const nameObj = ref({
//   storageStatusToName: '',
//   locatorNameTo: '',
// });
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
  // 水平布局，label和input在同一行，值为horizontal
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'invoiceAmt',
      label: '本次开票金额',
      formItemClass: 'input-nostyle',
      componentProps: () => {
        return {
          placeholder: '请输入待开票金额',
        };
      },
    },
    {
      component: 'Upload',
      fieldName: 'invoiceImg',
      label: '上传发票图片',
      formItemClass: 'col-span-1',
    },
    {
      component: 'Input',
      fieldName: 'invoiceNo',
      label: '发票号码',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入发票号码',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'invoiceTypeNo',
      label: '发票代码',
      componentProps: () => {
        return {
          placeholder: '请输入发票代码',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'totalAmt',
      label: '发票金额',
      componentProps: () => {
        return {
          placeholder: '请输入发票金额',
        };
      },
      // 输入的值需要和待开票金额保持一致
      rules: z
        .string()
        .min(1, { message: '请输入发票金额' })
        .refine(
          async (value) => {
            const formValues = await baseFormApi.getValues();
            // 转换为数字比较,避免字符串比较问题
            return Number(value) === Number(formValues.invoiceAmt);
          },
          {
            message: '发票金额必须和待开票金额保持一致',
          },
        ),
    },
    {
      component: 'DatePicker',
      componentProps: () => {
        return {
          format: 'YYYY-MM-DD',
          valueFormat: 'YYYY-MM-DD',
          // 发票日期不可超过今天
          disabledDate: (date: Date) => {
            return dayjs(date).isAfter(dayjs(), 'day');
          },
        };
      },
      fieldName: 'dateInvoiced',
      label: '发票日期',
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Textarea',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入备注',
      },
      fieldName: 'description',
      label: '备注',
      formItemClass: 'pb-5 col-span-1',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});

// 上传前的校验
const beforeUpload = async (file: File) => {
  console.warn(file, 'beforeUpload');
  const isValidType = ['image/jpg', 'image/jpeg', 'image/png'];
  const isJpgOrPng = isValidType.includes(file.type);
  if (!isJpgOrPng) {
    message.error(
      `请选择${accept.value.map((str) => str.toUpperCase()).join('、')}格式文件`,
    );
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片大小不能超过5MB');
    return false;
  }
  const reader = new FileReader();
  reader.addEventListener('load', (e) => {
    imageUrl.value = e.target?.result as string;
    // 构造 fileList 用于显示
    fileList.value = [
      {
        uid: '-1',
        name: file.name,
        status: 'done',
        url: e.target?.result as string,
      },
    ];
  });
  reader.readAsDataURL(file);
  // 返回 false 阻止自动上传
  return false;
};

// 删除方法
const handleRemoveImage = () => {
  imageUrl.value = '';
  fileList.value = [];
  return true; // 返回 true 允许删除
};

// 自定义上传
const customRequest = () => {};
</script>
<template>
  <Modal class="w-[500px]" title="创建发票">
    <BaseForm>
      <template #invoiceImg>
        <div class="flex items-center">
          <Upload
            v-if="!imageUrl"
            v-model:file-list="fileList"
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            action="~"
            :max-count="1"
            :accept="wholeAccepts.join(',')"
            :custom-request="customRequest"
            :before-upload="beforeUpload"
          >
            <div class="flex flex-col items-center justify-center">
              <PlusOutlined class="text-lg" />
              <div class="ant-upload-text">上传图片</div>
            </div>
          </Upload>
          <div v-else class="picture-preview">
            <img :src="imageUrl" alt="logo" />
            <div class="picture-overlay" @click.stop="handleRemoveImage">
              <div
                class="flex h-[26px] w-[26px] items-center justify-center rounded-sm text-[18px] text-white hover:bg-white hover:bg-opacity-10 hover:text-[#f56c6c]"
              >
                <MdiLightDelete class="icon-delete" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseForm>
  </Modal>
</template>
<style scoped lang="scss">
::v-deep(.input-nostyle .ant-input) {
  font-weight: bold;
  pointer-events: none;
  cursor: default;
  background-color: transparent !important;
  border: none !important;
}

.picture-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 89.25px;
  height: 89.25px;
  margin: 0 4px 4px 0;
  overflow: hidden;
  border: 1px dashed #e4e4e7;

  img {
    object-fit: cover;
  }

  .picture-overlay {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
    background-color: rgb(0 0 0 / 50%);
    opacity: 0;
    transition: opacity 0.3s;

    &:hover {
      border-color: #006be6;
      opacity: 1;
    }
  }
}
</style>

<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { computed, ref } from 'vue';

import { createIconifyIcon, MdiLightDelete } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Upload } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';

import { saveDo } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('');
const fileList = ref<any[]>([]);
const imageUrl = ref<string>('');
const accept = ref<string[]>(['jpg', 'png']);
// 存储原始文件对象
const currentFile = ref<File | null>(null);
const PlusOutlined = createIconifyIcon('ant-design:plus-outlined');
const isNewUpload = ref<boolean>(false); // 新增:标识是否为新上传

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
      serviceData.value = modalApi.getData<Record<string, any>>();
      console.warn('serviceData.value', serviceData.value);
      title.value = serviceData.value.id ? '修改医院信息' : '新增医院信息';
      // 先清空图片
      imageUrl.value = '';
      currentFile.value = null;
      isNewUpload.value = false;
      // 编辑回显图片
      if (serviceData.value.id && serviceData.value.hospitalLogo) {
        // imageUrl.value =
        //   'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
        imageUrl.value = serviceData.value.hospitalLogo;
      }
      setTimeout(() => {
        baseFormApi.setValues({
          ...serviceData.value,
          adminPasswordConfirm: serviceData.value.adminPassword,
        });
        baseFormApi.setFieldValue(
          'tenantId',
          serviceData.value.tenantId &&
            typeof serviceData.value.tenantId === 'string'
            ? Number(serviceData.value.tenantId)
            : serviceData.value.tenantId,
        );
      }, 100);
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
    labelWidth: 120,
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行，值为horizontal
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    // TOOD: 测试要求增加一个租户的选择下拉框
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: 'baseHandleAction/queryTenantList',
          placeholder: '请选择租户',
          paginate: false,
          // showChooseAll: '',
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.data };
          },
        };
      },
      fieldName: 'tenantId',
      label: '租户',
      // rules: 'selectRequired', //去除租户选择的必填校验
    },
    {
      component: 'Input',
      fieldName: 'hospitalId',
      label: '医院编码',
      formItemClass: 'col-span-1',
      rules: 'required',
      disabled: true,
      componentProps: () => {
        return {
          placeholder: '',
        };
      },
      dependencies: {
        show: (values) => {
          console.warn('values', values);
          return serviceData.value.hospitalId && serviceData.value.id;
        },
        triggerFields: [''],
      },
    },
    {
      component: 'Input',
      fieldName: 'hospitalName',
      label: '医院名称',
      formItemClass: 'col-span-1',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入医院名称',
          maxlength: 20,
          allowClear: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'shortName',
      label: '医院简称',
      formItemClass: 'col-span-1',
      componentProps: () => {
        return {
          placeholder: '请输入医院简称',
          maxlength: 10,
          allowClear: true,
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/mcOrgAction/queryMcOrganList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: false,
          placeholder: '请选择所属医院体',
          paginate: false,
          allowClear: true,
          immediate: true,
          labelField: 'name',
          afterFetch(res: any) {
            const rows =
              res.data?.map((item: any) => ({
                ...item,
                value: item.value.toString(),
              })) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      formItemClass: 'col-start-1',
      rules: 'required',
      fieldName: 'organId',
      label: '所属医共体',
      // dependencies: {
      //   triggerFields: [''],
      //   show: () => {
      //     return true;
      //   },
      // },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/serverList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择主数据系统',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.map((item: any) => ({
                ...item,
                id: item.id.toString(),
              })) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      // rules: 'required', // 去除主数据系统必填校验(测试要求的)
      help: 'HIS要求发送数据时使用HIS系统提供的机构编码时填写',
      fieldName: 'productServerId',
      label: '主数据系统',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: `/baseHandleAction/serverList.do?validation=${encodeURIComponent("IsSelfServer!='Y'")}`,
          placeholder: '请选择HIS系统',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.map((item: { id: number; name: string }) => ({
                ...item,
                id: item.id.toString(),
              })) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      // rules: 'required', // 去除HIS系统必填校验(测试要求的)
      fieldName: 'adServerId',
      label: 'HIS系统',
    },
    // TODO: 去除HIS机构编码输入框
    // {
    //   component: 'Input',
    //   fieldName: 'value',
    //   label: 'HIS机构编码',
    //   rules: 'required',
    //   componentProps: () => {
    //     return {
    //       placeholder: '请输入HIS机构编码',
    //     };
    //   },
    // },
    {
      component: 'Switch',
      fieldName: 'active',
      label: '是否有效',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'Textarea',
      componentProps: () => {
        return {
          placeholder: '请输入备注',
          type: 'textarea',
        };
      },
      formItemClass: 'col-span-1',
      fieldName: 'Description',
      label: '备注',
    },
    {
      component: 'Input',
      fieldName: 'contact',
      label: '联系人',
      formItemClass: 'col-span-1',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入联系人',
          maxlength: 20,
          allowClear: true,
        };
      },
    },

    {
      component: 'Input',
      fieldName: 'contactPhone',
      label: '联系方式',
      formItemClass: 'col-span-1',
      componentProps: () => {
        return {
          placeholder: '请输入联系方式',
          maxlength: 11,
          allowClear: true,
        };
      },
      rules: z
        .string()
        .min(1, '请输入联系方式')
        .regex(/^1[3-9]\d{9}$/, '请输入正确的11位手机号'),
    },
    {
      component: 'Upload',
      fieldName: 'hospitalLogo',
      label: '医院logo',
      formItemClass: 'col-span-1',
    },
    // AI-GENERATED-BEGIN
    // @date 2026-07-11
    // @prompt 编辑模式下隐藏管理员信息字段
    // @description 通过 dependencies.show 控制管理员信息字段仅在新增模式下显示,并通过 dependencies.rules 动态设置校验规则
    {
      component: 'Input',
      fieldName: 'adminUserName',
      label: '管理员账户名',
      formItemClass: 'col-span-1',
      defaultValue: '',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入管理员账户名',
          allowClear: true,
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => !serviceData.value.id,
        rules: () => (!serviceData.value.id ? 'required' : undefined),
      },
    },
    {
      component: 'Input',
      fieldName: 'adminRoleName',
      label: '管理员角色名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入管理员角色名称',
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => !serviceData.value.id,
        rules: () => (!serviceData.value.id ? 'required' : undefined),
      },
    },
    {
      component: 'InputPassword',
      fieldName: 'adminPassword',
      label: '管理员密码',
      formItemClass: 'col-span-1',
      rules: 'required',
      componentProps: () => {
        return {
          autocomplete: 'autocomplete',
          placeholder: '请输入管理员密码',
          // maxlength: 10,
          allowClear: true,
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => !serviceData.value.id,
        rules: () => (!serviceData.value.id ? 'required' : undefined),
      },
    },
    {
      component: 'InputPassword',
      fieldName: 'adminPasswordConfirm',
      label: '管理员密码确认',
      labelClass: 'leading-1 mb-[0px]',
      formItemClass: 'col-span-1',
      rules: 'required',
      componentProps: () => {
        return {
          autocomplete: 'off', // 关闭自动填充
          placeholder: '请再次输入管理员密码',
          // maxlength: 10,
          allowClear: true,
          onBlur: async (e: any) => {
            if (!e.target.value) {
              return;
            }
            const formData = await baseFormApi.getValues();
            console.warn(formData, 'formData');
            if (e.target?.value !== formData.adminPassword) {
              message.error('两次输入密码不一致');
            }
          },
        };
      },
      dependencies: {
        triggerFields: [''],
        show: () => !serviceData.value.id,
        rules: () => (!serviceData.value.id ? 'required' : undefined),
      },
    },
    // AI-GENERATED-END
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
  // return isJpgOrPng && isLt5M;
  // currentFile.value = file;
  // const reader = new FileReader();
  // reader.addEventListener('load', (e) => {
  //   imageUrl.value = e.target?.result as string;
  //   // 构造 fileList 用于显示
  //   fileList.value = [
  //     {
  //       uid: '-1',
  //       name: file.name,
  //       status: 'done',
  //       url: e.target?.result as string,
  //     },
  //   ];
  // });
  // reader.readAsDataURL(file);
  try {
    currentFile.value = file;
    imageUrl.value = await fileToBase64(file);
    isNewUpload.value = true; // 新增:标识为新上传
  } catch (error) {
    console.error('图片读取失败', error);
    return false;
  }
  // 返回 false 阻止自动上传
  return false;
};

const handleChange = ({ file }: UploadChangeParam) => {
  console.warn(file, fileList.value, 'handleChange');
};

// 自定义上传
const customRequest = () => {};

// 删除方法
const handleRemoveImage = () => {
  imageUrl.value = '';
  currentFile.value = null;
  fileList.value = [];
  isNewUpload.value = false;
  return true; // 返回 true 允许删除
};

/**
 * 将文件转换为 Base64 编码
 * @param file - 要转换的文件对象
 * @returns 包含 Base64 编码的 Promise 字符串
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', (e) => resolve(e.target?.result as string));
    reader.addEventListener('error', (error) => reject(error));
    reader.readAsDataURL(file);
  });
}

/**
 * 将图片URL转换为base64
 * @param url - 图片URL
 * @returns base64字符串
 */
// async function urlToBase64(url: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'Anonymous'; // 处理跨域
//     img.addEventListener('load', () => {
//       const canvas = document.createElement('canvas');
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext('2d');
//       ctx?.drawImage(img, 0, 0);
//       resolve(canvas.toDataURL('image/png'));
//     });
//     img.addEventListener('error', reject);
//     img.src = url;
//   });
// }

async function onSubmit() {
  const formData = await baseFormApi.getValues();
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    // const uploadFormData = new FormData();
    // console.warn('fileList', fileList.value);
    // if (fileList.value && fileList.value.length > 0) {
    //   uploadFormData.append('file', fileList.value[0]?.file as File);
    // }
    // console.warn(uploadFormData, 'uploadFormData');
    // // 将File 转换为 Blob
    // let hospitalLogoBolb: Blob | null = null;
    // console.warn(currentFile.value, 'currentFile.value');
    // if (currentFile.value) {
    //   hospitalLogoBolb = new Blob([currentFile.value], {
    //     type: currentFile.value.type,
    //   });
    // }
    const params = {
      ...formData,
      hospitalLogoBase: isNewUpload.value ? imageUrl.value : undefined, // base64 编码(只有选择新上传时才会有值)
      id: serviceData.value.id || undefined, // 主键id
    };
    console.warn(params, 'params');
    saveDo(params).then((res) => {
      if (res && res.success) {
        message.success({
          content: '保存成功',
        });
        modalApi.close();
        emit('close');
      }
    });
  }
}
</script>
<template>
  <Modal class="w-[600px]" :title="title" title-tooltip="">
    <BaseForm>
      <template #hospitalLogo>
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
            @change="handleChange"
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
          <p class="text-sm text-[#4E5969]">
            仅支持仅支持{{
              accept.map((str) => str.toUpperCase()).join('、')
            }}格式文件，单个文件不超过5M
          </p>
        </div>
      </template>
    </BaseForm>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_onSave_addAndEditFormModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
<style scoped lang="scss">
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
    // width: 100%;
    // height: 100%;
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

.ant-upload-text {
  margin-top: 8px;
  color: #666;
}

::v-deep(.ant-upload-wrapper) {
  // 宽度继承父元素
  width: inherit;
}
</style>

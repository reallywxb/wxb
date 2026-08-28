<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveHospitalSetting } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  closeOnClickModal: false,
  onCancel() {
    modalApi.close();
  },
  onClosed() {},
  onConfirm() {},
  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<Record<string, any>>();
      console.warn('医院配置弹窗===>', serviceData.value);
      setTimeout(async () => {
        await nextTick();
        baseFormApi.setValues({
          yc_ad_server_id:
            Number(serviceData.value.yc_ad_server_id) || undefined,
          yc_user_name: serviceData.value.yc_user_name || undefined,
          yc_password: serviceData.value.yc_password || undefined,
          yb_ad_server_id:
            Number(serviceData.value.yb_ad_server_id) || undefined,
          yb_hospital_code: serviceData.value.yb_hospital_code || undefined,
          yb_app_code: serviceData.value.yb_app_code || undefined,
          yb_auth_code: serviceData.value.yb_auth_code || undefined,
          yb_access_key: serviceData.value.yb_access_key || undefined,
          yb_secret_key: serviceData.value.yb_secret_key || undefined,
          yb_admdvs: serviceData.value.yb_admdvs || undefined,
          yb_ca_info: serviceData.value.yb_ca_info || undefined,
          MC_Hospital_Setting_id:
            serviceData.value.MC_Hospital_Setting_id || undefined,
        });
      }, 200);
    }
  },
});

const [BaseForm, baseFormApi] = useVbenForm({
  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 160,
  },
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',
  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    // {
    //   component: 'Input',
    //   fieldName: 'yc_ad_server_id',
    //   label: '阳采平台对接服务器',
    //   formItemClass: 'col-span-1',
    //   defaultValue: '',
    //   // rules: 'required',
    //   componentProps: () => {
    //     return {
    //       placeholder: '请输入阳采平台对接服务器',
    //       allowClear: true,
    //     };
    //   },
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: `/baseHandleAction/serverList.do?validation=${encodeURIComponent("IsSelfServer!='Y'")}`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择阳采平台对接服务器',
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.map((item: any) => ({
                ...item,
                // id: item.id.toString(),
              })) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      // rules: 'required', // 去除主数据系统必填校验(测试要求的)
      // help: 'HIS要求发送数据时使用HIS系统提供的机构编码时填写',
      fieldName: 'yc_ad_server_id',
      label: '阳采平台对接服务器',
    },
    {
      component: 'Input',
      fieldName: 'yc_user_name',
      label: '阳采平台对接用户名',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入阳采平台对接用户名',
          allowClear: true,
        };
      },
    },
    {
      component: 'InputPassword',
      fieldName: 'yc_password',
      label: '阳采平台对接密码',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入阳采平台对接密码',
          allowClear: true,
        };
      },
    },
    // {
    //   component: 'Input',
    //   fieldName: 'yb_ad_server_id',
    //   label: '医保平台对接服务器',
    //   formItemClass: 'col-span-1',
    //   defaultValue: '',
    //   // rules: 'required',
    //   componentProps: () => {
    //     return {
    //       placeholder: '请输入医保平台对接服务器',
    //       allowClear: true,
    //     };
    //   },
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: `/baseHandleAction/serverList.do?validation=${encodeURIComponent("IsSelfServer!='Y'")}`,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择医保平台对接服务器',
          paginate: false,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.map((item: any) => ({
                ...item,
                // id: item.id.toString(),
              })) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      fieldName: 'yb_ad_server_id',
      label: '医保平台对接服务器',
    },
    {
      component: 'Input',
      fieldName: 'yb_hospital_code',
      label: '医保平台hospitalCode',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入医保平台hospitalCode',
          allowClear: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'yb_app_code',
      label: '医保平台appCode',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入医保平台appCode',
          allowClear: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'yb_auth_code',
      label: '医保平台authCode',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入医保平台authCode',
          allowClear: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'yb_access_key',
      label: '医保平台accessKey',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入医保平台accessKey',
          allowClear: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'yb_secret_key',
      label: '医保平台secretKey',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入医保平台secretKey',
          allowClear: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'yb_admdvs',
      label: '医保区划编码',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入医保区划编码',
          allowClear: true,
        };
      },
    },
    {
      component: 'Textarea',
      fieldName: 'yb_ca_info',
      label: '医保平台caInfo',
      formItemClass: 'col-span-1',
      defaultValue: '',
      componentProps: () => {
        return {
          placeholder: '请输入医保平台caInfo',
          type: 'textarea',
        };
      },
    },
  ],
  wrapperClass: 'grid-cols-1',
});

// AI-GENERATED-BEGIN
// @date 2026-07-11
// @prompt 医院配置弹窗保存功能
// @description 保存医院配置,使用saveHospitalSetting接口,传递id和adServerId
async function onSubmit() {
  const formData = await baseFormApi.getValues();
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const params = {
      ...formData,
      MC_HOSPITAL_ID: serviceData.value.id || undefined,
      adServerId: serviceData.value.adServerId || undefined,
      MC_Hospital_Setting_id:
        serviceData.value.MC_Hospital_Setting_id || undefined,
    };
    console.warn('医院配置保存参数:', params);

    saveHospitalSetting(params).then((res) => {
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
// AI-GENERATED-END
</script>
<template>
  <Modal class="w-[600px]" title="医院配置" title-tooltip="">
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_save_hospitalConfig"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
<style scoped lang="scss">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>

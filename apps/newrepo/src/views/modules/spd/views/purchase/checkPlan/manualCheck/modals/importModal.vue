<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { importAsnData } from '#/api/system/import';
import asn from '#/assets/excels/asn.base64?raw';
import excelUrl from '#/assets/excels/asn.xls?url';
// application/vnd.ms-excel;base64,
const base64Data = atob(asn);
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
const extParams = ref({
  // bpartnerId_text: '', departmentId_text: ''
});

const warehouseParams: any = ref({
  level1: 'Y',
});
const receiptType = ref('');
const applyBPartnerList: any = ref([]);
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
          dictUrl: '/orderPlanAction/receiptTypeList.do?classify=PO&isFree=Y',
          placeholder: '请选择入库类型',
          allowClear: true,
          paginate: false,
          immediate: true,
          onChange(val: any, option: any) {
            console.warn(val, option, 'val');
            receiptType.value = val;
            baseFormApi?.getValues().then((values) => {
              baseFormApi.getFieldComponentRef(
                'applyBPartnerId',
              ).params.dependencies = {
                departmentId: values.departmentId,
                // regionId:  values.departmentId,
                regionId:
                  values.receiptType === '5' ? values.departmentId : '-1',
              };
              baseFormApi?.getFieldComponentRef('applyBPartnerId')?.fetchApi();
              baseFormApi?.setFieldValue('applyBPartnerId', undefined);
            });
            warehouseParams.value.level1 = val === '5' ? undefined : 'Y';

            baseFormApi?.getFieldComponentRef('warehouseId')?.fetchApi();

            baseFormApi?.setFieldValue('warehouseId', undefined);
          },
          labelField: 'name',
          valueField: 'id',
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      // defaultValue: 1_000_007,
      fieldName: 'receiptType',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      label: '入库类型',
    },
    {
      component: 'ChcSelect',
      rules: 'required',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          placeholder: '请选择院区',
          allowClear: true,
          paginate: false,
          // onChange(val: any, option: any) {
          //   extParams.value.departmentId_text = option?.name;
          // },
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
      rules: 'required',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
          // showSearch: true,
          placeholder: '请选择采购仓库',
          extraParams: warehouseParams.value,

          triggerFields: ['departmentId', 'regionId'],
          paginate: false,
          onChange(val: any) {
            if (receiptType.value === '5') {
              const applyBPartner = applyBPartnerList.value.find(
                (item: any) => String(item.warehouseId) === String(val),
              );
              baseFormApi?.setFieldValue('applyBPartnerId', applyBPartner?.id);
            }
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
              regionId: values.departmentId,
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
      component: 'ChcSelect',
      rules: 'required',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择需求仓库',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          triggerFields: ['departmentId', 'regionId'],
          onChange(val: any, option: any) {
            if (receiptType.value === '5') {
              baseFormApi?.setFieldValue(
                'warehouseId',
                Number(option?.warehouseId),
              );
            }
          },
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            applyBPartnerList.value = res.rows || [];
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      dependencies: {
        triggerFields: ['departmentId', 'regionId'],
        trigger(values) {
          console.warn(values, 'values');
          if (
            baseFormApi?.getFieldComponentRef &&
            typeof baseFormApi?.getFieldComponentRef === 'function' &&
            baseFormApi?.getFieldComponentRef('applyBPartnerId') &&
            baseFormApi?.getFieldComponentRef('applyBPartnerId').params
          ) {
            baseFormApi.getFieldComponentRef(
              'applyBPartnerId',
            ).params.dependencies = {
              departmentId: values.departmentId,
              // regionId:  values.departmentId,
              regionId: values.receiptType === '5' ? values.departmentId : '-1',
            };
            baseFormApi?.getFieldComponentRef('applyBPartnerId')?.fetchApi();
            baseFormApi?.setFieldValue('applyBPartnerId', undefined);
          }
        },
      },
      fieldName: 'applyBPartnerId',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      label: '需求仓库',
    },
    // {
    //   component: 'DatePicker',
    //   fieldName: 'deliveryPlanDate',
    //   componentProps: () => {
    //     return {
    //       showTime: true,
    //       valueFormat: 'YYYY-MM-DD HH:mm',
    //       format: 'YYYY-MM-DD HH:mm',
    //     };
    //   },
    //   defaultValue: dayjs(dayjs().format('YYYY-MM-DD'))
    //     .add(1, 'day')
    //     .add(10, 'hour')
    //     .format('YYYY-MM-DD HH:mm'),
    //   label: '日期选择框',
    //   formItemClass: 'pl-[10px] pr-[10px]',
    //   labelClass: 'leading-1 mb-[1px] pl-[4px]',
    // },
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
  const { valid } = await baseFormApi.validate();
  if (!valid) {
    return;
  }
  // 弹窗加锁，显示loading
  modalApi.lock();
  baseFormApi.getValues().then((res) => {
    importAsnData({ file: info.file, ...res, ...extParams.value })
      .then((res) => {
        modalApi.unlock();
        if (res.success) {
          // message.success('导入成功');
          message.info(res.data?.msg || res?.msg || '导入成功');
          const modalData = modalApi.getData();
          modalData?.callback?.();
          // 导入成功后关闭弹窗
          modalApi.close();
        } else {
          message.error(`导入失败:${res.msg}`);
        }
      })
      .catch(() => {
        modalApi.unlock();
      });
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
        :href="excelUrl"
        download="手工入库导入模版"
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

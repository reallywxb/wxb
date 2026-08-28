<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { nextTick, ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { message, UploadDragger } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import excelUrl from '#/assets/excels/order.xls?url';

import { importApplyPlan } from '../api';

const props = defineProps<{
  selectToWarehouseId: any;
}>();
const emit = defineEmits(['refresh']);
// application/vnd.ms-excel;base64,
// const base64Data = atob(poPlanTemplate);
// const byteArray = new Uint8Array(base64Data.length);
// // console.log(byteArray);
// for (let i = 0; i < base64Data.length; i++) {
//   byteArray[i] = base64Data.codePointAt(i)!;
// }
// const blob = new Blob([byteArray], {
//   type: 'application/vnd.ms-excel',
// });
// const url = URL.createObjectURL(blob);
const modalData = ref<Record<string, any>>({});
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
    // console.warn('selectToWarehouseId', props.selectToWarehouseId);
    // setTimeout(() => {
    //   baseFormApi?.setFieldValue('toWarehouseId', props.selectToWarehouseId);
    // }, 0);
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      modalData.value = modalApi.getData();
      console.warn('modalData.value', modalData.value);
      nextTick(() => {
        baseFormApi?.setValues({
          applyPlanDate:
            modalData.value?.applyPlanDate ||
            dayjs().add(1, 'month').format('YYYY-MM-01'),
          departmentId: modalData.value?.departmentId || undefined,
          warehouseId: modalData.value?.warehouseId || undefined,
          toWarehouseId: modalData.value?.toWarehouseId || undefined,
        });
      });
    }
  },
});
const extParams = ref({ bpartnerId_text: '', departmentId_text: '' });
const departmentId = ref<number | string>('');
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
      fieldName: 'departmentId',
      label: '院区',
      component: 'ChcSelect',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          placeholder: '请选择院区',
          allowClear: true,
          paginate: false,
          onChange(val: any, option: any) {
            console.warn('请选择院区', val, option);
            extParams.value.departmentId_text = option?.name;
            departmentId.value = val;
          },
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            const id = res.rows?.[0]?.id || undefined;
            nextTick(() => {
              const toWarehouseIdRef =
                baseFormApi?.getFieldComponentRef &&
                typeof baseFormApi?.getFieldComponentRef === 'function' &&
                baseFormApi?.getFieldComponentRef('toWarehouseId');
              console.warn(
                'toWarehouseIdRef dd',
                baseFormApi?.getFieldComponentRef('toWarehouseId'),
              );
              console.warn('toWarehouseIdRef', toWarehouseIdRef);
              if (toWarehouseIdRef) {
                const refInst = baseFormApi?.getFieldComponentRef(
                  'toWarehouseId',
                ) as unknown as SelectComponentRef;
                if (refInst && refInst.params) {
                  baseFormApi?.setFieldValue(
                    'toWarehouseId',
                    modalData.value?.toWarehouseId || undefined,
                  );
                  refInst.params.dependencies = {
                    regionId: id || -1,
                    departmentId: id || -1,
                  };
                  if (typeof refInst?.fetchApi === 'function') {
                    refInst.fetchApi();
                  }
                }
              }
            });
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      // defaultValue: 1_000_007,
    },
    {
      fieldName: 'toWarehouseId',
      label: '申请仓库',
      component: 'ChcSelect',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
          placeholder: '请选择',
          triggerFields: ['departmentId', 'regionId'],
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      dependencies: {
        triggerFields: ['departmentId', 'regionId'],
        trigger(values) {
          console.warn(values);
          const toWarehouseIdRef =
            baseFormApi?.getFieldComponentRef &&
            typeof baseFormApi?.getFieldComponentRef === 'function' &&
            baseFormApi?.getFieldComponentRef('toWarehouseId');
          if (toWarehouseIdRef) {
            const refInst = baseFormApi?.getFieldComponentRef(
              'toWarehouseId',
            ) as unknown as SelectComponentRef;
            if (refInst && refInst.params) {
              baseFormApi?.setFieldValue('toWarehouseId', undefined);
              refInst.params.dependencies = {
                regionId: values.departmentId || -1,
                departmentId: values.departmentId || -1,
              };
              if (typeof refInst?.fetchApi === 'function') {
                refInst.fetchApi();
              }
            }
          }
        },
      },
    },

    {
      fieldName: 'warehouseId',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      label: '上级仓库',
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择上级仓库',
          triggerFields: ['toWarehouseId'],
          paginate: false,
          // allowClear: true,
          filterByFrontEnd: true,
          showChooseAll: '',
          defaultValue: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            if (res.rows?.length) {
              const firstOption = res.rows[0];
              baseFormApi?.setFieldValue('warehouseId', firstOption.id);
            }
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },

      dependencies: {
        triggerFields: ['toWarehouseId'],
        trigger(values: any) {
          const c =
            baseFormApi?.getFieldComponentRef &&
            typeof baseFormApi?.getFieldComponentRef === 'function' &&
            baseFormApi?.getFieldComponentRef('warehouseId');
          if (c) {
            const refInst = baseFormApi?.getFieldComponentRef(
              'warehouseId',
            ) as unknown as SelectComponentRef;
            if (refInst && refInst.params) {
              baseFormApi?.setFieldValue('warehouseId', undefined);
              refInst.params.dependencies = {
                toWarehouseId: values.toWarehouseId,
              };
              if (typeof refInst?.fetchApi === 'function') {
                refInst.fetchApi();
              }
            }
          }
        },
      },
    },
    {
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      component: 'DatePicker',
      fieldName: 'applyPlanDate',
      defaultValue: dayjs().add(1, 'month').format('YYYY-MM-01'),
      label: '计划月份',
      formItemClass: 'pl-[10px] pr-[10px]',

      componentProps: () => {
        return {
          picker: 'month',
          showTime: true,
          valueFormat: 'YYYY-MM-DD',
          format: 'YYYY-MM',
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
    console.warn('importApplyPlan', res, props.selectToWarehouseId);
    if (!res.toWarehouseId) {
      message.error('请选择申请仓库');
      return;
    }
    if (!res.departmentId) {
      message.error('请选择院区');
      return;
    }
    if (!res.warehouseId) {
      message.error('请选择上级仓库');
      return;
    }
    importApplyPlan({ file: info.file, ...res, ...extParams.value }).then(
      (res) => {
        if (res.success) {
          // message.success('导入成功');
          message.info(res.data?.msg || res.msg || '导入成功');
          emit('refresh');
          modalApi.close();
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
        :href="excelUrl"
        download="order"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="button-download"
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
        data-testid="button-UploadDragger"
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

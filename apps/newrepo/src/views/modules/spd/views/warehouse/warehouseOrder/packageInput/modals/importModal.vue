<script lang="ts" setup>
import type { UploadChangeParam } from 'ant-design-vue';

import { ref } from 'vue';

import { AntdDownloadOutlined, AntdUploadloadOutlined } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { InboxOutlined } from '@ant-design/icons-vue';
import { message, UploadDragger } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { importwarehousePackagedData } from '#/api/system/import';
import warehouseOrderTemplate from '#/assets/excels/warehouseOrder.base64?raw';

const props = defineProps<{
  selectToWarehouseId: any;
}>();
const emit = defineEmits(['close']);
// application/vnd.ms-excel;base64,
const base64Data = atob(warehouseOrderTemplate);
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
    setTimeout(() => {
      baseFormApi.setFieldValue(
        'toWarehouseId',
        props.selectToWarehouseId || undefined,
      );
    }, 200);
  },
});
const extParams = ref({ orderType: 'WO', isPackaged: 'Y' });
// 二级仓库下拉请求的额外入参
const secondaryWarehouseExtraParams = ref<{
  level2: number | string;
  level3: number | string;
  level4: number | string;
}>({
  level2: '',
  level3: '',
  level4: '',
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
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择院区',
          paginate: false,
          filterByFrontEnd: true,
          allowClear: true,
          onChange(val: any, option: any) {
            console.warn('toWarehouseId', val, option);
          },
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'departmentId',
      label: '院区',
    },
    {
      component: 'ChcSelect',
      fieldName: 'toWarehouseId',
      label: '申请仓库',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y&level1=N',
          // showSearch: true,
          placeholder: '请选择申请仓库',
          defaultValue: props.selectToWarehouseId || undefined,

          paginate: false,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          triggerFields: ['departmentId', 'regionId'],
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          onChange(val: any, option: any) {
            console.warn('warehouseId', val, option);

            const warehouseType = option.warehouseType;
            Object.entries(secondaryWarehouseExtraParams.value).forEach(
              ([key, value]) => {
                secondaryWarehouseExtraParams.value[
                  key as keyof typeof secondaryWarehouseExtraParams.value
                ] = '';
                console.warn('key', key, 'value', value);
              },
            );
            if (warehouseType && warehouseType > 1) {
              for (let i = 1; i < warehouseType; i++) {
                secondaryWarehouseExtraParams.value[
                  `level${i}` as keyof typeof secondaryWarehouseExtraParams.value
                ] = 'Y';
              }
            }
            baseFormApi?.setFieldValue(
              'warehouseId',
              option.parentId || undefined,
            );
          },
        };
      },
      dependencies: {
        triggerFields: ['departmentId', 'regionId'],
        trigger(values: any) {
          if (
            baseFormApi?.getFieldComponentRef &&
            typeof baseFormApi?.getFieldComponentRef === 'function' &&
            baseFormApi?.getFieldComponentRef('toWarehouseId')
          ) {
            baseFormApi.getFieldComponentRef(
              'toWarehouseId',
            ).params.dependencies = {
              regionId: values.departmentId,
              departmentId: values.departmentId,
            };
            baseFormApi?.getFieldComponentRef('toWarehouseId')?.fetchApi();
            baseFormApi?.setFieldValue('toWarehouseId', undefined);
          }
        },
      },
    },

    {
      fieldName: 'warehouseId',
      label: '上级仓库',
      component: 'ChcSelect',
      formItemClass: 'pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',

      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
          // showSearch: true,
          placeholder: '请选择上级仓库',

          paginate: false,
          allowClear: true,
          // onChange(val: any, option: any) {
          //   extParams.value.bpartnerId_text = option.name;
          // },
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          triggerFields: ['toWarehouseId'],
          extraParams: secondaryWarehouseExtraParams.value,
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
              toWarehouseId: values.toWarehouseId,
            };
            baseFormApi.getFieldComponentRef('warehouseId')?.fetchApi();
            baseFormApi?.setFieldValue('warehouseId', undefined);
          }
        },
      },
      // defaultValue: 1_000_007,
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
    importwarehousePackagedData({
      file: info.file,
      ...res,
      ...extParams.value,
    }).then((res) => {
      if (res.success) {
        // message.success('导入成功');
        message.info(res.data?.msg);
        modalApi.close();
        emit('close');
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
        :href="url"
        download="order"
        class="flex text-[14px] hover:text-[#707070]"
        data-testid="button_download_importModal"
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
        data-testid="button_upload_dragger_importModal"
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

<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { saveDo } from '../api';

const emit = defineEmits(['close']);
const typeData = ref<any>({});
// application/vnd.ms-excel;base64,
const title = ref('');
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

  onOpenChange(isOpen) {
    if (isOpen) {
      typeData.value = modalApi.getData<Record<string, any>>();

      title.value = typeData.value.surgicalTypeId ? '修改手术单' : '添加手术单';
      if (typeData.value.surgicalTypeId) {
        setTimeout(() => {
          baseFormApi.setValues(typeData.value);
        }, 100);
      }
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
    labelClass: 'w-[90px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 提交函数
  // handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: 'Input',
      fieldName: 'adviceName',
      label: '医嘱名称',
      formItemClass: ' pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入医嘱名称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'surgicalName',
      label: '手术名称',
      rules: 'required',
      formItemClass: ' pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入手术名称',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'doctorOrderNo',
      label: '医嘱号',
      formItemClass: ' pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入医嘱号',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'siteTreatmentId',
      label: '医嘱流水号',
      formItemClass: ' pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入医嘱流水号',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'diagnosis',
      label: '诊断',
      rules: 'required',
      formItemClass: 'col-span-2 pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入诊断',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'surgeryNo',
      label: '手术编号',
      rules: 'required',
      formItemClass: 'pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入手术编号',
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          getPopupContainer: () => {
            return document.querySelector('#typeForm');
          },
          dictUrl: '/baseHandleAction/listDepBpartnerAccessUser.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择主刀医生',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          defaultValue: '',
          valueField: 'id',
          afterFetch(res: any) {
            // const rows =
            //   res.rows?.map((item: any) => {
            //     item.id = item.id.toString();
            //     return item;
            //   }) || [];
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      formItemClass: 'pb-6',
      rules: 'required',
      fieldName: 'doctorUserId',
      label: '主刀医生',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          getPopupContainer: () => {
            return document.querySelector('#typeForm');
          },
          dictUrl: '/surgicalTypeAction/listSurgicalType.do?isActive=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择术式类型',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          defaultValue: '',
          valueField: 'id',
          afterFetch(res: any) {
            // const rows =
            //   res.rows?.map((item: any) => {
            //     item.id = item.id.toString();
            //     return item;
            //   }) || [];
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      formItemClass: 'pb-6',

      rules: 'required',
      fieldName: 'surgicalTypeId',
      label: '术式类型',
    },
    {
      component: 'DatePicker',
      fieldName: 'surgeryTime',
      label: '手术时间',
      rules: 'required',
      formItemClass: 'pb-6',

      componentProps: () => {
        return {
          showTime: true,
          format: 'YYYY-MM-DD HH:mm',
          valueFormat: 'YYYY-MM-DD HH:mm',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'patientName',
      label: '患者姓名',
      rules: 'required',
      formItemClass: ' pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入患者姓名',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'patientCode',
      label: '患者编号',
      rules: 'required',
      formItemClass: ' pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入患者编号',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'patientAge',
      label: '患者年龄',
      formItemClass: ' pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入患者年龄',
        };
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          defaultValue: '',
          getPopupContainer: () => {
            return document.querySelector('#typeForm');
          },
          options: [
            { value: '男', label: '男' },
            { value: '女', label: '女' },
            { value: '未知', label: '未知' },
          ],
          placeholder: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'patientSex',
      label: '患者性别',
    },
    {
      component: 'Input',
      fieldName: 'patientPhoneNo',
      label: '患者电话',
      formItemClass: ' pb-6 ',
      componentProps: () => {
        return {
          placeholder: '请输入患者电话',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'patientVisitCode',
      label: '住院号',
      rules: 'required',
      formItemClass: 'col-start-1 pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入住院号',
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'bedNo',
      label: '床号',
      formItemClass: ' pb-6',
      componentProps: () => {
        return {
          placeholder: '请输入床号',
        };
      },
    },
    {
      component: 'ChcSelect',
      rules: 'required',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          getPopupContainer: () => {
            return document.querySelector('#typeForm');
          },
          dictUrl: '/baseHandleAction/listDepBpartner.do?departmentType=1',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择开单科室',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          defaultValue: '',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
      fieldName: 'bpartnerId',
      label: '开单科室',
    },
    {
      component: 'ChcSelect',
      rules: 'required',
      componentProps: () => {
        return {
          getPopupContainer: () => {
            return document.querySelector('#typeForm');
          },
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/listDepBpartner.do?departmentType=1',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择执行科室',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          defaultValue: '',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
      formItemClass: 'pb-6',

      fieldName: 'applyBpartnerId',
      label: '执行科室',
    },
    {
      component: 'ChcSelect',
      rules: 'required',
      componentProps: () => {
        return {
          getPopupContainer: () => {
            return document.querySelector('#typeForm');
          },
          // autoChooseFirstOption: true,
          dictUrl: '/surgicalRoomAction/listSurgicalRoom.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择手术室',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          defaultValue: '',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
      formItemClass: 'pb-6',

      fieldName: 'surgicalRoomId',
      label: '手术室',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
      componentProps: () => {
        return {
          defaultValue: '',
        };
      },
      formItemClass: 'col-span-2 pb-6',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});
const onSubmit = async () => {
  const { valid } = await baseFormApi.validate();
  if (!valid) {
    return;
  }
  baseFormApi.getValues().then((res: any) => {
    saveDo({
      ...res,
      treatmentId: typeData.value.treatmentId || undefined,
      isSurgery: 'Y',
    }).then((res) => {
      if (res && res.success) {
        message.success({
          content: '操作成功',
        });
        modalApi.close();
        emit('close');
      }
    });
  });
};
</script>
<template>
  <Modal class="w-[800px]" :title="title" title-tooltip="">
    <BaseForm id="typeForm" />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_typeModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>

<style lang="less" scoped>
::v-deep(.mr300) {
  margin-right: 300px !important;
}
</style>

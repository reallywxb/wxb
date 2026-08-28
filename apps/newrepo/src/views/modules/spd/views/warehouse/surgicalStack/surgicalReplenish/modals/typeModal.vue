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

      title.value = typeData.value.surgicalTypeId ? '修改' : '添加';
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
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level3=N',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择仓库',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          // defaultValue: '',
          showChooseAll: false,
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.map((item: any) => {
                item.id = item.id.toString();
                return item;
              }) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      fieldName: 'warehouseId',
      label: '仓库',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/departmentBPartner.do',
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
          showChooseAll: false,
          valueField: 'id',
          afterFetch(res: any) {
            const rows =
              res.rows?.map((item: any) => {
                item.id = item.id.toString();
                return item;
              }) || [];
            return { ...res, rows: undefined, records: rows };
          },
        };
      },
      fieldName: 'bpartnerId',
      label: '执行科室',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/surgicalTypeAction/listSurgicalType.do?isStockup=Y',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择术式',
          paginate: false,
          allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          defaultValue: '',
          showChooseAll: false,
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows || [] };
          },
        };
      },
      fieldName: 'surgicalTypeId',
      label: '术式',
    },
    {
      component: 'InputNumber',
      fieldName: 'levelMin',
      label: '库存下限',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          placeholder: '请输入库存下限',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});
function onSubmit() {
  baseFormApi.getValues().then((res: any) => {
    if (!res.surgicalTypeId) {
      message.warn('术式不能为空！');
      return;
    }
    if (!res.bpartnerId) {
      message.warn('执行科室不能为空！');
      return;
    }
    if (!res.levelMin) {
      message.warn('下限不能为空！');
      return;
    }
    // ChcGridApi.query({ ...res });
    saveDo({
      ...res,
      id: typeData.value.surgicalReplenishId || undefined,
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
  // message.success({
  //   content: `form values: ${JSON.stringify(values)}`,
  // });
}
</script>
<template>
  <Modal class="w-[700px]" :title="title" title-tooltip="">
    <BaseForm />
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

<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal, z } from '@vben/common-ui';

import { message, Switch } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';

defineOptions({
  name: 'ZoneSectionFormModal',
});
interface Param {
  form: any;
  submit: (params: Record<number | string, any>) => Promise<void>;
  title: string;
  type?: 'add' | 'edit';
}

const param = ref<Param>();

const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行, 值为horizontal
  layout: 'vertical',
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  submitButtonOptions: {
    show: false,
  },
  resetButtonOptions: {
    show: false,
  },
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,

  schema: [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入库房名称',
      },
      fieldName: 'name',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '库区名称',
      rules: z.string().nonempty('请输入库区名称'),
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入库房搜索码',
      },
      fieldName: 'value',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '库房搜索码',
      // TODO 禅道2177 去除必填校验
      // rules: z.string().nonempty('请输入库房搜索码'),
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/warehouseAction/userList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择责任人',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          style: {
            width: '300px',
          },
        };
      },
      rules: 'required',
      fieldName: 'managerId',
      label: '责任人',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Switch',
      fieldName: 'isSmart',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否智能库区',
    },
    {
      component: 'Switch',
      fieldName: 'isActive',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否有效',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();

    if (valid) {
      try {
        await param.value?.submit(await formApi.getValues());

        message.success('操作成功');

        modalApi.close();
      } catch (error) {
        console.error(error);
      }
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      param.value = modalApi.getData() as Param;
      console.warn('param.value.form', param.value);
      formApi.setValues(cloneDeep(param.value.form));
    }
  },
});

function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>
<template>
  <Modal class="h-[600px] w-[500px]" confirm-text="提交" :title="param?.title">
    <Form>
      <template #isSmart="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
          data-testid="switch_isSmart_zoneSectionFormModal"
        />
      </template>
      <template #isActive="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
          data-testid="switch_isActive_zoneSectionFormModal"
        />
      </template>
    </Form>
    <!-- <template #prepend-footer>
      <Button type="primary" @click="onSubmit">提交</Button>
    </template> -->
  </Modal>
</template>

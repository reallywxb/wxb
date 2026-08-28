<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Popover, Switch } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';

defineOptions({
  name: 'WarehouseUserFormModal',
});
interface Param {
  form: any;
  submit: (params: Record<number | string, any>) => Promise<void>;
  title: string;
  type: 'add' | 'edit';
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
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/baseHandleAction/refList.do?id=1000244',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择商品组',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          showChooseAll: false,
          disabled: param.value?.type === 'edit',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          style: {
            width: '300px',
          },
        };
      },
      fieldName: 'productControlLevel',
      label: '商品组',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: false,
          dictUrl: '/baseHandleAction/refList.do?id=1000439',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择结算边界',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          style: {
            width: '300px',
          },
        };
      },
      fieldName: 'settlementMode',
      label: '结算边界',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
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
  wrapperClass: 'grid-cols-1',
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
      } catch (error: any) {
        console.error('提交失败:', error);
        // message.error(error?.msg || '操作失败');
      }
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      param.value = modalApi.getData() as Param;
      console.warn('param.value.form', param.value);
      // console.log('boolean', param.value?.type === 'edit');
      formApi.setValues(cloneDeep(param.value.form));
      const IsShowProductControlLevel = param.value.type === 'add'; // 新增时显示商品组 编辑时不显示
      formApi.updateSchema([
        {
          fieldName: 'productControlLevel',
          dependencies: {
            triggerFields: ['productControlLevel'],
            show: () => {
              return IsShowProductControlLevel;
            },
          },
        },
      ]);
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
  <Modal class="h-[400px] w-[500px]" confirm-text="提交">
    <template #title>
      <div class="w-[80%]">
        <Popover trigger="hover">
          <template #content>
            <p>{{ param?.title }}</p>
          </template>
          <div class="w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {{ param?.title }}
          </div>
        </Popover>
      </div>
    </template>
    <Form>
      <template #isActive="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
          data-testid="switch_isDefault_sectionlocatorFormModal"
        />
      </template>
    </Form>
  </Modal>
</template>
<style scoped lang="scss">
:deep(.grid-cols-1 .col-span-full) {
  padding-bottom: 0 !important;
}
</style>

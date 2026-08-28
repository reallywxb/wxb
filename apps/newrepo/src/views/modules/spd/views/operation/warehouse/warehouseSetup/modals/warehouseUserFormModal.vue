<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { message, Popover, Switch } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { useSpdGrid } from '#/components/spd';

defineOptions({
  name: 'WarehouseUserFormModal',
});
interface Param {
  form: any;
  submit: (params: Record<number | string, any>) => Promise<void>;
  title: string;
  type?: 'add' | 'edit';
}

const param = ref<Param>();
const isShowTable = ref(false);
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
          autoChooseFirstOption: true,
          dictUrl: '/warehouseAction/userList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
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
      fieldName: 'userId',
      label: '用户',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Switch',
      fieldName: 'isReadWrite',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '允许写入',
    },
    {
      component: 'Switch',
      fieldName: 'isActive',
      formItemClass: 'col-span-1 col-start-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      label: '是否有效',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/refList.do?id=1000593',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          showChooseAll: false,
          onChange(val: any, option: any) {
            console.warn(val, option, chcGridApi);
            isShowTable.value = option.value === 'E';
            if (isShowTable.value) {
              setTimeout(() => {
                chcGridApi.query();
              }, 200);
            }
          },
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
          style: {
            width: '300px',
          },
        };
      },
      fieldName: 'sectionAuthType',
      label: '库区权限',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-1',
});

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    gridOptions: {
      // columns: [
      //   {
      //     title: '序号',
      //     width: 50,
      //     align: 'center',
      //     formatter(scope: any) {
      //       return scope.rowIndex + 1;
      //     },
      //   },
      //   { type: 'checkbox', title: '', width: 50, align: 'center' },
      //   {
      //     field: 'sectionName',
      //     minWidth: 130,
      //     title: '库区',
      //     sortable: true,
      //   },
      //   {
      //     field: 'isActive',
      //     minWidth: 130,
      //     title: '是否有权限',
      //     sortable: true,
      //     slots: { default: 'isActive' },
      //   },
      // ],
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      // 取消分页
      pagerConfig: {
        enabled: false,
      },
      height: 'auto',
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        console.warn('checkboxChange:', records);
      },
      // 全选/全不选事件
      checkboxAll: ({ records, checked }: any) => {
        console.warn('checkboxAll:', checked, records);
      },
    },
  },
  {
    dataTableId: '/warehouseAction/querySectionUserAccess.do',
    id: 'sectionUserAccessTable',
    gridColumns: [
      {
        title: '序号',
        width: 50,
        align: 'center',
        field: 'index',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'sectionName',
        minWidth: 130,
        title: '库区',
        sortable: true,
      },
      {
        field: 'isActive',
        minWidth: 130,
        title: '是否有权限',
        sortable: true,
        slots: { default: 'isActive' },
      },
    ],
    tableSearchExtraParams: {
      // userId: param.value?.form.userId,
      // warehouseId: param.value?.form.warehouseId,
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        limit: 0,
        userId: param.value?.form.userId,
        warehouseId: param.value?.form.warehouseId,
      };
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [Modal, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      try {
        const formValues = await formApi.getValues();
        console.warn('formValues:', formValues);
        console.warn('grid===>', chcGridApi);
        // await nextTick();
        // const records = chcGridApi.grid.getCheckboxRecords();
        const records = chcGridApi.grid.getTableData();
        console.warn('records:', records);
        const sectionUpdate: {
          isActive: string;
          sectionId: string;
        }[] = [];
        if (records && records.tableData && records.tableData.length > 0) {
          records.tableData.forEach((item: any) => {
            sectionUpdate.push({
              sectionId: item.sectionId,
              isActive: item.isActive,
            });
          });
        }
        const params = {
          sectionAuth: JSON.stringify(sectionUpdate),
          ...formValues,
        };
        await param.value?.submit(params);
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
      // 如果库区权限是E，显示库区权限表格
      isShowTable.value = param.value?.form.sectionAuthType === 'E';
      // 刷新库区权限表格
      // if (isShowTable.value) {
      setTimeout(() => {
        chcGridApi.query();
      }, 200);
      // }
      formApi.setValues(cloneDeep(param.value.form));
    }
  },
});

const handleActiveSwitchChange = (row: any, checked: any) => {
  console.warn('handleActiveSwitchChange:', row, checked);
};

function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>
<template>
  <Modal
    class="modal-box h-[500px] w-[460px]"
    confirm-text="提交"
    :title="param?.title"
  >
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
      <template #isReadWrite="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
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
        />
      </template>
    </Form>
    <Page content-class="p-[0px]" auto-content-height :height-offset="600">
      <ChcGrid v-show="isShowTable">
        <template #isActive="scope">
          <div @click.stop>
            <Switch
              v-model:checked="scope.row.isActive"
              @change="
                (checked: any) => handleActiveSwitchChange(scope.row, checked)
              "
              checked-value="Y"
              checked-children="是"
              un-checked-value="N"
              un-checked-children="否"
              :data-testid="`switch_isActive_${scope.rowIndex}_warehouseUserFormModal`"
            />
          </div>
        </template>
      </ChcGrid>
    </Page>
  </Modal>
</template>
<style scoped lang="scss">
:deep(.grid-cols-1 .col-span-full) {
  padding-bottom: 0 !important;
}
</style>

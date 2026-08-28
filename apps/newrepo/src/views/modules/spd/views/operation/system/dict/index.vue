<script lang="ts" setup>
import type {
  ExtendedFormApi,
  ExtendedModalApi,
  VbenFormProps,
} from '@vben/common-ui';

import { computed, reactive, ref } from 'vue';

import {
  AddActionIcon,
  EditActionIcon,
  SearchActionIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

// @ts-ignore
import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';

import { useChcGrid } from '#/adapter/chc-ui';
import { formDefaultOptions, gridDefaultOptions } from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { queryDict } from '#/views/modules/spd/views/operation/system/dict/api';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';
import DepartmentTree from '#/views/modules/sys/views/common/tree/DepartmentTree.vue';
import {
  createDictItem,
  delDictItem,
  updateDictItem,
} from '#/views/modules/sys/views/dict/api/dict';

const MODAL_MODE = {
  add: 0,
  edit: 1,
};

const modificationModalRef = ref<
  | (Record<string, any> & {
      formApi?: ExtendedFormApi;
      modalApi: ExtendedModalApi;
    })
  | undefined
>();

const parentTableParams = reactive<{
  dictId: number | string | undefined;
}>({
  dictId: '',
});

const [RoleGrid, roleGridApi] = useChcGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      columns: [
        { fixed: 'left', title: '序号', type: 'seq', width: 50 },
        { field: 'orgId_name', title: '机构', minWidth: 100, sortable: true },
        { field: 'code', title: '编码', minWidth: 100, sortable: true },
        { field: 'name', title: '名称', minWidth: 100, sortable: true },
        { field: 'value', title: '字典项值', minWidth: 100, sortable: true },
        { field: 'sort', title: '排序', minWidth: 100, sortable: true },
        { field: 'type', title: '分类', minWidth: 100, sortable: true },
        { field: 'clientCode', title: '客户端', minWidth: 100, sortable: true },
        {
          field: 'isActive',
          title: '是否启用',
          width: 100,
          formatter: ({ cellValue }: any) => (cellValue ? '是' : '否'),
          sortable: true,
        },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: '操作',
          minWidth: 150,
        },
      ],
    }),
  },
  {
    id: 'child',
    dataTableId: '/datatable/data/page/sys.dictItem',
    parentTableParams,
  },
);

const formMode = ref<number>(MODAL_MODE.add);

const subFormOption: VbenFormProps = {
  layout: 'horizontal',
  commonConfig: {
    labelClass: 'w-[100px]',
    componentProps: {
      class: 'w-full',
    },
  },
  schema: [
    {
      component: 'ChcSelect',
      componentProps: () => ({
        allowClear: false,
        dictUrl: '/datatable/getDict/entity:sys.org',
        placeholder: '请选择',
        paginate: false,
        showSearch: true,
        filterByFrontEnd: true,
        afterFetch: (records: any[]) => ({ records }),
        disabled: formMode.value === MODAL_MODE.edit,
      }),
      fieldName: 'orgId',
      label: '机构',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: '字典项编码',
      componentProps: () => {
        return {
          placeholder: '请输入字典项名称',
        };
      },
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '字典项名称',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: '字典项值',
      componentProps: computed(() => ({
        disabled: formMode.value === MODAL_MODE.edit,
      })),
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: '排序',
      componentProps: () => {
        return {
          placeholder: '请输入',
        };
      },
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: '分类',
      componentProps: () => {
        return {
          placeholder: '请输入',
        };
      },
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Input',
      fieldName: 'clientCode',
      label: '客户端',
      componentProps: () => {
        return {
          placeholder: '请输入',
        };
      },
      dependencies: {
        triggerFields: ['a'],
        show: () => formMode.value === MODAL_MODE.add,
      },
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
    },
    {
      component: 'Switch',
      componentProps: () => ({
        checkedValue: true,
        checkedChildren: '是',
        unCheckedValue: false,
        unCheckedChildren: '否',

        style: {
          width: '40px',
        },
      }),
      fieldName: 'isActive',
      label: '是否启用',
      formItemClass: 'col-span-1 pl-[10px] pr-[10px]',
      labelClass: 'leading-1 mb-[0px] pl-[4px]',
      defaultValue: true,
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
};

const dictItemName = ref('');

const handleSearch = () => {
  if (!parentTableParams.dictId) return;
  roleGridApi.query({
    name: dictItemName.value,
  });
};

const handleAdd = () => {
  formMode.value = MODAL_MODE.add;

  modificationModalRef.value?.modalApi
    .setData({
      title: '新增',
      submit: (params: any) =>
        createDictItem({ ...params, dictId: parentTableParams.dictId }),
    })
    .open();
};

const handleEdit = (form: any) => {
  formMode.value = MODAL_MODE.edit;

  modificationModalRef.value?.modalApi
    .setData({
      title: '编辑 ',
      form,
      submit: (params: any) =>
        updateDictItem({
          ...params,
          id: form.id,
        }),
    })
    .open();
};

const handleDelete = ({ id }: any) => {
  Modal.confirm({
    title: '提示',
    content: '确定要删除吗？',
    onOk: async () => {
      try {
        await delDictItem(id);

        message.success('删除成功');
        roleGridApi.query();
      } catch (error) {
        console.error(error);
      }
    },
  });
};

function onSelect(ids: Array<number | string>, { node }: any) {
  parentTableParams.dictId = node.dataRef?.id;
  console.warn('rrrrrrrr', parentTableParams.dictId, node, node.dataRef?.id);
  roleGridApi.query();
}

async function queryDictTree(data: any = {}, cb?: (params: any) => void) {
  return queryDict({
    ...data,
    isSystem: false, // 只展示用户自定义字典
    size: 200,
  }).then(({ records, ...extra }) => {
    cb?.(extra);
    return records;
  });
}
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <CommonFormModal
        :form-option="subFormOption"
        :after-submit="handleSearch"
        ref="modificationModalRef"
      />
      <PageSplitLazy
        :distribute="0.3"
        :line-thickness="6"
        :is-vertical="true"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <DepartmentTree
            class="flex-1 overflow-hidden"
            @select="onSelect"
            @searchSelect="onSelect"
            pagination
            :request="queryDictTree"
            search-auto-scroll
            :display-root="false"
            :field-names="{ title: 'name', key: 'id' }"
          />
        </template>
        <template #second>
          <RoleGrid>
            <template #toolbar-actions>
              <Input
                v-model:value="dictItemName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="请输入名称"
                @keyup.enter="handleSearch"
                @change="() => !dictItemName && handleSearch()"
                allow-clear
              />
              <Button type="primary" class="mr-[0.5rem]" @click="handleSearch">
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                @click="handleAdd"
                :disabled="!parentTableParams.dictId"
              >
                新增
                <template #icon>
                  <AddActionIcon />
                </template>
              </Button>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                ghost
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleEdit(scope.row)"
              >
                修改
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                ghost
                danger
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleDelete(scope.row)"
              >
                删除
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
            </template>
          </RoleGrid>
        </template>
      </PageSplitLazy>
    </div>
  </Page>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}
</style>

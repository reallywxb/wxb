<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import {
  delSurgicalRoom,
  saveSurgicalRoom,
} from '#/views/modules/spd/views/operation/system/api';

import commonFormModalComp from '../common/modals/commonFormModal.vue';

const userStore = useUserStore();

// 父表
const [ParentGrid, parentGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      // commonConfig: {
      //   labelClass: 'w-[90px]',
      // },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'surgicalRoom',
    // api地址
    queryUrl: 'surgicalRoomAction/query.do',
    gridColumns: [
      { type: 'radio', title: '', width: 50, align: 'center', visible: false },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'name',
        title: '名称',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'value',
        title: '编码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'isActive',
        title: '是否有效',
        minWidth: '100',
        sortable: true,
        formatter({ cellValue }) {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      // {
      //   align: 'center',
      //   field: 'action',
      //   slots: { default: 'action' },
      //   fixed: 'right',
      //   headerAlign: 'center',
      //   showOverflow: false,
      //   title: $t('system.menu.operation'),
      //   width: 230,
      // },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '名称',
        componentProps: () => {
          return {
            placeholder: `请输入`,
            defaultValue: '',
          };
        },
      },
      {
        component: 'Checkbox',
        fieldName: 'isActive',
        renderComponentContent() {
          return {
            default: '活跃',
          };
        },
      },
    ],
    gridEvents: {},
    beforeFetchFn(params: any) {
      params.isActive = params.isActive ? 'Y' : null;

      return params;
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    tableSearchExtraParams: {
      orgId: userStore.userInfo?.orgId,
    },
  },
);

// 父表 - 拒绝对话框
const [SurgicalRoomModal, surgicalRoomModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

/**
 * 页面弹窗表单配置
 */
const modificationFormOptions: VbenFormProps = {
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      componentProps: () => {
        return {
          rows: 5,
        };
      },
      label: '名称',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'value',
      componentProps: () => {
        return {
          rows: 5,
        };
      },
      label: '编码',
      rules: 'required',
    },
    {
      component: 'Switch',
      fieldName: 'isActive',
      label: '是否有效',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: false,
  // 是否在字段值改变时提交表单
  submitOnChange: false,
  // 按下回车时是否提交表单
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

function addRoom() {
  surgicalRoomModalApi
    .setData({
      title: '添加',
      form: {},
      submit: (params) => saveSurgicalRoom(params),
    })
    .open();
}

function modifyRoom() {
  const selectedRow = parentGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }

  const { surgicalRoomId: id, ...form } = selectedRow;

  surgicalRoomModalApi
    .setData({
      title: '修改',
      form,
      submit: (params) =>
        saveSurgicalRoom({
          id,
          ...params,
        }),
    })
    .open();
}

function delRoom() {
  const selectedRow = parentGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }

  Modal.confirm({
    title: '提示',
    content: `确认删除吗？`,
    onOk: async () => {
      try {
        await delSurgicalRoom({
          ids: selectedRow.surgicalRoomId,
        });

        message.success('删除成功');

        parentGridApi.query();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

onMounted(() => {
  parentGridApi.query();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <SurgicalRoomModal
      :form-options="modificationFormOptions"
      :after-submit="parentGridApi.query"
    >
      <template #isActive="scope">
        <Switch
          :checked="scope.modelValue"
          @update:checked="scope.setValue($event, false)"
          checked-value="Y"
          un-checked-value="N"
          checked-children="是"
          un-checked-children="否"
          data-testid="switch_isActive"
        />
      </template>
    </SurgicalRoomModal>
    <ParentGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="addRoom"
          data-testid="button_add"
        >
          新增
          <!--              <template #icon>-->
          <!--                <SvgPrintFillIcon />-->
          <!--              </template>-->
        </Button>
        <Button
          type="primary"
          @click="modifyRoom"
          class="mr-[0.5rem]"
          data-testid="button_edit"
        >
          修改
          <!--              <template #icon>-->
          <!--                <ExportActionIcon />-->
          <!--              </template>-->
        </Button>
        <Button
          danger
          type="primary"
          @click="delRoom()"
          class="mr-[0.5rem]"
          data-testid="button_delete"
        >
          删除
        </Button>
      </template>
    </ParentGrid>
  </Page>
</template>

<script lang="ts" setup>
import type { VbenFormProps } from '@vben/common-ui';

import { onMounted } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import {
  delMovementWorker,
  saveMovementWorker,
} from '#/views/modules/spd/views/operation/system/api';

import commonFormModalComp from '../common/modals/commonFormModal.vue';

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
    id: 'movementWorker',
    // api地址
    queryUrl: 'movementWorkerHandleAction/query.do',
    gridColumns: [
      { type: 'radio', title: '', width: 50, align: 'center', visible: false },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'value',
        title: '工号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'name',
        title: '姓名',
        minWidth: '100',
        sortable: true,
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
        label: '姓名',
        componentProps: () => {
          return {
            placeholder: `请输入`,
            defaultValue: '',
          };
        },
      },
    ],
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 父表 - 拒绝对话框
const [MovementWorkerModal, movementWorkerModalApi] = useVbenModal({
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
      fieldName: 'value',
      componentProps: () => {
        return {
          rows: 5,
        };
      },
      label: '工人工号',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      componentProps: () => {
        return {
          rows: 5,
        };
      },
      label: '工人姓名',
      rules: 'required',
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
  movementWorkerModalApi
    .setData({
      title: '增加转运工人',
      form: {},
      submit: (params) => saveMovementWorker(params),
    })
    .open();
}

function modifyRoom() {
  const selectedRow = parentGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }

  const { movementWorkerId, ...form } = selectedRow;

  movementWorkerModalApi
    .setData({
      title: '修改转运工人',
      form,
      submit: (params) =>
        saveMovementWorker({
          movementWorkerId,
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
        await delMovementWorker({
          movementWorkerId: selectedRow.movementWorkerId,
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
    <MovementWorkerModal
      :form-options="modificationFormOptions"
      :after-submit="parentGridApi.query"
    />
    <ParentGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="addRoom"
          data-testid="button_add_movementWorker"
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
          data-testid="button_modify_movementWorker"
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
          data-testid="button_del_movementWorker"
        >
          删除
        </Button>
      </template>
    </ParentGrid>
  </Page>
</template>

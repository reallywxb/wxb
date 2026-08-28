<script setup lang="ts">
import type { WarehouseUserTableType } from '../../api';

import { inject, onMounted } from 'vue';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { delWarehouseUser, saveWarehouseUser } from '../../api';
import { TREE_CONTEXT_KEY } from '../../index';
import WarehouseUserFormCom from '../../modals/warehouseUserFormModal.vue';

const treeContext = inject(TREE_CONTEXT_KEY);
// 表格配置
const [WarehouseUserGrid, WarehouseUserGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
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
    id: 'warehouseUserGrid',
    // api地址
    queryUrl: '/warehouseAction/queryWarehouseUser.do',
    gridColumns: [
      {
        type: 'radio',
        title: '',
        width: 50,
        align: 'center',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'userName',
        title: '所属用户',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'warehouseCode',
        title: '仓库编码',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'address',
        title: '仓库地址',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'sectionAuthTypeName',
        title: '库区权限类型',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'sectionAuth',
        title: '库区权限',
        minWidth: '100',
        sortable: false,
      },
      {
        field: 'isReadWrite',
        title: '允许写入',
        slots: { default: 'isReadWrite' },
        minWidth: '100',
        sortable: true,
        align: 'left',
      },
      {
        field: 'isActive',
        title: '活跃的',
        slots: { default: 'isActive' },
        minWidth: '100',
        sortable: true,
        align: 'left',
      },
    ],
    // 表单配置
    formSchema: [],
    tableSearchExtraParams: {
      warehouseId: treeContext?.selectedNode.value?.id,
    },
  },
);

// 弹框配置
const [WarehouseUserFormModal, WarehouseUserFormModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: WarehouseUserFormCom,
  draggable: true,
});

// 新增和修改
function handleAddOrEdit(type: 'add' | 'edit') {
  console.warn('handleAddOrEdit', type);
  const text = treeContext?.selectedNode.value?.text || '';
  if (type === 'add') {
    WarehouseUserFormModalApi.setData({
      title: `添加仓库用户${text}`,
      form: {
        warehouseId: treeContext?.selectedNode.value?.id as string,
        userId: undefined,
        isReadWrite: 'Y',
        isActive: 'Y',
        sectionAuthType: undefined,
      },
      submit: (params: {
        isActive: 'N' | 'Y';
        isReadWrite: 'N' | 'Y';
        sectionAuth?: string;
        sectionAuthType: string;
        userId: string;
      }) => {
        console.warn('新增仓库用户params===>', params);
        saveWarehouseUser({
          warehouseId: treeContext?.selectedNode.value?.id as string,
          ...params,
        }).then(async () => {
          // 刷新用户列表
          await WarehouseUserGridApi.query();
          // 刷新当前仓库下的子节点，而不是整个树
          await treeContext?.refreshTree?.();
        });
      },
    }).open();
  } else if (type === 'edit') {
    const selectedRow: WarehouseUserTableType =
      WarehouseUserGridApi.grid.getRadioRecord();
    console.warn('selectedRow===>', selectedRow);
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }
    const { userId, isReadWrite, isActive, sectionAuthType } = selectedRow;
    WarehouseUserFormModalApi.setData({
      title: '修改仓库用户',
      form: {
        warehouseId: treeContext?.selectedNode.value?.id as string,
        userId,
        isReadWrite,
        sectionAuthType,
        isActive,
      },
      submit: (params: any) => {
        console.warn('修改仓库用户params===>', params);
        saveWarehouseUser({
          warehouseId: treeContext?.selectedNode.value?.id as string,
          ...params,
        }).then(() => {
          WarehouseUserGridApi.query();
          treeContext?.refreshTree();
        });
      },
    }).open();
  }
}

// 删除
function handleDel() {
  const selectedRow = WarehouseUserGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }
  const params = {
    warehouseId: treeContext?.selectedNode.value?.id as string,
    userId: selectedRow.userId,
  };
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await delWarehouseUser(params);
        message.success('删除成功');
        WarehouseUserGridApi.query();
        treeContext?.refreshTree();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

const handleActiveSwitchChange = (row: any, checked: boolean) => {
  console.warn('handleActiveSwitchChange', row, checked);
};

onMounted(() => {
  console.warn('treeContext', treeContext);
  WarehouseUserGridApi.query();
});
</script>

<template>
  <div class="h-full">
    <WarehouseUserFormModal />
    <WarehouseUserGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddOrEdit('add')"
          data-testid="button_add_warehouseUser"
        >
          新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddOrEdit('edit')"
          data-testid="button_edit_warehouseUser"
        >
          修改
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDel"
          data-testid="button_delete_warehouseUser"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <template #isReadWrite="scope">
        <Switch
          :checked="scope.row.isReadWrite"
          checked-value="Y"
          checked-children="是"
          un-checked-value="N"
          un-checked-children="否"
          disabled
          :data-testid="`switch_isReadWrite_${scope.rowIndex}_warehouseUser`"
        />
      </template>
      <template #isActive="scope">
        <Switch
          :checked="scope.row.isActive"
          @change="
            (checked: any) => handleActiveSwitchChange(scope.row, checked)
          "
          checked-value="Y"
          checked-children="是"
          un-checked-value="N"
          un-checked-children="否"
          disabled
          :data-testid="`switch_isActive_${scope.rowIndex}_warehouseUser`"
        />
      </template>
    </WarehouseUserGrid>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>

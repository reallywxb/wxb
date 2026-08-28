<script setup lang="ts">
import type { WarehouseRoomTableType } from '../../api';

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

import { delWarehouseRoom, saveWarehouseRoom } from '../../api';
import { TREE_CONTEXT_KEY } from '../../index';
import warehouseRoomFormCom from '../../modals/warehouseRoomFormModal.vue';

const treeContext = inject(TREE_CONTEXT_KEY);
// 表格配置
const [WarehouseRoomGrid, WarehouseRoomGridApi] = useSpdGrid(
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
    id: 'warehouseRoomGrid',
    // api地址
    queryUrl: '/warehouseAction/queryZone.do',
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
        field: 'warehouseName',
        title: '仓库名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'name',
        title: '库房名称',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'value',
        title: '搜索码',
        minWidth: '80',
        sortable: true,
      },
      {
        field: 'isActive',
        title: '活跃的',
        slots: { default: 'isActive' },
        minWidth: '80',
        sortable: true,
        align: 'left',
      },
    ],
    // 表单配置
    formSchema: [
      // {
      //   component: 'Input',
      //   fieldName: 'departmentName',
      //   label: '科室病区',
      //   componentProps: () => {
      //     return {
      //       placeholder: `请输入`,
      //       defaultValue: '',
      //     };
      //   },
      // },
    ],
    tableSearchExtraParams: {
      warehouseId: treeContext?.selectedNode.value?.id,
    },
  },
);

// 弹框配置
const [WarehouseRoomFormModal, WarehouseRoomFormModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: warehouseRoomFormCom,
  draggable: true,
});

// 新增和修改
function handleAddOrEdit(type: 'add' | 'edit') {
  console.warn('handleAddOrEdit', type);
  const text = treeContext?.selectedNode.value?.text || '';
  if (type === 'add') {
    WarehouseRoomFormModalApi.setData({
      title: `新增库房${text}`,
      form: {
        zoneId: undefined,
        name: undefined,
        value: undefined,
        isActive: 'Y',
      },
      submit: (params: {
        isActive: 'N' | 'Y';
        name: string;
        value: string;
      }) => {
        console.warn('新增库房params===>', params);
        saveWarehouseRoom({
          warehouseId: treeContext?.selectedNode.value?.id as string,
          ...params,
        }).then(async () => {
          // 刷新表格数据
          await WarehouseRoomGridApi.query();
          // 注意：这里只刷新当前仓库下的子节点，而不是整个树
          await treeContext?.refreshTree?.();
        });
      },
    }).open();
  } else if (type === 'edit') {
    const selectedRow: WarehouseRoomTableType =
      WarehouseRoomGridApi.grid.getRadioRecord();
    console.warn('selectedRow===>', selectedRow);
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }
    const { name, value, zoneId, isActive } = selectedRow;
    WarehouseRoomFormModalApi.setData({
      title: `修改库房${text}`,
      form: {
        zoneId,
        name,
        value,
        isActive,
      },
      submit: (params: any) => {
        console.warn('修改库房params===>', params);
        saveWarehouseRoom({
          warehouseId: treeContext?.selectedNode.value?.id as string,
          zoneId,
          ...params,
        }).then(async () => {
          await WarehouseRoomGridApi.query();
          await treeContext?.refreshTree?.();
        });
      },
    }).open();
  }
}

// 删除
function handleDel() {
  const selectedRow = WarehouseRoomGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }
  const params = {
    zoneId: selectedRow.zoneId,
  };
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await delWarehouseRoom(params);
        message.success('删除成功');
        await WarehouseRoomGridApi.query();
        await treeContext?.refreshTree?.();
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
  // console.warn('props.warehouseInfo', props.warehouseInfo);
  console.warn('treeContext', treeContext);
  WarehouseRoomGridApi.query();
});
</script>

<template>
  <div class="h-full">
    <WarehouseRoomFormModal />
    <WarehouseRoomGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddOrEdit('add')"
          data-testid="button_add_warehouseRoom"
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
          data-testid="button_edit_warehouseRoom"
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
          data-testid="button_delete_warehouseRoom"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
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
          :data-testid="`switch_isActive_${scope.rowIndex}_warehouseRoom`"
        />
      </template>
    </WarehouseRoomGrid>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>

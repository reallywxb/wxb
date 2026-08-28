<script setup lang="ts">
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

import {
  delWarehouseProductControl,
  saveWarehouseProductControl,
} from '../../api';
import { TREE_CONTEXT_KEY } from '../../index';
import warehouseProductControlFormCom from '../../modals/warehouseProductControlFormModal.vue';

const treeContext = inject(TREE_CONTEXT_KEY);
// 表格配置
const [WarehouseProductControlGrid, WarehouseProductControlGridApi] =
  useSpdGrid(
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
      id: 'warehouseCommodityGroupGrid',
      // api地址
      queryUrl: '/warehouseAction/queryWarehouseProductControl.do',
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
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'warehouseCode',
          title: '仓库编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'productControlLevelName',
          title: '商品组',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'settlementModeName',
          title: '结算边界',
          minWidth: '100',
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
      formSchema: [],
      tableSearchExtraParams: {
        warehouseId: treeContext?.selectedNode.value?.id,
      },
    },
  );

// 弹框配置
const [WarehouseProductControlFormModal, WarehouseProductControlFormModalApi] =
  useVbenModal({
    class: 'w-[800px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: warehouseProductControlFormCom,
    draggable: true,
  });

// 新增||修改
function handleAddOrEdit(optionType: 'add' | 'edit') {
  const text = treeContext?.selectedNode.value?.text || '';
  const title = optionType === 'add' ? '新增' : '修改';
  const selectedRow = WarehouseProductControlGridApi.grid.getRadioRecord();
  if (optionType === 'edit' && !selectedRow) {
    message.error('请选择一条记录！');
    return;
  }
  WarehouseProductControlFormModalApi.setData({
    title: `${title}仓库商品组${text}`,
    type: optionType,
    form: {
      productControlLevel: undefined,
      settlementMode:
        optionType === 'edit' ? selectedRow.settlementMode : undefined,
      isActive: optionType === 'edit' ? selectedRow.isActive : 'N',
    },
    submit: async (params: {
      isActive: 'N' | 'Y';
      productControlLevel: string;
      settlementMode: string;
    }) => {
      console.warn(`${title}商品组params===>`, params);
      const res = await saveWarehouseProductControl({
        warehouseId: treeContext?.selectedNode.value?.id as string,
        ...params,
        id: optionType === 'edit' ? selectedRow.id : undefined,
      });
      if (!res.success) {
        const errorMsg = res.detailMsg || res.msg || '操作失败';
        throw new Error(errorMsg);
      }
      // 成功后的操作
      WarehouseProductControlGridApi.query();
      // 注意：这里只刷新当前仓库下的子节点，而不是整个树
      treeContext?.refreshTree();
      // return res; // 返回成功结果
    },
  }).open();
}

// 删除
function handleDel() {
  const selectedRow = WarehouseProductControlGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await delWarehouseProductControl({
          productControlLevel: selectedRow.productControlLevel,
          warehouseId: treeContext?.selectedNode.value?.id as string,
        });
        message.success('删除成功');
        WarehouseProductControlGridApi.query();
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
  WarehouseProductControlGridApi.query();
});
</script>

<template>
  <div class="h-full">
    <WarehouseProductControlFormModal />
    <WarehouseProductControlGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddOrEdit('add')"
          data-testid="button_add_warehouseProductControl"
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
          data-testid="button_edit_warehouseProductControl"
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
          data-testid="button_delete_warehouseProductControl"
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
          :data-testid="`switch_isActive_${scope.rowIndex}_warehouseProductControl`"
        />
      </template>
    </WarehouseProductControlGrid>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>

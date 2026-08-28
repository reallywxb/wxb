<script setup lang="ts">
import { inject, onMounted } from 'vue';

import { AddActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import {
  delWarehouseProductCategory,
  saveWarehouseProductCategory,
} from '../../api';
import { TREE_CONTEXT_KEY } from '../../index';
import warehouseProductCategoryFormCom from '../../modals/warehouseProductcategoryFormModal.vue';

const treeContext = inject(TREE_CONTEXT_KEY);
// 表格配置
const [WarehouseProductCategoryGrid, WarehouseProductCategoryGridApi] =
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
      id: 'warehouseCommodityTypesGrid',
      // api地址
      queryUrl: '/warehouseAction/queryWarehouseProductCategory.do',
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
          field: 'productCategoryName',
          title: '商品类型',
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
const [
  WarehouseProductCategoryFormModal,
  WarehouseProductCategoryFormModalApi,
] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: warehouseProductCategoryFormCom,
  draggable: true,
});

// 新增
function handleAddOrEdit() {
  const text = treeContext?.selectedNode.value?.text || '';
  WarehouseProductCategoryFormModalApi.setData({
    title: `新增仓库商品类型${text}`,
    form: {
      productCategoryId: undefined,
      isActive: 'N',
    },
    submit: (params: { isActive: 'N' | 'Y'; productCategoryId: string }) => {
      console.warn('新增商品组params===>', params);
      saveWarehouseProductCategory({
        warehouseId: treeContext?.selectedNode.value?.id as string,
        ...params,
      }).then(() => {
        WarehouseProductCategoryGridApi.query();
        // treeContext?.refreshTree();
        // 注意：这里只刷新当前仓库下的子节点，而不是整个树
        treeContext?.refreshTree();
      });
    },
  }).open();
}

// 删除
function handleDel() {
  const selectedRow = WarehouseProductCategoryGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await delWarehouseProductCategory({
          productCategoryId: selectedRow.productCategoryId,
          warehouseId: treeContext?.selectedNode.value?.id as string,
        });
        message.success('删除成功');
        WarehouseProductCategoryGridApi.query();
        treeContext?.refreshTree();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

const handleActiveSwitchChange = async (row: any, checked: 'N' | 'Y') => {
  console.warn('handleActiveSwitchChange', row, checked);
  try {
    const params = {
      id: row.id,
      isActive: checked,
    };
    const res = await saveWarehouseProductCategory(params);
    if (res && res.success) {
      message.success('更新成功');
      WarehouseProductCategoryGridApi.query();
    }
  } catch (error) {
    console.error('修改活跃状态失败', error);
    message.error('更新失败');
  }
};

onMounted(() => {
  console.warn('treeContext', treeContext);
  WarehouseProductCategoryGridApi.query();
});
</script>

<template>
  <div class="h-full">
    <WarehouseProductCategoryFormModal />
    <WarehouseProductCategoryGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddOrEdit"
          data-testid="button_add_warehouseCommodityTypes"
        >
          新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDel"
          data-testid="button_delete_warehouseCommodityTypes"
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
          :data-testid="`switch_isActive_${scope.rowIndex}_warehouseCommodityTypes`"
        />
      </template>
    </WarehouseProductCategoryGrid>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>

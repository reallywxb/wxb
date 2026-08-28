<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}
const gridData = ref<any[]>([
  {
    id: '1',
    category: '1',
    color: '3',
    productName: 'fdsf',
    price: '12',
    releaseDate: '343',
  },
  {
    id: '2',
    category: '1',
    color: '3',
    productName: 'fdsf',
    price: '12',
    releaseDate: '343',
  },
  {
    id: '3',
    category: '1',
    color: '3',
    productName: 'fdsf',
    price: '12',
    releaseDate: '343',
  },
  {
    id: '4',
    category: '1',
    color: '3',
    productName: 'fdsf',
    price: '12',
    releaseDate: '343',
  },
]);
const gridOptions: VxeGridProps<RowType> = {
  data: gridData.value,
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { editRender: { name: 'input' }, field: 'category', title: 'Category' },
    { editRender: { name: 'input' }, field: 'color', title: 'Color' },
    {
      editRender: { name: 'input' },
      field: 'productName',
      title: 'Product Name',
    },
    { field: 'price', title: 'Price' },
    { field: 'releaseDate', formatter: 'formatDateTime', title: 'Date' },
    { slots: { default: 'action' }, title: '操作' },
  ],
  editConfig: {
    mode: 'row',
    trigger: 'click',
    showStatus: true,
  },
  keepSource: true,
  height: 'auto',
  pagerConfig: {},
  showOverflow: true,
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function hasEditStatus(row: RowType) {
  return gridApi.grid?.isEditByRow(row);
}

function editRowEvent(row: RowType) {
  gridApi.grid?.setEditRow(row);
}

async function saveRowEvent(row: RowType) {
  await gridApi.grid?.clearEdit();

  gridApi.setLoading(true);
  setTimeout(() => {
    gridApi.setLoading(false);
    message.success({
      content: `保存成功！category=${row.category}`,
    });
  }, 600);
}

const cancelRowEvent = (_row: RowType) => {
  gridApi.grid?.clearEdit();
};
const handleAddRow = async () => {
  const record = {
    id: Number.parseInt(`200${Math.random() * 10_000}`),
    category: String(Number.parseInt(`200${Math.random() * 10_000}`)),
    color: '3',
    productName: 'fdsf',
    price: '12',
    releaseDate: '343',
  };
  // 使用insertAt方法添加新行并自动进入编辑状态
  const { row: newRow } = await gridApi.grid.insertAt(record, -1);
  // 直接将新添加的行设置为编辑状态
  gridApi.grid.setEditRow(newRow);
};
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #toolbar-actions>
        <Button type="primary" @click="handleAddRow">增行</Button>
      </template>
      <template #action="{ row }">
        <template v-if="hasEditStatus(row)">
          <Button type="link" @click="saveRowEvent(row)">保存</Button>
          <Button type="link" @click="cancelRowEvent(row)">取消</Button>
        </template>
        <template v-else>
          <Button type="link" @click="editRowEvent(row)">编辑</Button>
        </template>
      </template>
    </Grid>
  </Page>
</template>

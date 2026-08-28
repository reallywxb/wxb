<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Checkbox, Input, message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import { addAsnTracCode, deleteAsnTracCode } from '../api';

const modalOuterData = ref();
const isViewNow = computed(() => {
  return modalOuterData.value?.type !== 'view';
});
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: isViewNow,
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  async onConfirm() {
    const currentData =
      ChcGridApi.grid.getTableData().tableData.map((item) => {
        return item.tracCodes;
      }) || [];
    console.warn('currentData:', currentData);
    const params = {
      tracCodes: JSON.stringify(currentData),
      asnLineId: JSON.stringify(modalOuterData.value.asnLineId),
    };
    console.warn('params:', params);
    await addAsnTracCode(params)
      .then((res) => {
        if (res && res.success) {
          console.warn('dataCommitdataCommitdataCommit', res);
          ChcGridApi.formApi.getValues().then((resData: any) => {
            console.warn('getValues', resData);
          });
          message.success('提交成功');
        } else {
          message.error(res.msg || '失败');
        }
      })
      .catch((error) => {
        console.error('失败', error);
      });
    modalOuterData.value.handleCodeChoose({
      codeData: currentData,
    });
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      checked.value = false;
      const modalData = modalApi.getData<Record<string, any>>();
      modalOuterData.value = modalData;
      console.warn('modalData', modalData);
      // searchForm.value.warehouseId = modalData.warehouseId;
      // searchForm.value.replenishSource = modalData.replenishSource;
      searchForm.value.asnLineId = modalData.asnLineId;
      // await nextTick();
      if (modalOuterData.value.type === 'view' || modalData.asnLineId) {
        setTimeout(() => {
          ChcGridApi.query();
        }, 0);
      }
    }
  },
});
const searchForm = ref({
  tracCodes: undefined,
  manufacturer: undefined,
  warehouseId: undefined,
  asnLineId: undefined,
  replenishSource: undefined,
});
const checked = ref(false);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      // proxyConfig: {
      // autoLoad: false,
      // },
      checkboxConfig: {
        highlight: true,
        // checkMethod: (scope: any) => {
        //   return !modalOuterData.value.blackList.includes(
        //     scope.row.productCode,
        //   );
        // },
      },
    },
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      // { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'tracCodes',
        minWidth: 135,
        sortable: true,
        title: '追溯码',
      },
      {
        field: 'productCode',
        minWidth: 110,
        sortable: true,
        title: '药品编码',
      },
      {
        field: 'productName',
        minWidth: 135,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'lot',
        minWidth: 135,
        sortable: true,
        title: '批号',
      },
      {
        field: 'guaranteeDate',
        minWidth: 135,
        sortable: true,
        title: '效期',
      },
    ],
    dataTableId: '/asnAction/queryTracCode.do',
    id: 'manualInfoCode',
    tableSearchExtraParams: searchForm.value,
  },
);

function handleSearch() {
  console.warn('searchForm', searchForm.value.tracCodes, ChcGridApi);
  if (!searchForm.value.tracCodes) {
    message.warn('请输入追溯码');
    return;
  }
  // 获取当前表格数据
  const currentData = ChcGridApi.grid.getTableData().tableData || [];
  if (checked.value) {
    // 反选模式：删除对应追溯码的行
    const rowToDelete = currentData.find(
      (row) => row.tracCodes === searchForm.value.tracCodes,
    );
    if (!rowToDelete) {
      message.warn('未找到对应的追溯码记录');
      return;
    }
    // 如果行有asnTracCodeId，则调用接口删除
    if (rowToDelete.asnTracCodeId) {
      const params = {
        asnTracCodeId: rowToDelete.asnTracCodeId,
        // asnLineId: modalOuterData.value.asnLineId
      };

      deleteAsnTracCode(params)
        .then((res) => {
          if (res && res.success) {
            // 删除成功后，从表格中移除该行
            const filteredData = currentData.filter(
              (row) => row.tracCodes !== searchForm.value.tracCodes,
            );
            ChcGridApi.grid.reloadData(filteredData);
            // 清空输入框
            searchForm.value.tracCodes = undefined;
            message.success('追溯码删除成功');
            ChcGridApi.query();
          } else {
            message.error(res.msg || '删除失败');
          }
        })
        .catch((error) => {
          console.error('删除失败', error);
          message.error('删除失败');
        });
    } else {
      // 没有asnTracCodeId，使用前端过滤方式删除
      const filteredData = currentData.filter(
        (row) => row.tracCodes !== searchForm.value.tracCodes,
      );
      // 重新加载表格数据
      ChcGridApi.grid.reloadData(filteredData);
      // 清空输入框
      searchForm.value.tracCodes = undefined;
      message.success('追溯码删除成功');
    }
  } else {
    // 添加新行检查是否已存在相同追溯码
    const existingRow = currentData.find(
      (row) => row.tracCodes === searchForm.value.tracCodes,
    );
    if (existingRow) {
      message.warn('该追溯码已存在');
      return;
    }
    // 创建新的行数据，使用输入的追溯码和modalOuterData中的对应字段
    const newRow = {
      tracCodes: searchForm.value.tracCodes, // 追溯码字段
      productCode: modalOuterData.value?.productCode || '', // 药品编码
      productName: modalOuterData.value?.productName || '', // 药品名称
      lot: modalOuterData.value?.lot || '', // 批号
      guaranteeDate: modalOuterData.value?.guaranteeDate || '', // 效期
    };
    // 添加新行到表格数据中
    const newData = [newRow, ...currentData];
    // 重新加载表格数据&&清空输入框
    ChcGridApi.grid.reloadData(newData);
    searchForm.value.tracCodes = undefined;
    // message.success('追溯码添加成功');
    // ChcGridApi.query();
  }
}
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="追溯码登记"
    title-tooltip="输入追溯码回车后添加到列表"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <div v-if="modalOuterData.type !== 'view'">
            <Input
              v-model:value="searchForm.tracCodes"
              placeholder="请输入追溯码"
              class="mr-[6px] w-[280px]"
              allow-clear
              @keyup.enter="handleSearch"
            />
            <Checkbox v-model:checked="checked">反选</Checkbox>
          </div>
          <!-- <Button type="primary" @click="handleSearch">查询</Button> -->
        </template>
      </ChcGrid>
    </div>
  </Modal>
</template>
<style scoped>
/* ::v-deep(.vxe-table--render-default .vxe-cell--checkbox.is--disabled) {
  color: #929292;
} */

::v-deep(
  .vxe-table--render-default
    .vxe-cell--checkbox.is--disabled
    .vxe-checkbox--icon
) {
  color: #ccc;
}
</style>

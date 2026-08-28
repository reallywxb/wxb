<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Modal as AntModal, Checkbox, Input, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

const modalData = ref<Record<string, any>>({});
const [Modal, ModalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
  onCancel() {
    console.warn('cancel');
    ModalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onBeforeClose() {
    if (!ModalApi.store.state.isOpen) {
      // 弹框未打开，直接放行
      return true;
    }
    const currentData =
      ChcGridApi.grid.getTableData().fullData.map((item: any) => {
        return item.packageNo;
      }) || [];
    if (currentData.length <= 0) {
      return true;
    }
    return new Promise<boolean>((resolve) => {
      AntModal.confirm({
        title: '提示',
        content: '已扫包装码将丢弃，确认取消吗？',
        onOk: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  },
  async onConfirm() {
    const currentData =
      ChcGridApi.grid.getTableData().fullData.map((item: any) => {
        return item.packageNo;
      }) || [];
    console.warn('currentData:', currentData);
    if (currentData.length <= 0) {
      message.warning('包装号不可为空！');
      return;
    }
    const params = {
      packageNo: JSON.stringify(currentData),
      inventoryPlanId: modalData.value.inventoryPlanId,
    };

    requestFormClient
      .post('/inventoryPlanAction/inventoryPackage.do', params)
      .then((res) => {
        if (res.result) {
          message.success('包装盘点成功！');
          ChcGridApi.grid.reloadData([]);
          ModalApi.close();
          modalData.value?.callback();
        } else {
          console.error(res);
          message.error('包装盘点失败');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      checked.value = false;
      const modalData = ModalApi.getData<Record<string, any>>();
      modalData.value = modalData;
      console.warn('modalData', modalData);
      searchForm.value.packageNo = undefined;
      scannedCount.value = 0;
    }
  },
});
const searchForm = ref({
  packageNo: undefined,
});
const checked = ref(false);
const scannedCount = ref(0);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      stripe: false,
      pagerConfig: {
        enabled: false,
      },
      checkboxConfig: {
        highlight: true,
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'packageNo',
        title: '包装号',
        sortable: false,
      },
    ],
    id: 'countInput_scan',
  },
);

function handleEnter() {
  console.warn('searchForm', searchForm.value);
  if (!searchForm.value.packageNo) {
    message.warn('请输入包装号');
    return;
  }
  // 获取当前表格数据
  const currentData = ChcGridApi.grid.getTableData().tableData || [];
  if (checked.value) {
    // 反选模式
    const rowToDelete = currentData.find(
      (row: any) => row.packageNo === searchForm.value.packageNo,
    );
    if (!rowToDelete) {
      message.warn('未找到对应的包装号');
      return;
    }
    const filteredData = currentData.filter(
      (row: any) => row.packageNo !== searchForm.value.packageNo,
    );
    // 重新加载表格数据
    ChcGridApi.grid.reloadData(filteredData);
    // 更新扫包数量
    scannedCount.value = filteredData.length;
    // 清空输入框
    searchForm.value.packageNo = undefined;
    message.success('删除成功');
  } else {
    // 添加新行检查是否已存在相同追溯码
    const existingRow = currentData.find(
      (row: any) => row.packageNo === searchForm.value.packageNo,
    );
    if (existingRow) {
      message.warn('该包装号已存在');
      return;
    }

    // 添加新行到表格数据中（插入到第一行）
    const updatedData = [
      ...currentData,
      {
        packageNo: searchForm.value.packageNo,
      },
    ];
    // 重新加载表格数据
    ChcGridApi.grid.reloadData(updatedData);
    // 更新扫包数量
    scannedCount.value = updatedData.length;
    searchForm.value.packageNo = undefined;
  }
}
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="包装盘点"
    title-tooltip="输入包装号回车后添加到列表"
    confirm-text="盘点"
    cancel-text="取消"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <div>
            <Input
              v-model:value="searchForm.packageNo"
              placeholder="请输入包装号"
              class="mr-[6px] w-[280px]"
              allow-clear
              @keyup.enter="handleEnter"
              data-testid="input_packageNo_scanModal"
            />
            <Checkbox
              v-model:checked="checked"
              data-testid="Checkbox_check_scanModal"
            >
              反选
            </Checkbox>

            <span
              style="
                padding-left: 20px;
                font-size: 14px;
                color: rgb(50 54 57 / 82%);
              "
            >
              已扫包数：{{ scannedCount }}
            </span>
          </div>
        </template>
      </ChcGrid>
    </div>
  </Modal>
</template>
<style scoped>
::v-deep(
  .vxe-table--render-default
    .vxe-cell--checkbox.is--disabled
    .vxe-checkbox--icon
) {
  color: #ccc;
}
</style>

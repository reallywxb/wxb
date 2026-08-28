<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

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
    console.warn('onBeforeClose currentData:', currentData);
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
    const tempModalData = ModalApi.getData<Record<string, any>>();
    if (tempModalData?.row?.pickListId < 1) {
      message.warning('拣货单号不可为空！');
      return;
    }
    const params = {
      packageNo: JSON.stringify(currentData),
      pickListId: tempModalData?.row?.pickListId,
    };

    requestFormClient
      .post('/pickListAction/pickPackage.do', params)
      .then(async (res) => {
        if (res.success) {
          message.success('拣货确认成功');
          await ChcGridApi.grid.reloadData([]);
          ModalApi.close();
          tempModalData?.callback();
        } else {
          console.error(res);
          message.error(`拣货确认失败：${res.msg}`);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  },
});
const searchForm = ref<{ packageNo: string | undefined }>({
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
        width: 200,
        sortable: false,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '150',
        sortable: true,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: '150',
        sortable: true,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'qty',
        title: '数量',
        width: '70',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '70',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        width: '100',
        sortable: false,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '90',
        sortable: false,
      },
      {
        field: 'locatorName',
        title: '货位',
        width: '90',
        sortable: false,
      },
    ],
    id: 'picklistPick_scan',
  },
);

async function handleEnter() {
  console.warn('searchForm', searchForm.value);
  if (!searchForm.value.packageNo) {
    message.warn('请输入包装号');
    return;
  }
  // 获取当前表格数据
  const currentData: any[] = ChcGridApi.grid.getTableData().fullData || [];
  if (checked.value) {
    // 反选模式
    const rowToDelete = currentData.find(
      (row: any) => row.packageNo === searchForm.value.packageNo,
    );
    if (isEmpty(rowToDelete)) {
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
    const existingRow = (currentData as any[]).find(
      (row: any) => row.packageNo === searchForm.value.packageNo,
    );
    if (!isEmpty(existingRow)) {
      message.warn(`包装号重复：${searchForm.value.packageNo}`);
      searchForm.value.packageNo = '';
      return;
    }

    try {
      const res = await requestFormClient.post('/packageAction/query.do', {
        packageNo: searchForm.value.packageNo,
      });
      console.warn('res:', res);
      const packageNo = searchForm.value.packageNo;
      const tempModalData = ModalApi.getData<Record<string, any>>();
      const warehouseId = tempModalData?.row?.warehouseId;
      if (res.success) {
        if (res.rows && res.rows?.length > 0) {
          const row: Record<string, any> = res.rows[0];
          console.warn('tempModalData:', tempModalData);
          console.warn('modalData:', modalData.value);
          console.warn('warehouseId:', modalData.value?.row?.warehouseId);
          console.warn('warehouseId:', Number(warehouseId));
          console.warn('row.warehouseId:', Number(row?.warehouseId));
          if (row?.packageStatus !== 'S') {
            message.error(`扫码失败，包装不在库：${packageNo}`);
          } else if (warehouseId !== row?.warehouseId) {
            message.error(`扫码失败，包装不在当前仓库：${packageNo}`);
          } else if (isEmpty(row)) {
            searchForm.value.packageNo = '';
          } else {
            const arr = [row, ...currentData];
            scannedCount.value = arr.length;
            ChcGridApi.grid.reloadData(arr);
            searchForm.value.packageNo = '';
          }
        } else {
          message.error(`扫码失败，包装未找到：${packageNo}`);
        }
      } else {
        message.error(`扫码失败：${res.msg}`);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
</script>
<template>
  <Modal
    class="h-[600px] w-[1000px]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="扫码拣货"
    confirm-text="确认拣货"
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

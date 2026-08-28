<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Checkbox, Input, message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import { addFormOptions } from '../addFormOptions';
import FormModal from '../FormModal.vue';
import { checkPackage, openPackage, queryCode } from './api';

const emit = defineEmits(['close']);
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
        return item.packageNo;
      }) || [];
    if (currentData.length === 0) {
      message.warn('包装号不可为空！');
      return;
    }
    console.warn('currentData:', currentData);
    const params = {
      packageNo: JSON.stringify(currentData),
      asnId: JSON.stringify(modalOuterData.value.asnId),
    };
    console.warn('params:', params);
    await checkPackage(params)
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
    emit('close');
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

      searchForm.value.asnLineId = modalData.asnLineId;
      // await nextTick();
      scannedCount.value = 0;
    }
  },
});
const searchForm = ref({
  packageNo: undefined,
  manufacturer: undefined,
  warehouseId: undefined,
  asnLineId: undefined,
  replenishSource: undefined,
});
const checked = ref(false);
const scannedCount = ref(0);
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      // proxyConfig: {
      // autoLoad: false,
      // },
      pagerConfig: {
        enabled: false,
      },
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
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'packageNo',
        minWidth: 180,
        sortable: true,
        title: '包装号',
        // cellRender: {
        //   name: 'CellLink',
        //   props: {
        //     text: '12321321',
        //     onClick: (row: any) => {
        //       console.warn('row', row);
        //     },
        //   },
        // },
      },
      {
        field: 'productName',
        minWidth: 135,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 135,
        sortable: true,
        title: '规格',
      },
      {
        field: 'modelNo',
        minWidth: 135,
        sortable: true,
        title: '型号',
        visible: false,
      },
      {
        field: 'manufacturer',
        minWidth: 135,
        sortable: true,
        title: '生产厂家',
      },
      {
        field: 'qty',
        minWidth: 70,
        sortable: true,
        align: 'right',
        title: '数量',
      },
      {
        field: 'uomName',
        minWidth: 70,
        sortable: true,
        title: '单位',
      },
      {
        field: 'lot',
        minWidth: 70,
        sortable: true,
        title: '批号',
      },
      {
        field: 'guaranteeDate',
        minWidth: 70,
        sortable: true,
        title: '效期',
      },
      {
        field: 'productionDate',
        minWidth: 90,
        sortable: true,
        title: '生产日期',
      },
    ],
    dataTableId: '/packageAction/query.do',
    id: 'checkCodeCheck',
    tableSearchExtraParams: searchForm.value,
  },
);

function handleSearch() {
  console.warn('searchForm', searchForm.value.packageNo, ChcGridApi);
  if (!searchForm.value.packageNo) {
    message.warn('请输入包装号');
    return;
  }
  // 获取当前表格数据
  const currentData = ChcGridApi.grid.getTableData().tableData || [];
  if (checked.value) {
    // 反选模式：删除对应追溯码的行
    const rowToDelete = currentData.find(
      (row) => row.packageNo === searchForm.value.packageNo,
    );
    if (!rowToDelete) {
      message.warn('未找到对应的包装号');
      return;
    }
    // 没有asnTracCodeId，使用前端过滤方式删除
    const filteredData = currentData.filter(
      (row) => row.packageNo !== searchForm.value.packageNo,
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
      (row) => row.packageNo === searchForm.value.packageNo,
    );
    if (existingRow) {
      message.warn('该包装号已存在');
      return;
    }
    const params = {
      packageNo: searchForm.value.packageNo,
    };
    queryCode(params)
      .then((res) => {
        if (res && res.success && res.rows && res.rows[0]) {
          // console.log('queryCode', res);
          const newRow = res.rows[0];
          // 在接口返回后再次判断重复
          const existingRowAfterQuery = currentData.find(
            (row) => row.packageNo === newRow.packageNo,
          );
          if (existingRowAfterQuery) {
            message.warn('该包装号已存在');
            return;
          }
          // 添加新行到表格数据中（插入到第一行）
          const updatedData = [newRow, ...currentData];
          // 重新加载表格数据
          ChcGridApi.grid.reloadData(updatedData);
          // 更新扫包数量
          scannedCount.value = updatedData.length;
          searchForm.value.packageNo = undefined;
        } else {
          message.warn('未找到对应的包装号数据');
        }
      })
      .catch((error) => {
        console.error('失败', error);
        message.error('查询失败');
      });
  }
}
const openCheck = () => {
  console.warn('openCheck');
  const currentData = ChcGridApi.grid.getTableData().tableData || [];
  if (currentData.length === 0) {
    message.warn('包装号不可为空,请先添加包装号!');
    return;
  }
  const packageNos = currentData.map((row) => row.packageNo);
  const params = {
    asnId: modalOuterData.value.asnId,
    packageNo: JSON.stringify(packageNos),
  };
  openPackage(params)
    .then((res) => {
      if (res && res.success) {
        console.warn('queryCode', res);
        message.success('开箱验视成功');
      }
    })
    .catch((error) => {
      console.error('失败', error);
      message.error('查询失败');
    });
};
const rejectPackage = () => {
  console.warn('rejectPackage');
  const currentData = ChcGridApi.grid.getTableData().tableData || [];

  const packageNos = currentData.map((row) => row.packageNo);
  if (currentData.length === 0) {
    message.warn('包装号不可为空！');
    return;
  }
  modalRejCodeApi
    .setData({
      dataTableId: '/asnAction/rejectPackage.do',
      formData: {
        asnId: modalOuterData.value.asnId,
        packageNo: JSON.stringify(packageNos),
      },
      openType: 'close',
      openTypePackage: 'package',
    })
    .open();
};
const [OrgFormModal, modalRejCodeApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: FormModal,
});
async function refreshTable() {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    console.warn('getValues', resData);
    ChcGridApi.query({ ...resData });
  });
}
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="扫码验收"
    title-tooltip="输入包装号回车后添加到列表"
  >
    <div class="h-full">
      <OrgFormModal
        :after-submit="refreshTable"
        :add-form-options="addFormOptions"
      />
      <ChcGrid>
        <template #toolbar-actions>
          <div v-if="modalOuterData.type !== 'view'">
            <Input
              v-model:value="searchForm.packageNo"
              placeholder="请输入包装号"
              class="mr-[6px] w-[280px]"
              allow-clear
              @keyup.enter="handleSearch"
              data-testid="input_packageNo_codeCheckModal"
            />
            <Checkbox
              v-model:checked="checked"
              data-testid="Checkbox_check_codeCheckModal"
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
          <!-- <Button type="primary" @click="handleSearch">查询</Button> -->
        </template>
        <template #toolbar-tools>
          <Button
            type="primary"
            style="margin-right: 10px"
            @click="openCheck"
            data-testid="button_open_check_codeCheckModal"
          >
            开箱验视
          </Button>
          <Button
            type="primary"
            @click="rejectPackage"
            danger
            data-testid="button_reject_package_codeCheckModal"
          >
            拒收
          </Button>
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

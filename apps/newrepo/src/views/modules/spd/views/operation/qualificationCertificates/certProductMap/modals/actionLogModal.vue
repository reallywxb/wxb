<script lang="ts" setup>
import type { ProductSelectItem } from './api';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, Input, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  // showConfirmButton: false,
  cancelText: '关闭',
  confirmText: '提交',
  onCancel() {
    modalApi.close();
  },
  onConfirm() {
    const selectedRows = ChcGridApi.grid.getCheckboxRecords();
    console.warn('selectedRows===>', selectedRows);
    if (selectedRows.length === 0) {
      message.warning('请至少选择一个商品！');
      return;
    }
    if (!searchForm.value.ctProductId) {
      message.warning('缺少证照！');
      return;
    }
    const productIds: number[] = [];
    selectedRows.forEach((item: ProductSelectItem) => {
      productIds.push(item.productId);
    });
    const params = {
      ctProductId: searchForm.value.ctProductId,
      productIds: JSON.stringify(productIds),
    };
    requestFormClient.post('/productMapAction/save.do', params).then((res) => {
      if (res && res.success) {
        message.success('操作成功！');
        // modalApi.close();
        // 刷新表格数据
        if (modalApi.getData<Record<string, any>>().callBack) {
          modalApi.getData<Record<string, any>>().callBack();
        }
      } else {
        message.error(res.msg || '操作失败！');
      }
    });
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData<Record<string, any>>();
      console.warn('modalData====>', data);
      searchForm.value.name = '';
      searchForm.value.markCode = '';
      searchForm.value.ctProductId = data.ctProductId;
      setTimeout(() => {
        ChcGridApi.query();
      }, 200);
      console.warn('onOpenChange', ChcGridApi, data);
    }
  },
});
const searchForm = ref({
  ctProductId: undefined,
  name: '',
  markCode: '',
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        // autoLoad: false,
      },
      // checkboxConfig: {
      //   checkMethod: (scope: any) => {
      //     return !modalOuterData.value.blackList.includes(
      //       scope.row.productCode,
      //     );
      //   },
      // },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'productcode',
        title: '药品编码',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 100,
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        sortable: true,
        minWidth: 120,
      },
      { field: 'uomName', title: '单位', sortable: true, minWidth: 100 },
      {
        field: 'markCode',
        minWidth: 100,
        sortable: false,
        title: '中标编码',
      },
    ],
    dataTableId: '/productMapAction/queryProduct.do',
    id: 'certProductMapActionLog',
    tableSearchExtraParams: searchForm.value,
  },
);

function handleSearch() {
  ChcGridApi.query({ ...searchForm.value });
}
</script>
<template>
  <Modal
    class="h-[800px] w-[80%]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="商品选择"
    title-tooltip="商品选择列表"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <Input
            v-model:value="searchForm.name"
            placeholder="编码、名称、搜索码"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_searchName_actionLogModal"
          />
          <Input
            placeholder="中标编码"
            v-model:value="searchForm.markCode"
            class="mr-[6px] w-[280px]"
            allow-clear
            @keyup.enter="handleSearch"
            data-testid="input_markCode_actionLogModal"
          />
          <Button
            type="primary"
            @click="handleSearch"
            data-testid="button_query_actionLogModal"
          >
            查询
          </Button>
        </template>
      </ChcGrid>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
} from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import { handlePriceToFixedTwo } from '#/utils/util';

import { saveWarehouseProductBatchAdd } from '../api';
// const emit = defineEmits(['close', 'confirm']);

const modalData = ref();
const state = reactive({
  productName: undefined,
  markCode: undefined,
  isProductActive: 'Y',
});
const formRef = ref();
const [ModalFirst, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: true,
  showCancelButton: true,
  cancelText: '取消',
  confirmText: '提交',
  onCancel() {
    modalApi.close();
  },
  onClosed() {},
  onConfirm() {
    const selectedRows = ChcGridApi.grid.getCheckboxRecords();
    console.warn(selectedRows);
    if (selectedRows.length === 0) {
      message.error('请至少选择一个要修改的商品！');
      return;
    }
    // 校验所选商品的原采购价是否统一、原零售价是否统一
    const productIds: (number | string)[] = [];
    selectedRows.forEach((item: any) => {
      productIds.push(item.productId);
    });
    Modal.confirm({
      title: '提示',
      content: '批量新增库备信息？',
      onOk: () => {
        try {
          const params = {
            page: 'warehouseProductBatchAdd',
            warehouseId: modalData.value?.warehouseId,
            replenishPolicyId: modalData.value?.replenishPolicyId,
            replenishSource: modalData.value?.replenishSource,
            productIds: JSON.stringify(productIds),
          };
          saveWarehouseProductBatchAdd(params)
            .then((res) => {
              if (res && res.success) {
                message.success('操作成功');
                modalApi.close();
                modalData.value.callback();
                // emit('confirm', selectRow.value);
              } else {
                message.error(res.msg || '失败');
              }
            })
            .catch((error) => {
              console.error('失败', error);
            });
        } catch {
          message.error('操作失败');
        }
      },
    });
  },
  onOpened() {},

  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn(modalData.value);
      // 初始化表单数据
      Object.assign(state, {
        productName: undefined,
        markCode: undefined,
        isProductActive: 'Y',
      });
      // formRef.value.setFieldsValue(state);
      // await nextTick();
    }
  },
});
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    showSearchForm: false,
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { type: 'checkbox', title: '', width: 50, align: 'center' },
      {
        type: 'radio',
        minWidth: 120,
        fixed: 'left',
        visible: false,
      },
      { field: 'productName', title: '药品名称', width: '220', sortable: true },
      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productSpec', title: '规格', width: '120', sortable: true },
      { field: 'manufacturer', title: '厂家', width: '120', sortable: true },
      { field: 'uomName', title: '单位', width: '100', sortable: true },
      { field: 'markCode', title: '中标编码', width: '110', sortable: true },
      {
        field: 'priceList',
        title: '零售价',
        width: '90',
        sortable: true,
        align: 'right',
        // formatter: ({ cellValue }: { cellValue: number }) => {
        //   return cellValue ? cellValue.toFixed(2) : '0.00';
        // },
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
      },
      {
        field: 'pricePO',
        title: '采购价',
        width: '90',
        sortable: true,
        align: 'right',
        // formatter: ({ cellValue }: { cellValue: number }) => {
        //   return cellValue ? cellValue.toFixed(2) : '0.00';
        // },
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
      },
    ],
    id: 'batchAddFormTwoGrid',
    dataTableId: '/warehouseAction/queryWarehouseProduct.do',
    tableSearchExtraParams: {
      isWarehouseProduct: 'N',
    },
    gridEvents: {
      // radioChange: ({ row }: { row: any }) => {
      // selectRow.value = row?.productId ? row : {};
      // },
    },
  },
);

// 查询
const handleSubmit = () => {
  console.warn('handleSubmit');
  if (!state.productName && !state.markCode) {
    message.error('商品和中标编码不可同时为空！');
    return;
  }
  ChcGridApi.query({
    productName: state.productName,
    markCode: state.markCode,
    isProductActive: state.isProductActive,
    warehouseId: modalData.value.warehouseId,
  });
};
</script>
<template>
  <ModalFirst
    class="h-[800px] w-[800px]"
    content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
    title="批量新增"
  >
    <div class="h-full">
      <ChcGrid>
        <template #toolbar-actions>
          <Form
            style="gap: 0.5rem; width: 100%"
            ref="formRef"
            :model="state"
            @submit="handleSubmit"
            name="query_form"
            autocomplete="off"
            layout="inline"
            :label-col="{ style: { width: '70px' } }"
          >
            <FormItem label="商品" name="productName">
              <Input
                v-model:value="state.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/搜索码/名称"
                allow-clear
                data-testid="input_productName_batchAddFormTwoModal"
              />
            </FormItem>
            <FormItem label="中标编码" name="markCode">
              <Input
                v-model:value="state.markCode"
                class="mr-[0.5rem] w-[240px]"
                placeholder="中标编码"
                allow-clear
                data-testid="input_markCode_batchAddFormTwoModal"
              />
            </FormItem>
            <FormItem
              label="是否启用"
              name="isProductActive"
              class="custom-width"
            >
              <Select
                v-model:value="state.isProductActive"
                allow-clear
                placeholder="请选择"
                size="middle"
                class="mr-[0.5rem] w-full"
                :options="[
                  { value: '', name: '' },
                  { value: 'Y', name: '是' },
                  { value: 'N', name: '否' },
                ]"
                :field-names="{ label: 'name', value: 'value' }"
                data-testid="select_isProductActive_batchAddFormTwoModal"
              />
            </FormItem>
            <FormItem>
              <Button
                type="primary"
                html-type="submit"
                class="mr-[0.5rem]"
                data-testid="button_query_batchAddFormTwoModal"
              >
                查询
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </FormItem>
          </Form>
        </template>
      </ChcGrid>
    </div>
  </ModalFirst>
</template>
<style scoped lang="less">
.custom-width {
  :deep(.ant-form-item-control) {
    width: 240px;
  }
}
::v-deep(
  .vxe-table--render-default
    .vxe-cell--checkbox.is--disabled
    .vxe-checkbox--icon
) {
  color: #ccc;
}
</style>

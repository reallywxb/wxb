<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
const modalData = ref<Record<string, any>>({});
const modalTitle = ref('商品列表');
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
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
    id: 'inventoryCategory_ProductList_son',
    // api地址
    queryUrl: () => {
      return `/warehouseAction/queryWarehouseProduct.do?warehouseId=${
        modalData.value?.row?.warehouseId
      }`;
    },
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {
            placeholder: '请输入商品',
          };
        },
      },
    ],
    gridColumns: [
      {
        type: 'checkbox',
        title: '多选',
        width: 50,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      { field: 'productCode', title: '药品编码', width: 120 },
      { field: 'productName', title: '药品名称', width: 220 },
      { field: 'productSpec', title: '规格', width: 150 },
      { field: 'modelNo', title: '型号', width: 150, visible: false },
      { field: 'manufacturer', title: '厂家', width: 150 },
      { field: 'uomName', title: '单位', width: 70 },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params: any) => {
      params.validate = `and not exists(select 1 from m_inve_stra_prod_list p where p.product_id = r.m_product_id and p.m_inventory_strategy_id =${
        modalData.value?.row?.inventoryStrategyId
      } ) `;
      return params;
    },
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const isSubmiting = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: true,
  cancelText: '取消',
  confirmText: '确认',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      setTimeout(() => {
        chcGridApi.setGridOptions({
          queryUrl: `/warehouseAction/queryWarehouseProduct.do?warehouseId=${
            modalData.value?.row?.warehouseId
          }`,
        });
        chcGridApi.query();
      }, 200);
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    if (isSubmiting.value) {
      message.warning('正在提交！');
      return false;
    }
    isSubmiting.value = true;
    const inventoryStrategyId = modalData.value?.row?.inventoryStrategyId;
    if (!inventoryStrategyId) {
      message.warning('缺少策略编码');
      return;
    }

    const checkedRows = chcGridApi.grid.getCheckboxRecords(true);
    const unProxyRows: any[] = toRaw(checkedRows);

    if (unProxyRows.length <= 0) {
      message.warning('请选择商品');
      return;
    }
    const params: Record<string, any> = {
      productIds: unProxyRows.map((item) => item.productId),
      inventoryStrategyId,
    };

    console.warn('onConfirm params', params);
    try {
      const res = await requestFormClient.post(
        '/inventoryStrategyAction/createInveStraProdList.do',
        params,
        {
          transformRequest: [
            (data) => {
              const str = [];
              for (const [key, value] of Object.entries(data)) {
                if (Array.isArray(value)) {
                  value.forEach((item) => {
                    str.push(`${key}=${item}`);
                  });
                } else {
                  str.push(`${key}=${value}`);
                }
              }
              return str.join('&');
            },
          ],
        },
      );
      if (res.success) {
        message.success('创建成功');
        modalApi.close();
        modalData.value?.callback();
      } else {
        message.error(`创建失败：${res.msg}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      isSubmiting.value = false;
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[600px] w-[1000px]">
    <ChcGrid />
  </ModalFirst>
</template>

<style scoped lang="less">
::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>

<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const emit = defineEmits(['confirm']);

const productData = ref<any>({});
const [ProductModal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      productData.value = modalApi.getData<Record<string, any>>();

      setTimeout(async () => {
        ChcGridApi.grid.remove();
        // tableData.value = []
        tableData.value.splice(0);

        ChcGridApi.formApi.setValues(productData.value);
        if (productData.value.serNos?.length) {
          const res = await ChcGridApi.grid.createRow(productData.value.serNos);
          res.forEach((item: any) => {
            tableData.value.push(item);
          });
        }
      }, 100);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});

const tableData = ref<any>([]);

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,

      wrapperClass: 'grid-cols-3',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      // stripe: true,
      data: tableData.value,
      pagerConfig: {
        enabled: false,
      },
      proxyConfig: {
        // autoLoad: true,
      },
      cellStyle(scope: any) {
        if (scope.row.storageQty < scope.row.qty) {
          return {
            color: 'red',
          };
        }
      },
    }),
  },
  {
    id: 'parentTable',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      {
        field: 'serNo',
        title: '厂家码',
        minWidth: '100',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 80,
      },
    ],
    formSchema: [
      {
        component: 'InputNumber',
        fieldName: 'serNo',
        label: '厂家码',
        componentProps: () => {
          return {
            placeholder: '  ',
            onPressEnter: () => {
              ChcGridApi.formApi.getValues().then((res: any) => {
                if (res.serNo) {
                  const num = tableData.value.length + 1;
                  if (num > productData.value.qty) {
                    message.warn('厂家码数大于商品数');
                    ChcGridApi.formApi?.setFieldValue('serNo', undefined);
                    return;
                  }
                  const obj = { serNo: res.serNo };
                  ChcGridApi.formApi?.setFieldValue('serNo', undefined);
                  ChcGridApi.grid.createRow(obj).then((row: any) => {
                    tableData.value.push(row);
                  });
                }
              });
            },
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        formItemClass: 'input-nostyle ',
        componentProps: () => {
          return {
            placeholder: '  ',
          };
        },
      },
    ],
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
  },
);

function onSubmit() {
  emit('confirm', tableData.value);
  modalApi.close();
}

const handledelete = (scope: any) => {
  ChcGridApi.grid.romive(scope.row);
};
</script>
<template>
  <ProductModal class="h-[500px] w-[900px]" title="厂家码" title-tooltip="">
    <Page content-class="p-[0.5rem]" auto-content-height :height-offset="300">
      <ChcGrid>
        <template #action="scope">
          <Button
            danger
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handledelete(scope)"
            :data-testid="`button_delete_${scope.rowIndex}_sernoModal`"
          >
            删除
          </Button>
        </template>
      </ChcGrid>
    </Page>
    <template #prepend-footer>
      <Button type="primary" @click="onSubmit">提交</Button>
    </template>
  </ProductModal>
</template>

<style lang="less" scoped>
::v-deep(.input-nostyle .ant-input) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
}

::v-deep(.input-nostyle .ant-input:focus) {
  border: none !important;
  background-color: transparent !important;
  cursor: default;
  outline: none !important;
  box-shadow: none !important;
}
</style>

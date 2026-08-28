<script lang="ts" setup>
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';

import { ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  SearchActionIcon,
  SvgCloseIcon,
  SvgDeleteIcon,
  SvgSaveIcon,
} from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, Input, InputNumber, message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

const route = useRoute();

const urlParams: { [key: string]: any } = route.meta?.urlParams || {}; // 路由给过来的参数
const modalOuterData = ref<any>();
const searchForm = ref({
  limit: 0,
});
const orderId = ref(0);
const [Modal, modalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  footer: false,
  onCancel() {
    modalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = modalApi.getData<any>();
      setTimeout(() => {
        chcGridApi.query();
        chcGridApi.formApi.setValues(modalOuterData.value?.lineData);
      }, 200);
    }
  },
});
const vbenGridOption = {
  formOptions: deepMerge(formDefaultOptions, {
    showDefaultActions: false,
    showCollapseButton: false,
    commonConfig: {
      labelClass: 'w-[70px]',
    },
  }),
  gridOptions: deepMerge(gridDefaultOptions, {
    stripe: false,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      autoLoad: false,
    },
    radioConfig: {
      highlight: true,
    },
    align: 'center',
  }),
};
const chcGridOption: SchemaColumnAndOptions = {
  formSchema: [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/bpartner.do?type=3,4',
          placeholder: '请选择申请单位',
          paginate: false,
          disabled: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      defaultValue: '',
      fieldName: 'bpartnerId',
      label: '申请单位',
      formItemClass: 'pb-2 col-span-1',
    },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'warehouseName',
      label: '发货仓库',
      formItemClass: 'pb-2 col-span-1',
    },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'productControlLevelName',
      label: '管控类型',
      formItemClass: 'pb-2 col-span-1',
    },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'priorityTypeName',
      label: '来源类别',
      formItemClass: 'pb-2 col-span-1',
    },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'description',
      label: '备注',
      formItemClass: 'pb-2 col-span-1',
    },
  ],
  gridColumns: [
    {
      type: 'radio',
      visible: false,
      width: 50,
    },
    {
      title: '序号',
      width: 50,
      align: 'center',
      formatter(scope: any) {
        return scope.rowIndex + 1;
      },
    },
    {
      field: 'productCode',
      minWidth: 120,
      title: '药品编码',
    },
    {
      field: 'productName',
      minWidth: 140,
      title: '药品名称',
    },
    {
      field: 'productSpec',
      minWidth: 80,
      title: '规格',
    },
    {
      field: 'modelNo',
      minWidth: 80,
      title: '型号',
      visible: false,
    },
    {
      field: 'manufacturer',
      minWidth: 80,
      title: '厂家',
    },
    {
      field: 'uomName',
      minWidth: 80,
      title: '单位',
    },
    {
      field: 'currentPricePo',
      minWidth: 90,
      title: '商品价',
    },
    {
      field: 'qtyOrdered',
      minWidth: 90,
      title: '申请数量',
      slots: { default: 'qtyOrderedDefault' },
    },
    {
      field: 'lot',
      minWidth: 70,
      title: '批号',
    },
    {
      field: 'guaranteeDate',
      minWidth: 80,
      title: '效期',
    },
    {
      field: 'qtyAvailable',
      minWidth: 90,
      title: '总库存',
    },
    {
      field: 'description',
      minWidth: 300,
      title: '备注',
      slots: { default: 'descriptionDefault' },
    },
  ],
  autoSelectFirstRow: true,
  gridEvents: {
    radioChange() {},
  },
  getTableId: () => modalOuterData.value?.tableId,
  tableSearchExtraParams: searchForm.value,
  afterFetchFn: (params) => {
    originRows.value = params.rows.map((item: any) => {
      return deepClone(item);
    });
    return {
      ...params,
      records: params.rows,
    };
  },
};
let [ChcGrid, chcGridApi] = useSpdGrid(vbenGridOption, chcGridOption);
const originRows = ref<any[]>([]);
const handleSave = async () => {
  const params = await chcGridApi.formApi.getValues();
  if (!urlParams.isProductControlLevel) {
    params.productControlLevel = '';
  }
  const records = chcGridApi.grid.getFullData(true);
  const created: any[] = [];
  const updated: any[] = [];
  let total = 0;
  let error = false;
  records.forEach((record: any, index: number) => {
    if (!record.qtyOrdered) {
      message.error(`第${index + 1}行: 缺少申请数量！`);
      error = true;
      return;
    }
    if (record.qtyOrdered <= 0) {
      message.error(`第${index + 1}行: 申请数量必须大于0！`);
      error = true;
      return;
    }

    total = total + Number.parseInt(record.qtyOrdered);
    // 根据前后的申请数量和备注是否有变化，来判断是否是update
    const originRowValue = originRows.value.find((item) => {
      return item.orderLineId === record.orderLineId;
    });
    if (
      originRowValue.qtyOrdered !== record.qtyOrdered ||
      originRowValue.description !== record.description
    ) {
      updated.push(record);
    }
  });
  if (error) {
    return false;
  }
  if (
    created.length === 0 &&
    updated.length === 0 &&
    removed.value.length === 0
  ) {
    message.error('请输入商品明细！');
  }
  const lineData = { created, updated, removed: removed.value };
  params.returnDoc = 'N';
  params.orderId = orderId.value;
  params.lineData = JSON.stringify(lineData);
  // console.log('params:', params);
  requestFormClient.post('orderAction/saveLine.do', params).then(() => {
    modalApi.close();
    modalOuterData.value?.handleRefreshTable();
  });
};
const serachInputVal = ref();
const removed = ref<any[]>([]);
const handleDel = () => {
  // console.log(chcGridApi.grid.getRadioRecord(true));
  const records = [chcGridApi.grid.getRadioRecord(true)];
  if (!records || records.length === 0) {
    return message.error('请选择一条记录');
  }
  records.forEach((item: any) => {
    removed.value.push(item);
    chcGridApi.grid.remove(item);
  });
};
const handleSearch = () => {
  if (serachInputVal.value) {
    // 将切换第一个的选中状态
    const records = chcGridApi.grid.getFullData(true);
    const suitableRow = records.find((item: any) => {
      return !!(
        (item.productCode && item.productCode.includes(serachInputVal.value)) ||
        (item.productName && item.productName.includes(serachInputVal.value)) ||
        (item.productValue && item.productValue.includes(serachInputVal.value))
      );
    });
    suitableRow && chcGridApi.grid.setRadioRow(suitableRow);
  }
};
</script>
<template>
  <Modal
    class="formatBtnIconPosition h-[800px] w-[80%]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="修改"
    title-tooltip="修改"
  >
    <div class="h-full">
      <ChcGrid>
        <template #descriptionDefault="scope">
          <Input
            class="w-full"
            :min="0"
            v-model:value="scope.row.description"
            :data-testid="`input_description_${scope.rowIndex}_editModal`"
          />
        </template>
        <template #qtyOrderedDefault="scope">
          <InputNumber
            class="w-full"
            :min="0"
            v-model:value="scope.row.qtyOrdered"
            :data-testid="`input_qtyOrdered_${scope.rowIndex}_editModal`"
          />
        </template>
        <template #toolbar-actions>
          <Button
            type="primary"
            danger
            @click="handleDel"
            data-testid="button_handleDelete_editModal"
          >
            删除
            <template #icon>
              <SvgDeleteIcon />
            </template>
          </Button>
        </template>
        <template #toolbar-tools>
          <Input
            v-model:value="serachInputVal"
            class="mr-[0.5rem] w-[240px]"
            placeholder="请输入药品名称"
            @keyup.enter="handleSearch"
            data-testid="input_search_editModal"
          />
          <Button
            type="primary"
            @click="handleSearch"
            data-testid="button_search_editModal"
          >
            搜索
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </template>
        <template #bottom>
          <div class="flex items-center justify-center pt-[10px]">
            <div class="flex gap-[10px]">
              <Button
                type="primary"
                @click="handleSave"
                data-testid="button_save_editModal"
              >
                保存
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
              <Button
                type="primary"
                danger
                @click="modalApi.close()"
                data-testid="button_cancel_editModal"
              >
                取消
                <template #icon>
                  <SvgCloseIcon />
                </template>
              </Button>
            </div>
          </div>
        </template>
      </ChcGrid>
    </div>
  </Modal>
</template>

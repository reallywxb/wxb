<script lang="ts" setup>
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';

import { ref } from 'vue';
// import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

// message
import { Button, InputNumber, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

const globalPrintStore = useGlobalPrintStore();
// const route = useRoute();

// const urlParams: { [key: string]: any } = route.meta?.urlParams || {}; // 路由给过来的参数
const modalOuterData = ref<{
  handleRefreshTable: () => void;
  lineData: any;
  tableId: string;
}>();
const orderId = ref(0);
const [ScatterCreateModal, scatterCreateModalApi] = useVbenModal({
  draggable: true,
  showConfirmButton: false,
  cancelText: '关闭',
  destroyOnClose: true,
  footer: false,
  onCancel() {
    scatterCreateModalApi.close();
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },

  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalOuterData.value = scatterCreateModalApi.getData<{
        handleRefreshTable: () => void;
        lineData: any;
        tableId: string;
      }>();
      orderId.value = modalOuterData.value.lineData.orderId;
      setTimeout(() => {
        chcGridApi.query();
        chcGridApi.formApi.setValues({
          ...modalOuterData.value?.lineData,
          productName: `${modalOuterData.value?.lineData.productCode}/${
            modalOuterData.value?.lineData.productName
          }`,
          packageCountCanUser:
            modalOuterData.value?.lineData.qtyOnHand /
            modalOuterData.value?.lineData.replenishPackageQty,
        });
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
      enabled: true,
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
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'productName',
      label: '编码/名称',
      formItemClass: 'pb-2 col-span-1',
    },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'bpartnerName',
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
    // {
    //   component: 'Input',
    //   componentProps: () => {
    //     return {
    //       disabled: true,
    //     };
    //   },
    //   fieldName: 'replenishPackageQty',
    //   label: '定数',
    //   formItemClass: 'pb-2 col-span-1',
    // },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'packageCountCanUser',
      label: '库存包数',
      formItemClass: 'pb-2 col-span-1',
    },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'qtyLeft',
      label: '申请数量',
      formItemClass: 'pb-2 col-span-1',
    },
    {
      component: 'Input',
      componentProps: () => {
        return {
          disabled: true,
        };
      },
      fieldName: 'packageCountOrdered',
      label: '申请包数',
      formItemClass: 'pb-2 col-span-1',
    },
  ],
  gridColumns: [
    { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
    {
      title: '序号',
      width: 50,
      align: 'center',
      formatter(scope: any) {
        return scope.rowIndex + 1;
      },
    },
    {
      field: 'productSpec',
      title: '规格/型号',
      minWidth: '140',
      formatter({ row }) {
        return (
          row.productSpec +
          (row.modelNo && row.modelNo !== row.productSpec
            ? `/${row.modelNo}`
            : '')
        );
      },
      sortable: true,
    },
    {
      field: 'manufacturer',
      title: '厂家',
      minWidth: '140',
      sortable: true,
    },
    {
      field: 'uomName',
      title: '单位',
      minWidth: '70',
    },
    {
      field: 'lot',
      title: '批号',
      minWidth: '110',
    },
    {
      field: 'guaranteeDate',
      title: '效期',
      minWidth: '110',
    },
    {
      field: 'qtyAvailable',
      title: '可加工数量',
      minWidth: '100',
      align: 'right',
    },
    {
      field: 'packageCountProcess',
      title: '加工包数',
      slots: {
        default: 'packageCountProcessDefault',
      },
      // edit: 'number',
      // required: true,
      align: 'right',
      minWidth: '70',
      sortable: false,
    },
    {
      field: 'qtyProcess',
      title: '加工数量',
      align: 'right',
      minWidth: '70',
      sortable: false,
    },
    {
      field: 'price',
      title: '采购价',
      minWidth: '100',
      align: 'right',
    },
    {
      field: 'storageStatusName',
      title: '存货状态',
      minWidth: '100',
      align: 'right',
    },
    {
      field: 'vendorName',
      title: '供应商',
      minWidth: '200',
      sortable: true,
    },
    {
      field: 'productionDate',
      title: '生产日期',
      minWidth: '110',
      sortable: true,
    },
    {
      field: 'productArea',
      title: '产地',
      minWidth: '110',
      sortable: true,
    },
    {
      field: 'certificateNo',
      title: '批准文号',
      minWidth: '110',
      sortable: true,
    },
    {
      field: 'locatorName',
      title: '货位',
      minWidth: '130',
      sortable: true,
    },
  ],
  autoSelectFirstRow: false,
  gridEvents: {
    // radioChange() {},
    // 单个复选框变化事件
    checkboxChange: ({ records }: { records: any[] }) => {
      console.warn('checkboxChange', records);
      updateSummary();
    },
    // 全选/全不选事件
    checkboxAll: ({ checked }: any) => {
      console.warn('checkboxAll', checked);
      updateSummary();
    },
  },
  queryUrl: () => `/movementAction/queryStorage.do?isScatter=Y`,
  getTableId: () => modalOuterData.value?.tableId,
  beforeFetchFn: (params) => {
    return {
      ...params,
      warehouseId: modalOuterData.value?.lineData.warehouseId,
      productId: modalOuterData.value?.lineData.productId,
      storageStatus: modalOuterData.value?.lineData.storageStatus,
    };
  },
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

// 加工包数变化事件
const handlePackageCountChange = (row: any, value: number) => {
  // console.log(row, value);
  const replenishPackageQty =
    modalOuterData.value?.lineData.replenishPackageQty;
  // 计算加工数量 = 加工包数 x 定数
  const qtyLineProcess = Number(value) * Number(replenishPackageQty);
  row.qtyProcess = qtyLineProcess;
  // 验证是否超过可加工数量
  if (qtyLineProcess > row.qtyAvailable) {
    message.error('加工数量超过了可加工数量!');
    row.packageCountProcess = 0;
    row.qtyProcess = 0;
    return;
  }

  // 更新表格数据  setRow
  // chcGridApi.grid.updateData();

  // 更新汇总
  updateSummary();
};
// 汇总信息
const summaryText = ref('');
const updateSummary = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  let packageCount_sum = 0;
  const packageCountLeft_sum =
    modalOuterData.value?.lineData.packageCountOrdered;
  if (records && records.length > 0) {
    records.forEach((data: any) => {
      if (data.packageCountProcess) {
        packageCount_sum += Number(data.packageCountProcess);
      }
    });
  }

  summaryText.value = `汇总 待发包数:${packageCountLeft_sum} 加工包数:${packageCount_sum}`;
};

const originRows = ref<any[]>([]);
const handleSave = async () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择一条记录！');
    return;
  }

  // 中处理包数
  let packageCount_sum = 0;
  const formValues = await chcGridApi.formApi.getValues();
  const packageCountCanUser = formValues.packageCountCanUser;
  // 待处理数量
  const packageCountLeft_sum =
    modalOuterData.value?.lineData.packageCountOrdered;
  let err = false;
  const lines: any[] = [];
  if (records && records.length > 0) {
    records.forEach((data: any) => {
      if (data.packageCountProcess < 0) {
        message.error('加工包数不能小于0!');
        err = true;
        return;
      }
      if (data.packageCountProcess % Number(1) > 0) {
        message.error('加工包数不能为小数!');
        err = true;
        return;
      }
      if (!data.packageCountProcess) {
        message.error('加工包数不能为空!');
        err = true;
        return;
      }
      if (data.packageCountProcess) {
        packageCount_sum = packageCount_sum + Number(data.packageCountProcess);
      }
      lines.push(data);
    });
  }
  const msg = `待加工包数：${packageCountLeft_sum}，库存包数：${
    packageCountCanUser
  }，已加工包数：${packageCount_sum}`;
  if (err) {
    return null;
  }
  const params: { [key: string]: any } = {};
  params.data = JSON.stringify(lines);
  params.replenishPackageQty =
    modalOuterData.value?.lineData.replenishPackageQty; // 定数
  Modal.confirm({
    title: '提示',
    content: `${msg},确认加工包装吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('packageAction/createPackageByReplenishPackageQty.do', params)
        .then((result: any) => {
          Modal.confirm({
            title: '打印提示',
            content: '加工成功,确认打印？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
              if (result?.data) {
                // 使用 encodeURIComponent 进行 URL 编码
                const encodedData = encodeURIComponent(
                  JSON.stringify(result.data),
                );
                globalPrintStore.print({
                  pdf_path: `${location.origin}${
                    import.meta.env.VITE_GLOB_API_URL
                  }/packageAction/printPackageDoc.do?id=${encodedData}`,
                });
              }
              // 刷新父表格
              modalOuterData.value?.handleRefreshTable();
              // 关闭弹窗
              scatterCreateModalApi.close();
            },
            onCancel() {},
          });
        })
        .catch((error) => {
          message.error(error.message || '加工失败');
        });
    },
    onCancel() {},
  });
};
</script>
<template>
  <ScatterCreateModal
    class="formatBtnIconPosition h-[800px] w-[80%]"
    content-class="h-[calc(100%-55px)] overflow-y-hidden flex-none p-1"
    title="散件加工"
    title-tooltip="散件加工"
  >
    <div class="h-full">
      <ChcGrid>
        <template #packageCountProcessDefault="scope">
          <InputNumber
            class="w-full"
            :min="0"
            v-model:value="scope.row.packageCountProcess"
            @change="(value) => handlePackageCountChange(scope.row, value)"
            :data-testid="`inputNumber_packageCountProcess_${scope.rowIndex}_scatterCreate`"
          />
        </template>
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleSave"
            data-testid="button_save_scatterCreate"
          >
            加工
            <!-- <template #icon>
              <SvgDeleteIcon />
            </template> -->
          </Button>
          <!-- 汇总信息 -->
          <div v-if="summaryText" class="bg-gray-50 p-2 text-sm font-medium">
            {{ summaryText }}
          </div>
        </template>
        <!-- <template #toolbar-tools>
          <Input
            v-model:value="serachInputVal"
            class="mr-[0.5rem] w-[240px]"
            placeholder="请输入商品名称"
            @keyup.enter="handleSearch"
          />
          <Button type="primary" @click="handleSearch">
            搜索
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </template> -->
        <!-- <template #bottom>
          <div class="flex items-center justify-center pt-[10px]">
            <div class="flex gap-[10px]">
              <Button type="primary" @click="handleSave">
                保存
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
              <Button type="primary" danger @click="scatterCreateModalApi.close()">
                取消
                <template #icon>
                  <SvgCloseIcon />
                </template>
              </Button>
            </div>
          </div>
        </template> -->
      </ChcGrid>
    </div>
  </ScatterCreateModal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { Button, InputGroup, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';

import ChangeLocatorModalComp from './modals/changeLocatorModal.vue';

const globalPrintStore = useGlobalPrintStore();
const userStore = useUserStore();
const route = useRoute();

// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
});
const EDITABLE_FIELDS = new Set(['locatorName', 'packageCount']);
const gridData = ref<Record<string, any>[]>([]);
const totalQty = ref<number>(0);
const leaveQty = ref<number>(0);
const packageData = ref<Record<string, any>>({});
const resetState = () => {
  ChcGridApi.formApi.resetForm();
  totalQty.value = 0;
  leaveQty.value = 0;
  gridData.value = [];
  packageData.value = {};
  ChcGridApi.grid.reloadData([]);
};
const getListData = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.packageNo) {
    return message.warning('请输入包装号');
  }
  try {
    const res = await requestFormClient.post('/packageAction/query.do', {
      packageNo: formValues.packageNo,
      packageStatus: 'S',
      isAccurate: 'Y',
    });
    console.warn('getListData res', res);
    if (res.total === 0) {
      message.warning('未找到包装信息');
      resetState();

      return;
    }
    const data = res.rows[0] || {};
    packageData.value = {
      ...deepClone(data),
    };
    ChcGridApi.formApi.setValues({ ...data });
    totalQty.value = Number.parseInt(data.qty);
    if (!totalQty.value) {
      message.warning('未找到数量');
      return;
    }
    const productId = data.productId;
    if (!productId) {
      message.warning('未找到药品编码');
      return;
    }
    const warehouseId = data.warehouseId;
    if (!warehouseId) {
      message.warning('未找到仓库编码');
    }
    const unitPackQty = data.qty;
    const res2 = await requestFormClient.post(
      '/packageAction/queryUnitPackQty.do',
      {
        productId,
        warehouseId,
        unitPackQty,
        isSplit: 'Y',
      },
    );
    const cloneRes2 = deepClone(res2);
    if (cloneRes2.rows && cloneRes2.rows.length > 0) {
      const unitPackQty = cloneRes2.rows[0].unitPackQty;
      if (unitPackQty > 0) {
        const packageCount =
          (totalQty.value - (totalQty.value % unitPackQty)) / unitPackQty;
        cloneRes2.rows[0].packageCount = packageCount;
        cloneRes2.rows[0].qty = packageCount * unitPackQty;
      }
      for (let i = 0; i < cloneRes2.rows.length; i++) {
        if (!cloneRes2.rows[i].locatorId) {
          cloneRes2.rows[i].locatorId = data.locatorId;
          cloneRes2.rows[i].locatorName = data.locatorName;
        }
      }
      ChcGridApi.formApi.setValues({ qty: totalQty.value });
      gridData.value = cloneRes2.rows;
      ChcGridApi.grid.reloadData(gridData.value);
      setLeaveQty(gridData.value);
    }
  } catch (error) {
    console.error(error);
  }
};
const [ChcGrid, ChcGridApi, { ChangeLocatorModal, ChangeLocatorModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
        ],
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        showCollapseButton: false,
        showDefaultActions: false,
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        checkboxConfig: {
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
        pagerConfig: {
          enabled: false,
        },
        editConfig: {
          enabled: true,
          mode: 'row',
          trigger: 'dblclick',
          showStatus: false,
          showIcon: false,
          autoClear: true,
        },
        seqConfig: {
          seqMethod: ({ rowIndex }: { rowIndex: number }) => {
            return rowIndex + 1;
          },
        },
        keepSource: true,
        cellStyle: ({ column }: { column: any }) => {
          if (EDITABLE_FIELDS.has(column.field)) {
            return {
              backgroundColor: '#D7FFF5',
            };
          }
          return {};
        },
      }),

      // 添加表格事件监听
      gridEvents: {
        editClosed: (scope: any) => {
          console.warn('editClosed', scope);
          setLeaveQty();
        },
      },
    },
    {
      gridColumns: [
        {
          type: 'seq',
          width: '50',
          align: 'center',
          title: '序号',
        },
        // {
        //   field: 'unitPackQty',
        //   title: '定数',
        //   width: '15%',
        //   align: 'right',
        //   sortable: false,
        // },
        {
          field: 'packageCount',
          title: '包数',
          width: '15%',
          sortable: false,
          align: 'right',
          editRender: {
            name: 'VxeNumberInput',
            props: {
              type: 'integer',
              min: 0,
              onChange() {
                if (
                  ChcGridApi.grid.getEditCell() &&
                  ChcGridApi.grid.getEditCell()!.row
                ) {
                  const currentRow = ChcGridApi.grid.getEditCell()!.row;
                  if (!currentRow) return null;
                  currentRow.qty =
                    currentRow.unitPackQty * currentRow.packageCount;
                  setLeaveQty();
                }
              },
            },
          },
        },
        {
          field: 'qty',
          title: '数量',
          // width: '15%',
          align: 'right',
          sortable: false,
        },
        {
          field: 'locatorName',
          title: '货位',
          width: '15%',
          sortable: true,
          slots: {
            default: 'locatorName',
          },
        },
        {
          field: 'storagePackageCount',
          title: '库存包数',
          // width: '15%',
          align: 'right',
          sortable: false,
        },
      ],
      formSchema: [
        {
          component: 'Input',
          fieldName: 'packageNo',
          label: '包装号',
          componentProps: () => {
            return {
              placeholder: '',
              onPressEnter: (e) => {
                console.warn('onPressEnter', e);
                // 在这里处理回车事件 组织默认请求
                e.preventDefault && e.preventDefault();
                e.stopPropagation && e.stopPropagation();
                getListData();
              },
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'productName',
          label: '药品名称',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'productCode',
          label: '药品编码',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'productSpec',
          label: '规格',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
        // {
        //   component: 'Input',
        //   fieldName: 'modelNo',
        //   label: '型号',
        //   disabled: true,
        //   componentProps: () => {
        //     return {
        //       placeholder: ' ',
        //     };
        //   },
        // },
        {
          component: 'Input',
          fieldName: 'manufacturer',
          label: '厂家',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'uomName',
          label: '单位',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'vendorName',
          label: '供应商',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'lot',
          label: '批号',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
        {
          component: 'DatePicker',
          fieldName: 'guaranteeDate',
          label: '效期',
          disabled: true,
          componentProps: () => {
            return {
              disabled: true,
              placeholder: ' ',
              showTime: true,
              valueFormat: 'YYYY-MM-DD',
              format: 'YYYY-MM-DD',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'qty',
          label: '数量',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'locatorName',
          label: '货位',
          disabled: true,
          componentProps: () => {
            return {
              placeholder: ' ',
            };
          },
        },
      ],
      id: 'packageSplit',

      // showCustomBtn: true,
      // showZoomBtn: true,
      customModals: {
        'ChangeLocatorModal-ChangeLocatorModalApi': {
          // 连接抽离的组件
          connectedComponent: ChangeLocatorModalComp,
        },
      },
    },
  );

const handleChangeLocator = async (row: any) => {
  console.warn('handleChangeLocator:row', row);
  const formValues = await ChcGridApi.formApi.getValues();
  ChangeLocatorModalApi?.setData({
    rowData: row,
    warehouseId: formValues.warehouseId,
    callBack(val: any) {
      row.locatorId = val.id;
      row.locatorName = val.name;
    },
  }).open();
};
const setLeaveQty = (rows?: any[]) => {
  if (rows) {
    console.warn('setLeaveQty:rows', rows);
    let count = 0;
    rows.forEach((item) => {
      const unitPackQty = Number(item.unitPackQty);
      const packageCount = Number(item.packageCount);
      console.warn('setLeaveQty:unitPackQty', unitPackQty);
      console.warn('setLeaveQty:packageCount', packageCount);
      if (!Number.isNaN(unitPackQty) && !Number.isNaN(packageCount)) {
        count = count = unitPackQty * packageCount;
      }
    });
    console.warn('setLeaveQty :count', count);
    leaveQty.value = Number((totalQty.value || 0) - count);
  } else {
    const submitRows: any[] = ChcGridApi.grid.getTableData().fullData || [];
    console.warn('setLeaveQty2:submitRows', submitRows);
    let count = 0;
    submitRows.forEach((item) => {
      const unitPackQty = Number(item.unitPackQty);
      const packageCount = Number(item.packageCount);
      console.warn('setLeaveQty 2:unitPackQty', unitPackQty);
      console.warn('setLeaveQty 2:packageCount', packageCount);
      if (!Number.isNaN(unitPackQty) && !Number.isNaN(packageCount)) {
        count = count + unitPackQty * packageCount;
      }
    });
    console.warn('setLeaveQty 2:count', count);
    leaveQty.value = Number((totalQty.value || 0) - count);
  }
};

const handleSubmit = async () => {
  const submitRows: any[] = ChcGridApi.grid.getTableData().fullData || [];
  console.warn('handleSubmit submitRows:', submitRows);
  console.warn('handleSubmit packageData:', packageData.value);
  const params: Record<string, any> = {};
  params.packageId = packageData.value.packageId;
  params.packageNo = packageData.value.packageNo;
  const line: any[] = [];
  submitRows.forEach((item) => {
    line.push({
      unitPackQty: item.unitPackQty,
      locatorId: item.locatorId,
      packageCount: item.packageCount,
    });
  });
  if (leaveQty.value < 0) {
    message.warning('数量不足');
    return;
  }
  if (leaveQty.value > 0) {
    // 零头包
    line.push({
      unitPackQty: leaveQty.value,
      locatorId: packageData.value.locatorId,
      packageCount: 1,
    });
  }
  params.line = JSON.stringify(line);
  Modal.confirm({
    title: '提醒',
    content: leaveQty.value > 0 ? '存在零头数量,确认分包吗？' : '确认分包吗？',
    onOk: async () => {
      try {
        const res = await requestFormClient.post(
          '/packageAction/splitUnit.do',
          params,
        );
        resetState();
        globalPrintStore.print({
          pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/packageAction/printPackageDoc.do?id=${res.data.join(',')}`,
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChangeLocatorModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleSubmit"
          class="mr-[0.5rem]"
          data-testid="button_submit"
        >
          确认
        </Button>
      </template>
      <template #toolbar-tools>
        <span class="mr-[0.5rem]">总数量：{{ totalQty }}</span>
        <span>剩余数量：{{ leaveQty }}</span>
      </template>
      <template #locatorName="scope">
        <InputGroup compact>
          <Input
            v-model:value="scope.row.locatorName"
            class="readOnly h-[28px]"
            disabled
            style="width: calc(100% - 28px)"
            :data-testid="`input_locatorName_${scope.rowIndex}`"
          />
          <Button
            @click="handleChangeLocator(scope.row)"
            :data-testid="`button_changeLocator_${scope.rowIndex}`"
          >
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </InputGroup>
      </template>
    </ChcGrid>
  </Page>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.date-group-container) {
  background-color: #3236390a;
}

::v-deep(.date-group-container):hover {
  border-color: #e4e4e7 !important;
}
</style>

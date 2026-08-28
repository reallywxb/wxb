<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore, useUserStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';

const userStore = useUserStore();

const globalPrintStore = useGlobalPrintStore();

const route = useRoute();
const urlParams = route.meta?.urlParams || {};

const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
});
const formSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const formReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};
// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: {
      // fieldMappingTime: [
      //   ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      // ],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productCode',
        minWidth: 120,
        sortable: true,
        title: '药品编码',
        // slots: { default: "orderPlanNo" },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'productName',
        minWidth: 100,
        sortable: true,
        title: '药品名称',
      },
      {
        field: 'productSpec',
        minWidth: 100,
        sortable: true,
        title: '规格',
      },
      {
        field: 'manufacturer',
        minWidth: 150,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'uomName',
        minWidth: 70,
        sortable: true,
        title: '单位',
        align: 'right',
      },
      {
        field: 'qtyOrdered',
        minWidth: 90,
        sortable: true,
        title: '撤销数量',
        align: 'right',
      },
      {
        field: 'lot',
        minWidth: 90,
        sortable: true,
        title: '批号',
        align: 'right',
      },
      {
        field: 'guaranteeDate',
        minWidth: 120,
        sortable: true,
        title: '效期',
        align: 'right',
      },
      {
        field: 'lineStatusName',
        minWidth: 90,
        sortable: true,
        title: '状态',
        align: 'right',
      },
      {
        field: 'comments',
        minWidth: 95,
        sortable: true,
        title: '关闭说明', // 暂无
      },
      {
        field: 'description',
        minWidth: 150,
        sortable: true,
        title: '备注',
      },
    ],
    // formSchema: [
    //   {
    //     component: 'Input',
    //     fieldName: 'productName',
    //     label: '商品',
    //     componentProps: {
    //       placeholder: '编码/拼音码/名称',
    //     },
    //   },
    // ],
    id: 'child',
    queryUrl: '/orderAction/queryLine.do?specShowType=from',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.orderId) {
        return false;
      }
      return {
        ...params,
        ...parentTableParams.value,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: formSubmit,
      handleReset: formReset,
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orderNo',
        minWidth: 120,
        sortable: true,
        title: '申请单号',
        // slots: { default: "orderPlanNo" },
        // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
      },
      {
        field: 'dateOrdered',
        minWidth: 170,
        sortable: true,
        title: '发货时间',
      },
      {
        field: 'departmentName',
        minWidth: 135,
        sortable: true,
        title: '院区',
      },
      {
        field: 'warehouseName',
        minWidth: 150,
        sortable: true,
        title: '发货仓库',
      },
      {
        field: 'productControlLevelName',
        title: '商品组',
        visible: userStore.userInfo.isProductControlLevel,
        minWidth: 150,
        sortable: true,
      },
      {
        field: 'docStatusName',
        minWidth: 150,
        sortable: true,
        title: '单据状态',
      },
      {
        field: 'applyUserName',
        minWidth: 70,
        sortable: true,
        title: '撤销人',
      },
      {
        field: 'createdByName',
        minWidth: 90,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        minWidth: 90,
        sortable: true,
        title: '创建时间',
      },
      {
        field: 'description',
        minWidth: 120,
        sortable: true,
        title: '备注',
      },
    ],
    queryUrl: '/orderAction/query.do?orderType=SR',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'parent',
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=N&readWrite=Y',

            // showSearch: true,
            placeholder: '请选择发货仓库',
            onChange() {
              // console.warn("warehouseId", val, option);
              // selectController.sign();
            },
            paginate: false,
            showChooseAll: '',
            immediate: true,
            defaultValue: '',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'warehouseId',
        label: '发货仓库',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        componentProps: {
          placeholder: '请输入申请单号',
          // onPressEnter: async (e) => {
          //   // 在这里处理回车事件
          //   e.preventDefault && e.preventDefault();
          //   e.stopPropagation && e.stopPropagation();
          // },
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: {
          placeholder: '请输入药品',
        },
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        // console.log('radioChange:', row);
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          childGridApi.reload({ orderId: row.orderId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = undefined;
          // 删除子表的数据
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'ChooseLotModal-chooseLotModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: ChooseLotModalComp,
      // },
      // 'CheckUserModal-checkUserModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: CheckUserModalComp,
      // },
    },
  },
);

const handleSearch = () => {
  childGridApi.reload({
    orderId: parentTableParams.value.orderId,
    productName: parentTableParams.value.productName,
  });
};

const handlePrint = () => {
  const record = chcGridApi.grid.getCheckboxRecords();
  if (record.length === 0) {
    message.error('请选择需要打印的数据');
    return;
  }
  if (record.length > 1) {
    message.error('只能选择一条数据进行打印');
    return;
  }
  const orderId = record.map((row) => row.orderId)[0];
  Modal.confirm({
    title: '打印提示',
    content: '确认选中的数据吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderDoc.do?id=${orderId}`,
      });
    },
    onCancel() {},
  });
};

onMounted(() => {
  console.warn('urlParams', urlParams, userStore.userInfo);
  formSubmit();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
      <PageSplitLazy
        :distribute="0.6"
        :line-thickness="6"
        :is-vertical="false"
        background-color="#f1f3f6"
        hover-color="#c0c4cc"
        :has-line-tip="true"
      >
        <template #first>
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handlePrint"
                data-testid="button_print_lowConsumeCancelSearch"
              >
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <ChildGrid>
            <!-- <template #qtyProcessDefault="scope">
              <InputNumber
                class="w-full"
                :min="0"
                v-model="scope.row.qtyProcess"
              />
              <span style="color: red">{{ scope.row.qtyProcess }}</span>
            </template> -->
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                style="margin-top: 10px"
                data-testid="input_productName_lowConsumeCancelSearch"
                @keyup.enter="handleSearch"
                allow-clear
              />
              <Button
                type="primary"
                @click="handleSearch"
                style="margin-top: 10px"
                data-testid="button_search_lowConsumeCancelSearch"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
          </ChildGrid>
        </template>
      </PageSplitLazy>
    </div>
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
</style>

<script lang="ts" setup>
import type { ChildTableRow, ProductVBPItem } from './api';

import { computed, h, inject, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
  UploadActionIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { Page, useVbenModal } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';
import { handlePriceToFixedTwo } from '#/utils/util';

import {
  changeBulkPurchaseStatus,
  deleteProductMapVBPAction,
  deleteProductVBPAction,
} from './api';
import { TREE_CONTEXT_KEY } from './index';
import addAndEditProductFormModalComp from './modals/addAndEditProductFormModal.vue';
import addAndEditProductMapModalComp from './modals/addAndEditProductMapModal.vue';
import importModalComp from './modals/importModal.vue';

const props = defineProps<{
  treeNodeData: null | {
    id: string;
    key: string;
    text: string;
    type: string;
    vbpBatchId: string;
  };
}>();
const route = useRoute();
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const parentTableParams = ref<{ [key: string]: any }>({
  vbpProductId: undefined, // 父表id
  name: undefined, // 关联商品
  isBulkPurchase: undefined, // 是否中标
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.reload(formValues);
};

const type = computed(() => urlParams.productType || 'H');
const treeContext = inject(TREE_CONTEXT_KEY);

// 子表
const [ChildGrid, childGridApi, { handleExport: handleChildExport }] =
  useSpdGrid(
    {
      formOptions: {
        fieldMappingTime: [
          ['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD'],
        ],
      },
      gridOptions: {
        proxyConfig: {
          autoLoad: false,
        },
        pagerConfig: {
          enabled: true,
        },
        checkboxConfig: {
          highlight: true,
        },
        cellStyle({ row }: { row: ChildTableRow }) {
          if (row.isBulkPurchase === 'N') {
            return {
              color: 'red',
            };
          }
        },
      },
    },
    {
      gridColumns: [
        { type: 'checkbox', title: '多选', width: 40, align: 'center' },
        {
          title: '序号',
          width: 50,
          type: 'seq',
          align: 'center',
        },
        {
          field: 'productcode',
          title: '药品编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'markCode',
          title: '中标编码',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'productName',
          title: '药品名称',
          minWidth: '250',
          sortable: true,
        },
        {
          field: 'productSpec',
          title: '规格',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'modelNo',
          title: '型号',
          minWidth: '150',
          sortable: true,
          visible: false,
        },
        {
          field: 'manufacturer',
          title: '厂家',
          minWidth: '130',
          sortable: true,
        },
        {
          field: 'pricePo',
          title: '采购价',
          minWidth: '100',
          align: 'right',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.pricePo);
          },
          // format: '0.00##',
          sortable: true,
        },
        {
          field: 'isBulkPurchase',
          title: '是否中标',
          minWidth: '90',
          sortable: true,
          formatter({ row }: any) {
            const isBulkPurchaseMap = {
              Y: '是',
              N: '否',
            };
            return (
              isBulkPurchaseMap[
                row.isBulkPurchase as keyof typeof isBulkPurchaseMap
              ] || ''
            );
            // return row.isBulkPurchase
            //   ? (row.isBulkPurchase === 'Y'
            //     ? '是'
            //     : '否')
            //   : '';
          },
        },
        {
          field: 'action',
          fixed: 'right',
          title: '操作',
          minWidth: 120,
          align: 'center',
          slots: {
            default: (scope: any) => {
              return h(
                Button,
                {
                  type: 'primary',
                  danger: true,
                  'data-testid': `button_child_delete_${scope.rowIndex}`,
                  onClick: () => {
                    console.warn('点击单元格 scope', scope);
                    handleChildBatchDelete(false, scope.row);
                  },
                },
                {
                  default: () => '删除',
                },
              );
            },
          },
        },
      ],
      showExportBtn: false,
      id: 'child',
      queryUrl: 'productVBPAction/queryMap.do',
      beforeFetchFn: (params) => {
        return {
          ...params,
          ...parentTableParams.value,
        };
      },
      afterFetchFn: (params) => {
        if (!parentTableParams.value.vbpProductId) {
          return {
            records: [],
          };
        }
        return {
          ...params,
          records: params.rows,
        };
      },
    },
  );
// 父表
const [ChcGrid, chcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        // labelClass: 'w-[70px]',
        labelClass: 'w-[fit-content]',
      },
      showCollapseButton: false,
      handleSubmit: handleFormSubmit,
      // handleReset: async () => {
      //   await chcGridApi.formApi.resetForm();
      //   const formValues = await chcGridApi.formApi.getValues();
      //   chcGridApi.formApi.setLatestSubmissionValues(formValues);
      //   chcGridApi.query(formValues);
      // },
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
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
    id: 'rightViewComponentParent',
    queryUrl: 'productVBPAction/query.do',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
      },
      {
        field: 'name',
        title: '药品名称',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '80',
        sortable: true,
        visible: !(type.value === 'Y'),
      },
      {
        field: 'productStyleName',
        title: '剂型',
        minWidth: '80',
        sortable: true,
        visible: !(type.value !== 'D'),
      },
      {
        field: 'manufacturer',
        minWidth: 150,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'productArea',
        minWidth: 100,
        sortable: true,
        title: '产地',
        visible: !(type.value !== 'Y'),
      },
      {
        field: 'qtyTypeName',
        title: '使用量类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qtyPlaned',
        title: '约定使用量',
        minWidth: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'baseUomName',
        title: '使用单位',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'dosageValue',
        title: '主要成分含量',
        minWidth: '110',
        sortable: true,
        visible: !(type.value !== 'D'),
      },
      {
        field: 'dosageUomName',
        title: '含量单位',
        minWidth: '120',
        sortable: true,
        visible: !(type.value !== 'D'),
      },
      {
        field: 'price',
        title: '中标价格',
        minWidth: '90',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
        // format: '0.00',
        sortable: true,
      },
      {
        field: 'remark',
        title: '备注',
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
        minWidth: 150,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '请输入药品',
          };
        },
      },
    ],
    gridEvents: {
      radioChange: ({ row }: { row: ProductVBPItem }) => {
        if (row && row.vbpProductId) {
          parentTableParams.value.vbpProductId = row.vbpProductId;
          childGridApi.reload({ vbpProductId: row.vbpProductId });
          // await chcGridApi.grid.clearCheckboxRow();
          // chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.vbpProductId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn_params:', params, props.treeNodeData?.id);
      return {
        ...params,
        vbpBatchId: props.treeNodeData?.vbpBatchId || props.treeNodeData?.id,
      };
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 父表Actions Function
const [AddOrEditProductModal, addOrEditProductModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addAndEditProductFormModalComp,
  draggable: true,
});

const [ImportModal, importModalApi] = useVbenModal({
  class: 'w-[400px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: importModalComp,
  draggable: true,
});

const handleBatchAdd = () => {
  console.warn('handleBatchAdd_treeNodeData', props.treeNodeData);
  if (!props.treeNodeData || !props.treeNodeData.vbpBatchId) {
    message.error('请选择批次');
    return;
  }
  addOrEditProductModalApi
    .setData({
      title: '新增药品',
      type: 'add',
      treeNodeData: props.treeNodeData,
      parent: undefined,
      callback: () => {
        handleFormSubmit();
      },
    })
    .open();
};

const handleBatchEdit = ({ row }: { row: ProductVBPItem }) => {
  console.warn('handleBatchEdit', row);
  addOrEditProductModalApi
    .setData({
      title: `${row.name}编辑`,
      type: 'edit',
      treeNodeData: props.treeNodeData,
      parent: toRaw(row),
      callback: () => {
        handleFormSubmit();
      },
    })
    .open();
};

const handleImport = () => {
  importModalApi.open();
};

const handleBatchDelete = ({ row }: { row: ProductVBPItem }) => {
  console.warn('handleBatchDelete', row);
  Modal.confirm({
    title: '提示',
    content: '确认删除该耗材吗？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      deleteProductVBPAction({ id: row.vbpProductId }).then(() => {
        message.success('删除成功');
        handleFormSubmit();
      });
    },
  });
};

// 子表Actions Function
const [AddOrEditProductMapModal, addOrEditProductMapModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: addAndEditProductMapModalComp,
  draggable: true,
});
const handleSearch = () => {
  if (!parentTableParams.value.vbpProductId) {
    return;
  }
  childGridApi.reload({
    orderId: parentTableParams.value.orderId,
    productName: parentTableParams.value.productName,
    vendorId: parentTableParams.value.vendorId,
  });
};
const handleAddProductMap = (bulkPurchaseFlag: 'N' | 'Y') => {
  const parentTableData = chcGridApi.grid.getTableData().tableData || [];
  const currentParentRow = chcGridApi.grid.getRadioRecord(true);
  const unProxyRow: ProductVBPItem = toRaw(currentParentRow);
  console.warn('handleAddProductMap_currentParentRow:', currentParentRow);
  if (!parentTableData || parentTableData.length === 0) {
    message.error('请选择耗材');
    return;
  }
  const data = {
    type: 'add',
    isBulkPurchase: bulkPurchaseFlag,
    isHc: type.value === 'H',
    productType: type.value,
    parent: unProxyRow,
    callback: () => {
      childGridApi.reload({
        vbpProductId: parentTableParams.value.vbpProductId,
      });
    },
  };
  addOrEditProductMapModalApi.setData(data).open();
};
const hanleChangeBulkPurchase = (bulkPurchaseFlag: 'N' | 'Y') => {
  const records = childGridApi.grid.getCheckboxRecords(true);
  console.warn('hanleChangeBulkPurchase:', records, bulkPurchaseFlag);
  if (!records || records.length === 0) {
    message.error('请选择记录');
    return;
  }
  const isValid = records.some(
    (item: ChildTableRow) => item.isBulkPurchase === bulkPurchaseFlag,
  );
  if (isValid) {
    message.error(
      `存在${bulkPurchaseFlag === 'Y' ? '中标' : '非中标'}记录，请重新选择`,
    );
    return;
  }
  // if(bulkPurchaseFlag === 'N'){
  //   // 非中标，需要判断如果选中的记录中包含已被中标的记录，提示用户不能修改
  //   const hasNotBulkPurchase = records.some((item: ChildTableRow) => item.isBulkPurchase === 'N');
  //   if (!hasNotBulkPurchase) {
  //     message.error('存在非中标记录，请重新选择');
  //     return;
  //   }
  // } else if(bulkPurchaseFlag === 'Y'){
  //   // 中标，需要判断如果选中的记录中包含非中标的记录，提示用户不能修改
  //   const hasBulkPurchase = records.some((item: ChildTableRow) => item.isBulkPurchase === 'Y');
  //   if (!hasBulkPurchase) {
  //     message.error('存在中标记录，请重新选择');
  //     return;
  //   }
  // }
  const confirmMsg = bulkPurchaseFlag === 'Y' ? '中标' : '非中标';
  Modal.confirm({
    title: '提示',
    content: `确认修改${confirmMsg}商品吗？`,
    onOk: async () => {
      try {
        const ids = records.map((item: ChildTableRow) => item.mapId);
        const params = {
          ids: JSON.stringify(ids),
          isBulkPurchase: bulkPurchaseFlag,
        };
        console.warn('hanleChangeBulkPurchase_params:', params);
        await changeBulkPurchaseStatus(params).then(() => {
          message.success('修改成功');
          childGridApi.reload({
            vbpProductId: parentTableParams.value.vbpProductId,
          });
        });
      } catch {
        message.error('修改失败');
      }
    },
    onCancel: () => {},
  });
};
const handleChildBatchDelete = (
  isBatchDelete: boolean,
  row?: ChildTableRow,
) => {
  let records: any[] = [];
  if (isBatchDelete) {
    records = childGridApi.grid.getCheckboxRecords(true);
    console.warn('handleChildBatchDelete:', records);
    if (!records || records.length === 0) {
      message.error('请选择记录');
      return;
    }
  }
  Modal.confirm({
    title: '提示',
    content: '确认删除关联商品？',
    centered: true,
    okType: 'danger',
    onOk: async () => {
      try {
        const ids = isBatchDelete
          ? records.map((item: ChildTableRow) => item.mapId)
          : [row?.mapId || ''];
        const params = {
          ids: JSON.stringify(ids),
        };
        await deleteProductMapVBPAction(params);
        message.success('删除成功');
        childGridApi.reload({
          vbpProductId: parentTableParams.value.vbpProductId,
        });
      } catch {
        message.error('操作失败');
      }
    },
  });
};
onMounted(() => {
  // setTimeout(() => {
  //   handleFormSubmit();
  // }, 100);
  console.warn('urlParams:', urlParams);
  console.warn('treeContext:', treeContext);
  console.warn('props:', props);
});
defineExpose({
  // 初始化加载
  initData(data: any) {
    console.warn('initData:', data);
    chcGridApi.query({ vbpBatchId: data.vbpBatchId });
  },
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
          <AddOrEditProductModal />
          <ImportModal
            :params="{ type, vbpBatchId: props.treeNodeData?.id }"
            :after-submit="chcGridApi.query"
          />
          <AddOrEditProductMapModal />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleBatchAdd"
                data-testid="button_batch_add"
              >
                新增
                <template #icon>
                  <AddActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleExport"
                data-testid="button_parent_export"
              >
                导出
                <template #icon>
                  <ExportActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleImport"
                data-testid="button_import"
              >
                导入
                <template #icon>
                  <UploadActionIcon />
                </template>
              </Button>
            </template>
            <template #action="scope">
              <Button
                ghost
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleBatchEdit(scope)"
                :data-testid="`button_edit_${scope.rowIndex}`"
              >
                编辑
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
              <Button
                ghost
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleBatchDelete(scope)"
                :data-testid="`button_delete_${scope.rowIndex}`"
              >
                删除
                <template #icon>
                  <SvgDeleteIcon />
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
                v-model:value="scope.row.qtyProcess"
                :data-testid="`input_qtyProcess_${scope.rowIndex}`"
              />
            </template> -->
            <template #toolbar-actions>
              <!-- 查询条件 -->
              <div class="mt-[0.5rem]">
                <span class="mr-[0.5rem]">关联药品</span>
                <Input
                  v-model:value="parentTableParams.name"
                  class="mr-[0.5rem] w-[240px]"
                  placeholder="请输入关联药品名称"
                  @keyup.enter="handleSearch"
                  allow-clear
                  data-testid="input_productName"
                />
                <span class="mr-[0.5rem]">是否中标</span>
                <ChcSelect
                  v-model="parentTableParams.isBulkPurchase"
                  placeholder="请选择状态"
                  class="mr-[0.5rem] w-[240px]"
                  :paginate="false"
                  :immediate="false"
                  :filter-by-front-end="true"
                  :show-search="true"
                  filter-field="label"
                  label-field="label"
                  value-field="value"
                  :options="[
                    { label: '全部', value: '' },
                    { label: '是', value: 'Y' },
                    { label: '否', value: 'N' },
                  ]"
                />
                <Button
                  type="primary"
                  @click="handleSearch"
                  class="mr-[0.5rem]"
                  data-testid="button_childSearch"
                >
                  搜索
                  <template #icon>
                    <SearchActionIcon />
                  </template>
                </Button>
                <!-- 功能按钮 -->
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="handleAddProductMap('Y')"
                  data-testid="button_add_bulkPurchase_Y"
                >
                  新增中标商品
                  <template #icon>
                    <AddActionIcon />
                  </template>
                </Button>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="handleAddProductMap('N')"
                  data-testid="button_add_bulkPurchase_N"
                >
                  新增非中标商品
                  <template #icon>
                    <AddActionIcon />
                  </template>
                </Button>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="hanleChangeBulkPurchase('Y')"
                  data-testid="button_change_bulkPurchase_Y"
                >
                  改为中标商品
                  <template #icon>
                    <EditActionIcon />
                  </template>
                </Button>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="hanleChangeBulkPurchase('N')"
                  data-testid="button_change_bulkPurchase_N"
                >
                  改为非中标商品
                  <template #icon>
                    <EditActionIcon />
                  </template>
                </Button>
                <Button
                  type="primary"
                  danger
                  class="mr-[0.5rem]"
                  @click="handleChildBatchDelete(true)"
                  data-testid="button_child_batchDelete"
                >
                  删除
                  <template #icon>
                    <SvgDeleteIcon />
                  </template>
                </Button>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="handleChildExport"
                  data-testid="button_childExport"
                >
                  导出
                  <template #icon>
                    <ExportActionIcon />
                  </template>
                </Button>
              </div>
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

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>

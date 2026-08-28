<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  SearchActionIcon,
  SvgDeleteIcon,
  SvgPrintFillIcon,
  SvgSaveIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';

import { approveWork, rejectWork } from './api';

const route = useRoute();
const urlParams = route.meta?.urlParams || {};

const parentTableParams = ref<{ [key: string]: any }>({
  prescriptionId: undefined,
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
        field: 'modelNo',
        minWidth: 70,
        sortable: true,
        title: '型号',
        visible: false,
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
        field: 'price',
        minWidth: 70,
        sortable: true,
        title: '价格',
        align: 'right',
      },
      {
        field: 'qty',
        minWidth: 80,
        sortable: true,
        title: '发放数量',
        align: 'right',
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
    queryUrl: '/prescriptionAction/queryLine.do',
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
      // {
      //   title: '',
      //   type: 'checkbox',
      //   width: 50,
      //   align: 'center',
      // },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'orderId',
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
        field: 'completeUserName',
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
    queryUrl: '/prescriptionAction/query.do?status=P',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'parent',
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '处方时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            // .subtract(1, 'week')
            // .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?level1=N&readWrite=Y',
            placeholder: '请选择发货仓库',
            paginate: false,
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
        fieldName: 'warehouseId',
        label: '发货仓库',
      },
      {
        component: 'Input',
        fieldName: 'patientCard',
        label: '就诊卡号',
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '姓名',
      },
      {
        component: 'Input',
        fieldName: 'presNo',
        label: '收费单号',
      },
      {
        component: 'Input',
        fieldName: 'bedNo',
        label: '病床号',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择是否已打印',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isPrinted',
        label: '已打印',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        // console.log('radioChange:', row);
        if (row && row.prescriptionId) {
          parentTableParams.value.prescriptionId = row.prescriptionId;
          childGridApi.query({ prescriptionId: row.prescriptionId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.prescriptionId = undefined;
          // 删除子表的数据
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
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
  childGridApi.query({
    prescriptionId: parentTableParams.value.prescriptionId,
    productName: parentTableParams.value.productName,
  });
};

// 审核通过处理函数
const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要确认发放的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '确认发放',
    content: `是否发放勾选的 ${selectedRows.length} 条数据？`,
    onOk: async () => {
      try {
        const prescriptionId = selectedRows.map((row) => row.prescriptionId);
        // const params = new URLSearchParams();
        // params.append('wfActivityId', JSON.stringify(wfActivityIds));
        const params = {
          prescriptionId: JSON.stringify(prescriptionId),
        };
        console.warn('params', params);
        // 根据实际调用接口
        await approveWork(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('approveWorkapproveWorkapproveWork', res);
              // 刷新表格数据
              chcGridApi.query();
              message.success('发放成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('发放失败');
      }
    },
  });
};

// 作废处理函数
const handleCancel = () => {
  // 先检查是否有选中的行数据
  const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要取消发放的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '取消发放',
    content: `是否取消发放勾选的 ${selectedRows.length} 条数据？`,
    onOk: async () => {
      try {
        const prescriptionId = selectedRows.map((row) => row.prescriptionId);
        // const params = new URLSearchParams();
        // params.append('wfActivityId', JSON.stringify(wfActivityIds));
        const params = {
          prescriptionId: JSON.stringify(prescriptionId),
        };
        console.warn('params', params);
        // 根据实际调用接口
        await rejectWork(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('approveWorkapproveWorkapproveWork', res);
              // 刷新表格数据
              chcGridApi.query();
              message.success('取消发放成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('取消发放成功');
      }
    },
  });
};

const handlePrint = () => {};

onMounted(() => {
  console.warn('urlParams', urlParams);
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
              <Button type="primary" class="mr-[0.5rem]" @click="handlePrint">
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
              <Button type="primary" class="mr-[0.5rem]" @click="handleApprove">
                确认发放
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
              <Button type="primary" class="mr-[0.5rem]" @click="handleCancel">
                取消发放
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
                v-model="scope.row.qtyProcess"
              />
              <span style="color: red">{{ scope.row.qtyProcess }}</span>
            </template> -->
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
              />
              <Button type="primary" @click="handleSearch">
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

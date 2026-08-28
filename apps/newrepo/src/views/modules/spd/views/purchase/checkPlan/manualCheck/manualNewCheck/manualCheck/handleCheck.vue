<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  UploadActionIcon,
} from '@vben/chc-icons';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import { dataCommit, invalidateCancel } from './api';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();
const urlParams = route.meta?.urlParams || {};

// 用于控制表格的查询在所有select下拉框查询完并赋值后触发
const searchController = new LazySearch(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});
const extParams = ref<{}>({});
const selectedAmount = ref(0); // 勾选金额
const totalAmount = ref(0); // 总金额
const currentTab = defineModel<number>('currentTab', { required: true });
const isFirstLoaded = ref(false);
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['createdFrom', 'createdTo'], 'YYYY-MM-DD'],
          ['dateCommit', ['commitFrom', 'commitTo'], 'YYYY-MM-DD'],
        ],
        handleSubmit: async () => {
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          ChcGridApi.reload(formValues);
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        checkboxConfig: {
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
      }),
      // 添加表格事件监听
      gridEvents: {
        // 单个复选框变化事件
        checkboxChange: ({ records }: { records: any[] }) => {
          calculateSelectedAmount(records);
        },
        // 全选/全不选事件
        checkboxAll: ({ records }: { records: any[] }) => {
          calculateSelectedAmount(records);
        },
      },
    },
    {
      gridColumns: [
        {
          title: '多选',
          type: 'checkbox',
          width: 50,
          align: 'center',
        },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'deliveryNo',
          minWidth: 120,
          sortable: true,
          title: '配送单号',
          slots: { default: 'deliveryNo' },
        },
        {
          field: 'bpartnerName',
          minWidth: 120,
          sortable: true,
          title: '供应商',
        },
        {
          field: 'warehouseName',
          minWidth: 150,
          sortable: true,
          title: '采购仓库',
        },
        {
          field: 'applyBPartnerName',
          minWidth: 150,
          sortable: true,
          title: '需求仓库',
        },
        {
          field: 'receiptTypeName',
          minWidth: 100,
          sortable: true,
          title: '入库类型',
        },
        {
          field: 'totalAmt',
          minWidth: 90,
          sortable: true,
          title: '金额',
          align: 'right',
        },
        {
          field: 'docStatusName',
          minWidth: 120,
          sortable: true,
          title: '单据状态',
        },
        {
          field: 'createdByName',
          minWidth: 100,
          sortable: true,
          title: '创建人',
        },
        {
          field: 'confirmUserName',
          minWidth: 100,
          sortable: true,
          title: '提交人',
        },
        {
          field: 'confirmTime',
          minWidth: 150,
          sortable: true,
          title: '提交时间',
        },
        {
          field: 'description',
          minWidth: 150,
          sortable: true,
          title: '备注',
        },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: '操作',
          width: 180,
        },
      ],
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'dateOrdered',
          label: '创建时间',
          defaultValue: [
            dayjs(dayjs().format('YYYY-MM-DD'))
              .subtract(7, 'day')
              .format('YYYY-MM-DD'),
          ],
          formItemClass: 'col-span-1',
        },
        {
          component: 'DateGroup',
          fieldName: 'dateCommit',
          label: '入库提交时间',
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
              autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
              placeholder: '请选择采购仓库',
              onChange() {
                searchController.sign();
              },
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
          fieldName: 'warehouseId',
          label: '采购仓库',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择需求仓库',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              onChange() {
                searchController.sign();
              },
              // mode: 'multiple',
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          fieldName: 'applyBPartnerId',
          label: '需求仓库',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=131',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择单据状态',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              // mode: 'multiple',
              showChooseAll: '',
              defaultValue: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          fieldName: 'docStatus',
          label: '单据状态',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/refList.do?id=1000650',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择入库类型',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              // mode: 'multiple',
              showChooseAll: '',
              defaultValue: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          fieldName: 'receiptType',
          label: '入库类型',
        },
        {
          component: 'Input',
          fieldName: 'productName',
          label: '药品',
          componentProps: {
            placeholder: '请输入药品',
          },
        },
        {
          component: 'Input',
          fieldName: 'insurance',
          label: '医保药品编码',
          componentProps: {
            placeholder: '请输入医保药品编码',
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/vendor.do',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择供应商',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              // onChange(val: any, option: any) {
              //   extParams.value.bpartnerId_text = option.name;
              // },
              // mode: 'multiple',
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              defaultValue: '',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          fieldName: 'bpartnerId',
          label: '供应商',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              // dictUrl: '/orderPlanAction/commit.do',
              options: [
                { value: '', label: '全部' },
                { value: 'Y', label: '是' },
                { value: 'N', label: '否' },
              ],
              placeholder: '请选择高值',
              defaultValue: '',
              paginate: false,
              filterByFrontEnd: true,
              // onChange(val: any, option: any) {
              //   extParams.value.isPrecious_text = option.label;
              // },
              showChooseAll: '',
              immediate: true,
            };
          },
          fieldName: 'isPrecious',
          label: '高值',
        },
        {
          component: 'Input',
          fieldName: 'deliveryNo',
          label: '配送单号',
          componentProps: {
            placeholder: '请输入配送单号',
          },
        },
      ],
      dataTableId:
        '/asnAction/query.do?asnType=PO&receiptType=0,2,3,4,5,G,S&page=input&isPackaged=&invoiceMethod=&isGt=N',
      commonFormOptions,
      viewFormOptions,
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      afterFetchFn: (params) => {
        totalAmount.value = params.totalPrice || 0;
        console.warn('afterFetchFn:', params.totalPrice);
        return {
          ...params,
          records: params.rows,
        };
      },
      customModals: {
        'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
          // 连接抽离的组件
          connectedComponent: ImportModalComp,
        }),
      },
    },
  );

const calculateSelectedAmount = (selectedRows: any[]) => {
  const total = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.totalAmt) || 0);
  }, 0);
  selectedAmount.value = total;
};
const handleAddNew = () => {
  props.goToDetailPage(
    {},
    {
      detailTitle: '新建手工入库单',
      sourcePage: props.thisTab.value,
      type: 'add',
    },
  );
};
const handleEdit = (scope: any) => {
  props.goToDetailPage(scope.row, {
    detailTitle: '编辑手工入库单',
    sourcePage: props.thisTab.value,
    type: 'edit',
  });
};
const handleImport = () => {
  importModalApi?.open();
};

const handleOrderPlanClick = (scope: any) => {
  props.goToDetailPage(scope.row, {
    detailTitle: '查看手工入库单',
    sourcePage: props.thisTab.value,
    type: 'view',
  });
};
// 提交通过处理函数
const handleApprove = () => {
  // 先检查是否有选中的行数据
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要提交的数据');
    return;
  }

  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: `是否将选中的手工入库单提交？`,
    onOk: async () => {
      try {
        const asnIds = selectedRows.map((row: any) => row.asnId);
        // const params = new URLSearchParams();
        // params.append('asnId', JSON.stringify(asnIds));
        const params = {
          asnId: JSON.stringify(asnIds),
        };
        await dataCommit(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('dataCommitdataCommitdataCommit', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('提交成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('提交失败');
      }
    },
  });
};

// 作废处理函数
const handleCancel = (scope: any) => {
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: `是否将此手工入库单删除？`,
    onOk: async () => {
      try {
        await invalidateCancel({ asnId: scope.row?.asnId })
          .then((res) => {
            if (res && res.success) {
              console.warn('rejectWorkrejectWorkrejectWork', res);
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('删除成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('删除失败');
      }
    },
  });
};
// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: number, oldVal: number) => {
    const detailPageConfig = props.getDetailPageConfig();
    if (
      val === props.thisTab.value &&
      (oldVal !== detailPageConfig.detailPageValue ||
        (oldVal === detailPageConfig.detailPageValue &&
          detailPageConfig.detailPageType !== 'view'))
    ) {
      ChcGridApi.formApi.getValues().then((res: any) => {
        ChcGridApi.query({ ...res });
      });
    }
  },
);

onMounted(() => {
  console.warn('urlParams:', urlParams);
});
</script>
<template>
  <div class="h-full">
    <ImportModal />
    <ChcGrid>
      <template #deliveryNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
        >
          {{ scope.row.deliveryNo }}
        </a>
      </template>
      <template #toolbar-tools>
        <span>勾选金额：{{ selectedAmount }}元</span>
        <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span>
      </template>
      <template #toolbar-actions>
        <Button type="primary" @click="handleAddNew" class="mr-[0.5rem]">
          新 建
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button type="primary" @click="handleApprove" class="mr-[0.5rem]">
          提 交
        </Button>
        <Button type="primary" @click="handleImport" class="mr-[0.5rem]">
          导 入
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
        <Button type="primary" @click="handleExport" class="mr-[0.5rem]">
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope)"
        >
          明细提交
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleCancel(scope)"
        >
          删除
        </Button>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}
</style>

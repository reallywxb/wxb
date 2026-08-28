<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  ExportActionIcon,
  SvgDeleteIcon,
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
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import { dataCommit, invalidateCancel, deleteBatch } from './api';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const route = useRoute();
const urlParams = route.meta?.urlParams || {};

class LazySelect {
  callBack;
  count;
  nowNum = 0;
  constructor(count: number, callBack: () => void) {
    this.count = count;
    this.callBack = callBack;
  }
  sign() {
    this.nowNum++;
    if (this.nowNum === this.count) {
      this.callBack();
    }
  }
}
// 用于控制表格的查询在所有select下拉框查询完并赋值后触发
const selectController = new LazySelect(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
    isFirstLoaded.value = true;
  });
});
const extParams = ref<{
  // commitStatus?: string;
  // page?: string;
  // returnDoc?: string;
}>({
  // commitStatus: 'WC',
  // returnDoc: 'N',
  // page: 'input',
  // warehouseId,
});
const selectedAmount = ref(0);
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const isFirstLoaded = ref(false);
// 仓库联动额外参数
const warehouseIdExtraParams = ref<{
  regionId?: number | string | undefined;
}>({
  regionId: '',
});

// 根据采购仓库值联动设置需求仓库
const setApplyBPartnerByWarehouse = (warehouseId: string | number) => {
  const applyBPartnerRef = ChcGridApi.formApi?.getFieldComponentRef(
    'applyBPartnerId',
  ) as any;
  // 通过组件暴露的 getSelectOptions 方法获取选项数据
  const applyBPartnerOptions = applyBPartnerRef?.getSelectOptions?.() || [];
  const applyBPartner = applyBPartnerOptions.find(
    (item: any) => String(item.warehouseId) === String(warehouseId),
  );
  if (applyBPartner) {
    ChcGridApi.formApi?.setFieldValue('applyBPartnerId', applyBPartner.id);
  }
};

const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        fieldMappingTime: [
          ['dateOrdered', ['createdFrom', 'createdTo'], 'YYYY-MM-DD'],
          ['dateCommit', ['commitFrom', 'commitTo'], 'YYYY-MM-DD'],
        ],
        handleSubmit: async (values) => {
          console.warn('values', values);
          const formValues = await ChcGridApi.formApi.getValues();
          ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
          ChcGridApi.reload(formValues);
          // ChcGridApi.formApi.getValues().then((res: any) => {
          //   console.log('getValues', res);
          //   ChcGridApi.query({ ...res });
          // });
        },
        commonConfig: {
          labelClass: 'w-[90px]',
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
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
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
          field: 'isCrossDocking',
          minWidth: 150,
          sortable: true,
          title: '是否直供',
          formatter({ row }: any) {
            return row.isCrossDocking === 'Y' ? '是' : '否';
          },
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
          label: '提交时间',
          formItemClass: 'col-span-1',
        },

        // TODO: medicine add 院区
        {
          component: 'ChcSelect',
          fieldName: 'departmentId',
          label: '院区',
          componentProps: () => {
            return {
              autoChooseFirstOption: true,
              dictUrl:
                '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
              placeholder: '请选择院区',
              paginate: false,
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              onChange(val: any) {
                warehouseIdExtraParams.value.regionId = val;
              },
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
              extraParams: warehouseIdExtraParams.value,
              // showSearch: true,
              placeholder: '请选择采购仓库',
              onChange(val: any, option: any) {
                console.warn('warehouseId', val, option);
                setApplyBPartnerByWarehouse(val);
                selectController.sign();
              },
              paginate: false,
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                if (res.rows?.length) {
                  const firstOption = res.rows[0];
                  ChcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    firstOption.id,
                  );
                  // 采购仓库默认选中第一个时，联动设置需求仓库
                  setApplyBPartnerByWarehouse(firstOption.id);
                }
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          dependencies: {
            triggerFields: ['departmentId'],
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
              onChange(val: any, option: any) {
                console.warn('applyBPartnerId', val, option);
                selectController.sign();
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
          // TODO: medicine change 药品
          component: 'Input',
          fieldName: 'productName',
          label: '药品',
          componentProps: {
            placeholder: '请输入药品',
          },
        },
        {
          // TODO:medicine change 医保药品编码
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
        // TODO:medicine delete 高值
        // {
        //   component: 'ChcSelect',
        //   componentProps: () => {
        //     return {
        //       // autoChooseFirstOption: true,
        //       // dictUrl: '/orderPlanAction/commit.do',
        //       options: [
        //         { value: '', label: '全部' },
        //         { value: 'Y', label: '是' },
        //         { value: 'N', label: '否' },
        //       ],
        //       placeholder: '请选择高值',
        //       defaultValue: '',
        //       paginate: false,
        //       filterByFrontEnd: true,
        //       // onChange(val: any, option: any) {
        //       //   extParams.value.isPrecious_text = option.label;
        //       // },
        //       showChooseAll: '',
        //       immediate: true,
        //     };
        //   },
        //   fieldName: 'isPrecious',
        //   label: '高值',
        // },
        {
          component: 'Input',
          fieldName: 'asnNo',
          label: '配送单号',
          componentProps: {
            placeholder: '请输入配送单号',
          },
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
              placeholder: `请选择是否直供`,
              defaultValue: '',
              paginate: false,
              filterByFrontEnd: true,
              showChooseAll: '',
              immediate: true,
            };
          },
          fieldName: 'isCrossDocking',
          label: '是否直供',
        },
      ],
      dataTableId:
        '/asnAction/query.do?asnType=PO&page=input&isPackaged=&invoiceMethod=&isGt=N',
      id: 'manualInfoHandleCheck',
      commonFormOptions,
      viewFormOptions,
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      afterFetchFn: (params) => {
        // totalAmount.value = params.totalPrice || 0;
        let amout = 0;
        params.rows?.forEach((item: any) => {
          if (item.totalAmt) {
            amout += Number.parseFloat(item.totalAmt);
          }
        });
        totalAmount.value = Number(amout.toFixed(2));
        console.warn('getTableArrDataFn:', params.totalPrice);
        setTimeout(() => {
          calculateSelectedAmount([]);
        }, 200);
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
  selectedAmount.value = Number.parseFloat(total.toFixed(2));
  calculateSummarize();
};

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '勾选金额',
      value: selectedAmount.value,
    },
    {
      label: '总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};
const handleAddNew = () => {
  parentData.value = {};
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '新建手工入库单',
    sourcePage: props.thisTab.value,
    type: 'add',
    typeAction: 'add',
  };
};
const handleEdit = (scope: any) => {
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '编辑手工入库单',
    sourcePage: props.thisTab.value,
    type: 'edit',
    typeAction: 'edit',
  };
};
const handleImport = () => {
  importModalApi
    ?.setData({
      callback: async () => {
        const formValues = await ChcGridApi.formApi.getValues();
        ChcGridApi.query({ ...formValues });
      },
    })
    ?.open();
};

const handleOrderPlanClick = (scope: any) => {
  console.warn('点击采购计划单号:', scope.row);
  // 这里可以添加跳转到单据明细的逻辑
  // 类似 waitToSubmit.vue 中的编辑功能
  parentData.value = scope.row;
  currentTab.value = headerTabs.value.length - 1;
  detailInfo.value = {
    detailTitle: '查看手工入库单',
    sourcePage: props.thisTab.value,
    type: 'view',
  };
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
// AI-GENERATED-BEGIN
// @date 2026-06-30
// @prompt 添加批量删除功能
// @description 实现批量删除方法，获取选中的行数据，调用invalidateCancel接口批量删除，删除成功后刷新表格
const handleBatchDelete = () => {
  // 获取选中的记录
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请先选择要删除的数据');
    return;
  }

  // 提取asnId列表
  const asnIds = selectedRows.map((row: any) => row.asnId).join(',');

  // 弹出确认框
  Modal.confirm({
    title: '批量删除',
    content: `是否删除选中的${selectedRows.length}条手工入库单？`,
    onOk: async () => {
      try {
        await deleteBatch({ asnIds })
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                ChcGridApi.query({ ...resData });
              });
              message.success('批量删除成功');
            } else {
              message.error(res.msg || '批量删除失败');
            }
          })
          .catch((error) => {
            console.error('批量删除失败', error);
            message.error('批量删除失败');
          });
      } catch {
        message.error('批量删除失败');
      }
    },
  });
};
// AI-GENERATED-END
watch(
  () => currentTab.value,
  (val: number | string) => {
    if (val === props.thisTab.value) {
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
          :data-testid="`link_delivery_no_${scope.rowIndex}_handleCheck`"
        >
          {{ scope.row.deliveryNo }}
        </a>
      </template>
      <template #toolbar-tools>
        <!-- <span>勾选金额：{{ selectedAmount }}元</span>
        <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAddNew"
          class="mr-[0.5rem]"
          data-testid="button_add_new_handleCheck"
        >
          新 建
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleApprove"
          class="mr-[0.5rem]"
          data-testid="button_approve_handleCheck"
        >
          提 交
        </Button>
        <Button
          type="primary"
          @click="handleImport"
          class="mr-[0.5rem]"
          data-testid="button_import_handleCheck"
        >
          导 入
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_handleCheck"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
        <!-- AI-GENERATED-BEGIN -->
        <!-- @date 2026-06-30 -->
        <!-- @prompt 在导出按钮后添加批量删除按钮 -->
        <!-- @description 添加批量删除按钮，点击后调用handleBatchDelete方法删除选中的记录 -->
        <Button
          type="primary"
          danger
          @click="handleBatchDelete"
          class="mr-[0.5rem]"
          data-testid="button_batch_delete_handleCheck"
        >
          批量删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
        <!-- AI-GENERATED-END -->
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope)"
          :data-testid="`button_edit_${scope.rowIndex}_handleCheck`"
        >
          明细提交
        </Button>
        <Button
          danger
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleCancel(scope)"
          :data-testid="`button_delete_${scope.rowIndex}_handleCheck`"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
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

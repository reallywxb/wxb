<script setup lang="ts">
import { nextTick, ref, toRaw, watch } from 'vue';

import { ExportActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import Summarize from '#/components/spd/summarize/index.vue';
import { deepMerge } from '#/utils/util';

import actionLogModal from './modals/actionLogModal.vue';
import ImportModalComp from './modals/importModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const props = withDefaults(
  defineProps<{
    thisTab: PageTab;
  }>(),
  {},
);
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});
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
const selectController = new LazySelect(2, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query(res);
    isFirstLoaded.value = true;
  });
});

const extParams = ref<{
  asnType: string;
  orderType: string;
  // isGift_text?: string;
  // isPrecious_text?: string;
  page?: string;
  returnDoc?: string;
}>({
  // docStatus: "'DR','NA'",
  returnDoc: 'N',
  orderType: 'PO',
  asnType: 'PO',
  page: 'query',
});
const totalAmount = ref(0);
const currentTab = defineModel<number>('currentTab', { required: true });
const headerTabs = defineModel<PageTab[]>('headerTabs', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
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
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        compact: true,
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
        handleSubmit: async (values: any) => {
          console.warn('values', values);
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
    },
    {
      gridColumns: [
        // { type: 'checkbox', title: '', width: 50, align: 'center' },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        // {
        //   field: 'commitStatusName',
        //   minWidth: 90,
        //   sortable: false,
        //   title: '单据状态',
        //   // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        // },
        {
          field: 'deliveryNo',
          minWidth: 90,
          sortable: true,
          title: '配送单号',
          slots: { default: 'deliveryNo' },
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          field: 'inoutNo',
          minWidth: 130,
          sortable: true,
          title: '入库单号',
          // "hidden": ''!=isPackaged //未设置isPackaged参数时显示，否则隐藏
        },
        {
          field: 'productCode',
          minWidth: 120,
          sortable: true,
          title: '药品编码',
        },
        {
          field: 'productName',
          minWidth: 100,
          sortable: true,
          title: '产品名称',
        },
        {
          field: 'productSpec',
          minWidth: 90,
          sortable: true,
          title: '规格', // 暂无
        },
        {
          field: 'modelNo',
          minWidth: 90,
          sortable: true,
          title: '型号', // 暂无
          visible: false,
        },
        {
          field: 'uomName',
          minWidth: 90,
          sortable: true,
          title: '单位', // 暂无
        },
        {
          field: 'qtyArrived',
          minWidth: 100,
          sortable: true,
          title: '入库数量',
          align: 'right',
        },
        {
          field: 'priceActual',
          minWidth: 100,
          sortable: true,
          title: '入库单价',
          align: 'right',
        },
        {
          field: 'lot',
          minWidth: 90,
          sortable: true,
          title: '批号', // 暂无
        },
        {
          field: 'productionDate',
          minWidth: 120,
          sortable: true,
          title: '生产日期',
        },
        {
          field: 'guaranteeDate',
          minWidth: 120,
          sortable: true,
          title: '效期', // 暂无
        },
        {
          field: 'serNo',
          minWidth: 120,
          sortable: true,
          title: '序列号', // 暂无
        },
        {
          field: 'taxInvoiceNo',
          minWidth: 120,
          sortable: true,
          title: '发票号', // 暂无
        },
        {
          field: 'taxInvoiceDate',
          minWidth: 120,
          sortable: true,
          title: '发票日期', // 暂无
        },
        {
          field: 'lineAmt',
          minWidth: 90,
          sortable: true,
          title: '金额',
          align: 'right',
        },
        {
          field: 'manufacturer',
          minWidth: 110,
          sortable: true,
          title: '生产厂家', // 暂无
        },
        {
          field: 'lPackageQty',
          minWidth: 110,
          sortable: true,
          title: '大包装数', // 暂无
          align: 'right',
        },
        {
          field: 'mPackageQty',
          minWidth: 110,
          sortable: true,
          title: '中包装数', // 暂无
          align: 'right',
        },
        {
          field: 'qtyOnhand',
          minWidth: 180,
          sortable: true,
          title: '需求库房库存数量', // 暂无
          align: 'right',
        },
        {
          field: 'insurance',
          minWidth: 120,
          sortable: true,
          title: '医保药品编码', // 暂无
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
        // {
        //   align: 'center',
        //   field: 'action',
        //   slots: { default: 'action' },
        //   fixed: 'right',
        //   headerAlign: 'center',
        //   showOverflow: false,
        //   title: '操作',
        //   width: 100,
        // },
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
              autoChooseFirstOption: true,
              dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
              extraParams: warehouseIdExtraParams.value,
              // showSearch: true,
              placeholder: '请选择采购仓库',
              onChange(val: any, option: any) {
                console.warn('warehouseId', val, option);
                setApplyBPartnerByWarehouse(val);
                selectController.sign();
                // extParams.value.warehouseId_text = option.name;
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
              defaultValue: '',
              dictUrl: '/baseHandleAction/refList.do?id=131',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择单据状态',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              showChooseAll: '',
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
              // onChange(val: any, option: any) {
              //   extParams.value.vendorId_text2 = option.name;
              // },
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
          fieldName: 'receiptType', // 暂无字段
          label: '入库类型',
        },
        {
          // TODO: medicine change 药品名称
          component: 'Input',
          fieldName: 'productName',
          label: '药品名称',
          componentProps: {
            placeholder: '请输入药品',
          },
        },
        {
          // TODO: medicine change 医保药品编码
          component: 'Input',
          fieldName: 'insurance', // 暂无字段
          label: '医保药品编码',
          componentProps: {
            placeholder: '请输入医保药品编码',
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
          component: 'Input',
          fieldName: 'taxInvoiceNo',
          label: '发票号',
          componentProps: {
            placeholder: '请输入发票号',
          },
        },
        {
          component: 'Input',
          fieldName: 'mInoutId',
          label: '入库单号',
          componentProps: {
            placeholder: '请输入入库单号',
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
      dataTableId: '/asnAction/queryDetail.do?specShowType=from',

      id: 'manualInfo',
      commonFormOptions,
      viewFormOptions,
      showCustomBtn: true,
      showZoomBtn: true,
      tableSearchExtraParams: extParams.value,
      beforeFetchFn: (params) => {
        return {
          ...params,
          receiptType: params.receiptType || '0,2,3,4,5,G,S',
        };
      },
      afterFetchFn: (params) => {
        // totalAmount.value = params.totalPrice || 0;
        totalAmount.value = 0;
        const rows = params.rows || [];
        rows.forEach((row: any) => {
          if (row.lineAmt) {
            totalAmount.value += row.lineAmt;
          }
        });
        setTimeout(() => {
          calculateSummarize();
        }, 200);

        console.warn('getTableArrDataFn:', params.totalPrice);
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
// const handleBatchChoose = async (records: any[]) => {
//   const formValue = await ChcGridApi.formApi.getValues();
//   let newRow = null;
//   for (const [i, record__] of records.entries()) {
//     const response = await getOrderPlanStorage({
//       warehouseId: formValue.warehouseId,
//       productId: record__.productId,
//     });
//     const record = {
//       userId: userStore.userInfo?.userId,
//       ...record__,
//       ...response,
//     };
//     if (i === 0) {
//       const midRow = await ChcGridApi.grid.insertAt(record, -1);
//       newRow = midRow.row;
//     } else {
//       await ChcGridApi.grid.insertAt(record, -1);
//     }
//   }
//   ChcGridApi.grid.setEditRow(newRow, 'packagePlaned');
// };

const summarizeRef = ref();

const calculateSummarize = () => {
  const totalArr = [
    {
      label: '总金额',
      value: totalAmount.value,
    },
  ];
  summarizeRef.value.refreshNumber(totalArr);
};

const handleDetail = (scope: any) => {
  // importModalApi?.open();
  console.warn(importModalApi);
  console.warn('scope', scope);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.orderPlanLineId,
      // replenishSource: 'P',
      // handleBatchChoose,
    })
    .open();
};
const handleOrderPlanClick = (scope: any) => {
  console.warn('handleDetail:', handleDetail);
  console.warn('点击单号:', scope.row);
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
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <ImportModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_infoQuery"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #toolbar-tools>
        <!-- <span style="margin-left: 20px">总金额：{{ totalAmount }}元</span> -->
        <Summarize ref="summarizeRef" />
      </template>
      <template #deliveryNo="scope">
        <a
          href="javascript:void(0)"
          class="cursor-pointer text-blue-600 underline hover:text-blue-800"
          @click="handleOrderPlanClick(scope)"
          :data-testid="`link_asn_id_${scope.rowIndex}_infoQuery`"
        >
          {{ scope.row.deliveryNo }}
        </a>
      </template>
      <!-- <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          data-testid="button_action_record_infoQuery"
        >
          操作记录
        </Button>
      </template> -->
    </ChcGrid>
  </div>
</template>
<style scoped></style>

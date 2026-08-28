<script lang="ts" setup>
import { onMounted, ref, toRaw, nextTick } from 'vue';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';
import { handlePriceToFixedTwo } from '#/utils/util';

import CheckUserModalComp from './checkUserModal.vue';
import ChooseLotModalComp from './chooseLotModal.vue';
import LazySearch from '#/utils/LazySearch';
const globalPrintStore = useGlobalPrintStore();

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
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query({ ...formValues });
  isFirstLoaded.value = true;
});
onMounted(() => {
  searchController.sign(3);
});
// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
    },
  },
  {
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        minWidth: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '申请数量',
        align: 'right',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'qtyDelivered',
        title: '实发数量',
        align: 'right',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'qtyReceived',
        title: '实收数量',
        align: 'right',
        minWidth: '90',
        sortable: false,
      },
      {
        field: 'qtyRejected',
        title: '拒收数量',
        minWidth: '90',
        align: 'right',
        sortable: false,
      },
      {
        field: 'pricePO',
        title: '采购价',
        minWidth: '70',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        minWidth: '70',
        align: 'right',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceList);
        },
      },
      {
        field: 'lineStatusName',
        title: '状态',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'comments',
        title: '关闭说明',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        // edit: 'text',
        sortable: true,
      },
      // {
      //   align: 'center',
      //   field: 'action',
      //   slots: { default: 'action' },
      //   fixed: 'right',
      //   headerAlign: 'center',
      //   showOverflow: false,
      //   title: '操作',
      //   width: 180,
      // },
    ],
    id: 'child',
    queryUrl: '/orderAction/queryLine.do?specShowType=to',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.orderId) {
        return false;
      }
      return { ...params, ...parentTableParams.value };
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
const [
  ChcGrid,
  chcGridApi,
  { ChooseLotModal, chooseLotModalApi, CheckUserModal, checkUserModalApi },
] = useSpdGrid(
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
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    queryUrl: '/orderAction/query.do?page=inputQuery',
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '申请时间',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'deliveryPlanDate',
        title: '要求送达时间',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '申请单位',
        minWidth: '150',
        //  hidden : hiddenField.indexOf("priorityTypeName") > -1,
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '申请类型',
        minWidth: '100',
        // hidden : hiddenField.indexOf("orderTypeName") > -1,
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'warehouseName1',
        title: '发货仓库',
        minWidth: '150',
        sortable: true,
        formatter({ row }: any) {
          return row.warehouseName;
        },
      },
      {
        field: 'toWarehouseName',
        title: '收货仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'docStatusName',
        title: '单据状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '150',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
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
            defaultValue: '',
            // dictUrl: '/orderPlanAction/commit.do',
            options: [
              { value: '', label: '全部' },
              { value: 'WO', label: '库房请领' },
              { value: 'WR', label: '库房请退' },
              { value: 'MO', label: '库间调拨' },
              { value: 'SO', label: '科室请领' },
              { value: 'SR', label: '科室请退' },
            ],
            placeholder: '请选择申请类型',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        defaultValue: '',
        fieldName: 'orderType',
        label: '申请类型',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择收货仓库',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi?.formApi?.setFieldValue(
                'toWarehouseId',
                res?.rows?.[0]?.id || '',
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }

              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'toWarehouseId',
        label: '收货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouseBPartner.do?accessAll=Y',
            placeholder: '请选择申请单位',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi?.formApi?.setFieldValue(
                'bpartnerId',
                res?.rows?.[0]?.id || '',
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }

              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'bpartnerId',
        label: '申请单位',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        componentProps: {
          placeholder: '请输入药品',
        },
        label: '药品',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        componentProps: {
          placeholder: '请输入申请单号',
        },
        label: '申请单号',
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
          parentTableParams.value.orderId = 0;
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
      'ChooseLotModal-chooseLotModalApi': {
        // 连接抽离的组件
        connectedComponent: ChooseLotModalComp,
      },
      'CheckUserModal-checkUserModalApi': {
        // 连接抽离的组件
        connectedComponent: CheckUserModalComp,
      },
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
  const record = chcGridApi.grid.getRadioRecord(true);
  const orderId = record.orderId;
  Modal.confirm({
    title: '打印提示',
    content: '确认打印申请单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printApplyDoc.do?id=${JSON.stringify(orderId)}`,
      });
    },
    onCancel() {},
  });
};
// 指定批号
// const handleChangeLot = (row: any) => {
//   const record = chcGridApi.grid.getRadioRecord(true);
//   const isStoragePackage = row.isStoragePackage;
//   if (isStoragePackage === 'Y') {
//     return message.error('包装出库不允许指定批号');
//   }
//   chooseLotModalApi
//     ?.setData({
//       parentLineData: record,
//       lineData: row,
//       tableId: 'chooseLotModal',
//       handleRefreshTable: () => {
//         formSubmit();
//       },
//     })
//     .open();
// };
// const handleRePick = (row: any) => {
//   const qtyLeft = row.qtyLeft;
//   const qtyTarget = row.qtyTarget;
//   if (Number(qtyLeft) === Number(qtyTarget)) {
//     message.error('没有已拣货数量/已取消数量,不能重新拣货');
//     return;
//   }
//   const ids = [];
//   ids.push(row.pickListJobId);
//   const params: { [key: string]: any } = {};
//   params.pickListJobId = JSON.stringify(ids);
//   Modal.confirm({
//     title: '提示',
//     content: '确认重新拣货？',
//     okText: '确认',
//     cancelText: '取消',
//     onOk() {
//       requestFormClient
//         .post('pickListAction/pickListJobRepick.do', params)
//         .then(() => {
//           message.success('重拣成功!');
//           formSubmit();
//         });
//     },
//     onCancel() {},
//   });
// };
// const handleConfirmBtn = () => {
//   const record = chcGridApi.grid.getRadioRecord(true);
//   if (!record) {
//     return message.error('请选择需要确认的拣货单！');
//   }
//   const params: { [key: string]: any } = {};
//   params.orderId = record.orderId;
//   params.isShipment = 'Y';
//   const lineRecords = childGridApi.grid.getFullData();
//   const lineData: any[] = [];
//   let hasError = false;
//   let hasControlledProduct = false;
//   const warehouseId = record.warehouseId;
//   lineRecords.forEach((record: any) => {
//     let qtyConfirm = record.qtyConfirm;
//     if (qtyConfirm === undefined) qtyConfirm = 0;
//     let qtyCancel = record.qtyCancel;
//     if (qtyCancel === undefined) qtyCancel = 0;

//     if (qtyConfirm < 0) {
//       hasError = true;
//       message.error(`药品【${record.productName}】拣货数量不能小于0！`);
//       return;
//     }
//     if (qtyCancel < 0) {
//       hasError = true;
//       message.error(`药品【${record.productName}】取消数量不能小于0！`);
//       return;
//     }
//     if (Number(qtyConfirm) + Number(qtyCancel) !== Number(record.qtyLeft)) {
//       hasError = true;
//       message.error(
//         `药品【${record.productName}】未完成拣货！确认数量：${
//           qtyConfirm
//         },加取消数量:${qtyCancel},不等于总数量：${record.qtyLeft}`,
//       );
//       return;
//     }
//     if (record.isControlledProduct === 'Y') {
//       hasControlledProduct = true;
//     }
//     lineData.push({
//       pickListJobId: record.pickListJobId,
//       qtyConfirm: record.qtyConfirm,
//       qtyCancel: record.qtyCancel,
//       description: record.description,
//     });
//   });
//   if (hasError) return;
//   params.lineData = JSON.stringify(lineData);
//   Modal.confirm({
//     title: '提示',
//     content: '确认出库？',
//     okText: '确认',
//     cancelText: '取消',
//     onOk() {
//       if (hasControlledProduct) {
//         checkUserModalApi
//           ?.setData({
//             warehouseId,
//           })
//           .open();
//         // 第二作业人
//       } else {
//         requestFormClient
//           .post('pickListAction/pickListConfirm.do', params)
//           .then((res) => {
//             chcGridApi.grid.remove(record);
//             chcGridApi.grid.removeRadioRow();
//             message.success('确认成功！');
//             // 删除子表的数据
//             childGridApi.grid.remove(childGridApi.grid.getFullData());
//             if (res.data && res.data.asnId) {
//               // var parmLine = [];
//               // parmLine.push(res.data.asnId);
//               Modal.confirm({
//                 title: '打印提示',
//                 content: '打印配送单吗？',
//                 okText: '确认',
//                 cancelText: '取消',
//                 onOk() {
//                   //  App.print(App.getContextPath() + 'asnAction/printAsnDoc.do?id=' + parmLine);
//                   if (res.data.hasLack === 'Y' && res.data.orderId > 0) {
//                     // let orderId = res.data.orderId;
//                     Modal.confirm({
//                       title: '打印提示',
//                       content: '打印欠品单吗？',
//                       okText: '确认',
//                       cancelText: '取消',
//                       onOk() {
//                         // 执行打印操作
//                         // App.print(App.getContextPath() + 'orderAction/printOrderShortDoc.do?orderId=' + orderId);
//                         //
//                       },
//                       onCancel() {},
//                     });
//                   }
//                 },
//                 onCancel() {},
//               });
//             }
//             if (res.data && res.data.shipmentId) {
//               // 提示打印配送单
//               const parmLine = [];
//               parmLine.push(res.data.shipmentId);
//               Modal.confirm({
//                 title: '打印提示',
//                 content: '打印出库单吗？',
//                 okText: '确认',
//                 cancelText: '取消',
//                 onOk() {
//                   // 执行打印操作
//                   // App.print(App.getContextPath() + 'shipmentAction/printShipmentDoc.do?id=' + parmLine);
//                   if (res.data.hasLack === 'Y' && res.data.orderId > 0) {
//                     // let orderId = res.data.orderId;
//                     Modal.confirm({
//                       title: '打印提示',
//                       content: '打印欠品单吗？',
//                       okText: '确认',
//                       cancelText: '取消',
//                       onOk() {
//                         // 执行打印操作
//                         // App.print(App.getContextPath() + 'orderAction/printOrderShortDoc.do?orderId=' + orderId);
//                       },
//                       onCancel() {},
//                     });
//                   }
//                 },
//                 onCancel() {},
//               });
//             } else if (res.data && res.data.inoutIds) {
//               Modal.confirm({
//                 title: '打印提示',
//                 content: '打印出库单吗？',
//                 okText: '确认',
//                 cancelText: '取消',
//                 onOk() {
//                   // 执行打印操作
//                   //  App.print(
//                   //     App.getContextPath() +
//                   //       'inoutAction/printOutputDoc.do?id=' +
//                   //       res.data.inoutIds,
//                   //   );
//                   if (res.data.hasLack === 'Y' && res.data.orderId > 0) {
//                     // const orderId = res.data.orderId;
//                     Modal.confirm({
//                       title: '打印提示',
//                       content: '打印欠品单吗？',
//                       okText: '确认',
//                       cancelText: '取消',
//                       onOk() {
//                         // 执行打印操作
//                         //     App.print(
//                         //       `${App.getContextPath()}orderAction/printOrderShortDoc.do?orderId=${
//                         //         res.data.orderId
//                         //       }`,
//                         //     );
//                       },
//                       onCancel() {},
//                     });
//                   }
//                 },
//                 onCancel() {},
//               });
//             }
//           });
//       }
//     },
//   });
// };
// const handleCancelBtn = () => {
//   const record = chcGridApi.grid.getRadioRecord(true);
//   if (!record) {
//     return message.error('请选择需要取消的拣货单！');
//   }
//   const lineRecords = childGridApi.grid.getFullData();
//   let hasError = false;
//   lineRecords.forEach((record: any) => {
//     let qtyPicked = record.qtyPicked;
//     if (qtyPicked === undefined) qtyPicked = 0;
//     if (qtyPicked > 0) {
//       hasError = true;
//       return message.error(
//         `药品【${record.productName}】已有拣货数量：${
//           qtyPicked
//         },请重新拣货后再取消！`,
//       );
//     }
//   });
//   if (hasError) return;

//   const params: { [key: string]: any } = {};
//   params.orderId = record.orderId;
//   Modal.confirm({
//     title: '提示',
//     content: '确认取消拣货单？',
//     okText: '确认',
//     cancelText: '取消',
//     onOk() {
//       requestFormClient.post('pickListAction/pickListClose.do', params).then(() => {
//         chcGridApi.grid.remove(record);
//         chcGridApi.grid.removeRadioRow();
//         message.success('取消成功');
//         // 删除子表的数据
//         childGridApi.grid.remove(childGridApi.grid.getFullData());
//       });
//     },
//     onCancel() {},
//   });
// };
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
          <CheckUserModal />
          <ChooseLotModal />
          <ChcGrid class="flex-1 overflow-hidden">
            <template #toolbar-actions>
              <Button
                type="primary"
                @click="handlePrint"
                data-testid="button_print"
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
            <template #qtyProcessDefault="scope">
              <InputNumber
                class="w-full"
                :min="0"
                v-model="scope.row.qtyProcess"
                :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}`"
              />
              <span style="color: red">{{ scope.row.qtyProcess }}</span>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                style="margin-top: 10px"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="Input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                style="margin-top: 10px"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
            <!-- <template #action="scope">
              <Button
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleChangeLot(scope.row)"
              >
                指定批号
              </Button>
              <Button
                type="primary"
                class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleRePick(scope.row)"
              >
                重新拣货
              </Button>
            </template> -->
            <!-- <template #bottom>
              <div class="flex items-center justify-center pt-[10px]">
                <div class="flex gap-[10px]">
                  <Button type="primary" @click="handleConfirmBtn">
                    出库确认
                    <template #icon>
                      <SvgSquareTickIcon />
                    </template>
                  </Button>
                  <Button type="primary" danger @click="handleCancelBtn">
                    取消拣货
                    <template #icon>
                      <SvgCloseIcon />
                    </template>
                  </Button>
                </div>
              </div>
            </template> -->
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

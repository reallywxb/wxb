<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';

import {
  SearchActionIcon,
  SvgCloseIcon,
  SvgPrintFillIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

import CheckUserModalComp from './checkUserModal.vue';
import ChooseLotModalComp from './chooseLotModal.vue';
import ScanModalComp from './scanModal.vue';

const globalPrintStore = useGlobalPrintStore();
const isFirstLoaded = ref(false);
const searchController = new LazySearch(3, async () => {
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  chcGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(3);
});
const parentTableParams = ref<{ [key: string]: any }>({
  pickListId: undefined,
  productName: undefined,
});
const departmentId = ref<number | string>('');
// 子表
const childTotal = ref(0);
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
        field: 'insurance',
        title: '医保编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'standardCode',
        title: '贯标编码',
        minWidth: '120',
        sortable: true,
        visible: false, // TODO:medicine cancel 贯标码
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
        field: 'modelNo',
        title: '型号',
        minWidth: '150',
        sortable: true,
        visible: false,
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
        minWidth: '75',
        sortable: true,
      },
      // {
      //   field: 'unitPackQty',
      //   title: '定数',
      //   minWidth: '75',
      //   sortable: true,
      //   align: 'right',
      // },
      {
        field: 'qtyLeft',
        title: '待拣数量',
        minWidth: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyConfirm',
        title: '本次拣货数量',
        minWidth: '110',
        // edit: 'number',
        sortable: false,
        align: 'right',
        // readOnly(record) {
        //   return record.isStoragePackage == 'Y';
        // },
      },
      {
        field: 'qtyCancel',
        title: '本次取消数量',
        minWidth: '110',
        // edit: 'number',
        sortable: false,
        align: 'right',
      },
      {
        field: 'qtyTarget',
        title: '目标数量',
        minWidth: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyPicked',
        title: '已拣数量',
        minWidth: '100',
        // hover: true,
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyCancelled',
        title: '已取消数量',
        minWidth: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'fromLocatorValue',
        title: '货位',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'qtyOnHandLeft',
        title: '剩余库存数量',
        minWidth: 120,
        sortable: true,
        align: 'right',
      },
      {
        field: 'supportDays',
        title: '维持天数',
        minWidth: 100,
        sortable: true,
        align: 'right',
      },
      {
        field: 'currentPricePo',
        title: '采购价',
        minWidth: 100,
        sortable: true,
        align: 'right',
      },
      {
        field: 'pickedLot',
        title: '已拣批号',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'cancelReasonName',
        title: '取消原因',
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
    id: 'child',
    queryUrl: '/pickListAction/queryPickListJob.do?page=pick',
    beforeFetchFn: (params) => {
      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      childTotal.value = params.total || 0;
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const parentCheckedRow = ref<Record<string, any>>({});
const [
  ChcGrid,
  chcGridApi,
  {
    ChooseLotModal,
    chooseLotModalApi,
    CheckUserModal,
    checkUserModalApi,
    ScanModal,
    scanModalApi,
  },
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
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'parent',
    queryUrl:
      '/pickListAction/query.do?page=pick&orderType=WO,WR,MO,SO&productControlLevel=',
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
        field: 'pickListNo',
        title: '拣货单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'priorityTypeName',
        title: '来源类别',
        minWidth: '100',
        //  hidden : hiddenField.indexOf("priorityTypeName") > -1,
        sortable: true,
      },
      {
        field: 'pickDate',
        title: '指示时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '发货仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '收货单位',
        minWidth: '150',
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
        field: 'statusName',
        title: '拣货状态',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'productControlLevelName',
        title: '管控类型',
        //  hidden : !isProductControlLevel,
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'orderNo',
        title: '申请单号',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'orderDescription',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '指示时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            .subtract(1, 'week')
            // .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      //
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择发货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'warehouseId',
        label: '发货仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                chcGridApi.formApi?.getFieldComponentRef &&
                typeof chcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                chcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  regionId: values?.departmentId || -1,
                  departmentId: values?.departmentId || -1,
                };
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                chcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4',
            placeholder: '请选择收货单位',
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
        fieldName: 'bpartnerId',
        label: '收货单位',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000453',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择拣货状态`,
            paginate: false,
            filterByFrontEnd: true,
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
        fieldName: 'pickStatus',
        label: '拣货状态',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
      },
      {
        component: 'Input',
        fieldName: 'pickListNo',
        label: '拣货单号',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        // console.log('radioChange:', row);
        childTotal.value = 0;
        parentCheckedRow.value = { ...row };
        if (row && row.pickListId) {
          parentTableParams.value.pickListId = row.pickListId;
          childGridApi.reload({ pickListId: row.pickListId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.pickListId = undefined;
          // 删除子表的数据
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      childTotal.value = 0;
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
      'ScanModal-scanModalApi': {
        // 连接抽离的组件
        connectedComponent: ScanModalComp,
      },
    },
  },
);

const handleSearch = () => {
  childGridApi.reload({
    pickListId: parentTableParams.value.pickListId,
    productName: parentTableParams.value.productName,
  });
};
const handlePrint = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  const pickListId = record.pickListId;
  Modal.confirm({
    title: '打印提示',
    content: '确认打印拣货单吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/pickListAction/printPickListDoc.do?id=${JSON.stringify(pickListId)}`,
      });
    },
    onCancel() {},
  });
};
// 指定批号
const handleChangeLot = (row: any) => {
  const record = chcGridApi.grid.getRadioRecord(true);
  const isStoragePackage = row.isStoragePackage;
  if (isStoragePackage === 'Y') {
    return message.error('包装出库不允许指定批号');
  }
  chooseLotModalApi
    ?.setData({
      parentLineData: record,
      lineData: row,
      tableId: 'chooseLotModal',
      handleRefreshTable: () => {
        formSubmit();
      },
    })
    .open();
};
const handleRePick = (row: any) => {
  const qtyLeft = row.qtyLeft;
  const qtyTarget = row.qtyTarget;
  if (Number(qtyLeft) === Number(qtyTarget)) {
    message.error('没有已拣货数量/已取消数量,不能重新拣货');
    return;
  }
  const ids = [];
  ids.push(row.pickListJobId);
  const params: { [key: string]: any } = {};
  params.pickListJobId = JSON.stringify(ids);
  Modal.confirm({
    title: '提示',
    content: '确认重新拣货？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('pickListAction/pickListJobRepick.do', params)
        .then(() => {
          message.success('重拣成功!');
          formSubmit();
        });
    },
    onCancel() {},
  });
};
const handleConfirmBtn = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择需要确认的拣货单！');
  }
  const params: { [key: string]: any } = {};
  params.pickListId = record.pickListId;
  params.isShipment = 'Y';
  const lineRecords = childGridApi.grid.getFullData();
  const lineData: any[] = [];
  let hasError = false;
  let hasControlledProduct = false;
  const warehouseId = record.warehouseId;
  lineRecords.forEach((record: any) => {
    let qtyConfirm = record.qtyConfirm;
    if (qtyConfirm === undefined) qtyConfirm = 0;
    let qtyCancel = record.qtyCancel;
    if (qtyCancel === undefined) qtyCancel = 0;

    if (qtyConfirm < 0) {
      hasError = true;
      message.error(`商品【${record.productName}】拣货数量不能小于0！`);
      return;
    }
    if (qtyCancel < 0) {
      hasError = true;
      message.error(`商品【${record.productName}】取消数量不能小于0！`);
      return;
    }
    if (Number(qtyConfirm) + Number(qtyCancel) !== Number(record.qtyLeft)) {
      hasError = true;
      message.error(
        `商品【${record.productName}】未完成拣货！确认数量：${
          qtyConfirm
        },加取消数量:${qtyCancel},不等于总数量：${record.qtyLeft}`,
      );
      return;
    }
    if (record.isControlledProduct === 'Y') {
      hasControlledProduct = true;
    }
    lineData.push({
      pickListJobId: record.pickListJobId,
      qtyConfirm: record.qtyConfirm,
      qtyCancel: record.qtyCancel,
      description: record.description,
    });
  });
  if (hasError) return;
  params.lineData = JSON.stringify(lineData);
  Modal.confirm({
    title: '提示',
    content: '确认出库？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      if (hasControlledProduct) {
        checkUserModalApi
          ?.setData({
            warehouseId,
            callBack: (formValues: {
              checkUser2: number | string;
              password: string;
            }) => {
              return new Promise((resolve) => {
                params.workerId2 = formValues.checkUser2;
                requestFormClient
                  .post('pickListAction/pickListConfirm.do', params)
                  .then((res) => {
                    chcGridApi.grid.remove(record);
                    chcGridApi.grid.removeRadioRow();
                    message.success('确认成功！');
                    // 删除子表的数据
                    childGridApi.grid.remove(childGridApi.grid.getFullData());
                    resolve(true);
                    if (res.data && res.data.asnId) {
                      const parmLine: any[] = [];
                      parmLine.push(res.data.asnId);
                      Modal.confirm({
                        title: '打印提示',
                        content: '打印配送单吗？',
                        okText: '确认',
                        cancelText: '取消',
                        onOk() {
                          // App.print(App.getContextPath() + 'asnAction/printAsnDoc.do?id=' + parmLine);
                          globalPrintStore.print({
                            pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/asnAction/printAsnDoc.do?id=${parmLine}`,
                          });
                          if (
                            res.data.hasLack === 'Y' &&
                            res.data.orderId > 0
                          ) {
                            const orderId = res.data.orderId;
                            Modal.confirm({
                              title: '提示',
                              content: '打印欠品单吗？',
                              okText: '确认',
                              cancelText: '取消',
                              onOk() {
                                // App.print(App.getContextPath() + 'orderAction/printOrderShortDoc.do?orderId=' + orderId);
                                globalPrintStore.print({
                                  pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderShortDoc.do?orderId=${orderId}`,
                                });
                              },
                              onCancel() {},
                            });
                          }
                        },
                        onCancel() {},
                      });
                    }
                    if (res.data && res.data.shipmentId) {
                      // 提示打印配送单
                      const parmLine: any[] = [];
                      parmLine.push(res.data.shipmentId);
                      Modal.confirm({
                        title: '打印提示',
                        content: '打印送货单吗？',
                        okText: '确认',
                        cancelText: '取消',
                        onOk() {
                          // App.print(App.getContextPath() + 'shipmentAction/printShipmentDoc.do?id=' + parmLine);
                          globalPrintStore.print({
                            pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/shipmentAction/printShipmentDoc.do?id=${parmLine}`,
                          });
                          if (
                            res.data.hasLack === 'Y' &&
                            res.data.orderId > 0
                          ) {
                            const orderId = res.data.orderId;
                            Modal.confirm({
                              title: '打印提示',
                              content: '打印欠品单吗？',
                              okText: '确认',
                              cancelText: '取消',
                              onOk() {
                                // App.print(App.getContextPath() + 'orderAction/printOrderShortDoc.do?orderId=' + orderId);
                                globalPrintStore.print({
                                  pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderShortDoc.do?orderId=${orderId}`,
                                });
                              },
                              onCancel() {},
                            });
                          }
                        },
                        onCancel() {},
                      });
                    }
                  })
                  .catch((error) => {
                    message.error('确认失败:', error);
                  });
              });
            },
          })
          .open();
        // 第二作业人
      } else {
        requestFormClient
          .post('pickListAction/pickListConfirm.do', params)
          .then((res) => {
            chcGridApi.grid.remove(record);
            chcGridApi.grid.removeRadioRow();
            message.success('确认成功！');
            // 删除子表的数据
            childGridApi.grid.remove(childGridApi.grid.getFullData());
            if (res.data && res.data.asnId) {
              const parmLine: string[] = [];
              parmLine.push(res.data.asnId);
              Modal.confirm({
                title: '打印提示',
                content: '打印配送单吗？',
                okText: '确认',
                cancelText: '取消',
                onOk() {
                  //  App.print(App.getContextPath() + 'asnAction/printAsnDoc.do?id=' + parmLine);
                  globalPrintStore.print({
                    pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/asnAction/printAsnDoc.do?id=${parmLine}`,
                  });
                  if (res.data.hasLack === 'Y' && res.data.orderId > 0) {
                    const orderId = res.data.orderId;
                    Modal.confirm({
                      title: '打印提示',
                      content: '打印欠品单吗？',
                      okText: '确认',
                      cancelText: '取消',
                      onOk() {
                        // 执行打印操作
                        // App.print(App.getContextPath() + 'orderAction/printOrderShortDoc.do?orderId=' + orderId);
                        //
                        globalPrintStore.print({
                          pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderShortDoc.do?orderId=${orderId}`,
                        });
                      },
                      onCancel() {},
                    });
                  }
                },
                onCancel() {},
              });
            }
            if (res.data && res.data.shipmentId) {
              // 提示打印配送单
              const parmLine: any[] = [];
              parmLine.push(res.data.shipmentId);
              Modal.confirm({
                title: '打印提示',
                content: '打印出库单吗？',
                okText: '确认',
                cancelText: '取消',
                onOk() {
                  // 执行打印操作
                  // App.print(App.getContextPath() + 'shipmentAction/printShipmentDoc.do?id=' + parmLine);
                  globalPrintStore.print({
                    pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/shipmentAction/printShipmentDoc.do?id=${parmLine}`,
                  });
                  if (res.data.hasLack === 'Y' && res.data.orderId > 0) {
                    const orderId = res.data.orderId;
                    Modal.confirm({
                      title: '打印提示',
                      content: '打印欠品单吗？',
                      okText: '确认',
                      cancelText: '取消',
                      onOk() {
                        // 执行打印操作
                        // App.print(App.getContextPath() + 'orderAction/printOrderShortDoc.do?orderId=' + orderId);
                        globalPrintStore.print({
                          pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderShortDoc.do?orderId=${orderId}`,
                        });
                      },
                      onCancel() {},
                    });
                  }
                },
                onCancel() {},
              });
            } else if (res.data && res.data.inoutIds) {
              Modal.confirm({
                title: '打印提示',
                content: '打印出库单吗？',
                okText: '确认',
                cancelText: '取消',
                onOk() {
                  // 执行打印操作
                  //  App.print(
                  //     App.getContextPath() +
                  //       'inoutAction/printOutputDoc.do?id=' +
                  //       res.data.inoutIds,
                  //   );
                  globalPrintStore.print({
                    pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inoutAction/printOutputDoc.do?id=${res.data.inoutIds}`,
                  });
                  if (res.data.hasLack === 'Y' && res.data.orderId > 0) {
                    const orderId = res.data.orderId;
                    Modal.confirm({
                      title: '打印提示',
                      content: '打印欠品单吗？',
                      okText: '确认',
                      cancelText: '取消',
                      onOk() {
                        // 执行打印操作
                        //     App.print(
                        //       `${App.getContextPath()}orderAction/printOrderShortDoc.do?orderId=${
                        //         res.data.orderId
                        //       }`,
                        //     );
                        globalPrintStore.print({
                          pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/orderAction/printOrderShortDoc.do?orderId=${orderId}`,
                        });
                      },
                      onCancel() {},
                    });
                  }
                },
                onCancel() {},
              });
            }
          });
      }
    },
  });
};
const handleCancelBtn = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择需要取消的拣货单！');
  }
  const lineRecords = childGridApi.grid.getFullData();
  let hasError = false;
  lineRecords.forEach((record: any) => {
    let qtyPicked = record.qtyPicked;
    if (qtyPicked === undefined) qtyPicked = 0;
    if (qtyPicked > 0) {
      hasError = true;
      return message.error(
        `商品【${record.productName}】已有拣货数量：${
          qtyPicked
        },请重新拣货后再取消！`,
      );
    }
  });
  if (hasError) return;

  const params: { [key: string]: any } = {};
  params.pickListId = record.pickListId;
  Modal.confirm({
    title: '提示',
    content: '确认取消拣货单？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('pickListAction/pickListClose.do', params)
        .then(() => {
          chcGridApi.grid.remove(record);
          chcGridApi.grid.removeRadioRow();
          message.success('取消成功');
          // 删除子表的数据
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        });
    },
    onCancel() {},
  });
};
const scanBtnVisible = computed(() => {
  if (isEmpty(parentCheckedRow.value)) {
    return false;
  }

  if (isEmpty(parentCheckedRow.value?.packageJobCount)) {
    return false;
  }
  return parentCheckedRow.value?.packageJobCount > 0;
});
const handleScanBtn = () => {
  const record = chcGridApi.grid.getRadioRecord(true);
  if (!record) {
    return message.error('请选择需要确认的拣货单！');
  }
  scanModalApi
    ?.setData({
      row: toRaw(record),
      callback() {
        chcGridApi.query();
      },
    })
    .open();
};
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
          <ScanModal />
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
                :data-testid="`inputNumber_qtyProcess_${scope.rowIndex}`"
              />
              <span style="color: red">{{ scope.row.qtyProcess }}</span>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
            <template #action="scope">
              <Button
                type="primary"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleChangeLot(scope.row)"
                :data-testid="`button_changeLot_${scope.rowIndex}`"
              >
                指定批号
              </Button>
              <Button
                type="primary"
                class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                @click="handleRePick(scope.row)"
                :data-testid="`button_rePick_${scope.rowIndex}`"
              >
                重新拣货
              </Button>
            </template>
            <template #bottom>
              <div class="flex items-center pt-[10px]">
                <div class="text-[12px]">共 {{ childTotal }} 条记录</div>
                <div class="flex flex-1 items-center justify-center">
                  <div class="flex gap-[10px]">
                    <Button
                      v-show="scanBtnVisible"
                      type="primary"
                      @click="handleScanBtn"
                      data-testid="button_scan"
                    >
                      扫码拣货
                      <template #icon>
                        <SvgSquareTickIcon />
                      </template>
                    </Button>
                    <Button
                      type="primary"
                      @click="handleConfirmBtn"
                      data-testid="button_confirm"
                    >
                      出库确认
                      <template #icon>
                        <SvgSquareTickIcon />
                      </template>
                    </Button>

                    <Button
                      type="primary"
                      danger
                      @click="handleCancelBtn"
                      data-testid="button_cancel"
                    >
                      取消拣货
                      <template #icon>
                        <SvgCloseIcon />
                      </template>
                    </Button>
                  </div>
                </div>
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
</style>

<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';

import {
  ResetActionIcon,
  SearchActionIcon,
  SvgCloseIcon,
  SvgSaveIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, isTheSame } from '#/utils/util';

import EditModalComp from './editModal.vue';
import { isEmpty } from '@vben/utils';
import { ChcSelect } from '@vben/chc-ui';
import LazySearch from '#/utils/LazySearch';
const globalPrintStore = useGlobalPrintStore();
const parentTableParams = ref<{ [key: string]: any }>({
  orderId: undefined,
  productName: undefined,
});

// 子表
const childTotal = ref(0);

const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
      // editConfig: {
      //   enabled: true,
      //   trigger: 'click',
      //   mode: 'cell',
      //   showIcon: true,
      //   autoClear: false,
      // },
      cellStyle: ({ column }: { column: any }) => {
        if (column.field === 'qtyProcess') {
          return {
            backgroundColor: '#D7FFF5',
          };
        }

        return {};
      },
    }),
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
        field: 'productName',
        title: '药品编码/名称',
        minWidth: 200,
        formatter: ({ row }: any) => {
          return `${row.productCode}/${row.productName}`;
        },
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: 150,
        formatter: ({ row }: any) => {
          return `${row.productSpec}${row.modelNo && row.modelNo !== row.productSpec ? `/${row.modelNo}` : ''}`;
        },
      },
      { field: 'manufacturer', title: '厂家', minWidth: 120 },
      { field: 'uomName', title: '单位', minWidth: 40 },
      {
        field: 'replenishPackageQty',
        title: '定数',
        minWidth: 40,
        align: 'right',
        visible: false, // TODO:medicine cancel 定数
      },
      {
        field: 'packageCountOrdered',
        title: '包数',
        minWidth: 40,
        align: 'right',
        visible: false, // TODO:medicine cancel 包数
      },
      { field: 'qtyOrdered', title: '申请数量', minWidth: 70, align: 'right' },
      {
        field: 'qtyProcess',
        title: '指示数量',
        minWidth: 90,
        // editRender: {},
        // slots: { edit: 'qtyProcessDefault' },
        slots: { default: 'qtyProcessDefault' },
      },
      { field: 'qtyPo', title: '缺货数量', minWidth: 70, align: 'right' },
      {
        field: 'qtyOnHand',
        title: '可用数量',
        minWidth: 70,
        align: 'right',
        formatter: ({ row }: any) => {
          return !row.qtyOnHand || row.qtyOnHand < 0 ? '无' : row.qtyOnHand;
        },
      },
      { field: 'storageQty', title: '总库存', minWidth: 70, align: 'right' },
      {
        field: 'qtyPoPlaned',
        minWidth: 90,
        title: '转采购数量',
        align: 'right',
      },
      { field: 'lot', title: '批号', minWidth: 120 },
      { field: 'guaranteeDate', title: '效期', minWidth: 120 },
      { field: 'defaultVendorName', title: '默认供应商', minWidth: 100 },
      { field: 'description', title: '备注', minWidth: 150 },
    ],
    id: 'child',
    queryUrl: '/orderAction/queryOutputApproveNew.do?specShowType=from',
    afterFetchFn: (params) => {
      childTotal.value = params.total || 0;
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const isFirstLoaded = ref(false); // 是否已初次加载完
const selectController = new LazySearch(2, async () => {
  if (isFirstLoaded.value) {
    return;
  }
  await nextTick();
  chcGridApi?.formApi?.getValues().then((res: any) => {
    isFirstLoaded.value = true;
    chcGridApi.query({ ...res });
  });
});
onMounted(() => {
  selectController.sign(2);
});
// 父表
const [ChcGrid, chcGridApi, { EditModal, editModalApi }] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      handleSubmit: async () => {
        const formValues = await chcGridApi.formApi.getValues();
        chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
        chcGridApi.query(formValues);
      },
      handleReset: async () => {
        await chcGridApi.formApi.resetForm();
        const formValues = await chcGridApi.formApi.getValues();
        chcGridApi.formApi.setLatestSubmissionValues(formValues);
        chcGridApi.query(formValues);
      },
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
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      pagerConfig: {
        enabled: true,
      },
      checkboxConfig: {
        // trigger: 'row',
        highlight: false,
      },
    },
  },
  {
    id: 'parent',
    queryUrl:
      '/orderAction/queryNew.do?page=createPick&orderType=WO,SO,MO,WR&productControlLevel=',
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'priorityRuleName',
        title: '优先级',
        minWidth: 100,
        sortable: true,
      },
      { field: 'orderNo', title: '申请单号', minWidth: 110 },
      { field: 'priorityTypeName', title: '来源类别', minWidth: 110 },
      { field: 'dateOrdered', title: '申请时间', minWidth: 160 },
      { field: 'orderTypeName', title: '申请类型', minWidth: 100 },
      { field: 'bpartnerName', title: '申请单位', minWidth: 150 },
      { field: 'warehouseName', title: '发货仓库', minWidth: 150 },
      { field: 'deliveryPlanDate', title: '要求送达时间', minWidth: 150 },
      { field: 'createdByName', title: '申请人', minWidth: 100 },
      { field: 'origDocumentNo', title: '来源单号', minWidth: 110 },
      { field: 'productControlLevelName', title: '管控类型', minWidth: 100 },
      { field: 'description', title: '备注', minWidth: 150 },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            .subtract(2, 'week')
            .subtract(1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        fieldName: 'departmentId',
        label: '院区',
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        fieldName: 'warehouseId',
        label: '发货仓库',
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
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },

        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          async trigger(values: any) {
            const cond = !!(
              chcGridApi.formApi && chcGridApi.formApi.getFieldComponentRef
            );

            if (cond) {
              const warehouseIdRef =
                chcGridApi.formApi?.getFieldComponentRef<
                  InstanceType<typeof ChcSelect>
                >('warehouseId');
              if (warehouseIdRef) {
                if (values?.departmentId) {
                  warehouseIdRef.params.dependencies = {
                    departmentId: values.departmentId,
                    regionId: values.departmentId,
                  };
                  const selectOptions = await warehouseIdRef.fetchApi();
                  console.log('selectOptions:', selectOptions);
                  // 选第一个不是全部的id
                  const item = selectOptions.filter(
                    (o: Record<string, any>) => !isEmpty(o?.id),
                  )?.[0];
                  chcGridApi.formApi?.setFieldValue(
                    'warehouseId',
                    item?.id || undefined,
                  );
                  if (!isFirstLoaded.value) {
                    selectController.sign(1);
                  }
                } else {
                  warehouseIdRef.clearOptions();
                  chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                }
              }
            }
          },
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/bpartner.do?type=4',
            placeholder: '请选择申请单位',
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
        label: '申请单位',
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
      },
      // TOOD: medicine update productName To Input
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       allowClear: true,
      //       placeholder: '请选择药品',
      //       dictUrl: '/productAction/query.do',
      //       apiType: 'post',
      //       requestContentType: 'application/x-www-form-urlencoded',
      //       pageSize: 25,
      //       showSearch: true,
      //       filterField: 'productName',
      //       handleParams: (params: any) => {
      //         return {
      //           ...params,
      //           current: undefined,
      //           pageNum: params.current,
      //           pageSize: params.size,
      //           size: undefined,
      //         };
      //       },
      //       labelField: 'productName',
      //       valueField: 'productName',
      //       afterFetch: (res: any) => {
      //         return { ...res, rows: undefined, records: res.rows };
      //       },
      //     };
      //   },
      //   fieldName: 'productName',
      //   label: '药品',
      // },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=154',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择优先级`,
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
        fieldName: 'priorityRule',
        label: '优先级',
      },
      {
        component: 'Checkbox',
        defaultValue: false,
        fieldName: 'showPoPlaned',
        label: '显示已转采购',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        childTotal.value = 0;
        if (row && row.orderId) {
          parentTableParams.value.orderId = row.orderId;
          childGridApi.reload({ orderId: row.orderId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.orderId = undefined;
          childGridApi.grid.remove(childGridApi.grid.getFullData());
          // childGridApi.query({ orderId: row.orderId });
        }
      },
    },
    beforeFetchFn: (params) => {
      console.warn(params, 'beforeFetchFn');
      return {
        ...params,
        showPoPlaned: params.showPoPlaned ? 'Y' : undefined,
      };
    },
    afterFetchFn: (params) => {
      childTotal.value = 0;
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'EditModal-editModalApi': {
        closable: true,
        draggable: true,
        // 连接抽离的组件
        connectedComponent: EditModalComp,
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
// 转直配采购计划和转采购计划
const handleCreatePoPlan = (isOnly: string, isCrossDocking: string) => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择需要转采购的请领单！');
  }
  if (records.length > 1) {
    return message.error('一次只能转一个请领单！');
  }
  // 获取子表的所有数据
  const lineRecords = childGridApi.grid.getFullData();
  const params: { [key: string]: any } = {};
  let total = 0;
  const created: any[] = [];
  let error = false;
  let msg;
  params.warehouseId = records[0].warehouseId;
  params.isOnly = isOnly;
  params.isCrossDocking = isCrossDocking;
  lineRecords.forEach((record: any, index: number) => {
    // console.log('lineRecords:', record, params.warehouseId);
    if (!record.productId) {
      msg = `第${index + 1}选择行缺少商品！`;
      error = true;
      return;
    }
    if (!record.qtyPo) {
      return;
    }
    if (record.qtyPo <= 0) {
      return;
    }
    if (record.qtyPo > record.qtyLeft) {
      msg = `第${index + 1}选择行的缺货数量大于待发数量！`;
      error = true;
      return;
    }
    if (!isTheSame(record.warehouseId, params.warehouseId)) {
      msg = `第${index + 1}选择行的发货仓库与其他品种不一致！`;
      error = true;
      return;
    }
    if (
      isCrossDocking === 'Y' &&
      !(record.orderType === 'WO' || record.orderType === 'SO')
    ) {
      msg = `第${index + 1}非请领单，不可转直配采购！`;
      error = true;
      return;
    }

    created.push(record);
    total = total + 1;
  });
  if (error) {
    return message.error(`错误: ${msg}`);
  }
  if (total <= 0) {
    return message.error('请选择缺货品种生成采购计划！');
  }
  const lineData = { created };
  params.lineData = JSON.stringify(lineData);
  Modal.confirm({
    title: '提示',
    content: `确认创建${total}个品种的采购计划吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('orderPlanAction/creatOrderPlanByApply.do', params)
        .then(() => {
          chcGridApi.query();
        });
    },
    onCancel() {},
  });
};
// 点击指示
const handleCreate = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    return message.error('请选择需要指示的请领单！');
  }
  if (records.length > 1) {
    return message.error('一次只能指示一个请领单！');
  }
  // 获取子表的所有数据
  const lineRecords = childGridApi.grid.getFullData();
  const params: { [key: string]: any } = {};
  let error = false;
  let msg = '';
  params.orderId = records[0].orderId;

  const lineData = [];
  lineRecords.forEach((record: any, index: number) => {
    if (record.qtyProcess < 0) {
      message.error(`第${index + 1}行: 申请数量必须大于等于0！`);
      error = true;
      return;
    }
    if (record.qtyProcess > record.qtyOrdered) {
      msg = `第${index + 1}选择行的指示数量不能大于申请数量！`;
      error = true;
      return;
    }

    if (!isTheSame(record.orderId, records[0].orderId)) {
      msg = `第${index + 1}订单行不属于订单:${
        records[0].orderId
      } 请刷新后重新操作`;
      error = true;
      return;
    }
    if (!record.bpartnerId) {
      msg = `第${index + 1}订单行缺少申请单位`;
    }
    if (record.qtyProcess > 0) {
      lineData.push({
        orderLineId: record.orderLineId,
        qtyProcess: record.qtyProcess,
      });
    }
  });
  if (error) {
    return message.error(msg);
  }
  if (lineData.length === 0) {
    return message.error('请填写指示数量！');
  }
  const paramLine: any[] = [];
  lineRecords.forEach((data: any) => {
    const p: { [key: string]: any } = {};
    p.bpartnerId = data.bpartnerId;
    p.productId = data.productId;
    p.qty = data.qtyProcess;
    paramLine.push(p);
  });
  params.data = JSON.stringify(paramLine);
  requestFormClient
    .post('orderAction/preCheckOutLimitCheck.do?page=picklist', params)
    .then((res) => {
      if (res.isTips) {
        Modal.confirm({
          title: '提示',
          content: `${res.checkMsg}请确认是否继续指示！`,
          okText: '确认',
          cancelText: '取消',
          onOk() {
            outputApprove();
          },
          onCancel() {},
        });
      } else {
        outputApprove();
      }
    });
};
const outputApprove = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择需要指示的请领单！');
    return;
  }
  if (records.length > 1) {
    message.error('一次只能指示一个请领单！');
    return;
  }
  const params: { [key: string]: any } = {};
  params.orderId = records[0].orderId;
  // 获取子表的所有数据
  const lineRecords = childGridApi.grid.getFullData();
  const lineData: any[] = [];
  let error = false;
  let msg = '';
  let lackCount = 0;
  lineRecords.forEach((record: any, index: number) => {
    if (record.qtyProcess < 0) {
      message.error(`第${index + 1}行: 申请数量必须大于等于0！`);
      error = true;
      return;
    }
    if (record.qtyProcess > record.qtyOrdered) {
      msg = `第${index + 1}选择行的指示数量大于待发数量！`;
      error = true;
      return;
    }
    if (record.qtyProcess < record.qtyOrdered) {
      lackCount++;
    }

    if (!isTheSame(record.orderId, records[0].orderId)) {
      msg = `第${index + 1}订单行不属于订单:${
        records[0].orderId
      } 请刷新后重新操作`;
      error = true;
      return;
    }

    if (record.qtyProcess > 0) {
      lineData.push({
        orderLineId: record.orderLineId,
        qtyProcess: record.qtyProcess,
      });
    }
  });
  if (error) {
    return message.error(msg);
  }
  if (lineData.length === 0) {
    message.error('请填写指示数量！');
    return;
  }
  params.lineData = JSON.stringify(lineData);
  Modal.confirm({
    title: '提示',
    content:
      lackCount > 0
        ? `有${lackCount}笔未满足请领数量，确认指示吗?`
        : '确认指示吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('orderAction/outputApprove.do', params)
        .then((res) => {
          if (res.data && res.data.needPrint === 'Y') {
            // 提示打印拣货单
            Modal.confirm({
              title: '打印提示',
              content: `指示成功，拣货单号：${res.data.ids}，打印拣货单吗？`,
              okText: '确认',
              cancelText: '取消',
              onOk() {
                // 执行打印操作
                globalPrintStore.print({
                  pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/pickListAction/printPickListDoc.do?id=${res.data.ids.join(',')}`,
                });
              },
              onCancel() {},
            });
          } else {
            // 未打印就跳出了拣货单号
            message.success(`指示成功,拣货单号:${res.data.ids}`, 8000);
          }
          chcGridApi.query();
        });
    },
    onCancel() {},
  });
};
// 点击关闭
const handleClose = () => {
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (!records || records.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  const param: any[] = [];
  records.forEach((data: any) => {
    param.push(data.orderId);
  });
  Modal.confirm({
    title: '提示',
    content: `确认关闭吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('orderAction/close.do', { orderId: JSON.stringify(param) })
        .then(() => {
          message.success('关闭成功');
          chcGridApi.query();
        })
        .catch(() => {
          message.error('关闭失败');
        });
    },
    onCancel() {},
  });
};
const handleEdit = () => {
  editModalApi
    ?.setData({
      tableId: 'editModal1',
      lineData: chcGridApi.grid.getRadioRecord(true),
      handleRefreshTable: () => {
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
          <EditModal />
          <ChcGrid class="flex-1 overflow-hidden" />
        </template>
        <template #second>
          <ChildGrid>
            <template #qtyProcessDefault="scope">
              <InputNumber
                class="custom-text w-full"
                :min="0"
                v-model:value="scope.row.qtyProcess"
              />
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName_applyPickCreate"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search_applyPickCreate"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
            <template #bottom>
              <div class="flex items-center pt-[10px]">
                <div class="text-[13px]">共 {{ childTotal }} 条记录</div>
                <div class="flex flex-1 items-center justify-center">
                  <div class="flex gap-[10px]">
                    <Button
                      type="primary"
                      @click="handleCreatePoPlan('Y', 'Y')"
                      data-testid="button_createPoPlan_Y_applyPickCreate"
                    >
                      转直配采购计划
                      <template #icon>
                        <ResetActionIcon />
                      </template>
                    </Button>
                    <Button
                      type="primary"
                      @click="handleCreatePoPlan('N', 'N')"
                      data-testid="button_createPoPlan_N_applyPickCreate"
                    >
                      转采购计划
                      <template #icon>
                        <ResetActionIcon />
                      </template>
                    </Button>
                    <Button
                      type="primary"
                      @click="handleCreate"
                      data-testid="button_create_applyPickCreate"
                    >
                      指示
                      <template #icon>
                        <SvgSquareTickIcon />
                      </template>
                    </Button>
                    <Button
                      type="primary"
                      @click="handleEdit"
                      data-testid="button_edit_applyPickCreate"
                    >
                      修改
                      <template #icon>
                        <SvgSaveIcon />
                      </template>
                    </Button>
                    <Button
                      type="primary"
                      danger
                      @click="handleClose"
                      data-testid="button_close_applyPickCreate"
                    >
                      关闭
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

.custom-text {
  ::v-deep(.ant-input-number-input) {
    text-align: right;

    &:focus {
      text-align: center;
    }
  }
}
</style>

<script setup lang="ts">
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  ExportActionIcon,
  ResetActionIcon,
  SvgBatchJobIcon,
  SvgCloseIcon,
  SvgGearIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';

import { Button, InputNumber, message, Modal } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';
import { isTheSame } from '#/utils/util';

import DescriptionModalComp from './descriptionModal.vue';
import { gridColumns } from './options';
import ScatterCreateComp from './scatterCreate.vue';
import Summarize from './summarize.vue';
import dayjs from 'dayjs';
import { isEmpty } from '@vben/utils';
import { ChcSelect } from '@vben/chc-ui';
import LazySearch from '#/utils/LazySearch';
const route = useRoute();
const globalPrintStore = useGlobalPrintStore();
const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
const extParams = ref<{
  // approvalStatus?: string;
  // commitStatus?: string;
  // isGift?: string;
}>({
  // commitStatus: "'CO'",
  // approvalStatus: "'WA'",
  // isGift: 'N',
});

const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const handleFormReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};

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
const [
  ChcGrid,
  chcGridApi,
  {
    handleExport,
    DescriptionModal,
    descriptionModalApi,
    ScatterCreateModal,
    scatterCreateModalApi,
  },
] = useSpdGrid(
  {
    formOptions: {
      handleSubmit: handleFormSubmit,
      handleReset: handleFormReset,
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
      // virtualYConfig: {
      //   enabled: false,
      // },
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      stripe: false,
      cellStyle: ({ column }: { column: any }) => {
        if (column.field === 'qtyProcess') {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
    },
    // 添加表格事件监听
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: ({ records }: { records: any[] }) => {
        summarizeRef.value.refreshNumber(records);
      },
      // 全选/全不选事件
      checkboxAll: ({ checked }: any) => {
        if (checked) {
          summarizeRef.value.refreshNumber(
            chcGridApi.grid.getCheckboxRecords(),
          );
        } else {
          summarizeRef.value.refreshNumber([]);
        }
      },
      radioChange: ({ row }: any) => {
        if (row) {
          chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
          summarizeRef.value.refreshNumber([row]);
        }
      },
    },
  },
  {
    gridColumns,
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date', // 默认实际查询参数 dateFrom，dateTo
        label: '申请时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(7, 'year')
            .subtract(8, 'day')
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
            paginate: false,
            showChooseAll: '',
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            triggerFields: ['departmentId', 'regionId'],
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
      // TODO:medicine add Input 药品名称
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
        componentProps: {
          placeholder: '请输入药品名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'orderNo',
        label: '申请单号',
        componentProps: {
          placeholder: '请输入申请单号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/orderAction/outputOrderTypeList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择入库类型',
            paginate: false,
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
        defaultValue: '',
        fieldName: 'orderType',
        label: '申请类型',
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
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'priorityRule',
        label: '优先级',
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
            paginate: false,
            showSearch: true,
            placeholder: `请选择是否高值`,
            filterByFrontEnd: true,
          };
        },
        defaultValue: '',
        fieldName: 'isPrecious',
        label: '是否高值',
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
            paginate: false,
            showSearch: true,
            placeholder: `请选择有无库存`,
            filterByFrontEnd: true,
          };
        },
        defaultValue: '',
        fieldName: 'hasStorage',
        label: '库存',
      },
      {
        component: 'Checkbox',
        defaultValue: false,
        fieldName: 'showPoPlaned',
        label: '包含已转采购',
      },
      {
        component: 'Input',
        fieldName: 'manufacturer',
        label: '厂家',
        componentProps: {
          placeholder: '请输入厂家',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: `请选择默认供应商`,
            paginate: false,
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
        defaultValue: '',
        fieldName: 'defaultVendorId',
        label: '默认供应商',
      },
    ],
    dataTableId: '/orderAction/queryOutputApprove.do?specShowType=from',
    showCustomBtn: true,
    showZoomBtn: true,
    id: 'main',
    autoSelectFirstRow: false,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      console.warn(params, 'beforeFetchFn');
      return {
        ...params,
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
        showPoPlaned: params.showPoPlaned ? 'Y' : undefined,
        start: undefined,
        limit: 0,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'DescriptionModal-descriptionModalApi': {
        // 连接抽离的组件
        connectedComponent: DescriptionModalComp,
      },
      'ScatterCreateModal-scatterCreateModalApi': {
        connectedComponent: ScatterCreateComp,
      },
    },
  },
);
const summarizeRef = ref();
const calculateSelectedAmount = (selectedRows: any[]) => {
  const totalQtyLeft = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.qtyLeft) || 0);
  }, 0);

  const totalQtyProcess = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.qtyProcess) || 0);
  }, 0);

  const totalQtyPo = selectedRows.reduce((sum, row) => {
    return sum + (Number.parseFloat(row.qtyPo) || 0);
  }, 0);
  return {
    totalQtyLeft,
    totalQtyProcess,
    totalQtyPo,
  };
};

// 转直配采购计划
const handleCreateCrossDockingPoPlan = () => {
  const records = chcGridApi.grid.getCheckboxRecords();
  if (!records || records.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  const params: { data: string } = {
    data: '',
  };
  // 获取从表数据
  const paramLine: any[] = [];
  records.forEach((data: any) => {
    if (data.qtyProcess > 0) {
      const p: { [key: string]: any } = {};
      p.bpartnerId = data.bpartnerId;
      p.productId = data.productId;
      p.qty = data.qtyPo;
      paramLine.push(p);
    }
  });
  params.data = JSON.stringify(paramLine);
  requestFormClient
    .post(
      'orderAction/preCheckOutLimitCheck.do?page=createCrossDockingPoPlan',
      params,
    )
    .then((res) => {
      if (res.isTips) {
        Modal.confirm({
          title: '提示',
          content: `${res.checkMsg}请确认是否继续指示！`,
          okText: '确认',
          cancelText: '取消',
          onOk() {
            createPoPlan('Y', 'Y');
          },
        });
      } else {
        createPoPlan('Y', 'Y');
      }
    });
};
const createPoPlan = (isOnly: string, isCrossDocking: string) => {
  const records = chcGridApi.grid.getCheckboxRecords();
  if (!records || records.length === 0) {
    message.error('请选择记录！');
    return;
  }
  const params: { [key: string]: any } = {};
  let total = 0;
  const created: any[] = [];
  let error = false;
  let msg;
  params.warehouseId = records[0].warehouseId;
  params.isOnly = isOnly;
  params.isQtyByQtyOrdered = urlParams.isQtyByQtyOrdered;
  params.isCrossDocking = isCrossDocking;
  records.forEach((record: any, index: number) => {
    if (!record.productId) {
      msg = `第${index + 1}选择行缺少商品！`;
      error = true;
      return;
    }
    if (!record.qtyPo && urlParams.isQtyByQtyOrdered !== 'Y') {
      //	 			msg = ('第' + (index+1)+"选择行缺少计划采购数量！");
      //	 			error = true;
      return;
    }
    if (record.qtyPo <= 0 && urlParams.isQtyByQtyOrdered !== 'Y') {
      //	 			msg =('第' + (index+1)+"选择行的计划采购数量小于等于0！");
      //	 			error = true;
      return;
    }
    if (record.qtyPo > record.qtyLeft && urlParams.isQtyByQtyOrdered !== 'Y') {
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
      msg = `第${index + 1}选择行，非请领单，不可转直配采购！`;
      error = true;
      return;
    }

    created.push(record);
    total = total + 1;
  });
  if (error) {
    message.error(`错误: ${msg}`);
    return;
  }
  if (total <= 0) {
    message.error('请选择缺货品种生成采购计划！');
    return;
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
          message.success('创建采购计划成功！');
          handleFormSubmit(); // 刷新表格
        });
    },
  });
};
const handleOk = () => {
  const records = chcGridApi.grid.getCheckboxRecords();
  if (!records || records.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  const params: { [key: string]: any } = {};
  // 获取从表数据
  const paramLine: any[] = [];
  records.forEach((data: any) => {
    if (data.qtyProcess > 0) {
      const p: { [key: string]: any } = {};
      p.bpartnerId = data.bpartnerId;
      p.productId = data.productId;
      p.qty = data.qtyProcess;
      paramLine.push(p);
    }
  });
  // $.each(records, (i, data) => {
  //   if (data.qtyProcess > 0) {
  //     const p = {};
  //     p.bpartnerId = data.bpartnerId;
  //     p.productId = data.productId;
  //     p.qty = data.qtyProcess;
  //     paramLine.push(p);
  //   }
  // });
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
            outputApproveLine();
          },
        });
      } else {
        outputApproveLine();
      }
    });
};
const outputApproveLine = () => {
  const records = chcGridApi.grid.getCheckboxRecords();
  if (!records || records.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  const params: { [key: string]: any } = {};
  // 获取从表数据
  const paramLine: any[] = [];
  // let zeroQtyCount: number = 0;
  records.forEach((data: any) => {
    if (data.qtyProcess > 0) {
      const p: { [key: string]: any } = {};
      p.orderLineId = data.orderLineId;
      p.qtyProcess = data.qtyProcess;
      p.rejectReason = data.rejectReason;
      // p.deliveryDateConfirmed = data.deliveryDateConfirmed;
      paramLine.push(p);
    } else {
      // zeroQtyCount++;
    }
  });
  if (paramLine.length === 0) {
    message.error('请填写指示数量！');
    return;
  }
  params.lineData = JSON.stringify(paramLine);
  Modal.confirm({
    title: '提示',
    content: '确认下达出库指示吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('orderAction/outputApproveLine.do', params)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            Modal.confirm({
              title: '打印提示',
              content: '指示成功，打印拣货单吗？',
              okText: '确认',
              cancelText: '取消',
              onOk() {
                // 执行打印操作
                // 执行打印操作
                globalPrintStore.print({
                  pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/pickListAction/printPickListDoc.do?id=${res.data.join(',')}`,
                });
              },
            });
          }
          handleFormSubmit(); // 刷新表格
        });
    },
  });
};
const handleReject = () => {
  const records = chcGridApi.grid.getCheckboxRecords();

  if (!records || records.length === 0) {
    message.error('请选择一条记录');
    return;
  }
  const paramLine: any[] = [];
  records.forEach((data: any) => {
    paramLine.push(data.orderLineId);
  });
  descriptionModalApi
    ?.setData({
      paramLine,
      callBack: (formValues: any) => {
        // console.log(formValues, paramLine, {
        //   ...formValues,
        //   paramLine: JSON.stringify(paramLine),
        // });
        return new Promise((resolve, reject) => {
          requestFormClient
            .post('/orderAction/closeLine.do', {
              ...formValues,
              orderLineId: JSON.stringify(paramLine),
            })
            .then((res) => {
              message.success('订单关闭成功');
              handleFormSubmit(); // 刷新表格
              resolve(res);
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
    })
    .open();
};
// 散件加工
const handleScatterCreate = () => {
  const records = chcGridApi.grid.getCheckboxRecords();
  if (!records || records.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  if (records.length > 1) {
    message.error('只能选择一条记录加工！');
    return;
  }

  if (!records[0].replenishPackageQty || records[0].replenishPackageQty <= 0) {
    message.error('非定数请领，不能加工，请到【散货加工】菜单内加工');
    return;
  }
  scatterCreateModalApi
    ?.setData({
      lineData: records[0],
      tableId: 'editModal',
      handleRefreshTable: () => {
        chcGridApi.query();
      },
    })
    .open();
};
// 批量加工
const handleBatchScatterCreate = () => {
  const records = chcGridApi.grid.getCheckboxRecords();
  if (!records || records.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  let flag = false;
  records.forEach((data: any, i: number) => {
    if (!data.replenishPackageQty || data.replenishPackageQty <= 0) {
      message.error(
        `第${i + 1}行商品【${data.productCode}/${
          data.productName
        }】非定数请领，不能批量加工!`,
      );
      flag = true;
    }
  });

  if (flag) {
    return;
  }

  const params: { [key: string]: any } = {};
  // 获取从表数据
  const paramLine: any[] = [];
  records.forEach((data: any) => {
    paramLine.push(data);
  });

  params.data = JSON.stringify(paramLine);
  Modal.confirm({
    title: '提示',
    content: '确认批量加工包装吗？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      requestFormClient
        .post('packageAction/batchCreatePackageByPackageQty.do', params)
        .then((res) => {
          if (res.data && res.data.length > 0) {
            Modal.confirm({
              title: '打印提示',
              content: '加工成功,确认打印？',
              okText: '确认',
              cancelText: '取消',
              onOk() {
                // 执行打印操作
              },
              onCancel() {},
            });

            handleFormSubmit(); // 刷新表格
          } else {
            message.error('缺少散件库存！');
          }
        });
    },
  });
};
</script>
<template>
  <Page content-class="p-[0.75rem]" auto-content-height>
    <DescriptionModal />
    <ScatterCreateModal />
    <ChcGrid>
      <template #qtyProcessDefault="scope">
        <InputNumber
          v-model:value="scope.row.qtyProcess"
          class="w-full"
          :data-testid="`inputNumber_qtyProcess_${scope.rowIndex}_applyPick`"
        />
      </template>
      <template #toolbar-tools>
        <Summarize
          ref="summarizeRef"
          :calculate-selected-amount="calculateSelectedAmount"
        />
      </template>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleScatterCreate"
          data-testid="button_scatterCreate_applyPick"
        >
          散件加工
          <template #icon>
            <SvgGearIcon />
          </template>
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleBatchScatterCreate"
          data-testid="button_batchScatterCreate_applyPick"
        >
          批量加工
          <template #icon>
            <SvgBatchJobIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_applyPick"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template>
      <template #bottom>
        <div class="flex items-center justify-center pt-[10px]">
          <div class="flex gap-[10px]">
            <Button
              type="primary"
              @click="handleCreateCrossDockingPoPlan"
              data-testid="button_crossDockingPoPlan_applyPick"
            >
              转直配采购计划
              <template #icon>
                <ResetActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="createPoPlan('N', 'N')"
              data-testid="button_poPlan_N_applyPick"
            >
              转采购计划
              <template #icon>
                <ResetActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="createPoPlan('Y', 'N')"
              data-testid="button_poPlan_Y_applyPick"
            >
              转单独采购计划
              <template #icon>
                <ResetActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleOk"
              data-testid="button_ok_applyPick"
            >
              指示出库
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button>

            <Button
              type="primary"
              danger
              @click="handleReject"
              data-testid="button_reject_applyPick"
            >
              关闭申请
              <template #icon>
                <SvgCloseIcon />
              </template>
            </Button>
          </div>
        </div>
      </template>
    </ChcGrid>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  /* visibility: hidden; */
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

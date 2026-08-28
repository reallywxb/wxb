<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

const route = useRoute();

const userStore = useUserStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const page = urlParams?.page;
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 创建响应式变量用于院区接口的hospitalId参数传递
// @description 创建extraParams响应式对象，用于动态传递hospitalId参数到院区接口
const departmentExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});
// AI-GENERATED-END
// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 参考orderManage页面添加父表选中行变量和查询子表函数
// @description 创建parentTableCheckedRow存储父表选中的行数据，queryChildGrid函数用于触发子表查询
const parentTableCheckedRow = ref<Record<string, any>>({});
function queryChildGrid(orderLineId?: string) {
  ChildChcGridApi.query({ orderLineId });
}
// AI-GENERATED-END

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  setTimeout(() => {
    // 触发自动查询
    searchController.sign();
  }, 200);
  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'orderdetailManagement',
    // api地址
    queryUrl: '/ygcgProductAction/queryOrderLine.do',
    showRadioRowTag: true,
    gridColumns: [
      {
        title: '单选',
        type: 'radio',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
      },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'orgName',
        title: '客户名称',
        width: '160',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库名称',
        width: '130',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '供应商名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'documentNo',
        title: '单据号',
        width: '100',
        sortable: true,
      },
      {
        field: 'orderPlanNo',
        title: '采购计划号',
        width: '100',
        sortable: true,
      },
      {
        field: 'dateOrdered',
        title: '订单日期',
        width: '100',
        sortable: true,
      },
      {
        field: 'totalAmt',
        title: '金额',
        width: '100',
        align: 'right',
        sortable: true,
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'ygcgOrderId',
        title: '平台订单号',
        width: '150',
        sortable: true,
      },
      {
        field: 'ygcgOrderStatusName',
        title: '平台订单状态',
        width: '120',
        sortable: true,
      },
      {
        field: 'ygcgOrderTime',
        title: '平台订单时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'orderTypeName',
        title: '单据类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'receiptTypeName',
        title: '采购类型',
        width: '100',
        sortable: true,
      },
      {
        field: 'productCode',
        title: '药品编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'provinceId',
        title: '省标编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'medicineName',
        title: '通用名称',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '75',
        sortable: true,
      },
      {
        field: 'qtyOrdered',
        title: '数量',
        width: '80',
        align: 'right',
        sortable: true,
      },
      {
        field: 'pricepo',
        title: '单价',
        width: '90',
        align: 'right',

        sortable: true,
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'ygcgprice',
        title: '省标价格',
        width: '90',
        align: 'right',
        sortable: true,
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'lineAmt',
        title: '金额',
        width: '100',
        align: 'right',
        sortable: true,
        formatter({ cellValue }) {
          return handlePriceToFixedTwo(cellValue);
        },
      },
      {
        field: 'ygcgOrderLineStatusName',
        title: '平台订单行状态',
        width: '140',
        align: 'right',
        sortable: true,
      },
      {
        field: 'ygcgOrderLineId',
        title: '平台订单行号',
        width: '150',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lineDescription',
        title: '备注',
        width: '150',
        sortable: true,
        visible: false,
      },
      {
        field: 'description',
        title: '备注',
        width: '150',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '订单日期',
        defaultValue: [
          // 2天前
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(2, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'vendorId',
        label: '供应商',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/vendor.do',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'orgId',
        label: '医院',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/orgList.do',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'departmentId',
        label: '院区',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            // AI-GENERATED-BEGIN
            // @date 2026-07-16
            // @prompt 使用extraParams传递hospitalId参数到院区接口
            // @description 配置extraParams为响应式对象，使接口能够接收到hospitalId参数
            extraParams: departmentExtraParams.value,
            // AI-GENERATED-END
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // AI-GENERATED-BEGIN
        // @date 2026-07-16
        // @prompt 实现院区与医院的联动
        // @description 使用dependencies配置联动逻辑，当orgId变化时更新院区接口的hospitalId参数并重新获取数据
        dependencies: {
          triggerFields: ['orgId'],
          trigger(values: any) {
            nextTick(() => {
              const cond =
                ChcGridApi.formApi?.getFieldComponentRef &&
                typeof ChcGridApi.formApi?.getFieldComponentRef ===
                  'function' &&
                ChcGridApi.formApi?.getFieldComponentRef('departmentId') &&
                ChcGridApi.formApi?.getFieldComponentRef('departmentId').params;
              if (cond) {
                // 更新extraParams中的hospitalId
                departmentExtraParams.value.hospitalId = values?.orgId || -1;
                // 设置依赖参数
                ChcGridApi.formApi.getFieldComponentRef(
                  'departmentId',
                ).params.dependencies = {
                  hospitalId: values?.orgId || -1,
                };
                // 重新调用接口获取数据
                ChcGridApi.formApi
                  ?.getFieldComponentRef('departmentId')
                  ?.fetchApi();
                // 清空院区字段已选择的值
                ChcGridApi.formApi?.setFieldValue('departmentId', '');
              }
            });
          },
        },
        // AI-GENERATED-END
      },
      {
        component: 'ChcSelect',
        fieldName: 'warehouseId',
        label: '采购仓库',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择采购仓库',
            paginate: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              const rows =
                res.rows?.filter((item: any) => item.warehouseType === '1') ||
                [];
              return { ...res, rows: undefined, records: rows };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'ygcgOrderStatus',
        label: '平台状态',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000639',
            placeholder: '',
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
      },
      {
        component: 'ChcSelect',
        fieldName: 'ygcgOrderLineStatus',
        label: '平台行状态',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000639',
            placeholder: '',
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
      },
      {
        component: 'ChcSelect',
        fieldName: 'productCategoryId',
        label: '商品类别',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/productCategoryList.do',
            placeholder: '',
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
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'documentNo',
        label: '订单号',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'ygcgOrderId',
        label: '平台订单号',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'ygcgOrderLineId',
        label: '平台订单行号',
        componentProps: () => {
          return {};
        },
      },
      {
        component: 'Input',
        fieldName: 'description',
        label: '订单备注',
        componentProps: () => {
          return {};
        },
      },
    ],
    gridEvents: {
      // AI-GENERATED-BEGIN
      // @date 2026-07-16
      // @prompt 参考orderManage页面添加radioChange事件处理，用于单选框变化时触发子表查询
      // @description 当父表选中行变化时，触发子表查询并传递选中行的参数
      radioChange: async ({ row }: { row: any }) => {
        if (row) {
          parentTableCheckedRow.value = row;
          queryChildGrid(row.orderLineId);
          const formValues = ChildChcGridApi.formApi?.getValues();
          ChildChcGridApi.reload({ ...formValues });
        } else {
          parentTableCheckedRow.value = {};
          ChildChcGridApi.grid.reloadData([]);
        }
      },
      // AI-GENERATED-END
    },
    tableSearchExtraParams: {
      page,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 参考orderManage页面添加子表配置，使用相同的接口
// @description 创建子表格实例，用于显示订单行明细数据，查询项为商品
const [ChildChcGrid, ChildChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: true,
      },
      radioConfig: {
        // trigger: 'row',
        highlight: false,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'orderdetail_child',
    queryUrl: '/ygcgProductAction/queryOrderLineDistribute.do',
    gridColumns: [
      // {
      //   type: 'checkbox',
      //   width: 50,
      //   align: 'center',
      // },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'orgName',
        title: '客户名称',
        width: '160',
        sortable: false,
      },
      {
        field: 'departmentName',
        title: '院区',
        width: '150',
        sortable: false,
      },
      {
        field: 'distributedNo',
        title: '平台配送单号',
        width: '150',
        sortable: true,
      },
      {
        field: 'asnNo',
        title: 'SPD配送单号',
        width: '150',
        sortable: true,
      },
      {
        field: 'inoutLineId',
        title: 'SPD配送行号',
        width: '150',
        sortable: true,
      },
      {
        field: 'ygcgOrderLineId',
        title: '平台订单行号',
        width: '150',
        sortable: true,
      },
      {
        field: 'ygcgOrderId',
        title: '平台订单号',
        width: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库名称',
        width: '130',
        sortable: false,
      },
      {
        field: 'provinceId',
        title: '省标代码',
        width: '150',
        sortable: false,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: '150',
        sortable: false,
      },
      {
        field: 'manufacturer',
        title: '生产厂家',
        width: '150',
        sortable: true,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: '150',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: '90',
        sortable: false,
      },
      {
        field: 'uomName',
        title: '单位',
        width: '75',
        sortable: false,
      },
      {
        field: 'lot',
        title: '批号',
        width: '120',
        sortable: false,
      },
      {
        field: 'price',
        title: '价格',
        width: '90',
        align: 'right',
        sortable: true,
        // formatter({ cellValue }) {
        //   return handlePriceToFixedTwo(cellValue);
        // },
      },
      {
        field: 'taxInvoiceNo',
        title: '发票号',
        width: '150',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: '120',
        sortable: true,
      },
      {
        field: 'distributeCount',
        title: '配送数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'distributeTime',
        title: '配送时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'movementqty',
        title: 'SPD配送数量',
        width: '120',
        align: 'right',
        sortable: true,
      },
      {
        field: 'warehouseCount',
        title: '收货数量',
        width: '100',
        align: 'right',
        sortable: true,
      },
      {
        field: 'warehouseTime',
        title: '收货时间',
        width: '150',
        sortable: true,
      },
      {
        field: 'pickStatus',
        title: '匹配状态',
        width: '100',
        sortable: false,
      },
      {
        field: 'pickProgress',
        title: '匹配进度',
        width: '100',
        sortable: false,
      },
      {
        field: 'receiveStatus',
        title: '回传状态',
        width: '100',
        sortable: false,
        formatter: ({ row }: any) => {
          return row.isReturn === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'receiveTime',
        title: '回传时间',
        width: '100',
        sortable: true,
      },
      {
        field: 'isRate',
        title: '7002',
        width: '100',
        sortable: false,
        formatter: ({ row }: any) => {
          return row.isRate === 'Y' ? '已生成' : '未生成';
        },
      },
    ],
    // 表单配置 - 只保留商品查询项
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品名称',
        componentProps: () => {
          return {
            placeholder: '请输入药品名称',
            allowClear: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'lot',
        label: '批号',
        componentProps: () => {
          return {
            placeholder: '请输入批号',
            allowClear: true,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'taxInvoiceNo',
        label: '发票号',
        componentProps: () => {
          return {
            placeholder: '请输入发票号',
            allowClear: true,
          };
        },
      },
    ],
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      // 将父表的查询参数传递给子表
      const formValues = ChcGridApi.formApi?.getValues() || {};
      // 检查是否有父表选中的orderLineId
      if (isEmpty(parentTableCheckedRow.value)) {
        message.warning('请先选择父表数据');
        return false;
      }
      return {
        ...params,
        ...formValues,
        orderLineId: parentTableCheckedRow.value.orderLineId,
      };
    },
    afterFetchFn: (params: any) => {
      console.warn('ChildChcGrid afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 添加获取配送信息方法，使用单选模式获取选中行
// @description 处理获取配送信息操作，验证医院选择并获取选中行的orderId参数
const handleDeliveryInfo = async () => {
  // const formValues = await ChcGridApi.formApi.getValues();
  // if (!formValues.orgId) {
  //   return message.warning('请先选择医院再进行操作');
  // }
  const row = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(row);
  console.warn('handleDeliveryInfo row:', row);
  console.warn('handleDeliveryInfo rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择一条数据');
    return;
  }

  const orderLineIds = rawRows.map((row: any) => row.orderLineId).join(',');
  const params = {
    orderLineId: orderLineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认获取配送信息吗?`,
    onOk: async () => {
      try {
        console.warn('handleDeliveryInfo params:', params);
        await requestFormClient
          .post('/ygcgProductAction/getOrderLineDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '获取成功');
              ChcGridApi.query();
            }
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 参考ygDelivery页面，为子表添加阳光收货回传、阳光收货匹配、生成网采率7002三个方法
// @description 添加子表的三个操作方法，使用多选模式获取选中行的productId参数
const handleRecive = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn(' rows:', rows);
  console.warn(' rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ygcgOrderlineIds = rawRows
    .map((row: any) => row.ygcgOrderLineId)
    .join(',');
  const params = {
    ygcgOrderlineId: ygcgOrderlineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认收货回传吗?`,
    onOk: async () => {
      try {
        console.warn('params:', params);
        await requestFormClient
          .post('/ygcgProductAction/returnDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '收货回传成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
          });
      } catch (error) {
        console.error('收货回传失败', error);
      }
    },
  });
};
const handleMatch = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleChildMatch rows:', rows);
  console.warn('handleChildMatch rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ygcgOrderlineIds = rawRows
    .map((row: any) => row.ygcgOrderLineId)
    .join(',');
  const params = {
    ygcgOrderlineId: ygcgOrderlineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认匹配吗?`,
    onOk: async () => {
      try {
        console.warn('handleChildMatch params:', params);
        await requestFormClient
          .post('/ygcgProductAction/pickDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '匹配成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
          });
      } catch (error) {
        console.error('匹配失败', error);
      }
    },
  });
};
const handleOnlineRate = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleChildOnlineRate rows:', rows);
  console.warn('handleChildOnlineRate rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ygcgOrderLineIds = rawRows
    .map((row: any) => row.ygcgOrderLineId)
    .join(',');
  const params = {
    ygcgOrderlineId: ygcgOrderLineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认生成网采率吗?`,
    onOk: async () => {
      try {
        console.warn('handleChildOnlineRate params:', params);
        await requestFormClient
          .post('/ygcgProductAction/createRate.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
          });
      } catch (error) {
        console.error('生成网采率失败', error);
      }
    },
  });
};
const handleCHS = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleChildCHS rows:', rows);
  console.warn('handleChildCHS rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const ygcgOrderLineIds = rawRows
    .map((row: any) => row.ygcgOrderLineId)
    .join(',');
  const params = {
    ygcgOrderlineId: ygcgOrderLineIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认生成医保局3502吗?`,
    onOk: async () => {
      try {
        console.warn('handleChildCHS params:', params);
        await requestFormClient
          .post('/ygcgProductAction/create.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
const handleProcess = async () => {
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleChildCHS rows:', rows);
  console.warn('handleChildCHS rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }

  const sends: any = [];
  rawRows.forEach((row) => {
    sends.push({
      orderLineId: row.orderLineId,
    });
  });
  const params: Record<string, any> = {};
  params.data = JSON.stringify(sends);
  params.operation = 'process';

  Modal.confirm({
    title: '提示',
    content: `确认平台已验收?`,
    onOk: async () => {
      try {
        console.warn('handleChildCHS params:', params);
        await requestFormClient
          .post('/ygcgProductAction/lineOperation.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChildChcGridApi.query({
              orderLineId: parentTableCheckedRow.value.orderLineId,
            });
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};

// AI-GENERATED-END
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleExport"
              class="mr-[0.5rem]"
              data-testid="button_export"
            >
              导 出
              <template #icon>
                <ExportActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleDeliveryInfo"
              class="mr-[0.5rem]"
              data-testid="button_match"
            >
              获取配送信息
            </Button>
            <Button
              type="primary"
              @click="handleMatch"
              class="mr-[0.5rem]"
              data-testid="button_child_match"
            >
              阳光收货匹配
            </Button>
            <Button
              type="primary"
              @click="handleRecive"
              class="mr-[0.5rem]"
              data-testid="button_child_recive"
            >
              阳光收货回传
            </Button>
            <Button
              type="primary"
              @click="handleOnlineRate"
              class="mr-[0.5rem]"
              data-testid="button_child_online_rate"
            >
              生成网采率7002
            </Button>
            <Button
              type="primary"
              @click="handleCHS"
              class="mr-[0.5rem]"
              data-testid="button_child_chs"
            >
              生成医保局3502
            </Button>
            <Button
              type="primary"
              @click="handleProcess"
              class="mr-[0.5rem]"
              data-testid="button_process"
            >
              平台已验收
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <ChildChcGrid />
      </template>
    </PageSplitLazy>
  </Page>
</template>

<style lang="less" scoped>
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

import type { GridColumn } from '@vben/chc-ui';

import type { VbenFormProps } from '#/adapter/form';

import dayjs from 'dayjs';

export const gridColumns: GridColumn[] = [
  {
    field: 'index',
    title: '序号',
    width: 50,
    align: 'center',
    formatter(scope: any) {
      return scope.rowIndex + 1;
    },
  },
  { type: 'radio', title: '单选', width: 50, align: 'center', visible: false },
  { type: 'checkbox', title: '多选', width: 50, align: 'center' },
  {
    field: 'priorityRuleName',
    minWidth: 80,
    sortable: true,
    title: '优先级',
  },
  {
    field: 'bpartnerName',
    minWidth: 110,
    sortable: true,
    title: '申请单位',
  },
  {
    field: 'warehouseName',
    title: '发货仓库',
    minWidth: '110',
    sortable: true,
  },
  {
    field: 'productName',
    minWidth: 200,
    sortable: true,
    title: '药品编码/名称',
    formatter({ row }: any) {
      return `${row.productCode}/${row.productName}`;
    },
  },
  {
    field: 'insurance',
    minWidth: 150,
    sortable: true,
    title: '医保药品编码',
  },
  {
    field: 'standardCode',
    minWidth: 120,
    sortable: true,
    title: '贯标编码',
    visible: false, // TODO:medicine cancel
  },
  {
    field: 'productSpec',
    minWidth: 90,
    title: '规格',
    formatter({ row }: any) {
      return (
        row.productSpec +
        (row.modelNo && row.modelNo !== row.productSpec
          ? `/${row.modelNo}`
          : '')
      );
    },
  },
  {
    field: 'manufacturer',
    minWidth: 100,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'uomName',
    minWidth: 40,
    title: '单位',
  },
  {
    field: 'replenishPackageQty',
    minWidth: 40,
    title: '定数',
    formatter({ row }: any) {
      return row.isPackaged === 'Y' ? row.replenishPackageQty : '-';
    },
    align: 'right',
    visible: false, // TODO:medicine cancel
  },
  {
    field: 'defaultVendorName',
    minWidth: 100,
    title: '默认供应商',
  },
  {
    field: 'qtyLeft',
    minWidth: 65,
    title: '待发数量',
    align: 'right',
  },
  {
    field: 'qtyProcess',
    minWidth: 70,
    title: '指示数量',
    align: 'right',
    slots: {
      default: 'qtyProcessDefault',
    },
  },
  {
    field: 'qtyPo',
    minWidth: 65,
    title: '缺货数量',
    align: 'right',
  },
  {
    field: 'qtyOnHand',
    minWidth: 65,
    title: '可用数量',
    align: 'right',
    formatter({ row }: any) {
      return !row.qtyOnHand || row.qtyOnHand <= 0 ? '无' : row.qtyOnHand;
    },
  },
  {
    field: 'storageQty',
    minWidth: 60,
    title: '总库存',
    align: 'right',
  },
  {
    field: 'qtyOrdered',
    minWidth: 65,
    title: '申请数量',
    align: 'right',
  },
  {
    field: 'qtyProcessed',
    minWidth: 80,
    title: '已指示数量',
    align: 'right',
  },
  {
    field: 'qtyPoPlaned',
    minWidth: 80,
    title: '转采购数量',
    align: 'right',
  },
  {
    field: 'requiredPackageCount',
    title: '申请包数',
    minWidth: '65',
    visible: false,
  },
  {
    field: 'bpartnerQty',
    title: '申请单位库存',
    width: '100',
    sortable: false,
    align: 'right',
  },
  {
    field: 'monthConsumeQty',
    title: '科室本月消耗',
    minWidth: '100',
    sortable: false,
    align: 'right',
  },
  {
    field: 'monthConsumeQtyMax',
    title: '科室月使用上限',
    minWidth: '110',
    sortable: false,
    align: 'right',
  },
  {
    field: 'alertMsg',
    title: '警示说明',
    formatter({ row: item }: any) {
      if (Number(item.monthConsumeQtyMax > 0)) {
        let bpartnerQty = 0;
        let monthConsumeQty = 0;
        if (item.bpartnerQty) {
          bpartnerQty = Number(item.bpartnerQty);
        }
        if (item.monthConsumeQty) {
          monthConsumeQty = Number(item.monthConsumeQty);
        }
        return bpartnerQty + monthConsumeQty + Number(item.qtyOrdered) >
          Number(item.monthConsumeQtyMax)
          ? '超过每月使用限量'
          : '';
      } else {
        return '';
      }
    },
    minWidth: '150',
    sortable: false,
  },
  {
    field: 'lot',
    title: '批号',
    minWidth: '120',
  },
  {
    field: 'guaranteeDate',
    title: '效期',
    minWidth: '120',
    sortable: false,
  },
  {
    field: 'deliveryPlanDate',
    title: '要求送达时间',
    visible: true,
    minWidth: '150',
    sortable: true,
  },
  {
    field: 'orderNo',
    title: '申请单号',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'orderTypeName',
    title: '申请类型',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'commitUserName',
    title: '申请人',
    minWidth: '100',
    sortable: true,
  },
  {
    field: 'dateOrdered',
    title: '申请时间',
    minWidth: '160',
    sortable: true,
  },
  {
    field: 'description',
    title: '备注',
    minWidth: '150',
    sortable: false,
  },
];

export const formSchema: VbenFormProps['schema'] = [
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
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        placeholder: '请选择院区',
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
    fieldName: 'departmentId',
    label: '院区',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
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
];

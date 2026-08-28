// import type { GridColumn } from '@vben/chc-ui';

import type { VbenFormProps } from '#/adapter/form';

import dayjs from 'dayjs';

// export const gridColumns: GridColumn[] = [
//   {
//     title: '序号',
//     width: 50,
//     align: 'center',
//     formatter(scope: any) {
//       return scope.rowIndex + 1;
//     },
//   },
//   { type: 'radio', title: '单选', width: 50, align: 'center', visible: false },
//   { type: 'checkbox', title: '多选', width: 50, align: 'center' },
//    {
// 				"field": "movementDate",
// 				"title": "出库时间",
// 				"minWidth": "160",
// 				"sortable": true
// 			}, {
// 				"field": "productCode",
// 				"title": "商品编码",
// 				"minWidth": "120",
// 				"sortable": true
// 			}, {
// 				"field": "productName",
// 				"title": "商品名称",
// 				"minWidth": "200",
// 				"sortable": true
// 			}, {
// 				"field": "productSpec",
// 				"title": "规格",
// 				"minWidth": "200",
// 				"sortable": true
// 			},{
// 				"field": "modelNo",
// 				"title": "型号",
// 				"minWidth": "200",
// 				"sortable": true
// 			}, {
// 				"field": "manufacturer",
// 				"title": "厂家",
// 				"minWidth": "200",
// 				"sortable": true
// 			},{
// 				"field": "insurance",
// 				"title": "医保编码",
// 				"minWidth": "150",
// 				"sortable": true
// 			},{
// 				"field": "standardCode",
// 				"title": "贯标编码",
// 				"minWidth": "150",
// 				"sortable": true
// 			},{
// 		    	  "field": "productControlLevelName",
// 		          "title": "管控类型",
// 		          // "hidden": !isProductControlLevel,
// 		          "minWidth": "100",
// 		          "sortable": true
// 		    }, {
// 				"field": "uomName",
// 				"title": "单位",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "movementQty",
// 				"title": "数量",
// 				"minWidth": "100",
// 				// "hover":true,
// 				"sortable": true
// 			}, {
// 				"field": "price",
// 				"title": "采购价",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "lineAmt",
// 				"title": "金额",
// 				"minWidth": "100",
// 				"sortable": true
// 			},{
// 				"field": "priceList",
// 				"title": "零售价",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "lineAmtPricelist",
// 				"title": "零售金额",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "lot",
// 				"title": "批号",
// 				"minWidth": "120",
// 				"sortable": true
// 			}, {
// 				"field": "guaranteeDate",
// 				"title": "效期",
// 				"minWidth": "120",
// 				"sortable": true
// 			}, {
// 				"field": "bpartnerName",
// 				// "title": 'PR'==orderType?"供应商":"收货单位",
// 				"minWidth": "130",
// 				"sortable": true
// 			}, {
// 				"field": "vendorName",
// 				"title": "供应商",
// 				"minWidth": "200",
// 				"sortable": true
// 			}, {
// 				"field": "inoutNo",
// 				"title": "出库单号",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "pickCreatedByName",
// 				"title": "拣货指示人",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "orderNo",
// 				"title": "申请单号",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "orderTypeName",
// 				"title": "申请类型",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "poOrderNo",
// 				"title": "原订单号",
// 				// "hover":true,
// 				// "hidden":!('SR'==orderType),
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "warehouseName",
// 				"title": "发货仓库",
// 				"minWidth": "100",
// 				"sortable": true
// 			}, {
// 				"field": "confirmUsername",
// 				"title": !isProductControlLevel?"第一发货人":"发货人",
// 				// "hidden" : !isProductControlLevel,
// 				"minWidth": "120",
// 				"sortable": true
// 			}, {
// 				"field": "confirmUsername2",
// 				"title": "第二发货人",
// 				// "hidden" : !isProductControlLevel,
// 				"minWidth": "120",
// 				"sortable": true
// 			}, {
// 				"field": "description",
// 				"title": "备注",
// 				"minWidth": "100",
// 				"sortable": true
// 			}
// ];

export const formSchema: VbenFormProps['schema'] = [
  {
    component: 'DateGroup',
    fieldName: 'date', // 默认实际查询参数 dateFrom，dateTo
    label: '申请时间',
    defaultValue: [
      dayjs(dayjs().format('YYYY-MM-DD'))
        // .subtract(7, 'year')
        .subtract(7, 'day')
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
        autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/warehouseBPartner.do?readWrite=Y',
        placeholder: '请选择申请仓库',
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
    // defaultValue: '',
    fieldName: 'bpartnerId',
    label: '申请仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
        placeholder: '请选择上级仓库',
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
    // defaultValue: '',
    fieldName: 'warehouseId',
    label: '上级仓库',
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
        options: [
          { value: '', label: '全部' },
          { value: 'Y', label: '是' },
          { value: 'N', label: '否' },
        ],
        placeholder: '请选择',
        paginate: false,
      };
    },
    defaultValue: '',
    fieldName: 'productCategoryId',
    label: '是否有库存',
  },
];

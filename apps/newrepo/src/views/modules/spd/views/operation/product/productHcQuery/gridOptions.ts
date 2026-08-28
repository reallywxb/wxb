/**
 * 页面表格组件配置
 */

import type { CrudColsType } from '#/types/datatable/useChcCrud';

export const columns: CrudColsType = [
  { field: 'index', fixed: 'left', title: '序号', type: 'seq', width: 50 },
  {
    field: 'productCode',
    minWidth: 120,
    sortable: true,
    title: '药品编码',
    slots: { default: 'productCode' },
  },
  {
    field: 'name',
    minWidth: 120,
    sortable: true,
    title: '药品名称',
  },
  {
    field: 'medicineName',
    minWidth: 120,
    sortable: true,
    title: '通用名',
  },
  {
    field: 'productName',
    minWidth: 90,
    sortable: true,
    title: '品牌',
  },
  {
    field: 'modelNo',
    minWidth: 90,
    sortable: true,
    title: '型号',
    visible: false,
  },
  {
    field: 'productSpec',
    minWidth: 110,
    sortable: true,
    title: '规格',
  },
  {
    field: 'manufacturerName',
    minWidth: 110,
    sortable: true,
    title: '生产厂家',
  },
  {
    field: 'value',
    minWidth: 110,
    sortable: true,
    title: '拼音码',
  },
  {
    field: 'baseUOMName',
    minWidth: 110,
    sortable: true,
    title: '最小单位',
    align: 'center',
  },
  {
    field: 'baseUOMPrecision',
    minWidth: 120,
    sortable: true,
    title: '最小单位精度',
    align: 'right',
  },
  {
    field: 'uomName',
    minWidth: 110,
    sortable: true,
    title: '采购单位',
    align: 'center',
  },
  {
    field: 'baseUOMQty',
    minWidth: 130,
    sortable: true,
    title: '采购单位转换比',
    align: 'right',
  },
  {
    field: 'certificateNo',
    minWidth: 110,
    sortable: true,
    title: '注册证号',
    slots: { default: 'certificateNo' },
  },
  {
    field: 'certValidTo',
    minWidth: 110,
    sortable: true,
    title: '注册证效期',
  },
  {
    field: 'hasCert',
    minWidth: 110,
    sortable: true,
    title: '是否有证照',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'upc',
    minWidth: 110,
    sortable: true,
    title: '产品条码',
  },
  {
    field: 'upc1',
    minWidth: 110,
    sortable: true,
    title: '原产品条码',
  },
  // {
  //   field: 'productStyleName',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '剂型',
  // },
  // {
  //   field: 'casNo',
  //   minWidth: 110,
  //   sortable: true,
  //   title: 'CAS号',
  // },
  {
    field: 'isActive',
    minWidth: 110,
    sortable: true,
    title: '是否有效',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isPurchasePriceUnify',
    minWidth: 110,
    sortable: true,
    title: '统一定价',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'settlementPriceMode',
    minWidth: 130,
    sortable: true,
    title: '后结算价格模式',
  },
  {
    field: 'pricePO',
    minWidth: 110,
    sortable: true,
    title: '采购价',
    align: 'right',
  },
  {
    field: 'priceList',
    minWidth: 110,
    sortable: true,
    title: '零售价',
    align: 'right',
  },
  {
    field: 'defaultVendorName',
    minWidth: 110,
    sortable: true,
    title: '默认供应商',
  },
  {
    field: 'productCategoryName',
    minWidth: 110,
    sortable: true,
    title: '商品类别',
  },
  {
    field: 'productControlLevelName',
    minWidth: 110,
    sortable: true,
    title: '商品组',
  },
  {
    field: 'lpackageQty',
    minWidth: 110,
    sortable: true,
    title: '大包装数',
    align: 'right',
  },
  {
    field: 'mpackageQty',
    minWidth: 110,
    sortable: true,
    title: '中包装数',
    align: 'right',
  },
  // {
  //   field: 'spackageQty',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '小包装数',
  // },
  {
    field: 'isColdStorage',
    minWidth: 110,
    sortable: true,
    title: '需冷藏',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'storageConditionName',
    minWidth: 110,
    sortable: true,
    title: '存储条件',
  },
  {
    field: 'careLevelName',
    minWidth: 110,
    sortable: true,
    title: '养护级别',
  },
  {
    field: 'isLot',
    minWidth: 110,
    sortable: true,
    title: '批号管理',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isGuaranteeDateMandatory',
    minWidth: 110,
    sortable: true,
    title: '有效期必填',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isProductionDateMandatory',
    minWidth: 120,
    sortable: true,
    title: '生产日期必填',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isProductAreaMandatory',
    minWidth: 110,
    sortable: true,
    title: '产地必填',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isCertificateNoMandatory',
    minWidth: 120,
    sortable: true,
    title: '批准文号必填',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'guaranteeDaysMin',
    minWidth: 110,
    sortable: true,
    title: '近效期天数',
    align: 'right',
  },
  {
    field: 'isStoragePackage',
    minWidth: 110,
    sortable: true,
    title: '包装管理',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isBasePackage',
    minWidth: 110,
    sortable: true,
    title: '是否单包',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isSerNo',
    minWidth: 110,
    sortable: true,
    title: '厂家码管理',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isControlledProduct',
    minWidth: 110,
    sortable: true,
    title: '双人作业',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'productTypeName',
    minWidth: 110,
    sortable: true,
    title: '商品分类',
  },
  {
    field: 'productUserCode',
    minWidth: 110,
    sortable: true,
    title: '自定义编码',
  },
  {
    field: 'standardCode',
    minWidth: 110,
    sortable: true,
    title: '贯标编码',
    visible: false, // TODO:medicine cancel 贯标码
  },
  // {
  //   field: 'productStateCode',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '商品本位码',
  // },
  // {
  //   field: 'marketingAuthorizationHolder',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '上市许可持有人',
  // },
  // {
  //   field: 'essentialDrugTypeName',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '基药类型',
  // },
  {
    field: 'isBulkPurchase',
    minWidth: 110,
    sortable: true,
    title: '带量采购',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'bulkPurchaseQty',
    minWidth: 110,
    sortable: true,
    title: '带量报量',
    align: 'right',
  },
  {
    field: 'bulkPurchaseTypeName',
    minWidth: 120,
    sortable: true,
    title: '带量采购类型',
  },
  {
    field: 'priceTypeName',
    minWidth: 110,
    sortable: true,
    title: '价格类型',
  },
  {
    field: 'isBid',
    minWidth: 110,
    sortable: true,
    title: '是否省标',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'markCode',
    minWidth: 110,
    sortable: true,
    title: '省标编码',
  },
  // {
  //   field: 'isCityBid',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '是否市标',
  // },
  // {
  //   field: 'cityBidCode',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '市标编码',
  // },
  {
    field: 'bidsStatusName',
    minWidth: 110,
    sortable: true,
    title: '招标状态',
  },
  {
    field: 'zlTypeName',
    minWidth: 110,
    sortable: true,
    title: '医保分类',
  },
  {
    field: 'insurance',
    minWidth: 110,
    sortable: true,
    title: '医保编码',
  },
  {
    field: 'insuranceFeeName',
    minWidth: 110,
    sortable: true,
    title: '病案费目',
  },
  {
    field: 'serviceToTypeName',
    minWidth: 110,
    sortable: true,
    title: '应用对象',
  },
  {
    field: 'isPrecious',
    minWidth: 110,
    sortable: true,
    title: '是否高值',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isFee',
    minWidth: 110,
    sortable: true,
    title: '是否计价',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'materialBigTypeName',
    minWidth: 120,
    sortable: true,
    title: '重点监管分类',
  },
  {
    field: 'materialLevelName',
    minWidth: 120,
    sortable: true,
    title: '医疗器械分类',
  },
  {
    field: 'isInterPose',
    minWidth: 110,
    sortable: true,
    title: '是否介入',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isImPlanTation',
    minWidth: 110,
    sortable: true,
    title: '是否植入',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  {
    field: 'isSurgicalTool',
    minWidth: 110,
    sortable: true,
    title: '是否工具',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
  // {
  //   field: 'isNarcotic',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '麻精药品',
  // },
  // {
  //   field: 'isDisinfectant',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '消毒液',
  // },
  // {
  //   field: 'isInfusion',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '大输液',
  // },
  // {
  //   field: 'isHighRisk',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '高警示药品',
  // },
  // {
  //   field: 'isReported',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '报告药',
  // },
  // {
  //   field: 'isTwoVote',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '两票制',
  // },
  // {
  //   field: 'isNew',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '是否新品',
  // },
  // {
  //   field: 'isConfused',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '易混淆',
  // },
  // {
  //   field: 'isSpecial',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '特殊品种',
  // },
  // {
  //   field: 'isAntitumor',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '抗肿瘤',
  // },
  // {
  //   field: 'isOnLine',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '是否线上',
  // },
  // {
  //   field: 'isShortPo',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '是否临采',
  // },
  // {
  //   field: 'isMonitor',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '监控品种',
  // },
  // {
  //   field: 'isReserve',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '储备品种',
  // },
  // {
  //   field: 'antiDrugTypeName',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '抗菌药物类型',
  // },
  {
    field: 'tracCodepreFix',
    minWidth: 110,
    sortable: true,
    title: '追溯码前7位',
  },
  {
    field: 'tracCodeDivideRate',
    minWidth: 110,
    sortable: true,
    title: '追溯码乘率',
    align: 'right',
  },
  {
    field: 'tracCodeMultiplyRate',
    minWidth: 110,
    sortable: true,
    title: '追溯码除率',
    align: 'right',
  },
  // {
  //   field: 'executiveStandardName',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '中药执行标准',
  // },
  // {
  //   field: 'narcoticTypeName',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '麻精分类',
  // },
  // {
  //   field: 'antitumorTypeName',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '抗肿瘤分类',
  // },
  // {
  //   field: 'skinTestTypeName',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '皮试类型',
  // },
  {
    field: 'description',
    minWidth: 110,
    sortable: true,
    title: '备注',
  },
  {
    field: 'changeActiveUser',
    minWidth: 110,
    sortable: true,
    title: '启/停用人',
  },
  {
    field: 'changeActiveReason',
    minWidth: 110,
    sortable: true,
    title: '启/停用原因',
  },
  {
    field: 'changeActiveTime',
    minWidth: 110,
    sortable: true,
    title: '启/停用时间',
  },
  {
    field: 'created',
    minWidth: 110,
    sortable: true,
    title: '创建时间',
  },
  {
    field: 'commitUserName',
    minWidth: 110,
    sortable: true,
    title: '提交人',
  },
  {
    field: 'commitTime',
    minWidth: 110,
    sortable: true,
    title: '提交时间',
  },
  {
    field: 'checkUserName',
    minWidth: 110,
    sortable: true,
    title: '审批人',
  },
  {
    field: 'checkTime',
    minWidth: 110,
    sortable: true,
    title: '审批时间',
  },
  // {
  //   field: 'rejectReason',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '审批备注',
  // },
  // {
  //   field: 'statusName',
  //   minWidth: 110,
  //   sortable: true,
  //   title: '审批状态',
  // },
  {
    field: 'isInnovate',
    minWidth: 110,
    sortable: true,
    title: '是否创新',
    formatter: ({ cellValue }: any) => {
      return cellValue === 'Y' ? '是' : '否';
    },
    align: 'center',
  },
];

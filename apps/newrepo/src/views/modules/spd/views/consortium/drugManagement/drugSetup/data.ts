export const INITIAL_EDIT_FORM_DATA = {
  // 基础信息
  productCode: '', // 药品编码
  materialCode: '', // 物资编码
  name: '', // 药品名称
  productSpec: '', // 规格
  productStyle: '', // 剂型
  materialPicture: null, // 物资图片
  photoUrl: null, // 物资图片url
  materialPictureFile: null, // 物资图片文件
  isActive: '', // 物资状态
  medicineName: '', // 通用名
  productUserCode: '', // 自定义编码
  certificateNo: '', // 批准文号
  certValidTo: '', // 注册证有效期止
  isLong: 'N', // 长期有效
  value: '', // 拼音码
  productName: '', // 品牌
  manufacturerId: '', // 生产企业
  isForeign: '', // 是否进口
  uomId: '', // 单位
  regionName: '', // 产地1
  productArea: '', // 产地2
  productCategory: '', // 产品类别
  materialClassification: '', // 物资分类
  controlCode: '', // 管理属性
  materialAttribute: '', // 物资属性
  baseUOMId: '', // 最小单位
  baseUOMQty: '', // 转换比
  essentialDrugType: '', // 基本药物分类
  insurance: '', // 医保药品编码
  zlType: '', // 医保分类
  insurancePaymentType: '', // 医保支付类别
  isConsistent: 'Y', // 是否一致性评价
  isIntensive: 'Y', // 是否重点监控
  storageCondition: '', // 存储条件
  defaultVendorId: '', // 默认供应商
  nationalMonitoringCategory: '', // 国家重点监控分类
  adOrgId: '', // 医院
  areaName: '', // 区域名称

  // 管理信息
  isShortPo: 'N', // 是否临采
  isBulkPurchase: 'N', // 是否带量采购
  bulkPurchaseType: '', // 带量采购分类
  isNew: 'N', // 是否新品
  description: '', // 备注
  isLot: 'Y', // 批号管理
  isGuaranteeDateMandatory: 'Y', // 有效期必填
  isProductionDateMandatory: 'N', // 生产日期必填
  guaranteeDaysMin: '', // 近效期天数
  isProductAreaMandatory: 'Y', // 产地必填
  isStoragePackage: 'Y', // 包装管理
  isBasePackage: 'Y', // 是否单包
  isControlledProduct: 'Y', // 双人作业
  narcoticType: '', // 毒麻分类
  antiDrugType: '', // 抗菌药物类型
  productControlLevel: '', // 药品组
  isAntitumor: 'Y', // 抗肿瘤
  antitumorType: '', // 肿瘤分类
  skinTestType: '', // 皮肤类型
  isInnovate: 'Y', // 生物创新药物

  // 价格信息
  isPurchasePriceUnify: 'Y', // 统一定价
  isFee: 'Y', // 是否计价
  settlementPriceMode: '', // 后结算价格模式

  // 省平台信息
  isBid: 'N', // 是否上传省平台
  markCode: '', // 省平台编码
  serialNumber: '', // 流水号
  consumablesCategory1: [], // 耗材分类（级联选择器）
  purchaseLimit: '', // 采购限价
  provincialPlatformSerialNumber: '', // 省平台流水号
  provincialPlatformProductName: '', // 省平台产品名称
  provincialPlatformSpec: '', // 省平台规格
  provincialPlatformModel: '', // 省平台型号
  provincialPlatformManufacturer: '', // 省平台生产企业
  isCityBid: 'Y', // 是否市标
  cityBidCode: '', // 市标编码

  // 价格相关字段
  value2: '', // 计费编码
  priceList: '', // 零售价
  pricePO: '', // 采购价格

  // 包装信息
  unitCode: '', // 采购单位
  mpackageQty: '', // 中包装数
  lpackageQty: '', // 大包装数

  // 文件相关
  fileId: '', // 图片上传后的文件ID
};

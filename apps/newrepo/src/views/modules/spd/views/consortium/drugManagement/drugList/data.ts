export const INITIAL_EDIT_FORM_DATA = {
  //  基础字段
  // 基础字段第一行：药品编码、药品名称、规格、剂型、物资状态
  productCode: '', // 药品编码
  name: '', // 药品名称
  productSpec: '', // 规格
  productStyle: undefined, // 剂型
  isActive: false, // 物资状态  true-提交  false-保存
  // 第二行：通用名、自定义编码、注册证有效期止、长期有效、物资图片(跨行)
  medicineName: '', // 通用名
  productUserCode: '', // 自定义编码
  certValidTo: '', // 注册证有效期止(批准文号效期)
  isLong: 'N', // 长期有效
  photoUrlBase: '', // 物资图片  用于新增
  photoUrl: '', // 物资图片  用于回显
  // 第三行： 拼音码、 品牌、生产企业、药品来源
  value: '', // 拼音码
  productName: '', // 品牌
  manufacturerId: undefined, // 生产企业
  isForeign: 'N', // 药品来源->是否进口
  // 第四行：批准文号、单位、最小单位、转换比
  certificateNo: '', // 批准文号(批准文号)
  uomId: undefined, // 单位 (采购单位)
  baseUOMId: undefined, // 最小单位(最小单位)
  baseUOMQty: undefined, // 转换比(采购单位转换比)
  // 第五行：基本药物分类、医保药品编码、医保分类、医保支付类别
  essentialDrugType: undefined, // 基本药物分类(基药类型)
  insurance: '', // 医保药品编码(医保编码)
  zlType: undefined, // 医保分类
  insurancePaymentType: undefined, // 医保支付类别
  //  第六行： 是否一致性评价、是否重点监控、存储条件、默认供应商
  isConsistent: 'Y', // 是否一致性评价
  isIntensive: 'Y', // 是否重点监控
  storageCondition: undefined, // 存储条件
  defaultVendorId: undefined, // 默认供应商

  //  管理信息
  //  第一行：是否临采、是否带量采购、带量采购分类、、是否新品、备注
  isShortPo: 'N', // 是否临采
  isBulkPurchase: 'N', // 是否带量采购
  bulkPurchaseType: undefined, // 带量采购分类 (带量采购类型)
  isNew: 'N', // 是否新品
  description: '', // 备注
  //  第二行：批号管理、有效期必填、生产日期必填、近效期必填 、产地必填
  isLot: 'N', // 批号管理
  isGuaranteeDateMandatory: 'N', // 有效期必填
  isProductionDateMandatory: 'N', // 生产日期必填
  guaranteeDaysMin: '', // 近效期天数
  isProductAreaMandatory: 'N', // 产地必填
  // 第三行：包装管理、是否单包、双人作业、毒麻分类、抗菌药物类型
  isStoragePackage: 'N', // 包装管理
  isBasePackage: 'N', // 是否单包
  isControlledProduct: 'N', // 双人作业
  narcoticType: undefined, // 毒麻分类-> 麻精分类
  antiDrugType: undefined, // 抗菌药物类型(抗菌药物分类)
  // 第四行：药品组、抗肿瘤、肿瘤分类、皮试类型、生物创新药
  productControlLevel: undefined, // 药品组(商品组)
  isAntitumor: 'N', // 抗肿瘤
  antitumorType: undefined, // 肿瘤分类
  skinTestType: undefined, // 皮试类型
  isInnovate: 'N', // 生物创新药->是否创新
  // 安全与特殊属性标识
  isHighWarning: 'N', // 是否高警示
  isSeem: 'N', // 是否看似
  isSound: 'N', // 是否听似
  isMultiSpecification: 'N', // 是否多规格
  isAnesthetic: 'N', // 是否麻
  isPoison: 'N', // 是否毒
  isEssence: 'N', // 是否精
  isOvulation: 'N', // 是否催排卵
  isTerminationOfPregnancy: 'N', // 是否终止妊娠
  isRefrigeration: 'N', // 是否冷藏
  isSpecial: 'N', // 是否特殊
  specialType: undefined, // 毒麻精放
  spiritType: undefined, // 精神分类
  isRecycle: 'N', // 是否回收
  // 第五行：药品类别
  productCategoryId: undefined, // 药品类别
  tracCode: '', // 追溯码前缀
  //   价格信息
  // 第一行: 统一定价、是否计价、后结算价格模式 、计费编码
  isPurchasePriceUnify: 'N', // 统一定价
  isFee: 'N', // 是否计价
  settlementPriceMode: undefined, // 后结算价格模式
  value2: '', // 计费编码
  // 第二行：零售价、采购价格
  priceList: '', // 零售价
  pricePO: '', // 采购价格
  //   平台信息
  // 第一行：是否上传省平台、省平台编码、是否市标 、市标编码
  isBid: 'N', // 是否上传省平台(是否省标)
  markCode: '', // 省平台编码(省标编码)
  isCityBid: 'N', // 是否市标
  cityBidCode: '', // 市标编码

  //  包装信息
  //  第一行：中包装数、大包装数
  mpackageQty: '', // 中包装数
  lpackageQty: '', // 大包装数
};

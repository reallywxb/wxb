export const productSetting = {
  readonlyFields: [
    // 'medicineName'
  ],
  hiddenFields: {
    yp: [
      // 'medicineName', // 药品通用名
      'productStateCode', // 药品国家本位码
      // 'productStyleName', // 药品剂型
      // 'executiveStandard', // 中药执行标准
      // 'executiveStandardName', // 中药执行标准
      'casNo', // 化学试剂使用
      // 'essentialDrugType', // 基本药物分类
      // 'essentialDrugTypeName', // 基本药物分类
      // 'antiDrugType', // 抗菌药物类型
      // 'antiDrugTypeName', // 抗菌药物类型
      // 'productPrintName', // 打印名称
      'spackageQty', // 小包装数量
      // 'isNew', // 是否新品
      // 'isShortPo', // 是否临采品种
      // 'isConfused',// 易混淆
      // 'isMonitor',// 监控品种
      // 'isReserve',// 储备品种
      'isSpecial', // 特殊商品
      'isDisinfectant', // 消毒液,
      // 'isAntitumor', // 抗肿瘤
      // 'isNarcotic', //麻精药品
      // 'isInfusion', //大输液
      // 'isHighRisk', //高警示
      // 'isReported', //报告药
      // 'narcoticType',// 麻精分类
      // 'narcoticTypeName',// 麻精分类
      // 'antitumorType',// 肿瘤分类
      // 'antitumorTypeName',// 肿瘤分类
      'skinTestType', // 皮试类型
      'skinTestTypeName', // 皮试类型
      // 'isTwoVote', //是否两票制
      // 'isOnLine', //是否线上
      // 'marketingAuthorizationHolder', //上市许可人
      // 'isCityBid', //是否市标
      // 'cityBidCode', //市标编码
      // 'productStyle', //剂型
      // 'productStyleName', //剂型

      'modelNo', // 型号
      'upc',
      'upc1',
      'upc2',
      'upc3',
      // 'isPurchasePriceUnify',//是否统一进价
      // 'isStoragePackage',//包装管理
      // 'isBasePackage', //单包
      'isSerNo', // 厂家码
      'standardCode', // 贯标编码
      'insuranceFee', // 医保费目
      'insuranceFeeName', // 医保费目
      'serviceToType', // 服务对象
      'serviceToTypeName', // 服务对象
      'isPrecious', // 是否高值
      // 'isFee', //是否计价
      'materialBigType', // 耗材十八大类
      'materialLevel', // 耗材级别
      'materialBigTypeName', // 耗材十八大类
      'materialLevelName', // 耗材级别
      'hasCert', // 是否有证照
      // 'btn_setProductPack',//商品定数按钮
      // 'btn_importProductPackLocator', //定数导入
      'btn_syncCert', // 同步证照
      'isImPlanTation', // 是否植入
      'isInterPose', // 是否介入
      'bidsStatus', // 招标状态
      'bidsStatusName', // 招标状态
      // 'btn_add'
      'isSurgicalTool', // 是否工具
      'isAloneCharge', // 单独收费
      'isDedicated', // 专机专用
      'contractDateFrom', // 合同开始时间
      'contractDateTo', // 合同结束时间

      /* !!!必须手动加，否则fieldName匹配不上*/
      'contractDate',
    ],
    hc: [
      // 'medicineName', // 药品通用名
      'productStateCode', // 药品国家本位码
      'productStyleName', // 药品剂型
      'executiveStandard', // 中药执行标准
      'executiveStandardName', // 中药执行标准
      'casNo', // 化学试剂使用
      'essentialDrugType', // 基本药物分类
      'essentialDrugTypeName', // 基本药物分类
      'antiDrugType', // 抗菌药物类型
      'antiDrugTypeName', // 抗菌药物类型
      'productPrintName', // 打印名称
      'spackageQty', // 小包装数量
      'isNew', // 是否新品%
      'isShortPo', // 是否临采品种
      'isConfused', // 易混淆
      'isMonitor', // 监控品种
      'isReserve', // 储备品种
      'isSpecial', // 特殊商品
      'isDisinfectant', // 消毒液,
      'isAntitumor', // 抗肿瘤
      'isNarcotic', // 麻精药品
      'isInfusion', // 大输液
      'isHighRisk', // 高警示
      'isReported', // 报告药
      'narcoticType', // 麻精分类
      'narcoticTypeName', // 麻精分类
      'antitumorType', // 肿瘤分类
      'antitumorTypeName', // 肿瘤分类
      'skinTestType', // 皮试类型
      'skinTestTypeName', // 皮试类型
      'isTwoVote', // 是否两票制
      'isOnLine', // 是否线上
      'marketingAuthorizationHolder', // 上市许可人
      'isCityBid', // 是否市标
      'cityBidCode', // 市标编码
      'productStyle', // 剂型
      'productStyleName', // 剂型
      // 'modelNo', // 型号
      'isAloneCharge', // 单独收费
      'isDedicated', // 专机专用
      'contractDateFrom', // 合同开始时间
      'contractDateTo', // 合同结束时间

      /* !!!必须手动加，否则fieldName匹配不上*/
      'contractDate',
      'bulkPurchaseType', // 带量采购类型
      'priceType', // 价格类型
      'insuranceFee', // 病案费目
      'serviceToType', // 应用对象
      'materialBigType', // 重点监测分类
      'materialLevel', // 医疗器械分类
      'isImPlanTation', // 是否植入
      'isInterPose', // 是否介入
      'isNesis', // 是否缝线
      'isSurgicalTool', // 是否工具
    ],
  },
};

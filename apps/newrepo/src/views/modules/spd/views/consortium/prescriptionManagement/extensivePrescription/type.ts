// 页面类型
export type PageType = 'edit' | 'send' | 'sign';

// constants
export enum PageEnum {
  DISTRIBUTE = 'send', // 外延处方发放
  EDIT = 'edit', // 外延处方编辑
  RECEIVE = 'sign', // 外延处方签收
}

export interface StatusItem {
  label: string; // 显示文案
  color: string; // 字体颜色 (用于 cellStyle)
}

export type ActionKey = 'pickup' | 'receive' | 'view'; // 查看 取药 收药

// 外延处方操作行数据
export interface PrescriptionActionRow {
  prescriptionId: string; // 处方系统内部ID
  presId: string; // 处方ID
  presNo: string; // 处方号
  patientName: string; // 就诊人
  sex: string; // 性别
  patientCode: string; // 就诊卡号
  totalAmt: number | string; // 处方总金额
  deliveryWay: string; // 配送方式
  deliveryWayName: string; // 配送方式名称
  presTypeName: string; // 处方类型名称
  presType: string; // 处方类型
  presDate: string; // 处方日期
  preStatus: string; // 处方状态
  preStatusName: string; // 处方状态名称
  closeReason: string; // 关闭原因
  diagnosis: string; // 诊断
  receiverName: string; // 收货人
  receiverPhoneNumber: string; // 收货人手机号
  receiverAddress: string; // 收货人地址
  provinceCode: string; // 省份编码
  cityCode: string; // 城市编码
  areaCode: string; // 区县编码
  extOrgName: string; // 外延医院名称
  extWarehouseName: string; // 外延药房名称
  orgName: string; // 处方医院名称
  PatientPhoneNo: string; // 联系电话
  deliveryNo: string; // 配送单号
  [key: string]: any; // 其他动态字段
}

// 操作内容
export interface ActionContent {
  row: PrescriptionActionRow; // 当前操作的行数据
  formValues: any; // 表单值
  refreshTable?: () => void; // 回调函数(操作完成后刷新表格)
  props: any; // 组件实例属性
  extraParams?: any; // 额外参数
}

export interface CurrentHandleRow<T> {
  row: T; // 当前操作的行数据
  deliveryMode: string; // 配送方式
  callback?: () => Promise<void> | void; // 回调函数(操作完成后刷新表格)
}

// 操作处理函数
export type ActionHandle = (content: ActionContent) => Promise<void> | void;
export interface PageStrategy {
  // 使用 Partial 类型确保 actions 是可选的
  actions: Partial<Record<ActionKey, ActionHandle>>;
  // 动态按钮配置
  actionButtons?: ActionKey[];
  // 其他策略配置...
}

// 查询城市参数
export interface QueryCityParams {
  provinceCode: string; // 省份编码
}

// 查询区县参数
export interface QueryDistrictParams {
  cityCode: string; // 城市编码
}

// 省份|城市|区县返回数据
export interface QueryAreaItem {
  code: string; // 编码
  name: string; // 名称
}

// 保存配送地址参数
export interface SaveDeliveryAddressParams {
  prescriptionId: number | string; // 处方系统内部ID
  receiverName: string; // 收货人
  receiverPhoneNumber: string; // 收货人手机号
  receiverAddress: string; // 收货人地址
  provinceCode: string; // 省份编码
  cityCode: string; // 城市编码
  areaCode: string; // 区县编码
  deliveryWay: string; // 配送方式
  // 其他动态字段
  [key: string]: any;
}

// 保存处方状态
export interface SavePrescriptionStatusParams {
  prescriptionId: number | string; // 处方系统内部ID
  preStatus: '3' | '4'; // 处方状态 3: 收药 4: 取药
  deliveryNo: string; // 配送单号
}

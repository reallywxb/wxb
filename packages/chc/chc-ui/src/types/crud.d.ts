import type { VxeGridPropTypes } from 'vxe-table';

import type { DefineSetupFnComponent, PublicProps } from 'vue';

import type { ModalApiOptions, VbenFormProps } from '@vben/common-ui';
import type {
  ExtendedVxeGridApi,
  VxeGridProps,
  VxeTableGridOptions,
} from '@vben/plugins/vxe-table';
import type { RequestClientConfig } from '@vben/request';

// import type { ModalApiOptions } from '@vben-core/popup-ui';

export type TableData<T> = {
  records: T[];
  total: number;
};
export type GetAllTableDataParams = {
  pageInfo: {
    current: number;
    size: number;
    total: number;
  };
  params?: {
    [key: string]: any;
    cols: { dict?: boolean; id: string }[];
    sort: string[];
  };
};
export type queryLogData = {
  dateFrom: string;
  dateTo: string;
  keyValues: any;
  size: number;
  sort: string[];
  start: number;
};
export type queryLogParams = {
  preview: boolean;
};

/**
 * 深层递归所有属性为可选
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// 定义以特定字符串结尾的类型
export type EndsWith<T extends string> = `${string}${T}`;
export type SearchOptions = {
  [key: string]: any;
  advancedSearchOptions?: {
    [key: string]: any;
    type: string;
  };
  quickSearchOptions?: {
    [key: string]: any;
    type: string;
  };
  type?: string;
};
export type Column = VxeGridPropTypes.Columns<any>[0];
export interface GridColumn extends Column {
  /**
   * 日期类型
   * date/datetime
   */
  dateType?: string;
  /**
   * 设为false，强制指定不翻译字典；设为true，强制翻译字典；不设置按后台默认
   */
  dict?: boolean;
  /**
   * 字典扩展字段
   * 多字段使用逗号分隔，每个字段可以直接使用字段名，也可以使用源字段名:目标字段名格式来自定义返回字段名称
   * 示例：medicineName,name:productName，返回结果{medicineName:'aaa',productName:'bbb'}
   */
  dictExtendFields?: string;
  dictId?: string; // 字典编码
  key?: boolean; // 是否主键
  multiValue?: boolean; // 是否多选字典
  searchOptions?: SearchOptions;
}

export interface SeparatorOptions {
  backgroundColor?: string;
  show?: boolean;
}
// type ClassType = Array<object | string> | object | string;
// interface ChcVxeGridProps extends VxeGridProps {
//   /**
//    * 组件class
//    */
//   class?: ClassType;
//   /**
//    * 表单配置
//    */
//   formOptions?: VbenFormProps;
//   /**
//    * vxe-grid class
//    */
//   gridClass?: ClassType;
//   /**
//    * vxe-grid 事件
//    */
//   gridEvents?: DeepPartial<VxeGridListeners>;
//   /**
//    * vxe-grid 配置
//    */
//   gridOptions?: DeepPartial<VxeTableGridOptions>;
//   /**
//    * 搜索表单与表格主体之间的分隔条
//    */
//   separator?: boolean | SeparatorOptions;
//   /**
//    * 显示搜索表单
//    */
//   showSearchForm?: boolean;
//   /**
//    * 标题
//    */
//   tableTitle?: string;
//   /**
//    * 标题帮助
//    */
//   tableTitleHelp?: string;
// }
export type BtnType =
  | 'add'
  | 'delete'
  | 'edit'
  | 'export'
  | 'import'
  | 'log'
  | 'view';
export type CustomKeyStringUnion<T extends string = string> =
  `${Capitalize<T>}Modal-${T}ModalApi`;
export type SchemaColumnAndOptions = {
  /**
   * 新增弹窗表单配置
   */
  addFormOptions?: VbenFormProps;
  /**
   * 新增数据接口路径
   */
  addUrl?: string;
  /**
   * 用于根据查询接口res获取表格数据的方法，用来兼容返回格式不是records的接口
   */
  afterFetchFn?: (res: any) => TableData<any>;
  /**
   * 是否自动保存列配置信息
   * @default true
   */
  autoLoadColumnConfig?: boolean;
  /**
   * 表格是否自动选中第一行
   * @default true
   */
  autoSelectFirstRow?: boolean;
  /**
   * 接口入参处理方法
   */
  beforeFetchFn?: (params: any) => any;
  /**
   * 默认会根据gridColumns自动生成一套cols，如果gridColumn
   * 用于接口的额外cols配置
   */
  cols?: { dict?: boolean; id: string }[];
  /**
   * 表格列是否可拖拽
   * @default false
   */
  columnDragable?: boolean;
  /**
   * 通用的表单配置，用于新增编辑弹窗内的表单，新增和编辑弹窗表单配置不传的情况下，自动使用本字段
   */
  commonFormOptions?: VbenFormProps;
  /**
   * 自定义列配置（例如列宽，列顺序）保存时的key，用于一个页面有多个表格时存储自定义列配置
   * @default crud
   */
  customColumnsConfigKey?: string;
  /**
   * 自定义弹窗配置
   * key必须是带-的，左边会被导出为modal 右边是modalApi
   */
  customModals?: {
    [key: CustomKeyStringUnion]: ModalApiOptions;
  };
  /**
   * dataTableId表格id
   */
  dataTableId?: string;
  /**
   * 增删改查的默认接口配置对象
   */
  defaultRequestOptions?: RequestClientConfig;
  /**
   * 删除数据接口路径
   */
  deleteUrl?: string;
  /**
   * 编辑弹窗表单配置
   */
  editFormOptions?: VbenFormProps;
  /**
   * 搜索表单的表单项配置
   */
  formSchema?: VbenFormProps['schema'];
  /**
   * 获取表格ID
   */
  getTableId?: () => VxeTableGridOptions['id'];
  /**
   * 表格列配置
   * gridColumns?: (GridColumn | { searchOptions: SearchOptions })[];
   * 添加和高级查询快捷查询相关的配置项
   */
  gridColumns?: GridColumn[];
  /**
   * 表格事件配置
   */
  gridEvents?: VxeGridProps['gridEvents'];
  /**
   * 表格ID
   */
  id?: VxeTableGridOptions['id'];
  /**
   * 新增时是否直接插入新增数据到第一行
   * 为false时不会插入，而是直接查询
   * @default true
   */
  isAddWithInsert?: boolean;
  /**
   * 是否初始化时打开快捷搜索
   * @default false
   */
  openQuickSearch?: boolean;
  /**
   * 父表关联数据
   * 子表查询时会带上该数据给到接口
   */
  parentTableParams?: {
    [key: string]: any;
  };
  permissions?: {
    [key in BtnType]?: string;
  };
  /**
   * 获取表格列配置方法
   */
  queryColumnConfigFn?: (tableId: string, routePath: string) => void;
  /**
   * 获取列配置信息接口路径
   */
  queryColumnConfigUrl?: string;
  /**
   * 查询日志接口
   */
  queryLogUrl?: string;
  /**
   * 获取表格数据接口
   */
  queryTableDataApi?: (params: {
    [key: string]: any;
    cols: { dict?: boolean; id: string }[];
    current: number;
    size: number;
    sort: string[];
  }) => Promise<TableData<any>>;
  /**
   * 查询接口路径
   */
  queryUrl?: (() => string) | string;
  /**
   * 保存列配置信息接口路径
   */
  saveColumnConfigUrl?: string;
  /**
   * 是否展示新增按钮
   * @default true
   */
  showAddBtn?: boolean;
  /**
   * 操作列是否展示图标按钮
   * @default true
   */
  showCellMenuIconBtn?: boolean;

  /**
   * 是否展示自定义列按钮
   * @default true
   */
  showCustomBtn?: boolean;

  /**
   * 是否展示删除按钮
   * @default true
   */
  showDeleteBtn?: boolean;
  /**
   * 是否展示导出按钮
   * @default true
   */
  showExportBtn?: boolean;
  /**
   * 是否显示单选行的角标
   */
  showRadioRowTag?: boolean;
  /**
   * 是否展示刷新按钮
   * @default true
   */
  showRefreshBtn?: boolean;
  /**
   * 是否展示查询按钮
   * @default false
   */
  showSearchBtn?: boolean;
  /**
   * 是否显示搜索控制按钮
   * @default true
   */
  showSearchControlBtns?: boolean;
  /**
   * 是否展示表格右上方工具栏
   * @default true
   */
  showToolbar?: boolean;
  /**
   * 是否展示放大缩小
   * @default true
   */
  showZoomBtn?: boolean;
  /**
   * 用于查询表格数据的额外参数，会添加到proxy.ajax方法里
   */
  tableSearchExtraParams?: { [key: string]: any };
  /**
   * 更新数据接口路径
   */
  updateUrl?: string;

  /**
   * 查看弹窗表单配置
   */
  viewFormOptions?: VbenFormProps;
};

/**
 * 所有通用接口的组合对象
 * createDataTable 新增接口
 * deleteDataTable 删除接口
 * getAllTableData 下载时获取所有数据接口，批量调接口
 * getDataTableList 获取表格数据接口
 * queryDataTableColumnConfig 查询表格保存到服务器的列配置接口
 * queryDataTableLog 查询表格日志接口
 * saveDataTableColumnConfig 保存表格列配置接口
 * updateDataTable 编辑表格数据接口
 */
export type Requests = {
  /**
   * datatable新增接口
   */
  createDataTable: (
    tabelId: string,
    data: Omit<any, 'id'>,
    options?: RequestClientConfig,
  ) => Promise<any>;
  /**
   * datatable删除接口
   */
  deleteDataTable: (
    tabelId: string,
    params: { [key: string]: any },
    options?: RequestClientConfig,
  ) => Promise<any>;

  /**
   *
   * @param dataTableId 业务模型ID
   * @param actionId 动作ID
   * @param params 参数
   * @param preview 是否预览模式
   * @param options 请求参数
   * @returns
   */
  doDownload: (
    dataTableId: string,
    actionId: string,
    params: { [key: string]: any },
    preview?: boolean,
    options?: RequestClientConfig,
  ) => Promise<any>;

  /**
   * 执行处理
   * @param tabelId 业务模型ID
   * @param actionId 动作ID
   * @param params 参数
   * @param preview 是否预览模式
   */
  doProcess: (
    dataTableId: string,
    actionId: string,
    params: { [key: string]: any },
    preview?: boolean,
    options?: RequestClientConfig,
  ) => Promise<any>;
  /**
   * 上传文件
   * @param tabelId 业务模型ID
   * @param actionId 动作ID
   * @param params 参数
   * @param preview 是否预览模式
   */
  doUpload: (
    dataTableId: string,
    actionId: string,
    params: { [key: string]: any },
    preview?: boolean,
    options?: RequestClientConfig,
  ) => Promise<any>;

  /**
   * datatable获取所有数据库数据接口，用于全部导出
   */
  getAllTableData: (
    tableId: string,
    currentParams: GetAllTableDataParams,
    options?: RequestClientConfig,
    handleDataFn?: (res: any) => TableData<any>,
    serachParamsFormat?: (params: any) => any,
    beforeFetchFn?: (params: any) => any,
  ) => any;
  /**
   * 获取datatable当前页表格数据接口
   */
  getDataTableList: (
    tabelId: string,
    data: any,
    options?: RequestClientConfig,
  ) => Promise<TableData<any>>;

  /**
   * 获取datatable列配置信息（就是保存到接口的列宽列顺序列展示和列固定信息）
   */
  queryDataTableColumnConfig: (
    tabelId: string,
    type: string,
    options?: RequestClientConfig,
  ) => Promise<any>;

  /**
   * 获取datatable日志接口
   */
  queryDataTableLog: (
    tabelId: string,
    data: queryLogData,
    params: queryLogParams,
  ) => Promise<any>;

  /**
   * 保存datatable列配置信息（就是保存列宽列顺序列展示和列固定信息）
   */
  saveDataTableColumnConfig: (
    tabelId: string,
    type: string,
    obj: any,
    options?: RequestClientConfig,
  ) => Promise<any>;

  /**
   * 编辑datatable信息
   */
  updateDataTable: (
    tabelId: string,
    data: any,
    options?: RequestClientConfig,
  ) => Promise<any>;
};

export type GridType = DefineSetupFnComponent<
  VxeGridProps,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {},
  object,
  VxeGridProps & {},
  PublicProps
>;
export type GridApiType = ExtendedVxeGridApi;

import type {
  VxeGridInstance,
  VxeGridListeners,
  VxeGridPropTypes,
  VxeGridProps as VxeTableGridProps,
} from 'vxe-table';

import type { RequestClientConfig } from '@vben/request';
import type { DeepPartial } from '@vben/types';

import type { ExtendedFormApi, VbenFormProps } from '@vben-core/form-ui';

import { RequestClient } from '@vben/request';

import { useVbenForm } from '@vben-core/form-ui';
import { useVbenModal } from '@vben-core/popup-ui';

import ChcGrid from './chc-grid.vue';

interface ToolbarConfigOptions extends VxeGridPropTypes.ToolbarConfig {
  /** 是否显示切换搜索表单的按钮 */
  search?: boolean;
}
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
export interface ChcGridExpose {
  formApi: ExtendedFormApi;
  gridApi: VxeGridInstance;
  setLoading: (tableLoading: boolean) => void;
}
export type ChcGridInstance = InstanceType<typeof ChcGrid>;
export interface ColumnOption extends VxeGridPropTypes.Column {
  dateType: string;
  dict: boolean;
  dictExtendFields: string;
  dictId: string;
  /**
   * 标记当前field是否为主键
   */
  key: boolean;
  multiValue: boolean;
}
interface VxeTableGridOptions<T = any> extends VxeTableGridProps<T> {
  columns?: ColumnOption[];
  /** 工具栏配置 */
  toolbarConfig?: ToolbarConfigOptions;
}

// 创建一个专门针对事件监听器的类型工具
// type PartialListeners<T> = {
//   [K in keyof T]?: T[K] extends (...args: any[]) => any
//     ? T[K]
//     : DeepPartial<T[K]>;
// };
export interface ChcGridProps {
  /**
   * 表单配置
   */
  formOptions?: VbenFormProps;
  /**
   * vxe-grid 事件
   */
  gridEvents?: VxeGridListeners<any>;
  /**
   * vxe-grid 配置DeepPartial
   */
  gridOptions?: DeepPartial<VxeTableGridOptions>;

  /**
   * 表格ID
   */
  id: string;

  /**
   * 表单是否垂直布局
   */
  isFormAreaVertical?: boolean;
  /**
   * 请求实例
   */
  requestClient: RequestClient;
  /**
   * 表格的额外配置
   * @default {}
   */
  tableExtraConfig?: {
    /**
     * 接口数据处理
     */
    afterFetch?: (res: any) => TableData<any>;
    /**
     * 是否初始化自动加载表格数据
     * @default false
     */
    autoLoad?: boolean;
    /**
     * 自动保存列配置
     * @default true
     */
    autoLoadColumnConfig?: boolean;
    /**
     * 是否自动选择表格第一行
     * @default false
     */
    autoSelectFirstRow?: boolean;
    /**
     * 接口参数处理方法
     */
    beforeFetch?: (params: any) => any;
    /**
     * dataTableId 用于自动生成表格增删改查功能
     */
    dataTableId?: string;
    /**
     * 默认的请求配置
     */
    defaultRequestOptions?: RequestClientConfig;
    /**
     * 是否有分页
     * @default true
     */
    paginate?: boolean;
    /**
     * 父表依赖对象
     */
    parentTableParams?: { [key: string]: any };
    /**
     * 查询接口路径
     */
    queryUrl?: string;
    /**
     * 操作列是否展示图标按钮
     */
    showCellMenuIconBtn?: boolean;
    /**
     * 是否展示列配置按钮
     * @default false
     */
    showCustomBtn?: boolean;
    /**
     * 是否展示表格导出按钮
     * @default false
     */
    showExportBtn?: boolean;
    /**
     * 是否展示表格刷新按钮
     * @default false
     */
    showRefreshBtn?: boolean;
    /**
     * 是否展示toolbar区域按钮
     * @default false
     */
    showToolbar?: boolean;
    /**
     * 是否展示表格最大化按钮
     * @default false
     */
    showZoomBtn?: boolean;
    /**
     * 表格查询额外参数
     */
    tableSearchExtraParams?: { [key: string]: any };
  };
  /**
   * 生成form实例的方法
   */
  useVbenForm: typeof useVbenForm;
  /**
   * 生成modal的方法
   */
  useVbenModal: typeof useVbenModal;
}

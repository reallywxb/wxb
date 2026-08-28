import type {
  VxeGridInstance,
  VxeGridListeners,
  VxeGridProps as VxeTableGridProps,
} from 'vxe-table';

import type { ShallowRef } from 'vue';

import type { DeepPartial } from '@vben/types';

import type { ExtendedFormApi } from '@vben-core/form-ui';

import type { ChcGridProps, GetAllTableDataParams } from './types';

import { nextTick, ref } from 'vue';

import { useCrudApis } from './api';
import { deepMerge } from './utils';

const defaultTableExtraConfig: DeepPartial<ChcGridProps['tableExtraConfig']> = {
  autoLoadColumnConfig: true,
  autoSelectFirstRow: false,
  showCustomBtn: false,
  showRefreshBtn: false,
  showToolbar: false,
  showZoomBtn: false,
  paginate: true,
  autoLoad: false,
  showExportBtn: false,
  showCellMenuIconBtn: false,
};
type VxePagerPropTypes = NonNullable<VxeTableGridProps['pagerConfig']>;
export function useDefaultConfig(
  gridRef: Readonly<ShallowRef<null | VxeGridInstance>>,
  formApi: ExtendedFormApi,
  props: ChcGridProps,
): {
  defaultGridEvents: DeepPartial<VxeGridListeners<any>>;
  defaultGridOptions: DeepPartial<VxeTableGridProps>;
  finalTableExtraConfig: DeepPartial<ChcGridProps['tableExtraConfig']>;
} {
  const TOOLBAR_ACTIONS = 'toolbar-actions';
  const TOOLBAR_TOOLS = 'toolbar-tools';
  // 生成表格默认的配置对象
  const finalTableExtraConfig = deepMerge(
    defaultTableExtraConfig,
    props.tableExtraConfig,
  );
  const requests = useCrudApis(props.requestClient);
  const currentParams = ref<GetAllTableDataParams>({
    pageInfo: {
      current: 1,
      size: 10,
      total: 0,
    },
  });
  // const columns = props.gridOptions?.columns;
  // 自动生成cols  仅使用datatable标准接口传cols参数
  const cols: any[] = [];
  if (
    finalTableExtraConfig.dataTableId &&
    props.gridOptions?.columns &&
    props.gridOptions?.columns.length > 0
  ) {
    props.gridOptions?.columns.forEach((item) => {
      if (!item?.type && item?.field && item?.field !== 'action') {
        cols.push({
          id: item.field as string,
          multiValue: item.multiValue,
          /**
           * 设为false，强制指定不翻译字典；设为true，强制翻译字典；不设置按后台默认
           */
          dict: item.dict,
          dictId: item.dictId,
          /**
           * 字典扩展字段
           * 多字段使用逗号分隔，每个字段可以直接使用字段名，也可以使用源字段名:目标字段名格式来自定义返回字段名称
           * 示例：medicineName,name:productName，返回结果{medicineName:'aaa',productName:'bbb'}
           */
          dictExtendFields: item.dictExtendFields,
          /**
           * 日期类型
           * date/datetime
           */
          type: item.dateType,
        });
      }
    });
  }
  const sort = ref<string[]>([]);
  // const mobileLayouts: VxeTableGridProps['pagerConfig'].layout = [
  //   'PrevJump',
  //   'PrevPage',
  //   'Number',
  //   'NextPage',
  //   'NextJump',
  // ];
  const layouts: VxePagerPropTypes['layouts'] = [
    'Total',
    'Sizes',
    'Home',
    'PrevJump',
    'PrevPage',
    'Number',
    'NextPage',
    'NextJump',
    // ...mobileLayouts,
    'End',
  ];
  const finalConfig: Partial<VxeTableGridProps> = {
    // maxHeight: '100%',
    // minHeight: '100%',
    height: '100%',
    showFooter: false,
    stripe: true,
    border: true,
    showOverflow: true,
    formConfig: {
      enabled: false,
    },
    virtualYConfig: {
      enabled: true,
      gt: 20,
      immediate: true,
      scrollToTopOnChange: true,
    },
    // checkboxConfig: {
    //   highlight: false,
    //   trigger: 'row',
    // },
    // radioConfig: {
    //   highlight: false,
    //   trigger: 'row',
    // },
    rowConfig: {
      isCurrent: true,
      isHover: true,
    },
    columnConfig: {
      drag: true,
      resizable: true,
    },
    columnDragConfig: {
      showIcon: false,
      trigger: 'cell',
    },
    pagerConfig: finalTableExtraConfig.paginate
      ? {
          pageSize: 20,
          background: true,
          pageSizes: [10, 20, 30, 50, 100, 200],
          className: 'w-full', // mt-2
          layouts,
          size: 'mini',
        }
      : undefined,
    sortConfig: {
      remote: true,
    },
    toolbarConfig:
      finalTableExtraConfig.showToolbar === false
        ? undefined
        : {
            custom: finalTableExtraConfig.showCustomBtn,
            refresh: finalTableExtraConfig.showRefreshBtn,
            zoom: finalTableExtraConfig.showZoomBtn,
            slots: {
              buttons: TOOLBAR_ACTIONS,
              tools: TOOLBAR_TOOLS,
            },
          },
    exportConfig: {
      columns:
        props.gridOptions?.columns && props.gridOptions.columns.length > 0
          ? props.gridOptions.columns
              .filter(
                (item) =>
                  item?.field !== 'index' &&
                  item?.field !== 'action' &&
                  item?.type !== 'seq' &&
                  item?.type !== 'checkbox',
              )
              .map((item) => {
                return { field: item?.field };
              })
          : [],
      exportMethod: ({ options }: any) => {
        return new Promise<void>((resolve, reject) => {
          if (options.mode === 'all') {
            // 获取所有数据，然后再调用exportData方法
            let handleDataFn;
            if (
              finalTableExtraConfig.afterFetch &&
              typeof finalTableExtraConfig.afterFetch === 'function'
            ) {
              handleDataFn = finalTableExtraConfig.afterFetch;
            }
            requests
              .getAllTableData(
                (finalTableExtraConfig.queryUrl ||
                  finalTableExtraConfig.dataTableId) as string,
                currentParams.value as GetAllTableDataParams,
                finalTableExtraConfig.defaultRequestOptions,
                handleDataFn,
                (params) => params,
                finalTableExtraConfig.beforeFetchFn,
              )
              .then((res: any) => {
                gridRef.value
                  ?.exportData({
                    ...options,
                    data: res,
                    remote: false,
                  })
                  .then(() => {
                    resolve();
                  })
                  .catch((error: Error) => {
                    reject(error);
                  });
              });
          } else {
            gridRef.value
              ?.exportData({
                ...options,
                remote: false,
              })
              .then(() => {
                resolve();
              })
              .catch((error: Error) => {
                reject(error);
              });
          }
        });
      },
      modes: finalTableExtraConfig.paginate
        ? ['current', 'selected', 'all']
        : ['current', 'selected'],
      remote: true,
      types: ['xlsx', 'csv'],
    },
  };
  if (finalTableExtraConfig?.dataTableId || finalTableExtraConfig?.queryUrl) {
    finalConfig.proxyConfig = {
      seq: true,
      sort: true,
      autoLoad: finalTableExtraConfig.autoLoad,
      ajax: {
        query: async (optionmid: any, params: any) => {
          // console.log('query', optionmid, params);
          // debugger;
          // // 处理父子表依赖
          if (
            finalTableExtraConfig.parentTableParams &&
            Object.keys(finalTableExtraConfig.parentTableParams).length > 0
          ) {
            let emptyValue = true;
            for (const key in finalTableExtraConfig.parentTableParams) {
              if (
                finalTableExtraConfig.parentTableParams[key] === undefined ||
                finalTableExtraConfig.parentTableParams[key] === ''
              ) {
                emptyValue = true;
                break;
              } else {
                emptyValue = false;
              }
            }
            if (emptyValue) {
              return finalTableExtraConfig.paginate
                ? {
                    total: 0,
                    items: [],
                  }
                : [];
            }
          }

          if (optionmid.sort && optionmid.sort.field) {
            sort.value = [`${optionmid.sort.field} ${optionmid.sort.order}`];
          }
          const formValues = {
            ...params,
            // ...(openQuickSearch.value ? quickSearchForm.value : {}),
          };
          const page = optionmid.page;
          await nextTick();
          let finalParams = {
            cols: cols || [],
            current: page.currentPage,
            size: page.pageSize,
            sort: sort.value,
            ...formValues,
            ...finalTableExtraConfig.parentTableParams,
            ...finalTableExtraConfig.tableSearchExtraParams,
          };
          if (
            finalTableExtraConfig.beforeFetch &&
            typeof finalTableExtraConfig.beforeFetch === 'function'
          ) {
            finalParams = finalTableExtraConfig.beforeFetch(finalParams);
          }
          // finalParams 没值，不需要查询
          if (!finalParams) {
            return finalTableExtraConfig.paginate
              ? {
                  total: 0,
                  items: [],
                }
              : [];
          }
          const handleUrl = (tableId: string = '') => {
            return tableId.includes('?')
              ? `${tableId}&_menuPageAction=query`
              : `${tableId}?_menuPageAction=query`;
          };
          const midRes = await requests.getDataTableList(
            handleUrl(
              (finalTableExtraConfig.queryUrl ||
                finalTableExtraConfig.dataTableId) as string,
            ),
            finalParams,
            finalTableExtraConfig.defaultRequestOptions,
          );
          const res =
            finalTableExtraConfig.afterFetch &&
            typeof finalTableExtraConfig.afterFetch === 'function'
              ? finalTableExtraConfig.afterFetch(midRes)
              : midRes;
          currentParams.value = {
            pageInfo: {
              current: page.currentPage,
              size: page.pageSize,
              total: res.total,
            },
            params: finalParams,
          };
          finalTableExtraConfig.autoSelectFirstRow &&
            setTimeout(() => {
              // 如果有 radioChange 事件，并且当前表格有数据
              if (
                props.gridEvents &&
                typeof props.gridEvents.radioChange === 'function'
              ) {
                if (res.records && res.records.length > 0) {
                  gridRef.value?.setRadioRow(res.records[0]);
                  // props.gridEvents.radioChange({ row: res.records[0] });
                } else {
                  gridRef.value?.clearRadioRow();
                  // props.gridEvents.radioChange({});
                }
              } else {
                if (res.records && res.records.length > 0) {
                  gridRef.value?.setRadioRow(res.records[0]);
                } else {
                  gridRef.value?.clearRadioRow();
                }
              }
            }, 200);
          return finalTableExtraConfig.paginate
            ? {
                total: res.total,
                items: res.records,
              }
            : res.records;
        },
      },
    };
  }
  // 如果打开了自动保存列配置，则设置列配置保存接口
  if (finalTableExtraConfig.autoLoadColumnConfig) {
    finalConfig.customConfig = {
      restoreStore: () => {
        return new Promise((resolve) => {
          requests
            .queryDataTableColumnConfig(
              `${location.pathname}`, // ${schemaColumnAndOptions.dataTableId}
              props.id, // schemaColumnAndOptions.customColumnsConfigKey
              {},
            )
            .then((res) => {
              if (res && res.data) {
                // 兼容表格列配置为string和obj的情况
                if (typeof res.data === 'string') {
                  let resData: any;
                  try {
                    resData = JSON.parse(res.data);
                    resolve(resData);
                  } catch {
                    resolve({});
                  }
                } else {
                  resolve(res.data);
                }
              } else {
                resolve({});
              }
            });
        });
      },
      storage: {
        fixed: true,
        resizable: true,
        sort: true,
        visible: true,
      },
      updateStore: (params: any) => {
        return new Promise((resolve) => {
          requests
            .saveDataTableColumnConfig(
              `${location.pathname}`, // ${schemaColumnAndOptions.dataTableId}
              props.id, // schemaColumnAndOptions.customColumnsConfigKey
              params.storeData,
              {},
            )
            .then(() => {
              resolve(null);
            });
        });
      },
    };
  }
  // 生成表格默认的事件对象
  const finalGridEvents = {
    pageChange: (page: any) => {
      currentParams.value.pageInfo.size = page.pageSize;
      currentParams.value.pageInfo.current = page.currentPage;
    },
  };
  return {
    defaultGridOptions: finalConfig,
    defaultGridEvents: finalGridEvents,
    finalTableExtraConfig,
  };
}

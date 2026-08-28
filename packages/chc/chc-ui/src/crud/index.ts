import type { DefineSetupFnComponent, PublicProps } from 'vue';

import type {
  ExtendedModalApi,
  MaybeComponentProps,
  ModalApiOptions,
  ModalProps,
  VbenFormProps,
  VbenFormSchema,
} from '@vben/common-ui';
import type {
  ExtendedVxeGridApi,
  UseVbenVxeGrid,
  VbenVxeGridProps,
} from '@vben/plugins/vxe-table';

import type {
  BtnType,
  Column,
  CustomKeyStringUnion,
  EndsWith,
  GetAllTableDataParams,
  GridColumn,
  GridType,
  Requests,
  SchemaColumnAndOptions,
  TableData,
} from '../types/crud.d';

import { defineComponent, h, nextTick, ref, toRaw, watch } from 'vue';

// AntdDownloadOutlined
import { AntdPlusCircleTwotone, ExportActionIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

// import { useVbenModal } from '@vben-core/popup-ui';
import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import FormDialog from '../components/crud/FormModal.vue';
import LogDialog from '../components/crud/LogModal.vue';
import LazySearch from '../components/lazy-search';
import { packageFnOrObj } from '../utils/util';
import { getCellMenuByOption } from './getCellMenuByOption';

const getAllTableDataByApi = async (
  queryDataApi: any,
  currentParams: GetAllTableDataParams,
) => {
  const size = currentParams.pageInfo.size;
  const total = currentParams.pageInfo.total;
  const allPageCount =
    total % size === 0 ? total / size : Math.ceil(total / size);
  let allTableData: any[] = [];
  for (let i = 1; i <= allPageCount; i++) {
    const current = i;
    const res = await queryDataApi({
      ...currentParams.params,
      current,
      size,
    });
    allTableData = [...allTableData, ...res.records];
  }
  return allTableData;
};

/**
 * 对系统原有的 useVbenVxeGrid 做二次封装，将通用功能集成进来
 * @param useVbenVxeGrid 原来的生成表格方法
 * @param requests 所有通用接口的组合对象
 * @param namespace 命名空间，用于区分不同项目，本地存储时使用的key
 */
export function useChcCrud(
  useVbenVxeGrid: UseVbenVxeGrid,
  requests: Requests,
  namespace: string,
  hasAccessByCodes: (codes: string[]) => boolean, // 权限控制方法
  handleTableDataFn?: (res: any) => TableData<any>, // 处理接口查询返参为统一格式的方法
  serachParamsFormat?: (params: any) => any, // 查询参数格式化方法
  defaultConfig?: SchemaColumnAndOptions,
  isFormAreaVertical: boolean = false,
) {
  /**
   * 这是一个可以完全替代原有的 useVbenVxeGrid 的方法
   * @param options useVbenVxeGrid 的参数,将会覆盖第二个参数的配置
   * @param originSchemaColumnAndOptions crud配置项，包含默认配置，建议先使用本字段设置表格
   */
  const useChcGrid: (
    options: VbenVxeGridProps,
    originSchemaColumnAndOptions?: SchemaColumnAndOptions,
  ) =>
    | [
        Grid: DefineSetupFnComponent<
          VbenVxeGridProps,
          // eslint-disable-next-line @typescript-eslint/no-empty-object-type
          {},
          object,
          VbenVxeGridProps & {},
          PublicProps
        >,
        gridApi: ExtendedVxeGridApi,
        {
          [key: EndsWith<'Modal'>]: DefineSetupFnComponent<any>;
          [key: EndsWith<'ModalApi'>]: ExtendedModalApi;
          FormModal: DefineSetupFnComponent<
            ModalProps,
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            {},
            object,
            ModalProps & {},
            PublicProps
          >;
          formModalApi: ExtendedModalApi;
          handleAdd: (extraParams?: { [key: string]: any }) => void;
          handleDel: (row: any) => void;
          handleEdit: (row: any, extraParams?: { [key: string]: any }) => void;
          handleExport?: (opt: any) => void;
          // handleLog: (row: any) => void;
          handleView: (row: any) => void;
          LogModal: DefineSetupFnComponent<
            ModalProps,
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            {},
            object,
            ModalProps & {},
            PublicProps
          >;
          logModalApi: ExtendedModalApi;
        },
      ]
    | [
        Grid: GridType,
        gridApi: ExtendedVxeGridApi,
        {
          [key: EndsWith<'Modal'>]: DefineSetupFnComponent<any>;
          [key: EndsWith<'ModalApi'>]: ExtendedModalApi;
          FormModal: DefineSetupFnComponent<
            ModalProps,
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            {},
            object,
            ModalProps & {},
            PublicProps
          >;
          formModalApi: ExtendedModalApi;
          handleAdd: (extraParams?: { [key: string]: any }) => void;
          handleDel: (row: any) => void;
          handleEdit: (row: any, extraParams?: { [key: string]: any }) => void;
          handleExport?: (opt: any) => void;
          // handleLog: (row: any) => void;
          handleView: (row: any) => void;
          LogModal: DefineSetupFnComponent<
            ModalProps,
            // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            {},
            object,
            ModalProps & {},
            PublicProps
          >;
          logModalApi: ExtendedModalApi;
        },
      ] = (
    options: VbenVxeGridProps,
    originSchemaColumnAndOptions?: SchemaColumnAndOptions,
  ) => {
    /**
     * 为 originSchemaColumnAndOptions 内的部分字段定义初始值
     */
    const schemaColumnAndOptions: SchemaColumnAndOptions = {
      autoLoadColumnConfig: true,
      cols: [],
      columnDragable: true,
      autoSelectFirstRow: true,
      isAddWithInsert: true,
      showAddBtn: false,
      showToolbar: true,
      showCustomBtn: false,
      showExportBtn: false,
      showRefreshBtn: false,
      showSearchBtn: false,
      showZoomBtn: false,
      openQuickSearch: false,
      showSearchControlBtns: false,
      showCellMenuIconBtn: false,
      customModals: {},
      customColumnsConfigKey: 'crud',
      parentTableParams: {},
      tableSearchExtraParams: {},
      showRadioRowTag: false,
      ...defaultConfig,
      ...originSchemaColumnAndOptions,
      // dataTableId:
      //   (originSchemaColumnAndOptions &&
      //     originSchemaColumnAndOptions.dataTableId) ||
      //   (options.gridOptions.id as string) ||
      //   location.pathname,
    };
    // 自动生成cols
    const cols: any[] = [];
    // 仅使用datatable标准接口传cols参数
    if (
      schemaColumnAndOptions.dataTableId &&
      schemaColumnAndOptions.gridColumns &&
      schemaColumnAndOptions.gridColumns.length > 0
    ) {
      schemaColumnAndOptions.gridColumns.forEach((item) => {
        if (!item.type && item.field && item.field !== 'action') {
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
    /**      schemaColumnAndOptions.gridColumns &&
      schemaColumnAndOptions.gridColumns.length > 0
        ? filterArr([
            ...schemaColumnAndOptions.gridColumns.map((item) => {
              return typeof item.dict === 'boolean'
                ? {
                    dict: item.dict,
                    id: item.field as string,
                  }
                : { id: item.field as string };
            }),
            ...(schemaColumnAndOptions.cols || []),
          ])
        : schemaColumnAndOptions.cols || [];
*/
    // 提前定义gridApi,供弹窗内使用
    let preGetGridApi: ExtendedVxeGridApi | undefined;
    /**
     * 生成日志弹窗
     * @returns [LogModal,logModalApi]
     */
    function useLogModal() {
      const [LogModal, logModalApi] = useVbenModal({
        // 连接抽离的组件
        connectedComponent: h(LogDialog, {
          queryDataTableLog: requests.queryDataTableLog,
          useVbenVxeGrid,
          isFormAreaVertical,
          namespace,
          parentTableId: `${schemaColumnAndOptions.getTableId && typeof schemaColumnAndOptions.getTableId === 'function' ? schemaColumnAndOptions.getTableId() : schemaColumnAndOptions.id}`,
        }),
      });
      modals.logModalApi = logModalApi;
      modals.LogModal = LogModal;
      return [LogModal, logModalApi];
    }
    /**
     * 生成新增编辑表单弹窗
     * @returns [FormModal,formModalApi]
     */
    function useFormModal() {
      const [FormModal, formModalApi] = useVbenModal({
        // 连接抽离的组件
        connectedComponent: h(FormDialog, {
          cols: cols || [],
          createDataTable: requests.createDataTable,
          updateDataTable: requests.updateDataTable,
          defaultRequestOptions:
            schemaColumnAndOptions.defaultRequestOptions || {},
        }),
        class: 'w-[800px]',
        closable: true,
        draggable: true,
      });
      modals.formModalApi = formModalApi;
      modals.FormModal = FormModal;
      return [FormModal, formModalApi];
    }
    /**
     * 生成自定义弹窗方法
     * @returns [FormModal,formModalApi]
     */
    function useCustomModal(
      key: CustomKeyStringUnion,
      modalOptions?: ModalApiOptions,
    ): [modal: DefineSetupFnComponent<any>, modalApi: ExtendedModalApi] | null {
      if (key.includes('-')) {
        const [Modal, modalApi] = useVbenModal(modalOptions);
        customModals[key.split('-')[1] as `${string}ModalApi`] = modalApi;
        customModals[key.split('-')[0] as `${Capitalize<string>}Modal`] = Modal;
        return [Modal, modalApi];
      } else {
        console.error(
          "customModals的属性key必须包含'-',才能正常生成导出的modal和modalApi",
        );
        return null;
        // throw new Error(
        //   "customModals的属性key必须包含'-',才能正常生成导出的modal和modalApi",
        // );
      }
    }
    /**
     * 弹窗数据公共对象
     */
    const modals: {
      [key: string]: DefineSetupFnComponent<any> | ExtendedModalApi | undefined;
      FormModal?: DefineSetupFnComponent<any>;
      formModalApi?: ExtendedModalApi;
      LogModal?: DefineSetupFnComponent<any>;
      logModalApi?: ExtendedModalApi;
    } = {
      // logModalApi: null,
      // LogModal: null,
      // FormModal: null,
      // formModalApi: null,
    };
    /**
     * 自定义弹窗对象
     */
    const customModals: {
      [key: `${Capitalize<string>}Modal`]: DefineSetupFnComponent<any>;
      [key: `${string}ModalApi`]: ExtendedModalApi;
    } = {};
    /**
     * useLogModal useFormModal 两个方法生成日志和表单弹窗
     */
    useLogModal();
    useFormModal();

    // 根据customModals属性生成自定义弹窗
    for (const key in schemaColumnAndOptions.customModals) {
      useCustomModal(
        key as CustomKeyStringUnion,
        schemaColumnAndOptions.customModals[key as CustomKeyStringUnion],
      );
    }
    function handleParentCheck(formOptions: VbenFormProps) {
      if (
        schemaColumnAndOptions.parentTableParams &&
        Object.keys(schemaColumnAndOptions.parentTableParams).length > 0
      ) {
        let emptyValue = true;
        for (const key in schemaColumnAndOptions.parentTableParams) {
          if (
            schemaColumnAndOptions.parentTableParams[key] === undefined ||
            schemaColumnAndOptions.parentTableParams[key] === ''
          ) {
            emptyValue = true;
            break;
          } else {
            emptyValue = false;
          }
        }
        if (emptyValue) {
          message.warning('请选择父表记录！');
          return;
        }
      }
      if (
        schemaColumnAndOptions.parentTableParams &&
        formOptions.schema &&
        formOptions.schema.length > 0
      ) {
        formOptions.schema.forEach((column: any) => {
          if (
            schemaColumnAndOptions.parentTableParams?.[column.fieldName] !==
            undefined
          ) {
            column.componentProps = packageFnOrObj(
              column.componentProps,
              (componentProps: any) => {
                componentProps.disabled = true;
                return componentProps;
              },
            );
          }
        });
      }
    }
    /**
     * 新增按钮点击事件
     * 走的是内置的默认新增逻辑
     */
    function handleAdd(extraParams?: { [key: string]: any }) {
      const formOptions = {
        ...(schemaColumnAndOptions.addFormOptions ||
          schemaColumnAndOptions.commonFormOptions),
      };
      handleParentCheck(formOptions);
      modals.formModalApi
        ?.setState({
          showConfirmButton: true,
        })
        .setData({
          openType: 'add',
          formOptions: {
            // 此处添加默认新增表单配置
            commonConfig: {
              componentProps: {
                class: 'w-full',
              },
            },
            layout: 'horizontal',
            // 控制表单是否显示折叠按钮
            showCollapseButton: false,
            // 是否在字段值改变时提交表单
            submitOnChange: false,
            // 按下回车时是否提交表单
            submitOnEnter: false,
            wrapperClass: 'grid-cols-2',
            ...formOptions,
            resetButtonOptions: {
              show: false,
            },
            submitButtonOptions: {
              show: false,
            },
          },
          parentTableParams: schemaColumnAndOptions.parentTableParams,
          // dataTableId: schemaColumnAndOptions.dataTableId,
          addUrl:
            schemaColumnAndOptions.addUrl || schemaColumnAndOptions.dataTableId,
          // updateUrl:
          //   schemaColumnAndOptions.updateUrl ||
          //   schemaColumnAndOptions.dataTableId,
          gridApi: preGetGridApi,
          isAddWithInsert: schemaColumnAndOptions.isAddWithInsert,
          ...extraParams,
        })
        .open();
    }
    /**
     * 编辑按钮点击事件
     * 走的是内置的编辑逻辑
     */
    function handleEdit(row: any, extraParams?: { [key: string]: any }) {
      const formOptions = {
        ...(schemaColumnAndOptions.editFormOptions ||
          schemaColumnAndOptions.commonFormOptions),
      };
      handleParentCheck(formOptions);
      modals.formModalApi
        ?.setState({
          showConfirmButton: true,
        })
        .setData({
          openType: 'edit',
          formOptions: {
            // 此处添加默认编辑表单配置
            commonConfig: {
              componentProps: {
                class: 'w-full',
              },
            },
            layout: 'horizontal',
            // 控制表单是否显示折叠按钮
            showCollapseButton: false,
            // 是否在字段值改变时提交表单
            submitOnChange: false,
            // 按下回车时是否提交表单
            submitOnEnter: false,
            wrapperClass: 'grid-cols-2',
            ...formOptions,
            resetButtonOptions: {
              show: false,
            },
            submitButtonOptions: {
              show: false,
            },
          },
          formData: row,
          parentTableParams: schemaColumnAndOptions.parentTableParams,
          // dataTableId: schemaColumnAndOptions.dataTableId,
          // addUrl:
          //   schemaColumnAndOptions.addUrl || schemaColumnAndOptions.dataTableId,
          updateUrl:
            schemaColumnAndOptions.updateUrl ||
            schemaColumnAndOptions.dataTableId,
          gridApi: preGetGridApi,
          extraParams,
        })
        .open();
    }

    /**
     * 查看按钮点击事件
     * 走的是内置的查看逻辑
     */
    function handleView(row: any) {
      modals.formModalApi
        ?.setState({
          showConfirmButton: false,
        })
        .setData({
          openType: 'view',
          formOptions: {
            // 此处添加默认编辑表单配置
            commonConfig: {
              componentProps: {
                class: 'w-full',
              },
            },
            layout: 'horizontal',
            // 控制表单是否显示折叠按钮
            showCollapseButton: false,
            // 是否在字段值改变时提交表单
            submitOnChange: false,
            // 按下回车时是否提交表单
            submitOnEnter: false,
            wrapperClass: 'grid-cols-2',
            ...schemaColumnAndOptions.viewFormOptions,
            resetButtonOptions: {
              show: false,
            },
            submitButtonOptions: {
              show: false,
            },
          },
          formData: row,
          gridApi: preGetGridApi,
        })
        .open();
    }
    /**
     * 生成删除按钮点击事件hook
     * @param gridApi
     */
    const tablePrimaryKeys: GridColumn[] = [];
    function useDelFn(gridApi: ExtendedVxeGridApi) {
      /**
       * 删除按钮点击事件
       * 走的是内置的删除逻辑
       */
      return function handleDel(row: any) {
        Modal.confirm({
          content: '确定要删除该条数据吗？',
          onOk: async () => {
            try {
              const params: { [key: string]: any } = {};
              if (tablePrimaryKeys.length > 0) {
                for (const tablePrimaryKey of tablePrimaryKeys) {
                  if (tablePrimaryKey.field) {
                    params[tablePrimaryKey.field] = row[tablePrimaryKey.field];
                  }
                }
              } else {
                params.id = row.id;
              }
              await requests.deleteDataTable(
                (schemaColumnAndOptions.deleteUrl ||
                  schemaColumnAndOptions.dataTableId) as string,
                params,
                schemaColumnAndOptions.defaultRequestOptions,
              );
              gridApi.query();
              message.success('删除成功');
            } catch {}
          },
          title: '删除',
        });
      };
    }
    // 给columns的序号列和操作列添加align center
    function addAlignCenter(arr: GridColumn[]) {
      return arr.map((item) => {
        if (
          item.field === 'index' ||
          item.type === 'seq' ||
          item.field === 'action'
        ) {
          return item.align
            ? item
            : {
                ...item,
                align: 'center',
              };
        }
        return item;
      });
    }
    /**
     * 在 originSchemaColumnAndOptions 传了的场景下，会整合所有配置项，生成包含通用功能的表格
     * 在 originSchemaColumnAndOptions 未传的情况下，保持原有的逻辑，兼容原先的useVbenVxeGrid
     */
    if (originSchemaColumnAndOptions === undefined) {
      /**
       * 生成新的表格组件和组件api
       * 添加返回日志弹窗和表单弹窗以及对应的操作方法，供页面使用
       */
      const [Grid, gridApi] = useVbenVxeGrid(options);
      preGetGridApi = gridApi;
      return [
        Grid,
        gridApi,
        {
          LogModal: modals.LogModal as DefineSetupFnComponent<any>,
          logModalApi: modals.logModalApi as ExtendedModalApi,
          FormModal: modals.FormModal as DefineSetupFnComponent<any>,
          formModalApi: modals.formModalApi as ExtendedModalApi,
          handleAdd,
          handleEdit,
          handleView,
          handleDel: useDelFn(gridApi),
        },
      ];
    } else {
      const currentParams = ref<GetAllTableDataParams>({
        pageInfo: {
          current: 1,
          size: 10,
          total: 0,
        },
      });
      const sort = ref<string[]>([]);
      // 以下逻辑用于将表格的查询操作，放在所有autoChooseFirstOption为true的form项查询并赋值完成之后
      const chooseFirstItems: VbenFormSchema[] = []; // 自动选择首项字段
      const dateGroupItems: VbenFormSchema[] = []; // 时间段查询字段
      if (
        options.formOptions &&
        options.formOptions.schema &&
        options.formOptions.schema.length > 0
      ) {
        options.formOptions.schema.forEach((item) => {
          if (
            (item.component === 'ChcSelectNew' ||
              item.component === 'ChcSelect') &&
            item.componentProps &&
            ((typeof item.componentProps === 'function' &&
              item.componentProps().autoChooseFirstOption) ||
              (item.componentProps as MaybeComponentProps)
                .autoChooseFirstOption)
          ) {
            chooseFirstItems.push(item);
          }
          if (
            item.component === 'DateGroup' ||
            item.component === 'TimeGroup'
          ) {
            dateGroupItems.push(item);
          }
          // addDataTestId(item);
        });
      } else if (
        schemaColumnAndOptions.formSchema &&
        schemaColumnAndOptions.formSchema.length > 0
      ) {
        schemaColumnAndOptions.formSchema.forEach((item: any) => {
          if (
            (item.component === 'ChcSelectNew' ||
              item.component === 'ChcSelect') &&
            item.componentProps &&
            ((typeof item.componentProps === 'function' &&
              item.componentProps().autoChooseFirstOption) ||
              item.componentProps.autoChooseFirstOption)
          ) {
            chooseFirstItems.push(item);
          }
          if (
            item.component === 'DateGroup' ||
            item.component === 'TimeGroup'
          ) {
            dateGroupItems.push(item);
          }
          // addDataTestId(item);
        });
      }
      // 如果有自动选择首项的字段，使用延迟查询，禁用原自动查询
      if (
        options.gridOptions?.proxyConfig?.autoLoad &&
        chooseFirstItems.length > 0
      ) {
        options.gridOptions.proxyConfig.autoLoad = false; // 禁用原自动查询
        const lazySearch = new LazySearch(chooseFirstItems.length, async () => {
          await nextTick();
          gridApi.formApi.getValues().then((res: any) => {
            gridApi.formApi.setLatestSubmissionValues(toRaw(res));
            gridApi.query({ ...res });
          });
        });
        // 设置select回调
        chooseFirstItems.forEach((item) => {
          // const componentProps =
          //   typeof item.componentProps === 'function'
          //     ? item.componentProps() || {}
          //     : item.componentProps || {};
          // const oldOnLoad = componentProps.onLoad;
          // componentProps.onLoad = (options: any) => {
          //   lazySearch.sign();
          //   if (oldOnLoad && typeof oldOnLoad === 'function') {
          //     oldOnLoad(options);
          //   }
          // };
          // item.componentProps = componentProps;
          item.componentProps = packageFnOrObj(
            item.componentProps,
            (componentProps: any) => {
              const oldOnLoad = componentProps.onLoad;
              componentProps.onLoad = (options: any) => {
                lazySearch.sign();
                if (oldOnLoad && typeof oldOnLoad === 'function') {
                  oldOnLoad(options);
                }
              };
              return componentProps;
            },
          );
        });
      }
      // 自动设置时间段查询字段映射配置
      if (dateGroupItems.length > 0) {
        const fieldMapping = options.formOptions?.fieldMappingTime || [];
        const fromSuffix = options.formOptions?.rangeFieldFromSuffix || '';
        const toSuffix = options.formOptions?.rangeFieldToSuffix || '_To';
        dateGroupItems.forEach((item) => {
          let exists = false;
          fieldMapping.forEach((map) => {
            if (map[0] === item.fieldName) {
              exists = true;
            }
          });
          if (!exists) {
            if (item.component === 'DateGroup') {
              fieldMapping.push([
                item.fieldName,
                [item.fieldName + fromSuffix, item.fieldName + toSuffix],
                typeof item.componentProps === 'function'
                  ? item.componentProps().valueFormat
                  : item.componentProps?.valueFormat || 'YYYY-MM-DD',
              ]);
            } else {
              fieldMapping.push([
                item.fieldName,
                [item.fieldName + fromSuffix, item.fieldName + toSuffix],
                typeof item.componentProps === 'function'
                  ? item.componentProps().valueFormat
                  : item.componentProps?.valueFormat || 'HH:mm:ss',
              ]);
            }
          }
        });
        if (!options.formOptions) options.formOptions = {};
        options.formOptions.fieldMappingTime = fieldMapping;
      }

      /**
       * 搜索表单配置
       * 统一添加表单上下布局样式
       */
      const searchFormOptions: VbenFormProps = {
        commonConfig: {
          labelClass: 'w-[70px]',
        },
        actionWrapperClass: isFormAreaVertical
          ? 'formActionAreaStyle'
          : undefined,
        collapsed: true,
        collapsedRows: 1,
        layout: isFormAreaVertical ? 'vertical' : 'horizontal',
        // 控制表单是否显示折叠按钮
        showCollapseButton: true,
        // 是否在字段值改变时提交表单
        submitOnChange: false,
        // 按下回车时是否提交表单
        submitOnEnter: true,
        wrapperClass:
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
        ...options.formOptions,
        schema:
          options.formOptions &&
          options.formOptions.schema &&
          options.formOptions.schema.length > 0
            ? options.formOptions.schema.map((item: VbenFormSchema) => {
                return {
                  formItemClass:
                    (options.formOptions &&
                      options.formOptions.layout === 'horizontal') ||
                    ((!options.formOptions || !options.formOptions.layout) &&
                      !isFormAreaVertical)
                      ? undefined
                      : 'pl-[4px] pr-[4px]',
                  labelClass: 'leading-1 mb-[1px] pl-[4px]',
                  ...item,
                };
              })
            : (schemaColumnAndOptions.formSchema &&
                schemaColumnAndOptions.formSchema.map(
                  (item: VbenFormSchema) => {
                    return {
                      formItemClass:
                        (options.formOptions &&
                          options.formOptions.layout === 'horizontal') ||
                        ((!options.formOptions ||
                          !options.formOptions.layout) &&
                          !isFormAreaVertical)
                          ? 'pl-[4px] pr-[4px]'
                          : 'pl-[10px] pr-[10px]',
                      labelClass: 'leading-1 mb-[1px] pl-[4px]',
                      ...item,
                    };
                  },
                )) ||
              [],
      };
      /**
       * 如果没有表格渲染相关参数，则报错
       */
      if (!options.gridOptions && !schemaColumnAndOptions.gridColumns) {
        console.error(
          'useChcGrid的参数内需要有表格渲染相关参数，否则表格无法正常渲染',
        );
      }
      class HandleRunOnce {
        count = 0;
        once(fn: () => void) {
          if (this.count > 0) return;
          fn();
          this.count++;
        }
      }
      let handleRunOnce: HandleRunOnce | null = new HandleRunOnce();
      /**
       * 表格配置
       * 统一添加表格拓展功能
       */

      const finalColumns = addAlignCenter(
        (options.gridOptions &&
        options.gridOptions.columns &&
        options.gridOptions.columns.length > 0
          ? options.gridOptions.columns.map((item) => {
              // 给column中第一个显示的操作列添加角标
              if (
                schemaColumnAndOptions.showRadioRowTag &&
                item &&
                item.visible !== false
              ) {
                handleRunOnce &&
                  handleRunOnce.once(() => {
                    if (!item.className) {
                      // 没有className时，直接给值
                      item.className = ({ row }: any) => {
                        return preGetGridApi?.grid.isCheckedByRadioRow(row)
                          ? `tag-row-tag`
                          : '';
                      };
                    } else if (typeof item.className === 'string') {
                      // className是字符串时，添加tag
                      item.className = ({ row }: any) => {
                        return preGetGridApi?.grid.isCheckedByRadioRow(row)
                          ? `${item.className} tag-row-tag`
                          : `${item.className}`;
                      };
                    } else {
                      // className是函数时，暂不处理
                    }
                  });
                handleRunOnce = null; // 垃圾回收
              }
              if (item && (item as any).key && item.field) {
                tablePrimaryKeys.push(item as GridColumn);
              }
              return item?.field === 'action' &&
                item.cellRender &&
                item.cellRender.name === 'CustomCellMenu'
                ? {
                    align: 'center',
                    field: 'action',
                    fixed: 'right',
                    title: '操作',
                    showOverflow: false,
                    width: 120,
                    ...item,
                    slots: { default: 'action' },
                    cellRender: undefined,
                  }
                : item;
            })
          : schemaColumnAndOptions.gridColumns?.map((item) => {
              // 给column中第一个显示的操作列添加角标
              if (
                schemaColumnAndOptions.showRadioRowTag &&
                item &&
                item.visible !== false
              ) {
                handleRunOnce &&
                  handleRunOnce.once(() => {
                    if (!item.className) {
                      // 没有className时，直接给值
                      item.className = ({ row }: any) => {
                        return preGetGridApi?.grid.isCheckedByRadioRow(row)
                          ? `tag-row-tag`
                          : '';
                      };
                    } else if (typeof item.className === 'string') {
                      // className是字符串时，添加tag
                      item.className = ({ row }: any) => {
                        return preGetGridApi?.grid.isCheckedByRadioRow(row)
                          ? `${item.className} tag-row-tag`
                          : `${item.className}`;
                      };
                    } else {
                      // className是函数时，暂不处理
                    }
                  });
                handleRunOnce = null; // 垃圾回收
              }
              if (item && item.key && item.field) {
                tablePrimaryKeys.push(item);
              }
              return item.field === 'action' &&
                item.cellRender &&
                item.cellRender.name === 'CustomCellMenu'
                ? {
                    align: 'center',
                    field: 'action',
                    fixed: 'right',
                    title: '操作',
                    showOverflow: false,
                    width: 120,
                    ...item,
                    slots: { default: 'action' },
                    cellRender: undefined,
                  }
                : item;
            }) || []) as Column[],
      );
      const cellMenuColumn: Column | GridColumn | undefined = (
        options.gridOptions &&
        options.gridOptions.columns &&
        options.gridOptions.columns.length > 0
          ? options.gridOptions.columns.find(
              (item) =>
                item?.field === 'action' &&
                item.cellRender &&
                item.cellRender.name === 'CustomCellMenu',
            )
          : schemaColumnAndOptions.gridColumns?.find(
              (item) =>
                item.field === 'action' &&
                item.cellRender &&
                item.cellRender.name === 'CustomCellMenu',
            )
      ) as Column | GridColumn | undefined;
      const cellMenuComp = (scope: any) => {
        return getCellMenuByOption({
          attrs: cellMenuColumn?.cellRender?.attrs,
          options: cellMenuColumn?.cellRender?.options,
          props: cellMenuColumn?.cellRender?.props,
          column: scope.column,
          row: scope.row,
          dataTableId: schemaColumnAndOptions.dataTableId, // 这边的dataTableId是用来控操作栏按钮权限的
          hasAccessByCodes,
          showCellMenuIconBtn: schemaColumnAndOptions.showCellMenuIconBtn,
          handleView,
          handleEdit,
          handleDel: useDelFn(gridApi),
          permissions: schemaColumnAndOptions.permissions,
          handleLog,
        });
      };
      const getTableId = () => {
        return (
          (schemaColumnAndOptions.getTableId &&
          typeof schemaColumnAndOptions.getTableId === 'function'
            ? schemaColumnAndOptions.getTableId()
            : schemaColumnAndOptions.id) || 'crud'
        );
      };
      const gridOptions: VbenVxeGridProps['gridOptions'] = {
        height: 'auto',
        id: `${location.pathname}-${schemaColumnAndOptions.getTableId && typeof schemaColumnAndOptions.getTableId === 'function' ? schemaColumnAndOptions.getTableId() : schemaColumnAndOptions.id}`,
        // size: 'mini',
        stripe: true,
        border: true,
        ...options.gridOptions,
        virtualYConfig: {
          enabled: true,
          gt: 20,
          immediate: true,
          scrollToTopOnChange: true,
          ...(options.gridOptions && options.gridOptions.virtualYConfig),
        },
        checkboxConfig: {
          highlight: false,
          trigger: 'row',
          ...(options.gridOptions && options.gridOptions.checkboxConfig),
        },
        columnConfig: {
          drag: schemaColumnAndOptions.columnDragable,
          ...(options.gridOptions && options.gridOptions.columnConfig),
        },
        customConfig: schemaColumnAndOptions.autoLoadColumnConfig
          ? {
              restoreStore: () => {
                return new Promise((resolve) => {
                  requests
                    .queryDataTableColumnConfig(
                      `${namespace}${location.pathname}`, // ${schemaColumnAndOptions.dataTableId}
                      (schemaColumnAndOptions.getTableId &&
                      typeof schemaColumnAndOptions.getTableId === 'function'
                        ? schemaColumnAndOptions.getTableId()
                        : schemaColumnAndOptions.id) as string, // schemaColumnAndOptions.customColumnsConfigKey
                      schemaColumnAndOptions.defaultRequestOptions,
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
                      `${namespace}${location.pathname}`, // ${schemaColumnAndOptions.dataTableId}
                      (schemaColumnAndOptions.getTableId &&
                      typeof schemaColumnAndOptions.getTableId === 'function'
                        ? schemaColumnAndOptions.getTableId()
                        : schemaColumnAndOptions.id) as string, // schemaColumnAndOptions.customColumnsConfigKey
                      params.storeData,
                      schemaColumnAndOptions.defaultRequestOptions,
                    )
                    .then(() => {
                      resolve(null);
                    });
                });
              },
              ...(options.gridOptions && options.gridOptions.customConfig),
            }
          : undefined,
        exportConfig: {
          // excludeFields: ['index', 'action'],
          // includeFields: schemaColumnAndOptions.gridColumns
          //   .filter((item) => item.field !== 'index' && item.field !== 'action')
          //   .map((item) => {
          //     return item.field;
          //   }),
          columns:
            finalColumns && finalColumns.length > 0
              ? finalColumns
                  .filter(
                    (item) =>
                      item.field !== 'index' &&
                      item.field !== 'action' &&
                      item.type !== 'seq' &&
                      item.type !== 'checkbox',
                  )
                  .map((item) => {
                    return { field: item.field };
                  })
              : [],
          // columnFilterMethod: ({ column }) => {
          //   return column.field !== 'index' && column.field !== 'action';
          // },
          exportMethod: ({ options }: any) => {
            return new Promise<void>((resolve, reject) => {
              if (options.mode === 'all') {
                if (
                  schemaColumnAndOptions.queryTableDataApi &&
                  typeof schemaColumnAndOptions.queryTableDataApi === 'function'
                ) {
                  getAllTableDataByApi(
                    schemaColumnAndOptions.queryTableDataApi,
                    currentParams.value as GetAllTableDataParams,
                  ).then((res) => {
                    gridApi.grid
                      .exportData({
                        ...options,
                        data: res,
                        remote: false,
                      })
                      .then(() => {
                        resolve();
                      })
                      .catch((error) => {
                        reject(error);
                      });
                  });
                } else {
                  // 获取所有数据，然后再调用exportData方法
                  let handleDataFn;
                  if (
                    schemaColumnAndOptions.afterFetchFn &&
                    typeof schemaColumnAndOptions.afterFetchFn === 'function'
                  ) {
                    handleDataFn = schemaColumnAndOptions.afterFetchFn;
                  } else if (
                    handleTableDataFn &&
                    typeof handleTableDataFn === 'function'
                  ) {
                    handleDataFn = handleTableDataFn;
                  }
                  requests
                    .getAllTableData(
                      ((typeof schemaColumnAndOptions.queryUrl === 'function'
                        ? schemaColumnAndOptions.queryUrl()
                        : schemaColumnAndOptions.queryUrl) ||
                        schemaColumnAndOptions.dataTableId) as string,
                      currentParams.value as GetAllTableDataParams,
                      schemaColumnAndOptions.defaultRequestOptions,
                      handleDataFn,
                      serachParamsFormat,
                      schemaColumnAndOptions.beforeFetchFn,
                    )
                    .then((res: any) => {
                      gridApi.grid
                        .exportData({
                          ...options,
                          data: res,
                          remote: false,
                        })
                        .then(() => {
                          resolve();
                        })
                        .catch((error) => {
                          reject(error);
                        });
                    });
                }
              } else {
                gridApi.grid
                  .exportData({
                    ...options,
                    // columnFilterMethod: ({ column }) => {
                    //   return column.type !== 'seq' && column.title !== '操作';
                    // },
                    remote: false,
                  })
                  .then(() => {
                    resolve();
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
            });
          },
          modes: ['current', 'selected', 'all'],
          remote: true,
          types: ['xlsx', 'csv'],
          ...(options.gridOptions && options.gridOptions.exportConfig),
        },
        pagerConfig: {
          currentPage: 1,
          ...(options.gridOptions && options.gridOptions.pagerConfig),
        },
        columnDragConfig: {
          showIcon: false,
          trigger: 'cell',
          ...(options.gridOptions && options.gridOptions.columnDragConfig),
        },
        seqConfig: {
          seqMethod: (data: any) => {
            return (
              (currentParams.value.pageInfo.current - 1) *
                currentParams.value.pageInfo.size +
              data.rowIndex +
              1
            );
          },
          ...(options.gridOptions && options.gridOptions.seqConfig),
        },
        sortConfig: {
          remote: true,
          ...(options.gridOptions && options.gridOptions.sortConfig),
        },
        toolbarConfig:
          schemaColumnAndOptions.showToolbar === false
            ? undefined
            : {
                // size: 'mini',
                custom: schemaColumnAndOptions.showCustomBtn,
                // export: schemaColumnAndOptions.showExportBtn,
                refresh: schemaColumnAndOptions.showRefreshBtn,
                search: schemaColumnAndOptions.showSearchBtn,
                zoom: schemaColumnAndOptions.showZoomBtn,
                ...(options.gridOptions && options.gridOptions.toolbarConfig),
              },
        radioConfig: {
          highlight: false,
          trigger: 'row',
          ...(options.gridOptions && options.gridOptions.radioConfig),
        },
        rowConfig: {
          isCurrent: true,
          isHover: true,
          ...(options.gridOptions && options.gridOptions.rowConfig),
        },
        proxyConfig: {
          seq: true,
          sort: true,
          ajax: {
            query: async (optionmid: any, params: any) => {
              if (
                schemaColumnAndOptions.parentTableParams &&
                Object.keys(schemaColumnAndOptions.parentTableParams).length > 0
              ) {
                let emptyValue = true;
                for (const key in schemaColumnAndOptions.parentTableParams) {
                  if (
                    schemaColumnAndOptions.parentTableParams[key] ===
                      undefined ||
                    schemaColumnAndOptions.parentTableParams[key] === ''
                  ) {
                    emptyValue = true;
                    break;
                  } else {
                    emptyValue = false;
                  }
                }
                if (emptyValue) {
                  return options.gridOptions &&
                    options.gridOptions.pagerConfig &&
                    options.gridOptions.pagerConfig.enabled === false
                    ? []
                    : {
                        total: 0,
                        items: [],
                      };
                }
              }

              if (optionmid.sort && optionmid.sort.field) {
                sort.value = [
                  `${optionmid.sort.field} ${optionmid.sort.order}`,
                ];
              }
              const formValues = {
                ...params,
                // ...(openQuickSearch.value ? quickSearchForm.value : {}),
              };
              delete formValues.quickSearch;
              const page = optionmid.page;
              await nextTick();
              let finalParams = {
                cols: cols || [],
                current: page.currentPage,
                size: page.pageSize,
                sort: sort.value,
                ...formValues,
                ...schemaColumnAndOptions.parentTableParams,
                ...schemaColumnAndOptions.tableSearchExtraParams,
              };
              if (
                serachParamsFormat &&
                typeof serachParamsFormat === 'function'
              ) {
                finalParams = serachParamsFormat(finalParams);
              }
              if (
                schemaColumnAndOptions.beforeFetchFn &&
                typeof schemaColumnAndOptions.beforeFetchFn === 'function'
              ) {
                finalParams = schemaColumnAndOptions.beforeFetchFn(finalParams);
              }
              // finalParams 没值，不需要查询
              if (!finalParams) {
                return options.gridOptions &&
                  options.gridOptions.pagerConfig &&
                  options.gridOptions.pagerConfig.enabled === false
                  ? []
                  : {
                      total: 0,
                      items: [],
                    };
              }
              const handleUrl = (tableId: string = '') => {
                return tableId.includes('?')
                  ? `${tableId}&_menuPageAction=query`
                  : `${tableId}?_menuPageAction=query`;
              };
              const midRes = await (schemaColumnAndOptions.queryTableDataApi &&
              typeof schemaColumnAndOptions.queryTableDataApi === 'function'
                ? schemaColumnAndOptions.queryTableDataApi(finalParams)
                : requests.getDataTableList(
                    handleUrl(
                      ((typeof schemaColumnAndOptions.queryUrl === 'function'
                        ? schemaColumnAndOptions.queryUrl()
                        : schemaColumnAndOptions.queryUrl) ||
                        schemaColumnAndOptions.dataTableId) as string,
                    ),
                    finalParams,
                    schemaColumnAndOptions.defaultRequestOptions,
                  ));
              let res = null;
              if (
                schemaColumnAndOptions.afterFetchFn &&
                typeof schemaColumnAndOptions.afterFetchFn === 'function'
              ) {
                res = schemaColumnAndOptions.afterFetchFn(midRes);
              } else if (
                handleTableDataFn &&
                typeof handleTableDataFn === 'function'
              ) {
                res = handleTableDataFn(midRes);
              } else {
                res = midRes;
              }
              currentParams.value = {
                pageInfo: {
                  current: page.currentPage,
                  size: page.pageSize,
                  total: res.total,
                },
                params: finalParams,
                /**                params: {
                  cols: cols || [],
                  sort: sort.value,
                  ...formValues,
                  ...schemaColumnAndOptions.parentTableParams,
                  ...schemaColumnAndOptions.tableSearchExtraParams,
                  ...finalParams,
                },
*/
              };
              schemaColumnAndOptions.autoSelectFirstRow &&
                setTimeout(() => {
                  // 如果有 radioChange 事件，并且当前表格有数据
                  if (
                    (schemaColumnAndOptions.gridEvents || options.gridEvents) &&
                    typeof (
                      schemaColumnAndOptions.gridEvents || options.gridEvents
                    ).radioChange === 'function'
                  ) {
                    if (res.records && res.records.length > 0) {
                      gridApi.grid.setRadioRow(res.records[0]);
                      (
                        schemaColumnAndOptions.gridEvents || options.gridEvents
                      ).radioChange({ row: res.records[0] });
                    } else {
                      (
                        schemaColumnAndOptions.gridEvents || options.gridEvents
                      ).radioChange({});
                    }
                  } else {
                    if (res.records && res.records.length > 0) {
                      gridApi.grid.setRadioRow(res.records[0]);
                    } else {
                      gridApi.grid.clearRadioRow();
                    }
                  }
                }, 200);
              return options.gridOptions &&
                options.gridOptions.pagerConfig &&
                options.gridOptions.pagerConfig.enabled === false
                ? res.records
                : {
                    total: res.total,
                    items: res.records,
                  };
            },
          },
          ...(options.gridOptions && options.gridOptions.proxyConfig),
        },
        columns: finalColumns as Column[],
      };

      // 是否打开快捷搜索
      // const openQuickSearch = ref(schemaColumnAndOptions.openQuickSearch);
      // const quickSearchForm = ref({});
      // getQuickSearchFormInitValue(gridOptions.columns, quickSearchForm);
      const [MidGrid, gridApi]: readonly [
        DefineSetupFnComponent<
          VbenVxeGridProps,
          // eslint-disable-next-line @typescript-eslint/no-empty-object-type
          {},
          object,
          VbenVxeGridProps & {},
          PublicProps
        >,
        ExtendedVxeGridApi,
      ] = useVbenVxeGrid({
        ...options,
        gridOptions,
        formOptions:
          searchFormOptions.schema && searchFormOptions.schema.length > 0
            ? searchFormOptions
            : undefined,
        gridEvents: {
          ...(schemaColumnAndOptions.gridEvents || options.gridEvents),
          pageChange: (page: any) => {
            currentParams.value.pageInfo.size = page.pageSize;
            currentParams.value.pageInfo.current = page.currentPage;
            options.gridEvents &&
              options.gridEvents.pageChange &&
              options.gridEvents.pageChange(page);
          },
          sortChange: (sortData) => {
            sort.value = sortData.order
              ? [`${sortData.field} ${sortData.order}`]
              : [];
            gridApi.query();
            options.gridEvents &&
              options.gridEvents.sortChange &&
              options.gridEvents.sortChange(sortData);
          },
          toolbarToolClick: (toolbarToolClickParams) => {
            options.gridEvents &&
              options.gridEvents.toolbarToolClick &&
              options.gridEvents.toolbarToolClick(toolbarToolClickParams);
          },
        },
      });
      preGetGridApi = gridApi;
      /**
       * 在有依赖父表时，才会操作到此参数，用于控制表格的新增 导出按钮disabled状态
       * @default false 默认false，新增导出按钮可用
       */
      const depBtnDisabled = ref(false);
      if (
        schemaColumnAndOptions.parentTableParams &&
        Object.keys(schemaColumnAndOptions.parentTableParams).length > 0
      ) {
        // 依赖对象只要有一个没值，子表就禁用操作按钮
        for (const key in schemaColumnAndOptions.parentTableParams) {
          if (!schemaColumnAndOptions.parentTableParams[key]) {
            depBtnDisabled.value = true;
          }
        }
      }
      watch(
        () => {
          return schemaColumnAndOptions?.parentTableParams;
        },
        (val: SchemaColumnAndOptions['parentTableParams']) => {
          let emptyValue = true;
          for (const key in val) {
            if (val[key] === undefined || val[key] === '') {
              emptyValue = true; // 所有属性必须有值
              break;
            } else {
              emptyValue = false; // 至少有一个属性
            }
          }
          if (emptyValue) {
            depBtnDisabled.value = true;
            // 依赖值为空
            gridApi.grid.reloadData([]);
          } else {
            depBtnDisabled.value = false;
            gridApi.query();
          }
        },
        {
          deep: true,
        },
      );
      const handleExport = (opt?: any) => {
        gridApi.grid.openExport({
          columns:
            finalColumns && finalColumns.length > 0
              ? finalColumns
                  .filter(
                    (item) =>
                      item.field !== 'index' &&
                      item.field !== 'action' &&
                      item.field !== 'operation' &&
                      item.type !== 'seq' &&
                      item.type !== 'checkbox',
                  )
                  .map((item) => {
                    return { field: item.field };
                  })
              : [],
          mode: 'all',
          modes: ['current', 'selected', 'all'],
          remote: true,
          types: ['xlsx', 'csv'],
          filename: `导出-${dayjs().format('YYYYMMDDHHmmss')}`,
          sheetName: 'Sheet1',
          ...opt,
        });
      };
      const handleLog = (rowData: any) => {
        modals.logModalApi
          ?.setData({
            columns: { ...gridOptions, ...options.gridOptions }.columns,
            dataTableId:
              schemaColumnAndOptions.queryLogUrl ||
              schemaColumnAndOptions.dataTableId,
            keyCols: tablePrimaryKeys, // 当前表格那些列是可以作为日志数据key值的
            preview: false, // 数据表格设计器预览表格时使用，预览模式不控制界面权限
            rowData,
            isFormAreaVertical,
          })
          .open();
      };
      const hasBtnAccess = (code: BtnType) => {
        if (schemaColumnAndOptions.permissions?.[code]) {
          return hasAccessByCodes([schemaColumnAndOptions.permissions?.[code]]);
        } else if (schemaColumnAndOptions.dataTableId) {
          return hasAccessByCodes([
            `${schemaColumnAndOptions.dataTableId}.${code}`,
          ]);
        } else {
          return true;
        }
      };
      const Grid = defineComponent(
        (props: VbenVxeGridProps, { attrs, slots }) => {
          return () =>
            h('div', { class: 'w-full h-full' }, [
              h(modals.LogModal as DefineSetupFnComponent<any>),
              h(modals.FormModal as DefineSetupFnComponent<any>),
              h(
                MidGrid,
                { ...props, ...attrs },
                {
                  ...slots,
                  action: cellMenuColumn
                    ? (scope: any) => {
                        return cellMenuComp(scope);
                      }
                    : (scope: any) => slots.action && slots.action(scope),
                  'toolbar-actions': slots['toolbar-actions']
                    ? (scope: any) =>
                        [
                          schemaColumnAndOptions.showAddBtn &&
                          hasBtnAccess('add')
                            ? h(
                                Button,
                                {
                                  type: 'primary',
                                  onClick: () => {
                                    handleAdd();
                                  },
                                  class: 'mr-[10px]',
                                  'data-testid': `addBtn_${getTableId()}`,
                                  disabled: depBtnDisabled.value,
                                },
                                {
                                  default: () => '新增',
                                  icon: () =>
                                    h(AntdPlusCircleTwotone, {
                                      style: {
                                        marginBottom: '4px',
                                      },
                                    }),
                                },
                              )
                            : null,
                          schemaColumnAndOptions.showExportBtn &&
                          hasBtnAccess('export')
                            ? h(
                                Button,
                                {
                                  type: 'primary',
                                  onClick: () => {
                                    handleExport();
                                  },
                                  class: 'mr-[0.75rem]',
                                  'data-testid': `exportBtn_${getTableId()}`,
                                  disabled: depBtnDisabled.value,
                                },
                                {
                                  default: () => '导出',
                                  icon: () =>
                                    h(ExportActionIcon, {
                                      style: {
                                        marginBottom: '2px',
                                      },
                                    }),
                                },
                              )
                            : null,
                          slots['toolbar-actions']?.(scope),
                        ].filter(Boolean)
                    : () =>
                        [
                          schemaColumnAndOptions.showAddBtn &&
                          hasBtnAccess('add')
                            ? h(
                                Button,
                                {
                                  type: 'primary',
                                  onClick: () => {
                                    handleAdd();
                                  },
                                  class: 'mr-[10px]',
                                  'data-testid': `addBtn_${getTableId()}`,
                                  disabled: depBtnDisabled.value,
                                },
                                {
                                  default: () => '新增',
                                  icon: () =>
                                    h(AntdPlusCircleTwotone, {
                                      style: {
                                        marginBottom: '4px',
                                      },
                                    }),
                                },
                              )
                            : null,
                          schemaColumnAndOptions.showExportBtn &&
                          hasBtnAccess('export')
                            ? h(
                                Button,
                                {
                                  type: 'primary',
                                  onClick: () => {
                                    handleExport();
                                  },
                                  class: 'mr-[0.75rem]',
                                  'data-testid': `exportBtn_${getTableId()}`,
                                  disabled: depBtnDisabled.value,
                                },
                                {
                                  default: () => '导出',
                                  icon: () =>
                                    h(ExportActionIcon, {
                                      style: {
                                        marginBottom: '2px',
                                      },
                                    }),
                                },
                              )
                            : null,
                        ].filter(Boolean),
                  'toolbar-tools': (scope: any) =>
                    slots['toolbar-tools']?.(scope),
                },
              ),
            ]);
        },
      );

      return [
        Grid,
        gridApi,
        {
          LogModal: modals.LogModal as DefineSetupFnComponent<any>,
          logModalApi: modals.logModalApi as ExtendedModalApi,
          FormModal: modals.FormModal as DefineSetupFnComponent<any>,
          formModalApi: modals.formModalApi as ExtendedModalApi,
          handleAdd,
          handleEdit,
          handleView,
          handleDel: useDelFn(gridApi),
          ...customModals,
          handleExport,
          handleLog,
        },
      ];
    }
  };

  return { useChcGrid };
}

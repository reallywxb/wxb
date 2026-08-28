<script setup lang="ts">
import type { ChcSelectOption } from '@vben/chc-ui';
import type { VbenFormProps, ExtendedFormApi } from '@vben/common-ui';
import type { SchemaColumnAndOptions } from '#/adapter/chc-ui';
import type { VxeGridProps } from '#/adapter/vxe-table.js';
import { useVbenModal } from '@vben/common-ui';
import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { VbenLoading } from '@vben/common-ui';
import { EmptyIcon } from '@vben/chc-icons';
import {
  AddActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
  SvgSaveIcon,
  UploadCloudIcon,
  viewActionIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';

import { Button, Input, message } from 'ant-design-vue';
import { merge } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { VbenChcTable } from '#/adapter/vxe-table.js';
import { promiseController } from '#/utils/util';
import { saveDataTableColumnConfig, queryDataTableColumnConfig } from './apis';
import BatchAddContent from './batchAdd.vue';
import ActionLogContent from './actionLog.vue';
type SlotsConfig = {
  /**
   * 定义顶部左侧工具栏的左侧区域插槽名
   */
  toolbarActionsLeft?: string;
  /**
   * 定义顶部左侧工具栏的右侧区域插槽名
   */
  toolbarActionsRight?: string;
  /**
   * 定义顶部右侧工具栏的左侧区域插槽名
   */
  toolbarToolsLeft?: string;
  /**
   * 定义顶部右侧工具栏的右侧区域插槽名
   */
  toolbarToolsRight?: string;
  /**
   * 定义操作区按钮左侧插槽名
   */
  actionLeft?: string;
  /**
   * 定义操作区按钮右侧插槽名
   */
  actionRight?: string;
  /**
   * 是否显示单选下拉
   */
  showSingleSelect?: boolean;
  /**
   * 是否显示批量新增按钮
   */
  showBatchAddBtn?: boolean;
  /**
   * 是否显示批量删除按钮
   */
  showBatchDelBtn?: boolean;
  /**
   * 是否显示搜索功能
   */
  showSearchArea?: boolean;
  /**
   * 是否显示删行按钮
   */
  showDelRowBtn?: boolean;
  /**
   * 是否显示查看操作记录按钮
   */
  showViewLogBtn?: boolean;
};
type EditableTablePropsType = {
  /**
   * 黑名单使用的下拉框字段
   * 表格行里应该也要有同名字段，用来在初始化时同步黑名单
   */
  blackListField?: string;
  /**
   * 处理行删除
   */
  deleteRows?: (rows: any[], scope?: any) => Promise<any>;
  /**
   * 表单配置，用来覆盖默认配置
   */
  formOptions?: VbenFormProps;
  /**
   * 表单schema数组
   */
  formSchema?: VbenFormProps['schema'];
  /**
   * 获取最终的添加行数据
   * 在单个新增和批量新增时根据用户选择的数据，调用接口获取实际新增行初始数据
   */
  getFinalAddRowData?: (option: any, formVal: any) => Promise<any>;
  /**
   * 表格列配置
   */
  gridColumns: VxeGridProps['columns'];
  /**
   * 表格自定义配置，用来覆盖默认配置
   */
  gridOptions?: Omit<VxeGridProps, 'columns' | 'data'>;
  /**
   * 处理表格右上角的查询
   */
  handleSearch?: (val: string) => void;
  /**
   * 打开批量新增弹窗方法
   */
  openBatchAddModal?: () => void;
  /**
   * 打开日志弹窗
   */
  openLogModal?: (row: any) => void;
  /**
   * 前端行数据校验方法
   * 用于在用户编辑完行数据，保存时，校验用户的行数据
   */
  rowDataValidate?: (row?: any, scope?: any) => Promise<boolean>;

  /**
   * 处理行保存
   * 调用接口处理行保存逻辑
   */
  saveRow?: (row: any, scope?: any) => Promise<any>;
  /**
   * 用于搜索后根据这个校验方法校验当前行是否设置为checked状态
   */
  searchCheckedValidate?: (row: any) => boolean;
  /**
   * 单选下拉ChcSelect组件属性，用于覆盖默认属性
   */
  singleSelectProps?: ChcSelectOption;
  /**
   * 用于校验当前是否可以添加行
   * 某些场景下可能必须在表单项中选择了某些项才能新增
   */
  validateIfCanAddRow?: (val?: any, option?: any) => Promise<boolean>;
  /**
   * 可编辑表当前模式 新增模式 编辑模式 查看模式
   * 不同模式显示的东西不一样
   */
  viewType?: 'add' | 'edit' | 'view';

  /**
   * 整体保存
   */
  totalSave?: (wholeData?: {
    created: any[];
    update: any[];
    removed: any[];
  }) => Promise<any>;
  /**
   * 整体提交
   */
  totalSubmit?: (wholeData: {
    created: any[];
    update: any[];
    removed: any[];
  }) => Promise<any>;
  /**
   * 自动行存还是手动整体保存
   *
   * 1. 自动行存逻辑，每操作完一行，都自动将该数据存下来 autoSaveRow
   * 行在editClose时自动保存，此时需要处理外部按钮点击和行保存的顺序问题
   * 每次保存时，需要修改行数据状态并更新源数据
   *
   * 2. 手动保存整体数据，用户随便操作，最终整体保存 manualTotalSave
   * 源数据删除时记下删除行 进入removedRows
   * 添加的数据加入createdRows
   * 最终判断还存在的源数据是否有更新，同originRows比较，添加到 updateRows
   * 那最终的数据组成的对象给到外部供使用者使用
   */
  saveMode?: 'autoSaveRow' | 'manualTotalSave';
  /**
   * 表格ID
   */
  id: string;
  /**
   * 批量新增弹窗表单配置
   */
  batchAddModalFormOptions?: VbenFormProps;
  /**
   * 批量新增弹窗表格配置
   */
  batchAddModalGridOptions?: SchemaColumnAndOptions;
  /**
   * 日志弹窗表格配置
   */
  queryActionLogParams?: (row: any) => {
    Record_ID: string;
    AD_Table_ID: number;
  };
  /**
   * 插槽配置
   * 现有表格顶部支持 toolbar-actions 和  toolbar-tools 两个插槽用于完全定制左侧和右侧工具栏区域
   * 操作列支持通过action插槽完全定制该区域
   */
  slotsConfig?: SlotsConfig;
  /**
   * 单选下拉选择时的回调
   * resolve(true) 就会继续走默认的新增一行逻辑
   * resolve(false) 就会将默认的新增逻辑截断，不走后续逻辑，若想完全自定义新增逻辑，就在这个方法里resolve(false)
   */
  handleSingleChoose?: (val?: any, option?: any) => Promise<boolean>;
  /**
   * 用于搜索组件的属性
   */
  searchInputProps?: { [key: string]: any };
  /**
   * 是否可以删行
   */
  canDeleteRow?: boolean;
};
const props = withDefaults(defineProps<EditableTablePropsType>(), {
  viewType: 'add',
  singleSelectProps: () => ({}),
  gridOptions: () => ({}),
  formSchema: () => [],
  formOptions: () => ({}),
  validateIfCanAddRow: undefined,
  getFinalAddRowData: undefined,
  rowDataValidate: undefined,
  saveRow: undefined,
  deleteRows: undefined,
  blackListField: 'productCode',
  openBatchAddModal: undefined,
  openLogModal: undefined,
  handleSearch: undefined,
  saveMode: 'autoSaveRow',
  searchCheckedValidate: undefined,
  totalSave: undefined,
  totalSubmit: undefined,
  batchAddModalFormOptions: undefined,
  batchAddModalGridOptions: undefined,
  canDeleteRow: true,
  // rowDataValidate: (_: any) => {
  //   return new Promise<boolean>((resolve) => {
  //     resolve(false);
  //   });
  // },
  // saveRow: (row: any) => {
  //   return new Promise<any>((resolve) => {
  //     resolve(row);
  //   });
  // },
  // validateIfCanAddRow: () => {
  //   return new Promise<boolean>((resolve) => {
  //     resolve(false);
  //   });
  // },
  // gridColumns: () => [],
});
const defaultSlotsConfig: SlotsConfig = {
  toolbarActionsLeft: undefined,
  toolbarActionsRight: undefined,
  showSingleSelect: true,
  showBatchAddBtn: true,
  showBatchDelBtn: true,
  showSearchArea: true,
  showDelRowBtn: true,
  showViewLogBtn: true,
};
const finalSlotsConfig = computed(() => {
  return merge(defaultSlotsConfig, props.slotsConfig);
});
// 定义emits
const emits = defineEmits([
  'editActivated',
  'editClose',
  'blackListChange',
  'gridDataChange',
]);

// 定义一些组件的ref
const vbenChcTableRef = ref<InstanceType<typeof VbenChcTable>>();
const chcSelectRef = ref();
const selectOpen = ref(false);
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
watch(
  () => blackList.value.length,
  () => {
    emits('blackListChange', blackList.value);
  },
);

// 最终用于渲染下拉数据和批量添加表格时使用的黑名单
// 兼容不需要黑名单的场景
const finalBlackList = computed(() => {
  if (props.singleSelectProps.blackList) {
    return props.singleSelectProps.blackList;
  } else {
    return blackList.value;
  }
});
/**
 * 当前正在编辑的行
 */
const currentEditRow = ref();
// 获取可编辑列数组
const originEditFieldArr: string[] = props
  .gridColumns!.filter((item) => {
    return item.editRender && (item.editRender.name || item.slots?.edit);
  })
  .map((item) => {
    // 生成编辑项列表时，顺便把编辑项配置改一下
    if (item.editRender) {
      if (item.editRender.name === 'ChcInput' && !item.editRender.autoFocus) {
        item.editRender.autoFocus = '.ant-input';
      }
      if (
        item.editRender.name === 'ChcInputNumber' &&
        !item.editRender.autoFocus
      ) {
        item.editRender.autoFocus = '.ant-input-number input';
      }
      if (item.editRender.name === 'ChcSelect' && !item.editRender.autoFocus) {
        item.editRender.autoFocus = '.ant-select input';
      }
      if (
        item.editRender.name === 'ChcDatePicker' &&
        !item.editRender.autoFocus
      ) {
        item.editRender.autoFocus = '.ant-picker-input input';
      }
      if (item.editRender.props) {
        item.editRender!.props!.handleEditItemFocus = handleEditItemFocus;
        if (
          (item.editRender.name === 'ChcSelect' ||
            item.editRender.name === 'ChcDatePicker') &&
          !item.editRender.props.getPopupContainer
        ) {
          item.editRender!.props!.getPopupContainer = () =>
            document.querySelector(
              '.editableTable-container .vxe-table--layout-wrapper',
            );
        }
      } else {
        item.editRender.props = {
          handleEditItemFocus: handleEditItemFocus,
          getPopupContainer: () =>
            document.querySelector(
              '.editableTable-container .vxe-table--layout-wrapper',
            ),
        };
      }
    }
    return item.field!;
  });
// console.log("originEditFieldArr:",originEditFieldArr);
const editFieldArr = ref<any[]>(originEditFieldArr);
function handleEditItemFocus(field: string) {
  currentFocus.value = field;
}

const finalFormOptions: VbenFormProps = merge(
  {
    fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    // showCollapseButton: false,
    // showDefaultActions: false,
    showCollapseButton: true,
    collapsed: false, // 初始状态是否折叠
    showDefaultActions: true,
    submitButtonOptions: { show: false },
    resetButtonOptions: { show: false },
    commonConfig: {
      // labelClass: 'w-[88px]',
      // labelWidth:90
    },
    wrapperClass:
      'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5 pb-0',
    compact: false,
    schema: props.formSchema,
  },
  props.formOptions,
);
const TOOLBAR_ACTIONS = 'toolbar-actions';
const TOOLBAR_TOOLS = 'toolbar-tools';
const loading = ref(false);
const gridData = ref<NonNullable<VxeGridProps['data']>>([]);
watch(
  () => gridData.value.length,
  () => {
    emits('gridDataChange', gridData.value);
  },
);
const gridOptions = computed<VxeGridProps<any>>(() => {
  const finalOptions: VxeGridProps<any> = merge(
    {
      id: 'buyplan',
      checkboxConfig: {
        trigger: 'default',
        // checkMethod: ({ row }: any) => {
        //   return row.orderPlanLineId;
        // },
      },
      keyboardConfig: {
        isEdit: true,
      },
      size: 'mini',
      keepSource: false,
      height: 'auto',
      pagerConfig: {
        enabled: false,
      },
      showOverflow: true,
      proxyConfig: {
        autoLoad: false,
      },
      border: true,
      cellConfig: {
        height: 32,
      },
      rowConfig: {
        isCurrent: false,
      },
      editConfig: {
        mode: 'row',
        trigger: 'click', // dblclick
        showStatus: false,
        showIcon: false,
        autoClear: true,
        enabled: props.viewType !== 'view',
      },
      columnConfig: {
        drag: true,
        resizable: true,
      },
      columnDragConfig: {
        showIcon: false,
        trigger: 'cell',
      },
      virtualYConfig: {
        enabled: true,
        gt: 20,
      },
      virtualXConfig: {
        enabled: true,
        gt:10
      },
      toolbarConfig: {
        custom: true,
        slots: {
          buttons: TOOLBAR_ACTIONS,
          tools: TOOLBAR_TOOLS,
        },
      },
      customConfig: {
        // immediate: true,
        restoreStore: () => {
          return new Promise((resolve) => {
            queryDataTableColumnConfig(
              `EditableTable-${location.pathname}`,
              props.id,
              {},
            ).then((res) => {
              if (res && res.data) {
                // 兼容表格列配置为string和obj的情况
                if (typeof res.data === 'string') {
                  let resData: any;
                  try {
                    resData = JSON.parse(res.data);
                    if (resData.sortData && resData.sortData.length > 0) {
                      const newArr: string[] = [];
                      resData.sortData.forEach((item: any) => {
                        if (
                          originEditFieldArr.some(
                            (field) => field === item.k,
                          ) &&
                          (!resData.visibleData ||
                            !(item.k in resData.visibleData))
                        ) {
                          newArr.push(item.k);
                        }
                      });
                      editFieldArr.value = newArr;
                    }
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
            saveDataTableColumnConfig(
              `EditableTable-${location.pathname}`,
              props.id,
              params.storeData,
              {},
            ).then(() => {
              // console.log('updateStore:', params);
              if (
                params.storeData.sortData &&
                params.storeData.sortData.length > 0
              ) {
                const newArr: string[] = [];
                params.storeData.sortData.forEach((item: any) => {
                  if (
                    originEditFieldArr.some((field) => field === item.k) &&
                    (!params.storeData.visibleData ||
                      params.storeData.visibleData[item.k] !== false)
                  ) {
                    newArr.push(item.k);
                  }
                });
                editFieldArr.value = newArr;
              } else {
                editFieldArr.value = originEditFieldArr;
              }
              resolve(null);
            });
          });
        },
      },
    },
    {
      ...props.gridOptions,
      cellStyle: (scope: any) => {
        const finalStyle: { [key: string]: number | string } = {
          color: '',
          backgroundColor: '',
        };
        if (
          editFieldArr.value.includes(scope.column.field) &&
          props.viewType !== 'view'
        ) {
          finalStyle.backgroundColor = '#D7FFF5';
        }
        let midObj;
        if (
          props.gridOptions.cellStyle &&
          typeof props.gridOptions.cellStyle === 'function'
        ) {
          midObj = props.gridOptions.cellStyle?.(scope);
        }

        return merge(finalStyle, midObj);
      },
      rowStyle: (scope: any) => {
        const finalStyle: { [key: string]: number | string } = {
          color: '',
          backgroundColor: '',
        };
        if (scope && scope.row && scope.$table.isEditByRow(scope.row)) {
          finalStyle.backgroundColor = '#E0FFFC';
          finalStyle.color = '#000';
        } else if (scope && scope.row && scope.row.$status === 'insert') {
          finalStyle.backgroundColor = '#CEFFE4';
          finalStyle.color = '#000';
        } else if (scope && scope.row && scope.row.$status === 'error') {
          finalStyle.backgroundColor = '#FFE2E2';
          finalStyle.color = '#000';
        }
        let midObj;
        if (
          props.gridOptions.rowStyle &&
          typeof props.gridOptions.rowStyle === 'function'
        ) {
          midObj = props.gridOptions.rowStyle?.(scope);
        }
        return merge(finalStyle, midObj);
      },
    },
  );
  return finalOptions;
});

/**
 * 行保存方法
 * 1. 先调行数据校验方法，前端校验
 * 2. 再调行数据保存接口，存数据
 */
function handleSaveRow(scope: any) {
  return new Promise((resolve, reject) => {
    (async () => {
      // 行保存过程中先前端校验行数据
      if (
        props.rowDataValidate &&
        typeof props.rowDataValidate === 'function'
      ) {
        const [validate] = await promiseController(
          props.rowDataValidate,
          scope.row,
          scope,
        );
        if (!validate) {
          reject(new Error('行数据校验失败:[msg]'));
          return;
        }
      }
      // 再保存行数据
      if (props.saveRow && typeof props.saveRow === 'function') {
        const [finalRow, error] = await promiseController(
          props.saveRow,
          scope.row,
          scope,
        );
        if (finalRow !== null) {
          resolve(finalRow || {});
        } else {
          reject(error || new Error('保存失败！'));
        }
      } else {
        console.error(
          '[EditableTable]:行保存方法不存在，请提供用于保存行的方法!',
        );
        reject(new Error('不存在行保存方法'));
      }
    })();
  });
}
/**
 * 用来标记一行正在删除
 * 1. 若删除的是当前操作行，该数据会有值，此时在退出编辑方法内不保存该行
 * 2. 若删除的不是当前行，会先走退出编辑保存，然后再进删除逻辑内
 * 此时应将删除方法放进队列，在保存完成后将队列中的方法取出并执行
 */
const statusPair = ref<['' | 'isDeleting', any]>(['', undefined]);
const waitQueue: any[] = [];
const isOnSaving = ref(false);
/**
 * 退出编辑状态
 */
async function handleEditClosed(scope: any) {
  emits('editClose', scope);
  if (props.saveMode === 'autoSaveRow') {
    // debugger;
    // 当发现此刻正在删除行时，说明是在删除逻辑里退出的编辑
    // 若删除的不是当前行，会先保存，再执行删除逻辑
    if (
      statusPair.value[0] === 'isDeleting' &&
      scope.row.$uuid === statusPair.value[1].$uuid
    ) {
      // debugger;
      // 若删除的就是当前行，就不用执行保存逻辑了
      return;
    }
    currentEditRow.value = undefined;
    const oriRow = originRows.value.find((item) => {
      return item.$uuid === scope.row.$uuid;
    });
    // const curRow = gridData.value.find((item) => {
    //   return item.$uuid === scope.row.$uuid;
    // });
    // 源数据内有当前行，需要判断该行是否有改动，有改动才执行保存逻辑
    if (oriRow) {
      // 当前行没有变化，不保存
      let needSave = false;
      for (let i = 0; i < editFieldArr.value?.length; i++) {
        if (
          oriRow[editFieldArr.value[i]] !== scope.row[editFieldArr.value[i]]
        ) {
          needSave = true;
        }
      }
      if (!needSave) {
        // 没有变化，此时需要将curRow重置回原状态
        for (const key in oriRow) {
          scope.row[key] = oriRow[key];
        }
        scope.row.$status = 'saved';
        if (isOnEnterSave.value) {
          isOnEnterSave.value = false;
          autoNext(scope); // 自动执行下一个操作
        }
        return;
      }
    }
    scope.row.loading = true;
    isOnSaving.value = true;
    // 调用保存方法
    const [finalRow, error] = await promiseController(handleSaveRow, scope);
    scope.row.loading = false;
    isOnSaving.value = false;
    if (finalRow) {
      // 保存成功，根据接口更新行数据
      for (const key in finalRow) {
        scope.row[key] = finalRow[key];
      }
      // 此时根据 $status 状态更新源数据
      if (
        scope.row.$status === 'insert' ||
        (scope.row.$status === 'error' &&
          !originRows.value.some((item) => item.$uuid === scope.row.$uuid))
      ) {
        // insert行保存，直接将该行加入到源数据
        originRows.value.push({ ...scope.row, $status: 'saved' });
      } else {
        // 已存在该行，更新源数据
        for (const key in scope.row) {
          oriRow[key] = scope.row[key];
        }
      }
      scope.row.$status = 'saved';
      // 如果是enter保存的，保存后要自动执行后续逻辑
      if (isOnEnterSave.value) {
        autoNext(scope); // 自动执行下一个操作
        isOnEnterSave.value = false;
      }
    } else if (error) {
      // 标记行状态为错误
      scope.row.$status = 'error';
      if (isOnEnterSave.value) {
        // 保存失败，如果是enter保存的，需要重新聚焦失败行数据
        scope.$grid.setEditRow(scope.row, true);
        isOnEnterSave.value = false;
      }
      // 打印失败日志
      console.error('[EditableTable]:行保存失败', finalRow, error.message);
    } else if (finalRow === undefined) {
      // 保存后会调查询接口获取行全量数据回显，若未获取到，此处会是undefined
    }
    // 保存结束，开始执行等待队列中的方法
    if (waitQueue.length > 0) {
      for (let i = 0; i < waitQueue.length; i++) {
        const [fn, ...args] = waitQueue.shift();
        await fn(...args);
      }
    }
  } else if (props.saveMode === 'manualTotalSave') {
    currentEditRow.value = undefined;
    if (isOnEnterSave.value) {
      autoNext(scope); // 自动执行下一个操作
      isOnEnterSave.value = false;
    }
  }
}
/**
 * 进入编辑状态
 */
function handleEditActivated(scope: any) {
  currentEditRow.value = scope.row;
  emits('editActivated', scope);
}
/**
 * 进入默认的编辑流程
 * 1. 编辑错误行
 * 2. 编辑插入行
 * 3. 打开单选下拉
 */
function autoNext(scope: any, curIndex?: number) {
  if (props.saveMode === 'autoSaveRow') {
    const errorRow = gridData.value.find((item) => {
      return item.$status === 'error';
    });

    const insertRow = gridData.value.find((item) => {
      return item.$status === 'insert';
    });
    if (errorRow) {
      // 找到error行，开始编辑
      scope.$grid.setEditRow(errorRow, true);
    } else if (insertRow) {
      // 找到insert行，开始编辑
      scope.$grid.setEditRow(insertRow, true);
    } else {
      // 打开单选下拉 openSelect
      openSelect();
    }
  } else if (props.saveMode === 'manualTotalSave') {
    if (curIndex === undefined) {
      if (scope.row) {
        // 行按回车键去到下一节点 此时有 能在gridData里获取到curIndex
        const curIndex = gridData.value.findIndex(
          (item) => item.$uuid === scope.row.$uuid,
        );
        // 在gridData内找到 curIndex 后的第一行，聚焦，若没有 打开单选下拉
        if (curIndex < gridData.value.length - 1) {
          scope.$grid.setEditRow(gridData.value[curIndex + 1], true);
        } else {
          openSelect();
        }
      } else {
        // 直接ctrl+F，此时没有scope.row  从第一行开始编辑
        if (gridData.value.length > 0) {
          scope.$grid.setEditRow(gridData.value[0], true);
        } else {
          openSelect();
        }
      }
    } else {
      // 按delete键删除行 curIndex 是删除时的index
      if (curIndex < gridData.value.length) {
        scope.$grid.setEditRow(gridData.value[curIndex], true);
      } else {
        openSelect();
      }
    }
  }
}
/**
 * 打开单选下拉
 */
const openSelect = () => {
  chcSelectRef.value?.focus();
  chcSelectRef.value?.fetchApi();
};
// 头部右侧搜索功能
const serachInputVal = ref(undefined); // 输入框值
function handleIptSearch() {
  if (props.handleSearch && typeof props.handleSearch === 'function') {
    props.handleSearch(serachInputVal.value || '');
  } else {
    if (serachInputVal.value) {
      // 将所有匹配输入值的项check状态改为选中
      for (let i = 0; i < gridData.value.length; i++) {
        const item = gridData.value[i];
        if (
          props.searchCheckedValidate &&
          typeof props.searchCheckedValidate === 'function'
        ) {
          if (props.searchCheckedValidate(item)) {
            vbenChcTableRef.value?.gridApi.setCheckboxRow(item, true);
            vbenChcTableRef.value?.gridApi.scrollToRow(item);
          }
        } else {
          if (
            (item.productCode &&
              item.productCode.includes(serachInputVal.value)) ||
            (item.productName &&
              item.productName.includes(serachInputVal.value)) ||
            (item.productValue &&
              item.productValue.includes(serachInputVal.value))
          ) {
            vbenChcTableRef.value?.gridApi.setCheckboxRow(item, true);
            vbenChcTableRef.value?.gridApi.scrollToRow(item);
          }
        }
      }
    }
  }
}
/**
 * 查看操作记录
 */
function viewLog(scope: any) {
  if (props.openLogModal && typeof props.openLogModal === 'function') {
    props.openLogModal(scope.row);
  } else {
    if (
      props.queryActionLogParams &&
      typeof props.queryActionLogParams === 'function'
    ) {
      actionLogParams.value = props.queryActionLogParams(scope.row);
      actionLogModalApi?.open();
    } else {
      console.error(
        '[EditableTable]:查看操作记录功能需要传入获取日志params方法"queryActionLogParams"，若希望完全自主控制日志弹窗，请传入"openLogModal"方法并在方法内自行处理弹窗逻辑',
      );
    }
  }
}

/**
 * 生成符合 UUID v4 格式的随机字符串。
 * 优先使用 crypto.randomUUID()（需要安全上下文），否则使用降级方案。
 */
function generateUUID(): string {
  // 优先使用原生方法
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // 降级方案：基于 crypto.getRandomValues() 手动构造 UUID v4
  return '10000000-1000-4000-8000-100000000000'.replaceAll(
    /[018]/g,
    (char: string): string => {
      const c = Number.parseInt(char, 16); // 将匹配到的字符转换为数字
      const randomByte = crypto.getRandomValues(new Uint8Array(1))[0]!; // 获取一个随机字节 (0–255)
      // 完全遵循原始位运算逻辑：
      // (c ^ (randomByte & (15 >> (c / 4)))).toString(16)
      const result = c ^ (randomByte & (15 >> (c / 4)));
      return result.toString(16);
    },
  );
}
// 定义一个源数据，用来自主控制数据状态
/**
 * 数据控制策略
 * 1. 初始化时，行标记为saved 直接往源数据内添加初始行数据
 * 2. 新增行时，行标记为insert 不加入源数据 批量新增行时，逻辑一致
 * 3. 新增行保存时，行标记为saved 加入源数据
 * 4. 修改行时 不做处理
 * 5. 修改行保存时，根据源数据和当前数据，判断该行是否有改动，若有改动，行保存接口调用成功后
 * 将该行标记为saved 并且修改源数据
 * 6. 删除行时，若该行数据在源数据内，删除接口成功后，直接删除源数据和当前数据的该项
 * 行数据不在源数据内，无需调接口，直接在当前数据内删除该项
 * 7. 批量删除行时，将在源数据内的数据整合起来，统一调用删除接口，成功后，
 * 将源数据内包含的应删除数据删掉，当前数据内的删除数据也删掉
 */
const originRows = ref<any[]>([]);
let removedRows: any[] = []; //用来处理在非行存的情况下，被删除的原始数据
// 初始化时加载初始行数据
const initRows = (rows: any[]) => {
  blackList.value = [];
  originRows.value = [];
  gridData.value = [];
  removedRows = [];
  rows.forEach((item: any) => {
    !new Set(blackList.value).has(item![props.blackListField]) &&
      blackList.value.push(item![props.blackListField]);
    vbenChcTableRef.value?.gridApi.createRow(item).then((row: any) => {
      row.$status = 'saved';
      row.$uuid = generateUUID();
      gridData.value.push(row);
      originRows.value.push({ ...row });
    });
  });
};
// 选择一个商品
const handleChoose = async (val: any, option: any = {}) => {
  selectOpen.value = false;
  if (
    props.handleSingleChoose &&
    typeof props.handleSingleChoose === 'function'
  ) {
    const [res, error] = await promiseController(
      props.handleSingleChoose,
      val,
      option,
    );
    if (!res) {
      chcSelectRef.value.modelValue = undefined; // 清空下拉组件
      chcSelectRef.value.blur();
      return null;
    }
  }
  if (
    props.validateIfCanAddRow &&
    typeof props.validateIfCanAddRow === 'function'
  ) {
    const result = await props.validateIfCanAddRow(val, option);
    if (!result) {
      chcSelectRef.value.modelValue = undefined; // 清空下拉组件
      chcSelectRef.value.blur();
      return null;
    }
  }
  await nextTick();
  chcSelectRef.value.modelValue = undefined; // 清空下拉组件
  if (vbenChcTableRef.value) {
    loading.value = true;
    const formValue = await vbenChcTableRef.value?.formApi.getValues();
    let record = option;
    if (
      props.getFinalAddRowData &&
      typeof props.getFinalAddRowData === 'function'
    ) {
      const [finalRowData] = await promiseController(
        props.getFinalAddRowData,
        option,
        formValue,
      );
      if (!finalRowData) {
        console.warn(
          '[EditableTable]:props.getFinalAddRowData方法调用后未获取到实际需添加的行数据，请检查该方法是否有问题！',
        );
      }
      finalRowData && (record = finalRowData);
    }

    vbenChcTableRef.value?.gridApi.createRow(record).then((res: any) => {
      loading.value = false;
      res.$status = 'insert';
      res.$uuid = generateUUID();
      gridData.value.push(res);
      !new Set(blackList.value).has(val) && blackList.value.push(val);
      setTimeout(async () => {
        await vbenChcTableRef.value?.gridApi.scrollToRow(res);
        vbenChcTableRef.value?.gridApi.setEditRow(res, true);
      });
    });
  }
};
/**
 * 用于开发自定义表格数据，该方法可以在表格任意位置插入数据
 */
const tableInsertRow = (
  row: any,
  indexOrRow?: number | any,
  cb?: (res: any) => void,
) => {
  vbenChcTableRef.value?.gridApi.createRow(row).then((res: any) => {
    res.$status = 'insert';
    res.$uuid = generateUUID();
    if (typeof indexOrRow === 'number') {
      if (indexOrRow === -1) {
        gridData.value.push(res);
      } else {
        gridData.value.splice(indexOrRow, 0, res);
      }
    } else {
      const index = gridData.value.findIndex(
        (item) => item.$uuid === indexOrRow.$uuid,
      );
      gridData.value.splice(index, 0, res);
    }

    !new Set(blackList.value).has(row[props.blackListField]) &&
      blackList.value.push(row[props.blackListField]);
    if (cb && typeof cb === 'function') {
      // 用户给了回调函数，就执行回调函数
      cb(res);
    } else {
      // 默认执行滚动到该行并聚焦操作
      setTimeout(async () => {
        await vbenChcTableRef.value?.gridApi.scrollToRow(res);
        vbenChcTableRef.value?.gridApi.setEditRow(res, true);
      });
    }
  });
};
/**
 * 删除单行
 */
async function handleDeleteRow(
  scope: any,
  type: 'keyboard' | 'manual' = 'manual',
) {
  if (props.saveMode === 'autoSaveRow') {
    // 删除的不是正在编辑的行，会先进editClose，通过下面的逻辑，让删除动作在保存之后执行，防止同步执行出现问题
    if (isOnSaving.value) {
      waitQueue.push([handleDeleteRow, scope, type]);
      return;
    }
    scope.row.loading = true;
    // 如果删除的是当前正在编辑的行，通过statusPair来在editClose方法中知道当前正在删除编辑行，从而不执行保存操作
    statusPair.value[0] = 'isDeleting';
    statusPair.value[1] = scope.row;
    await scope.$grid.clearEdit();
    const blackListIndex = blackList.value.indexOf(
      scope.row[props.blackListField],
    );
    const oriIndex = originRows.value.findIndex((item) => {
      return item.$uuid === scope.row.$uuid;
    });
    // const oriRow = originRows.value.find((item) => {
    //   return item.$uuid === scope.row.$uuid;
    // });
    const curIndex = gridData.value.findIndex((item) => {
      return item.$uuid === scope.row.$uuid;
    });
    // const curRow = gridData.value.find((item) => {
    //   return item.$uuid === scope.row.$uuid;
    // });
    if (oriIndex === -1) {
      // 源数据不存在删除行 直接删
      gridData.value.splice(curIndex, 1);
      blackList.value.splice(blackListIndex, 1);
      scope.row.loading = false;
    } else {
      // 源数据里有删除行 调删除接口成功再删
      if (!props.deleteRows) {
        statusPair.value[0] = '';
        statusPair.value[1] = undefined;
        return console.error(
          '[EditableTable]:组件需要传入deleteRows属性，用于调用接口删除行数据',
        );
      }
      // scope.row.loading = true;
      const [res, error] = await promiseController(
        props.deleteRows,
        [scope.row],
        scope,
      );
      scope.row.loading = false;
      if (res) {
        gridData.value.splice(curIndex, 1);
        originRows.value.splice(oriIndex, 1);
        blackList.value.splice(blackListIndex, 1);
      } else {
        console.error(error.message);
      }
    }
    statusPair.value[0] = '';
    statusPair.value[1] = undefined;
    // 删行结束后，如果是通过键盘操作的删行，需要继续执行操作流程
    if (type === 'keyboard') {
      autoNext(scope); // 自动执行下一个操作
    }
  } else if (props.saveMode === 'manualTotalSave') {
    if (scope.row.$status === 'saved') {
      removedRows.push(removeRedundantField(scope.row));
    }
    const curIndex = gridData.value.findIndex((item) => {
      return item.$uuid === scope.row.$uuid;
    });
    gridData.value.splice(curIndex, 1);
    // 删行结束后，如果是通过键盘操作的删行，需要继续执行操作流程
    if (type === 'keyboard') {
      autoNext(scope, curIndex); // 自动执行下一个操作
    }
  }
}
/**
 * 处理批量添加
 */
async function handleBatchAdd() {
  // 先校验是否能添加行
  if (
    props.validateIfCanAddRow &&
    typeof props.validateIfCanAddRow === 'function'
  ) {
    const result = await props.validateIfCanAddRow();
    if (!result) {
      return null;
    }
  }
  // 能添加行，打开批量新增弹窗
  if (
    props.openBatchAddModal &&
    typeof props.openBatchAddModal === 'function'
  ) {
    props.openBatchAddModal();
  } else {
    if (props.batchAddModalGridOptions) {
      batchAddModalApi.open();
    } else {
      console.error(
        '[EditableTable]:批量新增功能需要传入表格配置"batchAddModalGridOptions"，若希望完全自主控制批量新增弹窗，请传入"openBatchAddModal"方法并在方法内自行处理弹窗逻辑',
      );
    }
  }
}
/**
 * 处理批量添加，传入用户批量选择的数据
 * 该方法会将用户添加的数据，调用getFinalAddRowData方法获得最终行数据，添加到表格中
 * @param records 用户选中的数据列表
 */
async function handleBatchChoose(records: any[]) {
  const formValue = await vbenChcTableRef.value?.formApi.getValues();
  loading.value = true;
  const finalArr = await Promise.all<any>(
    records.map((item) => {
      return addRow(item, formValue);
    }),
  );
  loading.value = false;
  finalArr.forEach((item, index) => {
    gridData.value.push(item);
    !new Set(blackList.value).has(item[props.blackListField]) &&
      blackList.value.push(item[props.blackListField]);
    index === 0 &&
      setTimeout(async () => {
        await vbenChcTableRef.value?.gridApi.scrollToRow(item);
        vbenChcTableRef.value?.gridApi.setEditRow(item, true);
      });
  });
}
/**
 * 根据用户选中的行，生成最终需要插入表格的行数据
 */
async function addRow(row: any, formValue: any) {
  return new Promise((resolve) => {
    (async () => {
      let record = row;
      if (
        props.getFinalAddRowData &&
        typeof props.getFinalAddRowData === 'function'
      ) {
        record = await props.getFinalAddRowData(row, formValue);
      }
      vbenChcTableRef.value?.gridApi.createRow(record).then((res: any) => {
        res.$status = 'insert';
        res.$uuid = generateUUID();
        resolve(res);
      });
    })();
  });
}
/**
 * 处理批量删除
 */
const batchDelLoading = ref(false);
async function handleBatchDel() {
  if (props.saveMode === 'autoSaveRow') {
    // 若存在编辑行保存动作，则等待保存完成再执行
    if (isOnSaving.value) {
      waitQueue.push([handleBatchDel]);
      return;
    }
    const checkedRows: any[] =
      vbenChcTableRef.value?.gridApi.getCheckboxRecords() || [];
    if (checkedRows.length === 0) {
      return console.error('请选中行数据');
    }
    // 将删除的数据分成两部分 一部分调接口删，一部分直接删
    // 1. insert数据 只在 gridData 内 直接删
    // 2. saved数据 一定在源数据 originRows 内 调接口删
    // 3. error数据 根据是否在 originRows 内，做不同处理
    // 在originRows内的调接口删
    // 不在的直接删
    const savedList: any[] = [];
    const tempList: any[] = [];
    checkedRows.forEach((row) => {
      if (row.$status === 'saved') {
        savedList.push(row);
      } else if (row.$status === 'insert') {
        tempList.push(row);
      } else {
        if (originRows.value.some((item) => item.$uuid === row.$uuid)) {
          savedList.push(row);
        } else {
          tempList.push(row);
        }
      }
    });
    // 先调接口删除已保存项
    if (!props.deleteRows) {
      return console.error(
        '[EditableTable]:组件需要传入deleteRows方法，用于调用接口删除行数据',
      );
    }
    batchDelLoading.value = true;
    const [, error] = await promiseController(props.deleteRows, savedList);
    batchDelLoading.value = false;
    if (!error) {
      // 成功后，将 originRows 和 gridData 内的对应数据删除
      savedList.forEach((item) => {
        const blackIndex = blackList.value.indexOf(item[props.blackListField]);
        const gridDataIndex = gridData.value.findIndex((itemIn) => {
          return itemIn.$uuid === item.$uuid;
        });
        const originIndex = originRows.value.findIndex((itemIn) => {
          return itemIn.$uuid === item.$uuid;
        });
        gridData.value.splice(gridDataIndex, 1);
        originRows.value.splice(originIndex, 1);
        blackList.value.splice(blackIndex, 1);
      });
      tempList.forEach((item) => {
        const blackIndex = blackList.value.indexOf(item[props.blackListField]);
        const gridDataIndex = gridData.value.findIndex((itemIn) => {
          return itemIn.$uuid === item.$uuid;
        });
        gridData.value.splice(gridDataIndex, 1);
        blackList.value.splice(blackIndex, 1);
      });
    }
  } else if (props.saveMode === 'manualTotalSave') {
    const checkedRows: any[] =
      vbenChcTableRef.value?.gridApi.getCheckboxRecords() || [];
    if (checkedRows.length === 0) {
      return console.error('请选中行数据');
    }
    // 原数据内的数据要加到removedRows 新增数据直接去掉即可
    for (let i = 0; i < checkedRows.length; i++) {
      if (checkedRows[i].$status === 'saved') {
        removedRows.push(removeRedundantField(checkedRows[i]));
      }
      const curIndex = gridData.value.findIndex((item) => {
        return item.$uuid === checkedRows[i].$uuid;
      });
      gridData.value.splice(curIndex, 1);
    }
  }
}
/**
 * 处理整体保存
 */
const totalSaveLoading = ref(false);
async function handleTotalSave() {
  if (props.saveMode === 'autoSaveRow') {
    // 若存在编辑行保存动作，则等待保存完成再执行
    if (isOnSaving.value) {
      waitQueue.push([handleTotalSave]);
      return;
    }
    // 如果此时在执行保存逻辑，需要轮询等待保存结束
    const errorRow = gridData.value.find((item) => item.$status === 'error');
    if (errorRow) {
      return message.error('存在无法保存行，请单独处理后再保存！');
    }
    // 构造整体保存的数据分别放到 addRows updateRows内
    const addRows: any[] = gridData.value.filter((item) => {
      return item.$status === 'insert';
    });

    if (props.totalSave && typeof props.totalSave === 'function') {
      totalSaveLoading.value = true;
      promiseController(props.totalSave, {
        update: [],
        created: addRows,
        removed: [],
      }).finally(() => {
        totalSaveLoading.value = false;
      });
    } else {
      console.error('[EditableTable]:组件需要totalSave方法，用来执行整体保存');
    }
  } else if (props.saveMode === 'manualTotalSave') {
    // 状态为insert的数据 加入created
    // removedRows数据 加入removed
    // 其他数据和originRows里的对应数据做比对，若不一致，加入updated
    const addRows: any[] = [];
    const updateRows: any[] = [];
    gridData.value.forEach((item) => {
      if (item.$status === 'insert') {
        addRows.push(item);
      } else {
        const oriRow = originRows.value.find((row) => row.$uuid === item.$uuid);
        let isSame = true;
        for (let key in item) {
          if (item[key] !== oriRow[key]) {
            isSame = false;
            break;
          }
        }
        if (!isSame) {
          updateRows.push(item);
        }
      }
    });
    const finalData = {
      update: updateRows,
      created: addRows,
      removed: removedRows,
    };
    if (props.totalSave && typeof props.totalSave === 'function') {
      totalSaveLoading.value = true;
      promiseController(props.totalSave, finalData).finally(() => {
        totalSaveLoading.value = false;
      });
      props.totalSave(finalData);
    } else {
      console.error('[EditableTable]:组件需要totalSave方法，用来执行保存逻辑');
    }
  }
}
/**
 * 处理整体提交
 */
const totalSubmitLoading = ref(false);
async function handleTotalSubmit() {
  if (props.saveMode === 'autoSaveRow') {
    // 若存在编辑行保存动作，则等待保存完成再执行
    if (isOnSaving.value) {
      waitQueue.push([handleTotalSubmit]);
      return;
    }
    // 如果此时在执行保存逻辑，需要轮询等待保存结束
    const errorRow = gridData.value.find((item) => item.$status === 'error');
    if (errorRow) {
      return message.error('存在无法保存行，请单独处理后再提交！');
    }
    // 构造整体保存的数据分别放到 addRows updateRows内
    const addRows: any[] = gridData.value.filter((item) => {
      return item.$status === 'insert';
    });

    if (props.totalSubmit && typeof props.totalSubmit === 'function') {
      totalSubmitLoading.value = true;
      promiseController(props.totalSubmit, {
        update: [],
        created: addRows,
        removed: [],
      }).finally(() => {
        totalSubmitLoading.value = false;
      });
    } else {
      console.error(
        '[EditableTable]:组件需要totalSubmit方法，用来执行提交逻辑',
      );
    }
  } else if (props.saveMode === 'manualTotalSave') {
    // 状态为insert的数据 加入created
    // removedRows数据 加入removed
    // 其他数据和originRows里的对应数据做比对，若不一致，加入updated
    const addRows: any[] = [];
    const updateRows: any[] = [];
    gridData.value.forEach((item) => {
      if (item.$status === 'insert') {
        addRows.push(removeRedundantField(item));
      } else {
        const oriRow = originRows.value.find((row) => row.$uuid === item.$uuid);
        let isSame = true;
        for (let key in item) {
          if (item[key] !== oriRow[key]) {
            isSame = false;
            break;
          }
        }
        if (!isSame) {
          updateRows.push(removeRedundantField(item));
        }
      }
    });
    const finalData = {
      update: updateRows,
      created: addRows,
      removed: removedRows,
    };
    if (props.totalSubmit && typeof props.totalSubmit === 'function') {
      totalSubmitLoading.value = true;
      promiseController(props.totalSubmit, finalData).finally(() => {
        totalSubmitLoading.value = false;
      });
    } else {
      console.error(
        '[EditableTable]:组件需要totalSubmit方法，用来执行提交逻辑',
      );
    }
  }
}
type FinalData = {
  update: any[];
  created: any[];
  removed: any[];
};
type totalHandleOptions = {
  /**
   * 行自动保存结束的回调
   */
  callBack: (data?: FinalData) => void;
  /**
   * 是否跳过错误行
   * true 存在错误行依然能够执行callBack
   * false 存在错误行时会提示用户，阻断后续callBack执行
   */
  skipErrorRow: boolean;
};
/**
 * 如果开发者需要自定义一些公共按钮功能，该按钮功能需要在行保存结束后执行时
 * 可以使用下面的包装方法，将按钮功能放到callBack参数里，
 * 这样该按钮功能，就会在表格行的自动保存结束后执行
 */
function totalHandlePackageFn(option: totalHandleOptions) {
  if (props.saveMode === 'autoSaveRow') {
    // 若存在编辑行保存动作，则等待保存完成再执行
    if (isOnSaving.value) {
      waitQueue.push([totalHandlePackageFn, option.callBack]);
      return;
    }
    // 如果有保存错误行，提示用户，阻断后续逻辑
    const errorRow = gridData.value.find((item) => item.$status === 'error');
    if (errorRow && !option.skipErrorRow) {
      return message.error('存在未保存行，请先处理！');
    }
    // 构造整体保存的数据分别放到 addRows updateRows内
    const addRows: any[] = gridData.value.filter((item) => {
      return item.$status === 'insert';
    });
    if (option.callBack && typeof option.callBack === 'function') {
      debugger;
      option.callBack({
        update: [],
        created: addRows,
        removed: [],
      });
    } else {
      console.error(
        '[EditableTable]:totalHandlePackageFn方法的入参需要传递一个回调方法',
      );
    }
  } else if (props.saveMode === 'manualTotalSave') {
    const addRows: any[] = [];
    const updateRows: any[] = [];
    gridData.value.forEach((item) => {
      if (item.$status === 'insert') {
        addRows.push(removeRedundantField(item));
      } else {
        const oriRow = originRows.value.find((row) => row.$uuid === item.$uuid);
        let isSame = true;
        for (let key in item) {
          if (item[key] !== oriRow[key]) {
            isSame = false;
            break;
          }
        }
        if (!isSame) {
          updateRows.push(removeRedundantField(item));
        }
      }
    });
    const finalData = {
      update: updateRows,
      created: addRows,
      removed: removedRows,
    };
    if (option.callBack && typeof option.callBack === 'function') {
      option.callBack(finalData);
    } else {
      console.error(
        '[EditableTable]:totalHandlePackageFn方法的入参需要传递一个回调方法',
      );
    }
  }
}
// 移除不必要的字段，避免传给后端
function removeRedundantField(item: any) {
  const finalItem = { ...item };
  delete finalItem.$uuid;
  delete finalItem.$status;
  return finalItem;
}
// 处理键盘快捷功能
onMounted(() => {
  window.addEventListener('keydown', handleKeyBoard);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyBoard);
});
onActivated(() => {
  window.addEventListener('keydown', handleKeyBoard);
});
onDeactivated(() => {
  window.removeEventListener('keydown', handleKeyBoard);
});
const isOnEnterSave = ref(false);
const currentFocus = ref('');
// 添加自定义的键盘事件 vbenChcTableRef.value?.formApi
const handleKeyBoard = async (e: KeyboardEvent) => {
  // console.log('handleKeyBoard:', e);

  if (e.code === 'F2') {
    e.preventDefault();
    autoNext({
      $grid: vbenChcTableRef.value?.gridApi,
      row: currentEditRow.value,
    });
  }
  if (e.ctrlKey && e.code === 'KeyE') {
    e.preventDefault();
    autoNext({
      $grid: vbenChcTableRef.value?.gridApi,
      row: currentEditRow.value,
    });
  }
  if (e.ctrlKey && e.code === 'KeyF') {
    e.preventDefault();
    autoNext({
      $grid: vbenChcTableRef.value?.gridApi,
      row: currentEditRow.value,
    });
  }
  // 当前有正在编辑行，然后点击delete按钮，删除该行
  if (
    props.canDeleteRow &&
    e.code === 'Delete' &&
    currentEditRow.value &&
    vbenChcTableRef.value?.gridApi.isEditByRow(currentEditRow.value)
  ) {
    e.preventDefault();
    handleDeleteRow(
      {
        row: currentEditRow.value,
        $grid: vbenChcTableRef.value?.gridApi,
      },
      'keyboard',
    );
  }
  // 当前有正在编辑行，然后点击enter按钮，退出编辑
  if (
    e.key === 'Enter' &&
    currentEditRow.value &&
    vbenChcTableRef.value?.gridApi.isEditByRow(currentEditRow.value)
  ) {
    // e.preventDefault();
    isOnEnterSave.value = true;
    vbenChcTableRef.value?.gridApi.clearEdit();
  }
  const $grid = vbenChcTableRef.value?.gridApi;
  if (
    e.code === 'Tab' &&
    currentEditRow.value &&
    $grid?.isEditByRow(currentEditRow.value)
  ) {
    if (e.shiftKey) {
      const curIndex = editFieldArr.value.findIndex(
        (item) => item === currentFocus.value,
      );
      if (curIndex === 0) {
        e.preventDefault();
        $grid.setEditCell(
          currentEditRow.value,
          editFieldArr.value[editFieldArr.value.length - 1] as string,
        );
      } else {
        $grid.setEditCell(
          currentEditRow.value,
          editFieldArr.value[curIndex - 1] as string,
        );
      }
    } else if (!e.shiftKey) {
      const curIndex = editFieldArr.value.findIndex(
        (item) => item === currentFocus.value,
      );
      if (curIndex === editFieldArr.value.length - 1) {
        e.preventDefault();
        $grid.setEditCell(
          currentEditRow.value,
          editFieldArr.value[0] as string,
        );
      } else {
        $grid.setEditCell(
          currentEditRow.value,
          editFieldArr.value[curIndex + 1] as string,
        );
      }
    }
  }
  if (e.ctrlKey && e.code === 'ArrowUp') {
    if (gridData.value.length > 0) {
      e.preventDefault();
      // 如果当前没有正在编辑项，滚动到底部，并开始编辑最后一项
      if (!currentEditRow.value) {
        await vbenChcTableRef.value?.gridApi.scrollToRow(
          gridData.value[gridData.value.length - 1],
        );
        await vbenChcTableRef.value?.gridApi.setEditRow(
          gridData.value[gridData.value.length - 1],
          currentFocus.value || editFieldArr.value[0],
        );
      } else {
        // 当前有正在编辑项 1. 当前编辑的是第一项，滚动到底部，并开始编辑最后一项 2. 滚动到上一行，并开始编辑上一行
        const curIndex = gridData.value.findIndex((item) => {
          return item.$uuid === currentEditRow.value.$uuid;
        });
        if (curIndex === 0) {
          await vbenChcTableRef.value?.gridApi.scrollToRow(
            gridData.value[gridData.value.length - 1],
          );
          await vbenChcTableRef.value?.gridApi.setEditRow(
            gridData.value[gridData.value.length - 1],
            currentFocus.value || editFieldArr.value[0],
          );
        } else {
          await vbenChcTableRef.value?.gridApi.scrollToRow(
            gridData.value[curIndex - 1],
          );
          await vbenChcTableRef.value?.gridApi.setEditRow(
            gridData.value[curIndex - 1],
            currentFocus.value || editFieldArr.value[0],
          );
        }
      }
    }
  }
  if (e.ctrlKey && e.code === 'ArrowDown') {
    if (gridData.value.length > 0) {
      e.preventDefault();
      // 如果当前没有正在编辑项，滚动到头部，并开始编辑第一项
      if (!currentEditRow.value) {
        await vbenChcTableRef.value?.gridApi.scrollToRow(gridData.value[0]);
        vbenChcTableRef.value?.gridApi.setEditRow(
          gridData.value[0],
          currentFocus.value || editFieldArr.value[0],
        );
      } else {
        // 当前有正在编辑项 1. 当前编辑的是最后一项，滚动到头部，并开始编辑第一项 2. 滚动到下一行并开始编辑下一行
        const curIndex = gridData.value.findIndex((item) => {
          return item.$uuid === currentEditRow.value.$uuid;
        });
        if (curIndex === gridData.value.length - 1) {
          await vbenChcTableRef.value?.gridApi.scrollToRow(gridData.value[0]);
          vbenChcTableRef.value?.gridApi.setEditRow(
            gridData.value[0],
            currentFocus.value || editFieldArr.value[0],
          );
        } else {
          await vbenChcTableRef.value?.gridApi.scrollToRow(
            gridData.value[curIndex + 1],
          );
          vbenChcTableRef.value?.gridApi.setEditRow(
            gridData.value[curIndex + 1],
            currentFocus.value || editFieldArr.value[0],
          );
        }
      }
    }
  }
  // 当前没在做编辑操作
  // if (e.code === 'Enter' && !currentEditRow.value && !searchFocus.value) {
  //   e.preventDefault();
  //   chcSelectRef.value.focus();
  // }
  // 物资下拉打开时点击右箭头
  // if (e.code === 'ArrowRight' && selectOpen.value) {
  //   e.preventDefault();
  //   chcSelectRef.value.pageChange(chcSelectRef.value.params.current + 1);
  // }
  // // 物资下拉打开时点击左箭头
  // if (e.code === 'ArrowLeft' && selectOpen.value) {
  //   e.preventDefault();
  //   chcSelectRef.value.pageChange(chcSelectRef.value.params.current - 1);
  // }
};

// 向外暴露公共方法
const formApi = computed<ExtendedFormApi>(() => {
  return vbenChcTableRef.value?.formApi!;
});
const selectRef = computed<InstanceType<typeof ChcSelect>>(() => {
  return chcSelectRef.value;
});
const gridApi = computed(() => {
  return vbenChcTableRef.value?.gridApi!;
});
const bkList = computed(() => {
  return blackList.value;
});
const batchAddRef = computed(() => {
  return batchAddContentRef.value;
});
const showLoading = computed<boolean>({
  get() {
    return loading.value;
  },
  set(val: boolean) {
    loading.value = val;
  },
});
const finalGridDataList = computed(() => {
  return gridData.value;
});
defineExpose({
  formApi,
  gridApi,
  chcSelectRef: selectRef,
  blackList: bkList,
  gridData: finalGridDataList,
  initRows,
  editFieldArr,
  handleBatchChoose,
  showLoading,
  batchAddRef: batchAddRef,
  viewLog,
  handleDeleteRow,
  handleBatchDel,
  handleChoose,
  generateUUID,
  insertRow: tableInsertRow,
  totalHandlePackageFn,
});

const [BatchAddModal, batchAddModalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    batchAddModalApi.close();
  },
  onConfirm() {
    handleBatchChoose(
      batchAddContentRef.value?.gridApi.getCheckboxRecords() || [],
    );
    batchAddModalApi.close();
  },
});
const batchAddContentRef = ref<InstanceType<typeof BatchAddContent>>();
const addModalExtraParams = computed(() => {
  return {
    ...props.singleSelectProps.extraParams,
  };
});
const actionLogParams = ref<any>({
  Record_ID: undefined,
  AD_Table_ID: undefined,
});
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  draggable: true,
  onCancel() {
    actionLogModalApi.close();
  },
  onConfirm() {
    // handleBatchChoose(
    //   batchAddContentRef.value?.gridApi.getCheckboxRecords() || [],
    // );
    // actionLogModalApi.close();
  },
});
const finalBatchAddModalFormOptions = computed<SchemaColumnAndOptions>(() => {
  const finalColumns = props.batchAddModalGridOptions?.gridColumns || [];
  if (!finalColumns.some((column) => column.type === 'checkbox')) {
    finalColumns.unshift({
      type: 'checkbox',
      title: '',
      width: 50,
      align: 'center',
    });
  }
  return { ...props.batchAddModalGridOptions, gridColumns: finalColumns };
});
const getPopupContainer = () => {
  return document.querySelector('.editableTable-container .vxe-grid');
};
</script>

<template>
  <div class="editableTable-container h-full">
    <BatchAddModal
      v-if="batchAddModalGridOptions"
      class="h-[800px] w-[80%]"
      content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
      title="批量添加"
      title-tooltip="多选后点击确定添加到单据明细列表"
    >
      <BatchAddContent
        ref="batchAddContentRef"
        :formOptions="batchAddModalFormOptions"
        :gridOptions="finalBatchAddModalFormOptions"
        :black-list="finalBlackList"
        :extra-params="addModalExtraParams"
        :blackListField="blackListField"
      ></BatchAddContent>
    </BatchAddModal>
    <ActionLogModal
      class="h-[800px] w-[80%]"
      content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-1"
      title="操作记录"
      title-tooltip="操作记录列表"
    >
      <ActionLogContent :extraParams="actionLogParams"></ActionLogContent>
    </ActionLogModal>
    <VbenChcTable
      :id="id"
      class="vbenChcTable"
      ref="vbenChcTableRef"
      @edit-activated="handleEditActivated"
      @edit-closed="handleEditClosed"
      :search-form-options="finalFormOptions"
      :form-constructor="useVbenForm"
      :grid-options="gridOptions"
      :data="gridData"
      :loading="loading"
      :columns="gridColumns"
    >
      <template v-for="name in $slots" #[name]="scope">
        <slot :name="name" v-bind="scope"></slot>
      </template>
      <template #action="scope">
        <slot
          :name="finalSlotsConfig.actionLeft"
          v-bind="scope"
          v-if="finalSlotsConfig.actionLeft"
        ></slot>
        <slot name="action" v-bind="scope">
          <Button
            v-if="props.viewType === 'view' && finalSlotsConfig.showViewLogBtn"
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="viewLog(scope)"
            :data-testid="`button_action_log_${scope.rowIndex}_documentDetail`"
          >
            操作记录
            <template #icon>
              <viewActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            ghost
            danger
            @click="handleDeleteRow(scope)"
            :loading="scope.row.loading"
            class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            v-if="
              props.viewType !== 'view' &&
              finalSlotsConfig.showDelRowBtn &&
              props.canDeleteRow
            "
            :data-testid="`button_delete_${scope.rowIndex}_documentDetail`"
          >
            删行
            <template #icon>
              <SvgDeleteIcon />
            </template>
          </Button>
        </slot>
        <slot
          :name="finalSlotsConfig.actionRight"
          v-bind="scope"
          v-if="finalSlotsConfig.actionRight"
        ></slot>
      </template>
      <template #toolbar-actions="scope">
        <slot
          :name="finalSlotsConfig.toolbarActionsLeft"
          v-bind="scope"
          v-if="finalSlotsConfig.toolbarActionsLeft"
        ></slot>
        <slot name="toolbar-actions" v-bind="scope">
          <ChcSelect
            v-if="
              props.viewType !== 'view' && finalSlotsConfig.showSingleSelect
            "
            size="default"
            :autofocus="true"
            :paginate="true"
            :allow-clear="false"
            ref="chcSelectRef"
            placeholder="请输入药品编码、药品名称、规格"
            class="mr-[0.5rem] w-[380px]"
            dict-url="/productAction/query.do"
            popup-class-name="productSelection"
            @keydown="
              (e: KeyboardEvent) => {
                if (e.code === 'Escape') {
                  chcSelectRef.blur();
                }
              }
            "
            :open="selectOpen"
            api-type="post"
            :getPopupContainer="getPopupContainer"
            request-content-type="application/x-www-form-urlencoded"
            :page-size="25"
            :immediate="false"
            :black-list="blackList"
            :filter-by-front-end="false"
            :show-search="true"
            @change="handleChoose"
            @blur="
              () => {
                selectOpen = false;
              }
            "
            @focus="
              () => {
                selectOpen = true;
              }
            "
            filter-field="productName"
            :handle-params="
              (params: any) => {
                return {
                  ...params,
                  current: undefined,
                  pageNum: params.current,
                  pageSize: params.size,
                  size: undefined,
                };
              }
            "
            label-field="productName"
            value-field="productCode"
            :after-fetch="
              (res: any) => {
                return { ...res, rows: undefined, records: res.rows };
              }
            "
            :option-columns="[
              {
                header: '药品编码',
                name: 'productCode',
                width: 80,
              },
              {
                header: '药品名称',
                name: 'productName',
                width: 240,
              },
              {
                header: '规格',
                name: 'productSpec',
                width: 180,
              },
              {
                header: '型号',
                name: 'modelNo',
                width: 100,
                visible: false,
              },
              {
                header: '单位',
                name: 'uomName',
                width: 80,
              },
              {
                header: '采购价',
                name: 'price',
                width: 80,
              },
              {
                header: '库存',
                name: 'storageQty',
                width: 80,
              },
            ]"
            data-testid="ChcSelect_productName_documentDetail"
            v-bind="singleSelectProps"
          />
          <Button
            v-if="props.viewType !== 'view' && finalSlotsConfig.showBatchAddBtn"
            type="primary"
            @click="handleBatchAdd"
            class="mr-[0.5rem]"
            data-testid="button_batch_add_documentDetail"
          >
            批量添加
            <template #icon>
              <AddActionIcon />
            </template>
          </Button>
          <Button
            v-if="
              props.viewType !== 'view' &&
              finalSlotsConfig.showBatchDelBtn &&
              props.canDeleteRow
            "
            type="primary"
            :loading="batchDelLoading"
            @click="handleBatchDel"
            class="mr-[0.5rem]"
            data-testid="button_batch_delete_documentDetail"
          >
            批量删除
            <template #icon>
              <SvgDeleteIcon />
            </template>
          </Button>
        </slot>
        <slot
          :name="finalSlotsConfig.toolbarActionsRight"
          v-bind="scope"
          v-if="finalSlotsConfig.toolbarActionsRight"
        ></slot>
      </template>
      <template #toolbar-tools="scope">
        <slot
          :name="finalSlotsConfig.toolbarToolsLeft"
          v-bind="scope"
          v-if="finalSlotsConfig.toolbarToolsLeft"
        ></slot>
        <slot name="toolbar-tools" v-bind="scope">
          <Input
            v-model:value="serachInputVal"
            class="mr-[0.5rem] w-[240px]"
            placeholder="请输入药品关键词"
            allow-clear
            @keyup.enter="handleIptSearch"
            data-testid="input_produce_name_documentDetail"
            v-if="finalSlotsConfig.showSearchArea"
            v-bind="searchInputProps"
          />
          <Button
            type="primary"
            @click="handleIptSearch"
            data-testid="button_search_documentDetail"
            v-if="finalSlotsConfig.showSearchArea"
          >
            搜索
            <template #icon>
              <SearchActionIcon />
            </template>
          </Button>
        </slot>
        <slot
          :name="finalSlotsConfig.toolbarToolsRight"
          v-bind="scope"
          v-if="finalSlotsConfig.toolbarToolsRight"
        ></slot>
      </template>
      <template #bottom="scope">
        <slot name="bottom" v-bind="scope">
          <div
            v-if="viewType !== 'view'"
            class="flex items-center justify-center pb-[0px] pt-[6px]"
          >
            <div class="flex gap-[10px]">
              <Button
                type="primary"
                data-testid="button_save_documentDetail"
                @click="handleTotalSave"
                :loading="totalSaveLoading"
              >
                保存
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button>
              <Button
                type="primary"
                data-testid="button_submit_documentDetail"
                @click="handleTotalSubmit"
                :loading="totalSubmitLoading"
              >
                提交
                <template #icon>
                  <UploadCloudIcon />
                </template>
              </Button>
            </div>
          </div>
          <div v-else class="pb-[0px]"></div>
        </slot>
      </template>
      <template #loading>
        <slot name="loading">
          <VbenLoading :spinning="true" />
        </slot>
      </template>
      <template #empty>
        <slot name="empty">
          <EmptyIcon class="mx-auto" />
          <div class="mt-2">暂无数据</div>
        </slot>
      </template>
    </VbenChcTable>
  </div>
</template>
<style scoped>
::v-deep(
  .vxe-grid--toolbar-wrapper
    .ant-select-single:not(.ant-select-customize-input)
    .ant-select-selector
) {
  padding: 1px 7px;
  height: 30px;
}
::v-deep(
  .vbenChcTable
    .vxe-table--render-default.col--drag-cell
    .vxe-header--column.is--drag-disabled
) {
  color: inherit;
}
</style>

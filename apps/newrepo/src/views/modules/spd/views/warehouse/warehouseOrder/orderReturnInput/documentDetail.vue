<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import {
  AddActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';

import { useVbenModal } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { requestFormClient } from '#/api/request.js';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { dataCommit, deleteLine, modifyLine, saveDo } from './api';
import departmentReturnModal from './modals/departmentReturnModal.vue';

const [DepartmentReturnModal, departmentReturnModalApi] = useVbenModal({
  connectedComponent: departmentReturnModal,
});

const currentTab = defineModel<number>('currentTab', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});

const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const toWarehouseParams = ref<any>({
  level2: '',
  level3: '',
});
const warehouseIdValue = ref<any>(undefined); // 跟踪表单中的warehouseId值

// 同步parentData中的warehouseId变化
watch(
  () => parentData.value?.warehouseId,
  (val) => {
    warehouseIdValue.value = val;
  },
  { immediate: true },
);
const extParams = ref<any>({
  isScatter: 'Y',
});
const currentInsertRows = ref<any[]>([]); // 当前插入的临时数据行
const currentUpdateRows = ref<any[]>([]); // 当前有更新的数据行
const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait'); // 自动保存控制字段
const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field
const action = ref(''); // 操作类型
const ROWKEYFIELD = 'attributeSetInstanceId';
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      collapsed: false,
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      // keepSource: true,
      proxyConfig: {
        autoLoad: false,
      },
      // radioConfig: {
      //   trigger: 'row',
      //   highlight: true,
      // },
      checkboxConfig: {
        trigger: 'row',
        highlight: true,
        reserve: true, // 保留选中状态
      },
      sortConfig: {
        defaultSort: {
          field: 'priorityRuleName',
          order: 'desc',
        },
      },
      editConfig: {
        enabled: detailInfo.value?.type === 'edit',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      pagerConfig: {
        // enabled: true,
      },
      cellStyle: ({ column }: { column: any }) => {
        if (column.field === 'qtyApply' && detailInfo.value?.type === 'edit') {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
    }),

    gridEvents: {
      // AI-GENERATED-BEGIN
      // @date 2026-07-02
      // @prompt 申请数量失焦/回车自动添加
      // @description 监听编辑激活事件，记录当前编辑的行和列
      editActivated: (scope: any) => {
        currentEditRow.value = scope.row;
        currentField.value = scope.column.field;
      },
      editClosed: () => {
        currentEditRow.value = undefined;
        currentField.value = '';
      },
      // AI-GENERATED-END
    },
  },
  {
    id: 'parent',
    queryUrl: '/storageAction/queryStorageDetail.do',
    gridColumns: [
      {
        type: 'checkbox',
        title: '',
        width: 50,
        fixed: 'left',
        align: 'center',
        visible: detailInfo.value?.type === 'edit',
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },

      { field: 'productCode', title: '药品编码', width: '120', sortable: true },
      { field: 'productName', title: '药品名称', width: '200', sortable: true },

      { field: 'productSpec', title: '规格', width: '200', sortable: true },
      {
        field: 'modelNo',
        title: '型号',
        width: '150',
        sortable: true,
        visible: false,
      },
      { field: 'manufacturer', title: '厂家', width: '150', sortable: true },
      { field: 'uomName', title: '单位', width: '72', sortable: true },
      {
        field: 'qtyAvailable',
        title: '可用数量',
        width: '120',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyApply',
        title: '申请数量',
        width: '90',
        align: 'right',
        formatter: ({ cellValue }) => {
          if (cellValue == null || cellValue === '') return '';
          return Math.round(Number(cellValue));
        },

        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'float',
            min: 0,
            step: 0.001,
            digits: 12,
          },
        },
      },
      { field: 'lot', title: '批号', width: '100' },
      { field: 'guaranteeDate', title: '效期', width: '100' },
      {
        field: 'vendorName',
        title: '供应商',
        width: '80',
      },
      {
        field: 'price',
        title: '进价',
        width: '120',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.price);
        },
      },
      { field: 'locatorName', title: '货位', width: '120', sortable: true },

      {
        field: 'invoiceMethodName',
        minWidth: 100,
        title: '开票方式',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: '120',
        sortable: true,
      },
      {
        field: 'qtyOnHand',
        title: '在库数量',
        width: '100',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyAllocated',
        title: '分配数量',
        width: '90',
        sortable: true,
        align: 'right',
      },
      {
        field: 'qtyMoving',
        title: '在途数量',
        width: '90',
        sortable: true,
        align: 'right',
      },
    ],
    formSchema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择院区',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            autoChooseFirstOption: !parentData.value.orderId,
            disabled: !!parentData.value.orderId,
            defaultValue: parentData.value.departmentName || undefined,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            rules: parentData.value.orderId ? '' : 'required',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        fieldName: 'departmentId',
        label: '院区',
      },

      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            autoChooseFirstOption: !parentData.value.orderId,
            dictUrl:
              '/baseHandleAction/warehouse.do?level1=N&readWrite=Y&isHis=N',

            // showSearch: true,
            disabled: !!parentData.value.orderId,
            defaultValue: parentData.value.warehouseId || undefined,
            placeholder: '请选择申请仓库',
            triggerFields: parentData.value.orderId
              ? []
              : ['departmentId', 'regionId'],
            paginate: false,
            allowClear: true,
            onChange(val: any, option: any) {
              warehouseIdValue.value = val;
              const warehouseType = option.warehouseType;
              Object.keys(toWarehouseParams.value).forEach((key) => {
                toWarehouseParams.value[key] = '';
              });
              if (warehouseType && warehouseType > 1) {
                for (let i = 1; i < warehouseType; i++) {
                  toWarehouseParams.value[`level${i}`] = 'Y';
                }
              }

              ChcGridApi.formApi?.setFieldValue(
                'toWarehouseId',
                option.parentId || undefined,
              );
              // extParams.value.bpartnerId_text = option.name;
            },
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows && res.rows.length > 0) {
                ChcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  parentData.value.warehouseId || res.rows[0].id,
                );
              }
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              console.warn(
                ChcGridApi.formApi.getFieldComponentRef('warehouseId'),
                55,
              );
              ChcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              // ChcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
        rules: parentData.value.orderId ? '' : 'required',

        // defaultValue: 1_000_007,
        fieldName: 'warehouseId',
        formItemClass: 'pl-[10px] pr-[10px]',
        labelClass: 'leading-1 mb-[1px] pl-[4px]',
        label: '申请仓库',
      },
      {
        component: 'ChcSelect',

        componentProps: () => {
          return {
            // autoChooseFirstOption: !parentData.value.orderId,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            disabled: !!parentData.value.orderId,
            defaultValue: parentData.value.toWarehouseId || undefined,
            // showSearch: true,
            placeholder: '请选择上级仓库',
            allowClear: true,
            triggerFields: parentData.value.orderId ? [] : ['warehouseId'],
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
            },
            extraParams: toWarehouseParams.value,
            paginate: false,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId'],
          trigger(values: any) {
            console.warn(values, 33);
            if (
              ChcGridApi.formApi?.getFieldComponentRef &&
              typeof ChcGridApi.formApi?.getFieldComponentRef === 'function' &&
              ChcGridApi.formApi?.getFieldComponentRef('toWarehouseId')
            ) {
              ChcGridApi.formApi.getFieldComponentRef(
                'toWarehouseId',
              ).params.dependencies = {
                warehouseId: values.warehouseId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
            }
          },
        },
        rules: parentData.value.orderId ? '' : 'required',

        fieldName: 'toWarehouseId',
        label: '上级仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000346',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择库存状态',
            paginate: false,
            filterByFrontEnd: true,
            allowClear: true,
            disabled: !!parentData.value.orderId,
            defaultValue: parentData.value.storageStatus || undefined,
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              // 新建时默认填充"合格"
              if (
                !parentData.value.orderId &&
                !parentData.value.storageStatus
              ) {
                const qualifiedItem = (res.rows || []).find(
                  (item: any) => item.value === 'H' || item.name === '合格',
                );
                if (qualifiedItem) {
                  setTimeout(() => {
                    ChcGridApi.formApi?.setFieldValue(
                      'storageStatus',
                      qualifiedItem.id,
                    );
                  }, 0);
                }
              }
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        rules: parentData.value.orderId ? '' : 'required',

        fieldName: 'storageStatus',
        label: '库存状态',
      },
      {
        component: 'Input',
        fieldName: 'description',
        label: '备注',
        componentProps: {
          defaultValue: parentData.value!.description || undefined,
          placeholder: '请输入备注',
        },
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '商品',
        componentProps: {
          placeholder: '编码/拼音码/名称',
        },
      },
    ],
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      return {
        ...params,
        ...queryparams(params),
        departmentId:
          params.departmentId === '-1' ? undefined : params.departmentId,
        // start: undefined,
        // limit: 0,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 子表
const CHILD_EDITABLE_FIELDS = new Set(['description', 'qtyOrdered']);
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        // enabled: false,
      },
      editConfig: {
        enabled: detailInfo.value?.type === 'edit',
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      cellStyle: ({ column }: { column: any }) => {
        if (
          CHILD_EDITABLE_FIELDS.has(column.field) &&
          detailInfo.value?.type === 'edit'
        ) {
          return {
            backgroundColor: '#D7FFF5',
          };
        }
        return {};
      },
      keepSource: true,
    }),
  },
  {
    gridColumns: [
      // { type: 'checkbox', title: '', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productCode',
        title: '药品编码',
        width: 120,
      },
      {
        field: 'productName',
        title: '药品名称',
        width: 200,
      },
      {
        field: 'productSpec',
        title: '规格',
        width: 100,
      },
      {
        field: 'modelNo',
        title: '型号',
        width: 100,
        visible: false,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        width: 130,
      },
      {
        field: 'uomName',
        title: '单位',
        width: 80,
      },
      {
        field: 'qtyOrdered',
        title: '申请数量',
        // edit: 'number',
        // verify: 'number|required',
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
          },
        },
        width: 90,
        align: 'right',
      },
      {
        field: 'lot',
        title: '批号',
        width: 90,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        width: 80,
      },
      {
        field: 'vendorName',
        title: '供应商',
        width: 80,
      },
      {
        field: 'pricePO',
        title: '进价',
        width: 80,
        align: 'right',
      },
      {
        field: 'description',
        title: '备注',
        minWidth: 150,
        editRender: {
          name: 'VxeInput',
        },
      },
      {
        align: 'center',
        field: 'action',
        visible: detailInfo.value?.type === 'edit',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],

    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    // queryUrl: '/orderAction/queryLine.do?page=woInput&specShowType=from',
    queryUrl: '/orderAction/queryLineNew.do?specShowType=from&page=moInput',
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        orderId: parentData.value.orderId,
        // start: undefined,
        // limit: 0,
      };
    },
    gridEvents: {
      editActivated: (scope: any) => {
        currentEditRow.value = scope.row;
        currentField.value = scope.column.field;
      },
      editClosed: async ({ row }: any) => {
        currentInsertRows.value = roleGridApi.grid.getInsertRecords();
        currentUpdateRows.value = roleGridApi.grid.getUpdateRecords();

        if (autoSaveController.value === 'onSaving') {
          currentEditRow.value = undefined;
          currentField.value = '';
        } else {
          autoSaveController.value = 'onSaving';

          if (
            roleGridApi.grid.isInsertByRow(row) ||
            roleGridApi.grid.isUpdateByRow(row)
          ) {
            currentEditRow.value = undefined;
            currentField.value = '';

            // 对该行数据进行保存
            handleSaveOrder({
              $grid: roleGridApi.grid,
              row,
            })
              .then(() => {
                autoSaveController.value = 'wait';
                currentInsertRows.value = [];
                currentUpdateRows.value = [];

                if (action.value === 'commit') {
                  handleTotalSubmit();
                }
              })
              .catch(() => {
                autoSaveController.value = 'error';
                currentInsertRows.value = [];
                currentUpdateRows.value = [];
              });
          } else {
            autoSaveController.value = 'wait';
          }
        }
      },
    },
  },
);

onMounted(() => {
  if (parentData.value.orderId) {
    ChcGridApi.formApi.getValues().then(async (res: any) => {
      const sertchData = queryparams(res);
      ChcGridApi.query(sertchData);
    });
    roleGridApi.query();
  }
  // AI-GENERATED-BEGIN
  // @date 2026-07-02
  // @prompt 申请数量失焦/回车自动添加
  // @description 注册全局键盘监听，在 qtyApply 编辑完成后按回车自动触发添加
  window.addEventListener('keydown', handleKeyEnter);
  // AI-GENERATED-END
});

// AI-GENERATED-BEGIN
// @date 2026-07-02
// @prompt 申请数量失焦/回车自动添加
// @description 监听回车键触发添加操作
const handleKeyEnter = async (e: KeyboardEvent) => {
  if (
    e.key === 'Enter' &&
    currentEditRow.value && // 检查当前编辑的列是否是 qtyApply
    currentField.value === 'qtyApply'
  ) {
    e.preventDefault();
    const row = currentEditRow.value;
    if (row && row.qtyApply) {
      ChcGridApi.grid.setCheckboxRow(row, true);
      await handleAdd();
    }
  }
};
// AI-GENERATED-END

onUnmounted(() => {
  // AI-GENERATED-BEGIN
  // @date 2026-07-02
  // @prompt 申请数量失焦/回车自动添加
  // @description 页面卸载时移除全局键盘监听
  window.removeEventListener('keydown', handleKeyEnter);
  // AI-GENERATED-END
});

const handleAdd = async () => {
  const updateRows = ChcGridApi.grid.getUpdateRecords();
  if (updateRows.length > 0) {
    return message.warn('请将所有编辑的数据保存，再添加');
  }
  const selectedRows: any[] = ChcGridApi.grid.getCheckboxRecords();

  if (selectedRows.length === 0) return message.warning('请先选择数据');
  let error = false;
  const fromValues = await ChcGridApi.formApi.getValues();
  const warehouseId = fromValues.warehouseId;
  selectedRows.forEach((item, index) => {
    if (!item.qtyApply || item.qtyApply === '' || item.qtyApply === '0') {
      message.warning(
        `第${index + 1}行,${item.productName}(${item.productCode})` +
          `没有申请数量`,
      );
      error = true;
    }
    if (item.warehouseId !== warehouseId) {
      message.warning(
        `第${index + 1}行,${item.productName}(${item.productCode})` +
          `仓库错误!<br>`,
      );
      error = true;
    }
    if (item.qtyApply > item.qtyAvailable) {
      message.warning(
        `第${index + 1}行,${item.productName}(${item.productCode})` +
          `申请数量>可退数量!<br>`,
      );
      error = true;
    }
  });

  if (error) {
    return;
  }
  ChcGridApi.formApi.getValues().then(async (res: any) => {
    const sertchData = queryparams(res);
    const params: any = {
      ...sertchData,
    };
    params.orderType = 'WR';
    params.returnDoc = 'Y';
    params.isOutNeedPick = 'N';
    params.orderId = parentData.value.orderId;
    params.isPackaged = 'N';
    params.lineData = JSON.stringify({ data: selectedRows });
    saveDo(params).then((res) => {
      if (res && res.success) {
        if (!parentData.value.orderId) {
          parentData.value = { orderId: res.data.header.id };
          ChcGridApi.formApi.setFieldValue('orderId', res.data.header.id);
        }
        message.success('添加成功');
        // ChcGridApi.query();
        ChcGridApi.formApi.getValues().then(async (res: any) => {
          const sertchData = queryparams(res);
          ChcGridApi.query(sertchData);
        });
        roleGridApi.query();
      }
    });
  });
};

const queryparams = (formValues: any) => {
  return {
    warehouseId: formValues.warehouseId || parentData.value.warehouseId,
    toWarehouseId: formValues.toWarehouseId || parentData.value.toWarehouseId,
    orderId: formValues.orderId || parentData.value.orderId,
    departmentId: formValues.departmentId || parentData.value.departmentId,
    storageStatus: formValues.storageStatus || parentData.value.storageStatus,
    description: formValues.description || parentData.value.description,
  };
};

const hasEditStatus = (row: any) => {
  return ChcGridApi.grid?.isEditByRow(row);
};

const hasChildEditStatus = (row: any) => {
  return roleGridApi.grid?.isEditByRow(row);
};

const handleEdit = (scope: any, tableType: 'child' | 'parent') => {
  const tableApi = tableType === 'parent' ? ChcGridApi : roleGridApi;
  const updateRows = tableApi.grid.getUpdateRecords();

  if (updateRows.length > 1) {
    return message.warn('请将当前编辑的数据保存，再编辑');
  } else if (
    updateRows.length === 1 &&
    updateRows[0][ROWKEYFIELD] !== scope.row[ROWKEYFIELD]
  ) {
    // 编辑行只有一条，并且不是当前删除行
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  }

  tableApi.grid.setEditRow(scope.row, true);
};

const handleSave = (scope: any) => {
  if (!(scope.row.qtyApply > 0)) {
    return message.error('申请数量必须大于零!');
  } else if (scope.row.qtyApply > (scope.row.qtyAvailable || 0)) {
    return message.error('申请数量必须小于等于可用数量!');
  }
  ChcGridApi.grid.clearEdit(scope.row);
  scope.$grid.clearEdit();
};

const handleSaveOrder = (scope: any) => {
  return new Promise((resolve, reject) => {
    const params = {
      orderId: parentData.value.orderId,
      lineData: JSON.stringify({ data: [scope.row] }),
    };
    modifyLine(params)
      .then((res) => {
        if (res && res.success) {
          message.success('修改成功');
          const sertchData = queryparams(res);
          ChcGridApi.query(sertchData);
          roleGridApi.query();
          resolve(res);
        } else {
          reject(res);
        }
      })
      .catch(reject);
  });
};

const handleCalcel = (scope: any) => {
  scope.$grid.clearEdit();
  scope.$grid.revertData(scope.row);
};

const handleDeleteRow = (scope: any) => {
  const params = {
    orderId: parentData.value.orderId,
    lineData: JSON.stringify({ data: [scope.row] }),
  };
  deleteLine(params).then((res) => {
    if (res && res.success) {
      message.success('删除成功');
      const sertchData = queryparams(res);
      ChcGridApi.query(sertchData);
      roleGridApi.query();
    }
  });
};
const totalHandleLoading = ref(false);
const handleTotalSubmit = () => {
  const tableData = roleGridApi.grid.getData();
  if (tableData.length === 0) {
    return message.error('请添加需退货的商品！');
  }
  if (roleGridApi.grid.getInsertRecords().length > 0) {
    return message.error('当前表格存在新增行未保存，请保存后再操作！');
  } else if (roleGridApi.grid.getUpdateRecords().length > 0) {
    return message.error('当前表格存在未保存信息，请保存后再操作！');
  }
  const params = {
    orderId: parentData.value.orderId,
  };
  dataCommit(params).then((res) => {
    if (res && res.success) {
      message.success('单据提交成功');
      currentTab.value = 0;
    }
  });
};
const productName = ref('');
const handleSearch = (e: any) => {
  console.warn('handleSearch', e.target.value, productName.value);
  if (!parentData.value.orderId) {
    return message.error('请先添加药品，生成请退单！');
  }
  roleGridApi.query({
    orderId: parentData.value.orderId,
    productName: productName.value,
  });
};

// AI-GENERATED-BEGIN
// @date 2026-07-11
// @prompt 添加科退录入按钮及处理函数
// @description 科退录入按钮，点击后手动请求接口校验申请仓库必须是三级库，然后打开批量添加弹窗
const handleDepartmentReturn = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  const currentWarehouseId =
    formValues.warehouseId || parentData.value?.warehouseId;

  if (!currentWarehouseId) {
    message.warning('请先选择申请仓库');
    return;
  }

  // 手动请求接口获取仓库信息
  // 1. 避免触发组件 fetchApi 导致的 afterFetch 副作用（修改表单值）
  // 2. 确保能获取到包含 warehouseType 的完整数据
  const res = await requestFormClient.post('/baseHandleAction/warehouse.do', {
    level1: 'N',
    readWrite: 'Y',
    isHis: 'N',
    regionId: formValues.departmentId || parentData.value?.departmentId,
    departmentId: formValues.departmentId || parentData.value?.departmentId,
  });

  // 从接口返回数据中查找对应仓库
  const warehouseOption = res.rows?.find(
    (item: any) => String(item.id) === String(currentWarehouseId),
  );
  const warehouseType = warehouseOption?.warehouseType;
  const isParentWarehouseInventory =
    warehouseOption?.isParentWarehouseInventory;
  console.warn('warehouseType', warehouseType);
  console.warn('isParentWarehouseInventory', isParentWarehouseInventory);

  if (warehouseType !== '3') {
    message.warning('申请仓库必须选择三级库');
    return;
  }

  // 打开批量添加弹窗
  departmentReturnModalApi
    .setData({
      warehouseId: currentWarehouseId,
      departmentId: formValues.departmentId || parentData.value?.departmentId,
      toWarehouseId:
        formValues.toWarehouseId || parentData.value?.toWarehouseId,
      storageStatus:
        formValues.storageStatus || parentData.value?.storageStatus,
      // handleBatchChoose: (selectedRows: any[]) => {
      //   console.warn('科退录入选中数据:', selectedRows);
      //   // TODO: 后续处理选中的数据，添加到表格中
      //   message.success(`已选择 ${selectedRows.length} 条数据`);
      // },
      onClose: () => {
        // 触发主表查询
        ChcGridApi.formApi.getValues().then(async (res: any) => {
          const searchParams = queryparams(res);
          ChcGridApi.query(searchParams);
        });
        // 触发子表查询
        // roleGridApi.query();
      },
    })
    .open();
};
// AI-GENERATED-END
</script>

<template>
  <div class="box-border h-full w-full">
    <DepartmentReturnModal />
    <PageSplitLazy
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ChcGrid class="flex-1 overflow-hidden">
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleAdd"
              class="mr-[0.5rem]"
              data-testid="button_add_documentDetail"
            >
              添 加
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleDepartmentReturn"
              class="mr-[0.5rem]"
              data-testid="button_departmentReturn_documentDetail"
            >
              科退录入
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <RoleGrid>
          <template #toolbar-actions>
            <div class="mt-[10px]">
              <Input
                v-model:value="productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_product_name_documentDetail"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search_documentDetail"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </div>
          </template>
          <template #action="scope">
            <Button
              type="primary"
              ghost
              danger
              @click="handleDeleteRow(scope)"
              :loading="scope.row.loading"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              v-if="detailInfo?.value?.type !== 'view'"
              :data-testid="`button_delete_${scope.rowIndex}_documentDetail`"
            >
              删行
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
          </template>
          <template #bottom>
            <div class="flex items-center justify-center pt-[10px]">
              <Button
                type="primary"
                @click="handleTotalSubmit"
                :loading="totalHandleLoading"
                v-if="detailInfo?.value?.type !== 'view'"
                data-testid="button_submit_documentDetail"
              >
                提交
              </Button>
            </div>
          </template>
        </RoleGrid>
      </template>
    </PageSplitLazy>
  </div>
</template>

<style scoped>
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
  margin-right: -1px;
  margin-bottom: 4px;
  margin-left: -5px;
}

::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}
</style>

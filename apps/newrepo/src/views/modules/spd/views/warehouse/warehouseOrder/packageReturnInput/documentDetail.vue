<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  AddActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';

import { dataCommit, deleteLine, modifyLine, saveDo } from './api';

const currentTab = defineModel<number>('currentTab', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});

const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
// const toWarehouseParams = ref<any>({});
const toWarehouseParams = ref<any>({
  level2: '',
  level3: '',
  level4: '',
});
const extParams = ref<any>({
  packageStatus: 'S',
  isPicking: 'N',
});
// const ROWKEYFIELD = 'attributeSetInstanceId';
// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      // showCollapseButton: false,
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
        // trigger: 'default',
        highlight: true,
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
        // trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
      pagerConfig: {
        // enabled: true,
      },
    }),

    gridEvents: {
      checkBoxChange: ({ row }: { row: any }) => {
        if (!row.qtyApply) {
          message.warn('请输入申请数量');
          ChcGridApi.grid.clearCheckboxRow(row);
        }
      },
    },
  },
  {
    id: 'parent',
    queryUrl: '/packageAction/query.do',
    gridColumns: [
      {
        type: 'checkbox',
        title: '',
        width: 50,
        fixed: 'left',
        align: 'center',
        visible: detailInfo.value?.type === 'edit',
      },
      // { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'packageNo',
        title: '包装号',
        width: '170',
        sortable: true,
      },
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
        field: 'qty',
        title: '数量',
        width: '90',
        sortable: true,
        align: 'right',
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
      { field: 'lot', title: '批号', width: '100' },
      { field: 'guaranteeDate', title: '效期', width: '100' },
      {
        field: 'vendorName',
        title: '供应商',
        width: '80',
      },
      { field: 'locatorName', title: '货位', width: '120', sortable: true },
      {
        field: 'storageStatusName',
        title: '库存状态',
        width: '120',
        sortable: true,
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
            dictUrl: '/baseHandleAction/warehouse.do?level1=N&readWrite=Y&',

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
              const warehouseType = option.warehouseType;
              // toWarehouseParams.value = {};
              if (warehouseType && warehouseType > 1) {
                for (let i = 1; i < warehouseType; i++) {
                  // toWarehouseParams.value[`level${i}`] = 'Y';
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
            rules: parentData.value.orderId ? '' : 'required',

            afterFetch(res: any) {
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
              ChcGridApi.formApi?.setFieldValue(
                'warehouseId',
                parentData.value.warehouseId || undefined,
              );
            }
          },
        },
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
            autoChooseFirstOption: !parentData.value.orderId,
            dictUrl: '/baseHandleAction/warehouse.do?accessAll=Y&level1=Y',
            disabled: !!parentData.value.orderId,
            defaultValue: parentData.value.toWarehouseId || undefined,
            // showSearch: true,
            placeholder: '请选择上级仓库',
            allowClear: true,
            triggerFields: parentData.value.orderId ? [] : ['warehouseId'],
            onChange(val: any, option: any) {
              console.warn('toWarehouseId', val, option);
              // console.warn('selectToWarehouseId', selectToWarehouseId);
              // selectToWarehouseId.value = option.id;
              // selectController.sign();
            },
            extraParams: toWarehouseParams.value,
            paginate: false,
            // showChooseAll: '',
            immediate: true,
            rules: parentData.value.orderId ? '' : 'required',
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },
        dependencies: {
          triggerFields: ['warehouseId', 'level1', 'level2', 'level3'],
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
                ...toWarehouseParams.value,
                warehouseId: values.warehouseId,
              };
              ChcGridApi.formApi
                ?.getFieldComponentRef('toWarehouseId')
                ?.fetchApi();
            }
          },
        },

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
            rules: parentData.value.orderId ? '' : 'required',

            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows || [] };
            },
          };
        },

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
      {
        component: 'Input',
        fieldName: 'packageNo',
        label: '包装号',
        componentProps: {
          placeholder: '请输入包装号',
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
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      keyboardConfig: {
        isEdit: true,
      },
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
      keepSource: true,
      //   rowConfig: {
      //   isCurrent: false,
      // },
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
        editRender: {
          name: 'VxeInput',
          // name: 'VxeNumberInput',
        },
        minWidth: '150px',
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
        width: 180,
      },
      //   {
      // field: "productValue",
      // width: "150",
      // hidden: true
      // }
    ],

    id: 'child',
    // tableSearchExtraParams: parentTableParams.value,
    // queryUrl: '/orderAction/queryLine.do?page=woInput&specShowType=from',
    queryUrl: '/orderAction/queryLine.do?specShowType=from&page=moInput',
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
        // 用于获取当前正在操作行和列的赋值
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

const currentInsertRows = ref<any[]>([]); // 当前插入的临时数据行
const currentUpdateRows = ref<any[]>([]); // 当前有更新的数据行
const autoSaveController = ref<'error' | 'onSaving' | 'wait'>('wait'); // 自动保存控制字段， error上一轮保存保存了 onSaving上一轮还在保存中 wait上一轮保存结束，等待下一次保存
const currentEditRow = ref<any>(); // 当前正在操作的行
const currentField = ref(''); // 当前正在操作的列field

onMounted(() => {
  if (parentData.value.orderId) {
    console.warn('parentData.value:', parentData.value);
    // 解决bug1335
    ChcGridApi.formApi.setFieldValue(
      'departmentId',
      parentData.value.departmentId,
    );
    ChcGridApi.formApi.setFieldValue(
      'warehouseId',
      parentData.value.warehouseId,
    );
    ChcGridApi.formApi.setFieldValue(
      'toWarehouseId',
      parentData.value.toWarehouseId,
    );
    ChcGridApi.formApi.getValues().then(async (res: any) => {
      const sertchData = queryparams(res);

      ChcGridApi.query(sertchData);
    });
    roleGridApi.query();
  }
});

const handleAdd = () => {
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();

  if (selectedRows.length === 0) return message.warning('请先选择数据');
  ChcGridApi.formApi.getValues().then(async (res: any) => {
    const sertchData = queryparams(res);

    const params: any = {
      ...sertchData,
    };
    params.orderType = 'WR';
    params.returnDoc = 'Y';
    params.isOutNeedPick = 'N';
    params.orderId = parentData.value.orderId;
    params.isPackaged = 'Y';
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
    description: formValues.storageStatus || parentData.value.description,
  };
};

// const hasEditStatus = (row: any) => {
//   return ChcGridApi.grid?.isEditByRow(row);
// };

const hasChildEditStatus = (row: any) => {
  return roleGridApi.grid?.isEditByRow(row);
};

// const handleEdit = (scope: any, tableType: 'child' | 'parent') => {
//   const tableApi = tableType === 'parent' ? ChcGridApi : roleGridApi;
//   const updateRows = tableApi.grid.getUpdateRecords();

//   if (updateRows.length > 1) {
//     return message.warn('请将当前编辑的数据保存，再编辑');
//   } else if (
//     updateRows.length === 1 &&
//     updateRows[0][ROWKEYFIELD] !== scope.row[ROWKEYFIELD]
//   ) {
//     // 编辑行只有一条，并且不是当前删除行
//     return message.warn(
//       '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
//     );
//   }

//   tableApi.grid.setEditRow(scope.row, true);
// };

// const handleSave = (scope: any) => {
//   if (!(scope.row.qtyApply > 0)) {
//     return message.error('申请数量必须大于零!');
//   } else if (scope.row.qtyApply > (scope.row.qtyAvailable || 0)) {
//     return message.error('申请数量必须小于等于可用数量!');
//   }
//   ChcGridApi.grid.clearEdit(scope.row);
//   scope.$grid.clearEdit();
// };

const handleSaveOrder = (scope: any) => {
  return new Promise((resolve) => {
    const params = {
      orderId: parentData.value.orderId,
      lineData: JSON.stringify({ data: [scope.row] }),
    };
    modifyLine(params).then((res) => {
      if (res && res.success) {
        message.success('修改成功');
        const sertchData = queryparams(res);
        ChcGridApi.query(sertchData);
        roleGridApi.query();
        resolve(res);
      }
    });
  });
};

// const handleCalcel = (scope: any) => {
//   scope.$grid.clearEdit();
//   scope.$grid.revertData(scope.row);
// };

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
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <div class="h-full">
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
              <!-- <Button
                v-if="
                  !hasChildEditStatus(scope.row) &&
                  detailInfo?.value?.type !== 'view'
                "
                type="primary"
                ghost
                @click.stop="handleEdit(scope, 'child')"
                :loading="scope.row.loading"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              >
                编辑
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button> -->
              <Button
                type="primary"
                ghost
                danger
                @click="handleDeleteRow(scope)"
                :loading="scope.row.loading"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
                v-if="
                  !hasChildEditStatus(scope.row) &&
                  detailInfo?.value?.type !== 'view'
                "
                :data-testid="`button_delete_row_${scope.rowIndex}_documentDetail`"
              >
                删行
                <template #icon>
                  <SvgDeleteIcon />
                </template>
              </Button>

              <!-- <Button
                v-if="
                  (hasChildEditStatus(scope.row) ||
                    scope.$grid.isUpdateByRow(scope.row) ||
                    scope.$grid.isInsertByRow(scope.row)) &&
                  detailInfo?.value?.type !== 'view'
                "
                :loading="scope.row.loading"
                type="primary"
                ghost
                @click.stop="handleSaveOrder(scope)"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              >
                保存
                <template #icon>
                  <SvgSaveIcon />
                </template>
              </Button> -->
              <!-- <Button
                v-if="
                  hasChildEditStatus(scope.row) &&
                  !scope.$grid.isInsertByRow(scope.row) &&
                  detailInfo?.value?.type !== 'view'
                "
                type="primary"
                ghost
                @click.stop="handleCalcel(scope)"
                :loading="scope.row.loading"
                class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              >
                取消
                <template #icon>
                  <SvgBackIcon />
                </template>
              </Button> -->
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
  </Page>
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
</style>

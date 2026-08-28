<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table.js';

import { h, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useVbenModal } from '@vben/common-ui';
import { Button, Modal as AntModal, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { ChcSelect } from '@vben/chc-ui';
import { EditableTable } from '#/components/editableTable';
import { $t } from '#/locales';
import { handlePriceToFixedTwo } from '#/utils/util';

import {
  batchCheck,
  queryOrderPlanLineInfo,
  saveDo,
  saveLine,
  verifyCheck,
} from './api';
import addModalUi from './addModal/index.vue';
import attachmentModal from './attachment/attachmentModal.vue';
import actionLogModal from './modals/actionLogModal.vue';
import checkModalUi from './modals/checkModal.vue';
import codeCheckModal from './modals/codeCheck/codeCheckModal.vue';
import codeModal from './modals/codeModal.vue';

const route = useRoute();
const urlParams: any = route.meta?.urlParams || {}; // 路由中传递的参数
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab
const parentData = defineModel<any>('parentData', {
  required: true,
}); // 当前正在处理的行数据
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo'); // 详情页配置信息
const editableTableRef = ref<InstanceType<typeof EditableTable>>();
const currentWarehouseInfo = ref<any>({});
const disabledNo = ref(false);

const selectParams = ref<{ [key: string]: any }>({
  warehouseId: parentData.value?.warehouseId || undefined,
});

const [CheckModal, checkModalApi] = useVbenModal({
  connectedComponent: checkModalUi,
});

const [AddModal, addModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  connectedComponent: addModalUi,
  draggable: true,
});

const [AttachmentModal, attachmentModalApi] = useVbenModal({
  connectedComponent: attachmentModal,
});

const [CodeModal, codeModalApi] = useVbenModal({
  connectedComponent: codeModal,
});

const [CodeCheckModal, codeCheckModalApi] = useVbenModal({
  connectedComponent: codeCheckModal,
  confirmText: '确认',
});

const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});

// 加载状态
const totalHandleLoading = ref(false);
const gridColumns = ref<VxeGridProps['columns']>([
  // { type: 'checkbox', title: '', width: 40, align: 'center' },
  {
    title: '序号',
    type: 'seq',
    width: 40,
    align: 'center',
    sortable: true,
  },
  {
    field: 'productCode',
    minWidth: 110,
    title: '药品编码',
    sortable: true,
  },
  {
    field: 'productName',
    minWidth: 160,
    title: '药品名称',
    sortable: true,
  },
  {
    field: 'productSpec',
    minWidth: 60,
    title: '规格',
    sortable: true,
  },
  {
    field: 'modelNo',
    minWidth: 80,
    title: '型号',
    sortable: true,
    visible: false,
  },
  {
    field: 'lot',
    minWidth: 100,
    title: '批号',
    sortable: true,
  },
  {
    field: 'guaranteeDate',
    minWidth: 100,
    title: '效期',
    sortable: true,
  },
  {
    field: 'lineStatusName',
    minWidth: 100,
    title: '状态',
    sortable: true,
  },
  {
    field: 'serNo',
    minWidth: 80,
    title: '序列号',
    sortable: true,
  },
  {
    field: 'uomName',
    minWidth: 60,
    title: '单位',
    sortable: true,
  },
  {
    field: 'qtyArrived',
    minWidth: 90,
    title: '配送数量',
    sortable: true,
    align: 'right',
  },
  {
    field: 'qtyChecked',
    minWidth: 110,
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
      },
    },
    title: '验收合格数量',
    sortable: true,
    align: 'right',
  },
  {
    field: 'qtyRejected',
    minWidth: 90,
    editRender: {
      name: 'ChcInputNumber',
      props: {
        min: 0,
      },
    },
    title: '拒收数量',
    sortable: true,
    align: 'right',
  },
  {
    field: 'rejectReason',
    minWidth: 120,
    title: '拒收原因',
    formatter: ({ row }: any) => {
      return row.rejectReasonName;
    },
    editRender: {
      name: 'ChcSelect',
      props: {
        dictUrl: '/baseHandleAction/refList.do?id=1000068',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        paginate: false,
        filterByFrontEnd: true,
        immediate: true,
        allowClear: true,
        onChange(val: any, option: any, scope: any) {
          scope.row.rejectReason = val;
          scope.row.rejectReasonName = option?.label || option?.name;
        },
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      },
    },
    sortable: true,
  },
  {
    field: 'priceActual',
    minWidth: 90,
    title: '入库单价',
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.priceActual);
    },
    sortable: true,
    align: 'right',
  },
  {
    field: 'lineAmt',
    minWidth: 90,
    title: '配送金额',
    sortable: true,
    formatter({ row }: any) {
      return handlePriceToFixedTwo(row.lineAmt);
    },
    align: 'right',
  },
  {
    field: 'certificateNo',
    minWidth: 120,
    title: '批准文号',
    sortable: true,
  },
  {
    field: 'certValidTo',
    minWidth: 150,
    title: '注册证有效期',
    sortable: true,
  },
  {
    field: 'manufacturer',
    minWidth: 120,
    title: '生产厂家',
    sortable: true,
  },
  {
    field: 'insurance',
    minWidth: 140,
    title: '医保药品编码',
    sortable: true,
  },
  {
    field: 'productionDate',
    minWidth: 100,
    title: '生产日期',
    sortable: true,
  },
  {
    field: 'disinfectLot',
    title: '灭菌批号',
    minWidth: 100,
    sortable: true,
    visible: false,
  },
  {
    field: 'taxInvoiceNo',
    minWidth: 100,
    title: '发票号',
    sortable: true,
  },
  {
    align: 'center',
    field: 'action',
    slots: { default: 'action' },
    fixed: 'right',
    headerAlign: 'center',
    showOverflow: false,
    title: '操作',
    width: detailInfo.value?.type === 'edit' ? 200 : 140,
  },
]);

/**
 * 表格表单配置
 */
const formSchema: VbenFormProps['schema'] = [
  {
    component: 'Input',
    fieldName: 'asnNo',
    componentProps: {
      disabled: true,
    },
    defaultValue: parentData.value?.asnNo || undefined,
    label: '配送单号',
    formItemClass: 'pb-2',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/vendor.do',
      disabled: !!parentData.value?.bpartnerId,
      apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      showSearch: true,
      placeholder: '请选择供应商',
      paginate: false,
      filterByFrontEnd: true,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    defaultValue: parentData.value?.bpartnerId || undefined,
    fieldName: 'bpartnerId',
    label: '供应商',
    formItemClass: 'pb-2',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y',
      placeholder: '请选择',
      onChange(val: any, option: any) {
        currentWarehouseInfo.value = option;
        selectParams.value.warehouseId = val;
      },
      showSearch: true,
      paginate: false,
      disabled: !!parentData.value?.warehouseId,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    defaultValue: parentData.value?.warehouseId || undefined,
    formItemClass: 'pb-2',
    fieldName: 'warehouseId',
    label: '采购仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/bpartner.do?type=4&readWrite=Y',
      placeholder: '请选择',
      showSearch: true,
      paginate: false,
      immediate: true,
      labelField: 'name',
      disabled: !!parentData.value?.applyBPartnerId,
      valueField: 'id',
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    defaultValue: parentData.value?.applyBPartnerId || undefined,
    formItemClass: 'pb-2',
    fieldName: 'applyBPartnerId',
    label: '需求仓库',
  },
  {
    component: 'ChcSelect',
    componentProps: {
      dictUrl: '/baseHandleAction/refList.do?id=1000480',
      apiType: 'post',
      requestContentType: 'application/x-www-form-urlencoded',
      showSearch: true,
      placeholder: '请选择开票方式',
      onChange(val: any) {
        disabledNo.value = val === '2';
      },
      paginate: false,
      filterByFrontEnd: true,
      immediate: true,
      labelField: 'name',
      valueField: 'id',
      afterFetch(res: any) {
        return { ...res, rows: undefined, records: res.rows };
      },
    },
    defaultValue: parentData.value?.invoiceMethod || undefined,
    fieldName: 'invoiceMethod',
    label: '开票方式',
    formItemClass: 'pb-2',
  },
  {
    component: 'Input',
    fieldName: 'taxInvoiceNo',
    componentProps: {
      disabled: true,
    },
    defaultValue: parentData.value?.taxInvoiceNo || undefined,
    label: '发票号',
    formItemClass: 'pb-2',
  },
  {
    component: 'Input',
    fieldName: 'lineAmt',
    componentProps: {
      disabled: true,
    },
    defaultValue: parentData.value?.lineAmt || undefined,
    label: '总金额',
    formItemClass: 'pb-2',
  },
  {
    component: 'Input',
    fieldName: 'description',
    componentProps: {
      disabled: true,
    },
    defaultValue: parentData.value?.description || undefined,
    label: '采购备注',
    formItemClass: 'pb-2',
  },
  {
    component: 'Input',
    fieldName: 'checkDescription',
    componentProps: {},
    label: '验收备注',
    formItemClass: 'pb-2',
  },
];

/**
 * 初始化表格数据
 */
const init = () => {
  disabledNo.value = parentData.value?.invoiceMethod === '2';
  if (parentData.value?.asnId) {
    editableTableRef.value!.showLoading = true;
    queryOrderPlanLineInfo({
      asnId: parentData.value.asnId,
    }).then(async (res) => {
      if (res.success) {
        // 预处理数据：设置 qtyChecked 默认值
        const processedRows = (res.rows || []).map((row: any) => {
          if (row?.lineStatus === 'N' && row.qtyArrived &&
            (!row.qtyChecked || row.qtyChecked === 0 || row.qtyChecked === '0')
) {
            // 待验收
            row.qtyChecked = row.qtyArrived - (row.qtyRejected || 0);
          } else {
            row.qtyChecked = row.qtyChecked || 0;
          }
          return row;
        });
        editableTableRef.value?.initRows(processedRows);
        editableTableRef.value!.showLoading = false;
      } else {
        message.error(res.msg);
      }
    });
  }
};

onMounted(() => {
  init();
});

// 行数据验证
function rowDataValidate(row: any) {
  return new Promise<boolean>((resolve, reject) => {
    if (
      Number(row.qtyChecked) + Number(row.qtyRejected) !==
      Number(row.qtyArrived)
    ) {
      message.error('验收合格数量+拒收数量应该等于配送数量，请检查本行！');
      reject(new Error('验收数量不正确'));
    } else if (row.qtyRejected !== 0 && !row.rejectReason) {
      message.error('请选择拒收原因！');
      reject(new Error('请选择拒收原因'));
    } else if (row.qtyRejected === 0 && row.rejectReason) {
      message.error('没有拒收数量，请不要选择拒收原因！');
      reject(new Error('拒收原因不正确'));
    } else {
      resolve(true);
    }
  });
}

// 构建查询参数
const queryparams = (
  type: 'saveDo' | 'saveLine' | 'delete',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  // 深度过滤每个行对象中的null和undefined属性
  const filteredRows = rows.map((row) => {
    if (!row) return row;
    return Object.fromEntries(
      Object.entries(row).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );
  });

  lineData = JSON.stringify({
    created: type === 'saveLine' ? filteredRows : [],
    updated: type === 'saveDo' ? filteredRows : [],
    removed: type === 'delete' ? filteredRows : [],
  });

  return {
    orderPlanId: parentData.value?.orderPlanId || 0,
    asnId: parentData.value?.asnId || 0,
    warehouseId: formValues.warehouseId,
    applyBPartnerId: formValues.applyBPartnerId,
    invoiceMethod: formValues.invoiceMethod,
    bpartnerId: formValues.bpartnerId,
    description: formValues.description,
    isCrossDocking: urlParams.isCrossDocking,
    isPackaged: urlParams.isPackaged,
    receiptType: urlParams.receiptType,
    isShortPo: urlParams.isShortPo,
    type: urlParams.type,
    asnType: 'PO',
    lineData,
  };
};

// 保存行数据
const saveRow = (row: any) => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi
      .getValues()
      .then(async (res: any) => {
        const type = row.asnLineId ? 'saveDo' : 'saveLine';
        const params = queryparams(type, res, [row]);
        const paramsNew = {
          ...params,
          receiptType: res.receiptType || parentData.value?.receiptType,
          description: res.description || parentData.value?.description,
          warehouseId: res.warehouseId || parentData.value?.warehouseId,
          applyBPartnerId:
            res.applyBPartnerId || parentData.value?.applyBPartnerId,
          invoiceMethod: res.invoiceMethod || parentData.value?.invoiceMethod,
          bpartnerId: res.bpartnerId || parentData.value?.bpartnerId,
          asnType: 'PO',
          asnLineId: row.asnLineId,
        };
        // 过滤掉null和undefined值
        const paramsNewFiltered = Object.fromEntries(
          Object.entries(paramsNew).filter(
            ([_, value]) => value !== null && value !== undefined,
          ),
        );

        saveLine(paramsNewFiltered)
          .then((res) => {
            if (res && res.success) {
              if (!parentData.value?.asnId) {
                parentData.value = { asnId: res.data.header.asnId };
                editableTableRef.value?.formApi.setFieldValue(
                  'asnId',
                  res.data.header.asnId,
                );
              }
              queryOrderPlanLineInfo({ asnId: res.data.header.asnId }).then(
                async (resIn) => {
                  const newRow: { [key: string]: any } =
                    resIn.rows.find(
                      (item: any) => item.asnLineId === res.data.lines[0],
                    ) || {};
                  // 设置qtyChecked默认值为qtyArrived
                  if (
                    newRow &&
                    newRow.qtyArrived &&
                    (!newRow.qtyChecked ||
                      newRow.qtyChecked === 0 ||
                      newRow.qtyChecked === '0')
                  ) {
                    newRow.qtyChecked = newRow.qtyArrived;
                  }
                  resolve(newRow);
                },
              );
            }
          })
          .catch((error) => {
            row.loading = false;
            reject(error);
          });
      })
      .catch((error: any) => {
        row.loading = false;
        reject(error);
      });
  });
};

// 删除行数据
const deleteRows = (rows: any[]) => {
  return new Promise((resolve) => {
    editableTableRef.value?.formApi.getValues().then(async (res: any) => {
      const params = queryparams('delete', res, rows);
      const paramsNew = {
        ...params,
        receiptType: res.receiptType || parentData.value?.receiptType,
        description: res.description || parentData.value?.description,
        warehouseId: res.warehouseId || parentData.value?.warehouseId,
        applyBPartnerId:
          res.applyBPartnerId || parentData.value?.applyBPartnerId,
        invoiceMethod: res.invoiceMethod || parentData.value?.invoiceMethod,
        bpartnerId: res.bpartnerId || parentData.value?.bpartnerId,
        asnType: 'PO',
      };
      // 过滤掉null和undefined值
      const paramsNewFiltered = Object.fromEntries(
        Object.entries(paramsNew).filter(
          ([_, value]) => value !== null && value !== undefined,
        ),
      );
      saveDo(paramsNewFiltered).then((res) => {
        resolve(res);
      });
    });
  });
};

// 表格额外配置
const gridOptions: VxeGridProps = {
  toolbarConfig: {
    zoom: true,
    custom: true,
  },
  editConfig: {
    beforeEditMethod(scope: any) {
      return scope.row.lineStatus === 'N';
    },
  },
  rowStyle(scope: any) {
    // AI-GENERATED-BEGIN
    // @date 2026-07-02
    // @prompt 这个页面没有多选，能不能搜索到帮我高亮
    // @description 增加搜索匹配时的高亮样式
    if (scope && scope.row && scope.row._searchMatched) {
      return {
        backgroundColor: '#FFF2CC',
        color: '#000',
      };
    }
  },
  cellStyle(scope: any) {
    const finalStyle: { [key: string]: number | string } = {
      color: '',
      backgroundColor: '',
    };
    if (
      editableTableRef.value?.editFieldArr?.includes(scope.column.field) &&
      detailInfo.value?.type !== 'view'
    ) {
      finalStyle.backgroundColor = '#D7FFF5';
    }
    if (
      scope.column.field === 'priceActual' &&
      scope.row.priceActual !== scope.row.priceList
    ) {
      finalStyle.color = 'red';
    }
    return finalStyle;
  },
};

// 整体保存
const totalSave = () => {
  return new Promise((resolve, reject) => {
    editableTableRef.value?.formApi.getValues().then(async (res: any) => {
      const params = queryparams('saveDo', res, []);
      const paramsNew = {
        ...params,
        receiptType: res.receiptType || parentData.value?.receiptType,
        warehouseId: res.warehouseId || parentData.value?.warehouseId,
        applyBPartnerId:
          res.applyBPartnerId || parentData.value?.applyBPartnerId,
        invoiceMethod: res.invoiceMethod || parentData.value?.invoiceMethod,
        bpartnerId: res.bpartnerId || parentData.value?.bpartnerId,
        description: res.description || parentData.value?.description,
        asnType: 'PO',
      };
      saveDo(paramsNew)
        .then(() => {
          currentTab.value = 0;
          message.success('保存成功');
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
};

// 操作列按钮功能
// 追溯码
const handleCode = (scope: any) => {
  codeModalApi
    .setData({
      warehouseId: scope.row.warehouseId,
      productCode: scope.row.productCode,
      productName: scope.row.productName,
      asnLineId: scope.row.asnLineId,
      lot: scope.row.lot,
      guaranteeDate: scope.row.guaranteeDate,
      replenishSource: 'P',
      type: detailInfo.value?.type,
    })
    .open();
};

// 修改批号
const handleAdd = (scope: any) => {
  addModalApi
    .setData({
      editableTableRef,
      openType: 'add',
      formData: {
        showForm: true,
        showFormLast: false,
        ...scope.row,
      },
    })
    .open();
};

// 附件
const handleVerDetail = (scope: any) => {
  attachmentModalApi.setData(scope.row).open();
};

// 操作记录
const handleDetail = (scope: any) => {
  actionLogModalApi
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.asnLineId,
    })
    .open();
};

// 扫码验收
const handleCodeCheck = () => {
  codeCheckModalApi
    .setData({
      asnId: parentData.value?.asnId,
      replenishSource: 'P',
      type: detailInfo.value?.type,
      callback: async () => {
        // 刷新表格
        init();
      },
    })
    .open();
};

// 处理黑名单变化
const handleBlackListChange = (blackList: string[]) => {
  // 更新表单字段禁用状态
  editableTableRef.value?.formApi.updateSchema([
    {
      fieldName: 'bpartnerId',
      componentProps: {
        disabled: !!parentData.value?.bpartnerId || blackList.length > 0,
      },
    },
    {
      fieldName: 'warehouseId',
      componentProps: {
        disabled: !!parentData.value?.warehouseId || blackList.length > 0,
      },
    },
    {
      fieldName: 'applyBPartnerId',
      componentProps: {
        disabled: !!parentData.value?.applyBPartnerId || blackList.length > 0,
      },
    },
    {
      fieldName: 'invoiceMethod',
      componentProps: {
        disabled: blackList.length > 0,
      },
    },
  ]);
};
const handleSearch = (val: string) => {
  console.warn('serachInputVal.value', val);
  const serachInputVal = val;
  // AI-GENERATED-BEGIN
  // @date 2026-07-02
  // @prompt 这个页面没有多选，能不能搜索到帮我高亮
  // @description 搜索时为匹配行设置_searchMatched标识，并滚动到第一条匹配的数据，同时触发视图更新
  let firstMatch = null;
  for (let i = 0; i < editableTableRef.value!.gridData.length; i++) {
    const item = editableTableRef.value!.gridData[i];
    if (
      serachInputVal &&
      ((item.productCode && item.productCode.includes(serachInputVal)) ||
        (item.productName && item.productName.includes(serachInputVal)) ||
        (item.productValue && item.productValue.includes(serachInputVal)))
    ) {
      item._searchMatched = true;
      if (!firstMatch) firstMatch = item;
    } else {
      item._searchMatched = false;
    }
  }

  if (firstMatch) {
    editableTableRef.value!.gridApi.scrollToRow(firstMatch);
  }
  // AI-GENERATED-END
};
const handleTotalSave = () => {
  const callBack = () => {
    totalHandleLoading.value = true;
    // console.warn('chcGridApi', chcGridApi.grid.getData());
    const tableData = editableTableRef.value!.gridData;
    editableTableRef.value!.formApi.getValues().then(async (res) => {
      const params = queryparams('saveDo', res, tableData);
      const formValue = await editableTableRef.value!.formApi.getValues();
      const paramsNew = {
        ...params,
        receiptType: formValue.receiptType || parentData.value.receiptType,
        warehouseId: formValue.warehouseId || parentData.value.warehouseId,
        applyBPartnerId:
          formValue.applyBPartnerId || parentData.value.applyBPartnerId,
        invoiceMethod:
          formValue.invoiceMethod || parentData.value.invoiceMethod,
        bpartnerId: formValue.bpartnerId || parentData.value.bpartnerId,
        description: formValue.description || parentData.value.description,
        asnType: 'PO',
      };
      console.warn('params', paramsNew);
      saveDo(paramsNew)
        .then(() => {
          totalHandleLoading.value = false;
          currentTab.value = 0;
        })
        .catch(() => {
          totalHandleLoading.value = false;
        });
    });
  };
  editableTableRef.value?.totalHandlePackageFn({
    callBack: callBack,
    skipErrorRow: false,
  });
};
const handleTotalSubmit = async (checkDescription: string = '') => {
  if (editableTableRef.value!.gridData.length === 0) {
    return message.error('请添加数据后再提交！');
  }
  const tableData = editableTableRef.value!.gridData;

  console.warn('tableData--handleTotalSubmit:', tableData);
  const asnLineIds = tableData.map((row) => row.asnLineId);
  const formData: any = await editableTableRef.value!.formApi.getValues();
  const params = {
    asnLineId: JSON.stringify(asnLineIds),
    remarks: checkDescription || formData.checkDescription || '',
  };
  totalHandleLoading.value = true;
  batchCheck(params)
    .then((res) => {
      if (res && res.success) {
        message.success('提交成功');
        totalHandleLoading.value = false;
        currentTab.value = 1;
      }
    })
    .catch(() => {
      totalHandleLoading.value = false;
    });
};
const checkProduct = async () => {
  const tableData = editableTableRef.value!.gridData;
  const hasNoRejectReasonData = tableData.some(
    (item) => !item.rejectReason && Number(item.qtyRejected || 0) > 0,
  );
  async function checkExpired() {
    const expiredData = tableData.filter((item) => item.asnLineId);
    if (expiredData.length > 0) {
      // return message.error('存在过期日期，请检查后再操作！');
      const res: any = await verifyCheck({
        asnLineId: expiredData.map((item) => item.asnLineId).join(','),
      });
      if (res.success) {
        if (res.checkContent || res.cretContent) {
          const formData: any =
            await editableTableRef.value!.formApi.getValues();
          checkModalApi
            .setData({
              content: res.checkContent
                ? res.checkContent?.split('。') || []
                : [],
              msg: res.cretContent ? res.cretContent?.split('。') || [] : [],
              checkDescription: formData.checkDescription || '',
            })
            .open();
        } else {
          handleTotalSubmit();
        }
      }
      return;
    }
    handleTotalSubmit();
  }
  if (hasNoRejectReasonData) {
    AntModal.confirm({
      title: '提示',
      content: `当前订单存在有拒绝数量但未填写拒绝原因的行，是否确认提交？`,
      okText: '确认',
      okType: 'danger',
      onOk: async () => {
        checkExpired();
      },
    });
  } else {
    checkExpired();
  }
};
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <AttachmentModal />
    <CheckModal @confirm="handleTotalSubmit" />
    <CodeModal />
    <CodeCheckModal />
    <AddModal :after-submit="init" />
    <EditableTable
      id="checkWarehouseEditableTable"
      ref="editableTableRef"
      :row-data-validate="rowDataValidate"
      :grid-columns="gridColumns"
      :grid-options="gridOptions"
      :view-type="detailInfo?.type"
      :form-schema="formSchema"
      :save-row="saveRow"
      :delete-rows="deleteRows"
      :totalSave="totalSave"
      :batchAddModalGridOptions="{}"
      :batchAddModalFormOptions="{}"
      :slotsConfig="{
        showSingleSelect: false,
        showBatchAddBtn: false,
        showBatchDelBtn: false,
        showDelRowBtn: false,
      }"
      :handleSearch="handleSearch"
      :can-delete-row="false"
      @blackListChange="handleBlackListChange"
    >
      <!-- 自定义操作列 -->
      <template #action="scope">
        <!-- !scope.$grid.isEditByRow(scope.row) &&  -->
        <Button
          v-if="detailInfo?.type === 'add'"
          :disabled="scope.$grid.isEditByRow(scope.row)"
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          :data-testid="`button_action_log_${scope.rowIndex}_documentDetail`"
        >
          操作记录
        </Button>
        <Button
          type="primary"
          v-if="detailInfo?.type === 'view'"
          style="background-color: #b17a33d4"
          @click="handleCode(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :disabled="
            scope.row.lineStatus !== 'N' || scope.$grid.isEditByRow(scope.row)
          "
          :data-testid="`button_code_${scope.rowIndex}_documentDetail`"
        >
          追溯码
        </Button>
        <!-- !scope.$grid.isEditByRow(scope.row) && -->
        <Button
          type="primary"
          v-if="detailInfo?.type === 'edit'"
          danger
          style="background-color: #3717bb94"
          @click="handleAdd(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_edit_lot_${scope.rowIndex}_documentDetail`"
          :disabled="
            scope.row.lineStatus !== 'N' || scope.$grid.isEditByRow(scope.row)
          "
        >
          修改批号
        </Button>
        <!-- v-if="!scope.$grid.isEditByRow(scope.row)" -->
        <Button
          type="primary"
          :disabled="scope.$grid.isEditByRow(scope.row)"
          style="background-color: #1f695894"
          @click="handleVerDetail(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_ver_detail_${scope.rowIndex}_documentDetail`"
        >
          附件
        </Button>
      </template>
      <template #bottom>
        <div class="flex items-center justify-between pt-[10px]">
          <div>汇总信息</div>
          <div class="flex gap-[10px]">
            <Button
              type="primary"
              danger
              ghost
              @click="handleCodeCheck"
              :loading="totalHandleLoading"
              v-if="detailInfo?.type !== 'view' && parentData.asnId"
              data-testid="button_save_documentDetail"
            >
              扫码确认
            </Button>
            <Button
              type="primary"
              ghost
              @click="handleTotalSave"
              :loading="totalHandleLoading"
              v-if="detailInfo?.type === 'add'"
              data-testid="button_save_documentDetail"
            >
              保存
            </Button>
            <Button
              type="primary"
              ghost
              @click="checkProduct"
              :loading="totalHandleLoading"
              v-if="detailInfo?.type === 'edit'"
              data-testid="button_submit_documentDetail"
            >
              提交
            </Button>
          </div>
        </div>
      </template>
    </EditableTable>
  </div>
</template>
<style scoped></style>

<script setup lang="ts">
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, h, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { AntdUploadloadOutlined, viewActionIcon } from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';
import { useVbenModal } from '@vben/common-ui';
import { VxeUI } from '@vben/plugins/vxe-table';

import {
  Upload as AntdUpload,
  Button,
  DatePicker,
  Input,
  message,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { triggerArrowDown } from '#/utils/event';
import { handlePriceToFixedTwo } from '#/utils/util';
import previewImage from '#/views/modules/spd/views/common/previewImages/index.vue';

import {
  dataCommit,
  getinvoicePicture,
  getOrderPlanStorage,
  queryOrderPlanLineInfo,
  saveDo,
  saveLine,
} from './api';
import actionLogModal from './modals/actionLogModal.vue';
import batchAddModal from './modals/batchAddModal.vue';
import codeModal from './modals/codeModal.vue';

const VxeInput = VxeUI.getComponent('VxeInput');
// const VxeDatePicker = VxeUI.getComponent('VxeDatePicker');
const VxeNumberInput = VxeUI.getComponent('VxeNumberInput');
const route = useRoute();

const urlParams: any = route.meta?.urlParams || {};
const ROWKEYFIELD = 'productCode';
const currentTab = defineModel<number>('currentTab', { required: true });
const parentData = defineModel<any>('parentData', {
  required: true,
});
const detailInfo = defineModel<DetailInfo | undefined>('detailInfo');
const currentWarehouseInfo = ref<any>({});
const selectParams = ref<{ [key: string]: any }>({
  replenishSource: 'P',
  warehouseId: undefined,
  vendorId: undefined,
});
const gridData = ref<any[]>([]);
const vendorParams = ref<any>();
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const chcSelect = ref();
const currentEditRow = ref<any>();
const currentField = ref('');
const fileList = ref<any[]>([]); // 发票图片上传文件列表
const imageUrl = ref(''); // 发票图片Base64编码
const isSaved = ref(false); // 标识是否已保存过
// const temAsnLineId = ref(null); // temAsnLineId- asnLineId
// class LazySelect {
//   callBack;
//   count;
//   nowNum = 0;
//   constructor(count: number, callBack: () => void) {
//     this.count = count;
//     this.callBack = callBack;
//   }
//   sign() {
//     this.nowNum++;
//     if (this.nowNum === this.count) {
//       this.callBack();
//     }
//   }
// }
// 用于控制表格的查询在所有select下拉框查询完并赋值后触发
// const selectController = new LazySelect(2, async () => {
//   await nextTick();
//   chcGridApi.formApi.getValues().then((res: any) => {
//     chcGridApi.query({ ...res });
//   });
// });

// 基础表单schema
const getBaseSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'orderNo',
    componentProps: () => {
      return {
        disabled: true,
      };
    },
    defaultValue: detailInfo.value?.typeAction?.includes('invoice')
      ? '已开票'
      : '未开票',
    label: '开票状态',
    formItemClass: 'pb-2 mr-2',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        // autoChooseFirstOption: true,
        dictUrl: '/baseHandleAction/vendor.do?categoryType=2',
        disabled: disabledStates.value.supplier,
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        // onChange(val: any) {
        //   selectParams.value.vendorId = val;

        //   if (
        //     chcSelect.value &&
        //     chcSelect.value.fetchApi &&
        //     typeof chcSelect.value.fetchApi === 'function'
        //   ) {
        //     chcSelect.value.params.size = 25;
        //     chcSelect.value.params.limit = 25;
        //     chcSelect.value.fetchApi();
        //   }
        // },
        showSearch: true,
        placeholder: '请选择供应商',
        paginate: false,
        filterByFrontEnd: true,
        // showChooseAll: '',
        immediate: true,
        labelField: 'name',
        valueField: 'id',
        allowClear: false,
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    defaultValue: parentData.value!.bpartnerId || undefined,
    fieldName: 'bpartnerId',
    label: '供应商',
    formItemClass: 'pb-2 mr-2',
  },
  {
    component: 'ChcSelect',
    componentProps: () => {
      return {
        // autoChooseFirstOption: true,
        dictUrl:
          '/baseHandleAction/warehouse.do?level1=Y&readWrite=Y&categoryType=2',
        apiType: 'post',
        requestContentType: 'application/x-www-form-urlencoded',
        placeholder: '请选择',
        onChange(val: any, option: any) {
          currentWarehouseInfo.value = option;
          // selectParams.value.warehouseId = val;
          // selectController.sign();
          // if (
          //   chcSelect.value &&
          //   chcSelect.value.fetchApi &&
          //   typeof chcSelect.value.fetchApi === 'function'
          // ) {
          //   chcSelect.value.params.size = 25;
          //   chcSelect.value.params.limit = 25;
          //   chcSelect.value.fetchApi();
          // }
        },
        showSearch: true,
        paginate: false,
        disabled: disabledStates.value.warehouse,
        // showChooseAll: '',
        immediate: true,
        allowClear: false,
        labelField: 'name',
        valueField: 'id',
        afterFetch(res: any) {
          return { ...res, rows: undefined, records: res.rows };
        },
      };
    },
    defaultValue: parentData.value!.warehouseId || undefined,
    formItemClass: 'pb-2',
    fieldName: 'warehouseId',
    label: '采购仓库',
  },
];

// 发票相关的 Schema
const getInvoiceSchema = (): VbenFormSchema[] => [
  {
    component: h(
      'div',
      {
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#006be6',
        },
      },
      '发票信息',
    ),
    fieldName: '_taxInvoiceInfo',
    formItemClass: 'col-span-12 pb-2',
    hideLabel: true,
  },
  {
    component: 'Input',
    componentProps: () => {
      return {
        placeholder: '请输入发票号',
        disabled:
          !!parentData.value!.invoiceNo || disabledStates.value.invoiceFields,
      };
    },
    defaultValue: parentData.value!.invoiceNo || undefined,
    fieldName: 'invoiceNo',
    formItemClass: 'pb-2 mr-2',
    label: '发票号',
  },
  {
    component: 'Input',
    componentProps: () => {
      return {
        placeholder: '请输入发票代码',
        disabled:
          !!parentData.value!.invoiceTypeNo ||
          disabledStates.value.invoiceFields,
      };
    },
    defaultValue: parentData.value!.invoiceTypeNo || undefined,
    fieldName: 'invoiceTypeNo',
    formItemClass: 'pb-2 mr-2',
    label: '发票代码',
  },
  {
    component: 'DatePicker',
    componentProps: () => {
      return {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        disabled:
          !!parentData.value!.dateInvoiced ||
          disabledStates.value.invoiceFields,
      };
    },
    defaultValue: parentData.value!.dateInvoiced || undefined,
    fieldName: 'dateInvoiced',
    formItemClass: 'pb-2 mr-2',
    label: '发票日期',
  },
  {
    component: 'Input',
    componentProps: () => {
      return {
        placeholder: '请输入发票金额',
        disabled:
          !!parentData.value!.invoiceAmt || disabledStates.value.invoiceFields,
      };
    },
    defaultValue: parentData.value!.invoiceAmt || undefined,
    fieldName: 'invoiceAmt',
    formItemClass: 'pb-2 mr-2',
    label: '发票金额',
  },
  {
    // component: h(
    //   Button,
    //   {
    //     type: 'primary',
    //     'data-testid': 'button_uploadInvoicePicture',
    //     onClick: () => {
    //       console.log('发票图片上传');
    //     },
    //   },
    //   '发票图片上传',
    // ),
    component: 'Button',
    fieldName: 'taxInvoiceImgFunction',
    formItemClass: 'pb-2',
    hideLabel: true,
  },
];

// 设置发票相关的 Schema
const setInvoiceFormSchema = () => {
  chcGridApi.formApi.setState((prev: any) => {
    // console.log('prev', prev);
    // 检查是否已存在，防止重复添加
    const hasInvoiceDivider = prev?.schema.some(
      (s: any) => s.fieldName === '_taxInvoiceInfo',
    );
    if (hasInvoiceDivider) {
      return prev; // 如果已存在，直接返回旧状态，不做任何更改
    }
    const commonSchema = prev?.schema || [];
    return {
      schema: [...commonSchema, ...getInvoiceSchema()],
    };
  });
};
// 在获取到parentData数据后调用
const initInvoiceForm = async () => {
  // 先添加发票配置
  setInvoiceFormSchema();
  // 确保DOM更新完成
  await nextTick();
  chcGridApi.formApi.setValues({
    invoiceNo: parentData.value!.invoiceNo || undefined,
    invoiceTypeNo: parentData.value!.invoiceTypeNo || undefined,
    dateInvoiced: parentData.value!.dateInvoiced || undefined,
    invoiceAmt: parentData.value!.invoiceAmt || undefined,
  });
  // 如果是编辑和查看模式且有发票号,说明已保存过
  if (
    (detailInfo.value?.typeAction === 'invoiceEdit' ||
      detailInfo.value?.typeAction === 'invoiceView') &&
    parentData.value!.invoiceNo
  ) {
    isSaved.value = true;
  }
};
// 发票头部信息不可编辑
const isInvoiceViewMode = computed(
  () =>
    detailInfo.value?.typeAction === 'invoiceEdit' ||
    detailInfo.value?.typeAction === 'invoiceView',
);
// 统一管理所有禁用状态
const disabledStates = computed(() => ({
  supplier: !!parentData.value?.bpartnerId || blackList.value.length > 0,
  warehouse: !!parentData.value?.warehouseId || blackList.value.length > 0,
  invoiceFields: isInvoiceViewMode.value,
}));

// 添加一个计算属性来判断是否可以预览
const canPreview = computed(() => {
  // 已保存且有 asnId,或本地有图片
  return (isSaved.value && parentData.value?.asnId) || !!imageUrl.value;
});

// 工具函数集中管理
const utils = {
  filterNullish: (obj: Record<string, any>) =>
    Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined),
    ),
  handlePrice: (price: any): number => {
    if (typeof price === 'string') return Number.parseFloat(price);
    if (typeof price === 'number') return price;
    return 0;
  },
};

const [ChcGrid, chcGridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    submitButtonOptions: {
      show: false,
    },
    resetButtonOptions: {
      show: false,
    },
    showDefaultActions: true,
    showCollapseButton: true,
    wrapperClass:
      'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
    compact: false,
    commonConfig: {
      labelClass: 'w-[fit-content]',
    },
    schema: getBaseSchema(),
  },
  gridOptions: {
    virtualYConfig: {
      enabled: true,
    },
    keyboardConfig: {
      // isTab: true,
      // isEdit: true,
      // isArrow: true,
      // isEnter: true,
    },
    size: 'small',
    editConfig: {
      enabled: detailInfo.value?.type === 'edit',
      mode: 'row',
      trigger: 'click',
      showStatus: false,
      showIcon: false,
      autoClear: false,
      // beforeEditMethod({ row }) {
      //   // age 小于 27 的列禁止编辑
      //   if (row.age < 27) {
      //     return false;
      //   }
      //   return true;
      // },
    },
    checkboxConfig: {
      trigger: 'default',
      checkMethod: ({ row }: any) => {
        return row.asnLineId;
      },
    },
    keepSource: true,
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
    data: gridData.value,
    rowConfig: {
      isCurrent: false,
    },
    columns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      {
        title: '序号',
        type: 'seq',
        width: 40,
        align: 'center',
        sortable: true,
      },
      {
        field: 'productCode',
        minWidth: 100,
        title: '物资编码',
        align: 'center',
        sortable: true,
      },
      {
        field: 'productName',
        minWidth: 100,
        title: '产品名称',
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
        field: 'uomName',
        minWidth: 100,
        title: '单位',
        sortable: true,
      },
      {
        field: 'qtyArrived',
        minWidth: 110,
        editRender: {
          name: 'VxeNumberInput',
          props: {
            type: 'integer',
            min: 0,
            onChange() {
              const currentRow = chcGridApi.grid.getEditCell()!.row;
              console.warn('currentRow', currentRow);
              if (!currentRow) return null;
              if (currentRow.isGift === 'Y') {
                currentRow.priceActual = 0;
                currentRow.lineAmt =
                  utils.handlePrice(currentRow.qtyArrived) * 0;
              } else {
                // currentRow.priceActual = utils.handlePrice(
                //   currentRow.pricePo || currentRow.pricePO,
                // );
                currentRow.lineAmt =
                  utils.handlePrice(currentRow.qtyArrived) *
                  utils.handlePrice(currentRow.priceActual);
              }
            },
          },
        },
        title: '入库数量',
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceList', // 这个字段纯展示不做任何处理
        minWidth: 90,
        title: '零售价',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceList);
        },
        sortable: true,
        align: 'right',
      },
      {
        field: 'priceActual',
        minWidth: 120,
        title: '采购价',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.priceActual);
        },
        sortable: true,
        editRender: {},
        slots: { edit: 'edit_price' },
      },
      {
        field: 'lot',
        minWidth: 120,
        title: '批号',
        sortable: true,
        editRender: {},
        slots: { edit: 'edit_lot' },
      },
      // {
      //   field: 'productionDate',
      //   minWidth: 100,
      //   title: '生产日期',
      //   sortable: true,
      //   // editRender: {},
      //   editRender: {
      //     // name: 'ChcDatePicker',
      //     props: {
      //       class: 'ChcSelect-productionDate',
      //       format: ['YYYY-MM-DD', 'YYYYMMDD'],
      //       valueFormat: 'YYYY-MM-DD', // HH:mm:ss
      //       getPopupContainer() {
      //         return document.querySelector(
      //           '.editableTable .vxe-table--layout-wrapper', // .vxe-table--row-expanded-wrapper div  .sysUserTable
      //         );
      //       },
      //       onFocus() {
      //         // 手动触发键盘事件
      //         setTimeout(() => {
      //           const el = document.querySelector(
      //             `.ChcSelect-productionDate input`,
      //           );
      //           triggerArrowDown(el); // 手动触发一次下键，自动打开弹窗
      //         });
      //       },
      //     },
      //     autofocus: '.ant-picker-input input',
      //   },
      //   slots: { edit: 'edit_productionDate' },
      // },
      {
        field: 'guaranteeDate',
        minWidth: 120,
        title: '效期',
        sortable: true,
        // editRender: {},
        editRender: {
          // name: 'ChcDatePicker',
          props: {
            class: 'ChcSelect-guaranteeDate',
            format: ['YYYY-MM-DD', 'YYYYMMDD'],
            valueFormat: 'YYYY-MM-DD', // HH:mm:ss
            getPopupContainer() {
              return document.querySelector(
                '.editableTable .vxe-table--layout-wrapper', // .vxe-table--row-expanded-wrapper div  .sysUserTable
              );
            },

            onFocus() {
              // 手动触发键盘事件
              setTimeout(() => {
                const el = document.querySelector(
                  `.ChcSelect-guaranteeDate input`,
                );
                triggerArrowDown(el); // 手动触发一次下键，自动打开弹窗
              });
            },
          },
          autofocus: '.ant-picker-input input',
        },
        slots: { edit: 'edit_guaranteeDate' },
      },
      {
        field: 'lineAmt',
        minWidth: 80,
        title: '金额',
        sortable: true,
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.lineAmt);
        },
        align: 'right',
      },
      {
        field: 'manufacturer',
        minWidth: 120,
        title: '生产企业',
        sortable: true,
      },
      {
        field: 'lPackageQty',
        title: '大包装数',
        align: 'right',
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'mPackageQty',
        title: '中包装数',
        align: 'right',
        minWidth: 90,
        sortable: true,
      },
      {
        field: 'qtyOnhand',
        minWidth: 150,
        title: '需求库房库存数量',
        align: 'right',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        // visible: detailInfo.value?.type === 'edit',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: detailInfo.value?.type === 'edit' ? 230 : 160,
      },
    ],
    cellStyle(scope: any) {
      if (
        scope.column.field === 'qtyArrived' ||
        scope.column.field === 'vendorId' ||
        scope.column.field === 'isGift' ||
        scope.column.field === 'lot' ||
        scope.column.field === 'guaranteeDate' ||
        scope.column.field === 'serNo'
      ) {
        return {
          backgroundColor: '#D7FFF5',
        };
      }
      if (
        scope.column.field === 'pricePO' &&
        scope.row.pricePO !== scope.row.priceList
      ) {
        return {
          color: 'red',
        };
      }
    },
    rowStyle(scope: any) {
      if (scope && scope.row && scope.$table.isEditByRow(scope.row)) {
        return {
          backgroundColor: '#E0FFFC',
          color: '#000',
        };
      } else if (scope && scope.row && scope.$table.isInsertByRow(scope.row)) {
        return {
          backgroundColor: '#CEFFE4',
          color: '#000',
        };
      } else if (scope && scope.row && scope.$table.isUpdateByRow(scope.row)) {
        return {
          backgroundColor: '#FFE2E2',
          color: '#000',
        };
      }
    },
    headerCellStyle({ column }: any) {
      if (
        column.field === 'qtyArrived' ||
        column.field === 'vendorId' ||
        column.field === 'isGift' ||
        column.field === 'lot' ||
        column.field === 'guaranteeDate' ||
        column.field === 'serNo'
      ) {
        return {
          // backgroundColor: '#D7FFF5',
          // color: '#000',
        };
      }
    },
  },
  gridEvents: {
    editActivated: (scope: any) => {
      vendorParams.value = {
        productId: scope.row.productId,
        isNoProtocolPo: currentWarehouseInfo.value.isNoProtocolPo,
        isBPartnerProductControl:
          currentWarehouseInfo.value.isBPartnerProductControl,
        noProtocolPricePoSource: 'M', // 本字段写死为M
      };
      currentEditRow.value = { ...scope.row };
      currentField.value = scope.column.field;
    },
    editClosed: () => {
      currentEditRow.value = undefined;
      currentField.value = '';
      // scope.$grid.setEditRow(scope.row, false);
    },
  },
  // separator: false,
});

const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
});

// 采购价改变 重新计算 金额
const handlePriceChange = (scope: any) => {
  chcGridApi.grid.setRow(scope.row, {
    priceActual: scope.row.priceActual,
  });
  if (chcGridApi.grid.getEditCell() && chcGridApi.grid.getEditCell()!.row) {
    const currentRow = chcGridApi.grid.getEditCell()!.row;
    if (!currentRow) return null;
    currentRow.lineAmt =
      currentRow.isGift === 'Y'
        ? 0
        : utils.handlePrice(currentRow.qtyArrived) *
          utils.handlePrice(currentRow.priceActual);
  }
};

// 校验必填字段的方法
const validateRequiredFields = () => {
  return new Promise<boolean>((resolve) => {
    chcGridApi.formApi.getValues().then(async (temFormData) => {
      // console.warn('temFormData:', temFormData);
      const formValues: { [key: string]: any } = {
        warehouseId: temFormData.warehouseId || parentData.value.warehouseId,
        bpartnerId: temFormData.bpartnerId || parentData.value.bpartnerId,
        invoiceNo: temFormData.invoiceNo,
        invoiceTypeNo: temFormData.invoiceTypeNo,
        taxInvoiceDate: temFormData.dateInvoiced,
        invoiceAmt: temFormData.invoiceAmt,
      };
      console.warn('验证必填字段:', formValues);
      let requiredFields: Record<string, any>[] = [
        { field: 'bpartnerId', label: '供应商' },
        { field: 'warehouseId', label: '采购仓库' },
      ];
      // 如果是已开票，新增如下必填字段(发票号、发票代码、发票日期)
      if (detailInfo.value?.typeAction === 'invoice') {
        const invoiceFields = [
          { field: 'invoiceNo', label: '发票号', component: 'input' },
          { field: 'invoiceTypeNo', label: '发票代码', component: 'input' },
          { field: 'taxInvoiceDate', label: '发票日期' },
          // { field: 'invoiceAmt', label: '发票金额', component: 'input' }, // 开票金额放到保存时校验
        ];
        requiredFields = [...requiredFields, ...invoiceFields];
      }
      let errorMsg: string = '';
      let errorDesc: string = '';
      for (const { field, label } of requiredFields) {
        if (!formValues[field]) {
          errorMsg = label;
          errorDesc = `${requiredFields.find((item) => item.field === field)?.component === 'input' ? '请输入' : '请选择'}`;
          break;
        }
      }
      if (errorMsg) {
        await nextTick();
        chcSelect.value.modelValue = undefined;
        // 区分提示 如果是input需要提示请输入，否则提示请选择
        message.warning(`${errorDesc}${errorMsg}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

// 提取重复的表格状态检查
const checkTableEditState = (): { message?: string; valid: boolean } => {
  const insertRows = chcGridApi.grid.getInsertRecords();
  const updateRows = chcGridApi.grid.getUpdateRecords();

  if (insertRows.length > 0) {
    return {
      valid: false,
      message: '当前表格存在新增行未保存,请保存后再操作!',
    };
  }

  if (updateRows.length > 0) {
    return { valid: false, message: '当前表格存在未保存信息,请保存后再操作!' };
  }

  return { valid: true };
};

// 提取金额和跟输入的发票金额是否一致的校验函数(兼容整体保存和行保存)
const validatePriceActual = (
  tableData: any[],
  invoiceAmt: number,
  isSingleRow = false, // 是否为单行保存，单行保存时不校验金额一致性
): { message?: string; valid: boolean } => {
  // 单行保存跳过金额校验

  if (!tableData) {
    return { valid: false, message: '暂无表格数据!' };
  }
  if (!invoiceAmt) {
    return { valid: false, message: '请输入发票金额!' };
  }
  let totalAmt = 0;
  tableData.forEach((item: any) => {
    const lineAmount = Number(
      (Number(item.qtyArrived || 0) * Number(item.priceActual || 0)).toFixed(2),
    );
    totalAmt = Number((totalAmt + lineAmount).toFixed(2));
  });
  if (isSingleRow) {
    return { valid: true };
  }
  const inputInvoiceAmt = Number(Number(invoiceAmt || 0).toFixed(2));
  if (Math.abs(totalAmt - inputInvoiceAmt) > 0.01) {
    return {
      valid: false,
      message: `发票金额与表格金额不一致，请检查！ 表格金额:${totalAmt} 输入金额:${inputInvoiceAmt}`,
    };
  }
  return { valid: true };
};

// 监听一个简易ref数值的变化,数值变化后才能继续执行后续操作
// const watchDataChangePromise = (
//   watchData: Ref, // 监听的数据
//   timeout: number = 2000, // 超时时间
//   interval: number = 33, // 轮询间隔
// ) => {
//   return new Promise((resolve, reject) => {
//     const originData = watchData.value;
//     if (originData === 'onSaveing') {
//       let nowUseTime = 0;
//       // 轮询监控某个响应数据是否改变，改变了就resolve(true)，2s钟内未改变，resolve(false)
//       const timer = setInterval(() => {
//         nowUseTime += interval;
//         if (originData !== watchData.value && watchData.value === 'wait') {
//           clearInterval(timer);
//           resolve(true);
//         } else if (
//           originData !== watchData.value &&
//           watchData.value === 'error'
//         ) {
//           clearInterval(timer);
//           reject(new Error('保存失败'));
//         } else if (nowUseTime > timeout) {
//           watchData.value = 'wait';
//           clearInterval(timer);
//           resolve(false);
//         }
//       }, interval);
//     } else {
//       resolve(true);
//     }
//   });
// };

const handleClose = () => {
  currentTab.value = 0;
};
// 获取保存 删除 提交的基础params数据
const queryparams = (
  type: 'delete' | 'saveDo' | 'saveLine',
  formValues: any,
  rows: any[],
) => {
  let lineData = null;
  // 深度过滤每个行对象中的null和undefined属性
  const filteredRows = rows.map((row) => {
    if (!row) return row;
    // 删除applyBPartnerI这个属性后端要求
    delete row.applyBPartnerId;
    return utils.filterNullish(row);
  });
  console.warn('filteredRows:', filteredRows);
  lineData = JSON.stringify({
    created: type === 'saveLine' ? filteredRows : [],
    updated: type === 'saveDo' ? filteredRows : [],
    removed: type === 'delete' ? filteredRows : [],
  });
  return {
    orderPlanId: parentData.value.orderPlanId || 0,
    asnId: parentData.value.asnId || 0,
    warehouseId: formValues.warehouseId || parentData.value.warehouseId,
    bpartnerId: formValues.bpartnerId || parentData.value.bpartnerId,
    priorityRule: formValues.priorityRule || parentData.value.priorityRule,
    deliveryPlanDate:
      formValues.deliveryPlanDate || parentData.value.deliveryPlanDate,
    // applyBPartnerId: formValues.warehouseId, // 应用采购仓库
    invoiceMethod: '3', // 开票方式(后开票:3)
    description: formValues.description || parentData.value.description,
    receiptType: '2', // 入库类型(写死其他采购:2)
    isCrossDocking: urlParams.isCrossDocking,
    isPackaged: urlParams.isPackaged,
    // receiptType: urlParams.receiptType,
    isShortPo: urlParams.isShortPo,
    type: urlParams.type,
    asnType: 'PO',
    lineData,
  };
};
const deleteRow = (row: any) => {
  return new Promise((resolve) => {
    chcGridApi.formApi.getValues().then(async (res) => {
      const params = queryparams('delete', res, [row]);
      saveDo(params)
        .then((res) => {
          // 如果原先的 parentData.value.orderPlanId 没值，说明是新增进来的
          // 此时需要更新 parentData.value.orderPlanId
          resolve(res);
        })
        .catch(() => {
          row.loading = false;
        });
    });
  });
};
const handleDeleteRow = async (scope: any) => {
  const insertRows = chcGridApi.grid.getInsertRecords();
  const updateRows = chcGridApi.grid.getUpdateRecords();
  // 由于删行会造成编辑信息丢失，因此未保存行编辑信息的情况下，不允许删行
  if (updateRows.length > 1) {
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  } else if (
    updateRows.length === 1 &&
    updateRows[0][ROWKEYFIELD] !== scope.row[ROWKEYFIELD]
  ) {
    // 编辑行只有一条，并且不是当前删除行
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  }
  if (scope.row.asnLineId) {
    // if (scope.row.orderPlanLineId) {
    scope.row.loading = true;
    // 先调接口删行
    await deleteRow(scope.row);
    scope.row.loading = false;
  } else {
    // 此时还没与任何保存数据
  }
  await scope.$grid.clearEdit();

  function handleInsertRows() {
    // 将非当前操作行数据，重新插入表格，并开启新的行编辑
    let newRow: any = null;
    setTimeout(async () => {
      const midRows = insertRows.filter(
        (item) => item[ROWKEYFIELD] !== scope.row[ROWKEYFIELD],
      );
      if (midRows.length > 0) {
        for (const [i, midRow_] of midRows.entries()) {
          const midRow = await chcGridApi.grid.insertAt(midRow_, -1);
          if (i === 0) {
            newRow = midRow.row;
          }
        }
        // 聚焦到新插入的数据继续编辑
        chcGridApi.grid.setEditRow(newRow, true);
      } else {
        continuEdit(scope.row);
      }
    }, 0);
  }

  if (scope.$grid.isInsertByRow(scope.row)) {
    // 当前删除的是插入的临时行
    scope.$grid.remove(scope.row);
    handleInsertRows();
    blackList.value = blackList.value.filter(
      (item) => item !== scope.row[ROWKEYFIELD],
    );
  } else {
    // 当前删除的不是临时行
    gridData.value.splice(scope.$rowIndex, 1);
    handleInsertRows();
    blackList.value = blackList.value.filter(
      (item) => item !== scope.row[ROWKEYFIELD],
    );
  }
};
const handleEdit = async (scope: any) => {
  // asnLineId
  console.warn('handleEdit', scope.row);
  const formValue = await chcGridApi.formApi.getValues();
  disabledNo.value = formValue.invoiceMethod === '2';
  console.warn('disabledNo:', disabledNo.value);
  chcGridApi.grid.setEditRow(scope.row, true);
};
// 保存行
const handleSave = async (scope: any) => {
  const formValue = await chcGridApi.formApi.getValues();
  console.warn('handleSave', formValue);
  // 以下校验只保留入库数量校验，其余全部去除，由后端进行校验
  if (!(scope.row.qtyArrived > 0)) {
    return message.error('入库数量必须大于零!');
  }
  // if (scope.row.isLot === 'Y' && !scope.row.lot) {
  //   return message.error('请输入批号!');
  // }
  // if (!scope.row.guaranteeDate) {
  //   return message.error('请输入效期!');
  // }
  if (
    detailInfo.value!.typeAction === 'invoice' ||
    detailInfo.value!.typeAction === 'invoiceEdit'
  ) {
    const validateResult = validatePriceActual(
      [scope.row],
      formValue.invoiceAmt,
      true, // 单行保存，跳过金额一致性校验
    );
    if (!validateResult.valid) {
      return message.error(validateResult.message || '');
    }
  }
  // 此处需要获取所有的临时行，在保存后，将未保存的临时行，重新添加到表格
  const insertRows = chcGridApi.grid.getInsertRecords();
  // 由于保存行会造成编辑信息丢失，因此未保存行编辑信息的情况下，不允许删行
  const updateRows = chcGridApi.grid.getUpdateRecords();
  if (updateRows.length > 1) {
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  } else if (
    updateRows.length === 1 &&
    updateRows[0][ROWKEYFIELD] !== scope.row[ROWKEYFIELD]
  ) {
    // 编辑行只有一条，并且不是当前删除行
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  }
  scope.row.loading = true;
  // 先调接口
  const newRow: any = await validateRow(scope.row);
  scope.row.loading = false;
  for (const key in newRow) {
    scope.row[key] = newRow[key];
  }
  await scope.$grid.clearEdit();
  function handleInsertRows() {
    // 将非当前操作行数据，重新插入表格，并开启新的行编辑
    let newRow: any = null;
    setTimeout(async () => {
      const midRows = insertRows.filter(
        (item) => item[ROWKEYFIELD] !== scope.row[ROWKEYFIELD],
      );
      for (const [i, midRow_] of midRows.entries()) {
        const midRow = await chcGridApi.grid.insertAt(midRow_, -1);
        if (i === 0) {
          newRow = midRow.row;
        }
      }
      // 聚焦到新插入的数据继续编辑
      chcGridApi.grid.setEditRow(newRow, true);
    }, 0);
  }

  if (insertRows.length === 0) {
    // 当前表格没有插入的临时数据
    const index = gridData.value.findIndex(
      (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
    );
    gridData.value[index] = scope.row;
    // 此时要回到选择物资下拉框
    continuEdit(scope.row);
  } else if (insertRows.length === 1) {
    // 当前表格新插入的临时数据只有一条
    if (scope.$grid.isInsertByRow(scope.row)) {
      // 操作的正是这条临时数据
      const newRow = await scope.$grid.createRow(scope.row);
      gridData.value.push(newRow);
      continuEdit(scope.row);
    } else if (scope.$grid.isUpdateByRow(scope.row)) {
      // 操作的不是这条临时数据
      const index = gridData.value.findIndex(
        (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
      );
      gridData.value[index] = scope.row;
      handleInsertRows();
    }
  } else {
    // 当前表格有多条插入的临时数据
    if (scope.$grid.isInsertByRow(scope.row)) {
      // 操作的正是这些临时数据中的一条
      const newRow = await scope.$grid.createRow(scope.row);
      gridData.value.push(newRow);
      handleInsertRows();
    } else if (scope.$grid.isUpdateByRow(scope.row)) {
      // 操作的不是临时数据
      const index = gridData.value.findIndex(
        (item) => item[ROWKEYFIELD] === scope.row[ROWKEYFIELD],
      );
      gridData.value[index] = scope.row;
      handleInsertRows();
    }
  }
};
const validateRow = (row: any) => {
  console.warn('validateRow', row);
  return new Promise((resolve) => {
    chcGridApi.formApi
      .getValues()
      .then(async (res) => {
        // 采购价的入参字段为(priceActual)
        // row.priceActual = row.pricePO;
        // row.applyBPartnerId = undefined;
        const params = queryparams(row.asnLineId ? 'saveDo' : 'saveLine', res, [
          row,
        ]);
        const invoiceStatus =
          detailInfo.value!.typeAction === 'invoice' ||
          detailInfo.value!.typeAction === 'invoiceEdit'
            ? 'Y'
            : 'N';
        const newParams = {
          ...params,
          asnLineId: row.asnLineId || undefined,
          invoiceNo: res.invoiceNo, // 发票号
          invoiceTypeNo: res.invoiceTypeNo, // 发票代码
          dateInvoiced: res.dateInvoiced, // 开票日期
          invoiceAmt: res.invoiceAmt, // 发票金额
          invoiceImageBase: imageUrl.value, // 发票图片
          invoiceStatus, // 发票状态
        };
        // 过滤掉paramsNew中的null和undefined的值
        const filteredParams = utils.filterNullish(newParams);
        console.warn('filteredParams:', filteredParams);
        saveLine(filteredParams)
          .then((res) => {
            // 如果原先的 parentData.value.orderPlanId/asnId没值，说明是新增进来的
            // 此时需要更新 parentData.value.orderPlanId/asnId
            if (!parentData.value.asnId) {
              parentData.value.asnId = res.data.header.asnId;
              chcGridApi.formApi.setFieldValue('asnId', res.data.header.asnId);
            }
            queryOrderPlanLineInfo({ asnId: res.data.header.asnId }).then(
              (resIn) => {
                const newRow = resIn.rows.find(
                  (item: any) => item.asnLineId === res.data.lines[0],
                );
                resolve(newRow);
              },
            );
          })
          .catch(() => {
            row.loading = false;
          });
      })
      .catch(() => {
        row.loading = false;
      });
  });
};
const handleCalcel = async (scope: any) => {
  await scope.$grid.clearEdit();
  scope.$grid.revertData(scope.row);
};

const handleBatchAdd = async () => {
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    chcGridApi.formApi.getValues().then((res: any) => {
      batchAddModalApi!
        .setData({
          warehouseId: res.warehouseId || parentData.value.warehouseId,
          bpartnerId: res.bpartnerId || parentData.value.bpartnerId,
          vendorId: res.vendorId || parentData.value.vendorId,
          replenishSource: 'P',
          handleBatchChoose,
          blackList: blackList.value,
        })
        .open();
    });
  }
};

const handleSelectChange = async (val: any, option: any) => {
  // 检查是否在黑名单中
  if (blackList.value.includes(val)) {
    // 找到对应的行索引
    const index = gridData.value.findIndex((item) => item[ROWKEYFIELD] === val);

    // 清空选中值，避免显示在输入框中
    if (chcSelect.value) {
      chcSelect.value.modelValue = undefined;
    }
    // 关闭下拉框
    selectOpen.value = false;

    if (index === -1) {
      message.warning('已存在该药品');
    } else {
      const existRow = gridData.value[index];
      message.warning(`已存在该药品，在列表第${index + 1}行`);

      await nextTick();
      // 选中该行
      chcGridApi.grid.setCheckboxRow([existRow], true);
      // 滚动到该行
      chcGridApi.grid.scrollToRow(existRow);
      // // 选中该行
      // await chcGridApi.grid.setCheckboxRow([existRow], true);
      // // 滚动到该行
      // await chcGridApi.grid.scrollToRow(existRow);
      // // chcGridApi.grid.setEditRow(existRow);
      // nextTick(async () => {
      //   const row = chcGridApi.grid.getFullData().find((item) => {
      //     return item[ROWKEYFIELD] === existRow[ROWKEYFIELD];
      //   });
      //   await chcGridApi.grid.setEditRow(row, true);
      // });
    }
    return;
  }
  // 不在黑名单中，走原来的逻辑
  handleChoose(val, option);
};

const handleChoose = async (val: any, option: any) => {
  console.warn('handleChoose触发了=========>', val);
  selectOpen.value = false;
  if (validateRequiredFields && typeof validateRequiredFields === 'function') {
    const valid = await validateRequiredFields();
    if (!valid) {
      return;
    }
  }
  if (chcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    // 验证通过后执行添加逻辑
    // 先往黑名单里加数据，放后面会造成表格新增数据异常
    blackList.value.push(val);
    await nextTick();
    chcSelect.value.modelValue = undefined; // 清空下拉组件
    const formValues = await chcGridApi.formApi.getValues();
    console.warn('handleChoose_formValues:', formValues);
    const response = await getOrderPlanStorage({
      warehouseId: formValues.warehouseId || parentData.value.warehouseId,
      productId: option.productId,
    });
    const record = {
      ...option,
      ...response,
      isGift: 'N',
    };
    const { row: newRow } = await chcGridApi.grid.insertAt(record, -1);
    chcGridApi.grid.setEditRow(newRow, true);
  }
};

const handleBatchChoose = async (records: any[]) => {
  blackList.value = [
    ...blackList.value,
    ...records.map((item) => item[ROWKEYFIELD]),
  ];
  const formValue = await chcGridApi.formApi.getValues();
  let newRow = null;
  for (const [i, record__] of records.entries()) {
    const response = await getOrderPlanStorage({
      warehouseId: formValue.warehouseId || parentData.value.warehouseId,
      productId: record__.productId,
    });
    const record = {
      ...record__,
      ...response,
      isGift: 'N',
    };
    if (i === 0) {
      const midRow = await chcGridApi.grid.insertAt(record, -1);
      newRow = midRow.row;
    } else {
      await chcGridApi.grid.insertAt(record, -1);
    }
  }
  chcGridApi.grid.setEditRow(newRow, true);
};
const hasEditStatus = (row: any) => {
  return chcGridApi.grid?.isEditByRow(row);
};
const disabledNo = ref(false);
onMounted(() => {
  console.warn('parentData.value:', parentData.value);
  console.warn('detailInfo.value:', detailInfo.value);
  disabledNo.value = parentData.value.invoiceMethod === '2';
  // if (
  //   detailInfo.value?.typeAction === 'invoice' ||
  //   detailInfo.value?.typeAction === 'invoiceEdit' ||
  //   detailInfo.value?.typeAction === 'invoiceView'
  // ) {
  //   setInvoiceFormSchema();
  // }
  if (parentData.value && detailInfo.value?.typeAction?.includes('invoice')) {
    console.warn('触发了watchEffect');
    initInvoiceForm();
  }
  if (parentData.value.asnId) {
    chcGridApi.setLoading(true);
    queryOrderPlanLineInfo({
      asnId: parentData.value.asnId,
      // isActive: 'Y',
    }).then(async (res) => {
      if (res.success) {
        res.rows.forEach((item) => {
          blackList.value.push(item[ROWKEYFIELD]);
          chcGridApi.grid.createRow(item).then((res) => {
            gridData.value.push(res);
          });
        });
        chcGridApi.setLoading(false);
        // let newRow = null;
        // for (let i = 0; i < res.rows.length; i++) {
        //   blackList.value.push(res.rows[i]![ROWKEYFIELD]);
        //   if (i === 0) {
        //     newRow = await chcGridApi.grid.createRow(res.rows[i]);
        //     gridData.value.push(newRow);
        //   } else {
        //     const midRow = await chcGridApi.grid.createRow(res.rows[i]);
        //     gridData.value.push(midRow);
        //   }
        // }
      } else {
        message.error(res.msg);
        chcGridApi.setLoading(false);
      }
    });
  }
  selectParams.value.warehouseId = parentData.value!.warehouseId;
  selectParams.value.vendorId = parentData.value!.vendorId;
  window.addEventListener('keydown', handleKeyBoard);
});
// watch(
//   () => detailInfo.value?.typeAction,
//   async (newTypeAction: string, oldTypeAction: string) => {
//     // 只在类型变化为发票模式时初始化
//     if (
//       parentData.value &&
//       newTypeAction?.includes('invoice') &&
//       oldTypeAction !== newTypeAction &&
//       chcGridApi?.formApi?.setValues
//     ) {
//       await nextTick();
//       await initInvoiceForm();
//     }
//   },
//   // { immediate: true, deep: true }
// );
const selectOpen = ref(false); // 下拉框是否打开
// 下拉组件打开状态改变事件
const handleDropdownVisibleChange = (open: boolean) => {
  selectOpen.value = !!open;
  if (
    chcSelect.value &&
    chcSelect.value.fetchApi &&
    typeof chcSelect.value.fetchApi === 'function'
  ) {
    chcGridApi.formApi.getValues().then((res: any) => {
      console.warn('handleDropdownVisibleChange:', res);
      chcSelect.value.params.size = 25;
      chcSelect.value.params.limit = 25;
      const newParams = {
        warehouseId: res.warehouseId,
        bpartnerId: res.bpartnerId,
      };
      Object.assign(selectParams.value, newParams);
      chcSelect.value.fetchApi();
    });
  }
};
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyBoard);
});
const EditFields = ['qtyArrived', 'vendorId', 'isGift', 'lot', 'guaranteeDate'];
const continuEdit = (row: any) => {
  if (
    chcGridApi.grid
      .getInsertRecords()
      .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD])
  ) {
    chcGridApi.grid.setEditRow(
      chcGridApi.grid
        .getInsertRecords()
        .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD]),
      true,
    );
  } else if (
    chcGridApi.grid
      .getUpdateRecords()
      .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD])
  ) {
    chcGridApi.grid.setEditRow(
      chcGridApi.grid
        .getUpdateRecords()
        .some((item) => item[ROWKEYFIELD] !== row[ROWKEYFIELD]),
      true,
    );
  } else {
    return chcSelect.value.focus();
  }
};
const handleKeyBoard = async (e: KeyboardEvent) => {
  if (e.ctrlKey && e.code === 'KeyE') {
    e.preventDefault();
    if (chcGridApi.grid.getInsertRecords().length > 0) {
      chcGridApi.grid.setEditRow(chcGridApi.grid.getInsertRecords()[0], true);
    } else if (chcGridApi.grid.getUpdateRecords().length > 0) {
      chcGridApi.grid.setEditRow(chcGridApi.grid.getUpdateRecords()[0], true);
    } else {
      return chcSelect.value.focus();
    }
  }
  if (
    e.code === 'ArrowRight' &&
    currentEditRow.value && // await chcGridApi.grid.clearEdit();
    EditFields.indexOf(currentField.value) + 1 < EditFields.length
  ) {
    e.preventDefault();
    chcGridApi.grid.setEditCell(
      currentEditRow.value,
      EditFields[EditFields.indexOf(currentField.value) + 1] as string,
    );
    currentField.value = EditFields[
      EditFields.indexOf(currentField.value) + 1
    ] as string;
  }
  if (
    e.code === 'ArrowLeft' &&
    currentEditRow.value &&
    EditFields.indexOf(currentField.value) - 1 > -1
  ) {
    e.preventDefault();
    chcGridApi.grid.setEditCell(
      currentEditRow.value,
      EditFields[EditFields.indexOf(currentField.value) - 1] as string,
    );
    currentField.value = EditFields[
      EditFields.indexOf(currentField.value) - 1
    ] as string;
  }
  if (e.code === 'Delete' && currentEditRow.value) {
    e.preventDefault();
    handleDeleteRow({ row: currentEditRow.value, $grid: chcGridApi.grid });
  }
  if (e.key === 'Enter' && currentEditRow.value) {
    e.preventDefault();
    handleSave({ row: currentEditRow.value, $grid: chcGridApi.grid });
  }
  if (e.code === 'ArrowRight' && selectOpen.value) {
    e.preventDefault();
    chcSelect.value.pageChange(chcSelect.value.params.current + 1);
  }

  if (e.code === 'ArrowLeft' && selectOpen.value) {
    e.preventDefault();
    chcSelect.value.pageChange(chcSelect.value.params.current - 1);
  }
};
const totalHandleLoading = ref(false);
const handleTotalSave = () => {
  const checkResult = checkTableEditState();
  if (!checkResult.valid) {
    return message.error(checkResult.message || '');
  }
  // console.warn('chcGridApi', chcGridApi.grid.getData());
  const tableData = chcGridApi.grid.getData();
  console.warn('handleTotalSave_tableData', tableData);
  chcGridApi.formApi.getValues().then(async (res) => {
    // 需要增加每行的金额累加 是否 跟输入的发票金额是否一致
    if (
      detailInfo.value!.typeAction === 'invoice' ||
      detailInfo.value!.typeAction === 'invoiceEdit'
    ) {
      // let totalAmt = 0;
      // 浮点数运算会有精度问题
      // console.log(0.1 + 0.2); // 0.30000000000000004
      // console.log(99.99 + 0.01); // 100.00000000000001
      //   tableData.forEach((item) => {
      //     totalAmt += item.invoiceAmt;
      //   });
      //   if (totalAmt !== res.invoiceAmt) {
      //     return message.error('发票金额与表格金额不一致，请检查！');
      //   }
      const validateResult = validatePriceActual(tableData, res.invoiceAmt);
      if (!validateResult.valid) {
        return message.error(validateResult.message || '');
      }
    }
    totalHandleLoading.value = true;
    // 采购价的入参字段为(priceActual)
    // tableData = tableData.map((item: any) => ({
    //   ...item,
    //   priceActual: item.pricePO,
    // }));
    const params = queryparams('saveDo', res, tableData);
    const formValue = await chcGridApi.formApi.getValues();
    // invoiceStatus 发票状态 Y 已开票 N 未开票 需要区分是新建还是明细过来的
    const invoiceStatus =
      detailInfo.value!.typeAction === 'invoice' ||
      detailInfo.value!.typeAction === 'invoiceEdit'
        ? 'Y'
        : 'N';
    const newParams = {
      ...params,
      invoiceNo: formValue.invoiceNo, // 发票号
      invoiceTypeNo: formValue.invoiceTypeNo, // 发票代码
      dateInvoiced: formValue.dateInvoiced, // 开票日期
      invoiceAmt: formValue.invoiceAmt, // 发票金额
      invoiceImageBase: imageUrl.value, // 发票图片
      invoiceStatus,
    };
    console.warn('handleTotalSave_newParams:', newParams);
    saveDo(newParams)
      .then(() => {
        totalHandleLoading.value = false;
        // 保存成功后,标记为已保存状态
        isSaved.value = true;
        message.success('保存成功');
        currentTab.value = 0;
      })
      .catch(() => {
        totalHandleLoading.value = false;
      });
  });
};
const handleTotalSubmit = () => {
  const checkResult = checkTableEditState();
  if (!checkResult.valid) {
    return message.error(checkResult.message || '');
  }
  if (gridData.value.length === 0) {
    return message.error('请添加数据后再提交！');
  }
  // const tableData = chcGridApi.grid.getData();
  // console.warn('tableData--handleTotalSubmit:', tableData);
  console.warn('asnId:', parentData.value.asnId);
  totalHandleLoading.value = true;
  dataCommit({ asnId: parentData.value.asnId })
    .then(() => {
      totalHandleLoading.value = false;
      currentTab.value = 1;
    })
    .catch(() => {
      totalHandleLoading.value = false;
    });
  // chcGridApi.formApi.getValues().then((res) => {
  //   // asnId:1000569
  //   dataCommit({ ...params, doCommit: 'Y' })
  //     .then(() => {
  //       totalHandleLoading.value = false;
  //       currentTab.value = 1;
  //     })
  //     .catch(() => {
  //       totalHandleLoading.value = false;
  //     });
  // });
};

const searchFocus = ref(false);
const serachInputVal = ref(undefined);
const handleSearch = () => {
  if (serachInputVal.value) {
    // 将所有匹配输入值的项check状态改为选中
    for (let i = 0; i < gridData.value.length; i++) {
      const item = gridData.value[i];
      if (
        (item.productCode && item.productCode.includes(serachInputVal.value)) ||
        (item.productName && item.productName.includes(serachInputVal.value)) ||
        (item.productValue && item.productValue.includes(serachInputVal.value))
      ) {
        chcGridApi.grid.setCheckboxRow(item, true);
      }
    }
  }
};
const handleSearchIpt = (e: any) => {
  serachInputVal.value = e.target.value;
};
const toggleSearchFocus = (val: boolean) => {
  searchFocus.value = val;
};
const [ActionLogModal, actionLogModalApi] = useVbenModal({
  connectedComponent: actionLogModal,
});
const handleDetail = (scope: any) => {
  console.warn('scope', scope);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId,
      orderPlanLineId: scope.row?.asnLineId,
      // orderPlanLineId: scope.row?.orderPlanLineId,
      // replenishSource: 'P',
      // handleBatchChoose,
    })
    .open();
};
const handleCodeChoose = async (records: any[]) => {
  console.warn('records', records);
};
const [CodeModal, codeModalApi] = useVbenModal({
  connectedComponent: codeModal,
});
const handleCode = (scope: any) => {
  console.warn('scope', scope);
  codeModalApi!
    .setData({
      warehouseId: scope.row.warehouseId,
      productCode: scope.row.productCode,
      productName: scope.row.productName,
      asnLineId: scope.row.asnLineId,
      lot: scope.row.lot,
      guaranteeDate: scope.row.guaranteeDate,
      replenishSource: 'P',
      type: detailInfo.value?.type,
      handleCodeChoose,
    })
    .open();
};

const disabledBeforeToday = (date: any) => {
  const today = new Date();

  today.setHours(0, 0, 0, 0); // 将时间设置为当天的开始

  return dayjs(date).isBefore(dayjs(today));
};

const disabledAfterToday = (date: any) => {
  const today = new Date();

  today.setHours(0, 0, 0, 0); // 将时间设置为当天的开始

  return dayjs(date).isAfter(dayjs(today));
};

const handleProductionDateChange = async (row: any) => {
  await nextTick();
  if (row.productionDate && disabledAfterToday(row.productionDate)) {
    row.productionDate = currentEditRow.value?.productionDate || '';
    message.warning('生产日期不能晚于当前日期');
    await chcGridApi.grid.setRow(row, {
      productionDate: row.productionDate,
    });
  } else {
    await chcGridApi.grid.setRow(row, {
      productionDate: row.productionDate,
    });
  }
};

const handleGuaranteeDateChange = async (row: any) => {
  await nextTick();
  if (row.guaranteeDate && disabledBeforeToday(row.guaranteeDate)) {
    row.guaranteeDate = currentEditRow.value?.guaranteeDate || '';
    message.warning('效期不能早于当前日期');
    await chcGridApi.grid.setRow(row, {
      guaranteeDate: row.guaranteeDate,
    });
  } else {
    await chcGridApi.grid.setRow(row, {
      guaranteeDate: row.guaranteeDate,
    });
  }
};

// 发票图片预览弹窗函数
const [PreviewImageModal, previewImageModalApi] = useVbenModal({
  class: 'w-[1300px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: previewImage,
  draggable: true,
});

/**
 * 将文件转换为 Base64 编码
 * @param file - 要转换的文件对象
 * @returns 包含 Base64 编码的 Promise 字符串
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', (e) => resolve(e.target?.result as string));
    reader.addEventListener('error', (error) => reject(error));
    reader.readAsDataURL(file);
  });
}

// 上传前的校验
const beforeUpload = async (file: File) => {
  const isValidType = ['image/jpg', 'image/jpeg', 'image/png'];
  const isJpgOrPng = isValidType.includes(file.type);
  if (!isJpgOrPng) {
    message.error(
      `请选择${isValidType.map((item) => item.split('/')[1]).join('、')}格式文件`,
    );
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片大小不能超过5MB');
    return false;
  }
  try {
    imageUrl.value = await fileToBase64(file);
    // 选择新图片后,标记为未保存状态
    isSaved.value = false;
    console.warn('imageUrl.value:', imageUrl.value);
  } catch (error) {
    console.error('图片读取失败', error);
    return false;
  }
  // 返回 false 阻止自动上传
  return false;
};

const handlePreview = async () => {
  try {
    let previewImageUrl = '';
    // 如果已保存,从接口获取;否则使用本地Base64
    if (isSaved.value) {
      const res = await getinvoicePicture({ asnId: parentData.value.asnId });
      console.warn('handlePreview_res:', res);
      if (res && res.success) {
        previewImageUrl = res.data?.invoiceImageUrl || '';
      } else {
        message.error('获取发票图片失败');
        return;
      }
    } else {
      // 本地预览当前选择的图片
      if (!imageUrl.value) {
        message.warning('请先上传发票图片');
        return;
      }
      previewImageUrl = imageUrl.value;
    }
    const imageList = [
      {
        path: previewImageUrl,
        id: 0,
      },
    ];
    previewImageModalApi
      .setData({
        imageList,
      })
      .open();
  } catch (error) {
    console.error('图片预览失败', error);
  }
};
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <BatchAddModal />
    <CodeModal />
    <PreviewImageModal />
    <ChcGrid class="editableTable">
      <template #form-taxInvoiceImgFunction>
        <AntdUpload
          v-model:file-list="fileList"
          :max-count="1"
          :show-upload-list="false"
          accept=".jpg,.jpeg,.png"
          :before-upload="beforeUpload"
        >
          <Button
            type="primary"
            class="mr-[0.5rem]"
            data-testid="button_taxInvoiceImg_upload_documentDetail"
          >
            <template #icon>
              <AntdUploadloadOutlined class="mb-1" />
            </template>
            发票图片上传
          </Button>
        </AntdUpload>
        <Button
          type="primary"
          :disabled="!canPreview"
          @click="handlePreview"
          data-testid="button_taxInvoiceImg_preview_documentDetail"
        >
          发票图片预览
        </Button>
      </template>
      <template #edit_price="scope">
        <VxeNumberInput
          v-model="scope.row.priceActual"
          :control-config="{
            enabled: false,
            isArrow: false,
          }"
          class="driver_price"
          @change="handlePriceChange(scope)"
          :data-testid="`input_price_${scope.rowIndex}_documentDetail`"
        />
      </template>
      <template #edit_lot="scope">
        <VxeInput
          v-model="scope.row.lot"
          :disabled="scope.row.isLot === 'N'"
          :data-testid="`input_lot_${scope.rowIndex}_documentDetail`"
        />
      </template>
      <template #edit_guaranteeDate="scope">
        <DatePicker
          v-model:value="scope.row.guaranteeDate"
          v-bind="scope.column.editRender.props"
          :disabled-date="disabledBeforeToday"
          :disabled="scope.row?.isGuaranteeDateMandatory === 'N'"
          @change="
            (val) => {
              scope.row.guaranteeDate = val;
              handleGuaranteeDateChange(scope.row);
            }
          "
          :data-testid="`DatePicker_guaranteeDate_${scope.rowIndex}_documentDetail`"
        />
        <!-- <VxeDatePicker
          v-model="scope.row.guaranteeDate"
          :disabled-method="disabledBeforeToday"
          :data-testid="`DatePicker_guaranteeDate_${scope.rowIndex}_documentDetail`"
          @change="handleGuaranteeDateChange(scope.row)"
        /> -->
      </template>
      <template #edit_productionDate="scope">
        <DatePicker
          v-model:value="scope.row.productionDate"
          v-bind="scope.column.editRender.props"
          :disabled-date="disabledAfterToday"
          :disabled="scope.row?.isProductionDateMandatory === 'N'"
          :data-testid="`DatePicker_productionDate_${scope.rowIndex}_documentDetail`"
          @change="
            (val) => {
              scope.row.productionDate = val;
              handleProductionDateChange(scope.row);
            }
          "
        />
        <!-- <VxeDatePicker
          v-model="scope.row.productionDate"
          :disabled-method="disabledAfterToday"
          :data-testid="`DatePicker_productionDate_${scope.rowIndex}_documentDetail`"
          @change="handleProductionDateChange(scope.row)"
        /> -->
      </template>
      <!-- :open="selectOpen" -->
      <template #toolbar-actions v-if="detailInfo?.type === 'edit'">
        <ChcSelect
          :autofocus="true"
          ref="chcSelect"
          placeholder="请输入药品编码、药品名称、规格"
          class="mr-[0.5rem] w-[380px]"
          dict-url="/productAction/query.do"
          api-type="post"
          request-content-type="application/x-www-form-urlencoded"
          popup-class-name="productSelection"
          @keydown="
            (e: KeyboardEvent) => {
              if (e.code === 'Escape') {
                chcSelect.blur();
              }
            }
          "
          @dropdown-visible-change="handleDropdownVisibleChange"
          :immediate="false"
          :extra-params="selectParams"
          :filter-by-front-end="false"
          :show-search="true"
          @change="handleSelectChange"
          filter-field="productName"
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
              width: 160,
            },
            {
              header: '规格',
              name: 'productSpec',
              width: 80,
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
              name: 'priceActual',
              width: 80,
              align: 'right',
            },
            {
              header: '库存',
              name: 'storageQty',
              width: 80,
              align: 'right',
            },
          ]"
          data-testid="select_product_selection_documentDetail"
        />
        <Button
          type="primary"
          @click="handleBatchAdd"
          class="mr-[0.5rem]"
          data-testid="button_batch_add_documentDetail"
        >
          批量添加
        </Button>
        <!-- <Button type="primary" @click="handleDel" class="mr-[0.5rem]">
          删除
        </Button> -->
      </template>
      <template #toolbar-tools>
        <Input
          @input="handleSearchIpt"
          class="mr-[0.5rem] w-[240px]"
          placeholder="请输入药品关键词"
          @keyup.enter="handleSearch"
          @focus="toggleSearchFocus(true)"
          @blur="toggleSearchFocus(false)"
          data-testid="input_search_keyword_documentDetail"
        />
        <Button
          type="primary"
          @click="handleSearch"
          data-testid="button_search_documentDetail"
        >
          搜索
        </Button>
      </template>
      <template #action="scope">
        <Button
          v-if="!hasEditStatus(scope.row) && detailInfo?.type === 'view'"
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          :data-testid="`button_action_log_${scope.rowIndex}_documentDetail`"
        >
          操作记录
          <template #icon>
            <viewActionIcon />
          </template>
        </Button>
        <Button
          v-if="!hasEditStatus(scope.row) && detailInfo?.type === 'edit'"
          type="primary"
          @click="handleEdit(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_edit_${scope.rowIndex}_documentDetail`"
        >
          编辑
        </Button>
        <Button
          v-if="
            (hasEditStatus(scope.row) ||
              scope.$grid.isUpdateByRow(scope.row) ||
              scope.$grid.isInsertByRow(scope.row)) &&
            detailInfo?.type === 'edit'
          "
          :loading="scope.row.loading"
          type="primary"
          @click="handleSave(scope)"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_save_${scope.rowIndex}_documentDetail`"
        >
          保存
        </Button>
        <Button
          v-if="
            hasEditStatus(scope.row) &&
            !scope.$grid.isInsertByRow(scope.row) &&
            detailInfo?.type === 'edit'
          "
          type="primary"
          ghost
          @click="handleCalcel(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_cancel_${scope.rowIndex}_documentDetail`"
        >
          取消
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDeleteRow(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          v-if="detailInfo?.type === 'edit'"
          :data-testid="`button_delete_${scope.rowIndex}_documentDetail`"
        >
          删行
        </Button>
        <!--   v-if="detailInfo?.type === 'edit'" -->
        <Button
          type="primary"
          v-if="!hasEditStatus(scope.row)"
          style="background-color: #b17a33d4"
          @click="handleCode(scope)"
          :loading="scope.row.loading"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          :data-testid="`button_code_${scope.rowIndex}_documentDetail`"
        >
          追溯码
        </Button>
      </template>
      <template #bottom>
        <div class="flex items-center justify-between pt-[10px]">
          <div>汇总信息</div>
          <div class="flex gap-[10px]">
            <Button
              type="primary"
              ghost
              @click="handleTotalSave"
              :loading="totalHandleLoading"
              v-if="detailInfo?.type === 'edit'"
              data-testid="button_save_documentDetail"
            >
              保存
            </Button>
            <Button
              type="primary"
              ghost
              @click="handleTotalSubmit"
              :loading="totalHandleLoading"
              v-if="detailInfo?.type === 'edit'"
              data-testid="button_submit_documentDetail"
            >
              提交
            </Button>
            <Button
              type="primary"
              ghost
              danger
              @click="handleClose"
              :bordered="false"
              :loading="totalHandleLoading"
              data-testid="button_back_bottom_documentDetail"
            >
              返回
            </Button>
          </div>
        </div>
      </template>
    </ChcGrid>
  </div>
</template>
<style scoped>
::v-deep(.vxe-grid--form-wrapper form div.grid) {
  padding-bottom: 0.5rem;
}

::v-deep(.vxe-tools--wrapper .ant-input) {
  padding: 2px 7px;
}

::v-deep(.vxe-cell .ant-btn > svg) {
  margin-bottom: 0;
}
</style>

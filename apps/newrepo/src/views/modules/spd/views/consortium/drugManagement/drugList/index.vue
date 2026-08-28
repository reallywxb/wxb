<script lang="ts" setup>
import { computed, h, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { saveProductSpec, queryProductSpec, queryProductUnit } from './api';
import TableModalComp from './tableModal.vue';
import { VxeUI } from '@vben/plugins/vxe-table';
import {
  specColumns,
  genSpecAndPackFormSchemas,
  uomNameOptions,
} from './config';
import {
  AddActionIcon,
  AntdArrowLeftOutlined,
  EditActionIcon,
  ExportActionIcon,
  IconfontBasicView,
  UploadActionIcon,
  UploadCloudIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { Switch, Button, message } from 'ant-design-vue';
import qs from 'qs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepClone, deepMerge } from '#/utils/util';
import { activateProduct } from '#/views/modules/spd/views/operation/product/api';

import commonFormModalComp from '../../../operation/product/common/modals/commonFormModal.vue';
import { INITIAL_EDIT_FORM_DATA } from './data';
import EditPage from './editPage.vue';
import BatchImportModalComp from './modals/batchImportModal.vue';
import DispatchToHospitalModalComp from './modals/dispatchToHospital.vue';

// 启用/停用表单配置
const activationFormOptions = {
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: '启用', value: 'Y' },
          { label: '停用', value: 'N' },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      defaultValue: 'Y',
      fieldName: 'isActive',
      label: '启/停用',
    },
    {
      component: 'Textarea',
      fieldName: 'changeActiveReason',
      label: '启/停原因',
      componentProps: {
        rows: 5,
        placeholder: '请输入',
      },
      rules: 'required',
    },
  ],
  showCollapseButton: false,
  submitOnChange: false,
  submitOnEnter: false,
  wrapperClass: 'grid-cols-1',
};

const route = useRoute();
const VxeSelect = VxeUI.getComponent('VxeSelect');
// const isFirstLoaded = ref(false); // 是否已初次加载完
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);
// 选中的行数量
const checkedRowsCount = ref(0);
const [
  ChcGrid,
  chcGridApi,
  {
    BatchImportModal,
    batchImportModalApi,
    DispatchToHospitalModal,
    dispatchToHospitalModalApi,
    handleExport,
  },
] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      rowStyle(scope: any) {
        if (scope && scope.row && scope.row.status === 'DR') {
          return {
            backgroundColor: '#c6c6c6',
            color: '#000',
          };
        }
      },
    }),
  },
  {
    id: 'drugList',
    // api地址
    queryUrl: '/mcProductAction/queryProduct.do',
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'productName',
        label: '药品',
        componentProps: () => {
          return {
            placeholder: '编码/名称/搜索码',
            allowClear: true,
            maxlength: 50,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'productSpec',
        label: '规格',
        componentProps: () => {
          return {
            placeholder: '请输入规格',
            allowClear: true,
            maxlength: 200,
          };
        },
      },
      {
        component: 'Input',
        fieldName: 'certificateNo',
        label: '批准文号',
        componentProps: () => {
          return {
            placeholder: '请输入批准文号',
            allowClear: true,
            maxlength: 100,
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'productControlLevel',
        label: '药品组',
        defaultValue: '',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/refList.do?id=1000244',
            placeholder: '请选择药品组',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isActive',
        label: '启用状态',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请选择启用状态',
            paginate: false,
            showChooseAll: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '启用' },
              { value: 'N', label: '停用' },
            ],
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isFee',
        label: '是否计费',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请选择是否计费',
            paginate: false,
            showChooseAll: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
          };
        },
      },
      {
        component: 'ChcSelect',
        fieldName: 'isBulkPurchase',
        label: '带量采购',
        defaultValue: '',
        componentProps: () => {
          return {
            placeholder: '请选择是否带量采购',
            paginate: false,
            showChooseAll: '',
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
          };
        },
      },

      {
        component: 'Input',
        fieldName: 'markCode',
        label: '省标编码',
        componentProps: () => {
          return {
            placeholder: '请输入省标编码',
            allowClear: true,
          };
        },
      },
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '创建时间',
        defaultValue: [],
        componentProps: () => {
          return {};
        },
      },
    ],
    gridColumns: [
      { title: '多选', type: 'checkbox', width: 50, align: 'center' },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'productCode',
        title: '药品编码',
        width: 100,
        sortable: true,
      },
      {
        field: 'name',
        title: '药品名称',
        width: 100,
        sortable: true,
      },

      {
        title: '通用名称',
        field: 'medicineName',
        width: 100,
        sortable: true,
      },
      {
        field: 'isActive',
        width: 100,
        sortable: true,
        title: '是否启用',
        formatter: ({ cellValue }: any) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        title: '拼音码',
        field: 'value',
        width: 80,
        sortable: true,
      },
      {
        title: '规格',
        field: 'productSpec',
        width: 80,
        sortable: true,
      },
      {
        title: '剂型',
        field: 'productStyleName',
        width: 80,
        sortable: true,
      },
      {
        title: '注册证有效期止',
        field: 'certValidTo',
        width: 140,
        sortable: true,
      },
      {
        title: '生产企业',
        field: 'manufacturerName',
        width: 100,
        sortable: true,
      },
      {
        title: '是否进口',
        field: 'isForeign',
        width: 100,
        sortable: false,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        title: '批准文号',
        field: 'certificateNo',
        width: 100,
        sortable: true,
      },
      {
        title: '单位',
        field: 'uomName',
        width: 80,
        sortable: true,
      },
      {
        title: '最小单位',
        field: 'baseUOMName',
        width: 100,
        sortable: true,
      },
      {
        title: '转换比',
        field: 'baseUOMQty',
        width: 100,
        sortable: true,
      },

      // {
      //   title: '最小单位精度',
      //   field: 'baseUOMPrecision',
      //   width: 200,
      //   sortable: true,
      // },

      {
        field: 'essentialDrugTypeName',
        title: '基本药物分类',
        width: 120,
        sortable: true,
      },

      {
        field: 'insurance',
        title: '医保药品编码',
        width: 120,
        sortable: true,
      },
      {
        field: 'insurancePaymentTypeName',
        title: '医保支付类别',
        width: '100',
        sortable: false,
      },
      {
        field: 'isConsistent',
        title: '是否一致性评价',
        width: 120,
        sortable: false,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'isIntensive',
        title: '是否重点监控',
        width: 100,
        sortable: false,
        formatter: ({ cellValue }) => {
          return cellValue === 'Y' ? '是' : '否';
        },
      },
      {
        field: 'defaultSupplier',
        title: '默认供应商',
        width: 100,
        sortable: false,
      },
      {
        field: 'productControlLevelName',
        title: '药品组',
        width: 90,
        sortable: true,
      },
      {
        field: 'productCategoryName',
        title: '药品类别',
        width: 100,
        sortable: true,
      },
      {
        field: 'markCode',
        title: '省标编码',
        width: 100,
        sortable: true,
      },
      {
        field: 'pricePO',
        title: '采购价格',
        width: 100,
        sortable: true,
        align: 'right',
        formatter: ({ cellValue }) => {
          console.warn('采购价格', cellValue);
          // 对字符串类型作处理
          if (typeof cellValue === 'string') {
            cellValue = Number.parseFloat(cellValue);
          }
          const formattedValue = cellValue ? cellValue.toFixed(3) : '0.000';
          return formattedValue;
        },
      },
      {
        fixed: 'right',
        title: '操作',
        width: 160,
        align: 'center',
        field: 'action',
        slots: {
          default: (scope) => {
            // 编辑和详情
            return h('div', { class: 'flex items-center justify-center' }, [
              h(
                Button,
                {
                  type: 'primary',
                  ghost: true,
                  class:
                    'h-[24px] pb-0 pl-[6px] pr-[6px] pt-0 text-[14px] mr-2',
                  'data-testid': `button_detail_${scope.rowIndex}`,
                  onClick: () => {
                    console.warn('单元格点击', scope);
                    editForm.value = {};
                    editForm.value = {
                      ...INITIAL_EDIT_FORM_DATA,
                      ...scope.row,
                      // AI-GENERATED-BEGIN
                      // @date 2026-05-26
                      // @prompt 修复下拉框回显类型不匹配问题
                      // @description 安全转换 ID 字段为字符串，避免 null/undefined 被转为 "null"/"undefined"
                      baseUOMId:
                        scope.row?.baseUOMId != null
                          ? String(scope.row.baseUOMId)
                          : undefined,
                      uomId:
                        scope.row?.uomId != null
                          ? String(scope.row.uomId)
                          : undefined,
                      manufacturerId:
                        scope.row?.manufacturerId != null
                          ? String(scope.row.manufacturerId)
                          : undefined,
                      defaultVendorId:
                        scope.row?.defaultVendorId != null
                          ? String(scope.row.defaultVendorId)
                          : undefined,
                      // AI-GENERATED-END
                    };
                    currentPage.value = 'DETAIL';
                  },
                },
                { default: () => '详情', icon: () => h(IconfontBasicView) },
              ),
              h(
                Button,
                {
                  type: 'primary',
                  ghost: true,
                  // 取消禁用 ===>  产品要求
                  // disabled: scope.row.stats !== 'N', // stats N:草稿  Y:生效
                  class: 'h-[24px] pb-0 pl-[6px] pr-[6px] pt-0 text-[14px]',
                  'data-testid': `button_edit_${scope.rowIndex}`,
                  onClick: () => {
                    console.warn('单元格点击', scope);
                    // AI-GENERATED-BEGIN
                    // @date 2026-05-26
                    // @prompt 修复编辑模式下单位和最小单位回显问题
                    // @description 将 baseUOMId、uomId、manufacturerId、defaultVendorId 转为字符串，与字典接口返回的 id 类型保持一致
                    editForm.value = {};
                    editForm.value = {
                      ...INITIAL_EDIT_FORM_DATA,
                      ...scope.row,
                      baseUOMId:
                        scope.row?.baseUOMId != null
                          ? String(scope.row.baseUOMId)
                          : undefined,
                      uomId:
                        scope.row?.uomId != null
                          ? String(scope.row.uomId)
                          : undefined,
                      manufacturerId:
                        scope.row?.manufacturerId != null
                          ? String(scope.row.manufacturerId)
                          : undefined,
                      defaultVendorId:
                        scope.row?.defaultVendorId != null
                          ? String(scope.row.defaultVendorId)
                          : undefined,
                    };
                    // AI-GENERATED-END
                    console.warn('编辑', editForm.value);
                    currentPage.value = 'EDIT';
                  },
                },
                { default: () => '编辑', icon: () => h(EditActionIcon) },
              ),
            ]);
          },
        },
      },
    ],
    gridEvents: {
      // 单个复选框变化事件
      checkboxChange: () => {
        checkedRowsCount.value =
          chcGridApi?.grid?.getCheckboxRecords(true)?.length || 0;
      },
      // 全选/全不选事件
      checkboxAll: () => {
        checkedRowsCount.value =
          chcGridApi?.grid?.getCheckboxRecords(true)?.length || 0;
      },
    },
    tableSearchExtraParams: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn(params) {
      console.warn('beforeFetchFn params', params);
      return params;
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn params', params);

      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'BatchImportModal-batchImportModalApi': deepMerge(
        importModalDefaultOptions,
        {
          // 连接抽离的组件
          connectedComponent: BatchImportModalComp,
        },
      ),
      'DispatchToHospitalModal-dispatchToHospitalModalApi': deepMerge(
        importModalDefaultOptions,
        {
          // 连接抽离的组件
          connectedComponent: DispatchToHospitalModalComp,
        },
      ),
    },
  },
);

// 启用/停用对话框
const [ActivationModal, activationModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  connectedComponent: commonFormModalComp,
  draggable: true,
});

// 启用/停用
const handleActivation = () => {
  const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }

  activationModalApi
    .setData({
      title: '启用或停用药品',
      submit(params: any) {
        return activateProduct(
          qs.stringify(
            {
              ...params,
              productId: selectedRows.map(({ productId }) => productId),
            },
            { arrayFormat: 'repeat' },
          ),
        ).then((res) => {
          // 接口成功后调用药品查询接口
          chcGridApi?.query();
          return res;
        });
      },
      afterSubmit: () => {
        checkedRowsCount.value = 0;
      },
    })
    .open();
};

// 新建
const handleAdd = () => {
  console.warn('新建');
  currentPage.value = 'ADD';

  editForm.value = { ...INITIAL_EDIT_FORM_DATA };
};

// 批量导入
const handleBatchImport = () => {
  console.warn('批量导入');
  batchImportModalApi
    ?.setData({
      callback() {
        checkedRowsCount.value = 0;
        chcGridApi?.query();
      },
    })
    .open();
};
const handleDispatchToHospital = () => {
  console.warn('下发医院');
  const records = chcGridApi.grid.getCheckboxRecords(true);
  if (isEmpty(records)) {
    message.warning('请选择要下发医院的药品');
    return;
  }
  console.warn('records', records);
  dispatchToHospitalModalApi
    ?.setData({
      rows: deepClone(records),
      callback() {
        checkedRowsCount.value = 0;
        chcGridApi?.query();
      },
    })
    .open();
};
// 切换页面 LIST-列表 ADD-新建 DETAIL-详情
const currentPage = ref<'ADD' | 'DETAIL' | 'EDIT' | 'LIST'>('LIST');
watch(currentPage, (newVal) => {
  if (newVal === 'LIST') {
    chcGridApi?.query();
  }
});

const editForm = ref<Record<string, any>>({ ...INITIAL_EDIT_FORM_DATA });
const handleEditPageBack = () => {
  currentPage.value = 'LIST';
};
// 校验表单
const validateForm = (form: Record<string, any>) => {
  // 必填字段
  let requiredFields = [
    { key: 'name', label: '药品名称' },
    { key: 'productSpec', label: '规格' },
    { key: 'productStyle', label: '剂型' },
    // { key: 'certValidTo', label: '注册证有效期止' },
    { key: 'manufacturerId', label: '生产企业' },
    { key: 'isForeign', label: '药品来源' },
    { key: 'certificateNo', label: '批准文号' },
    { key: 'uomId', label: '单位' },
    { key: 'baseUOMId', label: '最小单位' },
    { key: 'baseUOMQty', label: '转换比' },
    { key: 'essentialDrugType', label: '基本药物分类' },
    // { key: 'insurance', label: '医保药品编码' },
    { key: 'insurancePaymentType', label: '医保支付类别' },
    { key: 'isConsistent', label: '是否一致性评价' },
    { key: 'isIntensive', label: '是否重点监控' },
    { key: 'defaultVendorId', label: '默认供应商' },
    { key: 'pricePO', label: '采购价格' },
    { key: 'baseUOMPrecision', label: '最小单位精度' },
    { key: 'productControlLevel', label: '药品组' },
    { key: 'productCategoryId', label: '药品类别' },
  ];
  // 如果长期有效为Y，注册证有效期止可以为空
  if (form.isLong === 'Y') {
    requiredFields = requiredFields.filter(
      (item) => item.key !== 'certValidTo',
    );
  }
  for (const field of requiredFields) {
    const value = form[field.key];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      message.warning(`${field.label}不能为空`);
      return false;
    }
  }
  return true;
};
// 提交
const handleSubmit = async () => {
  console.warn('提交表单:', editForm.value);
  if (!validateForm(editForm.value)) {
    return;
  }
  console.warn('提交表单校验成功', editForm.value);
  try {
    await requestFormClient.post('/mcProductAction/saveProduct.do', {
      ...editForm.value,
      spiritType:
        editForm.value.specialType === 'J'
          ? Number(editForm.value.spiritType)
          : null,
      // isActive: true,
      // stats: 'Y',
      status: 'CO',
    });
    message.success('提交成功');
    currentPage.value = 'LIST';
    checkedRowsCount.value = 0;
    chcGridApi?.query();
  } catch (error) {
    console.error('提交表单失败:', error);
  }
};

// 返回列表
const handleBack = () => {
  currentPage.value = 'LIST';
  checkedRowsCount.value = 0;
  editForm.value = { ...INITIAL_EDIT_FORM_DATA };
};

// 保存
const handleSave = async () => {
  console.warn('保存表单:', editForm.value);
  if (!validateForm(editForm.value)) {
    return;
  }
  if (editForm.value.tracCode) {
    // 需要对追溯码前缀兼容处理 将中文逗号替换为英文逗号
    const newTracCode = editForm.value.tracCode.replaceAll('，', ',');
    editForm.value.tracCode = newTracCode;
  }
  console.warn('保存表单校验成功:', {
    ...editForm.value,
    isActive: false,
    stats: 'N',
  });
  try {
    await requestFormClient.post('/mcProductAction/saveProduct.do', {
      ...editForm.value,
      spiritType:
        editForm.value.specialType === 'J'
          ? Number(editForm.value.spiritType)
          : null,
      // isActive: false,
      // stats: 'N',
      status: 'DR',
    });
    message.success('保存成功');
    currentPage.value = 'LIST';
    checkedRowsCount.value = 0;
    chcGridApi?.query();
  } catch (error) {
    console.error('保存表单失败:', error);
  }
};
const isViewMode = computed(
  () => currentPage.value === 'DETAIL' || currentPage.value === 'LIST',
);
// 使用规格对话框
const [ProductSpecModal, productSpecModalApi] = useVbenModal({
  class: 'w-[900px] h-[700px]',
  closable: true,
  connectedComponent: TableModalComp,
  draggable: true,
});
function handleSpec() {
  const selectedRows = chcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.error('请选择一条记录！');
    return;
  }
  if (selectedRows.length > 1) {
    message.error('只能选择一条记录维护规格');
    return;
  }
  queryProductUnit().then(({ rows }) => {
    uomNameOptions.value = rows?.map(({ id: value, name: label }) => ({
      label,
      value,
    }));
  });
  const row = selectedRows[0];
  // console.log('111111', row);

  // TS 类型收窄
  if (!row) return;
  const { productId } = row;
  queryProductSpec({
    productId,
    limit: 0,
  }).then(({ rows }) => {
    productSpecModalApi
      ?.setData({
        title: '商品规格',
        schema: selectedRows[0],
        rows,
        submit({ rows, removed }: any) {
          return saveProductSpec({
            productId,
            lineData: JSON.stringify({
              created: rows.filter(({ productSpecId }) => !productSpecId),
              updated: rows.filter(({ productSpecId }) => productSpecId),
              removed,
            }),
          });
        },
      })
      .open();
  });
}

function onUomIdChange(id: string, scope: any) {
  scope.row.uomName =
    uomNameOptions.value.find(({ value }) => value === id)?.label ?? '';
}
</script>

<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    header-class="px-3 py-2"
    footer-class="px-[0.5rem] py-0 bg-transparent  h-[60px]"
  >
    <BatchImportModal />
    <DispatchToHospitalModal />
    <ActivationModal :form-options="activationFormOptions" />
    <ProductSpecModal
      :form-schemas="genSpecAndPackFormSchemas()"
      :grid-columns="specColumns()"
      :after-submit="() => chcGridApi?.query()"
    >
      <template #edit_uomName="scope">
        <VxeSelect
          v-model="scope.row.uomId"
          :options="uomNameOptions"
          @change="({ value }) => onUomIdChange(value, scope)"
          :data-testid="`VxeSelect_uomName_${scope.rowIndex}_ProductSpecModal`"
        />
      </template>
      <template #edit_isActive="scope">
        <Switch
          v-model:checked="scope.row.isActive"
          checked-children="是"
          un-checked-children="否"
          checked-value="Y"
          un-checked-value="N"
          data-testid="switch_isActive_ProductSpecModal"
        />
      </template>
    </ProductSpecModal>
    <ChcGrid v-show="currentPage === 'LIST'">
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_add"
        >
          新建
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleBatchImport"
          class="mr-[0.5rem]"
          data-testid="button_batchImport"
        >
          批量导入
          <template #icon>
            <UploadActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          @click="handleDispatchToHospital"
          class="mr-[0.5rem]"
          data-testid="button_dispatchToHospital"
        >
          下发医院
          {{ checkedRowsCount || '' }}
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_drugList"
        >
          <template #icon>
            <ExportActionIcon />
          </template>
          导出
        </Button>
        <Button
          type="primary"
          @click="handleActivation()"
          class="mr-[0.5rem]"
          data-testid="button_activation"
        >
          启用/停用
        </Button>
        <Button
          type="primary"
          @click="handleSpec()"
          class="mr-[0.5rem]"
          data-testid="button_spec"
        >
          使用规格
        </Button>
      </template>
    </ChcGrid>
    <EditPage
      v-show="
        currentPage === 'ADD' ||
        currentPage === 'DETAIL' ||
        currentPage === 'EDIT'
      "
      :current-page="currentPage"
      v-model:form-data="editForm"
      :is-view-mode="isViewMode"
      @back="handleEditPageBack"
    />
    <template #footer v-if="currentPage !== 'LIST'">
      <div
        class="box-border flex h-full flex-1 items-center justify-center gap-[10px] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.1)]"
      >
        <Button @click="handleBack" data-testid="button_back_editPage">
          返回
          <AntdArrowLeftOutlined class="mb-[4px]" />
        </Button>

        <Button
          type="primary"
          @click="handleSave"
          v-show="!isViewMode && editForm.status !== 'CO'"
          data-testid="button_save_editPage"
        >
          保存
          <template #icon>
            <UploadCloudIcon />
          </template>
        </Button>

        <Button
          type="primary"
          @click="handleSubmit"
          v-show="!isViewMode"
          data-testid="button_submit_editPage"
        >
          提交
          <template #icon>
            <UploadCloudIcon />
          </template>
        </Button>
      </div>
    </template>
  </Page>
</template>

<style lang="less" scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

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

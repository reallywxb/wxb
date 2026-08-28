import type {
  ExtendedModalApi,
  VbenFormProps,
  VbenFormSchema,
} from '@vben/common-ui';

import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { message, Modal } from 'ant-design-vue';

import {
  queryProductUnit,
  saveBatchProduct,
  saveProduct,
  saveProductApply,
} from '#/views/modules/spd/views/operation/product/api';

// 采购单位选项
const uomNameOptions = ref<Array<{ label: string; value: string }>>([]);

// Table查询表单
export function queryFormOptions(hiddenFields: Array<string>) {
  return [
    {
      component: 'Input',
      fieldName: 'productName',
      label: '药品',
      componentProps: {
        maxLength: 50,
        placeholder: '编码/搜索码/名称',
      },
    },
    {
      component: 'Input',
      fieldName: 'manufacturerName',
      label: '生产厂家',
      componentProps: {
        placeholder: '请输入生产厂家',
      },
    },
    {
      component: 'Input',
      fieldName: 'brandName',
      label: '品牌',
      componentProps: {
        placeholder: '请输入品牌',
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/vendor.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择默认供应商',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'defaultVendorId',
      label: '默认供应商',
    },
    // {
    //   component: 'ChcSelect',
    //   componentProps: () => {
    //     return {
    //       // autoChooseFirstOption: true,
    //       dictUrl: '/productAction/productTypeList.do',
    // apiType: 'post',
    // requestContentType: 'application/x-www-form-urlencoded',
    //       showSearch: true,
    //       placeholder: '请选择商品分类',
    //       onChange(val: any, option: any) {
    //         console.warn('productType', val, option);
    //       },
    //       paginate: false,
    //       filterByFrontEnd: true,
    //       showChooseAll: '',
    //       immediate: true,
    //       labelField: 'name',
    //       valueField: 'id',
    //       afterFetch(res: any) {
    //         return { ...res, rows: undefined, records: res.rows };
    //       },
    //     };
    //   },
    //   fieldName: 'productType',
    //   label: '商品分类',
    // },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '启用' },
            { value: 'N', label: '停用' },
          ],
          placeholder: '请选择商品状态',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'isActive',
      label: '商品状态',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          options: [
            { value: '', label: '全部' },
            { value: 'Y', label: '审批通过' },
            { value: 'N', label: '审批未通过' },
          ],
          placeholder: '请选择审批状态',
          defaultValue: '',
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: '',
          immediate: true,
        };
      },
      fieldName: 'productApplyStatus',
      label: '审批状态',
    },
  ].filter(
    ({ fieldName }) => !hiddenFields.includes(fieldName),
  ) as VbenFormSchema[];
}

// column配置
export function genColumns(hiddenFields: string[]) {
  return [
    { type: 'checkbox', title: '多选', width: 50, align: 'center' },
    { title: '序号', type: 'seq', width: 50, align: 'center' },
    {
      field: 'isActive',
      visible: !hiddenFields.includes('isActive'),
      title: '商品状态',
      minWidth: '100',
      sortable: true,
      formatter({ cellValue }: { cellValue: string }) {
        return cellValue === 'Y' ? '启用' : '停用';
      },
    },
    {
      field: 'productApplyStatus',
      visible: !hiddenFields.includes('productApplyStatus'),
      title: '审批状态',
      minWidth: '100',
      sortable: true,
    },
    {
      field: 'productCode',
      visible: !hiddenFields.includes('productCode'),
      title: '药品编码',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'name',
      visible: !hiddenFields.includes('name'),
      title: '药品名称',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'productSpec',
      visible: !hiddenFields.includes('productSpec'),
      title: '规格',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'modelNo',
      visible: false,
      // visible: !hiddenFields.includes('modelNo'),
      title: '型号',
      minWidth: '120',
      sortable: true,
    },
    {
      field: 'brandName',
      visible: !hiddenFields.includes('brandName'),
      title: '品牌',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'manufacturerName',
      visible: !hiddenFields.includes('manufacturerName'),
      title: '生产厂家',
      minWidth: '150',
      sortable: true,
    },
    {
      field: 'uomName',
      visible: !hiddenFields.includes('uomName'),
      title: '单位',
      minWidth: 80,
      sortable: true,
    },
    // {
    //   field: 'baseUOMName',
    //   visible: !hiddenFields.includes('baseUOMName'),
    //   title: '最小单位',
    //   minWidth: '90',
    //   sortable: true,
    // },
    // {
    //   field: 'uomName',
    //   visible: !hiddenFields.includes('uomName'),
    //   title: '采购单位',
    //   minWidth: '90',
    //   sortable: true,
    // }
    {
      field: 'pricePO',
      visible: !hiddenFields.includes('pricePO'),
      title: '采购价',
      minWidth: '70',
      format: '0.000##',
      sortable: true,
      align: 'right',
    },
    {
      field: 'defaultVendorName',
      visible: !hiddenFields.includes('defaultVendorName'),
      title: '默认供应商',
      minWidth: '150',
      sortable: false,
    },
    {
      field: 'lpackageQty',
      visible: !hiddenFields.includes('lpackageQty'),
      title: '大包装数',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      field: 'mpackageQty',
      visible: !hiddenFields.includes('mpackageQty'),
      title: '中包装数',
      minWidth: '90',
      sortable: true,
      align: 'right',
    },
    {
      align: 'center',
      field: 'action',
      slots: { default: 'action' },
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: '操作',
      width: 180,
    },
  ];
}

// 弹框表单配置
export function genFormOptions(hiddenFields: string[], isBatch = false) {
  const route = useRoute();
  const isManualCode =
    (route.meta.urlParams as Record<string, any>)?.isManualCode === 'Y';
  const formSchemas = [
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入编码前缀',
      },
      fieldName: 'prefix',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '编码前缀',
      hidden: !isManualCode || !isBatch,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品编码',
      },
      fieldName: 'productCode',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '药品编码',
      rules: 'required',
      // disabled: isBatch,
      hidden: isBatch && isManualCode,
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入药品名称',
      },
      fieldName: 'name',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '药品名称',
      rules: isBatch ? '' : 'required',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入规格',
      },
      fieldName: 'productSpec',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '规格',
    },
    // {
    //   component: 'Input',
    //   componentProps: {
    //     allowClear: true,
    //     placeholder: '请输入型号',
    //   },
    //   fieldName: 'modelNo',
    //   formItemClass: 'col-span-1',
    //   labelClass: ' w-[90px]',
    //   label: '型号',
    // },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入品牌',
      },
      fieldName: 'productName',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '品牌',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=1000391',
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          showChooseAll: false,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'manufacturerId',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '生产厂家',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: 'baseHandleAction/refList.do?id=1000244',
          // showSearch: true,
          placeholder: '请选择商品组',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productControlLevel',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      rules: isBatch ? '' : 'required',
      label: '商品组',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入零售价',
      },
      fieldName: 'priceList',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '零售价',
    },
    {
      component: 'Input',
      componentProps: {
        allowClear: true,
        placeholder: '请输入采购单价',
        disabled: true,
      },
      fieldName: 'pricePO',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '采购单价',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/baseHandleAction/vendor.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择默认供应商',
          paginate: false,
          filterByFrontEnd: true,
          disabled: true,
          showChooseAll: '',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'vendorId',
      label: '默认供应商',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=114',
          showSearch: false,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'uomId',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      rules: isBatch ? '' : 'required',
      label: '单位',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
          dictUrl: '/productAction/productTypeList.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择商品分类',
          onChange(val: any, option: any) {
            console.warn('productType', val, option);
          },
          paginate: false,
          filterByFrontEnd: true,
          showChooseAll: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productType',
      label: '商品分类',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/productAction/productCategoryList.do',
          // showSearch: true,
          placeholder: '请选择',
          paginate: false,
          immediate: true,
          showChooseAll: false,
          labelField: 'name',
          valueField: 'id',
          allowClear: true,
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'productCategoryId',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '商品类别',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 20,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'lpackageQty',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '大包装数',
    },
    {
      component: 'Input',
      componentProps: {
        maxLength: 20,
        allowClear: true,
        placeholder: '请输入',
      },
      fieldName: 'mpackageQty',
      formItemClass: 'col-span-1',
      labelClass: ' w-[90px]',
      label: '中包装数',
    },
  ];
  const extraSchemas: any[] = [];
  const formOptions: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      // route.meta.urlParams?.isManualCode !== Y 时展示编码前缀 prefix
      ...formSchemas.filter(({ hidden }) => !hidden),
      ...((route.meta.urlParams as Record<string, any>).type === 'hc' &&
      !isBatch
        ? extraSchemas
        : []),
    ].filter(({ fieldName }) => !hiddenFields.includes(fieldName)),
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-3',
  };

  return formOptions;
}

export function useProductHC({
  parentGridApi,
  addOrEditModalApi,
  batchModificationModalApi,
  changeRecordModalApi,
}: any) {
  const route = useRoute();

  /**
   * 规范表单中的选择值：
   * 当后端返回 manufacturerId 为数字 0/字符串 '0' 时，
   * 转换为 ''，以便前端下拉框显示“全部”。
   *
   * @param form - 原始表单对象
   * @returns 规范化后的表单对象（不修改入参，返回新对象）
   */
  function normalizeManufacturerAll(form: any) {
    const normalized = { ...form };
    if (normalized.manufacturerId === 0 || normalized.manufacturerId === '0') {
      normalized.manufacturerId = '';
    }
    if (
      normalized.productCategoryId === 0 ||
      normalized.productCategoryId === '0'
    ) {
      normalized.productCategoryId = '';
    }
    return normalized;
  }
  // 新增
  function handleAdd() {
    addOrEditModalApi
      .setData({
        title: '添加',
        form: {},
        submit(params: any) {
          return saveProduct(
            {
              ...params,
              isPurchasePriceUnify: 'N',
              isLot: 'N',
              isGuaranteeDateMandatory: 'N',
            },
            {
              page: (route.meta.urlParams as Record<string, any>).page,
            },
          );
        },
      })
      .open();
  }
  // 编辑
  function handleEdit(row: any) {
    console.warn('handleEdit', row);
    if (row.productApplyStatus === '待审批') {
      message.error('待审批数据不能修改！');
      return;
    }
    const [{ productId, versionStamp, isActive, ...form }] = [row];
    addOrEditModalApi
      .setData({
        title: '修改',
        // 当 manufacturerId 为 0 时，展示“全部”
        form: normalizeManufacturerAll(form),
        submit(params: any) {
          console.warn('入参====>', {
            productId,
            versionStamp,
            ...params,
          });
          return saveProductApply(
            {
              productId,
              versionStamp,
              isActive,
              isPurchasePriceUnify: 'N',
              isLot: 'N',
              isGuaranteeDateMandatory: 'N',
              ...params,
            },
            { page: (route.meta.urlParams as Record<string, any>).page },
          );
        },
      })
      .open();
  }
  // 批量修改
  function handleBatchEdit() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    batchModificationModalApi
      .setData({
        title: '批量修改',
        submit(params: any) {
          return new Promise((resolve, reject) => {
            Modal.confirm({
              title: '提示',
              content: `确认批量修改${selectedRows.length}条商品吗？`,
              onOk: async () => {
                try {
                  await saveBatchProduct({
                    ...params,
                    productIds: JSON.stringify(
                      selectedRows.map(
                        ({ productId }: { productId: number | string }) =>
                          productId,
                      ),
                    ),
                    isPurchasePriceUnify: 'Y',
                  }).then((res) => {
                    resolve(res);
                  });
                } catch {
                  reject(new Error('请求失败'));
                }
              },
              onCancel: () => {
                reject(new Error('用户取消'));
              },
            });
          });
        },
      })
      .open();
  }
  // 复制
  function handleCopy() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ productId, ...form }] = selectedRows;

    addOrEditModalApi
      .setData({
        title: '复制',
        // 当 manufacturerId 为 0 时，展示“全部”
        form: normalizeManufacturerAll(form),
        submit(params: any) {
          return saveProduct(
            {
              ...params,
            },
            { page: (route.meta.urlParams as Record<string, any>).page },
          );
        },
      })
      .open();
  }

  function onUomIdChange(id: string, scope: any) {
    scope.row.uomName =
      uomNameOptions.value.find(({ value }) => value === id)?.label ?? '';
  }

  queryProductUnit().then(({ rows }) => {
    uomNameOptions.value = rows?.map(
      ({ id: value, name: label }: { id: string; name: string }) => ({
        label,
        value,
      }),
    );
  });
  // 变更记录
  function handleChangeRecord(row: any) {
    console.warn('handleChangeRecord', row);
    changeRecordModalApi
      .setData({
        title: '变更记录',
        productId: row.productId,
      })
      .open();
  }

  return {
    handleAdd,
    handleEdit,
    handleBatchEdit,
    handleCopy,
    uomNameOptions,
    onUomIdChange,
    handleChangeRecord,
  };
}

export function useImportModal() {
  // 药品导入组件 ref
  const drugImportModalRef = ref<ExtendedModalApi | undefined>();
  const specImportModalRef = ref<ExtendedModalApi | undefined>();
  const allocationImportModalRef = ref<ExtendedModalApi | undefined>();

  // 药品导入组件 form-options
  const importSchemas = [
    // {
    //   component: 'Switch',
    //   fieldName: 'isOverWrite', // 药品名称
    //   labelClass: ' w-[150px] ',
    //   componentProps: () => {
    //     return {
    //       checkedValue: 'Y',
    //       unCheckedValue: 'N',
    //       checkedChildren: '是',
    //       unCheckedChildren: '否',
    //       style: {
    //         width: '40px',
    //       },
    //     };
    //   },
    //   defaultValue: 'N',
    //   label: '是否覆盖已有商品',
    // },
    {
      component: 'Switch',
      fieldName: 'isCreateDict', // 药品名称
      labelClass: ' w-[150px] ',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
      defaultValue: 'N',
      label: '是否自动创建字典',
    },
    {
      component: 'ChcSelect',
      labelClass: ' w-[150px] ',
      controlClass: 'w-full',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/listProductServers.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'serverId',
      label: '商品站点',
      rules: 'required',
    },
  ];

  const ypTemplateURL = new URL(
    '#/assets/excels/product-yp.xls',
    import.meta.url,
  ).toString();
  const hcTemplateURL = new URL(
    '#/assets/excels/product-hc.xls',
    import.meta.url,
  ).toString();

  const specTemplateURL = new URL(
    '#/assets/excels/initialproductspec.xls',
    import.meta.url,
  ).toString();

  const allocationTemplateURL = new URL(
    '#/assets/excels/productPackLocator.xls',
    import.meta.url,
  ).toString();

  return {
    drugImportModalRef,
    specImportModalRef,
    allocationImportModalRef,
    importSchemas,
    ypTemplateURL,
    hcTemplateURL,
    specTemplateURL,
    allocationTemplateURL,
  };
}

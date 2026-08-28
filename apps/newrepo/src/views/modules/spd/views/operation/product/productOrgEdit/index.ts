import type { ExtendedModalApi, VbenFormProps } from '@vben/common-ui';

import { h, ref, toRaw, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { $t } from '#/locales';
import { deepMerge, handlePriceToFixedTwo } from '#/utils/util';
import {
  batchChangeVendor,
  batchSaveProductOrg,
  modifyProductOrg,
  saveProductChildOrg,
} from '#/views/modules/spd/views/operation/product/api';
import { saveProductOrg } from '#/views/modules/spd/views/operation/product/purchaseAgreementEdit/api';
import OrgChangeLogComp from '#/views/modules/spd/views/operation/product/purchaseAgreementEdit/changeLog.vue';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import productChangeLogComp from '../common/modals/productChangeLogModal.vue';

export function useGrid() {
  const parentTableParams = ref<{ [key: string]: any }>({});
  const parentSelectedIsUnifyN = ref(false);
  const handleFormSubmit = async () => {
    // 清空子表数据
    childGridApi.grid.remove(childGridApi.grid.getFullData());
    //  childGridApi.grid.reloadData([]);
    parentTableParams.value.productId = undefined;
    const formValues = await parentGridApi.formApi.getValues();
    parentGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
    await parentGridApi.query(formValues);
    // 获取表格数据 默认选中父表的第一条数据
    const tableData = parentGridApi.grid.getTableData().tableData || [];
    if (tableData.length > 0) {
      const firstRow = tableData[0];
      if (firstRow.productId) {
        parentGridApi.grid.setCheckboxRow(firstRow, true);
        onCheckboxChange({ row: firstRow, checked: true });
      }
    }
  };
  // 父表
  const [ParentGrid, parentGridApi] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        handleSubmit: handleFormSubmit,
        compact: true,
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        layout: 'horizontal',
        submitButtonOptions: {
          content: '查询',
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        stripe: false,
        checkboxConfig: {
          trigger: 'cell',
          highlight: true,
        },
        radioConfig: {
          trigger: 'row',
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
      }),
    },
    {
      id: 'productOrgEdit',
      // api地址
      queryUrl: `productAction/queryProduct.do`,
      showRadioRowTag: true,
      gridColumns: [
        { title: '单选', type: 'radio', visible: false },
        {
          type: 'checkbox',
          width: 50,
          align: 'center',
        },
        { title: '序号', type: 'seq', width: 50, align: 'center' },
        {
          field: 'productCode',
          title: '药品编码',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'productName',
          title: '品名',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'medicineName',
          title: '通用名',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'brandName',
          title: '品牌',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'productSpec',
          title: '规格',
          minWidth: '120',
          sortable: true,
        },
        {
          field: 'modelNo',
          title: '型号',
          minWidth: '120',
          sortable: true,
          visible: false,
        },
        {
          field: 'manufacturerName',
          title: '厂家',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'uomName',
          title: '单位',
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'isPurchasePriceUnify',
          title: '是否统一定价',
          minWidth: '110',
          formatter({ cellValue }) {
            return cellValue === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'priceList',
          title: '零售价',
          minWidth: '100',
          align: 'right',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.priceList);
          },
          // format: '0.000##',
        },
        {
          field: 'pricePO',
          title: '采购价',
          minWidth: '100',
          align: 'right',
          formatter({ row }: any) {
            return handlePriceToFixedTwo(row.pricePO);
          },
          // format: '0.000##',
        },
        {
          field: 'defaultVendorName',
          title: '默认供应商',
          minWidth: '110',
        },
        {
          field: 'markCode',
          title: '省标编码',
          minWidth: '100',
        },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: $t('system.menu.operation'),
          width: 90,
        },
      ],
      // 表单配置
      formSchema: [
        /* bug单要求隐藏 */
        // {
        //   component: 'ChcSelect',
        //   componentProps: () => {
        //     return {
        //       autoChooseFirstOption: true,
        //       dictUrl:
        //         '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
        //       placeholder: '请选择院区',
        //       allowClear: true,
        //       paginate: false,
        //       immediate: true,
        //       labelField: 'name',
        //       valueField: 'id',
        //       afterFetch(res: any) {
        //         return { ...res, rows: undefined, records: res.rows };
        //       },
        //     };
        //   },
        //   // defaultValue: 1_000_007,
        //   fieldName: 'departmentId',
        //   label: '院区',
        // },
        {
          component: 'DateGroup',
          fieldName: 'date',
          // formItemClass: 'col-span-6 pl-[10px] pr-[10px]',
          // labelClass: 'leading-1 mb-[0px] pl-[4px]',
          label: '创建时间',
        },
        {
          component: 'Input',
          fieldName: 'productName',
          label: '药品',
          componentProps: () => {
            return {
              placeholder: `编码/搜索码/名称`,
              defaultValue: '',
            };
          },
        },
        {
          component: 'ChcSelect',
          defaultValue: '',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              dictUrl: '/productAction/productControlLevelList.do',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择商品组',
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
          fieldName: 'productControlLevel',
          label: '商品组',
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              dictUrl: '/baseHandleAction/vendor.do',
              apiType: 'post',
              requestContentType: 'application/x-www-form-urlencoded',
              showSearch: true,
              placeholder: '请选择供应商',
              paginate: false,
              // allowClear: true,
              filterByFrontEnd: true,
              // mode: 'multiple',
              // showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          defaultValue: '',
          fieldName: 'vendorId',
          label: '供应商',
        },
        {
          component: 'Input',
          fieldName: 'markCode',
          label: '省标编码',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'productSpec',
          label: '规格',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'manufacturerName',
          label: '生产厂家',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
        {
          component: 'Input',
          fieldName: 'brandName',
          label: '品牌',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
      ],
      gridEvents: {
        // checkboxChange: onCheckboxChange,
        // checkboxAll: onCheckboxChange,
        radioChange: onRadioChange,
      },
      afterFetchFn: (params) => {
        if (isEmpty(params?.rows)) {
          parentTableParams.value = {};
        }
        return {
          ...params,
          records: params.rows,
        };
      },
    },
  );

  /**
   * 构建子表列配置，允许根据是否显示“编辑”按钮动态调整操作列宽度
   */
  function buildChildColumns(showEdit: boolean) {
    return [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'vendorName',
        title: '供应商',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'pricePO',
        title: '采购价',
        minWidth: '100',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.pricePO);
        },
      },
      {
        field: 'discountRate',
        title: '折扣率',
        minWidth: '100',
        align: 'right',
        verify: 'number|required',
      },
      {
        field: 'discountPrice',
        title: '折扣价',
        minWidth: '100',
        align: 'right',
        formatter({ row }: any) {
          return handlePriceToFixedTwo(row.discountPrice);
        },
      },
      {
        field: 'isDefault',
        title: '默认',
        minWidth: '100',
        editRender: {},
        slots: {
          default: 'defaultIsDefault',
        },
      },
      {
        field: 'isActive',
        title: '是否有效',
        minWidth: '100',
        editRender: {},
        slots: {
          default: 'defaultIsActive',
        },
      },
      {
        field: 'guaranteeDaysMin',
        title: '效期预警天数',
        verify: 'number|required',
        align: 'right',
        minWidth: 120,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '80',
        sortable: true,
      },
      {
        field: 'updated',
        title: '更新时间',
        minWidth: '130',
        sortable: true,
      },
      {
        field: 'updatedByName',
        title: '更新人',
        minWidth: '80',
        sortable: true,
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: $t('system.menu.operation'),
        width: showEdit ? 150 : 90,
      },
    ];
  }

  watch(
    parentSelectedIsUnifyN,
    (val) => {
      childGridApi.grid.reloadColumn(buildChildColumns(val));
    },
    { immediate: false },
  );

  function onRadioChange({ row }: { row: any }) {
    if (row?.productId) {
      // 父表没数据，子表要清空
      parentTableParams.value.productId = row.productId;
      childGridApi.query({
        productId: parentTableParams.value.productId,
      });
      parentSelectedIsUnifyN.value = row.isPurchasePriceUnify === 'N';
    } else {
      parentTableParams.value.productId = undefined;
      // childGridApi.grid.remove(childGridApi.grid.getFullData());
      childGridApi.grid.remove();
      parentSelectedIsUnifyN.value = false;
    }
  }

  function onCheckboxChange({ row, checked }) {
    if (checked) {
      parentGridApi.grid.setCheckboxRow(row, true);
      parentTableParams.value.productId = row.productId;
      childGridApi.query({
        productId: parentTableParams.value.productId,
      });
      parentSelectedIsUnifyN.value = row.isPurchasePriceUnify === 'N';
    } else {
      const checkedRows = parentGridApi.grid.getCheckboxRecords();
      if (checkedRows.length === 0) {
        parentTableParams.value.productId = undefined;
        childGridApi.grid.remove(childGridApi.grid.getFullData());
        parentSelectedIsUnifyN.value = false;
      } else {
        const current =
          checkedRows.find(
            (r: any) => r.productId === parentTableParams.value.productId,
          ) ?? checkedRows[0];
        parentSelectedIsUnifyN.value = current?.isPurchasePriceUnify === 'N';
      }
    }
  }

  // 子表
  const [ChildGrid, childGridApi] = useSpdGrid(
    {
      gridOptions: {
        radioConfig: {
          trigger: 'row',
          highlight: false,
        },
        columns: [
          // {
          //   type: 'checkbox',
          //   width: 50,
          //   align: 'center',
          // },
          { title: '序号', type: 'seq', width: 50, align: 'center' },
          {
            field: 'vendorName',
            title: '供应商',
            minWidth: '200',
            sortable: true,
          },
          {
            field: 'pricePO',
            title: '采购价',
            minWidth: '100',
            align: 'right',
            formatter({ row }: any) {
              return handlePriceToFixedTwo(row.pricePO);
            },
          },
          {
            field: 'discountRate',
            title: '折扣率',
            minWidth: '100',
            align: 'right',
            // edit: readOnly ? '' : 'number',
            verify: 'number|required',
          },
          {
            field: 'discountPrice',
            title: '折扣价',
            minWidth: '100',
            align: 'right',
            formatter({ row }: any) {
              return handlePriceToFixedTwo(row.discountPrice);
            },
          },
          {
            field: 'isDefault',
            title: '默认',
            minWidth: '100',
            // toolbar: readOnly ? '' : '#switchTpl_isDefault',
            // formatter({ cellValue }) {
            //   return cellValue === 'Y' ? '是' : '否';
            // },
            editRender: {},
            slots: {
              default: 'defaultIsDefault',
            },
          },
          {
            field: 'isActive',
            title: '是否有效',
            minWidth: '100',
            // toolbar: readOnly ? '' : '#switchTpl_isActive',
            // formatter({ cellValue }) {
            //   return cellValue === 'Y' ? '是' : '否';
            // },
            editRender: {},
            slots: {
              default: 'defaultIsActive',
            },
          },
          {
            field: 'guaranteeDaysMin',
            title: '效期预警天数',
            // edit: readOnly ? '' : 'number',
            verify: 'number|required',
            align: 'right',
            minWidth: 120,
          },
          {
            field: 'created',
            title: '创建时间',
            minWidth: '130',
            sortable: true,
          },
          {
            field: 'createdByName',
            title: '创建人',
            minWidth: '80',
            sortable: true,
          },
          {
            field: 'updated',
            title: '更新时间',
            minWidth: '130',
            sortable: true,
          },
          {
            field: 'updatedByName',
            title: '更新人',
            minWidth: '80',
            sortable: true,
          },
          {
            align: 'center',
            field: 'action',
            slots: { default: 'action' },
            fixed: 'right',
            headerAlign: 'center',
            showOverflow: false,
            title: $t('system.menu.operation'),
            width: 150,
          },
        ],
        proxyConfig: {
          autoLoad: false,
        },
      },
    },
    {
      parentTableParams,
      id: 'productOrgEdit_son',
      dataTableId: '/productAction/queryProductOrg.do',
      tableSearchExtraParams: {
        showPrice: 'Y',
      },
      beforeFetchFn: (params) => {
        if (isEmpty(parentTableParams.value?.productId)) {
          return false;
        }
        return {
          ...params,
          productId: parentTableParams.value.productId,
        };
      },
    },
  );

  function refreshChildGrid() {
    childGridApi.query({
      productId: parentTableParams.value.productId,
    });
  }

  const [ProductChangeLogModal, productChangeLogApi] = useVbenModal({
    class: 'w-[800px]',
    closable: true,
    connectedComponent: productChangeLogComp,
    draggable: true,
  });

  const [OrgChangeLogModal, orgChangeLogApi] = useVbenModal({
    class: 'w-[800px]',
    closable: true,
    connectedComponent: OrgChangeLogComp,
    draggable: true,
  });

  function handleViewChangeLog(row: any) {
    productChangeLogApi
      .setData({
        productId: row.productId,
      })
      .open();
  }

  function handleViewOrgChangeLog(row: any) {
    orgChangeLogApi
      .setData({
        openType: 'viewChangeLog',
        formData: {
          showForm: true,
          showFormLast: false,
          productOrgId: row.productOrgId,
        },
      })
      .open();
  }

  return {
    ParentGrid,
    parentGridApi,
    ChildGrid,
    childGridApi,
    refreshChildGrid,
    parentSelectedIsUnifyN,
    ProductChangeLogModal,
    OrgChangeLogModal,
    handleViewChangeLog,
    handleViewOrgChangeLog,
    handleFormSubmit,
  };
}
export function useModificationModal({ parentGridApi }: any) {
  const [CreationModal, creationModalApi] = useVbenModal({
    class: 'w-[900px] h-[500px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

  const [BatchCreationModal, batchCreationModalApi] = useVbenModal({
    class: 'w-[900px] h-[500px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

  const [BatchModifyVendorModal, batchModifyVendorModalApi] = useVbenModal({
    class: 'w-[900px] h-[500px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

  const [EditPriceModal, editPriceModalApi] = useVbenModal({
    class: 'w-[420px] h-[260px]',
    closable: true,
    connectedComponent: commonFormModalComp,
    draggable: true,
  });

  const creationFormOptions: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'productCode',
        label: '药品编码',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'productName',
        label: '药品名称',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'productSpec',
        label: '规格',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'manufacturerName',
        label: '厂家',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'uomName',
        label: '单位',
      },
      {
        component: 'Switch',
        componentProps: {
          checkedChildren: '是',
          checkedValue: 'Y',
          unCheckedChildren: '否',
          unCheckedValue: 'N',
          style: {
            width: '40px',
          },
        },
        fieldName: 'isPurchasePriceUnify',
        label: '统一定价',
        disabled: true,
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'priceList',
        label: '零售价',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'vendorId',
        rules: 'required',
        hideRequiredMark: true,
        label: '供应商',
      },
      {
        component: 'Switch',
        componentProps: {
          checkedChildren: '是',
          checkedValue: 'Y',
          unCheckedChildren: '否',
          unCheckedValue: 'N',
          style: {
            width: '40px',
          },
        },
        fieldName: 'isDefault',
        label: '默认供应商',
      },
      {
        component: (attr: any) => {
          return h(
            'div',
            {
              // style: {
              //   fontWeight: 'bold',
              // },
            },
            attr.modelValue,
          );
        },
        fieldName: 'pricePO',
        label: '采购价',
      },
      {
        component: 'InputNumber',
        fieldName: 'discountRate',
        label: '折扣率',
        componentProps: () => {
          return {
            placeholder: `请输入折扣率`,
            min: 0,
            max: 1,
            step: 0.01,
            precision: 2,
          };
        },
      },
      {
        component: 'InputNumber',
        fieldName: 'guaranteeDaysMin',
        label: '效期预警天数',
        componentProps: () => {
          return {
            placeholder: `请输入`,
          };
        },
      },
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
  };
  const batchCreationFormOptions: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        rules: 'required',
        hideRequiredMark: true,
        fieldName: 'vendorId',
        label: '供应商',
      },
      {
        component: 'Switch',
        componentProps: {
          checkedChildren: '是',
          checkedValue: 'Y',
          unCheckedChildren: '否',
          unCheckedValue: 'N',
          style: {
            width: '40px',
          },
        },
        fieldName: 'isDefault',
        label: '默认供应商',
      },
      {
        component: 'InputNumber',
        fieldName: 'guaranteeDaysMin',
        label: '效期预警天数',
        componentProps: () => {
          return {
            placeholder: `请输入`,
          };
        },
      },
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
  };
  const batchModifyVendorFormOptions: VbenFormProps = {
    layout: 'horizontal',
    schema: [
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择供应商',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            // mode: 'multiple',
            // showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        rules: 'required',
        hideRequiredMark: true,
        fieldName: 'vendorId',
        label: '新供应商',
      },
    ],
    // 控制表单是否显示折叠按钮
    showCollapseButton: false,
    // 是否在字段值改变时提交表单
    submitOnChange: false,
    // 按下回车时是否提交表单
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
  };

  const editPriceFormOptions: VbenFormProps = {
    layout: 'horizontal',
    commonConfig: {
      labelClass: 'w-[70px]',
      formItemClass: 'pl-0',
      componentProps: {
        class: 'w-full',
      },
    },
    schema: [
      {
        component: 'InputNumber',
        fieldName: 'pricePO',
        label: '采购价',
        componentProps: () => {
          return {
            placeholder: `请输入采购价`,
          };
        },
      },
      {
        component: 'InputNumber',
        fieldName: 'discountRate',
        label: '折扣率',
        componentProps: () => {
          return {
            placeholder: `请输入折扣率`,
            min: 0,
            max: 1,
            step: 0.01,
            precision: 2,
          };
        },
      },
    ],
    showCollapseButton: false,
    submitOnChange: false,
    submitOnEnter: false,
    wrapperClass: 'grid-cols-1',
  };

  function handleAdd() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    const [
      {
        productId,
        productCode,
        productName,
        productSpec,
        manufacturerName,
        uomName,
        isPurchasePriceUnify,
        priceList,
        pricePO,
        vendorId,
      },
    ] = selectedRows;
    creationModalApi
      .setData({
        title: '添加',
        form: {
          productCode,
          productName,
          productSpec,
          manufacturerName,
          uomName,
          isPurchasePriceUnify,
          priceList,
          pricePO,
          vendorId,
          isDefault: 'Y',
          discountRate: 1,
          guaranteeDaysMin: 210,
        },
        submit(params: any) {
          return saveProductOrg({
            ...params,
            productId,
            isActive: 'Y',
          });
        },
      })
      .open();
  }

  function handleBatchAdd() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    batchCreationModalApi
      .setData({
        title: '批量新增',
        form: {
          isDefault: 'Y',
          discountRate: 1,
          guaranteeDaysMin: 210,
        },
        submit(params: any) {
          return batchSaveProductOrg({
            ...params,
            productIds: JSON.stringify(
              selectedRows.map(({ productId }) => productId),
            ),
            isActive: 'Y',
          });
        },
      })
      .open();
  }

  function handleBatchModifyVendor() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    batchModifyVendorModalApi
      .setData({
        title: '批量变更',
        submit(params: any) {
          return batchChangeVendor({
            ...params,
            productIds: JSON.stringify(
              selectedRows.map(({ productId }) => productId),
            ),
          });
        },
      })
      .open();
  }

  function modifyChildLine(row: any) {
    modifyProductOrg(row)
      .then(() => {
        message.success('修改成功');
      })
      .catch(() => {
        message.error('修改失败');
      });
  }

  /**
   * 打开子表价格编辑弹窗
   */
  function handleOpenEditPrice(row: any) {
    editPriceModalApi
      .setData({
        title: '编辑价格',
        form: {
          ...row,
          pricePO: row.pricePO,
          discountRate: row.discountRate,
        },
        submit(params: any) {
          return saveProductChildOrg({
            ...row,
            // productOrgId: row.productOrgId,
            pricePO: params.pricePO,
            discountRate: params.discountRate,
          });
        },
      })
      .open();
  }

  return {
    creationFormOptions,
    batchCreationFormOptions,
    batchModifyVendorFormOptions,
    editPriceFormOptions,
    CreationModal,
    BatchCreationModal,
    BatchModifyVendorModal,
    EditPriceModal,
    handleAdd,
    handleBatchAdd,
    handleBatchModifyVendor,
    modifyChildLine,
    handleOpenEditPrice,
  };
}

export function useImportModal() {
  const importModalRef = ref<ExtendedModalApi | undefined>();
  const templateUrl = new URL(
    '#/assets/excels/productorg.xls',
    import.meta.url,
  ).toString();

  return {
    importModalRef,
    templateUrl,
  };
}

import type { ExtendedModalApi } from '@vben/common-ui';
import type { ExtendedVxeGridApi } from '@vben/plugins/src/vxe-table/types';

import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import chooseProductModalUi from '#/views/modules/spd/views/operation/packageUnitChange/changeApply/modals/chooseProductModal.vue';
import {
  commitContract,
  completeContract,
  deleteContract,
  queryContractLine,
  saveContractLine,
} from '#/views/modules/spd/views/operation/product/api';

export const gridColumns = [
  { type: 'radio', title: '', width: 40, align: 'center', visible: false },
  {
    title: '序号',
    type: 'seq',
    width: 50,
    align: 'center',
    sortable: true,
  },
  {
    field: 'productName',
    minWidth: 140,
    title: '药品名称',
    align: 'center',
    sortable: true,
    editRender: {},
    slots: { edit: 'edit_productName' },
  },
  {
    field: 'productCode',
    minWidth: 100,
    title: '药品编码',
    sortable: true,
    // slots: { edit: 'edit_productSpec' },
  },
  {
    field: 'productSpec',
    minWidth: 60,
    title: '规格',
    sortable: true,
    // slots: { edit: 'edit_productSpecCode' },
  },
  {
    field: 'manufacturer',
    minWidth: 60,
    title: '厂家',
    sortable: true,
    editRender: {},
    // formatter: ({ row }: any) =>
    //   uomNameOptions.value.find(({ value }) => value === row.uomName)?.label ??
    //   '',
  },
  {
    field: 'modelNo',
    minWidth: 60,
    title: '型号',
    sortable: true,
    visible: false,
    // slots: { edit: 'edit_uomPrecision' },
  },
  {
    field: 'uomName',
    minWidth: 60,
    title: '单位',
    sortable: true,
    // slots: { edit: 'edit_uomPrecision' },
  },

  {
    field: 'price',
    minWidth: 120,
    title: '协议价',
    sortable: true,
    editRender: { name: 'VxeNumberInput' },
    // slots: { edit: 'edit_uomPrecision' },
  },
  {
    field: 'discountRate',
    minWidth: 120,
    title: '折扣率',
    sortable: true,
    editRender: {
      name: 'VxeNumberInput',
      events: {
        blur(scope: any, ev: any) {
          if (isEmpty(scope.row.price)) {
            message.error('请先设置协议价');
            return;
          }
          scope.row.discountPrice = isEmpty(ev.value)
            ? 0
            : scope.row.price * ev.value;
        },
      },
    },
    // slots: { edit: 'edit_uomPrecision' },
  },
  {
    field: 'discountPrice',
    minWidth: 120,
    title: '折扣价',
    sortable: true,
    editRender: {
      name: 'VxeNumberInput',
      events: {
        blur(scope: any, ev: any) {
          if (isEmpty(scope.row.price)) {
            message.error('请先设置协议价');
            return;
          }
          scope.row.discountRate = isEmpty(ev.value)
            ? 0
            : ev.value / scope.row.price;
        },
      },
    },
    // slots: { edit: 'edit_uomPrecision' },
  },
  {
    field: 'guaranteeDaysMin',
    minWidth: 120,
    title: '效期预警天数',
    sortable: true,
    editRender: { name: 'VxeNumberInput' },
    // slots: { edit: 'edit_uomPrecision' },
  },
  {
    field: 'description2',
    minWidth: 120,
    title: '备注',
    sortable: true,
    editRender: { name: 'VxeInput' },
    // slots: { edit: 'edit_uomPrecision' },
  },
];

export function useGrid() {
  const route = useRoute();
  const productName = ref('');
  const parentTableParams = ref<{ [key: string]: any }>({});

  // 父表
  const [ParentGrid, parentGridApi] = useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        commonConfig: {
          labelClass: 'w-[90px]',
        },
        layout: 'horizontal',
        showCollapseButton: false,
        submitButtonOptions: {
          content: '查询',
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        stripe: false,
        radioConfig: {
          trigger: 'row',
          highlight: true,
        },
        checkboxConfig: {
          trigger: 'cell',
          highlight: true,
        },
        proxyConfig: {
          autoLoad: false,
        },
      }),
    },
    {
      id: 'vendorContractMaintenanceAndConfirm',
      // api地址
      queryUrl: `vendorAction/queryContract.do?docStatus=${route.meta.urlParams?.docStatus}`,
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
          field: 'siteContractId',
          title: '协议号',
          minWidth: '110',
          sortable: true,
        },
        {
          field: 'name',
          title: '协议名',
          minWidth: '160',
          sortable: true,
        },
        {
          field: 'contractDate',
          title: '协议时间',
          minWidth: '160',
          sortable: true,
        },
        {
          field: 'validFrom',
          title: '有效起始',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'validTo',
          title: '有效截止',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'docStatusName',
          title: '协议状态',
          minWidth: '150',
          sortable: true,
        },
        {
          field: 'createUser',
          title: '登记人',
          minWidth: '80',
          sortable: true,
        },
        {
          field: 'created',
          title: '登记日期',
          minWidth: '100',
          sortable: true,
        },
        {
          field: 'bpartnerName',
          title: '供应商',
          minWidth: '140',
          sortable: true,
        },
        //			{
        //				"field": "orgName",
        //				"title": "机构",
        //				"minWidth": "120",
        //				"sortable": true
        //			},
        {
          field: 'description1',
          title: '备注',
          minWidth: '150',
          sortable: true,
        },
        // {
        //   align: 'center',
        //   field: 'action',
        //   slots: { default: 'action' },
        //   fixed: 'right',
        //   headerAlign: 'center',
        //   showOverflow: false,
        //   title: $t('system.menu.operation'),
        //   width: 230,
        // },
      ],
      // 表单配置
      formSchema: [
        {
          component: 'DateGroup',
          fieldName: 'date',
          label: '协议日期',
          defaultValue: [
            dayjs(dayjs().format('YYYY-MM-DD'))
              .subtract(7, 'day')
              .format('YYYY-MM-DD'),
          ],
          formItemClass: 'col-span-1',
        },
        {
          component: 'Input',
          fieldName: 'vendor',
          label: '供应商编码',
          componentProps: () => {
            return {
              placeholder: `编码/名称/搜索码`,
              defaultValue: '',
            };
          },
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
              showChooseAll: '',
              immediate: true,
              labelField: 'name',
              valueField: 'id',
              afterFetch(res: any) {
                return { ...res, rows: undefined, records: res.rows };
              },
            };
          },
          defaultValue: '',
          fieldName: 'bpartnerId',
          label: '供应商',
        },
        {
          component: 'Input',
          fieldName: 'siteContractID',
          label: '协议号',
          componentProps: () => {
            return {
              placeholder: `请输入`,
              defaultValue: '',
            };
          },
        },
      ],
      gridEvents: {
        radioChange: onRadioChange,
      },
      afterFetchFn: (params) => {
        childGridApi.grid.reloadData([]);
        if (isEmpty(params?.rows)) {
          parentTableParams.value.contractId = undefined;
        }
        return {
          ...params,
          records: params.rows,
        };
      },
    },
  );

  function onRadioChange({ row }: { row: any }) {
    if (row?.contractId) {
      // 父表没数据，子表要清空
      parentTableParams.value.contractId = row.contractId;
      parentGridApi.grid.clearCheckboxRow();
      parentGridApi.grid.setCheckboxRow(row, true);
      childGridApi.query({
        contractId: parentTableParams.value.contractId,
      });
    } else {
      parentTableParams.value.contractId = undefined;
      // childGridApi.grid.remove(childGridApi.grid.getFullData());
      childGridApi.grid.remove();
    }
  }

  // 子表
  const [ChildGrid, childGridApi, { handleExport }] = useSpdGrid(
    {
      gridOptions: {
        columns: [
          // {
          //   type: 'checkbox',
          //   width: 50,
          //   align: 'center',
          // },
          { title: '序号', type: 'seq', width: 50, align: 'center' },
          {
            field: 'productCode',
            title: '药品编码',
            minWidth: '120',
            sortable: true,
          },
          {
            field: 'productName',
            title: '药品名称',
            minWidth: '250',
            sortable: true,
          },
          {
            field: 'productSpec',
            title: '规格',
            minWidth: '150',
            sortable: true,
          },
          {
            field: 'manufacturer',
            title: '厂家',
            minWidth: '150',
            sortable: true,
          },
          {
            field: 'modelNo',
            title: '型号',
            minWidth: '100',
            sortable: true,
            visible: false,
          },
          {
            field: 'certificateNo',
            title: '批准文号',
            minWidth: '100',
            sortable: true,
          },
          {
            field: 'uomName',
            title: '单位',
            minWidth: '70',
            sortable: true,
          },
          {
            field: 'price',
            title: '价格',
            minWidth: '90',
            align: 'right',
            format: '0.00##',
            sortable: true,
          },
          {
            field: 'discountRate',
            title: '折扣率',
            minWidth: '90',
            align: 'right',
            sortable: true,
          },
          {
            field: 'discountPrice',
            title: '折扣价',
            minWidth: '90',
            align: 'right',
            format: '0.000##',
            sortable: true,
          },
          {
            field: 'guaranteeDaysMin',
            title: '效期预警天数',
            // "<font title='供应商配送的效期低于预警天数时，医院会拒收。'>效期预警天数</font>",
            minWidth: '120',
            align: 'right',
            sortable: true,
          },
          {
            field: 'description2',
            title: '备注',
            minWidth: '150',
            sortable: true,
          },
        ],
        proxyConfig: {
          autoLoad: false,
        },
      },
    },
    {
      parentTableParams,
      id: 'vendorContractMaintenanceAndConfirm_son',
      dataTableId: '/vendorAction/queryContractLine.do',
      // tableSearchExtraParams: {},
      beforeFetchFn: (params) => {
        if (isEmpty(parentTableParams.value?.contractId)) {
          return false;
        }
        return {
          ...params,
          ...parentTableParams.value,
        };
      },
    },
  );

  function del() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    const validateFn = () => {
      if (selectedRows.length === 0) {
        message.error('请选择协议！');
        return false;
      }
      // 禅道2453 一次只能删除一条协议
      if (selectedRows.length > 1) {
        message.error('一次只能删除一条协议！');
        return false;
      }
      return true;
    };
    if (!validateFn()) {
      return;
    }
    Modal.confirm({
      title: '提示',
      content: `确认删除吗？`,
      onOk: async () => {
        try {
          await deleteContract({
            contractId: selectedRows[0].contractId,
          });

          message.success('删除成功');

          parentGridApi.query();
        } catch {
          message.error('删除失败');
        }
      },
    });
  }

  function submit() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: `确认提交吗？`,
      onOk: async () => {
        try {
          await commitContract({
            contractId: JSON.stringify(
              selectedRows.map(({ contractId }) => contractId),
            ),
          });

          message.success('提交成功');

          parentGridApi.query();
        } catch {
          message.error('提交失败');
        }
      },
    });
  }

  function complete() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    Modal.confirm({
      title: '提示',
      content: `确认提交吗？`,
      onOk: async () => {
        try {
          await completeContract({
            contractId: JSON.stringify(
              selectedRows.map(({ contractId }) => contractId),
            ),
          });

          message.success('确认成功');

          parentGridApi.query();
        } catch {
          message.error('确认失败');
        }
      },
    });
  }

  function handleChildSearch() {
    childGridApi.query({
      contractId: parentTableParams.value.contractId,
      productName: productName.value,
    });
  }

  return {
    ParentGrid,
    parentGridApi,
    ChildGrid,
    handleExport,
    handleChildSearch,
    productName,
    del,
    submit,
    complete,
  };
}
export function useModificationModal({ parentGridApi }: any) {
  // const [CreationModal, creationModalApi] = useVbenModal({
  //   class: 'w-[900px] h-[500px]',
  //   closable: true,
  //   // 连接抽离的组件
  //   connectedComponent: TableModalComp,
  //   draggable: true,
  // });
  const disabled = ref(true);

  const tableModalRef = ref<
    | (Record<string, any> & {
        gridApi?: ExtendedVxeGridApi;
        modalApi: ExtendedModalApi;
      })
    | undefined
  >();

  // 选择商品
  const [ChooseProductModal, ChooseProductModalApi] = useVbenModal({
    class: 'w-[1300px]',
    closable: true,
    draggable: true,
    connectedComponent: chooseProductModalUi,
  });

  function handleAdd() {
    disabled.value = false;
    tableModalRef.value?.modalApi
      .setData({
        title: '添加',
        submit({ schema, rows, removed }: any) {
          // 兼容后端接口 将字段为null undefined的过滤
          const filteredRows = filterRowsNullUndefined(rows);
          console.warn('filteredRows', filteredRows);
          return validateGrid(filteredRows)
            ? saveContractLine({
                ...schema,
                lineData: JSON.stringify({
                  created: filteredRows.filter(
                    ({ contractLineId }) => !contractLineId,
                  ),
                  updated: filteredRows.filter(
                    ({ contractLineId }) => contractLineId,
                  ),
                  removed,
                }),
              })
            : Promise.reject(new Error('表格校验失败'));
        },
      })
      .open();
  }
  function handleEdit() {
    const selectedRows = parentGridApi.grid.getCheckboxRecords();
    if (selectedRows.length === 0) {
      message.error('请选择一条记录！');
      return;
    }

    disabled.value = true;

    queryContractLine(
      { limit: 0 },
      { contractId: selectedRows[0].contractId },
    ).then(({ rows }) => {
      const [
        { contractId, validFrom, validTo, bpartnerId, name, description1 },
      ] = selectedRows;

      tableModalRef.value?.modalApi
        .setData({
          title: '修改',
          schema: {
            contractId,
            date: [validFrom, validTo],
            bpartnerId,
            name,
            description1,
          },
          rows,
          submit({ schema, rows, removed }: any) {
            const filteredRows = filterRowsNullUndefined(rows);
            return validateGrid(filteredRows)
              ? saveContractLine({
                  contractId,
                  ...schema,
                  lineData: JSON.stringify({
                    created: filteredRows.filter(
                      ({ contractLineId }) => !contractLineId,
                    ),
                    updated: filteredRows.filter(
                      ({ contractLineId }) => contractLineId,
                    ),
                    removed: removed.map((contractLineId) => ({
                      contractLineId,
                    })),
                  }),
                })
              : Promise.reject(new Error('表格校验失败'));
          },
        })
        .open();
    });
  }

  function validateGrid(rows: Array<any>) {
    for (const [i, row] of rows.entries()) {
      if (isEmpty(row.price)) {
        message.error(`第${i + 1}行: 缺少协议价格！`);
        return false;
      }
      if (isEmpty(row.discountPrice)) {
        message.error(`第${i + 1}行: 缺少折扣价！`);
        return false;
      }
    }
    return true;
  }

  // 辅助函数：过滤对象中的null和undefined值
  function filterNullUndefined(obj: Record<string, any>) {
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );
  }
  // 辅助函数：批量过滤数组
  function filterRowsNullUndefined(rows: Array<any>) {
    return rows.map((row) => filterNullUndefined(row));
  }
  function onSearchProduct(row: any) {
    ChooseProductModalApi.setData({
      productCode: row.productCode,
      callback({
        productId,
        productCode,
        productName,
        productSpec,
        manufacturer,
        modelNo,
        uomId,
        uomName,
      }: Record<string, any> = {}) {
        Object.assign(row, {
          productId,
          productCode,
          productName,
          productSpec,
          manufacturer,
          modelNo,
          uomId,
          uomName,
        });
      },
    }).open();
  }

  const formSchemas = computed(() => [
    {
      formItemClass: 'col-span-2',
      component: 'Input',
      fieldName: 'contractId',
      label: '协议号',
      disabled: true,
    },
    {
      // 日期区间组件
      component: 'DateGroup',
      // 配置日期区间组件属性
      componentProps: {
        // 这里可以传antd-vue date-picker 或者 time-picker 组件内的属性进行配置
        valueFormat: 'YYYY-MM-DD',
      },
      fieldName: 'date',
      formItemClass: 'col-span-2',
      label: '有效期',
      labelClass: 'leading-1 mb-[1px] pl-[4px]',
      rules: 'required',
    },
    {
      component: 'ChcSelect',
      formItemClass: 'col-span-2',
      componentProps: () => {
        return {
          // autoChooseFirstOption: true,
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
      fieldName: 'bpartnerId',
      label: '供应商',
      rules: 'required',
      disabled: disabled.value,
    },
    {
      formItemClass: 'col-span-2',
      component: 'Input',
      fieldName: 'name',
      label: '协议名',
      rules: 'required',
    },
    {
      formItemClass: 'col-span-2',
      component: 'Input',
      fieldName: 'description1',
      label: '备注',
    },
  ]);

  return {
    handleAdd,
    handleEdit,
    formSchemas,
    tableModalRef,
    ChooseProductModal,
    onSearchProduct,
  };
}

export function useImportModal() {
  const importModalRef = ref<ExtendedModalApi | undefined>();
  const importSchemas = [
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/vendor.do',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择',
          paginate: false,
          // allowClear: true,
          filterByFrontEnd: true,
          // onSearch: (params: any) => {
          //   console.warn('onSearch:', params);
          // },
          // mode: 'multiple',
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      fieldName: 'bpartnerId',
      label: '供应商',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: '协议名',
      rules: 'required',
      componentProps: () => ({
        placeholder: '请输入',
      }),
    },

    {
      component: 'DatePicker',
      fieldName: 'dateFrom',
      label: '起始日期',
      componentProps: () => {
        return {
          valueFormat: 'YYYY-MM-DD',
        };
      },
      rules: 'required',
    },
    {
      component: 'DatePicker',
      fieldName: 'dateTo',
      label: '结束日期',
      componentProps: () => {
        return {
          valueFormat: 'YYYY-MM-DD',
        };
      },
    },

    {
      component: 'Input',
      fieldName: 'description',
      label: '备注',
      componentProps: () => ({
        placeholder: '请输入',
      }),
    },
  ];

  const templateUrl = new URL(
    '#/assets/excels/contract.xls',
    import.meta.url,
  ).toString();

  return {
    importModalRef,
    importSchemas,
    templateUrl,
  };
}

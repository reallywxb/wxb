<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { SearchActionIcon, SvgPrintFillIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useGlobalPrintStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';
import LazySearch from '#/utils/LazySearch';

const globalPrintStore = useGlobalPrintStore();

const route = useRoute();
const urlParams: any = route.meta?.urlParams || {};
const module = urlParams?.m || '';
const urlParamsHidden = urlParams?.hiddenField || '';
const isFirstLoaded = ref(false);
const searchController = new LazySearch(4, async () => {
  await nextTick();
  const formValues = await chcGridApi?.formApi?.getValues();
  chcGridApi?.formApi?.setLatestSubmissionValues(toRaw(formValues));
  isFirstLoaded.value = true;
  chcGridApi.query({ ...formValues });
});
onMounted(() => {
  searchController.sign(4);
});
const parentTableParams = ref<{ [key: string]: any }>({
  inoutId: undefined,
  productName: undefined,
});

// 使用 computed 属性来处理列的可见性
const priorityTypeNameVisible = computed(() => {
  return !urlParamsHidden.includes('priorityTypeName');
});
// const orderTypeNameVisible = computed(() => {
//   return urlParamsHidden.includes('orderTypeName');
// });
const formSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
const formReset = async () => {
  await chcGridApi.formApi.resetForm();
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(formValues);
  chcGridApi.query(formValues);
};
// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: {
      // fieldMappingTime: [
      //   ['dateOrdered', ['dateArrivedFrom', 'dateArrivedTo'], 'YYYY-MM-DD'],
      // ],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        minWidth: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'productCode',
        title: '药品编码',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'productName',
        title: '药品名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'productSpec',
        title: '规格',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'manufacturer',
        title: '厂家',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'uomName',
        title: '单位',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'movementQty',
        title: '入库数量',
        align: 'right',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'price',
        title: '采购价',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'priceList',
        title: '零售价',
        minWidth: '90',
        align: 'right',
        sortable: true,
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: urlParams?.orderType === 'PO' ? '供应商' : '发货单位',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'applyNo',
        title: '申请单号',
        minWidth: '100',
        // edit: 'text',
        sortable: true,
      },
      // {
      //   align: 'center',
      //   field: 'action',
      //   slots: { default: 'action' },
      //   fixed: 'right',
      //   headerAlign: 'center',
      //   showOverflow: false,
      //   title: '操作',
      //   width: 180,
      // },
    ],
    id: 'child',
    queryUrl: '/inoutAction/queryDetail.do',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.inoutId) {
        return false;
      }
      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      if (!parentTableParams.value.inoutId) {
        return {
          records: [],
        };
      }
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
// 父表
const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      handleSubmit: formSubmit,
      handleReset: formReset,
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    showCustomBtn: true,
    showZoomBtn: true,
    // queryUrl:
    //   '/inoutAction/query.do?page=input&returnDoc=&rejectDoc=&orderType=WO,MO,WR,SR',
    queryUrl: `/inoutAction/query.do?page=input&returnDoc=${urlParams?.returnDoc || ''}&rejectDoc=${urlParams?.rejectDoc || ''}&orderType=${urlParams?.orderType || ''}`,
    showRadioRowTag: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        minWidth: 50,
        align: 'center',
      },
      { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'inoutNo',
        title: '入库单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'movementDate',
        title: '入库日期',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: urlParams?.orderType === 'PO' ? '供应商' : '发货单位',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'departmentName',
        title: '院区',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '入库仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'priorityTypeName',
        minWidth: 90,
        sortable: true,
        title: '来源类别',
        visible: priorityTypeNameVisible.value,
      },
      {
        field: 'orderTypeName',
        title: '申请类型',
        minWidth: '110',
        sortable: true,
        // visible: orderTypeNameVisible.value,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
        sortable: true,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '入库时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            dictUrl:
              '/baseHandleAction/departmentList.do?type=0&includeRegion=Y',
            placeholder: '请选择院区',
            allowClear: true,
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
                'departmentId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(1);
              }
              return { ...res, rows: undefined, records: res.rows };
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
            dictUrl: '/baseHandleAction/warehouse.do',
            placeholder: '请选择收货仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            immediate: false,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              chcGridApi.formApi?.setFieldValue(
                'warehouseId',
                isEmpty(res?.rows?.[0]?.id) ? '' : res?.rows?.[0]?.id,
              );
              if (!isFirstLoaded.value) {
                searchController.sign(2);
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values) {
            nextTick(() => {
              const cond =
                chcGridApi.formApi?.getFieldComponentRef &&
                typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId') &&
                chcGridApi.formApi?.getFieldComponentRef('warehouseId').params;
              if (cond) {
                chcGridApi.formApi.getFieldComponentRef(
                  'warehouseId',
                ).params.dependencies = {
                  departmentId: values?.departmentId || -1,
                  regionId: values?.departmentId || -1,
                };
                chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
                chcGridApi.formApi
                  ?.getFieldComponentRef('warehouseId')
                  ?.fetchApi();
              }
            });
          },
        },
        fieldName: 'warehouseId',
        label: '收货仓库',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/customer.do?bpartnerType=4',
            placeholder: '请选择发货单位',
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              searchController.sign(3)
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: '',
        fieldName: 'bpartnerId',
        label: '发货单位',
      },
      {
        component: 'Input',
        fieldName: 'inoutNo',
        componentProps: {
          placeholder: '请输入入库单号',
        },
        label: '入库单号',
      },
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       // autoChooseFirstOption: true,
      //       defaultValue: '',
      //       // dictUrl: '/orderPlanAction/commit.do',
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'WO', label: '库房请领' },
      //         { value: 'WR', label: '库房请退' },
      //         { value: 'MO', label: '库间调拨' },
      //         { value: 'SO', label: '科室请领' },
      //         { value: 'SR', label: '科室请退' },
      //       ],
      //       placeholder: '请选择申请类型',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       showChooseAll: '',
      //       immediate: true,
      //     };
      //   },
      //   defaultValue: '',
      //   fieldName: 'queryOrderType',
      //   label: '申请类型',
      // },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/orderAction/inputOrderTypeList.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择申请类型',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            defaultValue: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'queryOrderType',
        label: '申请类型',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/refList.do?id=1000566',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择来源类别',
            paginate: false,
            // allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            defaultValue: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'priorityType',
        label: '来源类别',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        componentProps: {
          placeholder: '请输入药品',
        },
        label: '药品',
      },
      {
        component: 'Input',
        fieldName: 'description',
        componentProps: {
          placeholder: '请输入备注',
        },
        label: '备注',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '是' },
              { value: 'N', label: '否' },
            ],
            placeholder: '请选择是否已打印',
            defaultValue: '',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
          };
        },
        fieldName: 'isPrinted',
        label: '已打印',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        // console.log('radioChange:', row);
        if (row && row.inoutId) {
          parentTableParams.value.inoutId = row.inoutId;
          childGridApi.reload({ inoutId: row.inoutId });
          await chcGridApi.grid.clearCheckboxRow();
          chcGridApi.grid.setCheckboxRow(row, true);
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.inoutId = undefined;
          // 删除子表的数据
          childGridApi.grid.remove(childGridApi.grid.getFullData());
        }
      },
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      // 'ChooseLotModal-chooseLotModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: ChooseLotModalComp,
      // },
      // 'CheckUserModal-checkUserModalApi': {
      //   // 连接抽离的组件
      //   connectedComponent: CheckUserModalComp,
      // },
    },
  },
);

const handleSearch = () => {
  if (!parentTableParams.value.inoutId) {
    return;
  }
  childGridApi.reload({
    inoutId: parentTableParams.value.inoutId,
    productName: parentTableParams.value.productName,
  });
};
const handlePrint = () => {
  const record = chcGridApi.grid.getCheckboxRecords();
  if (record.length === 0) {
    message.error('请选择需要打印的数据');
    return;
  }

  // 检查是否存在"科室请退"类型
  const hasDepartmentReturn = record.some(
    (row) => row.orderTypeName === '科室请退',
  );
  // 检查是否存在非"科室请退"类型
  const hasOtherType = record.some((row) => row.orderTypeName !== '科室请退');

  // 只有同时存在两种类型时才阻止
  if (hasDepartmentReturn && hasOtherType) {
    message.error('科室请退的数据不能与其他数据混合打印，请单独勾选');
    return;
  }

  // const inoutId = record.inoutId;
  const inoutId = record.map((row) => row.inoutId).join(',');
  Modal.confirm({
    title: '打印提示',
    content: `确认打印${module === 'w1' ? '退库' : '入库'}单吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk() {
      globalPrintStore.print({
        pdf_path: `${location.origin}${import.meta.env.VITE_GLOB_API_URL}/inoutAction/printInputDoc.do?id=${inoutId}`,
      });
    },
    onCancel() {},
  });
};

onMounted(() => {
  console.warn('urlParams', urlParams);
  // formSubmit();
});
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
                @click="handlePrint"
                data-testid="button_print"
              >
                打印
                <template #icon>
                  <SvgPrintFillIcon />
                </template>
              </Button>
            </template>
          </ChcGrid>
        </template>
        <template #second>
          <ChildGrid>
            <template #qtyProcessDefault="scope">
              <InputNumber
                class="w-full"
                :min="0"
                v-model="scope.row.qtyProcess"
                :data-testid="`inputnumber_qtyProcess_${scope.rowIndex}`"
              />
              <span style="color: red">{{ scope.row.qtyProcess }}</span>
            </template>
            <template #toolbar-actions>
              <Input
                v-model:value="parentTableParams.productName"
                class="mr-[0.5rem] w-[240px]"
                placeholder="编码/拼音码/名称"
                style="margin-top: 10px"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_productName"
              />
              <Button
                type="primary"
                @click="handleSearch"
                data-testid="button_search"
                style="margin-top: 10px"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
            </template>
          </ChildGrid>
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

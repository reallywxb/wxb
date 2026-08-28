<script lang="ts" setup>
import { onMounted, ref, toRaw, watch } from 'vue';
// import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
  SvgSquareTickIcon,
} from '@vben/chc-icons';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, InputNumber, message } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import { useSpdGrid } from '#/components/spd';

import EditModalComp from './editModal.vue';
// import PageSplitLazy from './modals/page-split-lazy.vue';

// const route = useRoute();
// const isProductControlLevel = ''; // chcAppConfig.isProductControlLevel
// const urlParams: { [key: string]: any } = route.meta?.urlParams || {};
// const returnDoc = urlParams.returnDoc || '';
// const rejectDoc = urlParams.rejectDoc || '';
// const orderType = urlParams.orderType || '';

const props = withDefaults(
  defineProps<{
    getDetailPageConfig: () => {
      [key: string]: any;
      detailPageType: DetailInfo['type'] | undefined;
      detailPageValue: number;
    };
    goToDetailPage: (
      row: any,
      detailPageConfig: DetailInfo,
      callBack?: () => void,
    ) => void;
    thisTab: PageTab;
  }>(),
  {},
);
const currentTab = defineModel<number>('currentTab', { required: true }); // 当前所在tab的value值
const parentTableParams = ref<{ [key: string]: any }>({
  headerId: undefined,
  productName: undefined,
});
const handleFormSubmit = async () => {
  const formValues = await chcGridApi.formApi.getValues();
  chcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  chcGridApi.query(formValues);
};
// const totalVal = ref(0);
const departmentId = ref<number | string | undefined>(undefined);
// 子表
const [ChildGrid, childGridApi] = useSpdGrid(
  {
    formOptions: {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    },
    gridOptions: {
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
      // showFooter: true,
      // footerMethod: () => {
      //   return [
      //     {
      //       index: '合计',
      //       unitPackQty: totalVal.value,
      //     },
      //   ];
      // },
    },
  },
  {
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'movementPlanLineId',
        visible: false,
        // "hidden" : true
      },
      {
        field: 'productCode',
        title: '药品编码',
        align: 'right',
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
        field: 'uomName',
        title: '单位',
        minWidth: '75',
        sortable: true,
      },
      {
        field: 'packagePlaned',
        title: '指示包数',
        align: 'right',
        minWidth: '80',
      },
      {
        field: 'qtyPlaned',
        title: '指示数量',
        align: 'right',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'locatorName',
        title: '原货位',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'toLocatorName',
        title: '目标货位',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'storageStatusName',
        title: '原状态',
        minWidth: '130',
        // "verify":"required"
      },
      {
        field: 'toStorageStatusName',
        title: '目标状态',
        minWidth: '130',
        // "verify":"required"
      },
      {
        field: 'lot',
        title: '批号',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'guaranteeDate',
        title: '效期',
        minWidth: '120',
        sortable: true,
      },
    ],
    // showExportBtn: true,
    id: 'child',
    queryUrl: 'movementPlanAction/queryDetail.do',
    beforeFetchFn: (params) => {
      if (!parentTableParams.value.headerId) {
        return false;
      }
      return { ...params, ...parentTableParams.value };
    },
    afterFetchFn: (params) => {
      // totalVal.value = params.rows.reduce((val: number, item: any) => {
      //   return val + Number(item.unitPackQty);
      // }, 0);
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
      commonConfig: {
        labelClass: 'w-[70px]',
      },
      handleSubmit: handleFormSubmit,
      handleReset: async () => {
        await chcGridApi.formApi.resetForm();
        const formValues = await chcGridApi.formApi.getValues();
        chcGridApi.formApi.setLatestSubmissionValues(formValues);
        chcGridApi.query(formValues);
      },
    },
    gridOptions: {
      stripe: false,
      proxyConfig: {
        autoLoad: true,
      },
      border: true,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      // sortConfig: {
      //   defaultSort: {
      //     field: 'priorityRuleName',
      //     order: 'desc',
      //   },
      // },
      pagerConfig: {
        enabled: true,
      },
    },
  },
  {
    id: 'parent',
    queryUrl: `movementPlanAction/query.do?page=input`,
    // showCustomBtn: true,
    // showZoomBtn: true,
    gridColumns: [
      { title: '单选', type: 'radio', visible: false },
      {
        title: '序号',
        type: 'seq',
        width: 50,
        align: 'center',
        // fixed: 'left',
      },
      // { title: '', type: 'checkbox', minWidth: 50, align: 'center' },
      {
        field: 'movementPlanId',
        visible: false,
        // "hidden" : true
      },
      {
        field: 'movementPlanNo',
        title: '计划单号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'datePlaned',
        title: '计划时间',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'createdByName',
        title: '创建人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'created',
        title: '创建时间',
        minWidth: '135',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '150',
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
        width: '200',
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'date',
        label: '计划时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            // .subtract(2, 'year')
            .subtract(1, 'week')
            // .subtract(1, 'day')
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
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            onChange(val: any) {
              departmentId.value = val;
            },
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: '',
        fieldName: 'departmentId',
        label: '院区',
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: true,
            dictUrl: '/baseHandleAction/warehouse.do?readWrite=Y',
            placeholder: '请选择仓库',
            triggerFields: ['departmentId', 'regionId'],
            paginate: false,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              if (res.rows?.length) {
                const firstOption = res.rows[0];
                chcGridApi.formApi?.setFieldValue(
                  'warehouseId',
                  firstOption.id,
                );
              }
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        // defaultValue: '',
        fieldName: 'warehouseId',
        label: '仓库',
        dependencies: {
          triggerFields: ['departmentId', 'regionId'],
          trigger(values: any) {
            if (
              chcGridApi.formApi?.getFieldComponentRef &&
              typeof chcGridApi.formApi?.getFieldComponentRef === 'function' &&
              chcGridApi.formApi?.getFieldComponentRef('warehouseId')
            ) {
              chcGridApi.formApi.getFieldComponentRef(
                'warehouseId',
              ).params.dependencies = {
                regionId: values.departmentId,
                departmentId: values.departmentId,
              };
              chcGridApi.formApi
                ?.getFieldComponentRef('warehouseId')
                ?.fetchApi();
              chcGridApi.formApi?.setFieldValue('warehouseId', undefined);
            }
          },
        },
      },
      {
        component: 'Input',
        fieldName: 'movementPlanNo',
        label: '计划单号',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        componentProps: () => {
          return {
            placeholder: '编码/拼音码/名称',
          };
        },
        label: '药品',
      },
    ],
    gridEvents: {
      radioChange: async ({ row }: { row: any }) => {
        if (row && row.movementPlanId) {
          parentTableParams.value.headerId = row.movementPlanId;
          childGridApi.reload({ headerId: row.movementPlanId });
        } else {
          // 父表没数据，子表要清空
          parentTableParams.value.headerId = undefined;
        }
      },
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
    afterFetchFn: (params) => {
      childGridApi.grid.reloadData([]);
      return {
        ...params,
        records: params.rows,
      };
    },
    customModals: {
      'EditModal-editModalApi': {
        closable: true,
        draggable: true,
        // 连接抽离的组件
        connectedComponent: EditModalComp,
      },
    },
  },
);

const handleAdd = () => {
  props.goToDetailPage(
    {},
    {
      detailTitle: '新建',
      sourcePage: props.thisTab.value,
      type: 'add',
    },
  );
};
const handleEdit = (scope: any) => {
  // const record = chcGridApi.grid.getRadioRecord(true);
  // if (!record) {
  //   return message.error('请选择行！');
  // }
  props.goToDetailPage(scope.row, {
    detailTitle: '修改',
    sourcePage: props.thisTab.value,
    type: 'edit',
  });
};
const handleSearch = () => {
  childGridApi.reload(parentTableParams.value);
};
const handleDel = (row: any) => {
  row.deleteLoading = true;
  requestFormClient
    .post('movementPlanAction/delete.do', {
      movementPlanId: row.movementPlanId,
    })
    .then(() => {
      row.deleteLoading = false;
      message.success('删除成功');
      handleFormSubmit();
    })
    .catch(() => {
      row.deleteLoading = false;
    });
};
const handleSubmit = (row: any) => {
  row.submitLoading = true;
  requestFormClient
    .post('movementPlanAction/commit.do', {
      movementPlanId: row.movementPlanId,
    })
    .then(() => {
      row.submitLoading = false;
      message.success('提交成功');
      handleFormSubmit();
    })
    .catch(() => {
      row.submitLoading = false;
    });
};
onMounted(() => {
  handleFormSubmit();
});
// 通过监听当前tab是否为此tab，来调用接口查询表格数据，以达到切换tab，页面无需重新渲染，只刷新表格的要求
watch(
  () => currentTab.value,
  (val: number, oldVal: number) => {
    const detailPageConfig = props.getDetailPageConfig();
    if (
      val === props.thisTab.value &&
      (oldVal !== detailPageConfig.detailPageValue ||
        (oldVal === detailPageConfig.detailPageValue &&
          detailPageConfig.detailPageType !== 'view'))
    ) {
      handleFormSubmit();
    }
  },
);
</script>

<template>
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
        <ChcGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              @click="handleAdd"
              class="mr-[0.5rem]"
              data-testid="button_add_mainPage"
            >
              新建
              <template #icon>
                <AddActionIcon />
              </template>
            </Button>
            <!-- <Button type="primary" @click="handleEdit" class="mr-[0.5rem]">
              修改
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button>
            <Button
              type="primary"
              danger
              @click="handleApply"
              class="mr-[0.5rem]"
            >
              删除
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button>
            <Button type="primary" @click="handleApply" class="mr-[0.5rem]">
              提交
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button> -->
          </template>
          <template #action="scope">
            <!-- ghost -->
            <Button
              type="primary"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              @click="handleEdit(scope)"
              :data-testid="`button_edit_${scope.rowIndex}_mvplanInputPackage`"
            >
              修改
              <template #icon>
                <EditActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              danger
              :loading="scope.row.deleteLoading"
              @click="handleDel(scope.row)"
              class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              :data-testid="`button_delete_${scope.rowIndex}_mvplanInputPackage`"
            >
              删除
              <template #icon>
                <SvgDeleteIcon />
              </template>
            </Button>
            <Button
              type="primary"
              :loading="scope.row.submitLoading"
              @click="handleSubmit(scope.row)"
              class="h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
              :data-testid="`button_sbumit_${scope.rowIndex}_mvplanInputPackage`"
            >
              提交
              <template #icon>
                <SvgSquareTickIcon />
              </template>
            </Button>
          </template>
        </ChcGrid>
      </template>
      <template #second>
        <ChildGrid class="childGrid">
          <template #qtyProcessDefault="scope">
            <InputNumber
              class="w-full"
              :min="0"
              v-model:value="scope.row.qtyProcess"
              :data-testid="`InputNumber_qtyProcess_${scope.rowIndex}_mvplanInputPackage`"
            />
          </template>
          <template #toolbar-actions>
            <Input
              v-model:value="parentTableParams.productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="编码/拼音码/名称"
              @keyup.enter="handleSearch"
              allow-clear
              data-testid="input_productName_mvplanInputPackage"
            />
            <Button
              type="primary"
              @click="handleSearch"
              class="mr-[0.5rem]"
              data-testid="button_search_mvplanInputPackage"
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

::v-deep(.childGrid .vxe-grid) {
  padding: 0.5rem;
}
</style>

<script setup lang="ts">
import type { TableDataItem } from './api';

import { h, onMounted, ref } from 'vue';
// import { useVbenModal } from '@vben/common-ui';

import {
  AddActionIcon,
  IconfontBasicView,
  SvgCloseIcon,
  SvgSaveIcon,
} from '@vben/chc-icons';

import { Button, message, Modal, Tooltip } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { updateMaterialsStart, updateMaterialsStatusStop } from './api';
import actionLogModalComp from './modals/actionLogModal.vue';
import addSensitiveMaterialsToTFComp from './modals/addMaterialsModal.vue';
import { commonFormOptions, viewFormOptions } from './options';

const extParams = ref<{}>({});
const vendorIds = ref<(number | string)[]>([]);
// const isFirstLoaded = ref(false);

const [
  ChcGrid,
  ChcGridApi,
  {
    ActionLogModal,
    actionLogModalApi,
    AddSensitiveMaterialsToTFModal,
    addSensitiveMaterialsToTFModalApi,
  },
] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [
        ['maintainTime', ['startDate', 'endDate'], 'YYYY-MM-DD'],
      ],
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),

    gridOptions: deepMerge(gridDefaultOptions, {
      radioConfig: {
        highlight: false,
      },
      checkboxConfig: {
        highlight: true,
      },
      proxyConfig: {
        autoLoad: true,
      },
    }),
  },
  {
    gridColumns: [
      {
        title: '多选',
        type: 'checkbox',
        width: 50,
        align: 'center',
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'isActive',
        minWidth: 110,
        sortable: true,
        title: '状态',
        formatter({ row: { isActive } }: any) {
          return isActive ? (isActive === 'Y' ? '启用' : '停用') : '';
        },
      },
      {
        field: 'productName',
        minWidth: 130,
        sortable: true,
        title: '产品名称',
      },
      {
        field: 'productSpec',
        minWidth: 130,
        sortable: true,
        title: '规格型号',
      },
      {
        field: 'brandName',
        minWidth: 100,
        sortable: true,
        title: '品牌',
      },
      {
        field: 'manufacturerName',
        minWidth: 150,
        sortable: true,
        title: '厂家',
      },
      {
        field: 'DefaultSupplier',
        minWidth: 150,
        sortable: true,
        title: '默认供应商',
      },
      {
        field: 'createName',
        minWidth: 110,
        sortable: true,
        title: '维护人',
      },
      {
        field: 'created',
        minWidth: 150,
        sortable: true,
        title: '维护时间',
      },
      // {
      //   align: 'center',
      //   field: 'action',
      //   slots: { default: 'action' },
      //   fixed: 'right',
      //   headerAlign: 'center',
      //   showOverflow: false,
      //   title: '操作',
      //   width: 100,
      // },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'maintainTime',
        label: '维护时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ],
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            options: [
              { value: '', label: '全部' },
              { value: 'Y', label: '启用' },
              { value: 'N', label: '停用' },
            ],
            placeholder: '请选择状态',
            paginate: false,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: false,
          };
        },
        defaultValue: '',
        fieldName: 'isActive',
        label: '状态',
      },
      {
        component: 'Input',
        fieldName: 'productName',
        label: '物资关键词',
        componentProps: {
          placeholder: '请输入产品名称/规格型号',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/vendor.do',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: false,
            placeholder: '请选择供应商',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            onChange(val: any, option: any) {
              console.warn('vendorId', val, option);
              vendorIds.value = val;
              if (val && val.includes('')) {
                ChcGridApi.formApi?.setFieldValue('vendorId', ['']);
              }
            },
            mode: 'multiple',
            maxTagCount: 2,
            maxTagPlaceholder(omittedValues: any[]) {
              console.warn('omittedValues', omittedValues);
              const labels = omittedValues.map((item) => item.label);
              const tooltipLabel = labels.join('、');
              return h(
                Tooltip,
                { title: tooltipLabel },
                {
                  default: () => h('span', {}, `+ ${omittedValues.length}`),
                },
              );
            },
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        defaultValue: [],
        fieldName: 'vendorId',
        label: '供应商',
      },
    ],
    id: 'sensitiveMaterialsSettingGrid',
    queryUrl: '/aptAction/queryProduct',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      const newParams = { ...params };
      // if (
      //   newParams.vendorId &&
      //   Array.isArray(newParams.vendorId) &&
      //   newParams.vendorId.length > 0
      // ) {
      //   newParams.vendorId = newParams.vendorId.includes('')
      //     ? undefined
      //     : newParams.vendorId.join(',');
      // }
      if (vendorIds.value.length > 0) {
        newParams.vendorId = vendorIds.value.includes('')
          ? undefined
          : vendorIds.value.join(',');
      }
      console.warn('beforeFetchFn:', newParams);
      return newParams;
    },
    afterFetchFn: (params) => {
      const rows =
        params.data?.map((item: any) => {
          return {
            ...item,
          };
        }) || [];

      return {
        ...params,
        records: rows,
      };
    },
    customModals: {
      'ActionLogModal-actionLogModalApi': {
        class: 'w-[800px]',
        closable: true,
        // 连接抽离的组件
        connectedComponent: actionLogModalComp,
        draggable: true,
      },
      'AddSensitiveMaterialsToTFModal-addSensitiveMaterialsToTFModalApi': {
        class: 'w-[800px]',
        closable: true,
        // 连接抽离的组件
        connectedComponent: addSensitiveMaterialsToTFComp,
        draggable: true,
      },
    },
  },
);
// const handleView = () => {
//   headerTabs.value[3]!.disabled = false;
//   currentTab.value = 3;
// };

// 新建
const handleAdd = () => {
  addSensitiveMaterialsToTFModalApi
    ?.setData({
      callback: () => {
        ChcGridApi.formApi.getValues().then((res: any) => {
          console.warn('handleQuery', res);
          ChcGridApi.query({ ...res });
        });
      },
    })
    .open();
};

// 编辑
// const handleEdit = (scope: any) => {
//   console.warn('handleEdit', scope);
// };

// 操作记录
const handleDetail = (scope: any) => {
  console.warn('handleDetail', scope);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId || undefined,
      orderPlanLineId: scope.row?.orderPlanLineId || undefined,
    })
    .open();
};

// 启用
const handleApprove = () => {
  console.warn('handleApprove');
  const selectedRows: TableDataItem[] = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  // 检查选中的是否已经存在启用状态，有则提示用户
  const isEnabled = selectedRows.some(
    (row: TableDataItem) => row.isActive === 'Y',
  );
  if (isEnabled) {
    message.warning('存在已启用的记录，请重新选择');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: '是否启用勾选的敏感物资目录？',
    onOk: async () => {
      try {
        const ids = selectedRows.map((row: any) => row.id);
        const params = {
          ids: ids.join(','),
        };
        await updateMaterialsStart(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('操作成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('操作失败');
      }
    },
  });
};

// 停用
const handleCancel = () => {
  console.warn('handleCancel');
  // 先检查是否有选中的行数据
  const selectedRows: TableDataItem[] = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  // 检查选中的是否已经存在停用状态，有则提示用户
  const isDisabled = selectedRows.some(
    (row: TableDataItem) => row.isActive === 'N',
  );
  if (isDisabled) {
    message.warning('存在已停用的记录，请重新选择');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: '是否停用勾选的敏感物资目录？',
    onOk: async () => {
      try {
        const ids = selectedRows.map((row: any) => row.id);
        const params = {
          ids: ids.join(','),
        };
        await updateMaterialsStatusStop(params)
          .then((res) => {
            if (res && res.success) {
              ChcGridApi.formApi.getValues().then((resData: any) => {
                console.warn('getValues', resData);
                ChcGridApi.query({ ...resData });
              });
              message.success('操作成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('操作失败');
      }
    },
  });
};

onMounted(() => {
  ChcGridApi.formApi.getValues().then((res: any) => {
    ChcGridApi.query({ ...res });
  });
});
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <AddSensitiveMaterialsToTFModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleAdd"
          class="mr-[0.5rem]"
          data-testid="button_handleAdd"
        >
          新 建
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button type="primary" class="mr-[0.5rem]" @click="handleApprove">
          启用
          <template #icon>
            <SvgSaveIcon />
          </template>
        </Button>
        <Button type="primary" danger class="mr-[0.5rem]" @click="handleCancel">
          停用
          <template #icon>
            <SvgCloseIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
        <!-- <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleEdit(scope)"
          :disabled="scope.row.isActive === 'N'"
          :data-testid="`button_onEdit_${scope.rowIndex}`"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button> -->
        <Button
          v-if="false"
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleDetail(scope)"
          disabled
          :data-testid="`button_onDetail_${scope.rowIndex}`"
        >
          操作记录
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </ChcGrid>
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
  /* visibility: hidden; */
  display: none;
}
</style>

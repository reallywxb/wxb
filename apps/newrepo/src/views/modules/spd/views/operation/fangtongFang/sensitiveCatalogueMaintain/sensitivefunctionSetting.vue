<script setup lang="ts">
// import { useVbenModal } from '@vben/common-ui';
import type { ActionMenuTable } from './api';

import { onMounted, ref, toRaw } from 'vue';

import {
  AddActionIcon,
  EditActionIcon,
  IconfontBasicView,
  SvgCloseIcon,
  SvgSaveIcon,
} from '@vben/chc-icons';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { updateStart, updateStop } from './api';
import actionLogModalComp from './modals/actionLogModal.vue';
import addSensitiveFunctionToTFComp from './modals/addSensitiveFunctionToTF.vue';
import { commonFormOptions, viewFormOptions } from './options';

const extParams = ref<{}>({});

const handleFormSubmit = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  ChcGridApi.formApi.setLatestSubmissionValues(toRaw(formValues));
  ChcGridApi.query(formValues);
  // const data = await getMockTableData();
  // ChcGridApi.grid.reloadData(data);
};

const [
  ChcGrid,
  ChcGridApi,
  {
    ActionLogModal,
    actionLogModalApi,
    AddSensitiveFunctionToTFModal,
    addSensitiveFunctionToTFModalApi,
  },
] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      handleSubmit: handleFormSubmit,
      fieldMappingTime: [
        ['createTime', ['startDate', 'endDate'], 'YYYY-MM-DD'],
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
        // highlight: true,
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
        field: 'menuName',
        minWidth: 110,
        sortable: true,
        title: '菜单名称',
      },
      {
        field: 'operation',
        minWidth: 130,
        sortable: true,
        title: '功能类型',
        formatter({ row: { operation } }: any) {
          if (!operation) {
            return '';
          }
          const operationMapping = {
            query: '查询',
            export: '导出',
            print: '打印',
          };
          const operationArr = (operation && operation.split(',')) || [];
          return operationArr
            .map(
              (item: string) =>
                operationMapping[item as keyof typeof operationMapping] || '',
            )
            .join(',');
        },
      },
      {
        field: 'createName',
        minWidth: 100,
        sortable: true,
        title: '创建人',
      },
      {
        field: 'created',
        minWidth: 150,
        sortable: true,
        title: '创建时间',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 100,
      },
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'createTime',
        label: '创建时间',
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
            // autoChooseFirstOption: true,
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
        fieldName: 'menuName',
        label: '菜单名称',
        componentProps: {
          placeholder: '请输入菜单名称',
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            // 如果选择了全部，其他项都不应该被选择
            mode: 'multiple',
            placeholder: '请选择',
            showChooseAll: '',
            maxTagCount: 3,
            allowClear: true,
            paginate: false,
            options: [
              { value: '', label: '全部' },
              { value: 'query', label: '查询' },
              { value: 'print', label: '打印' },
              { value: 'export', label: '导出' },
            ],
            onChange(val: any) {
              // 如果选择了全部
              if (val.includes('')) {
                ChcGridApi.formApi?.setFieldValue('operation', ['']);
              }
            },
          };
        },
        defaultValue: [],
        fieldName: 'operation',
        label: '功能类型',
      },
    ],
    id: 'sensitiveFunctionSettingGrid',
    queryUrl: '/aptAction/queryMenu',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      const newParams = { ...params };
      // if (
      //   newParams.operation &&
      //   Array.isArray(newParams.operation) &&
      //   newParams.operation.length > 0
      // ) {
      //   newParams.operation = newParams.operation.includes('')
      //     ? undefined
      //     : newParams.operation.map((str: string) => `'${str}'`).join(',');
      // }
      if (
        newParams.operation &&
        Array.isArray(newParams.operation) &&
        newParams.operation.length > 0
      ) {
        newParams.operation = newParams.operation.includes('')
          ? undefined
          : newParams.operation.join(',');
      }

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
      'AddSensitiveFunctionToTFModal-addSensitiveFunctionToTFModalApi': {
        class: 'w-[800px]',
        closable: true,
        // 连接抽离的组件
        connectedComponent: addSensitiveFunctionToTFComp,
        draggable: true,
      },
    },
  },
);

// 查询
const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((res: any) => {
    console.warn('handleQuery', res);
    ChcGridApi.query({ ...res });
  });
};

// 新建
const handleAdd = async () => {
  const formData = await ChcGridApi.formApi.getValues();
  const operation = formData.operation.includes('')
    ? ''
    : formData.operation.join(',');
  addSensitiveFunctionToTFModalApi
    ?.setData({
      type: 'ADD',
      operation,
      callback: () => {
        handleQuery();
      },
    })
    .open();
};

// 编辑
const handleEdit = (scope: any) => {
  addSensitiveFunctionToTFModalApi
    ?.setData({
      type: 'EDIT',
      operation: scope.row?.operation || '',
      menuId: scope.row?.menuId, // 用于回显选中的菜单
      callback: () => {
        handleQuery();
      },
    })
    .open();
};

// 操作记录
// const [ActionLogModal, actionLogModalApi] = useVbenModal({
//   connectedComponent: actionLogModal,
// });

const handleDetail = (scope: any) => {
  console.warn('handleDetail', scope);
  actionLogModalApi!
    .setData({
      warehouseId: scope.row?.warehouseId || 'test123456',
      orderPlanLineId: scope.row?.orderPlanLineId || 'lineId123456',
    })
    .open();
};

// 启用
const handleApprove = () => {
  const selectedRows =
    ChcGridApi.grid.getCheckboxRecords() as ActionMenuTable[];
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  // 检查选中的是否已经存在启用状态，有则提示用户
  const isEnabled = selectedRows.some(
    (row: ActionMenuTable) => row.isActive === 'Y',
  );
  if (isEnabled) {
    message.warning('存在已启用的记录，请重新选择');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: '是否启用勾选的敏感功能目录？',
    onOk: async () => {
      try {
        const ids = selectedRows.map((row: ActionMenuTable) => row.id);
        const params = {
          ids: ids.join(','),
        };
        await updateStart(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('启用', res);
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
  const selectedRows =
    ChcGridApi.grid.getCheckboxRecords() as ActionMenuTable[];
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  // 检查选中的是否已经存在停用状态，有则提示用户
  const isDisabled = selectedRows.some(
    (row: ActionMenuTable) => row.isActive === 'N',
  );
  if (isDisabled) {
    message.warning('存在已停用的记录，请重新选择');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: '是否停用勾选的敏感功能目录？',
    onOk: async () => {
      try {
        const ids = selectedRows.map((row: ActionMenuTable) => row.id);
        const params = {
          ids: ids.join(','),
        };
        await updateStop(params)
          .then((res) => {
            if (res && res.success) {
              console.warn('禁用', res);
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
  handleQuery();
});
</script>
<template>
  <div class="h-full">
    <ActionLogModal />
    <AddSensitiveFunctionToTFModal />
    <ChcGrid>
      <template #toolbar-actions>
        <!-- <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export_collectSearch"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button> -->
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
        <Button
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
        </Button>
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

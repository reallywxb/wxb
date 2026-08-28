<script setup lang="ts">
import type { PersonRow } from './api';

import { onMounted, ref } from 'vue';

import {
  AddActionIcon,
  IconfontBasicView,
  SvgCloseIcon,
  SvgSaveIcon,
} from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { updatePersonStart, updatePersonStop } from './api';
import actionLogModalComp from './modals/actionLogModal.vue';
import addSensitivePersonToTFComp from './modals/addSensitivePersonToTF.vue';
import { commonFormOptions, viewFormOptions } from './options';

const extParams = ref<{}>({});
// const isFirstLoaded = ref(false);

const [AddSensitivePersonToTFModal, addSensitivePersonToTFModalApi] =
  useVbenModal({
    connectedComponent: addSensitivePersonToTFComp,
    draggable: true,
  });

const [ChcGrid, ChcGridApi, { ActionLogModal, actionLogModalApi }] = useSpdGrid(
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
        title: '',
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
        field: 'roleName',
        minWidth: 200,
        sortable: true,
        title: '角色',
      },
      {
        field: 'personName',
        minWidth: 130,
        sortable: true,
        title: '姓名',
      },
      {
        field: 'personCode',
        minWidth: 130,
        sortable: true,
        title: '登录名称',
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
      // {
      //   component: 'ChcSelect',
      //   componentProps: () => {
      //     return {
      //       autoChooseFirstOption: false,
      //       mode: 'multiple',
      //       maxTagCount: 1,
      //       options: [
      //         { value: '', label: '全部' },
      //         { value: 'ROLE_ADMIN', label: '管理员' },
      //         { value: 'ROLE_USER', label: '普通用户' },
      //         { value: 'ROLE_GUEST', label: '访客' },
      //         { value: 'ROLE_TEST', label: '测试' },
      //       ],
      //       placeholder: '请选择角色',
      //       paginate: false,
      //       filterByFrontEnd: true,
      //       showChooseAll: '',
      //       immediate: false,
      //     };
      //   },
      //   defaultValue: [],
      //   fieldName: 'roleName',
      //   label: '角色',
      // },
      {
        component: 'Input',
        fieldName: 'roleName',
        label: '角色',
        componentProps: {
          placeholder: '请输入角色名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'userName',
        label: '用户',
        componentProps: {
          placeholder: '请输入姓名/登录名称',
        },
      },
    ],
    id: 'sensitivePersonnelSettingGrid',
    queryUrl: '/aptAction/queryPerson',
    commonFormOptions,
    viewFormOptions,
    showCustomBtn: true,
    showZoomBtn: true,
    tableSearchExtraParams: extParams.value,
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      return params;
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
    },
  },
);
// 新建
const handleAddDifferentType = (type: 'account' | 'role') => {
  console.warn('handleAddDifferentType', type);
  addSensitivePersonToTFModalApi!
    .setData({
      type,
      callback: () => {
        ChcGridApi.formApi.getValues().then((res: any) => {
          console.warn('handleQuery11', res);
          ChcGridApi.query({ ...res });
        });
      },
    })
    .open();
};

// const handleBatchChoose = async (records: any[]) => {
//   blackList.value = [
//     ...blackList.value,
//     ...records.map((item) => item[ROWKEYFIELD]),
//   ];
//   const formValue = await chcGridApi.formApi.getValues();
//   let newRow = null;
//   for (const [i, record__] of records.entries()) {
//     const response = await getOrderPlanStorage({
//       warehouseId: formValue.warehouseId,
//       productId: record__.productId,
//     });
//     const record = {
//       ...record__,
//       ...response,
//       isGift: 'N',
//     };
//     if (i === 0) {
//       const midRow = await chcGridApi.grid.insertAt(record, -1);
//       newRow = midRow.row;
//     } else {
//       await chcGridApi.grid.insertAt(record, -1);
//     }
//   }
//   chcGridApi.grid.setEditRow(newRow, true);
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
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  // 检查选中的是否已经存在启用状态，有则提示用户
  const isEnabled = selectedRows.some((row: PersonRow) => row.isActive === 'Y');
  if (isEnabled) {
    message.warning('存在已启用的记录，请重新选择');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: '是否启用勾选的敏感人员目录？',
    // centered: true,
    onOk: async () => {
      try {
        const ids = selectedRows.map((row: PersonRow) => row.id);
        const params = {
          ids: ids.join(','),
        };
        await updatePersonStart(params)
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
  const selectedRows = ChcGridApi.grid.getCheckboxRecords();
  if (selectedRows.length === 0) {
    message.warning('请选择记录');
    return;
  }
  // 检查选中的是否已经存在停用状态，有则提示用户
  const isDisabled = selectedRows.some(
    (row: PersonRow) => row.isActive === 'N',
  );
  if (isDisabled) {
    message.warning('存在已停用的记录，请重新选择');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提交',
    content: '是否停用勾选的敏感人员目录？',
    // centered: true,
    onOk: async () => {
      try {
        const ids = selectedRows.map((row: PersonRow) => row.id);
        const params = {
          ids: ids.join(','),
        };
        await updatePersonStop(params)
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
    <AddSensitivePersonToTFModal />
    <ChcGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddDifferentType('role')"
          data-testid="button_handleAddRole"
        >
          按角色新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddDifferentType('account')"
          data-testid="button_handleAddAccount"
        >
          按账号新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleApprove"
          data-testid="button_handleApprove"
        >
          启用
          <template #icon>
            <SvgSaveIcon />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          class="mr-[0.5rem]"
          @click="handleCancel"
          data-testid="button_handleCancel"
        >
          停用
          <template #icon>
            <SvgCloseIcon />
          </template>
        </Button>
      </template>
      <template #action="scope">
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
</style>

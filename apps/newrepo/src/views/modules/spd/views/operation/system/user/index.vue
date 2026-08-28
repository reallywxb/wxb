<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { useRoute } from 'vue-router';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  ExportActionIcon,
  UploadActionIcon,
  UnlockActionIcon,
} from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  importModalDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import addModalUI from './modals/addModal.vue';
import batchEditModalUI from './modals/batchEditModal.vue';
import departmentAccessModalUI from './modals/departmentAccessModal.vue';
import ImportModalComp from './modals/importModal.vue';
import setPasswordModalUI from './modals/setPasswordModal.vue';
import userActiveModalUI from './modals/userActiveModal.vue';
import warehouseAccessModalUI from './modals/warehouseAccessModal.vue';

import { unbindUser } from './api';
// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');
const route = useRoute();
const userStore = useUserStore();
const orgID = route.query.AD_Org_ID;

const extParams = ref<any>({});

const [addModal, addModalApi] = useVbenModal({
  connectedComponent: addModalUI,
});

const [setPasswordModal, setPasswordModalApi] = useVbenModal({
  connectedComponent: setPasswordModalUI,
});

const [userActiveModal, userActiveModalApi] = useVbenModal({
  connectedComponent: userActiveModalUI,
});

const [warehouseAccessModal, warehouseAccessModalApi] = useVbenModal({
  connectedComponent: warehouseAccessModalUI,
});

const [departmentAccessModal, departmentAccessModalApi] = useVbenModal({
  connectedComponent: departmentAccessModalUI,
});

const [batchEditModal, batchEditModalApi] = useVbenModal({
  connectedComponent: batchEditModalUI,
});

// 父表
const [ChcGrid, ChcGridApi, { handleExport, ImportModal, importModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        compact: true,
        layout: 'horizontal',
        showCollapseButton: false,
        submitButtonOptions: {
          content: '查询',
        },
        commonConfig: {
          labelClass: 'w-[90px]',
        },
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        stripe: true,
        proxyConfig: {
          // autoLoad: true,
        },
        checkboxConfig: {
          highlight: true,
        },
        radioConfig: {
          trigger: 'row',
          highlight: true,
        },
        pagerConfig: {
          enabled: true,
        },
        cellStyle(scope: any) {
          if (scope.row.IsActive === 'N') {
            return {
              color: 'gray',
            };
          }
        },
      }),
    },
    {
      id: 'parent',
      queryUrl: '/userBaseHandleAction/query.do',
      gridColumns: [
        { type: 'checkbox', title: '', width: 40, align: 'center' },
        {
          type: 'radio',
          width: 0,
          fixed: 'left',
          visible: false,
        },
        { title: '序号', type: 'seq', width: 50, align: 'center' },

        {
          field: 'AD_User_ID',
          title: 'AD_User_ID',
          visible: false,
        },
        {
          field: 'RealName',
          title: '用户姓名',
          minWidth: '120px',
          sortable: true,
        },
        {
          field: 'Name',
          title: '登录名称',
          minWidth: '168px',
          sortable: true,
        },
        {
          field: 'UserCode',
          title: '员工号',
          minWidth: '168px',
          sortable: true,
        },
        {
          field: 'RoleName',
          title: '角色名称',
          minWidth: '200px',
        },
        {
          field: 'IDCard',
          title: '身份证号',
          minWidth: '168px',
        },
        {
          field: 'Phone',
          title: '手机号码',
          minWidth: '168px',
        },
        {
          field: 'UserTypeName',
          title: '用户类型',
          minWidth: '90px',
        },
        {
          field: 'DefaultDepartmentName',
          title: '默认部门',
          minWidth: '168px',
        },
        {
          field: 'OrgName',
          title: '机构名称',
          minWidth: '168px',
        },
        {
          field: 'IsActive',
          title: '是否有效',
          width: '90',
          // format: render
          formatter({ row }: any) {
            return row.IsActive === 'Y' ? '是' : '否';
          },
        },
        {
          field: 'Description',
          title: '描述',
          width: '168px',
        },
        {
          align: 'center',
          field: 'action',
          slots: { default: 'action' },
          fixed: 'right',
          headerAlign: 'center',
          showOverflow: false,
          title: '操作',
          width: 150,
        },
      ],
      formSchema: [
        {
          component: 'Input',
          fieldName: 'realName',
          label: '用户名',
          componentProps: {
            placeholder: '请输入用户名',
          },
        },
        {
          component: 'ChcSelect',
          componentProps: () => {
            return {
              // autoChooseFirstOption: true,
              options: [
                { value: '', label: '全选' },
                { value: 'Y', label: '是' },
                { value: 'N', label: '否' },
              ],
              placeholder: '',
              paginate: false,
              filterByFrontEnd: true,
              showChooseAll: '',
              immediate: true,
            };
          },
          defaultValue: 'Y',
          fieldName: 'active',
          label: '是否有效',
        },
      ],

      tableSearchExtraParams: extParams.value,
      gridEvents: {
        radioChange: ({ row }: { row: any }) => {
          selectRow.value = row && row.AD_Org_ID ? row : {};
        },
      },
      customModals: {
        'ImportModal-importModalApi': deepMerge(importModalDefaultOptions, {
          // 连接抽离的组件
          connectedComponent: ImportModalComp,
        }),
      },
      afterFetchFn: (params) => {
        const rows =
          params.rows?.map((item: any) => {
            return {
              ...item,
            };
          }) || [];

        return {
          ...params,
          records: rows,
        };
      },
      beforeFetchFn: (params) => {
        return {
          ...params,

          orgID: orgID || undefined,
        };
      },
    },
  );
const selectRow = ref<any>({});

onMounted(() => {
  if (orgID) {
    // extParams.value.orgID = orgID;
    ChcGridApi.formApi.setValues({
      active: '',
    });
  }
  handleQuery();
});

const handleEdit = (scope: any) => {
  addModalApi
    .setData({ ...scope.row, isConsortium: userStore.userInfo?.isConsortium })
    .open();
};

const handleAdd = () => {
  addModalApi
    .setData({ isConsortium: userStore.userInfo?.isConsortium })
    .open();
};

const handleSetPassword = () => {
  if (!selectRow.value.AD_User_ID) {
    message.error('请选择一条记录');
    return;
  }
  setPasswordModalApi.setData(selectRow.value).open();
};

const handleUserActive = () => {
  if (!selectRow.value.AD_User_ID) {
    message.error('请选择一条记录');
    return;
  }
  userActiveModalApi.setData(selectRow.value).open();
};

const handleWarehouseAccess = () => {
  if (!selectRow.value.AD_User_ID) {
    message.error('请选择一条记录');
    return;
  }
  warehouseAccessModalApi.setData(selectRow.value).open();
};

const handleDepartmentAccess = () => {
  if (!selectRow.value.AD_User_ID) {
    message.error('请选择一条记录');
    return;
  }
  departmentAccessModalApi.setData(selectRow.value).open();
};

const handleBatchEdit = () => {
  const checkedRows = ChcGridApi.grid.getCheckboxRecords() || [];
  if (!checkedRows.length) {
    message.error('请选择要修改的记录');
    return;
  }
  batchEditModalApi.setData({ selectedUsers: checkedRows }).open();
};

const handleImport = () => {
  importModalApi?.open();
};
const handleUnlock = (scope: any) => {
  if (userStore.userInfo?.userType !== 'system') {
    message.warn('只有管理员角色才能解锁，请联系管理员！');
    return;
  }
  console.warn('解锁', scope.row);
  const params: any = {
    userId: scope.row.AD_User_ID,
  };
  // userBaseHandleAction/unbindUser
  unbindUser(params).then((res: any) => {
    if (res && res.success) {
      message.success({
        content: res.msg || `成功`,
      });
    } else {
      message.error('失败');
    }
  });
};
const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <addModal @close="handleQuery" />
    <setPasswordModal @close="handleQuery" />
    <userActiveModal @close="handleQuery" />
    <warehouseAccessModal @close="handleQuery" />
    <departmentAccessModal @close="handleQuery" />
    <batchEditModal @close="handleQuery" />
    <ImportModal @close="handleQuery" />
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleAdd"
            class="mr-[0.5rem]"
            data-testid="button_add"
          >
            新 建
            <template #icon>
              <AddActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleSetPassword"
            data-testid="button_reset_password"
          >
            密码重置
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleUserActive"
            data-testid="button_enable_disable"
          >
            启用/停用
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleWarehouseAccess"
            data-testid="button_warehouse_access"
          >
            仓库权限
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleDepartmentAccess"
            data-testid="button_department_access"
          >
            科室病区权限
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            class="mr-[0.5rem]"
            @click="handleBatchEdit"
            data-testid="button_batch_edit"
          >
            批量修改
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            @click="handleImport"
            class="mr-[0.5rem]"
            data-testid="button_import"
          >
            导 入
            <template #icon>
              <UploadActionIcon />
            </template>
          </Button>
          <Button
            type="primary"
            @click="handleExport"
            class="mr-[0.5rem]"
            data-testid="button_export"
          >
            导 出
            <template #icon>
              <ExportActionIcon />
            </template>
          </Button>
        </template>
        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleEdit(scope)"
            :data-testid="`button_edit_${scope.rowIndex}`"
          >
            编辑
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleUnlock(scope)"
            :data-testid="`button_unlock_${scope.rowIndex}`"
          >
            解锁
            <template #icon>
              <UnlockActionIcon />
            </template>
          </Button>
        </template>
      </ChcGrid>
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

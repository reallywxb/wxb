<script lang="ts" setup>
import type { ExtendedModalApi } from '@vben/common-ui';
import type { ExtendedVxeGridApi } from '@vben/plugins/src/vxe-table/types';
import RoleReportModal from './modals/permissionRepGridModal.vue';
import { onMounted, ref } from 'vue';
// import { useRoute } from 'vue-router';
import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Modal } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import RolePowerModal from '#/views/modules/sys/views/common/modals/permissionGridModal.vue';
import { saveMenuAuthTree } from '#/views/modules/sys/views/role/api/role';

import { saveRoleReports, stopRole } from './api';
import addModalUI from './modals/addModal.vue';
import pclAccessModalUI from './modals/pclAccessModal.vue';

// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');
const route = useRoute();
const orgId = route.query.AD_Org_ID;
const [addModal, addModalApi] = useVbenModal({
  connectedComponent: addModalUI,
});

const rolePowerModalRef = ref<
  | (Record<string, any> & {
      gridApi?: ExtendedVxeGridApi;
      modalApi: ExtendedModalApi;
    })
  | undefined
>();

const roleReportModalRef = ref<
  | (Record<string, any> & {
      gridApi?: ExtendedVxeGridApi;
      modalApi: ExtendedModalApi;
    })
  | undefined
>();
// const [rolePowerModal, rolePowerModalApi] = useVbenModal({
//   connectedComponent: rolePowerModalUI,
// });

const [pclAccessModal, pclAccessModalApi] = useVbenModal({
  connectedComponent: pclAccessModalUI,
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
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
        autoLoad: true,
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
    queryUrl: '/accessBaseHandleAction/allRoleList.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      { field: 'name', title: '角色名称', width: '200px', sortable: true },
      { field: 'description', title: '描述', sortable: true },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 420,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '角色名称',
        componentProps: {
          placeholder: '请输入用户名',
        },
      },
    ],

    gridEvents: {
      radioChange: ({ row }: { row: any }) => {
        selectRow.value = row && row.AD_Org_ID ? row : {};
      },
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
        isActive: params.isActive ? 'Y' : undefined,
        orgId: orgId || undefined,
      };
    },
  },
);
const selectRow = ref<any>({});

onMounted(() => {
  handleQuery();
});

const handleEdit = (scope: any) => {
  addModalApi.setData(scope.row).open();
};

const handlerRolePower = ({ id }: any) => {
  rolePowerModalRef.value?.modalApi
    .setData({
      title: '权限设置',
      data: {
        id,
      },
      submit: async (params: Array<any>) => saveMenuAuthTree(id, params),
    })
    .open();
};

const handlerRoleReport = ({ id }: any) => {
  roleReportModalRef.value?.modalApi
    .setData({
      title: '报表权限',
      data: {
        id,
      },
      submit: async (params: { reportPaths: string[] }) => {
        // console.log('params.reportPaths', params.reportPaths);
        saveRoleReports({
          roleId: id,
          reportPaths: params.reportPaths.join(','),
        });
      },
    })
    .open();
};

const handlerPclAccess = (scope: any) => {
  pclAccessModalApi.setData(scope.row).open();
};

const handleAdd = () => {
  addModalApi.setData({}).open();
};

const handleDelete = (scope: any) => {
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      stopRole({
        id: scope.row.id,
      }).then(() => {
        message.success('删除成功');
        handleQuery();
      });
    },
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
    <RolePowerModal :after-submit="ChcGridApi.reload" ref="rolePowerModalRef" />
    <pclAccessModal @close="handleQuery" />

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
            @click="handlerRolePower(scope.row)"
            :data-testid="`button_menu_${scope.rowIndex}`"
          >
            菜单权限
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handlerRoleReport(scope.row)"
            :data-testid="`button_permission_${scope.rowIndex}`"
          >
            报表权限
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handlerPclAccess(scope)"
            :data-testid="`button_product_group_${scope.rowIndex}`"
          >
            商品组权限
            <template #icon>
              <EditActionIcon />
            </template>
          </Button>
          <Button
            ghost
            danger
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleDelete(scope)"
            :data-testid="`button_delete_${scope.rowIndex}`"
          >
            删除
            <template #icon>
              <SvgDeleteIcon />
            </template>
          </Button>
        </template>
      </ChcGrid>
    </div>
    <!-- AI-GENERATED-BEGIN -->
    <!-- @date 2026-06-30 -->
    <!-- @prompt 添加报表权限弹窗组件 -->
    <!-- @description 添加RolePowerModal组件，用于设置用户的权限信息 -->
    <RoleReportModal ref="roleReportModalRef" />
    <!-- AI-GENERATED-END -->
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

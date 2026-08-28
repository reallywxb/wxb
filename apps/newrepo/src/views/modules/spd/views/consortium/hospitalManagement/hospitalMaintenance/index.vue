<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon, SvgGearIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

// import { activeServer } from './api';
import typeModalUI from './modals/addAndEditFormModal.vue';
import hospitalConfigModalUI from './modals/hospitalConfigModal.vue';
import { queryHospitalSetting } from './api';

// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');

const extParams = ref<any>({});

const [typeModal, typeModalApi] = useVbenModal({
  connectedComponent: typeModalUI,
});

const [hospitalConfigModal, hospitalConfigModalApi] = useVbenModal({
  connectedComponent: hospitalConfigModalUI,
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
        labelClass: 'w-[fit-content]',
        // labelClass: 'w-[90px]',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
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
      // editConfig: {
      //   enabled: true,
      //   mode: 'row',
      //   trigger: 'click',
      //   showStatus: false,
      //   showIcon: false,
      //   autoClear: true,
      // },
    }),
  },
  {
    id: 'hospitalMaintenanceGrid',
    queryUrl: '/hospitalAction/query.do',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'AD_Server_ID',
        title: 'AD_Server_ID',
        visible: false,
        sortable: true,
      },
      {
        field: 'AD_Client_ID',
        title: 'AD_Client_ID',
        visible: false,
        sortable: true,
      },
      {
        field: 'AD_Org_ID',
        title: 'AD_Org_ID',
        visible: false,
        sortable: true,
      },
      {
        field: 'hospitalId',
        title: '医院编码',
        width: '120',
        sortable: true,
      },
      {
        field: 'hospitalName',
        title: '医院名称',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'shortName',
        title: '医院简称',
        minWidth: '120',
        sortable: true,
      },
      { field: 'contact', title: '联系人', minWidth: '80', sortable: true },
      {
        field: 'contactPhone',
        title: '联系方式',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'hospitalLogo',
        title: '医院logo',
        minWidth: '100',
        align: 'right',
        sortable: false,
        slots: { default: 'hospitalLogo' },
      },
      {
        field: 'adminUserName',
        title: '管理员登录账户',
        minWidth: '140',
        sortable: true,
      },
      {
        field: 'adminPassword',
        title: '密码',
        minWidth: '120',
        sortable: true,
        // slots: { default: 'adminPassword' },
      },
      {
        field: 'IsActive',
        title: '是否有效',
        align: 'center',
        width: '100',
        sortable: true,
        visible: false,
        // slots: { default: 'IsActive' },
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 170,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'hospitalName',
        label: '医院',
        componentProps: {
          placeholder: '请输入编码或名称',
          // suffix: 'search',
          onPressEnter: (e: any) => {
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            console.warn('回车触发===>', e);
            handleQuery();
          },
        },
        // renderComponentContent: () => ({
        //   suffix: () =>
        //     h(SearchActionIcon, {
        //       style: { cursor: 'pointer' },
        //       onClick: () => {
        //         console.warn('点击了商品搜索图标');
        //       },
        //     }),
        // }),
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {},
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
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
  },
);

const typeData = ref<any>({});

const handleEdit = (scope: any) => {
  typeData.value = scope.row;
  typeModalApi.setData(typeData.value).open();
};
const hospitalConfigData = ref<any>({});
const handleHospitalConfig = async (scope: any) => {
  const row = scope.row;
  try {
    const res = await queryHospitalSetting(row.id);
    hospitalConfigData.value = {
      ...row,
      ...res,
    };
    hospitalConfigModalApi.setData(hospitalConfigData.value).open();
  } catch (error) {
    console.error('查询医院配置失败:', error);
  }
};

const handleAdd = () => {
  typeData.value = {};
  typeModalApi.setData({ active: 'Y' }).open();
};

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};

// const handleActiveSwitchChange = (row: any, checked: string) => {
//   const params = {
//     ...row,
//     IsActive: checked,
//   };
//   activeServer(params).then((res: any) => {
//     if (res && res.success) {
//       message.success('操作成功');
//       handleQuery();
//     }
//   });
// };

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <typeModal :type-data="typeData" @close="handleQuery" />
    <hospitalConfigModal @close="handleQuery" />
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleAdd"
            class="mr-[0.5rem]"
            data-testid="button_onAdd"
          >
            新 建
            <template #icon>
              <AddActionIcon />
            </template>
          </Button>
        </template>
        <template #hospitalLogo="{ row }">
          <img :src="row.hospitalLogo" alt="" class="h-6 w-full object-cover" />
        </template>
        <!-- <template #adminPassword="{ row }">
          <InputPassword
            v-model:value="row.adminPassword"
            class="input-nostyle"
          />
        </template> -->
        <!-- <template #IsActive="{ row }">
          <Switch
            :checked="row.IsActive"
            @change="(checked: any) => handleActiveSwitchChange(row, checked)"
            checked-value="Y"
            checked-children="是"
            un-checked-value="N"
            un-checked-children="否"
          />
        </template> -->
        <template #action="scope">
          <Button
            ghost
            type="primary"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleEdit(scope)"
            :data-testid="`button_onEdit_${scope.rowIndex}`"
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
            @click="handleHospitalConfig(scope)"
            :data-testid="`button_onHospitalConfig_${scope.rowIndex}`"
          >
            医院配置
            <template #icon>
              <SvgGearIcon />
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

::v-deep(.input-nostyle) {
  cursor: default;
  background-color: transparent !important;
  border: none !important;

  .ant-input {
    pointer-events: none;
    background-color: transparent !important;
  }
}
</style>

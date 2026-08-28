<script lang="ts" setup>
import { onMounted, toRaw } from 'vue';

import { AddActionIcon, EditActionIcon, SvgGearIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { getSetting } from './api';
import addAndEditModalUI from './modals/addAndEditModal.vue';
import settingModalUI from './modals/settingModal.vue';

const [addAndEditModal, addAndEditModalApi] = useVbenModal({
  connectedComponent: addAndEditModalUI,
});

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
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: true,
      },
    }),
  },
  {
    id: 'medicalCommunityMaintenanceGrid',
    queryUrl: '/mcOrgAction/query.do',
    gridColumns: [
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'mcCode',
        title: '医共体编码',
        sortable: false,
      },
      { field: 'mcName', title: '医共体名称' },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 200,
      },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'mcName',
        label: '医共体',
        componentProps: {
          placeholder: '请输入编码或名称',
        },
      },
    ],
    tableSearchExtraParams: {},
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
      return params;
    },
  },
);

// 新增或者编辑
const handleAddOrEdit = (modalType: string, scope?: any) => {
  if (modalType === 'ADD') {
    addAndEditModalApi
      .setData({
        modalType,
        callback() {
          handleQuery();
        },
      })
      .open();
  } else if (modalType === 'EDIT' && scope) {
    const unProxyRow: any = toRaw(scope.row);
    addAndEditModalApi
      .setData({
        modalType,
        row: unProxyRow,
        callback() {
          handleQuery();
        },
      })
      .open();
  }
};
// 医共体配置按钮方法
const handleMedicalCommunityConfig = async (scope: any) => {
  try {
    const data = await getSetting(scope.row.id);
    settingModalApi
      .setData({
        MC_Organ_ID: scope.row.id,
        IsFilter_Black_V: data.IsFilter_Black_V || false,
        IsFilter_Doc_V: data.IsFilter_Doc_V || false,
        IsWarning_Doc_V: data.IsWarning_Doc_V || false,
        Warning_Level: data.Warning_Level || null,
        Warning_Days: Number(data.Warning_Days) || null,
        MC_Setting_ID: data.MC_Setting_ID,
      })
      .open();
  } catch (error) {
    console.error(error);
  }
};

const [SettingModal, settingModalApi] = useVbenModal({
  connectedComponent: settingModalUI,
});

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};

onMounted(() => {
  handleQuery();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <addAndEditModal />
    <SettingModal />
    <div class="h-full">
      <ChcGrid class="flex-1 overflow-hidden">
        <template #toolbar-actions>
          <Button
            type="primary"
            @click="handleAddOrEdit('ADD')"
            class="mr-[0.5rem]"
            data-testid="button_onAdd"
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
            @click="handleAddOrEdit('EDIT', scope)"
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
            @click="handleMedicalCommunityConfig(scope)"
            :data-testid="`button_onMedicalCommunityConfig_${scope.rowIndex}`"
          >
            医共体配置
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
</style>

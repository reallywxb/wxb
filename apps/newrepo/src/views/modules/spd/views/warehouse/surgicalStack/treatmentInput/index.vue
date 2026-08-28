<script lang="ts" setup>
import { onMounted, ref } from 'vue';
// import { useRoute } from 'vue-router';

import { AddActionIcon, EditActionIcon } from '@vben/chc-icons';
// import { useUserStore } from '@vben/stores';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import dayjs from 'dayjs';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import typeModalUI from './modals/typeModal.vue';

// const userStore: any = useUserStore();
// console.log(userStore.userInfo, 'userInfo');

const extParams = ref<any>({});

const [typeModal, typeModalApi] = useVbenModal({
  connectedComponent: typeModalUI,
});

// 父表
const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
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
    }),
  },
  {
    id: 'parent',
    queryUrl: '/treatmentAction/query.do?isSurgery=Y',
    gridColumns: [
      {
        type: 'radio',
        width: 0,
        fixed: 'left',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'surgicalTypeName',
        title: '术式类型',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'surgeryNo',
        title: '手术编号',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'adviceName',
        title: '医嘱名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'doctorOrderNo',
        title: '医嘱号',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'surgicalName',
        title: '手术名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'surgeryTime',
        title: '手术时间',
        minWidth: '180',
        sortable: true,
      },
      {
        field: 'patientName',
        title: '患者姓名',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'patientCode',
        title: '患者编码',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'diagnosis',
        title: '诊断',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'patientSex',
        title: '患者性别',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'patientAge',
        title: '患者年龄',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'siteTreatmentId',
        title: '医嘱流水号',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'patientVisitCode',
        title: '住院号',
        minWidth: '90',
        sortable: true,
      },
      {
        field: 'bedNo',
        title: '床号',
        minWidth: '60',
        sortable: true,
      },
      {
        field: 'patientPhoneNo',
        title: '患者电话',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'bpartnerName',
        title: '开单科室',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'applyBpartnerName',
        title: '执行科室',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'surgicalRoomName',

        title: '手术室',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'description',
        title: '备注',
        minWidth: '200',
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
        width: 100,
      },
      //  sortable: true,
    ],
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateOrdered',
        label: '手术时间',
        defaultValue: [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(-1, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'Input',
        fieldName: 'patientName',
        label: '患者',
        componentProps: {
          placeholder: '请输入患者',
        },
      },
      {
        component: 'Input',
        fieldName: 'adviceName',
        label: '医嘱名称',
        componentProps: {
          placeholder: '请输入医嘱名称',
        },
      },
      {
        component: 'Input',
        fieldName: 'doctorOrderNo',
        label: '医嘱号',
        componentProps: {
          placeholder: '请输入医嘱号',
        },
      },
      {
        component: 'Input',
        fieldName: 'surgeryNo',
        label: '手术编号',
        componentProps: {
          placeholder: '请输入手术编号',
        },
      },
      {
        component: 'Input',
        fieldName: 'surgicalName',
        label: '手术名称',
        componentProps: {
          placeholder: '请输入手术名称',
        },
      },
    ],
    tableSearchExtraParams: extParams.value,
    gridEvents: {},
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
      };
    },
  },
);

onMounted(() => {
  ChcGridApi.formApi.getValues().then(async (res: any) => {
    ChcGridApi.query(res);
  });
});

const typeData = ref<any>({});

const handleEdit = (scope: any) => {
  // currentTab.value = 1;
  typeData.value = scope.row;
  typeModalApi.setData(typeData.value).open();
};

const handleAdd = () => {
  typeData.value = {};
  typeModalApi.setData({}).open();
};

const handleQuery = () => {
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <typeModal :type-data="typeData" @close="handleQuery" />
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
          <!-- <Button
            danger
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            @click="handleCancel(scope)"
          >
            删除
          </Button> -->
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

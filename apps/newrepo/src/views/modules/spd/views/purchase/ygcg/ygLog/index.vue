<script lang="ts" setup>
import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { ExportActionIcon } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import { Button, message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

const route = useRoute();

const userStore = useUserStore();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {};
const page = urlParams?.page;
console.warn('urlParams', urlParams);
const isFirstLoaded = ref(false); // 是否已初次加载完
// AI-GENERATED-BEGIN
// @date 2026-07-16
// @prompt 创建响应式变量用于院区接口的hospitalId参数传递
// @description 创建extraParams响应式对象，用于动态传递hospitalId参数到院区接口
const departmentExtraParams = ref<{
  hospitalId?: number | string | undefined;
}>({
  hospitalId: '',
});
// AI-GENERATED-END

// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  setTimeout(() => {
    // 触发自动查询
    searchController.sign();
  }, 200);
  isFirstLoaded.value = true;
});
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});

const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      fieldMappingTime: [['dateRange', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'orderdetail',
    // api地址
    queryUrl: '/ygcgProductAction/queryOperator.do',
    gridColumns: [
      // {
      //   type: 'checkbox',
      //   width: 50,
      //   align: 'center',
      // },
      {
        type: 'seq',
        title: '序号',
        width: 50,
        align: 'center',
      },
      {
        field: 'orgName',
        title: '医院',
        // width: '160',
        sortable: false,
      },
      {
        field: 'business_id',
        title: '业务id',
        // width: '120',
        sortable: false,
      },
      {
        field: 'operationName',
        title: '操作类型',
        // width: '100',
        sortable: true,
      },
      {
        field: 'msgContent',
        title: '消息内容',
        // width: '200',
        sortable: false,
        formatter: ({ row }: any) => {
          return typeof row.msgContent === 'string'
            ? row.msgContent
            : JSON.stringify(row.msgContent, null, 2);
        },
      },
      {
        field: 'msgResult',
        title: '返回内容',
        // width: '200',
        sortable: false,
        formatter: ({ row }: any) => {
          return typeof row.msgResult === 'string'
            ? row.msgResult
            : JSON.stringify(row.msgResult, null, 2);
        },
      },
      {
        field: 'created',
        title: '操作时间',
        // width: '150',
        sortable: true,
      },
      {
        field: 'createdBy',
        title: '操作人',
        // width: '100',
        sortable: false,
      },
      // {
      //   field: 'isRate',
      //   title: '7002',
      //   width: '100',
      //   sortable: false,
      //   formatter: ({ row }: any) => {
      //     return row.isRate === 'Y' ? '已生成' : '未生成';
      //   },
      // },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'DateGroup',
        fieldName: 'dateRange',
        label: '操作时间',
        defaultValue: [
          // 2天前
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(2, 'day')
            .format('YYYY-MM-DD'),
        ],
        formItemClass: 'col-span-1',
      },
      {
        component: 'ChcSelect',
        fieldName: 'orgId',
        label: '医院',
        componentProps: () => {
          return {
            dictUrl: '/baseHandleAction/orgList.do',
            placeholder: '请选择医院',
            paginate: false,
            showChooseAll: false,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            autoChooseFirstOption: true,
            afterFetch(res: any) {
              return {
                ...res,
                rows: undefined,
                records: res.rows,
              };
            },
          };
        },
      },
      {
        component: 'ChcSelect',
        componentProps: () => {
          return {
            autoChooseFirstOption: false,
            dictUrl: '/baseHandleAction/refList.do?id=1001427',
            apiType: 'post',
            requestContentType: 'application/x-www-form-urlencoded',
            showSearch: true,
            placeholder: '请选择操作类型',
            paginate: false,
            allowClear: true,
            filterByFrontEnd: true,
            showChooseAll: '',
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            defaultValue: '',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        },
        fieldName: 'operation',
        labelClass: 'pl-2',
        label: '操作类型',
      },
    ],
    gridEvents: {},
    tableSearchExtraParams: {
      page,
    },
    showCustomBtn: true,
    showZoomBtn: true,
    afterFetchFn: (params: any) => {
      console.warn('afterFetchFn params', params);
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const handleOnlineRate = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleOnlineRate rows:', rows);
  console.warn('handleOnlineRate rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const distributedIds = rawRows.map((row: any) => row.distributedId).join(',');
  const params = {
    distributedId: distributedIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认操作吗?`,
    onOk: async () => {
      try {
        console.warn('handleOnlineRate params:', params);
        await requestFormClient
          .post('/ygcgProductAction/createRate.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChcGridApi.query();
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
const handleCHS = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleCHS rows:', rows);
  console.warn('handleCHS rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const distributedIds = rawRows.map((row: any) => row.distributedId).join(',');
  const params = {
    distributedId: distributedIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认操作吗?`,
    onOk: async () => {
      try {
        console.warn('handleCHS params:', params);
        await requestFormClient
          .post('/ygcgProductAction/create.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '操作成功');
            }
            ChcGridApi.query();
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
const handleRecive = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleRecive rows:', rows);
  console.warn('handleRecive rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const distributedIds = rawRows.map((row: any) => row.distributedId).join(',');
  const params = {
    distributedId: distributedIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认收货回传吗?`,
    onOk: async () => {
      try {
        console.warn('handleRecive params:', params);
        await requestFormClient
          .post('/ygcgProductAction/returnDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '收货回传成功');
            }
            ChcGridApi.query();
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
const handleMatch = async () => {
  const formValues = await ChcGridApi.formApi.getValues();
  if (!formValues.orgId) {
    return message.warning('请先选择医院再进行操作');
  }
  const rows = ChcGridApi.grid.getCheckboxRecords(true);
  const rawRows: any[] = toRaw(rows);
  console.warn('handleMatch rows:', rows);
  console.warn('handleMatch rawRow:', rawRows);
  if (isEmpty(rawRows)) {
    message.warning('请先选择数据');
    return;
  }
  const distributedIds = rawRows.map((row: any) => row.distributedId).join(',');
  const params = {
    distributedId: distributedIds,
  };
  Modal.confirm({
    title: '提示',
    content: `确认匹配吗?`,
    onOk: async () => {
      try {
        console.warn('handleMatch params:', params);
        await requestFormClient
          .post('/ygcgProductAction/pickDistribute.do', params)
          .then((res) => {
            if (res && res.success) {
              message.success(res.msg || '匹配成功');
            }
            ChcGridApi.query();
          });
      } catch (error) {
        console.error('失败', error);
      }
    },
  });
};
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <ChcGrid>
      <template #toolbar-actions>
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
        <!-- <Button
          type="primary"
          @click="handleGetMedcine"
          class="mr-[0.5rem]"
          data-testid="button_getMedcine"
        >
          获取配送信息
        </Button>
        <Button
          type="primary"
          @click="handleMatch"
          class="mr-[0.5rem]"
          data-testid="button_match"
        >
          阳光收货匹配
        </Button>
        <Button
          type="primary"
          @click="handleRecive"
          class="mr-[0.5rem]"
          data-testid="button_recive"
        >
          阳光收货回传
        </Button>
        <Button
          type="primary"
          @click="handleOnlineRate"
          class="mr-[0.5rem]"
          data-testid="button_upload"
        >
          生成网采率7002
        </Button>
        <Button
          type="primary"
          @click="handleCHS"
          class="mr-[0.5rem]"
          data-testid="button_chs"
        >
          生成医保局3502
        </Button> -->
      </template>
    </ChcGrid>
  </Page>
</template>

<style lang="less" scoped>
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
  display: none;
}
</style>

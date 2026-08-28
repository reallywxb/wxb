<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form.js';
import type { CSSProperties } from 'vue';
import { computed, h, onMounted, ref } from 'vue';
import { VbenLoading } from '@vben/common-ui';
import { EmptyIcon } from '@vben/chc-icons';
import { VbenChcTable } from '#/adapter/vxe-table.js';
import { useVbenForm } from '#/adapter/form.js';
import { requestClient } from '#/api/request';
import { merge } from 'lodash-es';
import type { VxeGridProps } from '#/adapter/vxe-table.js';
// ==================== Props 定义 ====================
const props = defineProps<{
  /** 基础配置 */
  id: string;

  /** 查询配置 */
  dataTableId?: string;
  queryUrl?: string | (() => string);
  queryTableDataApi?: (params: any) => Promise<any>;

  /** 增删改接口配置 */
  addUrl?: string;
  deleteUrl?: string;
  updateUrl?: string;

  /** 按钮显示控制 */
  showAddBtn?: boolean;
  showExportBtn?: boolean;
  showDeleteBtn?: boolean;
  showRefreshBtn?: boolean;
  showSearchBtn?: boolean;
  showToolbar?: boolean;
  showCustomBtn?: boolean;
  showZoomBtn?: boolean;

  /** 操作列配置 */
  showCellMenuIconBtn?: boolean;

  /** 列配置持久化 */
  autoLoadColumnConfig?: boolean;
  customColumnsConfigKey?: string;

  /** 表格列配置 */
  gridColumns: VxeGridProps['columns'];

  /** 搜索表单配置 */
  formSchema?: VbenFormSchema[];

  /** 表格事件 */
  gridEvents?: any;

  /** 父表参数 */
  parentTableParams?: Record<string, any>;

  /** 其他配置 */
  beforeFetch?: (params: any) => any;
  afterFetch?: (res: any) => any;

  /** 新增/编辑表单配置 */
  addFormOptions?: VbenFormProps;
  editFormOptions?: VbenFormProps;
  viewFormOptions?: VbenFormProps;
  commonFormOptions?: VbenFormProps;

  /** 权限配置 */
  permissions?: Record<string, string>;

  /** 表格额外配置 */
  gridOptions?: any;

  /** 默认请求配置 */
  defaultRequestOptions?: any;

  /** 表格查询额外参数 */
  tableSearchExtraParams?: Record<string, any>;

  /** 是否垂直布局搜索表单 */
  searchFormVertical?: boolean;

  /** 搜索表单验证 */
  searchFormValidate?: boolean;

  /** 搜索表单额外配置 */
  searchFormOptions?: VbenFormProps;

  /** 数据 */
  data?: any[];
  /**
   * 表格外层容器样式
   */
  tableContainerStyles?: CSSProperties;
}>();
const loading = ref(false);

// ==================== 构建 gridOptions ====================
const buildGridOptions = () => {
  // 构建 proxyConfig，支持 dataTableId、queryUrl、queryTableDataApi
  const buildProxyConfig = () => {
    const proxyConfig: any = merge(
      {
        autoLoad: true,
        ajax: {
          query: async (params: any) => {
            const { page, sort, form } = params;
            const queryParams = {
              ...form,
              ...props.tableSearchExtraParams,
              current: page?.currentPage,
              size: page?.pageSize,
              sort: sort?.field ? [`${sort.field} ${sort.order}`] : [],
            };

            // 如果有 beforeFetchFn，先处理参数
            let finalParams = queryParams;
            if (props.beforeFetch) {
              finalParams = props.beforeFetch(queryParams);
            }

            // 如果没有查询参数，返回空数据
            if (!finalParams) {
              return { total: 0, items: [] };
            }

            let res: any;

            // 优先使用 queryTableDataApi
            if (props.queryTableDataApi) {
              res = await props.queryTableDataApi(finalParams);
            }
            // 其次使用 dataTableId
            else if (props.dataTableId) {
              const handleUrl = (tableId: string = '') => {
                return tableId.includes('?')
                  ? `${tableId}&_menuPageAction=query`
                  : `${tableId}?_menuPageAction=query`;
              };
              res = await requestClient.post(
                handleUrl(props.dataTableId),
                finalParams,
              );
            }
            // 最后使用 queryUrl
            else if (props.queryUrl) {
              const url =
                typeof props.queryUrl === 'function'
                  ? props.queryUrl()
                  : props.queryUrl;
              res = await requestClient.post(url, finalParams);
            }
            // 没有配置查询方式，返回空数据
            else {
              return { total: 0, items: [] };
            }

            // 如果有 afterFetchFn，处理返回结果
            if (props.afterFetch) {
              res = props.afterFetch(res);
            }

            return props.gridOptions.pagerConfig?.enable
              ? {
                  total: res.total || 0,
                  items: res.records || res.rows || res.items || [],
                }
              : res.records;
          },
        },
      },
      props.gridOptions?.proxyConfig || {},
    );
    return proxyConfig;
  };

  return {
    id: props.id,
    columns: props.gridColumns,
    ...props.gridOptions,
    proxyConfig: buildProxyConfig(),
  };
};

// ==================== 构建搜索表单配置 ====================
const buildSearchFormSchema = () => {
  return props.formSchema || [];
};

// ==================== 渲染 VbenChcTable ====================
const chcTableRef = ref<InstanceType<typeof VbenChcTable>>();
const gridApi = computed(() => {
  return chcTableRef.value?.gridApi!;
});
const showLoading = computed<boolean>({
  get() {
    return loading.value;
  },
  set(val: boolean) {
    loading.value = val;
  },
});
defineExpose({
  gridApi,
  showLoading,
});
onMounted(() => {});
</script>

<template>
  <VbenChcTable
    ref="chcTableRef"
    :id="id"
    :searchFormVertical="searchFormVertical"
    :searchFormSchema="buildSearchFormSchema()"
    :searchFormValidate="searchFormValidate"
    :searchFormOptions="searchFormOptions"
    :formConstructor="useVbenForm"
    :gridOptions="buildGridOptions()"
    :data="data"
    :loading="loading"
    :columns="gridColumns"
    :tableContainerStyles="tableContainerStyles"
    v-bind="$attrs"
    :class="`chcTable-container ${$attrs.class || ''}`"
  >
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope"></slot>
    </template>
    <template #loading>
      <slot name="loading">
        <VbenLoading :spinning="true" />
      </slot>
    </template>
    <template #empty>
      <slot name="empty" class="pt-2">
        <EmptyIcon class="mx-auto" />
        <div :class="gridOptions.minHeight === '' ? 'mt-0' : 'mt-2'">
          暂无数据
        </div>
      </slot>
    </template>
  </VbenChcTable>
</template>

<style scoped>
.chc-table-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
::v-deep(.chcTable-container .vxe-table--empty-placeholder) {
  padding: 10px 0 5px 0;
}
</style>

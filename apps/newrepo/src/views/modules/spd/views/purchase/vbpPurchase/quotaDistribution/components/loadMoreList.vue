<script setup lang="ts">
import type { BatchItem } from '../api';

import { onMounted, onUnmounted, ref, watch } from 'vue';

import { Modal as AntModal, message, Spin } from 'ant-design-vue';

import { getBatchVBPActionList } from '../api';

interface ListItem {
  id: string;
  title: string;
  statusName: string;
  type: string;
  typeName: string;
  productCount: number;
  time: string;
  raw: BatchItem;
}

const props = defineProps<{
  filterStatus: string;
  searchKey: string;
}>();

const emit = defineEmits<{
  select: [item: ListItem];
}>();

const current = ref<ListItem>();
const itemList = ref<ListItem[]>([]);
const pageNum = ref(1);
const pageSize = 25;
const hasMore = ref(true);

function mapTypeToLabel(type: string): string {
  const map: Record<string, string> = {
    N: '国家集采',
    P: '省级集采',
    C: '市级采集',
    O: '其他',
  };
  return map[type] || type;
}

function mapStatusName(item: BatchItem): string {
  // 优先用后端返回的状态中文名
  if (item.statusName) return item.statusName;
  // 兜底：前端根据 isActive + 结束日期计算
  if (item.isActive === 'Y') return '执行中';
  const today = new Date();
  const endDate = item.endDate ? new Date(item.endDate) : null;
  if (endDate && endDate < today) return '已结束';
  return '未开始';
}

function formatTime(item: BatchItem): string {
  const start = item.beginDate || '';
  const end = item.endDate || '';
  // 截取年份-月份
  const s = start.slice(0, 7);
  const e = end.slice(0, 7);
  return s && e ? `${s} ~ ${e}` : start || end || '';
}

function transformItem(item: BatchItem): ListItem {
  return {
    id: item.vbpBatchId,
    title: item.name,
    statusName: mapStatusName(item),
    type: mapTypeToLabel(item.type),
    typeName: item.typeName,
    productCount: item.productCount || 0,
    time: `${item.beginDate || ''} ~ ${item.endDate}`,
    raw: item,
  };
}

async function queryList(reset = false) {
  if (reset) {
    pageNum.value = 1;
    itemList.value = [];
    hasMore.value = true;
  }

  const params = {
    productType: 'H',
    status: props.filterStatus || undefined,
    name: props.searchKey || undefined,
    pageNum: pageNum.value,
    pageSize,
    start: pageNum.value - 1,
    limit: pageSize,
    dir: 'desc',
    sort: 'beginDate',
  };

  try {
    const res = await getBatchVBPActionList(params);
    const rows = res.rows || [];
    if (rows.length === 0) {
      hasMore.value = false;
    } else {
      const newList = rows.map((item: BatchItem) => transformItem(item));
      itemList.value = reset ? newList : [...itemList.value, ...newList];
      pageNum.value += pageSize;
    }
    // 默认选中第一个
    if (reset && itemList.value.length > 0) {
      const firstItem = itemList.value[0] as ListItem;
      current.value = firstItem;
      emit('select', firstItem);
    }
  } catch (error) {
    message.error('查询失败');
    console.error('batchVBPAction/query.do 失败:', error);
  }
}

function itemClick(item: ListItem) {
  current.value = item;
  emit('select', item);
}

function itemEdit(row: ListItem) {
  console.warn('edit', row);
}

function itemDel(row: ListItem) {
  AntModal.confirm({
    title: '提示',
    content: `确认删除 ${row.title} 吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      message.success('删除成功');
      queryList(true);
    },
  });
}

function refreshList() {
  queryList(true);
}

const showLoading = ref(false);
const listContainerRef = ref<HTMLElement>();
const isFirst = ref(true);

function handleScroll() {
  const el = listContainerRef.value;
  if (!el) return;
  // 距离底部 50px 时触发加载
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
    loadMore();
  }
}

function loadMore() {
  if (showLoading.value || !hasMore.value) return;
  showLoading.value = true;
  if (isFirst.value) {
    showLoading.value = false;
    isFirst.value = false;
    return;
  }
  queryList().finally(() => {
    showLoading.value = false;
  });
}

watch(
  () => [props.filterStatus, props.searchKey] as const,
  () => {
    queryList(true);
  },
);

onMounted(() => {
  // 首屏加载
  queryList(true);
  // 绑定滚动事件
  const el = listContainerRef.value;
  if (el) {
    el.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  const el = listContainerRef.value;
  if (el) {
    el.removeEventListener('scroll', handleScroll);
  }
});

defineExpose({
  refreshList,
});
</script>
<template>
  <div
    ref="listContainerRef"
    class="list-container h-full w-full overflow-y-auto p-2"
  >
    <template v-for="(item, index) in itemList" :key="item.id">
      <slot
        name="listItem"
        v-bind="{ row: item, current, itemClick, itemEdit, itemDel, index }"
      ></slot>
    </template>
    <div
      v-if="hasMore"
      class="loadMoreTrigger align-center flex h-[30px] w-full items-center justify-center"
    >
      <Spin v-show="showLoading" />
    </div>
    <div
      v-else
      class="flex h-[30px] items-center justify-center text-[12px] text-[#9CA3AF]"
    >
      没有更多了
    </div>
  </div>
</template>
<style scoped>
.list-container::-webkit-scrollbar {
  display: none;
}
</style>

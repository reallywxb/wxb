<script setup lang="ts">
import type { PropType } from 'vue';

import { useVModel } from '@vueuse/core';
import { Pagination } from 'ant-design-vue';

import { scrollTo } from '#/utils/flow/scroll-to';

const props = defineProps({
  total: {
    type: Number as PropType<number>,
    default: 0,
  },
  page: {
    type: Number,
    default: 1,
  },
  limit: {
    type: Number,
    default: 20,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default() {
      return [10, 20, 30, 50];
    },
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper',
  },
  background: {
    type: Boolean,
    default: true,
  },
  autoScroll: {
    type: Boolean,
    default: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['pagination', 'update:page', 'update:limit']);

const currentPage = useVModel(props, 'page', emit);

const pageSize = useVModel(props, 'limit', emit);

function handleSizeChange(val: number) {
  emit('pagination', { page: currentPage, limit: val });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
}

function handleCurrentChange(val: number) {
  currentPage.value = val;
  emit('pagination', { page: val, limit: props.limit });
  if (props.autoScroll) {
    scrollTo(0, 800);
  }
}
</script>

<template>
  <div :class="`pagination ${hidden}`">
    <Pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :background="background"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="parseInt(total)"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.pagination {
  padding: 12px;

  &.hidden {
    display: none;
  }
}
</style>

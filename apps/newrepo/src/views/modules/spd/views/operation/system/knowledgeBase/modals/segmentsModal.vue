<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { getDocChunks } from '../api';

defineOptions({
  name: 'SegmentsModal',
});

const modalTitle = ref('文档片段');
const chunks = ref<any[]>([]);

function formatDateTime(val: any): string {
  if (!val) return '-';
  // Java Date 对象: { year: 126, month: 7, date: 6, hours: 15, minutes: 27, seconds: 46, time: ... }
  // 或有 time 字段的数值时间戳，或已是字符串
  if (typeof val === 'object') {
    if (val.time !== undefined) {
      val = val.time;
    } else {
      const y = (val.year || 0) + 1900;
      const m = String((val.month || 0) + 1).padStart(2, '0');
      const d = String(val.date || 1).padStart(2, '0');
      const h = String(val.hours || 0).padStart(2, '0');
      const min = String(val.minutes || 0).padStart(2, '0');
      const s = String(val.seconds || 0).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    }
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${mo}-${day} ${h}:${min}:${s}`;
}

function parseTags(tagsStr: string | undefined): string[] {
  if (!tagsStr) return [];
  try {
    const arr = JSON.parse(tagsStr);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return tagsStr.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

const [Modal, modalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  closeOnClickModal: false,
  showCancelButton: false,
  showConfirmButton: false,
  onClosed() {
    chunks.value = [];
    modalTitle.value = '文档片段';
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const modalData = modalApi?.getData();
    modalTitle.value = modalData?.title || modalTitle.value;
    try {
      const res = await getDocChunks({ docId: modalData?.docId });
      if (!res?.success) {
        throw Error(res?.msg || '查询失败');
      }
      chunks.value = res?.data || [];
    } catch (err) {
      console.error(err);
    }
  },
});
</script>

<template>
  <Modal :title="modalTitle">
    <div class="max-h-[600px] overflow-y-auto">
      <div v-if="chunks.length === 0" class="py-8 text-center text-gray-400">
        暂无片段数据
      </div>
      <div
        v-for="(chunk, index) in chunks"
        :key="chunk.CHUNK_ID"
        class="mb-3 rounded border border-gray-200"
      >
        <div
          class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2"
        >
          <span class="font-semibold text-gray-800">
            {{ index + 1 }}. {{ chunk.TITLE || '未命名' }}</span
          >
          <span class="text-xs text-gray-400">
            <span
              :class="
                chunk.IS_ACTIVE === 'Y'
                  ? 'text-green-500'
                  : chunk.IS_ACTIVE === 'N'
                    ? 'text-orange-500'
                    : 'text-gray-400'
              "
            >
              {{
                chunk.IS_ACTIVE === 'Y'
                  ? '已启用'
                  : chunk.IS_ACTIVE === 'N'
                    ? '待审核'
                    : '已禁用'
              }}
            </span>
            · 排序: {{ chunk.SORT_NO || 0 }} · 检索:
            {{ chunk.SEARCH_SCORE || 0 }} · 创建:
            {{ formatDateTime(chunk.CREATED_TIME) }}
          </span>
        </div>
        <div class="px-4 py-3">
          <div
            class="prose-sm max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-gray-600"
          >
            {{ chunk.CONTENT || '' }}
          </div>
          <div v-if="chunk.TAGS" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="(tag, ti) in parseTags(chunk.TAGS)"
              :key="ti"
              class="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-500"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, useAttrs } from 'vue';

import { SyncOutlined } from '@ant-design/icons-vue';
import { Button, InputSearch, Tree } from 'ant-design-vue';
import { throttle } from 'lodash-es';

import { usePersistentLoading } from '#/utils/util';

// const emit = defineEmits<{
//   select: (e: string, ...args: any[]) => void;
// }>();

interface Pagination {
  current: number;
  size: number;
  total: number;
}

const props = withDefaults(
  defineProps<{
    displayRoot?: boolean;
    pageSize?: number;
    pagination?: boolean;
    /** 是否在搜索回车后自动滚动到第一个匹配项，默认 false */
    searchAutoScroll?: boolean;
    request: (
      params?: Omit<Pagination, 'total'>,
      cb?: (params: Pagination) => void,
    ) => Promise<any[]>;
  }>(),
  {
    displayRoot: true,
    pageSize: 25,
    pagination: false,
    searchAutoScroll: false,
  },
);

const attrs = useAttrs();
const emit = defineEmits<{
  searchSelect: [keys: (string | number)[], info: any];
  select: [keys: (string | number)[], info: any];
}>();

const { loading, showLoading } = usePersistentLoading(500);

const treeData = ref<Array<any>>([]);

const selectDeptId = ref<(string | number)[]>([]);

const searchValue = ref('');

const paginator = reactive<Pagination>({
  current: 1,
  size: props.pageSize,
  total: 0,
});

// 组件根元素 ref，用于精确查找 DOM
const rootRef = ref<HTMLElement>();

function reload() {
  const stopLoading = showLoading();

  props
    .request(undefined, (params) => {
      Object.assign(paginator, {
        current: params.current,
        size: params.size,
        total: params.total,
      });
    })
    .then((data: Array<any>) => {
      treeData.value = props.displayRoot
        ? [
            {
              id: '',
              leaf: false,
              [(attrs['field-names'] as Record<string, any> | undefined)
                ?.title ?? 'label']: '全部',
              children: data,
            },
          ]
        : data;
    })
    .finally(() => {
      stopLoading();
    });
}

/**
 * 处理搜索：定位到第一个匹配项（仅当 searchAutoScroll 开启时）
 */
function handleSearch() {
  if (props.searchAutoScroll) {
    scrollToFirstMatch();
  }
}

/**
 * 滚动到第一个匹配搜索词的节点，并触发 searchSelect 事件
 */
function scrollToFirstMatch() {
  if (!searchValue.value) return;

  // 使用组件根元素查找
  const rootEl = rootRef.value;
  if (!rootEl) return;

  // 获取 field-names 配置
  const fieldNames =
    (attrs['field-names'] as Record<string, any> | undefined)?.title ?? 'label';
  const keyField =
    (attrs['field-names'] as Record<string, any> | undefined)?.key ?? 'id';

  // 在 treeData 中查找匹配的第一个节点
  function findMatchedNode(nodes: any[], kw: string): any | null {
    for (const node of nodes) {
      if (node[fieldNames]?.includes(kw)) {
        return node;
      }
      if (node.children?.length) {
        const found = findMatchedNode(node.children, kw);
        if (found) return found;
      }
    }
    return null;
  }

  const matchedNode = findMatchedNode(treeData.value, searchValue.value);
  if (!matchedNode) return;

  // 在根元素内查找所有树节点，通过标题文本匹配 DOM
  const treeNodes = rootEl.querySelectorAll('.ant-tree-treenode');
  for (const nodeEl of treeNodes) {
    const titleEl = nodeEl.querySelector('.ant-tree-title');
    if (titleEl) {
      const text = titleEl.textContent?.trim();
      if (text?.includes(searchValue.value)) {
        // 找到滚动容器
        const scrollContainer = rootEl.querySelector('.tree');
        if (scrollContainer) {
          (nodeEl as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
        // 更新选中状态并触发 searchSelect 事件
        selectDeptId.value = [matchedNode[keyField]];
        emit('searchSelect', selectDeptId.value, {
          node: { dataRef: matchedNode },
        });
        return;
      }
    }
  }
}

function onWheel(e: WheelEvent) {
  console.warn('onWheel', e);
  if (treeData.value.length >= paginator.total) {
    console.warn('已到最后一页');
    return;
  }
  const target = e.currentTarget as HTMLElement;
  if (!target) return;

  // 增加20px缓冲，解决缩放时亚像素渲染问题
  const buffer = 20;
  // 是否触底

  const scrollBottom = target?.offsetHeight + target?.scrollTop;
  const isBottom = scrollBottom + buffer >= target?.scrollHeight;
  console.warn('是否触底', isBottom);
  if (isBottom) {
    const stopLoading = showLoading();

    props
      .request(
        {
          current: paginator.current + 1,
          size: paginator.size,
        },
        (params) => {
          Object.assign(paginator, {
            current: params.current,
            size: params.size,
            total: params.total,
          });
        },
      )
      .then((data) => {
        treeData.value.push(...data);
      })
      .finally(() => {
        stopLoading();
      });
  }
}

const throttleWheel = computed(() => {
  console.warn('throttleWheel', props.pagination);
  return props.pagination ? throttle(onWheel, 50) : undefined;
});

reload();
</script>

<template>
  <div ref="rootRef" class="dp-tree" v-loading="loading">
    <InputSearch
      size="small"
      v-model:value="searchValue"
      placeholder="搜索"
      allow-clear
      style="padding-right: 12px"
      v-on="searchAutoScroll ? { search: handleSearch } : {}"
    >
      <template #enterButton>
        <Button @click="reload">
          <SyncOutlined class="text-primary" />
        </Button>
      </template>
    </InputSearch>
    <div class="tree" @wheel="throttleWheel">
      <Tree
        ref="treeRef"
        v-model:selected-keys="selectDeptId"
        :field-names="{ title: 'label', key: 'id' }"
        :show-line="{ showLeafIcon: false }"
        :tree-data="treeData"
        :virtual="false"
        default-expand-all
        v-bind="attrs"
        @select="
          (keys: (string | number)[], info: any) => emit('select', keys, info)
        "
      >
        <template #title="{ [attrs['field-names']?.title ?? 'label']: label }">
          <span v-if="label?.includes(searchValue)">
            {{ label.substring(0, label.indexOf(searchValue)) }}
            <span class="text-primary">{{ searchValue }}</span>
            {{
              label.substring(label.indexOf(searchValue) + searchValue.length)
            }}
          </span>
          <span v-else>{{ label }}</span>
        </template>
      </Tree>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// $input-height: 24px;

.dp-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  padding: {
    top: 12px;
    bottom: 12px;
    left: 12px;
  }

  .tree {
    flex: 1;
    min-height: 0;
    // $margin-top: 12px;

    // height: calc(100% - $input-height - $margin-top);
    // 234234
    // margin-top: $margin-top;
    overflow: auto;
    scrollbar-width: none; /* 比默认宽度更窄 */
    &:hover {
      scrollbar-width: thin; /* 比默认宽度更窄 */
    }
  }
}
</style>

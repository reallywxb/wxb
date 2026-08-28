<script lang="ts" setup>
import type { ColPageProps } from './types';

import { ref } from 'vue';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@vben-core/shadcn-ui';

defineOptions({
  name: 'Splitter',
  inheritAttrs: false,
});
// const props =
withDefaults(defineProps<ColPageProps>(), {
  type: 'LRtRb',
  leftWidth: 20,
  rightWidth: 70,
  // rightWidth: 70,
  resizable: true,
  horizontalSizeUnit: '%',
  topHeight: 50,
  bottomHeight: 50,
});
// console.log('horizontalSizeUnit:', props.horizontalSizeUnit);
const leftPanelRef = ref<InstanceType<typeof ResizablePanel>>();
const rightTopPanelRef = ref<InstanceType<typeof ResizablePanel>>();
const rightBottomPanelRef = ref<InstanceType<typeof ResizablePanel>>();

defineExpose({
  leftPanelRef,
  rightTopPanelRef,
  rightBottomPanelRef,
});
</script>
<template>
  <ResizablePanelGroup
    class="h-full w-full"
    direction="horizontal"
    v-if="type === 'LRtRb'"
    :keyboard-resize-by="1"
  >
    <ResizablePanel
      ref="leftPanelRef"
      :collapsed-size="leftCollapsedWidth"
      :collapsible="leftCollapsible"
      :default-size="leftWidth"
      :max-size="leftMaxWidth"
      :min-size="leftMinWidth"
      :size-unit="horizontalSizeUnit"
    >
      <template #default="slotProps">
        <slot
          name="left"
          v-bind="{
            ...slotProps,
          }"
        ></slot>
      </template>
    </ResizablePanel>
    <!-- :with-handle="splitHandle" -->
    <ResizableHandle
      v-if="resizable"
      :style="{ backgroundColor: splitLine ? undefined : 'transparent' }"
    />
    <ResizablePanel
      :size-unit="horizontalSizeUnit"
      :collapsed-size="rightCollapsedWidth"
      :collapsible="rightCollapsible"
      :default-size="rightWidth"
      :max-size="rightMaxWidth"
      :min-size="rightMinWidth"
    >
      <ResizablePanelGroup
        class="w-full"
        direction="vertical"
        :keyboard-resize-by="1"
      >
        <ResizablePanel
          ref="rightTopPanelRef"
          :collapsed-size="rightTopCollapsedHeight"
          :collapsible="rightTopCollapsible"
          :default-size="rightTopHeight"
          :max-size="rightTopMaxHeight"
          :min-size="rightTopMinHeight"
        >
          <template #default="slotProps">
            <slot
              name="rightTop"
              v-bind="{
                ...slotProps,
              }"
            ></slot>
          </template>
        </ResizablePanel>
        <!-- :with-handle="splitHandle" -->
        <ResizableHandle
          v-if="resizable"
          :style="{ backgroundColor: splitLine ? undefined : 'transparent' }"
        />
        <ResizablePanel
          ref="rightBottomPanelRef"
          :collapsed-size="rightBottomCollapsedHeight"
          :collapsible="rightBottomCollapsible"
          :default-size="rightBottomHeight"
          :max-size="rightBottomMaxHeight"
          :min-size="rightBottomMinHeight"
        >
          <template #default="slotProps">
            <slot
              name="rightBottom"
              v-bind="{
                ...slotProps,
              }"
            ></slot>
          </template>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
  <ResizablePanelGroup
    class="h-full w-full"
    direction="vertical"
    v-if="type === 'TB'"
    :keyboard-resize-by="1"
  >
    <ResizablePanel
      ref="rightTopPanelRef"
      :collapsed-size="topCollapsedHeight"
      :collapsible="topCollapsible"
      :default-size="topHeight"
      :max-size="topMaxHeight"
      :min-size="topMinHeight"
    >
      <template #default="slotProps">
        <slot
          name="top"
          v-bind="{
            ...slotProps,
          }"
        ></slot>
      </template>
    </ResizablePanel>
    <!-- :with-handle="splitHandle" -->
    <ResizableHandle
      v-if="resizable"
      :style="{ backgroundColor: splitLine ? undefined : 'transparent' }"
    />
    <ResizablePanel
      ref="rightBottomPanelRef"
      :collapsed-size="bottomCollapsedHeight"
      :collapsible="bottomCollapsible"
      :default-size="bottomHeight"
      :max-size="bottomMaxHeight"
      :min-size="bottomMinHeight"
    >
      <template #default="slotProps">
        <slot
          name="bottom"
          v-bind="{
            ...slotProps,
          }"
        ></slot>
      </template>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>

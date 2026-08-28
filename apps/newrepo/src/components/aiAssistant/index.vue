<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { AntdCloseOutlined, SvgLaRobot } from '@vben/chc-icons';
import { useVbenDrawer } from '@vben/common-ui';

import { VbenIconButton } from '@vben-core/shadcn-ui';

import imgSrc from '#/assets/images/aiAssistant.gif';

import AntdxChatArea from './antdxChatArea.vue';
import TdChatArea from './tdChatArea.vue';
import { useDraggable } from './use-draggable';

const props = withDefaults(
  defineProps<{
    chatAreaType?: 'antdx' | 'td';
    positionType?: 'fixed' | 'header'; // 用于兼容按钮在顶部和浮动
  }>(),
  {
    chatAreaType: 'td',
    positionType: 'fixed',
  },
);
const antdxChatAreaRef = ref();
const tdChatAreaRef = ref();
const [Modal, modalApi] = useVbenDrawer({
  class: 'w-[600px]',
  title: 'AI智能助手',
  footer: false,
  modal: true,
  onOpenChange: (isOpen: boolean) => {
    if (props.chatAreaType === 'td') {
      isOpen && tdChatAreaRef.value && tdChatAreaRef.value.refreshTimePeriod();
    } else {
      isOpen &&
        antdxChatAreaRef.value &&
        antdxChatAreaRef.value.refreshTimePeriod();
    }
  },
  // destroyOnClose: true,
});

const canCloseAssistant = true;
const aiAssistantRef = ref();
const shouldDraggable = computed(() => {
  return true;
});
const dragCallBack = (changePosition: boolean) => {
  !changePosition && modalApi.open();
};
const { transform } =
  props.positionType === 'fixed'
    ? useDraggable(aiAssistantRef, shouldDraggable, dragCallBack)
    : {};
// const current = defineModel('current', { type: Number, default: 0 });
const showAiAssistant = defineModel('show', {
  type: Boolean,
  default: true,
});
onMounted(() => {
  if (props.positionType === 'fixed') {
    const { offsetX, offsetY } = transform as any;
    aiAssistantRef.value.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }
});
watch(
  [() => showAiAssistant.value, () => props.positionType],
  async ([firstVal, secondVal]) => {
    if (firstVal && secondVal === 'fixed') {
      await nextTick();
      const { offsetX, offsetY } = transform as any;
      aiAssistantRef.value.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
  },
);
const handleCloseClick = (e: MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  showAiAssistant.value = false;
};
</script>
<template>
  <!-- header按钮 -->
  <VbenIconButton
    v-if="positionType === 'header' && showAiAssistant"
    class="dark:hover:bg-accent dark:hover:text-accent-foreground dark:text-foreground/80 hover:bg-header-accent-hover hover:text-header-accent-foreground text-header-foreground"
    @click="modalApi.open()"
    title="AI智能助手"
  >
    <SvgLaRobot title="AI智能助手" />
  </VbenIconButton>
  <!-- 浮动按钮 -->
  <Teleport to="body">
    <div
      v-if="positionType === 'fixed' && showAiAssistant"
      v-tippy="{
        theme: 'light',
        animation: 'scale',
        content: '点我打开AI助手',
        trigger: 'mouseenter',
        delay: [0, 0],
      }"
      class="containerBox aiAssistant group"
      ref="aiAssistantRef"
    >
      <img :src="imgSrc" alt="" class="shadow123" />
      <div
        v-if="canCloseAssistant"
        class="border-black-100 absolute right-[-2px] top-[-2px] hidden h-[12px] w-[12px] rounded-[6px] border border-solid bg-[#fff] text-center group-hover:block"
      >
        <AntdCloseOutlined
          @click="handleCloseClick"
          id="closeTarget"
          class="z-[1000] ml-[1px] mt-[1px] text-[8px]/[10px]"
        />
      </div>
    </div>
  </Teleport>

  <Modal>
    <TdChatArea ref="tdChatAreaRef" v-if="chatAreaType === 'td'" />
    <AntdxChatArea ref="antdxChatAreaRef" v-if="chatAreaType === 'antdx'" />
  </Modal>
</template>
<style scoped>
.containerBox {
  position: fixed;
  right: 2px;
  bottom: calc(20% - 25px);
  z-index: 999;

  /* width: 60px;
  height: 60px; */
  width: 50px;
  height: 50px;
  cursor: pointer;
  background: transparent;

  /* background: rgb(25 0 255 / 5%);
  background-image: url('../../assets/images/aiAssistant.gif');
  background-size: 100% 100%;
  border-radius: 11px;
  box-shadow:
    1px 0 2px #acacac,
    0 1px 2px #acacac,
    0 -1px 2px #acacac,
    -1px 0 2px #acacac; */
}

.containerBox:hover {
  /* box-shadow:
    inset 1px 0 2px #acacac,
    inset 0 1px 2px #acacac,
    inset 0 -1px 2px #acacac,
    inset -1px 0 2px #acacac; */
}

.shadow123 {
  z-index: -1;
  width: 100%;
  height: 100%;
  filter: drop-shadow(2px 2px 6px rgb(6 0 56 / 30%));
}
</style>

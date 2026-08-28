<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Transfer } from 'ant-design-vue';

defineOptions({
  name: 'ConfigureQueryItemModal',
});

defineProps<{
  options?: any[];
}>();

const emit = defineEmits(['change']);

const targetKeys = ref<string[]>([]);

const [Modal, modalApi] = useVbenModal({
  class: 'w-[600px]',
  footer: false,
  destroyOnClose: true,
  closeOnClickModal: false,
  async onOpened() {},
  onCancel() {
    modalApi.close();
  },
});

defineExpose({ modalApi });
</script>
<template>
  <Modal title="配置查询项">
    <div class="flex-center">
      <Transfer
        :list-style="{
          width: '250px',
          height: '600px',
        }"
        v-model:target-keys="targetKeys"
        :data-source="options"
        :titles="['非查询项', '查询项']"
        :render="(item) => item.title"
        @change="emit('change', $event)"
      />
    </div>
  </Modal>
</template>
<style lang="scss" scoped></style>

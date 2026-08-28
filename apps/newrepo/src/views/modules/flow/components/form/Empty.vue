<script lang="ts" setup>
import { FileAddOutlined } from '@ant-design/icons-vue';

defineProps({
  mode: {
    type: String,
    default: 'D',
  },

  form: {
    type: Object,
    default: () => {},
  },
});
</script>
<template>
  <div class="empty">
    <div class="replace-el-text primary">
      <FileAddOutlined />
      请点击左侧组件拖拽到此处
    </div>
  </div>
</template>
<style scoped lang="scss">
@use '../../../../../styles/flow/common.scss';

.empty {
  height: 28px;
  margin-top: 24px;
  line-height: 28px;
  text-align: center;
}
</style>

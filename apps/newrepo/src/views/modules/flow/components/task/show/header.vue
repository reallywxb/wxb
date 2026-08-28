<script setup lang="ts">
import { defineExpose, onMounted, ref } from 'vue';

import { Avatar } from 'ant-design-vue';

defineExpose({ loadData });

function loadData(d) {
  currentData.value = d;
}

const currentData = ref({});

onMounted(() => {});
</script>

<template>
  <div style="position: relative">
    <div style="display: flex; flex-direction: row">
      <div class="f11">
        <Avatar shape="square" :size="50" :src="currentData.starterAvatarUrl">
          {{ currentData?.starterName?.substring(0, 1) }}
        </Avatar>
      </div>
      <div class="f22">
        <div style="display: flex; flex-direction: row">
          <div class="f01">
            <b class="replace-el-text primary large">
              {{ currentData?.processName }}
            </b>
          </div>
        </div>
        <div>
          <div class="replace-el-text small">
            {{ currentData.processInstanceBizCode }}
          </div>
        </div>
      </div>
    </div>
    <img
      v-if="currentData.processInstanceResult === 1"
      class="iconclass"
      src="../../../assets/images/pass.png"
    />
    <img
      v-if="currentData.processInstanceResult === 2"
      class="iconclass"
      src="../../../assets/images/refuse.png"
    />
    <img
      v-if="currentData.processInstanceResult === 3"
      class="iconclass"
      src="../../../assets/images/canceled.png"
    />
  </div>
</template>

<style scoped lang="scss">
$f02-width: 20px;

@use '../../../../../../styles/flow/common';

.f11 {
  width: 70px;
}

.f22 {
  width: calc(100% - 70px);
}

.iconclass {
  position: absolute;
  top: 0;
  right: 30px;
  width: 64px;
  height: 64px;
}

.f01 {
  width: calc(100% - #{$f02-width});
}

.f02 {
  width: $f02-width;
  cursor: pointer;
}
</style>

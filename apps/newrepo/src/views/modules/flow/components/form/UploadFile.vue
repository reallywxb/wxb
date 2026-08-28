<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */

import MultiUploadFile from '../Upload/MultiUploadFile.vue';

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
  <div>
    <MultiUploadFile v-if="mode === 'D'" :disabled="true" />
    <!--		<template v-else-if="form.perm === 'R'">-->
    <!--			<template v-for="item in form.props.value">-->
    <!--				<el-link target="_blank" :href="item.url"> {{item.name}} </el-link>-->
    <!--			</template>-->
    <!--		</template>-->
    <MultiUploadFile
      v-else
      v-model="form.props.value"
      :suffix-array="form.props.suffixArray"
      :disabled="form.perm === 'R'"
    />
  </div>
</template>
<style scoped lang="less"></style>

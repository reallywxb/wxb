<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import MultiUpload from '../Upload/MultiUpload.vue';

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
    <MultiUpload v-if="mode === 'D'" :disabled="true" />
    <!--		<template v-else-if="form.perm === 'R'">-->
    <!--			<template v-for="item in form.props.value">-->
    <!--				<el-image-->
    <!--						style="width: 100px; height: 100px"-->
    <!--						:src="item.url"-->
    <!--						:zoom-rate="1.2"-->
    <!--						:max-scale="7"-->
    <!--						:min-scale="0.2"-->
    <!--						:preview-src-list="form.props.value.map(res=>res.url)"-->
    <!--						:initial-index="4"-->
    <!--						fit="cover"-->
    <!--				/>-->
    <!--			</template>-->

    <!--		</template>-->
    <MultiUpload
      v-else
      v-model="form.props.value"
      :limit="form.props.max"
      :max-size="form.props.maxSize"
      :disabled="form.perm === 'R'"
    />
  </div>
</template>
<style scoped lang="less"></style>

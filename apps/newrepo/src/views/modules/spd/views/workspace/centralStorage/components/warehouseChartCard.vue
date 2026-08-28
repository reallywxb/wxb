<script setup lang="ts">
import { ref } from 'vue';

import { ChcSelect } from '@vben/chc-ui';

import { Card, CardContent, CardHeader, CardTitle } from '@vben-core/shadcn-ui';

interface Props {
  title: string;
  type: string;
}

defineOptions({
  name: 'CentralWarhouseChartCard',
});

withDefaults(defineProps<Props>(), {});
const emit = defineEmits<{
  (e: 'warehouseChange', val: number | string): void;
}>();
const chcSelectRef = ref<InstanceType<typeof ChcSelect>>(); // 商品选择下拉组件
const selectParams = ref<{ [key: string]: any }>({});
const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
// 用于标记产品下拉是否打开，用来自定义下拉开启时的键盘左右箭头操作
const selectOpen = ref(false);
const handleDropdownVisibleChange = (open: boolean) => {
  selectOpen.value = !!open;
};
// 选择一个商品
const handleChoose = async (val: any, option: any) => {
  console.warn('handleChoose val', val);
  console.warn('handleChoose option', option);
  emit('warehouseChange', val);
};
</script>

<template>
  <Card>
    <CardHeader class="py-4">
      <div class="flex w-full items-center justify-between">
        <CardTitle class="xl:text-md 2xl:text-lg">{{ title }}</CardTitle>
        <div class="items-center justify-start">
          <label class="lg:mr-1 2xl:mr-3">库房</label>
          <ChcSelect
            ref="chcSelectRef"
            placeholder="请选择库房"
            class="lg:w-[100px] 2xl:w-[200px]"
            dict-url="/baseHandleAction/warehouse.do?level1=Y"
            popup-class-name="warehouseSelection"
            @dropdown-visible-change="handleDropdownVisibleChange"
            api-type="post"
            request-content-type="application/x-www-form-urlencoded"
            :immediate="true"
            :extra-params="selectParams"
            :black-list="blackList"
            :filter-by-front-end="true"
            :show-search="true"
            @change="handleChoose"
            filter-field="name"
            label-field="name"
            value-field="id"
            auto-choose-first-option
            :paginate="false"
            :data-testid="`ChcSelect_warehouseId_${type}`"
            :after-fetch="
              (res: any) => {
                return { ...res, rows: undefined, records: res.rows };
              }
            "
          />
        </div>
      </div>
    </CardHeader>
    <CardContent
      class="box-border flex h-[calc(100%_-_60px)] items-center justify-center pt-0"
    >
      <slot></slot>
    </CardContent>
  </Card>
</template>

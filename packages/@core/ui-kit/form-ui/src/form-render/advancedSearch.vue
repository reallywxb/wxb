<script setup lang="ts">
import type { Component } from 'vue';

import type { AdvSearchField, AdvSearchItem } from '../types';

import { computed, markRaw } from 'vue';

import { COMPONENT_MAP } from '../config';
import AdvancedSearchItem from './advancedSearchItem.vue';

const props = withDefaults(
  defineProps<{
    advSearchFields: AdvSearchField[];
    showOuterAdvSearch: boolean;
    toggleShowOuterAdvSearch: () => void;
  }>(),
  {},
);
const searchItems = defineModel<AdvSearchItem[]>('searchItems', {
  required: true,
});

const PrimaryButton = markRaw(COMPONENT_MAP.PrimaryButton as Component);
// const Input = markRaw(COMPONENT_MAP.Input as Component);
const DefaultButton = markRaw(COMPONENT_MAP.DefaultButton as Component);
const Switch = markRaw(COMPONENT_MAP.Switch as Component);
function generateUniqueRandomNumber() {
  return Math.floor(Math.random() * 1_000_000);
}

const addSearchItem = () => {
  searchItems.value.push({
    id: `${Date.now()}${generateUniqueRandomNumber()}`,
    compType: 'text',
    field: undefined,
    operator: undefined,
    operatorOptions: undefined,
    value: undefined,
    component: 'Input',
  });
};
// const viewSearchItems = () => {
//   console.log(searchItems.value);
// };
const switchChecked = computed({
  get() {
    return props.showOuterAdvSearch;
  },
  set() {
    props.toggleShowOuterAdvSearch();
  },
});
</script>
<template>
  <div class="advanced-search w-full">
    <div
      class="h-auto max-h-[calc(var(--radix-popper-available-height)-2.25rem-28px)] w-full overflow-y-auto"
      :class="{
        'mb-2': searchItems.length > 0,
      }"
    >
      <div
        class="[&:not(:first-child)]:mt-2"
        v-for="(_, index) in searchItems"
        :key="_.id"
      >
        <AdvancedSearchItem
          :adv-search-fields="advSearchFields"
          v-model:item="searchItems[index]!"
        >
          <template #control>
            <DefaultButton
              class="shrink-0 grow-0"
              type="primary"
              @click="
                () => {
                  searchItems.splice(index, 1);
                }
              "
              danger
            >
              删除
            </DefaultButton>
          </template>
        </AdvancedSearchItem>
      </div>
    </div>
    <PrimaryButton type="primary" @click="addSearchItem" class="mr-3">
      添加查询条件
    </PrimaryButton>
    <!-- <PrimaryButton type="primary" class="ml-3" @click="viewSearchItems">
      查看查询条件
    </PrimaryButton> -->
    <!-- <PrimaryButton
      type="primary"
      class="ml-3"
      @click="toggleShowOuterAdvSearch"
    >
      {{ showOuterAdvSearch ? '隐藏外部查询条件' : '外部显示查询条件' }}
    </PrimaryButton> -->
    <!-- <span class="text-sm">{{
      showOuterAdvSearch ? '隐藏外部查询条件' : '外部显示查询条件'
    }}</span> -->
    <Switch
      v-model:checked="switchChecked"
      checked-children="显示"
      un-checked-children="隐藏"
      class="mb-[3px]"
    />
  </div>
</template>
<style scoped></style>

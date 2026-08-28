<script setup lang="ts">
import type { AdvSearchField, AdvSearchItem } from '../types';

import { computed, ref, toRaw, unref, watch } from 'vue';

import { useSimpleLocale } from '@vben-core/composables';
import { Settings } from '@vben-core/icons';
import { VbenExpandableArrow, VbenPopover } from '@vben-core/shadcn-ui';
import { cn, isFunction, triggerWindowResize } from '@vben-core/shared/utils';

import { COMPONENT_MAP } from '../config';
import AdvancedSearch from '../form-render/advancedSearch.vue';
import { injectFormProps } from '../use-form-context';

withDefaults(
  defineProps<{
    showOuterAdvSearch: boolean;
    toggleShowOuterAdvSearch: () => void;
  }>(),
  {},
);

const { $t } = useSimpleLocale();

const [rootProps, form] = injectFormProps();
// console.log('rootProps, form, COMPONENT_MAP:', rootProps, form, COMPONENT_MAP);
const collapsed = defineModel({ default: false });
const resetButtonOptions = computed(() => {
  return {
    content: `${$t.value('reset')}`,
    show: true,
    ...unref(rootProps).resetButtonOptions,
  };
});

const submitButtonOptions = computed(() => {
  return {
    content: `${$t.value('submit')}`,
    show: true,
    ...unref(rootProps).submitButtonOptions,
  };
});

// const isQueryForm = computed(() => {
//   return !!unref(rootProps).showCollapseButton;
// });

const queryFormStyle = computed(() => {
  if (!unref(rootProps).actionWrapperClass) {
    return {
      'grid-column': `-2 / -1`,
      marginLeft: 'auto',
    };
  }

  return {};
});

async function handleSubmit(e: Event) {
  e?.preventDefault();
  e?.stopPropagation();
  const { valid } = await form.validate();
  if (!valid) {
    return;
  }

  const values = toRaw(await unref(rootProps).formApi?.getValues());
  await unref(rootProps).handleSubmit?.(values);
}

async function handleReset(e: Event) {
  e?.preventDefault();
  e?.stopPropagation();
  const props = unref(rootProps);

  const values = toRaw(await props.formApi?.getValues());

  if (isFunction(props.handleReset)) {
    await props.handleReset?.(values);
  } else {
    form.resetForm();
  }
}

watch(
  () => collapsed.value,
  () => {
    const props = unref(rootProps);
    if (props.collapseTriggerResize) {
      triggerWindowResize();
    }
  },
);
const advSearchFields = ref<AdvSearchField[]>([]);
unref(rootProps).queryAdvSearchKeys &&
  unref(rootProps).queryAdvSearchKeys!().then((res) => {
    advSearchFields.value = res;
  });

const searchItems = defineModel<AdvSearchItem[]>('advSearchItems', {
  required: true,
});
// const searchItems = ref<AdvSearchItem[]>([]);
defineExpose({
  handleReset,
  handleSubmit,
});
</script>
<template>
  <div
    :class="
      cn(
        'col-span-full w-full text-right',
        rootProps.compact ? 'pb-2' : 'pb-6',
        rootProps.actionWrapperClass,
      )
    "
    :style="queryFormStyle"
  >
    <template v-if="rootProps.queryAdvSearchKeys">
      <component
        :is="VbenPopover"
        content-class="w-[500px] p-3 h-auto"
        class="ml-3"
        trigger-class="h-[28px]"
      >
        <template #trigger>
          <component
            :is="COMPONENT_MAP.DefaultButton"
            title="高级查询"
            type="button"
          >
            <Settings
              :class="
                cn(
                  'text-foreground/80 hover:text-foreground !mb-[3px] !ml-[0px] !mr-[0px] size-4',
                )
              "
            />
          </component>
        </template>
        <AdvancedSearch
          v-model:search-items="searchItems"
          :components-map="COMPONENT_MAP"
          :adv-search-fields="advSearchFields"
          :show-outer-adv-search="showOuterAdvSearch"
          :toggle-show-outer-adv-search="toggleShowOuterAdvSearch"
        />
      </component>
    </template>

    <template v-if="rootProps.actionButtonsReverse">
      <!-- 提交按钮前 -->
      <slot name="submit-before"></slot>

      <component
        :is="COMPONENT_MAP.PrimaryButton"
        v-if="submitButtonOptions.show"
        class="ml-3"
        type="button"
        @click="handleSubmit"
        v-bind="submitButtonOptions"
      >
        {{ submitButtonOptions.content }}
      </component>
    </template>

    <!-- 重置按钮前 -->
    <slot name="reset-before"></slot>

    <component
      :is="COMPONENT_MAP.DefaultButton"
      v-if="resetButtonOptions.show"
      class="ml-3"
      type="button"
      @click="handleReset"
      v-bind="resetButtonOptions"
    >
      {{ resetButtonOptions.content }}
    </component>

    <template v-if="!rootProps.actionButtonsReverse">
      <!-- 提交按钮前 -->
      <slot name="submit-before"></slot>

      <component
        :is="COMPONENT_MAP.PrimaryButton"
        v-if="submitButtonOptions.show"
        class="ml-3"
        type="button"
        @click="handleSubmit"
        v-bind="submitButtonOptions"
      >
        {{ submitButtonOptions.content }}
      </component>
    </template>

    <!-- 展开按钮前 -->
    <slot name="expand-before"></slot>

    <VbenExpandableArrow
      v-if="rootProps.showCollapseButton"
      v-model:model-value="collapsed"
      class="ml-2"
    >
      <span>{{ collapsed ? $t('expand') : $t('collapse') }}</span>
    </VbenExpandableArrow>

    <!-- 展开按钮后 -->
    <slot name="expand-after"></slot>
  </div>
</template>

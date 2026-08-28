<script setup lang="ts">
import type { GenericObject } from 'vee-validate';
import type { ZodTypeAny } from 'zod';

import type {
  AdvSearchField,
  AdvSearchItem,
  FormCommonConfig,
  FormRenderProps,
  FormSchema,
  FormShape,
} from '../types';

import { computed } from 'vue';

import { Form } from '@vben-core/shadcn-ui';
import { cn, isString, mergeWithArrayOverride } from '@vben-core/shared/utils';

import AdvancedSearchItem from './advancedSearchItem.vue';
import { provideFormRenderProps } from './context';
import { useExpandable } from './expandable';
import FormField from './form-field.vue';
import { getBaseRules, getDefaultValueInZodStack } from './helper';

interface Props extends FormRenderProps {}

const props = withDefaults(
  defineProps<
    Props & {
      advSearchFields: AdvSearchField[];
      globalCommonConfig?: FormCommonConfig;
      showOuterAdvSearch: boolean;
      toggleShowOuterAdvSearch: () => void;
    }
  >(),
  {
    collapsedRows: 1,
    commonConfig: () => ({}),
    globalCommonConfig: () => ({}),
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  },
);
const emits = defineEmits<{
  submit: [event: any];
}>();
const advSearchItems = defineModel<AdvSearchItem[]>('advSearchItems', {
  default: () => [],
});
const showAdvSearchItems = computed(() => {
  return advSearchItems.value.filter((item) => item.field && item.operator);
});
provideFormRenderProps(props);

const { isCalculated, keepFormItemIndex, wrapperRef } = useExpandable(props);

const shapes = computed(() => {
  const resultShapes: FormShape[] = [];
  props.schema?.forEach((schema) => {
    const { fieldName } = schema;
    const rules = schema.rules as ZodTypeAny;

    let typeName = '';
    if (rules && !isString(rules)) {
      typeName = rules._def.typeName;
    }

    const baseRules = getBaseRules(rules) as ZodTypeAny;

    resultShapes.push({
      default: getDefaultValueInZodStack(rules),
      fieldName,
      required: !['ZodNullable', 'ZodOptional'].includes(typeName),
      rules: baseRules,
    });
  });
  return resultShapes;
});

const formComponent = computed(() => (props.form ? 'form' : Form));

const formComponentProps = computed(() => {
  return props.form
    ? {
        onSubmit: props.form.handleSubmit((val) => emits('submit', val)),
      }
    : {
        onSubmit: (val: GenericObject) => emits('submit', val),
      };
});

const formCollapsed = computed(() => {
  return props.collapsed && isCalculated.value;
});

const computedSchema = computed(
  (): (Omit<FormSchema, 'formFieldProps'> & {
    commonComponentProps: Record<string, any>;
    formFieldProps: Record<string, any>;
  })[] => {
    const {
      colon = false,
      componentProps = {},
      controlClass = '',
      disabled,
      disabledOnChangeListener = true,
      disabledOnInputListener = true,
      emptyStateValue = undefined,
      formFieldProps = {},
      formItemClass = '',
      hideLabel = false,
      hideRequiredMark = false,
      labelClass = '',
      labelWidth = 100,
      modelPropName = '',
      wrapperClass = '',
    } = mergeWithArrayOverride(props.commonConfig, props.globalCommonConfig);
    const finalVal = (props.schema || []).map((schema, index) => {
      const keepIndex = keepFormItemIndex.value;

      const hidden =
        // 折叠状态 & 显示折叠按钮 & 当前索引大于保留索引
        props.showCollapseButton && !!formCollapsed.value && keepIndex
          ? keepIndex <= index
          : false;

      return {
        colon,
        disabled,
        disabledOnChangeListener,
        disabledOnInputListener,
        emptyStateValue,
        hideLabel,
        hideRequiredMark,
        labelWidth,
        modelPropName,
        wrapperClass,
        ...schema,
        commonComponentProps: componentProps,
        componentProps: schema.componentProps,
        controlClass: cn(controlClass, schema.controlClass),
        formFieldProps: {
          ...formFieldProps,
          ...schema.formFieldProps,
        },
        formItemClass: cn(
          'flex-shrink-0',
          { hidden },
          formItemClass,
          schema.formItemClass,
        ),
        labelClass: cn(labelClass, schema.labelClass),
      };
    });
    return finalVal;
  },
);
const getPopupContainer = () => {
  return wrapperRef.value || document.body;
};
const handleDeleteItem = (index: number) => {
  const newIndex = advSearchItems.value.indexOf(
    showAdvSearchItems.value[index] as AdvSearchItem,
  );
  advSearchItems.value.splice(newIndex, 1);
};
</script>

<template>
  <component :is="formComponent" v-bind="formComponentProps">
    <div ref="wrapperRef" :class="wrapperClass" class="grid">
      <template v-for="cSchema in computedSchema" :key="cSchema.fieldName">
        <!-- <div v-if="$slots[cSchema.fieldName]" :class="cSchema.formItemClass">
          <slot :definition="cSchema" :name="cSchema.fieldName"> </slot>
        </div> -->
        <FormField
          v-bind="cSchema"
          :class="cSchema.formItemClass"
          :rules="cSchema.rules"
        >
          <template #default="slotProps">
            <slot v-bind="slotProps" :name="cSchema.fieldName"> </slot>
          </template>
        </FormField>
      </template>
      <slot :shapes="shapes"></slot>
    </div>
    <div
      class="flex flex-wrap gap-y-[4px] pb-2 pl-2"
      v-if="showOuterAdvSearch && showAdvSearchItems.length > 0"
    >
      <template v-for="(_, index) in showAdvSearchItems" :key="_.id">
        <div>
          <AdvancedSearchItem
            :adv-search-fields="advSearchFields"
            v-model:item="showAdvSearchItems[index]!"
            :field-static="true"
            :operator-static="true"
            :value-static="true"
            :get-popup-container="getPopupContainer"
            :delete-item="
              () => {
                handleDeleteItem(index);
              }
            "
          />
        </div>
      </template>
    </div>
  </component>
</template>

<script lang="ts" setup>
import type { Component } from 'vue';

import type { AnyPromiseFunction } from '@vben/types';

import { computed, ref, unref, useAttrs, watch } from 'vue';

import { LoaderCircle } from '@vben/chc-icons';

import { get, isEqual, isFunction } from '@vben-core/shared/utils';

import { objectOmit } from '@vueuse/core';

type OptionsItem = {
  [name: string]: any;
  children?: OptionsItem[];
  disabled?: boolean;
  label?: string;
  value?: string;
};

interface Props {
  /** 在api请求之后的回调函数 */
  afterFetch?: AnyPromiseFunction<any, any>;
  /** 每次`visibleEvent`事件发生时都重新请求数据 */
  alwaysLoad?: boolean;
  /** 获取options数据的函数 */
  api?: (props: any, arg?: any) => Promise<OptionsItem[] | Record<string, any>>;
  /** 在api请求之前的回调函数 */
  beforeFetch?: AnyPromiseFunction<any, any>;
  /** children字段名，需要层级数据的组件可用 */
  childrenField?: string;
  /** 组件 */
  component: Component;
  /** 是否立即调用api */
  immediate?: boolean;
  /** label字段名 */
  labelField?: string;
  /** 组件的插槽名称，用来显示一个"加载中"的图标 */
  loadingSlot?: string;
  /** 组件的v-model属性名，默认为modelValue。部分组件可能为value */
  modelPropName?: string;
  /** 是否将value从数字转为string */
  numberToString?: boolean;
  /** 直接传入选项数据，也作为api返回空数据时的后备数据 */
  options?: OptionsItem[];
  /** 组件接收options数据的属性名 */
  optionsPropName?: string;
  /** 传递给api的参数 */
  params?: Record<string, any>;
  /** 从api返回的结果中提取options数组的字段名 */
  resultField?: string;
  /** value字段名 */
  valueField?: string;
  /** 触发api请求的事件名 */
  visibleEvent?: string;
}

defineOptions({
  name: 'ApiComponent',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  afterFetch: undefined,
  alwaysLoad: false,
  api: undefined,
  beforeFetch: undefined,
  immediate: true,
  labelField: 'label',
  loadingSlot: '',
  modelPropName: 'modelValue',
  numberToString: false,
  options: () => [],
  optionsPropName: 'options',
  paginate: false,
  params: () => ({}),
  resultField: '',
  valueField: 'value',
  visibleEvent: '',
  childrenField: '',
});

const emit = defineEmits<{
  optionsChange: [OptionsItem[]];
}>();

const modelValue = defineModel({ default: '' });

const attrs = useAttrs();

const refOptions = ref<OptionsItem[]>([]);
const loading = ref(false);
// 首次是否加载过了
const isFirstLoaded = ref(false);

const getOptions = computed(() => {
  const { labelField, numberToString, valueField, childrenField } = props;

  const refOptionsData = unref(refOptions);

  function transformData(data: OptionsItem[]): OptionsItem[] {
    return data.map((item) => {
      const value = get(item, valueField);
      return {
        ...objectOmit(item, [labelField, valueField, childrenField]),
        label: get(item, labelField),
        value: numberToString ? `${value}` : value,
        ...(childrenField && item[childrenField]
          ? { children: transformData(item[childrenField]) }
          : {}),
      };
    });
  }

  const data: OptionsItem[] = transformData(refOptionsData);

  return data.length > 0 ? data : props.options;
});

const bindProps = computed(() => {
  return {
    [`onUpdate:${props.modelPropName}`]: (val: string) => {
      modelValue.value = val;
    },
    [props.modelPropName]: unref(modelValue),
    [props.optionsPropName]: unref(getOptions),
    ...objectOmit(attrs, [`onUpdate:${props.modelPropName}`]),
    ...(props.visibleEvent
      ? {
          [props.visibleEvent]: handleFetchForVisible,
        }
      : {}),
  };
});

async function fetchApi() {
  let { afterFetch, api, beforeFetch, params, resultField } = props;

  if (!api || !isFunction(api) || loading.value) {
    return;
  }
  refOptions.value = [];
  try {
    loading.value = true;
    if (beforeFetch && isFunction(beforeFetch)) {
      params = (await beforeFetch(params)) || params;
    }
    let res = await api(params);
    if (afterFetch && isFunction(afterFetch)) {
      res = (await afterFetch(res, modelValue.value)) || res;
    }
    isFirstLoaded.value = true;
    if (Array.isArray(res)) {
      refOptions.value = res;
      emitChange();
      return;
    }
    if (resultField) {
      refOptions.value = get(res, resultField) || [];
    }
    emitChange();
  } catch (error) {
    console.warn(error);
    // reset status
    isFirstLoaded.value = false;
  } finally {
    loading.value = false;
  }
}

async function handleFetchForVisible(visible: boolean) {
  if (visible) {
    if (props.alwaysLoad) {
      await fetchApi();
    } else if (!props.immediate && !unref(isFirstLoaded)) {
      await fetchApi();
    }
  }
}

watch(
  () => props.params,
  (value, oldValue) => {
    if (isEqual(value, oldValue)) {
      return;
    }
    fetchApi();
  },
  { deep: true, immediate: props.immediate },
);

function emitChange() {
  emit('optionsChange', unref(getOptions));
}
</script>
<template>
  <component
    :is="component"
    v-bind="bindProps"
    :placeholder="$attrs.placeholder"
  >
    <template v-for="item in Object.keys($slots)" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
    <template v-if="loadingSlot && loading" #[loadingSlot]>
      <LoaderCircle class="animate-spin" />
    </template>
  </component>
</template>

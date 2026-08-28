<script setup lang="ts">
import type { PaginationProps } from 'ant-design-vue';

import type { HtmlHTMLAttributes } from 'vue';

import type { RequestClientConfig } from '@vben/request';

import PinyinMatch from 'pinyin-match';

import {
  computed,
  defineComponent,
  onMounted,
  ref,
  unref,
  useAttrs,
  watch,
  onUnmounted,
} from 'vue';

import { LoaderCircle } from '@vben/chc-icons';

import { isFunction } from '@vben-core/shared/utils';

import { useDebounceFn } from '@vueuse/core';
import { Divider, Pagination, Select } from 'ant-design-vue';

import { useChcSelectListDataApi } from './api';

type ContentType =
  | 'application/json'
  | 'application/octet-stream'
  | 'application/x-www-form-urlencoded'
  | 'application/xml'
  | 'multipart/form-data'
  | 'text/html'
  | 'text/plain'
  | (string & {});
export type MaybeComponentPropKey =
  | 'options'
  | 'placeholder'
  | 'title'
  | keyof HtmlHTMLAttributes
  | (Record<never, never> & string);
export interface Params {
  /**
   * 当前页码
   * @default 1
   */
  current: number;
  /**
   * 依赖对象，包含所有依赖项的键值
   */
  dependencies: { [key: string]: any };
  /**
   * 数据查询路径
   */
  dictUrl: string;
  /**
   * 远程过滤时过滤字段使用的key
   */
  filterField: string;
  /**
   * 格式化接口数据的方法
   */
  formatInterfaceData: ((data: any) => QueryDataList) | undefined;
  /**
   * 接口需要
   * @default 20
   */
  limit: number;
  /**
   * 是否有分页
   * @default true
   */
  paginate: boolean;
  /**
   * 用于映射params内参数
   * 大致规则如下 例如 params.paramsMap={apiKey:'valueDemo'}
   * 则会将 apiKey作为键, params 内 valueDemo 属性的值作为值，拼接到url后
   * @default {}
   */
  paramsMap?: { [key: string]: any };
  /**
   * 用于过滤的字段值
   * @default ''
   */
  query: string;
  /**
   * 接口的默认配置参数
   */
  requestConfig: RequestClientConfig;
  /**
   * 数据查询每页数量
   * @default 20
   */
  size: number;
  /**
   * 开始数据索引
   * @default 0
   */
  start: number;
  /**
   * 指定依赖项对应到接口的字段
   */
  triggerFieldKeys: { [key: string]: string };
  /**
   * 依赖项field数组
   */
  triggerFields: string[];
  /**
   * 用于回显时根据该字段查询单条数据
   */
  value?: number | string;
  /**
   * valueField 用于映射value字段值给到接口
   */
  valueField?: string;
}
export interface DictData {
  [key: string]: any;
  label: string;
  value: number | string | undefined;
}
export interface ChcSelectOption {
  /**
   * a-select相关的属性
   */
  [key: string]: any;
  /**
   * 用于获取到接口数据后的处理方法
   */
  afterFetch?: (
    data: any,
    value?: number | number[] | string | string[],
  ) => QueryDataList;
  /**
   * 是否可以清除输入
   */
  allowClear?: boolean;
  /**
   * 接口模式 get / post
   * @default get
   */
  apiType?: ApiType;
  /**
   * 是否自动选择下拉数据的第一项
   * @default false
   */
  autoChooseFirstOption?: boolean;
  /**
   * 用于获取接口数据前处理params的方法
   */
  beforeFetch?: (params: Params) => Params;
  /**
   * 黑名单 在黑名单上的项，将不可选
   */
  blackList?: any[];
  /**
   * 可以通过键盘左右按键切换页数
   */
  changePageByKeyBoard?: boolean;
  /**
   * 全选项的label
   * @default 全选
   */
  chooseAllLabel?: string;
  /**
   * 是否在初始时自动激活第一项
   */
  defaultActiveFirstOption?: boolean;
  /**
   * 依赖数据对象
   */
  dependencies?: { [key: string]: any };
  /**
   * 动态查询接口路径
   */
  dictUrl?: string;
  /**
   * 接口额外字段
   * get接口会将该字段各数据拼接到链接中
   * post接口会将该字段各数据添加到body中
   */
  extraParams?: { [key: string]: any };
  /**
   * 是否前端过滤
   * @default false
   */
  filterByFrontEnd?: boolean;
  /**
   * showSearch过滤打开的场景下传递查询文本的接口字段
   * 指定过滤时查询接口字段
   * @default query
   */
  filterField?: string;
  /**
   * 用于格式化接口数据的方法
   * 接口返回数据后会调用该方法将接口返回数据做处理，该方法内可以获取到当前所有接口返回的下拉数据，不包含各种其他逻辑添加的option项，例如全部和当前页不包含的已选项
   */
  formatInterfaceData?: (data: any) => QueryDataList;
  /**
   * 预处理接口字段
   */
  handleParams?: (params: Params) => any;
  /**
   * 是否立即调用接口获取下拉数据
   * @default true
   */
  immediate?: boolean;
  /**
   * 指定label对应的key
   * @default label
   */
  labelField?: string;
  /**
   * Option数据加载完毕回调
   * @param params
   */
  onLoad?: (options: DictData[]) => any;
  /**
   * 仅在依赖项变化时，由用户主动触发fetchApi方法，才会查询下拉数据
   * @default false
   */
  onlySearchDataWhenDependencesChange?: boolean;
  /**
   * 用于展示下拉表格的配置,和原有的chc-select同样配置
   */
  optionColumns?: SelectOptionColumns;
  /**
   * options 直接传入选项数据，不走接口
   */
  options?: DictData[];
  /**
   * 下拉分页每页数量
   * @default 20
   */
  pageSize?: number;
  /**
   * 下拉是否展示分页
   * @default true
   */
  paginate?: boolean;
  /**
   * 用于映射params内参数
   * 大致规则如下 例如 params.paramsMap={apiKey:'valueDemo'}
   * 则会将 apiKey作为键, params 内 valueDemo 属性的值作为值，拼接到url后
   * @default {}
   */
  paramsMap?: { [key: string]: any };
  /**
   * 自定义查询接口
   */
  queryDataApi?: (
    params: Params,
    handleParams?: (params: Params) => any,
  ) => Promise<QueryDataList>;
  /**
   * 仅在下拉框拉起时调用接口查数据
   */
  refreshOptionsWhenOpenDropdown?: boolean;
  /**
   * 自定义接口配置参数
   */
  requestConfig?: RequestClientConfig;
  /**
   * 查询请求的接口Content-Type
   * @default application/json
   */
  requestContentType?: ContentType;
  /**
   * 是否展示全选项
   * @default undefined
   * 取值就是全选项对应的值
   */
  showChooseAll?: boolean | number | string;
  /**
   * 是否能筛选
   */
  showSearch?: boolean;
  /**
   *  指定依赖项对应到接口的字段
   */
  triggerFieldKeys?: { [key: string]: string };
  /**
   * 指定依赖字段，form内该字段变化，会触发本组件更新
   */
  triggerFields?: string[];
  /**
   * 指定value对应的key
   * @default value
   */
  valueField?: string;
  /**
   * 下拉框有时候当前值并不在下拉数据内，
   * 此时会通过modelValue继续查询接口，将modelValue对应的数据加入下拉列表内
   * 这个字段就是用来控制modelValue给到接口时所使用的字段key
   */
  queryModelValueField?: string;
}
defineOptions({
  name: 'ChcSelect',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ChcSelectOption>(), {
  autoChooseFirstOption: false,
  apiType: 'get',
  immediate: true,
  paginate: false,
  pageSize: 20,
  labelField: 'label',
  valueField: 'value',
  filterField: 'query',
  filterByFrontEnd: true,
  refreshOptionsWhenOpenDropdown: false,
  triggerFields: () => [],
  triggerFieldKeys: () => ({}),
  options: () => [],
  dictUrl: '',
  extraParams: () => ({}),
  formatInterfaceData: undefined,
  optionColumns: () => [],
  queryDataApi: undefined,
  handleParams: undefined,
  showChooseAll: undefined,
  chooseAllLabel: '全部',
  beforeFetch: undefined,
  afterFetch: undefined,
  onlySearchDataWhenDependencesChange: false,
  showSearch: true,
  allowClear: true,
  blackList: () => [],
  onLoad: undefined,
  requestConfig: () => ({}),
  requestContentType: undefined,
  dependencies: () => ({}),
  paramsMap: () => ({}),
  changePageByKeyBoard: true,
  defaultActiveFirstOption: true,
});
const emit = defineEmits([
  'change',
  'pageChange',
  'search',
  'focus',
  'blur',
  'dropdownVisibleChange',
  'load',
  // 'setModelValue',
]);
watch(
  () => {
    return props.dependencies;
  },
  (val: ChcSelectOption['dependencies']) => {
    params.value.dependencies = val || {};
    fetchApi();
  },
  {
    deep: true,
  },
);
const attrs = useAttrs();
const activeFirstOption = ref(props.defaultActiveFirstOption);
const bindProps = computed(() => {
  const extraProps = {
    onSearch: props.showSearch
      ? (val: string) => {
          props.defaultActiveFirstOption && (activeFirstOption.value = false);//在搜索字段变化时，将自动激活第一项关闭，这样回车就不会触发选中
          handleSearch(val);
        }
      : undefined,
    'onUpdate:value': (val: any) => {
        modelValue.value = val;
    },
    value: unref(modelValue)
  };
  return {
    showSearch: props.showSearch,
    allowClear: props.allowClear,
    ...attrs,
    ...extraProps,
  };
});
// 最终的下拉数据
const selectOptions = ref<DictData[]>([]);
const modelValue = defineModel<
  number | number[] | string | string[] | undefined
>({
  default: undefined,
});
const currentSelectItems = ref<DictData | DictData[]>();
currentSelectItems.value = attrs.mode === 'multiple' ? [] : undefined;
const loading = ref(false);
const triggerFields = computed(() => {
  return props.triggerFields && props.triggerFields.length > 0
    ? props.triggerFields
    : Object.keys(props.dependencies) || [];
});
// 首次是否加载过了
const isFirstLoaded = ref(false);
// 用于接口查询的数据
const params = ref<Params>({
  current: 1,
  dependencies: {},
  dictUrl: props.dictUrl,
  formatInterfaceData: props.formatInterfaceData,
  limit: props.pageSize,
  paginate: props.paginate,
  query: '',
  size: props.pageSize,
  triggerFields: triggerFields.value || [],
  triggerFieldKeys: props.triggerFieldKeys || {},
  filterField: props.filterField,
  start: 0,
  value: '',
  valueField: props.queryModelValueField || props.valueField,
  paramsMap: props.paramsMap,
  requestConfig: {
    ...props.requestConfig,
    headers:
      props.requestConfig.headers || props.requestContentType
        ? {
            ...props.requestConfig.headers,
            'Content-Type':
              props.requestContentType ||
              props.requestConfig.headers?.['Content-Type'],
          }
        : undefined,
  },
});
const pagination = ref<Partial<PaginationProps>>({
  showTotal: (total: number) => `共 ${total} 条`,
  simple: true,
  size: 'small',
  total: 0,
});
const computedWidth = computed(() => {
  return props.optionColumns && props.optionColumns.length > 0
    ? props.optionColumns.reduce((acc, cur) => {
        return acc + (cur.width || 100);
      }, 0) + 24
    : false;
});
/**
 * 前端过滤选项逻辑：支持中文原文模糊匹配 + 拼音匹配
 * - 中文：如输入"爱康" → 匹配"爱康处方转采购药房"
 * - 拼音：如输入"aikang" 或 "akcfzcgyyf" → 同样能匹配
 */
const filterOption = computed(() => {
  return props.filterByFrontEnd
    ? (input: string, currentOption: any) => {
        if (!currentOption.label) return false;
        const label = currentOption.label;
        return (
          label.toLowerCase().includes(input.toLowerCase()) ||
          PinyinMatch.match(label, input)
        );
      }
    : false;
});

// options模式下，监听options变化
watch(
  () => props.options,
  (val) => {
    if (!props.dictUrl && val && val.length > 0) {
      selectOptions.value = val.map((item) => {
        return {
          ...item,
          label: item[props.labelField],
          value: item[props.valueField],
        };
      });
    }
  },
  { deep: true },
);
// 下拉数据的缓存机制，用于将选中项缓存起来，切换页数时，将缓存的数据添加到当前页数据中，从而实现切换页数时，保留选中项
const cache = ref<SelectData[]>([]);
const toAddExtraParams = ref<{ [key: string]: any }>({});
const fetchQueue: any[] = [];
function fetchApi(paramsHandle?: (params: Params) => any) {
  const finalParamshandle =
    (props.handleParams && typeof props.handleParams === 'function') ||
    (paramsHandle && typeof paramsHandle === 'function')
      ? (params: Params) => {
          let midParams = params;
          if (props.handleParams && typeof props.handleParams === 'function') {
            midParams = props.handleParams(params);
          }
          if (paramsHandle && typeof paramsHandle === 'function') {
            midParams = paramsHandle(midParams);
          }
          return midParams;
        }
      : undefined;
  if (loading.value === true) {
    fetchQueue.push([fetchApi]);
  }
  return new Promise<any>((resolve, reject) => {
    (async () => {
      const api =
        props.queryDataApi ||
        (props.apiType === 'get'
          ? useChcSelectListDataApi({
              ...props.extraParams,
              ...(toAddExtraParams.value || {}),
            }).selectListDataGet
          : useChcSelectListDataApi({
              ...props.extraParams,
              ...(toAddExtraParams.value || {}),
            }).selectListDataPost);
      const { beforeFetch } = props;

      if (!api || !isFunction(api) || loading.value) {
        return;
      }
      selectOptions.value = [];
      try {
        loading.value = true;

        if (beforeFetch && isFunction(beforeFetch)) {
          params.value = (await beforeFetch(params.value)) || params.value;
        }
        let res = await api(
          { ...params.value, value: undefined },
          finalParamshandle,
        );
        if (props.afterFetch && isFunction(props.afterFetch)) {
          res = props.afterFetch(res, modelValue.value) || res;
        }
        pagination.value.total = res.total;
        if (Array.isArray(res)) {
          res = { records: res };
        }
        selectOptions.value =
          res.records && res.records.length > 0
            ? res.records.map((item: any) => {
                return {
                  ...item,
                  label: item[props.labelField],
                  value: item[props.valueField],
                };
              })
            : [];
        // if (params.value.dictUrl === '/baseHandleAction/warehouse.do?readWrite=Y') {
        //   console.log('modelValue.value:', modelValue.value);
        // }
        // 如果 modelValue 不在 selectOptions 中，并且打开分页的场景下，则需要查询到该值对应数据添加到 selectOptions 中
        if (modelValue.value && props.paginate) {
          if (Array.isArray(modelValue.value)) {
            if (modelValue.value.length > 0) {
              samelizeModalAndOptions(modelValue.value[0] as number | string);
            }
            // 如果modelValue是数组，就遍历比较并查询接口，获取对应options
            for (const element of modelValue.value) {
              // 判断element是否有值，是为了去掉全选项判断
              if (
                element &&
                !selectOptions.value.some((itemIn) => itemIn.value === element)
              ) {
                if (
                  currentSelectItems.value &&
                  currentSelectItems.value.length > 0 &&
                  (currentSelectItems.value as DictData[]).some(
                    (t) => t.value === element,
                  )
                ) {
                  // 先从当前选中项数组内取
                  selectOptions.value.unshift(
                    (currentSelectItems.value as DictData[]).find(
                      (t) => t.value === element,
                    ) as DictData,
                  );
                } else if (cache.value.some((t) => t.value === element)) {
                  // 当前选中项数组内没有，就在缓存中取
                  selectOptions.value.unshift(
                    cache.value.find((t) => t.value === element) as DictData,
                  );
                } else {
                  // 缓存中也没有 就根据 value 查询对应数据，添加到当前选中数据列表中
                  let res = await api(
                    beforeFetch && typeof beforeFetch === 'function'
                      ? beforeFetch({
                          ...params.value,
                          current: 1,
                          dictUrl: props.dictUrl,
                          limit: 20,
                          paginate: true,
                          size: 10,
                          start: 0,
                          value: element,
                        })
                      : {
                          ...params.value,
                          current: 1,
                          dictUrl: props.dictUrl,
                          limit: 20,
                          paginate: true,
                          size: 10,
                          start: 0,
                          value: element,
                        },
                    finalParamshandle,
                  );
                  if (props.afterFetch && isFunction(props.afterFetch)) {
                    res = props.afterFetch(res, modelValue.value) || res;
                  }
                  if (res && res.records && res.records.length > 0) {
                    const obj: DictData = {
                      ...res.records[0],
                      label: res.records[0][props.labelField],
                      value: res.records[0][props.valueField],
                    };
                    selectOptions.value.unshift(obj);
                    currentSelectItems.value?.push(obj);
                    // 往缓存内添加数据，保证缓存里只有五个
                    // cache.value.push(obj);
                    // cache.value.length > 5 && cache.value.shift();
                  }
                }
              }
            }
            if (modelValue.value.length > 0) {
              samelizeModalAndOptions(modelValue.value[0] as number | string);
            }
          } else {
            // 先根据当前值类型，将下拉项的value类型一致化
            samelizeModalAndOptions(modelValue.value);
            // 如果modelValue不是数组，就直接比较并查询接口，获取对应options
            if (
              !selectOptions.value.some(
                (itemIn) => itemIn.value === modelValue.value,
              )
            ) {
              if (
                currentSelectItems.value &&
                (currentSelectItems.value as DictData).value ===
                  modelValue.value
              ) {
                selectOptions.value.unshift(
                  currentSelectItems.value as DictData,
                );
              } else if (
                cache.value.some((t) => t.value === modelValue.value)
              ) {
                selectOptions.value.unshift(
                  cache.value.find(
                    (t) => t.value === modelValue.value,
                  ) as DictData,
                );
              } else {
                // 根据 value 查询对应数据
                let res = await api(
                  beforeFetch && typeof beforeFetch === 'function'
                    ? beforeFetch({
                        ...params.value,
                        current: 1,
                        dictUrl: props.dictUrl,
                        limit: 20,
                        paginate: true,
                        size: 10,
                        start: 0,
                        value: modelValue.value,
                      })
                    : {
                        ...params.value,
                        current: 1,
                        dictUrl: props.dictUrl,
                        limit: 20,
                        paginate: true,
                        size: 10,
                        start: 0,
                        value: modelValue.value,
                      },
                  finalParamshandle,
                );
                if (props.afterFetch && isFunction(props.afterFetch)) {
                  res = props.afterFetch(res, modelValue.value) || res;
                }
                if (res && res.records && res.records.length > 0) {
                  const obj: DictData = {
                    ...res.records[0],
                    label: res.records[0][props.labelField],
                    value: res.records[0][props.valueField],
                  };
                  selectOptions.value.unshift(obj);
                  currentSelectItems.value = obj;
                  // 往缓存内添加数据，保证缓存里只有五个
                  // cache.value.push(obj);
                  // cache.value.length > 5 && cache.value.shift();
                }
              }
              samelizeModalAndOptions(modelValue.value);
            }
          }
          isFirstLoaded.value = true; // 此时也需要认定已初次加载完
        } else if (modelValue.value) {
          if (!Array.isArray(modelValue.value)) {
            samelizeModalAndOptions(modelValue.value);
          } else if (
            Array.isArray(modelValue.value) &&
            modelValue.value.length > 0
          ) {
            samelizeModalAndOptions(modelValue.value[0] as number | string);
          }
        } else if (
          // 当前下拉组件没值
          selectOptions.value &&
          selectOptions.value.length > 0 &&
          !modelValue.value &&
          attrs.mode !== 'multiple' &&
          props.autoChooseFirstOption === true &&
          isFirstLoaded.value === false
        ) {
          // 添加自动选择下拉列表第一项逻辑
          const suitableOption = selectOptions.value[0];
          if (suitableOption && suitableOption.value) {
            modelValue.value = suitableOption.value;
            emit('change', suitableOption.value, suitableOption);
          }
        }
        if (
          props.showChooseAll !== undefined &&
          props.showChooseAll !== false
        ) {
          if (props.showChooseAll === true) {
            selectOptions.value.unshift({
              label: props.chooseAllLabel,
              value: '',
            });
          } else {
            selectOptions.value.unshift({
              label: props.chooseAllLabel,
              value: props.showChooseAll,
            });
          }
        }
        loading.value = false;
        if (fetchQueue.length > 0) {
          const [fn] = fetchQueue.shift();
          await fn();
        }
        resolve(selectOptions.value);
        // isFirstLoaded.value = true;
        // if (props.onLoad && isFunction(props.onLoad)) {
        //   props.onLoad(selectOptions.value);
        // }
      } catch (error) {
        reject(error);
        console.warn(error);
      } finally {
        loading.value = false;
        if (fetchQueue.length > 0) {
          const [fn] = fetchQueue.shift();
          await fn();
        }
      }
    })();
  });
}
// 统一modalValue 和 下拉选项的值类型
const samelizeModalAndOptions = (val: number | string) => {
  // 此处需要添加对于全选的情况的兼容，全选由于其值为可能为''，可能和后续值的类型不一致
  // showChooseAll

  if (props.showChooseAll === false || props.showChooseAll === undefined) {
    // 没有全选项时 长度为0 不做处理
    if (selectOptions.value.length < 1) {
      return;
    }
  } else {
    // 有全选项时 长度为1 不做处理
    if (selectOptions.value.length < 2) {
      return;
    }
  }

  const exampleItem =
    props.showChooseAll === false || props.showChooseAll === undefined
      ? selectOptions.value[0]
      : selectOptions.value[1];
  if (exampleItem && typeof val !== typeof exampleItem.value) {
    // 统一selectOptions的value类型
    if (typeof val === 'string') {
      selectOptions.value = selectOptions.value.map((item) => {
        return {
          ...item,
          value: String(item.value),
        };
      });
    } else if (typeof val === 'number') {
      selectOptions.value = selectOptions.value.map((item) => {
        return {
          ...item,
          value: Number(item.value),
        };
      });
    }
  }
};
const handleChange = (value: any, option: any) => {
  // modelValue.value = value;
  currentSelectItems.value = option;
  // console.log('handleChange', currentSelectItems.value);
  emit('change', value, option);
};
const handleSearch = useDebounceFn((value: string) => {
  if (!props.filterByFrontEnd && props.showSearch) {
    props.defaultActiveFirstOption && (activeFirstOption.value = true);//在触发查询时，将自动激活第一项打开，这样查询完成后，依然会自动激活第一个
    params.value.query = value || '';
    params.value.current = 1;
    fetchApi();
    emit('search', value);
  }
}, 300);
const handleKeyBoard = (e: KeyboardEvent) => {
  if (e.code === 'ArrowRight' && !e.ctrlKey && !e.shiftKey) {
    e.preventDefault();
    pageChange(params.value.current + 1);
  }
  // 物资下拉打开时点击左箭头
  if (e.code === 'ArrowLeft' && !e.ctrlKey && !e.shiftKey) {
    e.preventDefault();
    pageChange(params.value.current - 1);
  }
};
const handleFocus = (e: any) => {
  emit('focus', e);
  // 不是立即加载，没有加载过，并且仅在依赖项变化时加载关闭  则在聚焦时查询下下拉数据
  if (
    !props.immediate &&
    !isFirstLoaded.value &&
    !props.onlySearchDataWhenDependencesChange
  ) {
    fetchApi();
  }
  if (props.paginate && props.changePageByKeyBoard) {
    window.addEventListener('keydown', handleKeyBoard);
  }
};
const handleBlur = (e: any) => {
  emit('blur', e);
  if (props.paginate && props.changePageByKeyBoard) {
    window.removeEventListener('keydown', handleKeyBoard);
  }
};

const pageChange = (value: number) => {
  const pageCount = Math.ceil(pagination.value.total! / params.value.size);
  if (pageCount <= 1) {
    return null;
  }
  if (value > pageCount) {
    return null;
  } else if (value < 1) {
    return null;
  } else {
    params.value.current = value;
    params.value.start = (params.value.current - 1) * params.value.size;
    fetchApi();
    emit('pageChange', value);
  }
};
const dropdownVisibleChange = (open: boolean) => {
  emit('dropdownVisibleChange', open);
  if (open && props.refreshOptionsWhenOpenDropdown) {
    params.value.current = 1;
    params.value.start = 0;
    params.value.query = '';
    fetchApi();
  }
  if (props.paginate && props.changePageByKeyBoard) {
    if (open) {
      window.addEventListener('keydown', handleKeyBoard);
    } else {
      window.removeEventListener('keydown', handleKeyBoard);
    }
  }
};
const VNodes = defineComponent({
  props: {
    vnodes: {
      required: true,
      type: Object,
    },
  },
  render() {
    return this.vnodes;
  },
});
onMounted(async () => {
  // 根据dictUrl判断是走查询还是通过options直接渲染
  if (props.dictUrl) {
    // 根据immediate判断是否立即调用
    // 根据props.onlySearchDataWhenDependencesChange 判断是否仅在依赖项变化时加载
    // 仅在立即调用打开 并且 只在依赖变化时加载关闭 时才会初始化查询获取下拉数据
    if (props.immediate && !props.onlySearchDataWhenDependencesChange) {
      await fetchApi();
    }
    isFirstLoaded.value = true;
    if (props.onLoad && isFunction(props.onLoad)) {
      props.onLoad(selectOptions.value);
    }
  } else if (props.options && props.options.length > 0) {
    // 单独options模式，也支持下labelField和valueField
    selectOptions.value = props.options.map((item) => {
      return {
        ...item,
        label: item[props.labelField],
        value: item[props.valueField],
      };
    });
    if (
      selectOptions.value &&
      selectOptions.value.length > 0 &&
      !modelValue.value &&
      props.immediate &&
      attrs.mode !== 'multiple' &&
      props.autoChooseFirstOption === true &&
      isFirstLoaded.value === false
    ) {
      // 添加自动选择下拉列表第一项逻辑
      const suitableOption = selectOptions.value.find((item) => item.value);
      if (suitableOption && suitableOption.value) {
        modelValue.value = suitableOption.value;
        emit('change', modelValue.value, suitableOption);
      }
    }
    isFirstLoaded.value = true;
    if (props.onLoad && isFunction(props.onLoad)) {
      props.onLoad(selectOptions.value);
    }
  }
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyBoard);
});
const selectRef = ref();
const blur = () => {
  selectRef.value.blur();
};
const focus = () => {
  selectRef.value.focus();
};
const getSelectOptions = () => {
  return selectOptions.value;
};
const selectFirstOption: (mode?: 'includeNull' | 'notNull') => {
  [x: string]: any;
  label: string;
  value: string | number | undefined;
} | void = (mode: 'includeNull' | 'notNull' = 'notNull') => {
  if (finalShowOptions.value.length > 0) {
    if (mode === 'notNull') {
      const notNullItem = finalShowOptions.value.find((item) => {
        return item.value !== '';
      });
      if (notNullItem) {
        modelValue.value = notNullItem.value!;
        emit('change', notNullItem.value, notNullItem);
        return notNullItem;
      }
    } else {
      const finalItem = finalShowOptions.value[0]!;
      modelValue.value = finalItem.value!;
      emit('change', finalItem.value, finalItem);
      return finalItem;
    }
  }
};
const setModelValue = (val: string | number | undefined) => {
  modelValue.value = val;
  val !== undefined && samelizeModalAndOptions(val);
  emit(
    'change',
    val,
    selectOptions.value.find((item) => item.value === val),
  );
  // emit(
  //   'setModelValue',
  //   val,
  //   selectOptions.value.find((item) => item.value === val),
  // );
};
const clearOptions = () => {
  selectOptions.value = [];
  pagination.value.total = 0;
  params.value.current = 1;
};
const addExtraParams = (val: { [key: string]: any }) => {
  toAddExtraParams.value = val;
};
defineExpose({
  params: params.value,
  fetchApi,
  currentSelectItems: currentSelectItems.value,
  modelValue,
  blur,
  focus,
  pageChange,
  getSelectOptions,
  selectFirstOption,
  clearOptions,
  setModelValue,
  addExtraParams,
});
const finalShowOptions = computed(() => {
  // selectOptions.value.length;
  const finalList = selectOptions.value.map((item) => {
    return props.blackList.includes(item.value)
      ? { ...item, disabled: true }
      : { ...item };
  });
  return finalList;
});
</script>
<template>
  <Select
    ref="selectRef"
    v-bind="bindProps"
    :defaultActiveFirstOption="activeFirstOption"
    :dropdown-match-select-width="computedWidth"
    :dropdown-menu-style="{
      width: 'auto',
    }"
    :filter-option="filterOption"
    :options="finalShowOptions"
    :show-search="props.showSearch"
    @change="handleChange"
    @dropdown-visible-change="dropdownVisibleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template v-if="loading" #notFoundContent>
      <LoaderCircle class="animate-spin" />
    </template>
    <template v-for="item in Object.keys($slots)" #[item]="data">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
    <template #option="option" v-if="optionColumns && optionColumns.length > 0">
      <div style="display: flex; flex-wrap: nowrap; width: 100%">
        <span
          v-for="(col, index) in optionColumns"
          :key="index"
          :style="`float: left;padding-right: 10px;word-break: break-all;display:block;overflow:hidden;white-space: nowrap;text-overflow: ellipsis;width:${
            col.width ? col.width : 100
          }px; text-align: ${col.align || 'left'}`"
        >
          <span :title="option[col.name]">{{
            option[col.name] ? option[col.name] : '&nbsp;'
          }}</span>
        </span>
      </div>
    </template>

    <template #dropdownRender="{ menuNode }">
      <!-- @mousedown.stop.prevent @touchstart.stop.prevent -->
      <div class="custom-dropdown" @mousedown.stop.prevent>
        <template v-if="optionColumns && optionColumns.length > 0">
          <div class="tableHeader">
            <template v-for="col in optionColumns">
              <span
                v-if="col.header"
                :key="col.name"
                :style="`float: left;width:${col.width ? col.width : 100}px;text-align:center;`"
                >{{ col.header }}
              </span>
            </template>
          </div>
          <div style="height: 40px"></div>
        </template>
        <div class="dropdown-content" v-if="menuNode">
          <VNodes :vnodes="menuNode" />
        </div>
        <Divider v-if="paginate" style="margin: 10px 0" />
        <Pagination
          v-bind="pagination"
          v-if="paginate"
          @change="pageChange"
          v-model:current="params.current"
          v-model:page-size="params.size"
        />
      </div>
    </template>
  </Select>
</template>
<style scoped>
.custom-dropdown {
  padding: 8px;
}

.tableHeader {
  position: absolute;
  top: 0;
  z-index: 99;
  height: 40px;
  margin-top: 10px;
  font-family: 'HiraginoSansGB-W3';
  font-size: 14px;
  font-weight: 600;
  line-height: 40px;
  color: #fff;
  background: rgb(64 158 255);
}

.tableHeader span {
  box-sizing: border-box;
  width: 100px;
  text-align: center;
}

/* ::v-deep(.vxe-cell:has(.vxe-cell--wrapper:has(.vxe-number-input))) {
  padding: 0;
} */
</style>

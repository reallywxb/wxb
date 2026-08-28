import type { FormContext, GenericObject } from 'vee-validate';
import type { ZodTypeAny } from 'zod';

import type { HtmlHTMLAttributes } from 'vue';

import type { RequestClientConfig } from '@vben/request';

import { computed, defineComponent, h, ref } from 'vue';

import { globalShareState } from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';

import { useChcSelectDictDataApi, useChcSelectListDataApi } from './api';

export type MaybeComponentPropKey =
  | 'options'
  | 'placeholder'
  | 'title'
  | keyof HtmlHTMLAttributes
  | (Record<never, never> & string);
export type MaybeComponentProps = { [K in MaybeComponentPropKey]?: any };
type FormSchemaRuleType =
  | 'required'
  | 'selectRequired'
  | null
  | (Record<never, never> & string)
  | ZodTypeAny;
type FormActions = FormContext<GenericObject>;
type FormItemDependenciesCondition<T = boolean | PromiseLike<boolean>> = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
) => T;
type FormItemDependenciesConditionWithRules = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
) => FormSchemaRuleType | PromiseLike<FormSchemaRuleType>;
type FormItemDependenciesConditionWithProps = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
) => MaybeComponentProps | PromiseLike<MaybeComponentProps>;
type ContentType =
  | 'application/json'
  | 'application/octet-stream'
  | 'application/x-www-form-urlencoded'
  | 'application/xml'
  | 'multipart/form-data'
  | 'text/html'
  | 'text/plain'
  | (string & {});
interface ChcSelectOption {
  /**
   * a-select相关的属性
   */
  [key: string]: any;
  /**
   * 接口模式 get / post
   * @default get
   */
  apiType?: ApiType;
  /**
   * 表单联动 动态组件参数
   */
  dependencies_componentProps?: FormItemDependenciesConditionWithProps;
  /**
   * 表单联动 动态判断当前字段是否需要禁用
   */
  dependencies_disabled?: boolean | FormItemDependenciesCondition;
  /**
   * 表单联动 动态判断当前字段是否需要显示，不显示则直接销毁
   */
  dependencies_if?: boolean | FormItemDependenciesCondition;
  /**
   * 表单联动 动态判断当前字段是否必填
   */
  dependencies_required?: FormItemDependenciesCondition;
  /**
   * 表单联动 动态判断当前字段rules
   */
  dependencies_rules?: FormItemDependenciesConditionWithRules;
  /**
   * 表单联动 动态判断当前字段是否需要显示，不显示用css隐藏
   */
  dependencies_show?: boolean | FormItemDependenciesCondition;
  /**
   * 表单联动 字段变更时，都会触发该函数
   */
  dependencies_trigger?: FormItemDependenciesCondition<void>;
  /**
   * 动态查询接口路径
   */
  dictUrl: string;
  /**
   * 除value和label之外，额外添加到option项的字段
   */
  extraKeys?: string[];
  /**
   * 接口额外字段
   * get接口会将该字段各数据拼接到链接中
   * post接口会将该字段各数据添加到body中
   */
  extraParams?: { [key: string]: any };
  /**
   * 当前item项的fieldName
   * 如果有，则在依赖项变化时，会将该项数据清除
   * 有依赖项时使用，用于使用该字段在依赖项变化时，清空当前item
   */
  fieldName?: string;
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
  formatInterfaceData?: ((data: any) => QueryDataList) | null;
  /**
   * 指定label对应的key
   * @default label
   */
  labelField?: string;
  /**
   * 指定下拉组件是单选还是多选
   * @default ''
   */
  mode?: '' | 'combobox' | 'multiple' | 'tags';
  /**
   * 下拉组件change事件
   */
  onChange?: (value: SelectValue, option: SelectData | SelectData[]) => void;
  /**
   * 用于展示下拉表格的配置,和原有的chc-select同样配置
   */
  optionColumns?: SelectOptionColumns;
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
   * 自定义查询接口
   */
  queryDataApi?: (params: { [key: string]: any }) => Promise<QueryDataList>;
  /**
   * 自定义接口配置参数
   */
  requestConfig?: RequestClientConfig;
  /**
   * 查询请求的接口Content-Type
   * @default undefined
   */
  requestContentType?: ContentType;
  /**
   * 是否展示全选项
   * @default undefined
   * 取值就是全选项对应的值
   */
  showChooseAll?: number | string;
  /**
   * 是否可以输入文本过滤
   * @default true
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
}
interface SelectOption {
  [key: string]: any;
  apiType: ApiType;
  dependencies_componentProps?: FormItemDependenciesConditionWithProps;
  dependencies_disabled?: boolean | FormItemDependenciesCondition;
  dependencies_if?: boolean | FormItemDependenciesCondition;
  dependencies_required?: FormItemDependenciesCondition;
  dependencies_rules?: FormItemDependenciesConditionWithRules;
  dependencies_show?: boolean | FormItemDependenciesCondition;
  dependencies_trigger?: FormItemDependenciesCondition<void>;
  dictUrl: string;
  extraKeys: string[];
  extraParams?: { [key: string]: any };
  filterByFrontEnd?: boolean;
  filterField?: string; // 指定过滤时查询接口字段
  formatInterfaceData: ((data: any) => QueryDataList) | null;
  onChange?: (value: SelectValue, option: SelectData | SelectData[]) => void;
  optionColumns: SelectOptionColumns;
  pageSize: number;
  paginate?: boolean;
  queryDataApi?: (params: { [key: string]: any }) => Promise<QueryDataList>;
  showChooseAll?: number | string; // 展示全选选项 值就是全选对应取值
  showSearch?: boolean;
  triggerFieldKeys?: { [key: string]: string };
  triggerFields?: string[];
}
export function useChcListSelect(chcSelectOption?: ChcSelectOption) {
  const cache: SelectData[] = [];
  const defaultOption = {
    apiType: 'get' as ApiType,
    dictUrl: '',
    extraKeys: [],
    extraParams: {},
    fieldName: '',
    filterField: 'query',
    formatInterfaceData: null,
    labelField: 'label',
    mode: '',
    optionColumns: [],
    pageSize: 20,
    paginate: true, // 是否展示分页
    showChooseAll: undefined,
    showSearch: true,
    triggerFieldKeys: {},
    triggerFields: [],
    valueField: 'value',
    filterByFrontEnd: false,
    requestConfig: {},
    requestContentType: undefined,
  };
  const option: SelectOption = {
    ...defaultOption,
    ...chcSelectOption,
  };
  // 初始化请求配置，主要是初始自定义请求头
  option.requestConfig = {
    ...option.requestConfig,
    headers:
      option.requestConfig.headers || option.requestContentType
        ? {
            ...option.requestConfig.headers,
            'Content-Type':
              option.requestContentType ||
              option.requestConfig.headers?.['Content-Type'],
          }
        : undefined,
  };
  const params = ref({
    current: 1,
    dependencies: {},
    dictUrl: option.dictUrl,
    // dispatchDependencies: Date.now(),
    formatInterfaceData: option.formatInterfaceData || null,
    limit: 20,
    paginate: option.paginate,
    query: '',
    size: option.pageSize,
    start: 0,
    value: '',
  });
  const pagination = ref({
    simple: true,
    size: 'small',
    total: 0,
  });
  // 根据dictUrl内是否有 {{}} 判断，如果存在就将其内部的字段取出来给到 triggerFields
  // 如果传了 triggerFields 字段就不取了，直接用 option 的 triggerFields
  if (!option.triggerFields || option.triggerFields.length === 0) {
    option.triggerFields = [];
    const reg = /\{\{(\w+)\}\}/g;
    const hasDependencies = reg.test(option.dictUrl);
    const linkFields = option.dictUrl.match(reg) as string[];
    if (hasDependencies) {
      for (const goodStr of linkFields) {
        const fieldName = goodStr?.slice(2, -2);
        option.triggerFields.push(fieldName);
      }
    }
  }
  const queryApi =
    option.queryDataApi ||
    (option.apiType === 'get'
      ? useChcSelectListDataApi(option.extraParams).selectListDataGet
      : useChcSelectListDataApi(option.extraParams).selectListDataPost);
  const filterOption = (input: string, currentOption: any) => {
    return (
      currentOption.label &&
      currentOption.label.toLowerCase().includes(input.toLowerCase())
    );
  };
  return {
    componentProps: () => {
      return {
        // 菜单接口转options格式
        afterFetch: async (
          data: QueryDataList,
          modalValue: number | number[] | string | string[],
        ) => {
          if (option.paginate) {
            pagination.value.total = data.total as number;
          }
          // 根据 option.optionColumns 修改showOption字段
          const keys = new Set(['label', 'value']);
          const showOptions: SelectData[] = data.records.map((item: any) => {
            const obj: SelectData = {
              label: item[option.labelField],
              value: item[option.valueField],
            };
            // 检查 option.optionColumns 是否存在
            if (option.optionColumns && option.optionColumns.length > 0) {
              for (let i = 0; i < option.optionColumns.length; i++) {
                const column = option.optionColumns[i];
                if (column && !keys.has(column.name)) {
                  obj[column.name] = item[column.name] || '';
                }
              }
            }
            if (option.extraKeys.length > 0) {
              for (let i = 0; i < option.extraKeys.length; i++) {
                obj[option.extraKeys[i] as string] =
                  item[option.extraKeys[i] as string] || '';
              }
            }
            return obj;
          });
          // 如果 modalValue 不在 showOptions 中，并且打开分页的场景下，则需要查询到该值对应数据添加到 showOptions 中
          if (modalValue && option.paginate) {
            if (Array.isArray(modalValue)) {
              // 如果modalvalue是数组，就遍历比较并查询接口，获取对应options
              for (const element of modalValue) {
                if (!showOptions.some((itemIn) => itemIn.value === element)) {
                  if (cache.some((t) => t.value === element)) {
                    showOptions.unshift(
                      cache.find((t) => t.value === element) as SelectData,
                    );
                  } else {
                    // 根据 value 查询对应数据
                    const res: QueryDataList = await queryApi({
                      current: 1,
                      dictUrl: option.dictUrl,
                      limit: 20,
                      paginate: true,
                      size: 10,
                      start: 0,
                      value: element,
                      requestConfig: option.requestConfig,
                    });
                    if (res && res.records && res.records.length > 0) {
                      // 根据 option.optionColumns 往数据列表里加字段
                      const obj: SelectData = {
                        label: res.records[0][option.labelField],
                        value: res.records[0][option.valueField],
                      };
                      if (
                        option.optionColumns &&
                        option.optionColumns.length > 0
                      ) {
                        for (let i = 0; i < option.optionColumns.length; i++) {
                          const column = option.optionColumns[i];
                          if (column && !keys.has(column.name)) {
                            obj[column.name] =
                              res.records[0][column.name] || '';
                          }
                        }
                      }
                      showOptions.unshift(obj);
                      // 往缓存内添加数据，保证缓存里只有五个
                      cache.push(obj);
                      cache.length > 5 ? cache.shift() : null;
                    }
                  }
                }
              }
            } else {
              // 如果modalvalue不是数组，就直接比较并查询接口，获取对应options
              if (!showOptions.some((itemIn) => itemIn.value === modalValue)) {
                if (cache.some((t) => t.value === modalValue)) {
                  showOptions.unshift(
                    cache.find((t) => t.value === modalValue) as SelectData,
                  );
                } else {
                  // 根据 value 查询对应数据
                  const res: QueryDataList = await queryApi({
                    current: 1,
                    dictUrl: option.dictUrl,
                    limit: 20,
                    paginate: true,
                    size: 10,
                    start: 0,
                    value: modalValue,
                    requestConfig: option.requestConfig,
                  });
                  if (res && res.records && res.records.length > 0) {
                    // 根据 option.optionColumns 往数据列表里加字段
                    const obj: SelectData = {
                      label: res.records[0][option.labelField],
                      value: res.records[0][option.valueField],
                    };
                    if (
                      option.optionColumns &&
                      option.optionColumns.length > 0
                    ) {
                      for (let i = 0; i < option.optionColumns.length; i++) {
                        const column = option.optionColumns[i];
                        if (column && !keys.has(column.name)) {
                          obj[column.name] = res.records[0][column.name] || '';
                        }
                      }
                    }
                    showOptions.unshift(obj);
                    // 往缓存内添加数据，保证缓存里只有五个
                    cache.push(obj);
                    cache.length > 5 ? cache.shift() : null;
                  }
                }
              }
            }
          }
          // console.log('showOptions', option.dictUrl, showOptions);
          if (option.showChooseAll !== undefined) {
            showOptions.unshift({
              label: '全选',
              value: option.showChooseAll,
            });
          }
          return showOptions;
        },
        // 菜单接口
        api: queryApi,
        filterOption: option.filterByFrontEnd ? filterOption : false,
        onChange: option.onChange,
        onDropdownVisibleChange: () => {
          if (params.value.current !== 1 || params.value.query !== '') {
            params.value.current = 1;
            params.value.start = 0;
            params.value.query = '';
          }
        },
        onPageChange: (value: string) => {
          params.value.current = Number.parseInt(value);
          params.value.start = (params.value.current - 1) * params.value.size;
        },
        onSearch:
          !option.filterByFrontEnd && option.showSearch
            ? useDebounceFn((value: string) => {
                params.value.query = value || '';
                params.value.current = 1;
              }, 300)
            : undefined,
        optionColumns: option.optionColumns,
        paginate: true,
        pagination: {
          current: params.value.current,
          defaultPageSize: option.pageSize,
          simple: pagination.value.simple,
          size: pagination.value.size,
          total: pagination.value.total,
        },
        params: {
          current: params.value.current,
          dependencies: params.value.dependencies,
          dictUrl: params.value.dictUrl,
          filterField: option.filterField,
          formatInterfaceData: params.value.formatInterfaceData || null,
          limit: params.value.limit,
          paginate: params.value.paginate,
          query: params.value.query,
          size: params.value.size,
          start: params.value.start,
          triggerFieldKeys: option.triggerFieldKeys,
          triggerFields: option.triggerFields,
          requestConfig: option.requestConfig,
        },
        showSearch: option.showSearch,
        ...chcSelectOption,
        labelField: 'label',
        valueField: 'value',
      };
    },
    dependencies: {
      componentProps: option.dependencies_componentProps || undefined,
      disabled: option.dependencies_disabled || undefined,
      if: option.dependencies_if || undefined,
      required: option.dependencies_required || undefined,
      rules: option.dependencies_rules || undefined,
      show: option.dependencies_show || undefined,
      trigger: (
        values: Partial<Record<string, any>>,
        formApi: FormContext<GenericObject>,
      ) => {
        // if (option.dictUrl === 'sys/dept/deptList/{{orgId}}') {
        //   debugger;
        // }
        if (formApi.values[option.fieldName]) {
          formApi.setFieldValue(
            option.fieldName,
            option.mode === 'multiple' ? [] : undefined,
          );
          formApi.validateField(option.fieldName);
        }
        params.value.dependencies = { ...values };
        option.dependencies_trigger &&
          option.dependencies_trigger(values, formApi);
      },
      triggerFields: option.triggerFields,
    },
  };
}

export function useChcListSelectComponent(chcSelectOption?: ChcSelectOption) {
  const cache: SelectData[] = [];
  const defaultOption = {
    apiType: 'get' as ApiType,
    dictUrl: '',
    extraKeys: [],
    fieldName: '',
    filterField: 'query',
    formatInterfaceData: null,
    labelField: 'label',
    mode: '',
    optionColumns: [],
    pageSize: 20,
    paginate: true,
    showChooseAll: undefined,
    showSearch: true,
    valueField: 'value',
    filterByFrontEnd: false,
  };
  const option: SelectOption = { ...defaultOption, ...chcSelectOption };
  const params = ref({
    current: 1,
    dictUrl: option.dictUrl,
    formatInterfaceData: option.formatInterfaceData || null,
    limit: 20,
    paginate: option.paginate,
    query: '',
    size: option.pageSize,
    start: 0,
    value: '',
  });
  const pagination = ref({
    simple: true,
    size: 'small',
    total: 0,
  });
  const onDropdownVisibleChangeProp = () => {
    if (params.value.current !== 1 || params.value.query !== '') {
      params.value.current = 1;
      params.value.start = 0;
      params.value.query = '';
    }
  };
  const onPageChangeProp = (value: string) => {
    params.value.current = Number.parseInt(value);
    params.value.start = (params.value.current - 1) * params.value.size;
  };
  // const onSearchProp = option.showSearch
  //   ? useDebounceFn((value: string) => {
  //       params.value.query = value || '';
  //       params.value.current = 1;
  //     }, 300)
  //   : null;
  const queryApi =
    option.queryDataApi ||
    (option.apiType === 'get'
      ? useChcSelectListDataApi(option.extraParams).selectListDataGet
      : useChcSelectListDataApi(option.extraParams).selectListDataPost);
  const afterFetchProp = async (
    data: QueryDataList,
    modalValue: number | number[] | string | string[],
  ) => {
    if (option.paginate) {
      pagination.value.total = data.total as number;
    }
    // 根据 option.optionColumns 修改showOption字段
    const keys = new Set(['label', 'value']);
    const showOptions: SelectData[] = data.records.map((item: any) => {
      const obj: SelectData = {
        label: item[option.labelField],
        value: item[option.valueField],
      };
      // 检查 option.optionColumns 是否存在
      if (option.optionColumns && option.optionColumns.length > 0) {
        for (let i = 0; i < option.optionColumns.length; i++) {
          const column = option.optionColumns[i];
          if (column && !keys.has(column.name)) {
            obj[column.name] = item[column.name] || '';
          }
        }
      }
      if (option.extraKeys.length > 0) {
        for (let i = 0; i < option.extraKeys.length; i++) {
          obj[option.extraKeys[i] as string] =
            item[option.extraKeys[i] as string] || '';
        }
      }
      return obj;
    });
    // 如果 modalValue 不在 showOptions 中，则查询到该值对应数据添加到 showOptions 中
    if (modalValue && option.paginate) {
      if (Array.isArray(modalValue)) {
        // 如果modalvalue是数组，就遍历比较并查询接口，获取对应options
        for (const element of modalValue) {
          if (!showOptions.some((itemIn) => itemIn.value === element)) {
            if (cache.some((t) => t.value === element)) {
              showOptions.unshift(
                cache.find((t) => t.value === element) as SelectData,
              );
            } else {
              // 根据 value 查询对应数据
              const res: QueryDataList = await queryApi({
                current: 1,
                dictUrl: option.dictUrl,
                limit: 20,
                paginate: true,
                size: 10,
                start: 0,
                value: element,
              });
              if (res && res.records && res.records.length > 0) {
                // 根据 option.optionColumns 往数据列表里加字段
                const obj: SelectData = {
                  label: res.records[0][option.labelField],
                  value: res.records[0][option.valueField],
                };
                if (option.optionColumns && option.optionColumns.length > 0) {
                  for (let i = 0; i < option.optionColumns.length; i++) {
                    const column = option.optionColumns[i];
                    if (column && !keys.has(column.name)) {
                      obj[column.name] = res.records[0][column.name] || '';
                    }
                  }
                }
                showOptions.unshift(obj);
                // 往缓存内添加数据，保证缓存里只有五个
                cache.push(obj);
                cache.length > 5 ? cache.shift() : null;
              }
            }
          }
        }
      } else {
        // 如果modalvalue不是数组，就直接比较并查询接口，获取对应options
        if (!showOptions.some((itemIn) => itemIn.value === modalValue)) {
          if (cache.some((t) => t.value === modalValue)) {
            showOptions.unshift(
              cache.find((t) => t.value === modalValue) as SelectData,
            );
          } else {
            // 根据 value 查询对应数据
            const res: QueryDataList = await queryApi({
              current: 1,
              dictUrl: option.dictUrl,
              limit: 20,
              paginate: true,
              size: 10,
              start: 0,
              value: modalValue,
            });
            if (res && res.records && res.records.length > 0) {
              // 根据 option.optionColumns 往数据列表里加字段
              const obj: SelectData = {
                label: res.records[0][option.labelField],
                value: res.records[0][option.valueField],
              };
              if (option.optionColumns && option.optionColumns.length > 0) {
                for (let i = 0; i < option.optionColumns.length; i++) {
                  const column = option.optionColumns[i];
                  if (column && !keys.has(column.name)) {
                    obj[column.name] = res.records[0][column.name] || '';
                  }
                }
              }
              showOptions.unshift(obj);
              // 往缓存内添加数据，保证缓存里只有五个
              cache.push(obj);
              cache.length > 5 ? cache.shift() : null;
            }
          }
        }
      }
    }
    // 添加一个全选项
    if (option.showChooseAll !== undefined) {
      showOptions.unshift({
        label: '全选',
        value: option.showChooseAll,
      });
    }
    return showOptions;
  };
  const paginationProp = computed(() => {
    return {
      current: params.value.current,
      defaultPageSize: option.pageSize,
      simple: pagination.value.simple,
      size: pagination.value.size,
      total: pagination.value.total,
    };
  });
  const paramsProp = computed(() => {
    return {
      current: params.value.current,
      dictUrl: params.value.dictUrl,
      filterField: option.filterField,
      formatInterfaceData: params.value.formatInterfaceData || null,
      limit: params.value.limit,
      paginate: params.value.paginate,
      query: params.value.query,
      size: params.value.size,
      start: params.value.start,
    };
  });
  const filterOption = (input: string, currentOption: any) => {
    return (
      currentOption.label &&
      currentOption.label.toLowerCase().includes(input.toLowerCase())
    );
  };
  const ChcSelect = defineComponent(
    (props, ctx) => {
      return () => {
        return h(globalShareState.getComponents().ChcSelect, {
          afterFetch: afterFetchProp,
          api: queryApi,
          filterOption: option.filterByFrontEnd ? filterOption : false,
          onChange: (value: SelectValue, option: SelectData | SelectData[]) => {
            ctx.emit('change', value, option);
          },
          onDropdownVisibleChange: onDropdownVisibleChangeProp,
          onPageChange: onPageChangeProp,
          onSearch:
            !option.filterByFrontEnd && option.showSearch
              ? useDebounceFn((value: string) => {
                  params.value.query = value || '';
                  params.value.current = 1;
                }, 300)
              : undefined,
          // onSearch: onSearchProp,
          optionColumns: option.optionColumns,
          paginate: true,
          pagination: paginationProp.value,
          params: paramsProp.value,
          showSearch: option.showSearch,
          ...chcSelectOption,
          ...props,
        });
      };
    },
    {
      emits: ['change'],
    },
  );
  return [ChcSelect];
}
type ChcDictSelectOption = {
  /**
   * a-select相关的属性
   */
  [key: string]: any;
  /**
   * 接口模式 get / post
   * @default get
   */
  apiType?: ApiType;
  /**
   * 动态查询接口路径
   */
  dictUrl: string;
  /**
   * 指定label对应的key
   * @default label
   */
  labelField?: string;
  /**
   * 是否展示全选项
   * @default undefined
   * 取值就是全选项对应的值
   */
  showChooseAll?: boolean;
  /**
   * 指定value对应的key
   * @default value
   */
  valueField?: string;
};
export function useChcDictSelect(chcSelectOption?: ChcDictSelectOption) {
  const defaultOptions = {
    apiType: 'get',
    showChooseAll: false,
    // addTotalOption: false,
    dictUrl: '',
    labelField: 'label',
    valueField: 'value',
  };
  const options = { ...defaultOptions, ...chcSelectOption };
  const params = ref({
    dictUrl: options.dictUrl,
  });
  const filterOption = (input: string, option: any) => {
    return (
      option.label && option.label.toLowerCase().includes(input.toLowerCase())
    );
  };
  return () => {
    const queryApi =
      options.apiType === 'get'
        ? useChcSelectDictDataApi().selectDictDataGet
        : useChcSelectDictDataApi().selectDictDataPost;
    return {
      // 菜单接口转options格式
      afterFetch: (data: { name: string; path: string }[]) => {
        return options.showChooseAll
          ? [
              {
                label: '全部',
                value: '',
              },
              ...data.map((item: any) => ({
                label: item[options.labelField],
                value: item[options.valueField],
              })),
            ]
          : data.map((item: any) => ({
              label: item[options.labelField],
              value: item[options.valueField],
            }));
      },
      // 菜单接口
      api: queryApi,
      // api: useChcSelectDictDataApi().selectDictDataGet,
      filterOption,
      params: {
        dictUrl: params.value.dictUrl,
      },
      showSearch: true,
      ...chcSelectOption,
      labelField: 'label',
      valueField: 'value',
    };
  };
}

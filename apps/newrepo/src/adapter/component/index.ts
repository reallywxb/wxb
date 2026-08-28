/**
 * 通用组件共同的使用的基础组件，原先放在 adapter/form 内部，限制了使用范围，这里提取出来，方便其他地方使用
 * 可用于 vben-form、vben-modal、vben-drawer 等组件使用,
 */

import type { Component, SetupContext } from 'vue';

import type { BaseFormComponentType } from '@vben/common-ui';

import { h } from 'vue';

import {
  ChcSelect,
  DateGroup,
  Quill,
  SelectHook,
  SelectHookApiComponent,
  TimeGroup,
} from '@vben/chc-ui';
import { ApiComponent, globalShareState, IconPicker } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  AutoComplete,
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  InputPassword,
  InputSearch,
  Mentions,
  notification,
  Radio,
  RadioGroup,
  RangePicker,
  Rate,
  Select,
  Space,
  Switch,
  Tag,
  Textarea,
  TimePicker,
  TreeSelect,
  Upload,
} from 'ant-design-vue';

// import ChcSelect from '#/components/datatable/src/chc-select-new/index.vue';
// import DateGroup from '#/components/datatable/src/date-group/index.vue';
// import Quill from '#/components/datatable/src/quill/index.vue';
// import TimeGroup from '#/components/datatable/src/time-group/index.vue';

const withDefaultPlaceholder = <T extends Component>(
  component: T,
  type: 'input' | 'select',
) => {
  return (props: any, { attrs, slots }: Omit<SetupContext, 'expose'>) => {
    const placeholder = props?.placeholder || $t(`ui.placeholder.${type}`);
    return h(component, { ...props, ...attrs, placeholder }, slots);
  };
};

// 这里需要自行根据业务组件库进行适配，需要用到的组件都需要在这里类型说明
export type ComponentType =
  | 'ApiSelect'
  | 'ApiTreeSelect'
  | 'AutoComplete'
  | 'ChcSelect'
  | 'ChcSelectNew'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'DateGroup'
  | 'DatePicker'
  | 'DefaultButton'
  | 'Divider'
  | 'IconPicker'
  | 'Input'
  | 'InputNumber'
  | 'InputPassword'
  | 'InputSearch'
  | 'Mentions'
  | 'PrimaryButton'
  | 'Quill'
  | 'Radio'
  | 'RadioGroup'
  | 'RangePicker'
  | 'Rate'
  | 'Select'
  | 'Space'
  | 'Switch'
  | 'Tag'
  | 'Textarea'
  | 'TimeGroup'
  | 'TimePicker'
  | 'TreeSelect'
  | 'Upload'
  | BaseFormComponentType;

async function initComponentAdapter() {
  const components: Partial<Record<ComponentType, Component>> = {
    // 如果你的组件体积比较大，可以使用异步加载
    // Button: () =>
    // import('xxx').then((res) => res.Button),

    ApiSelect: (props, { attrs, slots }) => {
      return h(
        ApiComponent,
        {
          placeholder: $t('ui.placeholder.select'),
          ...props,
          ...attrs,
          component: Select,
          loadingSlot: 'suffixIcon',
          modelPropName: 'value',
          visibleEvent: 'onVisibleChange',
        },
        slots,
      );
    },
    ApiTreeSelect: (props, { attrs, slots }) => {
      return h(
        ApiComponent,
        {
          placeholder: $t('ui.placeholder.select'),
          ...props,
          ...attrs,
          component: TreeSelect,
          fieldNames: { label: 'label', value: 'value', children: 'children' },
          loadingSlot: 'suffixIcon',
          modelPropName: 'value',
          optionsPropName: 'treeData',
          visibleEvent: 'onVisibleChange',
        },
        slots,
      );
    },
    AutoComplete,
    // ChcSelect: (props, { attrs, slots }) => {
    //   return h(
    //     DatatableApiComponent,
    //     {
    //       placeholder: $t('ui.placeholder.select'),
    //       ...props,
    //       ...attrs,
    //       component: ChcSelect,
    //       loadingSlot: 'suffixIcon',
    //       modelPropName: 'value',
    //       visibleEvent: 'onVisibleChange',
    //     },
    //     slots,
    //   );
    // },
    ChcSelect,
    ChcSelectNew: ChcSelect,
    // ChcSelect,
    Checkbox,
    CheckboxGroup,
    DateGroup,
    DatePicker,
    // 自定义默认按钮
    DefaultButton: (props, { attrs, slots }) => {
      return h(Button, { ...props, attrs, type: 'default' }, slots);
    },
    Divider,
    IconPicker: (props, { attrs, slots }) => {
      return h(
        IconPicker,
        {
          iconSlot: 'addonAfter',
          inputComponent: Input,
          modelValueProp: 'value',
          ...props,
          ...attrs,
        },
        slots,
      );
    },
    Input: withDefaultPlaceholder(Input, 'input'),
    InputNumber: withDefaultPlaceholder(InputNumber, 'input'),
    InputSearch: withDefaultPlaceholder(InputSearch, 'input'),
    InputPassword: withDefaultPlaceholder(InputPassword, 'input'),
    Mentions: withDefaultPlaceholder(Mentions, 'input'),
    // 自定义主要按钮
    PrimaryButton: (props, { attrs, slots }) => {
      return h(Button, { ...props, attrs, type: 'primary' }, slots);
    },
    Radio,
    RadioGroup,
    RangePicker,
    Rate,
    Select: withDefaultPlaceholder(Select, 'select'),
    SelectHook: (props, { attrs, slots }) => {
      return h(
        SelectHookApiComponent,
        {
          placeholder: $t('ui.placeholder.select'),
          ...props,
          ...attrs,
          component: SelectHook,
          loadingSlot: 'suffixIcon',
          modelPropName: 'value',
          visibleEvent: 'onVisibleChange',
        },
        slots,
      );
    },
    Tag,
    Space,
    Switch,
    Textarea: withDefaultPlaceholder(Textarea, 'input'),
    TimeGroup,
    TimePicker,
    TreeSelect: withDefaultPlaceholder(TreeSelect, 'select'),
    Upload,
    // 富文本编辑器
    Quill,
  };

  // 将组件注册到全局共享状态中
  globalShareState.setComponents(components);

  // 定义全局共享状态中的消息提示
  globalShareState.defineMessage({
    // 复制成功消息提示
    copyPreferencesSuccess: (title, content) => {
      notification.success({
        description: content,
        message: title,
        placement: 'bottomRight',
      });
    },
  });
}

export { initComponentAdapter };

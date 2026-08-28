import type { ExtendedFormApi } from '@vben/common-ui';

import { ref } from 'vue';

export function addFormItemProps(
  field: any,
  props: any,
  formId?: number | string, // 用于区分不同form的id
) {
  formId && (formId = `popCon-${formId}`);
  // 根据type给component自动赋值
  if (!field.component && field.type) {
    switch (field.type) {
      case 'boolean': {
        field.component = 'ChcSelect';
        if (!props.options) {
          props.options = [
            {
              label: '全部',
              value: '',
            },
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
              value: 'false',
            },
          ];
        }

        break;
      }
      case 'select': {
        field.component = 'ChcSelect';
        break;
      }
      case 'text': {
        field.component = 'Input';
        break;
      }
      // No default
    }
  }
  if (!props['data-testid']) {
    props['data-testid'] =
      props['data-testid'] || `${field.component}_${field.fieldName}`;
  }
  if (props.placeholder === undefined) {
    if (
      field.component === 'Input' ||
      field.component === 'InputPassword' ||
      field.component === 'InputSearch' ||
      field.component === 'InputNumber' ||
      field.component === 'Textarea'
    ) {
      props.placeholder = `请输入${field.label}`;
    } else if (
      field.component === 'ChcSelectNew' ||
      field.component === 'ChcSelect' ||
      field.component === 'Select' ||
      field.component === 'SelectHook' ||
      field.component === 'TreeSelect'
    ) {
      props.placeholder = `请选择${field.label}`;
    }
  }
  // 将配置里的hidden转化成show=false写法
  if (field.hidden && !field.dependencies) {
    // 使用dependencies实现隐藏
    field.dependencies = {
      ...field.dependencies,
      triggerFields:
        field.dependencies &&
        field.dependencies.triggerFields &&
        field.dependencies.triggerFields.length > 0
          ? [...field.dependencies.triggerFields]
          : [field.fieldName],
      show: false,
    };
  }
  if (field.component === 'ChcSelect' || field.component === 'ChcSelectNew') {
    if (field.component === 'ChcSelectNew') {
      console.error('ChcSelectNew组件已弃用，请使用ChcSelect组件');
    }
    if (!props.getPopupContainer && formId) {
      props.getPopupContainer = () => {
        return document.querySelector(`.${formId}`);
      };
    }

    // 不再需要，已在ChcSelect中处理
    // if (!props.formatInterfaceData && !props.afterFetch) {
    //   props.afterFetch = (data: any) => {
    //     return data?.records ? data : { records: data };
    //   };
    // }
    if (props.paginate && props.filterByFrontEnd === undefined)
      props.filterByFrontEnd = false;
    if (
      props.showChooseAll === undefined &&
      !(field.rules && field.rules.includes('required')) &&
      props.mode !== 'multiple'
    ) {
      props.showChooseAll = ''; // 既是控制是否显示全部选项，也是全部选项对应的值
      if (!props.chooseAllLabel) props.chooseAllLabel = '全部';
    }
    if (props.dictUrl && props.dictUrl.includes('{{') && !props.dependencies) {
      // 有props.dependencies时，完全自定义控制依赖，自己写trigger，不会触发默认的trigger方法
      const regex = /\{\{(.*?)\}\}/g; // 使用非贪婪匹配来捕获{{}}内的内容
      const matches = props.dictUrl.match(regex); // 获取所有匹配项
      const contents = matches.map((match: string) => match.slice(2, -2));
      if (!field.dependencies) {
        field.dependencies = {};
      }
      if (!field.dependencies?.triggerFields) {
        field.dependencies.triggerFields = contents;
      }
      if (!field.dependencies?.trigger) {
        const depValues: { [key: string]: any } = {};
        contents.forEach((field: string) => {
          depValues[field] = '';
        });

        const dependencyValues = ref(depValues);
        props.dependencies = dependencyValues.value;
        // if (props.dictUrl === 'sys/dept/deptList/{{orgId}}') {
        //   console.log(field, props, contents, dependencyValues);
        // }
        field.dependencies.trigger = (value: any, formApi: ExtendedFormApi) => {
          contents.forEach((field: string) => {
            dependencyValues.value[field] = value[field];
          });
          formApi.setFieldValue(field.fieldName, undefined);
          // if (props.dictUrl === 'sys/dept/deptList/{{orgId}}') {
          //   console.log(
          //     field,
          //     props,
          //     contents,
          //     dependencyValues,
          //     props.dependencies,
          //   );
          // }
        };
      }
    } else if (
      props.dictUrl &&
      !props.dictUrl.includes('{{') &&
      field.dependencies &&
      field.dependencies.triggerFields &&
      field.dependencies.triggerFields.length > 0 &&
      !field.dependencies.if &&
      !field.dependencies.show &&
      !field.dependencies.disabled &&
      !field.dependencies.rules &&
      !field.dependencies.required &&
      !field.dependencies.componentProps &&
      !field.dependencies.trigger &&
      !props.dependencies // 有props.dependencies时，完全自定义控制依赖，自己写trigger，不会触发默认的trigger方法
    ) {
      const depValues: { [key: string]: any } = {};
      field.dependencies.triggerFields.forEach((field: string) => {
        depValues[field] = '';
      });
      const dependencyValues = ref(depValues);
      props.dependencies = dependencyValues.value;
      // let triggerCopy: (value: any, formApi: ExtendedFormApi) => void;
      // if (
      //   field.dependencies.trigger &&
      //   typeof field.dependencies.trigger === 'function'
      // ) {
      //   triggerCopy = field.dependencies.trigger;
      // }
      field.dependencies.trigger = (value: any, formApi: ExtendedFormApi) => {
        field.dependencies.triggerFields.forEach((field: string) => {
          dependencyValues.value[field] = value[field];
        });
        formApi.setFieldValue(field.fieldName, undefined);
        // if (triggerCopy) {
        //   triggerCopy(value, formApi);
        // }
      };
    }
  }
  return props;
}

export { packageFnOrObj } from '@vben/chc-ui';

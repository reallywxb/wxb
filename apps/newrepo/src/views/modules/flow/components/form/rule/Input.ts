import * as util from '#/utils/flow/objutil.js';

export function getValidateRule(item: any) {
  const itemProps = item.props;

  const checkConfig = (_: any, value: any, callback: any) => {
    if (item.required && util.isBlank(value)) {
      return callback(new Error(`请填写${item.name}`));
    }
    if (util.isBlank(value)) {
      return callback();
    }

    if (itemProps.minLength && value.length < itemProps.minLength) {
      return callback(new Error(`长度不能小于${itemProps.minLength}`));
    }

    if (itemProps.maxLength && value.length > itemProps.maxLength) {
      return callback(new Error(`长度不能大于${itemProps.maxLength}`));
    }
    if (util.isNotBlank(itemProps.regex)) {
      const regExp = new RegExp(itemProps.regex);
      if (!regExp.test(value)) {
        return callback(new Error(itemProps.regexDesc));
      }
    }
    return callback();
  };
  const ruleArray: any[] = [
    {
      validator: checkConfig,
      trigger: 'blur',
    },
  ];

  if (item.required) {
    ruleArray.push({
      required: true,
      message: `请填写${item.name}`,
      trigger: 'blur',
    });
  }
  return ruleArray;
}

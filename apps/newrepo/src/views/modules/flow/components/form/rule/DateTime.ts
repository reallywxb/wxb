import * as util from '#/utils/flow/objutil.js';

export function getValidateRule(item: any) {
  if (!item) {
    return [];
  }

  const itemProps = item.props;

  const checkConfig = (rule: any, value: any, callback: any) => {
    if (item.required && util.isBlank(value)) {
      return callback(new Error(`请填写${item.name}`));
    }
    if (util.isBlank(value)) {
      return callback();
    }

    if (itemProps.min) {
      const minDate = util.momentFunc(itemProps.min, 'YYYY-MM-DD HH:mm:ss');
      const valueDate = util.momentFunc(value, 'YYYY-MM-DD HH:mm:ss');
      if (valueDate.isBefore(minDate)) {
        return callback(new Error(`不能小于${itemProps.min}`));
      }
    }

    if (itemProps.max) {
      const maxDate = util.momentFunc(itemProps.max, 'YYYY-MM-DD  HH:mm:ss');
      const valueDate = util.momentFunc(value, 'YYYY-MM-DD  HH:mm:ss');
      if (maxDate.isBefore(valueDate)) {
        return callback(new Error(`不能大于${itemProps.max}`));
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

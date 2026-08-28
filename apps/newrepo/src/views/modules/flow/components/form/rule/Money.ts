import * as util from '#/utils/flow/objutil.js';

export function getValidateRule(item: any) {
  const itemProps = item.props;

  const checkConfig = (rule: any, value: any, callback: any) => {
    if (item.required && !value) {
      return callback(new Error(`请填写${item.name}`));
    }
    if (!value) {
      return callback();
    }

    if (!util.isNumber(value)) {
      return callback(new Error('请输入数字'));
    }

    if (
      itemProps.radixNum !== undefined &&
      util.getNumberRadixNum(value) > itemProps.radixNum
    ) {
      return callback(new Error(`小数位数不能大于${itemProps.radixNum}`));
    }

    if (itemProps.min && value < itemProps.min) {
      return callback(new Error(`数值不能小于${itemProps.min}`));
    }

    if (itemProps.max && value > itemProps.max) {
      return callback(new Error(`数值不能大于${itemProps.max}`));
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

export function getValidateRule(item: any) {
  const checkConfig = (_: any, value: any, callback: any) => {
    if (item.required && (!value || value.length === 0)) {
      return callback(new Error(`请上传${item.name}`));
    }
    if (!value || value.length === 0) {
      return callback();
    }

    if (value.length < item.props.min) {
      return callback(new Error(`上传数量不能小于${item.props.min}`));
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
      message: `请上传${item.name}`,
      trigger: 'blur',
    });
  }
  return ruleArray;
}

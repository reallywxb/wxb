export function getValidateRule(item: any) {
  const checkConfig = (_: any, value: any, callback: any) => {
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
      message: `请选择${item.name}`,
      trigger: 'blur',
    });
  }
  return ruleArray;
}

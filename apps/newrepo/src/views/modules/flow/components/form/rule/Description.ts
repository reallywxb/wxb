export function getValidateRule() {
  const checkConfig = (rule: any, value: any, callback: any) => {
    return callback();
  };
  const ruleArray: any[] = [
    {
      validator: checkConfig,
      trigger: 'blur',
    },
  ];

  return ruleArray;
}

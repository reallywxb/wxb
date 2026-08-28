export function getValidateRule(item: any) {
  const checkConfig = (_: any, value: any, callback: any) => {
    if (item.required && (!value || value.length === 0)) {
      return callback(new Error(`请上传${item.name}`));
    }
    if (!value || value.length === 0) {
      return callback();
    }

    if (item.props.min && value.length < item.props.min) {
      return callback(new Error(`上传数量不能小于${item.props.min}`));
    }
    if (item.props.suffixArray && item.props.suffixArray.length > 0) {
      for (const it of value) {
        const name = it.name;
        const suffix = name.slice(Math.max(0, name.lastIndexOf('.') + 1));
        if (!item.props.suffixArray.includes(suffix)) {
          return callback(new Error(`文件只支持${item.props.suffixArray}格式`));
        }
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
      message: `请上传${item.name}`,
      trigger: 'blur',
    });
  }
  return ruleArray;
}

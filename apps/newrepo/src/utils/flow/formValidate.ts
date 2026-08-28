import * as util from './objutil.ts';

export function inputValidate(configValue: any) {
  const minLength = configValue.props.minLength;
  const maxLength = configValue.props.maxLength;
  const value = configValue.props.value;
  const regex = configValue.props.regex;
  const regexDesc = configValue.props.regexDesc;

  if (minLength && maxLength && maxLength < minLength) {
    return {
      valid: false,
      msg: `${configValue.name}:长度设置错误`,
    };
  }
  if (util.isNotBlank(regex) && !util.isNotBlank(regexDesc)) {
    return {
      valid: false,
      msg: `${configValue.name}:请填写正则表达式提示语`,
    };
  }

  if (util.isNotBlank(value)) {
    if (minLength && value.length < minLength) {
      return {
        valid: false,
        msg: `${configValue.name}:默认值长度不能小于${minLength}`,
      };
    }
    if (maxLength && value.length > maxLength) {
      return {
        valid: false,
        msg: `${configValue.name}:默认值长度不能大于${maxLength}`,
      };
    }
    if (util.isNotBlank(regex)) {
      const reg = new RegExp(regex, 'g');
      if (!reg.test(value)) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值不符合正则表达式`,
        };
      }
    }
  }
  return {
    valid: true,
  };
}

export function descriptionValidate(configValue: any) {
  const placeHolder = configValue.placeholder;
  if (util.isBlank(placeHolder)) {
    return {
      valid: false,
      msg: `${configValue.name}:请设置提示`,
    };
  }
  return {
    valid: true,
  };
}

export function timeValidate(configValue: any) {
  const min = configValue.props.min;
  const max = configValue.props.max;
  const defaultValue = configValue.props.value;

  const format = 'HH:mm:ss';
  if (min && max) {
    const minDate = util.momentFunc(min, format);
    const maxDate = util.momentFunc(max, format);
    if (maxDate.isBefore(minDate)) {
      return {
        valid: false,
        msg: `${configValue.name}:值范围设置错误`,
      };
    }
  }

  if (defaultValue) {
    const valueDate = util.momentFunc(defaultValue, format);
    if (min) {
      const minDate = util.momentFunc(min, format);

      if (valueDate.isBefore(minDate)) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值不能小于${min}`,
        };
      }
    }
    if (max) {
      const maxDate = util.momentFunc(max, format);

      if (maxDate.isBefore(valueDate)) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值不能大于${max}`,
        };
      }
    }
  }

  return {
    valid: true,
  };
}

export function dateValidate(configValue: any) {
  const min = configValue.props.min;
  const max = configValue.props.max;
  const defaultValue = configValue.props.value;

  const format = 'YYYY-MM-DD';
  if (min && max) {
    const minDate = util.momentFunc(min, format);
    const maxDate = util.momentFunc(max, format);
    if (maxDate.isBefore(minDate)) {
      return {
        valid: false,
        msg: `${configValue.name}:值范围设置错误`,
      };
    }
  }

  if (defaultValue) {
    const valueDate = util.momentFunc(defaultValue, format);
    if (min) {
      const minDate = util.momentFunc(min, format);

      if (valueDate.isBefore(minDate)) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值不能小于${min}`,
        };
      }
    }
    if (max) {
      const maxDate = util.momentFunc(max, format);

      if (maxDate.isBefore(valueDate)) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值不能大于${max}`,
        };
      }
    }
  }

  return {
    valid: true,
  };
}

export function dateTimeValidate(configValue: any) {
  const min = configValue.props.min;
  const max = configValue.props.max;
  const defaultValue = configValue.props.value;

  const format = 'YYYY-MM-DD HH:mm:ss';
  if (min && max) {
    const minDate = util.momentFunc(min, format);
    const maxDate = util.momentFunc(max, format);
    if (maxDate.isBefore(minDate)) {
      return {
        valid: false,
        msg: `${configValue.name}:值范围设置错误`,
      };
    }
  }

  if (defaultValue) {
    const valueDate = util.momentFunc(defaultValue, format);
    if (min) {
      const minDate = util.momentFunc(min, format);

      if (valueDate.isBefore(minDate)) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值不能小于${min}`,
        };
      }
    }
    if (max) {
      const maxDate = util.momentFunc(max, format);

      if (maxDate.isBefore(valueDate)) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值不能大于${max}`,
        };
      }
    }
  }

  return {
    valid: true,
  };
}

export function numberValidate(configValue: any) {
  const min = configValue.props.min;
  const max = configValue.props.max;
  const defaultValue = configValue.props.value;
  const radixNum = configValue.props.radixNum;

  if (min && max && max < min) {
    return {
      valid: false,
      msg: `${configValue.name}:值范围设置错误`,
    };
  }

  if (radixNum) {
    if (min) {
      const num = util.getNumberRadixNum(min);
      if (num > radixNum) {
        return {
          valid: false,
          msg: `${configValue.name}:最小值小数点位数不能超过${radixNum}`,
        };
      }
    }
    if (max) {
      const num = util.getNumberRadixNum(max);
      if (num > radixNum) {
        return {
          valid: false,
          msg: `${configValue.name}:最大值小数点位数不能超过${radixNum}`,
        };
      }
    }
  }

  if (defaultValue) {
    if (radixNum) {
      const num = util.getNumberRadixNum(defaultValue);
      if (num > radixNum) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值小数点位数不能超过${radixNum}`,
        };
      }
    }
    if (min && defaultValue < min) {
      return {
        valid: false,
        msg: `${configValue.name}:默认值不能小于${min}`,
      };
    }
    if (max && defaultValue > max) {
      return {
        valid: false,
        msg: `${configValue.name}:默认值不能大于${max}`,
      };
    }
  }

  return {
    valid: true,
  };
}

export function selectValidate(configValue: any) {
  let options = configValue.props.options;
  if (!options) {
    options = [];
  }

  if (options.length === 0) {
    return {
      valid: false,
      msg: `${configValue.name}:请设置选项`,
    };
  }

  {
    const keyList = options.map((w) => w.key);
    const newList = [...new Set(keyList)];
    if (keyList.length > newList.length) {
      return {
        valid: false,
        msg: `${configValue.name}:选项值不能重复`,
      };
    }
  }
  {
    const length = options.filter(
      (res) => util.isBlank(res.key) || util.isBlank(res.value),
    ).length;
    if (length > 0) {
      return {
        valid: false,
        msg: `${configValue.name}:选项不能为空`,
      };
    }
  }

  {
    const keyList = options.map((w) => w.value);
    const newList = [...new Set(keyList)];
    if (keyList.length > newList.length) {
      return {
        valid: false,
        msg: `${configValue.name}:选项标签不能重复`,
      };
    }
  }
  // 判断远程加载
  if (configValue.props.dataFrom === 2) {
    const r = util.checkHttpSetting(
      configValue.props.remoteConfig,
      configValue.name,
    );
    if (!r.ok) {
      return {
        valid: false,
        msg: r.msg,
      };
    }
  }
  // 判断默认值
  const value = configValue.props.value;
  if (value) {
    for (const item of value) {
      const le = options.filter((res) => res.key === item.key).length;
      if (le <= 0) {
        return {
          valid: false,
          msg: `${configValue.name}:默认值非选项`,
        };
      }
    }
  }
  return {
    valid: true,
  };
}

export function fileValidate(configValue: any) {
  const min = configValue.props.min;
  const max = configValue.props.max;

  if (min && max && max < min) {
    return {
      valid: false,
      msg: `${configValue.name}:数量设置错误`,
    };
  }

  return {
    valid: true,
  };
}

export const formValidateDict = {
  Input: inputValidate,
  Textarea: inputValidate,
  Number: numberValidate,
  Money: numberValidate,
  Description: descriptionValidate,
  Date: dateValidate,
  DateTime: dateTimeValidate,
  Time: timeValidate,
  SingleSelect: selectValidate,
  MultiSelect: selectValidate,
  UploadFile: fileValidate,
  UploadImage: fileValidate,
};

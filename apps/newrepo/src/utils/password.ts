/**
 * 密码字符分为数字、小写字母、大写字母、特殊符号四类。
 * 强：密码串包含其中四种且密码长度大于8位
 * 中：密码串包含其中两到三种且密码长度大于6位
 * 弱：密码串包含其中一种
 */
export const getPasswordLevel = function (pwd: string) {
  if (!pwd) return 0;
  let result = 0;
  /*
	      定义一个函数，对给定的数分为四类(判断密码类型)，返回十进制1，2，4，8
	      数字 0001 -->1 48~57
	      小写字母 0010 -->2 97~122
	      大写字母 0100 -->4 65~90
	      特殊 1000 --> 8 其它
	    */
  for (let i = 0, len = pwd.length; i < len; ++i) {
    const num = pwd.codePointAt(i) || 0;
    result |= ((num) => {
      if (num >= 48 && num <= 57) {
        return 1;
      }
      if (num >= 97 && num <= 122) {
        return 2;
      }
      if (num >= 65 && num <= 90) {
        return 4;
      }
      return 8;
    })(num);
  }
  let level = 0;
  // 对result进行四次循环，计算其level
  for (let i = 0; i <= 4; i++) {
    if (result & 1) {
      level++;
    }
    // 右移一位
    result = result >>> 1;
  }
  switch (level) {
    case 0: {
      return 0;
    }
    case 1: {
      return 1;
    }
    case 2:
    case 3: {
      return pwd.length >= 6 ? 2 : 1;
    }
    case 4: {
      return pwd.length >= 8 ? 3 : 2;
    }
  }
  return level;
};

export const checkPasswordLevel = function (
  value: string,
  passwordLevel: number,
) {
  // 检查密码强度
  let requireLength = 0;
  if (passwordLevel >= 3) {
    requireLength = 8;
  } else if (passwordLevel === 2) {
    requireLength = 6;
  } else {
    requireLength = 3;
  }
  if (!value || value.length < requireLength) {
    return `密码不少于${requireLength}位`;
  }
  if (value && value.length > 20) return '密码不大于20位';
  if (getPasswordLevel(value) < passwordLevel) {
    switch (passwordLevel) {
      case 2: {
        return '密码需包含数字、小写字母、大写字母以及特殊字符中两种以上';
      }
      case 3: {
        return '密码需包含数字、小写字母、大写字母以及特殊字符';
      }
    }
  }
};

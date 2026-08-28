export interface FormConfigOptionVO {
  key: string;
  value: string;
}

export interface FormConfigVO {
  minLength: number;
  maxLength: number;
  privateVal: boolean;
  remoteConfig: object;
  dataFrom: number;
  value: '' | any;
  regex: '' | string;
  regexDesc: '' | string;
  min: number;
  max: number;
  radixNum: number;
  showChinese: boolean;
  self: boolean;
  multi: boolean;
  showThousandSymbol: boolean;
  fileList: any[];
  unit: string;
  options: FormConfigOptionVO[];
  maxSize: number;
  suffixArray: string[];
}

export interface FormVO {
  name: '' | string;
  id: '' | string;
  type: '' | string;
  typeName: '' | string;
  placeholder: string;
  required: boolean;
  icon: string;
  props: FormConfigVO;
}

export interface FormGroupVO {
  name: string;
  formList: FormVO[];
}

export interface FormConfigUserVO {
  id: string;
  name: string;
  type: string;
  avatar: string;
}

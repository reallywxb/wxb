import type { VxeGridProps } from 'vxe-table';

import type { PropType, CSSProperties } from 'vue';

import type { VbenFormProps, VbenFormSchema } from '@vben-core/form-ui';

import { useVbenForm } from '@vben-core/form-ui';

type DeepPartial<T> = T extends any[] // 或者 T extends Array<infer U>
  ? T
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T;

export const tableProps = {
  id: {
    type: String,
    required: true,
  },
  searchFormVertical: {
    type: Boolean,
    default: false,
  },
  searchFormSchema: {
    type: Array as PropType<VbenFormSchema[]>,
    default: [],
  },
  searchFormValidate: {
    type: Boolean,
    default: false,
  },
  searchFormOptions: {
    type: Object as PropType<VbenFormProps<any>>,
  },
  formConstructor: {
    type: Function as PropType<typeof useVbenForm>,
    default: useVbenForm,
  },
  gridOptions: {
    type: Object as PropType<Omit<VxeGridProps, 'data'>>,
    default: {},
  },
  data: {
    type: Object as PropType<VxeGridProps['data']>,
    default: [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  columns: {
    type: Object as PropType<VxeGridProps['columns']>,
    default: [],
  },
  tableContainerStyles: {
    type: Object as PropType<CSSProperties>,
    default: {},
  },
};

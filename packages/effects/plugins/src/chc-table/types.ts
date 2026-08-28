import type { VNode } from 'vue';
import { VxeGrid } from 'vxe-table';
import type { ExtendedFormApi } from '@vben-core/form-ui';
export type tableProps = {
  /** 基本属性 */
  id: string;
};

type VNodeChildAtom = boolean | null | number | string | undefined | VNode;
export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;
export type VNodeChild = VNodeArrayChildren | VNodeChildAtom;

export type ChcTableExports = {
  formApi: ExtendedFormApi;
  gridApi: InstanceType<typeof VxeGrid>;
  renderVN: () => VNodeChild;
};

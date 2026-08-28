import type { ChcGridInstance, ChcGridProps } from './types';

import { defineComponent, h, ref } from 'vue';

import { RequestClient } from '@vben/request';

import { useVbenForm as useChcForm } from '@vben-core/form-ui';
import { useVbenModal as useChcModal } from '@vben-core/popup-ui';

import ChcGrid from './chc-grid.vue';

// export type ChcGridInstance = InstanceType<typeof ChcGrid>;
export function useChcGrid({
  useVbenForm,
  isFormAreaVertical,
  requestClient,
  useVbenModal,
}: {
  isFormAreaVertical: boolean;
  requestClient: RequestClient;
  useVbenForm: typeof useChcForm;
  useVbenModal: typeof useChcModal;
}) {
  const Grid = defineComponent(
    (
      props: Omit<
        ChcGridProps,
        'isFormAreaVertical' | 'requestClient' | 'useVbenForm' | 'useVbenModal'
      >,
      { attrs, slots, expose },
    ) => {
      const chcGridRef = ref<ChcGridInstance>();
      const component = () =>
        h(
          ChcGrid,
          {
            useVbenForm,
            isFormAreaVertical,
            requestClient,
            useVbenModal,
            ...props,
            ...attrs,
            ref: chcGridRef,
          },
          slots,
        );
      // 将内部组件的实例方法暴露出去
      expose({
        get gridApi() {
          return chcGridRef.value?.gridApi;
        },
        get formApi() {
          return chcGridRef.value?.formApi;
        },
        get setLoading() {
          return chcGridRef.value?.setLoading;
        },
      });
      return component;
    },
    {
      name: 'ChcGrid',
      inheritAttrs: false,
    },
  );
  return Grid;
}

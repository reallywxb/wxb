// import type { SchemaColumnAndOptions } from '@vben/chc-ui';
// import type { VxeGridProps } from '@vben/plugins/src/vxe-table/types.ts';
//
// import { onMounted } from 'vue';
//
// import { useChcGrid } from '#/adapter/chc-ui.ts';
//
// import { gridDefaultOptions } from './config/gridDefaultOptions.ts';
//
// export function useCommonGrid(
//   gridProps: VxeGridProps,
//   originSchemaColumnAndOptions?: SchemaColumnAndOptions,
// ) {
//   // gridProps.formOptions = merge(formDefaultOptions, gridProps.formOptions);
//   gridProps.gridOptions = gridProps.gridOptions ?? gridDefaultOptions;
//
//   const [Grid, gridApi] = useChcGrid(gridProps, {
//     showRefreshBtn: true,
//     showCustomBtn: true,
//     ...originSchemaColumnAndOptions,
//   });
//
//   onMounted(() => {
//     gridApi.formApi.getValues().then((values) => {
//       gridApi.query(values);
//     });
//   });
//
//   return { Grid, gridApi };
// }

import type { VxeGridProps } from '@vben//plugins/src/vxe-table/types';
import type { SchemaColumnAndOptions } from '@vben/chc-ui';

import { useChcGrid } from '#/adapter/chc-ui';
import { formDefaultOptions, gridDefaultOptions } from '#/components/spd';
import { deepMerge } from '#/utils/util';

export const useCommonGrid = (
  options: VxeGridProps,
  chcOptions?: SchemaColumnAndOptions,
) => {
  const originFormOptions = options.formOptions || {};
  options.formOptions = deepMerge(formDefaultOptions, originFormOptions);
  const originGridOptions = options.gridOptions || {};
  options.gridOptions = deepMerge(gridDefaultOptions, originGridOptions);
  return useChcGrid(options, chcOptions);
};

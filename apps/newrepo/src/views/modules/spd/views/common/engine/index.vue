<script setup lang="ts">
import type { Component } from 'vue';

import type { GridColumn } from '@vben/chc-ui';
import type { VbenFormProps } from '@vben/common-ui';

import { defineAsyncComponent, h, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { Page, Spinner } from '@vben/common-ui';

import dayjs from 'dayjs';

import { useSpdGrid } from '#/components/spd';

import { getPageConfig } from './api';

const route = useRoute();

const urlParams: any = route.meta?.urlParams || {};
const handleExportFn: any = ref<any>();
type GridConfig = {
  commonFormOptions?: VbenFormProps;
  editFormOptions?: VbenFormProps;
  formSchema?: VbenFormProps['schema'];
  gridColumns?: GridColumn[];
  viewFormOptions?: VbenFormProps;
};
let toolbarConfig: {
  actions: {
    export: boolean;
  };
} = {
  actions: { export: false },
};
const getGridConfig: (conf: any) => [GridConfig, any] = (pageConfig: any) => {
  const gridConfig: GridConfig = {};
  const gridColumns: GridColumn[] = [
    { type: 'checkbox', title: '多选', width: 50, align: 'center' },
    { title: '序号', type: 'seq', width: 50, align: 'center' },
  ];
  const getAttrValue = (attrs: any[], name: string) => {
    if (!attrs) return undefined;
    const item = attrs.find((element) => element.name === name);
    return item ? item.value : '';
  };
  const getOptions = (items: any[]) => {
    if (!items) return undefined;
    const newItems: any[] = [];
    items.forEach((item) => {
      newItems.push({ id: item.value, name: item.name });
    });
    return newItems;
  };
  if (pageConfig.result && pageConfig.result.trl) {
    pageConfig.result.trl.forEach((column: any) => {
      const gridColumn: GridColumn = {
        field: column.field,
        minWidth: 60,
        width: column.width,
        title: column.title,
        sortable: true,
        visible: !(
          column.hidden === 'true' ||
          column.hidden === 1 ||
          column.hidden === true
        ),
        align: column.align,
        // TODO format: column.format,
      };
      gridColumns?.push(gridColumn);
    });
  }
  gridConfig.gridColumns = gridColumns;
  const formConfig: VbenFormProps['schema'] = [];
  if (pageConfig.search) {
    pageConfig.search.forEach((column: any) => {
      const searchColumn: any = {
        fieldName: column.field,
        label: column.title,
        formItemClass: 'col-span-1',
      };
      if (column.type === 'dateRange') {
        searchColumn.component = 'DateGroup';
        searchColumn.defaultValue = [
          dayjs(dayjs().format('YYYY-MM-DD'))
            .subtract(7, 'day')
            .format('YYYY-MM-DD'),
        ];
      } else if (column.type === 'select') {
        searchColumn.component = 'ChcSelect';
        searchColumn.componentProps = () => {
          return {
            mode:
              getAttrValue(column.attributes, 'multiple') === 'true'
                ? 'multiple'
                : undefined,
            maxTagCount: 1,
            autoChooseFirstOption:
              getAttrValue(column.attributes, 'chooseNull') === 'true'
                ? undefined
                : true,
            options: getAttrValue(column.attributes, 'data')
              ? getOptions(
                  JSON.generalParse(getAttrValue(column.attributes, 'data')),
                )
              : undefined,
            dictUrl: getAttrValue(column.attributes, 'url'),
            // showSearch: true,
            placeholder:
              getAttrValue(column.attributes, 'placeholder') ||
              `请选择${searchColumn.label}`,
            paginate: false,
            showChooseAll: getAttrValue(column.attributes, 'addNull')
              ? ''
              : undefined,
            immediate: true,
            labelField: 'name',
            valueField: 'id',
            afterFetch(res: any) {
              return { ...res, rows: undefined, records: res.rows };
            },
          };
        };
        searchColumn.defaultValue =
          getAttrValue(column.attributes, 'chooseNull') === 'true'
            ? ''
            : undefined;
      } else {
        searchColumn.component = 'Input';
        searchColumn.componentProps = {
          placeholder:
            getAttrValue(column.attributes, 'placeholder') ||
            `请输入${searchColumn.label}`,
        };
      }

      formConfig?.push(searchColumn);
    });
  }
  gridConfig.formSchema = formConfig;
  if (pageConfig.result && pageConfig.result.attributes) {
    toolbarConfig = {
      actions: {
        export: getAttrValue(pageConfig.result.attributes, 'export') === 'true',
      },
    };
  }

  return [gridConfig, toolbarConfig];
};
// const showGrid = ref<boolean>(true);

// 导入新增编辑和查看弹窗的表单配置
const asyncComponent = defineAsyncComponent({
  loader: () => {
    return new Promise<Component>((resolve) => {
      (() => {
        getPageConfig({ menuId: urlParams.menuId }).then((response) => {
          // 根据页面定义生成Grid配置
          const [gridConfig, toolbarConf] = getGridConfig(response.data);
          toolbarConfig = toolbarConf;
          const [ChcGrid, ChcGridApi, { handleExport }] = useSpdGrid(
            {
              formOptions: {
                handleSubmit: async (values) => {
                  console.warn('values', values);
                  const formValues = await ChcGridApi.formApi.getValues();
                  ChcGridApi.formApi.setLatestSubmissionValues(
                    toRaw(formValues),
                  );
                  ChcGridApi.reload(formValues);
                },
                commonConfig: {
                  labelClass: 'w-[90px]',
                },
              },
              gridOptions: {
                proxyConfig: {
                  autoLoad: false,
                },
              },
            },
            {
              gridColumns: gridConfig.gridColumns,
              formSchema: gridConfig.formSchema,
              commonFormOptions: gridConfig.commonFormOptions,
              viewFormOptions: gridConfig.viewFormOptions,
              editFormOptions: gridConfig.editFormOptions,
              queryUrl: `/baseHandleAction/invokeEngin.do?menuId=${urlParams.menuId}`,
              showToolbar: true,
              showCustomBtn: true,
              showZoomBtn: true,
              beforeFetchFn(params) {
                const newObj: { [key: string]: any } = {};
                for (const key in params) {
                  newObj[key] = Array.isArray(params[key])
                    ? params[key].join("','")
                    : params[key];
                }
                return newObj;
              },
              showExportBtn: toolbarConfig.actions.export,
              id: 'crud',
            },
          );
          handleExportFn.value = handleExport;
          resolve(ChcGrid);
        });
      })();
    });
  },
  loadingComponent: () =>
    h(Spinner, {
      spinning: true,
      minLoadingTime: 300,
      class: 'flex items-center justify-center h-full',
    }),
});
</script>
<template>
  <Page content-class="p-[0.5rem]" auto-content-height>
    <component :is="asyncComponent">
      <!-- <ChcGrid v-if="showGrid"> -->
      <!-- <template #toolbar-actions>
        <Button
          v-if="toolbarConfig.actions.export"
          type="primary"
          @click="handleExportFn"
          class="mr-[0.5rem]"
        >
          导 出
          <template #icon>
            <ExportActionIcon />
          </template>
        </Button>
      </template> -->
      <!-- </ChcGrid> -->
    </component>
  </Page>
</template>
<style scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.ant-btn > svg) {
  margin-bottom: 4px;
  margin-left: -2px;
}
</style>

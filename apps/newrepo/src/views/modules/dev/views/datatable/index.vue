<script lang="ts" setup>
import { reactive } from 'vue';

import { AntdSettingOutlined } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, TabPane, Tabs, Tooltip } from 'ant-design-vue';

import { requestClient } from '#/api/request';
import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';

import { actionGridOptions, colGridOptions, gridOptions } from './gridOptions';
import { useCommonModal } from './index';
import CommonGridModal from './modals/commonGridModal.vue';
import InterfaceTestModal from './modals/InterfaceTestModal.vue';
import ModelSourceModal from './modals/modelSourceModal.vue';
import PreviewModal from './modals/previewModal.vue';
import SqlFormModal from './modals/sqlFormModal.vue';
import { useSearchForm } from './searchFormOptions';

const parentTableParams = reactive({
  dataTableId: '',
});

const [Grid, gridApi] = useCommonGrid(
  {
    formOptions: useSearchForm(() => gridApi),
    gridOptions,
    gridEvents: {
      radioChange({ row }: { row: any }) {
        if (row) {
          colGridApi.grid.reloadData(row.fields);

          parentTableParams.dataTableId = row.id;

          actionGridApi.query();
        } else {
          colGridApi.grid.reloadData([]);

          parentTableParams.dataTableId = '';

          actionGridApi.grid.reloadData([]);
        }
      },
    },
  },
  {
    dataTableId: '/datatable/page',
  },
);

const [ColGrid, colGridApi] = useCommonGrid(
  {
    gridOptions: {
      ...colGridOptions,
    },
  },
  {
    dataTableId: '#',
    showRefreshBtn: false,
  },
);

const [ActionGrid, actionGridApi] = useCommonGrid(
  {
    gridOptions: {
      ...actionGridOptions,
      cellStyle({ row, column }: any) {
        if (
          (column.field === 'inputParameters' ||
            column.field === 'outputParameter') &&
          row[column.field]
        ) {
          return {
            color: '#0f74ff',
            cursor: 'pointer',
          };
        }
      },
    },
  },
  {
    dataTableId: '/datatable/getActions',
    parentTableParams,
    queryTableDataApi: (params) =>
      requestClient.get('/datatable/getActions', {
        params,
      }),
    gridEvents: {
      cellClick: ({ row, column }: { column: any; row: any }) => {
        if (column.field === 'inputParameters') {
          inputParamRef.value?.modalApi
            .setData({
              title: '输入参数',
              data: row.inputParameters,
            })
            .open();
        } else if (column.field === 'outputParameter') {
          outputParamRef.value?.modalApi
            .setData({
              title: '返回参数',
              data: [row.outputParameter],
            })
            .open();
        }
      },
    },
  },
);

const {
  genFormOption,
  sqlFormModalRef,
  modelSourceModalRef,
  previewModalRef,
  interfaceTestModalRef,
  inputParamRef,
  outputParamRef,
  inputGridOption,
  outputGridOption,
  createFromSQL,
  showModelSource,
  refresh,
  handlePreview,
  testInterface,
} = useCommonModal(gridApi);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplitLazy
      :is-vertical="false"
      :distribute="0.6"
      :line-thickness="4"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <Grid>
          <template #toolbar-actions>
            <Button type="primary" @click="createFromSQL()" class="mr-2">
              从sql生成
            </Button>
            <Button type="primary" @click="showModelSource()" class="mr-2">
              模型源码
            </Button>
            <Button type="primary" @click="refresh()"> 刷新列表 </Button>
          </template>
          <template #action="{ row }">
            <Tooltip effect="dark" title="界面预览" placement="top">
              <Button type="link" @click="handlePreview(row)">
                <template #icon>
                  <AntdSettingOutlined class="mb-[2px] text-[16px]" />
                </template>
              </Button>
            </Tooltip>
          </template>
        </Grid>
      </template>
      <template #second>
        <Tabs class="tabs">
          <TabPane key="1" tab="字段" class="tab-pane">
            <ColGrid />
          </TabPane>
          <TabPane key="2" tab="动作" class="tab-pane" force-render>
            <ActionGrid>
              <template #action="{ row }">
                <Tooltip effect="dark" title="接口测试" placement="top">
                  <Button type="link" @click="testInterface(row)">
                    <template #icon>
                      <AntdSettingOutlined class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </ActionGrid>
          </TabPane>
        </Tabs>
      </template>
    </PageSplitLazy>
    <SqlFormModal :form-option="genFormOption()" ref="sqlFormModalRef" />

    <ModelSourceModal
      :form-option="genFormOption('SOURCE')"
      ref="modelSourceModalRef"
    />

    <PreviewModal ref="previewModalRef" />
    <InterfaceTestModal ref="interfaceTestModalRef" />
    <CommonGridModal :grid-option="inputGridOption" ref="inputParamRef" />
    <CommonGridModal :grid-option="outputGridOption" ref="outputParamRef" />
  </Page>
</template>
<style lang="scss" scoped>
.tabs {
  height: 100%;

  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
</style>

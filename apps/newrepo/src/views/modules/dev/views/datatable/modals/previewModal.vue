<script lang="ts" setup>
import type { VxeGridProps } from 'vxe-table';

import type { DefineSetupFnComponent, PublicProps } from 'vue';

import type { ExtendedFormApi, ExtendedModalApi } from '@vben/common-ui';
import type { ExtendedVxeGridApi } from '@vben/plugins/src/vxe-table/types';

import { nextTick, reactive, ref } from 'vue';

import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  MdiLightDelete,
  PlusOutlined,
} from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Modal as AModal, Button, message, Tooltip } from 'ant-design-vue';

import { downloadByData } from '#/utils/file/download';
import { copyToBoard } from '#/utils/flow/objutil';
import {
  createTableData,
  delTableData,
  downloadCode,
  genCodeByDataTable,
  updateTableData,
} from '#/views/modules/dev/views/datatable/api/datatable';
import { transformComponent } from '#/views/modules/dev/views/datatable/util';
import { useCommonGrid } from '#/views/modules/sys/views/common/grid/commonGrid';
import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';

import CodeGenerationModal from './codeGenerationModal.vue';
import ConfigureQueryItemModal from './queryItemModal.vue';

defineOptions({
  name: 'PreviewModal',
});

enum Tab {
  // eslint-disable-next-line no-unused-vars
  Definition = 1,
  // eslint-disable-next-line no-unused-vars
  Plugin,
  // eslint-disable-next-line no-unused-vars
  Menu,
}

enum ModalMode {
  // eslint-disable-next-line no-unused-vars
  add,
  // eslint-disable-next-line no-unused-vars
  edit,
}

const DEFAULT_HIDDEN_COLS = new Set(['tenantId']);

const dataTableId = ref('');
const formMode = ref<number>(ModalMode.add);

let Grid: DefineSetupFnComponent<VxeGridProps, {}, object, any, PublicProps>,
  gridApi: ExtendedVxeGridApi;

const formOptions = {
  layout: 'vertical',
  schema: [] as any[],
  showCollapseButton: false,
  submitOnChange: false,
  submitOnEnter: false,
  wrapperClass: 'grid-cols-2',
};

const optionCode = ref('');
const loading = ref(true);
const hasWfProcInstId = ref(false);

const [Modal, modalApi] = useVbenModal({
  class: 'w-[70%]',
  footer: false,
  // destroyOnClose: true,
  async onOpened() {
    const { dataTableId: tableId, hasWfProcInstId: hasOrNot } =
      modalApi.getData();

    dataTableId.value = tableId;
    hasWfProcInstId.value = hasOrNot;

    try {
      optionCode.value = await genCodeByDataTable(dataTableId.value, {
        type: 'ui.option',
      });

      const {
        // columnMovable,
        // dialogEscape,
        // editBtn,
        // autoLoad,
        labelWidth,
        // title,
        // addBtn,
        // refreshBtn,
        // printBtn,
        // headerMenu,
        // stripe,
        // height,
        // border,
        // useVirtual,
        // exportBtn,
        // highlightCurrentRow,
        // searchBtn,
        column,
        index,
        // menu,
        // menuWidth,
        // logBtn,
        // columnBtn,
        size,
        indexLabel,
        // delBtn,
        // dialogClickModal,
        // rowKey,
      } = JSON.parse(optionCode.value);

      // 表格展示
      [Grid, gridApi] = useCommonGrid(
        {
          formOptions: {
            layout: 'horizontal',
            schema: [
              // 创建时必须有一个输入框，否则更新schema表单无法显示
              {
                component: 'Input',
                fieldName: '',
                label: '',
              },
            ],
            actionWrapperClass: 'formActionAreaStyle',
            collapsed: true,
            wrapperClass:
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
          },
          gridOptions: {
            size,
            height: '600px',
            columns: [
              index
                ? {
                    fixed: 'left',
                    title: indexLabel,
                    type: 'seq',
                    width: labelWidth,
                  }
                : null,
              ...column.map(
                ({ prop, labelProp, label: title, sortable, type, width }) => ({
                  field: prop,
                  title,
                  sortable,
                  // type,
                  width: width ?? labelWidth,
                  minWidth: width,
                  formatter:
                    type === 'switch'
                      ? ({ cellValue }: any) => (cellValue ? '是' : '否')
                      : (function () {
                          return labelProp && labelProp !== prop
                            ? (params: any) => params.row[labelProp]
                            : null;
                        })(),
                  visible: !DEFAULT_HIDDEN_COLS.has(prop),
                }),
              ),
              {
                align: 'center',
                field: 'action',
                fixed: 'right',
                slots: { default: 'action' },
                width: 120,
                title: '操作',
              },
            ].filter(({ visible }) => visible === undefined || visible),
            proxyConfig: {
              enabled: false,
            },
            /**
             * 开启虚拟滚动
             * 数据量小可以选择关闭
             * 如果遇到样式问题(空白、错位 滚动等)可以选择关闭虚拟滚动
             */
          },
          gridEvents: {},
        },
        {
          dataTableId: `/datatable/data/page/${dataTableId.value}?preview=true`,
          showToolbar: true,
          showCustomBtn: true,
        },
      );

      // 新增、编辑表单
      formOptions.schema = column
        .filter(
          ({ addDisplay, prop }: any) =>
            (addDisplay === undefined || addDisplay) &&
            !DEFAULT_HIDDEN_COLS.has(prop),
        )
        .map((col: any) => {
          return transformComponent(col, () => true);
        });

      // 手动隐藏搜索表单
      gridApi.toggleSearchForm(false);
    } catch (error) {
      console.error(error);
    } finally {
      nextTick(() => {
        loading.value = false;
      });
    }
  },
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    let text: string;

    switch (activeKey.value) {
      case Tab.Definition.toString(): {
        text = code.definition;
        break;
      }
      case Tab.Plugin.toString(): {
        text = code.plugin;
        break;
      }
      case Tab.Menu.toString(): {
        text = code.menu;
      }
    }

    await copyToBoard(text!);
  },
  onOpenChange(isOpen) {
    if (!isOpen) {
      loading.value = true;
    }
  },
});

const activeKey = ref(Tab.Menu.toString());

const code = reactive({
  definition: '',
  plugin: '',
  menu: '',
});

const modificationModalRef = ref<
  | (Record<string, any> & {
      formApi?: ExtendedFormApi;
      modalApi: ExtendedModalApi;
    })
  | undefined
>();

const queryItemModalRef = ref<
  | (Record<string, any> & {
      modalApi: ExtendedModalApi;
    })
  | undefined
>();

const codeGeneratorModalRef = ref<
  | (Record<string, any> & {
      modalApi: ExtendedModalApi;
    })
  | undefined
>();

function add() {
  formMode.value = ModalMode.add;

  modificationModalRef.value?.modalApi
    .setData({
      title: '新增',
      submit: (params: any) => createTableData(dataTableId.value, params),
    })
    .open();
}

function edit({ id, ...form }: any) {
  formMode.value = ModalMode.edit;

  modificationModalRef.value?.modalApi
    .setData({
      title: '编辑',
      form,
      submit: (params: any) =>
        updateTableData(dataTableId.value, {
          ...params,
          id,
        }),
    })
    .open();
}
function del({ id }: any) {
  AModal.confirm({
    title: '提示',
    content: '此操作将永久删除选中的记录, 是否继续?',
    centered: true,
    okType: 'danger',
    onOk: async () => {
      try {
        await delTableData(dataTableId.value, id);
        message.success('操作成功');

        gridApi.reload();
      } catch {}
    },
  });
}

function configureQueryItem() {
  queryItemModalRef?.value?.modalApi.open();
}

function onChangeQueryItem(val: any) {
  const schema = formOptions.schema
    .filter((item) => val.includes(item.fieldName))
    .map((item) => ({ ...item, rules: '' }));

  gridApi.formApi.setState({
    schema,
    showCollapseButton: schema.length > 3,
    collapsed: true,
  });

  gridApi.toggleSearchForm(schema.length > 0);
}

function showVue2Code() {
  codeGeneratorModalRef.value?.modalApi
    .setData({
      // 简单格式化代码
      type: 'vue2',
      optionCode: `export default ${JSON.stringify(JSON.parse(optionCode.value), '', 4)}`,
    })
    .open();
}

function showVbenCode() {
  try {
    // const obj = JSON.parse(optionCode.value);

    const schema = gridApi.formApi.state?.schema;
    const column = gridApi.grid.getFullColumns();
    const searchColumns = [];
    schema.forEach((col) => {
      if (col.fieldName) {
        searchColumns.push({ id: col.fieldName });
      }
    });
    const gridColumns = [];
    column.forEach((col) => {
      if (col.field) {
        gridColumns.push({
          id: col.field,
          width: col.resizeWidth > 0 ? col.resizeWidth : col.width,
          visible: col.visible,
        });
      }
    });
    // let code = `export const gridOption = ${JSON.stringify(genVbenGridOption(obj), '', 4)}\n\n`;
    // code += `export const searchOption = ${JSON.stringify(
    //   genVbenSearchOption(obj, schema),
    //   '',
    //   4,
    // )}\n\n`;
    // code += `export const formOption = ${JSON.stringify(genVbenFormOption(obj), '', 4)}`;

    codeGeneratorModalRef.value?.modalApi
      .setData({
        // optionCode: code,
        type: 'vben',
        searchColumns,
        gridColumns,
      })
      .open();
  } catch (error) {
    console.warn(error);
  }
}

function downloadVbenCode() {
  const schema = gridApi.formApi.state?.schema;
  const column = gridApi.grid.getFullColumns();
  const searchColumns = [];
  schema.forEach((col) => {
    if (col.fieldName) {
      searchColumns.push({ id: col.fieldName });
    }
  });
  const gridColumns = [];
  column.forEach((col) => {
    if (col.field) {
      gridColumns.push({
        id: col.field,
        width: col.resizeWidth > 0 ? col.resizeWidth : col.width,
        visible: col.visible,
      });
    }
  });
  const type = 'vben';

  const files = [];
  files.push(
    { templateCode: `ui.${type}.option`, file: 'option.ts' },
    { templateCode: `ui.${type}.indexSingle`, file: 'index.vue' },
    {
      templateCode: `ui.${type}.indexTwo`,
      file: 'indexTwo.vue',
    },
    { templateCode: 'backend.menu.json.menu', file: 'menu.json' },
    { templateCode: 'backend.menu.xml.menu', file: 'menu.xml' },
  );
  downloadCode(
    dataTableId.value,
    {
      type: 'template',
      files: JSON.stringify(files),
      searchColumns,
      gridColumns,
    },
    {
      responseReturn: 'body',
      responseType: 'blob',
    },
  ).then((data) => {
    downloadByData(data, `${dataTableId.value}.zip`);
  });
}

defineExpose({ modalApi, gridApi });
</script>
<template>
  <Modal title="界面预览">
    <Button type="primary" class="mr-2" @click="configureQueryItem()">
      配置查询项
      <template #icon>
        <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
      </template>
    </Button>
    <Button type="primary" class="mr-2" @click="showVue2Code()">
      vue2代码
      <template #icon>
        <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
      </template>
    </Button>
    <Button type="primary" class="mr-2" @click="showVbenCode()">
      vben代码
      <template #icon>
        <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
      </template>
    </Button>
    <Button type="primary" @click="downloadVbenCode()">
      下载vben代码
      <template #icon>
        <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
      </template>
    </Button>
    <Grid v-if="!loading">
      <template #toolbar-actions>
        <Button type="primary" class="mr-2" @click="add()">
          新增
          <template #icon>
            <PlusOutlined class="mb-[2px] text-[16px]" />
          </template>
        </Button>
        <!--        <Button size="small" type="primary">-->
        <!--          导出-->
        <!--          <template #icon>-->
        <!--            <SvgDownloadIcon class="mb-[2px] text-[16px]" />-->
        <!--          </template>-->
        <!--        </Button>-->
      </template>
      <template #action="{ row }">
        <Tooltip effect="dark" title="编辑" placement="top">
          <Button type="link" @click="edit(row)">
            <template #icon>
              <AntdEditOutlined class="mb-[2px] text-[16px]" />
            </template>
          </Button>
        </Tooltip>
        <Tooltip effect="dark" title="删除" placement="top">
          <Button type="link" danger @click="del(row)">
            <template #icon>
              <MdiLightDelete class="mb-[2px] text-[16px]" />
            </template>
          </Button>
        </Tooltip>
      </template>
    </Grid>
  </Modal>
  <CommonFormModal
    v-if="!loading"
    class="w-[70%]"
    :after-submit="gridApi.reload"
    :form-option="formOptions"
    ref="modificationModalRef"
  />
  <ConfigureQueryItemModal
    v-if="!loading"
    ref="queryItemModalRef"
    :options="
      formOptions.schema.map(({ fieldName: key, label: title }) => ({
        key,
        title,
      }))
    "
    @change="onChangeQueryItem"
  />
  <CodeGenerationModal
    class="w-[70%]"
    :data-table-id="dataTableId"
    :has-wf-proc-inst-id="hasWfProcInstId"
    ref="codeGeneratorModalRef"
  />
</template>
<style lang="scss" scoped></style>

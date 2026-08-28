<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { EditActionIcon, IconfontBasicView } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import { importProduct } from '#/views/modules/spd/views/operation/product/api';
import {
  genColumns,
  genFormOptions,
  queryFormOptions,
  useImportModal,
  useProductHC,
} from '#/views/modules/spd/views/operation/product/productMaintenanceLogisticMaterial/index';

import changeRecordModalComp from '../common/modals/changeRecordModal.vue';
import commonFormModalComp from '../common/modals/commonFormModal.vue';
import CommonImportModal from '../common/modals/commonImportModal.vue';
import { productSetting } from '../setting';
import newFormModalComp from './newFormModal.vue';

const route = useRoute();
const type = (route.meta.urlParams as Record<string, any>)?.type as 'hc' | 'yp';
console.warn(route.meta.urlParams, '@@@');
const hiddenFields = productSetting.hiddenFields[type] ?? [];

// 父表
const [ParentGrid, parentGridApi, { handleExport }] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      commonConfig: {
        labelClass: 'w-[90px]',
      },
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      checkboxConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      cellClassName({ column, row }: { column: any; row: any }) {
        return (column.field === 'productCode' ||
          column.field === 'certificateNo') &&
          row[column.field]
          ? 'highlight'
          : null;
      },
      rowStyle({ row }: { row: any }) {
        if (row.isActive === 'N') {
          return { color: 'gray' };
        } else if (row.certValidTo && new Date(row.certValidTo) < new Date())
          return { color: 'red' };
      },
      cellStyle({ column, row }: any) {
        if (row.isWorkflowEnd === 'N' && column.field === 'isWorkflowEnd') {
          return {
            color: '#F581B1',
          };
        }
      },
    }),
  },
  {
    id: 'queryProduct',
    // api地址
    queryUrl: `productAction/queryProduct.do?page=${(route.meta.urlParams as Record<string, string>)?.page as string}`,
    gridColumns: genColumns(hiddenFields) as any[],
    gridEvents: {
      cellClick: async ({ column, row }: any) => {
        if (column.field === 'productCode' && row.productCode) {
          detailModalApi
            .setData({
              title: '查看',
              form: cloneDeep(row),
            })
            .open();
        }
      },
    },
    // 表单配置
    formSchema: queryFormOptions(hiddenFields),
  },
);

// 详情对话框
const [DetailModal, detailModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
  footer: false,
});

// 新增/修改
const [AddOrEditModal, addOrEditModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: newFormModalComp,
  draggable: true,
});

// 批量修改对话框
const [BatchModificationModal, batchModificationModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: newFormModalComp,
  draggable: true,
  footer: false,
});

// 变更记录对话框
const [ChangeRecordModal, changeRecordModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: changeRecordModalComp,
  draggable: true,
  footer: false,
});
// handleBatchEdit,
const {
  handleAdd: handleHCAdd,
  handleEdit: handleHCEdit,
  handleCopy,
  handleChangeRecord,
} = useProductHC({
  parentGridApi,
  addOrEditModalApi,
  batchModificationModalApi,
  changeRecordModalApi,
});

const { drugImportModalRef, importSchemas, ypTemplateURL, hcTemplateURL } =
  useImportModal();

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <DetailModal disabled :form-options="genFormOptions(hiddenFields)" />
    <!-- 新增/修改对话框 -->
    <AddOrEditModal
      close-on-click-modal
      :form-options="genFormOptions(hiddenFields)"
      :after-submit="parentGridApi.query"
    />
    <!-- 批量修改对话框 -->
    <BatchModificationModal
      :form-options="genFormOptions(hiddenFields, true)"
      :after-submit="parentGridApi.query"
    />

    <!--  商品导入-->
    <CommonImportModal
      :form-schemas="importSchemas"
      keyword="商品"
      :http-request="
        (params: any) =>
          importProduct(params, {
            isApproved: 'Y',
            isOverWrite: 'N',
          })
      "
      :template-url="
        route.meta.urlParams?.type === 'hc' ? hcTemplateURL : ypTemplateURL
      "
      :after-submit="parentGridApi.query"
      ref="drugImportModalRef"
    />
    <!-- 变更记录对话框 -->
    <ChangeRecordModal />
    <!-- 父表 -->
    <ParentGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleHCAdd()"
          class="mr-[0.5rem]"
          data-testid="button_add"
        >
          新增
        </Button>
        <!-- <Button
          type="primary"
          @click="handleBatchEdit()"
          class="mr-[0.5rem]"
          data-testid="button_batchEdit"
        >
          批量修改
        </Button> -->
        <Button
          type="primary"
          @click="handleCopy()"
          class="mr-[0.5rem]"
          data-testid="button_copy"
        >
          复制
        </Button>
        <Button
          type="primary"
          @click="drugImportModalRef?.open()"
          class="mr-[0.5rem]"
          data-testid="button_import"
        >
          商品导入
        </Button>
        <Button
          type="primary"
          @click="handleExport"
          class="mr-[0.5rem]"
          data-testid="button_export"
        >
          导出
        </Button>
      </template>
      <template #action="scope">
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleHCEdit(scope.row)"
          :data-testid="`button_onEdit_${scope.rowIndex}`"
        >
          编辑
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          ghost
          type="primary"
          class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
          @click="handleChangeRecord(scope.row)"
          :data-testid="`button_onDetail_${scope.rowIndex}`"
        >
          变更记录
          <template #icon>
            <IconfontBasicView />
          </template>
        </Button>
      </template>
    </ParentGrid>
  </Page>
</template>

<style lang="scss" scoped>
::v-deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--label) {
  display: none;
}

::v-deep(.vxe-grid--table-container .vxe-table--column.highlight) {
  color: #006afc;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}
</style>

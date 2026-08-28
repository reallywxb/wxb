<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { IconfontBasicView } from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';
import { cloneDeep } from 'lodash-es';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';
import {
  approveFormOptions,
  genColumns,
  genFormOptions,
  queryFormOptions,
  useProductYP,
} from '#/views/modules/spd/views/operation/product/productApprovalLogisticMaterial/index';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import { productSetting } from '../setting';
import editContentModalComp from './editContentViewModal.vue';

const route = useRoute();
const urlParams: any = route.meta.urlParams || {};
console.warn(urlParams, '@@@');
const hiddenFields =
  productSetting.hiddenFields[(urlParams?.type as 'hc' | 'yp') ?? 'yp'];

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
    queryUrl: `productAction/queryProductApply?page=${urlParams?.page as string}`,
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

// 审批对话框
const [ApproveFromModal, approveFromModalApi] = useVbenModal({
  class: 'w-[500px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: commonFormModalComp,
  draggable: true,
});

// 查看修改内容对话框
const [EditContentModal, editContentModalApi] = useVbenModal({
  class: 'w-[900px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: editContentModalComp,
  draggable: true,
});

const handleOnEditRecord = (row: any) => {
  editContentModalApi
    .setData({
      title: '修改内容',
      productId: row.productId,
      productApplyId: row.productApplyId,
    })
    .open();
};

const { handleApprove } = useProductYP({ approveFromModalApi, parentGridApi });

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <DetailModal disabled :form-options="genFormOptions(hiddenFields)" />
    <!-- 审批对话框 -->
    <ApproveFromModal
      :form-options="approveFormOptions"
      :after-submit="parentGridApi.query"
    />
    <EditContentModal />
    <ParentGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          @click="handleApprove()"
          class="mr-[0.5rem]"
          data-testid="button_approve"
        >
          审批
        </Button>
        <Button
          v-if="urlParams?.canExport === 'true'"
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
          @click="handleOnEditRecord(scope.row)"
          :data-testid="`button_onEditDetail_${scope.rowIndex}`"
        >
          查看修改内容
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

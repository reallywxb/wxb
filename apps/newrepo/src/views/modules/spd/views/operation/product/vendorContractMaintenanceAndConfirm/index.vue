<script lang="ts" setup>
import { onMounted } from 'vue';

import { SearchActionIcon } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Input, InputSearch } from 'ant-design-vue';

import { importContranct } from '#/views/modules/spd/views/operation/product/api';

import CommonImportModal from '../common/modals/commonImportModal.vue';
import TableModal from '../common/modals/tableModal.vue';
import {
  gridColumns,
  useGrid,
  useImportModal,
  useModificationModal,
} from './index';

const {
  ParentGrid,
  parentGridApi,
  ChildGrid,
  handleExport,
  handleChildSearch,
  productName,
  del,
  submit,
  complete,
} = useGrid();

const {
  handleAdd,
  handleEdit,
  formSchemas,
  tableModalRef,
  ChooseProductModal,
  onSearchProduct,
} = useModificationModal({
  parentGridApi,
});

const { importModalRef, importSchemas, templateUrl } = useImportModal();

onMounted(() => {
  parentGridApi.formApi.getValues().then((res: any) => {
    parentGridApi.query({ ...res });
  });
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="false"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ParentGrid>
          <template #toolbar-actions>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleAdd()"
              v-if="$route.meta.urlParams?.docStatus === 'DR'"
              data-testid="button_add"
            >
              新建
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleEdit()"
              v-if="$route.meta.urlParams?.docStatus === 'DR'"
              data-testid="button_edit"
            >
              修改
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="complete()"
              v-if="$route.meta.urlParams?.docStatus === 'WU'"
              data-testid="button_confirm"
            >
              确认
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              ghost
              danger
              type="primary"
              @click="del()"
              class="mr-[0.5rem]"
              data-testid="button_delete"
            >
              删除
              <!--              <template #icon>-->
              <!--                <ExportActionIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="submit()"
              v-if="$route.meta.urlParams?.docStatus === 'DR'"
              data-testid="button_submit"
            >
              提交
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              v-if="$route.meta.urlParams?.docStatus === 'DR'"
              type="primary"
              class="mr-[0.5rem]"
              @click="importModalRef?.open()"
              data-testid="button_import"
            >
              导入
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <ChildGrid>
          <template #toolbar-actions>
            <Input
              v-model:value="productName"
              class="mr-[0.5rem] w-[240px]"
              placeholder="请输入药品名称"
              @keyup.enter="handleChildSearch"
              allow-clear
              data-testid="input_productName_childGrid"
            />
            <Button
              type="primary"
              @click="handleChildSearch"
              class="mr-[0.5rem]"
              data-testid="button_search_childGrid"
            >
              查询
              <template #icon>
                <SearchActionIcon />
              </template>
            </Button>
            <Button
              type="primary"
              @click="handleExport"
              data-testid="button_export_childGrid"
            >
              导出
            </Button>
            <!--            <Button type="primary" @click="handleExport" class="mr-[0.5rem]">-->
            <!--              打印明细-->
            <!--              <template #icon>-->
            <!--                <ExportActionIcon />-->
            <!--              </template>-->
            <!--            </Button>-->
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
  <!--  <CreationModal-->
  <!--    :form-schemas="formSchemas()"-->
  <!--    :grid-columns="gridColumns"-->
  <!--    :after-submit="parentGridApi.query"-->
  <!--  >-->
  <!--    <template #edit_productName="scope">-->
  <!--      <ChcSelect-->
  <!--        placeholder="请输入产品编码、产品名称"-->
  <!--        class="w-full"-->
  <!--        dict-url="/productAction/query.do"-->
  <!--        api-type="post"
              request-content-type="application/x-www-form-urlencoded"-->
  <!--        popup-class-name="productSelection"-->
  <!--        :page-size="25"-->
  <!--        :immediate="false"-->
  <!--        :filter-by-front-end="false"-->
  <!--        :show-search="true"-->
  <!--        filter-field="productName"-->
  <!--        @change="(val, option) => onSelectProduct(option, scope)"-->
  <!--        :handle-params="-->
  <!--          (params: any) => {-->
  <!--            return {-->
  <!--              ...params,-->
  <!--              current: undefined,-->
  <!--              pageNum: params.current,-->
  <!--              pageSize: params.size,-->
  <!--              size: undefined,-->
  <!--            };-->
  <!--          }-->
  <!--        "-->
  <!--        label-field="productName"-->
  <!--        value-field="productCode"-->
  <!--        :after-fetch="-->
  <!--          (res: any) => {-->
  <!--            return { ...res, rows: undefined, records: res.rows };-->
  <!--          }-->
  <!--        "-->
  <!--        :option-columns="productColumns"-->
  <!--      />-->
  <!--    </template>-->
  <!--  </CreationModal>-->
  <TableModal
    ref="tableModalRef"
    :form-schemas="formSchemas"
    :grid-columns="gridColumns"
    :after-submit="parentGridApi.query"
  >
    <template #edit_productName="scope">
      <InputSearch
        readonly
        :value="scope.row.productName"
        @search="onSearchProduct(scope.row)"
      />
    </template>
  </TableModal>
  <CommonImportModal
    keyword="协议"
    :http-request="(params: any) => importContranct(params)"
    :template-url="templateUrl"
    filename="采购协议确认模板"
    :after-submit="parentGridApi.query"
    :form-schemas="importSchemas"
    ref="importModalRef"
  />
  <ChooseProductModal />
</template>

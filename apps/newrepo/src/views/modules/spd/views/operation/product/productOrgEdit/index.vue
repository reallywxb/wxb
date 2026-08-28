<script lang="ts" setup>
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Switch } from 'ant-design-vue';

import { importProductOrg } from '#/views/modules/spd/views/operation/product/api';
import CommonImportModal from '#/views/modules/spd/views/operation/product/common/modals/commonImportModal.vue';

import { useGrid, useImportModal, useModificationModal } from './index';

const {
  ParentGrid,
  parentGridApi,
  ChildGrid,
  refreshChildGrid,
  parentSelectedIsUnifyN,
  ProductChangeLogModal,
  OrgChangeLogModal,
  handleViewChangeLog,
  handleViewOrgChangeLog,
  handleFormSubmit,
} = useGrid();

const {
  creationFormOptions,
  batchCreationFormOptions,
  batchModifyVendorFormOptions,
  CreationModal,
  BatchCreationModal,
  BatchModifyVendorModal,
  EditPriceModal,
  handleAdd,
  handleBatchAdd,
  handleBatchModifyVendor,
  modifyChildLine,
  editPriceFormOptions,
  handleOpenEditPrice,
} = useModificationModal({
  parentGridApi,
});

const { importModalRef, templateUrl } = useImportModal();

onMounted(() => {
  handleFormSubmit();
  // parentGridApi.formApi.getValues().then((res: any) => {
  //   parentGridApi.query({ ...res });
  // });
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
              data-testid="button_add"
            >
              新增
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleBatchAdd()"
              data-testid="button_batchAdd"
            >
              批量新增
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleBatchModifyVendor()"
              data-testid="button_batchModifyVendor"
            >
              批量变更供应商
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
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
          <template #action="scope">
            <Button
              type="primary"
              ghost
              @click="handleViewChangeLog(scope.row)"
              data-testid="button_changeLog"
            >
              变更日志
            </Button>
          </template>
        </ParentGrid>
      </template>
      <template #second>
        <ChildGrid>
          <template #defaultIsDefault="{ row }">
            <Switch
              v-model:checked="row.isDefault"
              checked-children="是"
              un-checked-children="否"
              checked-value="Y"
              un-checked-value="N"
              @change="() => modifyChildLine(row)"
              data-testid="switch_isDefault_childGrid"
            />
          </template>

          <template #defaultIsActive="{ row }">
            <Switch
              v-model:checked="row.isActive"
              checked-children="是"
              un-checked-children="否"
              checked-value="Y"
              un-checked-value="N"
              @change="() => modifyChildLine(row)"
              data-testid="switch_isActive_childGrid"
            />
          </template>
          <template #action="scope">
            <Button
              v-if="parentSelectedIsUnifyN"
              type="primary"
              class="mr-[0.5rem]"
              @click="handleOpenEditPrice(scope.row)"
              data-testid="button_editPrice_childGrid"
            >
              编辑
            </Button>
            <Button
              type="primary"
              ghost
              @click="handleViewOrgChangeLog(scope.row)"
              data-testid="button_orgChangeLog_childGrid"
            >
              变更日志
              <!-- <template #icon>
                <SvgDeleteIcon class="mt-[2px]" />
              </template> -->
            </Button>
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
  <CreationModal
    :form-options="creationFormOptions"
    :after-submit="refreshChildGrid"
  />
  <BatchCreationModal
    :form-options="batchCreationFormOptions"
    :after-submit="parentGridApi.query"
  />
  <BatchModifyVendorModal
    :form-options="batchModifyVendorFormOptions"
    :after-submit="parentGridApi.query"
  />
  <EditPriceModal
    :form-options="editPriceFormOptions"
    :after-submit="refreshChildGrid"
  />
  <ProductChangeLogModal />
  <OrgChangeLogModal />
  <CommonImportModal
    keyword="商品供应商"
    :http-request="(params: any) => importProductOrg(params)"
    :template-url="templateUrl"
    :after-submit="parentGridApi.query"
    filename="商品供应商管理模板"
    ref="importModalRef"
  />
</template>

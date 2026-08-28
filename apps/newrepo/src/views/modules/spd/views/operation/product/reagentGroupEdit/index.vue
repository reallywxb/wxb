<script lang="ts" setup>
import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button } from 'ant-design-vue';

import commonFormModalComp from '../common/modals/commonFormModal.vue';
import { useGrid, useModificationModal } from './index';

const { ParentGrid, parentGridApi, ChildGrid, childGridApi, refreshChildGrid } =
  useGrid();

const {
  modificationFormOptions,
  ModificationModal,
  handleAdd,
  handleEdit,
  handleDel,
  reagentGroupCreationFormOptions,
  handleAddReagentGroup,
  handleDelReagentGroup,
  reagentGroupCreationModalRef,
  ChooseProductModal,
} = useModificationModal({
  parentGridApi,
  childGridApi,
});

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
              @click="handleEdit()"
              data-testid="button_edit"
            >
              修改
              <!--              <template #icon>-->
              <!--                <SvgPrintFillIcon />-->
              <!--              </template>-->
            </Button>
            <Button
              ghost
              danger
              type="primary"
              class="mr-[0.5rem]"
              @click="handleDel()"
              data-testid="button_delete"
            >
              删除
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
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleAddReagentGroup()"
              data-testid="button_addReagentGroup"
            >
              添加品种
            </Button>
            <Button
              ghost
              danger
              type="primary"
              class="mr-[0.5rem]"
              @click="handleDelReagentGroup()"
              data-testid="button_deleteReagentGroup"
            >
              删除品种
            </Button>
          </template>
        </ChildGrid>
      </template>
    </PageSplit>
  </Page>
  <ModificationModal
    :form-options="modificationFormOptions"
    :after-submit="parentGridApi.query"
  />
  <commonFormModalComp
    ref="reagentGroupCreationModalRef"
    :form-options="reagentGroupCreationFormOptions"
    :after-submit="refreshChildGrid"
  />
  <ChooseProductModal />
</template>

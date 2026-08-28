<script lang="ts" setup>
import { ref } from 'vue';

import {
  AntdEditOutlined,
  AntdPlusCircleTwotone,
  MdiLightDelete,
} from '@vben/chc-icons';
import { Page } from '@vben/common-ui';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, TabPane, Tabs, Tooltip } from 'ant-design-vue';

import CommonFormModal from '#/views/modules/sys/views/common/modals/commonFormModal.vue';

import { Tab, useCommonModal, useGrid } from './index.ts';

const {
  Grid,
  gridApi,
  SiteEnterpriseGrid,
  siteEnterpriseGridApi,
  SiteOrganizationGrid,
  siteOrganizationGridApi,
  SiteWarehouseGrid,
  siteWarehouseGridApi,
  SiteUsersGrid,
  siteUsersGridApi,
  ApplicationGrid,
  applicationGridApi,
  parentTableParams,
} = useGrid();

const activeKey = ref(Tab.SiteEnterprise.toString());

const {
  subFormOption,
  modificationModalRef,
  formOption,
  subModificationModalRef,
  encryptionModalRef,
  encryptionFormOption,
  handleAdd,
  handleKey,
  handleEdit,
  handleDel,
  handleSubAdd,
  handleSubEdit,
  handleSubDel,
  reloadSubGrid,
} = useCommonModal(
  gridApi,
  [
    siteEnterpriseGridApi,
    siteOrganizationGridApi,
    siteWarehouseGridApi,
    siteUsersGridApi,
    applicationGridApi,
  ],
  { activeKey },
);
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
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
            <Button type="primary" @click="handleAdd()" class="mr-1">
              新增
              <template #icon>
                <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
              </template>
            </Button>
            <Button type="primary" @click="handleKey()">
              生成密钥
              <template #icon>
                <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
              </template>
            </Button>
          </template>
          <template #action="{ row }">
            <Tooltip effect="dark" title="编辑" placement="top">
              <Button type="link" @click="handleEdit(row)">
                <template #icon>
                  <AntdEditOutlined class="mb-[2px] text-[16px]" />
                </template>
              </Button>
            </Tooltip>
            <Tooltip effect="dark" title="删除" placement="top">
              <Button type="link" danger @click="handleDel(row)">
                <template #icon>
                  <MdiLightDelete class="mb-[2px] text-[16px]" />
                </template>
              </Button>
            </Tooltip>
          </template>
        </Grid>
      </template>
      <template #second>
        <Tabs class="tabs" v-model:active-key="activeKey">
          <TabPane
            :key="Tab.SiteEnterprise.toString()"
            tab="站点企业"
            class="tab-pane"
          >
            <SiteEnterpriseGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.SiteEnterprise)"
                  :disabled="!parentTableParams.siteId"
                >
                  新增
                  <template #icon>
                    <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </template>
              <template #action="{ row }">
                <Tooltip effect="dark" title="编辑" placement="top">
                  <Button
                    type="link"
                    @click="handleSubEdit(row, Tab.SiteEnterprise)"
                  >
                    <template #icon>
                      <AntdEditOutlined class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="删除" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubDel(row, Tab.SiteEnterprise)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </SiteEnterpriseGrid>
          </TabPane>
          <TabPane
            :key="Tab.SiteOrganization.toString()"
            tab="站点机构"
            class="tab-pane"
          >
            <SiteOrganizationGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.SiteOrganization)"
                  :disabled="!parentTableParams.siteId"
                >
                  新增
                  <template #icon>
                    <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </template>
              <template #action="{ row }">
                <Tooltip effect="dark" title="编辑" placement="top">
                  <Button
                    type="link"
                    @click="handleSubEdit(row, Tab.SiteOrganization)"
                  >
                    <template #icon>
                      <AntdEditOutlined class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="删除" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubDel(row, Tab.SiteOrganization)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </SiteOrganizationGrid>
          </TabPane>
          <TabPane
            :key="Tab.SiteWarehouse.toString()"
            tab="站点仓库"
            class="tab-pane"
          >
            <SiteWarehouseGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.SiteWarehouse)"
                  :disabled="!parentTableParams.siteId"
                >
                  新增
                  <template #icon>
                    <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </template>
              <template #action="{ row }">
                <Tooltip effect="dark" title="编辑" placement="top">
                  <Button
                    type="link"
                    @click="handleSubEdit(row, Tab.SiteWarehouse)"
                  >
                    <template #icon>
                      <AntdEditOutlined class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="删除" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubDel(row, Tab.SiteWarehouse)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </SiteWarehouseGrid>
          </TabPane>
          <TabPane
            :key="Tab.SiteUsers.toString()"
            tab="站点用戶"
            class="tab-pane"
          >
            <SiteUsersGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.SiteUsers)"
                  :disabled="!parentTableParams.siteId"
                >
                  新增
                  <template #icon>
                    <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </template>
              <template #action="{ row }">
                <Tooltip effect="dark" title="编辑" placement="top">
                  <Button
                    type="link"
                    @click="handleSubEdit(row, Tab.SiteUsers)"
                  >
                    <template #icon>
                      <AntdEditOutlined class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="删除" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubDel(row, Tab.SiteUsers)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </SiteUsersGrid>
          </TabPane>
          <TabPane
            :key="Tab.Application.toString()"
            tab="应用"
            class="tab-pane"
          >
            <ApplicationGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.Application)"
                  :disabled="!parentTableParams.siteId"
                >
                  新增
                  <template #icon>
                    <AntdPlusCircleTwotone class="mb-[2px] text-[16px]" />
                  </template>
                </Button>
              </template>
              <template #action="{ row }">
                <Tooltip effect="dark" title="编辑" placement="top">
                  <Button
                    type="link"
                    @click="handleSubEdit(row, Tab.Application)"
                  >
                    <template #icon>
                      <AntdEditOutlined class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="删除" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubDel(row, Tab.Application)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </ApplicationGrid>
          </TabPane>
        </Tabs>
      </template>
    </PageSplit>
  </Page>
  <CommonFormModal
    :after-submit="gridApi.reload"
    :form-option="formOption"
    ref="modificationModalRef"
  />

  <CommonFormModal
    :after-submit="() => reloadSubGrid(activeKey as unknown as Tab)"
    :form-option="subFormOption"
    ref="subModificationModalRef"
  />

  <CommonFormModal
    :modal-option="{
      showConfirmButton: false,
    }"
    :form-option="encryptionFormOption"
    ref="encryptionModalRef"
  />
</template>

<style lang="scss" scoped>
.tabs {
  height: 100%;

  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
</style>

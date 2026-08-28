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
  ReportSettingGrid,
  reportSettingGridApi,
  ReportPrinterGrid,
  reportPrinterGridApi,
  ReportOrgGrid,
  reportOrgGridApi,
  ReportRoleGrid,
  reportRoleGridApi,
  parentTableParams,
} = useGrid();

const activeKey = ref(Tab.ReportSetting.toString());

const {
  subFormOption,
  modificationModalRef,
  formOption,
  subModificationModalRef,
  encryptionModalRef,
  encryptionFormOption,
  handleAdd,
  handleEdit,
  handleDel,
  handlePreview,
  handleSubAdd,
  handleSubEdit,
  handleSubDel,
  reloadSubGrid,
  handleSubPreview,
} = useCommonModal(
  gridApi,
  [
    reportSettingGridApi,
    reportPrinterGridApi,
    reportOrgGridApi,
    reportRoleGridApi,
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
            <Tooltip effect="dark" title="预览" placement="top">
              <Button type="link" danger @click="handlePreview(row)">
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
            :key="Tab.ReportSetting.toString()"
            tab="模板设置"
            class="tab-pane"
          >
            <ReportSettingGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.ReportSetting)"
                  :disabled="!parentTableParams.reportId"
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
                    @click="handleSubEdit(row, Tab.ReportSetting)"
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
                    @click="handleSubDel(row, Tab.ReportSetting)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="预览" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubPreview(row, Tab.ReportSetting)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </ReportSettingGrid>
          </TabPane>
          <TabPane
            :key="Tab.ReportPrinter.toString()"
            tab="自动打印设置"
            class="tab-pane"
          >
            <ReportPrinterGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.ReportPrinter)"
                  :disabled="!parentTableParams.reportId"
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
                    @click="handleSubEdit(row, Tab.ReportPrinter)"
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
                    @click="handleSubDel(row, Tab.ReportPrinter)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="预览" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubPreview(row, Tab.ReportPrinter)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </ReportPrinterGrid>
          </TabPane>
          <TabPane
            :key="Tab.ReportOrg.toString()"
            tab="授权机构"
            class="tab-pane"
          >
            <ReportOrgGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.ReportOrg)"
                  :disabled="!parentTableParams.reportId"
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
                    @click="handleSubEdit(row, Tab.ReportOrg)"
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
                    @click="handleSubDel(row, Tab.ReportOrg)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="预览" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubPreview(row, Tab.ReportOrg)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </ReportOrgGrid>
          </TabPane>
          <TabPane
            :key="Tab.ReportRole.toString()"
            tab="授权角色"
            class="tab-pane"
          >
            <ReportRoleGrid>
              <template #toolbar-actions>
                <Button
                  type="primary"
                  @click="handleSubAdd(Tab.ReportRole)"
                  :disabled="!parentTableParams.reportId"
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
                    @click="handleSubEdit(row, Tab.ReportRole)"
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
                    @click="handleSubDel(row, Tab.ReportRole)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
                <Tooltip effect="dark" title="预览" placement="top">
                  <Button
                    type="link"
                    danger
                    @click="handleSubPreview(row, Tab.ReportRole)"
                  >
                    <template #icon>
                      <MdiLightDelete class="mb-[2px] text-[16px]" />
                    </template>
                  </Button>
                </Tooltip>
              </template>
            </ReportRoleGrid>
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

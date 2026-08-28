<script lang="ts" setup>
import { nextTick, ref } from 'vue';
// const parentTableParams = ref<{ [key: string]: any }>({});
import { useRoute } from 'vue-router';

import { AntdPlusCircleTwotone } from '@vben/chc-icons';
import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import {
  Button,
  Card,
  Input,
  Switch,
  TabPane,
  Tabs,
  Tree,
} from 'ant-design-vue';

import CommonImportModal from '#/views/modules/spd/views/operation/product/common/modals/commonImportModal.vue';
import {
  importDepartmentData,
  queryDepartment,
} from '#/views/modules/spd/views/operation/system/api';

import {
  useBaseForm,
  useEndemicGrid,
  useImportModal,
  usePermissionModal,
  useTree,
  useUserGrid,
} from './index';

const activeTab = ref<string>('3');
const route = useRoute();
const userStore = useUserStore();
const AD_Org_ID = (route?.query?.AD_Org_ID as string) || undefined;
const IS_CONSORTIUM = userStore.userInfo?.isConsortium || undefined; // 这个字段代表 是否医共体机构
const treeRootRef = ref<HTMLElement>();
function onTabChange(activeKey: string) {
  switch (activeKey) {
    case '1': {
      queryDepartment({ departmentId: departmentId.value }).then(
        ({ rows: [value] }) => {
          baseFormApi.setValues(value);
        },
      );
      break;
    }
    case '2': {
      nextTick(endemicGridApi.query);
      break;
    }
    case '3': {
      nextTick(userGridApi.query);
      break;
    }
  }
}

const {
  keyword,
  treeData,
  departmentId,
  expandedKeys,
  queryDepartmentTree,
  expand,
  onExpand,
  onDrop,
  endemicGridParams,
  userGridParams,
  searchAndSelectFirst,
} = useTree({
  onTabChange: () => onTabChange(activeTab.value),
  queryRootEndemic: () => endemicGridApi.query(),
  orgId: AD_Org_ID,
  treeRootRef,
});

const { loading, BaseForm, baseFormApi } = useBaseForm(
  departmentId,
  queryDepartmentTree,
  IS_CONSORTIUM,
);

const {
  UserGrid,
  userGridApi,
  UserModificationModal,
  userModificationFormOptions,
  createUser,
  modifyUser,
  delUser,
} = useUserGrid(userGridParams);

const {
  EndemicGrid,
  endemicGridApi,
  DepartmentModificationModal,
  departmentModificationFormOptions,
  createEndemic,
  modifyEndemic,
  delEndemic,
} = useEndemicGrid(
  endemicGridParams,
  queryDepartmentTree,
  AD_Org_ID,
  IS_CONSORTIUM,
);

const {
  permissionTreeData,
  PermissionModal,
  permissionModalApi,
  checkedKeys,
  defaultCheckedKeys,
  onCheckNode,
} = usePermissionModal();

const { importModalRef, templateUrl } = useImportModal();

queryDepartmentTree();
</script>

<template>
  <Page
    content-class="p-[0.5rem]"
    auto-content-height
    header-class="px-3 py-2"
    style="background-color: white"
  >
    <PageSplit
      :distribute="0.2"
      :line-thickness="6"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <Card title="科室病区" class="card">
          <div ref="treeRootRef" class="tree-container">
            <div class="tree-container--header pb-[0.5rem]">
              <Input
                allow-clear
                v-model:value.lazy="keyword"
                placeholder="回车搜索"
                @press-enter="keyword && searchAndSelectFirst()"
              />
              <Button
                type="primary"
                @click="expand()"
                data-testid="button_expand"
              >
                {{ expandedKeys.length > 0 ? '收起' : '展开' }}
              </Button>
              <Button
                type="primary"
                @click="queryDepartmentTree()"
                data-testid="button_refresh"
              >
                刷新
              </Button>
            </div>
            <Tree
              class="department-tree"
              draggable
              v-model:expanded-keys="expandedKeys"
              :selected-keys="[departmentId]"
              auto-expand-parent
              :tree-data="treeData"
              :field-names="{
                children: 'children',
                label: 'text',
                key: 'id',
                value: 'value',
              }"
              @select="
                (keys, { node }) => {
                  departmentId = node.dataRef?.id;
                }
              "
              @drop="onDrop"
              @expand="onExpand"
              data-testid="tree_department"
            >
              <template #title="{ text }">
                <span
                  v-text="text"
                  :style="
                    keyword && text.includes(keyword)
                      ? {
                          padding: '0 4px',
                          borderRadius: '4px',
                          backgroundColor: '#FFE6B0',
                        }
                      : null
                  "
                ></span>
              </template>
            </Tree>
          </div>
        </Card>
      </template>
      <template #second>
        <DepartmentModificationModal
          :form-options="departmentModificationFormOptions"
          :after-submit="
            () => {
              endemicGridApi.query();
              queryDepartmentTree();
            }
          "
        >
          <template #isActive="scope">
            <Switch
              :checked="scope.modelValue"
              @update:checked="scope.setValue($event, false)"
              checked-value="Y"
              un-checked-value="N"
              checked-children="是"
              un-checked-children="否"
              date-testid="switch_isActive_DepartmentModificationModal"
            />
          </template>
          <template #IsPurchase_allocate="scope">
            <Switch
              :checked="scope.modelValue"
              @update:checked="scope.setValue($event, false)"
              checked-value="Y"
              un-checked-value="N"
              checked-children="是"
              un-checked-children="否"
              date-testid="switch_IsPurchase_allocate_DepartmentModificationModal"
            />
          </template>
        </DepartmentModificationModal>
        <PermissionModal
          class="h-[600px]"
          content-class="h-[calc(100%-100px)] overflow-y-hidden flex-none p-0"
          title="科室病区权限"
        >
          <div class="tree-container">
            <Tree
              v-if="permissionTreeData?.length"
              default-expand-all
              class="department-tree"
              checkable
              :default-checked-keys="defaultCheckedKeys"
              auto-expand-parent
              v-model:checked-keys="checkedKeys"
              :tree-data="permissionTreeData"
              :field-names="{
                key: 'id',
                children: 'children',
                label: 'text',
                value: 'value',
              }"
              @check="onCheckNode"
              data-testid="tree_permissionTree"
            >
              <template #title="{ text }">
                <span v-text="text"></span>
              </template>
            </Tree>
          </div>
        </PermissionModal>
        <UserModificationModal
          :form-options="userModificationFormOptions"
          :after-submit="userGridApi.query"
        >
          <template #isReadWrite="scope">
            <Switch
              :checked="scope.modelValue"
              @update:checked="scope.setValue($event, false)"
              checked-value="Y"
              un-checked-value="N"
              checked-children="是"
              un-checked-children="否"
              data-testid="switch_isReadWrite_UserModificationModal"
            />
          </template>
          <template #isActive="scope">
            <Switch
              :checked="scope.modelValue"
              @update:checked="scope.setValue($event, false)"
              checked-value="Y"
              un-checked-value="N"
              checked-children="是"
              un-checked-children="否"
              data-testid="switch_isActive_UserModificationModal"
            />
          </template>
        </UserModificationModal>
        <Card class="card" title="科室病区一览" v-if="departmentId === '0'">
          <EndemicGrid>
            <template #toolbar-actions>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="createEndemic()"
                data-testid="button_add_EndemicGrid"
              >
                新增
                <template #icon>
                  <AntdPlusCircleTwotone style="margin-bottom: 2px" />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="modifyEndemic()"
                data-testid="button_edit_EndemicGrid"
              >
                修改
              </Button>
              <Button
                type="primary"
                danger
                class="mr-[0.5rem]"
                @click="delEndemic()"
                data-testid="button_delete_EndemicGrid"
              >
                删除
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="importModalRef?.open()"
                data-testid="button_import_EndemicGrid"
              >
                导入
              </Button>
            </template>
          </EndemicGrid>
        </Card>
        <div v-else class="sub-endemic p-[0.5rem]">
          <Tabs
            v-model:active-key="activeTab"
            @change="onTabChange"
            data-testid="Tabs_EndemicGrid"
          >
            <TabPane
              key="1"
              tab="科室病区信息"
              data-testid="TabPane_1_EndemicGrid"
            />
            <TabPane
              key="2"
              tab="下级科室病区"
              data-testid="TabPane_2_EndemicGrid"
            />
            <TabPane
              key="3"
              tab="科室病区用户"
              class="h-full"
              data-testid="TabPane_3_EndemicGrid"
            />
          </Tabs>
          <div class="grid-container">
            <BaseForm v-if="activeTab === '1'" v-loading="loading">
              <template #isActive="scope">
                <Switch
                  :checked="scope.modelValue"
                  @update:checked="scope.setValue($event, false)"
                  checked-value="Y"
                  un-checked-value="N"
                  checked-children="是"
                  un-checked-children="否"
                  data-testid="switch_isActive_BaseForm"
                />
              </template>
              <template #IsPurchase_allocate="scope">
                <Switch
                  :checked="scope.modelValue"
                  @update:checked="scope.setValue($event, false)"
                  checked-value="Y"
                  un-checked-value="N"
                  checked-children="是"
                  un-checked-children="否"
                  data-testid="switch_IsPurchase_allocate_BaseForm"
                />
              </template>
            </BaseForm>
            <EndemicGrid v-if="activeTab === '2'">
              <template #toolbar-actions>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="createEndemic()"
                  data-testid="button_add_sub"
                >
                  新增
                  <template #icon>
                    <AntdPlusCircleTwotone style="margin-bottom: 2px" />
                  </template>
                </Button>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="modifyEndemic()"
                  data-testid="button_edit_sub"
                >
                  修改
                </Button>
                <Button
                  type="primary"
                  danger
                  class="mr-[0.5rem]"
                  @click="delEndemic()"
                  data-testid="button_delete_sub"
                >
                  删除
                </Button>
              </template>
            </EndemicGrid>
            <UserGrid v-if="activeTab === '3'">
              <template #toolbar-actions>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="createUser()"
                  data-testid="button_add_user"
                >
                  新增
                  <template #icon>
                    <AntdPlusCircleTwotone style="margin-bottom: 2px" />
                  </template>
                </Button>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="modifyUser()"
                  data-testid="button_edit_user"
                >
                  修改
                </Button>
                <Button
                  type="primary"
                  class="mr-[0.5rem]"
                  @click="
                    permissionModalApi
                      .setData({ user: userGridApi.grid.getRadioRecord() })
                      .open()
                  "
                  data-testid="button_permission"
                >
                  科室病区权限
                </Button>
                <Button
                  type="primary"
                  danger
                  class="mr-[0.5rem]"
                  @click="delUser()"
                  data-testid="button_delete_user"
                >
                  删除
                </Button>
              </template>
              <template #isReadWrite="{ row }">
                <Switch
                  disabled
                  v-model:checked="row.isReadWrite"
                  checked-value="Y"
                  un-checked-value="N"
                  checked-children="是"
                  un-checked-children="否"
                  :data-testid="`switch_isReadWrite_${row._rowIndex}`"
                />
              </template>
              <template #isActive="{ row }">
                <Switch
                  disabled
                  v-model:checked="row.isActive"
                  checked-value="Y"
                  un-checked-value="N"
                  checked-children="是"
                  un-checked-children="否"
                  :data-testid="`switch_isActive_${row._rowIndex}`"
                />
              </template>
            </UserGrid>
          </div>
        </div>
      </template>
    </PageSplit>
  </Page>
  <CommonImportModal
    keyword="科室病区"
    :http-request="(params: any) => importDepartmentData(params)"
    :template-url="templateUrl"
    :after-submit="
      () => {
        endemicGridApi.query();
        queryDepartmentTree();
      }
    "
    ref="importModalRef"
  />
</template>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  width: calc(100% - 16px);
  height: 100%;

  ::v-deep(.ant-card-body) {
    flex: 1;
    min-height: 0;
  }
}

.tree-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  &--header {
    display: flex;
    gap: 0.5rem;
  }

  ::v-deep(.ant-tree) {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
}

.sub-endemic {
  display: flex;
  flex-direction: column;
  height: 100%;

  .grid-container {
    flex: 1;
    min-height: 0;
  }
}
</style>
<style lang="scss">
.ant-tree.department-tree {
  .ant-tree-treenode {
    align-items: center;
    width: 100%;
    padding: 2px;

    .ant-tree-switcher {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ant-tree-checkbox {
      margin-block-start: 0;
    }

    .ant-tree-node-content-wrapper {
      display: inline-block;
      width: 100%;
      height: 24px;
      line-height: 24px;
    }
    //&.ant-tree-treenode-selected {
    //  .ant-tree-node-content-wrapper {
    //
    //
    //    flex: 1;
    //    height: 24px;
    //    line-height: 24px;
    //  }
    //}
  }
}
</style>

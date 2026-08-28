<script lang="ts" setup>
import type { WorkflowParentRow } from './api';

import { nextTick, onMounted, ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import {
  AddActionIcon,
  EditActionIcon,
  SearchActionIcon,
  SvgDeleteIcon,
} from '@vben/chc-icons';
import { Page, useVbenModal } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { PageSplit } from '@xgsk/vue3-page-split';
import { Button, Card, Input, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import LazySearch from '#/utils/LazySearch';
import { deepMerge } from '#/utils/util';

import {
  checkActiveNode,
  deleteNode,
  openWorkflow,
  updateWorkflowAction,
} from './api';
import AdjustTheNodeSequenceModalComp from './modals/adjustTheNodeSequenceModal.vue';
import ExpansionFormModalComp from './modals/expansionFormModal.vue';
import WorkFlowFormModalComp from './modals/workflowFormModal.vue';

const AD_Workflow_ID = ref<number | string>('');
const userStore = useUserStore();
const route = useRoute();
const urlParamsObj: any = route.meta?.urlParams;
console.warn(urlParamsObj, 'urlParamsObj');
// const urlParams = {
//   specShowType: urlParamsObj?.specShowType || '',
// };
const parentTableParams = ref<{ [key: string]: any }>({});
const isFirstLoaded = ref<boolean>(false);
const selectRow = ref<any | undefined>({});
// 定义查询控制器 用于控制表格的查询在页面加载后自动触发
const searchController = new LazySearch(1, async () => {
  await nextTick();
  ChcGridApi.formApi.getValues().then((resData: any) => {
    ChcGridApi.query({ ...resData });
  });
  isFirstLoaded.value = true;
});

// 子表
const [RoleGrid, roleGridApi] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        {
          field: 'AD_WF_Node_ID',
          title: 'AD_WF_Node_ID',
          visible: false,
          sortable: true,
        },
        {
          type: 'radio',
          width: 120,
          fixed: 'left',
          visible: false,
          title: '单选',
        },
        {
          field: 'nodeSeq',
          title: '审批顺序',
          width: '15%',
          sort: false,
          align: 'center',
          formatter(scope: any) {
            // 如果是否有效为否 那么序号为-, 否则序号依次增加
            // 如果是否有效从否更改为是 那么序号重新计算为当前行索引+1
            if (scope.row.IsActive === 'N') {
              return '-';
            }
            return scope.rowIndex + 1;
          },
        },
        { field: 'Name', title: '节点名称', width: '20%', sortable: false },
        {
          field: 'NodeChecker',
          title: '审批人',
          width: '200',
          sortable: false,
          visible: false,
        },
        { field: 'NodeCheckerName', title: '审批人', sortable: false },
        {
          field: 'IsActive',
          title: '是否有效',
          width: '15%',
          sortable: false,
          slots: { default: 'IsActive' },
          align: 'center',
        },
      ],
      proxyConfig: {
        autoLoad: false,
      },
      pagerConfig: {
        enabled: false,
      },
      radioConfig: {
        highlight: true,
        trigger: 'row',
      },
      stripe: false,
      cellStyle(scope: any) {
        if (scope.row.IsActive === 'N') {
          return {
            color: 'gray',
          };
        }
        return {};
      },
    },
  },
  {
    parentTableParams,
    id: 'workflowConfigurationChildGrid',
    dataTableId: '/workflowAction/queryNodeList.do?',
    // tableSearchExtraParams: searchForm,
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

// 父表
const [ChcGrid, ChcGridApi, { ExpansionFormModal, ExpansionFormModalApi }] =
  useSpdGrid(
    {
      formOptions: deepMerge(formDefaultOptions, {
        // fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
        compact: true,
        layout: 'horizontal',
        showCollapseButton: false,
        submitButtonOptions: {
          content: '查询',
        },
        resetButtonOptions: {
          show: true,
          content: '重置',
        },
        submitOnEnter: true,
      }),
      gridOptions: deepMerge(gridDefaultOptions, {
        checkboxConfig: {
          highlight: true,
        },
        radioConfig: {
          highlight: true,
          trigger: 'row',
        },
        proxyConfig: {
          autoLoad: false,
        },
        pagerConfig: {
          enabled: false,
        },
        stripe: false,
        cellStyle(scope: any) {
          if (scope.row.Type === 'custom') {
            return {
              color: 'orange',
            };
          }
          return {};
        },
      }),
    },
    {
      dataTableId: 'workflowAction/getWorkflow.do',
      id: 'workflowConfigurationGrid',
      gridColumns: [
        {
          type: 'radio',
          width: 120,
          fixed: 'left',
          visible: false,
          title: '单选',
        },
        {
          title: '序号',
          field: 'index',
          // type: '',
          width: 50,
          align: 'center',
          formatter(scope: any) {
            return scope.rowIndex + 1;
          },
        },
        {
          field: 'AD_Workflow_ID',
          title: 'AD_Workflow_ID',
          visible: false,
          sortable: true,
        },
        {
          field: 'workflowExtendId',
          title: 'workflowExtendId',
          visible: false,
          sortable: true,
        },
        {
          field: 'Name',
          width: '35%',
          sortable: false,
          title: '名称',
        },
        {
          field: 'warehousePolicyName',
          // width: 160,
          sortable: false,
          title: '作业策略',
        },
        {
          field: 'isOpen',
          sortable: false,
          title: '是否开启',
          align: 'center',
          width: '15%',
          slots: { default: 'isOpen' },
        },
      ],
      formSchema: [
        {
          component: 'Input',
          fieldName: 'name',
          label: '名称',
          labelClass: 'w-[fit-content]',
          componentProps: {
            placeholder: '请输入名称',
          },
          formItemClass: 'col-span-2',
        },
      ],
      gridEvents: {
        radioChange: ({ row }: { row: any }) => {
          if (row && row.AD_Workflow_ID) {
            parentTableParams.value = { AD_Workflow_ID: row.AD_Workflow_ID };
            AD_Workflow_ID.value = row.AD_Workflow_ID;
            selectRow.value = row;
            // console.log('父表选中行，触发子表查询', parentTableParams.value);
            roleGridApi.query({ AD_Workflow_ID: row.AD_Workflow_ID });
          } else {
            parentTableParams.value = { AD_Workflow_ID: undefined };
            roleGridApi.grid.remove();
          }
        },
      },
      tableSearchExtraParams: {
        // orgId: userStore.userInfo?.orgId,
      },
      afterFetchFn: (params) => {
        return {
          ...params,
          records: params.rows,
        };
      },
      customModals: {
        'ExpansionFormModal-ExpansionFormModalApi': {
          // 连接抽离的组件
          connectedComponent: ExpansionFormModalComp,
          draggable: true,
        },
      },
    },
  );

// 查询
const name = ref('');
const handleSearch = (e: any) => {
  console.warn('handleSearch', e.target.value, name.value);
  roleGridApi.query({
    AD_Workflow_ID: parentTableParams.value.AD_Workflow_ID,
    name: name.value,
  });
};

const [WorkFlowFormModal, WorkFlowFormModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: WorkFlowFormModalComp,
  draggable: true,
});

const [AdjustTheNodeSequenceModal, AdjustTheNodeSequenceModalApi] =
  useVbenModal({
    class: 'w-[800px]',
    closable: true,
    // 连接抽离的组件
    connectedComponent: AdjustTheNodeSequenceModalComp,
    draggable: true,
  });

// 扩展 || 修改
const handleApproval = () => {
  const row: WorkflowParentRow = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: WorkflowParentRow = toRaw(row);
  console.warn('handleApproval', row);
  if (!row) {
    message.warning('请选择一个工作流');
    return;
  }
  if (!row.IsActive || row.IsActive === 'N') {
    message.warning('请先开启当前工作流');
    return;
  }
  const type = row.Type === 'normal' ? 'ADD' : 'EDIT';
  const title =
    row.Type === 'normal'
      ? `扩展【${row.Name}】工作流`
      : `修改【${row.Name}】工作流`;
  console.warn('type', type);
  ExpansionFormModalApi?.setData({
    modalType: type,
    modalTitle: title,
    row: unProxyRow,
    callback() {
      ChcGridApi.formApi.getValues().then((resData: any) => {
        ChcGridApi.query({
          ...resData,
          AD_Workflow_ID: unProxyRow.AD_Workflow_ID,
        });
      });
    },
  }).open();
};

// 审批节点新增
const handleAdd = () => {
  console.warn('handleAdd');
  const selectRow: WorkflowParentRow = ChcGridApi.grid.getRadioRecord(true);
  const unProxyRow: any = toRaw(selectRow);
  if (!selectRow) {
    message.warning('请选择一个工作流');
    return;
  }
  if (!selectRow.IsActive || selectRow.IsActive === 'N') {
    Modal.confirm({
      title: '提示',
      content: '当前工作流尚未开启，是否开启？',
      centered: true,
      width: '260',
      onOk: async () => {
        try {
          const params: any = {};
          params.IsActive = 'Y';
          params.WfValue = selectRow.Value;
          let defaultUrl = 'activeWorkflow.do';
          if (
            selectRow.Type &&
            selectRow.Type === 'custom' &&
            selectRow.workflowExtendId
          ) {
            params.workflowExtendId = selectRow.workflowExtendId;
            defaultUrl = 'activeCustomWorkflow.do';
          }
          await openWorkflow(params, defaultUrl)
            .then((res) => {
              if (res && res.success) {
                console.warn('openWorkflow', res);
                ChcGridApi.formApi.getValues().then((resData: any) => {
                  console.warn('getValues', resData);
                  ChcGridApi.query({ ...resData });
                });
                message.success('开启成功');
              } else {
                message.error(res.msg || '失败');
              }
            })
            .catch((error) => {
              console.error('请求失败', error);
            });
        } catch {
          message.error('请求失败');
        }
      },
    });
  } else {
    console.warn('工作流开启了', unProxyRow);
    WorkFlowFormModalApi?.setData({
      modalType: 'ADD',
      modalTitle: '新建',
      row: unProxyRow,
      callback() {
        console.warn('callback==>');
        roleGridApi.query({
          AD_Workflow_ID: parentTableParams.value.AD_Workflow_ID,
        });
        // roleGridApi.formApi.getValues().then((resData: any) => {
        //   roleGridApi.query({
        //     ...resData,
        //     AD_Workflow_ID: parentTableParams.value.AD_Workflow_ID,
        //   });
        // });
      },
    }).open();
  }
};

// 审批节点编辑
const handleEdit = () => {
  console.warn('handleEdit');
  const headerRow: WorkflowParentRow = ChcGridApi.grid.getRadioRecord(true);
  if (!headerRow) {
    message.warning('请选择一个工作流');
    return;
  }

  const selectedNode: any = roleGridApi.grid.getRadioRecord(true);
  if (!selectedNode) {
    message.warning('请选择一个节点');
    return;
  }

  if (!selectedNode.IsActive || selectedNode.IsActive === 'N') {
    message.error('无法修改已经失效的节点');
    return;
  }

  const unProxyHeaderRow: any = toRaw(headerRow);
  const unProxyNodeRecord: any = toRaw(selectedNode);

  console.warn('打开编辑弹框', unProxyHeaderRow, unProxyNodeRecord);

  // 合并父表和子表的数据，传递给弹框
  const editData = {
    Value: unProxyHeaderRow.Value, // 工作流编码
    Name: unProxyHeaderRow.Name, // 工作流名称
    ApprovalName: unProxyNodeRecord.Name, // 节点名称
    AD_WF_Node_ID: unProxyNodeRecord.AD_WF_Node_ID,
    AD_WF_Responsible_ID: unProxyNodeRecord.AD_WF_Responsible_ID, // 审核人接口ID
    NodeCheckerName: unProxyNodeRecord.NodeCheckerName, // 已选审核人(用于回显)
  };
  console.warn('editData', editData);
  WorkFlowFormModalApi?.setData({
    modalType: 'EDIT',
    modalTitle: '修改',
    row: editData,
    callback() {
      console.warn('编辑回调，刷新子表格');
      // 刷新子表格
      roleGridApi.query({ AD_Workflow_ID: unProxyHeaderRow.AD_Workflow_ID });
    },
  }).open();
};

// 调整节点顺序
const handleNodeSequence = () => {
  const tableData = roleGridApi.grid.getFullData();
  console.warn('tableData', tableData);
  if (!tableData || tableData.length === 0) {
    message.warning('请先增加节点');
    return;
  }
  let count = 0;
  tableData.forEach((item: any) => {
    if (item.IsActive === 'Y') {
      count++;
    }
  });
  if (count === 0) {
    message.warning('无有效节点');
    return;
  }
  console.warn('count', count);
  const header = ChcGridApi.grid.getRadioRecord(true);
  console.warn('header', header);
  if (!header) {
    message.warning('请选择一个流程');
    return;
  }
  const selectedNode = tableData[0];
  console.warn('selectedNode', selectedNode);
  if (!selectRow.value.AD_Workflow_ID) {
    message.warning('请先增加节点');
    return;
  }
  console.warn('校验通过');
  AdjustTheNodeSequenceModalApi.setData({
    modalType: 'EDIT',
    modalTitle: '调整节点顺序',
    row: {
      Value: header.Value,
      AD_Workflow_ID: header.AD_Workflow_ID,
      WorkflowName: header.Name,
      NodeList: tableData,
    },
    callback() {
      console.warn('调整节点顺序回调，刷新子表格');
      // 刷新子表格
      roleGridApi.query({ AD_Workflow_ID: header.AD_Workflow_ID });
    },
  }).open();
};

// 删除
const handleDel = () => {
  const selectRow = roleGridApi.grid.getRadioRecord(true);
  if (!selectRow) {
    message.warning('请选择一条记录');
    return;
  }
  // 有选中数据才弹出确认框
  Modal.confirm({
    title: '提示',
    content: '确认删除？',
    centered: true,
    onOk: async () => {
      try {
        await deleteNode({ AD_WF_Node_ID: selectRow?.AD_WF_Node_ID })
          .then((res) => {
            if (res && res.success) {
              console.warn('deleteNode', res);
              roleGridApi.query({
                AD_Workflow_ID: parentTableParams.value.AD_Workflow_ID,
              });
              message.success('删除成功');
            } else {
              message.error(res.msg || '失败');
            }
          })
          .catch((error) => {
            console.error('失败', error);
          });
      } catch {
        message.error('删除失败');
      }
    },
  });
};

// 是否开启
const handleOpenSwitchChange = async (row: any, checked: string) => {
  console.warn('handleOpenSwitchChange', row, checked);
  const params: any = {
    ...row,
    IsActive: checked,
    WfValue: row.Value,
    // AD_Workflow_ID: row.AD_Workflow_ID,
  };
  let requestType: 'custom' | 'normal' = 'normal';
  if (row.Type && row.Type === 'custom') {
    requestType = 'custom';
    // params.workflowExtendId = row.workflowExtendId;
  }
  try {
    const res = await updateWorkflowAction(params, requestType);
    if (res && res.success) {
      message.success(`${checked === 'Y' ? '开启' : '关闭'}成功`);
      ChcGridApi.grid.setRow(row, {
        IsActive: checked,
      });
      if (!row.AD_Workflow_ID || row.AD_Workflow_ID === 0) {
        ChcGridApi.grid.setRow(row, {
          AD_Workflow_ID: res.data.AD_Workflow_ID,
        });
      }
    } else {
      message.error(res.msg || `${checked === 'Y' ? '开启' : '关闭'}失败`);
    }
  } catch (error) {
    message.error(`${checked ? '开启' : '关闭'}请求失败`);
    console.error('操作失败', error);
  }
};

// 是否有效
const handleActiveSwitchChange = async (row: any, checked: string) => {
  //  roleGridApi.grid.setRow(row, {
  //   isactive: checked,
  // });
  // const params = {
  //   ...row,
  //   IsActive: checked,
  // };
  // activeServer(params).then((res: any) => {
  //   if (res && res.success) {
  //     message.success('操作成功');
  //     handleQuery();
  //   }
  // });
  console.warn('handleActiveSwitchChange', row, checked);
  const params = {
    ...row,
    IsActive: checked,
    AD_Workflow_ID: parentTableParams.value.AD_Workflow_ID,
  };
  try {
    const res = await checkActiveNode(params);
    if (res && res.success) {
      message.success('操作成功');
      // roleGridApi.grid.setRow(row, {
      //   IsActive: newIsActive,
      // })
      // 直接刷新子表格
      roleGridApi.query({
        AD_Workflow_ID: parentTableParams.value.AD_Workflow_ID,
      });
    } else {
      message.error(res.msg || `${checked === 'Y' ? '开启' : '关闭'}失败`);
    }
  } catch (error) {
    message.error('操作失败');
    console.error('Node switch update failed', error);
  }
};
onMounted(() => {
  console.warn('onMounted', userStore.userInfo);
  // 触发自动查询
  searchController.sign();
});
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <PageSplit
      :distribute="0.6"
      :line-thickness="6"
      :is-vertical="true"
      background-color="#f1f3f6"
      hover-color="#c0c4cc"
      :has-line-tip="true"
    >
      <template #first>
        <ExpansionFormModal />
        <Card title="工作流" class="card">
          <ChcGrid>
            <template #toolbar-actions>
              <Button
                v-if="
                  selectRow &&
                  selectRow.Type === 'normal' &&
                  selectRow.Value !== 'C_Surgical_Orderplan'
                "
                type="primary"
                @click="handleApproval"
                class="mr-[0.5rem]"
                data-testid="button_expansion_workflowConfiguration"
              >
                扩展
                <template #icon>
                  <AddActionIcon />
                </template>
              </Button>
              <Button
                v-if="selectRow && selectRow.Type === 'custom'"
                type="primary"
                @click="handleApproval"
                class="mr-[0.5rem]"
                data-testid="button_modify_workflowConfiguration"
              >
                修改
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
            </template>
            <template #isOpen="scope">
              <Switch
                :checked="scope.row.IsActive"
                @change="
                  (checked: any) => handleOpenSwitchChange(scope.row, checked)
                "
                checked-value="Y"
                checked-children="是"
                un-checked-value="N"
                un-checked-children="否"
                :data-testid="`switch_isOpen_${scope.rowIndex}_workflowConfiguration`"
              />
            </template>
          </ChcGrid>
        </Card>
      </template>
      <template #second>
        <WorkFlowFormModal />
        <AdjustTheNodeSequenceModal />
        <Card title="审批节点" class="card">
          <RoleGrid>
            <template #toolbar-actions>
              <Input
                v-model:value="name"
                class="mr-[0.5rem] w-[240px]"
                placeholder="请输入名称"
                @keyup.enter="handleSearch"
                allow-clear
                data-testid="input_name_workflowConfiguration"
              />
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleSearch"
                data-testid="button_search_workflowConfiguration"
              >
                搜索
                <template #icon>
                  <SearchActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleAdd"
                data-testid="button_add_workflowConfiguration"
              >
                新 增
                <template #icon>
                  <AddActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem]"
                @click="handleEdit"
                data-testid="button_edit_workflowConfiguration"
              >
                编辑
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                class="mr-[0.5rem] mt-[0.5rem]"
                @click="handleNodeSequence"
                data-testid="button_adjustNodeSequence_workflowConfiguration"
              >
                调整节点顺序
                <template #icon>
                  <EditActionIcon />
                </template>
              </Button>
              <Button
                type="primary"
                danger
                class="mt-[0.5rem]"
                @click="handleDel"
                data-testid="button_delete_workflowConfiguration"
              >
                删除
                <template #icon>
                  <SvgDeleteIcon />
                </template>
              </Button>
            </template>
            <template #IsActive="scope">
              <Switch
                :checked="scope.row.IsActive"
                @change="
                  (checked: any) => handleActiveSwitchChange(scope.row, checked)
                "
                checked-value="Y"
                checked-children="是"
                un-checked-value="N"
                un-checked-children="否"
                :data-testid="`switch_IsActive_${scope.rowIndex}_workflowConfiguration`"
              />
            </template>
          </RoleGrid>
        </Card>
      </template>
    </PageSplit>
  </Page>
</template>

<style scoped lang="scss">
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

::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}

// ::v-deep(.vxe-grid--toolbar-wrapper .vxe-tools--wrapper .ant-btn > svg) {
//   margin-right: -1px;
//   margin-bottom: 4px;
//   margin-left: -5px;
// }
</style>

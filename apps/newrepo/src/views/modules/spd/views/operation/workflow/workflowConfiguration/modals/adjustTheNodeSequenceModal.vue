<script lang="ts" setup>
import type { WorkflowNodeRow } from '../api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useSpdGrid } from '#/components/spd';

import { changeNodeSeq } from '../api';

const emit = defineEmits(['close']);
const modalData = ref<any>({});
const title = ref('');
// 当前表格数据（用于实时显示审批顺序）
const currentTableData = ref<any[]>([]);
// 计算审批顺序显示文本
const approvalSequenceText = computed(() => {
  if (!currentTableData.value || currentTableData.value.length === 0) {
    return '暂无节点';
  }

  // 过滤有效数据并拼接节点名称
  const validNodes = currentTableData.value.filter(
    (item) => item.Name !== undefined && item.Name !== null && item.Name !== '',
  );

  if (validNodes.length === 0) {
    return '暂无节点';
  }

  return validNodes.map((item) => item.Name).join(' ——> ');
});

const [ChcGrid, chcGridApi] = useSpdGrid(
  {
    gridOptions: {
      columns: [
        {
          field: 'AD_WF_Node_ID',
          title: 'AD_WF_Node_ID',
          visible: false,
        },
        {
          title: '节点名称',
          field: 'Name',
          width: '100%',
          align: 'left',
          sortable: false,
          // dragSort: true, // 开启拖拽
        },
      ],
      pagerConfig: {
        enabled: false,
      },
      proxyConfig: {
        autoLoad: false,
      },
      rowConfig: {
        drag: true,
      },
      rowDragConfig: {
        trigger: 'row',
        showGuidesStatus: true,
      },
      stripe: false,
    },
    // 添加表格事件监听
    gridEvents: {
      //       rowDragstart ({ row }) {
      //   console.log(`拖拽开始 ${row.name}`)
      // },
      rowDragend({ newRow, oldRow, dragPos }) {
        console.warn(
          `拖拽完成，被拖拽行：${oldRow.Name} 目标行：${newRow.Name} 目标位置：${dragPos}`,
        );
        // 获取最新的表格数据
        const fullData = chcGridApi.grid.getFullData();
        console.warn('fullData:', fullData);
        // 更新当前表格数据
        currentTableData.value = fullData;
      },
    },
  },
  {
    dataTableId: '/workflowAction/queryActiveNodeList.do',
    id: 'queryActiveNodeListGrid',
    tableSearchExtraParams: {},
    beforeFetchFn: (params) => {
      console.warn('beforeFetchFn:', params);
      return {
        ...params,
        limit: 0,
      };
    },
    afterFetchFn: (params) => {
      console.warn('afterFetchFn:', params);
      currentTableData.value = params.rows;
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
    // 清空数据
    currentTableData.value = [];
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      modalData.value = modalApi.getData<Record<string, any>>();
      title.value = modalData.value.modalTitle;
      console.warn('modalData.value', modalData.value);
      const { Value, WorkflowName, AD_Workflow_ID } = modalData.value.row;
      console.warn(
        'Value, WorkflowName,AD_Workflow_ID',
        Value,
        WorkflowName,
        AD_Workflow_ID,
      );
      if (!Value) {
        message.error('未获取到工作流编码！');
        return;
      }
      if (!WorkflowName) {
        message.error('未获取到工作流名称！');
        return;
      }
      const indexDg = modalData.value.row.NodeList
        ? modalData.value.row.NodeList[0]
        : {};
      console.warn('indexDg', indexDg);
      if (!indexDg.AD_Workflow_ID) {
        message.error('未获取到工作流！');
      }
      setTimeout(() => {
        chcGridApi.query({
          AD_Workflow_ID: indexDg.AD_Workflow_ID,
        });
      }, 200);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});

async function onSubmit() {
  console.warn('currentTableData.value', currentTableData.value);
  // 获取工作流ID
  const AD_Workflow_ID = modalData.value.row.AD_Workflow_ID;
  if (!AD_Workflow_ID || AD_Workflow_ID === '' || AD_Workflow_ID === 0) {
    message.error('未获取到工作流ID！');
    return;
  }
  const records = currentTableData.value;
  if (!records || records.length === 0) {
    message.error('暂无节点数据');
    return;
  }
  try {
    // 提取节点ID列表（按当前顺序）
    const lines: number[] = [];
    let hasError = false;
    records.forEach((record: WorkflowNodeRow, index: number) => {
      // 过滤空数据
      if (JSON.stringify(records) !== '[]') {
        // 校验节点ID
        if (!record.AD_WF_Node_ID) {
          message.error(`第${index + 1}行异常，未获取到节点ID！`);
          hasError = true;
          return;
        }
        // 只push节点ID
        lines.push(record.AD_WF_Node_ID);
      }
    });
    if (hasError) {
      return;
    }
    // 构造请求参数
    const params = {
      AD_Workflow_ID,
      lineData: JSON.stringify(lines), // 传JSON字符串，不是数组
    };
    console.warn('params', params);
    const result = await changeNodeSeq(params);
    if (result && result.success) {
      message.success('调整成功');
      // 刷新父页面表格（需要通过emit或其他方式通知）
      emit('close', { reload: true });
      if (modalData.value.callback) {
        modalData.value.callback();
      }
      modalApi.close();
    } else {
      message.error(result.message || '调整失败');
    }
  } catch (error) {
    console.error('调整节点顺序失败:', error);
    message.error('调整节点顺序失败');
  }
}
</script>
<template>
  <Modal class="w-[800px]" :title="title" title-tooltip="">
    <div class="flex flex-col gap-3">
      <!-- 图例 -->
      <div class="legend-info">
        <div class="mb-2">
          <span class="inline-block w-[70px] text-end">工作流：</span>
          <span>{{ modalData.row.WorkflowName }}</span>
        </div>
        <div class="mb-2">
          <span class="inline-block w-[70px] text-end">操作：</span>
          <span>
            将光标移至节点名称上并按住鼠标左键进行
            <span class="text-[#ff0000]">上下移动</span>
            可调整审批顺序
          </span>
        </div>
        <div>
          <span class="inline-block w-[70px] text-end">审批顺序：</span>
          <span
            class="inline-block max-w-[calc(100%-100px)] align-top"
            :class="{ 'text-gray-400': currentTableData.length === 0 }"
          >
            {{ approvalSequenceText }}
          </span>
        </div>
      </div>
      <!-- 列表 -->
      <div class="node-list">
        <ChcGrid />
      </div>
    </div>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_adjustTheNodeSequenceModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>
<style lang="scss" scoped>
.legend-info {
  padding: 15px;
  font-size: 14px;
  background-color: #f2f2f2;
  border-left: 5px solid #009688;
}
</style>

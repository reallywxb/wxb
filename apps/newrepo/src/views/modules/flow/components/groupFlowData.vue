<script setup lang="ts">
import { inject, ref } from 'vue';

import {
  ClearOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons-vue';
import { Avatar, Button, message, Modal, Tag, Tooltip } from 'ant-design-vue';

import { isNotBlank } from '#/utils/flow/objutil';
import { disableFlow, enableFlow } from '#/views/modules/flow/api/flow';
import {
  clearProcess,
  deleteProcessMain,
} from '#/views/modules/flow/api/group';

import ProcessVersionPopup from '../components/ProcessVersionPopup.vue';

defineProps({
  flow: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(['handleQuery']);

const changeComponent =
  inject<(component: string, payload?: any) => void>('changeComponent');

function toEditFlow(flow: Record<string, any>) {
  // TODO
  // const to = `/flow/ChildCreation?id=${flow.uniqueId}&flowId=${flow.flowId}`;
  changeComponent?.('creation', {
    id: flow.uniqueId,
    flowId: flow.flowId,
  });
}

function toCopyFlow(flow: Record<string, any>) {
  // TODO
  // const to = `/flow/ChildCreation?cp=1&flowId=${flow.flowId}`;
  //
  changeComponent?.('creation', {
    cp: true,
    flowId: flow.flowId,
  });
}

function showDisableConfirm(flow: any) {
  Modal.confirm({
    content: '确定要停用该流程吗?',
    title: '提示',
    okType: 'danger',
    onOk: () => {
      disableFlow(flow.flowId, flow.groupId).then(() => {
        message.success('操作成功');
        emit('handleQuery');
      });
    },
  });
}

function showEnableConfirm(flow: any) {
  Modal.confirm({
    content: '确定要启用该流程吗?',
    title: '提示',
    okType: 'primary',
    onOk: () => {
      enableFlow(flow.flowId, flow.groupId).then(() => {
        message.success('操作成功');
        emit('handleQuery');
      });
    },
  });
}

// 显示版本管理
const processVersionRef = ref();
function showVersionManage(flow) {
  processVersionRef.value.show(flow.uniqueId);
}

// 删除流程
function showDeleteConfirm(flow: any) {
  Modal.confirm({
    content: '确定要删除该流程吗?',
    title: '提示',
    okType: 'danger',
    onOk: () => {
      deleteProcessMain(flow.uniqueId).then(() => {
        message.success('操作成功');
        emit('handleQuery');
      });
    },
  });
}

// 清理流程
function showClearProcessConfirm(flow: any) {
  Modal.confirm({
    content: '本次操作会删除流程所有数据，包括进行中的和已完成的，确定继续吗?',
    title: '提示',
    okType: 'danger',
    onOk: () => {
      clearProcess(flow.uniqueId).then(() => {
        message.success('操作成功');
        emit('handleQuery');
      });
    },
  });
}

function handleQuery() {
  emit('handleQuery');
}
</script>

<template>
  <div>
    <ProcessVersionPopup
      @close-dialog-event="handleQuery"
      ref="processVersionRef"
    />

    <div class="item">
      <div style="position: relative">
        <Avatar shape="square" :size="50" :src="flow.logo" />
      </div>
      <div
        style="width: 300px; margin-left: 20px"
        v-if="isNotBlank(flow.remark)"
      >
        <div style="width: 300px">
          <Tooltip :title="flow.name">
            <span>{{ flow.name }}</span>
          </Tooltip>
        </div>
        <div>
          <Tooltip
            class="box-item"
            effect="dark"
            :title="flow.remark"
            placement="leftTop"
          >
            <span type="info">{{ flow.remark }}</span>
          </Tooltip>
        </div>
      </div>
      <div style="width: 300px; margin-left: 20px" v-else>
        <div style="width: 300px; height: 60px; line-height: 60px">
          <Tooltip
            class="box-item"
            effect="dark"
            :title="flow.name"
            placement="leftTop"
          >
            <span>{{ flow.name }}</span>
          </Tooltip>
        </div>
      </div>

      <div
        style="
          width: 200px;
          height: 60px;
          margin-left: 50px;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 60px;
          white-space: nowrap;
        "
      >
        <template v-if="flow.rangeShow && flow.rangeShow.length > 0">
          <Tooltip
            class="box-item"
            effect="dark"
            :title="flow.rangeShow"
            placement="leftTop"
          >
            {{ flow.rangeShow }}
          </Tooltip>
        </template>
        <template v-else>所有人</template>
      </div>
      <div style="height: 60px; line-height: 60px">
        <Tag v-if="flow.stop" color="error">挂起</Tag>
        <Tag v-else color="success">激活</Tag>
      </div>
      <div class="last">
        <Tooltip
          class="box-item ml-[5px]"
          effect="dark"
          title="编辑"
          placement="top"
        >
          <Button text @click="toEditFlow(flow)" shape="circle">
            <EditOutlined />
          </Button>
        </Tooltip>
        <Tooltip
          class="box-item ml-[5px]"
          effect="dark"
          title="复制"
          placement="top"
        >
          <Button text @click="toCopyFlow(flow)" shape="circle">
            <CopyOutlined />
          </Button>
        </Tooltip>

        <Tooltip
          v-if="flow.stop"
          class="box-item ml-[5px]"
          effect="dark"
          title="启用"
          placement="top"
        >
          <Button @click="showEnableConfirm(flow)" shape="circle">
            <PlayCircleOutlined />
          </Button>
        </Tooltip>

        <Tooltip
          v-else
          class="box-item ml-[5px]"
          effect="dark"
          title="停用"
          placement="top"
        >
          <Button @click="showDisableConfirm(flow)" shape="circle">
            <StopOutlined />
          </Button>
        </Tooltip>

        <Tooltip
          class="box-item ml-[5px]"
          effect="dark"
          title="版本管理"
          placement="top"
        >
          <Button @click="showVersionManage(flow)" shape="circle">
            <MenuOutlined />
          </Button>
        </Tooltip>

        <Tooltip
          class="box-item ml-[5px]"
          effect="dark"
          title="清理流程"
          placement="top"
        >
          <Button shape="circle" @click="showClearProcessConfirm(flow)">
            <ClearOutlined />
          </Button>
        </Tooltip>

        <Tooltip
          class="box-item ml-[5px]"
          effect="dark"
          title="删除"
          placement="top"
        >
          <Button danger @click="showDeleteConfirm(flow)" shape="circle">
            <DeleteOutlined />
          </Button>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.item {
  display: flex;
  flex-direction: row;
  height: 60px;
  padding-top: 5px;
  margin-bottom: 10px;

  div:nth-child(2) div:first-child {
    font-size: 15px;
    height: 30px;
    font-weight: bolder;
    line-height: 30px;
  }

  div:nth-child(2) div:last-child {
    font-size: 12px;
    height: 20px;
    line-height: 20px;
  }

  .last {
    width: calc(100% - 70px - 200px - 200px - 50px);
    height: 60px;
    line-height: 60px;
    text-align: right;
  }
}
</style>

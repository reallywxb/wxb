<script setup>
import { defineExpose, inject, ref, watch } from 'vue';

import { useFlowStore } from '#/store/flow'; // 导入
import { nodeData } from '#/utils/flow/const.js';
import { getAllNodeExceptBranch } from '#/utils/flow/nodeutil.js';
import { deepCopy } from '#/utils/flow/objutil.js';

import approverDrawer from '../drawer/approverDrawer.vue';
import conditionDrawer from '../drawer/conditionDrawer.vue';
import copyerDrawer from '../drawer/copyerDrawer.vue';
import delayDrawer from '../drawer/delayDrawer.vue';
import promoterDrawer from '../drawer/promoterDrawer.vue';
import nodeWrap from '../node/nodeWrap.vue';

const props = defineProps({
  nodeConfigObj: {
    type: Object,
    default: () => {},
  },
});

const readOnly = inject('readOnlyAtFlow');

const tipList = ref([]);
const nowVal = ref(100);
const nodeConfig = ref();

watch(
  () => props.nodeConfigObj,
  (val) => {
    nodeConfig.value = val.length === 0 ? deepCopy(nodeData[0]) : val;
  },
  { deep: true },
);

const reErr = (childNode) => {
  let nullNum;
  if (childNode) {
    const { type, error, nodeName, conditionNodes } = childNode;

    switch (type) {
      case 3: {
        reErr(childNode.childNode);

        break;
      }
      case 4:
      case 8: {
        reErr(childNode.childNode);
        nullNum = 0;

        for (const conditionNode of conditionNodes) {
          if (conditionNode.error) {
            tipList.value.push(`请设置${conditionNode.nodeName}的条件`);
          }
          reErr(conditionNode.childNode);

          if (!conditionNode.childNode) {
            nullNum++;
          }
        }
        if (nullNum === conditionNodes.length) {
          tipList.value.push(`${nodeName} ：分支下节点不能为空`);
        }

        break;
      }
      case 5: {
        reErr(childNode.childNode);
        nullNum = 0;
        for (const conditionNode of conditionNodes) {
          const cNode = conditionNode.childNode;
          if (!cNode) {
            nullNum++;
          }
          reErr(cNode);
        }
        if (nullNum === conditionNodes.length) {
          tipList.value.push(`${nodeName} ：分支下节点不能为空`);
        }

        break;
      }
      default: {
        if (error) {
          tipList.value.push(`${nodeName} ：未配置完成`);
        }
        reErr(childNode.childNode);
      }
    }
  } else {
    childNode = null;
  }
};

const store = useFlowStore();

watch(
  () => nodeConfig.value,
  (v) => {
    store.setStep3(v);
  },
  { deep: true },
);
const getProcessData = async () => {
  return nodeConfig.value;
};
const zoomSize = (type) => {
  if (type === 1) {
    if (nowVal.value === 50) {
      return;
    }
    nowVal.value -= 10;
  } else {
    if (nowVal.value === 300) {
      return;
    }
    nowVal.value += 10;
  }
};
const validate = (f) => {
  tipList.value = [];

  const allNodeExportBranch = getAllNodeExceptBranch(nodeConfig.value);

  if (allNodeExportBranch.length === 0) {
    tipList.value = ['请完善流程节点'];
  }

  reErr(nodeConfig.value);
  if (tipList.value.length > 0) {
    f(false, tipList.value);
    return;
  }
  f(true);
};
defineExpose({ validate, getProcessData });
</script>

<template>
  <div class="step-3">
    <div class="fd-nav-content">
      <section class="dingflow-design">
        <div class="zoom" v-if="!readOnly">
          <div
            class="zoom-out"
            :class="nowVal === 50 && 'disabled'"
            @click="zoomSize(1)"
          ></div>
          <span>{{ nowVal }}%</span>
          <div
            class="zoom-in"
            :class="nowVal === 300 && 'disabled'"
            @click="zoomSize(2)"
          ></div>
        </div>
        <div
          class="box-scale"
          :style="`transform: scale(${nowVal / 100});`"
          style="z-index: 1"
        >
          <nodeWrap v-model:node-config="nodeConfig" />
          <div class="end-node">
            <div class="end-node-circle"></div>
            <div class="end-node-text">流程结束</div>
          </div>
        </div>
      </section>
    </div>
    <promoterDrawer />
    <approverDrawer />
    <copyerDrawer />
    <conditionDrawer />

    <delayDrawer />
  </div>
</template>
<style lang="scss" scoped>
@import '../../../../../styles/flow/workflow.css';

.step-3 {
  background: white;
  border-radius: 8px;
}

.error-modal-list {
  width: 455px;
}
</style>

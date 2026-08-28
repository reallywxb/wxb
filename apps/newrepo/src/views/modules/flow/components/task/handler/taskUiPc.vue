<script setup lang="ts">
import { onMounted, ref } from 'vue';

import {
  Card,
  Col,
  Divider,
  Modal,
  Row,
  Select,
  SelectOption,
} from 'ant-design-vue';
import { ElScrollbar } from 'element-plus';

import { queryHeaderShow } from '#/views/modules/flow/api/base';
import { getFormDetail } from '#/views/modules/flow/api/form';

import FlowNodeFormat from '../../flow/FlowNodeFormatData.vue';
import HeaderUI from '../show/header.vue';
import OperUI from '../show/oper.vue';
import FormUI from './formUIPc.vue';

const emit = defineEmits(['taskSubmitEvent']);
const rightDrawerVisible = ref(false);
const headerUIRef = ref();

/**
 * 点击开始处理
 */
const deal = (tId, pId, fId, ccId, nId) => {
  taskId.value = tId;
  flowId.value = fId;
  processInstanceId.value = pId;
  copyId.value = ccId;

  // ////////////////////////////////////////////////////////////////

  queryHeaderShow({
    processInstanceId: pId,
    taskId: tId,
    flowId: fId,
    ccId,
  }).then((data) => {
    headerUIRef.value.loadData(data);
  });

  getFormDetail(
    {
      flowId: fId,
      processInstanceId: pId,
      taskId: tId,
      ccId,
    },
    true,
  ).then((data) => {
    startUserDeptList.value = data.startUserDeptList;

    selectStartDept.value = data.selectStartDept;
    if (data.selectStartDept) {
      // 是否发起人需要选择部门
      startUserMainDeptId.value = data.startUserDeptList[0]?.id;
    }

    formUIRef.value.loadData(
      data.formList,
      fId,
      nId,
      pId,
      tId,
      ccId,
      data.dynamic,
      data.formChangeRecord,
    );

    operUIRef.value.handle(tId);
  });

  rightDrawerVisible.value = true;

  // }
};

defineExpose({ deal });

const taskSubmitEvent = () => {
  rightDrawerVisible.value = false;

  emit('taskSubmitEvent');
};

// 验证表单
function validateForm(op, f) {
  const validate = flowNodeFormatRef.value.validate(op);
  if (!validate) {
    f(false);
    return;
  }
  const param = flowNodeFormatRef.value.formatSelectNodeUser();

  formUIRef.value.validate((a, b) => {
    if (param) {
      f(a, { ...b, ...param });
    } else {
      f(a, b);
    }
  });
}

const formUIRef = ref();

onMounted(() => {});
const formValueChange = (v) => {
  v.startUserMainDeptId = startUserMainDeptId.value;

  flowNodeFormatRef.value.queryData(
    v,
    flowId.value,
    processInstanceId.value,
    taskId.value,
  );
};
const flowNodeFormatRef = ref();
const operUIRef = ref();
const flowId = ref('');
const taskId = ref('');
const copyId = ref();

const processInstanceId = ref('');

// 发起人的部门
const startUserDeptList = ref([]);

// 发起的主部门id
const startUserMainDeptId = ref();
// 是否需要选择发起人部门
const selectStartDept = ref(false);
// 发起人主部门id变化了
function startUserMainDeptChangeEvent(e) {
  const formValue = formUIRef.value.getFormValue();

  formValue.startUserMainDeptId = e;
  flowNodeFormatRef.value.queryData(
    formValue,
    flowId.value,
    processInstanceId.value,
    taskId.value,
    'start',
  );
}
</script>

<template>
  <div>
    <Modal
      v-model:open="rightDrawerVisible"
      closable
      width="1200px"
      destroy-on-close
    >
      <template #title>
        <Card style="margin-bottom: 20px">
          <HeaderUI ref="headerUIRef" />
        </Card>
      </template>

      <!--			右侧抽屉-->
      <Row class="dialog-content">
        <Col :span="16" style="height: 100%">
          <ElScrollbar>
            <div style="">
              <template v-if="selectStartDept && startUserDeptList.length > 1">
                <h4>请选择您当前所在部门</h4>
                <Select
                  @change="startUserMainDeptChangeEvent"
                  v-model:value="startUserMainDeptId"
                  placeholder="请选择您当前所在部门"
                  style="width: 100%"
                >
                  <SelectOption
                    v-for="item in startUserDeptList"
                    :key="item.id"
                  >
                    {{ item.name }}
                  </SelectOption>
                </Select>

                <Divider />
              </template>

              <FormUI @form-value-change="formValueChange" ref="formUIRef" />
            </div>
          </ElScrollbar>
        </Col>
        <Col :span="8" style="height: 100%">
          <ElScrollbar>
            <FlowNodeFormat ref="flowNodeFormatRef" />
          </ElScrollbar>
        </Col>
      </Row>
      <template #footer>
        <div>
          <OperUI
            ref="operUIRef"
            @task-submit-event="taskSubmitEvent"
            @validate-form="validateForm"
            :flow-id="flowId"
            :task-id="taskId"
            :process-instance-id="processInstanceId"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<style lang="scss">
.dialog-content {
  height: 400px;
}
</style>

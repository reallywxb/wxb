<script setup lang="ts">
import { ref } from 'vue';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons-vue';
import { Col, Divider, Modal, Row, Select, SelectOption } from 'ant-design-vue';
import { ElScrollbar } from 'element-plus';

import { getFormDetail } from '#/views/modules/flow/api/form';

import FormUI from '../task/handler/formUIPc.vue';
import FlowNodeFormat from './FlowNodeFormatData.vue';

const emit = defineEmits(['complete']);
const dialogTableVisible = ref<Boolean>(false);
const formUIRef = ref();
const loading = ref(false);
const submitProcess = () => {
  loading.value = true;

  const validate = flowNodeFormatRef.value.validate('pass');
  loading.value = validate;

  if (!validate) {
    return;
  }

  const param = flowNodeFormatRef.value.formatSelectNodeUser();

  formUIRef.value.validate((valid, fv) => {
    if (valid) {
      const data = {
        flowId: flowId.value,
        uniqueId: uniqueId.value,
        paramMap: { ...param, ...fv },
      };
      emit('complete', data);
      loading.value = false;
    } else {
      loading.value = false;
    }
  });
};
const complete = () => {
  dialogTableVisible.value = false;
};
const flowId = ref('');
const uniqueId = ref('');
const taskId = ref('');
const processInstanceId = ref('');
// 发起人的部门
const startUserDeptList = ref([]);
const handle = (fId, tId, pId, uniId) => {
  uniqueId.value = uniId;
  flowId.value = fId;
  taskId.value = tId;
  processInstanceId.value = pId;

  getFormDetail(
    {
      flowId: fId,
      processInstanceId: pId,
      taskId: tId,
      from: 'start',
    },
    true,
  ).then((data) => {
    formUIRef.value.loadData(
      data.formList,
      flowId.value,
      undefined,
      undefined,
      undefined,
      undefined,
      data.dynamic,
    );
    startUserDeptList.value = data.startUserDeptList;
    startUserMainDeptId.value = data.startUserDeptList[0]?.id;
  });

  dialogTableVisible.value = true;
};

defineExpose({ handle, complete });

const formValueChange = (v) => {
  v.startUserMainDeptId = startUserMainDeptId.value;
  flowNodeFormatRef.value.queryData(
    v,
    flowId.value,
    processInstanceId.value,
    taskId.value,
    'start',
  );
};

// 发起的主部门id
const startUserMainDeptId = ref();
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

const flowNodeFormatRef = ref();
</script>

<template>
  <div>
    <Modal
      v-model:open="dialogTableVisible"
      title="发起流程"
      width="1200px"
      destroy-on-close
      @ok="submitProcess"
      :confirm-loading="loading"
    >
      <Row class="dialog-content">
        <Col :span="16" style="height: 100%">
          <ElScrollbar>
            <template v-if="startUserDeptList.length > 1">
              <h4>请选择您当前所在部门</h4>
              <Select
                @change="startUserMainDeptChangeEvent"
                v-model:value="startUserMainDeptId"
                placeholder="请选择您当前所在部门"
                style="width: 100%"
              >
                <SelectOption v-for="item in startUserDeptList" :key="item.id">
                  {{ item.name }}
                </SelectOption>
              </Select>
              <Divider />
            </template>

            <FormUI @form-value-change="formValueChange" ref="formUIRef" />
          </ElScrollbar>
          <!--          <div style="text-align: center; margin-top: 10px">-->
          <!--            <Button :loading="loading" type="primary" @click="submitProcess">-->
          <!--              <CheckOutlined />-->
          <!--              提交-->
          <!--            </Button>-->
          <!--          </div>-->
        </Col>
        <Col :span="8" style="height: 100%">
          <ElScrollbar>
            <FlowNodeFormat ref="flowNodeFormatRef" />
          </ElScrollbar>
        </Col>
      </Row>
      <template #cancelText>
        <CloseOutlined />
        <span>取消</span>
      </template>
      <template #okText>
        <CheckOutlined />
        <span>提交</span>
      </template>
    </Modal>
  </div>
</template>

<style scoped lang="less">
.dialog-content {
  height: 400px;
}
</style>

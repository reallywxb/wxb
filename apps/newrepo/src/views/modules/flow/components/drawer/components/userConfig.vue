<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed } from 'vue';

import {
  Col,
  InputNumber,
  Radio,
  RadioGroup,
  Row,
  Select,
  SelectOption,
  Switch,
} from 'ant-design-vue';

import { useFlowStore } from '#/store/flow';
import { setTypes } from '#/utils/flow/const.js';

import selectShow from '../../orgselect/selectAndShow.vue';

const props = defineProps({
  approverConfig: {
    type: Object,
    default: () => ({}),
  },
  excludeAssignType: {
    type: Array,
    default: () => [],
  },
});

const flowStore = useFlowStore();
const step2FormList = computed(() => {
  const step2 = flowStore.step2;

  return step2;
});

const step2FormUserList = computed(() => {
  return step2FormList.value.filter(
    (res) => res.type === 'SelectUser' || res.type === 'SelectMultiUser',
  );
});

// 审批人类型变化
const assignedTypeChangeEvent = () => {
  props.approverConfig.nodeUserList = [];
  props.approverConfig.formUserId = '';
  props.approverConfig.formUserName = '';
};

const formUserIdComputed = computed({
  get() {
    return props.approverConfig.formUserId;
  },
  set(val) {
    props.approverConfig.formUserName = step2FormUserList.value.find(
      (res) => res.id === val,
    ).name;
    props.approverConfig.formUserId = val;
  },
});
const step2FormDeptList = computed(() => {
  return step2FormList.value.filter(
    (res) => res.type === 'SelectDept' || res.type === 'SelectMultiDept',
  );
});

const formDeptIdComputed = computed({
  get() {
    return props.approverConfig.formUserId;
  },
  set(val) {
    props.approverConfig.formUserId = val;
    props.approverConfig.formUserName = step2FormDeptList.value.find(
      (res) => res.id === val,
    ).name;
  },
});
</script>

<template>
  <div>
    <RadioGroup
      v-model:value="approverConfig.assignedType"
      @change="assignedTypeChangeEvent"
      class="ml-4"
    >
      <Row>
        <template v-for="{ value, label } in setTypes" :key="value">
          <Col
            style="margin-top: 5px"
            :span="8"
            v-if="!excludeAssignType?.includes(value)"
          >
            <Radio :value="value">
              {{ label }}
            </Radio>
          </Col>
        </template>
      </Row>
    </RadioGroup>

    <template v-if="approverConfig.assignedType === 1">
      <h4>选择成员</h4>

      <select-show
        :disable-select-children-dept="false"
        v-model:org-list="approverConfig.nodeUserList"
        type="user"
        :multiple="true"
      />
    </template>
    <template v-if="approverConfig.assignedType === 8">
      <h4>人员控件</h4>
      <Select
        v-model:value="formUserIdComputed"
        clearable
        class="w-[30%]"
        placeholder="请选择"
      >
        <SelectOption
          v-for="item in step2FormUserList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.name }}
        </SelectOption>
      </Select>
    </template>
    <template v-if="approverConfig.assignedType === 9">
      <h4>部门控件</h4>
      <Select
        v-model:value="formDeptIdComputed"
        clearable
        class="w-[30%]"
        placeholder="请选择部门表单"
      >
        <SelectOption
          v-for="item in step2FormDeptList"
          :key="item.id"
          :value="item.id"
        >
          {{ item.name }}
        </SelectOption>
      </Select>
    </template>
    <template v-if="approverConfig.assignedType === 15">
      <h4>选择部门</h4>
      <select-show
        :disable-select-children-dept="false"
        v-model:org-list="approverConfig.nodeUserList"
        type="dept"
        :multiple="true"
      />
    </template>
    <!--	//表单中的部门 指定部门  指定成员（包含部门）-->
    <template v-if="approverConfig.assignedType === 9">
      <h4>是否包含下级部门</h4>
      <Switch
        v-model:checked="approverConfig.containChildrenDept"
        size="large"
        checked-children="当前部门以及下级部门"
        un-checked-children="仅限当前部门"
      />
    </template>

    <template
      v-if="
        approverConfig.assignedType === 15 || approverConfig.assignedType === 9
      "
    >
      <h4>选择部门属性</h4>
      <RadioGroup v-model:value="approverConfig.deptUserType" class="ml-4">
        <Radio value="allUser" size="large">部门人员</Radio>
        <Radio value="leader" size="large">部门主管</Radio>
        <Radio value="role" size="large">部门下的角色</Radio>
      </RadioGroup>
    </template>
    <template
      v-if="
        (approverConfig.assignedType === 15 &&
          approverConfig.deptUserType === 'role') ||
        (approverConfig.assignedType === 9 &&
          approverConfig.deptUserType === 'role')
      "
    >
      <h4>选择角色</h4>
      <select-show
        v-model:org-list="approverConfig.roleList"
        type="role"
        :multiple="true"
      />
    </template>

    <template v-if="approverConfig.assignedType === 3">
      <h4>选择角色</h4>

      <select-show
        v-model:org-list="approverConfig.nodeUserList"
        type="role"
        :multiple="true"
      />
    </template>

    <template v-if="approverConfig.assignedType === 7">
      <h4>审批终点</h4>
      <span style="margin-right: 5px; font-size: 14px">到第</span>
      <InputNumber
        v-model:value="approverConfig.deptLeaderLevel"
        :step="1"
        :min="1"
        :max="20"
        step-strictly
        size="small"
      />
      <span style="margin-left: 5px; font-size: 14px">级部门主管终止</span>
    </template>
    <template v-if="approverConfig.assignedType === 2">
      <h4>指定审批层级</h4>
      <span style="margin-right: 5px; font-size: 14px">第</span>
      <InputNumber
        v-model:value="approverConfig.deptLeaderLevel"
        :step="1"
        :min="1"
        :max="20"
        step-strictly
        size="small"
      />
      <span style="margin-left: 5px; font-size: 14px">级部门主管</span>
    </template>
  </div>
</template>

<style scoped lang="less">
h4 {
  margin: 10px 0;
}
</style>

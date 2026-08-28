<script setup type="ts">


import {computed, nextTick, ref, watch} from 'vue'

import {EditOutlined} from '@ant-design/icons-vue';
import {
  Checkbox,
  Col,
  Drawer,
  Input,
  Radio,
  RadioGroup,
  Row,
  TabPane,
  Tabs
} from 'ant-design-vue';

import {useStore} from '#/store/drawer'
import {useFlowStore} from '#/store/flow'
import { nodeData} from '#/utils/flow/const.js'
import $func from '#/utils/flow/index.js';
import * as util from '#/utils/flow/objutil.js';
import selectShow from '#/views/modules/flow/components/orgselect/selectAndShow.vue';

import FormPerm from './components/formPerm.vue'
import TitleHandler from './components/titleHandler.vue'
import UserConfig from './components/userConfig.vue'

const flowStore = useFlowStore();

const clickOperBtnName = (item, index) => {

	item.edit = true;

	nextTick(() => {
		document.querySelector(`#btnNameRef${index}`)?.focus();

	})


}


const operInputBlur = (item) => {

	item.edit = false;
	if (util.isBlank(item.name)) {
		item.name = item.defaultName
	}
}

const step2FormList = computed(() => {
	const step2 = flowStore.step2;

	return step2;
})


const openEvent = () => {
	const value = step2FormList.value;
	const arr = {};
	const formPerms = approverConfig.value.formPerms;

	for (const item of value) {
		arr[item.id] = "R"

		if (formPerms[item.id]) {
			arr[item.id] = formPerms[item.id]
		}
	}
	approverConfig.value.formPerms = arr;
}


let approverConfig = ref({})


const store = useStore()
const {setApproverConfig, setApprover} = store
const approverConfigData = computed(() => store.approverConfigData)
const approverDrawer = computed(() => store.approverDrawer)
const visible = computed({
	get() {
		return approverDrawer.value
	},
	set() {
		closeDrawer()
	}
})
watch(approverConfigData, (val) => {
	approverConfig.value = {...nodeData[val.value.type], ...val.value};
})


const saveApprover = () => {

	const checkApproval = $func.checkApproval(approverConfig.value);
	approverConfig.value.error = !checkApproval.ok;
	approverConfig.value.errorMsg = checkApproval.msg;
	setApproverConfig({
		value: approverConfig.value,
		flag: true,
		id: approverConfigData.value.id
	})
	closeDrawer()
}
const closeDrawer = () => {
	setApprover(false)
}

watch(() => visible.value,(val) => {
  setTimeout(() => {
    if(val) {openEvent()} else {saveApprover()}
  })
})
</script>

<template>
  <Drawer v-model:open="visible" :closable="false" :width="650">
    <!--			标题-->
    <template #title>
      <TitleHandler :node-config="approverConfig" />
    </template>

    <Tabs type="border-card">
      <TabPane tab="设置审批人" key="1">
        <UserConfig :approver-config="approverConfig" />

        <template
          v-if="
            approverConfig.assignedType === 4 ||
            approverConfig.assignedType === 14
          "
        >
          <h4>选择方式</h4>
          <RadioGroup v-model:value="approverConfig.multiple" class="ml-4">
            <Radio :value="false" size="large">单选</Radio>
            <Radio :value="true" size="large">多选</Radio>
          </RadioGroup>
        </template>
        <template
          v-if="
            ((approverConfig.multiple === true &&
              approverConfig.assignedType === 4) ||
              (approverConfig.multiple === true &&
                approverConfig.assignedType === 14) ||
              approverConfig.assignedType === 1 ||
              approverConfig.assignedType === 9 ||
              approverConfig.assignedType === 15 ||
              approverConfig.assignedType === 2 ||
              approverConfig.assignedType === 10 ||
              approverConfig.assignedType === 3 ||
              approverConfig.assignedType === 7 ||
              approverConfig.assignedType === 8) &&
            approverConfig.assignedType !== 5
          "
        >
          <h4>🧑‍🤝‍🧑多人审批时采用的审批方式</h4>
          <RadioGroup v-model:value="approverConfig.multipleMode" class="ml-4">
            <p style="display: block; width: 100%">
              <Radio :value="1" size="large">
                会签(默认需要所有审批人同意)
              </Radio>
            </p>
            <p style="display: block; width: 100%">
              <Radio :value="2" size="large"> 或签(一名审批人同意即可) </Radio>
            </p>
            <p style="display: block; width: 100%">
              <Radio :value="3" size="large"> 依次审批(按顺序依次审批) </Radio>
            </p>
          </RadioGroup>
        </template>

        <template
          v-if="
            approverConfig.assignedType !== 11 &&
            approverConfig.assignedType !== 12
          "
        >
          <h4>🈳审批人为空时</h4>
          <RadioGroup
            v-model:value="approverConfig.nobody.handler"
            class="ml-4"
          >
            <Radio style="width: 40%" value="TO_PASS" size="large">
              自动通过
            </Radio>
            <Radio value="TO_REFUSE" size="large">自动拒绝</Radio>
            <Radio style="width: 40%" value="TO_USER" size="large">
              指定人员
            </Radio>
            <Radio value="TO_ADMIN" size="large">转交给流程管理员</Radio>
          </RadioGroup>
          <select-show
            v-if="approverConfig.nobody.handler === 'TO_USER'"
            v-model:org-list="approverConfig.nobody.assignedUser"
            type="user"
            :multiple="false"
          />
        </template>
      </TabPane>
      <TabPane tab="操作权限" key="2">
        <ul>
          <li>
            <Row>
              <Col :span="12">
                <b class="replace-el-text">权限名字</b>
              </Col>
              <Col :span="12">
                <b class="replace-el-text">按钮名字</b>
              </Col>
            </Row>
          </li>
          <li v-for="(item, index) in approverConfig.operList" :key="index">
            <Row>
              <Col :span="12">
                <Checkbox v-model:checked="item.checked" size="large">
                  {{ item.defaultName }}
                </Checkbox>
              </Col>
              <Col :span="12">
                <div
                  class="replace-el-text"
                  v-if="!item.edit"
                  @click="clickOperBtnName(item, index)"
                >
                  {{ item.name }}
                  <EditOutlined />
                </div>
                <template v-else>
                  <Input
                    :id="`btnNameRef${index}`"
                    @blur="operInputBlur(item)"
                    v-model:value="item.name"
                    placeholder="请输入按钮名字"
                  />
                </template>
              </Col>
            </Row>
          </li>
        </ul>
      </TabPane>
      <TabPane tab="表单权限" key="3">
        <FormPerm :form-perm="approverConfig.formPerms" />
      </TabPane>
    </Tabs>
  </Drawer>
</template>
<style lang="scss" scoped>
@use '../../../../../styles/flow/common';

h4 {
  margin: 10px 0;
}
</style>

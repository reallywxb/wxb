<script setup type="ts">
import { computed} from 'vue'

import { DeleteOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Form,
  FormItem,
  Switch
} from 'ant-design-vue';

import Condition from './condition.vue'



const props = defineProps({

	data: {
		type: Object,
		default: () => {}
	},
	aboveFormId: {
		type: String, default: ''
	}
})


const emits = defineEmits(['update:data'])

const conditionConfig = computed({
	get() {
		return props.data
	},
	set(t) {
		emits("update:data", t)

	}
})

// 删除条件组
const deleteGroup = (index) => {
	conditionConfig.value?.conditionList.splice(index, 1)
}
// 刪除单个条件
const deleteCondition = (index, index1) => {
	conditionConfig.value?.conditionList[index].conditionList.splice(index1, 1)

}
// 添加一个条件组
const addOneConditionGroup = () => {

	conditionConfig.value?.conditionList.push({
		mode: true,
		conditionList: [{}]
	})
}
// 添加组内一个条件
const addOneCondition = (item) => {
	let conditionList = item.conditionList;
	if (!conditionList) {
		conditionList = [];
	}
	conditionList.push({});
	item.conditionList = conditionList;
}
</script>

<template>
  <div>
    <Form label-width="120px">
      <FormItem label="固定关系">
        <Switch
          v-model:checked="conditionConfig.mode"
          checked-children="且"
          un-checked-children="或"
        />
      </FormItem>
    </Form>

    <Card
      class="box-card"
      v-for="(item, index) in conditionConfig.conditionList"
      :key="index"
      style="margin-bottom: 20px"
    >
      <template #title>
        <div class="card-header">
          <span>条件组{{ index + 1 }}</span>
          <Switch
            v-model:checked="item.mode"
            checked-children="且"
            un-checked-children="或"
          />

          <Button
            type="text"
            class="flex-center"
            danger
            v-if="conditionConfig.conditionList.length > 1"
            @click="deleteGroup(index)"
          >
            <DeleteOutlined />
          </Button>
        </div>
      </template>
      <div v-for="(item1, index1) in item.conditionList" :key="index1">
        <div
          style="
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            height: 32px;
          "
        >
          <div>
            {{ index1 === 0 ? '当' : item.mode ? '且' : '或' }}
          </div>
          <div>
            <Button
              type="text"
              class="flex-center"
              size="small"
              danger
              @click="deleteCondition(index, index1)"
              v-if="item.conditionList.length > 1"
            >
              <DeleteOutlined />
            </Button>
          </div>
        </div>

        <Condition :above-form-id="aboveFormId" :condition="item1" />
      </div>
      <Button
        type="primary"
        text
        style="margin-top: 20px"
        @click="addOneCondition(item, index)"
      >
        添加条件
      </Button>
    </Card>
    <Button dark type="primary" text @click="addOneConditionGroup">
      添加条件组
    </Button>
  </div>
</template>
<style lang="less" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-tagInput {
  width: 100%;
  height: auto;
  margin: 10px;

  :deep {
    .tag-demo-con {
      .tag-wrap {
        height: 25px;
        line-height: 25px;

        .tag {
          display: inline-block;
          padding: 2px 8px;
          box-sizing: border-box;
          border-radius: 16px;
          background: #d8eeff;
          color: #174c76;
          border: 1px solid #bbd6ea;
          margin: 0 4px;
        }

        // padding: 4px;
        // margin: 4px;
        // border: 1px solid #ccc;
        // border-radius: 5px;
        // line-height: 1em;
        // min-width: 25px;
      }
    }
  }

  .tag-wrap {
    margin-top: 10px;
  }
}
</style>

<script lang="ts" setup>
import type { GroupVO } from '#/views/modules/flow/api/group/types';

import { computed, onMounted, ref } from 'vue';

import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  FormItem,
  Input,
  Row,
  Tooltip,
} from 'ant-design-vue';

import { deepCopy, isBlank } from '#/utils/flow/objutil';
import { queryMineStartGroupFlowList } from '#/views/modules/flow/api/group';

import Start from '../components/flow/startFlow.vue';

const startRef = ref();
const successGroupList = ref<GroupVO[]>([]);
const searchWord = ref('');

// 发起流程
const startProcess = (f) => {
  startRef.value.handle(f);
};
function handleQuery() {
  queryMineStartGroupFlowList(false).then((data) => {
    // const { data } = res;

    for (const it of data) {
      it.showFlowList = true;
    }
    successGroupList.value = data;
  });
}

const groupFinalList = computed(() => {
  const value = successGroupList.value;
  if (isBlank(searchWord.value)) {
    return value;
  }

  const arr = deepCopy(value);

  for (const item of arr) {
    const items = item.items;

    item.items = items.filter((res: any) =>
      res.name.includes(searchWord.value),
    );
  }
  return arr;
});

onMounted(() => {
  handleQuery();
});
</script>
<template>
  <div>
    <div
      v-if="successGroupList.length > 0"
      style="display: flex; justify-content: space-between"
    >
      <div>
        <Form layout="inline" class="demo-form-inline">
          <FormItem>
            <Input
              clearable
              v-model:value="searchWord"
              placeholder="搜索流程"
            />
          </FormItem>
        </Form>
      </div>
      <div style="margin-bottom: 20px; text-align: right"></div>
    </div>

    <div v-if="groupFinalList.length <= 0">
      <Empty :image-size="250" description="没有可发起的流程哦~" />
    </div>
    <Card class="box-card" v-for="item in groupFinalList" :key="item.id">
      <template #title>
        <div class="card-header">
          <span>{{ item.name }}</span>
          <span v-if="item.items.length > 0">
            <Button
              v-if="item.showFlowList"
              @click.stop="item.showFlowList = false"
              shape="circle"
            >
              <UpOutlined />
            </Button>
            <Button
              v-else
              @click.stop="item.showFlowList = true"
              shape="circle"
            >
              <DownOutlined />
            </Button>
          </span>
        </div>
      </template>
      <div v-if="item.items?.length && item.showFlowList">
        <Row>
          <Col :span="6" v-for="(flow, index1) in item.items" :key="index1">
            <div class="item" @click="startProcess(flow)">
              <div class="f1">
                <Avatar shape="square" :size="50" :src="flow.logo" />
              </div>
              <div class="f2">
                <div>
                  <Tooltip
                    class="box-item"
                    effect="dark"
                    :content="flow.name"
                    placement="topLeft"
                  >
                    <div class="replace-el-text">
                      <span>{{ flow.name }}</span>
                    </div>
                  </Tooltip>
                </div>
                <div style="color: #409eff">发起流程</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
    <Start ref="startRef" />
  </div>
</template>

<style scoped lang="scss">
@use '../../../../styles/flow/common.scss';

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item {
  display: flex;
  flex-direction: row;
  padding: 5px;
  margin: 5px 20px;
  cursor: pointer;
  background-color: #f5f5f7;
  border: 1px solid #dcdfe6;
  border-radius: 0;

  .f2 {
    width: 183px;
    height: 50px;
    margin-left: 15px;
    font-weight: bolder;
  }
}

.item:hover {
  box-shadow: 2px 2px 2px #dcdfe6;
}

.box-card {
  width: 100%;
  margin-top: 10px;
}
</style>

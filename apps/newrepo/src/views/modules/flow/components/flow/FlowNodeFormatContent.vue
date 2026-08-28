<script setup lang="ts">
import { ref } from 'vue';

import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons-vue';
import {
  Avatar,
  Badge,
  Button,
  ButtonGroup,
  Col,
  Divider,
  Image,
  Row,
  Tag,
  TimelineItem,
} from 'ant-design-vue';

import { isBlank, isNotBlank } from '#/utils/flow/objutil';

defineProps({
  nodeUser: {
    type: Object,
    default: () => ({}),
  },
  row: {
    type: Array,
    default: () => [],
  },
  disableSelect: {
    type: Boolean,
    default: false,
  },
});

const activeNodeId = ref('');
const activeNodeFunc = (n) => {
  activeNodeId.value = n.id;
};
</script>

<template>
  <template v-for="(node, index) in row" :key="index">
    <TimelineItem
      :color="
        node.status !== 2
          ? node.status === 1
            ? 'success'
            : node.status === 3
              ? 'warning'
              : 'info'
          : 'primary'
      "
    >
      <template #dot>
        <LoadingOutlined v-if="node.status === 1" />
        <CheckOutlined v-if="node.status === 2" />
        <CloseCircleOutlined v-if="node.status === 3" />
        <ClockCircleOutlined v-if="node.status === 4" />
      </template>
      <template
        v-if="
          !disableSelect &&
          node.selectUser &&
          (!nodeUser[node.id] || nodeUser[node.id]?.length === 0)
        "
      >
        <p style="color: red">
          {{ node.name }}
          <template v-if="node.placeholder && node.placeholder.length > 0">
            [{{ node.placeholder }}]
          </template>
        </p>
      </template>
      <template v-else>
        <div style="display: flex; flex-direction: row">
          <div class="f21" style="font-size: 15px; font-weight: bold">
            {{ node.name }}
          </div>
          <div class="f22">{{ node.showTimeStr }}</div>
        </div>
        <div
          style="margin-top: 5px; font-size: 12px; font-weight: normal"
          v-if="isNotBlank(node.placeholder)"
        >
          [{{ node.placeholder }}]
        </div>
      </template>

      <!--					渲染用户头像列表-->
      <div
        v-if="node.userVoList && node.userVoList.length > 0"
        style="display: flex; flex-flow: row wrap"
      >
        <div
          class="box-card"
          v-for="(item1, index1) in node.userVoList"
          :key="index1"
          style="
            width: 60px;
            margin-bottom: 10px;
            text-align: center;
            border: 0 solid red;
          "
        >
          <div class="node-show">
            <div style="overflow: hidden">
              <div class="d1">
                <div style="padding-top: 20px">
                  <Badge
                    :value="12"
                    is-dot
                    :type="
                      item1.status === 1
                        ? 'success'
                        : item1.status === 2
                          ? 'primary'
                          : item1.status === 3
                            ? 'warning'
                            : 'info'
                    "
                    class="item"
                  >
                    <Avatar shape="square" :size="30" :src="item1.avatar">
                      {{ item1.name.substring(0, 1) }}
                    </Avatar>
                  </Badge>
                </div>

                <div
                  style="
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 8px;
                    text-align: center;
                    white-space: nowrap;
                  "
                >
                  {{ item1.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--					渲染审批评论-->
      <div
        v-for="(item1, index1) in node.approveDescList"
        :key="index1"
        style="margin-top: 10px"
      >
        <div style="display: flex; flex-direction: row">
          <div class="f1">
            <Avatar shape="square" :size="40" :src="item1.user.avatar">
              {{ item1.user.name.substring(0, 1) }}
            </Avatar>
          </div>
          <div class="f2">
            <div class="f211">
              {{ item1.user.name }}
              <Tag color="error">
                {{ item1.descTypeStr }}
              </Tag>
            </div>
            <div class="f212">
              {{ item1.showTimeStr }}
            </div>
          </div>
        </div>
        <div v-if="!item1.sys">
          <div class="replace-el-text primary small">
            {{ JSON.parse(item1.desc).title }}
          </div>
        </div>
        <div class="box-card" style="padding: 5px; background-color: #f5f7fa">
          <Tag v-if="item1.sys" color="success">系统</Tag>
          <div class="replace-el-text info">
            {{ JSON.parse(item1.desc).content }}
          </div>

          <div
            v-if="item1.approveImageList?.length > 0"
            style="margin-top: 10px; margin-bottom: 10px"
          >
            <Image
              v-for="im in item1.approveImageList"
              :key="im.url"
              style="width: 60px; height: 60px"
              :src="im.url"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="[im.url]"
              :initial-index="4"
              fit="cover"
            />
          </div>

          <template v-if="item1.approveFileList?.length > 0">
            <div v-for="ifi in item1.approveFileList" :key="ifi.url">
              <Button type="link" target="_blank" :href="ifi.url">
                {{ ifi.name }}
              </Button>
            </div>
          </template>

          <template v-if="item1.signUrlList?.length > 0">
            <div v-for="ifi in item1.signUrlList" :key="ifi">
              <Row>
                <Col :span="8">
                  <div style="height: 66px; line-height: 66px">签字：</div>
                </Col>
                <Col :span="16">
                  <Image
                    style="width: 150px"
                    :src="ifi"
                    :zoom-rate="1.2"
                    :max-scale="7"
                    :min-scale="0.2"
                    :preview-src-list="[ifi]"
                    :initial-index="4"
                    fit="cover"
                  />
                </Col>
              </Row>
            </div>
          </template>
        </div>

        <Divider v-if="index1 !== node.approveDescList.length - 1" />
      </div>

      <!--					分支处理-->
      <ButtonGroup style="margin-top: 10px">
        <Button
          @click="activeNodeFunc(node1)"
          size="small"
          :type="
            isBlank(activeNodeId)
              ? index1 === 0
                ? 'primary'
                : 'default'
              : activeNodeId === node1.id
                ? 'primary'
                : 'default'
          "
          v-for="(node1, index1) in node.branch"
          :key="index1"
        >
          分支{{ index1 + 1 }}
        </Button>
      </ButtonGroup>
      <template v-for="(node1, index1) in node.branch" :key="index1">
        <div
          v-if="
            isBlank(activeNodeId) ? index1 === 0 : node1.id === activeNodeId
          "
          style="margin-top: 5px; font-size: 12px"
        >
          <template v-if="node1.placeholder && node1.placeholder.length > 0">
            [{{ node1.placeholder }}]
          </template>
        </div>
      </template>
    </TimelineItem>
    <template v-if="node?.branch?.length > 0">
      <template v-for="(node1, index1) in node.branch" :key="index1">
        <template
          v-if="
            isBlank(activeNodeId) ? index1 === 0 : node1.id === activeNodeId
          "
        >
          <flow-node-format-content
            :node-user="nodeUser"
            :disable-select="disableSelect"
            :row="node1.children"
          />
        </template>
      </template>
    </template>
  </template>
</template>

<style scoped lang="scss">
@use '../../../../../styles/flow/common';

.f1 {
  width: 40px;
  padding-top: 5px;
  text-align: center;
}

.f2 {
  width: calc(100% - 45px);
  height: 50px;
  padding-top: 5px;
  margin-left: 5px;
  font-size: 10px;
}

.f211 {
  font-size: 15px;
  font-weight: bold;
}

.f212 {
  font-size: 10px;
}

.f00 {
  position: fixed;
  top: 62px;
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: green;
}

.f21 {
  width: calc(100% - 150px);
}

.f22 {
  width: 150px;
  text-align: right;
}
</style>

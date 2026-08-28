<script setup>
import { CloseCircleOutlined, ShareAltOutlined } from '@ant-design/icons-vue';
import { Avatar, Button, Checkbox, Col, Image, Row } from 'ant-design-vue';
import { ElScrollbar } from 'element-plus';

import DeptImg from '../../assets/images/dept.png';

defineProps({
  total: {
    type: Number,
    default: 0,
  },
  disableSelectChildrenDept: {
    // 禁止选择下级部门
    type: Boolean,
    default: true,
  },
  list: {
    type: Array,
    default: () => [{ type: 'role', data, cancel }],
  },
});
const emits = defineEmits(['del']);
</script>
<template>
  <div class="select-result">
    <Row>
      <Col :span="disableSelectChildrenDept ? 19 : 13" class="header-col">
        已选({{ total }})
      </Col>
      <Col
        v-if="!disableSelectChildrenDept"
        :span="6"
        class="header-col"
        style="justify-content: center"
      >
        <span class="replace-el-text">下级部门</span>
      </Col>
      <Col :span="5" class="header-col" style="justify-content: center">
        <Button type="text" size="small" danger @click="emits('del')">
          清空
        </Button>
      </Col>
    </Row>
    <div class="right-list">
      <ElScrollbar>
        <template v-for="{ type, data, cancel } in list" :key="type">
          <Row v-for="item in data" :key="item.id">
            <Col class="body-col" :span="3">
              <Image
                :preview="false"
                v-if="type === 'dept'"
                style="width: 20px; height: 20px"
                :src="DeptImg"
              />
              <Avatar
                v-if="type === 'user'"
                shape="square"
                :size="20"
                :src="item.avatar"
              >
                {{
                  item.name && item.name.lenght > 0
                    ? item.name.substring(0, 1)
                    : ''
                }}
              </Avatar>
              <ShareAltOutlined
                v-if="type === 'role'"
                style="font-size: 20px"
              />
            </Col>
            <Col
              class="body-col"
              :span="
                disableSelectChildrenDept || type === 'user' || type === 'role'
                  ? 16
                  : 10
              "
            >
              <span class="replace-el-text">
                {{ item.name }}
              </span>
            </Col>
            <Col
              v-if="
                !(
                  disableSelectChildrenDept ||
                  type === 'user' ||
                  type === 'role'
                )
              "
              class="body-col"
              :span="6"
              style="justify-content: center"
            >
              <Checkbox
                :disabled="disableSelectChildrenDept"
                v-model:checked="item.containChildrenDept"
              />
            </Col>
            <Col class="body-col" :span="5" style="justify-content: center">
              <Button
                type="text"
                size="small"
                shape="circle"
                danger
                @click="cancel(item)"
              >
                <CloseCircleOutlined />
              </Button>
            </Col>
          </Row>
        </template>
      </ElScrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../../../styles/flow/common';

.select-result {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 50%;
  height: 100%;
  font-size: 12px;

  .right-list {
    flex: 1;
    min-height: 0;
  }

  .header-col {
    height: 30px;
    line-height: 30px;
  }

  .body-col {
    display: inline-flex;
    align-items: center;
    height: 26px;
    line-height: 26px;
  }
}
</style>

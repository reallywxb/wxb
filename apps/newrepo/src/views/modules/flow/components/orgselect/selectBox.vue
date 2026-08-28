<script setup>
import { computed, defineExpose, onMounted, watch } from 'vue';

import { SearchOutlined, ShareAltOutlined } from '@ant-design/icons-vue';
import { Avatar, Checkbox, Image, Input } from 'ant-design-vue';
import { ElScrollbar } from 'element-plus';

import {
  departments,
  getDebounceData,
  getDepartmentList,
  searchVal,
} from '#/utils/flow/common';
import * as util from '#/utils/flow/objutil.js';

import DeptImg from '../../assets/images/dept.png';

const props = defineProps({
  selectedList: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: 'org',
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  disableUser: {
    // 禁止选择的用户
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(['update:selectedList']);

const queryData = (pid) => {
  getDepartmentList(pid, props.type).then(() => {
    const selectedList = props.selectedList;

    for (const it of dataList.value) {
      for (const item of it.data) {
        const b = selectedList.some(
          (res) => res && res.id === item.id && res.type === item.type,
        );
        item.selected = b;
      }
    }
  });
};

const deptList = computed(() => {
  return departments.value.childDepartments;
});

const userList = computed(() => {
  return departments.value.employees;
});
const roleList = computed(() => {
  return departments.value.roleList;
});

const dataList = computed(() => {
  return [
    {
      type: 'dept',
      data: deptList.value,
    },
    {
      type: 'user',
      data: userList.value,
    },
    {
      type: 'role',
      data: roleList.value,
    },
  ];
});

onMounted(() => {
  queryData(0);
});

const changeEvent = (e) => {
  let selectedList = util.deepCopy(props.selectedList);

  if (e.selected) {
    if (!props.multiple) {
      userList.value.forEach((res) => (res.selected = false));
      selectedList = [];
    }
    e.selected = true;
    selectedList.push(e);
  } else {
    for (const it of dataList.value) {
      const filter = it.data.filter(
        (res) => res.id === e.id && res.type === e.type,
      );
      if (filter.length > 0) {
        filter[0].selected = false;
      }
    }
    selectedList = selectedList.filter(
      (res) => !(res.id === e.id && res.type === e.type),
    );
  }
  emits('update:selectedList', selectedList);
};

const refreshData = () => {
  const selectedList = props.selectedList;

  for (const it of dataList.value) {
    for (const item of it.data) {
      item.selected = selectedList.some(
        (res) => res.id === item.id && res.type === item.type,
      );
    }
  }
};
defineExpose({ queryData, changeEvent, refreshData });

watch(
  () => props.selectedList,
  () => {
    refreshData();
  },
);
</script>
<template>
  <div class="box">
    <Input
      v-model:value="searchVal"
      class="w-50"
      style="width: 100%"
      v-if="type !== 'role' && type !== 'dept'"
      placeholder="搜索成员"
      @change="getDebounceData($event.target?.value)"
    >
      <template #addOnBefore>
        <SearchOutlined />
      </template>
    </Input>
    <!--			顶部树形列表提示表头-->
    <div>
      <ElScrollbar v-if="!searchVal && type !== 'role'">
        <div class="scrollbar-flex-content ellipsis tree_nav">
          <p @click="queryData(0)" class="scrollbar-demo-item">根节点</p>
          <p
            v-for="(item, index) in departments.titleDepartments"
            @click="queryData(item.id)"
            :key="index"
            class="scrollbar-demo-item"
          >
            {{ item.name }}
          </p>
        </div>
      </ElScrollbar>
    </div>

    <!--			下方的列表显示-->
    <div class="list">
      <ElScrollbar>
        <ul>
          <template v-for="(elem, i) in dataList" :key="i">
            <template v-if="elem.type === 'role'">
              <li v-for="item in elem.data" :key="item.id">
                <Checkbox
                  v-model:checked="item.selected"
                  @change="changeEvent(item)"
                  :disabled="item.status === 0"
                >
                  <div style="display: flex; flex-direction: row">
                    <div class="f11">
                      <ShareAltOutlined style="font-size: 20px" />
                    </div>
                    <div class="f12">{{ item.name }}</div>
                  </div>
                </Checkbox>
              </li>
            </template>
            <template
              v-if="
                elem.type === 'dept' &&
                (type === 'org' || type === 'dept' || type === 'user')
              "
            >
              <li v-for="item in elem.data" :key="item.id">
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    border: 0 solid blue;
                  "
                >
                  <div class="d11">
                    <Checkbox
                      v-model:checked="item.selected"
                      @change="changeEvent(item)"
                      :disabled="
                        !(type === 'org' || type === 'dept') ||
                        item.status === 0
                      "
                    >
                      <div style="display: flex; flex-direction: row">
                        <div class="f11">
                          <Image
                            :preview="false"
                            style="width: 20px; height: 20px"
                            :src="DeptImg"
                          />
                        </div>
                        <div class="f12" style="border: 0 solid red">
                          {{ item.name }}
                        </div>
                      </div>
                    </Checkbox>
                  </div>
                  <div class="d22" @click="queryData(item.id)">
                    下级

                    <!--									<el-image style="width: 20px;height: 20px;margin-top: 6px"  :src="DeptImg" />-->
                    <!--                <el-icon style="font-size: 20px;color: #1e83e9">-->
                    <!--                  <Guide/>-->
                    <!--                </el-icon>-->
                  </div>
                </div>
              </li>
            </template>
            <template
              v-if="elem.type === 'user' && (type === 'org' || type === 'user')"
            >
              <li v-for="item in elem.data" :key="item.id" class="check_box">
                <Checkbox
                  v-model:checked="item.selected"
                  :disabled="item.status === 0 || disableUser.includes(item.id)"
                  @change="changeEvent(item)"
                >
                  <div style="display: flex; flex-direction: row">
                    <div class="f11">
                      <Avatar shape="square" :size="20" :src="item.avatar">
                        {{ item.name.substring(0, 1) }}
                      </Avatar>
                    </div>
                    <div class="f12">{{ item.name }}</div>
                  </div>
                </Checkbox>
              </li>
            </template>
          </template>
        </ul>
      </ElScrollbar>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.box {
  display: flex;
  flex-direction: column;

  .list {
    flex: 1;
    min-height: 0;
  }
}

.f11 {
  width: 30px;
  height: 26px;
  //line-height: 26px;

  :deep(.ant-image) {
    vertical-align: middle;
  }
}

.f12 {
  width: 150px;
  height: 26px;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 26px;
  word-break: break-all;
  white-space: nowrap;
}

.d11 {
  width: calc(100% - 30px);
  //line-height: 41px;
}

.d22 {
  width: 30px;
  height: 26px;
  line-height: 26px;
  color: #409eff;
  text-align: center;
  cursor: pointer;
}

.ellipsis-node {
  //white-space: nowrap;
  //overflow: hidden;
  //text-overflow: ellipsis;
  border: 1px solid blue;
}

ul,
li {
  padding: 0;
  margin: 0;
  list-style: none;
}

.scrollbar-flex-content {
  display: flex;
  margin-top: 5px;
}

.scrollbar-demo-item {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding-right: 10px;
  margin: 5px 5px 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #409eff;
  text-align: center;
  word-break: break-all;
  white-space: nowrap;
  cursor: pointer;

  &:not(:last-child) {
    background: url('../../../../../views/modules/flow/assets/images/jiaojiao.png')
      no-repeat right center;
  }
}
</style>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { Button, Modal } from 'ant-design-vue';

import { departments, searchVal } from '#/utils/flow/common.js';
import * as util from '#/utils/flow/objutil.js';

import selectBox from './selectBox.vue';
import selectResult from './selectResult.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  disableSelectChildrenDept: {
    // 禁止选择下级部门
    type: Boolean,
    default: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
  disableUser: {
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
});

const emits = defineEmits(['update:visible', 'change']);

const dialogTitle = computed(() => {
  if (props.type === 'dept') {
    return '选择部门';
  }
  if (props.type === 'role') {
    return '选择角色';
  }

  if (props.type === 'user') {
    return '选择人员';
  }

  return '选择部门和人员';
});

const selectBoxRef = ref();

// 已选择的集合
const selectedList = ref([]);

const visibleDialog = computed({
  get() {
    return props.visible;
  },
  set() {
    closeDialog();
  },
});
const isChecked = (id, type) => {
  return selectedList.value.some((res) => res.id === id && res.type === type);
};

const list = computed(() => {
  const value = departments.value;
  return [
    {
      type: 'dept',
      data: value === undefined ? [] : value.childDepartments,
    },
    {
      type: 'role',
      data: value === undefined ? [] : value.roleList,
    },
    {
      type: 'user',
      data: value === undefined ? [] : value.employees,
      change: (item) => {
        if (isChecked(item.id, item.type)) {
          selectedList.value = selectedList.value.filter(
            (res) => !(res.id === item.id && res.type === item.type),
          );
        } else {
          if (!props.multiple) {
            // 单选
            selectedList.value = [];
          }

          selectedList.value.push(item);
        }
      },
    },
  ];
});
const resList = computed(() => {
  const userData = selectedList.value.filter((res) => res.type === 'user');
  const deptData = selectedList.value.filter((res) => res.type === 'dept');
  const roleData = selectedList.value.filter((res) => res.type === 'role');

  const data = [
    {
      type: 'user',
      data: userData,
      cancel: (item) => {
        item.selected = false;
        selectBoxRef.value.changeEvent(item);
      },
    },
  ];
  if (props.type === 'org' || props.type === 'dept') {
    data.unshift({
      type: 'dept',
      data: deptData,
      cancel: (item) => {
        item.selected = false;
        selectBoxRef.value.changeEvent(item);
      },
    });
  }
  if (props.type === 'role') {
    data.unshift({
      type: 'role',
      data: roleData,
      cancel: (item) => {
        item.selected = false;
        selectBoxRef.value.changeEvent(item);
      },
    });
  }
  return data;
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      selectedList.value = props.data;

      searchVal.value = '';
    }
  },
);

const closeDialog = () => {
  emits('update:visible', false);
};

const total = computed(() => {
  const v = departments.value;
  if (!v) {
    return 0;
  }
  return selectedList.value.length;
});

const saveDialog = () => {
  const v = selectedList.value;

  const checkedList = util.deepCopy(v).map((item) => ({
    type: item.type,
    id: item.id,
    name: item.name,
    avatar: item.avatar,
    containChildrenDept: item.containChildrenDept,
  }));
  emits('change', checkedList);
};
const delList = () => {
  for (const item of util.deepCopy(selectedList.value)) {
    item.selected = false;
    selectBoxRef.value.changeEvent(item);
  }
  selectedList.value = [];
};

onMounted(() => {});
</script>

<template>
  <Modal
    :title="dialogTitle"
    v-model:open="visibleDialog"
    :width="600"
    append-to-body
    destroy-on-close
    class="promoter_person"
  >
    <div class="content-body clear">
      <selectBox
        class="content-body-child left"
        ref="selectBoxRef"
        :disable-user="disableUser"
        :list="list"
        :multiple="multiple"
        v-model:selected-list="selectedList"
        :type="type"
      />
      <selectResult
        class="content-body-child"
        :disable-select-children-dept="disableSelectChildrenDept"
        :total="total"
        @del="delList"
        :list="resList"
      />
    </div>
    <template #footer>
      <Button @click="$emit('update:visible', false)">取 消</Button>
      <Button type="primary" @click="saveDialog">确 定</Button>
    </template>
  </Modal>
</template>
<style lang="scss" scoped>
.content-body {
  display: flex;
  height: 500px;
  border: 1px solid #f5f5f5;

  &-child {
    width: 50%;
    height: 100%;
    padding: 10px 12px 0 8px;

    &.left {
      width: calc(50% - 1px);
      border-right: 1px solid #f5f5f5;
    }
  }
}
</style>

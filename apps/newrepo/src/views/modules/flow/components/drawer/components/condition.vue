<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed, onMounted, ref } from 'vue';

import {
  DatePicker,
  Input,
  InputNumber,
  Select,
  SelectOption,
  TimePicker,
} from 'ant-design-vue';

import { useFlowStore } from '#/store/flow';
import { conditionExpression } from '#/utils/flow/const.js';
import * as formUtil from '#/utils/flow/form.js';
import * as util from '#/utils/flow/objutil.js';
import { deepCopy } from '#/utils/flow/objutil.js';

import selectShow from '../../orgselect/selectAndShow.vue';

// aboveFormId  表示 只能取这个表单上面的当做条件
const props = defineProps({
  condition: {
    type: Object,
    default: () => {},
  },
  aboveFormId: {
    type: String,
    default: '',
  },
});

const flowStore = useFlowStore();

const step2FormList = computed(() => {
  return flowStore.step2;
});

// 表单
const formList = computed(() => {
  return formUtil.getAboveSameTypeFormList(props.aboveFormId, undefined, true);
});
const formIdObj = computed(() => {
  const obj = {} as Record<string, any>;
  for (const item of formList.value) {
    obj[item.id as string] = item;
  }
  return obj;
});

const userFieldList = ref<any[]>([]);

onMounted(() => {
  userFieldList.value.push(
    {
      key: 'rangeUser',
      type: 'SelectUser',
      name: '人员[系统]',
    },
    {
      key: 'rangeDept',
      type: 'SelectDept',
      name: '部门[系统]',
    },
    {
      key: 'empty',
      type: '',
      name: '为空[系统]',
    },
    {
      key: 'notempty',
      type: '',
      name: '不为空[系统]',
    },
    {
      key: 'role',
      type: 'Role',
      name: '角色[系统]',
    },
  );

  props.condition.userKeyFieldList = userFieldList.value;
});
// 第一个选项变化了
const firstSelectChangeEvent = () => {
  props.condition.expression = '';

  props.condition.value = undefined;

  props.condition.userKey = '';
};
const userKeySelectChangeEvent = () => {
  props.condition.expression = '';

  props.condition.value = undefined;
};

// 处理第一个选项表单类型
const conditionTypeFirst = computed(() => {
  return formIdObj.value[props.condition.key]?.type;
});
// 处理表单值类型
const conditionTypeObj = computed(() => {
  const type = formIdObj.value[props.condition.key]?.type;
  if (type !== 'SelectUser') {
    return type;
  }
  if (util.isBlank(props.condition.userKey)) {
    return '';
  }
  const filter = userFieldList.value.filter(
    (res) => res.key === props.condition.userKey,
  );
  if (!filter || filter.length === 0) {
    return '';
  }
  return filter[0].type;
});
// 处理表单选项
const conditionOptionsObj = computed(() => {
  if (formIdObj.value[props.condition.key]?.type !== 'SelectUser') {
    return formIdObj.value[props.condition.key].props.options;
  }

  if (util.isBlank(props.condition.userKey)) {
    return [];
  }

  const props1 = JSON.parse(
    userFieldList.value.find((res) => res.key === props.condition.userKey)
      .props,
  );
  return props1.options;
});
// 处理数字表单精度
const numberFormPrecision = computed(() => {
  const valueElement = formIdObj.value[props.condition.key];
  if (valueElement?.type !== 'SelectUser') {
    return valueElement.props.radixNum;
  }

  if (util.isBlank(props.condition.userKey)) {
    return [];
  }

  const props1 = JSON.parse(
    userFieldList.value.find((res) => res.key === props.condition.userKey)
      .props,
  );
  return props1.radixNum;
});

computed({
  get() {
    const value = props.condition.value;

    return value?.value;
  },
  set(t) {
    const options = formIdObj.value[props.condition.key].props.options;
    const treeData = getCascadeTreeData(t[t.length - 1], options);
    const d = deepCopy(treeData);
    d.value = t;

    const arr = [] as any[];
    for (const k of t) {
      arr.push(getCascadeTreeData(k, options).label);
    }
    d.labelList = arr;

    props.condition.value = d;
  },
});

const getCascadeTreeData = (key: string, arr: any[]) => {
  for (const item of arr) {
    if (item.key === key) {
      return item;
    }
    const treeData = getCascadeTreeData(key, item.children);
    if (treeData) {
      return treeData;
    }
  }
  return undefined;
};

const conditionKey = computed({
  get() {
    return props.condition.key;
  },
  set(key) {
    props.condition.key = key;
    if (key.includes('||')) {
      // 明细汇总
      const split = key.split('||');
      const layoutFormId = split[0];
      const innerFormId = split[1];

      const ele = step2FormList.value.find(
        (res: any) => res.id === layoutFormId,
      );

      const fileterElement = ele.props.oriForm.find(
        (res) => res.id === innerFormId,
      );

      props.condition.name = `${ele.name}·总${fileterElement.name}`;

      props.condition.keyType = fileterElement.type;
    } else if (key === 'rootUser') {
      props.condition.keyType = 'SelectUser';

      props.condition.name = '发起人';
    } else {
      const ele = step2FormList.value.filter((res: any) => res.id === key);
      if (ele.length > 0) {
        props.condition.keyType = ele[0].type;

        props.condition.name = ele[0].name;
      }
    }
  },
});

const conditionSelectVal = computed({
  get() {
    const value = props.condition.value;
    return value?.length > 0 ? value.map((res) => res.key) : undefined;
  },
  set(t) {
    props.condition.value = conditionOptionsObj.value.filter((res) =>
      t.includes(res.key),
    );
  },
});
</script>

<template>
  <div>
    <Select
      v-model:value="conditionKey"
      @change="firstSelectChangeEvent"
      placeholder="选择表单"
      style="width: 100%"
    >
      <SelectOption v-for="f in formList" :key="f.id">
        {{ f.name }}
      </SelectOption>
    </Select>

    <Select
      v-if="conditionTypeFirst === 'SelectUser'"
      @change="userKeySelectChangeEvent"
      v-model:value="condition.userKey"
      placeholder="选择用户属性"
      style="width: 100%; margin-top: 20px"
    >
      <SelectOption v-for="f in userFieldList" :key="f.key">
        {{ f.name }}
      </SelectOption>
    </Select>

    <Select
      v-model:value="condition.expression"
      placeholder="选择关系"
      style="width: 100%; margin-top: 20px"
      v-if="conditionExpression[conditionTypeObj]?.length > 0"
    >
      <SelectOption
        v-for="f in conditionExpression[conditionTypeObj]"
        :key="f.key"
      >
        {{ f.name }}
      </SelectOption>
    </Select>
    <template v-if="condition.expression?.indexOf('empty') < 0">
      <Input
        v-model:value="condition.value"
        v-if="conditionTypeObj === 'Input' || conditionTypeObj === 'Textarea'"
        style="margin-top: 20px"
        placeholder="条件值"
      />

      <InputNumber
        v-model:value="condition.value"
        v-if="conditionTypeObj === 'Money' || conditionTypeObj === 'Number'"
        :precision="numberFormPrecision"
        placeholder="条件值"
        style="width: 100%; margin-top: 20px"
        controls-position="right"
      />

      <DatePicker
        value-format="YYYY-MM-DD"
        type="date"
        class="formDate"
        v-model:value="condition.value"
        v-if="conditionTypeObj === 'Date'"
        placeholder="条件值"
        style="width: 100%; margin-top: 20px"
      />
      <TimePicker
        arrow-control
        value-format="HH:mm:ss"
        class="formDate"
        v-model:value="condition.value"
        v-if="conditionTypeObj === 'Time'"
        placeholder="条件值"
        style="width: 100%; margin-top: 20px"
      />

      <DatePicker
        value-format="YYYY-MM-DD HH:mm:ss"
        show-time
        class="formDate"
        v-model:value="condition.value"
        v-if="conditionTypeObj === 'DateTime'"
        placeholder="条件值"
        style="width: 100%; margin-top: 20px"
      />

      <Select
        v-model:value="conditionSelectVal"
        v-if="
          conditionTypeObj === 'SingleSelect' ||
          conditionTypeObj === 'MultiSelect'
        "
        style="width: 100%; margin-top: 20px"
        multiple
        collapse-tags
        collapse-tags-tooltip
        placeholder="请选择值"
      >
        <SelectOption v-for="item in conditionOptionsObj" :key="item.key">
          {{ item.value }}
        </SelectOption>
      </Select>
      <div style="margin-top: 20px">
        <select-show
          v-if="conditionTypeObj === 'SelectDept'"
          v-model:org-list="condition.value"
          type="dept"
          :multiple="true"
        />
      </div>
      <div style="margin-top: 20px">
        <select-show
          v-if="conditionTypeObj === 'Role'"
          v-model:org-list="condition.value"
          type="role"
          :multiple="true"
        />
      </div>

      <div style="margin-top: 20px">
        <select-show
          v-if="conditionTypeObj === 'SelectUser'"
          v-model:org-list="condition.value"
          type="user"
          :multiple="true"
        />
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
:deep(.formDate div.Input__wrapper) {
  width: 100% !important;
}

:deep(.formDate) {
  width: 100% !important;
}
</style>

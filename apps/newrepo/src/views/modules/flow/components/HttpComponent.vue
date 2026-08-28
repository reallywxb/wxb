<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import type { FormProps } from 'ant-design-vue/es/form';

import { computed, reactive, ref } from 'vue';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import {
  Alert,
  Button,
  Col,
  Form,
  FormItem,
  Input,
  Row,
  Select,
  SelectOption,
  Switch,
} from 'ant-design-vue';

import { useFlowStore } from '#/store/flow';
import * as util from '#/utils/flow/objutil.js';

const props = defineProps({
  form: {
    type: Object,
    default: () => ({}),
  },
  colSpan: {
    type: Number,
    default: 20,
  },
});

const rules = reactive<FormProps['rules']>({
  url: [
    { required: true, message: '请填写请求地址', type: 'url', trigger: 'blur' },
  ],
});

const addOneLine = (k2) => {
  props.form[k2].push({
    field: '',
    valueMode: true,
    value: '',
  });
};
const delOneLine = (k2, index) => {
  props.form[k2].splice(index, 1);
};
const modeChange = (k2, index) => {
  props.form[k2][index].value = '';
};

const flowStore = useFlowStore();

const formList = computed(() => {
  return flowStore.step2.filter((res) => res.type !== 'Description');
});

const formListWithRoot = computed(() => {
  const step2 = util.deepCopy(formList.value);
  step2.push({
    id: 'rootUser',
    type: 'SelectUser',
    name: '发起人',
  });
  return step2;
});

const formRef = ref();

const validate = (f) => {
  formRef.value
    ?.validate()
    .then(() => {
      f(true);
    })
    .catch((error) => {
      const arr = [];

      for (const err in error.errorFields) {
        arr.push(err.errors?.[0]);
      }

      f(false, arr);
    });
};
defineExpose({ validate });
</script>

<template>
  <Form
    :model="form"
    ref="formRef"
    :rules="rules"
    label-width="120px"
    layout="vertical"
  >
    <FormItem label="请求地址" name="url">
      <Alert type="warning" show-icon :closable="false">
        <p>仅支持POST请求，以请求体方式接收参数</p>
      </Alert>
      <Input
        style="margin-top: 10px"
        :maxlength="100"
        v-model:value="form.url"
        placeholder=""
      />
    </FormItem>

    <FormItem label="请求头">
      <Row
        style="width: 100%; margin-bottom: 20px"
        :gutter="colSpan"
        v-for="(item, index) in form.header"
        :key="index"
      >
        <Col :span="8">
          <FormItem
            :name="`header.${index}.field`"
            :rules="[
              { required: true, message: '请填写字段名称', trigger: 'blur' },
              {
                min: 1,
                max: 50,
                message: '1<字段名称长度<50',
                trigger: 'blur',
              },
            ]"
          >
            <Input
              v-model:value="item.field"
              :maxlength="100"
              placeholder="接收字段，比如userName"
            />
          </FormItem>
        </Col>
        <Col :span="8">
          <Switch
            @change="modeChange('header', index)"
            v-model:checked="item.valueMode"
            checked-children="固定值"
            un-checked-children="表单"
          />
        </Col>
        <Col :span="7">
          <FormItem
            :name="`header.${index}.value`"
            :rules="[
              { required: true, message: '请填写字段对应值', trigger: 'blur' },
              {
                min: 1,
                max: 50,
                message: '1<字段对应值长度<50',
                trigger: 'blur',
              },
            ]"
          >
            <Input
              v-if="item.valueMode"
              :maxlength="100"
              v-model:value="item.value"
              placeholder="固定内容"
            />
            <Select
              v-else
              v-model:value="item.value"
              placeholder="选择表单"
              style="width: 100%"
            >
              <SelectOption
                v-for="f in formListWithRoot"
                :key="f.id"
                :value="f.id"
              >
                {{ f.name }}
              </SelectOption>
            </Select>
          </FormItem>
        </Col>
        <Col :span="1">
          <Button type="text" @click="delOneLine('header', index)">
            <DeleteOutlined />
          </Button>
        </Col>
      </Row>
      <Button text type="primary" @click="addOneLine('header')">
        添加一行
        <PlusOutlined />
      </Button>
    </FormItem>
    <FormItem label="请求体">
      <Row
        style="width: 100%; margin-bottom: 20px"
        :gutter="colSpan"
        v-for="(item, index) in form.body"
        :key="index"
      >
        <Col :span="8">
          <FormItem
            :name="`body.${index}.field`"
            :rules="[
              { required: true, message: '请填写字段名称', trigger: 'blur' },
              {
                min: 1,
                max: 50,
                message: '1<字段名称长度<50',
                trigger: 'blur',
              },
            ]"
          >
            <Input
              v-model:value="item.field"
              :maxlength="100"
              placeholder="接收字段，比如userName"
            />
          </FormItem>
        </Col>
        <Col :span="8">
          <Switch
            @change="modeChange('body', index)"
            v-model:checked="item.valueMode"
            size="large"
            checked-children="固定值"
            un-checked-children="表单"
          />
        </Col>
        <Col :span="7">
          <FormItem
            :name="`body.${index}.value`"
            :rules="[
              { required: true, message: '请填写字段对应值', trigger: 'blur' },
              {
                min: 1,
                max: 50,
                message: '1<字段对应值长度<50',
                trigger: 'blur',
              },
            ]"
          >
            <Input
              v-if="item.valueMode"
              :maxlength="100"
              v-model:value="item.value"
              placeholder="固定内容"
            />
            <Select
              v-else
              v-model:value="item.value"
              placeholder="选择表单"
              style="width: 100%"
            >
              <SelectOption
                v-for="f in formListWithRoot"
                :key="f.id"
                :value="f.id"
              >
                {{ f.name }}
              </SelectOption>
            </Select>
          </FormItem>
        </Col>
        <Col :span="1">
          <Button type="text" @click="delOneLine('body', index)">
            <DeleteOutlined />
          </Button>
        </Col>
      </Row>
      <Button text type="primary" @click="addOneLine('body')">
        添加一行
        <PlusOutlined />
      </Button>
    </FormItem>

    <slot></slot>
    <!--			返回值-->
  </Form>
</template>

<style scoped lang="less"></style>

<script setup lang="ts">
import { ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { Button, Form, FormItem, Select, SelectOption } from 'ant-design-vue';

import { getWarehouseInfoByOrgId } from '#/api/core/user';

type Org = {
  id: number | string;
  name: string;
};
const props = withDefaults(
  defineProps<{
    orgId?: number | string;
    orgName?: string;
    orgs?: Org[];
    showWarehouse?: boolean;
    token?: string;
    username?: string;
    warehouseId?: number | string;
    warehouseName?: string;
  }>(),
  {
    orgs: () => [],
    orgId: undefined,
    token: undefined,
    orgName: undefined,
    warehouseId: undefined,
    warehouseName: undefined,
    username: undefined,
    showWarehouse: true,
  },
);
const emit = defineEmits(['submit']);
const institutionAppellation = import.meta.env.VITE_INSTITUTION_APPELLATION;
const formRef = ref();
const rules: any = {
  orgId: [
    {
      required: true,
      message: `请选择${institutionAppellation}`,
      trigger: 'change',
    },
  ],
  warehouseId: [
    {
      required: true,
      message: '请选择仓库',
      trigger: 'change',
    },
  ],
};
type WarehouseInfo = {
  warehouseId: number | string;
  warehouseName: string;
};
const formState = ref({
  orgId: props.orgId,
  warehouseId: props.warehouseId,
  orgName: props.orgName,
  warehouseName: props.warehouseName,
});

const warehouseList = ref<WarehouseInfo[]>();
if (props.showWarehouse) {
  const userStore = useUserStore();
  getWarehouseInfoByOrgId(
    { userId: userStore.userInfo?.id, dcId: props.orgId },
    props.token,
  ).then((res) => {
    warehouseList.value = res;
    // 如果当前本地存储的仓库id不在仓库列表中，则重置仓库id和仓库名称
    if (
      !warehouseList.value.some(
        (item) => item.warehouseId === props.warehouseId,
      )
    ) {
      formState.value.warehouseId = undefined;
      formState.value.warehouseName = undefined;
    }
  });
}

function handleSubmit() {
  setTimeout(() => {
    formRef.value.validate().then(() => {
      // 判断机构id和仓库id是否更改
      const isOrgChange = formState.value.orgId !== props.orgId;
      const isWarehouseChange =
        formState.value.warehouseId !== props.warehouseId;
      emit('submit', {
        form: formState.value,
        isOrgChange,
        isWarehouseChange,
      });
    });
  }, 0);
}
function orgChange(...args: any[]) {
  const option = args[1];
  if (option) {
    // 如果机构更改了，需要重新查仓库信息，并删除原来的仓库信息
    const userStore = useUserStore();
    // 有仓库信息，才查询
    if (props.showWarehouse) {
      // 根据新的机构id查询仓库信息
      getWarehouseInfoByOrgId(
        { userId: userStore.userInfo?.id, dcId: option.value },
        props.token,
      ).then((res) => {
        warehouseList.value = res;
        formState.value = {
          orgId: option.value,
          warehouseId: undefined,
          orgName: option.title,
          warehouseName: undefined,
        };
      });
    } else {
      formState.value = {
        orgId: option.value,
        warehouseId: undefined,
        orgName: option.title,
        warehouseName: undefined,
      };
    }
  } else {
    formState.value = {
      orgId: undefined,
      warehouseId: undefined,
      orgName: undefined,
      warehouseName: undefined,
    };
    warehouseList.value = [];
  }
}
function warehouseChange(...args: any[]) {
  const option = args[1];
  // console.log('orgChange', args, option);
  formState.value = option
    ? { ...formState.value, warehouseName: option.title }
    : { ...formState.value, warehouseName: undefined };
}
// 需要获取机构id，机构列表，仓库列表
</script>
<template>
  <div
    style="width: 100%; padding: 0 20px"
    class="choose-institution-and-warehouse-container"
  >
    <div class="choose-institution-and-warehouse-container__title">
      <h1
        style="
          margin-bottom: 10px;
          font-size: 30px;
          font-weight: 700;
          line-height: 1.2;
          color: hsl(var(--foreground));
          text-align: left;
        "
      >
        请选择{{ institutionAppellation + (showWarehouse ? '和仓库' : '') }}
        <!-- 欢迎回来 👋🏻 -->
      </h1>
      <p style="font-size: 14px; color: hsl(var(--muted-foreground))"></p>
    </div>
    <Form
      style="width: 100%"
      ref="formRef"
      :rules="rules"
      :model="formState"
      @submit="handleSubmit"
      name="basic"
      autocomplete="off"
      layout="vertical"
    >
      <FormItem :label="institutionAppellation" name="orgId">
        <Select
          v-model:value="formState.orgId"
          @change="orgChange"
          allow-clear
          :placeholder="`请选择${institutionAppellation}`"
          size="middle"
          class="choose-institution-and-warehouse-container__select"
        >
          <SelectOption
            v-for="item in orgs"
            :value="item.id"
            :key="item.id"
            :title="item.name"
          >
            {{ item.name }}
          </SelectOption>
        </Select>
      </FormItem>

      <FormItem label="仓库" name="warehouseId" v-if="showWarehouse">
        <Select
          v-model:value="formState.warehouseId"
          @change="warehouseChange"
          allow-clear
          placeholder="请选择仓库"
          size="middle"
          class="choose-institution-and-warehouse-container__select"
        >
          <SelectOption
            :value="item.warehouseId"
            v-for="item in warehouseList"
            :key="item.warehouseId"
            :title="item.warehouseName"
          >
            {{ item.warehouseName }}
          </SelectOption>
        </Select>
      </FormItem>

      <FormItem>
        <Button
          type="primary"
          html-type="submit"
          style="width: 100%"
          size="middle"
        >
          确 定
        </Button>
      </FormItem>
    </Form>
  </div>
</template>
<style scoped>
.choose-institution-and-warehouse-container__title {
  margin-bottom: 20px;
}

.choose-institution-and-warehouse-container__select
  ::v-deep(.ant-select-selection-item) {
  font-size: 14px;
}

.choose-institution-and-warehouse-container__select
  ::v-deep(.ant-select-selection-search-input)::placeholder {
  font-size: 14px;
  color: red;
}

.choose-institution-and-warehouse-container ::v-deep(.ant-form-item-label) {
  padding: 0 0 2px;
}
</style>

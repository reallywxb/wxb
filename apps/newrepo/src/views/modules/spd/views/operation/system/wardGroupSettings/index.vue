<!-- AI-GENERATED-BEGIN -->
<!-- @date 2026-03-30 -->
<!-- @prompt 参考 operation/system/dict 和原型图生成病区组配置页面 -->
<!-- @description 病区组配置页面，包含左侧病区组列表、中间已绑定病区列表、右侧病区列表，支持病区组的增删改查和病区绑定功能 -->
<script lang="ts" setup>
import type { Ward, WardGroup } from './types';

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 参考 operation/system/dict 和原型图生成病区组配置页面
// @description 病区组配置页面，使用 useChcGrid 实现表格功能
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { VbenIcon } from '@vben-core/shadcn-ui';

// @ts-ignore
import { PageSplitLazy } from '@xgsk/vue3-page-split';
import { Button, Input, message } from 'ant-design-vue';

import { useChcGrid } from '#/adapter/chc-ui';
import { formDefaultOptions, gridDefaultOptions } from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { queryAreaList, queryDeptList, saveDeptRelation } from './api';
import {
  getBoundWardColumns,
  getWardColumns,
  getWardGroupColumns,
} from './options';
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 定义响应式变量
// @description 定义当前病区组、搜索条件等响应式变量
const currentWardGroup = ref<undefined | WardGroup>();
const boundWardSearchName = ref('');
const wardSearchName = ref('');

// 统计数据
const wardGroupTotal = ref(0);
const configuredGroupWards = ref(0);
const boundWardTotal = ref(0);
const wardTotal = ref(0);
const wardSelectedCount = ref(0);

// 表格数据
const boundWardData = ref<Ward[]>([]);
const wardData = ref<Ward[]>([]);

// 备份数据（用于搜索过滤）
const allBoundWards = ref<Ward[]>([]);
const allUnboundWards = ref<Ward[]>([]);

// 保存配置 loading 状态
const saveLoading = ref(false);

// 区域列表数据
const areaList = ref<any[]>([]);

// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建左侧病区组表格配置
// @description 使用 useChcGrid 配置病区组列表的表格，使用 afterFetchFn 返回 mock 数据，添加 radioConfig 实现单选
const [WardGroupGrid, wardGroupGridApi] = useChcGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      proxyConfig: {
        autoLoad: true,
      },
      border: false,
      columns: getWardGroupColumns(),
     
      pagerConfig: {
        enabled: false,
      },

      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
    }),
  },
  {
    id: 'wardGroup',
    // dataTableId: '/datatable/data/page/sys.wardGroup',
    dataTableId: '/pmsDeptRelationAction/queryGroupSummary',
    afterFetchFn: (params) => {
      wardGroupTotal.value = params.rows?.length || 0;
      let count = 0;
      for (const item of params.rows) {
        if (item.deptCount) {
          count++;
        }
      }
      configuredGroupWards.value = count;
      return {
        ...params,
        records: params.rows,
      };
    },
    gridEvents: {
      radioChange: ({ row }: { row: WardGroup }) => {
        handleWardGroupRadioChange({ row });
      },
    },
  },
);
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建病区复选框变化事件处理方法
// @description 当病区复选框状态变化时更新已选病区数
const handleWardCheckboxChange = ({ records }: { records: any[] }) => {
  wardSelectedCount.value = records?.length || 0;
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建中间已绑定病区表格配置
// @description 使用 useChcGrid 配置已绑定病区表格，使用 data 属性绑定数据
const [BoundWardGrid, boundWardGridApi] = useChcGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      data: boundWardData.value,
      columns: getBoundWardColumns(),
      checkboxConfig: {
        highlight: true,
      },
     
      pagerConfig: {
        enabled: false,
      },
    }),
  },
  {
    id: 'boundWard',
  },
);
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建右侧病区列表表格配置
// @description 使用 useChcGrid 配置病区列表表格，使用 data 属性绑定数据
const [WardGrid, wardGridApi] = useChcGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {}),
    gridOptions: deepMerge(gridDefaultOptions, {
      data: wardData.value,
      columns: getWardColumns(),
      checkboxConfig: {
        highlight: true,
      },
     
      pagerConfig: {
        enabled: false,
      },
    }),
  },
  {
    id: 'ward',
    gridEvents: {
      checkboxChange: handleWardCheckboxChange,
      checkboxAll: handleWardCheckboxChange,
    },
  },
);
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建加载病区组列表方法
// @description 调用 wardGroupGridApi 查询病区组列表并更新统计
const loadWardGroupList = () => {
  wardGroupGridApi.query();
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建搜索病区方法
// @description 根据搜索条件过滤病区数据
const handleSearchWard = () => {
  if (!currentWardGroup.value) return;

  const filteredWards = allUnboundWards.value.filter((ward) => {
    const matchName =
      !wardSearchName.value || ward.deptName.includes(wardSearchName.value);
    return matchName;
  });
  wardData.value = filteredWards;
  wardGridApi.grid?.reloadData(wardData.value);
  wardTotal.value = filteredWards.length;
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建搜索已绑定病区方法
// @description 根据搜索条件过滤已绑定病区数据
const handleSearchBoundWard = () => {
  if (!currentWardGroup.value) return;

  const filteredBoundWards = allBoundWards.value.filter((ward) => {
    const matchName =
      !boundWardSearchName.value ||
      ward.deptName.includes(boundWardSearchName.value);
    return matchName;
  });
  boundWardData.value = filteredBoundWards;
  boundWardGridApi.grid?.reloadData(boundWardData.value);
  boundWardTotal.value = filteredBoundWards.length;
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建添加到已绑定方法
// @description 将右侧选中的病区添加到已绑定列表，更新 wardIds 并重新分配数据
const handleAddToBound = async () => {
  const selectedRows = wardGridApi.grid?.getCheckboxRecords() || [];
  if (!selectedRows || selectedRows.length === 0) {
    message.warning('请选择要添加的病区');
    return;
  }
  if (!currentWardGroup.value?.dictValue) {
    message.warning('请先选择病区组');
    return;
  }

  try {
    // 将选中的病区从未绑定列表移动到已绑定列表
    const selectedValues = new Set(selectedRows.map((item: any) => item.id));

    // 添加到已绑定列表
    boundWardData.value = [...boundWardData.value, ...selectedRows];

    // 从未绑定列表移除
    wardData.value = wardData.value.filter(
      (ward) => !selectedValues.has(ward.id),
    );

    // 同步更新备份数据
    allBoundWards.value = [...allBoundWards.value, ...selectedRows];
    allUnboundWards.value = allUnboundWards.value.filter(
      (ward) => !selectedValues.has(ward.id),
    );

    wardTotal.value = wardData.value.length;
    boundWardTotal.value = boundWardData.value.length;
    wardSelectedCount.value = 0;
    // 刷新表格
    boundWardGridApi.grid.reloadData(boundWardData.value);
    wardGridApi.grid.reloadData(wardData.value);

    // 清空选中状态
    wardGridApi.grid?.clearCheckboxRow();

    message.success('添加成功');
  } catch (error) {
    console.error(error);
  }
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建从已绑定移除方法
// @description 从已绑定列表中移除选中的病区，更新 wardIds 并重新分配数据
const handleRemoveFromBound = async () => {
  const selectedRows = boundWardGridApi.grid?.getCheckboxRecords() || [];
  if (!selectedRows || selectedRows.length === 0) {
    message.warning('请选择要移除的病区');
    return;
  }
  if (!currentWardGroup.value?.dictValue) {
    message.warning('请先选择病区组');
    return;
  }

  try {
    // 将选中的病区从已绑定列表移动到未绑定列表
    const selectedValues = new Set(selectedRows.map((item: any) => item.id));

    // 添加到未绑定列表
    wardData.value = [...wardData.value, ...selectedRows];

    // 从已绑定列表移除
    boundWardData.value = boundWardData.value.filter(
      (ward) => !selectedValues.has(ward.id),
    );

    // 同步更新备份数据
    allUnboundWards.value = [...allUnboundWards.value, ...selectedRows];
    allBoundWards.value = allBoundWards.value.filter(
      (ward) => !selectedValues.has(ward.id),
    );

    wardTotal.value = wardData.value.length;
    boundWardTotal.value = boundWardData.value.length;

    // 刷新表格
    boundWardGridApi.grid.reloadData(boundWardData.value);
    wardGridApi.grid.reloadData(wardData.value);

    // 清空选中状态
    boundWardGridApi.grid?.clearCheckboxRow();

    message.success('移除成功');
  } catch (error) {
    console.error(error);
  }
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建保存配置方法
// @description 保存当前病区组的配置信息
const handleSave = async () => {
  if (!currentWardGroup.value?.dictValue) {
    message.warning('请先选择病区组');
    return;
  }

  saveLoading.value = true;
  // 给两个表格添加 loading 状态
  boundWardGridApi.setLoading(true);
  wardGridApi.setLoading(true);
  try {
    // 构建 addList 数据
    const addList =
      boundWardData.value.map((ward) => ({
        // id: ward.id,
        deptId: ward.id,
      })) || [];

    await saveDeptRelation({
      dictValue: currentWardGroup.value.dictValue,
      addList,
    });
    message.success('保存成功');
    loadWardGroupList();
  } catch (error) {
    console.error(error);
  } finally {
    saveLoading.value = false;
    boundWardGridApi.setLoading(false);
    wardGridApi.setLoading(false);
  }
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建病区组单选框变化事件处理方法
// @description 当病区组单选框状态变化时更新当前病区组，并根据 wardIds 分配病区数据
const handleWardGroupRadioChange = async ({ row }: { row: WardGroup }) => {
  currentWardGroup.value = row;

  // 调用接口查询病区列表
  const result = await queryDeptList({ dictValue: row.dictValue });
  const deptList = (result?.rows || []).map((item: Ward) => ({
    ...item,
    boundId: item.id,
    id: Number(item.deptId),
  }));

  // 根据 wardIds 将病区列表分成已绑定和未绑定两部分
  const boundWards: Ward[] = [];
  const unboundWards: Ward[] = [];

  areaList.value.forEach((ward: Ward) => {
    if (deptList.some((item: any) => item.id === ward.id)) {
      boundWards.push(ward);
    } else {
      unboundWards.push(ward);
    }
  });

  // 更新备份数据
  allBoundWards.value = boundWards;
  allUnboundWards.value = unboundWards;

  // 更新表格数据和统计
  boundWardData.value = boundWards;
  wardData.value = unboundWards;
  boundWardGridApi.grid.reloadData(boundWardData.value);
  wardGridApi.grid.reloadData(wardData.value);
  boundWardTotal.value = boundWards.length;
  wardTotal.value = unboundWards.length;
};

// AI-GENERATED-BEGIN
// @date 2026-04-02
// @prompt 创建加载区域列表方法
// @description 调用 queryAreaList 接口查询区域列表并更新 areaList
const loadAreaList = async () => {
  const result = await queryAreaList();
  areaList.value = result?.rows || result?.data || [];
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-04-02
// @prompt 在 onMounted 中调用加载区域列表方法
// @description 组件挂载时调用 loadAreaList 加载区域列表数据
onMounted(() => {
  loadAreaList();
});
// AI-GENERATED-END
</script>

<template>
  <!-- AI-GENERATED-BEGIN -->
  <!-- @date 2026-03-30 -->
  <!-- @prompt 创建病区组配置页面模板 -->
  <!-- @description 页面包含左侧病区组列表、中间已绑定病区、右侧病区列表和底部保存按钮 -->
  <Page auto-content-height content-class="p-[8px]">
    <div
      class="flex h-full flex-col overflow-hidden rounded-t-[10px] bg-[#fff]"
    >
      <div class="flex flex-1 gap-[10px] overflow-hidden">
        <!-- AI-GENERATED-BEGIN -->
        <!-- @date 2026-03-30 -->
        <!-- @prompt 使用 PageSplitLazy 组件实现左右拖拽分割 -->
        <!-- @description 使用 PageSplitLazy 组件将页面分为左右两部分，左侧为病区组列表，右侧为已绑定病区和病区列表 -->
        <PageSplitLazy
          :distribute="0.25"
          :line-thickness="6"
          :is-vertical="true"
          background-color="#fff"
          hover-color="#c0c4cc"
          :has-line-tip="true"
        >
          <template #first>
            <!-- 左侧病区组列表 -->
            <div class="flex h-full flex-col border border-[#e8e8e8]">
              <div
                class="flex items-center justify-between border-b border-[#e8e8e8]  px-[12px] py-[10px] "
              >
                <div class="flex items-center gap-[8px]">
                  <!-- <VbenIcon
                    color="#93c5fd"
                    icon="lucide:layout-grid"
                    style="font-size: 16px"
                  /> -->
                  <span class="text-[16px] font-bold ">
                    病区组列表
                  </span>
                </div>
                <span
                  class="rounded-[10px]  px-[8px] py-[2px] text-[12px] "
                >
                  {{ wardGroupTotal }} 组
                </span>
              </div>
              <div class="flex-1 overflow-auto">
                <WardGroupGrid class="wardGroup-grid">
                  <template #deptCount="{ row }">
                    <span
                     
                    >
                      {{ row.deptCount }}
                    </span>
                    <!-- <span
                      v-else
                      class="rounded-[10px] bg-[#f5f5f5] px-[8px] py-[2px] text-[12px] text-[#999]"
                    >
                      {{ row.deptCount }}
                    </span> -->
                  </template>
                </WardGroupGrid>
              </div>
              <div
                class="h-[45px] border-t border-[#e8e8e8]  px-[12px] py-[8px] text-[12px] text-[#666]"
              >
                共 {{ wardGroupTotal }} 个病区组，已配置
                <span class="font-bold text-[#0057d9]">
                  {{ configuredGroupWards }}
                </span>
                个
              </div>
            </div>
          </template>
          <template #second>
            <div
              class="flex items-center justify-between border-b border-[#e8e8e8]  px-[12px] py-[10px]"
            >
              <div class="flex items-center gap-[8px]">
                <!-- <VbenIcon
                  color="#93c5fd"
                  icon="lucide:hospital"
                  style="font-size: 16px"
                /> -->
                <span class="text-[16px] font-bold ">
                  配置病区 -
                  <span class="text-[16px] font-bold ">
                    {{ currentWardGroup?.groupName || '请选择病区组' }}
                  </span>
                </span>
              </div>
            </div>
            <!-- 右侧区域：已绑定病区 + 操作按钮 + 病区列表 -->
            <div class="flex h-[calc(100%-90px)] gap-[10px] p-[10px]">
              <!-- 中间已绑定病区 -->
              <div
                class="flex flex-1 flex-col overflow-hidden rounded-t-[10px] border border-[#gray]"
              >
                <div
                  class="flex items-center justify-between  bg-[#f4f4f5] px-[12px] py-[10px]"
                >
                  <div class="flex items-center gap-[8px]">
                    <span class="text-[14px] font-bold ">
                      已绑定病区
                    </span>
                    <span
                      v-if="currentWardGroup"
                      class="rounded-[10px] px-[8px] py-[2px] text-[12px] "
                    >
                      {{ boundWardTotal }}个
                    </span>
                  </div>
                </div>
                <div class="p-[10px]">
                  <Input
                    v-model:value="boundWardSearchName"
                    placeholder="搜索已配病区"
                    allow-clear
                    @keyup.enter="handleSearchBoundWard"
                    style="width: 100%"
                  />
                </div>
                <div class="flex-1 overflow-auto">
                  <BoundWardGrid />
                </div>
              </div>

              <!-- 中间操作按钮 -->
              <div
                class="flex flex-col items-center justify-center gap-[10px] pt-[50px]"
              >
                <Button
                  type="primary"
                  size="large"
                  :disabled="!currentWardGroup"
                  @click="handleRemoveFromBound"
                >
                  <span class="text-[18px]">>></span>
                </Button>
                <Button
                  type="primary"
                  size="large"
                  :disabled="!currentWardGroup"
                  @click="handleAddToBound"
                >
                  <span class="text-[18px]">&lt;&lt;</span>
                </Button>
              </div>

              <!-- 右侧病区列表 -->
              <div
                class="flex flex-1 flex-col overflow-hidden rounded-t-[10px] border border-[#gray]"
              >
                <div
                  class="flex items-center justify-between border-b  bg-[#f4f4f5] px-[12px] py-[10px]"
                >
                  <div class="flex items-center gap-[8px]">
                    <span class="text-[14px] font-bold ">
                      病区列表
                    </span>
                    <span
                      class="rounded-[10px] px-[8px] py-[2px] text-[12px] "
                    >
                      {{ wardTotal }}个
                    </span>
                  </div>
                </div>
                <div class="border-b border-[#e8e8e8] p-[10px]">
                  <Input
                    v-model:value="wardSearchName"
                    placeholder="搜索病区"
                    allow-clear
                    @keyup.enter="handleSearchWard"
                    style="width: 100%"
                  />
                </div>
                <div class="flex-1 overflow-auto">
                  <WardGrid />
                </div>
                <div
                  class="flex items-center justify-between border-t border-[#e8e8e8] bg-[#fafafa] px-[12px] py-[8px] text-[12px] text-[#666]"
                >
                  <span>
                    已选
                    <span class="font-bold text-[#1e40af]">
                      {{ wardSelectedCount }}
                    </span>
                    个
                  </span>
                  <span>共 {{ areaList.length }} 个病区</span>
                </div>
              </div>
            </div>
            <!-- AI-GENERATED-BEGIN -->
            <!-- @date 2026-03-30 -->
            <!-- @prompt 创建底部保存按钮区域 -->
            <!-- @description 底部保存配置按钮 -->
            <div
              class="flex h-[47px] items-center justify-end border-t border-[#e8e8e8] "
            >
              <Button
                type="primary"
                :loading="saveLoading"
                @click="handleSave"
                class="mr-2 "
              >
                <div class="flex items-center">
                  <!-- <VbenIcon
                    color="#fff"
                    icon="lucide:check-circle-2"
                    style="font-size: 18px"
                    class="mr-2"
                  /> -->
                  <span>保存配置</span>
                </div>
              </Button>
            </div>
            <!-- AI-GENERATED-END -->
          </template>
        </PageSplitLazy>
        <!-- AI-GENERATED-END -->
      </div>
    </div>
  </Page>
  <!-- AI-GENERATED-END -->
</template>

<!-- AI-GENERATED-BEGIN -->
<!-- @date 2026-03-30 -->
<!-- @prompt 创建样式定义 -->
<!-- @description 定义表格滚动和悬停样式 -->
<style scoped>
::v-deep(.vxe-grid--body-wrapper) {
  max-height: calc(100% - 100px);
  overflow: auto;
}

::v-deep(.vxe-body--row.row--hover) {
  /* background-color: #e6f7ff; */
}

::v-deep(.vxe-grid) {
  padding: 0;
}

/* 病区组列表表格 body cell 样式 */
::v-deep(.wardGroup-grid .vxe-body--row .vxe-body-cell--wrapper) {
  padding: 0 15px;
}
</style>
<!-- AI-GENERATED-END -->

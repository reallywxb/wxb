<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';
import { isEmpty } from '@vben/utils';

import {
  Button as AntButton,
  Empty as AntEmpty,
  Descriptions,
  DescriptionsItem,
  message,
  Modal,
  Timeline,
  TimelineItem,
} from 'ant-design-vue';
import { isArray } from 'lodash-es';

import { useVbenForm } from '#/adapter/form';
import { requestClient } from '#/api/request';
import { formDefaultOptions } from '#/components/spd';
import { deepMerge } from '#/utils/util';

const router = useRouter();

const accessStore = useAccessStore();

const [SearchForm, searchFormApi] = useVbenForm(
  deepMerge(formDefaultOptions, {
    fieldMappingTime: [['dateOrdered', ['dateFrom', 'dateTo'], 'YYYY-MM-DD']],
    commonConfig: {
      labelClass: 'w-[90px]',
    },
    wrapperClass:
      'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5 grid bg-white dark:bg-[hsl(var(--background))] p-2 pt-3 pb-1',
    actionWrapperClass: 'col-span-1 md:col-start-auto pr-0 col-[-2/-1] ml-auto',
    showCollapseButton: false,
    handleSubmit: async () => {
      const formValues = await searchFormApi.getValues();
      searchFormApi.setLatestSubmissionValues(toRaw(formValues));
      getList();
    },
    schema: [
      {
        label: 'SPD单号',
        fieldName: 'docNo',
        component: 'Input',
        formItemClass: '',
        rules: 'required',
        componentProps: {
          style: {
            width: '100%',
          },
          onPressEnter: () => {
            getList();
          },
        },
      },
      {
        label: '追溯方式',
        fieldName: 'traceMode',
        component: 'ChcSelect',
        formItemClass: '',
        componentProps: {
          style: {
            width: '100%',
          },
          options: [
            { label: '此单据及上级单据', value: 'upstream' },
            { label: '此单据及下级单据', value: 'downstream' },
          ],
          onChange: (value: string) => {
            getList();
          },
        },
      },
    ],
  }),
);
const list = ref<
  {
    children: { label: string; value: string }[];
    label: string;
  }[]
>([]);
const getList = async () => {
  try {
    const formValues = await searchFormApi.getValues();
    if (isEmpty(formValues?.docNo)) {
      message.warning('请输入SPD单号');
      return;
    }
    const res = await requestClient.get('/traceDocumentAction/query', {
      params: {
        docNo: formValues?.docNo || '',
        traceMode: formValues?.traceMode,
      },
    });
    list.value = isArray(res) ? res : [];
  } catch (error) {
    console.error(error);
  }
};

// AI-GENERATED-BEGIN
// @date 2026-04-13
// @prompt 单据追溯跳转配置函数化重构
// @description 获取单据类型配置列表，包含路由、字段映射和自动查询规则
const getDocumentTypeConfig = (type: string) => {
  const configList = [
    {
      name: '请领单', // 单据类型名称
      type: 'apply', // 单据类型标识
      path: '/warehouse/warehouseOrder/orderQuery', // 目标页面路由
      menuName: '科室库管理-库房请领查询', // 菜单权限校验名称
      orderField: 'orderNo', // 单号字段名（用于传递和设置）
      clearFields: ['dateOrdered'], // 需要清空的字段：申请时间
    },
    {
      name: '拣货单',
      type: 'pick',
      path: '/warehouse/orderApprove/picklistQuery',
      menuName: '中心库管理-拣货单查询',
      orderField: 'pickListNo', // 单号字段名
      clearFields: ['dateOrdered', 'warehouseId'], // 需要清空的字段：申请时间、仓库信息
    },
    {
      name: '院内配送单',
      type: 'delivery',
      path: '/warehouse/orderApprove/asnQuery',
      menuName: '中心库-配送单打印',
      orderField: 'asnNo', // 单号字段名
      clearFields: ['dateOrdered', 'warehouseId'], // 需要清空的字段：申请时间、仓库信息
    },
    {
      name: '出库单',
      type: 'outbound',
      path: '/warehouse/orderApprove/storageOutQuery',
      menuName: '中心库-出库明细查询',
      orderField: 'inoutNo', // 单号字段名
      clearFields: ['dateOrdered', 'warehouseId'], // 需要清空的字段：申请时间、仓库信息
    },
    {
      name: '科室入库单',
      type: 'receive',
      path: '/warehouse/orderPut/receiveDocQuery',
      menuName: '科室库管理-科室入库明细查询',
      orderField: 'inoutNo', // 单号字段名
      clearFields: ['dateOrdered', 'warehouseId'], // 需要清空的字段：申请时间、仓库信息
    },
    {
      name: '采购计划单',
      type: 'purchasePlan',
      path: '/purchase/purchasePlan/buyPlan',
      menuName: '采验管理-采购计划提交-明细查询',
      orderField: 'orderPlanNo', // 单号字段名
      clearFields: ['dateOrdered', 'warehouseId'], // 需要清空的字段：申请时间、仓库信息
    },
    {
      name: '采购订单',
      type: 'purchaseOrder',
      path: '/purchase/purchasePlan/buyOrderQuery',
      menuName: '采验管理-采购状态跟踪-单据信息',
      orderField: 'orderId', // 单号字段名
      clearFields: ['dateOrdered', 'warehouseId'], // 需要清空的字段：申请时间、仓库信息
    },
    {
      name: '配送单',
      type: 'distribution',
      path: '/purchase/checkPlan/checkWarehouse',
      menuName: '采验管理-验收入库-明细查询',
      orderField: 'asnId', // 单号字段名
      clearFields: ['dateOrdered', 'warehouseId'], // 需要清空的字段：申请时间、仓库信息
    },
    {
      name: '验收单',
      type: 'acceptance',
      path: '/purchase/checkPlan/checkWarehouse',
      menuName: '采验管理-验收入库-已验收',
      orderField: 'inoutIdAndmAsnId', // 单号字段名
      clearFields: ['dateOrdered', 'warehouseId'], // 需要清空的字段：申请时间、仓库信息
    },
  ];
  return configList.find((item) => item.name === type);
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-04-13
// @prompt 菜单权限校验函数
// @description 检查用户是否有访问指定路径的菜单权限
const hasMenuPermission = (path: string): boolean => {
  // 通过 accessStore 获取对应路径的菜单信息
  const menu = accessStore.getMenuByPath(path);
  // 如果菜单存在则返回 true，否则返回 false
  return !!menu;
};
// AI-GENERATED-END

// AI-GENERATED-BEGIN
// @date 2026-04-13
// @prompt 单据追溯跳转核心函数
// @description 处理单据号点击事件，进行权限校验后跳转到对应的详情页面
const goPage = (item: any, child: any) => {
  // 获取单号和单据类型
  const orderNo = child.value; // 单据编号
  const docType = item.label; // 单据类型，如：'请领单', '拣货单' 等

  // 校验单号是否为空
  if (!orderNo) {
    Modal.warning({
      title: '提示',
      content: '单号为空，无法跳转',
      centered: true,
    });
    return;
  }

  // 根据单据类型查找对应的配置
  const menuItem = getDocumentTypeConfig(docType);
  // 如果未找到配置，提示不支持该单据类型
  if (!menuItem) {
    console.warn(`未配置单据类型 "${docType}" 的跳转逻辑`);
    Modal.warning({
      title: '提示',
      content: `暂不支持查看${docType}详情`,
      centered: true,
    });
    return;
  }

  // 检查菜单权限
  if (!hasMenuPermission(menuItem.path)) {
    Modal.warning({
      title: '权限提示',
      content: `无此功能菜单权限，如需查看可联系运营人员添加权限`,
      centered: true,
      okText: '我知道了',
    });
    return;
  }

  // 构建查询参数
  let params: Record<string, any> = {
    [menuItem.orderField]: orderNo, // 设置单号字段（根据配置动态设置）
    from: 'traceSearch',
  };
  // 如果是配送单或验收单，则添加额外的查询参数
  if (docType === '配送单' || docType === '验收单') {
    params = {
      ...params,
      currentTab: docType === '配送单' ? 2 : 1,
    };
  }
  // 执行路由跳转
  router
    .push({
      path: menuItem.path, // 目标页面路径
      // 查询参数
      query: {
        ...params,
      },
    })
    .catch((error) => {
      // 捕获跳转失败的错误
      console.error('Navigation failed:', error);
      Modal.error({
        title: '错误',
        content: '页面跳转失败，请稍后重试',
        centered: true,
      });
    });
};
// AI-GENERATED-END
</script>

<template>
  <Page content-class="p-[0.5rem]" auto-content-height header-class="px-3 py-2">
    <div
      class="box-border flex h-full w-full flex-col items-center justify-start"
    >
      <SearchForm class="w-full shrink-0" />
      <div
        class="box-border min-h-0 w-full flex-1 overflow-auto rounded-l-md bg-white p-4 shadow-sm dark:bg-[hsl(var(--background))]"
      >
        <div
          v-if="list.length <= 0"
          class="box-border flex h-full w-full items-center justify-center"
        >
          <AntEmpty :image="AntEmpty.PRESENTED_IMAGE_SIMPLE" />
        </div>

        <Timeline v-else mode="left">
          <TimelineItem v-for="(item, index) in list" :key="index">
            <div class="box-border w-full">
              <div class="mb-2 box-border w-full text-sm text-gray-600">
                {{ item.label }}
              </div>
              <div
                class="box-border w-full rounded-[3px] border border-gray-200 bg-[rgba(241,241,241,1)] p-3 text-sm leading-5 text-[rgba(16,16,16,1)]"
              >
                <Descriptions
                  :column="{ xxl: 5, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }"
                  :bordered="false"
                  :colon="false"
                  size="default"
                  :label-style="{
                    width: '90px',
                    flexShrink: 0,
                  }"
                >
                  <template
                    v-for="(child, childIndex) in item.children"
                    :key="`child-${childIndex}`"
                  >
                    <DescriptionsItem>
                      <template #label>
                        <div class="box-border w-full truncate">
                          {{ child.label }}
                        </div>
                      </template>
                      <div
                        v-if="child.label === '单号'"
                        class="box-border flex w-full items-center justify-start"
                      >
                        <span v-if="isEmpty(child.value)">'-'</span>
                        <AntButton
                          v-else
                          type="link"
                          @click="goPage(item, child)"
                          class="box-border flex-1 truncate !p-0"
                        >
                          <div class="box-border w-full truncate text-left">
                            {{ child.value }}
                          </div>
                        </AntButton>
                      </div>
                      <div v-else class="box-border w-full truncate">
                        {{ child.value ?? '-' }}
                      </div>
                    </DescriptionsItem>
                  </template>
                </Descriptions>
              </div>
            </div>
          </TimelineItem>
        </Timeline>
      </div>
    </div>
  </Page>
</template>

<style scoped></style>

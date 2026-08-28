<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { CirculationDataType } from '../index.vue';

import { onMounted, ref, watch } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import {
  Card,
  Descriptions,
  DescriptionsItem,
  Timeline,
  TimelineItem,
} from 'ant-design-vue';

import { generateTraceChartOption } from './traceChart';

interface TraceDetailProps {
  traceInfo?: Record<string, any>;
  circulationData?: Array<{
    department?: string;
    documentNo?: string;
    documentType?: string;
    id?: number | string;
    operator?: string;
    source?: string;
    target?: string;
    time?: string;
  }>;
}

const props = withDefaults(defineProps<TraceDetailProps>(), {
  traceInfo: () => ({}),
  circulationData: () => [],
});

const baseInfoFields = [
  { label: '药品编码', key: 'productCode' },
  { label: '药品名称', key: 'productName' },
  { label: '规格', key: 'productSpec' },
  { label: '剂型', key: 'dosageForm' },
  { label: '单位', key: 'unitName' },
  { label: '批准文号', key: 'approvalNo' },
  { label: '生产日期', key: 'productionDate' },
  { label: '批号', key: 'lot' },
  { label: '有效期至', key: 'expiryDate' },
  { label: '生产企业', key: 'manufacturer' },
  { label: '默认供应商', key: 'defaultVendor' },
];

const circulationFields: {
  key: keyof CirculationDataType;
  label: string;
}[] = [
  { label: '单号', key: 'documentNo' },
  { label: '单据类型', key: 'documentType' },
  { label: '操作人', key: 'operator' },
  { label: '科室', key: 'department' },
  { label: '来源', key: 'source' },
  { label: '目标', key: 'target' },
];

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const renderChart = () => {
  generateTraceChartOption(
    renderEcharts,
    props.circulationData as CirculationDataType[],
  );
};

onMounted(() => {
  // renderChart();
});

watch(
  () => props.circulationData,
  () => {
    renderChart();
  },
  { deep: true },
);
</script>

<template>
  <Card>
    <div class="mb-4 rounded-md bg-white p-4 font-bold shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center">
          <span>追溯码:</span>
          <span class="ml-2">{{ props.traceInfo?.traceCode }}</span>
        </div>
      </div>
      <div class="flex flex-wrap gap-x-12 gap-y-4 text-sm">
        <div
          v-for="(field, index) in baseInfoFields"
          :key="index"
          class="flex items-center"
        >
          <span class="mr-1 text-sm text-gray-900">{{ field.label }}:</span>
          <span class="text-sm text-gray-900">{{
            props.traceInfo?.[field.key] ?? '-'
          }}</span>
        </div>
      </div>
    </div>

    <div class="flex h-[calc(100vh-280px)] gap-0">
      <div class="flex-1 overflow-auto rounded-l-md bg-white p-4 shadow-sm">
        <h3 class="mb-4 pb-2 text-base font-bold">流通信息</h3>
        <Timeline mode="left">
          <TimelineItem
            v-for="(item, index) in props.circulationData"
            :key="item.id ?? index"
          >
            <div>
              <div class="mb-2 text-sm text-gray-600">{{ item.time }}</div>
              <div
                class="rounded-[3px] border border-gray-200 bg-[rgba(241,241,241,1)] p-3 text-sm leading-5 text-[rgba(16,16,16,1)]"
              >
                <Descriptions
                  :column="2"
                  :bordered="false"
                  :colon="false"
                  size="default"
                  :label-style="{ width: '80px', flexShrink: 0 }"
                >
                  <DescriptionsItem
                    v-for="field in circulationFields"
                    :key="field.key"
                    :label="`${field.label}:`"
                  >
                    {{ item[field.key] ?? '-' }}
                  </DescriptionsItem>
                </Descriptions>
              </div>
            </div>
          </TimelineItem>
        </Timeline>
      </div>

      <div class="flex-1 rounded-r-md bg-white p-4 shadow-sm">
        <h3 class="mb-4 pb-2 text-base font-bold">追溯码履历图</h3>
        <div class="w-full">
          <EchartsUI ref="chartRef" height="600px" class="w-full" />
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped></style>

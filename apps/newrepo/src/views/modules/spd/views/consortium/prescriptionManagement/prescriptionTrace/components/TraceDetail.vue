<script lang="ts" setup>
import {
  Card,
  Descriptions,
  DescriptionsItem,
  Timeline,
  TimelineItem,
} from 'ant-design-vue';

interface TraceDetailProps {
  prescriptionInfo?: Record<string, any>;
  traceData?: Array<{
    deliveryTime?: string;
    department?: string;
    dispenseHospital?: string;
    dispenser?: string;
    dispenseTime?: string;
    doctor?: string;
    indicationHospital?: string;
    indicationPerson?: string;
    indicationTime?: string;
    prescriptionTime?: string;
    receiveHospital?: string;
    receiver?: string;
    receiveTime?: string;
    supplier?: string;
    time?: string;
    title?: string;
  }>;
}

const props = withDefaults(defineProps<TraceDetailProps>(), {
  prescriptionInfo: () => ({}),
  traceData: () => [],
});

// 处方基本信息字段配置（数据驱动）
// breakAfter: true 表示在该字段后换行
const baseInfoFields = [
  { label: '处方号', key: 'presNo', breakAfter: true },
  { label: '开方医院', key: 'orgName' },
  { label: '外延医院', key: 'extOrgName' },
  { label: '外延药房', key: 'extWarehouseName', breakAfter: true },
  { label: '就诊人', key: 'patientName' },
  { label: '就诊卡号', key: 'patientCode' },
  { label: '性别', key: 'sex' },
  { label: '年龄', key: 'age' },
  { label: '处方时间', key: 'presDate' },
];

// 追溯节点字段映射配置
const traceFieldMapping: Record<
  string,
  Array<{ key: string; label: string }>
> = {
  prescription: [
    { key: 'label', label: '开单科室' },
    { key: 'userName', label: '开单医生' },
    { key: 'time', label: '处方时间' },
  ],
  indication: [
    { key: 'label', label: '指示医院' },
    { key: 'userName', label: '指示人' },
    { key: 'time', label: '指示时间' },
  ],
  delivery: [
    { key: 'label', label: '供应商' },
    { key: 'time', label: '配送时间' },
  ],
  receive: [
    { key: 'label', label: '签收医院' },
    { key: 'userName', label: '签收人' },
    { key: 'time', label: '签收时间' },
  ],
  dispense: [
    { key: 'label', label: '发放医院' },
    { key: 'userName', label: '发放人' },
    { key: 'time', label: '发放时间' },
  ],
};

// 根据节点类型获取显示的字段
const getNodeFields = (item: any) => {
  const nodeType = item.nodeType || item.title;
  const fields = traceFieldMapping[nodeType] || [];
  return fields
    .filter((field) => item[field.key])
    .map((field) => ({
      label: field.label,
      value: item[field.key],
    }));
};
</script>

<template>
  <Card class="h-full">
    <!-- 处方信息 -->
    <div
      class="mb-4 flex flex-wrap gap-x-[48px] gap-y-[6px] rounded-md bg-white p-4 font-bold shadow-sm"
    >
      <template v-for="(field, index) in baseInfoFields" :key="index">
        <div class="prescription-info-item">
          <span class="mr-1 text-sm text-gray-900">{{ field.label }}:</span>
          <span class="text-sm text-gray-900">{{
            props.prescriptionInfo?.[field.key] ?? '-'
          }}</span>
        </div>
        <!-- 换行标记 -->
        <div v-if="field.breakAfter" class="h-0 w-full"></div>
      </template>
    </div>

    <!-- 流通信息 -->
    <div class="w-[50%] rounded-md bg-white p-4 shadow-sm">
      <h3 class="mb-4 pb-2 text-base font-bold">流通信息</h3>
      <Timeline mode="left">
        <TimelineItem v-for="(item, index) in props.traceData" :key="index">
          <div>
            <div class="mb-2 text-sm font-bold text-gray-800">
              {{ item.time }}
            </div>
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
                  v-for="(field, fieldIndex) in getNodeFields(item)"
                  :key="fieldIndex"
                  :label="`${field.label}:`"
                  :style="{
                    'padding-bottom':
                      fieldIndex >=
                      Math.floor((getNodeFields(item).length - 1) / 2) * 2
                        ? '0'
                        : '12px',
                  }"
                >
                  {{ field.value ?? '-' }}
                </DescriptionsItem>
              </Descriptions>
            </div>
          </div>
        </TimelineItem>
      </Timeline>
    </div>
  </Card>
</template>

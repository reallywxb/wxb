<script setup lang="ts">
import type { DatePickerProps } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

import { computed, watch } from 'vue';

import { createIconifyIcon } from '@vben/chc-icons';

import { DatePicker } from 'ant-design-vue';
import dayjs from 'dayjs';

const props = withDefaults(
  defineProps<{
    leftAttrs?: Partial<DatePickerProps>;
    rightAttrs?: Partial<DatePickerProps>;
    value: string[] | undefined;
    valueFormat?: string;
  }>(),
  {
    leftAttrs: () => {
      return {};
    },
    rightAttrs: () => {
      return {};
    },
    valueFormat: 'YYYY-MM-DD',
  },
);
const emit = defineEmits(['update:value', 'change', 'ok']);
watch(
  () => props.value,
  (val) => {
    let isOk = true;
    if (val && val.length > 0) {
      for (let key of val) {
        if (typeof key !== 'string') {
          isOk = false;
        }
      }
    }
    !isOk &&
      console.error(
        '[Data-Group]:组件value仅支持传递字符串数组，不支持其他格式，请仔细核查参数类型',
      );
    isOk = true;
  },
  {
    immediate: true,
  },
);
const dateRange = computed({
  get() {
    return props.value && props.value.length > 0 ? props.value : [];
  },
  set(value) {
    emit('update:value', value);
    emit('change', value);
  },
});
const date1 = computed({
  get() {
    return dateRange.value && dateRange.value.length > 0
      ? (dateRange.value[0] as string)
      : '';
    // return dateRange.value.includes(',') ? dateRange.value.split(',')[0] : '';
  },
  set(value) {
    // date1在赋值时比对date1与date2大小，如果date1比date2大，则把date2的时间设置为23:59:59
    if (dayjs(value).isAfter(dayjs(date2.value))) {
      dateRange.value =
        !value && !date2.value
          ? []
          : [
              `${value || ''}`,
              `${dayjs(date2.value).endOf('day').format(props.valueFormat)}`,
            ];
    } else {
      dateRange.value =
        !value && !date2.value ? [] : [`${value || ''}`, `${date2.value}`];
    }

    // dateRange.value =
    //   !value && !date2.value ? '' : `${value || ''},${date2.value}`;
  },
});
const date2 = computed({
  get() {
    return dateRange.value && dateRange.value.length > 1
      ? (dateRange.value[1] as string)
      : '';
    // return dateRange.value.includes(',') ? dateRange.value.split(',')[1] : '';
  },
  set(value) {
    // date2在赋值时比对date1与date2大小，如果date1比date2大，则把date1的时间设置为00:00:00
    if (dayjs(date1.value).isAfter(dayjs(value))) {
      dateRange.value =
        !value && !date1.value
          ? []
          : [
              `${dayjs(date1.value).startOf('day').format(props.valueFormat)}`,
              `${value || ''}`,
            ];
    } else {
      dateRange.value =
        !value && !date1.value ? [] : [`${date1.value}`, `${value || ''}`];
    }

    // dateRange.value =
    //   !value && !date1.value ? '' : `${date1.value},${value || ''}`;
  },
});
const ToIcon = createIconifyIcon('ant-design:swap-right-outlined');
const changeLeftDate = () => {
  // console.log('dateRange.value:', dateRange.value);
  // emit('change', dateRange.value);
  // console.log('time,timeString:', time, timeString, date1.value);
  // dateRange.value = `${timeString},${timeString[1]}`;
};
const changeRightDate = () => {
  // console.log('time,timeString:', time, timeString, date2.value);
  // console.log('dateRange.value:', dateRange.value);
  // emit('change', dateRange.value);
};
const disabledDate1 = (current: Dayjs) => {
  // 统一根据 'YYYY-MM-DD' 转换
  const midCurrent = dayjs(current.format('YYYY-MM-DD'));
  const midDate2 = dayjs(dayjs(date2.value).format('YYYY-MM-DD'));
  return date2.value ? current && midCurrent > midDate2 : false;
};
const disabledDate2 = (current: Dayjs) => {
  const midCurrent = dayjs(current.format('YYYY-MM-DD'));
  const midDate1 = dayjs(dayjs(date1.value).format('YYYY-MM-DD'));
  return date1.value ? current && midCurrent < midDate1 : false;
};

const disabledTime1 = (current: Dayjs | null) => {
  return {
    disabledHours:
      current && date2.value
        ? () => getDisabledHours1(current)
        : () => {
            return [] as number[];
          },
    disabledMinutes:
      current && date2.value
        ? (hour: number) => getDisabledMinutes1(hour, current)
        : () => {
            return [] as number[];
          },
    disabledSeconds:
      current && date2.value
        ? (hour: number, minute: number) =>
            getDisabledSeconds1(hour, minute, current)
        : () => {
            return [] as number[];
          },
  };
};
const getDisabledHours1 = (current: Dayjs) => {
  // 如果是同一天，才只取 date2 之前的时间
  if (
    current.format('YYYY-MM-DD') === dayjs(date2.value).format('YYYY-MM-DD')
  ) {
    const now = dayjs(date2.value);
    return now.hour()
      ? Array.from(
          { length: 24 - now.hour() - 1 },
          (_, i) => i + now.hour() + 1,
        )
      : [];
  } else {
    return [];
  }
};

const getDisabledMinutes1 = (hour: number, current: Dayjs) => {
  if (
    current.format('YYYY-MM-DD') === dayjs(date2.value).format('YYYY-MM-DD')
  ) {
    const now = dayjs(date2.value);
    return now.hour() === hour
      ? Array.from(
          { length: 60 - now.minute() - 1 },
          (_, i) => i + now.minute() + 1,
        )
      : [];
  } else {
    return [];
  }
};

const getDisabledSeconds1 = (hour: number, minute: number, current: Dayjs) => {
  if (
    current.format('YYYY-MM-DD') === dayjs(date2.value).format('YYYY-MM-DD')
  ) {
    const now = dayjs(date2.value);
    return now.hour() === hour && now.minute() === minute
      ? Array.from({ length: 60 - now.second() }, (_, i) => i + now.second())
      : [];
  } else {
    return [];
  }
};

const disabledTime2 = (current: Dayjs | null) => {
  return {
    disabledHours:
      current && date1.value ? () => getDisabledHours2(current) : () => [],
    disabledMinutes:
      current && date1.value
        ? (hour: number) => getDisabledMinutes2(hour, current)
        : () => [],
    disabledSeconds:
      current && date1.value
        ? (hour: number, minute: number) =>
            getDisabledSeconds2(hour, minute, current)
        : () => [],
  };
};
const getDisabledHours2 = (current: Dayjs) => {
  if (
    current.format('YYYY-MM-DD') === dayjs(date1.value).format('YYYY-MM-DD')
  ) {
    const dateLeft = dayjs(date1.value);
    return Array.from({ length: dateLeft.hour() }, (_, i) => i);
  } else {
    return [];
  }

  // return Array.from({ length: now.hour() }, (_, i) => i);
};

const getDisabledMinutes2 = (hour: number, current: Dayjs) => {
  if (
    current.format('YYYY-MM-DD') === dayjs(date1.value).format('YYYY-MM-DD')
  ) {
    const dateLeft = dayjs(date1.value);
    // if (dateLeft.hour() === hour && dateLeft.minute() === 0) {
    //   return Array.from({ length: 60 }, (_, i) => i);
    // }
    return dateLeft.hour() === hour
      ? Array.from({ length: dateLeft.minute() }, (_, i) => i)
      : [];
  } else {
    return [];
  }
};
const getDisabledSeconds2 = (hour: number, minute: number, current: Dayjs) => {
  if (
    current.format('YYYY-MM-DD') === dayjs(date1.value).format('YYYY-MM-DD')
  ) {
    const dateLeft = dayjs(date1.value);
    return dateLeft.hour() === hour && dateLeft.minute() === minute
      ? Array.from({ length: dateLeft.second() + 1 }, (_, i) => i)
      : [];
  } else {
    return [];
  }
};
// 修复 onOk 回调函数
const handleOkLeft = (value: Dayjs | string) => {
  emit(
    'ok',
    typeof value === 'string' ? value : value.format(props.valueFormat),
    'left',
  );
};
const handleOkRight = (value: Dayjs | string) => {
  emit(
    'ok',
    typeof value === 'string' ? value : value.format(props.valueFormat),
    'right',
  );
};
const onFocus = () => {
  // console.log('onFocus');
};
</script>
<template>
  <!-- :style="{ '--main-color': diffPreference?.theme?.colorPrimary }" -->
  <div class="date-group-container ant-picker-focused">
    <DatePicker
      :show-now="false"
      placeholder="开始日期"
      v-bind="{ ...$attrs, ...leftAttrs }"
      v-model:value="date1"
      :bordered="false"
      :value-format="valueFormat"
      @change="changeLeftDate"
      :disabled-date="disabledDate1"
      :disabled-time="disabledTime1"
      style="padding-right: 0"
      @focus="onFocus"
      @ok="handleOkLeft"
    >
      <template #suffixIcon>
        <span></span>
      </template>
    </DatePicker>
    <div class="icon">
      <ToIcon style="font-size: 16px; color: inherit" />
    </div>
    <DatePicker
      :show-now="false"
      placeholder="结束日期"
      v-bind="{ ...$attrs, ...rightAttrs }"
      v-model:value="date2"
      :bordered="false"
      :value-format="valueFormat"
      @change="changeRightDate"
      :disabled-date="disabledDate2"
      :disabled-time="disabledTime2"
      @focus="onFocus"
      @ok="handleOkRight"
    />
  </div>
</template>
<style scoped>
.date-group-container {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}

/* :where(.date-group-container).ant-picker:hover, :where(.date-group-container).ant-picker-focused {
    border-color: #278df2;
    border-inline-end-width: 1px;
} */
.date-group-container:hover {
  border-color: hsl(var(--primary) / 80%);
  border-inline-end-width: 1px;
}

.date-group-container:has(> .ant-picker-focused) {
  border-color: hsl(var(--primary) / 80%);
  border-inline-end-width: 1px;
}

.date-group-container .ant-picker {
  border: none;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
  color: hsl(var(--border));
}
</style>

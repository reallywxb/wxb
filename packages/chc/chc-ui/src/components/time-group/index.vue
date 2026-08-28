<script setup lang="ts">
import type { TimePickerProps } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

import { computed } from 'vue';

import { createIconifyIcon } from '@vben/chc-icons';

import { TimePicker } from 'ant-design-vue';
import dayjs from 'dayjs';

const props = withDefaults(
  defineProps<{
    format?: string;
    leftAttrs?: Partial<TimePickerProps>;
    rightAttrs?: Partial<TimePickerProps>;
    value: string[] | undefined;
    valueFormat?: string;
  }>(),
  {
    format: 'HH:mm:ss',
    leftAttrs: () => {
      return {};
    },
    rightAttrs: () => {
      return {};
    },
    valueFormat: 'HH:mm:ss',
  },
);
const emit = defineEmits(['update:value', 'change', 'ok']);
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
  },
  set(value) {
    // 如果左值时间大于右侧时间，需要重新赋值
    if (
      dayjs(dayjs().format('YYYY-MM-DD ') + value).isAfter(
        dayjs(dayjs().format('YYYY-MM-DD ') + (date2.value || '23:59:59')),
      )
    ) {
      dateRange.value =
        !value && !date2.value
          ? []
          : [
              `${value || ''}`,
              `${dayjs(
                dayjs().format('YYYY-MM-DD ') + (date2.value || '23:59:59'),
              )
                .endOf('day')
                .format(props.valueFormat)}`,
            ];
    } else {
      dateRange.value =
        !value && !date2.value ? [] : [`${value || ''}`, `${date2.value}`];
    }
  },
});
const date2 = computed({
  get() {
    return dateRange.value && dateRange.value.length > 1
      ? (dateRange.value[1] as string)
      : '';
  },
  set(value) {
    // 如果左值时间大于右侧时间，需要重新赋值
    if (
      dayjs(
        dayjs().format('YYYY-MM-DD ') + (date1.value || '00:00:00'),
      ).isAfter(dayjs(dayjs().format('YYYY-MM-DD ') + value))
    ) {
      dateRange.value =
        !value && !date1.value
          ? []
          : [
              `${dayjs(
                dayjs().format('YYYY-MM-DD ') + (date1.value || '00:00:00'),
              )
                .startOf('day')
                .format(props.valueFormat)}`,
              `${value || ''}`,
            ];
    } else {
      dateRange.value =
        !value && !date1.value ? [] : [`${date1.value}`, `${value || ''}`];
    }
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

const disabledTime1 = () => {
  return {
    disabledHours: date2.value
      ? () => getDisabledHours1()
      : () => {
          return [] as number[];
        },
    disabledMinutes: date2.value
      ? (hour: number) => getDisabledMinutes1(hour)
      : () => {
          return [] as number[];
        },
    disabledSeconds: date2.value
      ? (hour: number, minute: number) => getDisabledSeconds1(hour, minute)
      : () => {
          return [] as number[];
        },
  };
};
const getDisabledHours1 = () => {
  const timeRight = dayjs(date2.value, props.valueFormat);
  return Array.from(
    { length: 24 - timeRight.hour() - 1 },
    (_, i) => i + timeRight.hour() + 1,
  );
  // return now.hour()
  //   ? Array.from({ length: 24 - now.hour() - 1 }, (_, i) => i + now.hour() + 1)
  //   : [];
};

const getDisabledMinutes1 = (hour: number) => {
  const timeRight = dayjs(date2.value, props.valueFormat);
  return timeRight.hour() === hour
    ? Array.from(
        { length: 60 - timeRight.minute() - 1 },
        (_, i) => i + timeRight.minute() + 1,
      )
    : [];
};

const getDisabledSeconds1 = (hour: number, minute: number) => {
  const timeRight = dayjs(date2.value, props.valueFormat);
  return timeRight.hour() === hour && timeRight.minute() === minute
    ? Array.from(
        { length: 60 - timeRight.second() },
        (_, i) => i + timeRight.second(),
      )
    : [];
};

const disabledTime2 = () => {
  return {
    disabledHours: date1.value ? () => getDisabledHours2() : () => [],
    disabledMinutes: date1.value
      ? (hour: number) => getDisabledMinutes2(hour)
      : () => [],
    disabledSeconds: date1.value
      ? (hour: number, minute: number) => getDisabledSeconds2(hour, minute)
      : () => [],
  };
};
const getDisabledHours2 = () => {
  const timeLeft = dayjs(date1.value, props.valueFormat);
  return Array.from({ length: timeLeft.hour() }, (_, i) => i);
};

const getDisabledMinutes2 = (hour: number) => {
  const timeLeft = dayjs(date1.value, props.valueFormat);
  return timeLeft.hour() === hour
    ? Array.from({ length: timeLeft.minute() }, (_, i) => i)
    : [];
};
const getDisabledSeconds2 = (hour: number, minute: number) => {
  const timeLeft = dayjs(date1.value, props.valueFormat);
  return timeLeft.hour() === hour && timeLeft.minute() === minute
    ? Array.from({ length: timeLeft.second() + 1 }, (_, i) => i)
    : [];
};
// 修复 onOk 回调函数
const handleOkLeft = (value: Dayjs | null | string) => {
  if (!value) {
    emit('ok', '', 'left');
  } else if (typeof value === 'string') {
    emit('ok', value, 'left');
  } else {
    emit('ok', value.format(props.valueFormat), 'left');
  }
};
const handleOkRight = (value: Dayjs | null | string) => {
  if (!value) {
    emit('ok', '', 'right');
  } else if (typeof value === 'string') {
    emit('ok', value, 'right');
  } else {
    emit('ok', value.format(props.valueFormat), 'right');
  }
};
const onFocus = () => {
  // console.log('onFocus');
};
</script>
<template>
  <!-- :style="{ '--main-color': diffPreference?.theme?.colorPrimary }" -->
  <div class="date-group-container ant-picker-focused">
    <TimePicker
      :show-now="false"
      placeholder="开始时间"
      v-bind="{ ...$attrs, ...leftAttrs }"
      v-model:value="date1"
      :bordered="false"
      :format="format"
      :value-format="valueFormat"
      @change="changeLeftDate"
      :disabled-time="disabledTime1"
      style="padding-right: 0"
      @focus="onFocus"
      @ok="handleOkLeft"
    >
      <template #suffixIcon>
        <span></span>
      </template>
    </TimePicker>
    <div class="icon">
      <ToIcon style="font-size: 16px; color: inherit" />
    </div>
    <TimePicker
      :show-now="false"
      placeholder="结束时间"
      v-bind="{ ...$attrs, ...rightAttrs }"
      v-model:value="date2"
      :bordered="false"
      :format="format"
      :value-format="valueFormat"
      @change="changeRightDate"
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

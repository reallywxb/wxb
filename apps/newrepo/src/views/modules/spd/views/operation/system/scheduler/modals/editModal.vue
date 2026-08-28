<script lang="ts" setup>
import { h, nextTick, ref } from 'vue';

import { ChcSelect } from '@vben/chc-ui';
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { saveScheduler } from '../api';
import batchAddModal from './batchAddModal.vue';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('修改');

const selectParams = ref<{ [key: string]: any }>({});

const [BatchAddModal, batchAddModalApi] = useVbenModal({
  connectedComponent: batchAddModal,
});

const frequencyTypeDep = ref({
  ScheduleType: ""
})

const isFirstLoad = ref(true);

const [Modal, modalApi] = useVbenModal({
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      serviceData.value = modalApi.getData<Record<string, any>>();
      selectParams.value = {
        ad_process_id: serviceData.value.AD_Process_ID,
      };
      frequencyTypeDep.value.ScheduleType = serviceData.value.ScheduleType
      setTimeout(async () => {
        const weekKeyArr: string[] = [
          'OnMonday',
          'OnTuesday',
          'OnWednesday',
          'OnThursday',
          'OnFriday',
          'OnSaturday',
          'OnSunday',
        ];
        const weekArr: string[] = [];

        weekKeyArr.forEach((key) => {
          // weekArr.push(baseFormApi.getValue(key));
          if (serviceData.value[key] === 'Y') {
            weekArr.push(key);
          }
        });

        ChcGridApi.query();
        isFirstLoad.value = true
        await baseFormApi.setFieldValue('ScheduleType', serviceData.value.ScheduleType);
        await baseFormApi.setValues({
          ...serviceData.value,
          weekArr,
        });

        baseFormApi.validate()
        isFirstLoad.value = false
      }, 100);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});

const [BaseForm, baseFormApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 在label后显示一个冒号
    colon: true,
    labelClass: 'w-[120px]',
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },

  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  actionWrapperClass: 'formActionAreaStyle',
  layout: 'horizontal',

  showCollapseButton: false,
  showDefaultActions: false,
  schema: [
    {
      component: h(
        'div',
        {
          style: {
            fontSize: '20px',
            fontWeight: '500',
          },
        },
        '基本信息',
      ),
      formItemClass: 'col-start-1',
      fieldName: 'field2',
      label: '',
      hideLabel: true,
    },
    {
      component: 'Input',
      fieldName: 'ProcessName',
      label: '名称',
      formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          placeholder: '请输入名称',
          disabled: true,
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'IsActive',
      label: '是否启用',
      formItemClass: 'col-start-1',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'KeepLogDays',
      label: '日志保留天数',
      rules: 'required',
      formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          placeholder: '请输入日志保留天数',
        };
      },
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: '描述',
      componentProps: () => {
        return {
          placeholder: '请输入描述',
        };
      },
      formItemClass: 'col-span-2 pb-1',
    },
    {
      component: h(
        'div',
        {
          style: {
            fontSize: '20px',
            fontWeight: '500',
          },
        },
        '执行计划',
      ),
      formItemClass: 'col-start-1',
      fieldName: 'field3',
      label: '',
      hideLabel: true,
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=318',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择计划类型',
          paginate: false,
          // allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      formItemClass: 'col-start-1',
      rules: 'required',
      fieldName: 'ScheduleType',
      label: '计划类型',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=167',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择星期几',
          paginate: false,
          // allowClear: true,
          filterByFrontEnd: true,
          dependencies: frequencyTypeDep.value,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      dependencies: {
        triggerFields: ['ScheduleType'],
        show: (values) => {
          return values.ScheduleType === 'W';
        },
         trigger(values) {
          frequencyTypeDep.value.ScheduleType =values.scheduleType
           if (
              baseFormApi?.getFieldComponentRef &&
              typeof baseFormApi?.getFieldComponentRef === 'function' &&
              baseFormApi?.getFieldComponentRef('WeekDay') 
            ) {
              baseFormApi.getFieldComponentRef(
                'WeekDay',
              ).params.dependencies = {
                // regionId: values.departmentId,
                ScheduleType: values.ScheduleType,
              };
              console.warn(
                baseFormApi.getFieldComponentRef('WeekDay'),
                values,
                556,
              );
              baseFormApi
                ?.getFieldComponentRef('WeekDay')
                ?.fetchApi();
              baseFormApi?.setFieldValue('WeekDay', isFirstLoad.value ? serviceData.value.WeekDay :  undefined);
            }
        }
      },
      rules: 'required',
      fieldName: 'WeekDay',
      label: '星期几',
    },
    {
      component: 'InputNumber',
      fieldName: 'MonthDay',
      label: '月份日期',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入月份日期',
          triggerFields: ['ScheduleType'],
        };
      },
      dependencies: {
        triggerFields: ['ScheduleType'],
        show: (values) => {
          return values.ScheduleType === 'M';
        },
      },
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: '/baseHandleAction/refList.do?id=221',
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          showSearch: true,
          placeholder: '请选择频度类型',
          paginate: false,
          dependencies: frequencyTypeDep.value,
          // allowClear: true,
          filterByFrontEnd: true,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      dependencies: {
        triggerFields: ['ScheduleType'],
        show: (values) => {
          return values.ScheduleType === 'F';
        },
        trigger(values) {
          frequencyTypeDep.value.ScheduleType =values.scheduleType
           if (
              baseFormApi?.getFieldComponentRef &&
              typeof baseFormApi?.getFieldComponentRef === 'function' &&
              baseFormApi?.getFieldComponentRef('FrequencyType') 
            ) {
              baseFormApi.getFieldComponentRef(
                'FrequencyType',
              ).params.dependencies = {
                // regionId: values.departmentId,
                ScheduleType: values.ScheduleType,
              };
              console.warn(
                baseFormApi.getFieldComponentRef('FrequencyType'),
                values,
                556,
              );
              baseFormApi
                ?.getFieldComponentRef('FrequencyType')
                ?.fetchApi();
              baseFormApi?.setFieldValue('FrequencyType', isFirstLoad.value ? serviceData.value.FrequencyType :  undefined);
            }
        }
      },
      rules: 'required',
      formItemClass: 'col-start-1',
      fieldName: 'FrequencyType',
      label: '频度类型',
    },
    {
      component: 'InputNumber',
      fieldName: 'Frequency',
      label: '频度',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入频度',
          triggerFields: ['ScheduleType'],
        };
      },
      dependencies: {
        triggerFields: ['ScheduleType'],
        show: (values) => {
          return values.ScheduleType === 'F';
        },
      },
    },
    {
      component: 'CheckboxGroup',
      componentProps: {
        // buttonStyle: 'solid',
        options: [
          { label: '星期一', value: 'OnMonday' },
          { label: '星期二', value: 'OnTuesday' },
          { label: '星期三', value: 'OnWednesday' },
          { label: '星期四', value: 'OnThursday' },
          { label: '星期五', value: 'OnFriday' },
          { label: '星期六', value: 'OnSaturday' },
          { label: '星期日', value: 'OnSunday' },
        ],
        triggerFields: ['ScheduleType'],
      },
      dependencies: {
        triggerFields: ['ScheduleType'],
        show: (values) => {
          return values.ScheduleType === 'F';
        },
      },
      rules: 'required',
      formItemClass: 'col-span-2',
      fieldName: 'weekArr',
      label: '每周',
    },
    {
      component: 'InputNumber',
      fieldName: 'ScheduleHour',
      label: '启动小时',
      formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          placeholder: '请输入启动小时',
          max: 23,
          min: 0,
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'ScheduleMinute',
      label: '启动分钟',
      componentProps: () => {
        return {
          placeholder: '请输入启动分钟',
          max: 59,
          min: 0,
        };
      },
    },
    {
      component: 'Switch',
      fieldName: 'RunOnlySpecifiedTime',
      label: '仅指定时间',
      // formItemClass: 'input-nostyle pb-1',
      componentProps: () => {
        return {
          checkedValue: 'Y',
          unCheckedValue: 'N',
          checkedChildren: '是',
          unCheckedChildren: '否',
          style: {
            width: '40px',
          },
        };
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'RunOnlySpecifiedTolMin',
      label: '运行窗口时间',
      componentProps: () => {
        return {
          placeholder: '请输入运行窗口时间',
        };
      },
      dependencies: {
        triggerFields: ['RunOnlySpecifiedTime'],
        show: (values) => {
          return values.RunOnlySpecifiedTime === 'Y';
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'RunOnlyOnIP',
      label: '仅IP地址',
      formItemClass: 'col-start-1',
      componentProps: () => {
        return {
          placeholder: '请输入仅IP地址',
        };
      },
    },
  ],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: true,

      checkboxConfig: {
        highlight: true,
      },
      pagerConfig: {
        enabled: false,
      },
      editConfig: {
        enabled: true,
        mode: 'row',
        trigger: 'click',
        showStatus: false,
        showIcon: false,
        autoClear: true,
      },
    }),
  },
  {
    id: 'editParamTable',
    gridColumns: [
      { type: 'checkbox', title: '', width: 40, align: 'center' },
      {
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'ProcessParamName',
        title: '参数',
        align: 'center',
        width: '140',
      },
      {
        field: 'AD_Process_ID',
        title: 'AD_Process_ID',
        visible: false,
      },
      {
        field: 'AD_Scheduler_ID',
        title: 'AD_Scheduler_ID',
        visible: false,
      },
      {
        field: 'AD_Process_Para_ID',
        title: 'AD_Process_Para_ID',
        visible: false,
      },
      {
        field: 'defaultParamValue',
        title: '默认参数',
        // edit: 'text',
        editRender: {
          name: 'VxeInput',
        },
        align: 'center',
        // width: '120',
      },
      {
        field: 'description',
        title: '描述',
        // edit: 'text',
        editRender: {
          name: 'VxeInput',
        },
        align: 'center',
        // width: '120',
      },
      {
        align: 'center',
        field: 'action',
        slots: { default: 'action' },
        fixed: 'right',
        headerAlign: 'center',
        showOverflow: false,
        title: '操作',
        width: 70,
      },
    ],
    queryUrl: `/schedulerHandleAction/querySchedulerParam.do`,
    gridEvents: {},
    afterFetchFn: (params: any) => {
      const rows = params.rows || [];
      blackList.value = rows.map((item) => item.AD_Process_Para_ID);

      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        AD_Scheduler_ID: serviceData.value.AD_Scheduler_ID || undefined,
      };
    },
  },
);

async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const tableData = ChcGridApi.grid.getTableData().tableData;
    const formData = await baseFormApi.getValues();

    const updated: any = [];
    const created: any = [];
    tableData.forEach((item: any) => {
      if (item.AD_Process_ID) {
        updated.push(item);
      } else {
        created.push(item);
      }
    });
    const lineData = { created, updated, removed: deleteArray.value };
    const weekObj: any = {};
    const weekKeyArr: string[] = [
      'OnMonday',
      'OnTuesday',
      'OnWednesday',
      'OnThursday',
      'OnFriday',
      'OnSaturday',
      'OnSunday',
    ];
    weekKeyArr.forEach((item) => {
      weekObj[item] = formData.weekArr.includes(item) ? 'Y' : 'N';
    });
    const params = {
      processLineData: JSON.stringify(lineData),
      AD_Process_ID: serviceData.value.AD_Process_ID,
      AD_Schedule_ID: serviceData.value.AD_Schedule_ID,
      AD_Scheduler_ID: serviceData.value.AD_Scheduler_ID,
      ...formData,
      ...weekObj,
    };
    const res = await saveScheduler(params);
    if (res && res.success) {
      message.success({
        content: '保存成功',
      });
      modalApi.close();
      emit('close');
    }
  }
}

const selectOpen = ref(false);
const chcSelect = ref();
const handleDropdownVisibleChange = (open: boolean) => {
  selectOpen.value = !!open;
  if (
    chcSelect.value &&
    chcSelect.value.fetchApi &&
    typeof chcSelect.value.fetchApi === 'function'
  ) {
    chcSelect.value.fetchApi();
  }
};

const handleChoose = async (val: any, option: any) => {
  if (ChcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (ChcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    // 验证通过后执行添加逻辑
    blackList.value.push(val);
    await nextTick();
    chcSelect.value.modelValue = undefined; // 清空下拉组件

    const record = {
      ...option,
      AD_Process_Para_ID: option.id,
      ProcessParamName: option.name,
    };
    const { row: newRow } = await ChcGridApi.grid.insertAt(record, -1);
    ChcGridApi.grid.setEditRow(newRow, true);
  }
};

const handleBatchChoose = async (records: any[]) => {
  let newRow = null;
  for (const [i, record__] of records.entries()) {
    const record = {
      ...record__,
      AD_Process_Para_ID: record__.id,
      ProcessParamName: record__.name,
    };
    if (i === 0) {
      const midRow = await ChcGridApi.grid.insertAt(record, -1);
      newRow = midRow.row;
    } else {
      blackList.value.push(record);
      await ChcGridApi.grid.insertAt(record, -1);
    }
  }
  ChcGridApi.grid.setEditRow(newRow, true);
};

const handleBatchAdd = async () => {
  if (ChcGridApi.grid.getInsertRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存行，请保存后再添加！');
  } else if (ChcGridApi.grid.getUpdateRecords().length > 0) {
    await nextTick();
    chcSelect.value.modelValue = undefined;
    message.warn('当前表格存在未保存数据，请保存后再添加！');
  } else {
    batchAddModalApi!
      .setData({
        ...selectParams.value,
        handleBatchChoose,
        blackList: blackList.value,
      })
      .open();
  }
};

const ROWKEYFIELD = 'productCode';
const handleDeleteRow = async (scope: any) => {
  const insertRows = ChcGridApi.grid.getInsertRecords();
  const updateRows = ChcGridApi.grid.getUpdateRecords();
  // 由于删行会造成编辑信息丢失，因此未保存行编辑信息的情况下，不允许删行
  if (updateRows.length > 1) {
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  } else if (
    updateRows.length === 1 &&
    updateRows[0][ROWKEYFIELD] !== scope.row[ROWKEYFIELD]
  ) {
    // 编辑行只有一条，并且不是当前删除行
    return message.warn(
      '不好意思，表格仅支持一次编辑一行数据，由于目前表格存在其他未保存的行数据，请处理完其他行数据后再来处理本行！',
    );
  }
  if (scope.row.AD_Process_ID) {
    // if (scope.row.orderPlanLineId) {
    scope.row.loading = true;
    // 先调接口删行
    scope.row.loading = false;
    ChcGridApi.grid.remove(scope.row);
    deleteArray.value.push(scope.row);
  } else {
    // 此时还没与任何保存数据
  }
  await scope.$grid.clearEdit();

  function handleInsertRows() {
    // 将非当前操作行数据，重新插入表格，并开启新的行编辑
    let newRow: any = null;
    setTimeout(async () => {
      const midRows = insertRows.filter(
        (item: any) => item[ROWKEYFIELD] !== scope.row[ROWKEYFIELD],
      );
      if (midRows.length > 0) {
        for (const [i, midRow_] of midRows.entries()) {
          const midRow = await ChcGridApi.grid.insertAt(midRow_, -1);
          if (i === 0) {
            newRow = midRow.row;
          }
        }
        // 聚焦到新插入的数据继续编辑
        ChcGridApi.grid.setEditRow(newRow, true);
      } else {
        continuEdit(scope.row);
      }
    }, 0);
  }

  if (scope.$grid.isInsertByRow(scope.row)) {
    // 当前删除的是插入的临时行
    scope.$grid.remove(scope.row);
    handleInsertRows();
    blackList.value = blackList.value.filter(
      (item) => item !== scope.row[ROWKEYFIELD],
    );
  } else {
    // 当前删除的不是临时行
    // gridData.value.splice(scope.$rowIndex, 1);
    handleInsertRows();
    blackList.value = blackList.value.filter(
      (item) => item !== scope.row[ROWKEYFIELD],
    );
  }
};

const continuEdit = (row: any) => {
  if (
    ChcGridApi.grid
      .getInsertRecords()
      .some((item: any) => item[ROWKEYFIELD] !== row[ROWKEYFIELD])
  ) {
    ChcGridApi.grid.setEditRow(
      ChcGridApi.grid
        .getInsertRecords()
        .some((item: any) => item[ROWKEYFIELD] !== row[ROWKEYFIELD]),
      true,
    );
  } else if (
    ChcGridApi.grid
      .getUpdateRecords()
      .some((item: any) => item[ROWKEYFIELD] !== row[ROWKEYFIELD])
  ) {
    ChcGridApi.grid.setEditRow(
      ChcGridApi.grid
        .getUpdateRecords()
        .some((item: any) => item[ROWKEYFIELD] !== row[ROWKEYFIELD]),
      true,
    );
  } else {
    return chcSelect.value.focus();
  }
};

const blackList = ref<any[]>([]); // 用于设置下拉不可选的黑名单列表
const deleteArray = ref<any[]>([]);
</script>
<template>
  <Modal class="h-[600px] w-[800px]" :title="title" title-tooltip="">
    <Page content-class="p-[0.5rem]">
      <BatchAddModal />
      <BaseForm />
      <div class="form-title">参数信息</div>
      <ChcGrid class="h-[290px] w-full flex-1 overflow-hidden">
        <template #toolbar-actions>
          <ChcSelect
            :autofocus="true"
            :paginate="true"
            :allow-clear="false"
            ref="chcSelect"
            placeholder="请输入"
            class="mr-[0.5rem] w-[320px]"
            :extra-params="selectParams"
            :black-list="blackList"
            dict-url="/schedulerHandleAction/getProcessParam.do"
            @dropdown-visible-change="handleDropdownVisibleChange"
            api-type="post"
            request-content-type="application/x-www-form-urlencoded"
            :immediate="false"
            :filter-by-front-end="false"
            :show-search="true"
            @change="handleChoose"
            filter-field="AD_Process_Para_ID"
            :handle-params="
              (params: any) => {
                return {
                  ...params,
                  current: undefined,
                  pageNum: params.current,
                  pageSize: params.size,
                  size: undefined,
                };
              }
            "
            label-field="name"
            value-field="id"
            :after-fetch="
              (res: any) => {
                const rows =
                  res.rows?.map((item: any) => {
                    return {
                      ...item,
                      id: String(item.id),
                    };
                  }) || [];
                return { ...res, rows: undefined, records: rows };
              }
            "
            :option-columns="[
              {
                name: 'id',
                header: '参数ID',
                width: 90,
              },
              {
                name: 'name',
                header: '参数',
                width: 210,
              },
            ]"
            data-testid="ChcSelect_productName_editModal"
          />
          <Button
            type="primary"
            @click="handleBatchAdd"
            class="mr-[0.5rem]"
            data-testid="button_BatchAdd_editModal"
          >
            批量添加
          </Button>
          <!-- <Button type="primary" @click="handleDel" class="mr-[0.5rem]">
          删除
        </Button> -->
        </template>
        <template #action="scope">
          <Button
            type="primary"
            danger
            ghost
            @click="handleDeleteRow(scope)"
            :loading="scope.row.loading"
            class="mr-[6px] h-[24px] pb-0 pl-[6px] pr-[6px] pt-0"
            :data-testid="`button_deleteRow_${scope.rowIndex}_editModal`"
          >
            删行
          </Button>
          <!--   v-if="detailInfo?.type === 'edit'" -->
        </template>
      </ChcGrid>
    </Page>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_onSubmit_editModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>

<style lang="less" scoped>
.form-title {
  // margin-left: 20px;
  margin-bottom: 20px;
  padding: 0 10px;
  font-size: 20px;
  font-weight: 500;
}
</style>

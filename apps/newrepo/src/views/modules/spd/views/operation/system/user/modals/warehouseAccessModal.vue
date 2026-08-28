<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Checkbox, message, Switch } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import {
  addUserAllWarehosueAccess,
  addUserWarehosueAccess,
  saveUserWarehosueAccess,
} from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const lotExtraParam = ref<any>({ excludeUserId: undefined });
const title = ref('仓库权限');
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
      lotExtraParam.value.excludeUserId = serviceData.value.AD_User_ID;
      setTimeout(() => {
        ChcGridApi.query();
        baseFormApi.setValues({
          ...serviceData.value,
          defaultDepartmentId: serviceData.value.DefaultDepartmentId,
        });
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
      component: 'Input',
      fieldName: 'RealName',
      label: '用户姓名',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入用户姓名',
          disabled: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'Name',
      label: '登录名称',
      rules: 'required',
      componentProps: () => {
        return {
          placeholder: '请输入登录名称',
          disabled: true,
        };
      },
    },
    {
      component: 'Input',
      fieldName: 'OrgName',
      label: '所属机构',
      componentProps: () => {
        return {
          placeholder: '请输入所属机构',
          disabled: true,
        };
      },
    },

    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: `/baseHandleAction/refList.do?id=1000244`,
          // showSearch: true,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择商品组',
          paginate: false,
          immediate: true,
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      rules: 'required',
      fieldName: 'productControlLevel',
      label: '商品组',
    },
    {
      component: 'ChcSelect',
      componentProps: () => {
        return {
          dictUrl: `/warehouseAction/warehouseList.do`,
          // showSearch: true,
          apiType: 'post',
          requestContentType: 'application/x-www-form-urlencoded',
          placeholder: '请选择待授权仓库',
          triggerFields: ['productControlLevel'],
          paginate: false,
          immediate: true,
          mode: 'multiple',
          extraParams: lotExtraParam.value,
          // extraParams: {
          //   excludeUserId: serviceData.value.AD_User_ID,
          // },
          labelField: 'name',
          valueField: 'id',
          afterFetch(res: any) {
            return { ...res, rows: undefined, records: res.rows };
          },
        };
      },
      dependencies: {
        triggerFields: ['productControlLevel'],
        trigger(values: any) {
          if (
            baseFormApi?.getFieldComponentRef &&
            typeof baseFormApi?.getFieldComponentRef === 'function' &&
            baseFormApi?.getFieldComponentRef('warehouseId') &&
            baseFormApi?.getFieldComponentRef('warehouseId').params
          ) {
            console.warn(values, 3333);

            baseFormApi.getFieldComponentRef(
              'warehouseId',
            ).params.dependencies = {
              productControlLevel: values.productControlLevel,
            };
            baseFormApi?.getFieldComponentRef('warehouseId')?.fetchApi();
            baseFormApi?.setFieldValue('warehouseId', undefined);
          }
        },
      },
      rules: 'required',
      fieldName: 'warehouseId',
      label: '待授权仓库',
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
    }),
  },
  {
    id: 'warehouseAccesTable',
    queryUrl: '/warehouseAction/queryUserWareouseAccess.do',
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
      { field: 'warehouseName', title: '仓库', width: '120', sortable: true },
      {
        field: 'isDefault',
        title: '默认',
        align: 'center',
        minWidth: '100',
        sortable: true,
        slots: { default: 'isDefault' },
      },
      {
        field: 'isReadWrite',
        title: '读写',
        align: 'center',
        minWidth: '100',
        sortable: true,
        slots: {
          default: 'isReadWrite',
          header: 'isReadWriteHeader',
        },
      },
    ],

    gridEvents: {},
    afterFetchFn: (params: any) => {
      const rows = params.rows || [];
      if (rows.length > 0) {
        isReadWriteHeader.value = rows.every((item: any) => {
          return item.isReadWrite === 'Y';
        });
      }
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        userId: serviceData.value.AD_User_ID || undefined,
      };
    },
  },
);

async function onSubmit() {
  const tableData = ChcGridApi.grid.getTableData().tableData;
  if (tableData.length === 0) {
    message.warn('添加仓库！');
    return;
  }
  const lineData = { created: [], updated: tableData, removed: [] };
  const params = {
    userId: serviceData.value.AD_User_ID,
    lineData: JSON.stringify(lineData),
  };
  saveUserWarehosueAccess(params).then((res) => {
    if (res && res.success) {
      message.success({
        content: '保存成功',
      });
      modalApi.close();
      emit('close');
    }
  });
}

const handleDefaultSwitchChange = (row: any, checked: any) => {
  if (checked) {
    const tableData = ChcGridApi.grid.getTableData().tableData;
    const checkedRows = tableData.filter((item: any) => item.isDefault);
    if (checkedRows.length > 0) {
      ChcGridApi.grid.setRow(checkedRows, {
        isDefault: false,
      });
    }
    // setRow
  }
  ChcGridApi.grid.setRow(row, {
    isDefault: checked,
  });
};

const isReadWriteHeaderChange = () => {
  const tableData = ChcGridApi.grid.getTableData().tableData;
  if (tableData.length > 0) {
    ChcGridApi.grid.setRow(tableData, {
      isReadWrite: isReadWriteHeader.value ? 'Y' : 'N',
    });
  }
};

const isReadWriteChange = (row: any, checked: any) => {
  ChcGridApi.grid.setRow(row, {
    isReadWrite: checked,
  });
  const tableData = ChcGridApi.grid.getTableData().tableData;

  isReadWriteHeader.value = tableData.every(
    (item: any) => item.isReadWrite === 'Y',
  );
};

const handleAdd = async () => {
  // ChcGridApi.grid.setCheckboxRow(undefined, false);
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();

    const params = {
      userId: serviceData.value.AD_User_ID,
      warehouseId: formData.warehouseId.join(','),
    };
    const res = await addUserWarehosueAccess(params);
    if (res && res.success) {
      message.success({
        content: '添加成功',
      });
      baseFormApi?.setFieldValue('warehouseId', undefined);
      ChcGridApi.query();
    }
  }
};

const handleAddAll = async () => {
  // ChcGridApi.grid.setCheckboxRow(undefined, true);
  const params = {
    userId: serviceData.value.AD_User_ID,
  };
  const res: any = await addUserAllWarehosueAccess(params);
  if (res && res.success) {
    message.success({
      content: '添加所有成功',
    });
    ChcGridApi.query();
  }
};

const handleDelete = () => {
  const checkedArr = ChcGridApi.grid.getCheckboxRecords();
  if (checkedArr.length > 0) {
    const removed = checkedArr.map((item: any) => ({
      warehouseId: item.warehouseId,
      userId: item.userId,
    }));
    const lineData = { created: [], updated: [], removed };
    const params = {
      userId: serviceData.value.AD_User_ID,
      lineData: JSON.stringify(lineData),
    };
    saveUserWarehosueAccess(params).then((res) => {
      if (res && res.success) {
        message.success({
          content: '删除成功',
        });
        ChcGridApi.query();
      }
    });
  } else {
    message.warning({
      content: '请选择仓库',
    });
  }
};

const isReadWriteHeader = ref(false);
</script>
<template>
  <Modal class="h-[600px] w-[800px]" :title="title" title-tooltip="">
    <Page content-class="p-[0.5rem]">
      <BaseForm />
      <ChcGrid class="h-[290px] w-full flex-1 overflow-hidden">
        <template #toolbar>
          <div class="mb-[20px]">
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleAdd"
              data-testid="button_add_warehouseAccessModal"
            >
              增加
            </Button>
            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleAddAll"
              data-testid="button_add_all_warehouseAccessModal"
            >
              增加全部
            </Button>

            <Button
              type="primary"
              class="mr-[0.5rem]"
              @click="handleDelete"
              data-testid="button_delete_warehouseAccessModal"
            >
              删除
            </Button>
          </div>
        </template>
        <template #isDefault="scope">
          <Switch
            :checked="scope.row.isDefault"
            @change="
              (checked: any) => handleDefaultSwitchChange(scope.row, checked)
            "
            style="width: 50px"
            checked-value="Y"
            checked-children="是"
            un-checked-value="N"
            un-checked-children="否"
            :data-testid="`switch_isDefault_${scope.rowIndex}_warehouseAccessModal`"
          />
        </template>
        <template #isReadWriteHeader>
          读写
          <Checkbox
            v-model:checked="isReadWriteHeader"
            @change="isReadWriteHeaderChange"
            data-testid="switch_isReadWriteHeader_warehouseAccessModal"
          />
        </template>
        <template #isReadWrite="scope">
          <Switch
            :checked="scope.row.isReadWrite"
            checked-value="Y"
            @change="(checked) => isReadWriteChange(scope.row, checked)"
            style="width: 50px"
            checked-children="是"
            un-checked-value="N"
            un-checked-children="否"
            :data-testid="`switch_isReadWrite_${scope.rowIndex}_warehouseAccessModal`"
          />
        </template>
      </ChcGrid>
    </Page>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_warehouseAccessModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>

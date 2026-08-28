<script lang="ts" setup>
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { saveRolePCLAccess } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('商品组访问权限');
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
      setTimeout(() => {
        ChcGridApi.formApi.setValues(serviceData.value);
        ChcGridApi.query();
      }, 100);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      showCollapseButton: false,
      showDefaultActions: false,
      wrapperClass: 'grid-cols-1',
      // formItemClass: 'col-start-12'
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
    id: 'pclAccesTable',
    queryUrl: '/productControlLevelAction/queryRolePCLAccess.do',
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
      { field: 'name', title: '商品组', sortable: true },
    ],
    formSchema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '角色名称',
        rules: 'required',
        componentProps: () => {
          return {
            placeholder: '请输入角色名称',
            disabled: true,
          };
        },
      },
    ],
    gridEvents: {},
    afterFetchFn: (params: any) => {
      const rows = params.rows || [];
      if (rows.length > 0) {
        const selectRow = rows.filter((item: any) => item.isActive === 'Y');
        setTimeout(() => {
          ChcGridApi.grid.setCheckboxRow(selectRow, true);
          // if (selectRow.length === rows.length) {
          //   ChcGridApi.grid.setCheckboxRow(rows, true);
          // }
        }, 200);
      }
      return {
        ...params,
        records: params.rows || [],
      };
    },
    beforeFetchFn: (params) => {
      return {
        ...params,
        id: serviceData.value.id || undefined,
      };
    },
  },
);

async function onSubmit() {
  const checkboxList = ChcGridApi.grid.getCheckboxRecords();

  const params = {
    id: serviceData.value.id,
    pcls: checkboxList.map((item: any) => item.value),
  };
  saveRolePCLAccess(params).then((res) => {
    if (res && res.success) {
      message.success({
        content: '保存成功',
      });
      modalApi.close();
      emit('close');
    }
  });
}
</script>
<template>
  <Modal class="h-[500px] w-[450px]" :title="title" title-tooltip="">
    <Page content-class="p-[0.5rem]">
      <ChcGrid class="h-[330px] w-full flex-1 overflow-hidden" />
    </Page>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_pclAccessModal"
      >
        提交
      </Button>
    </template>
  </Modal>
</template>

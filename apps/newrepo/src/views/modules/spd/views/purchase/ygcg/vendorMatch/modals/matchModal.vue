<script lang="ts" setup>
import { ref, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';
import { isEmpty } from '@vben/utils';

import { message } from 'ant-design-vue';

import { requestFormClient } from '#/api/request';
import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

const route = useRoute();
const urlParams = (route.meta?.urlParams as Record<string, any>) || {}; // 路由给过来的参数
console.warn('urlParams', urlParams);

const modalData = ref<Record<string, any>>({});
const modalTitle = ref('选择');

const [ChcGrid, ChcGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      commonConfig: {
        // labelClass: 'w-[90px]',
      },
      showCollapseButton: false,
      resetButtonOptions: {
        show: false,
      },
      wrapperClass: 'grid-cols-2',
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      checkboxConfig: {
        highlight: false,
      },
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
      // cellStyle: ({ row }: { row: any }) => {
      //   return {};
      // },
    }),
  },
  {
    id: 'vendormacth_son',
    // api地址
    queryUrl: '/ygcgProductAction/queryYGCGVendor.do',
    gridColumns: [
      {
        type: 'checkbox',
        width: 50,
        align: 'center',
        visible: false,
      },
      {
        type: 'seq',
        width: 50,
        align: 'center',
        title: '序号',
      },
      {
        field: 'companyId',
        title: '阳光编码',
        width: '200',
        sortable: true,
      },
      {
        field: 'companyName',
        title: '阳光名称',
        // width: '100',
        sortable: true,
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '供应商',
        formItemClass: 'col-span-1',
        componentProps: () => {
          return {
            placeholder: '请输入供应商名称',
            allowClear: true,
          };
        },
      },
    ],
    gridEvents: {},
    showCustomBtn: true,
    showZoomBtn: true,
    beforeFetchFn: (params) => {
      if (!modalData.value?.orgId) {
        message.warning('请先在主页面选择医院');
        return;
      }
      return {
        ...params,
        orgId: modalData.value?.orgId || params.orgId,
      };
    },
    afterFetchFn: (params) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
const isSubmiting = ref(false);
const [ModalFirst, modalApi] = useVbenModal({
  onCancel() {
    modalApi.close();
  },

  showConfirmButton: true,
  confirmDisabled: false,
  showCancelButton: false,
  cancelText: '取消',
  confirmText: '匹配',
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = modalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
      modalTitle.value = modalData.value.modalTitle || modalTitle.value;
      setTimeout(() => {
        ChcGridApi.formApi.setValues({
          name: modalData.value?.row?.bpartnerName,
        });
        if (!modalData.value?.orgId) {
          message.warning('请先在主页面选择医院');
          return;
        }
        ChcGridApi.query({
          name: modalData.value?.row?.bpartnerName,
          orgId: modalData.value?.orgId,
        });
      }, 200);
    }
  },
  async onConfirm() {
    if (isSubmiting.value) {
      message.warning('请勿重复提交！');
      return;
    }
    const row = ChcGridApi.grid.getRadioRecord(true);
    const rawRow = toRaw(row);
    if (isEmpty(rawRow)) {
      message.warning('请选择一条记录');
      return;
    }

    const params = {
      bpartnerId: modalData.value?.row?.bpartnerId,
      ypcompanyId: rawRow.ypcompanyId,
      orgId: modalData.value?.orgId,
    };
    isSubmiting.value = true;
    try {
      await requestFormClient.post(
        '/ygcgProductAction/macthcompany.do',
        params,
      );
      message.success('匹配成功');
      modalApi.close();
      modalData.value?.callback();
    } catch (error) {
      console.error(error);
    } finally {
      isSubmiting.value = false;
    }
  },
});
</script>
<template>
  <ModalFirst :title="modalTitle" class="h-[500px] w-[800px]">
    <ChcGrid />
  </ModalFirst>
</template>

<style scoped lang="less"></style>

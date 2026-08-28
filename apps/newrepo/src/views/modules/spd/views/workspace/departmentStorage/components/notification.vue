<script setup lang="ts">
import { h, onMounted, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';

import { useVbenModal } from '@vben/common-ui';

import { Card, CardContent, CardHeader, CardTitle } from '@vben-core/shadcn-ui';

import { Button as AntButton } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

interface Props {
  title: string;
  action: string;
}

defineOptions({
  name: 'CustomNotification',
  inheritAttrs: false,
});

withDefaults(defineProps<Props>(), {});

const router = useRouter();

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
        autoLoad: true,
      },
      pagerConfig: {
        enabled: false,
      },
      minHeight: '100%',
    }),
  },
  {
    id: 'notification',
    // api地址
    queryUrl: '/portalAction/queryNotice.do',
    gridColumns: [
      {
        field: 'index',
        title: '序号',
        width: 50,
        align: 'center',
        formatter(scope: any) {
          return scope.rowIndex + 1;
        },
      },
      {
        field: 'title',
        title: '标题',
        sortable: true,

        slots: {
          default: (scope) => {
            return h(
              AntButton,
              {
                size: 'small',
                type: 'link',
                'data-testid': `button_detail_${scope.rowIndex}`,
                onClick: () => {
                  console.warn('点击单元格 scope', scope);
                  noticeModalApi
                    .setData({
                      row: toRaw(scope.row),
                    })
                    .open();
                },
              },
              {
                default: () => scope.row.title,
              },
            );
          },
        },
      },
      { field: 'date', title: '发布时间', width: 150, sortable: true },
      { field: 'createName', title: '发布人', width: 100, sortable: true },
    ],
    // 表单配置
    formSchema: [],
    gridEvents: {},
    beforeFetchFn: (params: any) => {
      return params;
    },
    afterFetchFn: (params: any) => {
      return {
        ...params,
        records: params.rows,
      };
    },
  },
);
onMounted(() => {
  ChcGridApi.query();
});
const modalData = ref<Record<string, any>>({});
const [NoticeModal, noticeModalApi] = useVbenModal({
  onCancel() {
    noticeModalApi.close();
  },
  showConfirmButton: false,
  confirmDisabled: false,
  showCancelButton: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      modalData.value = {};
      modalData.value = noticeModalApi.getData<Record<string, any>>();
      console.warn('onOpenChange modalData', modalData.value);
    }
  },
});

const toNotification = () => {
  router.push({
    path: '/operation/system/notice',
  });
};
</script>

<template>
  <div class="box-border h-full">
    <NoticeModal title="通知公告" class="h-[800px] w-[1200px]">
      <h2 class="notice-title" v-html="modalData?.row?.title"></h2>
      <h5 class="notice-date" v-html="modalData?.row?.date"></h5>
      <div class="notice-border"></div>
      <div class="notice-content" v-html="modalData?.row?.content"></div>
    </NoticeModal>
    <Card :class="$attrs.class || 'box-border flex h-full flex-col'">
      <CardHeader class="py-4">
        <div class="flex w-full items-center justify-between">
          <CardTitle class="text-xl">{{ title }}</CardTitle>
          <AntButton type="link" @click="toNotification"> 更多通知 </AntButton>
        </div>
      </CardHeader>
      <CardContent class="box-border flex flex-1 flex-wrap p-5 pt-0">
        <ChcGrid class="box-border h-full w-full" />
      </CardContent>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getReportAuthTree,
  queryRoleReports,
  saveRoleReports,
} from '../api.ts';

defineOptions({
  name: 'PermissionRepGridModal',
});

const props = defineProps<{
  afterSubmit?: () => Promise<void>;
}>();

const param = ref<any>();

// AI-GENERATED-BEGIN
// @date 2026-06-30
// @prompt 改造报表权限弹窗适配平铺数据结构
// @description 将树形菜单权限改为平铺报表列表，只保留报表名称列，支持复选框控制和权限回显
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    checkboxConfig: {
      highlight: true,
    },
    size: 'small',
    columns: [
      {
        type: 'checkbox',
        width: 30,
        align: 'center',
      },
      {
        title: '报表名称',
        field: 'reportName',
        minWidth: 200,
        showOverflow: 'tooltip',
      },
      {
        title: '报表文件',
        field: 'reportPath',
        minWidth: 250,
        showOverflow: 'tooltip',
      },
    ],
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      enabled: false,
    },
    toolbarConfig: {
      refresh: false,
      custom: false,
    },
    rowConfig: {
      isHover: true,
      isCurrent: false,
      keyField: 'reportPath',
    },
    scrollY: {
      enabled: true,
      gt: 0,
    },
    showOverflow: false,
  },
});
// AI-GENERATED-END

const [Modal, modalApi] = useVbenModal({
  class: 'w-[800px]',
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    try {
      // 获取选中的行
      const checkedRows = gridApi.grid.getCheckboxRecords();

      // 提取选中的报表路径列表
      const selectedReportPaths = checkedRows.map((row: any) => row.reportPath);

      // 调用提交方法
      await param.value?.submit({
        reportPaths: selectedReportPaths,
      });

      message.success('操作成功');
      modalApi.close();
      await props.afterSubmit?.();
    } catch (error) {
      console.error('保存报表权限失败:', error);
      message.error('保存失败');
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      param.value = modalApi.getData() as any;

      try {
        // 并行加载报表列表和角色已有权限
        const [reportListRes, roleReportsRes] = await Promise.all([
          getReportAuthTree(param.value.data?.id),
          queryRoleReports({ roleId: param.value.data?.id }),
        ]);

        // console.log(55555555555555, reportListRes);
        // console.log(66666666666, roleReportsRes);

        // 报表列表是平铺数组（后端返回 { total, rows } 结构）
        const reportList = Array.isArray(reportListRes)
          ? reportListRes
          : reportListRes?.rows || [];

        // 角色已有权限（后端返回的可能也是 { total, rows } 或数组结构）
        const authorizedRows = Array.isArray(roleReportsRes)
          ? roleReportsRes
          : roleReportsRes?.rows || [];
        // 提取已授权报表的 reportPath 列表
        const authorizedPaths = authorizedRows.map(
          (item: any) => item.reportPath,
        );

        // 加载数据到表格
        await gridApi.grid.reloadData(reportList);

        // 回显已有权限：设置已授权的行选中
        const rowsToCheck = reportList.filter((row: any) =>
          authorizedPaths.includes(row.reportPath),
        );

        if (rowsToCheck.length > 0) {
          gridApi.grid.setCheckboxRow(rowsToCheck, true);
        }
      } catch (error) {
        console.error('加载报表权限失败:', error);
        message.error('加载报表列表失败');
      }
    }
  },
});

defineExpose({ modalApi, gridApi });
</script>

<template>
  <!-- AI-GENERATED-BEGIN -->
  <!-- @date 2026-06-30 -->
  <!-- @prompt 修改弹窗布局和标题 -->
  <!-- @description 修改弹窗标题为报表权限，设置固定宽高 -->
  <Modal title="报表权限" class="h-[500px] w-[50%]">
    <Grid />
  </Modal>
  <!-- AI-GENERATED-END -->
</template>

<script setup lang="ts">
import { inject, onMounted } from 'vue';

import { AddActionIcon, EditActionIcon, SvgDeleteIcon } from '@vben/chc-icons';
import { useVbenModal } from '@vben/common-ui';

import { Button, message, Modal, Switch } from 'ant-design-vue';

import {
  formDefaultOptions,
  gridDefaultOptions,
  useSpdGrid,
} from '#/components/spd';
import { deepMerge } from '#/utils/util';

import { delSectionLocator, saveSectionLocator } from '../../api';
import { TREE_CONTEXT_KEY } from '../../index';
import sectionLocatorFormCom from '../../modals/sectionlocatorFormModal.vue';

const treeContext = inject(TREE_CONTEXT_KEY);
// 表格配置
const [SectionLocatorGrid, SectionLocatorGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
      // 不显示展开
      showCollapseButton: false,
    }),
    gridOptions: deepMerge(gridDefaultOptions, {
      stripe: false,
      radioConfig: {
        trigger: 'row',
        highlight: true,
      },
      proxyConfig: {
        autoLoad: false,
      },
    }),
  },
  {
    id: 'locatorGrid',
    // api地址
    queryUrl: '/warehouseAction/queryLocator.do',
    gridColumns: [
      {
        type: 'radio',
        title: '',
        width: 50,
        align: 'center',
        visible: false,
      },
      { title: '序号', type: 'seq', width: 50, align: 'center' },
      {
        field: 'name',
        title: '货位名称',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'value',
        title: '货位搜索码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'sectionName',
        title: '库区名称',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'zoneName',
        title: '库房名称',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库名称',
        minWidth: '150',
        sortable: true,
      },
      {
        field: 'locatorUseTypeName',
        title: '货位用途',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'locatorTypeName',
        title: '货位类型',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'locatorUseTypeName',
        title: '货位型号',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'x',
        title: '巷道',
        minWidth: '70',
        align: 'right',
        sortable: true,
      },
      {
        field: 'y',
        title: '列',
        minWidth: '70',
        align: 'right',
        sortable: true,
      },
      {
        field: 'z',
        title: '层',
        minWidth: '70',
        align: 'right',
        sortable: true,
      },
      {
        field: 'h',
        title: '排',
        minWidth: '70',
        align: 'right',
        sortable: true,
      },
      {
        field: 'isDefault',
        title: '默认',
        slots: { default: 'isDefault' },
        minWidth: '100',
        sortable: true,
        align: 'left',
      },
      {
        field: 'isScatter',
        title: '散件货位',
        slots: { default: 'isScatter' },
        minWidth: '100',
        sortable: true,
        align: 'left',
      },
      {
        field: 'tagIP',
        title: '控制器IP',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'tagAisleIP',
        title: '控制器巷道IP',
        minWidth: '120',
        sortable: true,
      },
      {
        field: 'tagNO',
        title: '标签编码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'tagFlag',
        title: '巷道编码',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'isActive',
        title: '活跃的',
        slots: { default: 'isActive' },
        minWidth: '80',
        sortable: true,
        align: 'left',
      },
    ],
    // 表单配置
    formSchema: [
      {
        component: 'Input',
        fieldName: 'name',
        label: '货位',
        labelClass: 'w-[fit-content]',
        formItemClass: 'w-[300px]',
        componentProps: () => {
          return {
            placeholder: '请输入名称/编码/搜索码',
            defaultValue: '',
          };
        },
      },
    ],
    // tableSearchExtraParams: {
    //   zoneId: treeContext?.selectedNode.value?.id,
    // },
    beforeFetchFn: (params: any) => {
      const sectionId = treeContext?.selectedNode.value?.id;
      return {
        sectionId,
        ...params,
      };
    },
  },
);

// 弹框配置
const [SectionLocatorFormModal, SectionLocatorFormModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: sectionLocatorFormCom,
  draggable: true,
});

// 新增和修改
function handleAddOrEdit(type: 'add' | 'edit') {
  console.warn('handleAddOrEdit', type);
  const text = treeContext?.selectedNode.value?.text || '';
  const sectionId = treeContext?.selectedNode.value?.id;
  if (type === 'add') {
    SectionLocatorFormModalApi.setData({
      title: `添加货位${text}`,
      form: {
        sectionId,
        isDefault: 'N',
        isScatter: 'N',
        isActive: 'Y',
      },
      submit: async (params: any) => {
        console.warn('新增库区货位params===>', params);
        const res = await saveSectionLocator({
          sectionId,
          locatorId: undefined,
          ...params,
        });
        // 刷新表格数据
        await SectionLocatorGridApi.query();
        // 注意：这里只刷新当前仓库下的子节点，而不是整个树
        await treeContext?.refreshTree?.();
        return res;
      },
    }).open();
  } else if (type === 'edit') {
    const selectedRow: any = SectionLocatorGridApi.grid.getRadioRecord();
    console.warn('selectedRow===>', selectedRow);
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }
    const {
      name,
      value,
      locatorUseType,
      locatorType,
      x,
      y,
      z,
      h,
      tagIP,
      tagNO,
      tagAisleIP,
      tagFlag,
      isDefault,
      isScatter,
      isActive,
    } = selectedRow;
    SectionLocatorFormModalApi.setData({
      title: `修改库区${text}`,
      form: {
        name,
        value,
        locatorUseType,
        locatorType,
        x,
        y,
        z,
        h,
        tagIP,
        tagNO,
        tagAisleIP,
        tagFlag,
        isDefault,
        isScatter,
        isActive,
      },
      submit: async (params: any) => {
        console.warn('修改库区货位params===>', params);
        const res = await saveSectionLocator({
          sectionId,
          locatorId: selectedRow.locatorId,
          ...params,
        });
        await SectionLocatorGridApi.query();
        await treeContext?.refreshTree?.();
        return res;
      },
    }).open();
  }
}

// 删除
function handleDel() {
  const selectedRow = SectionLocatorGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }
  const params = {
    locatorId: selectedRow.locatorId,
  };
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await delSectionLocator(params);
        message.success('删除成功');
        await SectionLocatorGridApi.query();
        await treeContext?.refreshTree?.();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

onMounted(() => {
  console.warn('treeContext', treeContext);
  SectionLocatorGridApi.query();
});
</script>

<template>
  <div class="h-full">
    <SectionLocatorFormModal />
    <SectionLocatorGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddOrEdit('add')"
          data-testid="button_add_sectionlocator"
        >
          新增
          <template #icon>
            <AddActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddOrEdit('edit')"
          data-testid="button_edit_sectionlocator"
        >
          修改
          <template #icon>
            <EditActionIcon />
          </template>
        </Button>
        <Button
          type="primary"
          danger
          @click="handleDel"
          data-testid="button_delete_sectionlocator"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <template #isDefault="scope">
        <Switch
          :checked="scope.row.isDefault"
          checked-value="Y"
          checked-children="是"
          un-checked-value="N"
          un-checked-children="否"
          disabled
          :data-testid="`switch_isDefault_${scope.rowIndex}_sectionlocator`"
        />
      </template>
      <template #isScatter="scope">
        <Switch
          :checked="scope.row.isScatter"
          checked-value="Y"
          checked-children="是"
          un-checked-value="N"
          un-checked-children="否"
          disabled
          :data-testid="`switch_isScatter_${scope.rowIndex}_sectionlocator`"
        />
      </template>
      <template #isActive="scope">
        <Switch
          :checked="scope.row.isActive"
          checked-value="Y"
          checked-children="是"
          un-checked-value="N"
          un-checked-children="否"
          disabled
          :data-testid="`switch_isActive_${scope.rowIndex}_sectionlocator`"
        />
      </template>
    </SectionLocatorGrid>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>

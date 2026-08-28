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

import { delZoneSection, saveZoneSection } from '../../api';
import { TREE_CONTEXT_KEY } from '../../index';
import zoneSectionFormCom from '../../modals/zoneSectionFormModal.vue';

const treeContext = inject(TREE_CONTEXT_KEY);
// 表格配置
const [ZoneSectionGrid, ZoneSectionGridApi] = useSpdGrid(
  {
    formOptions: deepMerge(formDefaultOptions, {
      compact: true,
      layout: 'horizontal',
      submitButtonOptions: {
        content: '查询',
      },
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
    id: 'zoneSectionGrid',
    // api地址
    queryUrl: '/warehouseAction/querySection.do',
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
        title: '库区名称',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'value',
        title: '库区搜索码',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'warehouseName',
        title: '仓库名称',
        minWidth: '200',
        sortable: true,
      },
      {
        field: 'zoneName',
        title: '库区名称',
        minWidth: '110',
        sortable: true,
      },
      {
        field: 'managerName',
        title: '责任人',
        minWidth: '100',
        sortable: true,
      },
      {
        field: 'isSmart',
        title: '是否智能库区',
        slots: { default: 'isSmart' },
        minWidth: '180',
        sortable: true,
        align: 'left',
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
    formSchema: [],
    // tableSearchExtraParams: {
    //   zoneId: treeContext?.selectedNode.value?.id,
    // },
    beforeFetchFn: (params: any) => {
      const zoneId = treeContext?.selectedNode.value?.id;
      return {
        zoneId,
        ...params,
      };
    },
  },
);

// 弹框配置
const [ZoneSectionFormModal, ZoneSectionFormModalApi] = useVbenModal({
  class: 'w-[800px]',
  closable: true,
  // 连接抽离的组件
  connectedComponent: zoneSectionFormCom,
  draggable: true,
});

// 新增和修改
function handleAddOrEdit(type: 'add' | 'edit') {
  console.warn('handleAddOrEdit', type);
  const text = treeContext?.selectedNode.value?.text || '';
  if (type === 'add') {
    ZoneSectionFormModalApi.setData({
      title: `添加库区${text}`,
      form: {
        sectionId: undefined,
        name: undefined,
        value: undefined,
        isSmart: 'N',
        isActive: 'Y',
      },
      submit: (params: {
        isActive: 'N' | 'Y';
        isSmart: 'N' | 'Y';
        managerId: string;
        name: string;
        value: string;
      }) => {
        console.warn('新增库房库区params===>', params);
        saveZoneSection({
          zoneId: treeContext?.selectedNode.value?.id as string,
          sectionId: undefined,
          ...params,
        }).then(async () => {
          // 刷新表格数据
          await ZoneSectionGridApi.query();
          // 注意：这里只刷新当前仓库下的子节点，而不是整个树
          await treeContext?.refreshTree?.();
        });
      },
    }).open();
  } else if (type === 'edit') {
    const selectedRow: any = ZoneSectionGridApi.grid.getRadioRecord();
    console.warn('selectedRow===>', selectedRow);
    if (!selectedRow) {
      message.error('请选择一条记录！');
      return;
    }
    const { name, value, zoneId, isActive, sectionId } = selectedRow;
    ZoneSectionFormModalApi.setData({
      title: `修改库区${text}`,
      form: {
        zoneId,
        name,
        value,
        isActive,
      },
      submit: (params: any) => {
        console.warn('修改库房params===>', params);
        saveZoneSection({
          zoneId: treeContext?.selectedNode.value?.id as string,
          sectionId,
          ...params,
        }).then(async () => {
          await ZoneSectionGridApi.query();
          await treeContext?.refreshTree?.();
        });
      },
    }).open();
  }
}

// 删除
function handleDel() {
  const selectedRow = ZoneSectionGridApi.grid.getRadioRecord();
  if (!selectedRow) {
    message.error('请选择一条记录！');
    return;
  }
  const params = {
    sectionId: selectedRow.sectionId,
  };
  Modal.confirm({
    title: '提示',
    content: `确认删除？`,
    onOk: async () => {
      try {
        await delZoneSection(params);
        message.success('删除成功');
        await ZoneSectionGridApi.query();
        await treeContext?.refreshTree?.();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

onMounted(() => {
  console.warn('treeContext', treeContext);
  ZoneSectionGridApi.query();
});
</script>

<template>
  <div class="h-full">
    <ZoneSectionFormModal />
    <ZoneSectionGrid>
      <template #toolbar-actions>
        <Button
          type="primary"
          class="mr-[0.5rem]"
          @click="handleAddOrEdit('add')"
          data-testid="button_add_zoneSection"
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
          data-testid="button_edit_zoneSection"
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
          data-testid="button_delete_zoneSection"
        >
          删除
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </Button>
      </template>
      <template #isSmart="scope">
        <Switch
          :checked="scope.row.isSmart"
          checked-value="Y"
          checked-children="是"
          un-checked-value="N"
          un-checked-children="否"
          disabled
          :data-testid="`switch_isReadWrite_${scope.rowIndex}_zoneSection`"
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
          :data-testid="`switch_isActive_${scope.rowIndex}_zoneSection`"
        />
      </template>
    </ZoneSectionGrid>
  </div>
</template>

<style scoped lang="scss">
::v-deep(.ant-btn > svg) {
  margin-right: -2px;
  margin-bottom: 3px;
  margin-left: 2px;
}
</style>

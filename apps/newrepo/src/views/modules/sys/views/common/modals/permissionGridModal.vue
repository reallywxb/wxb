<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Checkbox, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMenuAuthTree } from '#/views/modules/sys/views/role/api/role.ts';

defineOptions({
  name: 'PermissionGridModal',
});

const props = defineProps<{
  afterSubmit?: () => void;
}>();

interface Param {
  data: any;
  submit: (params: Record<number | string, any>) => Promise<void>;
  title: string;
}

export interface Permission {
  checked: boolean;
  id: number | string;
  label: string;
}

export interface MenuPermissionOption {
  id: number | string;
  options: Permission[];
}

/**
 * 权限列设置是否全选
 * @param record 行记录
 * @param checked 是否选中
 */
function setPermissionsChecked(record: MenuPermissionOption, checked: boolean) {
  if (record?.options?.length > 0) {
    // 全部设置为选中
    record.options.forEach((permission) => {
      permission.checked = checked;
    });
  }
}

/**
 * 设置当前行 & 所有子节点选中状态
 * @param record 行
 * @param checked 是否选中
 */
function rowAndChildrenChecked(record: any, checked: boolean) {
  // 当前行选中
  setPermissionsChecked(record, checked);
  // 所有子节点选中
  record?.children?.forEach?.((permission: MenuPermissionOption) => {
    rowAndChildrenChecked(permission, checked);
  });
}

const param = ref<Param>();

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    checkboxConfig: {
      // checkbox显示的字段
      labelField: 'label',
    },
    size: 'small',
    columns: [
      {
        type: 'checkbox',
        title: '菜单名称',
        field: 'label',
        treeNode: true,
        headerAlign: 'left',
        align: 'left',
        minWidth: 180,
      },
      {
        title: '权限标识',
        field: 'permissions',
        minWidth: 180,
        slots: {
          default: 'permissions',
        },
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
      isHover: false,
      isCurrent: false,
      keyField: 'id',
    },
    /**
     * 开启虚拟滚动
     * 数据量小可以选择关闭
     * 如果遇到样式问题(空白、错位 滚动等)可以选择关闭虚拟滚动
     */
    scrollY: {
      enabled: true,
      gt: 0,
    },
    treeConfig: {
      parentField: 'parentId',
      rowField: 'id',
      transform: false,
    },
    // 溢出换行显示
    showOverflow: false,
  },
  gridEvents: {
    // 勾选事件
    checkboxChange: (params) => {
      // 选中还是取消选中
      const checked = params.checked;
      // 行
      const record = params.row;
      // 节点关联
      // 设置所有子节点选中状态
      rowAndChildrenChecked(record, checked);
      // updateCheckedNumber();
    },
    // 全选事件
    checkboxAll: (params) => {
      const records = params.$grid.getData();
      records.forEach((item) => {
        rowAndChildrenChecked(item, params.checked);
      });
      // updateCheckedNumber();
    },
  },
});

function x(e: any[]) {
  const a = [] as any[];

  e.forEach((r) => {
    // 如果当前节点有选中的权限选项，则将该节点加入结果数组
    if (r.options && r.options.some((o) => o.checked)) {
      a.push(r);
    }
    // 如果当前节点有子节点，则递归处理子节点并将结果合并到数组中
    if (r.children) {
      a.push(...x(r.children));
    }
  });
  return a;
}

const getTreeLeafRow = (folder: Array<any>) =>
  folder?.reduce((acc, { id, options, leaf, children }: any) => {
    acc.push({
      id,
      options,
    });

    if (!leaf) {
      acc.push(...getTreeLeafRow(children));
    }

    return acc;
  }, [] as any[]);

const [Modal, modalApi] = useVbenModal({
  class: 'w-[800px]',
  onCancel() {
    modalApi.close();
  },
  async onConfirm() {
    try {
      await param.value?.submit(getTreeLeafRow(gridApi.grid.getData()));

      message.success('操作成功');

      modalApi.close();
      props.afterSubmit?.();
    } catch (error) {
      console.error(error);
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      param.value = modalApi.getData() as Param;

      getMenuAuthTree(param.value.data?.id).then(async (data) => {
        await gridApi.grid.reloadData(data.children);

        gridApi.grid.setCheckboxRow(x(data.children), true);

        // gridApi.grid.loadData([]);
      });
    }
  },
});

function handlePermissionChange(row: any) {
  // 节点关联
  // if (association.value) {
  const checkedPermissions = row.options.filter(
    (item: any) => item.checked === true,
  );
  // 有一条选中 则整个行选中
  if (checkedPermissions.length > 0) {
    gridApi.grid.setCheckboxRow(row, true);
  }
  // 无任何选中 则整个行不选中
  if (checkedPermissions.length === 0) {
    gridApi.grid.setCheckboxRow(row, false);
  }
  // }
  // 节点独立 不处理
  // updateCheckedNumber();
}

defineExpose({ modalApi, gridApi });
</script>
<template>
  <Modal title="权限设置" class="h-[500px] w-[50%]">
    <Grid>
      <template #permissions="{ row }">
        <div class="flex flex-wrap gap-x-3 gap-y-1">
          <Checkbox
            v-for="permission in row.options"
            :key="permission.id"
            v-model:checked="permission.checked"
            @change="() => handlePermissionChange(row)"
          >
            {{ permission.label }}
          </Checkbox>
        </div>
      </template>
    </Grid>
  </Modal>
</template>

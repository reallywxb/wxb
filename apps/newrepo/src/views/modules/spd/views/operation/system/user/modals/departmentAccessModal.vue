<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Card, CardContent, CardHeader, CardTitle } from '@vben-core/shadcn-ui';

import { Button, message, Tree } from 'ant-design-vue';

import { queryDepTreeWithUserPower, saveBatchDepUserAcess } from '../api';

const emit = defineEmits(['close']);
const serviceData = ref<any>({});
const title = ref('科室病区权限');
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
      getTreeData();
      setTimeout(() => {
        // ChcGridApi.query();
        // baseFormApi.setValues({
        //   ...serviceData.value,
        //   defaultDepartmentId: serviceData.value.DefaultDepartmentId,
        // });
      }, 100);
    }
  },
  onOpened() {
    // message.info('onOpened：打开动画结束');
  },
});
const treeData: any = ref([]);

const expandedKeys: any = ref([]);
const checkKeys: any = ref([]);
const oldCheckKeys: any = ref([]);
const getTreeData = async () => {
  const res = await queryDepTreeWithUserPower({
    userId: serviceData.value.AD_User_ID,
  });
  const data = [res.rows];
  iterateData(data, 1);
  // return res.data;
  treeData.value = data;
};

// 傻逼数据，父节点id和子节点id一样，让我不得不重新命名一个变量
const iterateData = (data: any, level: number = 0) => {
  if (Array.isArray(data)) {
    data.forEach((item: any) => {
      item.level = level;
      item.levelId = `${level}_${item.id}`;
      if (item.children && item.children.length > 0) {
        expandedKeys.value.push(item.levelId);
      } else if (item.checked) {
        checkKeys.value.push(item.levelId);
        oldCheckKeys.value.push(item.levelId);
      }
      // 递归调用时传入下一层级（level + 1）
      iterateData(item.children, level + 1);
    });
  }
};

async function onSubmit() {
  const added = checkKeys.value.filter((item: any) => {
    return (
      !oldCheckKeys.value.includes(item) && !expandedKeys.value.includes(item)
    );
  });
  const removed = oldCheckKeys.value.filter((item: any) => {
    return (
      !checkKeys.value.includes(item) && !expandedKeys.value.includes(item)
    );
  });

  const departmentUserAccess: any = [];
  added.forEach((item: any) => {
    const [, id] = item.split('_');
    departmentUserAccess.push({
      userId: serviceData.value.AD_User_ID,
      departmentId: id,
      isChecked: true,
    });
  });
  removed.forEach((item: any) => {
    const [, id] = item.split('_');
    departmentUserAccess.push({
      userId: serviceData.value.AD_User_ID,
      departmentId: id,
      isChecked: false,
    });
  });
  const params = {
    departmentUserAccess: JSON.stringify(departmentUserAccess),
  };
  saveBatchDepUserAcess(params).then((res) => {
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
  <Modal
    class="h-[600px] w-[700px]"
    :title="title"
    title-tooltip="权限：将拥有下级的"
  >
    <div class="note-box">
      科室病区权限：将拥有下级的 科室病区前后加上
      <span style="font-weight: bold; color: red">#</span>
      符号，并且跟下级放在同一个层级，目的可以对父级
      科室病区进行单独授权，避免因为勾选导致的下级全选和全不选。
    </div>
    <!-- <div>
      <div>

      </div>
    </div> -->
    <Card>
      <CardHeader>
        <CardTitle> 科室病区权限 </CardTitle>
      </CardHeader>
      <CardContent>
        <Tree
          class="department-tree"
          draggable
          v-model:checked-keys="checkKeys"
          v-model:expanded-keys="expandedKeys"
          checkable
          :tree-data="treeData"
          :field-names="{
            children: 'children',
            title: 'text',
            key: 'levelId',
          }"
          data-testid="tree_department_department_access_modal"
        />
      </CardContent>
    </Card>
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_save_department_access_modal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>

<style lang="less" scoped>
.note-box {
  background-color: #f2f2f2;
  padding: 10px;
  border-left: 4px solid #006be6;
}

.ant-tree.department-tree {
  .ant-tree-treenode {
    align-items: center;
    width: 100%;
    padding: 2px;

    .ant-tree-switcher {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ant-tree-checkbox {
      margin-block-start: 0;
    }

    .ant-tree-node-content-wrapper {
      display: inline-block;
      width: 100%;
      height: 24px;
      line-height: 24px;
    }
    //&.ant-tree-treenode-selected {
    //  .ant-tree-node-content-wrapper {
    //
    //
    //    flex: 1;
    //    height: 24px;
    //    line-height: 24px;
    //  }
    //}
  }
}
</style>

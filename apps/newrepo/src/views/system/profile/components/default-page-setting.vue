<script setup lang="ts">
import type { Recordable } from '@vben/types';

import { nextTick, onMounted, ref } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getAllMenusApi } from '#/api';
import { saveDefaultPage } from '#/api/system/profile';
import { useAuthStore } from '#/store';

const props = defineProps<{ profile: UserInfoExt }>();
const saving = ref(false);
const authStore = useAuthStore();
const [DefaultPageForm, formApi] = useVbenForm({
  actionWrapperClass: 'text-left ml-[68px] mb-[16px]',
  commonConfig: {
    labelWidth: 80,
  },
  handleSubmit,
  resetButtonOptions: {
    show: false,
  },
  schema: [
    {
      component: 'ApiTreeSelect',
      componentProps: () => {
        return {
          placeholder: '请选择默认页面',
          api: () => getAllMenusApi(),
          // filterTreeNode(input: string, node: Recordable<any>) {
          //   if (!input || input.length === 0) {
          //     return true;
          //   }
          //   const title: string = node.label ?? '';
          //   if (!title) return false;
          //   return title.includes(input);
          // },
          afterFetch: (data: any) => {
            const filterData = data.filter(
              (item: any) => !['/MyMessage', '/Profile'].includes(item.path),
            );
            // 递归处理：给父节点（有 children 的节点）添加 disabled，防止选中
            const markDisabled = (nodes: any[]) => {
              return nodes.map((item) => {
                const newItem = { ...item };
                if (newItem.children && newItem.children.length > 0) {
                  newItem.selectable = false;
                  newItem.children = markDisabled(newItem.children);
                }
                return newItem;
              });
            };
            return markDisabled(filterData);
          },
          showSearch: true,
          labelField: 'meta.title',
          valueField: 'path',
          childrenField: 'children',
          allowClear: true,
          class: 'w-full',
          treeDefaultExpandAll: false,
          treeLine: true,
        };
      },
      fieldName: 'defaultPageId',
      label: '默认页面',
      rules: 'required',
    },
  ],
  submitButtonOptions: {
    content: '保存',
  },
});

async function handleSubmit(values: Recordable<any>) {
  try {
    saving.value = true;
    await saveDefaultPage({
      userId: props.profile.userId,
      defaultPage: values.defaultPageId,
    });
    await authStore.fetchUserInfo();
    message.success('保存成功');
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  // TODO: 加载当前用户的默认页面配置
  nextTick(() => {
    
    formApi.setValues({
      defaultPageId: props.profile.defaultPage || undefined,
    });
  });
});
</script>

<template>
  <div class="mt-[16px] md:w-full lg:w-1/2 2xl:w-2/5">
    <DefaultPageForm />
  </div>
</template>

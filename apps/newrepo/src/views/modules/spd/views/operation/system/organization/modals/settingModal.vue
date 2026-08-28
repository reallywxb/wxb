<script lang="ts" setup>
import type { VbenFormSchema as FormSchema } from '@vben/common-ui';

import type { SubTabItem } from '#/views/modules/sys/views/org';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Button, message, TabPane, Tabs } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { transformComponent } from '#/views/modules/sys/views/org';

import {
  queryOpenAccountFields,
  queryOrgSetting,
  saveOrgSetting,
} from '../api';

const emit = defineEmits(['close']);

const TYPICAL_IDENTIFIER = '+_+'; // 替换表单字段中的.

const activeKey = ref<null | string | undefined>();
const settingTabOptions = ref<
  Array<{
    key: string;
    tab: string;
  }>
>([]);

const schemas: Array<FormSchema> = [];

const orgData = ref<any>({});
const title = ref('机构配置');

function onTabChange() {
  baseFormApi?.updateSchema(schemas);
}

queryOpenAccountFields().then((data: any[]) => {
  data.forEach((tab: { items: SubTabItem[]; label: string; name: string }) => {
    const groupOptions = tab.items.map((item) =>
      transformComponent(item, () => activeKey.value === tab.name),
    );

    schemas.push(...groupOptions);

    settingTabOptions.value.push({
      tab: tab.label,
      key: tab.name,
    });
  });

  schemas.forEach((item) => {
    item.fieldName = item.fieldName.replaceAll('.', TYPICAL_IDENTIFIER);
  });

  baseFormApi.setState((res) => ({
    ...res,
    schema: schemas,
  }));
});

const [Modal, modalApi] = useVbenModal({
  closeOnClickModal: false,
  showConfirmButton: false,
  cancelText: '关闭',
  onCancel() {
    modalApi.close();
  },
  onClosed() {
    activeKey.value = null;
    // message.info('onClosed：关闭动画结束');
  },
  onConfirm() {
    // message.info('onConfirm');
    // modalApi.close();
  },

  onOpenChange(isOpen) {
    if (isOpen) {
      modalApi?.setState({
        loading: true,
      });

      orgData.value = modalApi.getData<Record<string, any>>();

      activeKey.value = settingTabOptions.value[0]?.key;

      queryOrgSetting(orgData.value.AD_Org_ID)
        .then((data) => {
          baseFormApi?.setValues(
            Object.fromEntries(
              Object.entries(data).map(([key, value]) => [
                key.replaceAll('.', TYPICAL_IDENTIFIER),
                (function () {
                  switch (value) {
                    case 'false': {
                      return false;
                    }
                    case 'true': {
                      return true;
                    }
                    default: {
                      return value;
                    }
                  }
                })(),
              ]),
            ),
          );
        })
        .finally(() => {
          modalApi?.setState({
            loading: false,
          });
        });
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
    labelClass: 'w-[180px]',
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
  schema: [],
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  wrapperClass: 'grid-cols-2',
});

async function onSubmit() {
  const validateResult = await baseFormApi.validate();
  if (validateResult.valid) {
    const formData = await baseFormApi.getValues();

    const entries = Object.entries(formData).map(([key, value]) => [
      key.replaceAll(TYPICAL_IDENTIFIER, '.'),
      value,
    ]);

    saveOrgSetting(orgData.value.AD_Org_ID, Object.fromEntries(entries)).then(
      (res) => {
        if (res && res.success) {
          message.success({
            content: '保存成功',
          });
          modalApi.close();
          emit('close');
        }
      },
    );
  }
}
</script>
<template>
  <Modal class="w-[900px]" :title="title" title-tooltip="">
    <Tabs
      v-model:active-key="activeKey"
      :options="settingTabOptions"
      @change="onTabChange"
    >
      <!--eslint-disable-next-line vue/valid-v-for-->
      <TabPane v-for="item in settingTabOptions" v-bind="item" />
    </Tabs>
    <BaseForm />
    <template #prepend-footer>
      <Button
        type="primary"
        @click="onSubmit"
        data-testid="button_submit_settingModal"
      >
        保存
      </Button>
    </template>
  </Modal>
</template>

<style lang="less" scoped>
.form-title {
  // margin-left: 20px;
  margin-bottom: 20px;
  padding: 0 10px;
  font-size: 20px;
  font-weight: 500;
}
</style>

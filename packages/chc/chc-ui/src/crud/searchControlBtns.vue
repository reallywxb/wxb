<script setup lang="ts">
import { Button, ButtonGroup, Dropdown, Menu, MenuItem } from 'ant-design-vue';

const props = withDefaults(
  defineProps<{
    // isQuickSearchOpen?: boolean;
    // modelValue?: boolean;
  }>(),
  {
    // modelValue: false,
    // isQuickSearchOpen: false,
  },
);
const emit = defineEmits(['clearQuickSearch', 'update:modelValue']);
const isQuickSearchOpen = defineModel({ type: Boolean, default: false });
const toggleQuickSearch = () => {
  isQuickSearchOpen.value = !isQuickSearchOpen.value;
};
const handleMenuClick = (info) => {
  console.warn('info', info, props);
};
const clearQuickSearch = () => {
  // console.log('clearQuickSearch');
  emit('clearQuickSearch');
};
</script>
<template>
  <div>
    <ButtonGroup class="mr-2">
      <Button
        :type="isQuickSearchOpen ? 'primary' : 'default'"
        @click="toggleQuickSearch"
      >
        快捷搜索
      </Button>
      <Button @click="clearQuickSearch">清空快捷搜索</Button>
    </ButtonGroup>
    <Dropdown arrow placement="bottom">
      <template #overlay>
        <Menu @click="handleMenuClick">
          <MenuItem key="advancedSearch">高级查询</MenuItem>
          <MenuItem key="importData">导入数据</MenuItem>
          <MenuItem key="exportData">导出数据</MenuItem>
          <!-- <SubMenu key="sub1" title="查询">
            <MenuItem key="">3rd menu item</MenuItem>
            <MenuItem>4th menu item</MenuItem>
          </SubMenu>
          <SubMenu key="sub2" title="导入数据">
            <MenuItem>5d menu item</MenuItem>
            <MenuItem>6th menu item</MenuItem>
          </SubMenu>
          <SubMenu key="sub3" title="导出数据">
            <MenuItem>5d menu item</MenuItem>
            <MenuItem>6th menu item</MenuItem>
          </SubMenu> -->
        </Menu>
      </template>
      <Button> 操作 </Button>
    </Dropdown>
  </div>
</template>
<style scoped></style>

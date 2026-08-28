<script lang="ts" setup>
import type { GroupVO } from '#/views/modules/flow/api/group/types.ts';

import {
  getCurrentInstance,
  inject,
  nextTick,
  onActivated,
  onMounted,
  ref,
} from 'vue';

import {
  ArrowDownOutlined,
  ArrowsAltOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  FormOutlined,
  PlusOutlined,
  ShrinkOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Empty,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Tooltip,
} from 'ant-design-vue';

import * as util from '#/utils/flow/objutil';
import {
  addGroup,
  bottomSort,
  delGroup,
  editGroup,
  queryGroupMainFlowList,
  searchFlowList,
  topSort,
} from '#/views/modules/flow/api/group';

import GroupFlowData from '../../../components/groupFlowData.vue';

defineOptions({
  name: 'ChildGroup',
});

const props = defineProps<{
  refresh?: boolean;
}>();

const changeComponent =
  inject<(component: string, payload?: any) => void>('changeComponent');

const { proxy } = getCurrentInstance();

// 编辑费分组
const toEditGroupName = (item) => {
  item.editable = true;
  item.oldName = util.deepCopy(item.name);

  nextTick(() => {
    const $ref = proxy.$refs[`editGroupRef${item.id}`];
    $ref[0].focus();
  });
};

function topSortF(item) {
  topSort({ id: item.id }).then(() => {
    handleQuery();
  });
}
function bottomSortF(item) {
  bottomSort({ id: item.id }).then(() => {
    handleQuery();
  });
}

function editGroupInputBlur(item) {
  item.editable = false;

  if (util.isBlank(item.name)) {
    message.warning('分组名称不能为空');
    item.name = item.oldName;
  } else {
    editGroup({ groupName: item.name, id: item.id }).then(() => {
      message.success('修改成功');
    });
  }
}

// 是否是搜索模式 1普通分组模式 2搜索模式
const showType = ref(1);

const searchDataList = ref([]);

// 搜索的关键词
const searchWord = ref('');
// 点击搜索流程
function searchFlow() {
  if (util.isBlank(searchWord.value)) {
    showType.value = 1;
  }
  showType.value = 2;
  searchFlowList(searchWord.value).then((data) => {
    searchDataList.value = data;
  });
}

// 新增分组名称
const addGroupName = ref<String>('');
const addGroupCardShow = ref<Boolean>(false);
const addGroupKey = ref<Number>(0);
const addGroupRef = ref();
const successGroupList = ref<GroupVO[]>([]);

function addGroupInputBlur() {
  if (util.isBlank(addGroupName.value)) {
    addGroupCardShow.value = false;
  } else {
    addGroup({ groupName: addGroupName.value }).then(() => {
      message.success('新增成功');
      addGroupCardShow.value = false;
      handleQuery();
    });
  }
}

function toCreateFlow(groupId?: string) {
  // TODO 创建流程地址
  changeComponent?.('creation', { groupId });
  // router.push({
  //   path: '/flow/ChildCreation',
  //   query: { groupId },
  // });
}

onMounted(() => {
  handleQuery();
});

onActivated(() => {
  if (props.refresh) {
    handleQuery();
  }
});

function handleQuery() {
  queryGroupMainFlowList().then((data) => {
    for (const it of data) {
      it.showFlowList = true;
    }
    successGroupList.value = data;
  });
}

function deleteAddGroup() {
  addGroupCardShow.value = false;
  addGroupName.value = '';
  addGroupKey.value = Date.now();
}

function addOneGroupShow() {
  addGroupName.value = '';
  addGroupKey.value = Date.now();
  addGroupCardShow.value = true;
  nextTick(() => {
    addGroupRef.value.focus();
  });
}

function deleteGroup(id: string) {
  Modal.confirm({
    content: '确定要删除流程组吗?',
    title: '提示',
    okType: 'danger',
    onOk: () => {
      delGroup(id).then(() => {
        message.success('删除成功');
        handleQuery();
      });
    },
  });
}
</script>

<template>
  <div class="group">
    <div style="display: flex; justify-content: space-between">
      <div>
        <Form layout="inline" class="demo-form-inline">
          <FormItem>
            <Input
              clearable
              v-model:value="searchWord"
              placeholder="搜索流程"
            />
          </FormItem>
          <FormItem>
            <Button type="primary" @click="searchFlow"> 搜索 </Button>
          </FormItem>
        </Form>
      </div>
      <div style="margin-bottom: 20px; text-align: right">
        <Button class="button mr-4" @click="addOneGroupShow"> 新建分组 </Button>
        <Button
          class="button"
          @click.stop="toCreateFlow(undefined)"
          type="primary"
        >
          创建流程
        </Button>
      </div>
    </div>

    <Card class="box-card" v-if="addGroupCardShow">
      <div class="item additem" style="height: 40px">
        <div style="width: 400px; height: 40px; line-height: 40px">
          <Input
            ref="addGroupRef"
            :key="addGroupKey"
            maxlength="10"
            minlength="2"
            v-model:value="addGroupName"
            @blur.stop="addGroupInputBlur"
            placeholder="分组名称"
            clearable
          />
        </div>
        <div class="last">
          <Tooltip
            class="box-item"
            effect="dark"
            content="删除"
            placement="top"
          >
            <Button danger shape="circle" @click.stop="deleteAddGroup">
              <DeleteOutlined />
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
    <div v-if="successGroupList.length <= 0">
      <Empty :image-size="250" description="还没有分组哦~" />
    </div>

    <!--		分组显示-->
    <template v-if="showType === 1">
      <Card
        class="box-card"
        v-for="(item, index) in successGroupList"
        :key="item.id"
      >
        <template #title>
          <div class="card-header">
            <span v-if="!item.editable" class="title1">
              <Button shape="circle" @click="toEditGroupName(item)">
                <FormOutlined />
              </Button>
              {{ item.name }}({{ item.items?.length }})
            </span>
            <Input
              v-else
              :ref="`editGroupRef${item.id}`"
              class="title1_input"
              autofocus
              maxlength="10"
              minlength="2"
              v-model:value="item.name"
              @blur.stop="editGroupInputBlur(item)"
              placeholder="分组名称"
              clearable
            />
            <span>
              <template v-if="item.items.length > 0">
                <Tooltip
                  v-if="item.showFlowList"
                  class="box-item"
                  effect="dark"
                  content="折叠"
                  placement="top"
                >
                  <Button
                    shape="circle"
                    @click.stop="item.showFlowList = false"
                  >
                    <ShrinkOutlined />
                  </Button>
                </Tooltip>

                <Tooltip
                  v-else
                  class="box-item"
                  effect="dark"
                  content="展开"
                  placement="top"
                >
                  <Button shape="circle" @click.stop="item.showFlowList = true">
                    <ArrowsAltOutlined />
                  </Button>
                </Tooltip>
              </template>

              <Tooltip
                v-if="index > 0"
                class="box-item ml-[5px]"
                effect="dark"
                content="上移"
                placement="top"
              >
                <Button shape="circle" @click.stop="topSortF(item)">
                  <ArrowUpOutlined />
                </Button>
              </Tooltip>
              <Tooltip
                v-if="index < successGroupList.length - 1"
                class="box-item ml-[5px]"
                effect="dark"
                content="下移"
                placement="top"
              >
                <Button shape="circle" @click.stop="bottomSortF(item)">
                  <ArrowDownOutlined />
                </Button>
              </Tooltip>
              <Tooltip
                class="box-item ml-[5px]"
                effect="dark"
                content="创建流程"
                placement="top"
              >
                <Button shape="circle" @click.stop="toCreateFlow(item.id)">
                  <PlusOutlined />
                </Button>
              </Tooltip>
              <Tooltip
                v-if="item.items?.length === 0"
                class="box-item ml-[5px]"
                effect="dark"
                content="删除"
                placement="top"
              >
                <Button
                  danger
                  shape="circle"
                  @click.stop="deleteGroup(item.id)"
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
            </span>
          </div>
        </template>
        <template v-if="item.showFlowList">
          <div v-for="flow in item.items" :key="flow.flowId" class="item">
            <GroupFlowData @handle-query="handleQuery" :flow="flow" />
          </div>
        </template>
      </Card>
    </template>

    <!--		//搜索模式显示-->
    <template v-if="showType === 2">
      <Card>
        <template v-for="t in searchDataList" :key="t.id">
          <GroupFlowData @handle-query="handleQuery" :flow="t" />
        </template>
      </Card>
    </template>
  </div>
</template>
<style scoped lang="less">
.group {
  padding: 10px;
  //background: white;
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.additem {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 100%;
  margin-left: 0%;
  margin-top: 10px;
}

.title1 {
  border: 1px solid #ffffff;
  border-radius: 5px;
  padding: 5px 10px;
  width: 300px;
  cursor: pointer;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
}

//.title1:hover {
//  border: 1px solid #dddddd;
//}

.title1_input {
  border-radius: 5px;
  padding: 5px 10px;
  width: 300px;
}
</style>

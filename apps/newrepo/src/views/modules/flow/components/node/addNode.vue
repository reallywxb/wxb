<script setup>
import { inject, ref } from 'vue'; // 导入

import { PlusOutlined } from '@ant-design/icons-vue';
import { Button, Popover } from 'ant-design-vue';

import { bgColors, nodeData, placeholderList } from '#/utils/flow/const.js';
import { deepCopy } from '#/utils/flow/objutil';
import * as util from '#/utils/flow/objutil.js';

const props = defineProps({
  childNodeP: {
    type: Object,
    default: () => ({}),
  },
  currentNode: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits(['update:childNodeP']);

const readOnly = inject('readOnlyAtFlow');

const visible = ref(false);
const addType = (type) => {
  if (props.readOnly) {
    return;
  }

  visible.value = false;
  if (type !== 4 && type !== 5 && type !== 8) {
    const nodeDatum = deepCopy(nodeData[type]);

    const data = {
      ...nodeDatum,

      parentId: props.currentNode.id,
      nodeName: placeholderList[type],
      type,
      id: util.getRandomId(),
      childNode: props.childNodeP,
    };
    emits('update:childNodeP', data);
  } else {
    switch (type) {
      case 4: {
        const id = util.getRandomId('node');
        emits('update:childNodeP', {
          nodeName: '条件分支',
          type: 4,
          id,
          parentId: props.currentNode.id,

          childNode: props.childNodeP,
          conditionNodes: [
            {
              id: util.getRandomId('node'),
              nodeName: '条件1',
              mode: true,
              groupRelationMode: true,
              groupRelation: [],
              error: true,
              type: 3,
              parentId: id,

              priorityLevel: 1,
              conditionList: [
                {
                  mode: true,
                  conditionList: [
                    {
                      key: '',
                      value: '',
                      expression: '',
                    },
                  ],
                },
              ],
              nodeUserList: [],
              childNode: null,
            },
            {
              nodeName: '条件2',
              type: 3,
              groupRelationMode: true,
              groupRelation: [],
              id: util.getRandomId('node'),
              mode: true,
              error: false,
              parentId: id,
              priorityLevel: 2,
              conditionList: [
                {
                  mode: true,
                  conditionList: [
                    {
                      key: '',

                      expression: '',
                    },
                  ],
                },
              ],
              nodeUserList: [],
              childNode: null,
            },
          ],
        });

        break;
      }
      case 5: {
        const id = util.getRandomId('node');
        emits('update:childNodeP', {
          nodeName: '并行分支',
          type: 5,
          id,
          parentId: props.currentNode.id,

          childNode: props.childNodeP,
          conditionNodes: [
            {
              id: util.getRandomId('node'),
              nodeName: '分支1',
              placeHolder: '满足条件',
              parentId: id,

              error: false,
              type: 3,
              priorityLevel: 1,
              conditionList: [],
              nodeUserList: [],
              childNode: null,
            },
            {
              nodeName: '分支2',
              type: 3,
              id: util.getRandomId('node'),
              parentId: id,

              error: false,
              placeHolder: '满足条件',

              priorityLevel: 2,
              conditionList: [],
              nodeUserList: [],
              childNode: null,
            },
          ],
        });

        break;
      }
      case 8: {
        const id = util.getRandomId('node');
        emits('update:childNodeP', {
          nodeName: '包容分支',
          type: 8,
          id,
          parentId: props.currentNode.id,

          childNode: props.childNodeP,
          conditionNodes: [
            {
              id: util.getRandomId('node'),
              nodeName: '条件1',
              mode: true,
              groupRelationMode: true,
              groupRelation: [],
              error: true,
              type: 3,
              parentId: id,

              priorityLevel: 1,
              conditionList: [
                {
                  mode: true,
                  conditionList: [
                    {
                      key: '',
                      expression: '',
                    },
                  ],
                },
              ],
              nodeUserList: [],
              childNode: null,
            },
            {
              nodeName: '条件2',
              type: 3,
              groupRelationMode: true,
              groupRelation: [],
              id: util.getRandomId('node'),
              mode: true,
              error: false,
              parentId: id,
              priorityLevel: 2,
              conditionList: [
                {
                  mode: true,
                  conditionList: [
                    {
                      key: '',
                      expression: '',
                    },
                  ],
                },
              ],
              nodeUserList: [],
              childNode: null,
            },
          ],
        });

        break;
      }
      // No default
    }
  }
};
</script>
<template>
  <div class="add-node-btn-box">
    <div class="add-node-btn">
      <Popover
        trigger="hover"
        placement="rightTop"
        :disabled="readOnly"
        v-model:open="visible"
        width="290px"
      >
        <template #content>
          <div class="add-node-popover-body">
            <a class="add-node-popover-item" @click="addType(1)">
              <div
                class="item-wrapper"
                :style="{ color: `rgb(${bgColors[1]})` }"
              >
                <span class="iconfont"></span>
              </div>
              <p>审批人</p>
            </a>
            <a class="add-node-popover-item" @click="addType(2)">
              <div
                class="item-wrapper"
                :style="{ color: `rgb(${bgColors[2]})` }"
              >
                <span class="iconfont"></span>
              </div>
              <p>抄送人</p>
            </a>

            <a class="add-node-popover-item" @click="addType(4)">
              <div
                class="item-wrapper"
                :style="{ color: `rgb(${bgColors[4]})` }"
              >
                <span class="iconfont"></span>
              </div>
              <p>条件分支</p>
            </a>

            <a class="add-node-popover-item" @click="addType(5)">
              <div
                class="item-wrapper"
                :style="{ color: `rgb(${bgColors[5]})` }"
              >
                <i class="icon icon-icon-share-fill iconfont"></i>
              </div>
              <p>并行分支</p>
            </a>

            <a class="add-node-popover-item" @click="addType(7)">
              <div
                class="item-wrapper"
                :style="{ color: `rgb(${bgColors[7]})` }"
              >
                <i class="icon icon-icon-check iconfont"></i>
              </div>
              <p>延时器</p>
            </a>
          </div>
        </template>
        <Button class="btn">
          <PlusOutlined style="color: white" />
        </Button>
      </Popover>
    </div>
  </div>
</template>
<style scoped lang="less">
.add-node-btn-box {
  width: 240px;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    margin: auto;
    width: 2px;
    height: 100%;
    background-color: #cacaca;
  }

  .add-node-btn {
    user-select: none;
    width: 240px;
    padding: 20px 0 32px;
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-box-flex: 1;
    flex-grow: 1;

    .btn {
      outline: none;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
      width: 30px;
      height: 30px;
      background: #409eff;
      border-radius: 50%;
      position: relative;
      border: none;
      line-height: 30px;
      -webkit-transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

      display: flex;
      justify-content: center;
      align-items: center;

      &:hover {
        transform: scale(1.3);
        box-shadow: 0 13px 27px 0 rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: none;
        background: #1e83e9;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
<style lang="less" scoped>
@import '../../../../../styles/flow/workflow.css';
@import '../../../../../styles/flow/temp/icon.css';

.add-node-popover-body {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  text-align: center;

  .add-node-popover-item {
    margin: 10px 5px 10px 5px;
    cursor: pointer;
    text-align: center;
    display: flex;
    flex-direction: row;
    background-color: #f5f5f7;
    line-height: 30px;
    padding: 5px;
    width: 120px;
    //color: #191f25!important;
    .item-wrapper {
      user-select: none;
      display: inline-block;
      width: 30px;
      height: 30px;
      background: #fff;
      border: 1px solid #e2e2e2;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

      margin-right: 5px;
      .iconfont {
        font-size: 15px;
        line-height: 30px;
      }
    }

    &:hover {
      .item-wrapper {
        background: #409eff;
        box-shadow: 0 10px 20px 0 rgba(50, 150, 250, 0.4);
      }

      .iconfont {
        color: #fff;
      }
    }

    &:active {
      .item-wrapper {
        box-shadow: none;
        background: #eaeaea;
      }

      .iconfont {
        //color: inherit
      }
    }
  }
}
</style>

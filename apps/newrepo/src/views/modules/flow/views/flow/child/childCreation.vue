<script lang="ts" setup>
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
} from 'vue';

import { useUserStore } from '@vben/stores';

import {
  CloseCircleOutlined,
  SelectOutlined,
  WarningOutlined,
} from '@ant-design/icons-vue';
import { Button, Modal, Result, Steps } from 'ant-design-vue';
import { isEqual } from 'lodash-es';

import { useFlowStore } from '#/store/flow';
import * as util from '#/utils/flow/objutil';
import { assiginObj, getRandomId } from '#/utils/flow/objutil';
import { addFlow, getFlowDetail } from '#/views/modules/flow/api/flow';
import { formGroupConfig } from '#/views/modules/flow/api/form/data';

import Step1 from '../../../components/flow/step1.vue';
import Step2 from '../../../components/flow/step2.vue';
import Step3 from '../../../components/flow/step3.vue';

const props = withDefaults(
  defineProps<{
    cp?: boolean;
    flowId?: string;
    groupId?: string;
    id?: string;
  }>(),
  {
    cp: false,
    groupId: '',
    flowId: '',
    id: '',
  },
);

// 表示流程图可编辑
provide('readOnlyAtFlow', false);
// 监听路由离开
// onBeforeRouteLeave((to, from, next) => {
//   store.$reset();
//   next();
// });

onBeforeUnmount(() => {
  store.$reset();
});

const changeComponent =
  inject<(component: string, payload?: any) => void>('changeComponent');

const userStore = useUserStore();

const store = useFlowStore();

const step1Ref = ref();
const step2Ref = ref();
const step3Ref = ref();

const validateErrMsg = ref([]);

const flowName = computed(() => {
  const name1 = store.step1.name;
  if (util.isBlank(name1)) {
    return '未命名表单';
  }
  return name1;
});

const activeStep = ref(0);
const validateFlowStep = ref(0);
const validateDialogShow = ref(false);
const validatingShow = ref(false);

const stepData = ref();

const gotoEdit = () => {
  activeStep.value = validateFlowStep.value;
  validateDialogShow.value = false;
};
// 直接发布还是保存
const directPublish = ref(true);

function back() {
  compare()
    .then(() => {
      changeComponent?.('group');
    })
    .catch(() => {
      Modal.confirm({
        centered: true,
        title: '提示',
        content: '您有未保存的修改，确定离开？',
        okType: 'danger',
        onOk: () => {
          changeComponent?.('group');
        },
      });
    });
}

const publish = (p) => {
  directPublish.value = p;

  validateErrMsg.value = [];

  validateFlowStep.value = 0;
  validateDialogShow.value = true;
  validatingShow.value = true;

  setTimeout(() => {
    // 1
    checkStep1();
  }, 500);
};

onMounted(() => {
  // const query: LocationQuery = route.query;
  //
  // const groupId = (query.groupId as LocationQueryValue) ?? '';
  // const flowId = (query.flowId as LocationQueryValue) ?? '';
  // const id = (query.id as LocationQueryValue) ?? '';
  // const cp = (query.cp as LocationQueryValue) ?? '';

  // 保存到store
  provide('currentFlowId', props.flowId);

  store.step1.uniqueId = util.isNotBlank(props.id) ? props.id : getRandomId();

  if (util.isNotBlank(props.groupId)) {
    paramGroupId.value = props.groupId;
  }
  if (util.isNotBlank(props.flowId)) {
    getFlowDetail(props.flowId).then((data) => {
      // const { data } = res;

      stepData.value = JSON.stringify(data);

      store.step1.admin = JSON.parse(data.adminName || data.admin || '[]');
      store.step1.rangeList = data.rangeList;
      store.step1.name = data.name;
      store.step1.logo = data.logo;
      if (!props.cp) {
        // 编辑
        store.step1.flowId = props.flowId;
      }
      store.step1.remark = data.remark;
      store.step1.groupId = data.groupId;

      const formItemList = JSON.parse(data.formItemsPc);
      // 处理默认新增字段
      {
        const arr = [];

        for (const n of formItemList) {
          for (const item of formGroupConfig) {
            for (const f of item.formList) {
              if (f.type === n.type) {
                const v = assiginObj(util.deepCopy(f), util.deepCopy(n));
                arr.push(v);
                break;
              }
            }
          }
        }

        store.setStep2Form(arr);
      }

      step3NodeConfig.value = JSON.parse(data.process);
    });
  } else {
    if (userStore.userInfo) {
      // 新增
      const { id, userRealName: name, avatar } = userStore.userInfo;
      step3NodeConfig.value = [];
      store.step1.admin = [
        {
          id,
          name,
          avatar,
          type: 'user',
        } as any,
      ];
    }

    setTimeout(() => {
      step3Ref.value.getProcessData().then((res) => {
        const step1 = store.step1;
        const step2 = store.step2;

        const flow = util.deepCopy(step1);
        flow.formItems = JSON.stringify(step2);
        flow.formItemsPc = JSON.stringify(store.step2Form);
        flow.process = JSON.stringify(res);
        flow.adminName = JSON.stringify(step1.admin);

        flow.publish = directPublish.value;

        stepData.value = JSON.stringify(flow);
      });
    }, 0);
  }
});
const step3NodeConfig = ref();

const paramGroupId = ref('');

const checkStep1 = () => {
  step1Ref.value.validate((valid, arr) => {
    if (valid) {
      validateFlowStep.value = 1;

      setTimeout(() => {
        checkStep2();
      }, 100);
    } else {
      validatingShow.value = false;
      // 错误信息
      validateErrMsg.value = arr;
    }
  });
};
const checkStep2 = () => {
  step2Ref.value.validate((valid, arr) => {
    if (valid) {
      setTimeout(() => {
        validateFlowStep.value = 2;
        checkStep3();
      }, 100);
    } else {
      validatingShow.value = false;
      // 错误信息
      validateErrMsg.value = arr;
    }
  });
};

const checkStep3 = () => {
  setTimeout(() => {
    step3Ref.value.validate((valid, arr) => {
      if (valid) {
        setTimeout(() => {
          validateFlowStep.value = 3;
        }, 100);
      } else {
        validatingShow.value = false;
        // 错误信息
        validateErrMsg.value = arr;
      }
    });
  });
};

const submitLoading = ref(false);

const submitFlow = () => {
  submitLoading.value = true;
  step3Ref.value.getProcessData().then((res) => {
    const step1 = store.step1;
    const step2 = store.step2;

    const flow = util.deepCopy(step1);
    flow.formItems = JSON.stringify(step2);
    flow.formItemsPc = JSON.stringify(store.step2Form);
    flow.process = JSON.stringify(res);
    flow.adminName = JSON.stringify(step1.admin);

    flow.publish = directPublish.value;

    addFlow(flow)
      .then(() => {
        validateDialogShow.value = false;
        changeComponent?.('group', { refresh: true });
      })
      .finally(() => {
        submitLoading.value = false;
      });
  });
};

function compare() {
  return new Promise<void>((resolve, reject) => {
    step3Ref.value.getProcessData().then(() => {
      const {
        logo: oldLogo,
        name: oldName,
        remark: oldRemark,
        groupId: oldGroupId,
        rangeList: oldRangeList,
        admin: oldAdmin,
        formItems: oldFormItems,
        formItemsPc: oldFormItemsPc,
        // process: oldProcess,
      } = JSON.parse(stepData.value);

      if (
        isEqual(oldLogo, store.step1.logo) &&
        isEqual(oldName, store.step1.name) &&
        isEqual(oldRemark, store.step1.remark) &&
        isEqual(oldGroupId, store.step1.groupId) &&
        isEqual(oldRangeList, store.step1.rangeList) &&
        isEqual(oldAdmin, JSON.stringify(store.step1.admin)) &&
        isEqual(oldFormItems, JSON.stringify(store.step2)) &&
        isEqual(oldFormItemsPc, JSON.stringify(store.step2Form))
      ) {
        resolve();
      } else {
        reject(new Error('数据有修改'));
      }
    });
  });
}
</script>

<template>
  <div class="create">
    <div class="titlebar">
      <div class="f1">
        <b class="replace-el-text primary">
          {{ flowName }}
        </b>
      </div>
      <div class="f2">
        <span
          class="center-t"
          effect="dark"
          :activeStep="activeStep === 0"
          @click="activeStep = 0"
        >
          <span :activeStep="activeStep === 0">1</span>
          <span>基础信息</span>
        </span>
        <span
          class="center-t"
          effect="dark"
          :activeStep="activeStep === 1"
          @click="activeStep = 1"
        >
          <span :activeStep="activeStep === 1">2</span>
          <span>表单设计</span>
        </span>
        <span
          class="center-t"
          effect="dark"
          :activeStep="activeStep === 2"
          @click="activeStep = 2"
        >
          <span :activeStep="activeStep === 2">3</span>
          <span>流程设计</span>
        </span>
      </div>
      <div class="f3">
        <Button danger type="primary" @click="back()" class="mr-[5px]">
          返 回
        </Button>
        <Button ghost type="primary" @click="publish(false)" class="mr-[5px]">
          暂 存
        </Button>
        <Button type="primary" @click="publish(true)"> 发 布 </Button>
      </div>
    </div>

    <Step1 v-show="activeStep === 0" :group-id="paramGroupId" ref="step1Ref" />
    <Step2 v-show="activeStep === 1" ref="step2Ref" />
    <Step3
      v-show="activeStep === 2"
      :node-config-obj="step3NodeConfig"
      ref="step3Ref"
    />

    <!--			//验证每一步-->
    <Modal
      v-model:open="validateDialogShow"
      closable
      title="流程检查"
      :footer="null"
    >
      <Steps
        :current="validateFlowStep"
        size="small"
        style="margin-top: 0"
        :items="[
          {
            title: '基础信息',
          },
          {
            title: '表单设计',
          },
          {
            title: '流程设计',
          },
        ]"
      />

      <div style="text-align: center">
        <Result
          v-if="validateFlowStep === 3 && validateErrMsg.length === 0"
          icon="success"
          title="检查成功"
          sub-title="流程检查完成，现在提交？"
        >
          <template #extra>
            <Button :loading="submitLoading" type="primary" @click="submitFlow">
              <SelectOutlined />
              提交
            </Button>
          </template>
        </Result>

        <Result
          title="检查中"
          sub-title="正在检查流程信息"
          v-if="
            validateErrMsg.length === 0 &&
            validateDialogShow &&
            validatingShow &&
            validateFlowStep < 3
          "
        >
          <template #icon>
            <span
              v-loading="true"
              style="
                display: inline-block;
                width: 100px;
                height: 100px;
                border: 0 solid red;
              "
            >
            </span>
          </template>
        </Result>

        <Result v-if="validateErrMsg.length > 0" title="检查失败">
          <template #icon>
            <CloseCircleOutlined style="color: #f56c6c" />
          </template>
          <template #subTitle>
            <div v-for="item in validateErrMsg" :key="item">
              <div class="replace-el-text" style="color: #f56c6c">
                <WarningOutlined />
                {{ item }}
              </div>
            </div>
          </template>
          <template #extra>
            <Button type="primary" @click="gotoEdit">去修改</Button>
          </template>
        </Result>
      </div>
    </Modal>
  </div>
</template>
<style scoped lang="scss">
$f2_width: 800px;

@use '../../../../../../styles/flow/common';

.create {
  padding: 10px;
}

.titlebar {
  display: flex;
  flex-direction: row;
  padding: 24px;
  margin-bottom: 5px;
  //margin-bottom: 40px;
  background-color: white;
  border-radius: 8px;

  .f1 {
    width: calc(100% / 2 - #{$f2_width} / 2);
    padding-left: 20px;
    line-height: 46px;
  }

  .f2 {
    width: $f2_width;
    text-align: center;
  }

  .f3 {
    width: calc(100% / 2 - #{$f2_width} / 2);
    height: 46px;
    padding-right: 20px;
    line-height: 46px;
    text-align: right;
  }
}

.center-t {
  display: inline-block;
  padding: 10px;
  margin: 0 5px;
  cursor: pointer;

  span:first-child {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin-right: 6px;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    text-align: center;
    border: 1px solid;
    border-radius: 50%;
  }

  span:first-child[activeStep='true'] {
    color: white;
    background-color: #409eff;
  }

  span:last-child {
    font-size: 14px;
    font-weight: 500;
  }
}

.center-t[activeStep='true'] {
  color: #409eff;
  border-bottom: 2px solid #409eff;
}
</style>

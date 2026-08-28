<script setup lang="ts">
import type { DirectiveBinding } from 'vue';

import { computed, onMounted, onUnmounted, ref } from 'vue';

// import { useAccessStore } from '@vben/stores';
import { Button, message } from 'ant-design-vue';

import { aiRequestClientBackup } from '#/api/request';
// import { AI_MODEL_CHECK_URL } from '#/const';

const props = withDefaults(
  defineProps<{
    addAnLoadingAsk?: () => void;
    finishTheLoadingAsk: (text: string) => void;
    isStreamLoad: boolean;
  }>(),
  {
    addAnLoadingAsk: undefined,
  },
);
const emit = defineEmits(['updateIfCanTakeRecord']);
type HTMLElementExt = HTMLElement & {
  _handlePress: (() => void) | null;
  _handleRelease: (() => void) | null;
};
const takeAudioPeriod = ref<'beforeStart' | 'onGetAudioText' | 'onTakingAudio'>(
  'beforeStart',
);
const btnTipText = computed(() => {
  let text = '';
  switch (takeAudioPeriod.value) {
    case 'beforeStart': {
      return (text = '按住此处说话');
    }
    case 'onGetAudioText': {
      return (text = '正在解析音频');
    }
    case 'onTakingAudio': {
      return (text = '正在录音');
    }
  }
  return text;
});
const canTakeRecord = ref(false); // 初始化，是否支持录音
const luYinAttr = ref<{
  [key: string]: any;
  mediaRecorder: MediaRecorder | null;
}>({
  s: 0,
  timer: null,
  audioArray: [],
  startTime: null, // 录音开始时间
  endTime: null, // 录音结束时间
  mediaRecorder: null,
  recording: false, // 录音状态(用于录音记时)
  timeLength: 0, // 录音时长
  // recordedChunks: [],
  longPressThreshold: 0,
});

const vLongpress = {
  mounted: (el: HTMLElementExt, binding: DirectiveBinding) => {
    let pressTimer: null | ReturnType<typeof setTimeout> = null;
    const maxPressTime = 60_000; // 60秒 = 60000毫秒
    const startCallback = binding.value.start;
    const endCallback = binding.value.end;

    function handlePress() {
      startCallback();
      pressTimer = setTimeout(() => {
        endCallback();
        clearTimeout(pressTimer as ReturnType<typeof setTimeout>);
        pressTimer = null;
      }, maxPressTime);
    }

    function handleRelease() {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
        endCallback();
      }
    }

    // 确保这些函数在unbind中可用
    el._handlePress = handlePress;
    el._handleRelease = handleRelease;

    // 添加事件监听器
    el.addEventListener('mousedown', handlePress);
    el.addEventListener('touchstart', handlePress);
    el.addEventListener('mouseup', handleRelease);
    el.addEventListener('touchend', handleRelease);
    el.addEventListener('mouseleave', handleRelease);
    el.addEventListener('touchcancel', handleRelease);
  },
  unmounted: (el: HTMLElementExt) => {
    // 移除事件监听器
    if (el._handlePress) {
      el.removeEventListener('mousedown', el._handlePress);
      el.removeEventListener('touchstart', el._handlePress);
    }
    if (el._handleRelease) {
      el.removeEventListener('mouseup', el._handleRelease);
      el.removeEventListener('touchend', el._handleRelease);
      el.removeEventListener('mouseleave', el._handleRelease);
      el.removeEventListener('touchcancel', el._handleRelease);
    }

    // 清理自定义属性
    el._handlePress = null;
    el._handleRelease = null;
  },
};
// 初始化录音对象（记住，录音一定得在 https里面。当然，在本地开发 localhost 可以不需要，但上线一定得在https里面）
const luYin = () => {
  // 这儿先做判断，判断当前设备或当前网络是否支持录音，如果不支持，那下面的也就不用多说了。
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(luYinSuccess) // 支持录音，继续执行下面的操作
      .catch(luYinErr); // 不支持录音，没下文
  } else {
    canTakeRecord.value = false;
    emit('updateIfCanTakeRecord', false);
    // console.error('你的浏览器不支持 getUserMedia API');
  }
};
const luYinSuccess = (stream: MediaStream) => {
  // 创建MediaRecorder对象 用于生成音频文件

  if (!luYinAttr.value.mediaRecorder) {
    // 没有mediaRecoder的情况下，直接新建一个mediaRecorder
    const mediaRecorder = new MediaRecorder(stream);
    luYinAttr.value.mediaRecorder = mediaRecorder;
    // console.warn('首次生成mediaRecorder对象');
  } else if (!canTakeRecord.value) {
    // 如果是从没有录音设备到识别到录音设备的时候，原mediaRecorder对象已无效，所以，要重新创建一个mediaRecorder对象
    const mediaRecorder = new MediaRecorder(stream);
    luYinAttr.value.mediaRecorder = mediaRecorder;
    // console.warn('重新生成mediaRecorder对象');
  }
  canTakeRecord.value = true;
  // console.warn('支持录音');
  emit('updateIfCanTakeRecord', true);
};
const luYinErr = (error: Error) => {
  if (error.name === 'NotFoundError') {
    // message.error('没有找到录音设备');
    // console.error('找不到录音设备');
  }
  canTakeRecord.value = false;
  // console.warn('不支持录音');
  emit('updateIfCanTakeRecord', false);
};
// 开始计时
const startRecording = () => {
  // console.warn('开始录音');
  takeAudioPeriod.value = 'onTakingAudio';
  luYinAttr.value.s = 0;
  luYinAttr.value.recording = true;
  luYinAttr.value.startTime = Date.now();
  luYinAttr.value.timer = setInterval(() => {
    luYinAttr.value.s = luYinAttr.value.s + 1;
  }, 500);
};
// 结束录音计时
const stopRecording = () => {
  return new Promise((resolve, reject) => {
    // console.warn('结束录音');
    takeAudioPeriod.value = 'onGetAudioText';
    luYinAttr.value.recording = false;
    const endTime = Date.now();
    const startTime = luYinAttr.value.startTime;
    const recordDuration = (endTime - startTime) / 1000; // 计算录音时长（秒）
    if (recordDuration <= 1) {
      takeAudioPeriod.value = 'beforeStart';
      reject(new Error('录音时间过短'));
      return message.error('录音时间过短');
    }
    resolve(true);
    if (recordDuration >= 60) {
      luYinAttr.value.timeLength = 60;
      // 结束录音
    }
    luYinAttr.value.timeLength = recordDuration;
  });
};

const startLongPress = () => {
  // console.log('长按开始');
  clearTimeout(luYinAttr.value.timer);
  luYinAttr.value.timer = setTimeout(() => {
    // 执行长按操作
    luYinAttr.value.mediaRecorder!.start();
    startRecording();
  }, luYinAttr.value.longPressThreshold);
};
const endLongPress = async () => {
  clearTimeout(luYinAttr.value.timer);
  luYinAttr.value.mediaRecorder!.stop();
  await stopRecording();
  if (props.addAnLoadingAsk && typeof props.addAnLoadingAsk === 'function') {
    props.addAnLoadingAsk(); // 添加一个加载中问题
  }
  luYinAttr.value.mediaRecorder!.ondataavailable = async function (e) {
    if (e.data.size > 0) {
      const blobObj = e.data;
      const nowTime = Date.now();
      const fileName = `LY_${nowTime}.mp3`;
      const file = new File([blobObj], fileName, { type: 'audio/mpeg' });
      clearInterval(luYinAttr.value.timer);
      uploadAudio(file); // 上传录音
    } else {
      // no data to push
    }
  };
};
// const kouziAudioRequest = (file: File) => {
//   return aiRequestClientBackup.upload(
//     '/v1/audio/transcriptions',
//     {
//       file,
//     },
//     {
//       headers: {
//         Authorization: `Bearer pat_feHeLrruDUXKvolbONmryWmFwxEPKDKtTLU8vtOhUE5lEMQeO1V3uZOlmqQsxCud`,
//       },
//     },
//   );
// };
// const kouziHandler = (res: any) => {
//   const authStore = useAuthStore();
//   takeAudioPeriod.value = 'beforeStart';
//   if (res.status === 200) {
//     if (res.data.code === 0) {
//       if (res.data.data.text) {
//         // 录音识别成功
//         props.finishTheLoadingAsk(res.data.data.text);
//       } else {
//         props.finishTheLoadingAsk('');
//         message.error('未识别出语音内容');
//       }
//     } else {
//       props.finishTheLoadingAsk('');
//       message.error(res.data.msg);
//     }
//   } else {
//     if (res.status === 401) {
//       props.finishTheLoadingAsk('');
//       message.error('登录已过期，请重新登录');
//       authStore.logout();
//     } else {
//       props.finishTheLoadingAsk('');
//       console.error('请求失败:');
//     }
//   }
// };
const ownerAudioRequest = (file: File) => {
  return aiRequestClientBackup.upload('/transcribe', {
    file,
  });
};
const ownerHandler = (res: any) => {
  takeAudioPeriod.value = 'beforeStart';
  if (res.status === 200) {
    if (res.data.text) {
      // 录音识别成功
      props.finishTheLoadingAsk(res.data.text);
    } else {
      props.finishTheLoadingAsk('');
      message.error('未识别出语音内容');
    }
  }
};
const uploadAudio = (file: File) => {
  // const accessStore = useAccessStore();
  const formData = new FormData();
  formData.append('file', file);
  // kouziHandler(file)
  ownerAudioRequest(file)
    .then((res: any) => {
      // kouziHandler(res);
      ownerHandler(res);
    })
    .catch((error: Error) => {
      takeAudioPeriod.value = 'beforeStart';
      // 处理其他类型的错误
      console.error('请求失败:', error);
    });
};
defineExpose({
  canTakeRecord,
});
let initTimer: number = 0;
onMounted(() => {
  luYin();
  initTimer = window.setInterval(() => {
    luYin();
  }, 3000);
});
onUnmounted(() => {
  window.clearInterval(initTimer);
});
</script>
<template>
  <!-- w-[160px] -->
  <Button
    v-longpress="{ start: startLongPress, end: endLongPress }"
    class="relative box-border w-[120px]"
    :disabled="
      canTakeRecord && (isStreamLoad || takeAudioPeriod === 'onGetAudioText')
    "
  >
    <!-- <div
      class="absolute left-0 top-0 h-full w-full"
      @click.stop.prevent
      v-show="showBtnMask"
    ></div> -->
    {{ btnTipText }}
    <!-- v-show="takeAudioPeriod !== 'beforeStart'" -->
    <div class="load-4" v-show="false">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </Button>
</template>
<style scoped>
.load-4 {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 16px;
}

.load-4 div {
  position: absolute;
  top: 6px;
  width: 6px;
  height: 6px;
  background: #5486db;
  border-radius: 50%;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.load-4 div:nth-child(1) {
  left: 6px;
  animation: load-41 0.6s infinite;
}

.load-4 div:nth-child(2) {
  left: 6px;
  animation: load-42 0.6s infinite;
}

.load-4 div:nth-child(3) {
  left: 26px;
  animation: load-42 0.6s infinite;
}

.load-4 div:nth-child(4) {
  left: 45px;
  animation: load-43 0.6s infinite;
}

@keyframes load-41 {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes load-43 {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0);
  }
}

@keyframes load-42 {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(19px, 0);
  }
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { AntdCloseOutlined, AntdEyeTwotone } from '@vben/chc-icons';

import {
  Button,
  Image,
  ImagePreviewGroup,
  message,
  Spin,
} from 'ant-design-vue';
import dayjs from 'dayjs';

const emit = defineEmits(['submit']);
const ws = ref<null | WebSocket>(null);
const isConnectWS = ref(false); // 是否连接了websocket
const oneSate = ref(false);
const isdeskew = ref(0); // 纠偏是否开启 0 关闭 1 开启
const zhSate = ref(true); // 当前使用的语言
const deviceIndex = ref(0); // 当前使用设置索引
const logsList = ref([]); // 日志列表
const imgUrl = ref(''); // 摄像头图片
// const imgMouseleave = ref(false); // 用于控制initImgMouseleave方法只执行一次
// const imgMouseleaveSate = ref(false); // 鼠标是否离开图像
const isSelecting = ref(false);
// const selectionBox = ref<HTMLElement | null>(null);
const productSelectionRecordState = ref(false);
const OpenCameraSate = ref(false);
const imgList = ref([]);

const resolutionIndex = ref(0); // 当前使用分辨率项索引
function wsConnect(call) {
  const url = 'ws://127.0.0.1:9000';
  let WS: null | WebSocket = null;
  if ('WebSocket' in window) {
    WS = new WebSocket(url);
  } else {
    console.warn(
      '浏览器版本过低，请升级您的浏览器。\r\n浏览器要求：IE10+/Chrome14+/FireFox7+/Opera11+',
    );
  }

  WS.addEventListener('open', () => {
    isConnectWS.value = true;
    oneSate.value = true;
    if (call) {
      call();
    } else {
      InitDevs();
      stopDeskew();
    }
  });
  WS.addEventListener('message', (evt) => {
    if (typeof evt.data === 'string') {
      const str = evt.data;
      if (str.length <= 0) {
        return;
      }
      onResiveServerMsg(JSON.parse(str));
    }
  });
  WS.addEventListener('close', () => {
    isConnectWS.value = false;
  });
  ws.value = WS;
}
function InitDevs() {
  sendMsg({ function: 'InitDevs' });
}
function stopDeskew() {
  sendMsg({
    function: 'SetDeskew',
    isdeskew: 0,
  });
}
function sendMsg(body) {
  let againInit = false;
  if (ws.value) {
    try {
      ws.value.send(JSON.stringify(body));
    } catch {
      againInit = true;
    }
  } else {
    againInit = true;
  }
  if (againInit) {
    wsConnect(() => {
      ws.value.send(JSON.stringify(body));
    });
  }
}
function onResiveServerMsg(data) {
  const nameMap = {
    InitDevs: '设备初始化',
    DeinitDevs: '反设备初始化',
    CloseCamera: '关闭摄像头',
    GetResolutionCount: '获取设备分辨率数量',
    GetDeviceCount: '获取设备个数',
    ScanImage: '拍照',
    OpenCamera: '打开摄像头',
    SelectImage: '框选',
    GetResolution: '获取设备分辨率',
  };
  const name = data.function;
  let msg = '';

  msg = nameMap[name];

  const str = isdeskew.value === 0 ? '关闭' : '开启';

  // if (name !== 'ImageCallback') {
  //   console.log(data);
  // }
  const __zh_sate = zhSate.value;
  if (data.ret >= 0) {
    let showMsg = false;
    switch (name) {
      case 'DetectFaceLive': {
        if (data.ret === 0) {
          log(
            (__zh_sate ? '是否活人：' : 'Is it a living person') + data.isLive,
          );
        }
        break;
      }
      case 'DetectFaceLiveResult': {
        if (data.ret_live === 1) {
          log(__zh_sate ? '检测到活体人脸' : 'Detected a live face');
        } else log(__zh_sate ? '没有检测到活体人脸' : 'No live face detected');
        break;
      }
      case 'FaceDetectFromBase64': {
        if (data.ret === 0) {
          log(
            (__zh_sate
              ? '比对分数（分数大于75分可判断为同一个人）:'
              : 'Compare scores (if the score is greater than 75, it can be judged as the same person)') +
              data.score +
              (__zh_sate ? '分' : 'score'),
          );
        }
        break;
      }
      case 'FaceDetectFromFile': {
        if (data.ret === 0) {
          log(
            (__zh_sate
              ? '比对分数（分数大于75分可判断为同一个人）:'
              : 'Comparison score (if the score is greater than 75, it can be judged as the same person):') +
              data.score +
              (__zh_sate ? '分' : 'score'),
          );
        }
        break;
      }
      case 'GetDeviceCount': {
        // 设备个数
        __setCamera(data.value);
        log(
          (zhSate.value ? '设备个数:' : 'Number of devices') +
            data.value +
            (zhSate.value ? '个' : ' individual'),
        );
        break;
      }
      case 'GetDeviceName': {
        log((zhSate.value ? '设备型号:' : 'Equipment model:') + data.value);
        break;
      }
      case 'GetResolution': {
        const strData = data.value.split('|');
        __setResolution(strData);
        log(
          (zhSate.value
            ? '获取分辨率成功'
            : 'Successfully obtained resolution') + data.value,
        );
        break;
      }
      case 'GetResolutionCount': {
        log(
          (zhSate.value ? '设备分辨率数量:' : 'Number of device resolutions:') +
            data.value +
            (zhSate.value ? '个' : ' individual'),
        );
        break;
      }
      case 'ImageCallback': {
        if (OpenCameraSate.value) {
          imgUrl.value = `data:image/jpeg;base64,${data.value}`;
          initImgMouseleave();
        }
        break;
      }
      case 'InitDevs': {
        GetDeviceCount();
        GetResolution();
        showMsg = true;
        break;
      }
      case 'OpenCamera': {
        OpenCameraSate.value = true;
        showMsg = true;
        break;
      }
      case 'Printer': {
        break;
      }
      // case 'ReadIdCard': {
      //   if (data.ret === 0) {
      //     log((__zh_sate ? '姓名:' : 'name:') + data.name);
      //     log((__zh_sate ? '性别:' : 'sex:') + data.sex);
      //     log((__zh_sate ? '民族:' : 'nation:') + data.nation);
      //     log((__zh_sate ? '身份证号:' : 'ID number:') + data.number);
      //     log((__zh_sate ? '签发机关:' : 'issuing authority:') + data.issue);
      //     log(
      //       (__zh_sate ? '有效期限开始:' : 'Validity period begins:') +
      //         data.begin,
      //     );
      //     log(
      //       (__zh_sate ? '有效期限结束:' : 'End of validity period:') +
      //         data.end,
      //     );
      //     log((__zh_sate ? '地址:' : 'address:') + data.address);
      //     log((__zh_sate ? '出生日期:' : 'Date of Birth:') + data.birth);
      //     addImgDiv(data.photo);
      //     this.idcardPhoto = data.photo;
      //   }
      //   break;
      // }
      case 'ScanImage': {
        if (data.type) {
          showMsg = true;
          // 处理拍照逻辑
          addImgDiv(data.value);
        } else {
          // this.photoBase64 = data.value;
          // if (this.photoBase64) {
          //   sendMsg({
          //     function: 'FaceDetectFromBase64',
          //     base64_1: this.photoBase64,
          //     base64_2: this.idcardPhoto,
          //   });
          // } else {
          //   log(
          //     __zh_sate
          //       ? '没有获取到现场人脸照片'
          //       : 'No on-site facial photos were obtained',
          //   );
          // }
        }
        break;
      }
      // case 'ScanPDF': {
      //   showMsg = true;
      //   this.downloadPDF(data.value, '合成pdf', '00001.pdf');
      //   break;
      // }
      case 'SelectImage': {
        if (data.value) {
          showMsg = true;
          addImgDiv(data.value);
        }
        break;
      }
      case 'SetDeskew': {
        if (oneSate.value) {
          oneSate.value = false;
        } else {
          log(str + (zhSate.value ? '纠偏成功' : 'Correction successful'));
        }
        break;
      }

      case 'StartDetectFaceLive': {
        if (data.ret === 0) {
          log(__zh_sate ? '开始检测:' : 'Start detection');
        }
        break;
      }
      case 'StopDetectFaceLive': {
        if (data.ret === 0) {
          log(__zh_sate ? '检测停止' : 'Detection stopped');
        }
        break;
      }
      default: {
        showMsg = true;
      }
    }
    if (showMsg && msg) {
      log(msg + (__zh_sate ? '成功' : 'success'));
    }
  } else if (data.ret === -2) {
    if (name === 'SetDeskew') {
      log(str + (__zh_sate ? '纠偏失败' : 'Correction failed'));
    } else {
      log(msg + (__zh_sate ? '失败' : 'fail'));
    }
  } else {
    log(msg + (__zh_sate ? '失败' : 'fail'));
  }
}
// 设置分辨率下拉框选项 并选中第一项
function __setResolution() {
  // console.warn('__setResolution:', arr);
}
// 设置摄像头下拉框选项 并选中第一项
function __setCamera() {
  // console.warn('__setCamera:', len);
  // 需要自己根据len拼 摄像头1  摄像头2
}
function GetDeviceCount() {
  sendMsg({
    function: 'GetDeviceCount',
  });
}
function GetResolution() {
  sendMsg({
    function: 'GetResolution',
    device: deviceIndex.value,
  });
}
function addImgDiv(imgPath) {
  const img_id = doGenerateTimestampId();
  imgList.value.push({
    id: img_id,
    data: `data:image/jpg;base64,${imgPath}`,
    visible: false,
  });
}
function ScanImage() {
  // 参数imagepath为空的话返回base64，也可设置为本地路径，如：C:\\Users\\Administrator\\Desktop\\examples\\image\\123.png
  // C:\\Users\\Administrator\\Desktop\\examples\\image\\123.png
  sendMsg({
    function: 'ScanImage',
    imagepath: '',
    colorize: 0,
    type: true,
  });
}
const openSelectImg = ref(false);
const openSelectImgLoading = ref(false);
function SelectImage() {
  openSelectImgLoading.value = true;
  setTimeout(() => {
    openSelectImgLoading.value = false;
  }, 700);
  if (openSelectImg.value) {
    openSelectImg.value = false;
  } else {
    openSelectImg.value = true;
    productSelectionRecordState.value = true;
    const myDiv = document.querySelector('#Chrome');
    // let scanResElement = document.getElementById("scanRes"+this.zhLang)
    const selectionBox: HTMLDivElement =
      document.querySelector('#selection-box');
    let x1, y1;
    let x2, y2;
    // 鼠标放下
    myDiv.addEventListener('mousedown', (e: MouseEvent) => {
      if (productSelectionRecordState.value) {
        x1 = e.offsetX;
        y1 = e.offsetY;
        productSelectionRecordState.value = false;
      }
      isSelecting.value = true;
      e.preventDefault();
    });

    // 鼠标移动
    myDiv.addEventListener('mousemove', (e: MouseEvent) => {
      if (isSelecting.value) {
        x2 = e.offsetX;
        y2 = e.offsetY;
        selectionBox.style.display = 'block';
        if (x1 < x2 && y1 < y2) {
          selectionBox.style.left = `${x1}px`;
          selectionBox.style.top = `${y1}px`;
          selectionBox.style.width = `${x2 - x1}px`;
          selectionBox.style.height = `${y2 - y1}px`;
        } else if (x1 > x2 && y1 > y2) {
          selectionBox.style.left = `${x2}px`;
          selectionBox.style.top = `${y2}px`;
          selectionBox.style.width = `${x1 - x2}px`;
          selectionBox.style.height = `${y1 - y2}px`;
        } else if (x1 > x2 && y1 < y2) {
          selectionBox.style.left = `${x2}px`;
          selectionBox.style.top = `${y1}px`;
          selectionBox.style.width = `${x1 - x2}px`;
          selectionBox.style.height = `${y2 - y1}px`;
        } else {
          selectionBox.style.left = `${x1}px`;
          selectionBox.style.top = `${y2}px`;
          selectionBox.style.width = `${x2 - x1}px`;
          selectionBox.style.height = `${y1 - y2}px`;
        }
      }
    });
    // 鼠标弹起
    myDiv.addEventListener('mouseup', (e: MouseEvent) => {
      productSelectionRecordState.value = true;
      if (isSelecting.value) {
        isSelecting.value = false;
        selectionBox.style.display = 'none';
        x2 = (e as MouseEvent).offsetX;
        y2 = (e as MouseEvent).offsetY;
        let res_left = Math.round(x1);
        let res_top = Math.round(y1);
        let res_right = Math.round(x2);
        let res_bottom = Math.round(y2);

        if (res_left === res_right || res_top === res_bottom) {
          message.warn(
            zhSate.value
              ? '框选范围过小，请重新框选'
              : 'The selection range is too small, please reselect',
          );
          // alert(zhSate.value?'框选范围过小，请重新框选':'The selection range is too small, please reselect');
          return;
        }
        if (res_left > res_right) {
          const k = res_left;
          res_left = res_right;
          res_right = k;
        }
        if (res_bottom < res_top) {
          const tb = res_bottom;
          res_bottom = res_top;
          res_top = tb;
        }
        // console.log(res_left, res_top, res_right, res_bottom);
        if (res_left) {
          // 参数imagepath为空的话返回base64，也可设置为本地路径，如：C:\\Users\\Administrator\\Desktop\\examples\\image\\123.png
          // viewWidth:视频流显示的宽,viewHeight:显示的高
          const imgDom = document.querySelector('#chrome_img');
          const viewWidth = imgDom.clientWidth;
          const viewHeight = imgDom.clientHeight;
          // console.log(`viewWidth:${viewWidth}viewHeight:${viewHeight}`);
          sendMsg({
            function: 'SelectImage',
            imagepath: '',
            left: res_left,
            top: res_top,
            right: res_right,
            bottom: res_bottom,
            viewWidth,
            viewHeight,
          });
        } else {
          message.warn(
            zhSate.value
              ? '框选出错，请重新框选'
              : 'Box selection error, please reselect',
          );
        }
      }
      e.preventDefault();
    });
  }
}
function doGenerateTimestampId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function initImgMouseleave() {
  // if (!imgMouseleave.value) {
  // const k = document.querySelector('#chrome_img');
  // 监听鼠标移出容器事件
  // k.addEventListener('mouseleave', () => {
  //   // 执行隐藏提示、还原样式等操作
  //   imgMouseleaveSate.value = true;
  //   if (isSelecting.value) {
  //     isSelecting.value = false;
  //     const selectionBoxEl = selectionBox.value as HTMLElement;
  //     // 这里直接取消数据
  //     selectionBoxEl.style.display = 'none';
  //     selectionBoxEl.style.left = '0';
  //     selectionBoxEl.style.top = '0';
  //     selectionBoxEl.style.width = '0';
  //     selectionBoxEl.style.height = '0';
  //   }
  // });
  // imgMouseleave.value = true;
  // }
}

// 操作方法
function OpenCamera() {
  sendMsg({
    function: 'OpenCamera',
    device: deviceIndex.value,
    resolution: resolutionIndex.value,
    datacallback: true,
  });
}
function log(msg) {
  const date = new Date().toTimeString().slice(0, 8);
  const saveMsg = `${date}:${msg}`;
  logsList.value.unshift(saveMsg);
}
const confirmUploadLoading = ref(false);
function confirmUpload() {
  if (imgList.value && imgList.value.length > 0) {
    confirmUploadLoading.value = true;
    const fileList = imgList.value.map((item) => {
      const fileObj = base64ToFile(item.data, dayjs().format('YYYYMMDDHHmmss'));
      return {
        file: fileObj,
      };
    });
    emit('submit', fileList);
  } else {
    message.warn('请拍照后上传');
  }
}
onMounted(() => {
  sendMsg({ function: 'InitDevs' });
  // 获取设备列表
  setTimeout(() => {
    OpenCamera();
    // SelectImage();
  }, 500);
});
// base64图片转file的方法（base64图片, 设置生成file的文件名）
function base64ToFile(base64, fileName) {
  // 将base64按照 , 进行分割 将前缀  与后续内容分隔开
  const data = base64.split(',');
  // 利用正则表达式 从前缀中获取图片的类型信息（image/png、image/jpeg、image/webp等）
  const type = data[0].match(/:(.*?);/)[1];
  // 从图片的类型信息中 获取具体的文件格式后缀（png、jpeg、webp）
  const suffix = type.split('/')[1];
  // 使用atob()对base64数据进行解码  结果是一个文件数据流 以字符串的格式输出
  const bstr = window.atob(data[1]);
  // 获取解码结果字符串的长度
  let n = bstr.length;
  // 根据解码结果字符串的长度创建一个等长的整形数字数组
  // 但在创建时 所有元素初始值都为 0
  const u8arr = new Uint8Array(n);
  // 将整形数组的每个元素填充为解码结果字符串对应位置字符的UTF-16 编码单元
  while (n--) {
    // charCodeAt()：获取给定索引处字符对应的 UTF-16 代码单元
    u8arr[n] = bstr.codePointAt(n);
  }
  // 利用构造函数创建File文件对象
  // new File(bits, name, options)
  const file = new File([u8arr], `${fileName}.${suffix}`, {
    type,
  });
  // 将File文件对象返回给方法的调用者
  return file;
}
const previewVisible = ref(false);
const currentPreview = ref(0);
const previewImgUrl = ref('');
const preview = (item, index) => {
  previewImgUrl.value = item.data;
  previewVisible.value = true;
  currentPreview.value = index;
};
function removeImg(item) {
  imgList.value = imgList.value.filter((itemIn) => {
    return itemIn.id !== item.id;
  });
}
</script>
<template>
  <div>
    <div class="mb-[20px] text-2xl font-[700]">拍照上传</div>
    <div class="flex w-full justify-between">
      <div
        class="relative flex h-[300px] w-[400px] items-center justify-center bg-gray-800"
        id="Chrome"
      >
        <img
          class="h-[300px] w-[400px]"
          v-show="!!imgUrl"
          :src="imgUrl"
          alt=""
          id="chrome_img"
        />
        <div id="selection-box"></div>
        <Spin :spinning="!imgUrl" tip="加载中..." />
      </div>

      <div
        class="hideScrollBar flex h-auto max-h-[320px] w-[340px] flex-wrap content-start items-start justify-start gap-[10px] overflow-y-auto bg-gray-600 p-[10px]"
      >
        <div
          class="imgContainer relative h-[100px] w-[100px] overflow-hidden bg-[rgba(255,255,255,0.9)]"
          v-for="(item, index) in imgList"
          :key="item.id"
        >
          <img class="h-full w-full object-contain" :src="item.data" alt="" />
          <div
            class="imgMask absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.5)] text-[#fff]"
          >
            <div
              class="absolute right-[-23px] top-[-23px] flex h-[40px] w-[40px] cursor-pointer items-end justify-start rounded-[20px] bg-[rgba(255,255,255,0.5)] pb-[5px] pl-[5px] text-[#000]"
              @click="removeImg(item)"
            >
              <AntdCloseOutlined class="text-[12px]" />
            </div>
            <div
              class="flex cursor-pointer items-center justify-center"
              @click="preview(item, index)"
            >
              <AntdEyeTwotone />&nbsp;预览
            </div>
          </div>
        </div>
      </div>
      <!-- <Image
        :src="previewImgUrl"
        :style="{ display: 'none' }"
        :preview="{
          visible: previewVisible,
          onVisibleChange: (vis)=> (previewVisible = vis),
        }"
      /> -->
      <div style="display: none">
        <ImagePreviewGroup
          :preview="{
            visible: previewVisible,
            onVisibleChange: (vis) => (previewVisible = vis),
            current: currentPreview,
          }"
        >
          <Image
            v-for="(item, index) in imgList"
            :key="`preview-${index}`"
            :src="item.data"
          />
        </ImagePreviewGroup>
      </div>
    </div>

    <div class="mt-[20px] text-right">
      <!-- <Button type="primary" @click="OpenCamera">打开摄像头</Button> -->
      <Button type="primary" @click="ScanImage">拍照</Button>
      <Button
        type="primary"
        class="ml-[12px]"
        :loading="openSelectImgLoading"
        @click="SelectImage"
      >
        打开框选
      </Button>
      <Button
        type="primary"
        class="ml-[12px]"
        :loading="confirmUploadLoading"
        @click="confirmUpload"
      >
        确认上传
      </Button>
    </div>
  </div>
</template>
<style scoped>
.hideScrollBar::-webkit-scrollbar {
  display: none;
}

.imgContainer {
  .imgMask {
    opacity: 0;
  }
}

.imgContainer:hover {
  .imgMask {
    opacity: 1;
  }
}

#selection-box {
  position: absolute;
  display: none;
  pointer-events: none;
  border: 2px dashed red;
}
</style>

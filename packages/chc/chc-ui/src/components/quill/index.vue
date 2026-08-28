<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

import Quill from 'quill';

import { uploadImage } from './api';

import 'quill/dist/quill.snow.css';
// 定义组件属性
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    imgUrl?: string;
    modelValue?: string;
    options?: Record<string, any>;
    placeholder?: string;
  }>(),
  {
    modelValue: '',
    disabled: false,
    options: () => ({}),
    imgUrl: 'noticeHandleAction/upload.do',
    placeholder: '请输入内容...',
  },
);

// 定义事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'textChange', ...args: any[]): void;
  (e: 'selectionChange', ...args: any[]): void;
  (e: 'focus', ...args: any[]): void;
  (e: 'blur', ...args: any[]): void;
}>();

// DOM 引用
const editorContainer = ref<HTMLDivElement | null>(null);
const editorElement = ref<HTMLDivElement | null>(null);
let quillInstance: null | Quill = null;

// 默认配置
const defaultOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      // [{ 'header': 1 }, { 'header': 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      // [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video'],
    ],
  },
};

// 初始化 Quill
const initQuill = () => {
  if (!editorElement.value) return;

  // 自定义图片上传处理
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = {
        file,
      };

      try {
        const response: any = await uploadImage(props.imgUrl, formData);

        const imageUrl = response.src; // 假设返回的图片 URL 在 [url](file://d:\codes\spd-v4-ui\packages\chc-ui\src\uploadFiles\index.vue#L188-L188) 字段中

        // 插入图片到编辑器
        const range = quillInstance?.getSelection();
        if (range && quillInstance) {
          quillInstance.insertEmbed(range.index, 'image', imageUrl);
        }
      } catch (error) {
        console.error('图片上传失败:', error);
      }
    });
  };

  const mergedOptions = {
    ...defaultOptions,
    ...props.options,
    placeholder: props.placeholder,
  };

  quillInstance = new Quill(editorElement.value, mergedOptions);
  const toolbar: any = quillInstance?.getModule('toolbar');

  toolbar.addHandler('image', imageHandler);
  // 设置初始内容
  if (props.modelValue) {
    quillInstance.root.innerHTML = props.modelValue;
  }

  // 绑定事件
  quillInstance.on('text-change', (delta, oldDelta, source) => {
    const html = quillInstance?.root.innerHTML || '';
    emit('update:modelValue', html);
    emit('textChange', delta, oldDelta, source);
  });

  quillInstance.on('selection-change', (range, oldRange, source) => {
    emit('selectionChange', range, oldRange, source);
  });

  quillInstance.root.addEventListener('focus', (event) => {
    emit('focus', event);
  });

  quillInstance.root.addEventListener('blur', (event) => {
    emit('blur', event);
  });

  // 设置禁用状态
  if (props.disabled) {
    quillInstance.enable(false);
  }
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (quillInstance && newValue !== quillInstance.root.innerHTML) {
      quillInstance.root.innerHTML = newValue || '';
    }
  },
);

// 监听禁用状态变化
watch(
  () => props.disabled,
  (newValue) => {
    if (quillInstance) {
      quillInstance.enable(!newValue);
    }
  },
);

// 组件挂载后初始化
onMounted(() => {
  nextTick(() => {
    initQuill();
  });
});

// 暴露方法给父组件
defineExpose({
  getQuillInstance: () => quillInstance,
  getText: () => quillInstance?.getText() || '',
  getHTML: () => quillInstance?.root.innerHTML || '',
});
</script>

<template>
  <div ref="editorContainer" class="quill-editor-container">
    <div ref="editorElement" class="quill-editor"></div>
  </div>
</template>

<style scoped>
.quill-editor-container {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.quill-editor {
  min-height: 200px;
}

:deep(.ql-toolbar) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.ql-container) {
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}
</style>

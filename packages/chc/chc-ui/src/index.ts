import type { App } from 'vue';

import { RequestClient } from '@vben/request';

import { setApi } from './api/request';
// import viewMessageModal from './asyncModal/viewMessageModal.vue';
import uploadFiles from './uploadFiles';

import './styles/index.css';

export * from './api';
export * from './asyncModal';
export * from './components/chc-select';
export * from './components/date-group';
export * from './components/notification';
export * from './components/quill';
export * from './components/select-hook';
export * from './components/select-hook-api-component';
export * from './components/select-hook/useChcSelect';
export * from './components/time-group';
export * from './crud/index';
export * from './editableTable/useEditableTable';
export * from './types/crud.d';
export * from './uploadFiles/api';
export * from './utils';
uploadFiles.name = 'UploadFiles';
// viewMessageModal.name = 'ViewMessageModal';
const components = [uploadFiles];
type options = {
  axios?: RequestClient;
};
const install = (app: App, option?: options) => {
  components.forEach((component) => {
    app.component(component.name as string, component);
  });
  if (option && option.axios) {
    app.config.globalProperties.$axios = option.axios;
    setApi(option.axios);
  }
};
export default {
  install,
};

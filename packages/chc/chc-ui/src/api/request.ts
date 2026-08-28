import { ref } from 'vue';

import { RequestClient } from '@vben/request';

const request = ref<RequestClient>();
export function setApi(api: RequestClient) {
  request.value = api;
}
export function getApi() {
  if (!request.value) {
    throw new Error(
      'request not registered for this app instance. Please install the API first.',
    );
  }
  return request.value;
}

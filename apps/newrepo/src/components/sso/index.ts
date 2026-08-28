import type { App } from 'vue';

import comp1 from './sso/index.vue';
import comp2 from './ssoLogin/index.vue';

comp1.name = 'SsoMain';
comp2.name = 'SsoLogin';
const components = [comp1, comp2];
function install(Vue: App) {
  components.forEach((component) => {
    Vue.component(component.name as string, component);
  });
}

export default {
  install,
};

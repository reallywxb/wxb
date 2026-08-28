declare module '@xgsk/vue3-page-split' {
  import { DefineComponent } from 'vue';

  const PageSplitLazy: DefineComponent;
  const PageSplit: DefineComponent;
  export { PageSplit, PageSplitLazy };
}

declare module 'vue3-page-split' {
  import { DefineComponent } from 'vue';

  const PageSplit: DefineComponent;
  export { PageSplit };
}

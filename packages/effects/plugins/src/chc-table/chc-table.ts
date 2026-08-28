import type { VxeGridProps } from 'vxe-table';

import type { Slot } from 'vue';

import type { VbenFormProps } from '@vben-core/form-ui';

import type { ChcTableExports } from './types';

import { computed, defineComponent, h, onMounted, ref } from 'vue';

import { merge } from 'lodash-es';
import { VxeGrid } from 'vxe-table';

import { tableProps } from './config';

export default defineComponent({
  name: 'ChcTable',
  props: tableProps,
  emits: ['ready'],
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const defaltOptions: Partial<VxeGridProps> = {
      border: true,
      showOverflow: true,
      height: 'auto',
      keepSource: true,
      toolbarConfig: {
        enabled: true,
        slots: {
          buttons: slots['toolbar-left'] ? 'toolbar-left' : undefined,
          tools: slots['toolbar-right'] ? 'toolbar-right' : undefined,
        },
      },
    };
    const finalOptions = computed(() => {
      return merge(defaltOptions, props.gridOptions);
    });
    const finalSearchFormSchema = props.searchFormSchema.map((item) => {
      let formItemClass = props.searchFormVertical
        ? 'pl-[10px] pr-[10px]'
        : 'pl-[4px] pr-[4px]';
      if (!props.searchFormValidate) {
        formItemClass = `${formItemClass} pb-2`;
      }
      const labelClass = 'leading-1 mb-[1px] pl-[4px]';
      return { formItemClass, labelClass, ...item };
    });
    const gridRef = ref<InstanceType<typeof VxeGrid>>();
    const defaultFormOptions: VbenFormProps<any> = {
      collapseTriggerResize: true,
      commonConfig: {
        labelWidth: 90,
        componentProps: {
          class: 'w-full',
        },
      },
      compact: true,
      actionWrapperClass: props.searchFormVertical
        ? 'formActionAreaStyle'
        : undefined,
      collapsed: true,
      collapsedRows: 1,
      layout: props.searchFormVertical ? 'vertical' : 'horizontal',
      // 控制表单是否显示折叠按钮
      showCollapseButton: true,
      // 是否在字段值改变时提交表单
      submitOnChange: false,
      // 按下回车时是否提交表单
      submitOnEnter: true,
      wrapperClass:
        'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5',
      schema: finalSearchFormSchema,
    };
    const finalFormOptions = merge(
      defaultFormOptions,
      props.searchFormOptions || {},
    );
    const [Form, formApi] = props.formConstructor(finalFormOptions);

    // watch(
    //   () => finalSearchFormSchema.value,
    //   () => {
    //     formApi.updateSchema(finalSearchFormSchema.value);
    //   },
    // );
    const renderVN = () => {
      const tableSlots: Record<string, Slot> = {};
      const formSlots: Record<string, Slot> = {};

      for (const key of Object.keys(slots)) {
        const slotFn = slots[key];
        if (!slotFn) continue; // 跳过不存在的插槽

        if (key.startsWith('form-')) {
          // ✅ 去掉前缀，得到 'header'、'footer' 等
          const realKey = key.replace('form-', '');
          formSlots[realKey] = slotFn;
        } else {
          tableSlots[key] = slotFn;
        }
      }
      // console.log('tableSlots, formSlots:', tableSlots, formSlots);
      return h(
        'div',
        {
          style: {
            backgroundColor: 'hsl(var(--card))',
            height: '100%',
            borderRadius: 'calc(var(--radius) - 2px)',
            position: 'relative',
            ...props.tableContainerStyles,
          },
        },
        [
          h(
            VxeGrid,
            {
              ref: gridRef,
              ...finalOptions.value,
              loading: props.loading,
              data: props.data,
              columns: props.columns,
              style: {
                padding: '0.5rem',
              },
              ...attrs,
            },
            {
              form:
                finalFormOptions.schema && finalFormOptions.schema.length > 0
                  ? () =>
                      h(
                        'div',
                        {
                          style: {
                            position: 'relative',
                            borderRadius: '0.25rem',
                            paddingTop: '0rem',
                            paddingLeft: '0.25rem',
                            paddingRight: '0.25rem',
                            paddingBottom: '1rem',
                          },
                        },
                        [
                          h(Form, {}, formSlots),
                          h(
                            'div',
                            {
                              style: {
                                zIndex: 100,
                                position: 'absolute',
                                width: '100%',
                                left: '0rem',
                                bottom: '0.5rem',
                                height: '0.5rem',
                              },
                            },
                            [
                              h('div', {
                                style: {
                                  position: 'absolute',
                                  backgroundColor:
                                    'hsl(var(--background-deep))',
                                  left: '-0.5rem',
                                  bottom: '0',
                                  height: '0.5rem',
                                  width: 'calc(100% + 1rem)',
                                },
                              }),
                            ],
                          ),
                        ],
                      )
                  : null,
              ...tableSlots,
            },
          ),
        ],
      );
    };
    const $chcTable: ChcTableExports = {
      renderVN: renderVN,
      formApi: formApi,
      gridApi: gridRef.value!,
    };
    onMounted(() => {
      $chcTable.formApi = formApi;
      $chcTable.gridApi = gridRef.value!;
    });
    return $chcTable;
  },
  render() {
    return this.renderVN();
  },
});

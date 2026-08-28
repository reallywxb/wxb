import type { Driver, PopoverDOM } from 'driver.js';

import { ref } from 'vue';

import { driver } from 'driver.js';

export function openGlobalGuide(namespace: string) {
  const driverObj = ref<Driver>();
  driverObj.value = driver({
    popoverOffset: 10,
    stagePadding: -5,
    // overlayColor: 'hsl(var(--primary))',
    smoothScroll: true,
    overlayOpacity: 0.8,
    allowClose: false,
    disableActiveInteraction: true,
    nextBtnText: '下一步',
    prevBtnText: '上一步',
    doneBtnText: '完成',
    allowKeyboardControl: false,
    showProgress: false,
    steps: [
      {
        popover: {
          showButtons: ['next'],
          title: '系统操作指引',
          showProgress: false,
          description:
            '欢迎使用药品供应链精细化管理平台，鉴于您是首次登录，系统将为您提供功能引导，请跟我一起了解如何使用吧！',
          onPopoverRender: (popover: PopoverDOM) => {
            const skipBtn = document.createElement('button');
            skipBtn.innerText = '跳过';
            popover.footerButtons.prepend(skipBtn);

            skipBtn.addEventListener('click', () => {
              driverObj.value?.destroy();
              localStorage.setItem(`${namespace}`, '1');
            });
          },
        },
      },
      {
        element: 'main',
        popover: {
          showButtons: ['next'],
          title: '工作台',
          showProgress: true,
          popoverClass: 'guide-workspace-popover',
          side: 'left',
          align: 'center',
          progressText: '1 / 5',
          description:
            '工程师已根据角色为您配置专属工作台，可在此跳转常用功能，查看预警信息和日常报表等',
          onPopoverRender: (popover: PopoverDOM) => {
            const skipBtn = document.createElement('button');
            skipBtn.innerText = '跳过';
            popover.footerButtons.prepend(skipBtn);

            skipBtn.addEventListener('click', () => {
              driverObj.value?.destroy();
              localStorage.setItem(`${namespace}`, '1');
            });
          },
          onNextClick() {
            driverObj.value?.moveNext();
          },
        },
      },
      {
        element: '.menu-align-start',
        popover: {
          showButtons: ['next'],
          showProgress: true,
          side: 'bottom',
          align: 'center',
          progressText: '2 / 5',
          title: '功能模块区',
          description: '上方为功能模块区，可点击切换模块选择您想要的功能',
          onPopoverRender: (popover: PopoverDOM) => {
            const skipBtn = document.createElement('button');
            skipBtn.innerText = '跳过';
            popover.footerButtons.prepend(skipBtn);

            skipBtn.addEventListener('click', () => {
              driverObj.value?.destroy();
              localStorage.setItem(`${namespace}`, '1');
            });
          },
          onNextClick() {
            driverObj.value?.moveNext();
          },
        },
      },
      {
        element: '.vben-menu',
        popover: {
          showButtons: ['next'],
          showProgress: true,
          side: 'right',
          align: 'center',
          progressText: '3 / 5',
          title: '功能菜单区',
          description: '左侧为功能菜单区，可点击功能名称进入具体功能页面',
          onPopoverRender: (popover: PopoverDOM) => {
            const skipBtn = document.createElement('button');
            skipBtn.innerText = '跳过';
            popover.footerButtons.prepend(skipBtn);

            skipBtn.addEventListener('click', () => {
              driverObj.value?.destroy();
              localStorage.setItem(`${namespace}`, '1');
            });
          },
          onNextClick() {
            driverObj.value?.moveNext();
          },
        },
      },
      {
        element: 'header > :last-child',
        popover: {
          showButtons: ['next'],
          title: '登录信息栏',
          side: 'bottom',
          align: 'center',
          showProgress: true,
          progressText: '4 / 5',
          description:
            '支持切换登录医院、全局功能检索、用户信息修改以及系统主题设置。',
          prevBtnText: '上一步',
          onPopoverRender: (popover: PopoverDOM) => {
            const skipBtn = document.createElement('button');
            skipBtn.innerText = '跳过';
            popover.footerButtons.prepend(skipBtn);

            skipBtn.addEventListener('click', () => {
              driverObj.value?.destroy();
              localStorage.setItem(`${namespace}`, '1');
            });
          },
          onNextClick() {
            driverObj.value?.moveNext();
          },
        },
      },
      {
        element: '.aiAssistant',

        popover: {
          showButtons: ['next'],
          title: 'AI助手',
          side: 'left',
          align: 'center',
          showProgress: true,
          progressText: '5 / 5',
          description:
            '可点击打开AI助手聊天窗，支持文字和语音输入，可问询系统操作流程、系统数据、生成数据报表。',
          // onPopoverRender: (popover: PopoverDOM) => {
          // const skipBtn = document.createElement('button');
          // skipBtn.innerText = '跳过';
          // popover.footerButtons.prepend(skipBtn);
          // skipBtn.addEventListener('click', () => {
          //   driverObj.value?.destroy();
          //   localStorage.setItem(`${namespace}`, '1');
          // });
          // const lastStepButton = document.createElement('button');
          // lastStepButton.innerText = '上一步';
          // popover.footerButtons.prepend(lastStepButton);
          // lastStepButton.addEventListener('click', () => {
          //   driverObj.value?.movePrevious();
          // });
          // },
          onNextClick() {
            driverObj.value?.moveNext();
            localStorage.setItem(`${namespace}`, '1');
          },
        },
      },
    ],
  });
  driverObj.value.drive();
}

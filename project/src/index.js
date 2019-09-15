import Vue from 'vue';
import App from './js/App.vue';
Vue.config.productionTip = false;

// App.data.path = projectPath;
/* eslint-disable no-new */
const VueApp = {
  onMount: () => {
    new Vue({
      render: h => h(App, {
        attrs: {
          class: selector
        }
      }),
    }).$mount('#app');
  }
};


const selector = 'pnoalueet';
const projectName = 'pnoalueet';

if (window.VueApp === undefined) window.VueApp = {};
if (window.VueApp[projectName] === undefined) {
  window.VueApp[projectName] = VueApp;
  window.VueApp[projectName].onMount();
}

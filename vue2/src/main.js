import "core-js/modules/es.array.find";

import Vue from "vue";
import App from "./App.vue";
import routes from "./router";
import VueRouter from "vue-router";
import Tag from "element-ui/lib/tag";
import Button from "element-ui/lib/button";
import Select from "element-ui/lib/select";
import Option from "element-ui/lib/option";
import Popover from "element-ui/lib/popover";
import Dialog from "element-ui/lib/dialog";
import AButton from "ant-design-vue/es/button";
import ASelect from "ant-design-vue/es/select";
import AModal from "ant-design-vue/es/modal";
import APopover from "ant-design-vue/es/popover";
import "./pageLifeTest";
import "element-ui/lib/theme-chalk/base.css";
import "element-ui/lib/theme-chalk/tag.css";
import "element-ui/lib/theme-chalk/button.css";
import "element-ui/lib/theme-chalk/select.css";
import "element-ui/lib/theme-chalk/option.css";
import "element-ui/lib/theme-chalk/popover.css";
import "element-ui/lib/theme-chalk/dialog.css";
import "ant-design-vue/es/style/index.css";
import "ant-design-vue/es/button/style/index.css";
import "ant-design-vue/es/select/style/index.css";
import "ant-design-vue/es/modal/style/index.css";
import "ant-design-vue/es/popover/style/index.css";
import "./index.css";

const base = process.env.NODE_ENV === "production" ? "/demo-vue2/" : "";

[Tag, Button, Select, Option, Popover, Dialog].forEach((element) =>
  Vue.use(element)
);
[AButton, ASelect, AModal, APopover].forEach((element) => Vue.use(element));

Vue.use(VueRouter);

Vue.config.productionTip = false;

/* const intercept0 = (root, funcname) => { */
/*   if (root[funcname]) { */
/*     let oldFunc = root[funcname].bind(root); */
/*     Object.defineProperty(root, funcname, { */
/*       get() { */
/*         return function (child) { */
/*           let ret = oldFunc(child); */
/*           if (child.nodeName === "IMG") { */
/*             child.src = */
/*               "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png"; */
/*           } */
/*           if (funcname === "createElement") { */
/*             intercept0(ret, "appendChild"); */
/*           } */
/*           return ret; */
/*         }; */
/*       }, */
/*     }); */
/*   } */
/* }; */
/* intercept0(document, "createElement"); */
/* intercept0(document, "appendChild"); */

if (window.__POWERED_BY_WUJIE__) {
  let instance;
  window.__WUJIE_MOUNT = () => {
    const router = new VueRouter({ base, routes });
    instance = new Vue({ router, render: (h) => h(App) }).$mount("#app");
  };
  window.__WUJIE_UNMOUNT = () => {
    instance.$destroy();
  };
} else {
  new Vue({
    router: new VueRouter({ mode: "hash", base, routes }),
    render: (h) => h(App),
  }).$mount("#app");
}

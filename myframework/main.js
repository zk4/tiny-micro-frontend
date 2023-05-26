
createIframe("app",(sandbox, iframe, inject, injectJsTag) => {
  const vue2Code = `
									import Vue from "./vue.esm.browser.js";
									new Vue({
										data: {
											counter: 0
										},
										methods: {
											incrementCounter() {
												this.counter++;
											}
										},
										render: function (createElement) {
											return createElement('div', [
												createElement('button', {
													on: {
														click: this.incrementCounter
													}
												}, 'Vue btn (click me)'),
												createElement('label', this.counter)
											]);
										}
								  }).$mount("#app");

								`;
  // js 是异步的, 要等待返回
  setTimeout(() => {
    inject(vue2Code, iframe, "module");
    console.log("injected vue2");
  }, 1000);
});
createIframe("vue3",(sandbox, iframe, inject, injectJsTag) => {
  const vue3 = `
						const { createApp, ref, h } = Vue;

						const app = createApp({
							setup() {
								const counter = ref(0);

								function incrementCounter() {
									counter.value++;
								}

								return {
									counter,
									incrementCounter
								};
							},

							render() {
								return h('div', [
									h('button', { onClick: this.incrementCounter }, 'Vue 3 btn (click me)'),
									h('label', this.counter)
								]);
							}
						});

						app.mount("#vue3");
				`;
  injectJsTag("https://unpkg.com/vue@next", iframe);
  // js 是异步的, 要等待返回
  setTimeout(() => {
    inject(vue3, iframe, "module");
    console.log("injected vue3");
  }, 3000);
});
createIframe("react17",(sandbox, iframe, inject, injectJsTag) => {
  const react = `
							const { useState } = React;

						function App() {
							const [counter, setCounter] = useState(0);

							const incrementCounter = () => {
								setCounter(counter + 1);
							};

							return React.createElement(
										"div",
										null,
										React.createElement("button", { onClick: incrementCounter }, "React2 Click Me"),
										React.createElement("label", null, counter)
									)
						}

						ReactDOM.render( React.createElement(App, null),document.querySelector('#react17'));
				`;
  injectJsTag("./react.development.js", iframe);
  injectJsTag("./react-dom.development.js", iframe);
  // js 是异步的, 要等待返回
  setTimeout(() => {
    inject(react, iframe, "module");
    console.log("injected react");
  }, 3000);
});

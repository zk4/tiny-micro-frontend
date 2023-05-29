
createIframe("vue2", ({inject0}) => {
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
								  }).$mount("#vue2");

								`;
  inject0({textContent:vue2Code,type:"module"});
});

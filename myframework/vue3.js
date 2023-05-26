
createIframe("vue3", (inject, injectJsTag) => {
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
  injectJsTag("https://unpkg.com/vue@next",  () => {
    inject(vue3,  "module");
  });
});

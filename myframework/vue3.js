createAppComponent({
  id: "vue3",
  onloaded: ({ inject0 }) => {
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
    inject0({
      src: "https://unpkg.com/vue@next",
      onload: () => {
        inject0({ textContent: vue3, type: "module" });
      },
    });
  },
});

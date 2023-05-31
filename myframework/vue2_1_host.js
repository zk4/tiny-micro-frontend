createAppComponent({
  id: "vue2_1",
  onloaded: ({ injectJsTag }) => {
    injectJsTag("http://localhost:7900/js/chunk-vendors.js", () => {
      injectJsTag("http://localhost:7900/js/app.js", () => {});
    });
  },
});

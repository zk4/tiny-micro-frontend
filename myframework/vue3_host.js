createAppComponent({
  id: "app",
	
  onloaded: ({ injectJsTag }) => {
    injectJsTag("http://localhost:7300/js/chunk-vendors.js", () => {
      injectJsTag("http://localhost:7300/js/app.js", () => {});
    });
  },
});

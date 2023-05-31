createAppComponent({
  id: "app",
  onloaded: ({ injectJsTag }) => {
    injectJsTag("http://localhost:7200/js/chunk-vendors.js", () => {
			injectJsTag("http://localhost:7200/js/app.js", () => {
				console.log(document)
			});
    });
  },
});

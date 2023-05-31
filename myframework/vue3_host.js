createAppComponent("app", ({ injectJsTag }) => {
	/* injectJsTag("http://localhost:5000/myframework/xhrhook.js", () => { */
    injectJsTag("http://localhost:7300/js/chunk-vendors.js", () => {
      injectJsTag("http://localhost:7300/js/app.js", () => {});
    });
  });
/* }); */

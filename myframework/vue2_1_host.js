createAppComponent("vue2_1", ({ injectJsTag }) => {
	/* injectJsTag("http://localhost:5000/myframework/xhrhook.js", () => { */
    injectJsTag("http://localhost:7900/js/chunk-vendors.js", () => {
      injectJsTag("http://localhost:7900/js/app.js", () => {});
    });
  });
/* }); */

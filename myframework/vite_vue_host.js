createIframe("app", ({injectJsTag}) => {
  /* injectJsTag("http://localhost:5000/myframework/xhrhook.js", () => { */
  injectJsTag("http://localhost:7500/@vite/client", () => {
    injectJsTag("http://localhost:7500/src/main.ts", () => {},true);
  },true);
});
/* }); */

function createIframe(onloaded) {
  const iframe = document.createElement("iframe");
  iframe.hidden = true;
  iframe.src = "about:blank";
  document.body.appendChild(iframe);

  iframe.onload = function () {
    let oldDocument = iframe.contentWindow.document;

    // when assign function like this, you must use call/bind to restore the contenxt
    let oldIframeCreateElement = oldDocument.createElement.bind(oldDocument);
    let oldiframeAppendChild = oldDocument.body.appendChild.bind(
      oldDocument.body
    );

    function inject(code, frame, type) {
      const script = oldIframeCreateElement("script");
      if (type) {
        script.type = type;
      }
      script.textContent = code;
      oldiframeAppendChild(script);
    }
    function injectJsTag(src, frame, type) {
      const script = oldIframeCreateElement("script");
      if (type) {
        script.type = type;
      }
      script.src = src;
      oldiframeAppendChild(script);
    }

    // proxy iframe createElement to parent createElement
    Object.defineProperty(iframe.contentWindow.document, "createElement", {
      get() {
        return function (...args) {
          return window.parent.document.createElement(...args);
        };
      },
    });

    // proxy iframe appendChild to parent appendChild
    Object.defineProperty(iframe.contentWindow.document.body, "appendChild", {
      get() {
        return function (...args) {
          return window.parent.document.body.appendChild(...args);
        };
      },
    });

    // TODO: no need to execute in iframe context
    const createShadowDom = `
            		  const shadowContainer = document.createElement("div");
									document.body.appendChild(shadowContainer)
									const shadowRoot = shadowContainer.attachShadow({ mode: "open" });
									const shadowStyle = document.createElement("style");
									shadowStyle.textContent = "label { color: red}";
									shadowRoot.appendChild(shadowStyle);

									const shadowContent = document.createElement("div");
									shadowContent.id ="app"
									shadowRoot.appendChild(shadowContent);
								`;

    inject(createShadowDom, iframe);
    onloaded(this, iframe, inject, injectJsTag);
  };
  return iframe;
}

createIframe((sandbox, iframe, inject, injectJsTag) => {
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
								  }).$mount(shadowContent);

								`;
  // js 是异步的, 要等待返回
  setTimeout(() => {
    inject(vue2Code, iframe, "module");
    console.log("injected vue2");
  }, 1000);
});
createIframe((sandbox, iframe, inject, injectJsTag) => {
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

						app.mount(shadowContent);
				`;
  injectJsTag("https://unpkg.com/vue@next", iframe);
  // js 是异步的, 要等待返回
  setTimeout(() => {
    inject(vue3, iframe, "module");
    console.log("injected vue3");
  }, 3000);
});
createIframe((sandbox, iframe, inject, injectJsTag) => {
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

						ReactDOM.render( React.createElement(App, null),shadowContent);
				`;
  injectJsTag("./react.development.js", iframe);
  injectJsTag("./react-dom.development.js", iframe);
  // js 是异步的, 要等待返回
  setTimeout(() => {
    inject(react, iframe, "module");
    console.log("injected react");
  }, 3000);
});
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


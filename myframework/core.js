function createIframe(id,onloaded) {
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
    function injectJsTag(src, frame, onload) {
      const script = oldIframeCreateElement("script");
      script.src = src;
			script.type = 'text/javascript';
 			script.onload = function() {
				onload && onload();
      }
      oldiframeAppendChild(script);
    }

		Object.defineProperty(iframe.contentWindow.document, "getElementById", {
			get() {
				return function (selector) {
				// TODO:
				// normal getElementById does not work
					return window.parent.document.getElementById(selector).shadowRoot.getElementById(selector);
				};
			},
		});
		Object.defineProperty(iframe.contentWindow.document, "querySelector", {
			get() {
				return function (selector) {
				// TODO:
				// normal querySelector does not work
					return window.parent.document.querySelector(selector).shadowRoot.querySelector(selector)
				};
			},
		});

		// this is shadow dom wrapper for css isolation
    // <div id="sandbox_{id}">
    //      sahdowRoot
    //           <style>
    //           <div ...>    <---  this is where app goes
		const shadowContainer = document.createElement("div");
		shadowContainer.id =id
		document.body.appendChild(shadowContainer)
		const shadowRoot = shadowContainer.attachShadow({ mode: "open" });
		const shadowStyle = document.createElement("style");
		shadowStyle.textContent = "label { color: red}";
		shadowRoot.appendChild(shadowStyle);

		const shadowContent = document.createElement("div");
		shadowContent.id = id
		shadowRoot.appendChild(shadowContent);

    // inject(createShadowDom, iframe);
    onloaded(this, iframe, inject, injectJsTag);
  };
  return iframe;
}


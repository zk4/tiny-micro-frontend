function createIframe(id, onloaded) {
  const iframe = document.createElement("iframe");
  iframe.hidden = true;
  iframe.src = "about:blank";
  document.body.appendChild(iframe);

  const idSelector = "#" + id;

  iframe.onload = function () {
    let oldWindow = iframe.contentWindow;
    let oldDocument = iframe.contentWindow.document;
    // when assign function like this, you must use call/bind to restore the contenxt
    let oldIframeCreateElement = oldDocument.createElement.bind(oldDocument);
    let oldiframeAppendChild = oldDocument.body.appendChild.bind(
      oldDocument.body
    );

    function inject0(kvs) {
      const script = oldIframeCreateElement("script");
      // Object.entries(kvs).map(([k, v]) => (script[k] = v));
      Object.assign(script, kvs);
      oldiframeAppendChild(script);
    }
    function injectCode(code, type) {
      const script = oldIframeCreateElement("script");
      if (type) {
        script.type = type;
      }
      script.textContent = code;
      oldiframeAppendChild(script);
    }
    function injectJsTag(src, onload) {
      const script = oldIframeCreateElement("script");
      script.src = src;
      script.type = "text/javascript";
      script.onload = function () {
        onload && onload();
      };
      oldiframeAppendChild(script);
    }

    Object.defineProperty(iframe.contentWindow.document, "getElementById", {
      get() {
        return function (selector) {
          // TODO:
          // normal getElementById does not work
          if (selector === idSelector) {
            return window.parent.document
              .getElementById(selector)
              .shadowRoot.getElementById(selector);
          } else {
            return window.document.getElementById(selector);
          }
        };
      },
    });
    Object.defineProperty(iframe.contentWindow.document, "querySelector", {
      get() {
        return function (selector) {
          if (selector === idSelector) {
            return window.parent.document
              .querySelector(selector)
              .shadowRoot.querySelector(selector);
          } else {
            return window.document.querySelector(selector);
          }
        };
      },
    });

    const intercept1 = (root, funcname) => {
      if (root[funcname]) {
        let oldFunc = root[funcname].bind(root);
        Object.defineProperty(root, funcname, {
          get() {
            return function (child) {

              let ret = oldFunc(child);
              if (ret.src) {
    						console.log(ret)
                    ret.src = ret.src.replace(
                      "http://localhost:5000",
                      "http://localhost:7200"
                    );
							}

							
    					// recursivly intercept created element
              if (funcname === "createElement") {
                intercept1(ret, "appendChild");
              }
              return ret;
            };
          },
        });
      }
    };
    intercept1(iframe.contentWindow.document, "createElement");
    intercept1(iframe.contentWindow.document, "appendChild");

    /* const intercept0 = (root, funcname) => { */
    /*   if (root[funcname]) { */
    /*     let oldFunc = root[funcname].bind(root); */
    /*     Object.defineProperty(root, funcname, { */
    /*       get() { */
    /*         return function (child) { */
    /*           if (child.src) { */
    /*             child.src = child.src.replace( */
    /*               "http://localhost:5000", */
    /*               "http://localhost:7200" */
    /*             ); */
    /*             return oldFunc(child); */
    /*           } else { */
    /*             // html css go to shadowdom */
    /*             return window.parent.document */
    /*               .querySelector(idSelector) */
    /*               ?.shadowRoot[funcname](child); */
    /*           } */
    /*         }; */
    /*       }, */
    /*     }); */
    /*   } */
    /* }; */
    /* function interceptAppendChild(root) { */
    /*   intercept0(root, "appendChild"); */
    /* } */
    /* function interceptInsertBefore(root) { */
    /*   intercept0(root, "insertBefore"); */
    /* } */
    /* interceptAppendChild(iframe.contentWindow.document.head); */

    // this is shadow dom wrapper for css isolation
    // <div id="sandbox_{id}">
    //      sahdowRoot
    //           <style>
    //           <div ...>    <---  this is where app goes
    const shadowContainer = document.createElement("div");
    shadowContainer.id = id;
    document.body.appendChild(shadowContainer);
    const shadowRoot = shadowContainer.attachShadow({ mode: "open" });
    const shadowStyle = document.createElement("style");

    //TODO: inject isolate css here
    shadowStyle.textContent = "label { color: red}";
    shadowRoot.appendChild(shadowStyle);

    const shadowContent = document.createElement("div");
    shadowContent.id = id;
    shadowRoot.appendChild(shadowContent);

    /* function printAllNodes(element) { */
    /*   if (element.childNodes.length > 0) { */
    /*     element.childNodes.forEach((e) => printAllNodes(e)); */
    /*   } else { */
    /*     console.log(element); */
    /*   } */
    /* } */
    /* printAllNodes(shadowRoot); */

    onloaded({ inject0, injectCode, injectJsTag });
  };
  return iframe;
}

function createAppComponent({ id, onloaded }) {
  const iframe = document.createElement("iframe");
  iframe.hidden = true;
  iframe.src = "about:blank";
  document.body.appendChild(iframe);

  // TODO: just for debug
  window.iframe = iframe;

  const idSelector = "#" + id;

  iframe.onload = function () {
    console.log("onload");
    let oldWindow = iframe.contentWindow;
    let oldDocument = iframe.contentWindow.document;
    // when assign function like this, you must use call/bind or arrow function to restore the contenxt
    /* let oldIframeCreateElement = oldDocument.createElement.bind(oldDocument); */
    let oldIframeCreateElement = (x) => oldDocument.createElement(x);
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
    function injectJsTag(src, onload, isModule) {
      const script = oldIframeCreateElement("script");
      script.src = src;
      if (isModule) {
        script.type = "module";
      } else {
        script.type = "text/javascript";
      }
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
          return window.parent.document
            .getElementById(selector)
            .shadowRoot.getElementById(selector);
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

    Object.defineProperty(iframe.contentWindow.document.head, "appendChild", {
      get() {
        return function (child) {
          if (child.src) {
            child.src = child.src.replace(
              "http://localhost:5000",
              "http://localhost:7200"
            );
            return oldiframeAppendChild(child);
          } else {
            // html css go to shadowdom
            return window.parent.document
              .querySelector(idSelector)
              ?.shadowRoot.appendChild(child);
          }
        };
      },
    });

    let oldiframeCreateElement = oldDocument.createElement.bind(oldDocument);
    Object.defineProperty(iframe.contentWindow.document, "createElement", {
      get() {
        return function (child) {
          // TODO: what is difference between iframe.contentWindow.document.createElement and window.document.createElement?
          let element = document.createElement(child);
          if (element.nodeName === "IMG") {
            // this does not work in vue. src is reset aftermath
            /* element.src= "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png"; */
          } else {
            // we could proxy the img parent's appendChild function
            let oldf = element.appendChild.bind(element);
            Object.defineProperty(element, "appendChild", {
              get() {
                return function (child) {
                  if (child.nodeName === "IMG") {
                    if (child.src && child.src.startsWith("http")) {
                      child.src = child.src.replace(
                        "http://localhost:5000",
                        "http://localhost:7200"
                      );
                    }
                  }
                  return oldf(child);
                };
              },
            });
          }
          return element;
        };
      },
    });

    // this is shadow dom wrapper for css isolation
    // <div id="sandbox_{id}">
    //      sahdowRoot        <---   shadowRoot
    //           <div ...>    <---  this is where app mount, typically it's user defined HTML element like <div id="#app"/>, but there is a problem to get this id.
    const shadowContainer = document.createElement("div");
    // id is like "app", not "#app"
    shadowContainer.id = id;
    document.body.appendChild(shadowContainer);
    const shadowRoot = shadowContainer.attachShadow({ mode: "open" });

    // demo: inject isolate css here
    // we could inject tag to the shadow dom to get the same result
    // const shadowStyle = document.createElement("style");
    // shadowStyle.textContent = "label { color: red}";
    // shadowRoot.appendChild(shadowStyle);

    /* const shadowContent = document.createElement("div"); */
    /* shadowContent.id = id; */
    /* shadowRoot.appendChild(shadowContent); */

    const detachedDocument = readHTML("http://localhost:7200");

    // FAILED TRY 1: script won't execute, we need to manully construct
    /* const html = detachedDocument.getElementsByTagName("HTML") */
    /* shadowContent.appendChild(html[0]) */

    const links = detachedDocument.getElementsByTagName("link");
    const scripts = detachedDocument.getElementsByTagName("script");
    const divs = detachedDocument.getElementsByTagName("div");

    for (let s of scripts) console.log(s);
    // FAILED TRY 2: script won't execute, we need to manully construct
    shadowRoot.appendChild(divs[0]);
    /* Array.prototype.forEach.call(links,l=>shadowRoot.appendChild(l)) */
    for (let s of scripts) {
      const script = document.createElement("script");
      script.src = s.src.replace(
        "http://localhost:5000",
        "http://localhost:7200"
      );
      iframe.contentWindow.document.body.appendChild(script);
    }

    /* onloaded({ inject0, injectCode, injectJsTag }); */
  };
  return iframe;
}

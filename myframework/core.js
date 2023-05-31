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
    // let oldIframeCreateElement = oldDocument.createElement.bind(oldDocument);
    let oldIframeCreateElement = (x) => oldDocument.createElement(x);
    let oldiframeAppendChild = oldDocument.body.appendChild.bind(
      oldDocument.body
    );

    function readHTML(url) {
      const xmlhttp = new XMLHttpRequest();
      // TODO: maybe we can use async,modify 3th arg to true
      xmlhttp.open("GET", url, false);
      xmlhttp.send();
      const parser = new DOMParser();
      return parser.parseFromString(xmlhttp.responseText, "text/html");
    }

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
            // html css go to shadowDOM
            return window.parent.document
              .querySelector(idSelector)
              ?.shadowRoot.appendChild(child);
          }
        };
      },
    });


    // intercept all function of obj
    function interceptMethodCalls(obj, fn) {
      for (let key in obj) {
        const prop = obj[key];
        if (typeof prop === "function") {
          const origProp = prop;
          obj[key] = (...args) => {
            fn.before && fn.before(key, args);
            try {
              const ret = Reflect.apply(origProp,obj === iframe.contentWindow.document? document: obj, args);
              fn.after && fn.after(key, args, ret);
              return ret;
            } catch (e) {
              //TODO: this shoud handle
              console.log(e);
            }
          };
        }
      }
    }

    const after = (fnName, fnArgs, ret) => {
      if (ret && ret.nodeName === "IMG") {
        interceptMethodCalls(ret, {
          before: (fn, args) => {
						// this should reset src to subapp's url
            if (fn === "setAttribute" && args[0]==="src") {
							args[1]='http://localhost:7200/'+args[1]
            }
          },
        });
        console.log(`${fnName} called with `, fnArgs);
      }
    };

    interceptMethodCalls(iframe.contentWindow.document, { after });

    // this is shadow dom wrapper for css isolation
    const shadowContainer = document.createElement("div");
    shadowContainer.id = id;
    document.body.appendChild(shadowContainer);
    const shadowRoot = shadowContainer.attachShadow({ mode: "open" });

    const detachedDocument = readHTML("http://localhost:7200");

    const links = detachedDocument.getElementsByTagName("link");
    const scripts = detachedDocument.getElementsByTagName("script");
    const divs = detachedDocument.getElementsByTagName("div");

    shadowRoot.appendChild(divs[0]);

    // TODO: should I append links?
    // Array.prototype.forEach.call(links,l=>shadowRoot.appendChild(l))
    for (let s of scripts) {
      const script = document.createElement("script");
      script.src = s.src.replace(
        "http://localhost:5000",
        "http://localhost:7200"
      );
      iframe.contentWindow.document.body.appendChild(script);
    }
  };
  return iframe;
}

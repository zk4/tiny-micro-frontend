function createAppComponent({id, url}) {
  const iframe = document.createElement("iframe");
  iframe.hidden = true;
  iframe.src = "about:blank";
  document.body.appendChild(iframe);

  // TODO: just for debug
  window.iframe = iframe;

  const idSelector = "#" + id;
  const mainUrl = window.location.origin

  iframe.onload = function () {
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

    // TODO: this should comment out,
    // because this function get the actual subapp <div id="#app">This is vue </div>
    // interceptMethodCalls should get the same, intead get <div id="#app"></div>
    Object.defineProperty(iframe.contentWindow.document, "querySelector", {
      get() {
        return function (selector) {
          if (selector === idSelector) {
            let ret = window.parent.document
              .querySelector(selector)
              .shadowRoot.querySelector(selector);
            console.log(ret)
            return ret;
          } else {
            return null;
          }
        };
      },
    });

    const detachedDocument = readHTML(url);

    const links = detachedDocument.getElementsByTagName("link");
    const scripts = detachedDocument.getElementsByTagName("script");
    const divs = detachedDocument.getElementsByTagName("div");

    // this is shadow dom wrapper for css isolation
    const shadowContainer = document.createElement("div");
    shadowContainer.id = id;
    window.document.body.appendChild(shadowContainer);

    const shadowRoot = shadowContainer.attachShadow({mode: "open"});
    shadowRoot.appendChild(document.createElement("head"));
    shadowRoot.appendChild(divs[0]);

    // intercept all function of obj
    // obj could be anything: window.document, iframe.contentWindow.document
    function interceptMethodCalls(obj, fn) {
      for (let key in obj) {
        const prop = obj[key];
        if (typeof prop === "function") {
          const origProp = prop;
          obj[key] = (...args) => {
            fn?.before && fn.before(key, args);
            try {
              let target = obj;
              if (obj === iframe.contentWindow.document) {
                target = document;
              }
              if (obj.nodeName === "HEAD") {
                if (args[0].nodeName === "STYLE") {
                  target = shadowRoot.firstChild;
                } else if (args[0].nodeName === "SCRIPT") {
                  args[0].src = args[0].src.replace(mainUrl, url);
                  target = iframe.contentWindow.document.body;
                }
              }

              if (obj.nodeName === "BODY") {
                if (args[0].nodeName === "SCRIPT") {
                  target = iframe.contentWindow.document.body;
                  args[0].src = args[0].src.replace(mainUrl, url);
                }
              }
              /* console.log("args=>",args) */
              const ret = Reflect.apply(origProp, target, args);
              if (key.startsWith("query")) {
                console.log(i, target.nodeName, key, args, ret);
              }
              /* console.log("intercept===>", fn, args); */
              fn?.after && fn.after(key, args, ret);
              return ret;
            } catch (e) {
              //TODO: this shoud handle
              console.log(e);
            }
          };
        } else {
          if (prop && prop.nodeName === "HEAD") {
            /* console.log("===>", shadowRoot.firstChild); */
            interceptMethodCalls(prop, {
              before: (fn, args) => {
                /* console.log("before===>", fn, args); */
              },
            });
          }
        }
      }
    }

    const after = (fnName, fnArgs, ret) => {
      if (ret && ret.nodeName === "IMG") {
        interceptMethodCalls(ret, {
          before: (fn, args) => {
            // this should reset src to subapp's url
            if (fn === "setAttribute" && args[0] === "src") {
              args[1] = url + args[1];
            } else {
              /* console.log("else before===>", fn, args); */
            }
          },
        });
        /* console.log(`${fnName} called with `, fnArgs); */
      }
    };

    interceptMethodCalls(iframe.contentWindow.document, {after});

    // TODO: should I append links?
    // Array.prototype.forEach.call(links,l=>shadowRoot.appendChild(l))
    for (let s of scripts) {
      const script = document.createElement("script");
      script.src = s.src.replace(
        mainUrl,
        url
      );
      iframe.contentWindow.document.body.appendChild(script);
    }
  };
  return iframe;
}

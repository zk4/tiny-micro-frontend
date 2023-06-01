class DOMContext {
  constructor(id, url) {
    this.idSelector = "#" + id;
    this.url = url;
    this.HTMLDOM = this.#readHTML(url);
    this.mainUrl = window.location.origin;
    this.shadowRoot = this.#createShadowRoot();
    this.shadowContent = document.createElement("div");
    this.shadowRoot.appendChild(this.shadowContent);
  }
  #readHTML(url) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    const parser = new DOMParser();
    return parser.parseFromString(xmlhttp.responseText, "text/html");
  }
  getScripts() {
    let scripts = [];
    const ss = this.HTMLDOM.getElementsByTagName("script");
    for (let a of ss) scripts.push(a.src.replace("5000", "7200"));
    return scripts;
  }
  getLinks() {
    let scripts = [];
    const ss = this.HTMLDOM.getElementsByTagName("link");
    for (let a of ss) scripts.push(a.href.replace("5000", "7200"));
    return scripts;
  }

  #createShadowRoot() {
    const shadowContainer = document.createElement("div");
    document.body.append(shadowContainer);
    return shadowContainer.attachShadow({ mode: "open" });
  }
  getShadowRoot() {
    return this.shadowRoot;
  }
}

// document api work on triggerDOM will take effect on targetDOM
// for instance:
// - triggerDOM: iframe.contentWindow.document
// - targetDOM:  shadowRoot
function makeDocumentLike(triggerDOM, targetDOM) {
  for (let a in document) {
    // key in doucment not in shadowRoot
    if (!targetDOM[a]) {
      if (typeof document[a] === "function") {
        // revrse the proxy
        Object.defineProperty(targetDOM, a, {
          get() {
						console.log("proxing:", targetDOM,a, "-->",triggerDOM);
            return triggerDOM[a].bind(triggerDOM);
          },
        });
      } else {
        Object.defineProperty(targetDOM, a, {
          get() {
						console.log("proxing:", targetDOM,a, "-->",triggerDOM);
            return triggerDOM[a];
          },
        });
      }
      // key in doucment in shadowRoot, like append
    } else {
      if (typeof document[a] === "function") {
        Object.defineProperty(triggerDOM, a, {
          get() {
						console.log("proxing:", triggerDOM,a, "-->",targetDOM);
            return targetDOM[a].bind(targetDOM);
          },
        });
      } else {
      }
    }
  }
}
class JSContext {
  injectJsTag(src, isModule) {
    const script = document.createElement("script");
    script.src = src;
    if (isModule) {
      script.type = "module";
    } else {
      script.type = "text/javascript";
    }
    this.iframe.contentWindow.document.head.appendChild(script);
  }

  constructor() {
    this.iframe = document.createElement("iframe");
    this.iframe.hidden = true;
    this.iframe.src = "about:blank";
    this.ready = false;
    document.body.appendChild(this.iframe);
    this.iframe.onload = () => {
      console.log("onload");
      this.ready = true;
    };
  }
}

class AppComponent {
  constructor(id, url) {
    this.domContext = new DOMContext(id, url);
    this.jsContext = new JSContext();

    makeDocumentLike(
      this.jsContext.iframe.contentWindow.document,
      this.domContext.shadowRoot
    );

    let scs = this.domContext.getScripts();
    console.log(scs);

    this.jsContext.injectJsTag(scs[0], false);
    this.jsContext.injectJsTag(scs[1], false);
    // const div = this.jsContext.iframe.contentWindow.document.createElement("div")
    // this.jsContext.iframe.contentWindow.document.appendChild(div)
  }
}
new AppComponent("app", "http://localhost:7200");

// function createAppComponent({ id, url }) {

//
//   // append html, css to shadow
//   injectJsTag("http://localhost:7900/js/chunk-vendors.js", () => {});
//
//   // proxy iframe.docuemnt to shadow
//
//   // append js to iframe
//
//   console.log(dom);
//
//   iframe.onload = function () {};
// }
// createAppComponent({ id: "app", url: "http://localhost:7200" });

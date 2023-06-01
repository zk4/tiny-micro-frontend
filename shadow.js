class DOMContext {
  constructor(id, url) {
    this.idSelector = "#" + id;
    this.url = url;
    this.HTMLDOM = this.#readHTML(url);
    this.mainUrl = window.location.origin;
    this.shadowRoot = this.#createShadowRoot();
    const html = document.createElement("html");
    const head = document.createElement("head");
    const body = document.createElement("body");
    const div = document.createElement("div");
    div.id = id;

    html.appendChild(head);
    body.appendChild(div);
    html.appendChild(body);

    this.shadowRoot.appendChild(html);
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
// - css node in js go into  shadowRoot
// - non css node in js go into iframe
function reConnect(triggerDOM, targetDOM) {
  for (let a in targetDOM) {
    if (typeof targetDOM[a] === "function") {
      Object.defineProperty(triggerDOM, a, {
        get() {
          return (...val) => {
            console.log("2 proxing:", triggerDOM, a, val, "-->", targetDOM);
            return targetDOM[a].apply(targetDOM, val);
          };
        },
      });
    } else {
      Object.defineProperty(triggerDOM, a, {
        get() {
          const ret = targetDOM[a];
          console.log("3  proxing:", triggerDOM, a, ret, "-->", targetDOM);
					// TODO: 
          return ret;
        },
      });
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

		// trigger frame document  -->  shadowRoot
    reConnect(
      this.jsContext.iframe.contentWindow.document,
      this.domContext.shadowRoot
    );

    let scs = this.domContext.getScripts();
    console.log(scs);

    this.jsContext.injectJsTag(scs[0], false);
    this.jsContext.injectJsTag(scs[1], false);
  }
}
new AppComponent("app", "http://localhost:7200");

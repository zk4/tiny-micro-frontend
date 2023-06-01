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
    html.appendChild(body);
    body.appendChild(div);

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

class JSContext {
  injectJsTag(src) {
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    this.iframe.contentWindow.document.head.appendChild(script);
  }

  constructor() {
    this.iframe = document.createElement("iframe");
    this.iframe.hidden = true;
    this.iframe.src = "about:blank";
    this.ready = false;
    document.body.appendChild(this.iframe);
    this.iframe.onload = () => {
      this.ready = true;
      console.log("iframe onload");
    };
  }
  getIdocument() {
    return this.iframe.contentWindow.document;
  }
}

class AppComponent {
  constructor(id, url) {
    this.domContext = new DOMContext(id, url);
    this.jsContext = new JSContext();
    this.iframeDocument = this.jsContext.getIdocument();

    let scs = this.domContext.getScripts();
    for (let i = 0; i < scs.length; i++) {
      this.jsContext.injectJsTag(scs[i]);
    }
    this.reConnect(
      this.jsContext.iframe.contentWindow.document,
      this.domContext.shadowRoot
    );
  }

  // document api work on triggerDOM will take effect on targetDOM
  // for instance:
  // - triggerDOM: iframe.contentWindow.document
  // - targetDOM:  shadowRoot
  // - css node in js go into  shadowRoot
  // - non css node in js go into iframe
  reConnect(triggerDOM, targetDOM) {
    // TODO: refactor this out, so ugly
    const iFrameHeadAppendChild = triggerDOM.head.appendChild.bind(
      triggerDOM.head
    );

    for (let a in triggerDOM) {
      // 1. function reconect
      if (typeof triggerDOM[a] === "function") {
        let oldf = triggerDOM[a];
        Object.defineProperty(triggerDOM, a, {
          configurable: true,
          get() {
            return (...val) => {
              if (!targetDOM[a]) {
                // create does not matter what parent is, it matters when parent add it
                const ret = oldf.apply(triggerDOM, val);
                if (ret.nodeName === "IMG") {
                  console.log("NOT exit function in targetDOM", a, val, ret);
									const oldSetAttribute =  ret.setAttribute.bind(ret)
                  Object.defineProperty(ret, "setAttribute", {
                    get() {
											// handle img url  
											return (...val2) => {
												if(val2[0]==="src"){
													val2[1]="http://127.0.0.1:7200/"+val2[1]
												}
												// debugger
												console.log(val2)
												return oldSetAttribute.apply(ret,val2)
											};
                    },
                  });
                  // const p = new Proxy(ret,{
                  // 	get(target, p, receiver){
                  // 		return Reflect.get(target, p)
                  // 	},
                  // 	set(target, p, newValue, receiver){
                  // 		return Reflect.set(target, p, newValue)
                  // 	},
                  // 	defineProperty(target, property, attributes){
                  // 		debugger
                  // 		return Reflect.defineProperty(target, property, attributes)
                  // 	}
                  // })
                  // return p;
                }
                return ret;
              } else {
                console.log("1 proxing:", triggerDOM, a, val, "-->", targetDOM);
                return targetDOM[a].apply(targetDOM, val);
              }
            };
          },
        });
        // 2. property reconect
      } else {
        // Object.defineProperty not allowed for these properties
        if (["location"].includes(a)) continue;

        let old = triggerDOM[a];
        Object.defineProperty(triggerDOM, a, {
          configurable: true,
          get() {
            // shadowDOM does not have head and body like document does
            // manully redirect it
            if (a === "head") {
              // TODO: refactor this out, so ugly
              const head = targetDOM.firstChild.childNodes[0];
              const oldAppend = head.appendChild;
              Object.defineProperty(head, "appendChild", {
                configurable: true,
                get() {
                  return (...val) => {
                    if (val[0].nodeName === "SCRIPT") {
                      val[0].src = val[0].src.replace("5000", "7200");
                      return iFrameHeadAppendChild(val[0]);
                    } else return oldAppend.apply(head, val);
                  };
                },
              });
              return head;
            }

            if (a === "body") {
              // TODO: refactor this out, so ugly
              return targetDOM.firstChild.childNodes[1];
            }

            if (a === "documentElement") {
              // TODO: refactor this out, so ugly
              return targetDOM.firstChild;
            }

            const ret = targetDOM[a];
            if (!ret) {
              console.log(
                "NOT exit property in targetDOM",
                a,
                "fallback to:",
                old
              );
              return old;
            }
            // const proxyRet = new Proxy(ret, {
            //   get(target, p, receiver) {
            //     console.log("....");
            //     return Reflect.get(target, p);
            //   },
            //   defineProperty(target, property, attributes) {
            //     console.log("....");
            //     return Reflect.defineProperty(target, property, attributes);
            //   },
            //   apply(target, thisArg, argArray) {
            //     console.log("....");
            //     return Reflect.defineProperty(target, thisArg, argArray);
            //   },
            //   set(target, p, newValue, receiver) {
            //     console.log("....");
            //     Reflect.set(target, p, newValue);
            //   },
            // });
            return ret;
          },
        });
      }
    }
  }
}
new AppComponent("app", "http://localhost:7200");

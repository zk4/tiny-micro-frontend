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

// document api work on triggerDOM will take effect on targetDOM
// for instance:
// - triggerDOM: iframe.contentWindow.document
// - targetDOM:  shadowRoot
// - css node in js go into  shadowRoot
// - non css node in js go into iframe
function reConnect(triggerDOM, targetDOM) {
  const  iFrameHeadAppendChild=triggerDOM.head.appendChild.bind(triggerDOM.head)

  for (let a in triggerDOM) {
    if (typeof triggerDOM[a] === "function") {
      let oldf = triggerDOM[a];
      Object.defineProperty(triggerDOM, a, {
				configurable: true,
        get() {
          return (...val) => {
            if (!targetDOM[a]) {
							if(!a.startsWith("create"))
              	console.log("NOT exit function in targetDOM", a,val);
              return oldf.apply(triggerDOM,val);
            } else {
              console.log("2 proxing:", triggerDOM, a, val, "-->", targetDOM);
              return targetDOM[a].apply(targetDOM, val);
            }
          };
        },
      });
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

						// TODO:vue would attach dynamic js to header
						const head  = targetDOM.firstChild.childNodes[0];
						const oldAppend = head.appendChild
						Object.defineProperty(head,'appendChild', {
							configurable: true,
							get(){
								return (...val)=>{
									if(val[0].nodeName === "SCRIPT"){
										val[0].src= val[0].src.replace("5000", "7200")
										//TODO: should append to shadow
										return iFrameHeadAppendChild(val[0])
									}
									else
									return oldAppend.apply(head,val)
								}
							}
						})
						return head;
          }
          if (a === "body") {
            return targetDOM.firstChild.childNodes[1];
          }
					if (a === "documentElement"){
            return targetDOM.firstChild;
					}
          const ret = targetDOM[a];
          if (!ret) {
						console.log("NOT exit property in targetDOM", a, "fallback to:",old);
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
}

class AppComponent {
  constructor(id, url) {
    this.domContext = new DOMContext(id, url);
    this.jsContext = new JSContext();

    let scs = this.domContext.getScripts();
    for (let i = 0; i < scs.length; i++) {
      this.jsContext.injectJsTag(scs[i]);
    }
    reConnect(
      this.jsContext.iframe.contentWindow.document,
      this.domContext.shadowRoot
    );
  }
}
new AppComponent("app", "http://localhost:7200");

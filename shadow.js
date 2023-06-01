class DOMContext {
  constructor(id, url) {
    this.idSelector = "#" + id;
    this.url = new URL(url);
    this.location = window.location;

    this.HTMLDOM = this.readHTML(url);
    this.mainUrl = window.location.origin;
    this.shadowRoot = this.createShadowRoot();
    const html = document.createElement("html");

    // prevent the shadowRoot from getComputedStyle
    Object.defineProperty(html,'parentNode',{
      get(){
        // TODO: should I return iframe.contentWindow.document?
        return null;
      }
    })
    this.head = document.createElement("head");
    const body = document.createElement("body");
    const div = document.createElement("div");
    div.id = id;

    html.appendChild(this.head);
    html.appendChild(body);
    body.appendChild(div);

    this.shadowRoot.appendChild(html);
  }
  injectStyleText(text){
    const script = document.createElement("style");
    script.innerText = text;
    this.head.appendChild(script);
  }
  injectStyleTag(href){
    debugger
    const script = document.createElement("style");
    script.href = href;
    // script.type = "text/javascript";
    this.head.appendChild(script);

  }
  readHTML(url) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    const parser = new DOMParser();
    return parser.parseFromString(xmlhttp.responseText, "text/html");
  }
  getScripts() {
    let scripts = [];
    const ss = this.HTMLDOM.getElementsByTagName("script");
    for (let a of ss) scripts.push(a.src);
    return scripts;
  }
  getStyles() {
    let styles = [];
    const ss = this.HTMLDOM.getElementsByTagName("style");
    for (let a of ss) styles.push({
      href: a.href,
      innerText: a.innerText
    });
    return styles;
  }

  createShadowRoot() {
    const shadowContainer = document.createElement("div");
    document.body.append(shadowContainer);
    return shadowContainer.attachShadow({mode: "open"});
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
      // console.log("iframe onload");
    };
  }
  getIdocument() {
    return this.iframe.contentWindow.document;
  }
}

class AppComponent {
  constructor(id, url) {
    this.id = id;
    this.url = new URL(url);
    this.location = window.location
    this.domContext = new DOMContext(id, url);
    this.jsContext = new JSContext();
    this.iframeDocument = this.jsContext.getIdocument();

    let scs = this.domContext.getScripts();
    for (let i = 0; i < scs.length; i++) {
      this.jsContext.injectJsTag(this.correctUrl(scs[i]));
    }

    let sts = this.domContext.getStyles();
    for (let i = 0; i < sts.length; i++) {
      if(sts[i].href)
        this.domContext.injectStyleTag(this.correctUrl(sts[i].href));
      if(sts[i].innerText)
        this.domContext.injectStyleText(sts[i].innerText);
    }
    this.reWired(
      this.jsContext.iframe.contentWindow.document,
      this.domContext.shadowRoot
    );
  }

  correctUrl(src){
    if(src){
      if(src.startsWith("http"))
        src = src.replace(this.location.origin, this.url.origin);
      else
      src = this.url.origin+"/"+src;
    }
    return src
  }

  // document api work on triggerDOM will take effect on targetDOM
  // for instance:
  reWired(triggerDOM, targetDOM) {
    let that = this
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

                // there is no need to care about create function
                if(!a.startsWith("create"))
                  console.log("NOT exit function in targetDOM", a, val, ret);

                if (ret.nodeName === "IMG") {
                  // console.log("NOT exit function in targetDOM", a, val, ret);
                  const oldSetAttribute = ret.setAttribute
                  Object.defineProperty(ret, "setAttribute", {
                    get() {
                      // TODO: refactor out
                      // handle img src rewriting
                      return (...val2) => {
                        if(val2.length>2){
                          debugger
                        }
                        if (val2[0] === "src") {
                          val2[1] = that.correctUrl(val2[1])
                        }
                        return oldSetAttribute.apply(ret, val2)
                      };
                    },
                  });
                }
                return ret;
              } else {
                // console.log("1 proxing:", triggerDOM, a, val, "-->", targetDOM);
                return targetDOM[a].apply(targetDOM, val);
              }
            };
          },
        });
        // 2. property reconect
      } else {
        // Object.defineProperty not allowed for these properties for security reason, fair point
        if (["location"].includes(a)) continue;

        let old = triggerDOM[a];
        Object.defineProperty(triggerDOM, a, {
          configurable: true,
          get() {
            // shadowDOM does not have head or body like document does
            // manully redirect it
            if (a === "head") {
              // TODO: refactor this out, so ugly
              const head = targetDOM.firstChild.childNodes[0];
              const oldAppend = head.appendChild;
              Object.defineProperty(head, "appendChild", {
                configurable: true,
                get() {
                  return (...val) => {
                    if(val.length>1){
                      debugger
                    }
                    if (val[0].nodeName === "SCRIPT") {
                      val[0].src = that.correctUrl(val[0].src)
                      console.log("url:",val[0].src)
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
            return ret;
          },
        });
      }
    }
  }
}
new AppComponent("app", "http://localhost:7300/");

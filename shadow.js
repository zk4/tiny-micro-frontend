class DOMContext {
  constructor(id, url) {
    this.idSelector = "#" + id;
    this.url = url;
    this.HTMLDOM = this.#readHTML(url);
    this.shadowRoot = this.#createShadowRoot();
    this.shadowContent = document.createElement('div');
		this.shadowRoot.appendChild(this.shadowContent)
  }
  #readHTML(url) {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    const parser = new DOMParser();
    return parser.parseFromString(xmlhttp.responseText, "text/html");
  }
  getScripts() {
    return Array.prototype.map.call(
      this.HTMLDOM.getElementsByTagName("script"),
      (a) => a.src
    );
  }
  getLinks() {
    // console.log(this.HTMLDOM.getElementsByTagName("link"))
    return Array.prototype.map.call(
      this.HTMLDOM.getElementsByTagName("link"),
      (a) => a.href
    );
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
function makeDocumentLike(triggerDOM,targetDOM) {
	for (let a in document) {
		// key in doucment not in shadowRoot
		if (!targetDOM[a]) {
			if (typeof document[a] === "function") {
				// revrse the proxy
				Object.defineProperty(targetDOM, a, {
					get() {
						console.log("proxing:",a)
						return triggerDOM[a].bind(triggerDOM);
					},
				});
			} else {
				Object.defineProperty(targetDOM, a, {
					get() {
						console.log("proxing:",a)
						return triggerDOM[a];
					},
				});
			}
		// key in doucment in shadowRoot, like append
		} else {
				Object.defineProperty(triggerDOM, a, {
					get() {
						console.log("proxing:",a)
						return targetDOM[a].bind(targetDOM);
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

    makeDocumentLike(this.jsContext.iframe.contentWindow.document,this.domContext.shadowRoot);

    console.log(this.domContext.getScripts());
    console.log(this.domContext.getLinks());

		const div = this.jsContext.iframe.contentWindow.document.createElement("div")
		this.jsContext.iframe.contentWindow.document.appendChild(div)
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

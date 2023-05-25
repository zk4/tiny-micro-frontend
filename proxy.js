const originalcreateElement = document.createElement;
Object.defineProperty(document, "createElement", {
  get() {
    return function (...args) {
      return originalcreateElement.call(document, ...args);
    };
  },
});

const appDiv = window.parent.document.createElement("div");
appDiv.id = "app";
appDiv.innerHTML="hello form proxy"
window.parent.document.body.appendChild(appDiv);

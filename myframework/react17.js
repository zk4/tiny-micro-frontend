
createIframe("react17", (iframe, inject, injectJsTag) => {
  const react = `
							const { useState } = React;

						function App() {
							const [counter, setCounter] = useState(0);

							const incrementCounter = () => {
								setCounter(counter + 1);
							};

							return React.createElement(
										"div",
										null,
										React.createElement("button", { onClick: incrementCounter }, "React2 Click Me"),
										React.createElement("label", null, counter)
									)
						}

						ReactDOM.render( React.createElement(App, null),document.querySelector('#react17'));
				`;
  injectJsTag("./react.development.js", iframe, () => {
    injectJsTag("./react-dom.development.js", iframe, () => {
      // js 是异步的, 要等待返回
      inject(react, iframe, "module");
    });
  });
});

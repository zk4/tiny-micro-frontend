 // onEvent set
  const windowOnEvents = Object.getOwnPropertyNames(window)
    .filter((p) => /^on/.test(p))

  // 走主应用window
  windowOnEvents.forEach((e) => {
    const descriptor = Object.getOwnPropertyDescriptor(iframeWindow, e) || {
      enumerable: true,
      writable: true,
    };
    try {
      Object.defineProperty(iframeWindow, e, {
        enumerable: descriptor.enumerable,
        configurable: true,
        get: () => window[e],
        set:
          descriptor.writable || descriptor.set
            ? (handler) => {
                window[e] = typeof handler === "function" ? handler.bind(iframeWindow) : handler;
              }
            : undefined,
      });
    } catch (e) {
      warn(e.message);
    }
  });




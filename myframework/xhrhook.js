// 创建一个XMLHttpRequest对象的原始引用
var originalXhr = window.XMLHttpRequest;

// 重写XMLHttpRequest对象
function CustomXHR() {
  var xhr = new originalXhr();

  // 拦截open方法
  var originalOpen = xhr.open;
  xhr.open = function(method, url, async) {
    // 替换URL中的字符串
		console.log("before url",url)
    url = url.replace('http://localhost:5000/myframework', 'http://localhost:7200');
		console.log("after url",url)

    // 调用原始的open方法
    originalOpen.call(xhr, method, url, async);
  };

  return xhr;
}

// 替换原始的XMLHttpRequest对象
window.XMLHttpRequest = CustomXHR;

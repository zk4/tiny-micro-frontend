
function readDOM(url)
{
	xmlhttp=new XMLHttpRequest();
	// TODO: maybe we can use async,modify 3th arg to true
	xmlhttp.open("GET",url,false);
	xmlhttp.send();
	const parser=new DOMParser();
	console.log(xmlhttp.responseText)
	let detachedDOM = parser.parseFromString(xmlhttp.responseText,"text/html");
	return detachedDOM;
}


/* let dom = readDOM('http://127.0.0.1:7200') */
/* function parse(url) */
/* console.log(dom.getElementsByTagName("div")[0]) */
/* console.log(dom.getElementsByTagName("link")) */
/* console.log(dom.getElementsByTagName("script")) */


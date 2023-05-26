function callme(callback) {
  setTimeout(() => {
    callback("hell");
  }, 10);
}

callme((ret) => {
  console.log(ret);
});

// -------------------------------
function callme2() {
  let ret = new Promise((resolve) => {
    setTimeout(() => {
			resolve("hell")
    }, 10);
  });
  return ret;
}

callme2().then((r) => {
  console.log(r);
});

// -------------------------------
async function callme3(){
	return await callme2()
}


(async ()=>{
	let a  =await callme2();
	console.log(a)
})();

(async ()=>{
	let a  =await callme3();
	console.log(a)
})();



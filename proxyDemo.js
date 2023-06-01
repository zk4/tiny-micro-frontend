let obj = {
  a: 333,
  c: () => {
    console.log("dfdf");
  },
};


let p =new Proxy(obj,{
	get(target, p, receiver){
		console.log(".........")
		return Reflect.get(target, p)
	}
})

console.log(p.c())


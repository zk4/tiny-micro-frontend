let obj = {
  a: 333,
  c: () => {
    console.log("dfdf");
	},
	d:[1,2,3]
};


let p =new Proxy(obj,{
	get(target, p, receiver){
		console.log(".........")
		return Reflect.get(target, p)
	}
})

console.log(p.d[1])


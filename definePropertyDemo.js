let obj = {
  cartId: 123,
  shipping: "12 somewhere",
  callme(d) {
    console.log(d, this.cartId);
  },
};

function print() {
  console.log("-------------");
  for (let a in obj) {
    console.log(a, obj[a]);
  }
}

// print();
// Object.defineProperty(obj, "shipping", {
//   enumerable: false,
// });
// print();
//
// Object.defineProperty(obj, "shipping", {
//   enumerable: true,
// });
// print();
//
// Object.defineProperty(obj, "shipping", {
//   value: "new value",
//   writable: false,
// });
// print();
//
// Object.defineProperty(obj, "shipping", {
//   get() {
//     console.log("log...");
//     return "accessor" + this._innerValue;
//   },
//   set(val) {
//     this._innerValue = val;
//   },
// });
// print()



// Object.defineProperty(obj, "callme", {
// 	orignfunc: obj.cartId,
//   get() {
//     console.log("get",this.orignfunc);
// 		return (val)=>{
// 			this.good(val)
// 			// this.orignfunc(val)
//
// 		};
//   },
//   set(val) {
//     console.log("setted");
//     this.good = val;
//   },
// });
//
// obj.callme = (df) => {
//   console.log(df);
// };
// obj.callme("df");


function MyClass() {}

let value;
Object.defineProperty(MyClass.prototype, "x", {
  get() {
		console.log(this)
    return this.value;
  },
  set(x) {
    this.value = x;
  },
});

const a = new MyClass();
const b = new MyClass();
a.x = 1;
console.log(a.x); // 1
console.log(b.x); // 1

let obj = {
  cartId: 123,
  shipping: '12 somewhere'
}

function print() {
  console.log("-------------")
  for (let a in obj) {
    console.log(a, obj[a])
  }
}

/* print() */
/* Object.defineProperty(obj, 'shipping', { */
/*   enumerable: false, */
/* }) */
/* print() */
/**/
/* Object.defineProperty(obj, 'shipping', { */
/*   enumerable: true */
/* }) */
/* print() */

Object.defineProperty(obj, 'shipping', {
  value: 'new value',
  writable: false,
})
print()

Object.defineProperty(obj, 'shipping', {
  _innerValue: obj.shipping,
  get() {
    console.log("log...")
    return 'accessor' + this._innerValue
  },
  set(val) {
    this._innerValue = val
  }
})

print()
obj.shipping = "outer changed"
print()

// const t:HTMLElement = document.getElementById("hello");

let element: HTMLElement | null = document.getElementById("myElement") ;

element!.textContent = "Hello, TypeScript!";
element?.classList.add("highlight");
 

# tiny micro-frontend framework idea validation

1. using shadow dom to isolate css
2. using iframe to isolate js

![image-20230526185712808](assets/image-20230526185712808.png)

# todo

- [ ] router
 - [ ] hash
 - [ ] history
- [ ] tag have 2 kinds
 - js
     - [x] link
     - [ ] innerText
 - css
     - [ ] link
     - [x] innerText

- [ ] element arrow icon does not work
- [ ] vue 3 does not work
 - router bug
- [ ] react 17 does not work
- [ ] react 16 does not work
- [ ] vite does not work

- [ ] <base> for relative path 

bugs from wujie issue
- [ ] @font-face won't load in shadowDOM
  <https://robdodson.me/posts/at-font-face-doesnt-work-in-shadow-dom/>
  Maybe I can do as it says, pull all @font-face to the parent...

  <https://github.com/microsoft/vscode/issues/159877>
  vscode alread consider this is not a bug.

  <https://github.com/Tencent/wujie/pull/33>
  wujie already get around this problem



# how to dev

use any liveload tools to serve myframework folder

```
cd myframework
livehttp

```






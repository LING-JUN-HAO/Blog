---
title: 建立自己的部落格：認識Hexo及所其需工具(Nodejs & Git)
date: 2023-10-16 08:30:27
tags:
  - Hexo
  - Node.js
  - Git
categories:
  - Blog
description: 打造屬於自己風格的部落格其實不難，讓我們一步步手把手教你如何實現這個目標。
---

![Blog背景圖](https://res.cloudinary.com/dseg0uwc9/image/upload/f_auto,q_auto,w_1200,h_675,c_fill/v1769440243/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E5%BB%BA%E7%AB%8B%E8%87%AA%E5%B7%B1%E7%9A%84%E9%83%A8%E8%90%BD%E6%A0%BC_%E8%AA%8D%E8%AD%98Hexo%E5%8F%8A%E6%89%80%E5%85%B6%E9%9C%80%E5%B7%A5%E5%85%B7_Nodejs_Git_km4aut.jpg)

## 前言

雖然網路上充斥著各式架設網站的教學，但當我真正動手操作時，發現還有許多細節值得探討和設定。為了幫助更多有此需求的朋友，我決定將這些寶貴的經驗細節記錄下來。架設部落格其實並不困難，只要跟著我的步伐，你也可以輕鬆擁有一個專屬於自己的部落格。

## 什麼是Hexo呢?

- Hexo 是一個快速、簡單且強大的部落格框架，透過設定檔調整即可將對應的網頁進行樣式變更
- 使用Markdown(md)語法撰寫屬於自己的文章

## 開始安裝看看

首先要先介紹我們要安裝的兩個軟體Node.js及Git安裝流程

### Nodejs程式語言安裝

![Nodejs程式語言官方載點](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007038/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-1/Nodejs%E7%A8%8B%E5%BC%8F%E8%AA%9E%E8%A8%80%E5%AE%98%E6%96%B9%E8%BC%89%E9%BB%9E.png)

- 🔗 [Nodejs程式語言官方載點請點我](https://nodejs.org/en)
  - 建議使用Node.js 10.0及以上版本
  - 點選<strong><code>Recommended For Most Users</code></strong>推薦版本(通常使用上相較右邊最新版本穩定)
  - 安裝上都按照預設點選下一步直至完成即可

### 檢驗Nodejs安裝完成

- 在命令提示字元(Command Line)中輸入以下指令即可確認當前Nodejs版本
  <strong>[(如果不知道命令提示字元怎麼開請點我)](#command-line)</strong>

```text
nodejs -v
```

- ![Nodejs版本查詢](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007034/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-1/Nodejs%E7%89%88%E6%9C%AC%E6%9F%A5%E8%A9%A2.png)
- 有寫版本號碼就代表安裝完成囉!!!

---

### Git版本控制系統安裝

![Git版本控制系統官方載點](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007040/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-1/Git%E7%89%88%E6%9C%AC%E6%8E%A7%E5%88%B6%E7%B3%BB%E7%B5%B1%E5%AE%98%E6%96%B9%E8%BC%89%E9%BB%9E.png)

- 點選對應的電腦系統(Windows、macOS、Linux/Unix)

![按照對應的位元數進行下載](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007035/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-1/%E6%8C%89%E7%85%A7%E5%B0%8D%E6%87%89%E7%9A%84%E4%BD%8D%E5%85%83%E6%95%B8%E9%80%B2%E8%A1%8C%E4%B8%8B%E8%BC%89.png)

- 按照對應的位元數進行下載
  <strong>[(如果不知道位元數哪裡看請點我)](#bits)</strong>

- 安裝上都按照預設點選下一步直至完成即可

### 檢驗Git安裝完成

- 在命令提示字元(Command Line)中輸入以下指令即可確認當前Nodejs版本
  [(如果不知道命令提示字元怎麼開請點我)](#command-line)

```text
git -v
```

![git版本查詢](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007036/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-1/git%E7%89%88%E6%9C%AC%E6%9F%A5%E8%A9%A2.png)

- 有寫版本號碼就代表安裝完成囉!!!

---

<a id="bits"></a>

## 如何查看電腦系統位元數?

- Step 1：在搜尋框輸入<strong><code>系統</code></strong>點開

![檢查自己電腦位元數](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007037/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-1/%E6%AA%A2%E6%9F%A5%E8%87%AA%E5%B7%B1%E9%9B%BB%E8%85%A6%E4%BD%8D%E5%85%83%E6%95%B8.png)

Step 2：<strong><code>系統</code></strong>這邊可以查看電腦位元數
![查看電腦位元數](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007036/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-1/%E6%AA%A2%E6%9F%A5%E8%87%AA%E5%B7%B1%E9%9B%BB%E8%85%A6%E4%BD%8D%E5%85%83%E6%95%B8.png)

<a id="command-line"></a>

## 如何開啟命令提示字元介面

![電腦終端機介面檢查](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007034/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-1/%E9%9B%BB%E8%85%A6%E7%B5%82%E7%AB%AF%E6%A9%9F%E4%BB%8B%E9%9D%A2%E6%AA%A2%E6%9F%A5.png)

- 點選<strong><code>搜尋框</code></strong>輸入cmd(cmd：Command Line)
- 點選<strong><code>命令提示字元</code></strong>(與電腦溝通的介面)

---

## 結尾

希望讓想架設部落格的任何人，都可以有第一步可以踏出(跟我一樣)。

---

## 參考資料

[1] [Hexo官方文件](https://hexo.io/zh-tw/docs/)

---
title: 建立自己的部落格：了解Hexo指令，更換next部落格主題
date: 2023-10-20 14:33:38
tags:
  - [Hexo]
  - [NexT]
  - [git clone]
  - [Hexo指令]
categories:
  - [Blog]
description: 今天的你跟我都是Hexo指令指揮官，讓我們將部落格造型大改造一下吧!!!
---

![Blog背景圖](https://res.cloudinary.com/dseg0uwc9/image/upload/f_auto,q_auto,w_1200,h_675,c_fill/v1769445312/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E5%BB%BA%E7%AB%8B%E8%87%AA%E5%B7%B1%E7%9A%84%E9%83%A8%E8%90%BD%E6%A0%BC_%E4%BA%86%E8%A7%A3Hexo%E6%8C%87%E4%BB%A4_%E6%9B%B4%E6%8F%9Bnext%E9%83%A8%E8%90%BD%E6%A0%BC%E4%B8%BB%E9%A1%8C_gcknwi.jpg)

## Hexo常用指令說明

### hexo init 初始化資訊

- 在當前路徑下建造hexo初始化的相關資訊
  (Day2使用過此指令，在一開始初始化並生成Hexo資訊的時候使用)

```text
hexo init
```

### hexo new title 生成文章

- 創建一篇文章(<strong><code>`<title>`</code></strong>要記得替換成你想使用的文章名稱)
- 創文章流程：
  - 文章會根據<strong><code>./scaffolds</code></strong>路徑下的<strong><code>post.md</code></strong>模板生成文章格式
  - 生成完的文章會在<strong><code>./source/\_posts</code></strong>路徑下生成

```text
hexo new <title>
```

### hexo g 生成靜態檔案

- 在./public的路徑下生成靜態檔案
  (會將文章的md檔案轉換成html的檔案)
- g是generate的縮寫

```text
hexo g
```

### hexo s 本地伺服器預覽畫面

- 啟動本地伺服器
  (可以在自己電腦上預覽部落格樣式及文章內容)
- s是server的縮寫

```text
hexo s
```

### hexo d 部屬靜態檔案至上線環境

- 部署public生成的靜態檔案至網站讓其他人也能看到你的文章
- d是deploy的縮寫

```text
hexo d
```

### hexo clean 清除快取資源及已生成的靜態檔案

- 清除快取檔案<strong><code>db.json</code></strong>及<strong><code>./puclic</code></strong>路徑下已生成的靜態檔案

```text
hexo clean
```

## 更換部落格主題

這邊使用大家較常使用的版型Next，等等將會拉取以下檔案至本地喔
<strong>[Next官方Github資料請點我查看](https://github.com/theme-next/hexo-theme-next)</strong>

### 前置工作

- Step 1:進去hexo init初始化的資料夾
- Step 2:在資料夾路徑的部分輸入cmd打開當前路徑的命令提示字元

---

### 將next模板資料拉取至本地上

- 輸入以下指令，將github的資料拉取至本機電腦上

```text
git clone https://github.com/theme-next/hexo-theme-next themes/next
```

- 當安裝完成時，可以看到<strong><code>./themes</code></strong>路徑下多了<strong><code>next</code></strong>的資料夾，裡面已經有剛剛下載的模板資料了

![Next安裝完成](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007050/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-4/Next%E5%AE%89%E8%A3%9D%E5%AE%8C%E6%88%90.jpg)

### 修改根目錄下的\_config.yml檔案(不是next資料夾下的喔!!!)

![修改根目錄下的設定檔](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007050/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-4/%E4%BF%AE%E6%94%B9%E6%A0%B9%E7%9B%AE%E9%8C%84%E4%B8%8B%E7%9A%84%E8%A8%AD%E5%AE%9A%E6%AA%94.png)

- 看到theme: landscape的部分，我們要換掉，換成自己的模板next
  (請修改如下)

```text
theme: next
```

---

### 查看next的模板新世界吧> <

- 輸入以下指令

```text
hexo s
```

- 透過瀏覽器查看當前部落格新造型
  (http://localhost:4000/)

![next模板造型](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007049/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-4/next%E6%A8%A1%E6%9D%BF%E9%80%A0%E5%9E%8B.png)

## 結尾

看到新造型感覺越來越有樣子了吧!!!希望我們都能夠將部落格布置成每個人獨一無二的秘密基地。

---

## 參考資料

[1] [Hexo官方文件-指令](https://hexo.io/zh-tw/docs/)

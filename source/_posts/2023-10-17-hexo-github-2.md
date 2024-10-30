---
title: 建立自己的部落格(2)：創建Hexo Blog初始的模板
date: 2023-10-17 15:59:37
tags:
- [Hexo]
categories:
- [Blog]
description: 踏出那關鍵的第一步，從白紙到完整的部落格，一同見證你的部落格誕生的奇妙時刻。
---
![Blog背景圖](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007060/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/web_icuxev.jpg)

## 安裝Hexo手把手教學

- 在你的桌面上建立一個資料夾

![建立新資料夾](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007042/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/%E8%B3%87%E6%96%99%E5%A4%BE%E4%BD%BF%E7%94%A8cmd.png)

- 點進去資料夾之後在資料夾路徑的位置上輸入cmd按下Enter按鍵

![利用資料夾打開cmd](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007038/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/cmd%E9%A1%AF%E7%A4%BA%E7%95%B6%E5%89%8D%E8%B7%AF%E5%BE%91.png)

### 安裝項目-hexo-cli

- 輸入以下指令安裝，讓你也能使用Hexo命令列功能

```text
npm install -g hexo-cli
```

![hexo-cli安裝](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007040/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/hexo-cli%E5%AE%89%E8%A3%9D.png)

## 檢查hexo-cli安裝完成

![檢驗hexo-cli安裝完成](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007040/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/%E6%AA%A2%E9%A9%97hexo-cli%E5%AE%89%E8%A3%9D%E5%AE%8C%E6%88%90.png)

- 確認顯示版本號代表已安裝完成

---

## 初始化Hexo檔案

- 輸入以下指令產生Hexo初始化需要的檔案及資料夾
<strong>[如果出現黃色訊息的意外情況請點我](#hexo-init-bug)</strong>

```text
hexo init
```

## 檢查Hexo安裝成功

![Hexo安裝成功](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007041/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/Hexo%E5%AE%89%E8%A3%9D%E6%88%90%E5%8A%9F.png)

- 成功看到<strong><code>Start blogging with Hexo!</code></strong>代表安裝完成囉

![Hexo初始化成功資料夾](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007042/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/Hexo%E5%88%9D%E5%A7%8B%E5%8C%96%E6%88%90%E5%8A%9F%E8%B3%87%E6%96%99%E5%A4%BE.png)

- 可以看到剛剛的資料夾中出現了許多資料夾及檔案

---

## 部落格產生(預設版本)

- 在前面我們產生的cmd介面中輸入以下指令即可看到預設的版本
(指令意思是啟動本地服務器預覽部落格畫面，預設Port使用4000)
- <strong>[如果出現黃色訊息的意外情況請點我](#PortInUse)</strong>

```text
hexo s
```

- 打開你的瀏覽器(Chrome、Edge)
- 輸入以下的網址

```text
http://localhost:4000/
```

![Hexo預設網站](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007040/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/Hexo%E9%A0%90%E8%A8%AD%E7%B6%B2%E7%AB%99.png)

- 出現這個畫面代表你已經成功架設起屬於自己的部落格了

---

## Hexo初始化資料夾講解

- _config.yml
  - 部落格的設定檔
- scaffolds
  - Markdown(md)檔案生成的模板
    - draft.md：草稿使用的文章模板
    - page.md：分頁畫面使用的網頁模板
    - post.md：正式區使用的文章模板
- source
  - 放置網站內容的地方(前輟帶有_會被Hexo忽略，僅有_posts不會)
  這邊的所有md、html檔案在處理之後會放置<strong><code>/public</code></strong>
- themes
  - 根據不同的主題生成不同的靜態網頁風格。
  <strong>[快點擊我找一個自己喜歡的模板吧!!!](https://hexo.io/themes/)</strong>
  <strong>[(如果官方預覽不知道怎麼看到點我)](#Preview)</strong>

![官方的Themes shops](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007043/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/%E5%AE%98%E6%96%B9%E7%9A%84Themes%20shops.png)

---

<a id="hexo-init-bug"></a>

## hexo init故障排除

![cmd非空初始化hexo故障顯示](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007040/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/cmd%E9%9D%9E%E7%A9%BA%E5%88%9D%E5%A7%8B%E5%8C%96hexo%E6%95%85%E9%9A%9C%E9%A1%AF%E7%A4%BA.png)

- 這代表你的資料夾並非空的導致初始化失敗喔!!!
檢查一下你安裝Hexo的資料夾吧(以下是失敗可能範例)

![資料夾已有檔案(package.json)](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007041/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/%E8%B3%87%E6%96%99%E5%A4%BE%E5%B7%B2%E6%9C%89%E6%AA%94%E6%A1%88%28package.json%29.png)

<a id="Preview"></a>

---

## 官方主題看預覽畫面教學(選好的主題將在Day4進行更換)

- 通常點進去都會有對應的靜態網頁連結可以點擊
- leedom主題

![leedom主題](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007039/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/leedom%E4%B8%BB%E9%A1%8C.png)

- Tranquilpeak主題

![Tranquilpeak主題](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007039/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/Tranquilpeak%E4%B8%BB%E9%A1%8C.png)

- Oliver主題

![Oliver主題](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007039/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/Oliver%E4%B8%BB%E9%A1%8C.png)

<a id="PortInUse"></a>

## hexo s故障排除

![port號佔用](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007039/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-2/port%E8%99%9F%E5%8D%A0%E7%94%A8.png)

- 這代表port號被占用了

- 可以試著改用以下方式讓使用的port號改變

```text
hexo s -p 6000
```

---

## 結尾

今天也好好的邁出第二步了，看到屬於自己的畫面，希望能夠幫助所有喜歡部落格的我跟你。

---

## 參考資料

[1] [Hexo官方文件](https://hexo.io/zh-tw/docs/)

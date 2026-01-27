---
title: 建立自己的部落格：修改Hexo設定檔中Site，查看其變化
date: 2023-10-18 20:50:31
tags:
  - [Hexo]
  - [VSCode]
  - [Sublime Text]
  - [YAML]
  - [SEO]
categories:
  - [Blog]
description: 今天的你跟我都是部落格工程師，我們一起來將網頁做一些小小的改變，有一天匯集在一起就會讓你的部落格變的與眾不同。
---

![Blog背景圖](https://res.cloudinary.com/dseg0uwc9/image/upload/f_auto,q_auto,w_1200,h_675,c_fill/v1769445040/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E5%BB%BA%E7%AB%8B%E8%87%AA%E5%B7%B1%E7%9A%84%E9%83%A8%E8%90%BD%E6%A0%BC_%E4%BF%AE%E6%94%B9Hexo%E8%A8%AD%E5%AE%9A%E6%AA%94%E4%B8%ADSite_%E6%9F%A5%E7%9C%8B%E5%85%B6%E8%AE%8A%E5%8C%96_vhu1rd.jpg)

## 查看Hexo設定檔

![Hexo資料夾](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007045/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Hexo%E8%B3%87%E6%96%99%E5%A4%BE.png)

- 使用記事本打開的情況(看起來就很不容易修改吧.....)

![記事本打開](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007041/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/%E8%A8%98%E4%BA%8B%E6%9C%AC%E6%89%93%E9%96%8B%E8%A8%AD%E5%AE%9A%E6%AA%94.png)

- 這時候需要搬出編輯器工具美化它

---

## 編譯器工具推薦

### 推薦工具1-Vscode

- <strong><code>[官方下載連結請點我](https://code.visualstudio.com/download)</code></strong>

![Vscode官方下載圖片](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007046/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Vscode%E5%AE%98%E6%96%B9%E4%B8%8B%E8%BC%89%E5%9C%96%E7%89%87.png)

- 安裝上都按照預設點選下一步直至完成即可

![Vscode打開資料夾](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007048/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Vscode%E6%89%93%E9%96%8B%E8%B3%87%E6%96%99%E5%A4%BE.png)

- 使用Vscode編譯器將資料夾打開吧(File -> Open Folder)

![Vscode資料夾檢視畫面](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007047/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Vscode%E8%B3%87%E6%96%99%E5%A4%BE%E6%AA%A2%E8%A6%96%E7%95%AB%E9%9D%A2.png)

- 左邊是資料夾的結構樹狀圖(點擊即可查看該檔案)
- 登登登登~看起來五顏六色的漂亮多了吧，這樣好編譯多了(加上#就變成綠色的註解寫法)

### 推薦工具2-Sublime Text

- <strong><code>[官方下載連結請點我](https://www.sublimetext.com/download)</code></strong>

![Subline官方下載圖片](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007048/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Subline%E5%AE%98%E6%96%B9%E4%B8%8B%E8%BC%89%E5%9C%96%E7%89%87.png)

- 安裝上都按照預設點選下一步直至完成即可

![Subline打開資料夾](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007048/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Subline%E6%89%93%E9%96%8B%E8%B3%87%E6%96%99%E5%A4%BE.png)

- 使用Subline編譯器將資料夾打開吧(File -> Open Folder)

![Subline資料夾畫面](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007049/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Subline%E8%B3%87%E6%96%99%E5%A4%BE%E7%95%AB%E9%9D%A2.png)

- 左邊是資料夾的結構樹狀圖(點擊即可查看該檔案)
- 質感不太一樣，有些人更喜歡這種感覺(加上#就變成灰色的註解寫法)

兩者當然有各自優缺點，且均有免費的版本可以使用，只是Subline免費版本會很偶爾的跳出來問你要不要購買，就看大家的喜好挑選囉。

---

## 認識Hexo設定檔的第一步

- 打開資料夾下的<strong><code>\_config.yml</code></strong>檔案
- 認識第一區塊的設計目的

![Hexo Site設定](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007050/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Hexo%20Site%E8%A8%AD%E5%AE%9A.png)

- 先試著使用剛剛說的#註解說明文字幫助自己更加了解這些參數特性吧!

![Hexo Site備註](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007043/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Hexo%20Site%E5%82%99%E8%A8%BB.png)

- title：網站標題
- subtitle：網站副標題
- description：網站描述(SEO優化相關)
- keywords：網站的關鍵字(SEO優化相關)
- author：網站作者的名字
- language：網站使用的語系(會跟顯示內容相關)
- timezone：網站使用的時區(預設電腦系統的時區)

## 調整根目錄下\_config.yml的Site參數

- 複製以下的內容更換原先的Site參數

```text
title: Tech Explorer's Diary #網站標題
subtitle: 'Journey through the world of technology' #網站副標題
description: 'A blog dedicated to exploring the latest trends, discoveries, and innovations in the tech world.' #網站描述(SEO優化相關)
keywords: technology, innovation, programming, software, hardware, reviews #網站的關鍵字(SEO優化相關)
author: John Doe #網站作者的名字
language: en #網站使用的語系(會跟顯示內容相關)
timezone: '' #網站使用的時區(預設電腦系統的時區)
```

- 打開cmd介面輸入以下指令編譯並生成對應靜態網站
  <strong><code>(如果不知道cmd介面如何開啟請看Day2的介紹)</code></strong>

```text
hexo g
```

- 打開cmd介面輸入以下指令啟動本地服務器預覽修改的畫面
  <strong><code>(如果不知道cmd介面如何開啟請看Day2的介紹)</code></strong>

```text
hexo s
```

## 調整Site參數-title、subtitle成果展示

- 根據模板(Theme)的不同，顯示的位置會有些此不同。

- title、subtitle
  ![Hexo title&subtitle修改成果](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007044/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Hexo%20title%20and%20subtitle%E4%BF%AE%E6%94%B9%E6%88%90%E6%9E%9C.png)

- author
  ![Hexo author修改成果](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007043/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Hexo%20author%20%E4%BF%AE%E6%94%B9%E6%88%90%E6%9E%9C.png)

- description(因為預設版面沒有顯示這部分改以我的版面進行說明)
  ![Antonio Hexo版面](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007046/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Antonio%20Hexo%E7%89%88%E9%9D%A2.png)

- 這部分關於網站的敘述也會在搜尋時被大家看到喔!!!
  ![網站Google搜尋結果](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007043/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/%E7%B6%B2%E7%AB%99Google%E6%90%9C%E5%B0%8B%E7%B5%90%E6%9E%9C.png)

## 調整Site參數-language成果展示

- 試著將language的參數從en(英文)修改成zh-TW(中文)

```text
title: Tech Explorer's Diary #網站標題
subtitle: 'Journey through the world of technology' #網站副標題
description: 'A blog dedicated to exploring the latest trends, discoveries, and innovations in the tech world.' #網站描述(SEO優化相關)
keywords: technology, innovation, programming, software, hardware, reviews #網站的關鍵字(SEO優化相關)
author: John Doe #網站作者的名字
language: zh-TW #網站使用的語系(會跟顯示內容相關)
timezone: '' #網站使用的時區(預設電腦系統的時區)
```

- 別忘了編譯網站指令跟啟動本地服務器預覽指令
  (只要有調整設定檔案建議都要重新編譯過比較保險)

```text
hexo g
```

```text
hexo s
```

![Hexo 語系變更中文](https://res.cloudinary.com/dseg0uwc9/image/upload/v1708007045/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/hexo-github-3/Hexo%20%E8%AA%9E%E7%B3%BB%E8%AE%8A%E6%9B%B4%E4%B8%AD%E6%96%87.png)

- 剛剛右邊區塊的英文都變成中文

## 結尾

雖然今天只有做出小小的改變，但每個部落格都是從小地方開始慢慢修改成自己喜歡的模樣。

---

## 參考資料

[1] [Hexo官方文件-配置](https://hexo.io/zh-tw/docs/)

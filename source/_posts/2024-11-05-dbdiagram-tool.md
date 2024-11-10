---
title: 關聯式資料庫設計必備 - dbdiagram.io ERD 繪圖工具
date: 2024-11-05 20:18:24
tags:
- [Online tool]
categories:
- [ERD]
description: 還在煩惱如何設計關聯式資料表實體關聯圖嗎？ 使用 dbdiagram.io 加快你與同事之間的距離
---

![文章封面圖](https://res.cloudinary.com/dseg0uwc9/image/upload/v1730813913/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E9%97%9C%E8%81%AF%E5%BC%8F%E8%B3%87%E6%96%99%E5%BA%AB%E8%A8%AD%E8%A8%88%E5%BF%85%E5%82%99%20-%20dbdiagram.io%20ERD%20%E7%B9%AA%E5%9C%96%E5%B7%A5%E5%85%B7/ER_%E9%97%9C%E8%81%AF%E5%9C%96_rq9q9g.png)

## 什麼是 Entity-relationship diagram(ERD)？

ERD 是一種用來表示資料表之間關係的圖表，能夠描述一對一、一對多、多對一等關聯。透過 ERD，可以快速瞭解每張資料表的欄位定義及屬性，方便進行資料庫設計與管理。

【資料表基礎資訊】

- 資料表介紹：用戶資料表、訂單元數據資料表、產品資料表、訂單明細資料表
- 用戶資料表與訂單資料表之間的關係：一個用戶可以有多筆訂單，而每張訂單僅屬於一位用戶。
- 訂單元數據資料表與訂單明細資料表之間的關係：一張訂單可以包含多個訂單明細項目，而每個訂單明細項目僅屬於一張訂單。
- 訂單明細資料表與產品資料表之間的關係：多個訂單明細可以引用同一個產品（例如，不同訂單中的相同產品）

![用戶購買訂單實體關聯圖](https://res.cloudinary.com/dseg0uwc9/image/upload/v1730814878/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E9%97%9C%E8%81%AF%E5%BC%8F%E8%B3%87%E6%96%99%E5%BA%AB%E8%A8%AD%E8%A8%88%E5%BF%85%E5%82%99%20-%20dbdiagram.io%20ERD%20%E7%B9%AA%E5%9C%96%E5%B7%A5%E5%85%B7/Blog-use_jgfng3.png)

## dbdiagram.io - 基本介紹

dbdiagram.io 是一個可以快速建置實體關聯圖的線上工具，能夠幫助您快速建立實體關聯圖(ERD)。它使用 Database Markup Language(DBML)語法來定義資料表結構和關聯，使用者可以直觀地設計資料表並即時調整它們之間的關係，讓修改立即反映在圖表中。

> Database Markup Language(DBML)語法本身是一種 open-source DSL language

### dbdiagram.io 優點

- **減少撰寫 SQL 時間**：dbdiagram.io 支援將寫好的 DBML 語法轉換成對應的 `Relational Database Management System（RDBMS）` SQL DDL 語法，例如：PostgreSQL、MySQL、SQL Server、Oracle SQL 等。
- **團隊 ERD 即時共享**：透過`share`功能即時分享現有 ER 圖表及相關 DBML 欄位定義及註解說明。
- **dbdocs 線上文件分享**：`dbdocs` 是一款能透過 dbdiagram.io 中 DBML 一鍵生成的線上文件工具，能讓使用者快速查看每張資料表的定義、定義及說明。其最大的優勢在於可以瀏覽單一資料表跟其他資料表的關係，避免因為複雜的資料表關係而無法有效查看到重點資訊。
- **圖檔靜態文件匯出**：可以選擇將單一資料表與其他資料表之間的 ERD 匯出或所有資料表的 ERD 匯出成`PDF`或`PNG`。

### 專案定義(Project Definition)

單行註解寫法：

```dbml=
Project 用戶購物紀錄專案 {
  database_type: 'PostgreSQL'
  Note: '紀錄用戶購買項目大綱及明細'
}
```

> Note 支援 md 語法

多行註解寫法：

```dbml=
Project 用戶購物紀錄專案 {
  database_type: 'PostgreSQL'
  Note: '''
  # 紀錄用戶購買項目大綱及明細
  - users：用戶資料表
  - orders：訂單資料表
  - products：產品資料表
  - order_items：產品明細資料表
  '''
}
```

【 dbdocs 對應顯示區塊 - 專案註解 】

![專案定義 - dbdocs 顯示](https://res.cloudinary.com/dseg0uwc9/image/upload/v1730909637/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E9%97%9C%E8%81%AF%E5%BC%8F%E8%B3%87%E6%96%99%E5%BA%AB%E8%A8%AD%E8%A8%88%E5%BF%85%E5%82%99%20-%20dbdiagram.io%20ERD%20%E7%B9%AA%E5%9C%96%E5%B7%A5%E5%85%B7/ERD_%E5%B0%88%E6%A1%88%E5%AE%9A%E7%BE%A9_z8tnk6.png)

### 表單定義(Table Definition)

預設寫法(使用`public schema`)：

```dbml=
Table table_name {
  column_name column_type [column_settings]
}
```

指定 schema 名稱 DBML 寫法：

```dbml=
Table schema_name.table_name {
  column_name column_type [column_settings]
}
```

【 dbdocs 使用預設與未使用指定名稱 schema 差別 】

![dbdocs 使用預設與未使用指定名稱 schema 差別](https://res.cloudinary.com/dseg0uwc9/image/upload/v1730988453/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E9%97%9C%E8%81%AF%E5%BC%8F%E8%B3%87%E6%96%99%E5%BA%AB%E8%A8%AD%E8%A8%88%E5%BF%85%E5%82%99%20-%20dbdiagram.io%20ERD%20%E7%B9%AA%E5%9C%96%E5%B7%A5%E5%85%B7/%E6%8C%87%E5%AE%9A_schema_%E8%88%87%E6%9C%AA%E6%8C%87%E5%AE%9A_schema_%E5%B7%AE%E5%88%A5_grcnil.png)

> 指定 schema 名稱優點：
>
> - **用途分類**：可以根據不同的用途或功能將資料庫物件分隔到不同的 schema 中，使資料庫結構更清晰、易於管理。
> - **避免名稱衝突**：不同的 schema 可以包含名稱相同的資料表，從而避免因名稱重複而產生的衝突。
> - **權限管理**：能針對不同的 schema 設定專屬的存取權限

#### 表單別名(Alias)

```dbml=
Table very_long_user_table as U {
  ...
}
```

Ref: U.id < posts.user_id
> 使用別名可以用於建立外來鍵關係時使用，特別是表單名稱比較長的時候 (=´ω`=)。

#### 表單註解(Note)

```dbml=
Table users {
  id integer
  status varchar [note: 'status']

  Note: 'Stores user data'
}
```

【 dbdocs 對應顯示區塊 - 表單註解 】

![dbdocs 顯示效果](https://res.cloudinary.com/dseg0uwc9/image/upload/v1730984607/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E9%97%9C%E8%81%AF%E5%BC%8F%E8%B3%87%E6%96%99%E5%BA%AB%E8%A8%AD%E8%A8%88%E5%BF%85%E5%82%99%20-%20dbdiagram.io%20ERD%20%E7%B9%AA%E5%9C%96%E5%B7%A5%E5%85%B7/%E5%81%B4%E9%82%8A%E6%AC%84%E9%A1%AF%E7%A4%BA%E8%A8%BB%E8%A7%A3%E6%95%88%E6%9E%9C_pr0sre.jpg)

> Note 的規則均分成`單行註解`跟`多行註解`的方式

### 欄位定義(Column Definition)

```dbml=
Table buildings {
  id integer [ pk, unique, default: 123, note: 'Number' ]
  address varchar(255) [unique, not null, note: 'to include unit number']
  ...
}
```

欄位定義的格式：column_name column_type [column_settings]

- **column_name**：欄位名稱
- **column_type**：支援各種資料型別
- **column_settings**:設定欄位屬性
  - primary key or pk：主鍵
  - null or not null：不得為空
  - unique：唯一值的特性
  - default：預設值(數字、字串、布林或表達式)
  > 表達式範例：`now() - interval '5 days'`(當前時間往前推五天)
  - increment：自動遞增

【 dbdocs 對應顯示區塊 - 欄位定義 】

![dbdocs 對應顯示區塊 - 欄位定義](https://res.cloudinary.com/dseg0uwc9/image/upload/v1730991377/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E9%97%9C%E8%81%AF%E5%BC%8F%E8%B3%87%E6%96%99%E5%BA%AB%E8%A8%AD%E8%A8%88%E5%BF%85%E5%82%99%20-%20dbdiagram.io%20ERD%20%E7%B9%AA%E5%9C%96%E5%B7%A5%E5%85%B7/%E6%AC%84%E4%BD%8D%E5%AE%9A%E7%BE%A9%E6%96%B9%E5%BC%8F_iw7zx5.jpg)

### 索引定義(Index Definition)

```dbml=
Table bookings {
  id integer
  country varchar
  booking_date date
  created_at timestamp

  indexes {
    // 單欄索引
    created_at [name: 'created_at_index', note: 'Date'] // 單一欄位索引，用於針對 created_at 的查詢加速

    // 複合索引
    (country, booking_date) [unique, name: 'country_booking_idx'] // 唯一複合索引，用於加速 country 和 booking_date 的查詢
  }
}
```

索引格式：將欄位設置為索引時的格式為 [index-name、index-setting、note]

> **index-setting** 可以設定`unique`及`pk`屬性。

【 index 搭配屬性組合使用方式】

- 複合主鍵：(country, booking_date) [pk]
- 複合唯一索引：(country, booking_date) [unique]

索引主要的原理在於寫入的時候，根據索引的欄位另外拉一張表儲存索引的欄位值。檢索的時候，可以根據儲存的索引進行掃描，加速檢索資料的時間。但同時也會增加寫入及更新的時間，因此在設置上需要根據實際檢索情境進行設計，以達到性能平衡。

索引大致上可以分成單欄索引及多欄索引(composite index)：

- 單欄索引：用於提升單個欄位的查詢性能，例如：created_at 欄位過濾或排序的操作。
- 多欄索引：用於優化涉及多個欄位的查詢。例如：在查詢中常用`WHERE country = 'USA' AND booking_date = '2024-11-07'`。

### Foreign Key Definitions(外來鍵定義)

外來鍵用於表示當前資料表與另一張資料表主鍵的關聯，建立兩者之間約束關係。用於確保兩張資料表的資料具有一致性，且參照的欄位值確實存在，從而維護資料的正確性。撰寫方式可以主要分成`Long form`、`Short form`兩種寫法，且可以設定`Relationship settings`。

```dbml=
// Long form
Ref name_optional {
  schema1.table1.column1 < schema2.table2.column2
}

// Short form:
Ref name_optional: schema1.table1.column1 < schema2.table2.column2
```

**外來鍵關係**：

- 一對多：users.id < posts.user_id
- 多對一：posts.user_id > users.id
- 一對一：users.id < posts.user_id

#### 外來鍵變更處理機制

在實際使用情境中，當涉及外鍵關聯的父表發生變更(如刪除或更新)時，可以根據不同的操作行為來決定依賴該外鍵的子表應如何處理。

```dbml=
Ref: products.merchant_id > merchants.id [delete: cascade, update: no action]
```

**referential actions**：

- cascade：當對應的父表記錄被刪除或更新時，自動刪除或更新所有引用該記錄的子表記錄。
- restrict：不允許刪除或更新有引用的父表記錄。如果子表中存在對應的記錄，則拒絕此操作。(立即檢查)
- set null：當對應的父表記錄被刪除或更新時，將子表中引用的外鍵設置為 NULL。
- set default：當對應的父表記錄被刪除或更新時，將子表中引用的外鍵設置為預設值。
- no action：不執行任何操作。如果子表中有引用，則拒絕刪除或更新父表記錄。(延遲檢查)

> Mysql 中 no action / restrict 效用相似

### Enum Definition

允許定義一組可選值的選項，確保使用者存入符合定義的選項值。

【 定義 - 預設使用 public schema 】

```dbml=
enum grade {
  "A+"
  "A"
  "A-"
  "Not Yet Set"
}
```

【 表單欄位使用 - 預設使用 public schema 】

```dbml=
Table students {
  id integer [pk, unique, note: "Student ID"]
  name varchar(100) [not null, note: "Student name"]
  grade grade [note: "Student grade"]
}
```

---

如果有使用`schema`的情況下，`定義`跟`使用`要加上`schema`名稱前綴。

【 定義 - 使用 schema1 name 】

```dbml=
enum schema1.grade {
  "A+"
  "A"
  "A-"
  "Not Yet Set"
}
```

【 表單欄位使用 - schema1 name 】

```dbml=
Table students {
  id integer [pk, unique, note: "Student ID"]
  name varchar(100) [not null, note: "Student name"]
  grade schema1.grade [note: "Student grade"]
}
```

## 回顧今天的學習內容

透過`dbdiagram.io`這個工具，我們可以更有效率地進行資料庫設計工作。它不僅提供了直覺的介面來繪製`ERD`圖表，更重要的是能夠通過`DBML`語法定義資料表之間的關係。對於團隊協作來說，能夠即時共享`ERD`設計和產生清晰的文件是非常實用的功能。

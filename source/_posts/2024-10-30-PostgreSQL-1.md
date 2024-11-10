---
title: 前端勇士大闖六角後端體驗營 - 初探 PostgreSQL DML 語法
date: 2024-10-30 22:43:49
tags:
- [DDL]
- [DML]
- [PostgreSQL]
- [六角學院]
categories:
- [database]
description: 初步踏入後端的世界，了解何謂後端以及資料庫常見語法 DDL、DML。
---

![文章封面圖](https://res.cloudinary.com/dseg0uwc9/image/upload/v1730362541/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E5%89%8D%E7%AB%AF%E5%8B%87%E5%A3%AB%E5%A4%A7%E9%97%96%E5%85%AD%E8%A7%92%E5%BE%8C%E7%AB%AF%E9%AB%94%E9%A9%97%E7%87%9F/%E5%89%8D%E7%AB%AF%E5%8B%87%E5%A3%AB%E5%A4%A7%E9%97%96%E5%85%AD%E8%A7%92%E5%BE%8C%E7%AB%AF%E9%AB%94%E9%A9%97%E7%87%9F_ofqtre.png)

## 什麼是後端伺服器？

當我們透過前端伺服器發送請求到後端伺服器的流程，大致可以規劃成以下簡易的流程。

依照之前架設的`Nodejs express`伺服器的經驗：

1. **身份和請求確認**：當後端接收到請求時，先進行身份驗證和請求合法性的檢查，這通常涉及中介軟體（middleware）
2. **路由導向**：依照路由配置和請求的目標，將請求引導至相應的控制器，並確保符合`RESTful API`的設計
3. **ORM 與 SQL 的選擇**：可選擇直接透過`SQL(Structured Query Language)`語法或透過`ORM(Object Relational Mapping)`的方式跟資料庫進行交互（兩者各有優缺點，以維護性的角度我比較偏好使用 ORM 的方式）

> - SQL 可以想成跟關聯式資料庫溝通的語法，關聯式資料庫基本上都可以使用 SQL 語法，可以學一個用很多個
> - ORM 可以理解為一種通過定義資料表結構的抽象層，透過這層管理，將程式碼中的操作轉換成對應的 SQL 語法來與資料庫進行互動。當換成其他關聯性資料庫時，只需要告訴 ORM 工具搭配的是哪一個資料庫就可以。

![前後端極簡易架構圖](https://res.cloudinary.com/dseg0uwc9/image/upload/v1730303549/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/%E5%89%8D%E7%AB%AF%E5%8B%87%E5%A3%AB%E5%A4%A7%E9%97%96%E5%85%AD%E8%A7%92%E5%BE%8C%E7%AB%AF%E9%AB%94%E9%A9%97%E7%87%9F/%E5%89%8D%E5%BE%8C%E7%AB%AF%E6%A5%B5%E7%B0%A1%E6%98%93%E6%9E%B6%E6%A7%8B%E5%9C%96_dqigqz.png)

## SQL DML & DDL 類型說明 - 以 PostgreSQL 為例

SQL 語法可依照其指令的操作範疇區分 DDL（Data Definition Language） 和 DML（Data Manipulation Language）兩種類型：

- DDL：針對資料庫結構進行操作。例如創建、修改和刪除資料表、索引或其他資料庫物件。
- DML：針對資料表中的資料進行操作。例如查詢、插入、更新和刪除等資料處理。

| DDL 功能說明|           SQL 語法                       | DML 功能說明 |    SQL 語法           |
|--------------------------------|----------------------------------|----------------------------------|---------------|
| 新增物件                        | CREATE                           | 查詢資料                         | SELECT        |
| 修改物件結構                    | ALTER                            | 新增資料                         | INSERT        |
| 刪除物件                        | DROP                             | 更新資料                         | UPDATE        |
| 清除資料                | TRUNCATE                         | 刪除資料                         | DELETE        |

以下會透過案例的方式著重說明 DML 的語法，讓大家更清楚如何理解每個語法使用的規則。

在開始之前，先說明我們這次案例的故事：

這是一個關於小美在家具店打工時，遇到客人的故事...

> - **客人**：我要看那個貓抓皮沙發，你們還有貨嗎？
> - **小美**：（慌張）啊...貓抓皮沙發...
(ＱＱ 一時想不起來，只能使用學長之力，急著用 LINE 問小明學長)
> - **小美**：學長救命！要怎麼查這個沙發？
> - **小明**：(學長光環閃爍)這邊只要對著這個機器下等於的語法
>
>   ```sql
>   SELECT name, price, stock ---想找出的資料表欄位
>   FROM products --- 根據哪一張資料表
>   WHERE name = '貓抓皮L型沙發'; --- 條件是什麼
>   ```
>
> - **小美**：原來如此，一緊張就都忘記了。意思是這樣子對吧。
>
>   ```text
>   選取 名字、價格、庫存
>   從 商品表
>   找 商品名等於貓抓皮L型沙發
>   ```
>
> - **小明**：對！很快就上手了呢！在多練習幾次就沒問題了
> - **小美**：（快速輸入）
> - **小美**：哇！真的查到了！
> - **小美**：只剩一張庫存耶...
> - **客人**：（不耐煩）小姐？到底有沒有啊？
> - **小美**： 這款 L 型沙發目前最後一張特價 52900，要幫您預訂嗎？
> - **客人**：哦？最後一張喔...那...就先訂起來好了！
> - **小明**：！！！這麼快就會了？根本是資料庫天才 ❤️
> - **小明**：那我再考你幾題，如果你都會了以後，那我就可以退休了ㄏㄏㄏ
> - **小美**：學長不可以啦.....

---

### 前置作業

本次練習的關聯性資料庫使用`PostgreSQL`，並搭配線上工具[pg-sql](https://pg-sql.com/)，大家可以跟著一起練習，順便加深對於資料庫的操作印象。

首先我們需要使用`DDL`中的`CREATE`語法創建練習所需的資料表：

> VARCHAR 可以想成我們常用的字串，後面的數字則代表字串長度限制。而 INTEGER 則代表整數。針對資料庫操作的時候，必須按照其型別儲存對應的資料，否則會報錯。

```sql
CREATE TABLE products (
   name VARCHAR(100),         -- 商品名稱
   price INTEGER,            -- 原價
   discount_price INTEGER,    -- 優惠價
   stock INTEGER,            -- 庫存數量
   category VARCHAR(50),      -- 商品分類
   status VARCHAR(20)         -- 商品狀態
);
```

---

接著，我們創建完資料表之後，就可以透過 DML 中的`INSERT` sql 語法將資料儲存進去，進行後續`查詢資料`、`更新資料`及`刪除資料`的相關操作。

> - **INSERT INTO**：我要準備將資料新增進去資料庫囉！
> - **products**：要插入的資料表名稱
> - **\(**name, price, discount_price...**\)**：表明要插入的欄位有哪些
> - **VALUES**：插入的欄位值

```sql
INSERT INTO products (name, price, discount_price, stock, category, status) VALUES
   ('北歐風雙人沙發', 39900, 35900, 3, '沙發', 'active'),
   ('貓抓皮L型沙發', 58900, 52900, 1, '沙發', 'active'),
   ('典雅三人座沙發', 42800, 42800, 5, '沙發', 'active'),
   ('工業風電視櫃', 5900, 4900, 12, '櫃子', 'active'),
   ('簡約書櫃', 3500, 3500, 8, '櫃子', 'active'),
   ('玄關鞋櫃', 2900, 2900, 15, '櫃子', 'active'),
   ('日式雙人床架', 12000, 11200, 6, '床架', 'active'),
   ('掀床五尺雙人床', 19900, 18900, 2, '床架', 'active'),
   ('兒童床架', 8900, 8900, 0, '床架', 'inactive'),
   ('電腦辦公椅', 4500, 3900, 20, '椅子', 'active'),
   ('餐椅四入組', 6000, 5200, 8, '椅子', 'active'),
   ('北歐風餐桌', 15800, 14800, 4, '桌子', 'active'),
   ('實木咖啡桌', 3200, 2900, 10, '桌子', 'active'),
   ('電競書桌', 8900, 8900, 0, '桌子', 'inactive');
```

### 比較運算子應用(>=、>、=、<、<=)

- **情境 1：單品查詢**

> 客人：「這張北歐風雙人沙發多少錢？」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：想找到這張沙發的價格和庫存

```sql
SELECT name, price, discount_price, stock
FROM products
WHERE name = '北歐風雙人沙發';
```

> - **SELECT**：查詢資料庫中符合條件的資料
> - **name, price, discount_price, stock**：指定要查詢的欄位
> - **FROM products**：要查詢的資料表名稱
> - **WHERE**：查詢條件搭配使用比較運算子(=)的使用

在查詢語法當中，有一個特別的存在`* (萬用字元)`，代表查詢所有欄位。這邊可能會想說是不是都用`*`就好，還需要特別指定要檢索的欄位嗎？

> 回傳的欄位越多，資料庫的檢索和回傳所需的時間就越長。因此，為了提高查詢效率，建議只選擇所需的欄位，讓資料庫更快地返回我們所需要的資料。

- **情境 2：價格比較**

> 客人：「請列出 5000 元以下的櫃子有哪些？」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：找出櫃子類且價格在 5000 以下的商品

```sql
SELECT name, price, discount_price
FROM products
WHERE category = '櫃子' AND discount_price < 5000;
```

- **情境 3：價格比較**

> 客人：「日式雙人床架還有貨嗎？」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：確認日式雙人床架的庫存狀況

```sql
SELECT name, stock
FROM products
WHERE name = '日式雙人床架';
```

### AND 邏輯運算符應用

邏輯運算符中存在`AND`及`OR`可以搭配`Where`在下條件查詢的時候使用。這邊先介紹`AND`的語法，`AND`可以組合多個查詢條件但是很重要的是必須全部都符合的情況下才會回傳該筆資料。

- **情境 4：尋找預算內且存在庫存的沙發**

> 客人：預算內的商品 客人：「想找 4 萬以下，而且有現貨的沙發」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要同時符合：是沙發、4萬以下、有庫存

```sql
SELECT name, price, discount_price, stock
FROM products
WHERE category = '沙發' AND discount_price < 40000 AND stock > 0;
```

- **情境 5：特價且有貨**

> 客人：「沙發有哪些特價且現貨的品項？」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要找到沙發類且有特價（原價大於優惠價）且還有庫存的商品

```sql
SELECT name, price, discount_price, stock
FROM products
WHERE category = '沙發' AND price > discount_price AND stock > 0;
```

### OR 邏輯運算符應用

`OR`也是邏輯運算符中的一種，代表各個條件之間如果有一個符合的情況下，就會回傳該筆資料。

- **情境 6：多分類查詢**

> 客人：「我要找櫃子或桌子」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要找出櫃子類或桌子類的商品

```sql
SELECT name, category
FROM products
WHERE category = '櫃子' OR category = '桌子';
```

- **情境 7：指定商品**

> 客人：「北歐風雙人沙發和貓抓皮L型沙發哪個還有貨？」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要找出這兩張特定沙發的庫存狀況

```sql
SELECT name, stock
FROM products
WHERE name = '北歐風雙人沙發' OR name = '貓抓皮L型沙發';
```

### IN 集合與範圍運算符應用

`IN`是一種集合與範圍運算符，常用於篩選某欄位符合特定值集合的資料。當我們希望查詢結果包含多個特定類別或值時，可以使用 `IN`來簡化語法。

- **情境 8：多分類查詢**

> 客人：「客廳的家具有哪些？我要看沙發、櫃子跟桌子」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要找出沙發、櫃子和桌子這三種分類的商品

```sql
SELECT name, category
FROM products
WHERE category IN ('沙發', '櫃子', '桌子');
```

- **情境 9：特定商品**

> 客人：「電腦辦公椅和餐椅四入組的價格是多少？」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要找出這兩款椅子的價格

```sql
SELECT name, price, discount_price
FROM products
WHERE name IN ('電腦辦公椅', '餐椅四入組');
```

### BETWEEN 集合與範圍運算符應用

`BETWEEN`也是一種集合與範圍運算符，用於檢索位於特定範圍內的資料，必須指定上下界兩個條件值。

- **情境 10：價格區間**

> 客人：「想找 10000 到 20000 之間的商品有哪些？」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：列出這個價格區間的所有商品

```sql
SELECT name, price, discount_price
FROM products
WHERE discount_price BETWEEN 10000 AND 20000;
```

- **情境 11：庫存區間**

> 主管：「請列出庫存在 5 到 15 之間的商品」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：列出庫存數量在這個範圍的商品

```sql
SELECT name, stock
FROM products
WHERE stock BETWEEN 5 AND 15;
```

### NOT IN 集合與範圍運算符應用

`NOT IN`則是與`In`相反的意思，也就是不包含多個特定類別或值時，可以使用 `NOT IN`來簡化語法。

- **情境 12：排除商品**

> 主管：「列出除了沙發和床架以外的商品」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要找出不是沙發和床架的商品

```sql
SELECT name, category
FROM products
WHERE category NOT IN ('沙發', '床架');
```

### 更新(Update)資料表內資料

- **情境 13：調整價格**

> 主管：「北歐風雙人沙發要調降 2000 元」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要如何更新這張沙發的價格

```sql
UPDATE products
SET price = price - 2000 --- 如果今天更新欄位有多個，用逗號隔開
WHERE name = '北歐風雙人沙發';
```

- **情境 14：更新庫存**

> 主管：「電腦辦公椅進了 5 張」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要如何增加這款椅子的庫存數量

```sql
UPDATE products
SET stock = stock + 5
WHERE name = '電腦辦公椅';
```

### 刪除(Delete)資料表內資料

- **情境 15：清除資料**

> 主管：「要清掉兒童床架和電競書桌的資料」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：要如何刪除這兩項商品

```sql
DELETE FROM products
WHERE name IN ('兒童床架', '電競書桌');
```

### AS 別名(加碼題)

> 主管：「我想知道椅子商品價格折扣多少錢」
> 小美翻譯蒟蒻ヾ(●´∀｀●)：請標示折扣價跟價格的差別

```sql
SELECT name, price, discount_price, price - discount_price as discount_amount
FROM products
WHERE category = '椅子'
```

耶～小美可以下班了，感謝大家也感謝學長 (((o(*ﾟ▽ﾟ*)o)))

## 回顧今天的學習內容

今天主要帶大家初步認識了有關於`PostgreSQL`的`DML`相關語法，理解上還算是好理解，但是有時候就是會熊熊忘記ＱＱ 所以還是建議時不時要複習一下手感，回想起這些~~美好~~痛苦的程式回憶 ฅ^._.^ฅ 。

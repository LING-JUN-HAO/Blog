---
title: TypeScript 手寫題實戰系列：手寫 Promise.all
tags:
---

在前端面試中，`Promise.all` 是常見的手寫題之一。這篇文章記錄我實作 `Promise.all` 的完整思考過程 d(`･∀･)b

## 需求分析

### 輸入 / 輸出規格

- **Input**：Iterable (可迭代物件)，例如：Array、Set、String
- **Output**：返回一個 Promise，`resolve`時回傳結果陣列，且**結果順序與輸入順序一致**

### 行為規範

- Promise 最終狀態只有兩種結果 `fulfilled (成功) `跟 `rejected (失敗)` ，分別透過 `resolve` 跟 `reject` 改變狀態
- 當**所有** Promise 都成功時，`resolve` 結果陣列
- 當**任一** Promise 失敗時，立即 `reject` 並忽略後續其他 Promise 處理的結果

### 邊界處理

- 空迭代器：若轉換後陣列長度為 `0` ，直接返回 `Promise.resolve([])`

### 實作考量

- 輸入可能包含 純值或是 Promise 的兩種情形，統一使用 `Promise.resolve()` 包裝處理，確保處理一致性
- 需要追蹤 `reject` 狀態，避免重複處理錯誤
- 結果需要按照**輸入順序 (非完成順序)**，可考慮搭配 `Array.from()`轉換並保留索引

---

## TS 型別定義

- 輸入定義上使用 `Iterable<T | PromiseLike<T>>` 代表可以接受純值或實作 `then` 方法的 Promise-like 物件
- 輸出定義上使用 `Promise<Awaited<T>>`返回一個 Promise，透過 `Awaited` 工具型別**遞迴解開**所有嵌套的 Promise，得到最終解析完後的型別陣列

```TypeScript
function promiseAll<T>(iterable: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>{
    // 將可迭代物件轉換為陣列統一處理
    const promiseArrays = Array.from(iterable);

    // 處理空陣列的邊界情況
    if(promiseArrays.length === 0) return Promise.resolve([]);

    // 回傳 Promise
    return new Promise((resolve, reject)=>{

        // 記錄已完成的 Promise 數量
        let resolvedCount = 0;
        // 用於存放解析結果，按照輸入順序排列
        const resolveArrays = new Array(promiseArrays.length)

        for(let i = 0; i < promiseArrays.length; i++){
            // 使用 Promise.resolve 統一處理所有陣列迭代項讓純值也統一包裝成 Promise
            Promise.resolve(promiseArrays[i])
            .then((promiseResolve)=>{
                resolvedCount++;
                // 按照輸入的順序，將 resolve 的結果放入對應索引
                resolveArrays[i] = promiseResolve;
                // 當所有 Promise 都完成時，resolve 結果陣列
                if(resolvedCount === promiseArrays.length){
                    resolve(resolveArrays);
                }
            })
            .catch((error)=> reject(error));
        }
    })
}
```

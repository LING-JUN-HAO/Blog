---
title: TypeScript 踩坑筆記：物件字面量的多餘屬性檢查機制
tags:
  - [Excess Property Checks]
  - [Structural Typing]
  - [Type Safety]
  - [NestJS]
categories:
  - [TypeScript]
description: 深入探討 TypeScript 的多餘屬性檢查（Excess Property Checks）機制，解析物件字面量與變數賦值的型別檢查差異，並提供實務開發中避免型別陷阱的最佳實踐方法。
date: 2026-01-31 16:29:23
---

![Blog背景圖](https://res.cloudinary.com/dseg0uwc9/image/upload/f_auto,q_auto,w_1200,h_675,c_fill/v1769848037/%E9%83%A8%E8%90%BD%E6%A0%BC%E5%B0%88%E7%94%A8/TypeScript_%E8%B8%A9%E5%9D%91%E7%AD%86%E8%A8%98_%E7%89%A9%E4%BB%B6%E5%AD%97%E9%9D%A2%E9%87%8F%E7%9A%84%E5%A4%9A%E9%A4%98%E5%B1%AC%E6%80%A7%E6%AA%A2%E6%9F%A5%E6%A9%9F%E5%88%B6_m18jex.jpg)

最近在學 Nest.js，練習定義請求和回應的 DTO 型別。

我在 StackBlitz 上用模擬資料實作了一個 Swagger API，整個流程是：

1. Controller 接收請求
2. Service 處理 MockData
3. 回傳結果

結果碰到多餘參數型別不一致的問題

## 問題場景

> [stackblitz 問題重現連結](https://stackblitz.com/edit/nestjs-typescript-starter-zuugwhx3?file=src%2Fapp.service.ts)

**Controller 定義**

```TS
// 略
@ApiTags('users')
@Controller('users')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '取得全部用戶資訊',
    description: '返回系統中所有的用戶資訊，包括用戶名稱、角色和狀態。',
  })
  @ApiResponse({
    status: 200,
    description: 'User search successfully.',
    type: FilterUsersResponseDto,
  })
  filterByRole(
    @Query() queryParams: FilterUsersRequestDto): FilterUsersResponseDto[] {
    return this.appService.filterMockData(queryParams);
  }
}
```

**Service 定義**

```TS
filterMockData(filterDto: FilterUsersRequestDto): FilterUsersResponseDto[] {
    const filterUserResult = this.mockData.filter((item) => {
        return (
        (!filterDto.role || filterDto.role.includes(item.role)) &&
        (!filterDto.status || item.status === filterDto.status) &&
        (!filterDto.name || item.name.includes(filterDto.name))
        );
    });

    return filterUserResult;
}
```

**MockData 定義**

```TS
  private mockData = [
    {
      id: 1,
      name: 'John Doe',
      role: UserRole.Admin,
      status: UserStatus.Active,
      email: 'john.doe@example.com',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-10'),
      test: 123, // 亂新增的值
    },
    // 略
  ];
```

乍看之下沒有什麼問題，但當我調整 MockData 新增一個值時，我發現 TS 型別檢查上並沒有報錯。

誒.....怎麼會這樣，這跟原本的型別已經不同了，多了 `test` 應該要報錯才對呀 ?

## Excess Property Checks

> [官方章節](https://www.typescriptlang.org/docs/handbook/2/objects.html)

當物件以 **物件字面值（Object Literal）** 的形式直接傳遞時，TypeScript 會執行更嚴格的型別檢查。若物件包含目標型別未定義的屬性，編譯器會立即報錯。

```Ts
interface IUser {
  name: string,
  age: number
}


function TestUse(user: IUser){
  console.log('user', user)
}

TestUse({ name: 'Antonio', age: 27, phone: 100 })

// Error: Object literal may only specify known properties, and 'phone' does not exist in type 'IUser'.
```

但如果透過變數指派的方式，TypeScript 就只會檢查有沒有符合 IUser 的屬性，多餘的屬性就不會被檢查了。

```Ts
interface IUser {
  name: string,
  age: number
}


function TestUse(user: IUser){
  console.log('user', user)
}

const userObj = { name: 'Antonio', age: 27, phone: 100 }

TestUse(userObj)
```

這種繞過 `Excess Property Checks` 的寫法，應該只在有明確需求時才使用。在大多數情況下，出現這種情形往往代表著型別定義不夠嚴謹。

## 避免方式

### 1. 明確標註型別時會觸發檢查

```Ts
interface IUser {
  name: string,
  age: number
}


function TestUse(user: IUser){
  console.log('user', user)
}

const userObj: IUser = { name: 'Antonio', age: 27, phone: 100 }

TestUse(userObj)
// Error: Object literal may only specify known properties, and 'phone' does not exist in type 'IUser'.
```

### 2. 使用 satisfies 保留物件字面值行為

```Ts
interface IUser {
  name: string,
  age: number
}


function TestUse(user: IUser){
  console.log('user', user)
}

const userObj = { name: 'Antonio', age: 27, phone: 100 } satisfies IUser;

TestUse(userObj)
// Error: Object literal may only specify known properties, and 'phone' does not exist in type 'IUser'.
```

## 允許額外屬性的型別定義

如果業務需求確實需要允許動態新增屬性，可以考慮以下兩種方式：

### 1. 索引簽名（Index Signature）

```Ts
interface IUser {
  name: string,
  age: number,
  [key: string]: unknown
}

function TestUse(user: IUser){
  console.log('user', user)
}

const userObj: IUser = { name: 'Antonio', age: 27, phone: 100 }

TestUse(userObj)
```

### 2. 使用介面繼承擴展原型別定義

```Ts
interface IUser {
  name: string
  age: number
}

interface IUserWithPhone extends IUser {
  phone: number
}

function TestUse(user: IUser) {
  console.log('user', user)
}

const userObj: IUserWithPhone = { name: 'Antonio', age: 27, phone: 100 }

TestUse(userObj)
```

### 3. 使用型別交集（Type Intersection）

```Ts
interface IUser {
  name: string
  age: number
}

type IUserWithPhone = IUser & {
  phone: number
}

function TestUse(user: IUser) {
  console.log('user', user)
}

const userObj: IUserWithPhone = { name: 'Antonio', age: 27, phone: 100 }

TestUse(userObj)
```

## 回到問題場景的解決方案

回到文章開頭的 Nest.js 範例，只需要在定義 `mockData` 時明確標註型別，TypeScript 就會對多餘的屬性進行檢查並報錯：

```Ts
private mockData: FilterUsersResponseDto[] = [
  {
    id: 1,
    name: 'John Doe',
    role: UserRole.Admin,
    status: UserStatus.Active,
    email: 'john.doe@example.com',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-10'),
    test: 123, // Error: 'test' does not exist in type 'FilterUsersResponseDto'
  },
  // 略
];
```

這樣一來，當我們不小心新增了 `test` 這個多餘屬性時，TypeScript 會立即提示錯誤，避免潛在的型別不一致問題。

## 補充資料來源

- [Understanding TypeScript’s Handling of Object Literal Types: The Quirks and Insights](https://blog.stackademic.com/understanding-typescripts-handling-of-object-literal-types-the-quirks-and-insights-c1c8b4e49645)

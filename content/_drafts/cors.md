---
title: "CORS 到底在擋什麼？Vue 3 + NestJS 跨來源 Cookie 實作筆記"
tags:
  - CORS
  - Vue 3
  - NestJS
  - Cookie
  - Web Security
categories:
  - 前端開發
  - Web 安全
description: "從同源政策、簡單請求與預檢請求開始，實作 Vue 3 與 NestJS 的 CORS 設定，並說明跨來源 Cookie、withCredentials、HttpOnly、SameSite 與 CSRF 防護。"
---

在前後端分離的專案中，很常會遇到「API 明明有回應，瀏覽器卻不讓 JavaScript 讀取」的情況。這類問題通常和同源政策、CORS 有關；如果請求還要攜帶 Cookie，就會接著碰到 `credentials`、`HttpOnly` 與 `SameSite` 等設定。

這篇是我整理的 CORS 實作筆記。我會先從同源政策、簡單請求與預檢請求開始，再用 Vue 3 和 NestJS 實際操作，接著整理跨來源 Cookie 與幾個容易忽略的安全問題，最後補上 Nginx Proxy 這種不讓瀏覽器直接跨來源呼叫 API 的做法。

## 同源政策（Same-Origin Policy, SOP）

> [SOP（MDN 說明）](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)

同源政策是瀏覽器的安全機制，主要用來**限制網站透過 JavaScript 讀取其他來源的資料**。所謂「同源」，是指通訊協定、網域與連接埠都相同；其中一項不同，就屬於不同來源。

![同源判定圖解](https://hackmd.io/_uploads/rJ7k24eCGx.png)

不過，使用 `<img>` 載入其他網站的圖片，或透過 `<link>` 載入外部 CSS 時，通常不會被同源政策阻擋。這是因為「載入資源來顯示或套用」和「透過 JavaScript 讀取資源內容」是不同的操作。

瀏覽器通常允許跨來源載入圖片、CSS 等資源，但這不代表 JavaScript 能自由讀取其內容。如果要進一步限制網頁可載入的資源來源，可以使用 CSP（內容安全政策），本文先不深入討論。

同源政策的重要性，可以從銀行網站的情境理解。假設你已登入銀行網站，接著開啟另一個電商網站。如果電商網站的 JavaScript 能利用你的登入狀態任意讀取銀行資料，就可能在你毫無察覺時取得帳戶餘額或交易紀錄。

同源政策會限制這類跨來源資料讀取，但**不會阻止所有跨來源請求；請求能否送出，和 JavaScript 能否讀取回應，是兩件不同的事。**

## 跨來源資源共用（Cross-Origin Resource Sharing, CORS）

> [CORS（MDN 說明）](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

在常見的前後端分離架構中，如果前端網站與後端 API 使用不同的網域或連接埠，就屬於不同來源。後端需要設定 **CORS（跨來源資源共用）**，瀏覽器才會允許前端 JavaScript 讀取回應。

後端可以設定允許哪些來源讀取資料，以及可使用哪些 HTTP 請求方法與請求標頭，再透過回應標頭將規則告訴瀏覽器。瀏覽器會依照這些規則檢查，通過後才允許 JavaScript 讀取回應。

**SOP 與 CORS 並不衝突：SOP 限制跨來源資料的讀取，CORS 則讓後端明確設定可放行的來源。**

另外，CORS 是瀏覽器執行的規則，不是 API 的驗證機制。`curl`、Postman 或其他後端服務不會受到 CORS 限制，所以真正需要保護的 API 還是要做好身分驗證與權限檢查。

![SOP 與 CORS 跨來源示意圖](https://hackmd.io/_uploads/Hy6I6sbCGx.png)

處理跨來源請求時，有些請求會直接送出，有些則會先送出一個 `OPTIONS`。瀏覽器會根據請求是否符合「簡單請求」的條件，決定要不要先向後端進行預檢。

## 簡單請求與預檢請求差在哪？

瀏覽器會根據**請求方法、請求標頭等條件**，判斷跨來源請求是否需要預檢。

### 簡單請求（Simple Request）

符合簡單請求條件時，瀏覽器會直接將請求送給後端，不必事先預檢。後端可以照常處理並回傳資料，但瀏覽器仍會檢查回應中的 CORS 標頭；如果目前的來源未被允許，JavaScript 就無法讀取回應。

例如，不帶額外自訂標頭的 `GET` 通常屬於簡單請求。不過，**不是所有 `GET` 都不需要預檢，也不是 `POST` 就一定需要預檢**，還是要看請求標頭與資料格式。

### 預檢請求（Preflight Request）

> [preflight request（MDN 說明）](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)

如果不符合簡單請求的條件，例如使用 `PUT`、`DELETE`，或透過 `POST` 傳送 `application/json` 格式的資料，瀏覽器會先自動發送 `OPTIONS` 請求，確認後端是否允許目前的來源使用指定的 HTTP 方法與請求標頭。

預檢通過後，瀏覽器才會送出實際請求；如果未通過，就不會送出。整個過程由瀏覽器自動處理，前端不需要自行撰寫兩次請求。

預檢雖然會多一次網路往返，但後端可以設定快取時間。快取還在有效期間時，符合條件的請求就不用重複發送 `OPTIONS`。

**看到 CORS 錯誤，不一定代表實際請求沒有送出**。簡單請求可能已由後端處理，只是 JavaScript 無法讀取回應；需要預檢的請求，則可能因預檢未通過而尚未送出。即使預檢通過，實際回應仍須通過 CORS 檢查，JavaScript 才能讀取資料。

了解這兩種請求的差別後，接下來直接用 Vue 3 與 NestJS 實際觀察瀏覽器的行為。

## 用 Vue 3 + NestJS 實際看看 CORS

> [Express cors 套件設定文件](https://github.com/expressjs/cors#configuration-options)

接下來使用 Vue 3 前端呼叫 NestJS 後端 API，兩者的網址如下：

- Vue 3 前端：`http://localhost:5173`
- NestJS 後端：`http://localhost:3100`

兩者使用不同的連接埠，因此屬於不同來源。如果後端未設定 CORS 允許前端存取，瀏覽器會阻擋 JavaScript 讀取回應，並在 DevTools Console 顯示錯誤：

![跨來源請求失敗的情形](https://hackmd.io/_uploads/HkbnIoWAfe.png)

在使用 Express 的 NestJS 專案中，可以呼叫 `enableCors()` 啟用 CORS：

```ts
app.enableCors(); // 使用 cors 套件的預設設定
```

預設設定如下：

```ts
app.enableCors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
```

各欄位說明如下：

- **`origin`**：設定 `Access-Control-Allow-Origin` 回應標頭，用來告訴瀏覽器哪些來源可以讀取回應。
- **`methods`**：允許的 HTTP 方法，透過預檢回應告知瀏覽器。
- **`preflightContinue`**：是否將預檢請求交給後續的 middleware 或路由處理。預設為 `false`，由 `cors` 套件直接回應。
- **`optionsSuccessStatus`**：由 `cors` 套件回應預檢請求時使用的成功狀態碼，預設為 `204`，不包含回應內容。

完成 CORS 基礎設定後，我們用兩個 API 觀察瀏覽器如何處理不同類型的跨來源請求：

- `GET /heartbeat`：檢查服務狀態，回傳 `204`，模擬 simple request
- `POST /users`：送出 JSON 格式的名稱與年齡建立用戶，`Content-Type: application/json` 會觸發預檢，模擬 preflight request

以需要預檢的 `POST` 請求為例，從瀏覽器的 Network 面板可以看到，瀏覽器會先送出 `OPTIONS` 預檢請求，通過後才送出實際的 `POST` 請求。

![POST /users 先送出 OPTIONS 預檢請求](images/cors/options-preflight.png)

### 快取預檢結果

如果 API 經常觸發預檢，可以在 `enableCors()` 中設定 `maxAge`：

```ts
app.enableCors({
  origin: "http://localhost:5173",
  maxAge: 600,
});
```

`maxAge` 的單位是秒。上面的設定會回傳 `Access-Control-Max-Age: 600`，讓瀏覽器快取預檢結果 10 分鐘。瀏覽器本身可能會限制最長快取時間，所以實際時間不一定完全等於設定值。

除了是否快取預檢結果，`origin` 也是 CORS 設定中很容易混淆的一項，尤其是 `true` 和 `"*"` 看起來都像是允許所有來源，實際回傳的標頭卻不一樣。

## `origin: true` 跟 `origin: "*"` 差在哪？

這兩種設定看起來都能開放所有來源，差別在於回傳的 `Access-Control-Allow-Origin`：

- **`origin: "*"`**：固定回傳 `Access-Control-Allow-Origin: *`，表示允許所有來源，適合不需要 Cookie 等憑證的公開資源。
- **`origin: true`**：將請求的 `Origin` 帶入回應。例如請求來自 `http://localhost:5173`，後端就會回傳 `Access-Control-Allow-Origin: http://localhost:5173`。

瀏覽器不允許 `Access-Control-Allow-Origin: *` 與憑證請求一起使用，所以 `origin: "*"` 不能搭配 `credentials: true`。`origin: true` 雖然會回傳明確的來源，但每個請求來源都會被帶入回應，實際上也沒有來源限制。

正式環境如果要攜帶 Cookie，建議直接設定允許的來源、來源清單，或使用函式檢查來源，不要把 `origin: true` 當成白名單。

單純讀取公開資料時，`origin: "*"` 可能就足夠；一旦請求需要登入狀態或 Refresh Token，就要進一步處理跨來源 Cookie。

## 讓跨來源請求攜帶 Cookie

實務上使用 Access Token 和 Refresh Token 時，我們通常會把效期較短的 Access Token 存在前端記憶體，再把效期較長的 Refresh Token 放進 Cookie。這時除了 CORS 的 `origin`，前後端還要分別允許請求攜帶 Cookie。

Access Token 過期後，前端可以呼叫 Refresh API 取得新的 Token。Refresh Token 存在 Cookie 中，所以瀏覽器要在請求中一起帶上 Cookie。

![瀏覽器 Token 儲存與更新流程](https://hackmd.io/_uploads/BJLKqfGCMx.png)

透過 Axios 發送跨來源請求時，預設不會帶上 Cookie，也不會處理回應中的 `Set-Cookie`。前端需要加入 `withCredentials: true`：

```ts
axios
  .post("http://localhost:3100/users", userInfo, {
    withCredentials: true,
  })
  .then((res) => {
    console.log("res", res);
  });
```

設定後，可以在 Network 面板的 Request Headers 中看到請求攜帶的 Cookie：

![請求攜帶 Cookie 資訊](images/cors/cookie-request.png)

NestJS 後端也要在 `enableCors()` 中開啟 `credentials`，並指定允許的前端來源：

```ts
app.enableCors({
  origin: "http://localhost:5173",
  credentials: true,
});
```

後端會在回應標頭中加入 `Access-Control-Allow-Credentials: true`：

![後端允許跨來源請求攜帶 Cookie](images/cors/cors-credentials.png)

開啟 `credentials` 後，`origin` 不能使用 `"*"`，需要填入實際允許的來源。另外，`withCredentials` 只負責 Cookie 等瀏覽器憑證；如果 Token 放在 `Authorization` 標頭，前端還是要自行加入。

到這裡處理的是「讓瀏覽器在跨來源請求中收送 Cookie」。至於 Refresh Token 要怎麼寫進 Cookie，以及怎麼避免前端 JavaScript 直接讀取，就要接著設定 `Set-Cookie` 與 `HttpOnly`。

## 使用 `Set-Cookie` 與 `HttpOnly` 儲存 Refresh Token

NestJS 後端可以透過 `Set-Cookie` 將 Refresh Token 寫入 Cookie。加上 `HttpOnly` 後，前端 JavaScript 無法透過 `document.cookie` 讀取 Token，但瀏覽器仍會在符合 Cookie 規則時自動帶上它。這樣可以降低 Token 被 XSS 攻擊直接竊取的風險。

以模擬登入的 `POST /auth/login` 為例，這支 API 不驗證帳密，直接用 Express 的 `res.cookie()` 在回應寫入 Cookie：

```ts
import { Controller, HttpCode, Post, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller()
export class AppController {
  @Post("auth/login")
  @HttpCode(200)
  login(@Res({ passthrough: true }) res: Response) {
    res.cookie("refreshToken", "demo-token", {
      httpOnly: true,
    });

    return { message: "登入成功" };
  }
}
```

`@Res({ passthrough: true })` 讓我們可以操作 Express 的 `Response` 寫入 Cookie，同時保留 NestJS 原本的回應處理流程。

前端送出請求後，可以在 Network 面板的 Response Headers 看到 `Set-Cookie: refreshToken=demo-token; Path=/; HttpOnly`，以及 `Access-Control-Allow-Origin: http://localhost:5173`：

![後端透過 Set-Cookie 寫入 HttpOnly Cookie](images/cors/set-cookie-response.png)

瀏覽器收到回應後，可以在 Application 面板的 Cookies 確認 `refreshToken` 已寫入，並且 `HttpOnly` 欄位已勾選：

![瀏覽器存入 HttpOnly 的 refreshToken](images/cors/cookie-httponly.png)

## 再用 `SameSite` 控制跨站 Cookie

把 Refresh Token 設為 `HttpOnly` 後，JavaScript 雖然不能直接讀取內容，瀏覽器仍會在符合規則的請求中自動帶上 Cookie。接下來還要透過 `SameSite` 控制跨站請求能不能攜帶它，降低 CSRF 攻擊的風險。

這裡很容易把「同站」和前面的「同源」混在一起。同站主要比較通訊協定與可註冊網域，不比較連接埠，所以不同來源仍可能屬於同站。

![同站以通訊協定與可註冊網域判斷](images/cors/same-site.png)

`SameSite` 提供三種設定：

- **`Strict`**：只在同站請求中帶上 Cookie，限制最嚴格。
- **`Lax`（預設）**：同站請求會正常帶上 Cookie。使用者從其他網站點擊連結進入本站時，`GET` 請求也會帶上 Cookie，但跨站 `fetch` 或 `POST` 請求不會。
- **`None`**：同站與跨站請求都能帶上 Cookie，而且必須同時設定 `Secure`，讓 Cookie 只透過 HTTPS 傳送。

### 案例：允許跨站攜帶，不代表分享 Cookie

假設我們有兩個不同的系統：

| 系統 | 網址                   |
| ---- | ---------------------- |
| A    | `https://system-a.com` |
| B    | `https://system-b.com` |

使用者登入 A 後，瀏覽器會保存屬於 `system-a.com` 的 Token Cookie。`SameSite` 控制的是「從其他網站向 A 發出請求時，能不能帶上 A 的 Cookie」，不會把這個 Cookie 複製或分享給 B。

- **從 A 前往 B**：請求會送到 `system-b.com`，所以不會帶上 A 的 Cookie，B 也不會收到這個 Cookie。
- **從 B 呼叫 A 的 API**：請求會送到 `system-a.com`，這才是跨站攜帶 A 的 Cookie。Cookie 設為 `SameSite=None; Secure`，前端開啟 `withCredentials`，後端也允許憑證請求後，瀏覽器就能將 Cookie 傳回 A。Cookie 從頭到尾都沒有交給 B。

`SameSite=Lax` 也不會擋下所有跨站請求。假設 B 是攻擊者控制的網站，而 A 把刪除資料的功能設計成 `GET /users/123/delete`，攻擊者就能在 B 放上這個網址。使用者點擊後，瀏覽器會把它當成前往 A 的頂層 `GET` 導向，並可能帶上 A 的 Cookie。A 收到具有登入狀態的請求後，就會執行刪除操作。

瀏覽器只會根據請求情境與 HTTP 方法套用 `SameSite` 規則，不知道這支 API 會刪除資料。因此，`GET` 應該只用來讀取資料；新增、修改或刪除操作應使用 `POST`、`PUT`、`PATCH` 或 `DELETE`，並搭配 CSRF Token 或檢查 `Origin` 等防護措施。`SameSite` 可以降低 CSRF 風險，但不能取代正確的 API 設計。

再看子網域的情況。`https://a.example.com` 與 `https://b.example.com` 屬於同站，但不代表兩者會自動收到相同的 Cookie。A 沒有設定 `Domain` 時，Cookie 只會跟著送往 `a.example.com` 的請求；設定 `Domain=example.com` 後，送往 A、B 或其他子網域的請求才可能帶上這個 Cookie。

![Domain 與 SameSite 的作用](images/domain-vs-samesite.png)

如果前端與 API 位於不同站，而且跨站請求需要攜帶 Refresh Token，可以在 NestJS 中設定：

```ts
res.cookie("refreshToken", refreshToken, {
  httpOnly: true, // 禁止 JavaScript 透過 document.cookie 讀取
  sameSite: "none", // 允許跨站請求攜帶 Cookie
  secure: true, // 僅透過 HTTPS 傳送 Cookie
});
```

設定 `SameSite=None` 後，仍要搭配來源白名單、CSRF Token 或檢查 `Origin` 等防護措施，避免其他網站利用使用者的登入狀態發出未授權請求。

## 另一種做法：用 Nginx Proxy 統一 API 入口

前面整理的做法，都是讓瀏覽器直接跨來源呼叫 NestJS，再由前後端配合處理 CORS 與 Cookie。如果架構允許，也可以換一個方向：在前端與 API 前面放一層 Nginx，將兩者統一在同一個對外網域下，讓瀏覽器只需要呼叫同源路徑。

假設 Vue 3 網站和 API 都從 `https://example.com` 對外提供服務，可以在 Nginx 加入以下設定：

```nginx
server {
  listen 443 ssl;
  server_name example.com;

  root /usr/share/nginx/html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://nestjs:3100/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

前端只要請求同一個網域下的路徑：

```ts
axios.post("/api/users", userInfo);
```

瀏覽器看到的是 `https://example.com/api/users`，和前端頁面屬於同源，因此不會觸發瀏覽器的 CORS 檢查。Nginx 收到請求後，會把 `/api/users` 轉送到 NestJS 的 `http://nestjs:3100/users`。

### 本機開發時使用 Vite Proxy

本機開發沒有 Nginx 時，可以用 Vite 的 `server.proxy` 模擬相同的 `/api` 路徑：

```ts
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3100",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

這樣前端在開發與正式環境都能使用 `/api/users`，不需要根據環境改寫每一個 API 網址。不過，Proxy 只是統一請求入口，不是 API 的安全機制，身分驗證與權限檢查還是不能省略。

## 重點整理

- CORS 管的是瀏覽器能不能讓 JavaScript 讀取回應，不是 API 的身分驗證。
- 預檢請求由瀏覽器自動發送，可以用 `maxAge` 快取結果，減少重複的 `OPTIONS`。
- 跨來源請求要帶 Cookie，前端要設定 `withCredentials`，後端也要開啟 `credentials`，而且 `origin` 不能使用 `"*"`。
- `HttpOnly` 會阻止 JavaScript 讀取 Cookie，但瀏覽器仍可能自動帶上 Cookie。
- `SameSite` 決定跨站情境下能不能帶 Cookie，`Domain` 則決定 Cookie 可以送到哪些網域。
- `SameSite` 只能降低 CSRF 風險，不能取代正確的 API 方法、CSRF Token 與來源檢查。
- Nginx Proxy 可以讓瀏覽器只看到同源的 `/api` 路徑；本機開發時則可以用 Vite Proxy 模擬相同入口。

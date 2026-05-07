# API Routes Documentation & Recent Changes

Ye document is project ke saare API routes aur unme kiye gaye latest changes ko describe karta hai.

---

## 1. User Authentication & Dashboard Routes
**Base Route:** `/api/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST   | `/signup` | Public | Naya user register karne ke liye (returns token). |
| POST   | `/login` | Public | Existing user ko login karne ke liye (returns token). |
| GET    | `/dashboard` | Private (Token) | Logged-in user ka dashboard data return karta hai. |
| GET    | `/practice` | Public | Test route for practice. |

---

## 2. Questions & Progress Routes
**Base Route:** `/api/questions`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | `/` | Public (Optional Auth) | **[UPDATED]** Sabhi questions ki list deta hai. Agar token diya gaya ho, toh `isSolved: true/false` map karke bhejta hai. |
| GET    | `/:id` | Public (Optional Auth) | **[UPDATED]** Specific question ki details deta hai. Token pass hone par check karta hai ki user ne ye question solve kiya hai ya nahi. |
| POST   | `/:id/solve` | Private (Token) | **[NEW]** User ka code "Accepted" hone par is endpoint ko call kiya jata hai. Ye database me user ki progress ("Solved") save karta hai. |
| POST   | `/` | Private (Token) | Naya question database me add karne ke liye. |
| POST   | `/seed` | Private (Token) | Database me demo questions seed karne ke liye. |
| DELETE | `/clear` | Private (Token) | Database se saare questions clear karne ke liye. |

**Recent Changes (Kya Update Hua):**
* `GET /` aur `GET /:id` par `protect` ki jagah ek naya middleware `optionalAuth` lagaya gaya hai. Isse guest users ko saare questions mil jate hain (fresh content), aur logged-in users ko unki actual progress (isSolved) dikhayi deti hai.
* `POST /:id/solve` naya endpoint banaya gaya hai jisse user jab correct answer submit karta hai toh uski progress track ho sake.

---

## 3. Study Plans (Series) Routes
**Base Route:** `/api/study-plans`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | `/` | Public (Optional Auth) | **[UPDATED]** Saare study plans return karta hai. Isme total questions aur (agar logged in hai toh) completed questions ki ginti (count) aati hai. |
| POST   | `/seed` | Private (Token) | Database me demo study plans seed karne ke liye. |

**Recent Changes (Kya Update Hua):**
* `GET /` me ab `optionalAuth` middleware use ho raha hai. Backend automatically calculate karta hai ki user ne kis series/plan me kitne questions solve (completed) kiye hain. Ye dynamically frontend ke "Ongoing" section me show hota hai.

---

## 4. Code Execution Routes
**Base Route:** `/api/code`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST   | `/run` | Private (Token) | Frontend se code aur inputs receive karke local system pe run karta hai aur output/error wapas frontend ko bhejta hai. |

**Recent Changes (Kya Update Hua):**
* **Bug Fix (Unexpected Token ']'):** Testcase parser jo input strings read karta tha (jaise `nums = [1, 2]`), wo comma (`,`) ki wajah se fail ho raha tha. Humne ek robust **Regex (Regular Expression)** add kiya hai jisse variable names precisely extract ho jate hain aur parsing theek se kaam karti hai.

---

## 5. Middleware Changes (`authMiddleware.js`)
* **[NEW] `optionalAuth`**: Ye ek special middleware banaya gaya hai. Ye check karta hai ki agar request header me Token hai toh user fetch kar le, magar token missing ya galat hone par error phekne ki bajaye request ko gracefully aage pass kar deta hai. Ye public lists ke upar personal progress dikhane ke liye bohot zaroori tha.

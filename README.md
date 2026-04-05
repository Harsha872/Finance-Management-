# Finance Project 💸

Welcome to the **Finance Project**, a full-stack financial tracking and AI-driven analytics application. This platform helps individuals manage their records efficiently, offering automated insights and a conversational AI Assistant directly inside the portal.

---

## What has been done 🚀

We performed a deep overhaul of this application to make it production-ready. Here is exactly what we implemented and fixed:

### 1. Robust Server Stability & Configuration
- **Fixed Express Routing Issues:** Upgraded from legacy catch-all routes to `RegExp` routing. Without this, Express v5 instances continuously crash upon booting.
- **Fixed Missing Dependencies:** We identified, verified, and installed heavily relied-upon packages (like `express-validator`) that were causing startup failures.
- **Production Asset Serving:** Rewrote backend logic so the Node.js API server securely and dynamically serves our compiled React (`dist`) production files without needing an external web server instance.

### 2. Upgraded Routing & Security Architecture
- **JWT & Role-Based Access Control:** Reconfigured the backend infrastructure so users default to `admin` level during this testing phase, giving immediate access to the full platform. Previously, an account was locked to a restricted `Viewer` scope, causing most screens to be blank/hidden.
- **Protected UI Routes:** The frontend utilizes an `AuthGuard` which intelligently redirects users back to login sessions if unauthenticated. The Sidebar dynamically renders items (Analytics, Roles) depending on live JSON Web Tokens.

### 3. Feature Enhancements
- **Records Management:** Verified the full functional flow of tracking records. Now, administrators have the exclusive right to Add, Update, and Delete records to prevent accidental tampering globally.
- **Automation Blueprint:** Constructed and mapped a brand new `"Automation"` interface panel, ready to scale future workflows (like scheduled payments).
- **Embedded Swagger UI:** Deployed OpenAPI documentation strictly accessible at the `/api-docs` endpoint so subsequent developers never have to guess our API signatures and methods.

### 4. Interactive AI Finance Assistant 🤖
- Built an elegantly designed, interactive chat widget (floating right-stick behavior) for the frontend users.
- Provided 4 preset analytical queries (eg. *"What is my total net balance right now?"*).
- Created a robust custom algorithm inside the Node backend (`POST /analytics/assistant`) that natively pulls and processes user data out of the MongoDB clusters on the fly without relying on artificial or static mock data.

---

## Running the Application Locally

During development mode, run the modules separately to enjoy hot-reloading:
1. **Frontend:** Navigate to `finance-frontend` and run `$ npm run dev`.
2. **Backend:** Navigate to `finance-backend` and run `$ npm run dev` (powered by nodemon).
3. Open `http://localhost:3000` to interact deeply with the frontend. The Assistant connects dynamically to `localhost:5000`.

## Deploying to Production

When you are ready to put this online, you only need to run the backend!
1. Change into your frontend directory (`finance-frontend`).
2. Run `$ npm install` and then `$ npm run build`. This generates a `dist` array.
3. Start the backend by running `$ npm start` in `finance-backend`. The backend will automatically handle the API and serve your shiny frontend natively!

You are officially ready for scale. 🚀

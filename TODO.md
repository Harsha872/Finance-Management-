# TODO: Fix CORS and React Router Warnings

## Steps (Code fixes complete):

- [x] 1. Edit finance-backend/server.js to configure CORS with origin 'http://localhost:3000'
- [x] 2. Edit finance-frontend/src/App.jsx to add future={{ v7_startTransition: true, v7_relativeSplatPath: true }} to BrowserRouter
- [x] 3. Restart backend server (kill existing process and run again) 
  ```
  REM Windows CMD - Kill old Node (if needed):
  taskkill /f /im node.exe
  cd finance-backend
  npm start
  ```
  **Frontend on port 3001 - CORS now allows 3000/3001**


- [x] 4. Test: Try register/login, check browser console for no CORS errors or Router warnings

**Progress tracked here after each step.**

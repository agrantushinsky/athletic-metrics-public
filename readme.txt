==================================
Getting started
==================================
Create .env with the following in ./backend:
MONGODB_PWD=""
URL_PRE=""
URL_POST=""
FRONT_END=http://localhost:3000

Create .env with the following in ./frontend:
REACT_APP_BACKEND=http://localhost:1339

==================================
Running locally
==================================
Run Backend:
cd ./backend
npm i
node server.js

Run Frontend:
cd ./frontend
npm i
npm start

Now, navigate to the following URL to access the frontend page:
http://localhost:3000/

==================================
Visiting deployment
==================================
Navigate to:
https://frontend-0tps.onrender.com/

NOTE:
1) The backend often takes a few minutes to start up when opening the page.
2) For some reason, cookies do not work on the deployed version on chrome and some other browsers. We recommend Firefox (This is a non-issue on the local version).

==================================
Running tests
==================================
cd ./backend
npm i
npm run test

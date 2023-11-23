# Running Locally
## 1. Setup .env files
### 1.1. Create .env with the following in ./backend:
```
MONGODB_PWD=""
URL_PRE=""
URL_POST=""
FRONT_END=http://localhost:3000
```

### 1.2. Create .env with the following in ./frontend:
```
REACT_APP_BACKEND=http://localhost:1339
```

## 2. Starting application
### 2.1. Start backend:
```
$ cd ./backend
$ npm i
$ node server.js
```

### 2.2. Start frontend:
```
$ cd ./frontend
$ npm i
$ npm start
```

## 3. Visiting webpage
Navigate to:
http://localhost:3000/

# Visiting public deployment
Navigate to:
https://frontend-0tps.onrender.com/

# Note
1) The backend often takes a few minutes to start up when opening the page.
2) For some reason, cookies do not work on the deployed version on chrome and some other browsers. We recommend Firefox (This is a non-issue on the local version).

# Running tests
```
$ cd ./backend
$ npm i
$ npm run test
```

# Authors
- Aidan Grant-Ushinsky
- Nitpreet Arneja
- Ron Fudim
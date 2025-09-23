# Server setup

Create a `.env` file in `server/` with:

```
MONGODB_URI=your-mongodb-uri
MONGODB_DB=citybeatflow
PORT=4000
JWT_SECRET=change-me
```

Run:

```
npm install --prefix server
npm run dev --prefix server
```





require('dotenv').config();
const { Pool, Client } = require('pg');
const express = require('express');
const app = express();
const fs = require('fs');

app.set('port', process.env.PORT || 3000);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('public'));

app.listen(app.get('port'));

app.get('/api/systems', function (expressRequest, expressResponse) {
  const pool = new Pool();
  pool.query(getQuery('get-systems'))
  .then(poolResponse => {
    expressResponse.setHeader('Content-Type', 'application/json');
    expressResponse.send(JSON.stringify(poolResponse.rows));
    pool.end();
  })
  .catch(poolError => {
    pool.end();
    expressResponse.send("{error:true}");
  });
})

app.get('/api/systems/:id', function (expressRequest, expressResponse) {
  let {id} = expressRequest.params;
  console.log(id);
})


function getQuery(id){
  return fs.readFileSync(`source/sql/${id}.sql`, "utf-8");
}

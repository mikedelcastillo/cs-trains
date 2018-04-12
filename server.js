require('dotenv').config();
const {Pool, Client} = require('pg');
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

app.get('/api/systems', function(expressRequest, expressResponse) {
  const pool = new Pool();
  pool.query(getQuery('get-systems')).then(poolResponse => {
    expressResponse.setHeader('Content-Type', 'application/json');
    expressResponse.send(JSON.stringify(poolResponse.rows));
    pool.end();
  }).catch(poolError => {
    pool.end();
    expressResponse.send(`{"error":true}`);
  });
})

app.get('/api/systems/:id', function(expressRequest, expressResponse) {
  expressResponse.setHeader('Content-Type', 'application/json');
  const pool = new Pool();
  const {id} = expressRequest.params;
  let systems = [];

  pool.query(getQuery('get-system'), [id]).then(poolSystemsResponse => {
    let systems = [];

    poolSystemsResponse.rows.forEach(system => {
      let {system_id} = system;
      pool.query(getQuery('get-lines'), [system_id]).then(poolResponse => {
        system.lines = poolResponse.rows.map(row => [row.line_id.trim(), row.line_name.trim()]);

        return pool.query(getQuery('get-stations'), [system_id]);
      }).then(poolResponse => {
        system.stations = poolResponse.rows.map(row => [row.station_id.trim(), row.station_name.trim()]);

        return pool.query(getQuery('get-order'), [system_id]);
      }).then(poolResponse => {
        system.order = poolResponse.rows.map(row => [Number(row.order_number.trim()), row.line_id.trim(), row.station_id.trim()]);

        if(system.order.length == 0){
          system.stations.forEach(station => {
            let station_id = station[0];
            for(let i = 0; i < 1 + Math.floor(Math.pow(Math.random(), 10) * system.lines.length); i++){
              let line = system.lines[Math.floor(Math.random() * system.lines.length)];
              let line_id = line[0];
              system.order.push([Math.floor(Math.random() * 100), line_id, station_id]);
            }
          });
        }

        systems.push(system);

        if (systems.length == poolSystemsResponse.rows.length) {
          expressResponse.send(JSON.stringify(systems));
          pool.end();
        }
      }).catch(e => {
        console.log(e)
      });

    });
  }).catch(e => {
    pool.end();
    expressResponse.send(`{"error":true}`);
  });
})

app.get('/api/systems/:id/:start/:end', function(expressRequest, expressResponse) {
  const pool = new Pool();
  const {id, start, end} = expressRequest.params;
  pool.query({
    text: getQuery('get-entries-exits'),
    values: [id, start, end]
  }).then(poolResponse => {
    expressResponse.setHeader('Content-Type', 'application/json');
    expressResponse.send(poolResponse.rows.map(o => {
      return [o.unix_start, o.unix_end, o.station_id, o.entries, o.exits].join(",");
    }).join("\n"));
    pool.end();
  }).catch(poolError => {
    console.log(poolError)
    pool.end();
    expressResponse.send(`{"error":true}`);
  });
})

function getQuery(id) {
  return fs.readFileSync(`source/sql/${id}.sql`, "utf-8");
}

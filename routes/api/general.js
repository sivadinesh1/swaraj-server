const express = require('express');
const router = express.Router();


const mysql = require('mysql');




const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'filia',
  database: 'swaraj'
});

router.get('/:id', (req, res) => {
  let id = req.params.id;
  let query = `select * from user where userid =${id}`;

  connection.query(query, function (err, data) {

    // connection.query("select * from user", (err, rows, fields) => {
    //     console.log('object fethd users ' + res.json(rows));
    //     res.json(rows);
    // });

    if (err) {
      console.log('object error ' + err);
      res.status(500).json({
        msg: `DB down`
      });
    } else {
      res.json(data);
    }
  });
});



router.get('/part-details/:id', (req, res) => {

  let id = req.params.id;

  let sql = `select a.partno, a.description, a.mrp, b.quantity, b.date_stock 
  from parts a, parts_stock b
  where 
  a.partno = b.partno and
  a.partno like '%${id}%' or
  a.description like '%${id}%'  limit 20 `;





  // let where = `where p.PartNo= ps.partno
  // and p.Description like '%${id}%'
  // or  p.PartNo   like '%${id}%' `;

  // let sql = `select p.partno, p.Description, p.MRP, ps.quantity, ps.date_stock 
  // from parts p, 
  //      parts_stock ps ${where}`;


  // console.log('object.....' + sql);
  //console.log('>>>>>>>' + id);

  connection.query(sql, function (err, data) {

    if (err) {
      console.log('object error ' + err);
    } else {
      res.json(data);
    }
  });
});



router.get('/inventory/all', (req, res) => {

  let sql = `select p.partno, p.Description, p.MRP, ps.quantity, ps.date_stock 
  from parts p, 
       parts_stock ps 
  where p.PartNo= ps.partno`;

  connection.query(sql, function (err, data) {


    if (err) {
      console.log('object error ' + err);
    } else {
      res.json(data);
    }
  });
});




module.exports = router;
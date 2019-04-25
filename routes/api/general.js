const express = require("express");
const router = express.Router();

const mysql = require("mysql");
const moment = require("moment-timezone");
var request = require("request");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "filia",
  database: "survey",
  charset: "utf8"
});

// signin
router.post("/signin", (req, res) => {
  let phonenumber = req.body.phonenumber;
  let password = req.body.password;

  let query = `select * from user where mobilenumber = '${phonenumber}' and pass = '${password}'`;

  console.log("object query >> " + query);

  connection.query(query, function (err, data) {
    if (data.length > 0) {
      console.log("object pass match" + JSON.stringify(data));
      console.log("object..." + data[0].userId);
      res.json({
        result: "OK",
        role: data[0].role,
        userid: data[0].id,
        username: data[0].username
      });
    } else if (err) {
      console.log("Error while signing in  " + err);
    } else {
      console.log("object pass mismatch");
      res.json({
        result: "NOTOK"
      });
    }
  });
});

/**
 STATUS - 

 U - UPCOMING
 C - SURVEY COMPLETED
 H - SURVEY IN HOLD
 L - SURVEY LIVE
*/
router.get("/user-surveys-status/:userid/:status", (req, res) => {
  let userid = req.params.userid;
  let status = req.params.status;

  let query = ` 
        select survey.* from survey, user  
        where 
        user.id = survey.createdby and
        user.isactive = 'Y' and
        survey.isactive = '${status}' and
        user.id = '${userid}' order by createddate desc`;

  console.log("object query >> " + query);

  connection.query(query, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

// Send OTP
router.post("/sendotp/:mobilenumber", (req, res) => {
  let phonenumber = req.params.mobilenumber;

  let sql = ` select count(*) as cnt from user where mobilenumber = '${phonenumber}' `;

  let phonenumbercount = 0;

  connection.query(sql, function (err, data1) {
    if (err) {
      console.log("object error " + err);
    } else {
      let count = JSON.stringify(data1);
      console.log("object.." + data1[0].cnt);
      phonenumbercount = data1[0].cnt;

      if (+phonenumbercount > 0) {
        res.json("DUPLICATE_PHONO");
        return;
      } else {
        var options = {
          method: "GET",
          url: `https://2factor.in/API/V1/4d830b8e-7c1a-11e8-a895-0200cd936042/SMS/${phonenumber}/AUTOGEN/survey`,
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          form: {}
        };

        request(options, function (error, response, data) {
          if (error) throw new Error(error);

          console.log(data);
          res.json(data);
        });
        return;
      }
    }
  });
});

// Verify OTP
router.post("/verifyotp/:otpsessionid/:enteredotp", (req, res) => {
  console.log("inside sendotp..");

  let otpsessionid = req.params.otpsessionid;
  let enteredotp = req.params.enteredotp;

  var options = {
    method: "GET",
    url: `https://2factor.in/API/V1/4d830b8e-7c1a-11e8-a895-0200cd936042/SMS/VERIFY/${otpsessionid}/${enteredotp}`,
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    form: {}
  };

  request(options, function (error, response, data) {
    if (error) {
      console.log("err" + data);
      res.json(data);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

router.post("/add-user", (req, res) => {
  console.log("object...." + JSON.stringify(req.body));
  let phonenumber = req.body.phonenumber;
  let firstname = req.body.name;
  let companyname = req.body.companyname;
  let password = req.body.password;
  let langage = "english";
  console.log("object..phonenumber." + phonenumber);
  console.log("object..firstname." + firstname);
  console.log("object..companyname." + companyname);

  var today = new Date();
  today = moment(today).format("YYYY-MM-DD HH:mm:ss");
  let query = `INSERT INTO user 
              ( mobilenumber, username, pass, companyname, lang, isactive, registered_date) 
              values ( '${phonenumber}', '${firstname}', '${password}', '${companyname}',  '${langage}', 'Y', '${today}')`;

  connection.query(query, function (err, data) {
    if (err) {
      console.log("object..." + err);
      res.status(500).json({
        result: "NOTOK",
        message: `ERROR While updating.`
      });
    } else {
      let userid = data.insertId;
      console.log("object inside else ..." + userid);

      res.json({
        result: "OK",
        newuserid: userid
      });
    }
  });
});

router.post("/add-survey", (req, res) => {
  let createdby = req.body.loggedinuser;
  let surveyname = req.body.surveyname;
  let surveyvenue = req.body.surveyvenue;
  let surveydate = req.body.surveydate;
  let servicetype = req.body.servicetype;
  let surveycode = req.body.surveycode;
  console.log("object" + surveydate);

  let surveydateformatted = moment
    .utc(surveydate, "YYYY-MM-DD  HH:mm a")
    .format("YYYY-MM-DD HH:mm");

  console.log("object......." + surveydateformatted);

  var today = new Date();
  today = moment(today).format("YYYY-MM-DD HH:mm:ss");
  let query = `INSERT INTO survey 
              ( createdby, surveyname, surveyvenue, surveydate, servicetype, isactive, createddate) 
              values ( '${createdby}', '${surveyname}',  '${surveyvenue}',  '${surveydateformatted}', '${servicetype}', 'U', '${today}')`;

  connection.query(query, function (err, data) {
    if (err) {
      console.log("object..." + err);
      res.status(500).json({
        result: "NOTOK",
        message: `ERROR While updating.`
      });
    } else {
      let surveyid = data.insertId;
      let surveycode = `survey${surveyid}`;
      console.log("object inside else ..." + surveyid);

      let sql = `update survey set surveycode = '${surveycode}' where id = '${surveyid}'`;
      connection.query(sql, function (err, data) {
        if (err) {
          console.log("error updating surveycode");
        } else {
          console.log("successfully updated surveycode");
        }
      });

      res.json({
        result: "OK",
        newsurvey: surveyid
      });
    }
  });
});

router.post("/add-survey-question", (req, res) => {
  let surveyid = req.body.surveyid;
  let question = req.body.question;
  let optiongroupname = req.body.optiongroupname;
  let question_sequence = req.body.question_sequence;
  let created_by = req.body.loggedinuser;

  var today = new Date();
  today = moment(today).format("YYYY-MM-DD HH:mm:ss");
  let query = `INSERT INTO surveyquestion 
              ( surveyid, question, optiongroupname, question_sequence, created_by, isactive, createddate) 
              values ( '${surveyid}', '${question}', '${optiongroupname}',  '${question_sequence}', '${created_by}', 'Y', '${today}')`;

  connection.query(query, function (err, data) {
    if (err) {
      console.log("object..." + err);
      res.status(500).json({
        result: "NOTOK",
        message: `ERROR While updating.`
      });
    } else {
      let questionid = data.insertId;

      res.json({
        result: "OK",
        newquestionid: questionid
      });
    }
  });
});

router.post("/add-response", (req, res) => {
  let surveyid = req.body.surveyid;
  let questionid = req.body.questionid;
  let optionid = req.body.optionid;
  let guestname = req.body.guestname;

  var today = new Date();
  today = moment(today).format("YYYY-MM-DD HH:mm:ss");

  let query = `INSERT INTO response (surveyid, questionid, optionid, guestname, createddate) VALUES( '${surveyid}', '${questionid}', '${optionid}', '${guestname}', '${today}')`;

  connection.query(query, function (err, data) {
    if (err) {
      console.log("object..." + err);
      res.status(500).json({
        result: "NOTOK",
        message: `ERROR While updating.`
      });
    } else {
      let responseid = data.insertId;

      res.json({
        result: "OK",
        newquestionid: responseid
      });
    }
  });
});

router.get("/response-options/:lang/:industry", (req, res) => {
  let lang = req.params.lang;
  let industry = req.params.industry;

  let sql = `select groupname, option_sequence, res_options from optiongroup where lang = '${lang}' and industry in ('${industry}', 'generic')
  group by groupname, option_sequence, res_options`;

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/survey-short-summary/:surveyid", (req, res) => {
  let surveyid = req.params.surveyid;

  // select sq.question, og.res_options

  let sql = `select *
      from
      response rs,
      surveyquestion sq,
      optiongroup og,
      survey sv
      where
      sq.id = rs.questionid and
      sv.id = rs.surveyid and
      og.id = rs.optionid and
      rs.surveyid = '${surveyid}' `;

  console.log("QUERY " + sql);

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/survey-basic-info/:surveyid", (req, res) => {
  let surveyid = req.params.surveyid;

  let sql = ` select   sv.surveyname, sv.surveycode, sv.surveyvenue, sv.surveydate, sv.servicetype, id
    from
    survey sv
    where 
    id =  '${surveyid}' `;

  console.log("QUERY " + sql);

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/service-type/:lang/:industry/:servicecategory", (req, res) => {
  let lang = req.params.lang;
  let industry = req.params.industry;
  let servicecategory = req.params.servicecategory;

  let sql = `select servicetype from servicetype where lang='${lang}' and industry='${industry}' and servicecategory='${servicecategory}' `;
  // console.log('object>>>>>>' + sql);
  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/survey-info-by-id/:surveyid", (req, res) => {
  let surveyid = req.params.surveyid;

  console.log("object......surveyid..." + surveyid);
  let sql = `select  sq.id, surveyid, sq.question_sequence, og.option_sequence, question, optiongroupname, res_options, sq.createddate
  from 
  surveyquestion sq, 
  optiongroup og
  where 
  sq.optiongroupname = og.groupname and
  surveyid = ${surveyid}   order by sq.createddate`;

  console.log("object......QUERY..." + sql);

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      if (data.length === 0) {
        res.json({
          result: "NO-QUESTIONS",
          surveyid: surveyid
        });
      } else {
        res.json(data);
      }
    }
  });
});

router.get("/survey-info-by-code/:surveycode", (req, res) => {
  let surveycode = req.params.surveycode;

  let sql = `select surveyid, sq.id as questionid, sq.question_sequence, og.option_sequence, question, 
  optiongroupname, res_options,  og.id as optionid, sq.createddate, sv.surveycode
  from 
  surveyquestion sq, 
  optiongroup og,
  survey sv
  where 
  sq.optiongroupname = og.groupname and
  sv.id = sq.surveyid and 
  sv.surveycode = '${surveycode}'   order by sq.createddate`;

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/check-valid-surveycode/:surveycode", (req, res) => {
  let surveycode = req.params.surveycode;

  let sql = `select count(*) as count from survey where surveycode = '${surveycode}' and isactive = 'L'`;

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/get-survey-question-responses/:surveyquestionid", (req, res) => {
  let surveyquestionid = req.params.surveyquestionid;

  let sql = `select res_options
            from 
            optiongroup og,
            surveyquestion sq
            where
            sq.optiongroupname = og.groupname and
            sq.id = ${surveyquestionid} `;

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/get-user-info/:surveyid", (req, res) => {
  let surveyid = req.params.surveyid;

  let sql = `select * from user, survey
            where
            survey.createdby = user.id and
            survey.id = '${surveyid}' `;
  console.log('object' + sql);

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/get-survey-question/:surveyid/:surveyquestionid", (req, res) => {
  let surveyid = req.params.surveyid;
  let surveyquestionid = req.params.surveyquestionid;

  let sql = `select * from surveyquestion where surveyid = ${surveyid} and id = ${surveyquestionid}`;

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object error " + err);
    } else {
      res.json(data);
    }
  });
});

router.get("/update-survey-status/:surveyid/:status", (req, res) => {
  let surveyid = req.params.surveyid;
  let status = req.params.status;
  console.log("object " + surveyid);
  console.log("object " + status);

  var today = new Date();
  today = moment(today).format("YYYY-MM-DD HH:mm:ss");

  let query = `update survey set isactive = '${status}', updateddate = '${today}'  where id = '${surveyid}' `;
  console.log("object " + query);

  connection.query(query, function (err, data) {
    if (err) {
      console.log("object..." + err);
      res.status(500).json({
        result: "NOTOK",
        message: `ERROR While updating.`
      });
    } else {
      res.json({
        result: "OK"
      });
    }
  });
});

router.get("/delete-question/:surveyid/:surveyquestionid", (req, res) => {
  let surveyid = req.params.surveyid;
  let surveyquestionid = req.params.surveyquestionid;

  var today = new Date();
  today = moment(today).format("YYYY-MM-DD HH:mm:ss");

  let sql = `delete from surveyquestion where  surveyid = '${surveyid}' and id = '${surveyquestionid}'`;

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object..." + err);
    } else {
      res.json({
        result: "OK"
      });
    }
  });
});

router.post("/update-question", (req, res) => {
  let surveyid = req.body.surveyid;
  let surveyquestionid = req.body.surveyquestionid;
  let question = req.body.question;
  let optiongroupname = req.body.optiongroupname;

  var today = new Date();
  today = moment(today).format("YYYY-MM-DD HH:mm:ss");

  let sql = `update surveyquestion set question = '${question}' , optiongroupname = '${optiongroupname}' where surveyid = '${surveyid}' and id = '${surveyquestionid}'`;

  console.log("object >>>>>>>> " + sql);

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object..." + err);
    } else {
      res.json({
        result: "OK"
      });
    }
  });
});

router.post("/update-survey", (req, res) => {
  let surveyid = req.body.surveyid;
  let surveyname = req.body.surveyname;
  let surveyvenue = req.body.surveyvenue;
  let surveydate = req.body.surveydate;
  let servicetype = req.body.servicetype;

  let surveydateformatted = moment
    .utc(surveydate, "YYYY-MM-DD  HH:mm a")
    .format("YYYY-MM-DD HH:mm");
  var today = new Date();
  today = moment(today).format("YYYY-MM-DD HH:mm:ss");

  let sql = `update survey set surveyname = '${surveyname}', surveyvenue = '${surveyvenue}', surveydate = '${surveydateformatted}', servicetype = '${servicetype}' where id = '${surveyid}' `;

  console.log("object >>>>>>>> " + sql);

  connection.query(sql, function (err, data) {
    if (err) {
      console.log("object..." + err);
    } else {
      res.json({
        result: "OK"
      });
    }
  });
});

module.exports = router;
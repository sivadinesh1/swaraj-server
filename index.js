const express = require('express');

const mysql = require('mysql');
const moment = require('moment');

const logger = require('./middleware/logger.ts');
console.log(' 1111 ');
// const upload = require('./upload');

const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(express.static('public'));

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};
console.log(' 1112 ');
app.use(logger);
console.log(' 1113 ');
// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });


app.use(cors(corsOptions));

app.use(express.json({
    limit: '50mb'
}));
app.use(express.urlencoded({
    extended: false
}));

// general api routes
app.use('/api', require('./routes/api/general'));


app.get('/openCV/:id/:filename', function (req, res) {

    console.log('object ..SEND ME PDF..' + req.params.id);
    console.log('object ..SEND ME filename PDF..' + req.params.filename);

    // res.sendFile(__dirname + '/upload/103905.pdf', {
    //     headers: {
    //         'Content-Type': 'application/x-pdf'
    //     }
    // });

    var dir = process.env.UPLOAD_PATH;

    res.sendFile(dir + '/' + req.params.id + '/' + req.params.filename, {
        headers: {
            'Content-Type': 'application/x-pdf'
        }
    });


    console.log('object ..SEND ME PDF..' + req.params.id);

    // res.sendFile('/Users/sivadineshm/Documents/projects/bft/bft-server/upload/31/103905.pdf/1039051.pdf', {
    //     headers: {
    //         'Content-Type': 'application/pdf'
    //     }
    // });


    // res.format({


    //     'application/pdf': function () {

    //         res.sendFile('/Users/sivadineshm/Documents/projects/bft/' + req.params.id + '/' + req.params.filename, {
    //             headers: {
    //                 'Content-Type': 'application/pdf'
    //             }
    //         });
    //     },
    //     'application/msword': function () {

    //         res.sendFile('/Users/sivadineshm/Documents/projects/bft/' + req.params.id + '/' + req.params.filename, {
    //             headers: {
    //                 'Content-Type': 'application/msword'
    //             }
    //         });
    //     },
    //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document': function () {

    //         res.sendFile('/Users/sivadineshm/Documents/projects/bft/' + req.params.id + '/' + req.params.filename, {
    //             headers: {
    //                 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    //             }
    //         });
    //     },
    //     'default': function () {
    //         // log the request and respond with 406
    //         res.status(406).send('Not Acceptable');
    //     }
    // });




    // res.sendFile(__dirname + '/upload/103905.pdf', {
    //     headers: {
    //         'Content-Type': 'application/x-pdf'
    //     }
    // });
});



app.post('/applyjob', (req, res) => {

    console.log(' inside apply jobs ...');
    console.log(' inside apply jobs CODE ...' + req.body.code);
    console.log(' inside apply jobs title CODE ...' + req.body.title);
    console.log(' inside apply jobs description CODE ...' + req.body.description);
    console.log(' inside apply jobs location CODE ...' + req.body.location);
    console.log(' inside apply jobs salary CODE ...' + req.body.salary);

    console.log(' inside apply jobs status CODE ...' + req.body.status);
    console.log(' inside apply jobs jobtype CODE ...' + req.body.jobtype);
    console.log(' inside apply jobs experience CODE ...' + req.body.experience);
    // console.log(' inside apply jobs file CODE ...' + req.body.file);
    console.log(' inside apply jobs filename CODE ...' + req.body.filename);

    console.log(' inside apply jobs primaryskills CODE ...' + req.body.primaryskills);
    console.log(' inside apply jobs secondaryskills CODE ...' + req.body.secondaryskills);

    let data = req.body.file;

    // let buff = new Buffer(data, 'base64');
    let buff = Buffer.from(data, 'base64');

    fs.writeFileSync(req.body.filename, buff);


    console.log('object file written');

    res.json({
        result: "OK",
        message: "Job Applied Successfully"
    });

});

const PORT = process.env.PORT || 5060;

app.listen(PORT);

// router.get('/users/avatar', function(req, res){
//     res.sendFile(req.user.avatarName, {
//         root: path.join(__dirname+'/../uploads/'),
//         headers: {'Content-Type': 'image/png'}
//     }, function (err) {
//         if (err) {
//             console.log(err);
//         }
//     });
// });
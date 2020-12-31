require('dotenv').config();
const express = require( 'express' );
const routes = express.Router();
const app = express();
const mongoose = require( 'mongoose' );
const bodyparser = require( 'body-parser' );
const bcrypt = require( 'bcryptjs' );
const user = require( './../models/usermodel' );
const student = require( './../models/studentmodel' );
const passport = require( 'passport' );
const session = require( 'express-session' );
const cookieParser = require( 'cookie-parser' );
const flash = require( 'connect-flash' );
const {
    static
} = require( 'express' );
const mongourl = "mongodb+srv://project:project@cluster0.s80ou.mongodb.net/college-side-db?retryWrites=true&w=majority";
require( './passport' )( passport );
const url = require( "url" );
const {
    exit
} = require( 'process' );
const nodemailer = require( 'nodemailer' );




//getting blockchain and creating its instance
const Blockchain = require( './../Blockchain/Blockchain' );
const mychain = new Blockchain;

let cpi = 0;
let grd_crd = 0;
let crdsum = 0;
let loop;
const time = process.env.TIME;
student.find( {}, function ( err, data )
{
    if ( err ) throw err;
    if ( data ) {
        data.forEach( function ( studentData )
        {
            studentData.coursedetails.forEach( function ( value, index )
            {
                let grd;
                crdsum = crdsum + Number( value.credit );
                switch ( value.grade ) {
                    case "AA":
                        grd = 10;
                        break;
                    case "AB":
                        grd = 9;
                        break;
                    case "BB":
                        grd = 8;
                        break;
                    case "BC":
                        grd = 7;
                        break;
                    case "CC":
                        grd = 6;
                        break;
                    case "CD":
                        grd = 5;
                        break;
                    case "DD":
                        grd = 4;
                        break;
                    default:
                        console.log( "invalid key" );
                }
                grd_crd = grd_crd + Number( grd * Number( value.credit ) );
            } );
            cpi = grd_crd / crdsum;
            cpi = Math.round( cpi * 10 ) / 10;
            mychain.addBlock( studentData, cpi );
            grd_crd = 0;
            crdsum = 0;
        } );
        mychain.printChain();
        //*************************************Data Tampering...*************************************
        // mychain.chain[ 3 ].cpi = 10;
        // // mychain.chain[3].calculateHash();
        // mychain.printChain();


    }
} );
// using Bodyparser for getting form data
routes.use( bodyparser.json() );
routes.use( bodyparser.urlencoded( {
    extended: true
} ) );
// using cookie-parser and session 
routes.use( cookieParser( 'secret' ) );
routes.use( session( {
    secret: 'secret',
    maxAge: 3600000,
    resave: true,
    saveUninitialized: true,
} ) );
// using passport for authentications 
routes.use( passport.initialize() );
routes.use( passport.session() );
// using flash for flash messages 
routes.use( flash() );

// MIDDLEWARES
// Global variable
routes.use( function ( req, res, next )
{
    res.locals.success_message = req.flash( 'success_message' );
    res.locals.error_message = req.flash( 'error_message' );
    res.locals.error = req.flash( 'error' );
    next();
} );

//setting up public for static folder
routes.use( express.static( "./../public" ) );

const checkAuthenticated = function ( req, res, next )
{
    if ( req.isAuthenticated() ) {
        res.set( 'Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0' );
        return next();
    } else {
        res.redirect( '/login' );
    }
};

// Connecting To Database
// using Mongo Atlas as database
mongoose.connect(
    mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
},
    function ( error, link )
    {
        if ( link ) {
            console.log( "DB connect success(Login)" );
        } else
            console.log( "DB connect fail..!" );
    }
);


// ALL THE ROUTES 
routes.get( '/', ( req, res ) =>
{
    res.render( 'index' );
} );

routes.post( '/register', ( req, res ) =>
{
    var {
        email,
        username,
        password,
        confirmpassword
    } = req.body;
    var err;
    if ( !email || !username || !password || !confirmpassword ) {
        err = "Please Fill All The Fields...";
        res.render( 'index', {
            'err': err,
            'email': email,
            'username': username
        } );
    }
    if ( password != confirmpassword ) {
        err = "Passwords Don't Match";
        res.render( 'index', {
            'err': err,
            'email': email,
            'username': username
        } );
    }
    if ( typeof err == 'undefined' ) {
        user.findOne( {
            email: email
        }, function ( err, data )
        {
            if ( err ) throw err;
            if ( data ) {
                console.log( "User Exists" );
                err = "User Already Exists With This Email...";
                res.render( 'index', {
                    'err': err,
                    'email': email,
                    'username': username
                } );
            } else {
                bcrypt.genSalt( 10, ( err, salt ) =>
                {
                    if ( err ) throw err;
                    bcrypt.hash( password, salt, ( err, hash ) =>
                    {
                        if ( err ) throw err;
                        password = hash;
                        user( {
                            email,
                            username,
                            password,
                        } ).save( ( err, data ) =>
                        {
                            if ( err ) throw err;
                            req.flash( 'success_message', "Registered Successfully.. Login To Continue.." );
                            res.redirect( '/login' );
                        } );
                    } );
                } );
            }
        } );
    }
} );


// Authentication Strategy
// ---------------

//route for login page
routes.get( '/login', ( req, res ) =>
{
    res.render( 'login' );
} );

routes.post( '/login', ( req, res, next ) =>
{
    passport.authenticate( 'local', {
        failureRedirect: '/login',
        successRedirect: '/success',
        failureFlash: true,
    } )( req, res, next );
} );

//route for succes or dashboard
routes.get( '/success', checkAuthenticated, ( req, res ) =>
{
    res.render( 'success', {
        'user': req.user,
        'bool': false,
        'fail': '',
        'success': '',
        'showData': false
    } );
} );

//route for logout
routes.get( '/logout', ( req, res ) =>
{
    req.logout();
    res.redirect( '/login' );
} );

//route for verification
routes.get( '/verification', checkAuthenticated, function ( req, res )
{
    res.render( 'success', {
        'user': req.user,
        'bool': true,
        'fail': '',
        'success': '',
        'showData': false
    } );
} );

//route for home
routes.get( '/home', checkAuthenticated, function ( req, res )
{
    res.render( 'success', {
        'user': req.user,
        'bool': false,
        'fail': '',
        'success': '',
        'showData': false
    } );
} );

//route for verify
routes.get( "/verify", checkAuthenticated, function ( req, res )
{
    res.render( '/verification' );
} );
routes.post( '/verify', checkAuthenticated, function ( req, res )
{
    var {
        fname,
        lname,
        prn,
        cpi,
        branch
    } = req.body;

    //testing



    let err;
    let reg = /^20[1-9][0-9][B][T][E](CS|IT|EN|CV|EL)(00)[0-1][0-9]{2}$/i;
    let check = reg.test( prn );

    if ( !fname || !lname || !prn || !cpi || !branch ) {
        err = "Please Fill All The Fields...";
        res.render( 'success', {
            'user': req.user,
            'error': err,
            'bool': true,
            'fail': '',
            "success": '',
            'showData': false
        } );
    } else if ( !check ) {
        err = "PRN is Invalid";
        res.render( 'success', {
            'user': req.user,
            'error': err,
            'bool': true,
            'fail': '',
            "success": '',
            'showData': false
        } );
    }
    else {
        let exist;
        let checkValid;
        for ( let i = 1; i <= mychain.chain.length - 1; i++ ) {

            if ( prn == mychain.chain[ i ].data.prn_no ) {
                exist = true;
                if ( mychain.chain[ i ].cpi == cpi ) {
                    checkValid = true;
                }
            }
        }
        if ( !exist ) {
            res.render( 'success', {
                'user': req.user,
                'bool': false,
                'fail': 'No such Candidates Exists..!',
                'success': "",
                'showData': false
            } );
        }
        else {
            if ( checkValid && mychain.isChainValid() ) {

                let fn;
                let ln;
                let cData;
                let cp = cpi;
                student.findOne( { prn_no: prn }, function ( err, data )
                {
                    fn = data.fname;
                    ln = data.lname;
                    cData = data.coursedetails;
                    let lt = cData.length;
                    res.render( 'success', {
                        'user': req.user,
                        'bool': false,
                        'fail': '',
                        'success': "Congratulations..! Candidate's Details are valid...!",
                        'showData': true,
                        'fname': fn, 'lname': ln,
                        'prn': prn,
                        'cData': cData,
                        'cpi': cp
                    } );
                } );

            }
            else {
                res.render( 'success', {
                    'user': req.user,
                    'bool': false,
                    'fail': "Sorry..! Candidate's Details are  invalid..!",
                    "success": '',
                    'showData': false
                } );
            }
        }
    }
} );

//Sending Mail to admin when chain is invalid...

setInterval( function (){
    if(loop==undefined){
        let transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth :{
                user:'project4dtu@gmail.com',
                pass:'Project@#2020'
            }
        })
        let mailOptions = {
            from:'"SVS SYSTEM"<project4dtu@gmail.com>',
            to:'shivprasadoctomusprime@gmail.com, samkabure@gmail.com, shivaduthjakore@gmail.com',
            subject:'Blockchain Tampering',
            text:'Someone has tampered with the blockchain data'
        }
        let statusMail = mychain.isChainValid();
        if(!statusMail){
            transporter.sendMail(mailOptions, function(err,data){
                if(err){
                    console.log("Error sending Mail");
                    console.log(err);
                }else{
                    console.log("Email Sent Successfully.." + data.response);
                    loop = false;
                }
            });
        }
        else{
            console.log("Chain Valididy " + mychain.isChainValid());
        }
    }
},time);


module.exports = routes;
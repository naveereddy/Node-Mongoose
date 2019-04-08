var express = require('express');
var router = express.Router();
var UserModal = require('../models/user')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const checkAuth =  require('../middleware/auth')

const nodemailer = require('nodemailer')

const smtpTransport = nodemailer.createTransport({
  service:"Gmail",
  auth:{
    type:'OAuth2',
    user:process.env.GMAIL_ID,
    clientId:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    refreshToken:process.env.GOOGLE_REFRESH_TOKEN,
    accessToken:process.env.GOOGLE_ACCESS_TOKEN
  }
});

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb){
    cb(null, new Date.now() + file.originalname);
  }
})
const fileFilter = (req, file, cb) =>{
  if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
      cb(null, true)
  }else{
    cb(null, false)
  }
}
const upload = multer({
  storage: storage,
  limits:{
  fileSize: 1024 * 1024 * 8
  },
  fileFilter: fileFilter
});


router.post('/register',function(req, res, next) {
  bcrypt.hash(req.body.password, saltRounds , function(error, hash){
      if(error){
        console.log("while hashing password getting error")
      }else{
        console.log("hash",hash)
        req.body.password = hash
        UserModal.create(req.body, function(err, user){
          if(err){
            console.log("user added unsucessful", err)
          }else{
            console.log(user)
            let url = `http://localhost:1337/users/confirmation/${user._id}`
            var mailOptions =  {
              from: process.env.GMAIL_ID,
              to: user.email,
              subject:"Your account verification mail from Naveen Reddy",
              html: `Welcome to Anblicks<a href="${url}">Verify</a>your account here`
            }
            smtpTransport.sendMail(mailOptions, function(error, info){
                if(error){
                  console.log(error)
                }else{
                  console.log("mail is sent", info.message);
                }
            })
            res.send(user)
          }
        })
      }
  })
});

router.post('/profileImageUpload', upload.single('profileImage'), function(req, res, next){
    res.send(req.file);
})

router.get('/confirmation/:id', function(req, res, next){
  UserModal.find({
    _id:req.params.id
  }, function(err, user){
     if(err){
      console.log("error acurred while confirmation mail")
     }else{
      UserModal.findByIdAndUpdate({
        _id: req.params.id
      },{$set:{verify : true}},{upsert:true },
        function(err, updatedUser){
        if(err){
          console.log("Update user is failed", err)
        }else{
          console.log(updatedUser)
          res.send(updatedUser)
      }})
     }
  })
})

router.post('/login', function(req, res, next){
  UserModal.findOne({
    email: req.body.email
  }, function(err, user){
    if(user.verify){
      bcrypt.compare(req.body.password, user.password,function(err, result){
        if(result){
          var token = jwt.sign({
            email : user.email,
            userId : user._id
          },process.env.TOKEN_SECRET_KEY, {
            expiresIn: "1h"
          });
          return res.status(200).json({
            message:"auth successful",
            token: token
          })
        }
    })
    }else{
      res.status(401).json({
        message:'Your email is not verified'
      })
    }

  })
})


router.get('/', checkAuth, function(req, res, next){
  UserModal.find({}, function(err, users){
    if(err){
      console.log("getting users unsucessful", err)
    }else{
      console.log(users)
      res.send(users)
    }
  })  
})

router.put('/update/:id', function(req, res, next){
  UserModal.findByIdAndUpdate({
    _id: req.params.id
  },{$set:{age : req.body.age}},{upsert:true },
    function(err, updatedUser){
    if(err){
      console.log("Update user is failed", err)
    }else{
      console.log(updatedUser)
      res.send(updatedUser)
  }})
})

router.delete('/delete/:id', checkAuth, function(req, res, nex){
  UserModal.findByIdAndRemove({
    _id: req.params.id
  }, function(err, deletedUser){
    if(err){
      console.log("user deletion id failed", err)
    }else{
      console.log(deletedUser)
      res.send(deletedUser)
    }
  })
})


module.exports = router;

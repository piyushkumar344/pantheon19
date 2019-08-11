const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const config=require('./config');
const userData=require('./models/register');
const jwt=require('jsonwebtoken');

const app = express();

//MongoDb Connections
mongoose.connect(config.url,{ useNewUrlParser: true });

mongoose.connection.once('open', function () {
  console.log("Database connection opened");
});

mongoose.connection.on('error', function (error) {
  console.log("Database connection error %s", error);
});

mongoose.connection.on('reconnected', function() {
  console.log("Database reconnected");
});

mongoose.connection.on('disconnected', function() {
  console.log("Database disconnected");
  mongoose.connect(config.url,{ useNewUrlParser: true });
});

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.post('/register',(req,res,next)=>{
    //check whether already registered
    userData.findOne({email:req.body.email},(err,user)=>{
        if(err)
        return res.json({status:500,message:"error on the server"});

        else if(user)
        return res.json({status:415,message:"user already exits"});

        else
        next();

    })
},
(req,res)=>{
    //continue registration
    if(req.body.password!=req.body.confPassword)
    {
        return res.json({
            status:401,
            message:"password doesnt match"
        })
    }
    else if(req.body.email && req.body.password && req.body.confPassword)
    {
        var hashedPassword = bcrypt.hashSync(req.body.password, 8);

        userData.create({
            email:req.body.email,
            password:hashedPassword,
            phoneNo:req.body.phoneNo
        },(err,user)=>{
            if(err)
            {
                return res.json({
                    status:500,
                    message:"something went wrong while registering the user, please try again"
                })
            }

            var token = jwt.sign({ id: user._id }, config.secret, {  //jwt sign encodes payload and secret
                expiresIn: 86400 // expires in 24 hours
              });
              res.json({status:200 , auth: true, token: token });
        })
    }
    else
	{
		res.json({status:404 , message:"missing required value"});
	}
})

app.post('/login',(req,res)=>{
    if(req.body.email && req.body.password){
    userData.findOne({email:req.body.email},(err,user)=>{
        if(err)
        {
            return res.json({status:500, message:"Internal server error"});
        }
        else if(!user)
        {
            return res.json({status:404, message:"No such user exists"})
        }
        else
        {
            var passwordIsValid=bcrypt.compareSync(req.body.password,user.password);

            if(!passwordIsValid)
            {
                return res.json({staus:401, message:"Incorrect password"});
            }

            else
            {
                var token=jwt.sign({id:user._id},config.secret,{
                    expiresIn:86400
                })

                return res.json({status:200, token:token});
            }
        }
    })
    }
    else
    {
        return res.json({status:404, message:"missing required details"})
    }
})

let port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log(`Server running  on port ${port}`);
});
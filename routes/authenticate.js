const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config=require('../config');
const userData=require('../models/register');
const jwt=require('jsonwebtoken');

//routes
router.post('/register',(req,res,next)=>{
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
        let hashedPassword = bcrypt.hashSync(req.body.password, 8);

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

            let token = jwt.sign({ id: user._id }, config.secret, {  //jwt sign encodes payload and secret
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

router.post('/login',(req,res)=>{
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
            let passwordIsValid=bcrypt.compareSync(req.body.password,user.password);

            if(!passwordIsValid)
            {
                return res.json({staus:401, message:"Incorrect password"});
            }

            else
            {
                let token=jwt.sign({id:user._id},config.secret,{
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

module.exports=router;
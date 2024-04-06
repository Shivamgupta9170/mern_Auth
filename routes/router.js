const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate")
// for user registration

router.post("/register",async(req,res)=>{
    const {fname,email,password,Cpassword} = req.body;
    if(!fname || !email || !password || !Cpassword){
        res.status(422).json({error:"fill all the details"})

    }
    try{
        const preuser = await userdb.findOne({email:email});
        if(preuser){
            res.status(422).json({error:"This Email is Already Exists"})
        }
        else if(password!=Cpassword){
            res.status(422).json({error:"Password and confirm password not Match"})
        }else{
            const finalUser = new userdb({
                fname,email,password,Cpassword
            });

            // here password hashing

            const storeData = await finalUser.save();

            res.status(201).json({status:201,storeData});


        }

    }catch(error){
        res.status(422).json(error);
        console.log("catch block error");

    }
})

router.post("/login",async(req,res)=>{
    // console.log(req.body);
    const {email,password} = req.body;
    if(!email || !password){
        res.status(422).json({error:"fill all the details"})
    }
    try{
        const userValid = await userdb.findOne({email:email});
        if(userValid){
            const isMatch = await bcrypt.compare(password,userValid.password);
            if(!isMatch){
                res.status(422).json({error:"invalid details"})
            }else{
                const token = await userValid.generateAuthToken();
                res.cookie("usercookie",token,{
                    expires:new Date(Date.now()+9000000),
                    httpOnly:true
                });

                const result = {
                    userValid,
                    token
                }
                res.status(201).json({status:201,result})
            }
        }else{
            res.status(401).json({status: 401, error});
            console.log("User not found");
        }   

    }
    catch(error){
        res.status(401).json({status:401,error});
        console.log("catch black");
    }

})

router.get("/validuser",authenticate,async(req,res)=>{
    try{
        const ValidUserOne = await userdb.findOne({_id:req.userId});
        res.status(201).json({status:201,ValidUserOne});
    }catch{
        res.status(401).json({status:401,error});
    }
})
router.get("/logout",authenticate,async(req,res)=>{
    try{
        req.rootuser.tokens = req.rootuser.tokens.filter((curelem)=>{
            return curelem.token !== req.token
        });
        res.clearCookie("usercookie",{path:"/"})

        req.rootuser.save();
        res.status(201).json({status:201});
    }catch{
        res.status(401).json({status:401,error})
    }
})
module.exports = router;


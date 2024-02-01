//package require
const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const database = require("mysql");



const add=express();
add.use(cors());
add.use(bodyparser.json());
add.use(express.json());
add.use(express.static("public"));


// database connection
let connection=database.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    database:"waitinglist_application"
 });


connection.connect(function(error){
    if(error){
        console.log(error);
    } else {
        console.log("database  is connected")
    }
});

//function to derive the existing waiter count
const countExistingUsers = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT COUNT(*) AS userCount FROM waitlistproduct', (error, results) => {
        if (error) {
          reject(error);
        } else {
          const userCount = results[0].userCount;
          resolve(userCount);
        }
      });
    });
  };


add.post('/signup', async (request, response) => {

    let usermail = request.body.usermail;
    console.log(usermail)
    //assining the usercount value from the function "countexistingUser" to a variable
    try {
        let userCount = await countExistingUsers();

          //to define the first signed in user waiting list as 99
        let waitinglistposition = userCount + 99;

        // Generating referral link 
        let refreralnumbers = `https://localhost:400/${usermail}`;
        console.log(refreralnumbers);

        let sql = 'INSERT INTO waitlistproduct(usermail, waitinglistposition,refreralnumbers, status, effectiveFrom, effectiveTo,createdBy, createdOn, modifiedBy, modifiedOn) VALUES (?, ?, ?, "active", current_date(),"9999-03-21", "admin",current_date(),"admin",current_timestamp)';
        
        connection.query(sql, [usermail, waitinglistposition,refreralnumbers], (error, result) => {
            if (error) {
                console.log(error);
                response.status(500).json({"error": "Error storing data in the database"});
            } else {
                response.status(200).json({
                    status: "success", 
                    "email":usermail,
                    "listposition":waitinglistposition,
                    "refreral":refreralnumbers
                });
            }
        });
    } catch (error) {
        response.status(500).json({"error": "Error in counting existing users"});
        console.log(error);
    }
});

add.put('/updateWaitingListPosition',(request,response)=>{
    let {usermail, newposition }= request.body;
    let sql = 'update waitlistproduct set waitinglistposition= ? where usermail=?';
    connection.query(sql,[newposition,usermail],(error,result)=>{
      if(error){
        console.log(error);
        response.status(500).json({status:"error in updating the waiting list position"})
      }    else{
        response.status(200).json({status:"success"})
      }
    })
  
  })

















//port connecting
add.listen(400,()=>{
    console.log('server is running on 400 port');
})


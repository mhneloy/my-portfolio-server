/*
1. after successfull login: generate a jwt token
 npm i jsonwebtoken, cookie-parser
 jwt.sign(payload,secret, {expriesIn:'1d'})

 2. send token(generated in the served side) to the client side
 localstorage --> easire

 httpOnly cookies --> better

 3. for sensitive or secure or private or protected apis: send token to the server side


 4. validate the token in the server side:
 if valid: provide the data

 if not: logout
*/

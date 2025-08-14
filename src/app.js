import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
// File sharing kae liye we will use multer

// this is for Cross-Origin Resource Sharing
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

// json parser middleware
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
// cookie parser middleware
app.use(cookieParser());

// routes import
// Mann sae koyi bhi name tabh hi dae skte hai jabh export default ho raha ho
import userRouter from './routes/user.routes.js';

// routes declaration
app.use("/api/v1/users", userRouter); 

export default app;


// app.get('/', (req, res) => {
//     res.send('Welcome to the API');
// })

// Explain middleware in express
// Middleware in Express is a function that has access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. Middleware functions can perform a variety of tasks, such as executing code, modifying the request and response objects, ending the request-response cycle, and calling the next middleware function in the stack. They are used for tasks like logging, authentication, parsing request bodies, handling CORS, and serving static files. Middleware can be applied globally to all routes or to specific routes, allowing for flexible and modular application design. In Express, middleware is a powerful feature that helps in building robust and maintainable web applications by separating concerns and enhancing code reusability.


/* 
Cookies in Express.js (Quick Notes)

Cookie: Small data stored in browser, sent with each request (key=value). Used for sessions, auth, preferences.

cookie-parser: Middleware that parses Cookie header → req.cookies (unsigned) & req.signedCookies (signed). Can verify signed cookies with a secret.

Why parse? Raw cookie string is messy; cookie-parser auto-splits, trims, decodes.

Signed Cookie: Value + cryptographic signature (integrity check). Detects tampering, still readable (not encrypted).

Unsigned vs Signed vs Encrypted:
Unsigned: readable, modifiable.
Signed: readable, tamper-proof.
Encrypted: hidden + tamper-proof.
*/
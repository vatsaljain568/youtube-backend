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

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.get('/youtube', (req, res) => {
    res.send('Hello, Youtube!');
})

export default app;


// Explain middleware in express
// Middleware in Express is a function that has access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. Middleware functions can perform a variety of tasks, such as executing code, modifying the request and response objects, ending the request-response cycle, and calling the next middleware function in the stack. They are used for tasks like logging, authentication, parsing request bodies, handling CORS, and serving static files. Middleware can be applied globally to all routes or to specific routes, allowing for flexible and modular application design. In Express, middleware is a powerful feature that helps in building robust and maintainable web applications by separating concerns and enhancing code reusability.
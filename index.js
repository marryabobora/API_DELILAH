const express = require('express');
const bodyParser = require('body-parser');
const { body, param, query, validationResult } = require('express-validator');

const AppDatabase = require('./js/db');

const app = express();
const db = AppDatabase("mongodb://localhost:27017/", "NodeApp");

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    res.status(500);
    res.render('error', { error: err });
}

//ROOT

app.get('/', errorHandler, (req, res) => {
    res.send("App configured correctly!");
});

app.get('/login',
    //validation
    query('username').isLength({ min : 5 }),
    query('password').isLength({ min : 5 }),
    errorHandler,
    (req, res) => {
        console.log("Logging in with user: "+req.query.username);
        db.Login(req.query.username, req.query.password, (token) => {
            if(token) {
                res.send({
                    status : 200,
                    token : token
                });
            }
            else {
                res.send({
                    status : 403,
                    error : "Access denied!"
                });
            }
        });

    }
);

//USERS

app.post  ('/users/create',
    bodyParser.json(),
    //validation
    body('username').isLength({ min : 5 }),
    body('password').isLength({ min : 5 }),
    errorHandler,
    (req, res) => {
        console.log("Creating user: "+req.body.username);
        db.CreateUser(req.body.username, req.body.password, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.get   ('/users/:userId',
    //validation
    param('userId').exists(),
    query('token').exists(),
    errorHandler,
    (req, res) => {
        console.log("Retrieving user: "+req.params.userId);
        db.GetUser(req.params.userId, req.query.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });

    }
);

app.get   ('/users/:userId/orders',
    //validation
    param('userId').exists(),
    query('token').exists(),
    errorHandler,
    (req, res) => {
        console.log("Retrieving user: "+req.params.userId);
        db.GetAllOrdersFromUser(req.params.userId, req.query.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.post  ('/users/:userId/update',
    bodyParser.json(),
    //validation
    param('userId').isInt(),
    query('token').exists(),
    body('data').exists(),
    errorHandler,
    (req, res) => {
        console.log("Updating user: "+req.params.userId);
        db.UpdateUser(req.params.userId, req.body.data, req.query.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.get  ('/users/:userId/promote',
    //validation
    param('userId').exists(),
    query('token').exists(),
    errorHandler,
    (req, res) => {
        console.log("Promoting user: "+req.params.userId);
        res.send({ status : 200, msg : "not implemented yet!" });
    }
);

app.delete('/users/:userId/delete',
    //validation
    param('userId').exists(),
    query('token') .exists(),
    errorHandler,
    (req, res) => {
        console.log("Deleting user: "+req.params.userId);
        db.DeleteUser(req.params.userId, req.query.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

//DISHES

app.post  ('/dishes/create',
    bodyParser.json(),
    //validation
    body('name').isLength(3),
    body('price').isNumeric(),
    body('token').exists(),
    errorHandler,
    (req, res) => {
        db.CreateDish(req.body.name, req.body.price, req.body.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.get   ('/dishes/:dishId',
    //validation
    param('dishId').exists(),
    errorHandler,
    (req, res) => {
        db.GetDish(req.params.dishId, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.post  ('/dishes/:dishId/update',
    //validation
    param('dishId').exists(),
    body('token').exists(),
    errorHandler,
    (req, res) => {
        db.UpdateDish(req.params.dishId, req.body.name, req.body.price, req.body.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.delete('/dishes/:dishId/delete',
    //validation
    param('dishId').exists(),
    query('token').exists(),
    errorHandler,
    (req, res) => {
        db.DeleteDish(req.params.dishId, req.body.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.get   ('/dishes',
    errorHandler,
    (req, res) => {
        db.GetAllDishes((result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

//ORDERS

app.post  ('/orders/create',
    bodyParser.json,
    //validation
    body('userId').exists(),
    body('dishIds').isArray({ min : 1 }),
    body('token').exists(),
    errorHandler,
    (req, res) => {
        db.CreateOrder(req.body.userId, req.body.dishIds, req.body.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.get   ('/orders/:orderId',
    //validation
    param('orderId').exists(),
    query('userId').exists(),
    query('token').exists(),
    errorHandler,
    (req, res) => {
        db.GetOrder(req.query.userId, req.params.orderId, req.body.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.post  ('/orders/:orderId/update',
    bodyParser.json(),
    //validation
    param('orderId').exists(),
    body('userId').exists(),
    body('token').exists(),
    errorHandler,
    (req, res) => {
        db.UpdateOrder(req.query.userId, req.params.orderId, req.body.dishIds, req.body.state, req.body.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.delete('/orders/:orderId/delete',
    //validation
    param('orderId').exists(),
    query('userId').exists(),
    query('token').exists(),
    errorHandler,
    (req, res) => {
        db.DeleteOrder(req.query.userId, req.params.orderId, req.body.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.get   ('/orders',
    //validation
    query('token').exists(),
    errorHandler,
    (req, res) => {
        db.GetAllOrders(req.query.token, (result) => {
            if(!result.error) {
                res.send({
                    status : 200,
                    data : result
                });
            }
            else {
                res.send({
                    status : 500,
                    error : result.error
                });
            }
        });
    }
);

app.listen(3000, () => {
    console.log("Servidor iniciado!");
});
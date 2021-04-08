const Auth = require('./auth');
const ObjectId = require('mongodb').ObjectId;

module.exports = function(url, dbName) {
    return {
        url: url,
        dbName: dbName,
        CheckStatus: async function(callback) {
            var MongoClient = require('mongodb').MongoClient;

            await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, (error, result) => {
                if (error)
                    callback(false);
                else
                    callback(true);
            });
        },
        Login: async function(username, password, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("users");
            var result = await Auth.GetAccessToken(collection, username, password);

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        CreateUser: async function(username, password, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("users");

            var obj = {
                username: username,
                password: password,
                isAdmin: username == 'admin',
                data: {},
                accessToken: null,
                jwtSecret: "jwt" + Math.random().toString(36).substring(7)
            };

            var userExists = await DoesExist(collection, { "username": username });
            var result;

            if (userExists) {
                let errMsg = "User already exists!";
                result = { error: errMsg };
                console.log(errMsg);
            } else {
                result = await collection.insertOne(obj);
                result = {
                    userId: result.insertedId,
                    username: obj.username
                };
                console.log("User created, id is: " + result.userId);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        GetUser: async function(id, token, callback) {
            var MongoClient = require('mongodb').MongoClient;
            var Auth = require('./auth');

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("users");

            if (!Auth.IsUserOrAdminToken(collection, id, token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var result = await collection.findOne({ _id: ObjectId(id) });

            if (result) {
                console.log("User found!");

                result = {
                    userId: result._id,
                    username: result.username,
                    data: result.data
                };
            } else {
                let errMsg = "User doesn't exist!";
                result = { error: errMsg };
                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        UpdateUser: async function(id, data, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("users");

            if (!Auth.IsUserOrAdminToken(collection, id, token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            console.log(JSON.stringify(data));

            var userExists = await DoesExist(collection, { _id: ObjectId(id) });
            var result;

            if (userExists) {
                var toUpdate = {};

                if (data.userFirstName) toUpdate.userFirstName = data.userFirstName;
                if (data.userLastName) toUpdate.userLastName = data.userLastName;
                if (data.email) toUpdate.email = data.email;
                if (data.phone) toUpdate.phone = data.phone;
                if (data.address) toUpdate.address = data.address;

                result = await collection.findOneAndUpdate({ _id: ObjectId(id) }, { $set: { data: toUpdate } });
                result = {
                    userId: result.value._id,
                    username: result.value.username,
                    data: result.value.data
                };

                console.log("User updated, id is: " + id);
            } else {
                let errMsg = "User doesn't exist!";
                result = { error: errMsg };

                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        PromoteUser: async function(id, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("users");

            if (!Auth.IsAdminToken(collection, token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var userExists = await DoesExist(collection, { _id: ObjectId(id) });
            var result;

            if (userExists) {
                result = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { isAdmin: true } });
                result = {
                    userId: result.value._id,
                    username: result.value.username,
                    isAdmin: result.value.isAdmin
                };

                console.log("User promoted, id is: " + id);
            } else {
                let errMsg = "User doesn't exist!";
                result = { error: errMsg };

                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        DeleteUser: async function(id, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("users");

            if (!Auth.IsUserOrAdminToken(collection, id, token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var userExists = await DoesExist(collection, { _id: ObjectId(id) });
            var result;

            if (userExists) {
                result = await collection.findOneAndDelete({ _id: ObjectId(id) });
                result = {
                    success: true,
                    userId: id
                };

                console.log("User deleted, id was: " + id);
            } else {
                let errMsg = "User dosn't exist!";
                result = { error: errMsg };
                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        GetAllDishes: async function(callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);
            var collection = db.db(dbName).collection("dishes");

            var result = await collection.find().toArray();

            db.close();
            console.log("Connection closed successfully");
            console.log("RESULT => " + JSON.stringify(result));
            callback(result);
        },
        CreateDish: async function(name, price, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("dishes");

            if (!Auth.IsAdminToken(db.db(dbName).collection("users"), token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var obj = {
                name: name,
                price: price
            };

            var result = await collection.insertOne(obj);

            db.close();
            console.log("Connection closed successfully");

            callback(obj);
        },
        GetDish: async function(id, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);
            var collection = db.db(dbName).collection("dishes");

            var result = await collection.findOne({ _id: ObjectId(id) });

            if (result == null) {
                var errMsg = "Dish doesn't exist!";
                console.log(errMsg);
                result = {
                    error: errMsg
                };
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        UpdateDish: async function(id, name, price, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("dishes");

            if (!Auth.IsAdminToken(db.db(dbName).collection("users"), token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var dishExists = await DoesExist(collection, { _id: ObjectId(id) });
            var result;

            if (dishExists) {
                var toUpdate = {};

                if (name) toUpdate.name = name;
                if (price) toUpdate.price = price;

                await collection.findOneAndUpdate({ _id: ObjectId(id) }, { $set: toUpdate });

                result = {
                    success: true,
                    dishId: id
                };

                console.log("Dish updated, id: " + id);
            } else {
                let errMsg = "Dish dosn't exist!";
                result = { error: errMsg };
                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        DeleteDish: async function(id, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("dishes");

            if (!Auth.IsAdminToken(db.db(dbName).collection("users"), token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var dishExists = await DoesExist(collection, { _id: ObjectId(id) });
            var result;

            if (dishExists) {
                result = await collection.findOneAndDelete({ _id: ObjectId(id) });
                result = {
                    success: true,
                    dishId: id
                };

                console.log("Dish deleted, id was: " + id);
            } else {
                let errMsg = "Dish dosn't exist!";
                result = { error: errMsg };
                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        GetAllOrders: async function(token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);
            var collection = db.db(dbName).collection("orders");

            if (!Auth.IsAdminToken(db.db(dbName).collection("users"), token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var cursor = collection.find({});
            var result = {
                count: await cursor.count(),
                orders: await cursor.toArray()
            };

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        GetAllOrdersFromUser: async function(userId, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);
            var collection = db.db(dbName).collection("orders");

            if (!Auth.IsUserOrAdminToken(db.db(dbName).collection("users"), userId, token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var result = await collection.find({ userId: userId }).toArray();

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        CreateOrder: async function(userId, dishIds, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("orders");

            if (!Auth.IsUserOrAdminToken(db.db(dbName).collection("users"), userId, token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var obj = {
                userId: userId,
                dishIds: dishIds,
                time: new Date().toDateString(),
                state: 0
            };

            var result = await collection.insertOne(obj);

            db.close();
            console.log("Connection closed successfully");

            callback(obj);
        },
        GetOrder: async function(userId, orderId, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("orders");

            if (!Auth.IsUserOrAdminToken(db.db(dbName).collection("users"), userId, token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var result = await collection.findOne({ _id: ObjectId(orderId) });

            if (result == null) {
                let errMsg = "Order dosn't exist!";
                result = { error: errMsg };
                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        UpdateOrder: async function(orderId, dishIds, state, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("orders");

            if (!Auth.IsAdminToken(db.db(dbName).collection("users"), token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var orderExists = await DoesExist(collection, { _id: ObjectId(orderId) });
            var result;

            if (orderExists) {
                var toUpdate = {};

                if (dishIds) toUpdate.dishIds = dishIds;
                if (state) toUpdate.state = state

                await collection.findOneAndUpdate({ _id: ObjectId(orderId) }, { $set: toUpdate });

                result = {
                    success: true,
                    orderId: orderId
                };

                console.log("Order updated! id: " + orderId);
            } else {
                let errMsg = "Order dosn't exist!";
                result = { error: errMsg };
                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        },
        DeleteOrder: async function(userId, orderId, token, callback) {
            var MongoClient = require('mongodb').MongoClient;

            var db = await MongoClient.connect(this.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            console.log("Connected to " + this.dbName);

            var collection = db.db(dbName).collection("orders");

            if (!Auth.IsUserOrAdminToken(db.db(dbName).collection("users"), userId, token)) {
                let errMsg = "Access denied!";
                console.log(errMsg);

                db.close();
                console.log("Connection closed successfully");

                callback({ error: errMsg });
                return;
            }

            var orderExists = await DoesExist(collection, { _id: ObjectId(orderId) });
            var result;

            if (orderExists) {
                await collection.findOneAndDelete({ _id: ObjectId(orderId) });

                result = {
                    success: true,
                    orderId: orderId
                };

                console.log("Order deleted! id was: " + orderId);
            } else {
                let errMsg = "Order dosn't exist!";
                result = { error: errMsg };
                console.log(errMsg);
            }

            db.close();
            console.log("Connection closed successfully");

            callback(result);
        }
    }
}

async function DoesExist(collection, query) {
    var user = await collection.findOne(query, { projection: { "_id": 1 } });

    if (user)
        return true;
    else
        return false;
}
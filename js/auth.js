module.exports = {
    IsUserOrAdminToken : async function(collection, id, token) {
        var jwt = require('jsonwebtoken');
        var obj = jwt.decode(token);

        var user = await collection.findOne({ _id : obj.id, username : obj.username });

        if(user) {
            try {
                verify(token, user.jwtSecret);

                return user.isAdmin || obj.id == id;
            } catch(err) {
                return false;
            }
        }
        else return false;
    },
    IsAdminToken : async function(collection, token) {
        var jwt = require('jsonwebtoken');
        var obj = jwt.decode(token);

        var user = await collection.findOne({ _id : obj.id, username : obj.username });

        if(user) {
            try {
                jwt.verify(token, user.jwtSecret);

                return user.isAdmin;
            } catch(err) {
                return false;
            }
        }
        else return false;
    },
    MakeAdmin : async function(collection, id) {
        var user = await collection.findOneAndUpdate( { _id : id }, { $set : { isAdmin : true }});

        return user;
    },
    GetAccessToken : async function(collection, username, password) {
        var user = await collection.findOne({ username : username, password : password });

        if(!user) {
            let errMsg = "User doesn't exist!";
            console.log( errMsg );
            
            return null;
        }
        else {
            if(user.accessToken == null) {
                user = this.GenerateAccessToken(user);
                await collection.findOneAndUpdate({ _id : user._id }, { $set : user});
            }

            return user.accessToken;
        }
    },
    GenerateAccessToken : function(user) {
        var jwt = require('jsonwebtoken');
        user.accessToken = jwt.sign({ id : user._id, username : user.username }, user.jwtSecret);

        return user;
    }
}
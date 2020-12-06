"use strict"
var express = require('express')

const randomDate = require('../utils/util').randomDate
const sendMsg = require('../utils/util').sendJSON
const sendTxt = require('../utils/util').send

var app = express()
app.disable("x-powered-by")

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json({
    type: ["application/json", "application/merge-patch+json"]
}))

// ******** Server Info ********

const MAIN_SERVICE_PORT = 3000
const USER_SERVICE_PORT = 3001
const PRODUCT_SERVICE_PORT = 3002

const MAIN_SERVICE_ROOT = "http://localhost:" + MAIN_SERVICE_PORT
const USER_SERVICE_ROOT = "http://localhost:" + USER_SERVICE_PORT
const PRODUCT_SERVICE_ROOT = "http://localhost:" + PRODUCT_SERVICE_PORT

// ******** DATA STORE ********

let users = {}

// ******** SAMPLE DATA ********

users.berto = {
    id: "berto",
    email: "berto@gmail.com",
    password: "1234",
    createdOn: randomDate(new Date(2012, 0, 1), new Date()),
    updatedOn: randomDate(new Date(2016, 0, 1), new Date(2019, 0, 1)),
    moderator: true
}
users.catarina = {
    id: "catarina",
    email: "catarina@gmail.com",
    password: "1234",
    createdOn: randomDate(new Date(2012, 0, 1), new Date()),
    updatedOn: randomDate(new Date(2016, 0, 1), new Date(2019, 0, 1)),
    moderator: true
}
users.pedro = {
    id: "pedro",
    email: "pedro@gmail.com",
    password: "1234",
    createdOn: randomDate(new Date(2012, 0, 1), new Date()),
    updatedOn: randomDate(new Date(2016, 0, 1), new Date(2019, 0, 1)),
    moderator: false
}
users.antonio = {
    id: "antonio",
    email: "antonio@gmail.com",
    password: "1234",
    createdOn: randomDate(new Date(2012, 0, 1), new Date()),
    updatedOn: randomDate(new Date(2016, 0, 1), new Date(2019, 0, 1)),
    moderator: false
}

// ******** HELPER FUNCTIONS ********

function buildUser(username, email, password) {
    const now = new Date()
    return {
        id: username,
        email: email,
        password: password,
        moderator: false,
        createdOn: now,
        updatedOn: now,
        moderator: false
    }
}

function buildExistingUser(id, email, password) {
    var entry = users[id]
    const now = new Date()
    entry.email = email
    entry.password = password
    entry.updatedOn = now
    return entry
}

function updateOrCreateUser(req, res, entry) {
    if (!req.query.username) {
        // unauthenticated, so we assume we are creating a new user account
        // is the username available?
        if (entry === undefined) {
            let new_entry = buildUser(req.userID, req.body.email, req.body.password)
            users[req.userID] = new_entry
            sendMsg(res, 201, users[req.userID], {
                'Location': MAIN_SERVICE_ROOT + "/User/" + req.userID
            })
        } else {
            //username is already in use
            sendTxt(res, 409, "Conflict")
        }
    } else {
        //authenticated, we are updating a user account
        if (!entry) {
            //the user is authenticated but requested an unexisting id
            //sendTxt(res, 404, "Not Found")
            //to avoid privacy breaches, we return a 403 instead of a 404
            sendTxt(res, 403, "You can only update your profile.")
        } else {
            var user = req.query.username //req.body.user
            console.log('Authenticated user: ' + user)
            if (user === entry.id) {
                buildExistingUser(entry.id, req.body.email, req.body.password)
                sendMsg(res, 200, entry, {
                    'Location': MAIN_SERVICE_ROOT + "/User/" + entry.id
                })
            } else {
                sendTxt(res, 403, "You can only update your profile.")
            }
        }
    }
}

function validate(user, id, password) {
    return user.id === id && user.password === password
}

function validateCredentials(data, id, password) {
    let user
    if (id !== undefined) {
        Object.keys(data).forEach(function (k) {
            if (validate(data[k], id, password)) {
                user = data[k]
            }
        })
    }
    return user
}

function search(user, userID) {
    return user.id === userID
}

function SearchUser(data, userID) {
    var out
    if (userID !== undefined) {
        Object.keys(data).forEach(function (k) {
            if (search(data[k], userID)) {
                out = data[k]
            }
        })
    }
    return out
}

// Handling /User
//
// GET      List of all users (needs auth from a moderator)
// POST     not allowed
// PUT      not allowed
// DELETE   not allowed

app.route("/User")
    .get(function (req, res) {
        if (req.query.username && req.query.password) {
            //if has both params, check if user credencials exist
            console.log("Username: ", req.query.username)
            console.log("Password: ", req.query.password)
            let foundUser = validateCredentials(users, req.query.username, req.query.password)
            if (foundUser !== undefined) {
                console.log("Credentials are valid. User: ", foundUser)
                res.status(200).send(foundUser)
            } else {
                console.log("Credentials not valid. User not found")
                res.status(404).send("Credentials not valid. User not found")
            }
        } else {
            //otherwise just get the users list if its a moderator
            console.log(req.query)
            if (req.query.moderator == 'true') {
                let users_array = []
                Object.keys(users).forEach(function (k) {
                    let new_entry = {
                        id: users[k].id,
                        email: users[k].email,
                        createdOn: users[k].createdOn,
                        updatedOn: users[k].updatedOn,
                        moderator: users[k].moderator
                    }
                    users_array.push(new_entry)
                })
                let out = {}
                out['users'] = users_array
                res.format({
                    'application/json': function () {
                        sendMsg(res, 200, out)
                    },
                    'default': function () {
                        // log the request and respond with 406
                        sendTxt(res, 406, 'Not Acceptable')
                    }
                })
            } else {
                res.status(401).send("Unauthorized. Only a moderator can access this information.")
            }
        }
    })
    .put(function (req, res) {
        res.status(405).send("To register a new user, please issue a PUT or POST to /User/:userID")
    })
    .post(function (req, res) {
        res.status(405).send("To register a new user, please issue a PUT or POST to /User/:userID")
    })
    .delete(function (req, res) {
        res.status(405).send("To delete a user, please issue a DELETE to /User/:userID")
    })

app.param('userID', function (req, res, next, userID) {
    req.userID = userID
    return next()
})

// Handling /User/:userID
//
// GET     /User/:userID   is public, authenticated or unauthenticated. If has auth and its the same user, then returns all information, otherwise just return some info about the user for security mesures
// PUT     /User/:userID   is both unauthenticated to allow to register new users and authenticated for updates
// POST    /User/:userID   is public and unauthenticated to create new one
// DELETE  /User/:userID   needs authentication of the user to delete is personal account

app.route("/User/:userID")
    .get(function (req, res) {
        console.log("Requested user with username: " + req.userID)
        var out = SearchUser(users, req.userID)
        if (req.query.username !== out.id) {
            //it means that the person who requested the user info is not the same person
            let new_entry = {
                id: out.id,
                email: out.email,
                createdOn: out.createdOn,
                updatedOn: out.updatedOn,
                moderator: out.moderator
            }
            out = new_entry
        }
        if (out !== undefined) {
            res.format({
                'application/json': function () {
                    sendMsg(res, 200, out)
                },
                'default': function () {
                    // log the request and respond with 406
                    sendTxt(res, 406, 'Not Acceptable')
                }
            })
        } else {
            res.status(404).send("User " + req.userID + " not found.")
        }
    })
    .put(function (req, res) {
        var entry = users[req.userID]
        console.log("req.query: ", req.query)
        console.log("Entry: ", entry)
        updateOrCreateUser(req, res, entry)
    })
    .post(function (req, res) {
        var entry = users[req.userID]
        console.log("req.query: ", req.query)
        console.log("Entry: ", entry)
        updateOrCreateUser(req, res, entry)
    })
    .delete(function (req, res) {
        var entry = users[req.userID]

        var user = req.query.username
        console.log('authenticated user: ' + user)

        if (entry === undefined) {
            sendTxt(res, 404, "User " + req.userID + " not found.")
        } else {
            if (user === entry.id) {
                delete users[req.userID]
                sendTxt(res, 204, "User " + req.userID + " deleted.")
            } else {
                sendTxt(res, 403, "You can only delete your profile.")
            }
        }
    })

app.listen(USER_SERVICE_PORT, function () {
    console.log("User service listening on port " + USER_SERVICE_PORT)
})
"use strict"
var express = require('express')
const request = require('request')

const reviewHandling = require("./handlers/review-handler")
const userHandling = require("./handlers/user-handler")
const productHandling = require("./handlers/product-handler")

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

// ******** Authentication ********

const passport = require('passport')
const passportHtpp = require('passport-http')
const BasicStrategy = passportHtpp.BasicStrategy

app.use(passport.initialize())
app.use(passport.session())

passport.use(new BasicStrategy(
    function (username, password, done) {
        console.log("Username: " + username + " Password: " + password)
        request(USER_SERVICE_ROOT + '/User?username=' + username + "&password=" + password, {
            json: true
        }, (err, res, body) => {
            if (err) {
                return console.log(err)
            }
            console.log("Authentication Status Code: ", res.statusCode)
            if (res.statusCode === 200) {
                console.log("Found user: ", res.body)
                return done(null, {
                    username: username,
                    moderator: res.body.moderator
                })
            } else {
                return done(null, false)
            }
        })
    }
))

const AUTH_STRATEGY = 'basic'

// ******** Swagger API documentation ********

const swaggerJSDoc = require('swagger-jsdoc')
const swaggerJSOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: 'ACME Review Service',
            version: "1.0",
            description: 'An API for managing reviews'
        },
        servers: [{
            url: MAIN_SERVICE_ROOT
        }],
        security: [{
            basicAuth: []
        }]
    },
    // path to the API docs - pass all in array
    apis: ['./handlers/*.js']
}
const swaggerSpec = swaggerJSDoc(swaggerJSOptions)
//var swaggerSpec = require('./swagger.json')

const swaggerUi = require('swagger-ui-express')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/openapi.json', function (req, res) {
    res.json(swaggerSpec)
})


// Handling /User
//
// GET      List of all users (needs auth from a moderator)
// POST     not allowed
// PUT      not allowed
// DELETE   not allowed

app.route("/User")
    .get(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), userHandling.handleGetUsers)
    .put(userHandling.handlePutUsers)
    .post(userHandling.handlePostUsers)
    .delete(userHandling.handleDeleteUsers)

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
    .get(function (req, res, next) {
        if (req.header('authorization')) {
            return passport.authenticate(AUTH_STRATEGY, {
                session: false
            })(req, res, next)
        } else {
            return next()
        }
    }, userHandling.handleGetUserItem)
    .put(function (req, res, next) {
        if (req.header('authorization')) {
            return passport.authenticate(AUTH_STRATEGY, {
                session: false
            })(req, res, next)
        } else {
            return next()
        }
    }, userHandling.handlePutUserItem)
    .post(userHandling.handlePostUserItem)
    .delete(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), userHandling.handleDeleteUserItem)


// Handling the /Product
//
// GET      List of all products
// POST     not allowed
// PUT      not allowed
// DELETE   not allowed

app.route("/Product")
    .get(productHandling.handleGetProducts)
    .put(productHandling.handlePutProducts)
    .post(productHandling.handlePostProducts)
    .delete(productHandling.handleDeleteProducts)

app.param('productID', function (req, res, next, productID) {
    req.productID = productID
    return next()
})

// Handling the /Product/:productID

// GET     /Product/:productID     is public unauthenticated and returns information of a product
// POST    /Product/:productID     not allowed
// PUT     /Product/:productID     not allowed
// DELETE  /Product/:productID     not allowed

app.route("/Product/:productID")
    .get(productHandling.handleGetProductItem)
    .put(productHandling.handlePutProductItem)
    .post(productHandling.handlePostProductItem)
    .delete(productHandling.handleDeleteProductItem)

// Handling the /Review
//
// GET      Return all the approved reviews, or filter by product. If has Moderator authentication, can also filter by status
// POST     Create new review if has auth from a user
// PUT      Create new or update review if has auth from a user and the review is from that user too
// DELETE   Delete a review if has auth of the correspondent user

app.route("/Review")
    .get(function (req, res, next) {
        if (req.header('authorization')) {
            return passport.authenticate(AUTH_STRATEGY, {
                session: false
            })(req, res, next)
        } else {
            req.user = {
                username: "",
                moderator: false
            }
            return next()
        }
    }, reviewHandling.handleGetReview)
    .put(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handlePutReview)
    .post(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handlePostReview)
    .delete(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handleDeleteReview)

app.param('reviewID', function (req, res, next, reviewID) {
    req.reviewID = reviewID
    return next()
})

// Handling the /Review/:reviewID
// 
// GET     /Review/:reviewID    is public unauthenticated and gets the info of a approved review
// PUT     /Review/:reviewID    is both unauthenticated to allow to register new users and authenticated for updates
// PUT     /Review/:reviewID    not allowed
// DELETE  /Review/:reviewID    not allowed

app.route("/Review/:reviewID")
    .get(reviewHandling.handleGetReviewItem)
    .put(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handlePutReviewItem)
    .post(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handlePostReviewItem)
    .delete(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handleDeleteReviewItem)

// Handling the /MyReviews
//
// GET      Return all the reviews from the user authenticated
// POST     not allowed
// PUT      not allowed
// DELETE   not allowed

app.route("/Review/MyReviews")
    .get(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handleGetMyReviews)
    .put(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handlePutMyReviews)
    .post(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handlePostMyReviews)
    .delete(passport.authenticate(AUTH_STRATEGY, {
        session: false
    }), reviewHandling.handleDeleteMyReviews)

app.listen(MAIN_SERVICE_PORT, function () {
    console.log("Main service listening on port " + MAIN_SERVICE_PORT)
})
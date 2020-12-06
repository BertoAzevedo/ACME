"use strict"

// A node module to handle a /User/ resource of the main ACME service

const url = require('url')

////////////////////
// Handling Users //
////////////////////

/**
 * @swagger
 * /User:
 *   get:
 *     tags:
 *       - User
 *     description: Returns a list of users if has moderator authentication. The password of the user is returned only if its the same person to request it
 *     security: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/users'
 *       405:
 *         description: Method not allowed
 */
function handleGetUsers(req, res) {
    console.log('GET http://localhost:3001/User/')
    if(req.user){
        var user = req.user.username //req.body.user
        console.log('Authenticated user: ' + user)
    }
    res.redirect(307, url.format({
        pathname: "http://localhost:3001/User/",
        query: req.user
    }))
}

function handlePutUsers(req, res) {
    console.log('GET http://localhost:3001/User')
    res.redirect(307, 'http://localhost:3001/User')
}

function handlePostUsers(req, res) {
    console.log('GET http://localhost:3001/User')
    res.redirect(307, 'http://localhost:3001/User')
}

function handleDeleteUsers(req, res) {
    console.log('GET http://localhost:3001/User')
    res.redirect(307, 'http://localhost:3001/User')
}

///////////////////////////////
// Handling individual users //
///////////////////////////////

/**
 * @swagger
 * /User/{userID}:
 *   get:
 *     tags:
 *       - User
 *     description: Returns user information. The password of the user is returned only if its the same person to request it
 *     parameters:
 *       - in: path
 *         name: userID
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to get
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       404:
 *         description: User not found
 *       403:
 *         description: you are authenticated and tried to update a user profile other than yours
 *       409:
 *         description: you are not authenticated, trying to register a new user, but the choosen user name is already in use
 */
function handleGetUserItem(req, res) {
    console.log('GET http://localhost:3001/User/' + req.userID)
    if(req.user){
        var user = req.user.username //req.body.user
        console.log('Authenticated user: ' + user)
    }
    res.redirect(307, url.format({
        pathname: "http://localhost:3001/User/" + req.userID,
        query: req.user
    }))
}

/**
 * @swagger
 * /User/{userID}:
 *   put:
 *     tags:
 *       - User
 *     description: Create or update a user account
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       403:
 *         description: you are authenticated and tried to update a user profile other than yours
 *       409:
 *         description: you are not authenticated, trying to register a new user, but the choosen user name is already in use
 */
function handlePutUserItem(req, res) {
    console.log('PUT http://localhost:3001/User/' + req.userID)
    if(req.user){
        var user = req.user.username //req.body.user
        console.log('Authenticated user: ' + user)
    }
    res.redirect(307, url.format({
        pathname: "http://localhost:3001/User/" + req.userID,
        query: req.user
    }))
}

/**
 * @swagger
 * /User/{userID}:
 *   post:
 *     tags:
 *       - User
 *     description: Create a user account
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       409:
 *         description: you are not authenticated, trying to register a new user, but the choosen user name is already in use
 */
function handlePostUserItem(req, res) {
    console.log('POST http://localhost:3001/User/' + req.userID)
    if(req.user){
        var user = req.user.username //req.body.user
        console.log('Authenticated user: ' + user)
    }
    res.redirect(307, url.format({
        pathname: "http://localhost:3001/User/" + req.userID,
        query: req.user,
    }))
}

/**
 * @swagger
 * /User/{userID}:
 *   delete:
 *     tags:
 *       - User
 *     description: Delete a user account
 *     security: []
 *     responses:
 *       204:
 *         description: Account deleted
 *       404:
 *         description: User not found
 *       403:
 *         description: Tried to delete other account
 */
function handleDeleteUserItem(req, res) {
    console.log('DELETE http://localhost:3001/User/' + req.userID)
    if(req.user){
        var user = req.user.username //req.body.user
        console.log('Authenticated user: ' + user)
    }
    res.redirect(307, url.format({
        pathname: "http://localhost:3001/User/" + req.userID,
        query: req.user,
    }))
}

exports.handleGetUsers = handleGetUsers
exports.handlePutUsers = handlePutUsers
exports.handlePostUsers = handlePostUsers
exports.handleDeleteUsers = handleDeleteUsers

exports.handleGetUserItem = handleGetUserItem
exports.handlePostUserItem = handlePostUserItem
exports.handlePutUserItem = handlePutUserItem
exports.handleDeleteUserItem = handleDeleteUserItem
"use strict"

// A node module to handle the /Review/ resource of the main ACME service

const randomDate = require('../utils/util').randomDate
const sendMsg = require('../utils/util').sendJSON
const sendTxt = require('../utils/util').send

// ******** Server Info ********

const MAIN_SERVICE_PORT = 3000
const USER_SERVICE_PORT = 3001
const PRODUCT_SERVICE_PORT = 3002

const MAIN_SERVICE_ROOT = "http://localhost:" + MAIN_SERVICE_PORT
const USER_SERVICE_ROOT = "http://localhost:" + USER_SERVICE_PORT
const PRODUCT_SERVICE_ROOT = "http://localhost:" + PRODUCT_SERVICE_PORT

// ******** DATA STORE ********

let reviews = {}

// ******** SAMPLE DATA ********

reviews.a1 = {
    id: "a1",
    productID: "1234567890128",
    text: "Produto muito bom!",
    rating: 4.5,
    createdOn: randomDate(new Date(2014, 0, 1), new Date()),
    updatedOn: randomDate(new Date(2016, 0, 1), new Date(2019, 0, 1)),
    status: "approved",
    creator: "berto"
}
reviews.b2 = {
    id: "b2",
    productID: "1234567890128",
    text: "Melhor produto de sempre!",
    rating: 5,
    createdOn: randomDate(new Date(2014, 0, 1), new Date()),
    updatedOn: randomDate(new Date(2016, 0, 1), new Date(2019, 0, 1)),
    status: "pending",
    creator: "catarina"
}
reviews.c3 = {
    id: "c3",
    productID: "9876543210128",
    text: "Artigo fantástico, recomendo!",
    rating: 4,
    createdOn: randomDate(new Date(2014, 0, 1), new Date()),
    updatedOn: randomDate(new Date(2016, 0, 1), new Date(2019, 0, 1)),
    status: "pending",
    creator: "antonio"
}
reviews.d4 = {
    id: "d4",
    productID: "9876543210128",
    text: "Artigo muito fraco",
    rating: 1,
    createdOn: randomDate(new Date(2014, 0, 1), new Date()),
    updatedOn: randomDate(new Date(2016, 0, 1), new Date(2019, 0, 1)),
    status: "rejected",
    creator: "pedro"
}

// ******** HELPER FUNCTIONS ********

function buildReview(newID, productID, text, rating, username) {
    const now = new Date()
    return {
        id: newID,
        productID: productID,
        text: text,
        rating: rating,
        createdOn: now,
        updatedOn: now,
        status: "pending",
        creator: username
    }
}

function updateExistingReview(id, text, rating) {
    var entry = reviews[id]
    const now = new Date()
    entry.text = text
    entry.rating = rating
    entry.updatedOn = now
    entry.status = "pending"
}

function updateReviewStatus(id, status) {
    var entry = reviews[id]
    entry.status = status
}

function updateOrCreateReview(req, res, entry) {
    if (req.user.username) {
        //authenticated
        if (entry === undefined) {
            //the user is authenticated but requested an unexisting id
            //create a new one
            var newID = "z" + (Math.random() * 10000).toString().substr(1, 7)
            let new_entry = buildReview(newID, req.reviewID, req.body.text, req.body.rating, req.user.username)
            reviews[newID] = new_entry
            sendMsg(res, 201, new_entry, {
                'Location': MAIN_SERVICE_ROOT + "/Review/" + new_entry.id
            })
        } else {
            var user = req.user.username //req.body.user
            console.log('Authenticated user: ' + user)

            if (user === entry.creator && req.reviewID === entry.id) {
                updateExistingReview(entry.id, req.body.text, req.body.rating)
                sendMsg(res, 200, entry, {
                    'Location': MAIN_SERVICE_ROOT + "/Review/" + entry.id
                })
            } else if (req.user.moderator === true) {
                if(req.body.status){
                    updateReviewStatus(entry.id, req.body.status)
                }
                sendMsg(res, 200, entry, {
                    'Location': MAIN_SERVICE_ROOT + "/Review/" + entry.id
                })
            } else {
                sendTxt(res, 403, "You can only update your reviews.")
            }
        }
    } else {
        res.status(405).send("Only registed users can create a new review. Please authenticate")
    }
}

function SearchReviewByProduct(data, productID, status) {
    var out = []
    if (productID !== undefined) {
        Object.keys(data).forEach(function (k) {
            if (status == undefined) {
                //reviews for moderator
                if (data[k].productID === productID) {
                    out.push(data[k])
                }
            } else {
                if (data[k].productID === productID && data[k].status === status) {
                    out.push(data[k])
                }
            }
        })
    }
    return out
}

function SearchReview(data, reviewID) {
    var out
    if (reviewID !== undefined) {
        Object.keys(data).forEach(function (k) {
            if (data[k].id === reviewID) {
                out = data[k]
            }
        })
    }
    return out
}

////////////////////////////////
// Handling Review Collection //
////////////////////////////////

/**
 * @swagger
 * /Review:
 *   get:
 *     tags:
 *       - Review
 *     description: Returns a list of approved reviews with pagination. Can also filter by product. With moderator authentication its also possible to filter by status
 *     parameters:
 *       - in: query
 *         name: productID
 *         schema:
 *           type: string
 *         description: Filter reviews by product
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter reviews by status (only with moderator authentication)
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *         description: The number of items to skip before starting to collect the result set
 *       - in: query
 *         name: n
 *         schema:
 *           type: integer
 *         description: The numbers of items to return
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/reviews'
 *       404:
 *         description: Review not found
 *       405:
 *         description: Method not allowed
 */
function handleGetReview(req, res) {
    let out = {}
    let array = []

    if (req.query.productID) {
        //search reviews for a specific productID
        console.log("Requested reviews for productID: " + req.query.productID)
        if (req.user.moderator !== undefined && req.user.moderator == true) {
            if (req.query.status) {
                array = SearchReviewByProduct(reviews, req.query.productID, req.query.status)
            } else {
                array = SearchReviewByProduct(reviews, req.query.productID)
            }
        } else {
            array = SearchReviewByProduct(reviews, req.query.productID, "approved")
        }
    } else {
        //get all the reviews (not efficient if has too many reviews)
        Object.keys(reviews).forEach(function (k) {
            if (req.user.moderator !== undefined && req.user.moderator == true) {
                if (req.query.status) {
                    if (reviews[k].status === req.query.status) {
                        array.push(reviews[k])
                    }
                } else {
                    array.push(reviews[k])
                }
            } else {
                if (reviews[k].status === "approved") {
                    array.push(reviews[k])
                }
            }
        })
    }

    if (array.length == 0) {
        res.status(404).send("Reviews not found.")
    }

    array.sort(function sortFunction(a, b) {
        var dateA = new Date(a.updatedOn).getTime()
        var dateB = new Date(b.updatedOn).getTime()
        return dateA < dateB ? 1 : -1
    })

    if (req.query.start) {
        //if has start param, then use pagination with default value 20 or if has "n" param
        let start = parseInt(req.query.start)

        let n = 20
        if (req.query.n) {
            n = parseInt(req.query.n)
        }

        let reviews_array = []

        array.forEach(function (k, i) {
            if (i >= start + n) {
                return
            }
            if (i >= start) {
                reviews_array.push(array[i])
            }
        })

        let nextStart = start + n
        let previousStart = start !== 0 ? start - n : 0

        let link_start = "http://localhost:3000/Review?"
        let link_prev = "http://localhost:3000/Review?"
        let link_next = "http://localhost:3000/Review?"

        if (req.query.productID) {
            link_start += "productID=" + req.query.productID
            link_prev += "productID=" + req.query.productID
            link_next += "productID=" + req.query.productID

        }

        if (req.user.moderator !== undefined && req.user.moderator == true) {
            if (req.query.status) {
                link_start += "&status=" + req.query.status
                link_prev += "&status=" + req.query.status
                link_next += "&status=" + req.query.status
            }
        }

        link_start += "&start=0"
        link_prev += "&start=" + previousStart + "&n=" + n
        link_next += "&start=" + nextStart + "&n=" + n

        out['reviews'] = reviews_array
        out['_links'] = [{
                "rel": "start",
                "href": link_start
            },
            {
                "rel": "prev",
                "href": link_prev
            },
            {
                "rel": "next",
                "href": link_next
            },
        ]
    } else {
        out['reviews'] = array
    }

    res.format({
        'application/json': function () {
            sendMsg(res, 200, out)
        },
        'default': function () {
            // log the request and respond with 406
            sendTxt(res, 406, 'Not Acceptable')
        }
    })
}

function handlePutReview(req, res) {
    console.log("Cannot overwrite reviews.")
    res.status(405).send("Cannot overwrite reviews.")
}

function handlePostReview(req, res) {
    console.log("Cannot overwrite reviews.")
    res.status(405).send("Cannot overwrite reviews.")
}

function handleDeleteReview(req, res) {
    console.log("Cannot delete reviews.")
    res.status(405).send("Cannot delete reviews.")
}

/////////////////////////////////
// Handling individual reviews //
/////////////////////////////////

/**
 * @swagger
 * /Review/{reviewID}:
 *   get:
 *     tags:
 *       - Review
 *     description: Returns a specific review 
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/review'
 *       404:
 *         description: Review not found
 */
function handleGetReviewItem(req, res) {
    console.log("Requested review with reviewID: " + req.reviewID)
    var out = SearchReview(reviews, req.reviewID)
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
        res.status(404).send("Review " + req.reviewID + " not found.")
    }
}

/**
 * @swagger
 * /Review/{productID}:
 *   put:
 *     tags:
 *       - Review
 *     description: Creates a review. Needs authentication of the user
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/review'
 *       401:
 *         description: Needs authentication
 */
/**
 * @swagger
 * /Review/{reviewID}:
 *   put:
 *     tags:
 *       - Review
 *     description: Updates a review. Needs authentication of the user
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/review'
 *       401:
 *         description: Needs authentication
 *       403:
 *         description: you are authenticated and tried to update a user profile other than yours
 */
function handlePutReviewItem(req, res) {
    var entry = reviews[req.reviewID]
    if (req.user) {
        var user = req.user.username //req.body.user
        console.log('Authenticated user: ' + user)
    }
    console.log("Entry: ", entry)
    updateOrCreateReview(req, res, entry)
}

/**
 * @swagger
 * /Review/{productID}:
 *   post:
 *     tags:
 *       - Review
 *     description: Creates a review. Needs authentication of the user
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/review'
 *       401:
 *         description: Needs authentication
 */
function handlePostReviewItem(req, res) {
    var entry = reviews[req.reviewID]
    if (req.user) {
        var user = req.user.username //req.body.user
        console.log('Authenticated user: ' + user)
    }
    console.log("Entry: ", entry)
    updateOrCreateReview(req, res, entry)
}

/**
 * @swagger
 * /Review/{reviewID}:
 *   delete:
 *     tags:
 *       - Review
 *     description: Deletes a review. Needs authentication of the user who created it
 *     responses:
 *       204:
 *         description: Review deleted
 *       401:
 *         description: Needs authentication
 *       403:
 *         description: Tried to delete a review from another user
 */
function handleDeleteReviewItem(req, res) {
    if (req.user) {
        console.log('Authenticated user: ' + req.user.username)
    }
    console.log("Entry: ", entry)

    var entry = reviews[req.reviewID]

    var user = req.user.username
    console.log('authenticated user: ' + user)

    if (entry === undefined) {
        //TODO potential security breach
        sendTxt(res, 404, "Review " + req.reviewID + " not found.")
    } else {
        if (user === entry.creator) {
            delete reviews[req.reviewID]
            sendTxt(res, 204, "Review " + req.reviewID + " deleted.")
        } else {
            sendTxt(res, 403, "You can only delete your reviews.")
        }
    }
}

////////////////////////
// Handling MyReviews //
////////////////////////

/**
 * @swagger
 * /Review/MyReviews:
 *   get:
 *     tags:
 *       - Review
 *     description: Returns a list of personal reviews. Can also filter by status to view the current status of your reviews
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter reviews by status
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/reviews'
 *       404:
 *         description: Review not found
 *       405:
 *         description: Method not allowed
 */
function handleGetMyReviews(req, res) {
    let out = {}
    let array = []

    //get all the reviews of a user
    Object.keys(reviews).forEach(function (k) {
        if (reviews[k].creator === req.user.username) {
            if (req.query.status) {
                //search reviews of a user by status
                if (reviews[k].status === req.query.status) {
                    array.push(reviews[k])
                }
            } else {
                array.push(reviews[k])
            }
        }
    })

    if (array.length == 0) {
        res.status(404).send("You dont have any reviews.")
    }

    array.sort(function sortFunction(a, b) {
        var dateA = new Date(a.updatedOn).getTime()
        var dateB = new Date(b.updatedOn).getTime()
        return dateA < dateB ? 1 : -1
    })

    out['reviews'] = array

    res.format({
        'application/json': function () {
            sendMsg(res, 200, out)
        },
        'default': function () {
            // log the request and respond with 406
            sendTxt(res, 406, 'Not Acceptable')
        }
    })
}

function handlePutMyReviews(req, res) {
    console.log("Cannot overwrite all your reviews.")
    res.status(405).send("Cannot overwrite all your reviews.")
}

function handlePostMyReviews(req, res) {
    console.log("Cannot overwrite all your reviews.")
    res.status(405).send("Cannot overwrite all your reviews.")
}

function handleDeleteMyReviews(req, res) {
    console.log("Cannot delete all your reviews.")
    res.status(405).send("Cannot delete all your reviews.")
}

exports.handleGetReview = handleGetReview
exports.handlePutReview = handlePutReview
exports.handlePostReview = handlePostReview
exports.handleDeleteReview = handleDeleteReview

exports.handleGetReviewItem = handleGetReviewItem
exports.handlePostReviewItem = handlePostReviewItem
exports.handlePutReviewItem = handlePutReviewItem
exports.handleDeleteReviewItem = handleDeleteReviewItem

exports.handleGetMyReviews = handleGetMyReviews
exports.handlePutMyReviews = handlePutMyReviews
exports.handlePostMyReviews = handlePostMyReviews
exports.handleDeleteMyReviews = handleDeleteMyReviews
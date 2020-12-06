"use strict"
var express = require('express')

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

let products = {}

// ******** SAMPLE DATA ********

products.a1 = {
    id: "1234567890128",
    designation: "Banana",
    description: "Fruta",
    images: [{
            href: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg"
        },
        {
            href: "https://conteudo.imguol.com.br/c/entretenimento/24/2020/09/15/banana-1600197261350_v2_450x337.jpg"
        }
    ],
    sku: "http://barcodes4.me/barcode/i2of5/1234567890128.png"
}
products.b2 = {
    id: "9876543210128",
    designation: "Nivea",
    description: "Hydration cream",
    images: [{
            href: "https://fotos.web.sapo.io/i/B521309d8/17906746_udvIk.jpeg"
        },
        {
            href: "https://img.makeupalley.com/5/7/6/6/3316652.JPEG"
        }
    ],
    sku: "http://barcodes4.me/barcode/i2of5/9876543210128.png",
}

function generateProducts() {
    for (let i = 0; i < 50; i++) {
        const newID = "z" + (Math.random() * 10000).toString().substr(1, 7)
        let designation = "designation"
        let description = "description"
        let imageURL = "imageURL"
        let sku = "sku"
        products[newID] = buildProduct(newID, designation, description, imageURL, sku)
    }
}

generateProducts()

// ******** HELPER FUNCTIONS ********

function buildProduct(newID, designation, description, imageURL, sku) {
    return {
        id: newID,
        designation: designation,
        description: description,
        images: [{
            href: imageURL
        }],
        sku: sku
    }
}

function search(products, id) {
    return products.id === id
}

function SearchProduct(data, id) {
    var out
    if (id !== undefined) {
        Object.keys(data).forEach(function (k) {
            if (search(data[k], id)) {
                out = data[k]
            }
        })
    }
    return out
}

// Handling the /Product
//
// GET      List of all products
// POST     not allowed
// PUT      not allowed
// DELETE   not allowed

app.route("/Product")
    .get(function (req, res) {
        let out = {}
        if (req.query.start) {
            //if has start param, then use pagination with default value 20 or if has "n" param
            let start = parseInt(req.query.start)

            let n = 20
            if(req.query.n){
                n = parseInt(req.query.n)
            }

            let products_array = []
            
            Object.keys(products).forEach(function (k, i) {
                if(i >= start + n){
                    return
                }
                if(i >= start){
                    products_array.push(products[k])
                }
            })

            let nextStart = start + n
            let previousStart = start !== 0 ? start - n : 0

            out['products'] = products_array
            out['_links'] = [{
                    "rel": "start",
                    "href": "http://localhost:3000/Product?start=0"
                },
                {
                    "rel": "prev",
                    "href": "http://localhost:3000/Product?start=" + previousStart + "&n=" + n
                },
                {
                    "rel": "next",
                    "href": "http://localhost:3000/Product?start=" + nextStart + "&n=" + n
                },
            ]
        } else {
            //get all the products (not paginated)
            let products_array = []
            Object.keys(products).forEach(function (k) {
                products_array.push(products[k])
            })
            out['products'] = products_array
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
    })
    .put(function (req, res) {
        console.log("Cannot overwrite products.")
        res.status(405).send("Cannot overwrite products.")
    })
    .post(function (req, res) {
        console.log("Cannot create new products.")
        res.status(405).send("Cannot create new products.")
    })
    .delete(function (req, res) {
        console.log("Cannot delete products.")
        res.status(405).send("Cannot delete products.")
    })


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
    .get(function (req, res) {
        console.log("Requested product with productID: " + req.productID)
        var out = SearchProduct(products, req.productID)
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
            res.status(404).send("Product " + req.productID + " not found.")
        }
    })
    .put(function (req, res) {
        console.log("Cannot overwrite products.")
        res.status(405).send("Cannot overwrite products.")
    })
    .post(function (req, res) {
        console.log("Cannot create new products.")
        res.status(405).send("Cannot create new products.")
    })
    .delete(function (req, res) {
        console.log("Cannot delete products.")
        res.status(405).send("Cannot delete products.")
    })

app.listen(PRODUCT_SERVICE_PORT, function () {
    console.log("Product service listening on port " + PRODUCT_SERVICE_PORT)
})
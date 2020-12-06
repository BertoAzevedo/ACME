"use strict"

// A node module to handle a /Product/ resource of the main ACME service

const url = require('url')

///////////////////////
// Handling Products //
///////////////////////

/**
 * @swagger
 * /Product:
 *   get:
 *     tags:
 *       - Product
 *     description: Returns all products
 *     parameters:
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
 *               $ref: '#/components/schemas/products'
 */
function handleGetProducts(req, res) {
    console.log('GET http://localhost:3002/Product')
    res.redirect(307, url.format({
        pathname: "http://localhost:3002/Product",
        query: req.query
    }))
}

function handlePutProducts(req, res) {
    console.log('GET http://localhost:3002/Product')
    res.redirect(307, 'http://localhost:3002/Product')
}

function handlePostProducts(req, res) {
    console.log('GET http://localhost:3002/Product')
    res.redirect(307, 'http://localhost:3002/Product')
}

function handleDeleteProducts(req, res) {
    console.log('GET http://localhost:3002/Product')
    res.redirect(307, 'http://localhost:3002/Product')
}

//////////////////////////////////
// Handling individual products //
//////////////////////////////////

/**
 * @swagger
 * /Product/{productID}:
 *   get:
 *     tags:
 *       - Product
 *     description: Returns one product
 *     parameters:
 *       - in: path
 *         required: true
 *         name: productID
 *         schema:
 *           type: string
 *         description: Numeric ID of the product to get
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/product'
 *       404:
 *         description: the id does not correspond to an existing product
 */
function handleGetProductItem(req, res) {
    console.log('GET http://localhost:3002/Product/' + req.productID)
    res.redirect(307, 'http://localhost:3002/Product/' + req.productID)
}

function handlePutProductItem(req, res) {
    console.log('PUT http://localhost:3002/Product/' + req.productID)
    res.redirect(307, 'http://localhost:3002/Product/' + req.productID)
}

function handlePostProductItem(req, res) {
    console.log('POST http://localhost:3002/Product/' + req.productID)
    res.redirect(307, 'http://localhost:3002/Product/' + req.productID)
}

function handleDeleteProductItem(req, res) {
    console.log('DELETE http://localhost:3002/Product/' + req.productID)
    res.redirect(307, 'http://localhost:3002/Product/' + req.productID)
}

exports.handleGetProducts = handleGetProducts
exports.handlePutProducts = handlePutProducts
exports.handlePostProducts = handlePostProducts
exports.handleDeleteProducts = handleDeleteProducts

exports.handleGetProductItem = handleGetProductItem
exports.handlePostProductItem = handlePostProductItem
exports.handlePutProductItem = handlePutProductItem
exports.handleDeleteProductItem = handleDeleteProductItem
"use strict";

/**
 * @swagger
 * components:
 *   schemas:
 *     image:
 *       description: a image
 *       properties:
 *         href:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     product:
 *       description: a product
 *       properties:
 *         id:
 *           type: string
 *         designation:
 *           type: string
 *         description:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/image'
 *         sku:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     products:
 *       description: A json object with all the objects of products
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/product'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     user:
 *       description: a user
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         createdOn:
 *           type: string
 *           format: date-time
 *         updatedOn:
 *           type: string
 *           format: date-time
 *         moderator:
 *           type: boolean
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     users:
 *       description: A json object with all the objects of users
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/user'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     review:
 *       description: a review
 *       properties:
 *         id:
 *           type: string
 *         productID:
 *           type: string
 *         text:
 *           type: string
 *         rating:
 *           type: number
 *         createdOn:
 *           type: string
 *           format: date-time
 *         updatedOn:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *         creator:
 *           type: string
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     reviews:
 *       description: A json object with all the objects of reviews
 *       properties:
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/review'
 */

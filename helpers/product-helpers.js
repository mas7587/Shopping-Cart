//7th step we will use the database function here(8th step in product helpers.js)
var db = require("../config/connection");
//12th step (so we will call this collection in 13th step)
var collection = require("../config/collections");
const { reject } = require("bcrypt/promises");
const res = require("express/lib/response");
const { response } = require("../app");
//TODO: 54 Delete product check todo55
var objectId = require("mongodb").ObjectID;

//^automatic
/*const async = require('hbs/lib/async')
const { reject } = require('bcrypt/promises')
const { ObjectId } = require('mongodb')*/

//4th step (5th step in admin.js)
module.exports = {
  addProduct: (product, callback) => {
    // console.log(product);
    //8th step (9th step in admin.js)
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        //console.log(data);
        //&insertedId is the function i changed from the video because the mongodb version 4 is arry (ops) new version of mongodb called insertedId
        callback(data.insertedId);
      });
  }, //module.exports is a object .so we will use ","
  //10th step use data from database(11th step in config/collection.js)
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      //13th step(14th step in admin.js)
      /*before here was 'product'insted of PRODUCT COLLECTION. incase any missing or lost data .we create collection.js and we call that object here */
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray(); /* that data we have to move to an array*/
      resolve(product);
    });
  },
  //TODO:53 Delete product FUCNCTION FOR PRODUCT ID DELETE
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      //TODO:55 Delete product before db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:prodId}).then((response)=>{
      // ~ i change deleteOne insted of removeOne its working now //!now we need confirmatiion button.check todo56
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(prodId) })
        .then((response) => {
          console.log(response);
          resolve(response);
          //! we have to require database objectId. check todo54
        });
    });
  },
  //TODO:61 Edit product- define getProductDetails Function
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(proId) })
        .then((product) => {
          resolve(product); //!now we will pass the product.check todo62
        });
    });
  },
  //TODO:67 Edit product -create a function for  "updateProduct"
  updateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {
      //^ now we are going to edit a product
      db.get().collection(collection.PRODUCT_COLLECTION)
      .updateOne({ _id: objectId(proId)},{
         $set: {
            //~ this is for maybe particular id element only we edit(eg:- Name only)
            Name: proDetails.Name,
            Description: proDetails.Description,
            Price: proDetails.Price,
            Category: proDetails.Category,
          }
        }).then((response)=>{
            resolve()
        })
    })
  }
}
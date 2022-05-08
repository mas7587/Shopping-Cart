//28th step store userdata to database(29th in collection.js)
// we need store the userData so we need database connection
var db = require("../config/connection");
var collection = require("../config/collections" /*check the collection.js */);
// 30.1th step so we will use the npm bcrypt(30.2)
const bcrypt = require("bcrypt");
//TODO:76 Add to cart-
var objectId = require("mongodb").ObjectID;

//TODO:135 Razorpay integration -this var from npm razorpay website https://www.npmjs.com/package/razorpay
//run "npm i razorpay"
const Razorpay = require("razorpay");
var instance = new Razorpay({
  //key_id: 'from rasorpay website before we create one key so you have to add here that key', key_secret: 'YOUR_KEY_SECRET',
  key_id: "rzp_test_UllmqDBCiFu27A",
  key_secret: "RHQfIJ5n42vAoyMGvLnwYv9k",
});

//automatic
const { reject } = require("bcrypt/promises");
const async = require("hbs/lib/async");
const { status } = require("express/lib/response");
const { ObjectId } = require("mongodb");
const { response } = require("../app");
const { resolve } = require("path");

module.exports = {
  doSignup: (userData) => {
    //30.3 when the users call signup we have call this funtion(31th step in user.js)
    //30th step "npm install bcrypt" for encrypting user data(30.1)
    //30.2(30.3)
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(
        userData.Password,
        10
      ); /*this 10 means how fast*/
      //this data we have to store in a database
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          console.log(userData);
          resolve(data.insertedId);
        });
    });
  },
  // 34th step for login we will create this function(35th in user.js)
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      //we are going to take data from database
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({
        Email: userData.Email,
      }); /**this is for check email user enterd email and signed email is match or not */
      if (user) {
        // bcrypt.compare[compare is a bcrypt library for compare the encrypted password](userData.Password[this is userData password is database password],user.Password[this is user entered password . so we will check the both password is same or not using bcrypt library "compare"]).then((result))
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            //35.1 create new object
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            //35.1
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed first");
        //35.1 (35.2 in user.js)
        resolve({ status: false });
      }
    });
  },
  //TODO:74 Add to cart-
  addToCart: (proId, userId) => {
    //TODO:96 Add to cart-Recreate
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) }); //!now im going create new collection for cart storage.todo75
      if (userCart) {
        //TODO:97 Add to cart-show each product how many quantity in database (recreate)
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);
        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          //TODO:78 Add to cart- Update one objectId for the  cart
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        //if user not login
        let cartObj = {
          user: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  //TODO:80 Add to cart- Aggregate mongodb define getCartProducts
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          //TODO:98 Add to cart- show cart in webpage
          {
            //make separate
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          //TODO:101 Add to cart-make product as a object
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },

          //   {
          //     $lookup: {
          //       from: collection.PRODUCT_COLLECTION,
          //       let: { prodList: "$products" },
          //       pipeline: [
          //         {
          //           $match: {
          //             $expr: {
          //               $in: ["$_id", "$$prodList"],
          //             },
          //           },
          //         },
          //       ],
          //       as: "cartItems",
          //     },
          //   },
        ])
        .toArray();
      //TODO:81 Add to cart- object into array
      //console.log(cartItems[2].products);
      resolve(cartItems);
    });
  },
  //TODO:87 Add to cart- fetch data from database
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  //TODO:105 Add to cart- function for changeProductQuantity
  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  //TODO:108 Total price of Cart- getTotalAmount function
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },

          {
            //make separate
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },

          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              //~Need to convert the quantity and price into corresponding integer datatype. We can convert integer, double long datatype by using $toInt, $toDouble, $toLong Here we need to change this as: $multiply:[{ $toInt: '$quantity' },{ $toInt: '$product.Price' }]
              total: {
                $sum: {
                  $multiply: [
                    { $toInt: "$quantity" },
                    { $toInt: "$product.Price" },
                  ],
                },
              },
            },
          },
        ])
        .toArray();
      console.log(total[0].total);
      //TODO:109 Total price of Cart- i will pass the total to user.js check todo110
      resolve(total[0].total);
    });
  },
  //TODO:121 Check out-placeOrder function
  placeOrder: (order, products, total) => {
    //if we need place order then we need products of the cart and total amount
    return new Promise((resolve, reject) => {
      console.log(order, products, total);
      // check the payment method COD or online payment
      let status = order["payment-method"] === "COD" ? "placed" : "pending";
      let orderObj = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
        },
        userId: objectId(order.userId),
        paymentMethod: order["payment-method"],
        products: products,
        totalAmount: total,
        status: status,
        date: new Date(),
      };
      //TODO:124 Check out- create new collection in database now i will create new collection in collections for "orders"
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          //after place order we need to clear the cart
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: objectId(order.userId) });
            console.log("order id:",response.insertedId);
          resolve(response.insertedId);
        });
    });
  },
  //TODO:123 Check out-getCartProductList function
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      console.log(cart);
      resolve(cart.products); //now i will pass the products in the user.js
    });
  },
  //TODO:128 Check out- getUserOrders function
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId);
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(userId) })
        .toArray();
      console.log(orders);
      resolve(orders);
    });
  },
  //TODO:131 Check out-create route for view-order-product
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$product.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      console.log(orderItems);
      resolve(orderItems);
    });
  },
  //TODO:132 Razorpay integration now you have to ragister for new account in razorpay(razorpay.com).and in the settings API KEYS AND GENERATE KEY.and install npm module for razorpay
  //TODO:134 Razorpay integration -generateRazorpay function
  generateRazorpay: (orderId, total) => {
    console.log("this is orderid rzrpay -",orderId);
    console.log("this is total:",total);
    return new Promise((resolve, reject) => {
      //^this code i copied from razorpay website "1.3 Integrate Orders API on Server" https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#13-integrate-orders-api-on-server
      var options = {
        amount: total, // amount in the smallest currency unit
        currency: "INR",
        receipt: ""+orderId
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          console.log("new order :", order);
          //!now we have to pass this order to place-order.hbs
          resolve(order);
        }
      });
    });
  },
  //TODO:140 Razorpay integration-server match verification
  verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
      //TODO:141 -Razorpay integration- SHA256 algorithm, the razorpay_payment_id and the order_id to construct a HMAC hex digest
      //add crypto library
      const crypto =require('crypto');
      let hmac = crypto.createHmac('sha256','RHQfIJ5n42vAoyMGvLnwYv9k')

      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      hmac=hmac.digest('hex')
      if(hmac=details['payment[razorpay_signature]']){
        resolve()
      }else{
        reject()
      }



    })
  },
  //TODO:142 -Razorpay integration-if successful change status of the order
  changePaymentStatus:(orderId)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION)
      .updateOne({_id:objectId(orderId)},
      {
        $set:{
          status:'placed'
        }
      }
      ).then(()=>{
        resolve()
      })
    })
  }
};

var express = require("express");
const res = require("express/lib/response");
const async = require("hbs/lib/async");
const { render, response } = require("../app");
const { USER_COLLECTION } = require("../config/collections");
var router = express.Router();
//17th step (i copied from admin.js because we required same file here also(18th in user/view-products.hbs)
const productHelpers = require("../helpers/product-helpers");
//31st step (we have to call doSignup function in user-helpers.js)(31.1 in user.js)
const userHelpers = require("../helpers/user-helpers");

//!49.1th step insted of check the user signed user or not we will create one middlewere so then if anywhere we have to check we will only call the function (49.2-router)VERIFYLOGIN
//VERIFYLOGIN
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  //! 37th step(37.1) when the user login that time the data will be come here in the begining
  let user = req.session.user; //?if user login that data will available here
  console.log(user);
  //TODO:86 Add to cart- fetch data from database(if the user alredy make add to cart .then collect the count from the cart also)
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  //16th step i copy this data from admin.js's 14th step)(17th step in user.js)
  productHelpers.getAllProducts().then((products) => {
    // console.log(products);
    //i changed admin/view-products to user/view-products
    //TODO:88 Add to cart- fetch data from database-pass the cartCount function here also
    res.render("user/view-products", { products, user, cartCount }); //37.1th step i pass the user here(38th step in user-header.hbs)
  });
  /* we will remove this data isted of new data from admin.js
  let products=[
    {
      name:"Iphone 11",
      category:'Mobile',
      description:"This is a good phone",
      image:"https://images-na.ssl-images-amazon.com/images/I/71ZOtNdaZCL.__AC_SY445_SX342_QL70_ML2_.jpg",
    },
  ]*/

  //  res.render('index', {products,admin:true });
  //this admin.true we will connect to layout.hbs file
});

//21th step create one method for login option in login.hbs (22th step in login.hbs)
router.get("/login", (req, res) => {
  //^41th step once the user login and he press the back button should not go to login page again so im gonna fix here(42th step in user-header.hbs)
  if (req.session.loggedIn) {
    //if session loggedIn then only go to homepage("/")
    res.redirect("/");
  } else {
    //43.1 before "res.render('user/login')" (44th step in login.hbs)
    res.render("user/login", { loginErr: req.session.loginErr });
    //once this is passed then it will be null
    req.session.loginErr = false;
  }
});
// 25th this is the route for user/signup (26th we will going to sent this data to server 26th in signup.hbs)
router.get("/signup", (req, res) => {
  res.render("user/signup");
});
// 27th step post methor for /signup
// 27th step if someone make signup we have to store the data in database
// for user related contents i will create a separate folder for user signup and login (28th in helpers/user-helper)
router.post("/signup", (req, res) => {
  // 31.1 (check the data in the console ) next we are going to set login page 32 in user/login.hbs
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
});
//33rd step create one router for /login (34th in user-helpers.js)
//for login we have data(email address and password so we will check the email and password is same or not in the signup page)
router.post("/login", (req, res) => {
  //35th step so now we have to call the dologin function(35.1 in userj-helpers.js)
  userHelpers.doLogin(req.body).then((response) => {
    //we are going to set a route for this dologin function if dologin success where should go the page so we are going to set the page
    if (response.status) {
      // 37th step .session already created so now when the user login we have to assign the session here
      req.session.loggedIn = true; //here is not 'res.' because the user only sent req now
      req.session.user = response.user; //in this function we will save the data from the user

      //35.2 we dont give route here because already we created one route in the beginning .so now we will redirect only here
      res.redirect("/");
    } else {
      //43rd step we will going to give a message to the user for if the login session is not correct(43.1)
      req.session.loginErr = "Invalid Username / password";
      //35.2 (35.3)
      res.redirect("/login");
      // still the user did not understand he is login or not.now we we have one new library
      //35.3 we are going to install new library 'npm install express-session'(36th step in app.js)
      // this express session library used for that user data keep for all the weeb page Cookie-parser - used to parse cookie header to store data on the browser whenever a session is established on the server-side
    }
  });
});
//^40th step i create one route for logout.maens i am going to clear that session(41th step in user.js)
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
//^46th step we will create one route for cart (47th in cart.hbs)
// ! 49.2 now we have to check the function here so will call here as verifyLogin(before router.get('/cart', (req, res) => {)50th step in view-products.hbs //~NOW WE WILL GOING TO USE TODO KEYWORD;//^LOOK AT EXTENSION TODO TREE)
router.get("/cart", verifyLogin, async (req, res) => {
  //49th step  now will going to check the user is signed user or not .if the user not signed in then we will redirect to the login page 49.1-const
  //TODO:79 Add to cart- Display the updated objectId from the database
  let products = await userHelpers.getCartProducts(req.session.user._id); //! now we will define getCartProducts
  //TODO:112 Total price of Cart-pass the total here
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id);
  console.log(products);
  console.log("***" + req.session.user._id);
  //TODO:84 Add to cart-pass the products and user to handlebars
  res.render("user/cart", { products, user: req.session.user._id, totalValue });
});

//TODO:71 Add to cart- assign route for add to cart
//TODO:77 Add to cart- Call verifyLogin funiton
router.get("/add-to-cart/:id", (req, res) => {
  //TODO:92 Add to cart-ajax
  console.log("api call");
  //TODO:73 Add to cart- push the id to the array
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    //res.redirect("/");
    //TODO:94 Add to cart- ajax for cart badge
    res.json({ status: true });
  });
});
//TODO:104 Add to cart- Router for changeQuantity
router.post("/change-product-quantity", (req, res, next) => {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    //we take json file as a response. because we use ajax.we make change only small portion
    //TODO:114 Total price of Cart-
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
    console.log(response);
  });
});
//TODO:107 Total price of Cart- place order route
router.get("/place-order", verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  //TODO:110 Total price of Cart-pass the total here
  //TODO:117 Total price of Cart-pass the user to the place-order page(user:req.session.user)
  res.render("user/place-order", { total, user: req.session.user });
});

//TODO:119 Check out-set router for place-order
router.post("/place-order", async (req, res) => {
  //TODO:122 Check out-product details and total price for order placing
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    //!placeOrder funtion check todo.121
    console.log(orderId);
    //TODO:133 Razorpay integration -we need to check which payment method
    if (req.body["payment-method"] === "COD") {
      res.json({ codSuccess: true });
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        //!create function for grnarateRazorpay
        res.json(response);
      });
    }
  });
  console.log(req.body);
});
//TODO:125 Check out-order success route
router.get("/order-success", (req, res) => {
  res.render("user/order-success", { user: req.session.user });
});
//TODO:127 Check out-router for orders
router.get("/orders", async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id); //!check getUserOrders function todo128
  res.render("user/orders", { user: req.session.user, orders });
});
//TODO:130 Check out-create route for view-order-product
router.get("/view-order-products/:id", async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id); //! assaign route for getOrderProducts
  res.render("user/view-order-products", { user: req.session.user, products });
});
//TODO:138 Razorpay integration- router for verify-payment
router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  //TODO:139 Razorpay integration-server match verification
  userHelpers.verifyPayment(req.body).then(() => {
    //!create function for verifyPayment
    //if the order successful we have to change status of order
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("payment successful");
      res.json({ status: true });
    });
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })
});

module.exports = router;

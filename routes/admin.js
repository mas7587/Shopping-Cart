var express = require('express');
const async = require('hbs/lib/async');
const { response, render } = require('../app');
//const { render }=require('../app');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
//5th step (6th step in admin.js)
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function (req, res, next) {
  //^14th step(15th step in view-products.hbs all the data from database we use exept image so we will use image )
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    /*'then' we call because of the use promise there*/
    res.render('admin/view-products', { admin: true, products })

  })
  /*now im going to take data from database so i will delete this data
    this data i copied from user.js file
    let products=[
      {
        name:"Iphone 11",
        category:'Mobile',
        description:"This is a good phone",
        image:"https://images-na.ssl-images-amazon.com/images/I/71ZOtNdaZCL.__AC_SY445_SX342_QL70_ML2_.jpg",
      },
      etc....
    ]*/
  //im going to render a page (admin.js) page here
  // this 'index' is a page of views/index.hbs
  // i mention its using admin given this function "{admin:true})"
  // res.render('index',{admin:true})
  //i take this admin/view-products from 'views' folder

  //res.render('admin/view-products',{admin:true,products})14th step(admin.js) i move this function to there  
  //i pass the data here through "products"
  //this res.render is defining which page should give to user
});

//this /add-product we are going to give a route
router.get('/add-product', function (req, res) {
  //this when we call /add-product which form will show we will create a  form into admin folder 
  res.render('admin/add-product')
})
//i link a form from views/admin/add-products.hbs
router.post('/add-product', (req, res) => {
  console.log(req.body);
  // i make console.log i try to disply the value in the terminal
  //but its not showing so i have to add one module to in app.js file
  console.log(req.files.image);
  //i just use this function to show the image file is showing or not in the terminal

  //6th step(7th step in product helpers.js)
  productHelpers.addProduct(req.body, (id) => {
    //^9th step we are giving to the path for the image file(10th step in product helper.(//!inserting data to database is complete so now we are going to take/use data from database) )
    let image = req.files.Image
    console.log(id);
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-product")

      } else {
        console.log(err);
      }
    })

  })
})
//TODO:51 Delete Product
//~IM GOING TO DEFINE A ROUTE FOR DELETE BUTTON IN VIEW-PRODUCT.HBS 
/*FIXME:1 Delete product  another method to take id of the product.check fixme 1.1
router.get('/delete-product/',(req,res)=>{
  let proId=req.query.id
  console.log(proId);
  console.log(req.query.name);
})*/
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  //!this product "id" we need to delete so we need one function for delete the product check todo53
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

//TODO:59 Edit product set Route
router.get('/edit-product/:id',async(req,res)=>{
  //TODO:60 Edit product- take data
  let product=await productHelpers.getProductDetails(req.params.id)//!now we need define "getProductDetails" fuction .check todo 61
  console.log(product);
  //TODO:62 Edit product- pass the "value=product" //! now we need to pass this value to edit-product.hbs .check todo63 
  res.render('admin/edit-product',{product})
})
//TODO:66 Edit product- create new router for edit-product
router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id)
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{//!now we are going to define updateProfile as funtion .check todo:67
    res.redirect('/admin')
    //TODO:68 Edit product- now we are going to update image
    if(req.files.Image){
      let image=req.files.Image
      //!this is the code for move the image to the folder
      image.mv('./public/product-images/' + id + '.jpg')
      //^now before we submit(when we choose the file we want to see the choosed file) the image we need to see the image on the top of image tag section. check todo69

    }

  })

})






module.exports = router;

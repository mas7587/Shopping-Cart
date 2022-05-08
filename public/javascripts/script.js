//TODO:92 Add to Cart-ajax

function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            console.log(response)
            if(response.status){
                //alert('Added to cart successfully')
                //TODO:95 Add to Cart-ajax ('#cart-count') this is id of span in user-header.hbs file
                let count = $('#cart-count').html()
                count=parseInt(count)+1
                $('#cart-count').html(count)

            }
            
        }
    })
} 
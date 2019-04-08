var express = require('express');
var router = express.Router();
var RestaurantModal = require('../models/restaurant')
const checkAuth =  require('../middleware/auth')
const axios = require('axios');


router.post('/create', function(req, res, next){
    let {latitude, longitude} = req.body
    console.log(latitude, longitude); 
    let headers = {
        "user-key": process.env.ZOMATO_USER_KEY,
        "Content-Type":"application/json"
    }
    axios.get(`${process.env.ZOMATO_BASE_URL}/geocode?lat=${latitude}&lon=${longitude}`,
     {headers}
    ).then((results) => {
        var res_array = []
        var res_ids =[]
        for (var rest of results.data.nearby_restaurants){
            var obj = {}
            var location = {}
            var user_rating = {}
            var geometry = {}
            var coordinates = []
            coordinates.push(rest.restaurant.location.longitude)
            coordinates.push(rest.restaurant.location.latitude)
            geometry.coordinates = coordinates

            res_ids.push(rest.restaurant.R.res_id);

            location.address = rest.restaurant.location.address
            location.locality = rest.restaurant.location.locality
            location.city = rest.restaurant.location.city
            location.city_id = rest.restaurant.location.city_id
            location.latitude = rest.restaurant.location.latitude
            location.longitude = rest.restaurant.location.longitude
            location.zipcode = rest.restaurant.location.zipcode
            location.country_id = rest.restaurant.location.country_id
            location.locality_verbose = rest.restaurant.location.locality_verbose

            user_rating.aggregate_rating = rest.restaurant.user_rating.aggregate_rating
            user_rating.rating_text = rest.restaurant.user_rating.rating_text
            user_rating.rating_color = rest.restaurant.user_rating.rating_color
            user_rating.votes = rest.restaurant.user_rating.votes
            user_rating.has_fake_reviews = rest.restaurant.user_rating.has_fake_reviews

            obj.geometry = geometry
            obj.name = rest.restaurant.name
            obj.res_id = rest.restaurant.R.res_id
            obj.url = rest.restaurant.url  
            obj.location = location          
            obj.cuisines = rest.restaurant.cuisines
            obj.currency = rest.restaurant.currency
            obj.thumb = rest.restaurant.thumb
            obj.user_rating = user_rating
            obj.menu_url = rest.restaurant.menu_url
            obj.featured_image = rest.restaurant.featured_image
            obj.has_online_delivery = rest.restaurant.has_online_delivery
            obj.has_table_booking = rest.restaurant.has_table_booking
            obj.book_url = rest.restaurant.book_url
            obj.events_url = rest.restaurant.events_url
            res_array.push(obj);
        }
        RestaurantModal.find({res_id: {$in:res_ids}}, (error, data) => {
            if(error){

            }else{
                console.log(data)
                for(var restaurant of data){
                    for (var [index,completeRes] of res_array.entries()){
                        if(restaurant.res_id == completeRes.res_id){
                            res_array.splice(index, 1)
                        }
                    }
                }
                console.log(res_array)
                if (res_array.length >= 0){
                    RestaurantModal.create(res_array, function(error, data){
                        if (error){
                            res.status(400).json({
                                message: "error accrued while getting restaurants"
                            })
                        }else{
                            res.send(data)
                        }
                    })
                }else{
                    console.log("No New Restaurants are there to add our database")
                }
            }      
        })
    })
    .catch((error) => {
        console.error(error)
    })
});

router.get('/',checkAuth ,(req, res, next) => {
    let {lat,lng} = req.query
    RestaurantModal.aggregate([{$geoNear:{
        near:{
            type:'Point',
            coordinates:[parseFloat(lng), parseFloat(lat)]
        },
        maxDistance: 5000,
        spherical: true,
        distanceField:'distance',
    }}])
    .then((restaurants) => {
        res.send(restaurants);
        if (restaurants.length < 9){
            
        }
    })
})

router.delete('/deleteall', checkAuth , (req, res, next)=>{
    RestaurantModal.deleteMany({}, (error, data) =>{
        if (error){
            res.status(400).json({
                message: "error accrued while Deleting all restaurants"
            })
        }else{
            res.send(data)
        }
    })
})


module.exports = router;

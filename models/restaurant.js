var mongoose = require('mongoose');
var Schema = mongoose.Schema

const geoSchema = new Schema({
  type:{
    type: String,
    default:'Point'
  },
  coordinates:{
    type:[Number],
    index:'2dsphere'
  }
});

let restaurantSchema = new Schema({
  name:{
    type: String
  },
  res_id: String,
  url: String,
  location:{
    address: String,
    locality:String,
    city: String,
    city_id: Number,
    latitude: String,
    longitude: String,
    zipcode: String,
    country_id: Number,
    locality_verbose: String
  },
  cuisines:String,
  currency: String,
  thumb: String,
  user_rating:{
    aggregate_rating: String,
    rating_text: String,
    rating_color: String,
    votes: Number,
    has_fake_reviews: Number
  },
  menu_url: String,
  featured_image: String,
  has_online_delivery: Boolean,
  has_table_booking: Boolean,
  book_url:  String,
  events_url:String,
  geometry:geoSchema
})

module.exports = mongoose.model('Restaurant' , restaurantSchema);
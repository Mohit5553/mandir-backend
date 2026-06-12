const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./models/Review');

dotenv.config();

const dummyReviews = [
  { name: 'Ramesh Tiwari', rating: 5, comment: 'Very peaceful place. The aarti is mesmerizing and the management is very cooperative.' },
  { name: 'Sneha Sharma', rating: 5, comment: 'I visit every Monday. The temple is very clean and the atmosphere is filled with positive energy.' },
  { name: 'Amit Singh', rating: 4, comment: 'Beautiful temple and very well organized during festivals. Highly recommend visiting with family.' },
  { name: 'Priya Verma', rating: 5, comment: 'Darshan was very smooth. The trust is doing a great job with Annadan and other social services.' },
  { name: 'Vikram Yadav', rating: 5, comment: 'A divine experience. The surroundings are calm, and you feel a true connection with Mahadev here.' }
];

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/temple-trust');
    console.log('Connected to DB');
    await Review.insertMany(dummyReviews);
    console.log('Successfully added 5 dummy reviews!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
};

seedReviews();

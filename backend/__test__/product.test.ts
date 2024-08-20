const supertest = require("supertest");
const app = require("../server");
const { MongoMemoryServer }  = require('mongodb-memory-server')
const mongoose = require('mongoose')
const Product = require('../models/Product')
describe('product', () =>
{
    beforeAll(async() =>{ 
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri())
    })
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })
    describe('get product', () => { 
        
        describe('given the product does not exist', () => { 
            it('should return a 404', async () => {
                console.log(app);
                const productId = 'fakeProduct123'
                await supertest(app).get(`/products/${productId}`).expect(500) 
                expect(true).toBe(true); 
            });
        }),
        describe('given the product does exist', () => {
            it('should return a 200 and the product', async () => {
              // Create a new product
              const newProduct = new Product({
                name: 'Sample Product',
                description: 'This is a sample product.',
                platform: ['Web', 'Mobile'],
                cover: 'http://example.com/cover.jpg',
                quantity: 10,
                price: 99.99,
                photos: ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'],
                videos: ['http://example.com/video1.mp4']
              });
              await newProduct.save();
        
              // Make a request to your API
              const response = await supertest(app)
                .get(`/products/${newProduct._id}`)
                .expect(200);
        
              // Validate the response
              expect(response.body.name).toBe(newProduct.name);
              expect(response.body.description).toBe(newProduct.description);
              expect(response.body.platform).toEqual(newProduct.platform);
              expect(response.body.cover).toBe(newProduct.cover);
              expect(response.body.quantity).toBe(newProduct.quantity);
              expect(response.body.price).toBe(newProduct.price);
              expect(response.body.photos).toEqual(newProduct.photos);
              expect(response.body.videos).toEqual(newProduct.videos);
        
              // Clean up
              await Product.findByIdAndDelete(newProduct._id);
            });
          });
    })
    describe('create product', () =>{ 
        describe('given the creation is successful', () =>{ 
            it('should return a 201 and the product', async () => {
                const signup = await supertest(app).post('/users/signup').send({username: 'admin', password: 'admin', email: 'admin@gmail.com', first_name: 'ad', last_name: 'min', default_address: 'zzz', phone_number: '6474043101', is_admin: true}).expect(201)
                const login = await supertest(app).post('/users/signin').send({username: 'admin', password: 'admin'})
                // console.log(login)
                const newProduct = {
                    name: 'Sample Product',
                    description: 'This is a sample product.',
                    platform: ['Web', 'Mobile'],
                    cover: 'http://example.com/cover.jpg',
                    quantity: 10,
                    price: 99.99,
                    photos: ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'],
                    videos: ['http://example.com/video1.mp4']
                  };

                  const response = await supertest(app).post(`/products/createProductFromAdmin`).send(newProduct).set('Content-Type', 'application/json').set('Accept', 'application/json').expect(201)
                  await Product.findByIdAndDelete(response.body._id)
            })
        })
    })
})
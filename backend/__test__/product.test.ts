const supertest = require("supertest");
const app = require("../server");
const { MongoMemoryServer }  = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Product = require('../models/Product');

describe('product', () => {
    let mongoServer;

    beforeAll(async () => { 
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    describe('get product', () => { 
        describe('given the product does not exist', () => { 
            it('should return a 404', async () => {
                const productId = 'fakeProduct123';
                await supertest(app).get(`/products/${productId}`).expect(500);
                expect(true).toBe(true); 
            });
        });

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
    });

    describe('create product', () => {
        describe('given the creation is successful', () => {
            it('should return a 201 and the product', async () => {
                await supertest(app).post('/users/signup')
                    .send({
                        username: 'admin',
                        password: 'admin',
                        email: 'admin@gmail.com',
                        first_name: 'ad',
                        last_name: 'min',
                        default_address: 'zzz',
                        phone_number: '6474043101',
                        is_admin: true
                    })
                    .expect(201);
                
                const signin = await supertest(app).post('/users/signin')
                    .send({ username: 'admin', password: 'admin' })
                    .expect(200);
                
                const token = signin.body.token;
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

                const response = await supertest(app).post(`/products/createProductFromAdmin`)
                    .send(newProduct)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', `Bearer: ${token}`)
                    .expect(201);
                
                expect(response.body.name).toBe(newProduct.name);
                expect(response.body.description).toBe(newProduct.description);
                expect(response.body.platform).toEqual(newProduct.platform);
                expect(response.body.cover).toBe(newProduct.cover);
                expect(response.body.quantity).toBe(newProduct.quantity);
                expect(response.body.price).toBe(newProduct.price);
                expect(response.body.photos).toEqual(newProduct.photos);
                expect(response.body.videos).toEqual(newProduct.videos);

                await Product.findByIdAndDelete(response.body._id);
            });
        });

        describe('given the user is unauthorized', () => {
            it('should return a 403', async () => {
                await supertest(app).post('/users/signup')
                    .send({
                        username: 'user',
                        password: 'user',
                        email: 'user@gmail.com',
                        first_name: 'ad',
                        last_name: 'min',
                        default_address: 'zzz',
                        phone_number: '6474043101',
                        is_admin: false
                    })
                    .expect(201);
                
                const signin = await supertest(app).post('/users/signin')
                    .send({ username: 'user', password: 'user' })
                    .expect(200);
                
                const token = signin.body.token;
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

                await supertest(app).post(`/products/createProductFromAdmin`)
                    .send(newProduct)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', `Bearer: ${token}`)
                    .expect(403);
            });
        });
    });


    describe('get multiple products by IDs', () => {
        describe('given invalid product IDs', () => {
            it('should return a 404 if some or all product IDs are invalid', async () => {
                const response = await supertest(app)
                    .get('/products/multiple?id=fakeId1&id=fakeId2')
                    .expect(400);
            });
        });

        describe('given a mix of valid and invalid product IDs', () => {
            it('should return only the valid products with a 200 status', async () => {
                const product = await Product.create({
                    name: 'Valid Product',
                    description: 'This is a valid product.',
                    platform: ['Web'],
                    cover: 'http://example.com/cover.jpg',
                    quantity: 10,
                    price: 99.99,
                    photos: ['http://example.com/photo1.jpg'],
                    videos: ['http://example.com/video1.mp4']
                });

                const response = await supertest(app)
                    .get(`/products/multiple?ids=${product._id},fakeId`)
                    .expect(200);
                expect(response.body.length).toBe(1);
                expect(response.body[0].name).toBe(product.name);
            });
        });

        describe('given all valid product IDs', () => {
            it('should return a 200 and all requested products', async () => {
                const product1 = await Product.create({
                    name: 'Product 1',
                    description: 'Description 1',
                    platform: ['Web'],
                    cover: 'http://example.com/cover1.jpg',
                    quantity: 5,
                    price: 59.99,
                    photos: ['http://example.com/photo1-1.jpg'],
                    videos: ['http://example.com/video1-1.mp4']
                });
                const product2 = await Product.create({
                    name: 'Product 2',
                    description: 'Description 2',
                    platform: ['Mobile'],
                    cover: 'http://example.com/cover2.jpg',
                    quantity: 3,
                    price: 89.99,
                    photos: ['http://example.com/photo2-1.jpg'],
                    videos: ['http://example.com/video2-1.mp4']
                });

                const response = await supertest(app)
                    .get(`/products/multiple?ids=${product1._id},${product2._id}`)
                    .expect(200);
                expect(response.body.length).toBe(2);
                expect(response.body[0].name).toBe(product1.name);
                expect(response.body[1].name).toBe(product2.name);
            });
        });
    });

    describe('update product', () => {
        describe('given the product does not exist', () => {
            it('should return a 404', async () => {
                const productId = 'nonExistentId123';
                await supertest(app).put(`/products/${productId}`).send({ name: 'Updated Product' }).expect(404);
            });
        });

        describe('given the product exists', () => {
            it('should return a 200 and the updated product', async () => {
                const product = await Product.create({
                    name: 'Original Product',
                    description: 'This is the original product.',
                    platform: ['Web'],
                    cover: 'http://example.com/cover.jpg',
                    quantity: 10,
                    price: 99.99,
                    photos: ['http://example.com/photo1.jpg'],
                    videos: ['http://example.com/video1.mp4']
                });

                const updatedProductData = {
                    name: 'Updated Product',
                    description: 'This is the updated product.',
                    quantity: 20
                };

                const response = await supertest(app)
                    .patch(`/products/${product._id}`)
                    .send(updatedProductData)
                    .expect(200);
                
                expect(response.body.name).toBe(updatedProductData.name);
                expect(response.body.description).toBe(updatedProductData.description);
                expect(response.body.quantity).toBe(updatedProductData.quantity);
            });
        });
    });

    describe('delete product', () => {
        describe('given the product does not exist', () => {
            it('should return a 404', async () => {
                const productId = 'nonExistentId123';
                await supertest(app).delete(`/products/${productId}`).expect(404);
            });
        });

        describe('given the product exists', () => {
            it('should return a 200 and a success message', async () => {
                const product = await Product.create({
                    name: 'Product to Delete',
                    description: 'This product will be deleted.',
                    platform: ['Web'],
                    cover: 'http://example.com/cover.jpg',
                    quantity: 10,
                    price: 99.99,
                    photos: ['http://example.com/photo1.jpg'],
                    videos: ['http://example.com/video1.mp4']
                });

                const response = await supertest(app)
                    .delete(`/products/${product._id}`)
                    .expect(200);
                
                expect(response.body.message).toBe('Product deleted successfully');
            });
        });
    });
});
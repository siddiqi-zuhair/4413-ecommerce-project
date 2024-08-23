//@ts-ignore
const supertest = require("supertest");
//@ts-ignore
const mongoose = require("mongoose");
//@ts-ignore
const app = require("../server");
//@ts-ignore
const Product = require('../models/Product');

describe("Cart API", () => {
  let userId;
  let productId;

  beforeAll(() => {
    userId = new mongoose.Types.ObjectId().toString();
    productId = new mongoose.Types.ObjectId().toString();
  });

  describe("POST /carts", () => {
    it("should create a new cart", async () => {
      const response = await supertest(app)
        .post("/carts")
        .send({
          user_id: userId,
          products: [{ id: productId, ordered_quantity: 2 }],
        })
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.user_id).toBe(userId);
      expect(response.body.products).toHaveLength(1);
    });

    it("should fail to create a cart with missing fields", async () => {
      const response = await supertest(app)
        .post("/carts")
        .send({
          products: [{ id: productId, ordered_quantity: 2 }],
        })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });
  describe("GET /carts/user/:id", () => {
    it("should get the cart by user ID", async () => {
      // 1. Create a new product in the database
      const productData = new Product( {
        name: "Test Product",
        description: "This is a test product",
        platform: ["PC"],
        cover: "test-cover.jpg",
        quantity: 10,
        price: 50,
        photos: ["photo1.jpg"],
        videos: ["video1.mp4"],
      });
      await productData.save();
        productId = productData._id;
  
      // 2. Create a cart using the newly created product ID
      const uid = new mongoose.Types.ObjectId().toString();
      await supertest(app).post("/carts").send({
        user_id: uid,
        products: [{ id: productId, ordered_quantity: 2 }],
      });
  
      // 3. Get the cart by user ID
      const response = await supertest(app)
        .get(`/carts/user/${uid}`)
        .expect(200);
  
      // 4. Assert that the cart contains the correct product
      expect(response.body.user_id).toBe(uid);
      console.log(response.body); // Debugging output
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0]._id).toBe(productId.toString());});  
    it("should return 404 for a non-existent cart", async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app)
        .get(`/carts/user/${fakeUserId}`)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Cannot find cart");
    });
  });

  describe("PATCH /carts/:id", () => {
    it("should update the cart with new products", async () => {
      const response = await supertest(app)
        .patch(`/carts/${userId}`)
        .send({
          products: [{ id: productId, ordered_quantity: 5 }],
        })
        .expect(200);

      expect(response.body.products[0].ordered_quantity).toBe(5);
    });

    it("should return 404 when updating a non-existent cart", async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app)
        .patch(`/carts/${fakeUserId}`)
        .send({
          products: [{ id: productId, ordered_quantity: 5 }],
        })
        .expect(404);

      expect(response.body).toHaveProperty("message", "Cannot find cart");
    });
  });

  describe("DELETE /carts/:id", () => {
    it("should delete the cart", async () => {
      const response = await supertest(app)
        .delete(`/carts/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Deleted cart");
    });

    it("should return 404 when deleting a non-existent cart", async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app)
        .delete(`/carts/${fakeUserId}`)
        .expect(404);

      expect(response.body).toHaveProperty("message", "Cannot find cart");
    });
  });
});

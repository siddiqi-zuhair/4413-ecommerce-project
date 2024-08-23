//@ts-ignore
const supertest = require("supertest");
//@ts-ignore
const app = require("../server"); // Adjust the path as necessary
const Order = require("../models/Order");
const Cart = require("../models/Cart");
//@ts-ignore
const Product = require("../models/Product");

afterEach(async () => {
  await Order.deleteMany();
  await Cart.deleteMany();
  await Product.deleteMany();
});

describe("POST /orders", () => {
  it("should create a new order and delete the cart", async () => {
    const product = await Product.create({
      name: "Test Product",
      description: "Test Description",
      platform: ["Test Platform"],
      cover: "test-cover.jpg",
      quantity: 10,
      price: 100,
      photos: ["photo1.jpg"],
      videos: ["video1.mp4"],
    });

    const cart = await Cart.create({
      user_id: "testUserId",
      products: [{ id: product._id.toString(), ordered_quantity: 2 }],
    });

    const response = await supertest(app)
      .post("/orders")
      .send({
        user_id: "testUserId",
        products: [{ _id: product._id.toString(), ordered_quantity: 2 }],
        total: 200,
        address: "Test Address",
        payment_intent: "testPaymentIntent",
      })
      .expect(201);

    expect(response.body.user_id).toBe("testUserId");

    const deletedCart = await Cart.findOne({ user_id: "testUserId" });
    expect(deletedCart).toBeNull();

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.quantity).toBe(8);
  });
});

describe("GET /orders", () => {
  it("should return all orders", async () => {
    await Order.create({
      user_id: "testUserId1",
      products: [{ _id: "testProductId1", ordered_quantity: 2 }],
      total: 200,
      address: "Test Address 1",
      payment_intent: "testPaymentIntent1",
    });

    await Order.create({
      user_id: "testUserId2",
      products: [{ _id: "testProductId2", ordered_quantity: 1 }],
      total: 100,
      address: "Test Address 2",
      payment_intent: "testPaymentIntent2",
    });

    const response = await supertest(app)
      .get("/orders")
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});

describe("GET /orders/user/:id", () => {
  it("should return orders for a specific user ID", async () => {
    await Order.create({
      user_id: "testUserId",
      products: [{ _id: "testProductId", ordered_quantity: 2 }],
      total: 200,
      address: "Test Address",
      payment_intent: "testPaymentIntent",
    });

    const response = await supertest(app)
      .get("/orders/user/testUserId")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].user_id).toBe("testUserId");
  });
});

describe("GET /orders/id/:id", () => {
  it("should return an order by ID", async () => {
    const order = await Order.create({
      user_id: "testUserId",
      products: [{ _id: "testProductId", ordered_quantity: 2 }],
      total: 200,
      address: "Test Address",
      payment_intent: "testPaymentIntent",
    });

    const response = await supertest(app)
      .get(`/orders/id/${order._id}`)
      .expect(200);

    expect(response.body._id).toBe(order._id.toString());
  });
});

describe("GET /orders/popular", () => {
  it("should return the most ordered products", async () => {
    const product1 = await Product.create({
      name: "Product 1",
      description: "Description 1",
      platform: ["Platform 1"],
      cover: "cover1.jpg",
      quantity: 100,
      price: 50,
      photos: ["photo1.jpg"],
      videos: ["video1.mp4"],
    });

    const product2 = await Product.create({
      name: "Product 2",
      description: "Description 2",
      platform: ["Platform 2"],
      cover: "cover2.jpg",
      quantity: 100,
      price: 50,
      photos: ["photo2.jpg"],
      videos: ["video2.mp4"],
    });

    await Order.create({
      user_id: "user1",
      products: [{ _id: product1._id.toString(), ordered_quantity: 3 }],
      total: 150,
      address: "Address 1",
      payment_intent: "intent1",
    });

    await Order.create({
      user_id: "user2",
      products: [{ _id: product2._id.toString(), ordered_quantity: 5 }],
      total: 250,
      address: "Address 2",
      payment_intent: "intent2",
    });

    const response = await supertest(app)
      .get("/orders/popular")
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].total_ordered_quantity).toBe(5);
    expect(response.body[1].total_ordered_quantity).toBe(3);
  });
});

describe("GET /orders/sales", () => {
  it("should return sales history", async () => {
    await Order.create({
      user_id: "user1",
      products: [{ _id: "product1", ordered_quantity: 2 }],
      total: 100,
      purchase_date: new Date("2023-08-01"),
      address: "Address 1",
      payment_intent: "intent1",
    });

    await Order.create({
      user_id: "user2",
      products: [{ _id: "product2", ordered_quantity: 1 }],
      total: 50,
      purchase_date: new Date("2023-08-02"),
      address: "Address 2",
      payment_intent: "intent2",
    });

    const response = await supertest(app)
      .get("/orders/sales")
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].totalSales).toBe(100);
    expect(response.body[1].totalSales).toBe(50);
  });
});

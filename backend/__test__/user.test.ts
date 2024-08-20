//@ts-ignore
const supertest = require("supertest");
//@ts-ignore
const app = require("../server");
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

describe("User API", () => {
  let token, userId;

  beforeAll(async () => {
    // Sign up admin user
    await supertest(app).post("/users/signup").send({ 
        username: `admin`,
        password: "adminpassword",
        email: `admin@example.com`,
        first_name: "ad",
        last_name: "min",
        default_address: "123 Main St",
        phone_number: "1234567890",
        is_admin: true
    })
    const adminResponse = await supertest(app)
      .post("/users/signin")
      .send({
        username: "admin",
        password: "adminpassword",
      });
    token = adminResponse.body.token;
    console.log("token", token)
    // Sign up a user to be used in PATCH and DELETE tests
    const userResponse = await supertest(app)
      .post("/users/signup")
      .send({
        username: `usertoupdate_${uuidv4()}`,
        password: "userpassword",
        email: `usertoupdate_${uuidv4()}@example.com`,
        first_name: "User",
        last_name: "ToUpdate",
        default_address: "123 Main St",
        phone_number: "1234567890",
      });

    userId = userResponse.body._id;
  });

  afterEach(async () => {
    // Cleanup: delete users created in tests
    // Avoid deleting the admin user and any user that might not exist
    if (userId) {
      await supertest(app).delete(`/users/${userId}`).set("Authorization", `Bearer ${token}`);
    }
  });

  describe("POST /signup", () => {
    it("should sign up a user successfully", async () => {
      const uniqueUsername = `newuser_${uuidv4()}`;
      const response = await supertest(app)
        .post("/users/signup")
        .send({
          username: uniqueUsername,
          password: "password123",
          email: `${uniqueUsername}@example.com`,
          first_name: "New",
          last_name: "User",
          default_address: "123 Main St",
          phone_number: "1234567890",
        });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("username", uniqueUsername);
    });

    it("should return error if required fields are missing", async () => {
      const response = await supertest(app)
        .post("/users/signup")
        .send({
          username: "newuser",
          password: "password123",
          email: "newuser@example.com",
          first_name: "New",
          last_name: "User",
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /signin", () => {
    it("should sign in a user successfully", async () => {
      const uniqueUsername = `existinguser_${uuidv4()}`;
      await supertest(app)
        .post("/users/signup")
        .send({
          username: uniqueUsername,
          password: "password123",
          email: `${uniqueUsername}@example.com`,
          first_name: "Existing",
          last_name: "User",
          default_address: "123 Main St",
          phone_number: "1234567890",
        });

      const response = await supertest(app)
        .post("/users/signin")
        .send({
          username: uniqueUsername,
          password: "password123",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should return error for invalid credentials", async () => {
      const response = await supertest(app)
        .post("/users/signin")
        .send({
          username: "nonexistentuser",
          password: "wrongpassword",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });
  });

  describe("GET /me", () => {
    let authToken;

    beforeAll(async () => {
        const uniqueUsername = `existinguser_${uuidv4()}`;
        await supertest(app)
          .post("/users/signup")
          .send({
            username: uniqueUsername,
            password: "password123",
            email: `${uniqueUsername}@example.com`,
            first_name: "Existing",
            last_name: "User",
            default_address: "123 Main St",
            phone_number: "1234567890",
          });
      const response = await supertest(app)
        .post("/users/signin")
        .send({
          username: uniqueUsername,
          password: "password123",
        });
      authToken = response.body.token;
    });

    it("should return user details", async () => {
     console.log(authToken)
      const response = await supertest(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
    });

    it("should return error if no token is provided", async () => {
      const response = await supertest(app).get("/users/me");

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /me", () => {
    let authToken;

    beforeAll(async () => {
        const uniqueUsername = `existinguser_${uuidv4()}`;
        await supertest(app)
          .post("/users/signup")
          .send({
            username: uniqueUsername,
            password: "password123",
            email: `${uniqueUsername}@example.com`,
            first_name: "Existing",
            last_name: "User",
            default_address: "123 Main St",
            phone_number: "1234567890",
          });
      const response = await supertest(app)
        .post("/users/signin")
        .send({
          username: uniqueUsername,
          password: "password123",
        });
      authToken = response.body.token;
    });

    it("should update user details", async () => {
      const response = await supertest(app)
        .patch("/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          phone_number: "0987654321",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("phone_number", "0987654321");
    });

    it("should return error if no token is provided", async () => {
      const response = await supertest(app)
        .patch("/users/me")
        .send({
          phone_number: "0987654321",
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /:id", () => {
    it("should update user details by admin", async () => {
      const response = await supertest(app)
        .patch(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          phone_number: "1122334455",
          is_admin: true,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("phone_number", "1122334455");
      expect(response.body).toHaveProperty("is_admin", true);
    });

    it("should return error if no token is provided", async () => {
      const response = await supertest(app)
        .patch(`/users/${userId}`)
        .send({
          phone_number: "1122334455",
          is_admin: true,
        });

      expect(response.statusCode).toBe(401);
    });

    it("should return error if user is not found", async () => {
      const invalidId = "invaliduserId";
      const response = await supertest(app)
        .patch(`/users/${invalidId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          phone_number: "1122334455",
        });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete a user successfully", async () => {
      const response = await supertest(app)
        .delete(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message", "User deleted");
    });

    it("should return error if no token is provided", async () => {
      const response = await supertest(app).delete(`/${userId}`);

      expect(response.statusCode).toBe(401);
    });

    it("should return error if user is not found", async () => {
      const invalidId = "invaliduserId";
      const response = await supertest(app)
        .delete(`/${invalidId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });
  });
});

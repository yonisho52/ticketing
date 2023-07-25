import request from "supertest";
import { app } from "../../app";

it("returns a 201 on seccessful sugnup", async () => {
     return request(app)
          .post("/api/users/signup")
          .send({
               email: "test@test.com",
               password: "password",
          })
          .expect(201);
});

it("returns a 400 with an invalid email", async () => {
     return request(app)
          .post("/api/users/signup")
          .send({
               email: "t.com",
               password: "password",
          })
          .expect(400);
});

it("returns a 400 with an invalid password", async () => {
     return request(app)
          .post("/api/users/signup")
          .send({
               email: "test@test.com",
               password: "pas",
          })
          .expect(400);
});

it("returns a 400 with missing email and password", async () => {
     await request(app).post("/api/users/signup").send({}).expect(400);
});

it("disallows dulicate emails", async () => {
     await request(app)
          .post("/api/users/signup")
          .send({
               email: "test@test.com",
               password: "password",
          })
          .expect(201);

     await request(app)
          .post("/api/users/signup")
          .send({
               email: "test@test.com",
               password: "password",
          })
          .expect(400);
});

it("set a cookie after seccuessful signup", async () => {
     const response = await request(app)
          .post("/api/users/signup")
          .send({
               email: "test@test.com",
               password: "password",
          })
          .expect(201);

          expect(response.get('Set-Cookie')).toBeDefined();
});

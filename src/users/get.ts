import { validate } from "uuid";
import { users } from "./create";
import http from "http";

const getUsers = (response: http.ServerResponse) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(users));
};

const getUserById = (id: string, response: http.ServerResponse) => {
  if (!validate(id)) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        message: "Invalid user id",
      }),
    );
    return;
  }
  const user = users.find((user) => user.id === id);

  if (!user) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        message: "User not found",
      }),
    );
    return;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(user));
};

export { getUsers, getUserById };
import http from "http";
import { validate } from "uuid";
import { users } from "./create";
import { parseRequestBody, validateUserData } from "../utils";

const updateUser = (
  userId: string,
  request: http.IncomingMessage,
  response: http.ServerResponse,
) => {
  if (!validate(userId)) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        message: "Invalid user id",
      }),
    );
    return;
  }
  const user = users.find((user) => user.id === userId);

  if (!user) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        message: "User not found",
      }),
    );
    return;
  }

  try {
    const data = parseRequestBody(request);

    if (!validateUserData(data)) {
      response.writeHead(400, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          message:
            "Operation failed: please enter correct user data with fields: username, age, hobbies",
        }),
      );
    }

    if (user) Object.assign(user, data);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(user));
  } catch {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Invalid request" }));
  }
};

export { updateUser };
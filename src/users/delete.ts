import http from "http";
import { validate } from "uuid";
import { users } from "./create";

const deleteUser = (userId: string, response: http.ServerResponse) => {
  if (!validate(userId)) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        message: "Invalid user id",
      }),
    );
    return;
  }

  const userIndex = users.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        message: "User not found",
      }),
    );
    return;
  }

  // Удаляем пользователя
  users.splice(userIndex, 1);
  if (process.send) {
    process.send({ type: "deleteUser", data: userId }); // Уведомляем мастера о удалении
  }
  response.writeHead(204, { "Content-Type": "application/json" });
  response.end();
};

export { deleteUser };

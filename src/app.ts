import http from "http";
import dotenv from "dotenv";
import { getUserById, getUsers } from "./users/get";
import { createNewUser } from "./users/create";
import { updateUser } from "./users/update";
import { deleteUser } from "./users/delete";
dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    const urlParts = req.url?.split("/");

    if (!urlParts || urlParts.length < 2) {
      return respondWithNotFound(res);
    }

    const [_, api, resource] = urlParts;

    switch (req.method) {
      case "GET":
        return handleGet(resource, urlParts, res);
      case "POST":
        return handlePost(resource, req, res);
      case "PUT":
        return handlePut(resource, urlParts, req, res);
      case "DELETE":
        return handleDelete(resource, urlParts, res);
      default:
        return respondWithNotFound(res);
    }
  },
);

function respondWithNotFound(response: http.ServerResponse) {
  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      message: "Oops.. your request doesn't exist or not supported, try again!",
    }),
  );
}

function handleGet(
  resource: string,
  urlParts: string[],
  response: http.ServerResponse,
) {
  if (resource === "users") {
    if (urlParts.length === 3) {
      return getUsers(response);
    } else if (urlParts.length === 4) {
      return getUserById(urlParts[3], response);
    }
  }
  return respondWithNotFound(response);
}

function handlePost(
  resource: string,
  request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  if (resource === "users") {
    return createNewUser(request, response);
  }
  return respondWithNotFound(response);
}

function handlePut(
  resource: string,
  urlParts: string[],
  request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  if (resource === "users" && urlParts.length === 4) {
    return updateUser(urlParts[3], request, response);
  }
  return respondWithNotFound(response);
}

function handleDelete(
  resource: string,
  urlParts: string[],
  response: http.ServerResponse,
) {
  if (resource === "users" && urlParts.length === 4) {
    return deleteUser(urlParts[3], response);
  }
  return respondWithNotFound(response);
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

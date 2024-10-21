import http, { IncomingMessage, ServerResponse } from 'http';
import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
import { createUser, getUserById, getUsers } from './users/get';
import { User, createNewUser } from './users/create';
import { updateUser } from './users/update';
import { deleteUser } from './users/delete';

dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  const users: User[] = [];

  cluster.on("message", (worker, msg) => {
    switch (msg.type) {
      case "createUser": {
        const { username, age, hobbies } = msg.data;
        const newUser = createUser(username, age, hobbies);
        users.push(newUser);
        worker.send({ type: "userCreated", data: newUser });
        break;
      }

      case "getUsers":
        worker.send({ type: "usersList", data: users });
        break;

      case "getUserById": {
        const user = users.find(u => u.id === msg.data.id);
        worker.send(user ? { type: "userFound", data: user } : { type: "userNotFound" });
        break;
      }

      case "updateUser": {
        const { id, username, age, hobbies } = msg.data;
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], username, age, hobbies }; // Update user properties
          worker.send({ type: "userUpdated", data: users[userIndex] });
        } else {
          worker.send({ type: "userNotFound" });
        }
        break;
    }

    case "deleteUser": {
      const { id } = msg.data;
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        const deletedUser = users.splice(userIndex, 1); // Remove user from the array
        worker.send({ type: "userDeleted", data: deletedUser[0] });
      } else {
        worker.send({ type: "userNotFound" });
      }
      break;
    }    }
  });
} else {
  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const urlParts = req.url?.split('/');
    if (!urlParts || urlParts.length < 2) {
      return respondWithNotFound(res);
    }

    const [_, api, resource] = urlParts;
    switch (req.method) {
      case 'GET':
        return handleGet(resource, urlParts, res);
      case 'POST':
        return handlePost(resource, req, res);
      case 'PUT':
        return handlePut(resource, urlParts, req, res);
      case 'DELETE':
        return handleDelete(resource, urlParts, res);
      default:
        return respondWithNotFound(res);
    }
  });

  const workerId = cluster.worker?.id ?? 1;
  server.listen(PORT + (workerId - 1), () => {
    console.log(`Worker ${cluster.worker?.id} running on port ${PORT + (workerId! - 1)}`);
  });
}

function respondWithNotFound(response: ServerResponse) {
  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: "Oops.. your request doesn't exist or not supported, try again!" }));
}

function handleGet(resource: string, urlParts: string[], response: ServerResponse) {
  if (resource === 'users') {
    if (urlParts.length === 3) {
      return getUsers(response);
    } else if (urlParts.length === 4) {
      return getUserById(urlParts[3], response);
    }
  }
  return respondWithNotFound(response);
}

function handlePost(resource: string, request: IncomingMessage, response: ServerResponse) {
  if (resource === 'users') {
    return createNewUser(request, response);
  }
  return respondWithNotFound(response);
}

function handlePut(resource: string, urlParts: string[], request: IncomingMessage, response: ServerResponse) {
  if (resource === 'users' && urlParts.length === 4) {
    return updateUser(urlParts[3], request, response);
  }
  return respondWithNotFound(response);
}

function handleDelete(resource: string, urlParts: string[], response: ServerResponse) {
  if (resource === 'users' && urlParts.length === 4) {
    return deleteUser(urlParts[3], response);
  }
  return respondWithNotFound(response);
}

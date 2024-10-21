import { v4 as uuidv4 } from "uuid";
import http from "http";
import { parseRequestBody } from "../utils";

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

const users: User[] = [];

const createUser = (username: string, age: number, hobbies: string[]): User  => {
  const newUser: User = {
    id: uuidv4(),
    username,
    age,
    hobbies,
  };
  users.push(newUser);
  return newUser;
}

const createNewUser = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const body = await parseRequestBody(req);

    if (!body.username || !body.age || !body.hobbies) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Invalid request body",
        }),
      );
      return;
    }

    const newUser = createUser(body.username, body.age, body.hobbies);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(newUser));
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid request" }));

  }
};


export {createNewUser, users, User};
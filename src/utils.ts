import http from "http";
import { User } from "./users/create";

export const parseRequestBody = async (request: http.IncomingMessage): Promise<any> => {
  let body = '';

  return new Promise((resolve, reject) => {
    request.on('data', (chunk) => {
      body += chunk.toString();
    });

    request.on('end', () => {
      try {
        const parsedBody = JSON.parse(body);
        resolve(parsedBody);
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });

    request.on('error', (error) => {
      reject(new Error('Error reading request body: ' + error.message));
    });
  });
};

export function validateUserData(data: any): data is User {
  const hasRequiredFields = (data: any): data is User =>
    typeof data.username === "string" &&
    typeof data.age === "number" && data.age > 0 &&
    Array.isArray(data.hobbies) &&
    data.hobbies.every((hobby: any) => typeof hobby === "string");

  return (
    typeof data === "object" &&
    data !== null &&
    Object.keys(data).length === 3 &&
    hasRequiredFields(data)
  );
}

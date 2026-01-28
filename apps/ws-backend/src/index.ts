
import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db/client';


const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string,
  userName?: string
}

const users: User[] = [];

function checkUser(token: string): { userId: string; userName?: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return { userId: decoded.userId, userName: (decoded as { userName?: string }).userName };
  } catch (e) {
    return null;
  }
}


wss.on('connection', function connection(ws, request) {
  const url = request.url;

  if (!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";

  const userInfo = checkUser(token);

  if (userInfo == null) {
    ws.close()
    return;
  }

  const { userId, userName } = userInfo;

  users.push({
    userId,
    userName,
    rooms: [],
    ws
  })

  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      if (user) {
        user.rooms.push(parsedData.roomId);

        // Broadcast presence to room members
        const roomUsers = users.filter(u => u.rooms.includes(parsedData.roomId) && u.ws !== ws);
        const presenceList = users
          .filter(u => u.rooms.includes(parsedData.roomId))
          .map(u => ({ odId: u.userId, name: u.userName }));

        // Notify others about new user
        roomUsers.forEach(u => {
          u.ws.send(JSON.stringify({
            type: "user_joined",
            userId: user.userId,
            userName: user.userName,
            users: presenceList
          }));
        });

        // Send current users to the new user
        ws.send(JSON.stringify({
          type: "presence",
          users: presenceList
        }));
      }
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }

      user.rooms = user.rooms.filter(x => x !== parsedData.roomId);

      // Notify others about user leaving
      const roomUsers = users.filter(u => u.rooms.includes(parsedData.roomId));
      roomUsers.forEach(u => {
        u.ws.send(JSON.stringify({
          type: "user_left",
          odId: user.userId,
          userName: user.userName
        }));
      });
    }

    if (parsedData.type === "chat") {
      const roomSlug = parsedData.roomId;
      const message = parsedData.message;

      // Lookup the actual room by slug to get the integer ID
      const room = await prismaClient.room.findFirst({
        where: { slug: roomSlug }
      });

      if (!room) {
        ws.send(JSON.stringify({
          type: "error",
          message: "Room not found"
        }));
        return;
      }

      // Parse shape data from message
      try {
        const messageData = JSON.parse(message);
        const shape = messageData.shape;

        if (shape) {
          // Save shape to Shape table
          if (shape.type === "rect") {
            await prismaClient.shape.create({
              data: {
                roomId: room.id,
                type: "rect",
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height
              }
            });
          } else if (shape.type === "circle") {
            await prismaClient.shape.create({
              data: {
                roomId: room.id,
                type: "circle",
                x: shape.centerX,
                y: shape.centerY,
                radius: shape.radius
              }
            });
          } else if (shape.type === "pencil") {
            await prismaClient.shape.create({
              data: {
                roomId: room.id,
                type: "pencil",
                x: shape.startX,
                y: shape.startY,
                points: JSON.stringify({ endX: shape.endX, endY: shape.endY })
              }
            });
          }
        }
      } catch (e) {
        console.error("Error parsing shape data:", e);
      }

      // Broadcast to room members
      users.forEach(user => {
        if (user.rooms.includes(roomSlug)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message: message,
            roomId: roomSlug
          }))
        }
      })
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    const userIndex = users.findIndex(u => u.ws === ws);
    if (userIndex !== -1) {
      const user = users[userIndex];
      if (user) {
        // Notify rooms about user leaving
        user.rooms.forEach(roomId => {
          const roomUsers = users.filter(u => u.rooms.includes(roomId) && u.ws !== ws);
          roomUsers.forEach(u => {
            u.ws.send(JSON.stringify({
              type: "user_left",
              userId: user.userId,
              userName: user.userName
            }));
          });
        });
      }
      users.splice(userIndex, 1);
    }
  });

});

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
  } catch {
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

    // Handle cursor position updates
    if (parsedData.type === "cursor_update") {
      const user = users.find(x => x.ws === ws);
      if (!user) return;

      const roomId = parsedData.roomId;

      // Broadcast cursor position to all other users in the room
      users.forEach(u => {
        if (u.rooms.includes(roomId) && u.ws !== ws) {
          u.ws.send(JSON.stringify({
            type: "cursor_update",
            userId: user.userId,
            userName: user.userName,
            x: parsedData.x,
            y: parsedData.y
          }));
        }
      });
    }

    // Handle drawing status updates
    if (parsedData.type === "drawing_status") {
      const user = users.find(x => x.ws === ws);
      if (!user) return;

      const roomId = parsedData.roomId;

      // Broadcast drawing status to all other users in the room
      users.forEach(u => {
        if (u.rooms.includes(roomId) && u.ws !== ws) {
          u.ws.send(JSON.stringify({
            type: "drawing_status",
            userId: user.userId,
            userName: user.userName,
            isDrawing: parsedData.isDrawing
          }));
        }
      });
    }

    // Handle shape updates (dragging, position changes)
    if (parsedData.type === "shape_update") {
      const shape = parsedData.shape;
      const roomSlug = parsedData.roomId;

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

      // Update shape in database
      if (shape && shape.id) {
        try {
          const updateData: Record<string, number | string | null> = {};

          if (shape.type === "rect") {
            updateData.x = shape.x;
            updateData.y = shape.y;
            updateData.width = shape.width;
            updateData.height = shape.height;
          } else if (shape.type === "circle") {
            updateData.x = shape.centerX;
            updateData.y = shape.centerY;
            updateData.radius = shape.radius;
          } else if (shape.type === "pencil") {
            // For pencil, store first point as x,y and all points in JSON
            updateData.x = shape.points?.[0] || 0;
            updateData.y = shape.points?.[1] || 0;
            updateData.points = JSON.stringify(shape.points || []);
          } else if (shape.type === "text") {
            updateData.x = shape.x;
            updateData.y = shape.y;
            updateData.points = JSON.stringify({
              content: shape.content,
              fontSize: shape.fontSize
            });
          }

          await prismaClient.shape.updateMany({
            where: {
              uid: shape.id,
              roomId: room.id
            },
            data: updateData
          });
        } catch (e) {
          console.error("Error updating shape:", e);
        }
      }

      // Broadcast update to other users in the room
      users.forEach(u => {
        if (u.rooms.includes(roomSlug) && u.ws !== ws) {
          u.ws.send(JSON.stringify({
            type: "shape_update",
            shape
          }));
        }
      });
    }

    // Handle shape deletion
    if (parsedData.type === "shape_delete") {
      const shapeId = parsedData.shapeId;
      const roomSlug = parsedData.roomId;

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

      // Delete shape from database
      if (shapeId) {
        try {
          await prismaClient.shape.deleteMany({
            where: {
              uid: shapeId,
              roomId: room.id
            }
          });
        } catch (e) {
          console.error("Error deleting shape:", e);
        }
      }

      // Broadcast deletion to other users in the room
      users.forEach(u => {
        if (u.rooms.includes(roomSlug) && u.ws !== ws) {
          u.ws.send(JSON.stringify({
            type: "shape_delete",
            shapeId
          }));
        }
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

        // Handle shape deletion via chat message (legacy support)
        if (messageData.deleteShape) {
          const shapeId = messageData.deleteShape;
          try {
            await prismaClient.shape.deleteMany({
              where: {
                uid: shapeId,
                roomId: room.id
              }
            });
          } catch (e) {
            console.error("Error deleting shape:", e);
          }
        }

        const shape = messageData.shape;

        if (shape) {
          // Save shape to Shape table with client-generated uid
          const shapeUid = shape.id || null;

          if (shape.type === "rect") {
            await prismaClient.shape.create({
              data: {
                roomId: room.id,
                uid: shapeUid,
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
                uid: shapeUid,
                type: "circle",
                x: shape.centerX,
                y: shape.centerY,
                radius: shape.radius
              }
            });
          } else if (shape.type === "pencil") {
            // Store pencil with points array
            await prismaClient.shape.create({
              data: {
                roomId: room.id,
                uid: shapeUid,
                type: "pencil",
                x: shape.points?.[0] || 0,
                y: shape.points?.[1] || 0,
                points: JSON.stringify(shape.points || [])
              }
            });
          } else if (shape.type === "text") {
            // Store text shape
            await prismaClient.shape.create({
              data: {
                roomId: room.id,
                uid: shapeUid,
                type: "text",
                x: shape.x,
                y: shape.y,
                points: JSON.stringify({
                  content: shape.content,
                  fontSize: shape.fontSize
                })
              }
            });
          }
        }
      } catch (e) {
        console.error("Error parsing shape data:", e);
      }

      // Broadcast to room members EXCEPT the sender
      users.forEach(user => {
        if (user.rooms.includes(roomSlug) && user.ws !== ws) {
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
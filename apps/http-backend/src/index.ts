import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post('/signup', async (req: Request, res: Response) => {
  //db call

  const parsedData = CreateUserSchema.safeParse(req.body);

  if (!parsedData.success) {
    console.log(parsedData.error);

    res.json({
      message: "Incorrect inputs"
    })
    return;
  }
  try {
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data?.username,
        password: hashedPassword,
        name: parsedData.data.name
      }
    })
    res.json({
      userId: user.id
    })
  } catch (e) {
    res.status(411).json({
      message: "User already exists with this username"
    })
  }
})

app.post('/signin', async (req: Request, res: Response) => {

  const parsedData = SigninSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.json({
      message: "Incorrect inputs"
    })
    return;
  }

  // Find user by email first
  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username
    }
  })

  if (!user) {
    res.status(403).json({
      message: "Not Authorized"
    })
    return;
  }

  // Compare hashed password
  const isValidPassword = await bcrypt.compare(parsedData.data.password, user.password);

  if (!isValidPassword) {
    res.status(403).json({
      message: "Not Authorized"
    })
    return;
  }

  const token = jwt.sign({
    userId: user.id
  }, JWT_SECRET);

  res.json({
    token
  })
})

app.post('/room', middleware, async (req: Request, res: Response) => {

  const parsedData = CreateRoomSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.json({
      message: "Incorrect inputs"
    })
    return;
  }

  // @ts-ignore : Fix this 
  const userId = req.userId;
  //db call

  console.log("User ID:", userId);
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        title: parsedData.data.title || "Untitled",
        adminId: userId
      }
    })

    res.json({
      roomId: room.id,
      slug: room.slug
    })

  } catch (e) {
    res.status(411).json({
      message: "Room already exist with this name."
    })
  }
})


app.get("/chats/:roomId", async (req, res) => {
  try {
    const roomSlug = req.params.roomId;
    console.log("Looking up room by slug:", roomSlug);

    // Lookup the actual room by slug to get the integer ID
    const room = await prismaClient.room.findFirst({
      where: { slug: roomSlug }
    });

    if (!room) {
      res.status(404).json({
        message: "Room not found",
        messages: []
      });
      return;
    }

    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: room.id
      },
      orderBy: {
        id: "desc"
      },
      take: 1000
    });

    res.json({
      messages
    })

  } catch (e) {
    console.log(e);
    res.json({
      messages: []
    })
  }
})


app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: {
      slug
    }
  });

  res.json({
    room
  })
})

// Get user's rooms (authenticated)
app.get("/rooms", middleware, async (req: Request, res: Response) => {
  try {
    // @ts-ignore : Fix this
    const userId = req.userId;

    const rooms = await prismaClient.room.findMany({
      where: {
        adminId: userId
      },
      orderBy: {
        createAt: "desc"
      },
      take: 20
    });

    res.json({
      rooms
    })
  } catch (e) {
    console.log(e);
    res.json({
      rooms: []
    })
  }
})

// Get shapes for a room by slug
app.get("/shapes/:roomSlug", async (req, res) => {
  try {
    const roomSlug = req.params.roomSlug;

    const room = await prismaClient.room.findFirst({
      where: { slug: roomSlug }
    });

    if (!room) {
      res.status(404).json({
        message: "Room not found",
        shapes: []
      });
      return;
    }

    const shapes = await prismaClient.shape.findMany({
      where: {
        roomId: room.id
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    res.json({
      shapes
    })
  } catch (e) {
    console.log(e);
    res.json({
      shapes: []
    })
  }
})

app.listen(3001);
import { HTTP_BACKEND } from "@/config";
import axios from "axios";

// Shape from database
interface DBShape {
    id: number;
    uid?: string; // Client-generated UUID
    roomId: number;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    color?: string;
    points?: string;
}

// Frontend Shape format - matching Game.ts
type RectShape = {
    id: string;
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
};

type CircleShape = {
    id: string;
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
};

type PencilShape = {
    id: string;
    type: "pencil";
    points: number[]; // [x1, y1, x2, y2, ...]
};

type TextShape = {
    id: string;
    type: "text";
    x: number;
    y: number;
    content: string;
    fontSize: number;
};

type Shape = RectShape | CircleShape | PencilShape | TextShape;

export async function getExistingShapes(roomId: string): Promise<Shape[]> {
    try {
        // Try new shapes endpoint first
        const res = await axios.get(`${HTTP_BACKEND}/shapes/${roomId}`);
        const dbShapes: DBShape[] = res.data.shapes || [];

        // Convert DB shapes to frontend format with unique IDs
        return dbShapes
            .map((dbShape): Shape | null => {
                const id = dbShape.uid || `db-${dbShape.id}`;

                if (dbShape.type === "rect") {
                    return {
                        id,
                        type: "rect" as const,
                        x: dbShape.x,
                        y: dbShape.y,
                        width: dbShape.width || 0,
                        height: dbShape.height || 0,
                    };
                } else if (dbShape.type === "circle") {
                    return {
                        id,
                        type: "circle" as const,
                        centerX: dbShape.x,
                        centerY: dbShape.y,
                        radius: dbShape.radius || 0,
                    };
                } else if (dbShape.type === "pencil") {
                    // Parse points from JSON string
                    let points: number[] = [];
                    if (dbShape.points) {
                        try {
                            const parsed = JSON.parse(dbShape.points);
                            if (Array.isArray(parsed)) {
                                // New format: array of coordinates
                                points = parsed;
                            } else if (parsed.endX !== undefined && parsed.endY !== undefined) {
                                // Old format: { endX, endY } - convert to points array
                                points = [dbShape.x, dbShape.y, parsed.endX, parsed.endY];
                            }
                        } catch {
                            points = [];
                        }
                    }
                    return {
                        id,
                        type: "pencil" as const,
                        points,
                    };
                } else if (dbShape.type === "text") {
                    // Parse text data from points JSON string
                    let content = "";
                    let fontSize = 16;
                    if (dbShape.points) {
                        try {
                            const parsed = JSON.parse(dbShape.points);
                            content = parsed.content || "";
                            fontSize = parsed.fontSize || 16;
                        } catch {
                            content = "";
                        }
                    }
                    return {
                        id,
                        type: "text" as const,
                        x: dbShape.x,
                        y: dbShape.y,
                        content,
                        fontSize,
                    };
                }

                // Unknown type - skip
                return null;
            })
            .filter((shape): shape is Shape => shape !== null);
    } catch (error) {
        console.error("Error fetching shapes:", error);

        // Fallback to old chat endpoint for backwards compatibility
        try {
            const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
            const messages = res.data.messages || [];

            const shapes = messages
                .map((x: { message: string }) => {
                    try {
                        const messageData = JSON.parse(x.message);
                        const shape = messageData.shape;

                        // Handle legacy pencil format
                        if (shape && shape.type === "pencil" && !shape.points) {
                            return {
                                ...shape,
                                points: [shape.startX, shape.startY, shape.endX, shape.endY],
                            };
                        }
                        return shape;
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);

            return shapes;
        } catch {
            return [];
        }
    }
}
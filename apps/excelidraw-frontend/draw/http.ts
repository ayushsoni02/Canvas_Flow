import { HTTP_BACKEND } from "@/config";
import axios from "axios";

// Shape from database
interface DBShape {
    id: number;
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

// Frontend Shape format
type Shape =
    | {
        type: "rect";
        x: number;
        y: number;
        width: number;
        height: number;
    }
    | {
        type: "circle";
        centerX: number;
        centerY: number;
        radius: number;
    }
    | {
        type: "pencil";
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    };

export async function getExistingShapes(roomId: string): Promise<Shape[]> {
    try {
        // Try new shapes endpoint first
        const res = await axios.get(`${HTTP_BACKEND}/shapes/${roomId}`);
        const dbShapes: DBShape[] = res.data.shapes || [];

        // Convert DB shapes to frontend format
        return dbShapes.map((dbShape) => {
            if (dbShape.type === "rect") {
                return {
                    type: "rect" as const,
                    x: dbShape.x,
                    y: dbShape.y,
                    width: dbShape.width || 0,
                    height: dbShape.height || 0,
                };
            } else if (dbShape.type === "circle") {
                return {
                    type: "circle" as const,
                    centerX: dbShape.x,
                    centerY: dbShape.y,
                    radius: dbShape.radius || 0,
                };
            } else if (dbShape.type === "pencil") {
                const points = dbShape.points ? JSON.parse(dbShape.points) : {};
                return {
                    type: "pencil" as const,
                    startX: dbShape.x,
                    startY: dbShape.y,
                    endX: points.endX || 0,
                    endY: points.endY || 0,
                };
            }
            // Default fallback
            return {
                type: "rect" as const,
                x: dbShape.x,
                y: dbShape.y,
                width: 0,
                height: 0,
            };
        });
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
                        return messageData.shape;
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
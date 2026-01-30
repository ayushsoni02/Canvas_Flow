import type { Tool } from "@/components/ToolDock";
import { getExistingShapes } from "./http";

// Shape types with pencil paths as coordinate arrays
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

export type Shape = RectShape | CircleShape | PencilShape | TextShape;

interface ShapeBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private shapesMap: Map<string, Shape>;
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "pencil";
    private isDrawing = false;

    // Selection state
    private selectedShapeId: string | null = null;
    private isDragging = false;
    private dragOffsetX = 0;
    private dragOffsetY = 0;

    // Pencil path state
    private currentPencilPoints: number[] = [];

    // Text input state
    private textInputElement: HTMLInputElement | null = null;
    private pendingTextX = 0;
    private pendingTextY = 0;

    // Eraser continuous mode
    private isErasing = false;

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.shapesMap = new Map();
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.removeTextInput();
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
        // Deselect when switching tools
        if (tool !== "select") {
            this.selectedShapeId = null;
            this.clearCanvas();
        }
        // Remove text input when switching away from text tool
        if (tool !== "text") {
            this.removeTextInput();
        }
    }

    async init() {
        const shapes = await getExistingShapes(this.roomId);
        // Populate Map with fetched shapes
        for (const shape of shapes) {
            this.shapesMap.set(shape.id, shape);
        }
        console.log("Loaded shapes:", this.shapesMap.size);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message);

                // Handle shape deletion
                if (parsedShape.deleteShape) {
                    if (this.shapesMap.has(parsedShape.deleteShape)) {
                        this.shapesMap.delete(parsedShape.deleteShape);
                        if (this.selectedShapeId === parsedShape.deleteShape) {
                            this.selectedShapeId = null;
                        }
                        this.clearCanvas();
                    }
                    return;
                }

                const shape = parsedShape.shape as Shape;
                // Skip if shape already exists (prevents duplicate from echo)
                if (shape && shape.id && !this.shapesMap.has(shape.id)) {
                    this.shapesMap.set(shape.id, shape);
                    this.clearCanvas();
                }
            } else if (message.type === "shape_update") {
                // Handle shape update from other users
                const shape = message.shape as Shape;
                if (shape && shape.id) {
                    this.shapesMap.set(shape.id, shape);
                    this.clearCanvas();
                }
            } else if (message.type === "shape_delete") {
                // Handle shape deletion from other users
                const shapeId = message.shapeId;
                if (shapeId && this.shapesMap.has(shapeId)) {
                    this.shapesMap.delete(shapeId);
                    if (this.selectedShapeId === shapeId) {
                        this.selectedShapeId = null;
                    }
                    this.clearCanvas();
                }
            }
        };
    }

    // ==================== RENDERING ====================

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Dark transparent background to let grid dots show through
        this.ctx.fillStyle = "rgba(2, 6, 23, 0.95)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all shapes
        for (const shape of this.shapesMap.values()) {
            this.drawShape(shape);
        }

        // Draw selection box if a shape is selected
        if (this.selectedShapeId) {
            const selectedShape = this.shapesMap.get(this.selectedShapeId);
            if (selectedShape) {
                this.drawSelectionBox(selectedShape);
            }
        }
    }

    private drawShape(shape: Shape) {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        this.ctx.lineWidth = 2;

        if (shape.type === "rect") {
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
            this.ctx.beginPath();
            this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        } else if (shape.type === "pencil") {
            this.drawPencilPath(shape.points);
        } else if (shape.type === "text") {
            this.ctx.font = `${shape.fontSize}px Inter, sans-serif`;
            this.ctx.fillText(shape.content, shape.x, shape.y);
        }
    }

    private drawPencilPath(points: number[]) {
        if (points.length < 4) return;

        this.ctx.beginPath();
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.moveTo(points[0]!, points[1]!);

        // Draw smooth curve through points
        for (let i = 2; i < points.length; i += 2) {
            this.ctx.lineTo(points[i]!, points[i + 1]!);
        }

        this.ctx.stroke();
        this.ctx.closePath();
    }

    private drawSelectionBox(shape: Shape) {
        const bounds = this.getShapeBounds(shape);
        const padding = 8;

        this.ctx.save();

        // Dashed border
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = "rgba(139, 92, 246, 1)";
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(
            bounds.x - padding,
            bounds.y - padding,
            bounds.width + padding * 2,
            bounds.height + padding * 2
        );

        // Corner handles
        const handleSize = 8;
        const corners = [
            [bounds.x - padding, bounds.y - padding],
            [bounds.x + bounds.width + padding, bounds.y - padding],
            [bounds.x - padding, bounds.y + bounds.height + padding],
            [bounds.x + bounds.width + padding, bounds.y + bounds.height + padding],
        ];

        this.ctx.setLineDash([]);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "rgba(139, 92, 246, 1)";
        this.ctx.lineWidth = 2;

        for (const [cx, cy] of corners) {
            this.ctx.beginPath();
            this.ctx.arc(cx!, cy!, handleSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.closePath();
        }

        this.ctx.restore();
    }

    // ==================== HIT TESTING ====================

    private getShapeBounds(shape: Shape): ShapeBounds {
        if (shape.type === "rect") {
            return {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
            };
        } else if (shape.type === "circle") {
            return {
                x: shape.centerX - Math.abs(shape.radius),
                y: shape.centerY - Math.abs(shape.radius),
                width: Math.abs(shape.radius) * 2,
                height: Math.abs(shape.radius) * 2,
            };
        } else if (shape.type === "pencil") {
            return this.getPencilBounds(shape.points);
        } else if (shape.type === "text") {
            // Approximate text bounds
            this.ctx.font = `${shape.fontSize}px Inter, sans-serif`;
            const metrics = this.ctx.measureText(shape.content);
            return {
                x: shape.x,
                y: shape.y - shape.fontSize,
                width: metrics.width,
                height: shape.fontSize * 1.2,
            };
        }
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    private getPencilBounds(points: number[]): ShapeBounds {
        if (points.length < 2) return { x: 0, y: 0, width: 0, height: 0 };

        let minX = points[0]!;
        let maxX = points[0]!;
        let minY = points[1]!;
        let maxY = points[1]!;

        for (let i = 0; i < points.length; i += 2) {
            const x = points[i]!;
            const y = points[i + 1]!;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }

    private hitTest(x: number, y: number): Shape | null {
        const tolerance = 10;

        // Iterate in reverse to select top-most shape first
        const shapes = Array.from(this.shapesMap.values()).reverse();

        for (const shape of shapes) {
            if (this.isPointInShape(x, y, shape, tolerance)) {
                return shape;
            }
        }
        return null;
    }

    private isPointInShape(x: number, y: number, shape: Shape, tolerance: number): boolean {
        if (shape.type === "rect") {
            return this.isPointInRect(x, y, shape, tolerance);
        } else if (shape.type === "circle") {
            return this.isPointInCircle(x, y, shape, tolerance);
        } else if (shape.type === "pencil") {
            return this.isPointNearPencilPath(x, y, shape.points, tolerance);
        } else if (shape.type === "text") {
            const bounds = this.getShapeBounds(shape);
            return (
                x >= bounds.x - tolerance &&
                x <= bounds.x + bounds.width + tolerance &&
                y >= bounds.y - tolerance &&
                y <= bounds.y + bounds.height + tolerance
            );
        }
        return false;
    }

    private isPointInRect(x: number, y: number, shape: RectShape, tolerance: number): boolean {
        // Check if point is on the rectangle border OR inside
        const insideX = x >= shape.x - tolerance && x <= shape.x + shape.width + tolerance;
        const insideY = y >= shape.y - tolerance && y <= shape.y + shape.height + tolerance;
        return insideX && insideY;
    }

    private isPointInCircle(x: number, y: number, shape: CircleShape, tolerance: number): boolean {
        const dist = Math.sqrt(Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2));
        return dist <= Math.abs(shape.radius) + tolerance;
    }

    private isPointNearPencilPath(x: number, y: number, points: number[], tolerance: number): boolean {
        if (points.length < 4) return false;

        for (let i = 0; i < points.length - 2; i += 2) {
            const x1 = points[i]!;
            const y1 = points[i + 1]!;
            const x2 = points[i + 2]!;
            const y2 = points[i + 3]!;

            const dist = this.pointToLineDistance(x, y, x1, y1, x2, y2);
            if (dist < tolerance) {
                return true;
            }
        }
        return false;
    }

    private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // ==================== SHAPE MANIPULATION ====================

    private moveShape(shape: Shape, dx: number, dy: number): Shape {
        if (shape.type === "rect") {
            return { ...shape, x: shape.x + dx, y: shape.y + dy };
        } else if (shape.type === "circle") {
            return { ...shape, centerX: shape.centerX + dx, centerY: shape.centerY + dy };
        } else if (shape.type === "pencil") {
            const newPoints = shape.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy));
            return { ...shape, points: newPoints };
        } else if (shape.type === "text") {
            return { ...shape, x: shape.x + dx, y: shape.y + dy };
        }
        return shape;
    }

    private getShapeCenter(shape: Shape): { x: number; y: number } {
        const bounds = this.getShapeBounds(shape);
        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        };
    }

    // ==================== BROADCASTING ====================

    private broadcastDrawingStatus(isDrawing: boolean) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
                JSON.stringify({
                    type: "drawing_status",
                    roomId: this.roomId,
                    isDrawing,
                })
            );
        }
    }

    private broadcastShapeCreate(shape: Shape) {
        this.socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId: this.roomId,
            })
        );
    }

    private broadcastShapeUpdate(shape: Shape) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
                JSON.stringify({
                    type: "shape_update",
                    roomId: this.roomId,
                    shape,
                })
            );
        }
    }

    private broadcastShapeDelete(shapeId: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
                JSON.stringify({
                    type: "shape_delete",
                    roomId: this.roomId,
                    shapeId,
                })
            );
            // Also send via chat for legacy compatibility
            this.socket.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({ deleteShape: shapeId }),
                    roomId: this.roomId,
                })
            );
        }
    }

    // ==================== ERASER ====================

    private handleErase(x: number, y: number) {
        const hitShape = this.hitTest(x, y);
        if (hitShape) {
            this.shapesMap.delete(hitShape.id);
            this.broadcastShapeDelete(hitShape.id);
            if (this.selectedShapeId === hitShape.id) {
                this.selectedShapeId = null;
            }
            this.clearCanvas();
        }
    }

    // ==================== TEXT INPUT ====================

    private createTextInput(x: number, y: number) {
        this.removeTextInput();

        const input = document.createElement("input");
        input.type = "text";
        input.style.position = "fixed";
        input.style.left = `${x}px`;
        input.style.top = `${y - 20}px`;
        input.style.fontSize = "16px";
        input.style.fontFamily = "Inter, sans-serif";
        input.style.background = "rgba(30, 41, 59, 0.95)";
        input.style.border = "2px solid rgba(139, 92, 246, 0.8)";
        input.style.borderRadius = "6px";
        input.style.padding = "8px 12px";
        input.style.color = "white";
        input.style.outline = "none";
        input.style.minWidth = "150px";
        input.style.zIndex = "1000";

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.finalizeTextInput();
            } else if (e.key === "Escape") {
                this.removeTextInput();
            }
        });

        input.addEventListener("blur", () => {
            this.finalizeTextInput();
        });

        document.body.appendChild(input);
        input.focus();

        this.textInputElement = input;
        this.pendingTextX = x;
        this.pendingTextY = y;
    }

    private finalizeTextInput() {
        if (!this.textInputElement) return;

        const content = this.textInputElement.value.trim();
        if (content) {
            const shapeId = crypto.randomUUID();
            const textShape: TextShape = {
                id: shapeId,
                type: "text",
                x: this.pendingTextX,
                y: this.pendingTextY,
                content,
                fontSize: 16,
            };

            this.shapesMap.set(shapeId, textShape);
            this.broadcastShapeCreate(textShape);
            this.clearCanvas();
        }

        this.removeTextInput();
    }

    private removeTextInput() {
        if (this.textInputElement) {
            this.textInputElement.remove();
            this.textInputElement = null;
        }
    }

    // ==================== MOUSE HANDLERS ====================

    mouseDownHandler = (e: MouseEvent): void => {
        const x = e.clientX;
        const y = e.clientY;

        // Handle select tool
        if (this.selectedTool === "select") {
            const hitShape = this.hitTest(x, y);
            if (hitShape) {
                this.selectedShapeId = hitShape.id;
                this.isDragging = true;
                const center = this.getShapeCenter(hitShape);
                this.dragOffsetX = x - center.x;
                this.dragOffsetY = y - center.y;
            } else {
                this.selectedShapeId = null;
            }
            this.clearCanvas();
            return;
        }

        // Handle text tool
        if (this.selectedTool === "text") {
            this.createTextInput(x, y);
            return;
        }

        // Handle eraser
        if (this.selectedTool === "eraser") {
            this.isErasing = true;
            this.handleErase(x, y);
            return;
        }

        // Handle drawing tools
        this.clicked = true;
        this.startX = x;
        this.startY = y;

        // Initialize pencil path
        if (this.selectedTool === "pencil") {
            this.currentPencilPoints = [x, y];
        }

        // Broadcast that user started drawing
        if (!this.isDrawing) {
            this.isDrawing = true;
            this.broadcastDrawingStatus(true);
        }
    };

    mouseUpHandler = (e: MouseEvent): void => {
        const x = e.clientX;
        const y = e.clientY;

        // Handle select tool drag end
        if (this.selectedTool === "select") {
            if (this.isDragging && this.selectedShapeId) {
                const shape = this.shapesMap.get(this.selectedShapeId);
                if (shape) {
                    this.broadcastShapeUpdate(shape);
                }
            }
            this.isDragging = false;
            return;
        }

        // Handle eraser
        if (this.selectedTool === "eraser") {
            this.isErasing = false;
            return;
        }

        if (!this.clicked) return;

        this.clicked = false;
        const shapeId = crypto.randomUUID();
        let shape: Shape | null = null;

        if (this.selectedTool === "rect") {
            const width = x - this.startX;
            const height = y - this.startY;
            shape = {
                id: shapeId,
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
            };
        } else if (this.selectedTool === "circle") {
            const width = x - this.startX;
            const height = y - this.startY;
            const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
            shape = {
                id: shapeId,
                type: "circle",
                radius: radius,
                centerX: this.startX + radius * Math.sign(width || 1),
                centerY: this.startY + radius * Math.sign(height || 1),
            };
        } else if (this.selectedTool === "pencil") {
            // Add final point
            this.currentPencilPoints.push(x, y);
            shape = {
                id: shapeId,
                type: "pencil",
                points: [...this.currentPencilPoints],
            };
            this.currentPencilPoints = [];
        }

        if (!shape) {
            return;
        }

        // Add to Map immediately (prevents duplicate on echo)
        this.shapesMap.set(shape.id, shape);
        this.clearCanvas();
        this.broadcastShapeCreate(shape);

        // Broadcast that user stopped drawing
        if (this.isDrawing) {
            this.isDrawing = false;
            this.broadcastDrawingStatus(false);
        }
    };

    mouseMoveHandler = (e: MouseEvent): void => {
        const x = e.clientX;
        const y = e.clientY;

        // Handle select tool dragging
        if (this.selectedTool === "select" && this.isDragging && this.selectedShapeId) {
            const shape = this.shapesMap.get(this.selectedShapeId);
            if (shape) {
                const center = this.getShapeCenter(shape);
                const dx = x - this.dragOffsetX - center.x;
                const dy = y - this.dragOffsetY - center.y;
                const movedShape = this.moveShape(shape, dx, dy);
                this.shapesMap.set(this.selectedShapeId, movedShape);
                this.clearCanvas();
            }
            return;
        }

        // Handle eraser continuous mode
        if (this.selectedTool === "eraser" && this.isErasing) {
            this.handleErase(x, y);
            return;
        }

        // Handle drawing tools preview
        if (this.clicked) {
            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(139, 92, 246, 0.8)"; // Violet preview color
            this.ctx.lineWidth = 2;

            if (this.selectedTool === "rect") {
                const width = x - this.startX;
                const height = y - this.startY;
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (this.selectedTool === "circle") {
                const width = x - this.startX;
                const height = y - this.startY;
                const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
                const centerX = this.startX + radius * Math.sign(width || 1);
                const centerY = this.startY + radius * Math.sign(height || 1);
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.selectedTool === "pencil") {
                // Add point to path
                this.currentPencilPoints.push(x, y);
                // Draw current path
                this.drawPencilPath(this.currentPencilPoints);
            }
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}
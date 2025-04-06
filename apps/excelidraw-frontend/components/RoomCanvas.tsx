"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import  Canvas  from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYTIxMzZkMS04MjU2LTRkYTQtYmVmZi00OGJlZDRhMjU1ZTAiLCJpYXQiOjE3NDM5Mzc4MzZ9.T44r9jNOIMy9XqBLNiTj7JTRTuCYQdcXSRy6nR5ezgs`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}
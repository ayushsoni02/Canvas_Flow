import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket(){
    const [loading,setLoading] = useState(true);
    const [socket,setSocket] = useState<WebSocket>();

    useEffect(()=>{
       const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYTIxMzZkMS04MjU2LTRkYTQtYmVmZi00OGJlZDRhMjU1ZTAiLCJpYXQiOjE3NDM2NTcwNTh9.eu0tMj5A16xvlczOrds0Ly5mPDbIM1YbZfXFnEocY08`);
       ws.onopen = () => {  
        setLoading(false);
        setSocket(ws);
       }
    },[])

    return {
        socket,
        loading
    }
}
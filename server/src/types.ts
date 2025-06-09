export interface DrawEvent {
    userId: string,
    type: "begin" | "draw" | "end";
    x: number,
    y: number,
    color: string,
    width: string
};

export interface ChatMessage {
    userId: string,
    username: string,
    text: string,
    timestamp: number
};
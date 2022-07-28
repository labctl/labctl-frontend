import { defineStore } from "pinia";
// @ts-ignore
import { app } from "../main.js";

interface SocketStore {
  // Connection Status
  isConnected: boolean;
  // Message content
  message: string;
  // Reconnect error
  reconnectError: boolean;
  // Heartbeat message sending time
  heartBeatInterval: number;
  // Heartbeat timer
  heartBeatTimer: number;
}

export function wsSend(obj: Record<string, any>) {
  app.config.globalProperties.$socket.sendObj(obj);
}

export const useSocketStore = defineStore("socket", {
  state: (): SocketStore => ({
    // Connection Status
    isConnected: false,
    // Message content
    message: "",
    // Reconnect error
    reconnectError: false,
    // Heartbeat message sending time
    heartBeatInterval: 50000,
    // Heartbeat timer
    heartBeatTimer: 0,
  }),
  actions: {
    // Connection open
    SOCKET_ONOPEN(event: any) {
      console.log("open", event);
      app.config.globalProperties.$socket = event.currentTarget;
      this.isConnected = true;
      // When the connection is successful, start sending heartbeat messages regularly to avoid being disconnected by the server
      this.heartBeatTimer = window.setInterval(() => {
        const message = "Heartbeat message";
        this.isConnected &&
          wsSend({
            code: 200,
            msg: message,
          });
      }, this.heartBeatInterval);
    },
    // Connection closed
    SOCKET_ONCLOSE(event: any) {
      this.isConnected = false;
      // Stop the heartbeat message when the connection is closed
      window.clearInterval(this.heartBeatTimer);
      this.heartBeatTimer = 0;
      console.log("The line is disconnected: " + new Date());
      console.log(event);
    },
    // An error occurred
    SOCKET_ONERROR(event: any) {
      console.error(event);
    },
    // Receive the message sent by the server
    SOCKET_ONMESSAGE(message: any) {
      this.message = message;
    },
    // Auto reconnect
    SOCKET_RECONNECT(count: number) {
      console.info("Message system reconnecting...", count);
    },
    // Reconnect error
    SOCKET_RECONNECT_ERROR() {
      this.reconnectError = true;
    },
  },
});

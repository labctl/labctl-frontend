// These protocol enums are directly from webtty
// https://github.com/sorenisanerd/gotty/blob/master/webtty/message_types.go
export enum webttyTx {
  UnknownInput = "0", // Unknown message type, maybe sent by a bug
  Input = "1", // User input typically from a keyboard
  Ping = "2", // Ping to the server
  ResizeTerminal = "3", // Notify that the browser size has been changed
  SetEncoding = "4", // Change encoding
}

export enum webttyRx {
  UnknownOutput = "0", // Unknown message type, maybe set by a bug
  Output = "1", // Normal output to the terminal
  Pong = "2", // Pong to the browser
  SetWindowTitle = "3", // Set window title of the terminal
  SetPreferences = "4", // Set terminal preference
  SetReconnect = "5", // Make terminal to reconnect
  SetBufferSize = "6", // Set the input buffer size
}

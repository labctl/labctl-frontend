<template>
  <div>
    <div ref="terminal" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import { IDisposable, Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { Base64 } from "js-base64"
import { useWebSocket, useResizeObserver } from "@vueuse/core"
import { ws_uri } from "@/utils/const"
import { webttyRx, webttyTx } from "@/utils/webtty"

import "xterm/css/xterm.css"

interface PropDef {
  cmd: string
  connected: boolean
}
const props = withDefaults(defineProps<PropDef>(), { connected: true })
const emit = defineEmits(["update:connected"])

const terminal = ref()

const term = new Terminal({
  rows: 24,
  cols: 80,
  convertEol: true,
  scrollback: 10,
  disableStdin: false,
  fontSize: 14,
  cursorBlink: true,
  cursorStyle: "bar",
})
const fitAddon = new FitAddon()

const { status, data, close, send, open } = useWebSocket(ws_uri + "pty", {
  immediate: false,
})

watch(
  () => props.connected,
  (c: boolean) => {
    if (c == false && status.value !== "CLOSED") {
      close() // the websocket
      return
    }
    if (c && status.value === "CLOSED") {
      open()
      term.writeln(`\n$ \x1B[1;3;31m${props.cmd}\x1B[0m`)
    }
  }
)

watch(status, (value) => {
  if (value == "CLOSED") {
    termDispose.map((v) => v.dispose())
    termDispose.splice(0, termDispose.length)
    emit("update:connected", false)
    term.writeln(`\n\x1B[1;3;31mdisconnected\x1B[0m`)
  }
  if (value == "OPEN") {
    termAttach(props.cmd)
    emit("update:connected", true)
  }
})

watch(data, (val: string) => {
  const code = val.slice(0, 1)
  const data = Base64.decode(val.slice(1))
  switch (code) {
    case webttyRx.Output:
      term.write(data)
      return
  }
  console.log(`${code} rx: ${val}  decode: ${data}`)
})

const termDispose: IDisposable[] = []

function termAttach(cmd: string) {
  // Send connection parameters
  send(JSON.stringify({ cmd: cmd }))

  termDispose.push(
    term.onResize((size) => {
      send(
        webttyTx.ResizeTerminal +
          JSON.stringify({ Columns: size.cols, Rows: size.rows })
      )
      console.log("resize")
    })
  )

  const bufTime = 100
  let bufData = ""

  termDispose.push(
    term.onData((data) => {
      if (bufTime && bufTime > 0) {
        if (bufData.length > 0) {
          bufData += data
        } else {
          bufData = data
          setTimeout(() => {
            send(webttyTx.Input + bufData)
            if (bufData.length > 1) {
              console.log(`send ${bufData}`)
            }
            bufData = ""
          }, bufTime)
        }
      } else {
        send(webttyTx.Input + data)
      }
    })
  )

  // send heartbeat to avoid server closing webSocket (i.e. nginx)
  const heartBeatTimer = setInterval(function () {
    send(webttyTx.Ping)
  }, 20 * 1000)
  termDispose.push({
    dispose: () => {
      clearInterval(heartBeatTimer)
    },
  })
}

useResizeObserver(terminal, (el) => {
  console.debug("resize", el)
  fitAddon.fit()
})

onMounted(() => {
  open()
  term.open(terminal.value)
  term.loadAddon(fitAddon)
  term.writeln(`$ \x1B[1;3;31m${props.cmd}\x1B[0m`)
})

onBeforeUnmount(() => {
  close()
  if (term) {
    term.dispose()
  }
})
</script>

<style scoped></style>

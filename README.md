# Labctl frontend

The Labctl web frontend is a Single Page App (SPA) build with Node.js & included in the labctl command line utility.
It is the web interface used when you use [`labctl serve`](https://labctl.net/reference/serve).

The  frontend interacts with the go-based labctl backend using Websockets & http based calls.

The frontend was built using:

- [Vue 3](https://vuejs.org/) & [Vite](https://vitejs.dev/), using the composition API & script setup.
- The [Naive UI](https://www.naiveui.com/) componenent library.
- [v-network-graph](https://dash14.github.io/v-network-graph/) for network visualization.
- Websockets and other functions provided by [vueuse](https://vueuse.org/core/useWebSocket/).
- [xterm.js](http://xtermjs.org/) for web based terminals.

Github Actions will test, build and upload the frontend to the [labctl repo](https://github.com/labctl/labctl/tree/main/helpers/frontend/html).

## Testing the frontend locally

When the frontend opens it usually connects to the host and URL on which it was served,- this will not work while testing the frontend on localhost with vite.

For local testing you should point the fontend toward a running labctl server instance. This instance is defined in the **localhost** variable in Local Storage. You can change this in Web Tools: Application->Local Storage from the default, `https://tes4:8080/labctl`.

1. Clone the repo and install deps: `npm install`
2. Start the web server with `npm run dev` or `npx vite`
3. When the frontend runs on <http://localhost> it will try to connect to a server identified by the value of **localhost** in Local Storage

## Local unit tests

`npm test` or `npx vitest` for continuous testing during development

## Web API endpoints & Websocket messages

These are documented in the labctl main repo's README file - [labctl/labctl](https://github.com/labctl/labctl)

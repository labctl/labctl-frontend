<template>
  <div class="about">
    <h1>RFR - Feature Tracker</h1>
    <h3>User info</h3>
    <pre>{{ pretty(store.user) }}</pre>
    <n-button v-if="store.user.is_rplm" @click="remove_rplm">
      Remove is_rplm
    </n-button>
    <n-button v-if="store.user.is_ce" @click="remove_ce">
      Remove is_ce
    </n-button>
    <n-button v-if="store.user.mail != ''" @click="remove_login">
      Remove all login info
    </n-button>

    <h3>Server Options</h3>
    <n-table dense>
      <tr v-for="(val, key) in store.options" :key="key">
        <td valign="top">
          <b>{{ key }}</b>
        </td>
        <td>
          <pre>{{ pretty(val) }}</pre>
        </td>
      </tr>
    </n-table>
    <p align="right">Designed 2019 by Johann Kellerman, EMEA</p>
  </div>
</template>

<script setup lang="ts">
import {} from "vue";

import { NButton, NTable } from "naive-ui";

import { usemainStore } from "@/stores/mainStore";
const store = usemainStore();

function pretty(json: any) {
  return JSON.stringify(json, null, 4);
}

function remove_rplm() {
  store.user.is_rplm = false;
}

function remove_ce() {
  store.user.is_ce = false;
}

function remove_login() {
  store.user.is_ce = false;
  store.user.is_rplm = false;
  //store.user.is_token = false;
  store.user.mail = "";
  store.user.name = "";
}
</script>

<style>
tr:nth-child(even) {
  background: #ddd;
}
</style>

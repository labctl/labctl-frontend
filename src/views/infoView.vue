<template>
  <div class="about">
    <h1>Labctl</h1>
    <h3>Server Options</h3>
    <n-table dense>
      <tr v-for="(val, key) in store" :key="key">
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

import { NTable } from "naive-ui";

import { useMainStore } from "@/stores/mainStore";
const store = useMainStore();

function pretty(json: any) {
  return JSON.stringify(json, null, 4);
}
</script>

<style>
tr:nth-child(even) {
  background: #ddd;
}
</style>

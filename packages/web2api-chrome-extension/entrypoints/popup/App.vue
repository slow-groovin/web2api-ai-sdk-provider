<script lang="ts" setup>
import Panel from '../page/Panel.vue';
async function openOption() {
  browser.runtime.openOptionsPage();
}
</script>

<template>
  <div style="width: 100%;">
    <button @click="openOption" class="btn">open in tab</button>

  </div>
  <Panel />
</template>

<style scoped>
.btn {
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  float: right;
}

.btn:hover {
  background-color: #0056b3;
}
</style>

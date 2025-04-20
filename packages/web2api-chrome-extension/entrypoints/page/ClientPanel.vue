<script setup lang="ts">
import { useProvider } from './provider-manage';

const { states, apply, isModified, setModelEnabled, refreshProviderModels } = useProvider()
const emit = defineEmits<{
  (e: 'afterApply'): void
}>()

</script>
<template>
  <div :class="{ modified: isModified }">
    <div v-for="(provider, providerKey) in states" :key="providerKey" class="provider">
      <div class="provider-header">
        <h4>{{ provider.name }}</h4>
        <div class="provider-actions">
          <button @click="() => {
            refreshProviderModels(providerKey)
          }" class="refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M12 20q-3.35 0-5.675-2.325T4 12t2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12t1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20" />
            </svg>
          </button>
          <label class="enable-label">
            <input type="checkbox" :checked="provider.models.every(model => model.enabled)" @change="(e) => {
              const isChecked = (e.target as HTMLInputElement).checked;
              provider.models.forEach(model => {
                setModelEnabled(providerKey, model.name, isChecked);
              });
            }" /><span class="checkbox-custom"></span>
          </label>
        </div>
      </div>
      <ul>
        <li v-for="(model, modelIndex) in provider.models" :key="modelIndex" class="model">
          <span class="model-name" :data-enabled="model.enabled">{{ model.name }}</span>
          <label class="enable-label">
            <input type="checkbox" :checked="model.enabled" @change="(e) => {
              setModelEnabled(providerKey, model.name, (e.target as HTMLInputElement).checked)
            }" /><span class="checkbox-custom"></span>
          </label>
        </li>
      </ul>
    </div>

  </div>
  <button @click="apply(() => $emit('afterApply'))" class="apply-button">Apply to
    server</button>
</template>

<style scoped>
.modified {
  border: 2px solid red;
}

.provider {
  margin-bottom: 16px;
}

.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.provider-actions {
  display: flex;
  align-items: center;
}

.refresh-button {
  margin-left: 8px;

  margin-right: 8px;
  padding: 4px 4px;
  border-radius: 5px;
  border: 1px solid #ccc;
  color: green;
  /* background-color: #f0f0f0; */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-button:hover {
  background-color: #ddd;
}

.refresh-button:active {
  background-color: #bbb;
}

.enable-label {
  display: flex;
  align-items: center;
  padding: 4px 4px;
  border-radius: 5px;
  border: 1px solid #ccc;
  /* background-color: #f0f0f0; */
  position: relative;
  cursor: pointer;
  text-align: left;
}

.enable-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.enable-label .checkbox-custom {
  position: relative;
  top: 0;
  left: 0;
  height: 16px;
  width: 16px;
  /* background-color: #eee; */
  border-radius: 3px;
  border: 1px solid #ccc;
}

.enable-label:hover input[type="checkbox"]~.checkbox-custom {
  background-color: #ccc;
}

.enable-label input[type="checkbox"]:checked~.checkbox-custom {
  background-color: #2196F3;
}

.enable-label .checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
}

.enable-label input[type="checkbox"]:checked~.checkbox-custom:after {
  display: block;
}

.enable-label .checkbox-custom:after {
  left: 5px;
  top: 2px;
  width: 3px;
  height: 8px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

ul {
  padding-left: 4px;
}

.model {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.model-name {
  margin-right: 8px;
  text-align: left;
}

.model-name[data-enabled="false"] {
  text-decoration: line-through;
}

.apply-button {
  margin-top: 16px;
  padding: 8px 12px;
  border-radius: 5px;
  border: none;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
}

.apply-button:hover {
  background-color: #3e8e41;
}

.apply-button:active {
  background-color: #306132;
}

.apply-button[disabled] {
  background-color: gray;
}
</style>

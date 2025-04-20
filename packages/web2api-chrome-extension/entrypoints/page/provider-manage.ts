import { useLocalStorage } from "@vueuse/core";
import { sleep } from "radash";
import {
  ModelState,
  ProviderKey,
  providerMap,
  ProviderStates,
} from "../background/provider";
import { storageModelMap } from "../background/model";
import { sendMessage } from "@/messaging";

export function useProvider() {
  const states = useLocalStorage<ProviderStates>("client-provider-states", {
    chatgpt: {
      name: "chatgpt",
      models: [],
    },
    moonshot: {
      name: "moonshot",
      models: [],
    },
  });
  const refreshCount = useLocalStorage("client-models-refresh-count", 0);
  //prettier-ignore
  const getSupports=()=>({
    chatgpt: states.value.chatgpt.models.filter(model=>model.enabled).map(model=>model.name),
    moonshot: states.value.moonshot.models.filter(model=>model.enabled).map(model=>model.name),
  })
  onMounted(async () => {
    await sleep(1000);
    if (refreshCount.value === 0) {
      const promises = [];
      for (const key of Object.keys(states.value)) {
        promises.push(refreshProviderModels(key as ProviderKey));
      }
      await Promise.all(promises);
    }

    await apply();
  });
  const refreshProviderModels = async (provider: ProviderKey) => {
    const p = providerMap[provider as keyof typeof providerMap];
    let models = await p.getModels();
    const newModels = models.map((name) => {
      const existModel = states.value[provider].models.find(
        (m) => m.name === name
      );
      return (
        existModel ??
        ({
          name: name,
          enabled: true,
        } as ModelState)
      );
    });
    states.value[provider].models = newModels;
    states.value = states.value;
    //update storage: for background.js to retrieve
    await storageModelMap(states.value);
    isModified.value = true;
    refreshCount.value = refreshCount.value + 1;
  };

  const setModelEnabled = (
    provider: ProviderKey,
    model: string,
    enabled: boolean
  ) => {
    const modelItem = states.value[provider].models.find(
      (item) => item.name === model
    );
    if (modelItem) {
      modelItem.enabled = enabled;
    }
    //update storage: for background.js to retrieve
    storageModelMap(states.value);
    isModified.value = true;
  };

  const isModified = ref(false);
  const apply = async (hook?: Function) => {
    await sendMessage("reRegister", getSupports());
    //update storage: for background.js to retrieve
    await storageModelMap(states.value);
    isModified.value = false;
    hook?.();
  };
  return {
    states,
    setModelEnabled,
    isModified,
    apply,
    refreshProviderModels,
  };
}

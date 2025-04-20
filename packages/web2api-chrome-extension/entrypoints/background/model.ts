import { LanguageModelV1 } from "ai";
import { moonshotWebProvider } from "moonshot-web-ai-provider";
import { pick } from "radash";
import { ModelId } from "web2api-server/type";
import { ProviderKey, providerMap, ProviderStates } from "./provider";

export async function createModel(
  modelId: ModelId,
  option: any
): Promise<LanguageModelV1 | undefined> {
  const map = await storage.getItem<Record<string, ProviderKey>>(
    "local:model2provider"
  );
  if (!map) return;

  if (map[modelId] === "moonshot") {
    return providerMap.moonshot.languageModel(
      modelId,
      pick(option, ["use_search"])
    );
  } else if (map[modelId] === "chatgpt") {
    return providerMap.chatgpt.languageModel(
      modelId,
      pick(option, ["use_search"])
    );
  }

  return;
}

export async function storageModelMap(state: ProviderStates) {
  const modelMap: Record<string, ProviderKey> = {};
  Object.values(state).map((s) => {
    for (const m of s.models) {
      modelMap[m.name] = s.name as ProviderKey;
    }
  });
  await storage.setItem<Record<string, ProviderKey>>(
    "local:model2provider",
    modelMap
  );
}

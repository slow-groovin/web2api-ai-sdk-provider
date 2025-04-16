import { LanguageModelV1 } from "ai";
import { moonshotWebProvider } from "moonshot-web-ai-provider";
import { pick } from "radash";
import { ModelId } from "web2api-server/type";

export function createModel(
  modelId: ModelId,
  option: any
): LanguageModelV1 | undefined {
  if (modelId === "k1" || modelId === "kimi") {
    return moonshotWebProvider.languageModel(
      modelId,
      pick(option, ["use_search"])
    );
  }
}

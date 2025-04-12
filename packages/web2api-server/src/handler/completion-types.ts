import { providerTypeEnum, type ProviderType } from "@/ws/type.js";
import { z } from "zod";

// TypeScript type definitions for the request body
export interface ChatCompletionRequest {
  model: ProviderType;
  messages: Message[]; // An array of messages representing the conversation
  temperature?: number; // Optional, controls the randomness of the output, default is 1
  max_tokens?: number; // Optional, the maximum number of tokens to generate
  top_p?: number; // Optional, controls the cumulative probability for token selection
  frequency_penalty?: number; // Optional, penalizes the model for frequent tokens
  presence_penalty?: number; // Optional, penalizes the model for mentioning new topics
  stream?: boolean; // Optional, whether to stream the response incrementally
}

// Message type definition (each message in the conversation)
export interface Message {
  role: "system" | "user" | "assistant"; // The role of the message sender (system, user, assistant)
  content: string; // The content of the message
}

// TypeScript type definitions for the response body
export interface ChatCompletionResponse {
  id: string; // A unique identifier for the request
  object: string; // The object type, usually "text_completion"
  created: number; // Timestamp of when the response was created
  model: string; // The model used to generate the response
  choices: Choice[]; // List of choices containing the generated responses
  usage: Usage; // Token usage statistics
}

// Choice type definition (each option returned by the model)
export interface Choice {
  index: number;
  logprobs: null;
  message: Message; // The generated message
  finish_reason: "stop" | "length" | "content_filter"; // The reason the generation stopped
}

// Token usage statistics
export interface Usage {
  prompt_tokens: number; // The number of tokens used in the request
  completion_tokens: number; // The number of tokens used in the response
  total_tokens: number; // The total number of tokens (request + response)
}

// TypeScript type definition for error responses
export interface ErrorResponse {
  error: {
    message: string; // Error message describing the issue
    type: string; // Error type (e.g., "authentication_error", "invalid_request_error")
    param: string | null; // The parameter that caused the error (if applicable)
    code: string; // Error code (e.g., "invalid_api_key")
  };
}

// TypeScript type definition for streaming responses
export interface StreamingChoice {
  delta: Message; // The partial message (each chunk of the streamed response)
  finish_reason: null | "stop"; // The reason the stream finished
  index: 0;
}

// The complete streaming response
export interface StreamingResponse {
  id: string; // A unique identifier for the request
  object: string; // The object type, usually "text_completion"
  created: number; // Timestamp of when the response was created
  model: string; // The model used to generate the response
  choices: StreamingChoice[]; // List of generated message chunks
  usage?: Usage;
}

// Zod schema for the Message type
const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]), // Enum for role (system, user, assistant)
  content: z.string(), // Content must be a string
});

// Zod schema for the request body
export const ChatCompletionRequestSchema = z.object({
  model: z.string(), // Model name must be a string
  messages: z.array(MessageSchema), // Messages must be an array of Message objects
  temperature: z.number().optional(), // Optional, a number
  max_tokens: z.number().optional(), // Optional, a number
  top_p: z.number().optional(), // Optional, a number
  frequency_penalty: z.number().optional(), // Optional, a number
  presence_penalty: z.number().optional(), // Optional, a number
  stream: z.boolean().optional(), // Optional, a boolean flag for streaming
});

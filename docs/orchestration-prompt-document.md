Before I make request to LLM service like this code. I want to setup the code that can get dynamically the prompts, tools, mcp for the call.

```ts
this.openaiClient.responses.create({
  model: llmConfig.model,
  input: messages,
  instruction: getSystemPromp(),
  tools: getTools(),
  stream: true,
  temperature: llmConfig.temperature,
});
```

In the systems, currently we have 3 financial stages (debt, start_saving, start_investing) and 2 budget styles (goal_focus, detail_tracker). So there are 6 combinations.
I want to create a code structure that can scalable and maintainable for this feature. Please help me review the current code

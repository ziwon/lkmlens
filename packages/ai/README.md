# @lkmlens/ai

Provider-neutral contracts for evidence-linked thread summaries and digest
composition. The package builds bounded prompts, validates claim-to-message
evidence, records model/prompt/source provenance, and leaves provider transport
to the scheduled summarizer Worker.

The current provider implementation is Gemini 3.1 Flash-Lite in
`workers/summarizer`.

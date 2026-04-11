# Runtime Bridge

## Purpose
Connect live model workers into The One ecosystem.

## Current provider
- Ollama

## Current flow
task
↓
runtime_router.py
↓
ollama_bridge.py
↓
warehouse/runtime receipt

## Test
python3 -m agents.runtime.runtime_router "Say: runtime online." ollama llama3

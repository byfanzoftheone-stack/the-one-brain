# THE ONE — Tool System

## Purpose

The tool system lets agents act inside the ecosystem instead of only reasoning.

Agents can use tools to:
- read files
- write files
- scan modules
- update warehouse memory
- call backend routes
- generate apps
- export apps
- inspect source-of-truth

## Core rule

Models think.
Tools act.

The ecosystem becomes powerful when agents can:
1. decide what to do
2. choose the right tool
3. execute safely
4. store results in warehouse/backpack

## Tool zones

### 1. Repo Tools
Used to inspect and modify the repo.

Examples:
- file reader
- file writer
- directory scanner
- module scanner
- source-of-truth reader

### 2. Builder Tools
Used to create and assemble apps.

Examples:
- create app
- install module
- export app
- validate app stack

### 3. Warehouse Tools
Used to store and retrieve ecosystem memory.

Examples:
- save pattern
- save receipt
- save module combo
- save agent discovery
- recall known pattern

### 4. Runtime Tools
Used by teacher/student/skip execution.

Examples:
- run test
- compare outputs
- save good code
- dispatch task
- assign worker

### 5. Integration Tools
Used to connect outside platforms.

Examples:
- GitHub push
- Railway deploy
- Vercel deploy
- Canva asset job
- CapCut job
- ElevenLabs job
- social publish

## Safety rule

Agents do not use tools blindly.

Tool use must follow:
- source-of-truth
- no-drift rules
- promotion pipeline
- user orchestration

## Tool selection law

When an agent receives a task:
1. classify the task
2. identify the zone
3. choose the correct tool
4. execute
5. store result in warehouse/backpack if valuable

## Example flow

Teacher proposes:
"Install SEO Agent into Marketing App"

Runtime does:
- choose Builder Tools
- call install module
- verify app manifest
- save result in warehouse

## Final truth

Tool system = action layer of the ecosystem.
Without tools, agents think.
With tools, agents build.

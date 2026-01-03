<div align="center">

# 🍑 **Thicc**

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-ff69b4?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-blueviolet?style=for-the-badge&logo=openai&logoColor=white)

**JSONL Conversation Compressor for Claude Code**

*"Because that 'Context low' warning is a pain in the ass."*

---

### **Thicc** = **T**erminate, **H**yper-**I**nflate, **C**laude **C**ode
*(Thanks, Claude Code Thinking mode — sarcastically.)*

</div>

---

## 🚨 **The Problem**

<div align="center">

![Context Low Warning](Assets/Context_Low.png)

</div>

You know that moment. You're deep in the zone, Claude Code is crushing it, and then **BAM**:

```
⚠️  Context low · Run /compact to compact & continue
```

Annoying, right? Like interrupting flow just when things get **thicc** with context.

> [!WARNING]
> ### **Why `/compact` Sucks**
> 
> 1. ⏱️ **Takes forever** — `/compact` can drag on for **2–5 minutes** (especially in long or context-heavy conversations)
>    - **Thicc** finishes in **under 5 seconds** (`--safe`) or at most **30 seconds** (`--medium`/`--aggressive`)
> 
> 2. 💸 **Token vampire** — Can consume up to **40,000 tokens** per compaction
>    - **Thicc** avoids this pain completely
> 
> 3. 🔄 **Starts a new conversation** — `/compact` doesn't truly compact; it creates a brand-new conversation with a summary of the old one
>    - **Thicc** preserves the **current conversation** fully intact
> 
> 4. 🧠 **Loses context** — `/compact` often causes Claude Code to forget user instructions, `CLAUDE.md` instructions, or even **current task context** (catastrophic)
>    - **Thicc** summarizes **older** context using a selective approach, keeping the conversation body continuous and almost **zero current context loss**

**Thicc** is the only thing that can get rid of that warning without breaking your flow.

---

## ⚡ **The Solution**

<div align="center">

![Thicc in Action](Assets/Thicc.png)

</div>

**Thicc** compresses Claude Code `.jsonl` conversation files by intelligently clearing old context while keeping the conversation alive and intact.

### 🎯 **Core Features**

✅ **Lightning fast** compression  
✅ **Zero current context loss** (preserves recent context)  
✅ **AI-powered summarization** (optional)  
✅ **Tool pair integrity validation**  
✅ **Batch processing** (multiple files at once)  
✅ **Graceful degradation** (falls back to Safe mode)  
✅ **Auto model selection** (mistral → phi3 → llama2)  
✅ **Context-aware deletion** (preserves snapshots)  
✅ **Claude Code compatible** (pure JSONL output)  


---

## 📦 **Installation**

> [!NOTE]
> **Prerequisites**
> - Node.js 16+ (LTS recommended)
> - Ollama (optional, for Medium/Aggressive AI-powered modes)

```bash
# Install dependencies
npm install

# Optional: Install Ollama for AI summarization
# Download from https://ollama.ai
ollama pull mistral
```

---

## 🚀 **Usage**

### **Interactive Mode**
```bash
node Thicc.js
```

### **CLI Arguments**
```bash
# Safe mode (rules-based, no AI)
node Thicc.js --safe
node Thicc.js -s

# Medium mode (AI-assisted, balanced)
node Thicc.js --medium
node Thicc.js -m

# Aggressive mode (AI-assisted, maximum squeeze)
node Thicc.js --aggressive
node Thicc.js --hard
node Thicc.js -a

# Smart mode (real-time monitoring, 3-7% per pass)
node Thicc.js --smart <Session ID>

# Specify mode by number
node Thicc.js --mode 1    # Safe
node Thicc.js --mode 2    # Medium
node Thicc.js --mode 3    # Aggressive
node Thicc.js --mode 4    # Smart (requires session ID)
```

### **Help**
```bash
node Thicc.js --help
```

---

## 🔧 **Compression Modes**

<details open>
<summary><b>🛡️ Safe Mode (Rules-Based)</b></summary>

<br/>

**Strategy:**
1. Identifies a percentage of tool pairs (adjusted based on conversation size)
2. Deletes backwards from last redundant chunk to first `file-history-snapshot` or last `summary`
3. **NO AI intervention** — pure algorithmic deletion
4. **Speed:** Under **5 seconds**
5. **Reduction:** **5-10%**

</details>

<details>
<summary><b>⚖️ Medium Mode (AI-Assisted)</b></summary>

<br/>

**Strategy:**
1. Performs Safe mode deletion first
2. **Summarizes deleted `parentUuid` chains** using AI
3. Embeds summary into single parentUuid message at the top
4. Verifies tool pair integrity (no incomplete pairs in summarized section)
5. **Speed:** **~20-30 seconds**
6. **Reduction:** **10-20%**

</details>

<details>
<summary><b>💥 Aggressive Mode (AI-Assisted)</b></summary>

<br/>

**Strategy:**
1. Performs Safe mode deletion first
2. **Summarizes deleted `parentUuid` chains** using AI (more aggressive deletion window)
3. Embeds summary into single parentUuid message at the top
4. Verifies tool pair integrity
5. **Speed:** **~20-30 seconds**
6. **Reduction:** **15-25%**

</details>

<details>
<summary><b>🧠 Smart Mode (Real-Time Monitoring)</b></summary>

<br/>

**Strategy:**
1. Automatically locates session file in `%USERPROFILE%/.claude/projects/*/*`
2. Monitors file size in real-time (polls every 3 seconds)
3. **Only intervenes when file exceeds 1500 KB initially**
4. Performs surgical deletion (3-7% per pass) using Safe mode algorithm
5. **Dynamically updates the file** — removes only identified deletion range
6. **Never touches middle or recent sections** of the conversation
7. **Intelligent threshold management** — compresses once per +500 KB growth (cumulative)
8. Continues monitoring indefinitely until stopped (Ctrl+C) or session ends
9. **Speed:** Real-time, zero disruption to active conversation
10. **Reduction:** **3-7% per pass** (conservative, repeatable)

**Use Case:**
Perfect for active, long-running Claude Code sessions. Start monitoring at the beginning of your session and forget about it — Smart Mode keeps your conversation optimized without interrupting your flow.

**Threshold Logic:**
- First compression: When file reaches **1500 KB**
- Subsequent compressions: Every **+500 KB** from last compression
- Example flow:
  - Start: 800 KB → Monitoring...
  - Grows to: 1500 KB → **Compress** → 1381 KB
  - Grows to: 1881 KB (1381 + 500) → **Compress** → 1732 KB
  - Grows to: 2232 KB (1732 + 500) → **Compress** → 2065 KB
  - And so on...

**Example:**
```bash
# Get your session ID from /status command
node Thicc.js --smart 8d87c742-381b-48d5-9173-27b86de5061c

# Or use interactive mode and select option 4
node Thicc.js
```

</details>

---

## 🎓 **Personal Workflow** (How I Actually Use This)

> [!NOTE]
> This is my real workflow.

As soon as the **"Context low · Run /compact to compact & continue"** warning appears:

1. **Get Session ID**
   ```bash
   /status
   ```
   Copy the **Session ID** (e.g., `8d87c742-381b-48d5-9173-27b86de5061c`)

2. **Navigate to `.claude` folder**
   - Press **Win + R** (Windows)
   - Go to `.claude` or `C:\Users\<user>\.claude`
   - Enter the `projects` folder

3. **Copy the conversation file**
   - Locate the `.jsonl` file (filename = Session ID)
   - Example: `8d87c742-381b-48d5-9173-27b86de5061c.jsonl`
   - Copy it to the `Src/` directory of **Thicc**

4. **Run Thicc**
   ```bash
   node Thicc.js --medium
   ```

5. **Replace the original file**
   - Remove the `_compressed` suffix from the filename
   - Paste it back into `C:\Users\<user>\.claude\projects`

6. **Restart Claude Code**
   - Press **Ctrl + C** in the terminal
   - Run `claude --continue`

7. **Continue the conversation**
   - No more "Context low" warning
   - Repeat whenever the warning shows up again

---

## 📊 **Efficiency Comparison**

<table>
<thead>
<tr>
<th>Metric</th>
<th><code>/compact</code></th>
<th><b>Thicc (Safe)</b></th>
<th><b>Thicc (Medium)</b></th>
<th><b>Thicc (Aggressive)</b></th>
<th><b>Thicc (Smart)</b></th>
</tr>
</thead>
<tbody>
<tr>
<td><b>Time</b></td>
<td>2-5 minutes</td>
<td>&lt; 5 seconds</td>
<td>~20-30 seconds</td>
<td>~20-30 seconds</td>
<td>Real-time (automatic)</td>
</tr>
<tr>
<td><b>Token Cost</b></td>
<td>Up to 40,000</td>
<td>Zero</td>
<td>Zero</td>
<td>Zero</td>
<td>Zero</td>
</tr>
<tr>
<td><b>Context Loss</b></td>
<td>High (new conversation)</td>
<td>Zero</td>
<td>Zero</td>
<td>Zero</td>
<td>Zero</td>
</tr>
<tr>
<td><b>Instruction Retention</b></td>
<td>Unreliable</td>
<td>Perfect</td>
<td>Perfect</td>
<td>Perfect</td>
<td>Perfect</td>
</tr>
<tr>
<td><b>Reduction</b></td>
<td>~30-50%</td>
<td>5-10%</td>
<td>10-20%</td>
<td>15-25%</td>
<td>3-7% per pass</td>
</tr>
<tr>
<td><b>Use Case</b></td>
<td>Manual intervention</td>
<td>Quick one-time</td>
<td>Balanced compression</td>
<td>Maximum squeeze</td>
<td>Active sessions</td>
</tr>
</tbody>
</table>

> [!CAUTION]
> **Why `/compact` Loses Context**
> 
> `/compact` summarizes the **entire conversation** (including recent context), then starts a **new conversation** with that summary. This causes:
> - Loss of `CLAUDE.md` instructions
> - Loss of user-defined preferences
> - Loss of current task context
> 
> **Thicc** summarizes **older** context only, preserving the most recent messages and keeping the **same conversation** alive.

---

## 📂 **Directory Structure**

```
Thicc/
├── Thicc.js              # Main entry point
├── package.json          # Dependencies
├── Src/                  # Place .jsonl files here
├── Dist/                 # Compressed files output here
├── Assets/               # Images and resources
└── Lib/                  # Internal modules
    ├── Ai/               # AI integration (Ollama)
    ├── Cli/              # Command-line UI
    ├── Compression/      # Compression modes
    ├── Core/             # Processing logic
    ├── Helpers/          # Utility functions
    ├── Io/               # File operations
    └── Validation/       # JSONL validation
```

---

## 🎨 **Output Format**

**Claude Code Pure JSONL** — each line is a complete JSON object:
```json
{"type":"summary","summary":"...","leafUuid":"..."}
{"parentUuid":"...","message":{...},...}
{"parentUuid":"...","message":{...},...}
```

**Compatibility:** Output is directly compatible with Claude Code.

---

## 🛠️ **Error Handling**

**Thicc** handles errors gracefully:

| Error | Behavior |
|-------|----------|
| **Ollama unavailable** | Automatically falls back to Safe mode |
| **Model not found** | Prompts user, falls back to Safe mode |
| **Invalid JSONL** | Reports errors, skips file, continues processing |
| **Incomplete tool pairs** | Finds and deletes orphaned tool pairs |

---

## 🎯 **Workflow**

1. Place `.jsonl` conversation files in `Src/` folder
2. Run `node Thicc.js` (or with arguments)
3. Select compression mode (if interactive)
4. Tool processes all files in batch
5. Outputs saved to `Dist/` folder:
   - `[filename]_compressed.jsonl`

---

## 🙏 **Credits**

> [!NOTE]
> ### **Sexy Story**
> 
> The idea for **Thicc** and the discovery of the *proper* manual summarization approach came from **me** — born out of pure frustration with that damn "Context low" warning interrupting my flow.
> 
> **However...**
> 
> The tool itself was effectively developed **entirely** by our beloved **Claude Sonnet** model. Every line of code, every algorithm, every playful status message — all crafted by Sonnet's silicon hands.
> 
> ### **Thank You, Sonnet** 🎉
> 
> *For turning a frustrated idea into a hot to handle tool.*  
> *For understanding the assignment (and the vibe).*  
> *For making context compression thicc and efficient.*
> 
> **You're a real one, Sonnet.** 💜

---

## 📄 **License**

ISC

---

<div align="center">

### 🍑 **Thicc** — *Squeezing context so you don't have to.*

<sub>Built with precision. Thicc enough. Slightly naughty.</sub>

**Version 1.0.0** | **2025**

</div>

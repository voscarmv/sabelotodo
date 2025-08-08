#!/usr/bin/env bash
URL="http://localhost:11434/api/generate"
TIMESTAMP=$(date +%s)

# Define 12 different prompts to test
declare -a prompts=(
  "what is the capital of France?"
  "summarize the plotted novel '1984' in one sentence."
  "define quantum entanglement simply."
  "translate 'hello world' into Spanish."
  "what is the square root of 4096?"
  "list three benefits of daily exercise."
  "write a haiku about autumn."
  "explain photosynthesis in two sentences."
  "what year did the Berlin Wall fall?"
  "who won the 2020 Olympic gold in 100m?"
  "why is the sky blue?"
  "give me a joke about computers."
)

# Loop through and send each as a background job
> outputs.txt
for i in "${!prompts[@]}"; do
  prompt="${prompts[$i]}"
  {
    start=$(date +%s.%N)
    curl -s -X POST -H "Content-Type: application/json" \
      -d "{\"model\":\"qwen2.5:3B\", \"prompt\":\"$prompt\", \"stream\":false}" "$URL" >> outputs.txt
    end=$(date +%s.%N)
    duration=$(echo "$end - $start" | bc)
    echo "Query $((i+1)): ${#prompt} chars, took ${duration}s"
  } &
done

wait  # wait for all 12 to finish
echo "All requests completed in $(echo "$(date +%s) - $TIMESTAMP" | bc)s"
const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('/Users/farizherv/.gemini/antigravity-ide/brain/48dc4247-16f6-46b5-8b49-ae5279345541/.system_generated/logs/transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let results = [];
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content.includes('<USER_REQUEST>')) {
        const content = parsed.content.split('<USER_REQUEST>')[1].split('</USER_REQUEST>')[0].trim().replace(/\n/g, ' ').substring(0, 150);
        results.push(`[${parsed.created_at}] Step ${parsed.step_index}: ${content}`);
      }
    } catch (e) {}
  }
  
  // print the last 100 before step 4626 (which is around index of "2. Apa Standar Tertingginya")
  const targetIndex = results.findIndex(r => r.includes('Step 4626'));
  const startIndex = Math.max(0, targetIndex - 100);
  for (let i = startIndex; i < targetIndex; i++) {
    console.log(results[i]);
  }
}
processLineByLine();

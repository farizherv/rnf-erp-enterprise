const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('/Users/farizherv/.gemini/antigravity-ide/brain/48dc4247-16f6-46b5-8b49-ae5279345541/.system_generated/logs/transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content.includes('<USER_REQUEST>')) {
        const content = parsed.content.split('<USER_REQUEST>')[1].split('</USER_REQUEST>')[0].trim().replace(/\n/g, ' ').substring(0, 150);
        console.log(`[${parsed.created_at}] Step ${parsed.step_index}: ${content}`);
      }
    } catch (e) {}
  }
}
processLineByLine();

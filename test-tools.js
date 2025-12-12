#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'dist', 'index.js');

const tests = [
  {
    name: "list_components",
    request: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "list_components",
        arguments: {}
      }
    }
  },
  {
    name: "list_components with category",
    request: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "list_components",
        arguments: { category: "form" }
      }
    }
  },
  {
    name: "get_design_tokens",
    request: {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_design_tokens",
        arguments: { category: "colors" }
      }
    }
  },
  {
    name: "get_component_info",
    request: {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "get_component_info",
        arguments: { component: "button" }
      }
    }
  },
  {
    name: "generate_component",
    request: {
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "generate_component",
        arguments: {
          component: "button",
          framework: "vue",
          props: { variant: "primary" },
          children: "Click me"
        }
      }
    }
  },
  {
    name: "search_documentation",
    request: {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: {
        name: "search_documentation",
        arguments: { query: "button" }
      }
    }
  }
];

async function testTool(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n📝 Testing: ${test.name}`);
    console.log(`Request: ${JSON.stringify(test.request.params.arguments)}`);

    const child = spawn(process.execPath, [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';
    let timeout;

    timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Timeout after 5 seconds'));
    }, 5000);

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('exit', () => {
      clearTimeout(timeout);

      if (errorOutput) {
        console.error(`❌ Stderr output: ${errorOutput}`);
      }

      try {
        // Parse JSON-RPC response
        const lines = output.trim().split('\n');
        const jsonLine = lines[lines.length - 1]; // Last line should be JSON
        const response = JSON.parse(jsonLine);

        if (response.error) {
          console.error(`❌ Error: ${response.error.message}`);
          resolve(false);
        } else if (response.result) {
          console.log(`✅ Success!`);
          const content = response.result.content?.[0]?.text;
          if (content) {
            const preview = content.substring(0, 100);
            console.log(`   Preview: ${preview}...`);
          }
          resolve(true);
        }
      } catch (e) {
        console.error(`❌ Failed to parse response: ${e.message}`);
        console.error(`   Output: ${output.substring(0, 200)}`);
        resolve(false);
      }
    });

    // Send request
    child.stdin.write(JSON.stringify(test.request) + '\n');
    child.stdin.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Mozaic MCP Server Tools');
  console.log('===================================');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await testTool(test);
      if (result) passed++;
      else failed++;
    } catch (e) {
      console.error(`❌ Test failed: ${e.message}`);
      failed++;
    }
  }

  console.log('\n📊 Results');
  console.log('==========');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
}

runTests().catch(console.error);
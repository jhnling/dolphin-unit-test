// scripts/import-data.ts
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function main() {
  try {
    // Read and parse the JSON file
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'))
    
    console.log(`Found ${data.length} problems to import`)
    
    // Import each problem
    for (const problem of data) {
      try {
        await prisma.problem.upsert({
          where: { uid: problem.uid },
          update: {
            prompt: problem.prompt,
            language: problem.language,
            code: problem.code,
            thought: problem.thought,
            tests: problem.tests
          },
          create: {
            uid: problem.uid,
            prompt: problem.prompt,
            language: problem.language,
            code: problem.code,
            thought: problem.thought,
            tests: problem.tests
          }
        })
        console.log(`Imported problem ${problem.uid}`)
      } catch (err) {
        console.error(`Failed to import problem ${problem.uid}:`, err)
      }
    }
    
    console.log('Import completed')
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
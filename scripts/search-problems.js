// scripts/search-problems.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function searchProblems() {
  try {
    const problems = await prisma.problem.findMany({
      where: {
        prompt: {
          contains: "Children's numbers in clockwise order"
        }
      },
      select: {
        uid: true,
        prompt: true
      }
    });

    console.log(`Found ${problems.length} matching problems:`);
    problems.forEach(problem => {
      console.log('\nUID:', problem.uid);
      console.log('Prompt Preview:', problem.prompt.substring(0, 200));
    });
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

searchProblems();
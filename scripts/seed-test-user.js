const { PrismaClient } = require('../src/generated/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'test@kaappu.id';
    const hash = await bcrypt.hash('Password123!', 10);

    // Ensure account exists
    await prisma.account.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            name: 'Default Account',
            slug: 'default'
        }
    });

    // Create or update user
    const user = await prisma.user.upsert({
        where: {
            accountId_email: {
                accountId: 'default',
                email
            }
        },
        update: {},
        create: {
            email,
            accountId: 'default',
            firstName: 'Test',
            lastName: 'User',
            passwords: {
                create: {
                    hash,
                    strength: 3
                }
            }
        }
    });

    console.log('Test user ready:', email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

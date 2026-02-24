const neo4j = require('neo4j-driver');

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'MR@mech2003'));

async function cleanUsers() {
    const session = driver.session();
    try {
        const email = 'admin@kaappu.com';
        // Delete duplicate admin users, keep only one if needed, or just delete all and let app recreate
        console.log(`Deleting all users with email ${email}...`);
        const result = await session.run('MATCH (u:User {email: $email}) DETACH DELETE u', { email });
        console.log('Done.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

cleanUsers();

const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', 'MR@mech2003')
);

async function checkUsers() {
    const session = driver.session();
    try {
        const result = await session.run('MATCH (u:User) RETURN u.email, u.firstName, u.lastName');
        console.log('--- USERS IN DATABASE ---');
        result.records.forEach(record => {
            console.log(`Email: ${record.get('u.email')}, Name: ${record.get('u.firstName')} ${record.get('u.lastName')}`);
        });
        if (result.records.length === 0) {
            console.log('No users found in database.');
        }
        console.log('-------------------------');
    } catch (error) {
        console.error('Error connecting to Neo4j:', error.message);
    } finally {
        await session.close();
        await driver.close();
    }
}

checkUsers();

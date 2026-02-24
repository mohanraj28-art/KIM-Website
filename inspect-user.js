const neo4j = require('neo4j-driver');

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'MR@mech2003'));

async function inspectUser() {
    const session = driver.session();
    try {
        const email = 'mohanrajdhoni71@gmail.com';
        const result = await session.run(`
      MATCH (u:User {email: $email})
      OPTIONAL MATCH (u)-[:BELONGS_TO]->(t:Tenant)
      OPTIONAL MATCH (u)-[:HAS_PASSWORD]->(p:Password)
      RETURN u, t.id as tenantId, p.hash as hasRelPassword, u.passwordHash as hasPropPassword
    `, { email });

        if (result.records.length === 0) {
            console.log('User not found.');
            return;
        }

        const record = result.records[0];
        const user = record.get('u').properties;
        console.log('User Properties:', JSON.stringify(user, null, 2));
        console.log('Tenant ID:', record.get('tenantId'));
        console.log('Has Password Node:', !!record.get('hasRelPassword'));
        console.log('Has Password Property:', !!record.get('hasPropPassword'));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

inspectUser();

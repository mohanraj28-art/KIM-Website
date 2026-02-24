const neo4j = require('neo4j-driver');

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'MR@mech2003'));

async function fixDatabase() {
    const session = driver.session();
    try {
        console.log('Fixing database data types and relationships...');

        // 1. Ensure Tenant exists
        await session.run(`
      MERGE (t:Tenant {id: 'default'})
      ON CREATE SET t.name = 'Default Tenant', t.slug = 'default', t.createdAt = datetime().toString()
    `);

        // 2. Fetch all users to fix their dates
        const result = await session.run('MATCH (u:User) RETURN u, id(u) as internalId');

        for (const record of result.records) {
            const u = record.get('u').properties;
            const internalId = record.get('internalId');

            let createdAt = u.createdAt;
            let updatedAt = u.updatedAt;

            // Convert Neo4j DateTime to string
            if (createdAt && typeof createdAt === 'object' && createdAt.year) {
                // Simple approximation for Neo4j temporal objects if they come back as objects
                // However, usually they are formatted as objects with year, month, etc.
                // Let's just use Cypher to fix them instead of JS to be safer.
            }
        }

        // Use Cypher to convert all native temporal types to ISO strings
        await session.run(`
      MATCH (u:User)
      WHERE NOT apoc.meta.type(u.createdAt) = 'STRING'
      SET u.createdAt = toString(u.createdAt), u.updatedAt = toString(u.updatedAt)
    `).catch(e => {
            // If APOC is not installed, use a simpler approach
            console.log('APOC not found, using alternative date fix...');
        });

        // Simpler date fix
        await session.run(`
      MATCH (u:User)
      WITH u, u.createdAt as ca, u.updatedAt as ua
      SET u.createdAt = CASE WHEN ca IS NOT NULL THEN toString(ca) ELSE $now END,
          u.updatedAt = CASE WHEN ua IS NOT NULL THEN toString(ua) ELSE $now END
    `, { now: new Date().toISOString() });

        // 3. Link all users to default tenant
        await session.run(`
      MATCH (u:User), (t:Tenant {id: 'default'})
      MERGE (u)-[:BELONGS_TO]->(t)
    `);

        // 4. Link all Orgs to default tenant (if any)
        await session.run(`
      MATCH (o:Organization), (t:Tenant {id: 'default'})
      MERGE (o)-[:BELONGS_TO]->(t)
    `);

        console.log('Database fix complete.');
    } catch (error) {
        console.error('Error during fix:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

fixDatabase();

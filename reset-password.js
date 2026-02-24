const neo4j = require('neo4j-driver');
const bcrypt = require('bcryptjs');

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'MR@mech2003'));

async function resetPassword() {
    const session = driver.session();
    try {
        const email = 'mohanrajdhoni71@gmail.com';
        const newPassword = 'MR@mech2003';
        const saltRounds = 12;
        const hash = await bcrypt.hash(newPassword, saltRounds);

        // We update the Password node if it exists, or the User property
        await session.run(`
      MATCH (u:User {email: $email})
      SET u.passwordHash = $hash
      WITH u
      OPTIONAL MATCH (u)-[:HAS_PASSWORD]->(p:Password)
      FOREACH (x IN CASE WHEN p IS NOT NULL THEN [p] ELSE [] END | SET x.hash = $hash)
      RETURN u.email
    `, { email, hash });

        console.log(`Password reset successfully for ${email} to ${newPassword}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

resetPassword();

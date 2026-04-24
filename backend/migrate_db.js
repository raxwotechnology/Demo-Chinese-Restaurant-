const { MongoClient } = require('mongodb');

// Source Database
const SOURCE_URI = "mongodb+srv://root:root@cluster0.jbl7utw.mongodb.net/GasmaRestaurant?retryWrites=true&w=majority&appName=Cluster0";

// Target Database
const TARGET_URI = "mongodb+srv://admin:ipxinIYB1UHUBM0u@cluster0.sk3uhkr.mongodb.net/RestaurantDB?retryWrites=true&w=majority";

async function migrate() {
    // Removed unsupported options
    const sourceClient = new MongoClient(SOURCE_URI);
    const targetClient = new MongoClient(TARGET_URI);

    try {
        console.log("Connecting to Source Database...");
        await sourceClient.connect();
        console.log("✅ Connected to Source!");

        console.log("Connecting to Target Database...");
        await targetClient.connect();
        console.log("✅ Connected to Target!");

        const sourceDb = sourceClient.db();
        const targetDb = targetClient.db();

        const collections = await sourceDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections to migrate.`);

        for (const colDef of collections) {
            const colName = colDef.name;
            if (colName.startsWith('system.')) continue;

            console.log(`Migrating collection: ${colName}...`);

            const sourceCol = sourceDb.collection(colName);
            const targetCol = targetDb.collection(colName);

            const data = await sourceCol.find({}).toArray();

            if (data.length > 0) {
                // Check if target collection has data, if so clear it
                await targetCol.deleteMany({});
                await targetCol.insertMany(data);
                console.log(`  - Successfully moved ${data.length} documents.`);
            } else {
                console.log(`  - Collection ${colName} is empty. Skipping.`);
            }
        }

        console.log("\n✅ Migration Completed Successfully!");
    } catch (err) {
        console.error("\n❌ Error during migration:", err.message);
    } finally {
        await sourceClient.close();
        await targetClient.close();
    }
}

migrate();

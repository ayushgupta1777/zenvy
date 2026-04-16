import mongoose from 'mongoose';

const SOURCE_URI = 'mongodb://HSSE:Ecom_HSSE_HostPass16@localhost:27018/ecommerce_reseller?authSource=admin';
const TARGET_URI = 'mongodb://127.0.0.1:27017/ecommerce_reseller';

async function copyDatabase() {
    console.log('🔄 Connecting to databases...');
    
    // Connect to source
    const sourceConnection = await mongoose.createConnection(SOURCE_URI).asPromise();
    console.log('✅ Connected to Source DB');
    
    // Connect to target
    const targetConnection = await mongoose.createConnection(TARGET_URI).asPromise();
    console.log('✅ Connected to Target DB');

    try {
        const collections = await sourceConnection.db.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections. Copying...`);

        for (const collection of collections) {
            const collectionName = collection.name;
            console.log(`\n▶️ Copying collection: ${collectionName}...`);
            
            // Get all documents from source collection
            const documents = await sourceConnection.db.collection(collectionName).find({}).toArray();
            console.log(`   Fetched ${documents.length} documents.`);

            if (documents.length > 0) {
                const targetCollection = targetConnection.db.collection(collectionName);
                
                // Clear existing data in target (optional, keeping it flush for a clean copy)
                await targetCollection.deleteMany({});
                
                // Insert into target
                await targetCollection.insertMany(documents);
                console.log(`   ✅ Inserted ${documents.length} documents into target.`);
            } else {
                console.log(`   ⏭️ Skipped (Empty).`);
            }
        }
        
        console.log('\n🎉 ALL COLLECTIONS COPIED SUCCESSFULLY!');
    } catch (error) {
        console.error('❌ Error during copy:', error);
    } finally {
        await sourceConnection.close();
        await targetConnection.close();
        console.log('🔌 Connections closed.');
    }
}

copyDatabase();

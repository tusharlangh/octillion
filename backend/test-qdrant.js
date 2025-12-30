import qdrantClient from "./src/utils/qdrant/client.js";

async function testQdrantConnection() {
  try {
    console.log("🔍 Testing Qdrant connection...");
    
    // Test 1: Get collections
    const collectionsResult = await qdrantClient.getCollections();
    console.log("\n✅ Successfully connected to Qdrant!");
    console.log(`📊 Found ${collectionsResult.collections.length} collections:`);
    
    collectionsResult.collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });

    // Test 2: Check specific collection info if any exist
    if (collectionsResult.collections.length > 0) {
      const firstCollection = collectionsResult.collections[0];
      console.log(`\n🔍 Checking collection: ${firstCollection.name}`);
      
      const collectionInfo = await qdrantClient.getCollection(firstCollection.name);
      console.log(`   Points count: ${collectionInfo.points_count}`);
      console.log(`   Vector size: ${collectionInfo.config?.params?.vectors?.size || 'N/A'}`);
    } else {
      console.log("\n⚠️  No collections found in Qdrant");
    }

    console.log("\n✨ Qdrant connection test complete!");
  } catch (error) {
    console.error("\n❌ Failed to connect to Qdrant:");
    console.error(`   Error: ${error.message}`);
    console.error("\n💡 Please check:");
    console.error("   1. Is Qdrant running?");
    console.error("   2. Is QDRANT_URL correct in your .env file?");
    console.error("   3. Is QDRANT_API_KEY set (if using cloud)?");
    process.exit(1);
  }
}

testQdrantConnection();

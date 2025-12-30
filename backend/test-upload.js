/**
 * Comprehensive test to diagnose Qdrant upload issues
 * This simulates the entire flow from chunks to Qdrant upload
 */

import { generateAndUploadEmbeddings_v2 } from "./src/services/saveFiles/embeddings.js";
import qdrantClient from "./src/utils/qdrant/client.js";

// Sample test chunks (minimal structure needed for testing)
const testChunks = [
  {
    id: 1,
    text: "This is a test chunk about artificial intelligence and machine learning.",
    stats: {
      word_count: 11,
      sentence_count: 1,
      chunk_index: 0,
    },
    source: {
      file: "test.pdf",
      page_number: 1,
    },
    structure: {
      type: "paragraph",
      starts_with_header: false,
      contains_list: false,
    },
  },
  {
    id: 2,
    text: "Natural language processing is a fascinating field that combines linguistics and computer science.",
    stats: {
      word_count: 14,
      sentence_count: 1,
      chunk_index: 1,
    },
    source: {
      file: "test.pdf",
      page_number: 1,
    },
    structure: {
      type: "paragraph",
      starts_with_header: false,
      contains_list: false,
    },
  },
  {
    id: 3,
    text: "Deep learning models have revolutionized the way we approach complex problems in various domains.",
    stats: {
      word_count: 15,
      sentence_count: 1,
      chunk_index: 2,
    },
    source: {
      file: "test.pdf",
      page_number: 2,
    },
    structure: {
      type: "paragraph",
      starts_with_header: false,
      contains_list: false,
    },
  },
];

async function runDiagnosticTest() {
  console.log("=" * 80);
  console.log("🔬 Starting Comprehensive Qdrant Upload Diagnostic Test");
  console.log("=".repeat(80));

  const testParseId = "test-diagnostic-" + Date.now();
  const testUserId = "test-user-123";

  try {
    console.log(`\n📋 Test Configuration:`);
    console.log(`   Parse ID: ${testParseId}`);
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Number of test chunks: ${testChunks.length}`);
    console.log(`   Chunk texts:`);
    testChunks.forEach((chunk, i) => {
      console.log(`     ${i + 1}. "${chunk.text.substring(0, 50)}..."`);
    });

    console.log(`\n🚀 Starting upload process...`);
    console.log("=".repeat(80));

    const result = await generateAndUploadEmbeddings_v2(
      testParseId,
      testUserId,
      testChunks
    );

    console.log("\n" + "=".repeat(80));
    console.log("📊 Upload Result:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(result, null, 2));

    // Verify the upload
    console.log("\n🔍 Verifying upload in Qdrant...");
    const collectionName = `parse_${testParseId}_${testUserId}`;
    
    try {
      const collectionInfo = await qdrantClient.getCollection(collectionName);
      console.log(`✅ Collection exists: ${collectionName}`);
      console.log(`📈 Points in collection: ${collectionInfo.points_count}`);
      
      if (collectionInfo.points_count > 0) {
        console.log("\n✅ SUCCESS! Points were uploaded to Qdrant!");
        
        // Try to retrieve a sample point
        const scrollResult = await qdrantClient.scroll(collectionName, {
          limit: 1,
          with_payload: true,
          with_vector: false,
        });
        
        if (scrollResult.points && scrollResult.points.length > 0) {
          console.log("\n🔍 Sample point from Qdrant:");
          console.log(JSON.stringify(scrollResult.points[0], null, 2));
        }
      } else {
        console.log("\n❌ PROBLEM: Collection exists but has 0 points!");
        console.log("This suggests that the upload process is failing silently.");
      }
    } catch (error) {
      console.error(`\n❌ Error getting collection info:`, error.message);
    }

    // Cleanup - optionally delete the test collection
    console.log(`\n🗑️  Cleaning up test collection...`);
    try {
      await qdrantClient.deleteCollection(collectionName);
      console.log(`✅ Test collection deleted successfully`);
    } catch (error) {
      console.log(`⚠️  Could not delete test collection: ${error.message}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✨ Diagnostic test complete!");
    console.log("=".repeat(80));

  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ FATAL ERROR during diagnostic test:");
    console.error("=".repeat(80));
    console.error(error);
    console.error("\nStack trace:");
    console.error(error.stack);
    process.exit(1);
  }
}

runDiagnosticTest();

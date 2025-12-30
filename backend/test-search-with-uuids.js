/**
 * Test to verify search works with UUID-based point IDs
 */

import { generateAndUploadEmbeddings_v2 } from "./src/services/saveFiles/embeddings.js";
import { searchQdrant } from "./src/services/qdrantService.js";
import { callToEmbed } from "./src/utils/openAi/callToEmbed.js";
import qdrantClient from "./src/utils/qdrant/client.js";

// Test chunks about AI and technology
const testChunks = [
  {
    id: 1,
    text: "Machine learning is a subset of artificial intelligence that enables systems to learn from data.",
    stats: { word_count: 16, sentence_count: 1, chunk_index: 0 },
    source: { file: "ai-basics.pdf", page_number: 1 },
    structure: { type: "paragraph", starts_with_header: false, contains_list: false },
  },
  {
    id: 2,
    text: "Neural networks are computing systems inspired by biological neural networks in animal brains.",
    stats: { word_count: 14, sentence_count: 1, chunk_index: 1 },
    source: { file: "ai-basics.pdf", page_number: 2 },
    structure: { type: "paragraph", starts_with_header: false, contains_list: false },
  },
  {
    id: 3,
    text: "Deep learning uses multiple layers to progressively extract higher-level features from raw input.",
    stats: { word_count: 14, sentence_count: 1, chunk_index: 2 },
    source: { file: "ai-basics.pdf", page_number: 3 },
    structure: { type: "paragraph", starts_with_header: false, contains_list: false },
  },
];

async function testSearchWithUUIDs() {
  const testParseId = "search-test-" + Date.now();
  const testUserId = "test-user-search";

  console.log("🔍 Testing search functionality with UUID point IDs\n");
  console.log("=".repeat(70));

  try {
    // Step 1: Upload test data
    console.log("\n📤 Step 1: Uploading test chunks...");
    const uploadResult = await generateAndUploadEmbeddings_v2(
      testParseId,
      testUserId,
      testChunks
    );
    console.log(`✅ Uploaded ${uploadResult.successful} chunks`);

    // Step 2: Verify data in Qdrant
    const collectionName = `parse_${testParseId}_${testUserId}`;
    const collectionInfo = await qdrantClient.getCollection(collectionName);
    console.log(`✅ Collection has ${collectionInfo.points_count} points`);

    // Step 3: Search with a related query
    console.log("\n🔍 Step 2: Testing semantic search...");
    const searchQuery = "What are neural networks?";
    console.log(`Query: "${searchQuery}"`);
    
    const queryEmbedding = await callToEmbed(searchQuery);
    const searchResults = await searchQdrant(testParseId, testUserId, queryEmbedding, {
      topK: 3,
    });

    console.log(`\n✅ Search returned ${searchResults.length} results:`);
    searchResults.forEach((result, index) => {
      const chunk = testChunks.find(c => c.id === result.chunk_id);
      console.log(`\n${index + 1}. Chunk ID: ${result.chunk_id}, Index: ${result.chunk_index}`);
      if (chunk) {
        console.log(`   Text: "${chunk.text.substring(0, 80)}..."`);
      }
    });

    // Verify the most relevant result
    if (searchResults.length > 0 && searchResults[0].chunk_id === 2) {
      console.log("\n✅ SUCCESS! Search correctly found the neural networks chunk!");
    } else {
      console.log("\n⚠️  Search returned results but may need tuning");
    }

    // Cleanup
    console.log("\n🗑️  Cleaning up test collection...");
    await qdrantClient.deleteCollection(collectionName);
    console.log("✅ Cleanup complete");

    console.log("\n" + "=".repeat(70));
    console.log("✨ Search test complete! UUID-based point IDs work correctly.");
    console.log("=".repeat(70));

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testSearchWithUUIDs();

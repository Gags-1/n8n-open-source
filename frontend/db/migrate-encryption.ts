import { createClient } from '@supabase/supabase-js';
import { encryptWorkflowNodes } from '../lib/secure-workflow';

// Migration script to encrypt existing unencrypted API keys in the database
async function migrateExistingData() {
  console.log('🔒 Starting encryption migration for existing workflows...');
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  try {
    // Get all workflows
    const { data: workflows, error } = await supabaseAdmin
      .from('workflows')
      .select('*');

    if (error) {
      console.error('Failed to fetch workflows:', error);
      return;
    }

    console.log(`📊 Found ${workflows.length} workflows to check`);

    let updatedCount = 0;

    for (const workflow of workflows) {
      try {
        // Check if nodes contain unencrypted API keys
        const nodes = workflow.nodes || [];
        let needsUpdate = false;

        // Check for unencrypted API keys
        for (const node of nodes) {
          if (node.data) {
            const sensitiveFields = ['apiKey', 'password', 'username', 'webhookUrl'];
            for (const field of sensitiveFields) {
              if (node.data[field] && typeof node.data[field] === 'string') {
                // If it doesn't contain ':' it's likely unencrypted
                if (!node.data[field].includes(':')) {
                  needsUpdate = true;
                  break;
                }
              }
            }
          }
          if (needsUpdate) break;
        }

        if (needsUpdate) {
          console.log(`🔐 Encrypting workflow: ${workflow.name} (ID: ${workflow.id})`);
          
          // Encrypt the nodes
          const encryptedNodes = encryptWorkflowNodes(nodes);

          // Update the workflow
          const { error: updateError } = await supabaseAdmin
            .from('workflows')
            .update({ nodes: encryptedNodes })
            .eq('id', workflow.id);

          if (updateError) {
            console.error(`Failed to update workflow ${workflow.id}:`, updateError);
          } else {
            updatedCount++;
            console.log(`✅ Successfully encrypted workflow: ${workflow.name}`);
          }
        }
      } catch (error) {
        console.error(`Error processing workflow ${workflow.id}:`, error);
      }
    }

    console.log(`🎉 Migration completed! Updated ${updatedCount} workflows.`);
    
    if (updatedCount === 0) {
      console.log('ℹ️  No workflows needed encryption (all were already secure).');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateExistingData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migrateExistingData };
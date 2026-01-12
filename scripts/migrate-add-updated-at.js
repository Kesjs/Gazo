#!/usr/bin/env node

/**
 * Migration script to add updated_at column to subscriptions table
 * Usage: node scripts/migrate-add-updated-at.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Starting migration: Add updated_at column to subscriptions');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('📝 Attempting to add updated_at column...');

    // Try to add the column using raw SQL
    // This will fail gracefully if the column already exists
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'subscriptions'
                AND column_name = 'updated_at'
            ) THEN
                ALTER TABLE public.subscriptions
                ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

                UPDATE public.subscriptions
                SET updated_at = created_at
                WHERE updated_at IS NULL;
            END IF;
        END $$;
      `
    });

    if (alterError) {
      console.error('❌ Error during migration:', alterError);

      // If it's a permission error, try a different approach
      if (alterError.code === 'PGRST205' || alterError.message.includes('exec_sql')) {
        console.log('🔄 Trying alternative approach...');

        // Try direct SQL execution through a simple query
        const { error: simpleError } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
        });

        if (simpleError) {
          console.error('❌ Alternative approach also failed:', simpleError);
          console.log('💡 Manual migration required:');
          console.log('Run this SQL in your Supabase dashboard:');
          console.log(`
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE public.subscriptions SET updated_at = created_at WHERE updated_at IS NULL;
          `);
          process.exit(1);
        } else {
          console.log('✅ Migration completed using alternative approach!');
        }
      } else {
        process.exit(1);
      }
    } else {
      console.log('✅ Migration completed successfully!');
    }

    console.log('📊 Column updated_at added to subscriptions table');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lunsyufvxkiivnrhpxpj.supabase.co'
const supabaseKey = 'sb_publishable_jQVWJ0zs_--effWgavuN9Q_9bkCVF9o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStock() {
  console.log('Testing stock function call...')
  // Try fetching stock directly or checking edge function
  const res1 = await fetch(`${supabaseUrl}/functions/v1/formen-stock_new?companyId=1&month=1&year=2026`, {
    headers: { apikey: supabaseKey }
  })
  console.log('Month 1 status:', res1.status, await res1.text())

  const res7 = await fetch(`${supabaseUrl}/functions/v1/formen-stock_new?companyId=1&month=7&year=2026`, {
    headers: { apikey: supabaseKey }
  })
  console.log('Month 7 status:', res7.status, await res7.text())
}

testStock()

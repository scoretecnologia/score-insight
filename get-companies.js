import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lunsyufvxkiivnrhpxpj.supabase.co'
const supabaseKey = 'sb_publishable_jQVWJ0zs_--effWgavuN9Q_9bkCVF9o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  try {
    const { data: companies, error: err1 } = await supabase
      .from('gigatech_clientes_config')
      .select('*')
    console.log('COMPANIES:', companies, err1)

    const { data: profiles, error: err2 } = await supabase
      .from('insight_profiles')
      .select('*')
    console.log('PROFILES:', profiles, err2)
  } catch (e) {
    console.error(e)
  }
}

run()

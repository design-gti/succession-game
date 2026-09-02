import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Missing email' })

  const { data, error } = await supabase
    .from('sessions')
    .select('session_id, player_name')
    .eq('player_email', email.toLowerCase().trim())
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('check-email error:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ exists: !!data, playerName: data?.player_name ?? null })
}

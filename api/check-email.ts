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

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('session_id, player_name')
    .eq('player_email', email.toLowerCase().trim())
    .limit(1)
    .maybeSingle()

  if (sessionError) {
    console.error('check-email error:', sessionError)
    return res.status(500).json({ error: sessionError.message })
  }

  if (!session) {
    return res.status(200).json({ exists: false })
  }

  const { data: score, error: scoreError } = await supabase
    .from('scores')
    .select('overall_fit, hiring_speed, total, persona')
    .eq('session_id', session.session_id)
    .limit(1)
    .maybeSingle()

  if (scoreError) {
    console.error('check-email score error:', scoreError)
  }

  return res.status(200).json({
    exists: true,
    playerName: session.player_name,
    score: score ? {
      overallFit: score.overall_fit,
      hiringSpeed: score.hiring_speed,
      total: score.total,
      persona: score.persona,
    } : null,
  })
}

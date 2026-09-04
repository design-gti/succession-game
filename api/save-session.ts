import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+62' + digits.slice(1)
  if (digits.startsWith('62')) return '+' + digits
  if (digits.startsWith('8')) return '+62' + digits
  return '+' + digits
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    sessionId,
    playerName,
    playerPhone,
    playerCompany,
    startedAt,
    finalPickId,
    overallFit,
    hiringSpeed,
    total,
    persona,
    avgTTF,
    currentDay,
    placements,
  } = req.body

  if (!sessionId || !playerPhone || !finalPickId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Insert session
  const { error: sessionError } = await supabase
    .from('sessions')
    .insert({
      session_id:     sessionId,
      player_name:    playerName,
      player_phone:   normalizePhone(playerPhone),
      player_company: playerCompany,
      started_at:     new Date(startedAt).toISOString(),
      final_pick_id:  finalPickId,
    })

  if (sessionError) {
    // Duplicate session_id = already saved, treat as success
    if (sessionError.code === '23505') {
      return res.status(200).json({ ok: true, duplicate: true })
    }
    console.error('session insert error:', sessionError)
    return res.status(500).json({ error: sessionError.message })
  }

  // Insert score
  const { error: scoreError } = await supabase
    .from('scores')
    .insert({
      session_id:   sessionId,
      overall_fit:  overallFit,
      hiring_speed: hiringSpeed,
      total,
      persona,
      avg_ttf:      avgTTF,
      current_day:  currentDay,
      placements,
    })

  if (scoreError) {
    console.error('score insert error:', scoreError)
    return res.status(500).json({ error: scoreError.message })
  }

  return res.status(200).json({ ok: true })
}

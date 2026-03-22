#!/usr/bin/env node
/**
 * Býr til eða uppfærir stjórnanda í Supabase Auth og setur approval_status = approved.
 *
 * Keyrsla (eitt skipti):
 *   node scripts/create-admin-user.mjs
 *
 * Krefst í .env.local:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (Project Settings → API → service_role — ALDREI í frontend)
 *
 * Valfrjálst:
 *   ADMIN_EMAIL=eddafalak91@gmail.com
 *   ADMIN_PASSWORD=12345
 *
 * Ath: Supabase hefur oft lágmarks 6 stafi á lykilorði. Ef 12345 mistekst, stilltu
 * Authentication → Providers → Email → Minimum password length = 5, eða notaðu t.d. 123456.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  const raw = readFileSync(filePath, 'utf8')
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    if (process.env[k] === undefined) process.env[k] = v
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'))

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL ?? 'eddafalak91@gmail.com'
const password = process.env.ADMIN_PASSWORD ?? '12345'

if (!url?.startsWith('http') || !serviceKey) {
  console.error(
    'Vantar VITE_SUPABASE_URL eða SUPABASE_SERVICE_ROLE_KEY í .env.local (sjá .env.example).',
  )
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  if (listErr) {
    console.error('listUsers:', listErr.message)
    process.exit(1)
  }

  const existing = listData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  )

  let userId

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: existing.user_metadata?.full_name ?? 'Edda Falak' },
    })
    if (error) {
      console.error('updateUserById:', error.message)
      if (error.message.toLowerCase().includes('password')) {
        console.error(
          '\nLíklega of stutt lykilorð. Í Supabase: Authentication → Providers → Email → lækka minimum length eða notaðu ADMIN_PASSWORD með að minnsta kosti 6 stöfum.',
        )
      }
      process.exit(1)
    }
    userId = data.user.id
    console.log('Uppfærði notanda:', email)
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Edda Falak' },
    })
    if (error) {
      console.error('createUser:', error.message)
      if (error.message.toLowerCase().includes('password')) {
        console.error(
          '\nLíklega of stutt lykilorð. Í Supabase: Authentication → Providers → Email → lækka minimum length eða notaðu ADMIN_PASSWORD með að minnsta kosti 6 stöfum.',
        )
      }
      process.exit(1)
    }
    userId = data.user.id
    console.log('Bjó til notanda:', email)
  }

  const { error: upErr } = await admin
    .from('profiles')
    .update({ approval_status: 'approved', full_name: 'Edda Falak' })
    .eq('id', userId)

  if (upErr) {
    console.error('profiles.update:', upErr.message)
    process.exit(1)
  }

  console.log('profiles.approval_status = approved fyrir', userId)
  console.log('Þú getur skráð þig inn á /innskraning með þessu netfangi og lykilorði.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

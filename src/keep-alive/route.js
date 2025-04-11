import { NextResponse } from 'next/server'

export const revalidate = 0

export async function GET() {
  //this will make sure the admin panel is always running and not sleeping on vercels end. we will not have to wait for loading and such of the panel
  //vercel_url is a env variable that is set in vercel by vercel
  await fetch(`https://${process.env.VERCEL_URL}/admin`)

  return NextResponse.json({ ok: true })
}

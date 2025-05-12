import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/nextcloud';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const result = await testConnection();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

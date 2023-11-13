import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
 
export default function handler(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
	!process.env.CRON_SECRET ||
	authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
	return NextResponse.json(
	  { success: false },
	  {
		status: 401,
	  },
	);
  }
 
  return NextResponse.json({ success: true });
}
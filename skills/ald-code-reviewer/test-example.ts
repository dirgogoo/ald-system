// Test example: API route with intentional policy violations
// This file is for testing ald-code-reviewer integration

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // ❌ Violation: No server-side validation (Policy 4.1)
  const body = await req.json();

  // ❌ Violation: No error handling (Policy 3.6)
  const result = await fetch('https://api.example.com/products', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  // ❌ Violation: No proper HTTP status codes (Policy 5.2)
  return NextResponse.json({ data: result });
}

// ❌ Violation: Missing file header documentation (Policy 3.17)
// ❌ Violation: No structured logging (Policy 9.3)
// ❌ Violation: SELECT * in query (if this was a DB query) (Policy 1.2)

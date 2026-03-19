import { NextResponse } from "next/server";
import { PROVIDERS } from "@/lib/providers";

export async function GET() {
  return NextResponse.json({
    providers: PROVIDERS.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      models: p.models,
      requiresApiKey: p.requiresApiKey,
      apiKeyPlaceholder: p.apiKeyPlaceholder,
    })),
  });
}

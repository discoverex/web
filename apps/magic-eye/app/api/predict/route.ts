import { NextRequest, NextResponse } from "next/server";
import { queryMagicEyeByUrl } from "@/services/magic-eye-api";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, level } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "이미지 URL이 필요합니다." },
        { status: 400 },
      );
    }

    // 서버 사이드에서 실제 AI 분석 수행
    const result = await queryMagicEyeByUrl(imageUrl, level || 5);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI 분석 서버 에러:", error);
    return NextResponse.json(
      { error: "AI 분석 중 서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

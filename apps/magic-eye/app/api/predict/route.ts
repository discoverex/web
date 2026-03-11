// app/api/predict/route.ts (Next.js App Router)
export async function POST(req: Request) {
  try {
    const { imageUrl, level } = await req.json();
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!imageUrl) {
      return Response.json({ error: "Image URL is missing" }, { status: 400 });
    }

    // 이미지 바이너리 가져오기
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("이미지를 가져오는데 실패했습니다.");
    }
    const imageBlob = await imageResponse.blob();

    // 요청하신 모델 레벨에 따른 엔드포인트 설정
    const response = await fetch(
      `https://api-inference.huggingface.co/models/postelian/magic-eye-finder/models/ai_lv${level}`,
      {
        headers: { 
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/octet-stream"
        },
        method: "POST",
        body: imageBlob,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API 에러 (${response.status}):`, errorText);
      return Response.json({ error: `HF API error: ${response.status}`, details: errorText }, { status: response.status });
    }

    const result = await response.json();
    return Response.json(result);
  } catch (error) {
    console.error("API 라우트 에러:", error);
    return Response.json({ error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

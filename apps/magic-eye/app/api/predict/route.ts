// app/api/predict/route.ts (Next.js App Router)
export async function POST(req: Request) {
  const { imageUrl, level } = await req.json();
  const HF_TOKEN = process.env.HF_TOKEN;
  
  // 모델 레벨에 따른 엔드포인트 설정 (lv1 ~ lv10)
  // Note: .pth 파일은 Generic Inference 혹은 Custom Handler를 통해 호출됩니다.
  const response = await fetch(
    `https://api-inference.huggingface.co/models/postelian/magic-eye-finder/models/ai_lv${level}.pth`,
    {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      method: "POST",
      body: await (await fetch(imageUrl)).blob(), // 이미지 바이너리 전달
    }
  );

  const result = await response.json();
  return Response.json(result);
}
self.onmessage = (e) => {
  const { eventId, clickCoord, remainingTargets } = e.data;

  // 모든 남은 객체와의 거리 계산
  const distances = remainingTargets.map((target) => {
    const dx = target.x - clickCoord.x;
    const dy = target.y - clickCoord.y;
    // 성능을 위해 Math.sqrt 대신 제곱값만 비교할 수도 있지만,
    // 로그 기록용이므로 정확한 거리를 계산합니다.
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      target_id: target.id,
      distance: parseFloat(distance.toFixed(2)),
    };
  });

  // 계산 완료 후 eventId와 함께 결과 전송
  self.postMessage({ eventId, distances });
};

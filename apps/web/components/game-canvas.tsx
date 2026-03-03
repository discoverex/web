'use client';

import React, { useEffect, useRef, useState } from 'react';

// --- 인터페이스 정의 ---
interface Target {
  id: string;
  x: number;
  y: number;
}

interface LogEntry {
  event_id: string;
  user_id: string;
  game_id: string;
  click_coordinate: { x: number; y: number };
  timestamp: string;
  result_type: 'PENDING' | 'HIT' | 'MISS';
  distances_to_remaining_targets: { target_id: string; distance: number }[];
}

// --- 유틸리티: ts(2532) 에러 방지용 안전한 시간 포맷터 ---
const formatTimestamp = (isoString: string): string => {
  if (!isoString) return '00:00:00';
  const parts = isoString.split('T');
  if (parts.length < 2) return '00:00:00'; // 배열 인덱스 접근 전 길이 체크

  const timePart = parts[1] ?? '';
  return timePart.split('.')[0] ?? '00:00:00';
};

export default function GameCanvas() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [remainingTargets] = useState<Target[]>([
    { id: 'tree_01', x: 200, y: 300 },
    { id: 'bird_02', x: 500, y: 150 },
    { id: 'item_03', x: 700, y: 400 },
  ]);

  const [isThrottled, setIsThrottled] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const lastClickTime = useRef<number>(0);
  const THROTTLE_TIME = 500;

  // --- 백엔드 전송 함수 (FastAPI) ---
  const sendLogToBackend = async (logData: LogEntry) => {
    /* try {
      const response = await fetch('https://your-fastapi-server.com/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (!response.ok) console.error('서버 전송 실패');
    } catch (error) {
      console.error('네트워크 에러:', error);
    } */

    // 테스트용 이미지
    // 실제 API 호출 대신 콘솔에 출력하여 테스트
    console.log('🚀 [Mock API] 백엔드로 전송될 데이터:', logData);

    // 1초 뒤에 전송 성공했다고 가정하는 가짜 비동기 로직
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  useEffect(() => {
    try {
      // 1. 워커 초기화 (public/workers/distance.worker.js)
      workerRef.current = new Worker('/workers/distance.worker.js');

      // 2. 워커 응답 처리 및 백엔드 전송
      workerRef.current.onmessage = async (e: MessageEvent) => {
        const { eventId, distances } = e.data;

        setLogs((prev) =>
          prev.map((log) => {
            if (log.event_id === eventId) {
              const isHit = distances.some((d: any) => d.distance < 30);
              const updatedLog: LogEntry = {
                ...log,
                distances_to_remaining_targets: distances,
                result_type: isHit ? 'HIT' : 'MISS',
              };

              // 데이터가 완성된 시점에 백엔드로 전송
              sendLogToBackend(updatedLog);
              return updatedLog;
            }
            return log;
          }),
        );
      };
    } catch (error) {
      console.error('Worker 초기화 실패:', error);
    }

    return () => workerRef.current?.terminate();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();

    // 3. 스로틀링 로직 적용
    if (now - lastClickTime.current < THROTTLE_TIME) return;
    lastClickTime.current = now;

    // 클릭 직후 스로틀링 상태 활성화
    setIsThrottled(true);

    // Throttle_time 후에 스로틀링 상태 해제
    setTimeout(() => {
      setIsThrottled(false);
    }, THROTTLE_TIME);

    // 4. 좌표 계산 및 로그 생성
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const eventId = crypto.randomUUID();
    const newLog: LogEntry = {
      event_id: eventId,
      user_id: '',
      game_id: 'discoverex_map_01',
      click_coordinate: { x, y },
      timestamp: new Date().toISOString(),
      result_type: 'PENDING',
      distances_to_remaining_targets: [],
    };

    setLogs((prev) => [...prev, newLog]);

    // 5. 워커에 계산 위임
    workerRef.current?.postMessage({
      eventId,
      clickCoord: { x, y },
      remainingTargets,
    });
  };

  return (
    <div className="flex flex-col items-center w-full p-4 bg-slate-900 min-h-screen text-white">
      <div
        onClick={handleClick}
        className={`relative w-full h-[500px] bg-slate-800 border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl transition-all ${
          isThrottled ? 'cursor-not-allowed opacity-80' : 'cursor-default'
        }`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* 타겟 위치 시각화 (테스트용) */}
        {remainingTargets.map((t) => (
          <div
            key={t.id}
            className="absolute w-6 h-6 border-2 border-dashed border-white/20 rounded-full pointer-events-none"
            style={{ left: t.x - 12, top: t.y - 12 }}
          />
        ))}
      </div>

      <div className="mt-6 w-full max-w-4xl">
        <h3 className="text-lg font-bold mb-3 text-blue-400">전송된 실시간 로그</h3>
        <div className="h-48 overflow-y-auto bg-black/50 rounded-lg p-4 font-mono text-xs border border-white/10">
          {logs
            .slice()
            .reverse()
            .map((log) => (
              <div key={log.event_id} className="mb-2 border-b border-white/5 pb-1 flex justify-between">
                <span>
                  <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span> ID:{' '}
                  {log.event_id.slice(0, 8)} | ({Math.round(log.click_coordinate.x)},{' '}
                  {Math.round(log.click_coordinate.y)})
                </span>
                <span className={`font-bold ${log.result_type === 'HIT' ? 'text-green-400' : 'text-red-400'}`}>
                  {log.result_type}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

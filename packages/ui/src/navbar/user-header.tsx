"use client";

import React from "react";
import { useAuth } from "../auth";
import Image from "next/image";
import { getLoginUrl } from "../auth";

interface UserHeaderProps {
  initialUser?: any | null;
}

export default function UserHeader({
  initialUser,
}: UserHeaderProps): React.JSX.Element {
  const { user: authUser, logout, loading } = useAuth();

  // authUser가 있으면 무조건 최우선, 없으면 initialUser를 폴백으로 사용
  // 단, 로딩이 완전히 끝났는데(!loading) authUser가 없다면 정말 없는 것이므로 null이 됨
  const user = authUser || (loading ? initialUser : null);

  // 로딩 중이고 아직 유저 정보가 확정되지 않았다면 아무것도 보여주지 않거나 스켈레톤 표시 (깜빡임 방지)
  if (loading && !user) {
    return (
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full"></div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end shrink-0">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight">
              {user.displayName || user.email?.split("@")[0]}
            </span>
            <button
              onClick={logout}
              className="text-[10px] text-gray-500 hover:text-error transition-colors uppercase tracking-widest font-bold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
          <div className="avatar shrink-0">
            <div className="rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100 overflow-hidden shadow-sm">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="profile"
                  width={45}
                  height={45}
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white w-full h-full flex items-center justify-center font-bold text-lg">
                  {user.email?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <a
          href={getLoginUrl()}
          className="btn btn-primary btn-sm rounded-full px-5 shadow-sm text-xs font-bold"
        >
          Login
        </a>
      )}
    </div>
  );
}

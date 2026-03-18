"use client";

import React from "react";
import { useAuth } from "../auth";
import Image from "next/image";

export default function UserHeader(): React.JSX.Element {
  const { user, logout } = useAuth();

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
          href={
            process.env.NODE_ENV === "production"
              ? "https://discoverex-game-hub-329947062450.asia-northeast3.run.app/login"
              : "http://localhost:3000/login"
          }
          className="btn btn-primary btn-sm rounded-full px-5 shadow-sm text-xs font-bold"
        >
          Login
        </a>
      )}
    </div>
  );
}

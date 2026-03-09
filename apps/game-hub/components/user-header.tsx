'use client';

import { useAuth } from '../context/auth-context';
import Link from 'next/link';
import Image from 'next/image';

export default function UserHeader() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold">{user.displayName || user.email}</span>
            <button onClick={logout} className="text-[10px] text-gray-500 hover:text-error underline cursor-pointer">
              로그아웃
            </button>
          </div>
          <div className="avatar">
            <div className="relative w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
              {user.photoURL ? (
                <Image src={user.photoURL} fill alt="profile" className='object-cover rounded full' />
              ) : (
                <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center">
                  <span>{user.email?.[0]?.toUpperCase() ?? ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Link href="/login" className="btn btn-ghost btn-sm">
          로그인
        </Link>
      )}
    </div>
  );
}

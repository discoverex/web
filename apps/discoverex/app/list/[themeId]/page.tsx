import React from 'react';
import { getTheme } from '@/app/api/theme-apis';
import ThemeContainer from '@/app/list/[themeId]/components/theme-container';

type ThemePageProps = {
  params: Promise<{ themeId: string }>;
};

const Page = async ({ params }: ThemePageProps) => {
  const { themeId } = await params;
  const themeData = await getTheme(themeId);

  return <ThemeContainer themeData={themeData} />;
};

export default Page;

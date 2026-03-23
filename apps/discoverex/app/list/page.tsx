import ThemeListContainer from '@/app/components/theme-list-container';
import { getThemes } from '@/app/api/theme-apis';

export default async function Home() {
  const themes = await getThemes();
  return <ThemeListContainer themes={themes} />;
}

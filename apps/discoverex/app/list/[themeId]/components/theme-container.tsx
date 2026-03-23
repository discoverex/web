import React from 'react';
import { Theme } from '@/types/game';
import { GameBoard } from '@/app/list/[themeId]/components/views/game-board';

type ThemeContainerProps = {
  themeData: Theme | null;
};

const ThemeContainer = ({ themeData }: ThemeContainerProps) => {
  if (themeData) {
    const { theme, manifest, layers } = themeData;
    return <GameBoard theme={theme} manifest={manifest} layerItems={layers} />;
  }
};

export default ThemeContainer;

import React from 'react';
import { Theme } from '@/types/game';
import { GameBoard } from '@/app/list/[themeId]/components/views/game-board';

type ThemeContainerProps = {
  themeData: Theme | null;
};

const ThemeContainer = ({ themeData }: ThemeContainerProps) => {
  if (themeData) {
    const { manifest, layers, lottie } = themeData;
    return <GameBoard manifest={manifest} layerItems={layers} lottie={lottie} />;
  }
};

export default ThemeContainer;

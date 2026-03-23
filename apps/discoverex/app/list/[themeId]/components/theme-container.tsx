import React from 'react';
import { Theme } from '@/types/game';

type ThemeContainerProps = {
  theme: Theme | null;
};

const ThemeContainer = ({ theme }: ThemeContainerProps) => {
  return <div>{theme?.theme}</div>;
};

export default ThemeContainer;

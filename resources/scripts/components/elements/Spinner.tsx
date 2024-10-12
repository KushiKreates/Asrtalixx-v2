/* eslint-disable prettier/prettier */

import React, { Suspense } from 'react';
import styled, { keyframes } from 'styled-components';

export type SpinnerSize = 'small' | 'base' | 'large';

interface Props {
  size?: SpinnerSize;
  centered?: boolean;
  color?: string;
}

interface Spinner extends React.FC<Props> {
  Size: Record<'SMALL' | 'BASE' | 'LARGE', SpinnerSize>;
  Suspense: React.FC<Props>;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const getSize = (size: SpinnerSize) => {
  switch (size) {
    case 'small':
      return '24px';
    case 'large':
      return '64px';
    default:
      return '40px';
  }
};

const SpinnerComponent = styled.div<Props>`
  width: ${props => getSize(props.size || 'base')};
  height: ${props => getSize(props.size || 'base')};
  position: relative;
  animation: ${pulse} 1s ease-in-out infinite;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    animation: ${spin} 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  &::before {
    width: 100%;
    height: 100%;
    border: 3px solid ${props => props.color || '#5865F2'};
    border-top-color: transparent;
    border-left-color: transparent;
  }

  &::after {
    width: 75%;
    height: 75%;
    border: 3px solid ${props => props.color || '#5865F2'};
    border-bottom-color: transparent;
    border-right-color: transparent;
    top: 12.5%;
    left: 12.5%;
    animation-duration: 1.2s;
    animation-direction: reverse;
  }
`;

const CenteredContainer = styled.div<{ size?: SpinnerSize }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: ${props => props.size === 'large' ? '5rem' : '1.5rem'} 0;
`;

const Spinner: Spinner = ({ centered, ...props }) =>
  centered ? (
    <CenteredContainer size={props.size}>
      <SpinnerComponent {...props} />
    </CenteredContainer>
  ) : (
    <SpinnerComponent {...props} />
  );

Spinner.displayName = 'Spinner';

Spinner.Size = {
  SMALL: 'small',
  BASE: 'base',
  LARGE: 'large',
};

Spinner.Suspense = ({ children, centered = true, size = Spinner.Size.LARGE, ...props }) => (
  <Suspense fallback={<Spinner centered={centered} size={size} {...props} />}>
    {children}
  </Suspense>
);
Spinner.Suspense.displayName = 'Spinner.Suspense';

export default Spinner;
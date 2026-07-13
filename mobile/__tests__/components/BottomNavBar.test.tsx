import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { BottomNavBar } from '../../src/components/BottomNavBar';

describe('BottomNavBar', () => {
  it('renders all nav items and the center cart button', async () => {
    await render(
      <BottomNavBar active="home" cartCount={0} onNavigate={jest.fn()} onPressCart={jest.fn()} />,
    );

    expect(screen.getByTestId('bottom-nav-home')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-more')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-cart-center')).toBeTruthy();
    expect(screen.queryByTestId('bottom-nav-cart-badge')).toBeNull();
  });

  it('shows the cart badge when cartCount is greater than zero', async () => {
    await render(
      <BottomNavBar active="home" cartCount={3} onNavigate={jest.fn()} onPressCart={jest.fn()} />,
    );

    expect(screen.getByTestId('bottom-nav-cart-badge')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('calls onNavigate with the pressed item key', async () => {
    const onNavigate = jest.fn();
    await render(
      <BottomNavBar active="home" cartCount={0} onNavigate={onNavigate} onPressCart={jest.fn()} />,
    );

    await fireEvent.press(screen.getByTestId('bottom-nav-more'));

    expect(onNavigate).toHaveBeenCalledWith('more');
  });

  it('calls onPressCart when the center button is pressed', async () => {
    const onPressCart = jest.fn();
    await render(
      <BottomNavBar active="home" cartCount={0} onNavigate={jest.fn()} onPressCart={onPressCart} />,
    );

    await fireEvent.press(screen.getByTestId('bottom-nav-cart-center'));

    expect(onPressCart).toHaveBeenCalledTimes(1);
  });
});

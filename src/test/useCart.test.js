import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../hooks/useCart';

const CART_KEY = 'dety_cart';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

const product1 = { id: 1, name: 'Almofada', price: 80, stock: 10 };
const product2 = { id: 2, name: 'Boneca', price: 120, stock: 5 };

describe('useCart', () => {
  it('inicia com carrinho vazio', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.cartItems).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('addToCart adiciona produto com quantidade 1', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(1);
    expect(result.current.cartItems[0].id).toBe(1);
  });

  it('addToCart incrementa quantidade de produto já no carrinho', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.addToCart(product1));
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
  });

  it('addToCart adiciona produtos diferentes separadamente', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.addToCart(product2));
    expect(result.current.cartItems).toHaveLength(2);
  });

  it('updateQuantity altera quantidade do produto', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.updateQuantity(1, 5));
    expect(result.current.cartItems[0].quantity).toBe(5);
  });

  it('updateQuantity com quantidade 0 remove o produto', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.updateQuantity(1, 0));
    expect(result.current.cartItems).toHaveLength(0);
  });

  it('updateQuantity com quantidade negativa remove o produto', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.updateQuantity(1, -1));
    expect(result.current.cartItems).toHaveLength(0);
  });

  it('removeItem remove produto específico', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.addToCart(product2));
    act(() => result.current.removeItem(1));
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].id).toBe(2);
  });

  it('clearCart esvazia o carrinho', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.addToCart(product2));
    act(() => result.current.clearCart());
    expect(result.current.cartItems).toHaveLength(0);
  });

  it('totalItems soma todas as quantidades', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.addToCart(product1));
    act(() => result.current.addToCart(product2));
    expect(result.current.totalItems).toBe(3);
  });

  it('totalPrice calcula o valor total corretamente', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1)); // 80
    act(() => result.current.addToCart(product2)); // 120
    expect(result.current.totalPrice).toBe(200);
  });

  it('persiste carrinho no localStorage ao adicionar item', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe(1);
  });

  it('persiste carrinho no localStorage ao remover item', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addToCart(product1));
    act(() => result.current.addToCart(product2));
    act(() => result.current.removeItem(1));
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    expect(saved).toHaveLength(1);
  });

  it('restaura carrinho do localStorage ao inicializar', () => {
    localStorage.setItem(CART_KEY, JSON.stringify([{ ...product1, quantity: 3 }]));
    const { result } = renderHook(() => useCart());
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(3);
  });

  it('inicia com array vazio se localStorage corrompido', () => {
    localStorage.setItem(CART_KEY, 'invalid-json{{{');
    const { result } = renderHook(() => useCart());
    expect(result.current.cartItems).toEqual([]);
  });
});

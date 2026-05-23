import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TotalScore } from '../components/DecisionViews';
import { ProsConsData } from '../types';

describe('TotalScore', () => {
  const mockData: ProsConsData = {
    summary: 'Test summary',
    pros: [
      { id: 'p1', text: 'Pro 1', explanation: 'exp1' },
      { id: 'p2', text: 'Pro 2', explanation: 'exp2' },
    ],
    cons: [
      { id: 'c1', text: 'Con 1', explanation: 'exp3' },
    ]
  };

  it('calculates diff correctly with default weights', () => {
    // 2 pros, 1 con. Weights default to 1. Diff should be +1.
    render(<TotalScore data={mockData} weights={{}} />);
    expect(screen.getByText('+1')).toBeDefined();
  });

  it('calculates diff correctly with custom weights', () => {
    const weights = {
      p1: 3,
      p2: 2,
      c1: 5
    };
    // pros = 3 + 2 = 5
    // cons = 5
    // Diff = 0
    render(<TotalScore data={mockData} weights={weights} />);
    expect(screen.getByText('0')).toBeDefined();
  });

  it('displays negative score when cons outweigh pros', () => {
    const weights = {
      p1: 1,
      p2: 1,
      c1: 5
    };
    // pros = 2, cons = 5 -> Diff = -3
    render(<TotalScore data={mockData} weights={weights} />);
    expect(screen.getByText('-3')).toBeDefined();
  });
});

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// This is a simple example test
describe('Example Test', () => {
  it('renders without crashing', () => {
    // Render a simple component
    render(<div data-testid="test-element">Hello World</div>);
    
    // Check if the component is rendered
    const element = screen.getByTestId('test-element');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });
});

// Example of testing a utility function
describe('Utility Functions', () => {
  it('adds two numbers correctly', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(1, 2)).toBe(3);
  });
});

// Example of mocking a component
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
  }),
}));

describe('Router Mock', () => {
  it('mocks the router correctly', () => {
    const { useRouter } = require('next/router');
    const router = useRouter();
    
    expect(router.pathname).toBe('/');
    expect(router.query).toEqual({});
  });
}); 
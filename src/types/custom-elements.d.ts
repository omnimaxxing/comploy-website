declare namespace JSX {
  interface IntrinsicElements {
    // Define the custom elements from ldrs
    'l-orbit': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      size?: string;
      speed?: string;
      color?: string;
    };
    'l-pulsar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      size?: string;
      speed?: string;
      color?: string;
    };
    'l-ring': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      size?: string;
      speed?: string;
      color?: string;
      stroke?: string;
      bg?: string;
    };
    'l-bouncy': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      size?: string;
      speed?: string;
      color?: string;
    };
  }
} 
// Type definitions for the application

export interface Dependency {
  name: string;
  explanation: string;
}

export interface Dependencies {
  [feature: string]: {
    Primary: string[];
    [key: string]: string[];
  };
}

export interface SelectedDependencies {
  [feature: string]: string[];
}

export interface Beliefs {
  [feature: string]: {
    Primary: string[];
    [key: string]: string[];
  };
}

export interface Desires {
  [feature: string]: string;
}

export interface Intentions {
  [feature: string]: string;
}

export interface Rewards {
  [feature: string]: {
    success: number;
    penalty: number;
  };
}

export interface AIResponse {
  dependencies: {
    Primary: string[];
    [key: string]: string[];
  };
  explanations: Record<string, string>;
}

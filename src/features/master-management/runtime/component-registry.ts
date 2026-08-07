import React from 'react';

export interface FieldProps {
  name: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  error?: string;
}

export type ComponentRenderer = React.ComponentType<FieldProps>;

class ComponentRegistryImpl {
  private renderers = new Map<string, ComponentRenderer>();

  register(name: string, renderer: ComponentRenderer): void {
    this.renderers.set(name, renderer);
  }

  get(name: string): ComponentRenderer | undefined {
    return this.renderers.get(name);
  }

  has(name: string): boolean {
    return this.renderers.has(name);
  }
}

export const ComponentRegistry = new ComponentRegistryImpl();

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Icons, Close, PlusCircle, Verified, NotVerified, Warning, WarningCircle, Gear, Probe, Barcode, Trash, Filter, Reset, Save, Vector, Duplicate, Triangle } from '~/components/svg';
import React from 'react';

const testIconWithColor = (Icon: React.ComponentType<React.SVGProps<SVGSVGElement>  >, color: string) => {
  const { container } = render(React.createElement(Icon, { stroke: color }));
  const path = container.querySelector('path');
  const hasStroke = path?.getAttribute('stroke') === color;
  const hasFill = path?.getAttribute('fill') === color;
  expect(hasStroke || hasFill).toBe(true);
};

const testAllIconsWithColor = (color: string) => {
  Object.entries(Icons).forEach(([, Icon]) => {
    testIconWithColor(Icon, color);
  });
};

const testIndividualIcon = (name: string, Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>) => {
  it(`should render ${name} icon`, () => {
    const { container } = render(React.createElement(Icon));
    expect(container.firstChild).toBeInTheDocument();
  });

  it(`should render ${name} icon with custom className`, () => {
    const { container } = render(React.createElement(Icon, { className: 'custom-class' }));
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it(`should render ${name} icon with custom stroke color`, () => {
    const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080'];
    testColors.forEach(color => testIconWithColor(Icon, color));
  });
};

describe('SVG Icons', () => {
  describe('Icons Record', () => {
    it('should render all icons with default props', () => {
      Object.entries(Icons).forEach(([Icon]) => {
        const { container } = render(React.createElement(Icon));
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should render icons with custom className', () => {
      Object.entries(Icons).forEach(([Icon]) => {
        const { container } = render(React.createElement(Icon, { className: 'custom-class' }));
        expect(container.firstChild).toHaveClass('custom-class');
      });
    });

    it('should render icons with custom stroke color', () => {
      const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080'];
      testColors.forEach(testAllIconsWithColor);
    });
  });

  describe('Individual Icons', () => {
    const icons = [
      { name: 'Close', component: Close },
      { name: 'PlusCircle', component: PlusCircle },
      { name: 'Verified', component: Verified },
      { name: 'NotVerified', component: NotVerified },
      { name: 'Warning', component: Warning },
      { name: 'WarningCircle', component: WarningCircle },
      { name: 'Gear', component: Gear },
      { name: 'Probe', component: Probe },
      { name: 'Barcode', component: Barcode },
      { name: 'Trash', component: Trash },
      { name: 'Filter', component: Filter },
      { name: 'Reset', component: Reset },
      { name: 'Save', component: Save },
      { name: 'Vector', component: Vector },
      { name: 'Duplicate', component: Duplicate },
      { name: 'Triangle', component: Triangle }
    ];

    icons.forEach(({ name, component: Icon }) => {
      testIndividualIcon(name, Icon);
    });
  });
}); 
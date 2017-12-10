import * as React from 'react';

export class AppStats extends React.Component {
  domNode: HTMLDivElement;
  stats: any;

  componentDidMount () {
    const stats = this.stats = new (require('stats.js') as any)();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.style.position = '';
    stats.dom.style.top = '';
    stats.dom.style.left = '';

    this.domNode.appendChild(this.stats.dom);

    const animationFrame = () => {
      stats.end();
      stats.begin();
      if (this.stats) {
        requestAnimationFrame(animationFrame);
      }
    };

    requestAnimationFrame(animationFrame);
  }

  componentWillUnmount () {
    this.stats.dom.remove();
    delete this.stats;
  }

  render () {
    return <div ref={(node) => this.domNode = node}/>;
  }
}

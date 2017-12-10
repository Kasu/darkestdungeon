import * as React from 'react';
import {todo} from '../config/general';

export class QuirkFaces extends React.Component {
  render () {
    return (
      <div>
        Quirk faces {todo}
      </div>
    );
  }
}

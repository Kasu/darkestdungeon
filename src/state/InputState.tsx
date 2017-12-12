import * as React from 'react';
import * as PropTypes from 'prop-types';
import {v4 as uuid} from 'uuid';

export type InputLayerId = string;
export type InputBindingId = string;
export type InputHandlerContext = {inputHandler: InputHandler};
export type InputLayerContext = {inputLayerId: InputLayerId};
export type InputBindingMatch = string;
export type InputBindingCallback = (e: KeyboardEvent) => void;
export type InputBindingProps = {
  match: InputBindingMatch,
  callback: InputBindingCallback;
  global?: boolean
};

export class InputHandler {
  bindings = new Map<InputBindingId, InputBinding>();
  layerId: InputLayerId;

  startListening () {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDown.bind(this));
    }
  }

  stopListening () {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDown.bind(this));
    }
  }

  onKeyDown (e: KeyboardEvent) {
    // Get current bindings since side effects may cause new bindings
    const bindingsAtKeypress = Array.from(this.bindings.values());
    let didMatch = false;

    for (const binding of bindingsAtKeypress) {
      const isLayerMatch = binding.props.global || !this.layerId || this.layerId === binding.context.inputLayerId;
      if (isLayerMatch && binding.props.callback && e.key.toLowerCase() === binding.props.match.toLowerCase()) {
        binding.props.callback(e);
        didMatch = true;
      }
    }

    if (didMatch) {
      e.preventDefault();
    }
  }
}

export const inputHandlerContext = {
  inputHandler: PropTypes.instanceOf(InputHandler)
};

export class InputRoot extends React.Component<{
  className?: string,
  style?: any
}> {
  static childContextTypes = inputHandlerContext;
  inputHandler = new InputHandler();

  getChildContext (): InputHandlerContext {
    return {
      inputHandler: this.inputHandler
    };
  }

  componentWillMount () {
    this.inputHandler.startListening();
  }

  componentWillUnmount () {
    this.inputHandler.stopListening();
  }

  render () {
    return (
      <div {...this.props}>
        {this.props.children}
      </div>
    );
  }
}

export const inputLayerContext = {
  inputLayerId: PropTypes.string
};

export class InputLayer extends React.Component<{
  id: InputLayerId,
  className?: string,
  style?: any
}> {
  static childContextTypes = inputLayerContext;

  getChildContext (): InputLayerContext {
    return {
      inputLayerId: this.props.id
    };
  }

  render () {
    const {id, ...rest} = this.props;
    return (
      <div {...rest}>
        {this.props.children}
      </div>
    );
  }
}

export class InputBindings extends React.Component<{
  list: Array<[InputBindingMatch, InputBindingCallback] | InputBindingProps>
}> {
  render () {
    return this.props.list.filter((entry) => entry)
      .map((props: any, index) => {
        if (Array.isArray(props)) {
          return <InputBinding key={index} match={props[0]} callback={props[1]}/>;
        }
        return <InputBinding key={index} {...props}/>;
      });
  }
}

export class InputBinding extends React.Component<InputBindingProps> {
  static contextTypes = {
    ...inputHandlerContext,
    ...inputLayerContext
  };
  context: InputHandlerContext & InputLayerContext;
  id: InputBindingId = uuid();

  componentWillMount () {
    this.context.inputHandler.bindings.set(this.id, this);
  }

  componentWillUpdate () {
    this.context.inputHandler.bindings.set(this.id, this);
  }

  componentWillUnmount () {
    this.context.inputHandler.bindings.delete(this.id);
  }

  render (): null {
    return null;
  }
}

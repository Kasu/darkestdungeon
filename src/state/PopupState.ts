import * as React from 'react';
import {ReactElement} from 'react';
import {computed, observable, reaction, transaction} from 'mobx';
import {Point} from '../Bounds';
import uuid = require('uuid');
import {Layer} from '../ui/Layer';

export type PopupId = string;
export type PopupContent<P = {}> = ReactElement<P> | string;

type PopupHandleProps<P> = {
  content: PopupContent<P>,
  align?: PopupAlign,
  position?: Point,
  modalState?: ModalState,
  animate?: boolean,
  layer?: Layer,
  id?: PopupId,
  onClose?: () => void
};

type PopupHandlePropsOrContent<P> = PopupHandleProps<P> | PopupContent<P>;

function ensureProps<P> (arg: PopupHandlePropsOrContent<P>): PopupHandleProps<P> {
  if (typeof arg === 'string' || React.isValidElement(arg)) {
    return {content: arg};
  }
  return arg;
}

export class PopupState {
  @observable map = new Map<PopupId, PopupHandle>();

  @computed get top () {
    const modals = Array.from(this.map.values())
      .filter((p) => p.modalState !== ModalState.Opaque);
    return modals[modals.length - 1];
  }

  show <P> (arg: PopupHandlePropsOrContent<P>): PopupHandle<P> {
    const popup = new PopupHandle<P>(ensureProps(arg), this);

    this.map.set(popup.id, popup);
    this.bringToFront(popup.id);

    return popup;
  }

  prompt <P> (arg: PopupHandlePropsOrContent<P>) {
    return new Promise ((resolve) => {
      const props = ensureProps(arg);
      const popup = this.show({modalState: ModalState.Modal, ...props});
      const disposeReaction = reaction(
        () => this.map.has(popup.id),
        (popupExists: boolean) => {
          if (!popupExists) {
            disposeReaction();
            resolve(popup.resolution);
          }
        }
      );
    });
  }

  close (id: PopupId) {
    const popup = this.map.get(id);
    if (popup) {
      this.map.delete(id);
      if (popup.onClose) {
        popup.onClose();
      }
    }
  }

  bringToFront (id: PopupId) {
    transaction(() => {
      const popup = this.map.get(id);
      if (popup) {
        this.map.delete(id);
        this.map.set(id, popup);
      }
    });
  }

  closeAll () {
    transaction(() => {
      const popupIds = Array.from(this.map.keys());
      for (const id of popupIds) {
        this.close(id);
      }
    });
  }
}

export class PopupHandle<P = {}> implements PopupHandleProps<P> {
  public id: PopupId = uuid();
  public content: PopupContent<P>;
  public align: PopupAlign = PopupAlign.Center;
  public modalState: ModalState = ModalState.ModalDismiss;
  public animate: boolean = true;
  public resolution: any;
  public layer?: Layer = Layer.Popups;
  public onClose?: () => void;

  @observable public position?: Point;

  constructor (
    props: PopupHandleProps<P>,
    private state: PopupState
  ) {
    for (const key in props) {
      (this as any)[key] = (props as any)[key];
    }
  }

  close (resolution?: any) {
    this.resolution = resolution;
    this.state.close(this.id);
  }

  bringToFront () {
    this.state.bringToFront(this.id);
  }
}

export enum PopupAlign {
  Top,
  Right,
  Bottom,
  Left,
  Center,
  TopLeft
}

export enum ModalState {
  Opaque,
  Modal,
  ModalDismiss
}

import {removeItem} from '../lib/Helpers';

export class TokenOwner {
  lent: Token[] = [];

  return (token: Token) {
    removeItem(this.lent, token);
  }

  borrow () {
    const token = new Token(this);
    this.lent.push(token);
    return token;
  }
}

class Token {
  constructor (
    private owner: TokenOwner
  ) {}

  return () {
    this.owner.return(this);
  }
}

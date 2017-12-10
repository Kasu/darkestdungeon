export function moveItem <T> (item: T, fromList: T[], toList: T[]) {
  removeItem(fromList, item);
  removeItem(toList, item);
  toList.push(item);
}

export function removeItem <T> (list: T[], item: T) {
  const index = list.indexOf(item);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

export function removeItems <T> (list: T[], items: T[]) {
  items.forEach(removeItem.bind(null, list));
}

export function findSubset <T> (needles: T[], haystack: T[]) {
  const subset: T[] = [];
  for (const needle of needles) {
    if (contains(haystack, needle)) {
      subset.push(needle);
    }
  }
  return subset;
}

export function without <T> (all: T[], remove: T[]) {
  const slice = all.slice();
  remove.forEach(removeItem.bind(null, slice));
  return slice;
}

export function unique <T> (list: T[]) {
  const uniqueList: T[] = [];
  list.forEach((item) => {
    if (!contains(uniqueList, item)) {
      uniqueList.push(item);
    }
  });
  return uniqueList;
}

export function contains <T> (haystack: T[], needle: T) {
  return haystack.indexOf(needle) !== -1;
}

export function count (n: number) {
  return range(1, n + 1);
}

export function range (start: number, end: number) {
  const list = [];
  for (let i = start; i < end; i += 1) {
    list.push(i);
  }
  return list;
}

export function mapMap<K, V, T> (map: Map<K, V>, getItem: (v: V, k: K) => T) {
  const items: T[] = [];
  map.forEach((v, k) => items.push(getItem(v, k)));
  return items;
}

export function replaceMap<V> (map: Map<string, V>, dict: {[key: string]: V}) {
  map.clear();
  for (const key in dict) {
    map.set(key, dict[key]);
  }
  return map;
}

export function enumMap<T> (e: any): Map<string, T> {
  const map = new Map<string, T>();
  const enumKeys = Object.keys(e);
  for (const key of enumKeys) {
    if (isNaN(parseInt(key, 10))) {
      map.set(key, e[key]);
    }
  }
  return map;
}

export function cap (value: number, min: number, max: number) {
  if (value < min) {
    return min;
  } if (value > max) {
    return max;
  }
  return value;
}

export function compact<T> (items: T[]) {
  return items.filter((item) => item);
}

export function cmp <T> (a: T, b: T) {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

export function thousands (n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function randomizeItem<T> (items: T[]): T {
  const index = Math.floor(items.length * Math.random());
  return items[index];
}

export function randomizeItems<T> (items: T[], min: number = 1, max: number = items.length): T[] {
  if (max > items.length) {
    max = items.length;
  }
  if (min > items.length) {
    min = items.length;
  }

  let amount = min + Math.floor(Math.random() * (max - min));
  const itemsLeft = items.slice();
  const selectedItems: T[] = [];
  while (amount > 0) {
    const index = Math.floor(itemsLeft.length * Math.random());
    selectedItems.push(itemsLeft.splice(index, 1)[0]);
    amount -= 1;
  }
  return selectedItems;
}

export function wait (time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function addArrays (a: Array<number | boolean>, b: Array<number | boolean>) {
  const sum: number[] = [];
  for (let i = 0; i < a.length; i += 1) {
    sum.push(a[i] as any + b[i]);
  }
  return sum;
}

export function permutations <T> (a: T[], min: number, max: number = min): T[][] {
  const all: T[][] = [];
  for (let i = min; i <= max; i += 1) {
    permutationFn(i, a, [], all);
  }
  if (a.length >= min && a.length <= max) {
    all.push(a);
  }
  return all;
}

function permutationFn <T> (n: number, src: T[], got: T[], all: T[][]) {
  if (n === 0) {
    if (got.length > 0) {
      all[all.length] = got;
    }
    return;
  }
  for (let j = 0; j < src.length; j += 1) {
    permutationFn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
  }
  return;
}

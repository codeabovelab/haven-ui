//code for parsing unix-style cmd lines
const escapes = new Set(['\\', ' ', '\'', '\"']);

export function parseStr(str) {
  let args = [];
  let arg = '';

  function push() {
    let tr = arg.trim();
    if (tr.length === 0) {
      return;
    }
    args.push(tr);
    arg = '';
  }

  let quote = null;
  let escape = false;
  for (let i = 0; i < str.length; i++) {
    let ch = str.charAt(i);
    if (!escape && ch === '\\') {
      let nexti = i + 1;
      if (nexti < str.length && escapes.has(str.charAt(nexti))) {
        escape = true;
        continue;
      }
    }
    if (escape) {
      escape = false;
    } else {
      if (quote) {
        if (ch === quote) {
          quote = null;
          push();
          continue;
        }
      } else if (ch === ' ') {
        push();
        continue;
      } else if (ch === '\"' || ch === '\'') {
        quote = ch;
        continue;
      }
    }
    arg += ch;
  }
  push();
  return args;
}

export function joinArr(args) {
  let str = '';

  function append(arg) {
    for (let i = 0; i < arg.length; ++i) {
      let ch = arg.charAt(i);
      if (escapes.has(ch)) {
        str += '\\';
      }
      str += ch;
    }
  }

  for (let arg of args) {
    if (str.length !== 0) {
      str += ' ';
    }
    append(arg);
  }
  return str;
}



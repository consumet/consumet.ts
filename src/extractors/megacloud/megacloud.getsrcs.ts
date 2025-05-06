// solution inspired from https://github.com/drblgn/rabbit_wasm/blob/main/rabbit.ts

import { decoded_png } from './megacloud.decodedpng';
import util from 'util';
import CryptoJS from 'crypto-js';
import { webcrypto } from 'crypto';
import { USER_AGENT } from '../../utils/utils';

const user_agent = USER_AGENT;

const crypto = webcrypto as unknown as Crypto;
let wasm: any;
let arr = new Array(128).fill(void 0);
let dateNow = Date.now();
let content: string = '';
let referer = '';

function isDetached(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength === 0) {
    const formatted = util.format(buffer);
    return formatted.includes('detached');
  }
  return false;
}

const dataURL =
  'data:image/png;base64,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JDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAtwCFrnv+pEcAAQQQECJAoQsZJDEQQAABBHQLUOi65096BBBAAAEhAhS6kEESAwEEEEBAt8D/ATY93seMmImHAAAAAElFTkSuQmCC';

const meta = {
  content: content,
};

const image_data = {
  height: 50,
  width: 65,
  data: decoded_png,
};

interface fakeLocalStorage {
  [key: string]: string | Function;
  setItem: Function;
}

interface fakeWindow {
  localStorage: fakeLocalStorage;
  [key: string]: any;
}

const canvas = {
  baseUrl: 'https://megacloud.tv/embed-2/e-1/1hnXq7VzX0Ex?k=1',
  width: 0,
  height: 0,
  style: {
    style: {
      display: 'inline',
    },
  },
  context2d: {},
};

const fake_window: fakeWindow = {
  localStorage: {
    setItem: function (item: string, value: string) {
      fake_window.localStorage[item] = value;
    },
  },
  error: false,
  navigator: {
    webdriver: false,
    userAgent: user_agent,
  },
  length: 0,
  document: {
    cookie: '',
  },

  origin: 'https://megacloud.tv',
  location: {
    href: 'https://megacloud.tv/embed-2/e-1/1hnXq7VzX0Ex?k=1',
    origin: 'https://megacloud.tv',
  },
  performance: {
    timeOrigin: dateNow,
  },
  xrax: '',
  c: false,
  G: '',
  z: function (a: number) {
    return [(4278190080 & a) >> 24, (16711680 & a) >> 16, (65280 & a) >> 8, 255 & a];
  },
  crypto: crypto,
  msCrypto: crypto,
  browser_version: 1878522368,
};

const nodeList = {
  image: {
    src: 'https://megacloud.tv/images/image.png?v=0.1.0',
    height: 50,
    width: 65,
    complete: true,
  },
  context2d: {},
  length: 1,
};

function get(index: number) {
  return arr[index];
}

arr.push(void 0, null, true, false);

let size = 0;
let memoryBuff: Uint8Array | null;

//fix this
function getMemBuff(): Uint8Array {
  return (memoryBuff =
    null !== memoryBuff && 0 !== memoryBuff.byteLength ? memoryBuff : new Uint8Array(wasm.memory.buffer));
}

const encoder = new TextEncoder();
const encode = function (text: string, array: Uint8Array) {
  return encoder.encodeInto(text, array);
};

function parse(text: string, func: Function, func2: Function) {
  if (void 0 === func2) {
    var encoded = encoder.encode(text);
    const parsedIndex = func(encoded.length, 1) >>> 0;
    return (
      getMemBuff()
        .subarray(parsedIndex, parsedIndex + encoded.length)
        .set(encoded),
      (size = encoded.length),
      parsedIndex
    );
  }
  let len = text.length;
  let parsedLen = func(len, 1) >>> 0;
  var new_arr = getMemBuff();
  let i = 0;
  for (; i < len; i++) {
    var char = text.charCodeAt(i);
    if (127 < char) {
      break;
    }
    new_arr[parsedLen + i] = char;
  }
  return (
    i !== len &&
      (0 !== i && (text = text.slice(i)),
      (parsedLen = func2(parsedLen, len, (len = i + 3 * text.length), 1) >>> 0),
      (encoded = getMemBuff().subarray(parsedLen + i, parsedLen + len)),
      (i += encode(text, encoded).written),
      (parsedLen = func2(parsedLen, len, i, 1) >>> 0)),
    (size = i),
    parsedLen
  );
}

let dataView: DataView | null;

function isNull(test: any) {
  return null == test;
}

function getDataView() {
  return (dataView =
    dataView === null || isDetached(dataView.buffer) || dataView.buffer !== wasm.memory.buffer
      ? new DataView(wasm.memory.buffer)
      : dataView);
}

let pointer = arr.length;

function shift(QP: number) {
  QP < 132 || ((arr[QP] = pointer), (pointer = QP));
}

function shiftGet(QP: number) {
  var Qn = get(QP);
  return shift(QP), Qn;
}

const decoder = new TextDecoder('utf-8', {
  fatal: true,
  ignoreBOM: true,
});

function decodeSub(index: number, offset: number) {
  return (index >>>= 0), decoder.decode(getMemBuff().subarray(index, index + offset));
}

function addToStack(item: any) {
  pointer === arr.length && arr.push(arr.length + 1);
  var Qn = pointer;
  return (pointer = arr[Qn]), (arr[Qn] = item), Qn;
}

function args(QP: any, Qn: number, QT: number, func: Function) {
  const Qx = {
    a: QP,
    b: Qn,
    cnt: 1,
    dtor: QT,
  };
  return (
    (QP = (...Qw: any) => {
      Qx.cnt++;
      try {
        return func(Qx.a, Qx.b, ...Qw);
      } finally {
        0 == --Qx.cnt && (wasm.__wbindgen_export_2.get(Qx.dtor)(Qx.a, Qx.b), (Qx.a = 0));
      }
    }),
    ((QP.original = Qx), QP)
  );
}

function export3(QP: any, Qn: any) {
  return shiftGet(wasm.__wbindgen_export_3(QP, Qn));
}

function export4(Qy: any, QO: any, QX: any) {
  wasm.__wbindgen_export_4(Qy, QO, addToStack(QX));
}

function export5(QP: any, Qn: any) {
  wasm.__wbindgen_export_5(QP, Qn);
}

function applyToWindow(func: Function, args: ArrayLike<Object>) {
  try {
    return func.apply(fake_window, args);
  } catch (error) {
    wasm.__wbindgen_export_6(addToStack(error));
  }
}

function Qj(QP: ArrayLike<number>, Qn: any) {
  return (Qn = Qn(+QP.length, 1) >>> 0), (getMemBuff().set(QP, Qn), (size = QP.length), Qn);
}

function isResponse(obj: Object) {
  return Object.prototype.toString.call(obj) === '[object Response]';
}

async function QN(QP: Response, Qn: WebAssembly.Imports) {
  let QT: ArrayBuffer, Qt: any;

  return 'function' == typeof Response && isResponse(QP)
    ? ((QT = await QP.arrayBuffer()),
      (Qt = await WebAssembly.instantiate(QT, Qn)),
      Object.assign(Qt, { bytes: QT }))
    : (Qt = await WebAssembly.instantiate(QP, Qn)) instanceof WebAssembly.Instance
    ? {
        instance: Qt,
        module: QP,
      }
    : Qt;
}

function initWasm() {
  const wasmObj = {
    wbg: {
      __wbindgen_is_function: function (index: number) {
        return typeof get(index) == 'function';
      },
      __wbindgen_is_string: function (index: number) {
        return typeof get(index) == 'string';
      },
      __wbindgen_is_object: function (index: number) {
        let object = get(index);
        return typeof object == 'object' && object !== null;
      },
      __wbindgen_number_get: function (offset: number, index: number) {
        let number = get(index);
        getDataView().setFloat64(offset + 8, isNull(number) ? 0 : number, true);
        getDataView().setInt32(offset, isNull(number) ? 0 : 1, true);
      },
      __wbindgen_string_get: function (offset: number, index: number) {
        let str = get(index);
        let val = parse(str, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        getDataView().setInt32(offset + 4, size, true);
        getDataView().setInt32(offset, val, true);
      },
      __wbindgen_object_drop_ref: function (index: number) {
        shiftGet(index);
      },
      __wbindgen_cb_drop: function (index: number) {
        let org = shiftGet(index).original;
        return 1 == org.cnt-- && !(org.a = 0);
      },
      __wbindgen_string_new: function (index: number, offset: number) {
        return addToStack(decodeSub(index, offset));
      },
      __wbindgen_is_null: function (index: number) {
        return null === get(index);
      },
      __wbindgen_is_undefined: function (index: number) {
        return void 0 === get(index);
      },
      __wbindgen_boolean_get: function (index: number) {
        let bool = get(index);
        return 'boolean' == typeof bool ? (bool ? 1 : 0) : 2;
      },
      __wbg_instanceof_CanvasRenderingContext2d_4ec30ddd3f29f8f9: function () {
        return true;
      },
      __wbg_subarray_adc418253d76e2f1: function (index: number, num1: number, num2: number) {
        return addToStack(get(index).subarray(num1 >>> 0, num2 >>> 0));
      },
      __wbg_randomFillSync_5c9c955aa56b6049: function () {},
      __wbg_getRandomValues_3aa56aa6edec874c: function () {
        return applyToWindow(function (index1: number, index2: number) {
          get(index1).getRandomValues(get(index2));
        }, arguments);
      },
      __wbg_msCrypto_eb05e62b530a1508: function (index: number) {
        return addToStack(get(index).msCrypto);
      },
      // @ts-ignore
      __wbg_toString_6eb7c1f755c00453: function (index: number) {
        let fakestr = '[object Storage]';
        return addToStack(fakestr);
      },
      __wbg_toString_139023ab33acec36: function (index: number) {
        return addToStack(get(index).toString());
      },
      __wbg_require_cca90b1a94a0255b: function () {
        return applyToWindow(function () {
          return addToStack(module.require);
        }, arguments);
      },
      __wbg_crypto_1d1f22824a6a080c: function (index: number) {
        return addToStack(get(index).crypto);
      },
      __wbg_process_4a72847cc503995b: function (index: number) {
        return addToStack(get(index).process);
      },
      __wbg_versions_f686565e586dd935: function (index: number) {
        return addToStack(get(index).versions);
      },
      __wbg_node_104a2ff8d6ea03a2: function (index: number) {
        return addToStack(get(index).node);
      },
      __wbg_localStorage_3d538af21ea07fcc: function () {
        // @ts-ignore
        return applyToWindow(function (index: number) {
          let data = fake_window.localStorage;
          if (isNull(data)) {
            return 0;
          } else {
            return addToStack(data);
          }
        }, arguments);
      },
      __wbg_setfillStyle_59f426135f52910f: function () {},
      __wbg_setshadowBlur_229c56539d02f401: function () {},
      __wbg_setshadowColor_340d5290cdc4ae9d: function () {},
      __wbg_setfont_16d6e31e06a420a5: function () {},
      __wbg_settextBaseline_c3266d3bd4a6695c: function () {},
      __wbg_drawImage_cb13768a1bdc04bd: function () {},
      __wbg_getImageData_66269d289f37d3c7: function () {
        return applyToWindow(function () {
          return addToStack(image_data);
        }, arguments);
      },
      __wbg_rect_2fa1df87ef638738: function () {},
      __wbg_fillRect_4dd28e628381d240: function () {},
      __wbg_fillText_07e5da9e41652f20: function () {},
      __wbg_setProperty_5144ddce66bbde41: function () {},
      __wbg_createElement_03cf347ddad1c8c0: function () {
        return applyToWindow(function (
          // @ts-ignore
          index,
          // @ts-ignore
          decodeIndex: number,
          // @ts-ignore
          decodeIndexOffset: number
        ) {
          return addToStack(canvas);
        }, arguments);
      },
      __wbg_querySelector_118a0639aa1f51cd: function () {
        return applyToWindow(function (
          // @ts-ignore
          index: number,
          // @ts-ignore
          decodeIndex: number,
          // @ts-ignore
          decodeOffset: number
        ) {
          //let item = get(index).querySelector(decodeSub(decodeIndex, decodeOffset));
          //return isNull(item) ? 0 : addToStack(item);
          return addToStack(meta);
        }, arguments);
      },
      __wbg_querySelectorAll_50c79cd4f7573825: function () {
        return applyToWindow(function () {
          return addToStack(nodeList);
        }, arguments);
      },
      __wbg_getAttribute_706ae88bd37410fa: function (
        offset: number,
        // @ts-ignore
        index: number,
        // @ts-ignore
        decodeIndex: number,
        // @ts-ignore
        decodeOffset: number
      ) {
        //let attr = get(index).getAttribute(decodeSub(decodeIndex, decodeOffset));
        let attr = meta.content;
        //todo!
        let todo = isNull(attr) ? 0 : parse(attr, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        getDataView().setInt32(offset + 4, size, true);
        getDataView().setInt32(offset, todo, true);
      },
      __wbg_target_6795373f170fd786: function (index: number) {
        let target = get(index).target;
        return isNull(target) ? 0 : addToStack(target);
      },
      __wbg_addEventListener_f984e99465a6a7f4: function () {},
      __wbg_instanceof_HtmlCanvasElement_1e81f71f630e46bc: function () {
        return true;
      },
      __wbg_setwidth_233645b297bb3318: function (index: number, set: number) {
        get(index).width = set >>> 0;
      },
      __wbg_setheight_fcb491cf54e3527c: function (index: number, set: number) {
        get(index).height = set >>> 0;
      },
      __wbg_getContext_dfc91ab0837db1d1: function () {
        return applyToWindow(function (index: number) {
          return addToStack(get(index).context2d);
        }, arguments);
      },
      __wbg_toDataURL_97b108dd1a4b7454: function () {
        // @ts-ignore
        return applyToWindow(function (offset: number, index: number) {
          let _dataUrl = parse(dataURL, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
          getDataView().setInt32(offset + 4, size, true);
          getDataView().setInt32(offset, _dataUrl, true);
        }, arguments);
      },
      __wbg_instanceof_HtmlDocument_1100f8a983ca79f9: function () {
        return true;
      },
      __wbg_style_ca229e3326b3c3fb: function (index: number) {
        addToStack(get(index).style);
      },
      __wbg_instanceof_HtmlImageElement_9c82d4e3651a8533: function () {
        return true;
      },
      __wbg_src_87a0e38af6229364: function (offset: number, index: number) {
        let _src = parse(get(index).src, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        getDataView().setInt32(offset + 4, size, true);
        getDataView().setInt32(offset, _src, true);
      },
      __wbg_width_e1a38bdd483e1283: function (index: number) {
        return get(index).width;
      },
      __wbg_height_e4cc2294187313c9: function (index: number) {
        return get(index).height;
      },
      __wbg_complete_1162c2697406af11: function (index: number) {
        return get(index).complete;
      },
      __wbg_data_d34dc554f90b8652: function (offset: number, index: number) {
        var _data = Qj(get(index).data, wasm.__wbindgen_export_0);
        getDataView().setInt32(offset + 4, size, true);
        getDataView().setInt32(offset, _data, true);
      },
      __wbg_origin_305402044aa148ce: function () {
        return applyToWindow(function (offset: number, index: number) {
          let _origin = parse(get(index).origin, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
          getDataView().setInt32(offset + 4, size, true);
          getDataView().setInt32(offset, _origin, true);
        }, arguments);
      },
      __wbg_length_8a9352f7b7360c37: function (index: number) {
        return get(index).length;
      },
      __wbg_get_c30ae0782d86747f: function (index: number) {
        let _image = get(index).image;
        return isNull(_image) ? 0 : addToStack(_image);
      },
      __wbg_timeOrigin_f462952854d802ec: function (index: number) {
        return get(index).timeOrigin;
      },
      __wbg_instanceof_Window_cee7a886d55e7df5: function () {
        return true;
      },
      __wbg_document_eb7fd66bde3ee213: function (index: number) {
        let _document = get(index).document;
        return isNull(_document) ? 0 : addToStack(_document);
      },
      __wbg_location_b17760ac7977a47a: function (index: number) {
        return addToStack(get(index).location);
      },
      __wbg_performance_4ca1873776fdb3d2: function (index: number) {
        let _performance = get(index).performance;
        return isNull(_performance) ? 0 : addToStack(_performance);
      },
      __wbg_origin_e1f8acdeb3a39a2b: function (offset: number, index: number) {
        let _origin = parse(get(index).origin, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        getDataView().setInt32(offset + 4, size, true);
        getDataView().setInt32(offset, _origin, true);
      },
      __wbg_get_8986951b1ee310e0: function (index: number, decode1: number, decode2: number) {
        let data = get(index)[decodeSub(decode1, decode2)];
        return isNull(data) ? 0 : addToStack(data);
      },
      __wbg_setTimeout_6ed7182ebad5d297: function () {
        return applyToWindow(function () {
          return 7;
        }, arguments);
      },
      __wbg_self_05040bd9523805b9: function () {
        return applyToWindow(function () {
          return addToStack(fake_window);
        }, arguments);
      },
      __wbg_window_adc720039f2cb14f: function () {
        return applyToWindow(function () {
          return addToStack(fake_window);
        }, arguments);
      },
      __wbg_globalThis_622105db80c1457d: function () {
        return applyToWindow(function () {
          return addToStack(fake_window);
        }, arguments);
      },
      __wbg_global_f56b013ed9bcf359: function () {
        return applyToWindow(function () {
          return addToStack(fake_window);
        }, arguments);
      },
      __wbg_newnoargs_cfecb3965268594c: function (index: number, offset: number) {
        return addToStack(new Function(decodeSub(index, offset)));
      },
      __wbindgen_object_clone_ref: function (index: number) {
        return addToStack(get(index));
      },
      __wbg_eval_c824e170787ad184: function () {
        return applyToWindow(function (index: number, offset: number) {
          let fake_str = 'fake_' + decodeSub(index, offset);
          let ev = eval(fake_str);
          return addToStack(ev);
        }, arguments);
      },
      __wbg_call_3f093dd26d5569f8: function () {
        return applyToWindow(function (index: number, index2: number) {
          return addToStack(get(index).call(get(index2)));
        }, arguments);
      },
      __wbg_call_67f2111acd2dfdb6: function () {
        return applyToWindow(function (index: number, index2: number, index3: number) {
          return addToStack(get(index).call(get(index2), get(index3)));
        }, arguments);
      },
      __wbg_set_961700853a212a39: function () {
        return applyToWindow(function (index: number, index2: number, index3: number) {
          return Reflect.set(get(index), get(index2), get(index3));
        }, arguments);
      },
      __wbg_buffer_b914fb8b50ebbc3e: function (index: number) {
        return addToStack(get(index).buffer);
      },
      __wbg_newwithbyteoffsetandlength_0de9ee56e9f6ee6e: function (index: number, val: number, val2: number) {
        return addToStack(new Uint8Array(get(index), val >>> 0, val2 >>> 0));
      },
      __wbg_newwithlength_0d03cef43b68a530: function (length: number) {
        return addToStack(new Uint8Array(length >>> 0));
      },
      __wbg_new_b1f2d6842d615181: function (index: number) {
        return addToStack(new Uint8Array(get(index)));
      },
      __wbg_buffer_67e624f5a0ab2319: function (index: number) {
        return addToStack(get(index).buffer);
      },
      __wbg_length_21c4b0ae73cba59d: function (index: number) {
        return get(index).length;
      },
      __wbg_set_7d988c98e6ced92d: function (index: number, index2: number, val: number) {
        get(index).set(get(index2), val >>> 0);
      },
      __wbindgen_debug_string: function () {},
      __wbindgen_throw: function (index: number, offset: number) {
        throw new Error(decodeSub(index, offset));
      },
      __wbindgen_memory: function () {
        return addToStack(wasm.memory);
      },
      __wbindgen_closure_wrapper117: function (Qn: any, QT: any) {
        return addToStack(args(Qn, QT, 2, export3));
      },
      __wbindgen_closure_wrapper119: function (Qn: any, QT: any) {
        return addToStack(args(Qn, QT, 2, export4));
      },
      __wbindgen_closure_wrapper121: function (Qn: any, QT: any) {
        return addToStack(args(Qn, QT, 2, export5));
      },
      __wbindgen_closure_wrapper123: function (Qn: any, QT: any) {
        let test = addToStack(args(Qn, QT, 9, export4));
        return test;
      },
    },
  };
  return wasmObj;
}

function assignWasm(resp: any) {
  wasm = resp.exports;
  (dataView = null), (memoryBuff = null), wasm;
}

function QZ(QP: any) {
  let Qn;
  return void 0 !== wasm
    ? wasm
    : ((Qn = initWasm()),
      QP instanceof WebAssembly.Module || (QP = new WebAssembly.Module(QP)),
      assignWasm(new WebAssembly.Instance(QP, Qn)));
}
async function loadWasm(url: any) {
  const mod = initWasm();
  const response = fetch(url, {
    headers: {
      Referer: fake_window.location.href,
      Host: 'megacloud.tv',
    },
  });
  // Process the fetched binary with QN
  // @ts-ignore
  const { instance, bytes } = await QN(await response, mod);
  assignWasm(instance);
  return bytes;
}

const grootLoader = {
  groot: function () {
    wasm.groot();
  },
};

let wasmLoader = Object.assign(loadWasm, { initSync: QZ }, grootLoader);

const V = async () => {
  try {
    let Q0 = await wasmLoader('https://megacloud.tv/images/loading.png?v=0.0.9');

    fake_window.bytes = Q0;
    wasmLoader.groot();
    fake_window.jwt_plugin(Q0);
  } catch (err) {
    console.log('wasm_load_error: ', err);
    fake_window.error = true;
  }
};
const getMeta = async (url: string, site: string) => {
  var _a;
  let resp = await fetch(url, {
    headers: {
      UserAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
      Referrer: site,
    },
  });
  let txt = await resp.text();
  let regx = /name="j_crt" content="[A-Za-z0-9]*/g;
  let match = (_a = txt.match(regx)) === null || _a === void 0 ? void 0 : _a[0];
  let content = match === null || match === void 0 ? void 0 : match.slice(match.lastIndexOf('"') + 1);
  meta.content = content + '==';
};
const i = (a: Uint8Array, P: Array<number>) => {
  try {
    for (let Q0 = 0; Q0 < a.length; Q0++) {
      a[Q0] = a[Q0] ^ P[Q0 % P.length];
    }
  } catch (Q1) {
    return null;
  }
};

const M = (a: any, P: any) => {
  try {
    var Q0 = CryptoJS.AES.decrypt(a, P);
    return JSON.parse(Q0.toString(CryptoJS.enc.Utf8));
  } catch (Q1) {
    // @ts-ignore
    console.log(Q1.message);
  }
  return [];
};
function z(a: any) {
  return [(a & 4278190080) >> 24, (a & 16711680) >> 16, (a & 65280) >> 8, a & 255];
}

function transformURL(url: string) {
  const regex = /\/(embed-\d+)\/(e-\d+)\//;
  const match = url.match(regex);
  if (match) {
    const [, embedPart, ePart] = match;
    return `/${embedPart}/ajax/${ePart}`;
  }
  return null;
}

export async function getSources(embed_url: string, site: string) {
  await getMeta(embed_url, site);
  let xrax = embed_url.split('/').pop()?.split('?').shift();
  let regx = /https:\/\/[a-zA-Z0-9.]*/;
  let base_url = embed_url.match(regx)?.[0];
  let test = embed_url.split('/');
  fake_window.xrax = xrax;
  fake_window.G = xrax;
  canvas.baseUrl = embed_url;
  fake_window.location.href = embed_url;
  let browser_version = 1878522368;

  try {
    await V();
    let getSourcesUrl = '';

    if (base_url!.includes('mega')) {
      getSourcesUrl =
        base_url +
        '/' +
        test[3] +
        '/ajax/' +
        test[4] +
        '/getSources?id=' +
        fake_window.pid +
        '&v=' +
        fake_window.localStorage.kversion +
        '&h=' +
        fake_window.localStorage.kid +
        '&b=' +
        browser_version;
    } else {
      getSourcesUrl =
        base_url +
        '/ajax/' +
        test[3] +
        '/' +
        test[4] +
        '/getSources?id=' +
        fake_window.pid +
        '&v=' +
        fake_window.localStorage.kversion +
        '&h=' +
        fake_window.localStorage.kid +
        '&b=' +
        browser_version;
    }
    // console.log('getSourcesUrl: ', getSourcesUrl);
    let resp_json = await (
      await fetch(getSourcesUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
          //"Referrer": fake_window.origin + "/v2/embed-4/" + xrax + "?z=",
          Referer: site,
          'X-Requested-With': 'XMLHttpRequest',
        },
        method: 'GET',
        mode: 'cors',
      })
    ).json();
    //let encrypted = resp_json.sources;
    let Q3 = fake_window.localStorage.kversion;
    let Q1 = z(Q3);
    let Q5 = fake_window.navigate();
    Q5 = new Uint8Array(Q5);
    let Q8: any;
    Q8 = resp_json.t != 0 ? (i(Q5, Q1), Q5) : ((Q8 = resp_json.k), i(Q8, Q1), Q8);
    // @ts-ignore
    const str = btoa(String.fromCharCode.apply(null, new Uint8Array(Q8)));

    // @ts-ignore
    resp_json.sources = M(resp_json.sources, str) as extractedSources[];

    return resp_json;
  } catch (err) {
    console.error(err);
  }
}

//extractor for https://animekai.to

export class MegaUpDecoder {
  #reverseIt = (n: string) => {
    return n.split('').reverse().join('');
  };
  #base64UrlEncode = (str: string) => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  #substitute = (input: string, keys: string, values: string) => {
    const map = Object.fromEntries(keys.split('').map((key, i) => [key, values[i] || '']));
    const a = input
      .split('')
      .map(char => map[char] || char)
      .join('');
    return a;
  };
  #transform = (n: string, t: string) => {
    const v = Array.from({ length: 256 }, (_, i) => i);
    let c = 0,
      f = '';

    for (let w = 0; w < 256; w++) {
      c = (c + v[w] + n.charCodeAt(w % n.length)) % 256;
      [v[w], v[c]] = [v[c], v[w]];
    }
    for (let a = (c = 0), w = 0; a < t.length; a++) {
      w = (w + 1) % 256;
      c = (c + v[w]) % 256;
      [v[w], v[c]] = [v[c], v[w]];
      f += String.fromCharCode(t.charCodeAt(a) ^ v[(v[w] + v[c]) % 256]);
    }

    return f;
  };
  #base64UrlDecode = (n: string) => {
    n = n
      .padEnd(n.length + ((4 - (n.length % 4)) % 4), '=')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    return atob(n);
  };

  GenerateToken = (n: string) => {
    n = encodeURIComponent(n);

    n = this.#base64UrlEncode(this.#transform('gEUzYavPrGpj', this.#reverseIt(n)));

    n = this.#substitute(n, 'U8nv0tEFGTb', 'bnGvE80UtTF');
    n = this.#substitute(n, '9ysoRqBZHV', 'oqsZyVHBR9');
    n = this.#reverseIt(this.#base64UrlEncode(this.#transform('CSk63F7PwBHJKa', n)));
    n = this.#substitute(n, 'cKj9BMN15LsdH', 'NL5cdKs1jB9MH');
    return this.#base64UrlEncode(
      this.#reverseIt(this.#base64UrlEncode(this.#transform('T2zEp1WHL9CsSk7', n)))
    );
  };
  DecodeIframeData = (n: string) => {
    n = this.#base64UrlDecode(this.#reverseIt(this.#base64UrlDecode(n)));
    n = this.#transform('T2zEp1WHL9CsSk7', n);
    n = this.#reverseIt(this.#substitute(n, 'NL5cdKs1jB9MH', 'cKj9BMN15LsdH'));
    n = this.#transform('CSk63F7PwBHJKa', this.#base64UrlDecode(n));
    n = this.#substitute(n, 'oqsZyVHBR9', '9ysoRqBZHV');
    n = this.#base64UrlDecode(this.#substitute(n, 'bnGvE80UtTF', 'U8nv0tEFGTb'));
    n = this.#reverseIt(this.#transform('gEUzYavPrGpj', n));
    return decodeURIComponent(n);
  };
  Decode = (n: string) => {
    n = this.#base64UrlDecode(this.#base64UrlDecode(n));
    n = this.#reverseIt(this.#transform('E438hS1W9oRmB', n));
    n = this.#reverseIt(this.#substitute(n, 'D5qdzkGANMQZEi', 'Q5diEGMADkZzNq'));
    n = this.#base64UrlDecode(
      this.#substitute(
        this.#transform('NZcfoMD7JpIrgQE', this.#base64UrlDecode(n)),
        'kTr0pjKzBqZV',
        'kZpjzTV0KqBr'
      )
    );
    n = this.#reverseIt(
      this.#substitute(this.#transform('Gay7bxj5B81TJFM', n), 'zcUxoJTi3fgyS', 'oSgyJUfizcTx3')
    );
    return decodeURIComponent(n);
  };
}

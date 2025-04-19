import { random } from "radash";
import { sha3_512 } from "js-sha3";

export function generateProofToken(
  seed: string,
  diff: string,
  userAgent: string = navigator?.userAgent ??
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
) {
  const cores = [1, 2, 4];
  const screens = [3008, 4010, 6000];
  const reacts = [
    "_reactListeningcfilawjnerp",
    "_reactListening9ne2dfo1i47",
    "_reactListening410nzwhan2a",
  ];
  const acts = ["alert", "ontransitionend", "onprogress"];

  const core = cores[random(0, cores.length)];
  const screen = screens[random(0, screens.length)] + core;
  const react = cores[random(0, reacts.length)];
  const act = screens[random(0, acts.length)];

  const parseTime = new Date().toString();

  const config = [
    screen,
    parseTime,
    4294705152,
    0,
    userAgent,
    "https://tcr9i.chat.openai.com/v2/35536E1E-65B4-4D96-9D97-6ADB7EFF8147/api.js",
    "dpl=1440a687921de39ff5ee56b92807faaadce73f13",
    "en",
    "en-US",
    4294705152,
    "plugins−[object PluginArray]",
    react,
    act,
  ];

  const diffLen = diff.length;
  const encoder = new TextEncoder();
  for (let i = 0; i < 200000; i++) {
    config[3] = i;
    const jsonData = JSON.stringify(config);
    // eslint-disable-next-line no-undef
    const jsonEncode = encoder.encode(jsonData);
    const binString = Array.from(
      jsonEncode,
      (byte) => String.fromCodePoint(byte) // unicode unit (>1byte) ---->  ascii unit
    ).join("");
    const base = btoa(binString);
    // encoder.encode(jsonData)
    // const base = Buffer.from(jsonData).toString("base64");
    const hashValue = sha3_512.create().update(seed + base);

    if (hashValue.hex().substring(0, diffLen) <= diff) {
      const result = "gAAAAAB" + base;
      return result;
    }
  }

  // eslint-disable-next-line no-undef
  const fallbackBase = btoa(
    Array.from(
      encoder.encode(seed),
      (byte) => String.fromCodePoint(byte) // unicode unit (>1byte) ---->  ascii unit
    ).join("")
  );
  return "gAAAAABwQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4D" + fallbackBase;
}

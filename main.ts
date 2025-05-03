import { CatppuccinFlavor, flavorEntries, flavors } from "@catppuccin/palette";
import { Buffer } from "node:buffer";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const updateReadme = (
  readme: string,
  newContent: string,
  options: {
    section?: string;
    preamble?: string;
    markers?: {
      start: string;
      end: string;
    };
  } = {}
): string => {
  const {
    section = "",
    preamble = "<!-- the following section is auto-generated, do not edit -->",
    markers = {
      start: `<!-- AUTOGEN${
        section !== "" ? `:${section.toUpperCase()}` : ""
      } START -->`,
      end: `<!-- AUTOGEN${
        section !== "" ? `:${section.toUpperCase()}` : ""
      } END -->`,
    },
  } = options;
  const wrapped = [markers.start, preamble, newContent, markers.end].join("\n");

  Object.values(markers).map((m) => {
    if (!readme.includes(m)) {
      throw new Error(`Marker ${m} not found in README.md`);
    }
  });

  const pre = readme.split(markers.start)[0];
  const end = readme.split(markers.end)[1];
  return pre + wrapped + end;
};

const generateTheme = (flavor: CatppuccinFlavor) => {
  const background = flavor.colors.base.hex;
  const main = flavor.colors.mauve.hex;
  const caret = flavor.colors.rosewater.hex;
  const subAlt = flavor.colors.overlay1.hex;
  const sub = flavor.colors.mantle.hex;
  const text = flavor.colors.text.hex;
  const error = flavor.colors.red.hex;
  const extraError = flavor.colors.maroon.hex;

  const theme = {
    c: [
      background,
      main,
      caret,
      subAlt,
      sub,
      text,
      error,
      extraError,
      error,
      extraError,
    ],
  };

  return Buffer.from(JSON.stringify(theme), "binary").toString("base64url");
};

const generateList = () => {
  return flavorEntries
    .map(
      ([_, flavor]) =>
        `- [${flavor.emoji} ${
          flavor.name
        }](https://monkeytype.com/?customTheme=${generateTheme(flavor)})`
    )
    .join("\n");
};

const root = path.dirname(fileURLToPath(import.meta.url));
const readmePath = path.join(root, "./README.md");
let readmeContent = await readFile(readmePath, "utf-8");
try {
  readmeContent = updateReadme(readmeContent, generateList());
} catch (err) {
  console.error("Failed to update README", err);
} finally {
  await writeFile(readmePath, readmeContent);
}

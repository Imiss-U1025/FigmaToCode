import { AltSceneNode, AltTextNode } from "../../altNodes/altMixins";
import { HtmlTextBuilder } from "../htmlTextBuilder";
import { rgbTo6hex } from "../../common/color";
import { retrieveTopFill } from "../../common/retrieveFill";

type namedText = {
  name: string;
  attr: string;
  full: string;
  style: string;
  contrastBlack: number;
};

const style = (node: AltTextNode): string => {
  let comp = "";

  if (node.fontName !== figma.mixed) {
    const lowercaseStyle = node.fontName.style.toLowerCase();

    if (lowercaseStyle.match("italic")) {
      comp += "font-style: italic; ";
    }

    const value = node.fontName.style
      .replace("italic", "")
      .replace(" ", "")
      .toLowerCase();

    // comp += `font-weight: ${convertFontWeight(value)}; `;
  }

  if (node.fontSize !== figma.mixed) {
    comp += `font-size: ${Math.min(node.fontSize, 24)}; `;
  }

  const color = convertColor(node.fills);
  if (color) {
    comp += `color: ${color}; `;
  }

  return comp;
};

function deepFlatten(arr: Array<AltSceneNode>): Array<AltSceneNode> {
  let result: Array<AltSceneNode> = [];

  arr.forEach((d) => {
    if ("children" in d) {
      result = result.concat(deepFlatten([...d.children]));
    } else {
      if (d.type === "TEXT") {
        result.push(d);
      }
    }
  });

  return result;
}

const convertColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string | undefined => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined

  const fill = retrieveTopFill(fills);

  if (fill?.type === "SOLID") {
    return rgbTo6hex(fill.color);
  }

  return undefined;
};

// from https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o
function calculateContrastRatio(color1: RGB, color2: RGB) {
  const color1luminance = luminance(color1);
  const color2luminance = luminance(color2);

  const contrast =
    color1luminance > color2luminance
      ? (color2luminance + 0.05) / (color1luminance + 0.05)
      : (color1luminance + 0.05) / (color2luminance + 0.05);

  return 1 / contrast;
}

function luminance(color: RGB) {
  const a = [color.r * 255, color.g * 255, color.b * 255].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function listToMap<T extends number | string>(l: Array<T>) {
  return l.reduce((p, c) => {
    p[c.toString()] = c;
    return p;
  }, {} as { [key: string]: T });
}

const defaultResizeEnable = {
  top: false,
  right: false,
  bottom: false,
  left: false,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
};

export function resizableEnable(f: {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  topRight?: boolean;
  bottomRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
}) {
  return Object.entries(f).reduce(
    (p, [k, v]) => {
      if (v !== undefined) {
        p[k as keyof typeof defaultResizeEnable] = v;
      }
      return p;
    },
    { ...defaultResizeEnable }
  );
}

export function downloadToClient(
  content: BlobPart,
  fileName: string,
  contentType: string
) {
  let a = document.createElement("a");
  let file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

export function importJson(
  event: React.ChangeEvent<HTMLInputElement>
): Promise<string | ArrayBuffer | null | undefined> {
  const files = event.target.files;
  return new Promise((resolve, _) => {
    if (files !== null && files.length !== 0) {
      const file = files[0];
      if (file.type !== "application/json") {
        window.alert(
          "Debes seleccionar un archivo válido, la extensión debe ser '.json'."
        );
        return resolve(undefined);
      }
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result);
        };
        reader.onabort = (e) => {
          resolve(undefined);
        };
        reader.onerror = (e) => {
          resolve(undefined);
        };
        reader.readAsText(file);
    } else {
      resolve(undefined);
    }
  });
}

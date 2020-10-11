
export abstract class SourceItem {
  constructor(public name: string) {}

  when(f: {file: (f: SourceFile) => void, dir: (f: SourceDirectory) => void}) {
    if (this instanceof SourceFile) {
      f.file(this)
    } else if (this instanceof SourceDirectory) {
      f.dir(this)
    }
  }
}

export class SourceFile extends SourceItem {
  constructor(name: string, public content: string) {
    super(name);
  }
}

export class SourceDirectory extends SourceItem {
  constructor(name: string, public items: SourceItem[]) {
    super(name);
  }
}

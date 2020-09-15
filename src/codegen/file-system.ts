abstract class FileItem {
  constructor(public name: string) {}

  toZip() {
    if (this instanceof File) {
      this;
    } else if (this instanceof DirectoryFile) {
      this;
    } else {
      throw "";
    }
  }
}

export class File extends FileItem {
  constructor(name: string, public content: string) {
    super(name);
  }
}

export class DirectoryFile extends FileItem {
  constructor(name: string, public items: FileItem[]) {
    super(name);
  }
}

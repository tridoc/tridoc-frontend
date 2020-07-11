interface tdError {
  statusCode: number;
  error: string;
  message: string;
}

interface tdTag {
  label: string
  parameter?: {
    type: 'http://www.w3.org/2001/XMLSchema#decimal' | 'http://www.w3.org/2001/XMLSchema#date';
  }
}

interface tdDocTag extends tdTag {
  parameter?: {
    type: 'http://www.w3.org/2001/XMLSchema#decimal' | 'http://www.w3.org/2001/XMLSchema#date';
    value: string;
  }
}

interface tdComment {
  text: string;
  created: string;
}

interface tdDoc {
  identifier: string;
  title?: string;
  created: string;
}

interface tdDocMeta {
  identifier: string;
  title?: string;
  created: string;
  tags?: tdTag[];
  comments?: tdComment[];
}

export = Server;

declare class Server {
  constructor(url: string, username: string, password: string);

  addTag(id: string, label: string, type?: string, value?: string | number):
    Promise< tdError | { [key: string]: any} >;

  countDocuments(query: string, tagsQuery: string, notTagsQuery: string):
    Promise< tdError | number >;

  createTag(label: string, type?: 'date' | 'decimal'):
    Promise< tdError | { [key: string]: any} >;

  deleteDocument(id: string): Promise< tdError | { [key: string]: any} >;
  deleteTag(label: string): Promise< tdError | { [key: string]: any} >;

  getDocuments(query: string, tagsQuery: string, notTagsQuery: string, limit: number | '', offset: number | ''):
    Promise< tdError | tdDoc[] >;

  getTags(id?: string): Promise< tdError | tdDocTag[] >;
  getMeta(id: string): Promise< tdError | tdDocMeta >;
  removeTag(id: string, label: string): Promise< tdError | { [key: string]: any} >;

  setDocumentTitle(id: string, title: string):
    Promise< tdError | { [key: string]: any} >;

  uploadFile(file: File): Promise< tdError | { [key: string]: any} >;

  url: string;
  headers: Headers;
  postHeaders: Headers;
}

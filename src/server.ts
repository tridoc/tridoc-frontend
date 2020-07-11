type tdTagTypes = 'http://www.w3.org/2001/XMLSchema#decimal' | 'http://www.w3.org/2001/XMLSchema#date';

interface tdError {
    statusCode: number;
    error: string;
    message: string;
}

interface tdTag {
    label: string
    parameter?: {
        type: tdTagTypes;
    }
}

interface tdDocTag extends tdTag {
    parameter?: {
        type: tdTagTypes;
        value: string|number;
    }
}

interface tdComment {
    text: string;
}

interface tdDocComment extends tdComment {
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
    tags?: tdDocTag[];
    comments?: tdDocComment[];
}

export default class Server {
    url: string;
    private headers: Headers;
    private postHeaders: Headers;

    /**
     * 
     * @constructor
     * @param {string} url 
     * @param {string} [username]
     * @param {string} [password] 
     */
    constructor(url: string, username: string, password: string) {
        if (url.startsWith("http")) {
            this.url = url;
        } else {
            this.url = "https://" + url;
        }

        this.headers = new Headers();
        this.headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));

        this.postHeaders = new Headers();
        this.postHeaders.set('Authorization', this.headers.get('Authorization')!);
        this.postHeaders.set('Content-Type', 'application/json');
    }

    /**
     * Adds a tag to the specified document.
     * @param {string} id - Id of the document
     * @param {string} content - Text content of the comment
     */
    addComment(id: string, content: string): Promise< tdError | { [key: string]: any} > {
        let body = {
            'text': content
        };
        return fetch(this.url + "/doc/" + id + "/comment", {
            method: "POST",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then(r => r.json());
    }

    /**
     * Adds a tag to the specified document.
     * @param {string} id - Id of the document
     * @param {string} label - Label of the tag
     * @param {string} [type] - For parameterizable tags only: Type of the tag
     * @param {(string|number)} [value] - For parameterizable tags only: Value for the tag
     */
    addTag(id: string, label: string, type?: 'decimal'|'date', value?: string|number): Promise< tdError | { [key: string]: any} > {
        let body: tdDocTag = {
            'label': label
        };
        if (type && value) {
            body.parameter = {
                "type": ("http://www.w3.org/2001/XMLSchema#" + type as tdTagTypes),
                "value": value
            };
        }
        return fetch(this.url + "/doc/" + id + "/tag", {
            method: "POST",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then(r => r.json());
    }

    countDocuments(query = '', tags: string[] = [], notTags: string[] = []): Promise< tdError | number > {
        let params = new URLSearchParams()
        params.append('text', query)
        tags.forEach(t => params.append('tag', t))
        notTags.forEach(t => params.append('tag', t))
        return fetch(this.url + "/count?" + params, { headers: this.headers })
            .then(r => r.json());
    }

    createTag(label: any, type?: 'decimal'|'date'): Promise< tdError | { [key: string]: any} > {
        let body: tdTag = {
            'label': label
        };
        if (type) {
            body.parameter = { "type": ("http://www.w3.org/2001/XMLSchema#" + type as tdTagTypes) };
        }
        return fetch(this.url + "/tag", {
            method: "POST",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then(r => r.json());
    }

    deleteDocument(id: string): Promise< tdError | { [key: string]: any} > {
        return fetch(this.url + "/doc/" + id, {
            method: "DELETE",
            headers: this.headers
        });
    }

    deleteTag(label: string): Promise< tdError | { [key: string]: any} > {
        return fetch(this.url + "/tag/" + encodeURIComponent(label), {
            method: "DELETE",
            headers: this.headers
        }).then(r => r.json());
    }

    /**
     * Gets the comments of the specified document.
     * @param {string} id - Id of the document
     */
    getComments(id: string): Promise< tdError | tdDocComment[] > {
        return fetch(this.url + "/doc/" + id + "/comment", {
            method: "GET",
            headers: this.headers,
        }).then(r => r.json());
    }

    getDocuments(query: string = '', tags: string[] = [], notTags: string[] = [], limit: number|'' = '', offset: number|'' = ''): Promise< tdError | tdDoc[] > {
        let params = new URLSearchParams()
        params.append('text', query)
        tags.forEach(t => params.append('tag', t))
        notTags.forEach(t => params.append('tag', t))
        params.append('limit', '' + limit)
        params.append('offset', '' + offset)
        return fetch(this.url + "/doc?" + params,
            { headers: this.headers }).then(r => r.json());
    }

    getTags(id?: string): Promise< tdError | tdTag[] > {
        return id ? fetch(this.url + "/doc/" + id + "/tag", { headers: this.headers }).then(r => r.json()) : fetch(this.url + "/tag", { headers: this.headers }).then(r => r.json());
    }

    getMeta(id: string): Promise< tdError | tdDocMeta > {
        return fetch(this.url + "/doc/" + id + "/meta", { headers: this.headers }).then(r => r.json());
    }

    /**
     * Get version of backend.
     */
    getVersion(): Promise< tdError | string > {
        return fetch(this.url + "/version", {
            method: "GET",
            headers: this.headers,
        }).then(r => r.json());
    }

    removeTag(id: string, label: string): Promise< tdError | { [key: string]: any} > {
        return fetch(this.url + "/doc/" + id + "/tag/" + label, {
            method: "DELETE",
            headers: this.headers
        });
    }

    setDocumentTitle(id: string, title: string): Promise< tdError | string > {
        let body = {
            'title': title
        };
        return fetch(this.url + "/doc/" + id + "/title", {
            method: "PUT",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then(r => r.json());
    }

    uploadFile(file: File): Promise< tdError | { success: true; location: string } > {
        if (file.type != "application/pdf") {
            return Promise.reject("Please provide a pdf document")
        } else {
            let pdfHeaders = new Headers();
            pdfHeaders.set('Authorization', this.headers.get('Authorization')!);
            pdfHeaders.set('Content-Type', 'application/pdf');
            return fetch(this.url + "/doc", {
                method: "POST",
                headers: pdfHeaders,
                body: file
            }).then(r => {
                if (r.status >= 400) {
                    return r.json();
                } else {
                    return {
                        success: true,
                        location: r.headers.get("Location")
                    };
                }
            }).then(json => {
                if (json.error) {
                    throw ("Server responded with " + json.statusCode + ": " + json.error);
                } else {
                    return json;
                }
            });
        }
    }
}
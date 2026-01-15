"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const child_process = require("child_process");
const path$1 = require("path");
const fs$1 = require("fs");
const require$$0$3 = require("url");
const require$$0$1 = require("process");
const require$$0$2 = require("buffer");
const require$$1 = require("util");
const stream = require("stream");
const require$$3 = require("http");
const require$$4 = require("https");
const require$$8 = require("crypto");
const http2 = require("http2");
const require$$4$1 = require("assert");
const require$$1$1 = require("tty");
const require$$0$4 = require("os");
const zlib = require("zlib");
const events$1 = require("events");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var dist = {};
var composer$2 = {};
var directives$2 = {};
var identity$x = {};
const ALIAS = Symbol.for("yaml.alias");
const DOC = Symbol.for("yaml.document");
const MAP = Symbol.for("yaml.map");
const PAIR = Symbol.for("yaml.pair");
const SCALAR$1 = Symbol.for("yaml.scalar");
const SEQ = Symbol.for("yaml.seq");
const NODE_TYPE = Symbol.for("yaml.node.type");
const isAlias = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === ALIAS;
const isDocument = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === DOC;
const isMap = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === MAP;
const isPair = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === PAIR;
const isScalar$1 = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === SCALAR$1;
const isSeq = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === SEQ;
function isCollection$1(node2) {
  if (node2 && typeof node2 === "object")
    switch (node2[NODE_TYPE]) {
      case MAP:
      case SEQ:
        return true;
    }
  return false;
}
function isNode(node2) {
  if (node2 && typeof node2 === "object")
    switch (node2[NODE_TYPE]) {
      case ALIAS:
      case MAP:
      case SCALAR$1:
      case SEQ:
        return true;
    }
  return false;
}
const hasAnchor = (node2) => (isScalar$1(node2) || isCollection$1(node2)) && !!node2.anchor;
identity$x.ALIAS = ALIAS;
identity$x.DOC = DOC;
identity$x.MAP = MAP;
identity$x.NODE_TYPE = NODE_TYPE;
identity$x.PAIR = PAIR;
identity$x.SCALAR = SCALAR$1;
identity$x.SEQ = SEQ;
identity$x.hasAnchor = hasAnchor;
identity$x.isAlias = isAlias;
identity$x.isCollection = isCollection$1;
identity$x.isDocument = isDocument;
identity$x.isMap = isMap;
identity$x.isNode = isNode;
identity$x.isPair = isPair;
identity$x.isScalar = isScalar$1;
identity$x.isSeq = isSeq;
var visit$6 = {};
var identity$w = identity$x;
const BREAK$1 = Symbol("break visit");
const SKIP$1 = Symbol("skip children");
const REMOVE$1 = Symbol("remove node");
function visit$5(node2, visitor) {
  const visitor_ = initVisitor(visitor);
  if (identity$w.isDocument(node2)) {
    const cd = visit_(null, node2.contents, visitor_, Object.freeze([node2]));
    if (cd === REMOVE$1)
      node2.contents = null;
  } else
    visit_(null, node2, visitor_, Object.freeze([]));
}
visit$5.BREAK = BREAK$1;
visit$5.SKIP = SKIP$1;
visit$5.REMOVE = REMOVE$1;
function visit_(key, node2, visitor, path2) {
  const ctrl = callVisitor(key, node2, visitor, path2);
  if (identity$w.isNode(ctrl) || identity$w.isPair(ctrl)) {
    replaceNode(key, path2, ctrl);
    return visit_(key, ctrl, visitor, path2);
  }
  if (typeof ctrl !== "symbol") {
    if (identity$w.isCollection(node2)) {
      path2 = Object.freeze(path2.concat(node2));
      for (let i = 0; i < node2.items.length; ++i) {
        const ci = visit_(i, node2.items[i], visitor, path2);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK$1)
          return BREAK$1;
        else if (ci === REMOVE$1) {
          node2.items.splice(i, 1);
          i -= 1;
        }
      }
    } else if (identity$w.isPair(node2)) {
      path2 = Object.freeze(path2.concat(node2));
      const ck = visit_("key", node2.key, visitor, path2);
      if (ck === BREAK$1)
        return BREAK$1;
      else if (ck === REMOVE$1)
        node2.key = null;
      const cv = visit_("value", node2.value, visitor, path2);
      if (cv === BREAK$1)
        return BREAK$1;
      else if (cv === REMOVE$1)
        node2.value = null;
    }
  }
  return ctrl;
}
async function visitAsync(node2, visitor) {
  const visitor_ = initVisitor(visitor);
  if (identity$w.isDocument(node2)) {
    const cd = await visitAsync_(null, node2.contents, visitor_, Object.freeze([node2]));
    if (cd === REMOVE$1)
      node2.contents = null;
  } else
    await visitAsync_(null, node2, visitor_, Object.freeze([]));
}
visitAsync.BREAK = BREAK$1;
visitAsync.SKIP = SKIP$1;
visitAsync.REMOVE = REMOVE$1;
async function visitAsync_(key, node2, visitor, path2) {
  const ctrl = await callVisitor(key, node2, visitor, path2);
  if (identity$w.isNode(ctrl) || identity$w.isPair(ctrl)) {
    replaceNode(key, path2, ctrl);
    return visitAsync_(key, ctrl, visitor, path2);
  }
  if (typeof ctrl !== "symbol") {
    if (identity$w.isCollection(node2)) {
      path2 = Object.freeze(path2.concat(node2));
      for (let i = 0; i < node2.items.length; ++i) {
        const ci = await visitAsync_(i, node2.items[i], visitor, path2);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK$1)
          return BREAK$1;
        else if (ci === REMOVE$1) {
          node2.items.splice(i, 1);
          i -= 1;
        }
      }
    } else if (identity$w.isPair(node2)) {
      path2 = Object.freeze(path2.concat(node2));
      const ck = await visitAsync_("key", node2.key, visitor, path2);
      if (ck === BREAK$1)
        return BREAK$1;
      else if (ck === REMOVE$1)
        node2.key = null;
      const cv = await visitAsync_("value", node2.value, visitor, path2);
      if (cv === BREAK$1)
        return BREAK$1;
      else if (cv === REMOVE$1)
        node2.value = null;
    }
  }
  return ctrl;
}
function initVisitor(visitor) {
  if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
    return Object.assign({
      Alias: visitor.Node,
      Map: visitor.Node,
      Scalar: visitor.Node,
      Seq: visitor.Node
    }, visitor.Value && {
      Map: visitor.Value,
      Scalar: visitor.Value,
      Seq: visitor.Value
    }, visitor.Collection && {
      Map: visitor.Collection,
      Seq: visitor.Collection
    }, visitor);
  }
  return visitor;
}
function callVisitor(key, node2, visitor, path2) {
  var _a, _b, _c, _d, _e;
  if (typeof visitor === "function")
    return visitor(key, node2, path2);
  if (identity$w.isMap(node2))
    return (_a = visitor.Map) == null ? void 0 : _a.call(visitor, key, node2, path2);
  if (identity$w.isSeq(node2))
    return (_b = visitor.Seq) == null ? void 0 : _b.call(visitor, key, node2, path2);
  if (identity$w.isPair(node2))
    return (_c = visitor.Pair) == null ? void 0 : _c.call(visitor, key, node2, path2);
  if (identity$w.isScalar(node2))
    return (_d = visitor.Scalar) == null ? void 0 : _d.call(visitor, key, node2, path2);
  if (identity$w.isAlias(node2))
    return (_e = visitor.Alias) == null ? void 0 : _e.call(visitor, key, node2, path2);
  return void 0;
}
function replaceNode(key, path2, node2) {
  const parent = path2[path2.length - 1];
  if (identity$w.isCollection(parent)) {
    parent.items[key] = node2;
  } else if (identity$w.isPair(parent)) {
    if (key === "key")
      parent.key = node2;
    else
      parent.value = node2;
  } else if (identity$w.isDocument(parent)) {
    parent.contents = node2;
  } else {
    const pt = identity$w.isAlias(parent) ? "alias" : "scalar";
    throw new Error(`Cannot replace node with ${pt} parent`);
  }
}
visit$6.visit = visit$5;
visit$6.visitAsync = visitAsync;
var identity$v = identity$x;
var visit$4 = visit$6;
const escapeChars = {
  "!": "%21",
  ",": "%2C",
  "[": "%5B",
  "]": "%5D",
  "{": "%7B",
  "}": "%7D"
};
const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
class Directives {
  constructor(yaml, tags2) {
    this.docStart = null;
    this.docEnd = false;
    this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
    this.tags = Object.assign({}, Directives.defaultTags, tags2);
  }
  clone() {
    const copy = new Directives(this.yaml, this.tags);
    copy.docStart = this.docStart;
    return copy;
  }
  /**
   * During parsing, get a Directives instance for the current document and
   * update the stream state according to the current version's spec.
   */
  atDocument() {
    const res = new Directives(this.yaml, this.tags);
    switch (this.yaml.version) {
      case "1.1":
        this.atNextDocument = true;
        break;
      case "1.2":
        this.atNextDocument = false;
        this.yaml = {
          explicit: Directives.defaultYaml.explicit,
          version: "1.2"
        };
        this.tags = Object.assign({}, Directives.defaultTags);
        break;
    }
    return res;
  }
  /**
   * @param onError - May be called even if the action was successful
   * @returns `true` on success
   */
  add(line, onError) {
    if (this.atNextDocument) {
      this.yaml = { explicit: Directives.defaultYaml.explicit, version: "1.1" };
      this.tags = Object.assign({}, Directives.defaultTags);
      this.atNextDocument = false;
    }
    const parts = line.trim().split(/[ \t]+/);
    const name = parts.shift();
    switch (name) {
      case "%TAG": {
        if (parts.length !== 2) {
          onError(0, "%TAG directive should contain exactly two parts");
          if (parts.length < 2)
            return false;
        }
        const [handle, prefix] = parts;
        this.tags[handle] = prefix;
        return true;
      }
      case "%YAML": {
        this.yaml.explicit = true;
        if (parts.length !== 1) {
          onError(0, "%YAML directive should contain exactly one part");
          return false;
        }
        const [version2] = parts;
        if (version2 === "1.1" || version2 === "1.2") {
          this.yaml.version = version2;
          return true;
        } else {
          const isValid = /^\d+\.\d+$/.test(version2);
          onError(6, `Unsupported YAML version ${version2}`, isValid);
          return false;
        }
      }
      default:
        onError(0, `Unknown directive ${name}`, true);
        return false;
    }
  }
  /**
   * Resolves a tag, matching handles to those defined in %TAG directives.
   *
   * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
   *   `'!local'` tag, or `null` if unresolvable.
   */
  tagName(source, onError) {
    if (source === "!")
      return "!";
    if (source[0] !== "!") {
      onError(`Not a valid tag: ${source}`);
      return null;
    }
    if (source[1] === "<") {
      const verbatim = source.slice(2, -1);
      if (verbatim === "!" || verbatim === "!!") {
        onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
        return null;
      }
      if (source[source.length - 1] !== ">")
        onError("Verbatim tags must end with a >");
      return verbatim;
    }
    const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
    if (!suffix)
      onError(`The ${source} tag has no suffix`);
    const prefix = this.tags[handle];
    if (prefix) {
      try {
        return prefix + decodeURIComponent(suffix);
      } catch (error) {
        onError(String(error));
        return null;
      }
    }
    if (handle === "!")
      return source;
    onError(`Could not resolve tag: ${source}`);
    return null;
  }
  /**
   * Given a fully resolved tag, returns its printable string form,
   * taking into account current tag prefixes and defaults.
   */
  tagString(tag) {
    for (const [handle, prefix] of Object.entries(this.tags)) {
      if (tag.startsWith(prefix))
        return handle + escapeTagName(tag.substring(prefix.length));
    }
    return tag[0] === "!" ? tag : `!<${tag}>`;
  }
  toString(doc) {
    const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
    const tagEntries = Object.entries(this.tags);
    let tagNames;
    if (doc && tagEntries.length > 0 && identity$v.isNode(doc.contents)) {
      const tags2 = {};
      visit$4.visit(doc.contents, (_key, node2) => {
        if (identity$v.isNode(node2) && node2.tag)
          tags2[node2.tag] = true;
      });
      tagNames = Object.keys(tags2);
    } else
      tagNames = [];
    for (const [handle, prefix] of tagEntries) {
      if (handle === "!!" && prefix === "tag:yaml.org,2002:")
        continue;
      if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
        lines.push(`%TAG ${handle} ${prefix}`);
    }
    return lines.join("\n");
  }
}
Directives.defaultYaml = { explicit: false, version: "1.2" };
Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
directives$2.Directives = Directives;
var Document$5 = {};
var Alias$5 = {};
var anchors$3 = {};
var identity$u = identity$x;
var visit$3 = visit$6;
function anchorIsValid(anchor) {
  if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
    const sa = JSON.stringify(anchor);
    const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
    throw new Error(msg);
  }
  return true;
}
function anchorNames(root) {
  const anchors2 = /* @__PURE__ */ new Set();
  visit$3.visit(root, {
    Value(_key, node2) {
      if (node2.anchor)
        anchors2.add(node2.anchor);
    }
  });
  return anchors2;
}
function findNewAnchor(prefix, exclude) {
  for (let i = 1; true; ++i) {
    const name = `${prefix}${i}`;
    if (!exclude.has(name))
      return name;
  }
}
function createNodeAnchors(doc, prefix) {
  const aliasObjects = [];
  const sourceObjects = /* @__PURE__ */ new Map();
  let prevAnchors = null;
  return {
    onAnchor: (source) => {
      aliasObjects.push(source);
      prevAnchors ?? (prevAnchors = anchorNames(doc));
      const anchor = findNewAnchor(prefix, prevAnchors);
      prevAnchors.add(anchor);
      return anchor;
    },
    /**
     * With circular references, the source node is only resolved after all
     * of its child nodes are. This is why anchors are set only after all of
     * the nodes have been created.
     */
    setAnchors: () => {
      for (const source of aliasObjects) {
        const ref2 = sourceObjects.get(source);
        if (typeof ref2 === "object" && ref2.anchor && (identity$u.isScalar(ref2.node) || identity$u.isCollection(ref2.node))) {
          ref2.node.anchor = ref2.anchor;
        } else {
          const error = new Error("Failed to resolve repeated object (this should not happen)");
          error.source = source;
          throw error;
        }
      }
    },
    sourceObjects
  };
}
anchors$3.anchorIsValid = anchorIsValid;
anchors$3.anchorNames = anchorNames;
anchors$3.createNodeAnchors = createNodeAnchors;
anchors$3.findNewAnchor = findNewAnchor;
var Node$3 = {};
var applyReviver$3 = {};
function applyReviver$2(reviver, obj, key, val) {
  if (val && typeof val === "object") {
    if (Array.isArray(val)) {
      for (let i = 0, len = val.length; i < len; ++i) {
        const v0 = val[i];
        const v1 = applyReviver$2(reviver, val, String(i), v0);
        if (v1 === void 0)
          delete val[i];
        else if (v1 !== v0)
          val[i] = v1;
      }
    } else if (val instanceof Map) {
      for (const k of Array.from(val.keys())) {
        const v0 = val.get(k);
        const v1 = applyReviver$2(reviver, val, k, v0);
        if (v1 === void 0)
          val.delete(k);
        else if (v1 !== v0)
          val.set(k, v1);
      }
    } else if (val instanceof Set) {
      for (const v0 of Array.from(val)) {
        const v1 = applyReviver$2(reviver, val, v0, v0);
        if (v1 === void 0)
          val.delete(v0);
        else if (v1 !== v0) {
          val.delete(v0);
          val.add(v1);
        }
      }
    } else {
      for (const [k, v0] of Object.entries(val)) {
        const v1 = applyReviver$2(reviver, val, k, v0);
        if (v1 === void 0)
          delete val[k];
        else if (v1 !== v0)
          val[k] = v1;
      }
    }
  }
  return reviver.call(obj, key, val);
}
applyReviver$3.applyReviver = applyReviver$2;
var toJS$8 = {};
var identity$t = identity$x;
function toJS$7(value, arg, ctx) {
  if (Array.isArray(value))
    return value.map((v, i) => toJS$7(v, String(i), ctx));
  if (value && typeof value.toJSON === "function") {
    if (!ctx || !identity$t.hasAnchor(value))
      return value.toJSON(arg, ctx);
    const data = { aliasCount: 0, count: 1, res: void 0 };
    ctx.anchors.set(value, data);
    ctx.onCreate = (res2) => {
      data.res = res2;
      delete ctx.onCreate;
    };
    const res = value.toJSON(arg, ctx);
    if (ctx.onCreate)
      ctx.onCreate(res);
    return res;
  }
  if (typeof value === "bigint" && !(ctx == null ? void 0 : ctx.keep))
    return Number(value);
  return value;
}
toJS$8.toJS = toJS$7;
var applyReviver$1 = applyReviver$3;
var identity$s = identity$x;
var toJS$6 = toJS$8;
class NodeBase {
  constructor(type2) {
    Object.defineProperty(this, identity$s.NODE_TYPE, { value: type2 });
  }
  /** Create a copy of this node.  */
  clone() {
    const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /** A plain JavaScript representation of this node. */
  toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
    if (!identity$s.isDocument(doc))
      throw new TypeError("A document argument is required");
    const ctx = {
      anchors: /* @__PURE__ */ new Map(),
      doc,
      keep: true,
      mapAsMap: mapAsMap === true,
      mapKeyWarned: false,
      maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
    };
    const res = toJS$6.toJS(this, "", ctx);
    if (typeof onAnchor === "function")
      for (const { count, res: res2 } of ctx.anchors.values())
        onAnchor(res2, count);
    return typeof reviver === "function" ? applyReviver$1.applyReviver(reviver, { "": res }, "", res) : res;
  }
}
Node$3.NodeBase = NodeBase;
var anchors$2 = anchors$3;
var visit$2 = visit$6;
var identity$r = identity$x;
var Node$2 = Node$3;
var toJS$5 = toJS$8;
let Alias$4 = class Alias extends Node$2.NodeBase {
  constructor(source) {
    super(identity$r.ALIAS);
    this.source = source;
    Object.defineProperty(this, "tag", {
      set() {
        throw new Error("Alias nodes cannot have tags");
      }
    });
  }
  /**
   * Resolve the value of this alias within `doc`, finding the last
   * instance of the `source` anchor before this node.
   */
  resolve(doc, ctx) {
    let nodes;
    if (ctx == null ? void 0 : ctx.aliasResolveCache) {
      nodes = ctx.aliasResolveCache;
    } else {
      nodes = [];
      visit$2.visit(doc, {
        Node: (_key, node2) => {
          if (identity$r.isAlias(node2) || identity$r.hasAnchor(node2))
            nodes.push(node2);
        }
      });
      if (ctx)
        ctx.aliasResolveCache = nodes;
    }
    let found = void 0;
    for (const node2 of nodes) {
      if (node2 === this)
        break;
      if (node2.anchor === this.source)
        found = node2;
    }
    return found;
  }
  toJSON(_arg, ctx) {
    if (!ctx)
      return { source: this.source };
    const { anchors: anchors2, doc, maxAliasCount } = ctx;
    const source = this.resolve(doc, ctx);
    if (!source) {
      const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(msg);
    }
    let data = anchors2.get(source);
    if (!data) {
      toJS$5.toJS(source, null, ctx);
      data = anchors2.get(source);
    }
    if ((data == null ? void 0 : data.res) === void 0) {
      const msg = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(msg);
    }
    if (maxAliasCount >= 0) {
      data.count += 1;
      if (data.aliasCount === 0)
        data.aliasCount = getAliasCount(doc, source, anchors2);
      if (data.count * data.aliasCount > maxAliasCount) {
        const msg = "Excessive alias count indicates a resource exhaustion attack";
        throw new ReferenceError(msg);
      }
    }
    return data.res;
  }
  toString(ctx, _onComment, _onChompKeep) {
    const src2 = `*${this.source}`;
    if (ctx) {
      anchors$2.anchorIsValid(this.source);
      if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(msg);
      }
      if (ctx.implicitKey)
        return `${src2} `;
    }
    return src2;
  }
};
function getAliasCount(doc, node2, anchors2) {
  if (identity$r.isAlias(node2)) {
    const source = node2.resolve(doc);
    const anchor = anchors2 && source && anchors2.get(source);
    return anchor ? anchor.count * anchor.aliasCount : 0;
  } else if (identity$r.isCollection(node2)) {
    let count = 0;
    for (const item of node2.items) {
      const c = getAliasCount(doc, item, anchors2);
      if (c > count)
        count = c;
    }
    return count;
  } else if (identity$r.isPair(node2)) {
    const kc = getAliasCount(doc, node2.key, anchors2);
    const vc = getAliasCount(doc, node2.value, anchors2);
    return Math.max(kc, vc);
  }
  return 1;
}
Alias$5.Alias = Alias$4;
var Collection$4 = {};
var createNode$5 = {};
var Scalar$k = {};
var identity$q = identity$x;
var Node$1 = Node$3;
var toJS$4 = toJS$8;
const isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
let Scalar$j = class Scalar extends Node$1.NodeBase {
  constructor(value) {
    super(identity$q.SCALAR);
    this.value = value;
  }
  toJSON(arg, ctx) {
    return (ctx == null ? void 0 : ctx.keep) ? this.value : toJS$4.toJS(this.value, arg, ctx);
  }
  toString() {
    return String(this.value);
  }
};
Scalar$j.BLOCK_FOLDED = "BLOCK_FOLDED";
Scalar$j.BLOCK_LITERAL = "BLOCK_LITERAL";
Scalar$j.PLAIN = "PLAIN";
Scalar$j.QUOTE_DOUBLE = "QUOTE_DOUBLE";
Scalar$j.QUOTE_SINGLE = "QUOTE_SINGLE";
Scalar$k.Scalar = Scalar$j;
Scalar$k.isScalarValue = isScalarValue;
var Alias$3 = Alias$5;
var identity$p = identity$x;
var Scalar$i = Scalar$k;
const defaultTagPrefix = "tag:yaml.org,2002:";
function findTagObject(value, tagName, tags2) {
  if (tagName) {
    const match = tags2.filter((t) => t.tag === tagName);
    const tagObj = match.find((t) => !t.format) ?? match[0];
    if (!tagObj)
      throw new Error(`Tag ${tagName} not found`);
    return tagObj;
  }
  return tags2.find((t) => {
    var _a;
    return ((_a = t.identify) == null ? void 0 : _a.call(t, value)) && !t.format;
  });
}
function createNode$4(value, tagName, ctx) {
  var _a, _b, _c;
  if (identity$p.isDocument(value))
    value = value.contents;
  if (identity$p.isNode(value))
    return value;
  if (identity$p.isPair(value)) {
    const map2 = (_b = (_a = ctx.schema[identity$p.MAP]).createNode) == null ? void 0 : _b.call(_a, ctx.schema, null, ctx);
    map2.items.push(value);
    return map2;
  }
  if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
    value = value.valueOf();
  }
  const { aliasDuplicateObjects, onAnchor, onTagObj, schema: schema2, sourceObjects } = ctx;
  let ref2 = void 0;
  if (aliasDuplicateObjects && value && typeof value === "object") {
    ref2 = sourceObjects.get(value);
    if (ref2) {
      ref2.anchor ?? (ref2.anchor = onAnchor(value));
      return new Alias$3.Alias(ref2.anchor);
    } else {
      ref2 = { anchor: null, node: null };
      sourceObjects.set(value, ref2);
    }
  }
  if (tagName == null ? void 0 : tagName.startsWith("!!"))
    tagName = defaultTagPrefix + tagName.slice(2);
  let tagObj = findTagObject(value, tagName, schema2.tags);
  if (!tagObj) {
    if (value && typeof value.toJSON === "function") {
      value = value.toJSON();
    }
    if (!value || typeof value !== "object") {
      const node3 = new Scalar$i.Scalar(value);
      if (ref2)
        ref2.node = node3;
      return node3;
    }
    tagObj = value instanceof Map ? schema2[identity$p.MAP] : Symbol.iterator in Object(value) ? schema2[identity$p.SEQ] : schema2[identity$p.MAP];
  }
  if (onTagObj) {
    onTagObj(tagObj);
    delete ctx.onTagObj;
  }
  const node2 = (tagObj == null ? void 0 : tagObj.createNode) ? tagObj.createNode(ctx.schema, value, ctx) : typeof ((_c = tagObj == null ? void 0 : tagObj.nodeClass) == null ? void 0 : _c.from) === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar$i.Scalar(value);
  if (tagName)
    node2.tag = tagName;
  else if (!tagObj.default)
    node2.tag = tagObj.tag;
  if (ref2)
    ref2.node = node2;
  return node2;
}
createNode$5.createNode = createNode$4;
var createNode$3 = createNode$5;
var identity$o = identity$x;
var Node = Node$3;
function collectionFromPath(schema2, path2, value) {
  let v = value;
  for (let i = path2.length - 1; i >= 0; --i) {
    const k = path2[i];
    if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
      const a = [];
      a[k] = v;
      v = a;
    } else {
      v = /* @__PURE__ */ new Map([[k, v]]);
    }
  }
  return createNode$3.createNode(v, void 0, {
    aliasDuplicateObjects: false,
    keepUndefined: false,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: schema2,
    sourceObjects: /* @__PURE__ */ new Map()
  });
}
const isEmptyPath = (path2) => path2 == null || typeof path2 === "object" && !!path2[Symbol.iterator]().next().done;
let Collection$3 = class Collection extends Node.NodeBase {
  constructor(type2, schema2) {
    super(type2);
    Object.defineProperty(this, "schema", {
      value: schema2,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  /**
   * Create a copy of this collection.
   *
   * @param schema - If defined, overwrites the original's schema
   */
  clone(schema2) {
    const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    if (schema2)
      copy.schema = schema2;
    copy.items = copy.items.map((it) => identity$o.isNode(it) || identity$o.isPair(it) ? it.clone(schema2) : it);
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /**
   * Adds a value to the collection. For `!!map` and `!!omap` the value must
   * be a Pair instance or a `{ key, value }` object, which may not have a key
   * that already exists in the map.
   */
  addIn(path2, value) {
    if (isEmptyPath(path2))
      this.add(value);
    else {
      const [key, ...rest] = path2;
      const node2 = this.get(key, true);
      if (identity$o.isCollection(node2))
        node2.addIn(rest, value);
      else if (node2 === void 0 && this.schema)
        this.set(key, collectionFromPath(this.schema, rest, value));
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
  }
  /**
   * Removes a value from the collection.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(path2) {
    const [key, ...rest] = path2;
    if (rest.length === 0)
      return this.delete(key);
    const node2 = this.get(key, true);
    if (identity$o.isCollection(node2))
      return node2.deleteIn(rest);
    else
      throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(path2, keepScalar) {
    const [key, ...rest] = path2;
    const node2 = this.get(key, true);
    if (rest.length === 0)
      return !keepScalar && identity$o.isScalar(node2) ? node2.value : node2;
    else
      return identity$o.isCollection(node2) ? node2.getIn(rest, keepScalar) : void 0;
  }
  hasAllNullValues(allowScalar) {
    return this.items.every((node2) => {
      if (!identity$o.isPair(node2))
        return false;
      const n = node2.value;
      return n == null || allowScalar && identity$o.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
    });
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   */
  hasIn(path2) {
    const [key, ...rest] = path2;
    if (rest.length === 0)
      return this.has(key);
    const node2 = this.get(key, true);
    return identity$o.isCollection(node2) ? node2.hasIn(rest) : false;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(path2, value) {
    const [key, ...rest] = path2;
    if (rest.length === 0) {
      this.set(key, value);
    } else {
      const node2 = this.get(key, true);
      if (identity$o.isCollection(node2))
        node2.setIn(rest, value);
      else if (node2 === void 0 && this.schema)
        this.set(key, collectionFromPath(this.schema, rest, value));
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
  }
};
Collection$4.Collection = Collection$3;
Collection$4.collectionFromPath = collectionFromPath;
Collection$4.isEmptyPath = isEmptyPath;
var Pair$8 = {};
var stringifyPair$2 = {};
var stringify$7 = {};
var stringifyComment$5 = {};
const stringifyComment$4 = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
function indentComment(comment, indent) {
  if (/^\n+$/.test(comment))
    return comment.substring(1);
  return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
}
const lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
stringifyComment$5.indentComment = indentComment;
stringifyComment$5.lineComment = lineComment;
stringifyComment$5.stringifyComment = stringifyComment$4;
var stringifyString$5 = {};
var foldFlowLines$2 = {};
const FOLD_FLOW = "flow";
const FOLD_BLOCK = "block";
const FOLD_QUOTED = "quoted";
function foldFlowLines$1(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
  if (!lineWidth || lineWidth < 0)
    return text;
  if (lineWidth < minContentWidth)
    minContentWidth = 0;
  const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
  if (text.length <= endStep)
    return text;
  const folds = [];
  const escapedFolds = {};
  let end = lineWidth - indent.length;
  if (typeof indentAtStart === "number") {
    if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
      folds.push(0);
    else
      end = lineWidth - indentAtStart;
  }
  let split = void 0;
  let prev = void 0;
  let overflow = false;
  let i = -1;
  let escStart = -1;
  let escEnd = -1;
  if (mode === FOLD_BLOCK) {
    i = consumeMoreIndentedLines(text, i, indent.length);
    if (i !== -1)
      end = i + endStep;
  }
  for (let ch; ch = text[i += 1]; ) {
    if (mode === FOLD_QUOTED && ch === "\\") {
      escStart = i;
      switch (text[i + 1]) {
        case "x":
          i += 3;
          break;
        case "u":
          i += 5;
          break;
        case "U":
          i += 9;
          break;
        default:
          i += 1;
      }
      escEnd = i;
    }
    if (ch === "\n") {
      if (mode === FOLD_BLOCK)
        i = consumeMoreIndentedLines(text, i, indent.length);
      end = i + indent.length + endStep;
      split = void 0;
    } else {
      if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
        const next = text[i + 1];
        if (next && next !== " " && next !== "\n" && next !== "	")
          split = i;
      }
      if (i >= end) {
        if (split) {
          folds.push(split);
          end = split + endStep;
          split = void 0;
        } else if (mode === FOLD_QUOTED) {
          while (prev === " " || prev === "	") {
            prev = ch;
            ch = text[i += 1];
            overflow = true;
          }
          const j = i > escEnd + 1 ? i - 2 : escStart - 1;
          if (escapedFolds[j])
            return text;
          folds.push(j);
          escapedFolds[j] = true;
          end = j + endStep;
          split = void 0;
        } else {
          overflow = true;
        }
      }
    }
    prev = ch;
  }
  if (overflow && onOverflow)
    onOverflow();
  if (folds.length === 0)
    return text;
  if (onFold)
    onFold();
  let res = text.slice(0, folds[0]);
  for (let i2 = 0; i2 < folds.length; ++i2) {
    const fold = folds[i2];
    const end2 = folds[i2 + 1] || text.length;
    if (fold === 0)
      res = `
${indent}${text.slice(0, end2)}`;
    else {
      if (mode === FOLD_QUOTED && escapedFolds[fold])
        res += `${text[fold]}\\`;
      res += `
${indent}${text.slice(fold + 1, end2)}`;
    }
  }
  return res;
}
function consumeMoreIndentedLines(text, i, indent) {
  let end = i;
  let start = i + 1;
  let ch = text[start];
  while (ch === " " || ch === "	") {
    if (i < start + indent) {
      ch = text[++i];
    } else {
      do {
        ch = text[++i];
      } while (ch && ch !== "\n");
      end = i;
      start = i + 1;
      ch = text[start];
    }
  }
  return end;
}
foldFlowLines$2.FOLD_BLOCK = FOLD_BLOCK;
foldFlowLines$2.FOLD_FLOW = FOLD_FLOW;
foldFlowLines$2.FOLD_QUOTED = FOLD_QUOTED;
foldFlowLines$2.foldFlowLines = foldFlowLines$1;
var Scalar$h = Scalar$k;
var foldFlowLines = foldFlowLines$2;
const getFoldOptions = (ctx, isBlock2) => ({
  indentAtStart: isBlock2 ? ctx.indent.length : ctx.indentAtStart,
  lineWidth: ctx.options.lineWidth,
  minContentWidth: ctx.options.minContentWidth
});
const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
function lineLengthOverLimit(str, lineWidth, indentLength) {
  if (!lineWidth || lineWidth < 0)
    return false;
  const limit = lineWidth - indentLength;
  const strLen = str.length;
  if (strLen <= limit)
    return false;
  for (let i = 0, start = 0; i < strLen; ++i) {
    if (str[i] === "\n") {
      if (i - start > limit)
        return true;
      start = i + 1;
      if (strLen - start <= limit)
        return false;
    }
  }
  return true;
}
function doubleQuotedString(value, ctx) {
  const json = JSON.stringify(value);
  if (ctx.options.doubleQuotedAsJSON)
    return json;
  const { implicitKey } = ctx;
  const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
  const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
  let str = "";
  let start = 0;
  for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
    if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
      str += json.slice(start, i) + "\\ ";
      i += 1;
      start = i;
      ch = "\\";
    }
    if (ch === "\\")
      switch (json[i + 1]) {
        case "u":
          {
            str += json.slice(start, i);
            const code = json.substr(i + 2, 4);
            switch (code) {
              case "0000":
                str += "\\0";
                break;
              case "0007":
                str += "\\a";
                break;
              case "000b":
                str += "\\v";
                break;
              case "001b":
                str += "\\e";
                break;
              case "0085":
                str += "\\N";
                break;
              case "00a0":
                str += "\\_";
                break;
              case "2028":
                str += "\\L";
                break;
              case "2029":
                str += "\\P";
                break;
              default:
                if (code.substr(0, 2) === "00")
                  str += "\\x" + code.substr(2);
                else
                  str += json.substr(i, 6);
            }
            i += 5;
            start = i + 1;
          }
          break;
        case "n":
          if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
            i += 1;
          } else {
            str += json.slice(start, i) + "\n\n";
            while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
              str += "\n";
              i += 2;
            }
            str += indent;
            if (json[i + 2] === " ")
              str += "\\";
            i += 1;
            start = i + 1;
          }
          break;
        default:
          i += 1;
      }
  }
  str = start ? str + json.slice(start) : json;
  return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
}
function singleQuotedString(value, ctx) {
  if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
    return doubleQuotedString(value, ctx);
  const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
  const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
  return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
}
function quotedString(value, ctx) {
  const { singleQuote } = ctx.options;
  let qs;
  if (singleQuote === false)
    qs = doubleQuotedString;
  else {
    const hasDouble = value.includes('"');
    const hasSingle = value.includes("'");
    if (hasDouble && !hasSingle)
      qs = singleQuotedString;
    else if (hasSingle && !hasDouble)
      qs = doubleQuotedString;
    else
      qs = singleQuote ? singleQuotedString : doubleQuotedString;
  }
  return qs(value, ctx);
}
let blockEndNewlines;
try {
  blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
} catch {
  blockEndNewlines = /\n+(?!\n|$)/g;
}
function blockString({ comment, type: type2, value }, ctx, onComment, onChompKeep) {
  const { blockQuote, commentString, lineWidth } = ctx.options;
  if (!blockQuote || /\n[\t ]+$/.test(value)) {
    return quotedString(value, ctx);
  }
  const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
  const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type2 === Scalar$h.Scalar.BLOCK_FOLDED ? false : type2 === Scalar$h.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
  if (!value)
    return literal ? "|\n" : ">\n";
  let chomp;
  let endStart;
  for (endStart = value.length; endStart > 0; --endStart) {
    const ch = value[endStart - 1];
    if (ch !== "\n" && ch !== "	" && ch !== " ")
      break;
  }
  let end = value.substring(endStart);
  const endNlPos = end.indexOf("\n");
  if (endNlPos === -1) {
    chomp = "-";
  } else if (value === end || endNlPos !== end.length - 1) {
    chomp = "+";
    if (onChompKeep)
      onChompKeep();
  } else {
    chomp = "";
  }
  if (end) {
    value = value.slice(0, -end.length);
    if (end[end.length - 1] === "\n")
      end = end.slice(0, -1);
    end = end.replace(blockEndNewlines, `$&${indent}`);
  }
  let startWithSpace = false;
  let startEnd;
  let startNlPos = -1;
  for (startEnd = 0; startEnd < value.length; ++startEnd) {
    const ch = value[startEnd];
    if (ch === " ")
      startWithSpace = true;
    else if (ch === "\n")
      startNlPos = startEnd;
    else
      break;
  }
  let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
  if (start) {
    value = value.substring(start.length);
    start = start.replace(/\n+/g, `$&${indent}`);
  }
  const indentSize = indent ? "2" : "1";
  let header = (startWithSpace ? indentSize : "") + chomp;
  if (comment) {
    header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
    if (onComment)
      onComment();
  }
  if (!literal) {
    const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
    let literalFallback = false;
    const foldOptions = getFoldOptions(ctx, true);
    if (blockQuote !== "folded" && type2 !== Scalar$h.Scalar.BLOCK_FOLDED) {
      foldOptions.onOverflow = () => {
        literalFallback = true;
      };
    }
    const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
    if (!literalFallback)
      return `>${header}
${indent}${body}`;
  }
  value = value.replace(/\n+/g, `$&${indent}`);
  return `|${header}
${indent}${start}${value}${end}`;
}
function plainString(item, ctx, onComment, onChompKeep) {
  const { type: type2, value } = item;
  const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
  if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
    return quotedString(value, ctx);
  }
  if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
    return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
  }
  if (!implicitKey && !inFlow && type2 !== Scalar$h.Scalar.PLAIN && value.includes("\n")) {
    return blockString(item, ctx, onComment, onChompKeep);
  }
  if (containsDocumentMarker(value)) {
    if (indent === "") {
      ctx.forceBlockIndent = true;
      return blockString(item, ctx, onComment, onChompKeep);
    } else if (implicitKey && indent === indentStep) {
      return quotedString(value, ctx);
    }
  }
  const str = value.replace(/\n+/g, `$&
${indent}`);
  if (actualString) {
    const test2 = (tag) => {
      var _a;
      return tag.default && tag.tag !== "tag:yaml.org,2002:str" && ((_a = tag.test) == null ? void 0 : _a.test(str));
    };
    const { compat, tags: tags2 } = ctx.doc.schema;
    if (tags2.some(test2) || (compat == null ? void 0 : compat.some(test2)))
      return quotedString(value, ctx);
  }
  return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
}
function stringifyString$4(item, ctx, onComment, onChompKeep) {
  const { implicitKey, inFlow } = ctx;
  const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
  let { type: type2 } = item;
  if (type2 !== Scalar$h.Scalar.QUOTE_DOUBLE) {
    if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
      type2 = Scalar$h.Scalar.QUOTE_DOUBLE;
  }
  const _stringify = (_type) => {
    switch (_type) {
      case Scalar$h.Scalar.BLOCK_FOLDED:
      case Scalar$h.Scalar.BLOCK_LITERAL:
        return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
      case Scalar$h.Scalar.QUOTE_DOUBLE:
        return doubleQuotedString(ss.value, ctx);
      case Scalar$h.Scalar.QUOTE_SINGLE:
        return singleQuotedString(ss.value, ctx);
      case Scalar$h.Scalar.PLAIN:
        return plainString(ss, ctx, onComment, onChompKeep);
      default:
        return null;
    }
  };
  let res = _stringify(type2);
  if (res === null) {
    const { defaultKeyType, defaultStringType } = ctx.options;
    const t = implicitKey && defaultKeyType || defaultStringType;
    res = _stringify(t);
    if (res === null)
      throw new Error(`Unsupported default string type ${t}`);
  }
  return res;
}
stringifyString$5.stringifyString = stringifyString$4;
var anchors$1 = anchors$3;
var identity$n = identity$x;
var stringifyComment$3 = stringifyComment$5;
var stringifyString$3 = stringifyString$5;
function createStringifyContext(doc, options) {
  const opt = Object.assign({
    blockQuote: true,
    commentString: stringifyComment$3.stringifyComment,
    defaultKeyType: null,
    defaultStringType: "PLAIN",
    directives: null,
    doubleQuotedAsJSON: false,
    doubleQuotedMinMultiLineLength: 40,
    falseStr: "false",
    flowCollectionPadding: true,
    indentSeq: true,
    lineWidth: 80,
    minContentWidth: 20,
    nullStr: "null",
    simpleKeys: false,
    singleQuote: null,
    trueStr: "true",
    verifyAliasOrder: true
  }, doc.schema.toStringOptions, options);
  let inFlow;
  switch (opt.collectionStyle) {
    case "block":
      inFlow = false;
      break;
    case "flow":
      inFlow = true;
      break;
    default:
      inFlow = null;
  }
  return {
    anchors: /* @__PURE__ */ new Set(),
    doc,
    flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
    indent: "",
    indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
    inFlow,
    options: opt
  };
}
function getTagObject(tags2, item) {
  var _a;
  if (item.tag) {
    const match = tags2.filter((t) => t.tag === item.tag);
    if (match.length > 0)
      return match.find((t) => t.format === item.format) ?? match[0];
  }
  let tagObj = void 0;
  let obj;
  if (identity$n.isScalar(item)) {
    obj = item.value;
    let match = tags2.filter((t) => {
      var _a2;
      return (_a2 = t.identify) == null ? void 0 : _a2.call(t, obj);
    });
    if (match.length > 1) {
      const testMatch = match.filter((t) => t.test);
      if (testMatch.length > 0)
        match = testMatch;
    }
    tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
  } else {
    obj = item;
    tagObj = tags2.find((t) => t.nodeClass && obj instanceof t.nodeClass);
  }
  if (!tagObj) {
    const name = ((_a = obj == null ? void 0 : obj.constructor) == null ? void 0 : _a.name) ?? (obj === null ? "null" : typeof obj);
    throw new Error(`Tag not resolved for ${name} value`);
  }
  return tagObj;
}
function stringifyProps(node2, tagObj, { anchors: anchors$1$1, doc }) {
  if (!doc.directives)
    return "";
  const props = [];
  const anchor = (identity$n.isScalar(node2) || identity$n.isCollection(node2)) && node2.anchor;
  if (anchor && anchors$1.anchorIsValid(anchor)) {
    anchors$1$1.add(anchor);
    props.push(`&${anchor}`);
  }
  const tag = node2.tag ?? (tagObj.default ? null : tagObj.tag);
  if (tag)
    props.push(doc.directives.tagString(tag));
  return props.join(" ");
}
function stringify$6(item, ctx, onComment, onChompKeep) {
  var _a;
  if (identity$n.isPair(item))
    return item.toString(ctx, onComment, onChompKeep);
  if (identity$n.isAlias(item)) {
    if (ctx.doc.directives)
      return item.toString(ctx);
    if ((_a = ctx.resolvedAliases) == null ? void 0 : _a.has(item)) {
      throw new TypeError(`Cannot stringify circular structure without alias nodes`);
    } else {
      if (ctx.resolvedAliases)
        ctx.resolvedAliases.add(item);
      else
        ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
      item = item.resolve(ctx.doc);
    }
  }
  let tagObj = void 0;
  const node2 = identity$n.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
  tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node2));
  const props = stringifyProps(node2, tagObj, ctx);
  if (props.length > 0)
    ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
  const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node2, ctx, onComment, onChompKeep) : identity$n.isScalar(node2) ? stringifyString$3.stringifyString(node2, ctx, onComment, onChompKeep) : node2.toString(ctx, onComment, onChompKeep);
  if (!props)
    return str;
  return identity$n.isScalar(node2) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
}
stringify$7.createStringifyContext = createStringifyContext;
stringify$7.stringify = stringify$6;
var identity$m = identity$x;
var Scalar$g = Scalar$k;
var stringify$5 = stringify$7;
var stringifyComment$2 = stringifyComment$5;
function stringifyPair$1({ key, value }, ctx, onComment, onChompKeep) {
  const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
  let keyComment = identity$m.isNode(key) && key.comment || null;
  if (simpleKeys) {
    if (keyComment) {
      throw new Error("With simple keys, key nodes cannot have comments");
    }
    if (identity$m.isCollection(key) || !identity$m.isNode(key) && typeof key === "object") {
      const msg = "With simple keys, collection cannot be used as a key value";
      throw new Error(msg);
    }
  }
  let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity$m.isCollection(key) || (identity$m.isScalar(key) ? key.type === Scalar$g.Scalar.BLOCK_FOLDED || key.type === Scalar$g.Scalar.BLOCK_LITERAL : typeof key === "object"));
  ctx = Object.assign({}, ctx, {
    allNullValues: false,
    implicitKey: !explicitKey && (simpleKeys || !allNullValues),
    indent: indent + indentStep
  });
  let keyCommentDone = false;
  let chompKeep = false;
  let str = stringify$5.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
  if (!explicitKey && !ctx.inFlow && str.length > 1024) {
    if (simpleKeys)
      throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
    explicitKey = true;
  }
  if (ctx.inFlow) {
    if (allNullValues || value == null) {
      if (keyCommentDone && onComment)
        onComment();
      return str === "" ? "?" : explicitKey ? `? ${str}` : str;
    }
  } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
    str = `? ${str}`;
    if (keyComment && !keyCommentDone) {
      str += stringifyComment$2.lineComment(str, ctx.indent, commentString(keyComment));
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  if (keyCommentDone)
    keyComment = null;
  if (explicitKey) {
    if (keyComment)
      str += stringifyComment$2.lineComment(str, ctx.indent, commentString(keyComment));
    str = `? ${str}
${indent}:`;
  } else {
    str = `${str}:`;
    if (keyComment)
      str += stringifyComment$2.lineComment(str, ctx.indent, commentString(keyComment));
  }
  let vsb, vcb, valueComment;
  if (identity$m.isNode(value)) {
    vsb = !!value.spaceBefore;
    vcb = value.commentBefore;
    valueComment = value.comment;
  } else {
    vsb = false;
    vcb = null;
    valueComment = null;
    if (value && typeof value === "object")
      value = doc.createNode(value);
  }
  ctx.implicitKey = false;
  if (!explicitKey && !keyComment && identity$m.isScalar(value))
    ctx.indentAtStart = str.length + 1;
  chompKeep = false;
  if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity$m.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
    ctx.indent = ctx.indent.substring(2);
  }
  let valueCommentDone = false;
  const valueStr = stringify$5.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
  let ws = " ";
  if (keyComment || vsb || vcb) {
    ws = vsb ? "\n" : "";
    if (vcb) {
      const cs = commentString(vcb);
      ws += `
${stringifyComment$2.indentComment(cs, ctx.indent)}`;
    }
    if (valueStr === "" && !ctx.inFlow) {
      if (ws === "\n" && valueComment)
        ws = "\n\n";
    } else {
      ws += `
${ctx.indent}`;
    }
  } else if (!explicitKey && identity$m.isCollection(value)) {
    const vs0 = valueStr[0];
    const nl0 = valueStr.indexOf("\n");
    const hasNewline = nl0 !== -1;
    const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
    if (hasNewline || !flow) {
      let hasPropsLine = false;
      if (hasNewline && (vs0 === "&" || vs0 === "!")) {
        let sp0 = valueStr.indexOf(" ");
        if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
          sp0 = valueStr.indexOf(" ", sp0 + 1);
        }
        if (sp0 === -1 || nl0 < sp0)
          hasPropsLine = true;
      }
      if (!hasPropsLine)
        ws = `
${ctx.indent}`;
    }
  } else if (valueStr === "" || valueStr[0] === "\n") {
    ws = "";
  }
  str += ws + valueStr;
  if (ctx.inFlow) {
    if (valueCommentDone && onComment)
      onComment();
  } else if (valueComment && !valueCommentDone) {
    str += stringifyComment$2.lineComment(str, ctx.indent, commentString(valueComment));
  } else if (chompKeep && onChompKeep) {
    onChompKeep();
  }
  return str;
}
stringifyPair$2.stringifyPair = stringifyPair$1;
var addPairToJSMap$3 = {};
var log$2 = {};
var node_process$2 = require$$0$1;
function debug$2(logLevel, ...messages) {
  if (logLevel === "debug")
    console.log(...messages);
}
function warn(logLevel, warning) {
  if (logLevel === "debug" || logLevel === "warn") {
    if (typeof node_process$2.emitWarning === "function")
      node_process$2.emitWarning(warning);
    else
      console.warn(warning);
  }
}
log$2.debug = debug$2;
log$2.warn = warn;
var merge$5 = {};
var identity$l = identity$x;
var Scalar$f = Scalar$k;
const MERGE_KEY = "<<";
const merge$4 = {
  identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
  default: "key",
  tag: "tag:yaml.org,2002:merge",
  test: /^<<$/,
  resolve: () => Object.assign(new Scalar$f.Scalar(Symbol(MERGE_KEY)), {
    addToJSMap: addMergeToJSMap
  }),
  stringify: () => MERGE_KEY
};
const isMergeKey = (ctx, key) => (merge$4.identify(key) || identity$l.isScalar(key) && (!key.type || key.type === Scalar$f.Scalar.PLAIN) && merge$4.identify(key.value)) && (ctx == null ? void 0 : ctx.doc.schema.tags.some((tag) => tag.tag === merge$4.tag && tag.default));
function addMergeToJSMap(ctx, map2, value) {
  value = ctx && identity$l.isAlias(value) ? value.resolve(ctx.doc) : value;
  if (identity$l.isSeq(value))
    for (const it of value.items)
      mergeValue(ctx, map2, it);
  else if (Array.isArray(value))
    for (const it of value)
      mergeValue(ctx, map2, it);
  else
    mergeValue(ctx, map2, value);
}
function mergeValue(ctx, map2, value) {
  const source = ctx && identity$l.isAlias(value) ? value.resolve(ctx.doc) : value;
  if (!identity$l.isMap(source))
    throw new Error("Merge sources must be maps or map aliases");
  const srcMap = source.toJSON(null, ctx, Map);
  for (const [key, value2] of srcMap) {
    if (map2 instanceof Map) {
      if (!map2.has(key))
        map2.set(key, value2);
    } else if (map2 instanceof Set) {
      map2.add(key);
    } else if (!Object.prototype.hasOwnProperty.call(map2, key)) {
      Object.defineProperty(map2, key, {
        value: value2,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
  }
  return map2;
}
merge$5.addMergeToJSMap = addMergeToJSMap;
merge$5.isMergeKey = isMergeKey;
merge$5.merge = merge$4;
var log$1 = log$2;
var merge$3 = merge$5;
var stringify$4 = stringify$7;
var identity$k = identity$x;
var toJS$3 = toJS$8;
function addPairToJSMap$2(ctx, map2, { key, value }) {
  if (identity$k.isNode(key) && key.addToJSMap)
    key.addToJSMap(ctx, map2, value);
  else if (merge$3.isMergeKey(ctx, key))
    merge$3.addMergeToJSMap(ctx, map2, value);
  else {
    const jsKey = toJS$3.toJS(key, "", ctx);
    if (map2 instanceof Map) {
      map2.set(jsKey, toJS$3.toJS(value, jsKey, ctx));
    } else if (map2 instanceof Set) {
      map2.add(jsKey);
    } else {
      const stringKey = stringifyKey(key, jsKey, ctx);
      const jsValue = toJS$3.toJS(value, stringKey, ctx);
      if (stringKey in map2)
        Object.defineProperty(map2, stringKey, {
          value: jsValue,
          writable: true,
          enumerable: true,
          configurable: true
        });
      else
        map2[stringKey] = jsValue;
    }
  }
  return map2;
}
function stringifyKey(key, jsKey, ctx) {
  if (jsKey === null)
    return "";
  if (typeof jsKey !== "object")
    return String(jsKey);
  if (identity$k.isNode(key) && (ctx == null ? void 0 : ctx.doc)) {
    const strCtx = stringify$4.createStringifyContext(ctx.doc, {});
    strCtx.anchors = /* @__PURE__ */ new Set();
    for (const node2 of ctx.anchors.keys())
      strCtx.anchors.add(node2.anchor);
    strCtx.inFlow = true;
    strCtx.inStringifyKey = true;
    const strKey = key.toString(strCtx);
    if (!ctx.mapKeyWarned) {
      let jsonStr = JSON.stringify(strKey);
      if (jsonStr.length > 40)
        jsonStr = jsonStr.substring(0, 36) + '..."';
      log$1.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
      ctx.mapKeyWarned = true;
    }
    return strKey;
  }
  return JSON.stringify(jsKey);
}
addPairToJSMap$3.addPairToJSMap = addPairToJSMap$2;
var createNode$2 = createNode$5;
var stringifyPair = stringifyPair$2;
var addPairToJSMap$1 = addPairToJSMap$3;
var identity$j = identity$x;
function createPair(key, value, ctx) {
  const k = createNode$2.createNode(key, void 0, ctx);
  const v = createNode$2.createNode(value, void 0, ctx);
  return new Pair$7(k, v);
}
let Pair$7 = class Pair {
  constructor(key, value = null) {
    Object.defineProperty(this, identity$j.NODE_TYPE, { value: identity$j.PAIR });
    this.key = key;
    this.value = value;
  }
  clone(schema2) {
    let { key, value } = this;
    if (identity$j.isNode(key))
      key = key.clone(schema2);
    if (identity$j.isNode(value))
      value = value.clone(schema2);
    return new Pair(key, value);
  }
  toJSON(_, ctx) {
    const pair = (ctx == null ? void 0 : ctx.mapAsMap) ? /* @__PURE__ */ new Map() : {};
    return addPairToJSMap$1.addPairToJSMap(ctx, pair, this);
  }
  toString(ctx, onComment, onChompKeep) {
    return (ctx == null ? void 0 : ctx.doc) ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
  }
};
Pair$8.Pair = Pair$7;
Pair$8.createPair = createPair;
var Schema$3 = {};
var map$6 = {};
var YAMLMap$8 = {};
var stringifyCollection$3 = {};
var identity$i = identity$x;
var stringify$3 = stringify$7;
var stringifyComment$1 = stringifyComment$5;
function stringifyCollection$2(collection, ctx, options) {
  const flow = ctx.inFlow ?? collection.flow;
  const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
  return stringify2(collection, ctx, options);
}
function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
  const { indent, options: { commentString } } = ctx;
  const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
  let chompKeep = false;
  const lines = [];
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    let comment2 = null;
    if (identity$i.isNode(item)) {
      if (!chompKeep && item.spaceBefore)
        lines.push("");
      addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
      if (item.comment)
        comment2 = item.comment;
    } else if (identity$i.isPair(item)) {
      const ik = identity$i.isNode(item.key) ? item.key : null;
      if (ik) {
        if (!chompKeep && ik.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
      }
    }
    chompKeep = false;
    let str2 = stringify$3.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
    if (comment2)
      str2 += stringifyComment$1.lineComment(str2, itemIndent, commentString(comment2));
    if (chompKeep && comment2)
      chompKeep = false;
    lines.push(blockItemPrefix + str2);
  }
  let str;
  if (lines.length === 0) {
    str = flowChars.start + flowChars.end;
  } else {
    str = lines[0];
    for (let i = 1; i < lines.length; ++i) {
      const line = lines[i];
      str += line ? `
${indent}${line}` : "\n";
    }
  }
  if (comment) {
    str += "\n" + stringifyComment$1.indentComment(commentString(comment), indent);
    if (onComment)
      onComment();
  } else if (chompKeep && onChompKeep)
    onChompKeep();
  return str;
}
function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
  const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
  itemIndent += indentStep;
  const itemCtx = Object.assign({}, ctx, {
    indent: itemIndent,
    inFlow: true,
    type: null
  });
  let reqNewline = false;
  let linesAtValue = 0;
  const lines = [];
  for (let i = 0; i < items.length; ++i) {
    const item = items[i];
    let comment = null;
    if (identity$i.isNode(item)) {
      if (item.spaceBefore)
        lines.push("");
      addCommentBefore(ctx, lines, item.commentBefore, false);
      if (item.comment)
        comment = item.comment;
    } else if (identity$i.isPair(item)) {
      const ik = identity$i.isNode(item.key) ? item.key : null;
      if (ik) {
        if (ik.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, ik.commentBefore, false);
        if (ik.comment)
          reqNewline = true;
      }
      const iv = identity$i.isNode(item.value) ? item.value : null;
      if (iv) {
        if (iv.comment)
          comment = iv.comment;
        if (iv.commentBefore)
          reqNewline = true;
      } else if (item.value == null && (ik == null ? void 0 : ik.comment)) {
        comment = ik.comment;
      }
    }
    if (comment)
      reqNewline = true;
    let str = stringify$3.stringify(item, itemCtx, () => comment = null);
    if (i < items.length - 1)
      str += ",";
    if (comment)
      str += stringifyComment$1.lineComment(str, itemIndent, commentString(comment));
    if (!reqNewline && (lines.length > linesAtValue || str.includes("\n")))
      reqNewline = true;
    lines.push(str);
    linesAtValue = lines.length;
  }
  const { start, end } = flowChars;
  if (lines.length === 0) {
    return start + end;
  } else {
    if (!reqNewline) {
      const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
      reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
    }
    if (reqNewline) {
      let str = start;
      for (const line of lines)
        str += line ? `
${indentStep}${indent}${line}` : "\n";
      return `${str}
${indent}${end}`;
    } else {
      return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
    }
  }
}
function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
  if (comment && chompKeep)
    comment = comment.replace(/^\n+/, "");
  if (comment) {
    const ic = stringifyComment$1.indentComment(commentString(comment), indent);
    lines.push(ic.trimStart());
  }
}
stringifyCollection$3.stringifyCollection = stringifyCollection$2;
var stringifyCollection$1 = stringifyCollection$3;
var addPairToJSMap = addPairToJSMap$3;
var Collection$2 = Collection$4;
var identity$h = identity$x;
var Pair$6 = Pair$8;
var Scalar$e = Scalar$k;
function findPair(items, key) {
  const k = identity$h.isScalar(key) ? key.value : key;
  for (const it of items) {
    if (identity$h.isPair(it)) {
      if (it.key === key || it.key === k)
        return it;
      if (identity$h.isScalar(it.key) && it.key.value === k)
        return it;
    }
  }
  return void 0;
}
let YAMLMap$7 = class YAMLMap extends Collection$2.Collection {
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  constructor(schema2) {
    super(identity$h.MAP, schema2);
    this.items = [];
  }
  /**
   * A generic collection parsing method that can be extended
   * to other node classes that inherit from YAMLMap
   */
  static from(schema2, obj, ctx) {
    const { keepUndefined, replacer } = ctx;
    const map2 = new this(schema2);
    const add = (key, value) => {
      if (typeof replacer === "function")
        value = replacer.call(obj, key, value);
      else if (Array.isArray(replacer) && !replacer.includes(key))
        return;
      if (value !== void 0 || keepUndefined)
        map2.items.push(Pair$6.createPair(key, value, ctx));
    };
    if (obj instanceof Map) {
      for (const [key, value] of obj)
        add(key, value);
    } else if (obj && typeof obj === "object") {
      for (const key of Object.keys(obj))
        add(key, obj[key]);
    }
    if (typeof schema2.sortMapEntries === "function") {
      map2.items.sort(schema2.sortMapEntries);
    }
    return map2;
  }
  /**
   * Adds a value to the collection.
   *
   * @param overwrite - If not set `true`, using a key that is already in the
   *   collection will throw. Otherwise, overwrites the previous value.
   */
  add(pair, overwrite) {
    var _a;
    let _pair;
    if (identity$h.isPair(pair))
      _pair = pair;
    else if (!pair || typeof pair !== "object" || !("key" in pair)) {
      _pair = new Pair$6.Pair(pair, pair == null ? void 0 : pair.value);
    } else
      _pair = new Pair$6.Pair(pair.key, pair.value);
    const prev = findPair(this.items, _pair.key);
    const sortEntries = (_a = this.schema) == null ? void 0 : _a.sortMapEntries;
    if (prev) {
      if (!overwrite)
        throw new Error(`Key ${_pair.key} already set`);
      if (identity$h.isScalar(prev.value) && Scalar$e.isScalarValue(_pair.value))
        prev.value.value = _pair.value;
      else
        prev.value = _pair.value;
    } else if (sortEntries) {
      const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
      if (i === -1)
        this.items.push(_pair);
      else
        this.items.splice(i, 0, _pair);
    } else {
      this.items.push(_pair);
    }
  }
  delete(key) {
    const it = findPair(this.items, key);
    if (!it)
      return false;
    const del = this.items.splice(this.items.indexOf(it), 1);
    return del.length > 0;
  }
  get(key, keepScalar) {
    const it = findPair(this.items, key);
    const node2 = it == null ? void 0 : it.value;
    return (!keepScalar && identity$h.isScalar(node2) ? node2.value : node2) ?? void 0;
  }
  has(key) {
    return !!findPair(this.items, key);
  }
  set(key, value) {
    this.add(new Pair$6.Pair(key, value), true);
  }
  /**
   * @param ctx - Conversion context, originally set in Document#toJS()
   * @param {Class} Type - If set, forces the returned collection type
   * @returns Instance of Type, Map, or Object
   */
  toJSON(_, ctx, Type) {
    const map2 = Type ? new Type() : (ctx == null ? void 0 : ctx.mapAsMap) ? /* @__PURE__ */ new Map() : {};
    if (ctx == null ? void 0 : ctx.onCreate)
      ctx.onCreate(map2);
    for (const item of this.items)
      addPairToJSMap.addPairToJSMap(ctx, map2, item);
    return map2;
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    for (const item of this.items) {
      if (!identity$h.isPair(item))
        throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
    }
    if (!ctx.allNullValues && this.hasAllNullValues(false))
      ctx = Object.assign({}, ctx, { allNullValues: true });
    return stringifyCollection$1.stringifyCollection(this, ctx, {
      blockItemPrefix: "",
      flowChars: { start: "{", end: "}" },
      itemIndent: ctx.indent || "",
      onChompKeep,
      onComment
    });
  }
};
YAMLMap$8.YAMLMap = YAMLMap$7;
YAMLMap$8.findPair = findPair;
var identity$g = identity$x;
var YAMLMap$6 = YAMLMap$8;
const map$5 = {
  collection: "map",
  default: true,
  nodeClass: YAMLMap$6.YAMLMap,
  tag: "tag:yaml.org,2002:map",
  resolve(map2, onError) {
    if (!identity$g.isMap(map2))
      onError("Expected a mapping for this tag");
    return map2;
  },
  createNode: (schema2, obj, ctx) => YAMLMap$6.YAMLMap.from(schema2, obj, ctx)
};
map$6.map = map$5;
var seq$6 = {};
var YAMLSeq$8 = {};
var createNode$1 = createNode$5;
var stringifyCollection = stringifyCollection$3;
var Collection$1 = Collection$4;
var identity$f = identity$x;
var Scalar$d = Scalar$k;
var toJS$2 = toJS$8;
let YAMLSeq$7 = class YAMLSeq extends Collection$1.Collection {
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  constructor(schema2) {
    super(identity$f.SEQ, schema2);
    this.items = [];
  }
  add(value) {
    this.items.push(value);
  }
  /**
   * Removes a value from the collection.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   *
   * @returns `true` if the item was found and removed.
   */
  delete(key) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      return false;
    const del = this.items.splice(idx, 1);
    return del.length > 0;
  }
  get(key, keepScalar) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      return void 0;
    const it = this.items[idx];
    return !keepScalar && identity$f.isScalar(it) ? it.value : it;
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   */
  has(key) {
    const idx = asItemIndex(key);
    return typeof idx === "number" && idx < this.items.length;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   *
   * If `key` does not contain a representation of an integer, this will throw.
   * It may be wrapped in a `Scalar`.
   */
  set(key, value) {
    const idx = asItemIndex(key);
    if (typeof idx !== "number")
      throw new Error(`Expected a valid index, not ${key}.`);
    const prev = this.items[idx];
    if (identity$f.isScalar(prev) && Scalar$d.isScalarValue(value))
      prev.value = value;
    else
      this.items[idx] = value;
  }
  toJSON(_, ctx) {
    const seq2 = [];
    if (ctx == null ? void 0 : ctx.onCreate)
      ctx.onCreate(seq2);
    let i = 0;
    for (const item of this.items)
      seq2.push(toJS$2.toJS(item, String(i++), ctx));
    return seq2;
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    return stringifyCollection.stringifyCollection(this, ctx, {
      blockItemPrefix: "- ",
      flowChars: { start: "[", end: "]" },
      itemIndent: (ctx.indent || "") + "  ",
      onChompKeep,
      onComment
    });
  }
  static from(schema2, obj, ctx) {
    const { replacer } = ctx;
    const seq2 = new this(schema2);
    if (obj && Symbol.iterator in Object(obj)) {
      let i = 0;
      for (let it of obj) {
        if (typeof replacer === "function") {
          const key = obj instanceof Set ? it : String(i++);
          it = replacer.call(obj, key, it);
        }
        seq2.items.push(createNode$1.createNode(it, void 0, ctx));
      }
    }
    return seq2;
  }
};
function asItemIndex(key) {
  let idx = identity$f.isScalar(key) ? key.value : key;
  if (idx && typeof idx === "string")
    idx = Number(idx);
  return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
}
YAMLSeq$8.YAMLSeq = YAMLSeq$7;
var identity$e = identity$x;
var YAMLSeq$6 = YAMLSeq$8;
const seq$5 = {
  collection: "seq",
  default: true,
  nodeClass: YAMLSeq$6.YAMLSeq,
  tag: "tag:yaml.org,2002:seq",
  resolve(seq2, onError) {
    if (!identity$e.isSeq(seq2))
      onError("Expected a sequence for this tag");
    return seq2;
  },
  createNode: (schema2, obj, ctx) => YAMLSeq$6.YAMLSeq.from(schema2, obj, ctx)
};
seq$6.seq = seq$5;
var string$5 = {};
var stringifyString$2 = stringifyString$5;
const string$4 = {
  identify: (value) => typeof value === "string",
  default: true,
  tag: "tag:yaml.org,2002:str",
  resolve: (str) => str,
  stringify(item, ctx, onComment, onChompKeep) {
    ctx = Object.assign({ actualString: true }, ctx);
    return stringifyString$2.stringifyString(item, ctx, onComment, onChompKeep);
  }
};
string$5.string = string$4;
var tags$1 = {};
var _null$3 = {};
var Scalar$c = Scalar$k;
const nullTag = {
  identify: (value) => value == null,
  createNode: () => new Scalar$c.Scalar(null),
  default: true,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new Scalar$c.Scalar(null),
  stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
};
_null$3.nullTag = nullTag;
var bool$4 = {};
var Scalar$b = Scalar$k;
const boolTag = {
  identify: (value) => typeof value === "boolean",
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (str) => new Scalar$b.Scalar(str[0] === "t" || str[0] === "T"),
  stringify({ source, value }, ctx) {
    if (source && boolTag.test.test(source)) {
      const sv = source[0] === "t" || source[0] === "T";
      if (value === sv)
        return source;
    }
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
};
bool$4.boolTag = boolTag;
var float$6 = {};
var stringifyNumber$6 = {};
function stringifyNumber$5({ format, minFractionDigits, tag, value }) {
  if (typeof value === "bigint")
    return String(value);
  const num = typeof value === "number" ? value : Number(value);
  if (!isFinite(num))
    return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
  let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
  if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
    let i = n.indexOf(".");
    if (i < 0) {
      i = n.length;
      n += ".";
    }
    let d = minFractionDigits - (n.length - i - 1);
    while (d-- > 0)
      n += "0";
  }
  return n;
}
stringifyNumber$6.stringifyNumber = stringifyNumber$5;
var Scalar$a = Scalar$k;
var stringifyNumber$4 = stringifyNumber$6;
const floatNaN$1 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: stringifyNumber$4.stringifyNumber
};
const floatExp$1 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
  resolve: (str) => parseFloat(str),
  stringify(node2) {
    const num = Number(node2.value);
    return isFinite(num) ? num.toExponential() : stringifyNumber$4.stringifyNumber(node2);
  }
};
const float$5 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
  resolve(str) {
    const node2 = new Scalar$a.Scalar(parseFloat(str));
    const dot = str.indexOf(".");
    if (dot !== -1 && str[str.length - 1] === "0")
      node2.minFractionDigits = str.length - dot - 1;
    return node2;
  },
  stringify: stringifyNumber$4.stringifyNumber
};
float$6.float = float$5;
float$6.floatExp = floatExp$1;
float$6.floatNaN = floatNaN$1;
var int$6 = {};
var stringifyNumber$3 = stringifyNumber$6;
const intIdentify$2 = (value) => typeof value === "bigint" || Number.isInteger(value);
const intResolve$1 = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
function intStringify$1(node2, radix, prefix) {
  const { value } = node2;
  if (intIdentify$2(value) && value >= 0)
    return prefix + value.toString(radix);
  return stringifyNumber$3.stringifyNumber(node2);
}
const intOct$1 = {
  identify: (value) => intIdentify$2(value) && value >= 0,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^0o[0-7]+$/,
  resolve: (str, _onError, opt) => intResolve$1(str, 2, 8, opt),
  stringify: (node2) => intStringify$1(node2, 8, "0o")
};
const int$5 = {
  identify: intIdentify$2,
  default: true,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9]+$/,
  resolve: (str, _onError, opt) => intResolve$1(str, 0, 10, opt),
  stringify: stringifyNumber$3.stringifyNumber
};
const intHex$1 = {
  identify: (value) => intIdentify$2(value) && value >= 0,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^0x[0-9a-fA-F]+$/,
  resolve: (str, _onError, opt) => intResolve$1(str, 2, 16, opt),
  stringify: (node2) => intStringify$1(node2, 16, "0x")
};
int$6.int = int$5;
int$6.intHex = intHex$1;
int$6.intOct = intOct$1;
var schema$8 = {};
var map$4 = map$6;
var _null$2 = _null$3;
var seq$4 = seq$6;
var string$3 = string$5;
var bool$3 = bool$4;
var float$4 = float$6;
var int$4 = int$6;
const schema$7 = [
  map$4.map,
  seq$4.seq,
  string$3.string,
  _null$2.nullTag,
  bool$3.boolTag,
  int$4.intOct,
  int$4.int,
  int$4.intHex,
  float$4.floatNaN,
  float$4.floatExp,
  float$4.float
];
schema$8.schema = schema$7;
var schema$6 = {};
var Scalar$9 = Scalar$k;
var map$3 = map$6;
var seq$3 = seq$6;
function intIdentify$1(value) {
  return typeof value === "bigint" || Number.isInteger(value);
}
const stringifyJSON = ({ value }) => JSON.stringify(value);
const jsonScalars = [
  {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify: stringifyJSON
  },
  {
    identify: (value) => value == null,
    createNode: () => new Scalar$9.Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^null$/,
    resolve: () => null,
    stringify: stringifyJSON
  },
  {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^true$|^false$/,
    resolve: (str) => str === "true",
    stringify: stringifyJSON
  },
  {
    identify: intIdentify$1,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^-?(?:0|[1-9][0-9]*)$/,
    resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
    stringify: ({ value }) => intIdentify$1(value) ? value.toString() : JSON.stringify(value)
  },
  {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
    resolve: (str) => parseFloat(str),
    stringify: stringifyJSON
  }
];
const jsonError = {
  default: true,
  tag: "",
  test: /^/,
  resolve(str, onError) {
    onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
    return str;
  }
};
const schema$5 = [map$3.map, seq$3.seq].concat(jsonScalars, jsonError);
schema$6.schema = schema$5;
var binary$3 = {};
var node_buffer = require$$0$2;
var Scalar$8 = Scalar$k;
var stringifyString$1 = stringifyString$5;
const binary$2 = {
  identify: (value) => value instanceof Uint8Array,
  // Buffer inherits from Uint8Array
  default: false,
  tag: "tag:yaml.org,2002:binary",
  /**
   * Returns a Buffer in node and an Uint8Array in browsers
   *
   * To use the resulting buffer as an image, you'll want to do something like:
   *
   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
   */
  resolve(src2, onError) {
    if (typeof node_buffer.Buffer === "function") {
      return node_buffer.Buffer.from(src2, "base64");
    } else if (typeof atob === "function") {
      const str = atob(src2.replace(/[\n\r]/g, ""));
      const buffer = new Uint8Array(str.length);
      for (let i = 0; i < str.length; ++i)
        buffer[i] = str.charCodeAt(i);
      return buffer;
    } else {
      onError("This environment does not support reading binary tags; either Buffer or atob is required");
      return src2;
    }
  },
  stringify({ comment, type: type2, value }, ctx, onComment, onChompKeep) {
    if (!value)
      return "";
    const buf = value;
    let str;
    if (typeof node_buffer.Buffer === "function") {
      str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
    } else if (typeof btoa === "function") {
      let s = "";
      for (let i = 0; i < buf.length; ++i)
        s += String.fromCharCode(buf[i]);
      str = btoa(s);
    } else {
      throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
    }
    type2 ?? (type2 = Scalar$8.Scalar.BLOCK_LITERAL);
    if (type2 !== Scalar$8.Scalar.QUOTE_DOUBLE) {
      const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
      const n = Math.ceil(str.length / lineWidth);
      const lines = new Array(n);
      for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
        lines[i] = str.substr(o, lineWidth);
      }
      str = lines.join(type2 === Scalar$8.Scalar.BLOCK_LITERAL ? "\n" : " ");
    }
    return stringifyString$1.stringifyString({ comment, type: type2, value: str }, ctx, onComment, onChompKeep);
  }
};
binary$3.binary = binary$2;
var omap$3 = {};
var pairs$4 = {};
var identity$d = identity$x;
var Pair$5 = Pair$8;
var Scalar$7 = Scalar$k;
var YAMLSeq$5 = YAMLSeq$8;
function resolvePairs(seq2, onError) {
  if (identity$d.isSeq(seq2)) {
    for (let i = 0; i < seq2.items.length; ++i) {
      let item = seq2.items[i];
      if (identity$d.isPair(item))
        continue;
      else if (identity$d.isMap(item)) {
        if (item.items.length > 1)
          onError("Each pair must have its own sequence indicator");
        const pair = item.items[0] || new Pair$5.Pair(new Scalar$7.Scalar(null));
        if (item.commentBefore)
          pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
        if (item.comment) {
          const cn = pair.value ?? pair.key;
          cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
        }
        item = pair;
      }
      seq2.items[i] = identity$d.isPair(item) ? item : new Pair$5.Pair(item);
    }
  } else
    onError("Expected a sequence for this tag");
  return seq2;
}
function createPairs(schema2, iterable, ctx) {
  const { replacer } = ctx;
  const pairs2 = new YAMLSeq$5.YAMLSeq(schema2);
  pairs2.tag = "tag:yaml.org,2002:pairs";
  let i = 0;
  if (iterable && Symbol.iterator in Object(iterable))
    for (let it of iterable) {
      if (typeof replacer === "function")
        it = replacer.call(iterable, String(i++), it);
      let key, value;
      if (Array.isArray(it)) {
        if (it.length === 2) {
          key = it[0];
          value = it[1];
        } else
          throw new TypeError(`Expected [key, value] tuple: ${it}`);
      } else if (it && it instanceof Object) {
        const keys = Object.keys(it);
        if (keys.length === 1) {
          key = keys[0];
          value = it[key];
        } else {
          throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
        }
      } else {
        key = it;
      }
      pairs2.items.push(Pair$5.createPair(key, value, ctx));
    }
  return pairs2;
}
const pairs$3 = {
  collection: "seq",
  default: false,
  tag: "tag:yaml.org,2002:pairs",
  resolve: resolvePairs,
  createNode: createPairs
};
pairs$4.createPairs = createPairs;
pairs$4.pairs = pairs$3;
pairs$4.resolvePairs = resolvePairs;
var identity$c = identity$x;
var toJS$1 = toJS$8;
var YAMLMap$5 = YAMLMap$8;
var YAMLSeq$4 = YAMLSeq$8;
var pairs$2 = pairs$4;
class YAMLOMap extends YAMLSeq$4.YAMLSeq {
  constructor() {
    super();
    this.add = YAMLMap$5.YAMLMap.prototype.add.bind(this);
    this.delete = YAMLMap$5.YAMLMap.prototype.delete.bind(this);
    this.get = YAMLMap$5.YAMLMap.prototype.get.bind(this);
    this.has = YAMLMap$5.YAMLMap.prototype.has.bind(this);
    this.set = YAMLMap$5.YAMLMap.prototype.set.bind(this);
    this.tag = YAMLOMap.tag;
  }
  /**
   * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
   * but TypeScript won't allow widening the signature of a child method.
   */
  toJSON(_, ctx) {
    if (!ctx)
      return super.toJSON(_);
    const map2 = /* @__PURE__ */ new Map();
    if (ctx == null ? void 0 : ctx.onCreate)
      ctx.onCreate(map2);
    for (const pair of this.items) {
      let key, value;
      if (identity$c.isPair(pair)) {
        key = toJS$1.toJS(pair.key, "", ctx);
        value = toJS$1.toJS(pair.value, key, ctx);
      } else {
        key = toJS$1.toJS(pair, "", ctx);
      }
      if (map2.has(key))
        throw new Error("Ordered maps must not include duplicate keys");
      map2.set(key, value);
    }
    return map2;
  }
  static from(schema2, iterable, ctx) {
    const pairs$12 = pairs$2.createPairs(schema2, iterable, ctx);
    const omap2 = new this();
    omap2.items = pairs$12.items;
    return omap2;
  }
}
YAMLOMap.tag = "tag:yaml.org,2002:omap";
const omap$2 = {
  collection: "seq",
  identify: (value) => value instanceof Map,
  nodeClass: YAMLOMap,
  default: false,
  tag: "tag:yaml.org,2002:omap",
  resolve(seq2, onError) {
    const pairs$12 = pairs$2.resolvePairs(seq2, onError);
    const seenKeys = [];
    for (const { key } of pairs$12.items) {
      if (identity$c.isScalar(key)) {
        if (seenKeys.includes(key.value)) {
          onError(`Ordered maps must not include duplicate keys: ${key.value}`);
        } else {
          seenKeys.push(key.value);
        }
      }
    }
    return Object.assign(new YAMLOMap(), pairs$12);
  },
  createNode: (schema2, iterable, ctx) => YAMLOMap.from(schema2, iterable, ctx)
};
omap$3.YAMLOMap = YAMLOMap;
omap$3.omap = omap$2;
var schema$4 = {};
var bool$2 = {};
var Scalar$6 = Scalar$k;
function boolStringify({ value, source }, ctx) {
  const boolObj = value ? trueTag : falseTag;
  if (source && boolObj.test.test(source))
    return source;
  return value ? ctx.options.trueStr : ctx.options.falseStr;
}
const trueTag = {
  identify: (value) => value === true,
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
  resolve: () => new Scalar$6.Scalar(true),
  stringify: boolStringify
};
const falseTag = {
  identify: (value) => value === false,
  default: true,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
  resolve: () => new Scalar$6.Scalar(false),
  stringify: boolStringify
};
bool$2.falseTag = falseTag;
bool$2.trueTag = trueTag;
var float$3 = {};
var Scalar$5 = Scalar$k;
var stringifyNumber$2 = stringifyNumber$6;
const floatNaN = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
  resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: stringifyNumber$2.stringifyNumber
};
const floatExp = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
  resolve: (str) => parseFloat(str.replace(/_/g, "")),
  stringify(node2) {
    const num = Number(node2.value);
    return isFinite(num) ? num.toExponential() : stringifyNumber$2.stringifyNumber(node2);
  }
};
const float$2 = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
  resolve(str) {
    const node2 = new Scalar$5.Scalar(parseFloat(str.replace(/_/g, "")));
    const dot = str.indexOf(".");
    if (dot !== -1) {
      const f = str.substring(dot + 1).replace(/_/g, "");
      if (f[f.length - 1] === "0")
        node2.minFractionDigits = f.length;
    }
    return node2;
  },
  stringify: stringifyNumber$2.stringifyNumber
};
float$3.float = float$2;
float$3.floatExp = floatExp;
float$3.floatNaN = floatNaN;
var int$3 = {};
var stringifyNumber$1 = stringifyNumber$6;
const intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
function intResolve(str, offset, radix, { intAsBigInt }) {
  const sign3 = str[0];
  if (sign3 === "-" || sign3 === "+")
    offset += 1;
  str = str.substring(offset).replace(/_/g, "");
  if (intAsBigInt) {
    switch (radix) {
      case 2:
        str = `0b${str}`;
        break;
      case 8:
        str = `0o${str}`;
        break;
      case 16:
        str = `0x${str}`;
        break;
    }
    const n2 = BigInt(str);
    return sign3 === "-" ? BigInt(-1) * n2 : n2;
  }
  const n = parseInt(str, radix);
  return sign3 === "-" ? -1 * n : n;
}
function intStringify(node2, radix, prefix) {
  const { value } = node2;
  if (intIdentify(value)) {
    const str = value.toString(radix);
    return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
  }
  return stringifyNumber$1.stringifyNumber(node2);
}
const intBin = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "BIN",
  test: /^[-+]?0b[0-1_]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
  stringify: (node2) => intStringify(node2, 2, "0b")
};
const intOct = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^[-+]?0[0-7_]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
  stringify: (node2) => intStringify(node2, 8, "0")
};
const int$2 = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
  stringify: stringifyNumber$1.stringifyNumber
};
const intHex = {
  identify: intIdentify,
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^[-+]?0x[0-9a-fA-F_]+$/,
  resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
  stringify: (node2) => intStringify(node2, 16, "0x")
};
int$3.int = int$2;
int$3.intBin = intBin;
int$3.intHex = intHex;
int$3.intOct = intOct;
var set$3 = {};
var identity$b = identity$x;
var Pair$4 = Pair$8;
var YAMLMap$4 = YAMLMap$8;
class YAMLSet extends YAMLMap$4.YAMLMap {
  constructor(schema2) {
    super(schema2);
    this.tag = YAMLSet.tag;
  }
  add(key) {
    let pair;
    if (identity$b.isPair(key))
      pair = key;
    else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
      pair = new Pair$4.Pair(key.key, null);
    else
      pair = new Pair$4.Pair(key, null);
    const prev = YAMLMap$4.findPair(this.items, pair.key);
    if (!prev)
      this.items.push(pair);
  }
  /**
   * If `keepPair` is `true`, returns the Pair matching `key`.
   * Otherwise, returns the value of that Pair's key.
   */
  get(key, keepPair) {
    const pair = YAMLMap$4.findPair(this.items, key);
    return !keepPair && identity$b.isPair(pair) ? identity$b.isScalar(pair.key) ? pair.key.value : pair.key : pair;
  }
  set(key, value) {
    if (typeof value !== "boolean")
      throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
    const prev = YAMLMap$4.findPair(this.items, key);
    if (prev && !value) {
      this.items.splice(this.items.indexOf(prev), 1);
    } else if (!prev && value) {
      this.items.push(new Pair$4.Pair(key));
    }
  }
  toJSON(_, ctx) {
    return super.toJSON(_, ctx, Set);
  }
  toString(ctx, onComment, onChompKeep) {
    if (!ctx)
      return JSON.stringify(this);
    if (this.hasAllNullValues(true))
      return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
    else
      throw new Error("Set items must all have null values");
  }
  static from(schema2, iterable, ctx) {
    const { replacer } = ctx;
    const set2 = new this(schema2);
    if (iterable && Symbol.iterator in Object(iterable))
      for (let value of iterable) {
        if (typeof replacer === "function")
          value = replacer.call(iterable, value, value);
        set2.items.push(Pair$4.createPair(value, null, ctx));
      }
    return set2;
  }
}
YAMLSet.tag = "tag:yaml.org,2002:set";
const set$2 = {
  collection: "map",
  identify: (value) => value instanceof Set,
  nodeClass: YAMLSet,
  default: false,
  tag: "tag:yaml.org,2002:set",
  createNode: (schema2, iterable, ctx) => YAMLSet.from(schema2, iterable, ctx),
  resolve(map2, onError) {
    if (identity$b.isMap(map2)) {
      if (map2.hasAllNullValues(true))
        return Object.assign(new YAMLSet(), map2);
      else
        onError("Set items must all have null values");
    } else
      onError("Expected a mapping for this tag");
    return map2;
  }
};
set$3.YAMLSet = YAMLSet;
set$3.set = set$2;
var timestamp$3 = {};
var stringifyNumber = stringifyNumber$6;
function parseSexagesimal(str, asBigInt) {
  const sign3 = str[0];
  const parts = sign3 === "-" || sign3 === "+" ? str.substring(1) : str;
  const num = (n) => asBigInt ? BigInt(n) : Number(n);
  const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
  return sign3 === "-" ? num(-1) * res : res;
}
function stringifySexagesimal(node2) {
  let { value } = node2;
  let num = (n) => n;
  if (typeof value === "bigint")
    num = (n) => BigInt(n);
  else if (isNaN(value) || !isFinite(value))
    return stringifyNumber.stringifyNumber(node2);
  let sign3 = "";
  if (value < 0) {
    sign3 = "-";
    value *= num(-1);
  }
  const _60 = num(60);
  const parts = [value % _60];
  if (value < 60) {
    parts.unshift(0);
  } else {
    value = (value - parts[0]) / _60;
    parts.unshift(value % _60);
    if (value >= 60) {
      value = (value - parts[0]) / _60;
      parts.unshift(value);
    }
  }
  return sign3 + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
}
const intTime = {
  identify: (value) => typeof value === "bigint" || Number.isInteger(value),
  default: true,
  tag: "tag:yaml.org,2002:int",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
  resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
  stringify: stringifySexagesimal
};
const floatTime = {
  identify: (value) => typeof value === "number",
  default: true,
  tag: "tag:yaml.org,2002:float",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
  resolve: (str) => parseSexagesimal(str, false),
  stringify: stringifySexagesimal
};
const timestamp$2 = {
  identify: (value) => value instanceof Date,
  default: true,
  tag: "tag:yaml.org,2002:timestamp",
  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
  // may be omitted altogether, resulting in a date format. In such a case, the time part is
  // assumed to be 00:00:00Z (start of day, UTC).
  test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
  resolve(str) {
    const match = str.match(timestamp$2.test);
    if (!match)
      throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
    const [, year, month, day, hour, minute, second] = match.map(Number);
    const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
    let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
    const tz = match[8];
    if (tz && tz !== "Z") {
      let d = parseSexagesimal(tz, false);
      if (Math.abs(d) < 30)
        d *= 60;
      date -= 6e4 * d;
    }
    return new Date(date);
  },
  stringify: ({ value }) => (value == null ? void 0 : value.toISOString().replace(/(T00:00:00)?\.000Z$/, "")) ?? ""
};
timestamp$3.floatTime = floatTime;
timestamp$3.intTime = intTime;
timestamp$3.timestamp = timestamp$2;
var map$2 = map$6;
var _null$1 = _null$3;
var seq$2 = seq$6;
var string$2 = string$5;
var binary$1 = binary$3;
var bool$1 = bool$2;
var float$1 = float$3;
var int$1 = int$3;
var merge$2 = merge$5;
var omap$1 = omap$3;
var pairs$1 = pairs$4;
var set$1 = set$3;
var timestamp$1 = timestamp$3;
const schema$3 = [
  map$2.map,
  seq$2.seq,
  string$2.string,
  _null$1.nullTag,
  bool$1.trueTag,
  bool$1.falseTag,
  int$1.intBin,
  int$1.intOct,
  int$1.int,
  int$1.intHex,
  float$1.floatNaN,
  float$1.floatExp,
  float$1.float,
  binary$1.binary,
  merge$2.merge,
  omap$1.omap,
  pairs$1.pairs,
  set$1.set,
  timestamp$1.intTime,
  timestamp$1.floatTime,
  timestamp$1.timestamp
];
schema$4.schema = schema$3;
var map$1 = map$6;
var _null = _null$3;
var seq$1 = seq$6;
var string$1 = string$5;
var bool = bool$4;
var float = float$6;
var int = int$6;
var schema = schema$8;
var schema$1 = schema$6;
var binary = binary$3;
var merge$1 = merge$5;
var omap = omap$3;
var pairs = pairs$4;
var schema$2 = schema$4;
var set = set$3;
var timestamp = timestamp$3;
const schemas = /* @__PURE__ */ new Map([
  ["core", schema.schema],
  ["failsafe", [map$1.map, seq$1.seq, string$1.string]],
  ["json", schema$1.schema],
  ["yaml11", schema$2.schema],
  ["yaml-1.1", schema$2.schema]
]);
const tagsByName = {
  binary: binary.binary,
  bool: bool.boolTag,
  float: float.float,
  floatExp: float.floatExp,
  floatNaN: float.floatNaN,
  floatTime: timestamp.floatTime,
  int: int.int,
  intHex: int.intHex,
  intOct: int.intOct,
  intTime: timestamp.intTime,
  map: map$1.map,
  merge: merge$1.merge,
  null: _null.nullTag,
  omap: omap.omap,
  pairs: pairs.pairs,
  seq: seq$1.seq,
  set: set.set,
  timestamp: timestamp.timestamp
};
const coreKnownTags = {
  "tag:yaml.org,2002:binary": binary.binary,
  "tag:yaml.org,2002:merge": merge$1.merge,
  "tag:yaml.org,2002:omap": omap.omap,
  "tag:yaml.org,2002:pairs": pairs.pairs,
  "tag:yaml.org,2002:set": set.set,
  "tag:yaml.org,2002:timestamp": timestamp.timestamp
};
function getTags(customTags, schemaName, addMergeTag) {
  const schemaTags = schemas.get(schemaName);
  if (schemaTags && !customTags) {
    return addMergeTag && !schemaTags.includes(merge$1.merge) ? schemaTags.concat(merge$1.merge) : schemaTags.slice();
  }
  let tags2 = schemaTags;
  if (!tags2) {
    if (Array.isArray(customTags))
      tags2 = [];
    else {
      const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
      throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
    }
  }
  if (Array.isArray(customTags)) {
    for (const tag of customTags)
      tags2 = tags2.concat(tag);
  } else if (typeof customTags === "function") {
    tags2 = customTags(tags2.slice());
  }
  if (addMergeTag)
    tags2 = tags2.concat(merge$1.merge);
  return tags2.reduce((tags3, tag) => {
    const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
    if (!tagObj) {
      const tagName = JSON.stringify(tag);
      const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
      throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
    }
    if (!tags3.includes(tagObj))
      tags3.push(tagObj);
    return tags3;
  }, []);
}
tags$1.coreKnownTags = coreKnownTags;
tags$1.getTags = getTags;
var identity$a = identity$x;
var map = map$6;
var seq = seq$6;
var string = string$5;
var tags = tags$1;
const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
let Schema$2 = class Schema {
  constructor({ compat, customTags, merge: merge2, resolveKnownTags, schema: schema2, sortMapEntries, toStringDefaults }) {
    this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
    this.name = typeof schema2 === "string" && schema2 || "core";
    this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
    this.tags = tags.getTags(customTags, this.name, merge2);
    this.toStringOptions = toStringDefaults ?? null;
    Object.defineProperty(this, identity$a.MAP, { value: map.map });
    Object.defineProperty(this, identity$a.SCALAR, { value: string.string });
    Object.defineProperty(this, identity$a.SEQ, { value: seq.seq });
    this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
  }
  clone() {
    const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
    copy.tags = this.tags.slice();
    return copy;
  }
};
Schema$3.Schema = Schema$2;
var stringifyDocument$2 = {};
var identity$9 = identity$x;
var stringify$2 = stringify$7;
var stringifyComment = stringifyComment$5;
function stringifyDocument$1(doc, options) {
  var _a;
  const lines = [];
  let hasDirectives = options.directives === true;
  if (options.directives !== false && doc.directives) {
    const dir = doc.directives.toString(doc);
    if (dir) {
      lines.push(dir);
      hasDirectives = true;
    } else if (doc.directives.docStart)
      hasDirectives = true;
  }
  if (hasDirectives)
    lines.push("---");
  const ctx = stringify$2.createStringifyContext(doc, options);
  const { commentString } = ctx.options;
  if (doc.commentBefore) {
    if (lines.length !== 1)
      lines.unshift("");
    const cs = commentString(doc.commentBefore);
    lines.unshift(stringifyComment.indentComment(cs, ""));
  }
  let chompKeep = false;
  let contentComment = null;
  if (doc.contents) {
    if (identity$9.isNode(doc.contents)) {
      if (doc.contents.spaceBefore && hasDirectives)
        lines.push("");
      if (doc.contents.commentBefore) {
        const cs = commentString(doc.contents.commentBefore);
        lines.push(stringifyComment.indentComment(cs, ""));
      }
      ctx.forceBlockIndent = !!doc.comment;
      contentComment = doc.contents.comment;
    }
    const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
    let body = stringify$2.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
    if (contentComment)
      body += stringifyComment.lineComment(body, "", commentString(contentComment));
    if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
      lines[lines.length - 1] = `--- ${body}`;
    } else
      lines.push(body);
  } else {
    lines.push(stringify$2.stringify(doc.contents, ctx));
  }
  if ((_a = doc.directives) == null ? void 0 : _a.docEnd) {
    if (doc.comment) {
      const cs = commentString(doc.comment);
      if (cs.includes("\n")) {
        lines.push("...");
        lines.push(stringifyComment.indentComment(cs, ""));
      } else {
        lines.push(`... ${cs}`);
      }
    } else {
      lines.push("...");
    }
  } else {
    let dc = doc.comment;
    if (dc && chompKeep)
      dc = dc.replace(/^\n+/, "");
    if (dc) {
      if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
        lines.push("");
      lines.push(stringifyComment.indentComment(commentString(dc), ""));
    }
  }
  return lines.join("\n") + "\n";
}
stringifyDocument$2.stringifyDocument = stringifyDocument$1;
var Alias$2 = Alias$5;
var Collection2 = Collection$4;
var identity$8 = identity$x;
var Pair$3 = Pair$8;
var toJS = toJS$8;
var Schema$1 = Schema$3;
var stringifyDocument = stringifyDocument$2;
var anchors = anchors$3;
var applyReviver = applyReviver$3;
var createNode = createNode$5;
var directives$1 = directives$2;
let Document$4 = class Document {
  constructor(value, replacer, options) {
    this.commentBefore = null;
    this.comment = null;
    this.errors = [];
    this.warnings = [];
    Object.defineProperty(this, identity$8.NODE_TYPE, { value: identity$8.DOC });
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
      replacer = void 0;
    }
    const opt = Object.assign({
      intAsBigInt: false,
      keepSourceTokens: false,
      logLevel: "warn",
      prettyErrors: true,
      strict: true,
      stringKeys: false,
      uniqueKeys: true,
      version: "1.2"
    }, options);
    this.options = opt;
    let { version: version2 } = opt;
    if (options == null ? void 0 : options._directives) {
      this.directives = options._directives.atDocument();
      if (this.directives.yaml.explicit)
        version2 = this.directives.yaml.version;
    } else
      this.directives = new directives$1.Directives({ version: version2 });
    this.setSchema(version2, options);
    this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
  }
  /**
   * Create a deep copy of this Document and its contents.
   *
   * Custom Node values that inherit from `Object` still refer to their original instances.
   */
  clone() {
    const copy = Object.create(Document.prototype, {
      [identity$8.NODE_TYPE]: { value: identity$8.DOC }
    });
    copy.commentBefore = this.commentBefore;
    copy.comment = this.comment;
    copy.errors = this.errors.slice();
    copy.warnings = this.warnings.slice();
    copy.options = Object.assign({}, this.options);
    if (this.directives)
      copy.directives = this.directives.clone();
    copy.schema = this.schema.clone();
    copy.contents = identity$8.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
    if (this.range)
      copy.range = this.range.slice();
    return copy;
  }
  /** Adds a value to the document. */
  add(value) {
    if (assertCollection(this.contents))
      this.contents.add(value);
  }
  /** Adds a value to the document. */
  addIn(path2, value) {
    if (assertCollection(this.contents))
      this.contents.addIn(path2, value);
  }
  /**
   * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
   *
   * If `node` already has an anchor, `name` is ignored.
   * Otherwise, the `node.anchor` value will be set to `name`,
   * or if an anchor with that name is already present in the document,
   * `name` will be used as a prefix for a new unique anchor.
   * If `name` is undefined, the generated anchor will use 'a' as a prefix.
   */
  createAlias(node2, name) {
    if (!node2.anchor) {
      const prev = anchors.anchorNames(this);
      node2.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
    }
    return new Alias$2.Alias(node2.anchor);
  }
  createNode(value, replacer, options) {
    let _replacer = void 0;
    if (typeof replacer === "function") {
      value = replacer.call({ "": value }, "", value);
      _replacer = replacer;
    } else if (Array.isArray(replacer)) {
      const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
      const asStr = replacer.filter(keyToStr).map(String);
      if (asStr.length > 0)
        replacer = replacer.concat(asStr);
      _replacer = replacer;
    } else if (options === void 0 && replacer) {
      options = replacer;
      replacer = void 0;
    }
    const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
    const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
      this,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      anchorPrefix || "a"
    );
    const ctx = {
      aliasDuplicateObjects: aliasDuplicateObjects ?? true,
      keepUndefined: keepUndefined ?? false,
      onAnchor,
      onTagObj,
      replacer: _replacer,
      schema: this.schema,
      sourceObjects
    };
    const node2 = createNode.createNode(value, tag, ctx);
    if (flow && identity$8.isCollection(node2))
      node2.flow = true;
    setAnchors();
    return node2;
  }
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   */
  createPair(key, value, options = {}) {
    const k = this.createNode(key, null, options);
    const v = this.createNode(value, null, options);
    return new Pair$3.Pair(k, v);
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  delete(key) {
    return assertCollection(this.contents) ? this.contents.delete(key) : false;
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(path2) {
    if (Collection2.isEmptyPath(path2)) {
      if (this.contents == null)
        return false;
      this.contents = null;
      return true;
    }
    return assertCollection(this.contents) ? this.contents.deleteIn(path2) : false;
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  get(key, keepScalar) {
    return identity$8.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
  }
  /**
   * Returns item at `path`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(path2, keepScalar) {
    if (Collection2.isEmptyPath(path2))
      return !keepScalar && identity$8.isScalar(this.contents) ? this.contents.value : this.contents;
    return identity$8.isCollection(this.contents) ? this.contents.getIn(path2, keepScalar) : void 0;
  }
  /**
   * Checks if the document includes a value with the key `key`.
   */
  has(key) {
    return identity$8.isCollection(this.contents) ? this.contents.has(key) : false;
  }
  /**
   * Checks if the document includes a value at `path`.
   */
  hasIn(path2) {
    if (Collection2.isEmptyPath(path2))
      return this.contents !== void 0;
    return identity$8.isCollection(this.contents) ? this.contents.hasIn(path2) : false;
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  set(key, value) {
    if (this.contents == null) {
      this.contents = Collection2.collectionFromPath(this.schema, [key], value);
    } else if (assertCollection(this.contents)) {
      this.contents.set(key, value);
    }
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(path2, value) {
    if (Collection2.isEmptyPath(path2)) {
      this.contents = value;
    } else if (this.contents == null) {
      this.contents = Collection2.collectionFromPath(this.schema, Array.from(path2), value);
    } else if (assertCollection(this.contents)) {
      this.contents.setIn(path2, value);
    }
  }
  /**
   * Change the YAML version and schema used by the document.
   * A `null` version disables support for directives, explicit tags, anchors, and aliases.
   * It also requires the `schema` option to be given as a `Schema` instance value.
   *
   * Overrides all previously set schema options.
   */
  setSchema(version2, options = {}) {
    if (typeof version2 === "number")
      version2 = String(version2);
    let opt;
    switch (version2) {
      case "1.1":
        if (this.directives)
          this.directives.yaml.version = "1.1";
        else
          this.directives = new directives$1.Directives({ version: "1.1" });
        opt = { resolveKnownTags: false, schema: "yaml-1.1" };
        break;
      case "1.2":
      case "next":
        if (this.directives)
          this.directives.yaml.version = version2;
        else
          this.directives = new directives$1.Directives({ version: version2 });
        opt = { resolveKnownTags: true, schema: "core" };
        break;
      case null:
        if (this.directives)
          delete this.directives;
        opt = null;
        break;
      default: {
        const sv = JSON.stringify(version2);
        throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
      }
    }
    if (options.schema instanceof Object)
      this.schema = options.schema;
    else if (opt)
      this.schema = new Schema$1.Schema(Object.assign(opt, options));
    else
      throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
  }
  // json & jsonArg are only used from toJSON()
  toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
    const ctx = {
      anchors: /* @__PURE__ */ new Map(),
      doc: this,
      keep: !json,
      mapAsMap: mapAsMap === true,
      mapKeyWarned: false,
      maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
    };
    const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
    if (typeof onAnchor === "function")
      for (const { count, res: res2 } of ctx.anchors.values())
        onAnchor(res2, count);
    return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
  }
  /**
   * A JSON representation of the document `contents`.
   *
   * @param jsonArg Used by `JSON.stringify` to indicate the array index or
   *   property name.
   */
  toJSON(jsonArg, onAnchor) {
    return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
  }
  /** A YAML representation of the document. */
  toString(options = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
      const s = JSON.stringify(options.indent);
      throw new Error(`"indent" option must be a positive integer, not ${s}`);
    }
    return stringifyDocument.stringifyDocument(this, options);
  }
};
function assertCollection(contents) {
  if (identity$8.isCollection(contents))
    return true;
  throw new Error("Expected a YAML collection as document contents");
}
Document$5.Document = Document$4;
var errors$5 = {};
class YAMLError extends Error {
  constructor(name, pos, code, message) {
    super();
    this.name = name;
    this.code = code;
    this.message = message;
    this.pos = pos;
  }
}
class YAMLParseError extends YAMLError {
  constructor(pos, code, message) {
    super("YAMLParseError", pos, code, message);
  }
}
class YAMLWarning extends YAMLError {
  constructor(pos, code, message) {
    super("YAMLWarning", pos, code, message);
  }
}
const prettifyError = (src2, lc) => (error) => {
  if (error.pos[0] === -1)
    return;
  error.linePos = error.pos.map((pos) => lc.linePos(pos));
  const { line, col } = error.linePos[0];
  error.message += ` at line ${line}, column ${col}`;
  let ci = col - 1;
  let lineStr = src2.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
  if (ci >= 60 && lineStr.length > 80) {
    const trimStart = Math.min(ci - 39, lineStr.length - 79);
    lineStr = "…" + lineStr.substring(trimStart);
    ci -= trimStart - 1;
  }
  if (lineStr.length > 80)
    lineStr = lineStr.substring(0, 79) + "…";
  if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
    let prev = src2.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
    if (prev.length > 80)
      prev = prev.substring(0, 79) + "…\n";
    lineStr = prev + lineStr;
  }
  if (/[^ ]/.test(lineStr)) {
    let count = 1;
    const end = error.linePos[1];
    if ((end == null ? void 0 : end.line) === line && end.col > col) {
      count = Math.max(1, Math.min(end.col - col, 80 - ci));
    }
    const pointer = " ".repeat(ci) + "^".repeat(count);
    error.message += `:

${lineStr}
${pointer}
`;
  }
};
errors$5.YAMLError = YAMLError;
errors$5.YAMLParseError = YAMLParseError;
errors$5.YAMLWarning = YAMLWarning;
errors$5.prettifyError = prettifyError;
var composeDoc$2 = {};
var composeNode$2 = {};
var composeCollection$2 = {};
var resolveBlockMap$2 = {};
var resolveProps$5 = {};
function resolveProps$4(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
  let spaceBefore = false;
  let atNewline = startOnNewline;
  let hasSpace = startOnNewline;
  let comment = "";
  let commentSep = "";
  let hasNewline = false;
  let reqSpace = false;
  let tab = null;
  let anchor = null;
  let tag = null;
  let newlineAfterProp = null;
  let comma = null;
  let found = null;
  let start = null;
  for (const token of tokens) {
    if (reqSpace) {
      if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
        onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      reqSpace = false;
    }
    if (tab) {
      if (atNewline && token.type !== "comment" && token.type !== "newline") {
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      }
      tab = null;
    }
    switch (token.type) {
      case "space":
        if (!flow && (indicator !== "doc-start" || (next == null ? void 0 : next.type) !== "flow-collection") && token.source.includes("	")) {
          tab = token;
        }
        hasSpace = true;
        break;
      case "comment": {
        if (!hasSpace)
          onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
        const cb = token.source.substring(1) || " ";
        if (!comment)
          comment = cb;
        else
          comment += commentSep + cb;
        commentSep = "";
        atNewline = false;
        break;
      }
      case "newline":
        if (atNewline) {
          if (comment)
            comment += token.source;
          else if (!found || indicator !== "seq-item-ind")
            spaceBefore = true;
        } else
          commentSep += token.source;
        atNewline = true;
        hasNewline = true;
        if (anchor || tag)
          newlineAfterProp = token;
        hasSpace = true;
        break;
      case "anchor":
        if (anchor)
          onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
        if (token.source.endsWith(":"))
          onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
        anchor = token;
        start ?? (start = token.offset);
        atNewline = false;
        hasSpace = false;
        reqSpace = true;
        break;
      case "tag": {
        if (tag)
          onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
        tag = token;
        start ?? (start = token.offset);
        atNewline = false;
        hasSpace = false;
        reqSpace = true;
        break;
      }
      case indicator:
        if (anchor || tag)
          onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
        if (found)
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
        found = token;
        atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
        hasSpace = false;
        break;
      case "comma":
        if (flow) {
          if (comma)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
          comma = token;
          atNewline = false;
          hasSpace = false;
          break;
        }
      default:
        onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
        atNewline = false;
        hasSpace = false;
    }
  }
  const last = tokens[tokens.length - 1];
  const end = last ? last.offset + last.source.length : offset;
  if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
    onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
  }
  if (tab && (atNewline && tab.indent <= parentIndent || (next == null ? void 0 : next.type) === "block-map" || (next == null ? void 0 : next.type) === "block-seq"))
    onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
  return {
    comma,
    found,
    spaceBefore,
    comment,
    hasNewline,
    anchor,
    tag,
    newlineAfterProp,
    end,
    start: start ?? end
  };
}
resolveProps$5.resolveProps = resolveProps$4;
var utilContainsNewline$3 = {};
function containsNewline(key) {
  if (!key)
    return null;
  switch (key.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (key.source.includes("\n"))
        return true;
      if (key.end) {
        for (const st of key.end)
          if (st.type === "newline")
            return true;
      }
      return false;
    case "flow-collection":
      for (const it of key.items) {
        for (const st of it.start)
          if (st.type === "newline")
            return true;
        if (it.sep) {
          for (const st of it.sep)
            if (st.type === "newline")
              return true;
        }
        if (containsNewline(it.key) || containsNewline(it.value))
          return true;
      }
      return false;
    default:
      return true;
  }
}
utilContainsNewline$3.containsNewline = containsNewline;
var utilFlowIndentCheck$2 = {};
var utilContainsNewline$2 = utilContainsNewline$3;
function flowIndentCheck(indent, fc, onError) {
  if ((fc == null ? void 0 : fc.type) === "flow-collection") {
    const end = fc.end[0];
    if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline$2.containsNewline(fc)) {
      const msg = "Flow end indicator should be more indented than parent";
      onError(end, "BAD_INDENT", msg, true);
    }
  }
}
utilFlowIndentCheck$2.flowIndentCheck = flowIndentCheck;
var utilMapIncludes$2 = {};
var identity$7 = identity$x;
function mapIncludes(ctx, items, search) {
  const { uniqueKeys } = ctx.options;
  if (uniqueKeys === false)
    return false;
  const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity$7.isScalar(a) && identity$7.isScalar(b) && a.value === b.value;
  return items.some((pair) => isEqual(pair.key, search));
}
utilMapIncludes$2.mapIncludes = mapIncludes;
var Pair$2 = Pair$8;
var YAMLMap$3 = YAMLMap$8;
var resolveProps$3 = resolveProps$5;
var utilContainsNewline$1 = utilContainsNewline$3;
var utilFlowIndentCheck$1 = utilFlowIndentCheck$2;
var utilMapIncludes$1 = utilMapIncludes$2;
const startColMsg = "All mapping items must start at the same column";
function resolveBlockMap$1({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bm, onError, tag) {
  var _a;
  const NodeClass = (tag == null ? void 0 : tag.nodeClass) ?? YAMLMap$3.YAMLMap;
  const map2 = new NodeClass(ctx.schema);
  if (ctx.atRoot)
    ctx.atRoot = false;
  let offset = bm.offset;
  let commentEnd = null;
  for (const collItem of bm.items) {
    const { start, key, sep, value } = collItem;
    const keyProps = resolveProps$3.resolveProps(start, {
      indicator: "explicit-key-ind",
      next: key ?? (sep == null ? void 0 : sep[0]),
      offset,
      onError,
      parentIndent: bm.indent,
      startOnNewline: true
    });
    const implicitKey = !keyProps.found;
    if (implicitKey) {
      if (key) {
        if (key.type === "block-seq")
          onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
        else if ("indent" in key && key.indent !== bm.indent)
          onError(offset, "BAD_INDENT", startColMsg);
      }
      if (!keyProps.anchor && !keyProps.tag && !sep) {
        commentEnd = keyProps.end;
        if (keyProps.comment) {
          if (map2.comment)
            map2.comment += "\n" + keyProps.comment;
          else
            map2.comment = keyProps.comment;
        }
        continue;
      }
      if (keyProps.newlineAfterProp || utilContainsNewline$1.containsNewline(key)) {
        onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
      }
    } else if (((_a = keyProps.found) == null ? void 0 : _a.indent) !== bm.indent) {
      onError(offset, "BAD_INDENT", startColMsg);
    }
    ctx.atKey = true;
    const keyStart = keyProps.end;
    const keyNode = key ? composeNode2(ctx, key, keyProps, onError) : composeEmptyNode2(ctx, keyStart, start, null, keyProps, onError);
    if (ctx.schema.compat)
      utilFlowIndentCheck$1.flowIndentCheck(bm.indent, key, onError);
    ctx.atKey = false;
    if (utilMapIncludes$1.mapIncludes(ctx, map2.items, keyNode))
      onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
    const valueProps = resolveProps$3.resolveProps(sep ?? [], {
      indicator: "map-value-ind",
      next: value,
      offset: keyNode.range[2],
      onError,
      parentIndent: bm.indent,
      startOnNewline: !key || key.type === "block-scalar"
    });
    offset = valueProps.end;
    if (valueProps.found) {
      if (implicitKey) {
        if ((value == null ? void 0 : value.type) === "block-map" && !valueProps.hasNewline)
          onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
        if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
          onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
      }
      const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : composeEmptyNode2(ctx, offset, sep, null, valueProps, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck$1.flowIndentCheck(bm.indent, value, onError);
      offset = valueNode.range[2];
      const pair = new Pair$2.Pair(keyNode, valueNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      map2.items.push(pair);
    } else {
      if (implicitKey)
        onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
      if (valueProps.comment) {
        if (keyNode.comment)
          keyNode.comment += "\n" + valueProps.comment;
        else
          keyNode.comment = valueProps.comment;
      }
      const pair = new Pair$2.Pair(keyNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      map2.items.push(pair);
    }
  }
  if (commentEnd && commentEnd < offset)
    onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
  map2.range = [bm.offset, offset, commentEnd ?? offset];
  return map2;
}
resolveBlockMap$2.resolveBlockMap = resolveBlockMap$1;
var resolveBlockSeq$2 = {};
var YAMLSeq$3 = YAMLSeq$8;
var resolveProps$2 = resolveProps$5;
var utilFlowIndentCheck = utilFlowIndentCheck$2;
function resolveBlockSeq$1({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, bs, onError, tag) {
  const NodeClass = (tag == null ? void 0 : tag.nodeClass) ?? YAMLSeq$3.YAMLSeq;
  const seq2 = new NodeClass(ctx.schema);
  if (ctx.atRoot)
    ctx.atRoot = false;
  if (ctx.atKey)
    ctx.atKey = false;
  let offset = bs.offset;
  let commentEnd = null;
  for (const { start, value } of bs.items) {
    const props = resolveProps$2.resolveProps(start, {
      indicator: "seq-item-ind",
      next: value,
      offset,
      onError,
      parentIndent: bs.indent,
      startOnNewline: true
    });
    if (!props.found) {
      if (props.anchor || props.tag || value) {
        if ((value == null ? void 0 : value.type) === "block-seq")
          onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
        else
          onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
      } else {
        commentEnd = props.end;
        if (props.comment)
          seq2.comment = props.comment;
        continue;
      }
    }
    const node2 = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, start, null, props, onError);
    if (ctx.schema.compat)
      utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
    offset = node2.range[2];
    seq2.items.push(node2);
  }
  seq2.range = [bs.offset, offset, commentEnd ?? offset];
  return seq2;
}
resolveBlockSeq$2.resolveBlockSeq = resolveBlockSeq$1;
var resolveFlowCollection$2 = {};
var resolveEnd$6 = {};
function resolveEnd$5(end, offset, reqSpace, onError) {
  let comment = "";
  if (end) {
    let hasSpace = false;
    let sep = "";
    for (const token of end) {
      const { source, type: type2 } = token;
      switch (type2) {
        case "space":
          hasSpace = true;
          break;
        case "comment": {
          if (reqSpace && !hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += sep + cb;
          sep = "";
          break;
        }
        case "newline":
          if (comment)
            sep += source;
          hasSpace = true;
          break;
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type2} at node end`);
      }
      offset += source.length;
    }
  }
  return { comment, offset };
}
resolveEnd$6.resolveEnd = resolveEnd$5;
var identity$6 = identity$x;
var Pair$1 = Pair$8;
var YAMLMap$2 = YAMLMap$8;
var YAMLSeq$2 = YAMLSeq$8;
var resolveEnd$4 = resolveEnd$6;
var resolveProps$1 = resolveProps$5;
var utilContainsNewline = utilContainsNewline$3;
var utilMapIncludes = utilMapIncludes$2;
const blockMsg = "Block collections are not allowed within flow collections";
const isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
function resolveFlowCollection$1({ composeNode: composeNode2, composeEmptyNode: composeEmptyNode2 }, ctx, fc, onError, tag) {
  var _a;
  const isMap2 = fc.start.source === "{";
  const fcName = isMap2 ? "flow map" : "flow sequence";
  const NodeClass = (tag == null ? void 0 : tag.nodeClass) ?? (isMap2 ? YAMLMap$2.YAMLMap : YAMLSeq$2.YAMLSeq);
  const coll = new NodeClass(ctx.schema);
  coll.flow = true;
  const atRoot = ctx.atRoot;
  if (atRoot)
    ctx.atRoot = false;
  if (ctx.atKey)
    ctx.atKey = false;
  let offset = fc.offset + fc.start.source.length;
  for (let i = 0; i < fc.items.length; ++i) {
    const collItem = fc.items[i];
    const { start, key, sep, value } = collItem;
    const props = resolveProps$1.resolveProps(start, {
      flow: fcName,
      indicator: "explicit-key-ind",
      next: key ?? (sep == null ? void 0 : sep[0]),
      offset,
      onError,
      parentIndent: fc.indent,
      startOnNewline: false
    });
    if (!props.found) {
      if (!props.anchor && !props.tag && !sep && !value) {
        if (i === 0 && props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        else if (i < fc.items.length - 1)
          onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
        if (props.comment) {
          if (coll.comment)
            coll.comment += "\n" + props.comment;
          else
            coll.comment = props.comment;
        }
        offset = props.end;
        continue;
      }
      if (!isMap2 && ctx.options.strict && utilContainsNewline.containsNewline(key))
        onError(
          key,
          // checked by containsNewline()
          "MULTILINE_IMPLICIT_KEY",
          "Implicit keys of flow sequence pairs need to be on a single line"
        );
    }
    if (i === 0) {
      if (props.comma)
        onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
    } else {
      if (!props.comma)
        onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
      if (props.comment) {
        let prevItemComment = "";
        loop: for (const st of start) {
          switch (st.type) {
            case "comma":
            case "space":
              break;
            case "comment":
              prevItemComment = st.source.substring(1);
              break loop;
            default:
              break loop;
          }
        }
        if (prevItemComment) {
          let prev = coll.items[coll.items.length - 1];
          if (identity$6.isPair(prev))
            prev = prev.value ?? prev.key;
          if (prev.comment)
            prev.comment += "\n" + prevItemComment;
          else
            prev.comment = prevItemComment;
          props.comment = props.comment.substring(prevItemComment.length + 1);
        }
      }
    }
    if (!isMap2 && !sep && !props.found) {
      const valueNode = value ? composeNode2(ctx, value, props, onError) : composeEmptyNode2(ctx, props.end, sep, null, props, onError);
      coll.items.push(valueNode);
      offset = valueNode.range[2];
      if (isBlock(value))
        onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
    } else {
      ctx.atKey = true;
      const keyStart = props.end;
      const keyNode = key ? composeNode2(ctx, key, props, onError) : composeEmptyNode2(ctx, keyStart, start, null, props, onError);
      if (isBlock(key))
        onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
      ctx.atKey = false;
      const valueProps = resolveProps$1.resolveProps(sep ?? [], {
        flow: fcName,
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (valueProps.found) {
        if (!isMap2 && !props.found && ctx.options.strict) {
          if (sep)
            for (const st of sep) {
              if (st === valueProps.found)
                break;
              if (st.type === "newline") {
                onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                break;
              }
            }
          if (props.start < valueProps.found.offset - 1024)
            onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
        }
      } else if (value) {
        if ("source" in value && ((_a = value.source) == null ? void 0 : _a[0]) === ":")
          onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
        else
          onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
      }
      const valueNode = value ? composeNode2(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode2(ctx, valueProps.end, sep, null, valueProps, onError) : null;
      if (valueNode) {
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else if (valueProps.comment) {
        if (keyNode.comment)
          keyNode.comment += "\n" + valueProps.comment;
        else
          keyNode.comment = valueProps.comment;
      }
      const pair = new Pair$1.Pair(keyNode, valueNode);
      if (ctx.options.keepSourceTokens)
        pair.srcToken = collItem;
      if (isMap2) {
        const map2 = coll;
        if (utilMapIncludes.mapIncludes(ctx, map2.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        map2.items.push(pair);
      } else {
        const map2 = new YAMLMap$2.YAMLMap(ctx.schema);
        map2.flow = true;
        map2.items.push(pair);
        const endRange = (valueNode ?? keyNode).range;
        map2.range = [keyNode.range[0], endRange[1], endRange[2]];
        coll.items.push(map2);
      }
      offset = valueNode ? valueNode.range[2] : valueProps.end;
    }
  }
  const expectedEnd = isMap2 ? "}" : "]";
  const [ce, ...ee] = fc.end;
  let cePos = offset;
  if ((ce == null ? void 0 : ce.source) === expectedEnd)
    cePos = ce.offset + ce.source.length;
  else {
    const name = fcName[0].toUpperCase() + fcName.substring(1);
    const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
    onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
    if (ce && ce.source.length !== 1)
      ee.unshift(ce);
  }
  if (ee.length > 0) {
    const end = resolveEnd$4.resolveEnd(ee, cePos, ctx.options.strict, onError);
    if (end.comment) {
      if (coll.comment)
        coll.comment += "\n" + end.comment;
      else
        coll.comment = end.comment;
    }
    coll.range = [fc.offset, cePos, end.offset];
  } else {
    coll.range = [fc.offset, cePos, cePos];
  }
  return coll;
}
resolveFlowCollection$2.resolveFlowCollection = resolveFlowCollection$1;
var identity$5 = identity$x;
var Scalar$4 = Scalar$k;
var YAMLMap$1 = YAMLMap$8;
var YAMLSeq$1 = YAMLSeq$8;
var resolveBlockMap = resolveBlockMap$2;
var resolveBlockSeq = resolveBlockSeq$2;
var resolveFlowCollection = resolveFlowCollection$2;
function resolveCollection(CN2, ctx, token, onError, tagName, tag) {
  const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN2, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN2, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN2, ctx, token, onError, tag);
  const Coll = coll.constructor;
  if (tagName === "!" || tagName === Coll.tagName) {
    coll.tag = Coll.tagName;
    return coll;
  }
  if (tagName)
    coll.tag = tagName;
  return coll;
}
function composeCollection$1(CN2, ctx, token, props, onError) {
  var _a;
  const tagToken = props.tag;
  const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
  if (token.type === "block-seq") {
    const { anchor, newlineAfterProp: nl } = props;
    const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
    if (lastProp && (!nl || nl.offset < lastProp.offset)) {
      const message = "Missing newline after block sequence props";
      onError(lastProp, "MISSING_CHAR", message);
    }
  }
  const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
  if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap$1.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq$1.YAMLSeq.tagName && expType === "seq") {
    return resolveCollection(CN2, ctx, token, onError, tagName);
  }
  let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
  if (!tag) {
    const kt = ctx.schema.knownTags[tagName];
    if ((kt == null ? void 0 : kt.collection) === expType) {
      ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
      tag = kt;
    } else {
      if (kt) {
        onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
      } else {
        onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
      }
      return resolveCollection(CN2, ctx, token, onError, tagName);
    }
  }
  const coll = resolveCollection(CN2, ctx, token, onError, tagName, tag);
  const res = ((_a = tag.resolve) == null ? void 0 : _a.call(tag, coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options)) ?? coll;
  const node2 = identity$5.isNode(res) ? res : new Scalar$4.Scalar(res);
  node2.range = coll.range;
  node2.tag = tagName;
  if (tag == null ? void 0 : tag.format)
    node2.format = tag.format;
  return node2;
}
composeCollection$2.composeCollection = composeCollection$1;
var composeScalar$2 = {};
var resolveBlockScalar$3 = {};
var Scalar$3 = Scalar$k;
function resolveBlockScalar$2(ctx, scalar, onError) {
  const start = scalar.offset;
  const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
  if (!header)
    return { value: "", type: null, comment: "", range: [start, start, start] };
  const type2 = header.mode === ">" ? Scalar$3.Scalar.BLOCK_FOLDED : Scalar$3.Scalar.BLOCK_LITERAL;
  const lines = scalar.source ? splitLines(scalar.source) : [];
  let chompStart = lines.length;
  for (let i = lines.length - 1; i >= 0; --i) {
    const content = lines[i][1];
    if (content === "" || content === "\r")
      chompStart = i;
    else
      break;
  }
  if (chompStart === 0) {
    const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
    let end2 = start + header.length;
    if (scalar.source)
      end2 += scalar.source.length;
    return { value: value2, type: type2, comment: header.comment, range: [start, end2, end2] };
  }
  let trimIndent = scalar.indent + header.indent;
  let offset = scalar.offset + header.length;
  let contentStart = 0;
  for (let i = 0; i < chompStart; ++i) {
    const [indent, content] = lines[i];
    if (content === "" || content === "\r") {
      if (header.indent === 0 && indent.length > trimIndent)
        trimIndent = indent.length;
    } else {
      if (indent.length < trimIndent) {
        const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
        onError(offset + indent.length, "MISSING_CHAR", message);
      }
      if (header.indent === 0)
        trimIndent = indent.length;
      contentStart = i;
      if (trimIndent === 0 && !ctx.atRoot) {
        const message = "Block scalar values in collections must be indented";
        onError(offset, "BAD_INDENT", message);
      }
      break;
    }
    offset += indent.length + content.length + 1;
  }
  for (let i = lines.length - 1; i >= chompStart; --i) {
    if (lines[i][0].length > trimIndent)
      chompStart = i + 1;
  }
  let value = "";
  let sep = "";
  let prevMoreIndented = false;
  for (let i = 0; i < contentStart; ++i)
    value += lines[i][0].slice(trimIndent) + "\n";
  for (let i = contentStart; i < chompStart; ++i) {
    let [indent, content] = lines[i];
    offset += indent.length + content.length + 1;
    const crlf = content[content.length - 1] === "\r";
    if (crlf)
      content = content.slice(0, -1);
    if (content && indent.length < trimIndent) {
      const src2 = header.indent ? "explicit indentation indicator" : "first line";
      const message = `Block scalar lines must not be less indented than their ${src2}`;
      onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
      indent = "";
    }
    if (type2 === Scalar$3.Scalar.BLOCK_LITERAL) {
      value += sep + indent.slice(trimIndent) + content;
      sep = "\n";
    } else if (indent.length > trimIndent || content[0] === "	") {
      if (sep === " ")
        sep = "\n";
      else if (!prevMoreIndented && sep === "\n")
        sep = "\n\n";
      value += sep + indent.slice(trimIndent) + content;
      sep = "\n";
      prevMoreIndented = true;
    } else if (content === "") {
      if (sep === "\n")
        value += "\n";
      else
        sep = "\n";
    } else {
      value += sep + content;
      sep = " ";
      prevMoreIndented = false;
    }
  }
  switch (header.chomp) {
    case "-":
      break;
    case "+":
      for (let i = chompStart; i < lines.length; ++i)
        value += "\n" + lines[i][0].slice(trimIndent);
      if (value[value.length - 1] !== "\n")
        value += "\n";
      break;
    default:
      value += "\n";
  }
  const end = start + header.length + scalar.source.length;
  return { value, type: type2, comment: header.comment, range: [start, end, end] };
}
function parseBlockScalarHeader({ offset, props }, strict, onError) {
  if (props[0].type !== "block-scalar-header") {
    onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
    return null;
  }
  const { source } = props[0];
  const mode = source[0];
  let indent = 0;
  let chomp = "";
  let error = -1;
  for (let i = 1; i < source.length; ++i) {
    const ch = source[i];
    if (!chomp && (ch === "-" || ch === "+"))
      chomp = ch;
    else {
      const n = Number(ch);
      if (!indent && n)
        indent = n;
      else if (error === -1)
        error = offset + i;
    }
  }
  if (error !== -1)
    onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
  let hasSpace = false;
  let comment = "";
  let length = source.length;
  for (let i = 1; i < props.length; ++i) {
    const token = props[i];
    switch (token.type) {
      case "space":
        hasSpace = true;
      case "newline":
        length += token.source.length;
        break;
      case "comment":
        if (strict && !hasSpace) {
          const message = "Comments must be separated from other tokens by white space characters";
          onError(token, "MISSING_CHAR", message);
        }
        length += token.source.length;
        comment = token.source.substring(1);
        break;
      case "error":
        onError(token, "UNEXPECTED_TOKEN", token.message);
        length += token.source.length;
        break;
      default: {
        const message = `Unexpected token in block scalar header: ${token.type}`;
        onError(token, "UNEXPECTED_TOKEN", message);
        const ts = token.source;
        if (ts && typeof ts === "string")
          length += ts.length;
      }
    }
  }
  return { mode, indent, chomp, comment, length };
}
function splitLines(source) {
  const split = source.split(/\n( *)/);
  const first = split[0];
  const m = first.match(/^( *)/);
  const line0 = (m == null ? void 0 : m[1]) ? [m[1], first.slice(m[1].length)] : ["", first];
  const lines = [line0];
  for (let i = 1; i < split.length; i += 2)
    lines.push([split[i], split[i + 1]]);
  return lines;
}
resolveBlockScalar$3.resolveBlockScalar = resolveBlockScalar$2;
var resolveFlowScalar$3 = {};
var Scalar$2 = Scalar$k;
var resolveEnd$3 = resolveEnd$6;
function resolveFlowScalar$2(scalar, strict, onError) {
  const { offset, type: type2, source, end } = scalar;
  let _type;
  let value;
  const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
  switch (type2) {
    case "scalar":
      _type = Scalar$2.Scalar.PLAIN;
      value = plainValue(source, _onError);
      break;
    case "single-quoted-scalar":
      _type = Scalar$2.Scalar.QUOTE_SINGLE;
      value = singleQuotedValue(source, _onError);
      break;
    case "double-quoted-scalar":
      _type = Scalar$2.Scalar.QUOTE_DOUBLE;
      value = doubleQuotedValue(source, _onError);
      break;
    default:
      onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type2}`);
      return {
        value: "",
        type: null,
        comment: "",
        range: [offset, offset + source.length, offset + source.length]
      };
  }
  const valueEnd = offset + source.length;
  const re = resolveEnd$3.resolveEnd(end, valueEnd, strict, onError);
  return {
    value,
    type: _type,
    comment: re.comment,
    range: [offset, valueEnd, re.offset]
  };
}
function plainValue(source, onError) {
  let badChar = "";
  switch (source[0]) {
    case "	":
      badChar = "a tab character";
      break;
    case ",":
      badChar = "flow indicator character ,";
      break;
    case "%":
      badChar = "directive indicator character %";
      break;
    case "|":
    case ">": {
      badChar = `block scalar indicator ${source[0]}`;
      break;
    }
    case "@":
    case "`": {
      badChar = `reserved character ${source[0]}`;
      break;
    }
  }
  if (badChar)
    onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
  return foldLines(source);
}
function singleQuotedValue(source, onError) {
  if (source[source.length - 1] !== "'" || source.length === 1)
    onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
  return foldLines(source.slice(1, -1)).replace(/''/g, "'");
}
function foldLines(source) {
  let first, line;
  try {
    first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
    line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
  } catch {
    first = /(.*?)[ \t]*\r?\n/sy;
    line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
  }
  let match = first.exec(source);
  if (!match)
    return source;
  let res = match[1];
  let sep = " ";
  let pos = first.lastIndex;
  line.lastIndex = pos;
  while (match = line.exec(source)) {
    if (match[1] === "") {
      if (sep === "\n")
        res += sep;
      else
        sep = "\n";
    } else {
      res += sep + match[1];
      sep = " ";
    }
    pos = line.lastIndex;
  }
  const last = /[ \t]*(.*)/sy;
  last.lastIndex = pos;
  match = last.exec(source);
  return res + sep + ((match == null ? void 0 : match[1]) ?? "");
}
function doubleQuotedValue(source, onError) {
  let res = "";
  for (let i = 1; i < source.length - 1; ++i) {
    const ch = source[i];
    if (ch === "\r" && source[i + 1] === "\n")
      continue;
    if (ch === "\n") {
      const { fold, offset } = foldNewline(source, i);
      res += fold;
      i = offset;
    } else if (ch === "\\") {
      let next = source[++i];
      const cc = escapeCodes[next];
      if (cc)
        res += cc;
      else if (next === "\n") {
        next = source[i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
      } else if (next === "\r" && source[i + 1] === "\n") {
        next = source[++i + 1];
        while (next === " " || next === "	")
          next = source[++i + 1];
      } else if (next === "x" || next === "u" || next === "U") {
        const length = { x: 2, u: 4, U: 8 }[next];
        res += parseCharCode(source, i + 1, length, onError);
        i += length;
      } else {
        const raw = source.substr(i - 1, 2);
        onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        res += raw;
      }
    } else if (ch === " " || ch === "	") {
      const wsStart = i;
      let next = source[i + 1];
      while (next === " " || next === "	")
        next = source[++i + 1];
      if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n"))
        res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
    } else {
      res += ch;
    }
  }
  if (source[source.length - 1] !== '"' || source.length === 1)
    onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
  return res;
}
function foldNewline(source, offset) {
  let fold = "";
  let ch = source[offset + 1];
  while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
    if (ch === "\r" && source[offset + 2] !== "\n")
      break;
    if (ch === "\n")
      fold += "\n";
    offset += 1;
    ch = source[offset + 1];
  }
  if (!fold)
    fold = " ";
  return { fold, offset };
}
const escapeCodes = {
  "0": "\0",
  // null character
  a: "\x07",
  // bell character
  b: "\b",
  // backspace
  e: "\x1B",
  // escape character
  f: "\f",
  // form feed
  n: "\n",
  // line feed
  r: "\r",
  // carriage return
  t: "	",
  // horizontal tab
  v: "\v",
  // vertical tab
  N: "",
  // Unicode next line
  _: " ",
  // Unicode non-breaking space
  L: "\u2028",
  // Unicode line separator
  P: "\u2029",
  // Unicode paragraph separator
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	"
};
function parseCharCode(source, offset, length, onError) {
  const cc = source.substr(offset, length);
  const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
  const code = ok ? parseInt(cc, 16) : NaN;
  if (isNaN(code)) {
    const raw = source.substr(offset - 2, length + 2);
    onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
    return raw;
  }
  return String.fromCodePoint(code);
}
resolveFlowScalar$3.resolveFlowScalar = resolveFlowScalar$2;
var identity$4 = identity$x;
var Scalar$1 = Scalar$k;
var resolveBlockScalar$1 = resolveBlockScalar$3;
var resolveFlowScalar$1 = resolveFlowScalar$3;
function composeScalar$1(ctx, token, tagToken, onError) {
  const { value, type: type2, comment, range: range2 } = token.type === "block-scalar" ? resolveBlockScalar$1.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar$1.resolveFlowScalar(token, ctx.options.strict, onError);
  const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
  let tag;
  if (ctx.options.stringKeys && ctx.atKey) {
    tag = ctx.schema[identity$4.SCALAR];
  } else if (tagName)
    tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
  else if (token.type === "scalar")
    tag = findScalarTagByTest(ctx, value, token, onError);
  else
    tag = ctx.schema[identity$4.SCALAR];
  let scalar;
  try {
    const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
    scalar = identity$4.isScalar(res) ? res : new Scalar$1.Scalar(res);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
    scalar = new Scalar$1.Scalar(value);
  }
  scalar.range = range2;
  scalar.source = value;
  if (type2)
    scalar.type = type2;
  if (tagName)
    scalar.tag = tagName;
  if (tag.format)
    scalar.format = tag.format;
  if (comment)
    scalar.comment = comment;
  return scalar;
}
function findScalarTagByName(schema2, value, tagName, tagToken, onError) {
  var _a;
  if (tagName === "!")
    return schema2[identity$4.SCALAR];
  const matchWithTest = [];
  for (const tag of schema2.tags) {
    if (!tag.collection && tag.tag === tagName) {
      if (tag.default && tag.test)
        matchWithTest.push(tag);
      else
        return tag;
    }
  }
  for (const tag of matchWithTest)
    if ((_a = tag.test) == null ? void 0 : _a.test(value))
      return tag;
  const kt = schema2.knownTags[tagName];
  if (kt && !kt.collection) {
    schema2.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
    return kt;
  }
  onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
  return schema2[identity$4.SCALAR];
}
function findScalarTagByTest({ atKey, directives: directives2, schema: schema2 }, value, token, onError) {
  const tag = schema2.tags.find((tag2) => {
    var _a;
    return (tag2.default === true || atKey && tag2.default === "key") && ((_a = tag2.test) == null ? void 0 : _a.test(value));
  }) || schema2[identity$4.SCALAR];
  if (schema2.compat) {
    const compat = schema2.compat.find((tag2) => {
      var _a;
      return tag2.default && ((_a = tag2.test) == null ? void 0 : _a.test(value));
    }) ?? schema2[identity$4.SCALAR];
    if (tag.tag !== compat.tag) {
      const ts = directives2.tagString(tag.tag);
      const cs = directives2.tagString(compat.tag);
      const msg = `Value may be parsed as either ${ts} or ${cs}`;
      onError(token, "TAG_RESOLVE_FAILED", msg, true);
    }
  }
  return tag;
}
composeScalar$2.composeScalar = composeScalar$1;
var utilEmptyScalarPosition$1 = {};
function emptyScalarPosition(offset, before, pos) {
  if (before) {
    pos ?? (pos = before.length);
    for (let i = pos - 1; i >= 0; --i) {
      let st = before[i];
      switch (st.type) {
        case "space":
        case "comment":
        case "newline":
          offset -= st.source.length;
          continue;
      }
      st = before[++i];
      while ((st == null ? void 0 : st.type) === "space") {
        offset += st.source.length;
        st = before[++i];
      }
      break;
    }
  }
  return offset;
}
utilEmptyScalarPosition$1.emptyScalarPosition = emptyScalarPosition;
var Alias$1 = Alias$5;
var identity$3 = identity$x;
var composeCollection = composeCollection$2;
var composeScalar = composeScalar$2;
var resolveEnd$2 = resolveEnd$6;
var utilEmptyScalarPosition = utilEmptyScalarPosition$1;
const CN = { composeNode: composeNode$1, composeEmptyNode };
function composeNode$1(ctx, token, props, onError) {
  const atKey = ctx.atKey;
  const { spaceBefore, comment, anchor, tag } = props;
  let node2;
  let isSrcToken = true;
  switch (token.type) {
    case "alias":
      node2 = composeAlias(ctx, token, onError);
      if (anchor || tag)
        onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      node2 = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor)
        node2.anchor = anchor.source.substring(1);
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      node2 = composeCollection.composeCollection(CN, ctx, token, props, onError);
      if (anchor)
        node2.anchor = anchor.source.substring(1);
      break;
    default: {
      const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
      onError(token, "UNEXPECTED_TOKEN", message);
      node2 = composeEmptyNode(ctx, token.offset, void 0, null, props, onError);
      isSrcToken = false;
    }
  }
  if (anchor && node2.anchor === "")
    onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
  if (atKey && ctx.options.stringKeys && (!identity$3.isScalar(node2) || typeof node2.value !== "string" || node2.tag && node2.tag !== "tag:yaml.org,2002:str")) {
    const msg = "With stringKeys, all keys must be strings";
    onError(tag ?? token, "NON_STRING_KEY", msg);
  }
  if (spaceBefore)
    node2.spaceBefore = true;
  if (comment) {
    if (token.type === "scalar" && token.source === "")
      node2.comment = comment;
    else
      node2.commentBefore = comment;
  }
  if (ctx.options.keepSourceTokens && isSrcToken)
    node2.srcToken = token;
  return node2;
}
function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
  const token = {
    type: "scalar",
    offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
    indent: -1,
    source: ""
  };
  const node2 = composeScalar.composeScalar(ctx, token, tag, onError);
  if (anchor) {
    node2.anchor = anchor.source.substring(1);
    if (node2.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
  }
  if (spaceBefore)
    node2.spaceBefore = true;
  if (comment) {
    node2.comment = comment;
    node2.range[2] = end;
  }
  return node2;
}
function composeAlias({ options }, { offset, source, end }, onError) {
  const alias = new Alias$1.Alias(source.substring(1));
  if (alias.source === "")
    onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
  if (alias.source.endsWith(":"))
    onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
  const valueEnd = offset + source.length;
  const re = resolveEnd$2.resolveEnd(end, valueEnd, options.strict, onError);
  alias.range = [offset, valueEnd, re.offset];
  if (re.comment)
    alias.comment = re.comment;
  return alias;
}
composeNode$2.composeEmptyNode = composeEmptyNode;
composeNode$2.composeNode = composeNode$1;
var Document$3 = Document$5;
var composeNode = composeNode$2;
var resolveEnd$1 = resolveEnd$6;
var resolveProps = resolveProps$5;
function composeDoc$1(options, directives2, { offset, start, value, end }, onError) {
  const opts = Object.assign({ _directives: directives2 }, options);
  const doc = new Document$3.Document(void 0, opts);
  const ctx = {
    atKey: false,
    atRoot: true,
    directives: doc.directives,
    options: doc.options,
    schema: doc.schema
  };
  const props = resolveProps.resolveProps(start, {
    indicator: "doc-start",
    next: value ?? (end == null ? void 0 : end[0]),
    offset,
    onError,
    parentIndent: 0,
    startOnNewline: true
  });
  if (props.found) {
    doc.directives.docStart = true;
    if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
      onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
  }
  doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
  const contentEnd = doc.contents.range[2];
  const re = resolveEnd$1.resolveEnd(end, contentEnd, false, onError);
  if (re.comment)
    doc.comment = re.comment;
  doc.range = [offset, contentEnd, re.offset];
  return doc;
}
composeDoc$2.composeDoc = composeDoc$1;
var node_process$1 = require$$0$1;
var directives = directives$2;
var Document$2 = Document$5;
var errors$4 = errors$5;
var identity$2 = identity$x;
var composeDoc = composeDoc$2;
var resolveEnd = resolveEnd$6;
function getErrorPos(src2) {
  if (typeof src2 === "number")
    return [src2, src2 + 1];
  if (Array.isArray(src2))
    return src2.length === 2 ? src2 : [src2[0], src2[1]];
  const { offset, source } = src2;
  return [offset, offset + (typeof source === "string" ? source.length : 1)];
}
function parsePrelude(prelude) {
  var _a;
  let comment = "";
  let atComment = false;
  let afterEmptyLine = false;
  for (let i = 0; i < prelude.length; ++i) {
    const source = prelude[i];
    switch (source[0]) {
      case "#":
        comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
        atComment = true;
        afterEmptyLine = false;
        break;
      case "%":
        if (((_a = prelude[i + 1]) == null ? void 0 : _a[0]) !== "#")
          i += 1;
        atComment = false;
        break;
      default:
        if (!atComment)
          afterEmptyLine = true;
        atComment = false;
    }
  }
  return { comment, afterEmptyLine };
}
class Composer {
  constructor(options = {}) {
    this.doc = null;
    this.atDirectives = false;
    this.prelude = [];
    this.errors = [];
    this.warnings = [];
    this.onError = (source, code, message, warning) => {
      const pos = getErrorPos(source);
      if (warning)
        this.warnings.push(new errors$4.YAMLWarning(pos, code, message));
      else
        this.errors.push(new errors$4.YAMLParseError(pos, code, message));
    };
    this.directives = new directives.Directives({ version: options.version || "1.2" });
    this.options = options;
  }
  decorate(doc, afterDoc) {
    const { comment, afterEmptyLine } = parsePrelude(this.prelude);
    if (comment) {
      const dc = doc.contents;
      if (afterDoc) {
        doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
      } else if (afterEmptyLine || doc.directives.docStart || !dc) {
        doc.commentBefore = comment;
      } else if (identity$2.isCollection(dc) && !dc.flow && dc.items.length > 0) {
        let it = dc.items[0];
        if (identity$2.isPair(it))
          it = it.key;
        const cb = it.commentBefore;
        it.commentBefore = cb ? `${comment}
${cb}` : comment;
      } else {
        const cb = dc.commentBefore;
        dc.commentBefore = cb ? `${comment}
${cb}` : comment;
      }
    }
    if (afterDoc) {
      Array.prototype.push.apply(doc.errors, this.errors);
      Array.prototype.push.apply(doc.warnings, this.warnings);
    } else {
      doc.errors = this.errors;
      doc.warnings = this.warnings;
    }
    this.prelude = [];
    this.errors = [];
    this.warnings = [];
  }
  /**
   * Current stream status information.
   *
   * Mostly useful at the end of input for an empty stream.
   */
  streamInfo() {
    return {
      comment: parsePrelude(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  /**
   * Compose tokens into documents.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *compose(tokens, forceDoc = false, endOffset = -1) {
    for (const token of tokens)
      yield* this.next(token);
    yield* this.end(forceDoc, endOffset);
  }
  /** Advance the composer by one CST token. */
  *next(token) {
    if (node_process$1.env.LOG_STREAM)
      console.dir(token, { depth: null });
    switch (token.type) {
      case "directive":
        this.directives.add(token.source, (offset, message, warning) => {
          const pos = getErrorPos(token);
          pos[0] += offset;
          this.onError(pos, "BAD_DIRECTIVE", message, warning);
        });
        this.prelude.push(token.source);
        this.atDirectives = true;
        break;
      case "document": {
        const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
        if (this.atDirectives && !doc.directives.docStart)
          this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
        this.decorate(doc, false);
        if (this.doc)
          yield this.doc;
        this.doc = doc;
        this.atDirectives = false;
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(token.source);
        break;
      case "error": {
        const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
        const error = new errors$4.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
        if (this.atDirectives || !this.doc)
          this.errors.push(error);
        else
          this.doc.errors.push(error);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          const msg = "Unexpected doc-end without preceding document";
          this.errors.push(new errors$4.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
          break;
        }
        this.doc.directives.docEnd = true;
        const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
        this.decorate(this.doc, true);
        if (end.comment) {
          const dc = this.doc.comment;
          this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
        }
        this.doc.range[2] = end.offset;
        break;
      }
      default:
        this.errors.push(new errors$4.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
    }
  }
  /**
   * Call at end of input to yield any remaining document.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *end(forceDoc = false, endOffset = -1) {
    if (this.doc) {
      this.decorate(this.doc, true);
      yield this.doc;
      this.doc = null;
    } else if (forceDoc) {
      const opts = Object.assign({ _directives: this.directives }, this.options);
      const doc = new Document$2.Document(void 0, opts);
      if (this.atDirectives)
        this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
      doc.range = [0, endOffset, endOffset];
      this.decorate(doc, false);
      yield doc;
    }
  }
}
composer$2.Composer = Composer;
var cst$3 = {};
var cstScalar$1 = {};
var resolveBlockScalar = resolveBlockScalar$3;
var resolveFlowScalar = resolveFlowScalar$3;
var errors$3 = errors$5;
var stringifyString = stringifyString$5;
function resolveAsScalar(token, strict = true, onError) {
  if (token) {
    const _onError = (pos, code, message) => {
      const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
      if (onError)
        onError(offset, code, message);
      else
        throw new errors$3.YAMLParseError([offset, offset + 1], code, message);
    };
    switch (token.type) {
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
      case "block-scalar":
        return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
    }
  }
  return null;
}
function createScalarToken(value, context) {
  const { implicitKey = false, indent, inFlow = false, offset = -1, type: type2 = "PLAIN" } = context;
  const source = stringifyString.stringifyString({ type: type2, value }, {
    implicitKey,
    indent: indent > 0 ? " ".repeat(indent) : "",
    inFlow,
    options: { blockQuote: true, lineWidth: -1 }
  });
  const end = context.end ?? [
    { type: "newline", offset: -1, indent, source: "\n" }
  ];
  switch (source[0]) {
    case "|":
    case ">": {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      const props = [
        { type: "block-scalar-header", offset, indent, source: head }
      ];
      if (!addEndtoBlockProps(props, end))
        props.push({ type: "newline", offset: -1, indent, source: "\n" });
      return { type: "block-scalar", offset, indent, props, source: body };
    }
    case '"':
      return { type: "double-quoted-scalar", offset, indent, source, end };
    case "'":
      return { type: "single-quoted-scalar", offset, indent, source, end };
    default:
      return { type: "scalar", offset, indent, source, end };
  }
}
function setScalarValue(token, value, context = {}) {
  let { afterKey = false, implicitKey = false, inFlow = false, type: type2 } = context;
  let indent = "indent" in token ? token.indent : null;
  if (afterKey && typeof indent === "number")
    indent += 2;
  if (!type2)
    switch (token.type) {
      case "single-quoted-scalar":
        type2 = "QUOTE_SINGLE";
        break;
      case "double-quoted-scalar":
        type2 = "QUOTE_DOUBLE";
        break;
      case "block-scalar": {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        type2 = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
        break;
      }
      default:
        type2 = "PLAIN";
    }
  const source = stringifyString.stringifyString({ type: type2, value }, {
    implicitKey: implicitKey || indent === null,
    indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
    inFlow,
    options: { blockQuote: true, lineWidth: -1 }
  });
  switch (source[0]) {
    case "|":
    case ">":
      setBlockScalarValue(token, source);
      break;
    case '"':
      setFlowScalarValue(token, source, "double-quoted-scalar");
      break;
    case "'":
      setFlowScalarValue(token, source, "single-quoted-scalar");
      break;
    default:
      setFlowScalarValue(token, source, "scalar");
  }
}
function setBlockScalarValue(token, source) {
  const he = source.indexOf("\n");
  const head = source.substring(0, he);
  const body = source.substring(he + 1) + "\n";
  if (token.type === "block-scalar") {
    const header = token.props[0];
    if (header.type !== "block-scalar-header")
      throw new Error("Invalid block scalar header");
    header.source = head;
    token.source = body;
  } else {
    const { offset } = token;
    const indent = "indent" in token ? token.indent : -1;
    const props = [
      { type: "block-scalar-header", offset, indent, source: head }
    ];
    if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
      props.push({ type: "newline", offset: -1, indent, source: "\n" });
    for (const key of Object.keys(token))
      if (key !== "type" && key !== "offset")
        delete token[key];
    Object.assign(token, { type: "block-scalar", indent, props, source: body });
  }
}
function addEndtoBlockProps(props, end) {
  if (end)
    for (const st of end)
      switch (st.type) {
        case "space":
        case "comment":
          props.push(st);
          break;
        case "newline":
          props.push(st);
          return true;
      }
  return false;
}
function setFlowScalarValue(token, source, type2) {
  switch (token.type) {
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      token.type = type2;
      token.source = source;
      break;
    case "block-scalar": {
      const end = token.props.slice(1);
      let oa = source.length;
      if (token.props[0].type === "block-scalar-header")
        oa -= token.props[0].source.length;
      for (const tok of end)
        tok.offset += oa;
      delete token.props;
      Object.assign(token, { type: type2, source, end });
      break;
    }
    case "block-map":
    case "block-seq": {
      const offset = token.offset + source.length;
      const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
      delete token.items;
      Object.assign(token, { type: type2, source, end: [nl] });
      break;
    }
    default: {
      const indent = "indent" in token ? token.indent : -1;
      const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
      for (const key of Object.keys(token))
        if (key !== "type" && key !== "offset")
          delete token[key];
      Object.assign(token, { type: type2, indent, source, end });
    }
  }
}
cstScalar$1.createScalarToken = createScalarToken;
cstScalar$1.resolveAsScalar = resolveAsScalar;
cstScalar$1.setScalarValue = setScalarValue;
var cstStringify$1 = {};
const stringify$1 = (cst2) => "type" in cst2 ? stringifyToken(cst2) : stringifyItem(cst2);
function stringifyToken(token) {
  switch (token.type) {
    case "block-scalar": {
      let res = "";
      for (const tok of token.props)
        res += stringifyToken(tok);
      return res + token.source;
    }
    case "block-map":
    case "block-seq": {
      let res = "";
      for (const item of token.items)
        res += stringifyItem(item);
      return res;
    }
    case "flow-collection": {
      let res = token.start.source;
      for (const item of token.items)
        res += stringifyItem(item);
      for (const st of token.end)
        res += st.source;
      return res;
    }
    case "document": {
      let res = stringifyItem(token);
      if (token.end)
        for (const st of token.end)
          res += st.source;
      return res;
    }
    default: {
      let res = token.source;
      if ("end" in token && token.end)
        for (const st of token.end)
          res += st.source;
      return res;
    }
  }
}
function stringifyItem({ start, key, sep, value }) {
  let res = "";
  for (const st of start)
    res += st.source;
  if (key)
    res += stringifyToken(key);
  if (sep)
    for (const st of sep)
      res += st.source;
  if (value)
    res += stringifyToken(value);
  return res;
}
cstStringify$1.stringify = stringify$1;
var cstVisit$1 = {};
const BREAK = Symbol("break visit");
const SKIP = Symbol("skip children");
const REMOVE = Symbol("remove item");
function visit$1(cst2, visitor) {
  if ("type" in cst2 && cst2.type === "document")
    cst2 = { start: cst2.start, value: cst2.value };
  _visit(Object.freeze([]), cst2, visitor);
}
visit$1.BREAK = BREAK;
visit$1.SKIP = SKIP;
visit$1.REMOVE = REMOVE;
visit$1.itemAtPath = (cst2, path2) => {
  let item = cst2;
  for (const [field, index] of path2) {
    const tok = item == null ? void 0 : item[field];
    if (tok && "items" in tok) {
      item = tok.items[index];
    } else
      return void 0;
  }
  return item;
};
visit$1.parentCollection = (cst2, path2) => {
  const parent = visit$1.itemAtPath(cst2, path2.slice(0, -1));
  const field = path2[path2.length - 1][0];
  const coll = parent == null ? void 0 : parent[field];
  if (coll && "items" in coll)
    return coll;
  throw new Error("Parent collection not found");
};
function _visit(path2, item, visitor) {
  let ctrl = visitor(item, path2);
  if (typeof ctrl === "symbol")
    return ctrl;
  for (const field of ["key", "value"]) {
    const token = item[field];
    if (token && "items" in token) {
      for (let i = 0; i < token.items.length; ++i) {
        const ci = _visit(Object.freeze(path2.concat([[field, i]])), token.items[i], visitor);
        if (typeof ci === "number")
          i = ci - 1;
        else if (ci === BREAK)
          return BREAK;
        else if (ci === REMOVE) {
          token.items.splice(i, 1);
          i -= 1;
        }
      }
      if (typeof ctrl === "function" && field === "key")
        ctrl = ctrl(item, path2);
    }
  }
  return typeof ctrl === "function" ? ctrl(item, path2) : ctrl;
}
cstVisit$1.visit = visit$1;
var cstScalar = cstScalar$1;
var cstStringify = cstStringify$1;
var cstVisit = cstVisit$1;
const BOM = "\uFEFF";
const DOCUMENT = "";
const FLOW_END = "";
const SCALAR = "";
const isCollection = (token) => !!token && "items" in token;
const isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
function prettyToken(token) {
  switch (token) {
    case BOM:
      return "<BOM>";
    case DOCUMENT:
      return "<DOC>";
    case FLOW_END:
      return "<FLOW_END>";
    case SCALAR:
      return "<SCALAR>";
    default:
      return JSON.stringify(token);
  }
}
function tokenType(source) {
  switch (source) {
    case BOM:
      return "byte-order-mark";
    case DOCUMENT:
      return "doc-mode";
    case FLOW_END:
      return "flow-error-end";
    case SCALAR:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case "\n":
    case "\r\n":
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (source[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}
cst$3.createScalarToken = cstScalar.createScalarToken;
cst$3.resolveAsScalar = cstScalar.resolveAsScalar;
cst$3.setScalarValue = cstScalar.setScalarValue;
cst$3.stringify = cstStringify.stringify;
cst$3.visit = cstVisit.visit;
cst$3.BOM = BOM;
cst$3.DOCUMENT = DOCUMENT;
cst$3.FLOW_END = FLOW_END;
cst$3.SCALAR = SCALAR;
cst$3.isCollection = isCollection;
cst$3.isScalar = isScalar;
cst$3.prettyToken = prettyToken;
cst$3.tokenType = tokenType;
var lexer$2 = {};
var cst$2 = cst$3;
function isEmpty(ch) {
  switch (ch) {
    case void 0:
    case " ":
    case "\n":
    case "\r":
    case "	":
      return true;
    default:
      return false;
  }
}
const hexDigits = new Set("0123456789ABCDEFabcdef");
const tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
const flowIndicatorChars = new Set(",[]{}");
const invalidAnchorChars = new Set(" ,[]{}\n\r	");
const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
class Lexer {
  constructor() {
    this.atEnd = false;
    this.blockScalarIndent = -1;
    this.blockScalarKeep = false;
    this.buffer = "";
    this.flowKey = false;
    this.flowLevel = 0;
    this.indentNext = 0;
    this.indentValue = 0;
    this.lineEndPos = null;
    this.next = null;
    this.pos = 0;
  }
  /**
   * Generate YAML tokens from the `source` string. If `incomplete`,
   * a part of the last line may be left as a buffer for the next call.
   *
   * @returns A generator of lexical tokens
   */
  *lex(source, incomplete = false) {
    if (source) {
      if (typeof source !== "string")
        throw TypeError("source is not a string");
      this.buffer = this.buffer ? this.buffer + source : source;
      this.lineEndPos = null;
    }
    this.atEnd = !incomplete;
    let next = this.next ?? "stream";
    while (next && (incomplete || this.hasChars(1)))
      next = yield* this.parseNext(next);
  }
  atLineEnd() {
    let i = this.pos;
    let ch = this.buffer[i];
    while (ch === " " || ch === "	")
      ch = this.buffer[++i];
    if (!ch || ch === "#" || ch === "\n")
      return true;
    if (ch === "\r")
      return this.buffer[i + 1] === "\n";
    return false;
  }
  charAt(n) {
    return this.buffer[this.pos + n];
  }
  continueScalar(offset) {
    let ch = this.buffer[offset];
    if (this.indentNext > 0) {
      let indent = 0;
      while (ch === " ")
        ch = this.buffer[++indent + offset];
      if (ch === "\r") {
        const next = this.buffer[indent + offset + 1];
        if (next === "\n" || !next && !this.atEnd)
          return offset + indent + 1;
      }
      return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
    }
    if (ch === "-" || ch === ".") {
      const dt = this.buffer.substr(offset, 3);
      if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
        return -1;
    }
    return offset;
  }
  getLine() {
    let end = this.lineEndPos;
    if (typeof end !== "number" || end !== -1 && end < this.pos) {
      end = this.buffer.indexOf("\n", this.pos);
      this.lineEndPos = end;
    }
    if (end === -1)
      return this.atEnd ? this.buffer.substring(this.pos) : null;
    if (this.buffer[end - 1] === "\r")
      end -= 1;
    return this.buffer.substring(this.pos, end);
  }
  hasChars(n) {
    return this.pos + n <= this.buffer.length;
  }
  setNext(state2) {
    this.buffer = this.buffer.substring(this.pos);
    this.pos = 0;
    this.lineEndPos = null;
    this.next = state2;
    return null;
  }
  peek(n) {
    return this.buffer.substr(this.pos, n);
  }
  *parseNext(next) {
    switch (next) {
      case "stream":
        return yield* this.parseStream();
      case "line-start":
        return yield* this.parseLineStart();
      case "block-start":
        return yield* this.parseBlockStart();
      case "doc":
        return yield* this.parseDocument();
      case "flow":
        return yield* this.parseFlowCollection();
      case "quoted-scalar":
        return yield* this.parseQuotedScalar();
      case "block-scalar":
        return yield* this.parseBlockScalar();
      case "plain-scalar":
        return yield* this.parsePlainScalar();
    }
  }
  *parseStream() {
    let line = this.getLine();
    if (line === null)
      return this.setNext("stream");
    if (line[0] === cst$2.BOM) {
      yield* this.pushCount(1);
      line = line.substring(1);
    }
    if (line[0] === "%") {
      let dirEnd = line.length;
      let cs = line.indexOf("#");
      while (cs !== -1) {
        const ch = line[cs - 1];
        if (ch === " " || ch === "	") {
          dirEnd = cs - 1;
          break;
        } else {
          cs = line.indexOf("#", cs + 1);
        }
      }
      while (true) {
        const ch = line[dirEnd - 1];
        if (ch === " " || ch === "	")
          dirEnd -= 1;
        else
          break;
      }
      const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
      yield* this.pushCount(line.length - n);
      this.pushNewline();
      return "stream";
    }
    if (this.atLineEnd()) {
      const sp = yield* this.pushSpaces(true);
      yield* this.pushCount(line.length - sp);
      yield* this.pushNewline();
      return "stream";
    }
    yield cst$2.DOCUMENT;
    return yield* this.parseLineStart();
  }
  *parseLineStart() {
    const ch = this.charAt(0);
    if (!ch && !this.atEnd)
      return this.setNext("line-start");
    if (ch === "-" || ch === ".") {
      if (!this.atEnd && !this.hasChars(4))
        return this.setNext("line-start");
      const s = this.peek(3);
      if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
        yield* this.pushCount(3);
        this.indentValue = 0;
        this.indentNext = 0;
        return s === "---" ? "doc" : "stream";
      }
    }
    this.indentValue = yield* this.pushSpaces(false);
    if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
      this.indentNext = this.indentValue;
    return yield* this.parseBlockStart();
  }
  *parseBlockStart() {
    const [ch0, ch1] = this.peek(2);
    if (!ch1 && !this.atEnd)
      return this.setNext("block-start");
    if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
      const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
      this.indentNext = this.indentValue + 1;
      this.indentValue += n;
      return yield* this.parseBlockStart();
    }
    return "doc";
  }
  *parseDocument() {
    yield* this.pushSpaces(true);
    const line = this.getLine();
    if (line === null)
      return this.setNext("doc");
    let n = yield* this.pushIndicators();
    switch (line[n]) {
      case "#":
        yield* this.pushCount(line.length - n);
      case void 0:
        yield* this.pushNewline();
        return yield* this.parseLineStart();
      case "{":
      case "[":
        yield* this.pushCount(1);
        this.flowKey = false;
        this.flowLevel = 1;
        return "flow";
      case "}":
      case "]":
        yield* this.pushCount(1);
        return "doc";
      case "*":
        yield* this.pushUntil(isNotAnchorChar);
        return "doc";
      case '"':
      case "'":
        return yield* this.parseQuotedScalar();
      case "|":
      case ">":
        n += yield* this.parseBlockScalarHeader();
        n += yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - n);
        yield* this.pushNewline();
        return yield* this.parseBlockScalar();
      default:
        return yield* this.parsePlainScalar();
    }
  }
  *parseFlowCollection() {
    let nl, sp;
    let indent = -1;
    do {
      nl = yield* this.pushNewline();
      if (nl > 0) {
        sp = yield* this.pushSpaces(false);
        this.indentValue = indent = sp;
      } else {
        sp = 0;
      }
      sp += yield* this.pushSpaces(true);
    } while (nl + sp > 0);
    const line = this.getLine();
    if (line === null)
      return this.setNext("flow");
    if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
      const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
      if (!atFlowEndMarker) {
        this.flowLevel = 0;
        yield cst$2.FLOW_END;
        return yield* this.parseLineStart();
      }
    }
    let n = 0;
    while (line[n] === ",") {
      n += yield* this.pushCount(1);
      n += yield* this.pushSpaces(true);
      this.flowKey = false;
    }
    n += yield* this.pushIndicators();
    switch (line[n]) {
      case void 0:
        return "flow";
      case "#":
        yield* this.pushCount(line.length - n);
        return "flow";
      case "{":
      case "[":
        yield* this.pushCount(1);
        this.flowKey = false;
        this.flowLevel += 1;
        return "flow";
      case "}":
      case "]":
        yield* this.pushCount(1);
        this.flowKey = true;
        this.flowLevel -= 1;
        return this.flowLevel ? "flow" : "doc";
      case "*":
        yield* this.pushUntil(isNotAnchorChar);
        return "flow";
      case '"':
      case "'":
        this.flowKey = true;
        return yield* this.parseQuotedScalar();
      case ":": {
        const next = this.charAt(1);
        if (this.flowKey || isEmpty(next) || next === ",") {
          this.flowKey = false;
          yield* this.pushCount(1);
          yield* this.pushSpaces(true);
          return "flow";
        }
      }
      default:
        this.flowKey = false;
        return yield* this.parsePlainScalar();
    }
  }
  *parseQuotedScalar() {
    const quote = this.charAt(0);
    let end = this.buffer.indexOf(quote, this.pos + 1);
    if (quote === "'") {
      while (end !== -1 && this.buffer[end + 1] === "'")
        end = this.buffer.indexOf("'", end + 2);
    } else {
      while (end !== -1) {
        let n = 0;
        while (this.buffer[end - 1 - n] === "\\")
          n += 1;
        if (n % 2 === 0)
          break;
        end = this.buffer.indexOf('"', end + 1);
      }
    }
    const qb = this.buffer.substring(0, end);
    let nl = qb.indexOf("\n", this.pos);
    if (nl !== -1) {
      while (nl !== -1) {
        const cs = this.continueScalar(nl + 1);
        if (cs === -1)
          break;
        nl = qb.indexOf("\n", cs);
      }
      if (nl !== -1) {
        end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
      }
    }
    if (end === -1) {
      if (!this.atEnd)
        return this.setNext("quoted-scalar");
      end = this.buffer.length;
    }
    yield* this.pushToIndex(end + 1, false);
    return this.flowLevel ? "flow" : "doc";
  }
  *parseBlockScalarHeader() {
    this.blockScalarIndent = -1;
    this.blockScalarKeep = false;
    let i = this.pos;
    while (true) {
      const ch = this.buffer[++i];
      if (ch === "+")
        this.blockScalarKeep = true;
      else if (ch > "0" && ch <= "9")
        this.blockScalarIndent = Number(ch) - 1;
      else if (ch !== "-")
        break;
    }
    return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
  }
  *parseBlockScalar() {
    let nl = this.pos - 1;
    let indent = 0;
    let ch;
    loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
      switch (ch) {
        case " ":
          indent += 1;
          break;
        case "\n":
          nl = i2;
          indent = 0;
          break;
        case "\r": {
          const next = this.buffer[i2 + 1];
          if (!next && !this.atEnd)
            return this.setNext("block-scalar");
          if (next === "\n")
            break;
        }
        default:
          break loop;
      }
    }
    if (!ch && !this.atEnd)
      return this.setNext("block-scalar");
    if (indent >= this.indentNext) {
      if (this.blockScalarIndent === -1)
        this.indentNext = indent;
      else {
        this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
      }
      do {
        const cs = this.continueScalar(nl + 1);
        if (cs === -1)
          break;
        nl = this.buffer.indexOf("\n", cs);
      } while (nl !== -1);
      if (nl === -1) {
        if (!this.atEnd)
          return this.setNext("block-scalar");
        nl = this.buffer.length;
      }
    }
    let i = nl + 1;
    ch = this.buffer[i];
    while (ch === " ")
      ch = this.buffer[++i];
    if (ch === "	") {
      while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
        ch = this.buffer[++i];
      nl = i - 1;
    } else if (!this.blockScalarKeep) {
      do {
        let i2 = nl - 1;
        let ch2 = this.buffer[i2];
        if (ch2 === "\r")
          ch2 = this.buffer[--i2];
        const lastChar = i2;
        while (ch2 === " ")
          ch2 = this.buffer[--i2];
        if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent > lastChar)
          nl = i2;
        else
          break;
      } while (true);
    }
    yield cst$2.SCALAR;
    yield* this.pushToIndex(nl + 1, true);
    return yield* this.parseLineStart();
  }
  *parsePlainScalar() {
    const inFlow = this.flowLevel > 0;
    let end = this.pos - 1;
    let i = this.pos - 1;
    let ch;
    while (ch = this.buffer[++i]) {
      if (ch === ":") {
        const next = this.buffer[i + 1];
        if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
          break;
        end = i;
      } else if (isEmpty(ch)) {
        let next = this.buffer[i + 1];
        if (ch === "\r") {
          if (next === "\n") {
            i += 1;
            ch = "\n";
            next = this.buffer[i + 1];
          } else
            end = i;
        }
        if (next === "#" || inFlow && flowIndicatorChars.has(next))
          break;
        if (ch === "\n") {
          const cs = this.continueScalar(i + 1);
          if (cs === -1)
            break;
          i = Math.max(i, cs - 2);
        }
      } else {
        if (inFlow && flowIndicatorChars.has(ch))
          break;
        end = i;
      }
    }
    if (!ch && !this.atEnd)
      return this.setNext("plain-scalar");
    yield cst$2.SCALAR;
    yield* this.pushToIndex(end + 1, true);
    return inFlow ? "flow" : "doc";
  }
  *pushCount(n) {
    if (n > 0) {
      yield this.buffer.substr(this.pos, n);
      this.pos += n;
      return n;
    }
    return 0;
  }
  *pushToIndex(i, allowEmpty) {
    const s = this.buffer.slice(this.pos, i);
    if (s) {
      yield s;
      this.pos += s.length;
      return s.length;
    } else if (allowEmpty)
      yield "";
    return 0;
  }
  *pushIndicators() {
    switch (this.charAt(0)) {
      case "!":
        return (yield* this.pushTag()) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
      case "&":
        return (yield* this.pushUntil(isNotAnchorChar)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
      case "-":
      case "?":
      case ":": {
        const inFlow = this.flowLevel > 0;
        const ch1 = this.charAt(1);
        if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
          if (!inFlow)
            this.indentNext = this.indentValue + 1;
          else if (this.flowKey)
            this.flowKey = false;
          return (yield* this.pushCount(1)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
        }
      }
    }
    return 0;
  }
  *pushTag() {
    if (this.charAt(1) === "<") {
      let i = this.pos + 2;
      let ch = this.buffer[i];
      while (!isEmpty(ch) && ch !== ">")
        ch = this.buffer[++i];
      return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
    } else {
      let i = this.pos + 1;
      let ch = this.buffer[i];
      while (ch) {
        if (tagChars.has(ch))
          ch = this.buffer[++i];
        else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
          ch = this.buffer[i += 3];
        } else
          break;
      }
      return yield* this.pushToIndex(i, false);
    }
  }
  *pushNewline() {
    const ch = this.buffer[this.pos];
    if (ch === "\n")
      return yield* this.pushCount(1);
    else if (ch === "\r" && this.charAt(1) === "\n")
      return yield* this.pushCount(2);
    else
      return 0;
  }
  *pushSpaces(allowTabs) {
    let i = this.pos - 1;
    let ch;
    do {
      ch = this.buffer[++i];
    } while (ch === " " || allowTabs && ch === "	");
    const n = i - this.pos;
    if (n > 0) {
      yield this.buffer.substr(this.pos, n);
      this.pos = i;
    }
    return n;
  }
  *pushUntil(test2) {
    let i = this.pos;
    let ch = this.buffer[i];
    while (!test2(ch))
      ch = this.buffer[++i];
    return yield* this.pushToIndex(i, false);
  }
}
lexer$2.Lexer = Lexer;
var lineCounter$2 = {};
class LineCounter {
  constructor() {
    this.lineStarts = [];
    this.addNewLine = (offset) => this.lineStarts.push(offset);
    this.linePos = (offset) => {
      let low = 0;
      let high = this.lineStarts.length;
      while (low < high) {
        const mid = low + high >> 1;
        if (this.lineStarts[mid] < offset)
          low = mid + 1;
        else
          high = mid;
      }
      if (this.lineStarts[low] === offset)
        return { line: low + 1, col: 1 };
      if (low === 0)
        return { line: 0, col: offset };
      const start = this.lineStarts[low - 1];
      return { line: low, col: offset - start + 1 };
    };
  }
}
lineCounter$2.LineCounter = LineCounter;
var parser$2 = {};
var node_process = require$$0$1;
var cst$1 = cst$3;
var lexer$1 = lexer$2;
function includesToken(list, type2) {
  for (let i = 0; i < list.length; ++i)
    if (list[i].type === type2)
      return true;
  return false;
}
function findNonEmptyIndex(list) {
  for (let i = 0; i < list.length; ++i) {
    switch (list[i].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return i;
    }
  }
  return -1;
}
function isFlowToken(token) {
  switch (token == null ? void 0 : token.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return true;
    default:
      return false;
  }
}
function getPrevProps(parent) {
  switch (parent.type) {
    case "document":
      return parent.start;
    case "block-map": {
      const it = parent.items[parent.items.length - 1];
      return it.sep ?? it.start;
    }
    case "block-seq":
      return parent.items[parent.items.length - 1].start;
    default:
      return [];
  }
}
function getFirstKeyStartProps(prev) {
  var _a;
  if (prev.length === 0)
    return [];
  let i = prev.length;
  loop: while (--i >= 0) {
    switch (prev[i].type) {
      case "doc-start":
      case "explicit-key-ind":
      case "map-value-ind":
      case "seq-item-ind":
      case "newline":
        break loop;
    }
  }
  while (((_a = prev[++i]) == null ? void 0 : _a.type) === "space") {
  }
  return prev.splice(i, prev.length);
}
function fixFlowSeqItems(fc) {
  if (fc.start.type === "flow-seq-start") {
    for (const it of fc.items) {
      if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
        if (it.key)
          it.value = it.key;
        delete it.key;
        if (isFlowToken(it.value)) {
          if (it.value.end)
            Array.prototype.push.apply(it.value.end, it.sep);
          else
            it.value.end = it.sep;
        } else
          Array.prototype.push.apply(it.start, it.sep);
        delete it.sep;
      }
    }
  }
}
class Parser {
  /**
   * @param onNewLine - If defined, called separately with the start position of
   *   each new line (in `parse()`, including the start of input).
   */
  constructor(onNewLine) {
    this.atNewLine = true;
    this.atScalar = false;
    this.indent = 0;
    this.offset = 0;
    this.onKeyLine = false;
    this.stack = [];
    this.source = "";
    this.type = "";
    this.lexer = new lexer$1.Lexer();
    this.onNewLine = onNewLine;
  }
  /**
   * Parse `source` as a YAML stream.
   * If `incomplete`, a part of the last line may be left as a buffer for the next call.
   *
   * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
   *
   * @returns A generator of tokens representing each directive, document, and other structure.
   */
  *parse(source, incomplete = false) {
    if (this.onNewLine && this.offset === 0)
      this.onNewLine(0);
    for (const lexeme of this.lexer.lex(source, incomplete))
      yield* this.next(lexeme);
    if (!incomplete)
      yield* this.end();
  }
  /**
   * Advance the parser by the `source` of one lexical token.
   */
  *next(source) {
    this.source = source;
    if (node_process.env.LOG_TOKENS)
      console.log("|", cst$1.prettyToken(source));
    if (this.atScalar) {
      this.atScalar = false;
      yield* this.step();
      this.offset += source.length;
      return;
    }
    const type2 = cst$1.tokenType(source);
    if (!type2) {
      const message = `Not a YAML token: ${source}`;
      yield* this.pop({ type: "error", offset: this.offset, message, source });
      this.offset += source.length;
    } else if (type2 === "scalar") {
      this.atNewLine = false;
      this.atScalar = true;
      this.type = "scalar";
    } else {
      this.type = type2;
      yield* this.step();
      switch (type2) {
        case "newline":
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine)
            this.onNewLine(this.offset + source.length);
          break;
        case "space":
          if (this.atNewLine && source[0] === " ")
            this.indent += source.length;
          break;
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
          if (this.atNewLine)
            this.indent += source.length;
          break;
        case "doc-mode":
        case "flow-error-end":
          return;
        default:
          this.atNewLine = false;
      }
      this.offset += source.length;
    }
  }
  /** Call at end of input to push out any remaining constructions */
  *end() {
    while (this.stack.length > 0)
      yield* this.pop();
  }
  get sourceToken() {
    const st = {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
    return st;
  }
  *step() {
    const top = this.peek(1);
    if (this.type === "doc-end" && (top == null ? void 0 : top.type) !== "doc-end") {
      while (this.stack.length > 0)
        yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source
      });
      return;
    }
    if (!top)
      return yield* this.stream();
    switch (top.type) {
      case "document":
        return yield* this.document(top);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(top);
      case "block-scalar":
        return yield* this.blockScalar(top);
      case "block-map":
        return yield* this.blockMap(top);
      case "block-seq":
        return yield* this.blockSequence(top);
      case "flow-collection":
        return yield* this.flowCollection(top);
      case "doc-end":
        return yield* this.documentEnd(top);
    }
    yield* this.pop();
  }
  peek(n) {
    return this.stack[this.stack.length - n];
  }
  *pop(error) {
    const token = error ?? this.stack.pop();
    if (!token) {
      const message = "Tried to pop an empty stack";
      yield { type: "error", offset: this.offset, source: "", message };
    } else if (this.stack.length === 0) {
      yield token;
    } else {
      const top = this.peek(1);
      if (token.type === "block-scalar") {
        token.indent = "indent" in top ? top.indent : 0;
      } else if (token.type === "flow-collection" && top.type === "document") {
        token.indent = 0;
      }
      if (token.type === "flow-collection")
        fixFlowSeqItems(token);
      switch (top.type) {
        case "document":
          top.value = token;
          break;
        case "block-scalar":
          top.props.push(token);
          break;
        case "block-map": {
          const it = top.items[top.items.length - 1];
          if (it.value) {
            top.items.push({ start: [], key: token, sep: [] });
            this.onKeyLine = true;
            return;
          } else if (it.sep) {
            it.value = token;
          } else {
            Object.assign(it, { key: token, sep: [] });
            this.onKeyLine = !it.explicitKey;
            return;
          }
          break;
        }
        case "block-seq": {
          const it = top.items[top.items.length - 1];
          if (it.value)
            top.items.push({ start: [], value: token });
          else
            it.value = token;
          break;
        }
        case "flow-collection": {
          const it = top.items[top.items.length - 1];
          if (!it || it.value)
            top.items.push({ start: [], key: token, sep: [] });
          else if (it.sep)
            it.value = token;
          else
            Object.assign(it, { key: token, sep: [] });
          return;
        }
        default:
          yield* this.pop();
          yield* this.pop(token);
      }
      if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
        const last = token.items[token.items.length - 1];
        if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
          if (top.type === "document")
            top.end = last.start;
          else
            top.items.push({ start: last.start });
          token.items.splice(-1, 1);
        }
      }
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        const doc = {
          type: "document",
          offset: this.offset,
          start: []
        };
        if (this.type === "doc-start")
          doc.start.push(this.sourceToken);
        this.stack.push(doc);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source
    };
  }
  *document(doc) {
    if (doc.value)
      return yield* this.lineEnd(doc);
    switch (this.type) {
      case "doc-start": {
        if (findNonEmptyIndex(doc.start) !== -1) {
          yield* this.pop();
          yield* this.step();
        } else
          doc.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        doc.start.push(this.sourceToken);
        return;
    }
    const bv = this.startBlockValue(doc);
    if (bv)
      this.stack.push(bv);
    else {
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML document`,
        source: this.source
      };
    }
  }
  *scalar(scalar) {
    if (this.type === "map-value-ind") {
      const prev = getPrevProps(this.peek(2));
      const start = getFirstKeyStartProps(prev);
      let sep;
      if (scalar.end) {
        sep = scalar.end;
        sep.push(this.sourceToken);
        delete scalar.end;
      } else
        sep = [this.sourceToken];
      const map2 = {
        type: "block-map",
        offset: scalar.offset,
        indent: scalar.indent,
        items: [{ start, key: scalar, sep }]
      };
      this.onKeyLine = true;
      this.stack[this.stack.length - 1] = map2;
    } else
      yield* this.lineEnd(scalar);
  }
  *blockScalar(scalar) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        scalar.props.push(this.sourceToken);
        return;
      case "scalar":
        scalar.source = this.source;
        this.atNewLine = true;
        this.indent = 0;
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        yield* this.pop();
        break;
      default:
        yield* this.pop();
        yield* this.step();
    }
  }
  *blockMap(map2) {
    var _a;
    const it = map2.items[map2.items.length - 1];
    switch (this.type) {
      case "newline":
        this.onKeyLine = false;
        if (it.value) {
          const end = "end" in it.value ? it.value.end : void 0;
          const last = Array.isArray(end) ? end[end.length - 1] : void 0;
          if ((last == null ? void 0 : last.type) === "comment")
            end == null ? void 0 : end.push(this.sourceToken);
          else
            map2.items.push({ start: [this.sourceToken] });
        } else if (it.sep) {
          it.sep.push(this.sourceToken);
        } else {
          it.start.push(this.sourceToken);
        }
        return;
      case "space":
      case "comment":
        if (it.value) {
          map2.items.push({ start: [this.sourceToken] });
        } else if (it.sep) {
          it.sep.push(this.sourceToken);
        } else {
          if (this.atIndentedComment(it.start, map2.indent)) {
            const prev = map2.items[map2.items.length - 2];
            const end = (_a = prev == null ? void 0 : prev.value) == null ? void 0 : _a.end;
            if (Array.isArray(end)) {
              Array.prototype.push.apply(end, it.start);
              end.push(this.sourceToken);
              map2.items.pop();
              return;
            }
          }
          it.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= map2.indent) {
      const atMapIndent = !this.onKeyLine && this.indent === map2.indent;
      const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
      let start = [];
      if (atNextItem && it.sep && !it.value) {
        const nl = [];
        for (let i = 0; i < it.sep.length; ++i) {
          const st = it.sep[i];
          switch (st.type) {
            case "newline":
              nl.push(i);
              break;
            case "space":
              break;
            case "comment":
              if (st.indent > map2.indent)
                nl.length = 0;
              break;
            default:
              nl.length = 0;
          }
        }
        if (nl.length >= 2)
          start = it.sep.splice(nl[1]);
      }
      switch (this.type) {
        case "anchor":
        case "tag":
          if (atNextItem || it.value) {
            start.push(this.sourceToken);
            map2.items.push({ start });
            this.onKeyLine = true;
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            it.start.push(this.sourceToken);
          }
          return;
        case "explicit-key-ind":
          if (!it.sep && !it.explicitKey) {
            it.start.push(this.sourceToken);
            it.explicitKey = true;
          } else if (atNextItem || it.value) {
            start.push(this.sourceToken);
            map2.items.push({ start, explicitKey: true });
          } else {
            this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken], explicitKey: true }]
            });
          }
          this.onKeyLine = true;
          return;
        case "map-value-ind":
          if (it.explicitKey) {
            if (!it.sep) {
              if (includesToken(it.start, "newline")) {
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              } else {
                const start2 = getFirstKeyStartProps(it.start);
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                });
              }
            } else if (it.value) {
              map2.items.push({ start: [], key: null, sep: [this.sourceToken] });
            } else if (includesToken(it.sep, "map-value-ind")) {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start, key: null, sep: [this.sourceToken] }]
              });
            } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
              const start2 = getFirstKeyStartProps(it.start);
              const key = it.key;
              const sep = it.sep;
              sep.push(this.sourceToken);
              delete it.key;
              delete it.sep;
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: start2, key, sep }]
              });
            } else if (start.length > 0) {
              it.sep = it.sep.concat(start, this.sourceToken);
            } else {
              it.sep.push(this.sourceToken);
            }
          } else {
            if (!it.sep) {
              Object.assign(it, { key: null, sep: [this.sourceToken] });
            } else if (it.value || atNextItem) {
              map2.items.push({ start, key: null, sep: [this.sourceToken] });
            } else if (includesToken(it.sep, "map-value-ind")) {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [], key: null, sep: [this.sourceToken] }]
              });
            } else {
              it.sep.push(this.sourceToken);
            }
          }
          this.onKeyLine = true;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const fs2 = this.flowScalar(this.type);
          if (atNextItem || it.value) {
            map2.items.push({ start, key: fs2, sep: [] });
            this.onKeyLine = true;
          } else if (it.sep) {
            this.stack.push(fs2);
          } else {
            Object.assign(it, { key: fs2, sep: [] });
            this.onKeyLine = true;
          }
          return;
        }
        default: {
          const bv = this.startBlockValue(map2);
          if (bv) {
            if (bv.type === "block-seq") {
              if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                yield* this.pop({
                  type: "error",
                  offset: this.offset,
                  message: "Unexpected block-seq-ind on same line with key",
                  source: this.source
                });
                return;
              }
            } else if (atMapIndent) {
              map2.items.push({ start });
            }
            this.stack.push(bv);
            return;
          }
        }
      }
    }
    yield* this.pop();
    yield* this.step();
  }
  *blockSequence(seq2) {
    var _a;
    const it = seq2.items[seq2.items.length - 1];
    switch (this.type) {
      case "newline":
        if (it.value) {
          const end = "end" in it.value ? it.value.end : void 0;
          const last = Array.isArray(end) ? end[end.length - 1] : void 0;
          if ((last == null ? void 0 : last.type) === "comment")
            end == null ? void 0 : end.push(this.sourceToken);
          else
            seq2.items.push({ start: [this.sourceToken] });
        } else
          it.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (it.value)
          seq2.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(it.start, seq2.indent)) {
            const prev = seq2.items[seq2.items.length - 2];
            const end = (_a = prev == null ? void 0 : prev.value) == null ? void 0 : _a.end;
            if (Array.isArray(end)) {
              Array.prototype.push.apply(end, it.start);
              end.push(this.sourceToken);
              seq2.items.pop();
              return;
            }
          }
          it.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (it.value || this.indent <= seq2.indent)
          break;
        it.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== seq2.indent)
          break;
        if (it.value || includesToken(it.start, "seq-item-ind"))
          seq2.items.push({ start: [this.sourceToken] });
        else
          it.start.push(this.sourceToken);
        return;
    }
    if (this.indent > seq2.indent) {
      const bv = this.startBlockValue(seq2);
      if (bv) {
        this.stack.push(bv);
        return;
      }
    }
    yield* this.pop();
    yield* this.step();
  }
  *flowCollection(fc) {
    const it = fc.items[fc.items.length - 1];
    if (this.type === "flow-error-end") {
      let top;
      do {
        yield* this.pop();
        top = this.peek(1);
      } while ((top == null ? void 0 : top.type) === "flow-collection");
    } else if (fc.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          if (!it || it.sep)
            fc.items.push({ start: [this.sourceToken] });
          else
            it.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          if (!it || it.value)
            fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
          else if (it.sep)
            it.sep.push(this.sourceToken);
          else
            Object.assign(it, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          if (!it || it.value)
            fc.items.push({ start: [this.sourceToken] });
          else if (it.sep)
            it.sep.push(this.sourceToken);
          else
            it.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const fs2 = this.flowScalar(this.type);
          if (!it || it.value)
            fc.items.push({ start: [], key: fs2, sep: [] });
          else if (it.sep)
            this.stack.push(fs2);
          else
            Object.assign(it, { key: fs2, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          fc.end.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(fc);
      if (bv)
        this.stack.push(bv);
      else {
        yield* this.pop();
        yield* this.step();
      }
    } else {
      const parent = this.peek(2);
      if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
        yield* this.pop();
        yield* this.step();
      } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        fixFlowSeqItems(fc);
        const sep = fc.end.splice(1, fc.end.length);
        sep.push(this.sourceToken);
        const map2 = {
          type: "block-map",
          offset: fc.offset,
          indent: fc.indent,
          items: [{ start, key: fc, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map2;
      } else {
        yield* this.lineEnd(fc);
      }
    }
  }
  flowScalar(type2) {
    if (this.onNewLine) {
      let nl = this.source.indexOf("\n") + 1;
      while (nl !== 0) {
        this.onNewLine(this.offset + nl);
        nl = this.source.indexOf("\n", nl) + 1;
      }
    }
    return {
      type: type2,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  startBlockValue(parent) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: ""
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: []
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }]
        };
      case "explicit-key-ind": {
        this.onKeyLine = true;
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        start.push(this.sourceToken);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start, explicitKey: true }]
        };
      }
      case "map-value-ind": {
        this.onKeyLine = true;
        const prev = getPrevProps(parent);
        const start = getFirstKeyStartProps(prev);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start, key: null, sep: [this.sourceToken] }]
        };
      }
    }
    return null;
  }
  atIndentedComment(start, indent) {
    if (this.type !== "comment")
      return false;
    if (this.indent <= indent)
      return false;
    return start.every((st) => st.type === "newline" || st.type === "space");
  }
  *documentEnd(docEnd) {
    if (this.type !== "doc-mode") {
      if (docEnd.end)
        docEnd.end.push(this.sourceToken);
      else
        docEnd.end = [this.sourceToken];
      if (this.type === "newline")
        yield* this.pop();
    }
  }
  *lineEnd(token) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop();
        yield* this.step();
        break;
      case "newline":
        this.onKeyLine = false;
      case "space":
      case "comment":
      default:
        if (token.end)
          token.end.push(this.sourceToken);
        else
          token.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
    }
  }
}
parser$2.Parser = Parser;
var publicApi$1 = {};
var composer$1 = composer$2;
var Document$1 = Document$5;
var errors$2 = errors$5;
var log = log$2;
var identity$1 = identity$x;
var lineCounter$1 = lineCounter$2;
var parser$1 = parser$2;
function parseOptions(options) {
  const prettyErrors = options.prettyErrors !== false;
  const lineCounter$1$1 = options.lineCounter || prettyErrors && new lineCounter$1.LineCounter() || null;
  return { lineCounter: lineCounter$1$1, prettyErrors };
}
function parseAllDocuments(source, options = {}) {
  const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
  const parser$1$1 = new parser$1.Parser(lineCounter2 == null ? void 0 : lineCounter2.addNewLine);
  const composer$1$1 = new composer$1.Composer(options);
  const docs = Array.from(composer$1$1.compose(parser$1$1.parse(source)));
  if (prettyErrors && lineCounter2)
    for (const doc of docs) {
      doc.errors.forEach(errors$2.prettifyError(source, lineCounter2));
      doc.warnings.forEach(errors$2.prettifyError(source, lineCounter2));
    }
  if (docs.length > 0)
    return docs;
  return Object.assign([], { empty: true }, composer$1$1.streamInfo());
}
function parseDocument(source, options = {}) {
  const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
  const parser$1$1 = new parser$1.Parser(lineCounter2 == null ? void 0 : lineCounter2.addNewLine);
  const composer$1$1 = new composer$1.Composer(options);
  let doc = null;
  for (const _doc of composer$1$1.compose(parser$1$1.parse(source), true, source.length)) {
    if (!doc)
      doc = _doc;
    else if (doc.options.logLevel !== "silent") {
      doc.errors.push(new errors$2.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
      break;
    }
  }
  if (prettyErrors && lineCounter2) {
    doc.errors.forEach(errors$2.prettifyError(source, lineCounter2));
    doc.warnings.forEach(errors$2.prettifyError(source, lineCounter2));
  }
  return doc;
}
function parse(src2, reviver, options) {
  let _reviver = void 0;
  if (typeof reviver === "function") {
    _reviver = reviver;
  } else if (options === void 0 && reviver && typeof reviver === "object") {
    options = reviver;
  }
  const doc = parseDocument(src2, options);
  if (!doc)
    return null;
  doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
  if (doc.errors.length > 0) {
    if (doc.options.logLevel !== "silent")
      throw doc.errors[0];
    else
      doc.errors = [];
  }
  return doc.toJS(Object.assign({ reviver: _reviver }, options));
}
function stringify(value, replacer, options) {
  let _replacer = null;
  if (typeof replacer === "function" || Array.isArray(replacer)) {
    _replacer = replacer;
  } else if (options === void 0 && replacer) {
    options = replacer;
  }
  if (typeof options === "string")
    options = options.length;
  if (typeof options === "number") {
    const indent = Math.round(options);
    options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
  }
  if (value === void 0) {
    const { keepUndefined } = options ?? replacer ?? {};
    if (!keepUndefined)
      return void 0;
  }
  if (identity$1.isDocument(value) && !_replacer)
    return value.toString(options);
  return new Document$1.Document(value, _replacer, options).toString(options);
}
publicApi$1.parse = parse;
publicApi$1.parseAllDocuments = parseAllDocuments;
publicApi$1.parseDocument = parseDocument;
publicApi$1.stringify = stringify;
var composer = composer$2;
var Document2 = Document$5;
var Schema2 = Schema$3;
var errors$1 = errors$5;
var Alias2 = Alias$5;
var identity = identity$x;
var Pair2 = Pair$8;
var Scalar2 = Scalar$k;
var YAMLMap2 = YAMLMap$8;
var YAMLSeq2 = YAMLSeq$8;
var cst = cst$3;
var lexer = lexer$2;
var lineCounter = lineCounter$2;
var parser = parser$2;
var publicApi = publicApi$1;
var visit = visit$6;
dist.Composer = composer.Composer;
dist.Document = Document2.Document;
dist.Schema = Schema2.Schema;
dist.YAMLError = errors$1.YAMLError;
dist.YAMLParseError = errors$1.YAMLParseError;
dist.YAMLWarning = errors$1.YAMLWarning;
dist.Alias = Alias2.Alias;
dist.isAlias = identity.isAlias;
dist.isCollection = identity.isCollection;
dist.isDocument = identity.isDocument;
dist.isMap = identity.isMap;
dist.isNode = identity.isNode;
dist.isPair = identity.isPair;
dist.isScalar = identity.isScalar;
dist.isSeq = identity.isSeq;
dist.Pair = Pair2.Pair;
dist.Scalar = Scalar2.Scalar;
dist.YAMLMap = YAMLMap2.YAMLMap;
dist.YAMLSeq = YAMLSeq2.YAMLSeq;
dist.CST = cst;
dist.Lexer = lexer.Lexer;
dist.LineCounter = lineCounter.LineCounter;
dist.Parser = parser.Parser;
dist.parse = publicApi.parse;
dist.parseAllDocuments = publicApi.parseAllDocuments;
dist.parseDocument = publicApi.parseDocument;
dist.stringify = publicApi.stringify;
dist.visit = visit.visit;
dist.visitAsync = visit.visitAsync;
async function loadConfig(configPath) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba, _ca, _da, _ea, _fa, _ga, _ha, _ia, _ja, _ka, _la, _ma, _na, _oa, _pa, _qa, _ra, _sa, _ta, _ua, _va, _wa, _xa, _ya, _za, _Aa, _Ba, _Ca, _Da, _Ea, _Fa;
  const content = await fs$1.promises.readFile(configPath, "utf-8");
  const parsed = dist.parse(content);
  const config2 = {
    window: {
      title: ((_a = parsed.window) == null ? void 0 : _a.title) || "Kafra Client",
      width: ((_b = parsed.window) == null ? void 0 : _b.width) || 900,
      height: ((_c = parsed.window) == null ? void 0 : _c.height) || 600,
      resizable: ((_d = parsed.window) == null ? void 0 : _d.resizable) ?? false
    },
    play: {
      path: ((_e = parsed.play) == null ? void 0 : _e.path) || "ragnarok.exe",
      arguments: ((_f = parsed.play) == null ? void 0 : _f.arguments) || [],
      exit_on_success: ((_g = parsed.play) == null ? void 0 : _g.exit_on_success) ?? true
    },
    setup: parsed.setup ? {
      path: parsed.setup.path,
      arguments: parsed.setup.arguments || [],
      exit_on_success: parsed.setup.exit_on_success ?? false
    } : void 0,
    web: {
      index_url: ((_h = parsed.web) == null ? void 0 : _h.index_url) || "",
      preferred_patch_server: (_i = parsed.web) == null ? void 0 : _i.preferred_patch_server,
      patch_servers: (((_j = parsed.web) == null ? void 0 : _j.patch_servers) || []).map((server) => ({
        name: server.name || "default",
        plist_url: server.plist_url || "",
        patch_url: server.patch_url || ""
      }))
    },
    client: {
      default_grf_name: ((_k = parsed.client) == null ? void 0 : _k.default_grf_name) || "data.grf",
      sso_login: ((_l = parsed.client) == null ? void 0 : _l.sso_login) ?? false
    },
    patching: {
      in_place: ((_m = parsed.patching) == null ? void 0 : _m.in_place) ?? true,
      check_integrity: ((_n = parsed.patching) == null ? void 0 : _n.check_integrity) ?? true,
      create_grf: ((_o = parsed.patching) == null ? void 0 : _o.create_grf) ?? false
    },
    messages: {
      patching: {
        error_download: ((_q = (_p = parsed.messages) == null ? void 0 : _p.patching) == null ? void 0 : _q.error_download) || "Failed to download patch",
        error_extract: ((_s = (_r = parsed.messages) == null ? void 0 : _r.patching) == null ? void 0 : _s.error_extract) || "Failed to extract patch",
        error_generic: ((_u = (_t = parsed.messages) == null ? void 0 : _t.patching) == null ? void 0 : _u.error_generic) || "An error occurred during patching"
      },
      game: {
        launch_error: ((_w = (_v = parsed.messages) == null ? void 0 : _v.game) == null ? void 0 : _w.launch_error) || "Failed to launch game"
      },
      ui: {
        titles: {
          news: ((_z = (_y = (_x = parsed.messages) == null ? void 0 : _x.ui) == null ? void 0 : _y.titles) == null ? void 0 : _z.news) || "Latest News",
          sso_login: ((_C = (_B = (_A = parsed.messages) == null ? void 0 : _A.ui) == null ? void 0 : _B.titles) == null ? void 0 : _C.sso_login) || "Quick Login (SSO)",
          server_status: ((_F = (_E = (_D = parsed.messages) == null ? void 0 : _D.ui) == null ? void 0 : _E.titles) == null ? void 0 : _F.server_status) || "Server Status",
          actions: ((_I = (_H = (_G = parsed.messages) == null ? void 0 : _G.ui) == null ? void 0 : _H.titles) == null ? void 0 : _I.actions) || "Actions"
        },
        buttons: {
          login: ((_L = (_K = (_J = parsed.messages) == null ? void 0 : _J.ui) == null ? void 0 : _K.buttons) == null ? void 0 : _L.login) || "Login",
          setup: ((_O = (_N = (_M = parsed.messages) == null ? void 0 : _M.ui) == null ? void 0 : _N.buttons) == null ? void 0 : _O.setup) || "Setup",
          toggle_gray: ((_R = (_Q = (_P = parsed.messages) == null ? void 0 : _P.ui) == null ? void 0 : _Q.buttons) == null ? void 0 : _R.toggle_gray) || "Disable Gray Floor",
          toggle_normal: ((_U = (_T = (_S = parsed.messages) == null ? void 0 : _S.ui) == null ? void 0 : _T.buttons) == null ? void 0 : _U.toggle_normal) || "Enable Gray Floor",
          manual_patch: ((_X = (_W = (_V = parsed.messages) == null ? void 0 : _V.ui) == null ? void 0 : _W.buttons) == null ? void 0 : _X.manual_patch) || "Manual Patch",
          reset_cache: ((__ = (_Z = (_Y = parsed.messages) == null ? void 0 : _Y.ui) == null ? void 0 : _Z.buttons) == null ? void 0 : __.reset_cache) || "Reset Cache",
          cancel: ((_ba = (_aa = (_$ = parsed.messages) == null ? void 0 : _$.ui) == null ? void 0 : _aa.buttons) == null ? void 0 : _ba.cancel) || "Cancel",
          play: ((_ea = (_da = (_ca = parsed.messages) == null ? void 0 : _ca.ui) == null ? void 0 : _da.buttons) == null ? void 0 : _ea.play) || "Start Game",
          patching: ((_ha = (_ga = (_fa = parsed.messages) == null ? void 0 : _fa.ui) == null ? void 0 : _ga.buttons) == null ? void 0 : _ha.patching) || "Patching...",
          wait: ((_ka = (_ja = (_ia = parsed.messages) == null ? void 0 : _ia.ui) == null ? void 0 : _ja.buttons) == null ? void 0 : _ka.wait) || "Please Wait",
          retry: ((_na = (_ma = (_la = parsed.messages) == null ? void 0 : _la.ui) == null ? void 0 : _ma.buttons) == null ? void 0 : _na.retry) || "Retry"
        },
        status: {
          idle: ((_qa = (_pa = (_oa = parsed.messages) == null ? void 0 : _oa.ui) == null ? void 0 : _pa.status) == null ? void 0 : _qa.idle) || "Ready to start",
          checking: ((_ta = (_sa = (_ra = parsed.messages) == null ? void 0 : _ra.ui) == null ? void 0 : _sa.status) == null ? void 0 : _ta.checking) || "Checking for updates...",
          downloading: ((_wa = (_va = (_ua = parsed.messages) == null ? void 0 : _ua.ui) == null ? void 0 : _va.status) == null ? void 0 : _wa.downloading) || "Downloading: ${filename} (${current}/${total})",
          patching: ((_za = (_ya = (_xa = parsed.messages) == null ? void 0 : _xa.ui) == null ? void 0 : _ya.status) == null ? void 0 : _za.patching) || "Applying: ${filename} (${current}/${total})",
          ready: ((_Ca = (_Ba = (_Aa = parsed.messages) == null ? void 0 : _Aa.ui) == null ? void 0 : _Ba.status) == null ? void 0 : _Ca.ready) || "Game is up to date!",
          error: ((_Fa = (_Ea = (_Da = parsed.messages) == null ? void 0 : _Da.ui) == null ? void 0 : _Ea.status) == null ? void 0 : _Fa.error) || "An error occurred"
        }
      }
    }
  };
  return config2;
}
function bind$2(fn, thisArg) {
  return function wrap2() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag: toStringTag$1 } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type2) => {
  type2 = type2.toLowerCase();
  return (thing) => kindOf(thing) === type2;
};
const typeOfTest = (type2) => (thing) => typeof thing === type2;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer$1(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction$2(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString$1 = typeOfTest("string");
const isFunction$2 = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag$1 in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer$1(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction$2(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction$2(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction$2(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer$1(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer$1(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction$2(val)) {
      a[key] = bind$2(val, thisArg);
    } else {
      a[key] = val;
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray2) => {
  return (thing) => {
    return TypedArray2 && thing instanceof TypedArray2;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction$2(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction$2(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop$1 = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction$2(thing.append) && thing[toStringTag$1] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit2 = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer$1(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit2(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit2(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction$2(thing)) && isFunction$2(thing.then) && isFunction$2(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction$2(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction$2(thing[iterator]);
const utils$2 = {
  isArray,
  isArrayBuffer,
  isBuffer: isBuffer$1,
  isFormData,
  isArrayBufferView,
  isString: isString$1,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction: isFunction$2,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop: noop$1,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
function AxiosError$1(message, code, config2, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config2 && (this.config = config2);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils$2.inherits(AxiosError$1, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$2.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const prototype$1 = AxiosError$1.prototype;
const descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError$1, descriptors);
Object.defineProperty(prototype$1, "isAxiosError", { value: true });
AxiosError$1.from = (error, code, config2, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);
  utils$2.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  const msg = error && error.message ? error.message : "Error";
  const errCode = code == null && error ? error.code : code;
  AxiosError$1.call(axiosError, msg, errCode, config2, request, response);
  if (error && axiosError.cause == null) {
    Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
  }
  axiosError.name = error && error.name || "Error";
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var Stream$2 = stream.Stream;
var util$3 = require$$1;
var delayed_stream = DelayedStream$1;
function DelayedStream$1() {
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;
  this._maxDataSizeExceeded = false;
  this._released = false;
  this._bufferedEvents = [];
}
util$3.inherits(DelayedStream$1, Stream$2);
DelayedStream$1.create = function(source, options) {
  var delayedStream = new this();
  options = options || {};
  for (var option in options) {
    delayedStream[option] = options[option];
  }
  delayedStream.source = source;
  var realEmit = source.emit;
  source.emit = function() {
    delayedStream._handleEmit(arguments);
    return realEmit.apply(source, arguments);
  };
  source.on("error", function() {
  });
  if (delayedStream.pauseStream) {
    source.pause();
  }
  return delayedStream;
};
Object.defineProperty(DelayedStream$1.prototype, "readable", {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.source.readable;
  }
});
DelayedStream$1.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};
DelayedStream$1.prototype.resume = function() {
  if (!this._released) {
    this.release();
  }
  this.source.resume();
};
DelayedStream$1.prototype.pause = function() {
  this.source.pause();
};
DelayedStream$1.prototype.release = function() {
  this._released = true;
  this._bufferedEvents.forEach((function(args) {
    this.emit.apply(this, args);
  }).bind(this));
  this._bufferedEvents = [];
};
DelayedStream$1.prototype.pipe = function() {
  var r = Stream$2.prototype.pipe.apply(this, arguments);
  this.resume();
  return r;
};
DelayedStream$1.prototype._handleEmit = function(args) {
  if (this._released) {
    this.emit.apply(this, args);
    return;
  }
  if (args[0] === "data") {
    this.dataSize += args[1].length;
    this._checkIfMaxDataSizeExceeded();
  }
  this._bufferedEvents.push(args);
};
DelayedStream$1.prototype._checkIfMaxDataSizeExceeded = function() {
  if (this._maxDataSizeExceeded) {
    return;
  }
  if (this.dataSize <= this.maxDataSize) {
    return;
  }
  this._maxDataSizeExceeded = true;
  var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
  this.emit("error", new Error(message));
};
var util$2 = require$$1;
var Stream$1 = stream.Stream;
var DelayedStream = delayed_stream;
var combined_stream = CombinedStream$1;
function CombinedStream$1() {
  this.writable = false;
  this.readable = true;
  this.dataSize = 0;
  this.maxDataSize = 2 * 1024 * 1024;
  this.pauseStreams = true;
  this._released = false;
  this._streams = [];
  this._currentStream = null;
  this._insideLoop = false;
  this._pendingNext = false;
}
util$2.inherits(CombinedStream$1, Stream$1);
CombinedStream$1.create = function(options) {
  var combinedStream = new this();
  options = options || {};
  for (var option in options) {
    combinedStream[option] = options[option];
  }
  return combinedStream;
};
CombinedStream$1.isStreamLike = function(stream2) {
  return typeof stream2 !== "function" && typeof stream2 !== "string" && typeof stream2 !== "boolean" && typeof stream2 !== "number" && !Buffer.isBuffer(stream2);
};
CombinedStream$1.prototype.append = function(stream2) {
  var isStreamLike = CombinedStream$1.isStreamLike(stream2);
  if (isStreamLike) {
    if (!(stream2 instanceof DelayedStream)) {
      var newStream = DelayedStream.create(stream2, {
        maxDataSize: Infinity,
        pauseStream: this.pauseStreams
      });
      stream2.on("data", this._checkDataSize.bind(this));
      stream2 = newStream;
    }
    this._handleErrors(stream2);
    if (this.pauseStreams) {
      stream2.pause();
    }
  }
  this._streams.push(stream2);
  return this;
};
CombinedStream$1.prototype.pipe = function(dest, options) {
  Stream$1.prototype.pipe.call(this, dest, options);
  this.resume();
  return dest;
};
CombinedStream$1.prototype._getNext = function() {
  this._currentStream = null;
  if (this._insideLoop) {
    this._pendingNext = true;
    return;
  }
  this._insideLoop = true;
  try {
    do {
      this._pendingNext = false;
      this._realGetNext();
    } while (this._pendingNext);
  } finally {
    this._insideLoop = false;
  }
};
CombinedStream$1.prototype._realGetNext = function() {
  var stream2 = this._streams.shift();
  if (typeof stream2 == "undefined") {
    this.end();
    return;
  }
  if (typeof stream2 !== "function") {
    this._pipeNext(stream2);
    return;
  }
  var getStream = stream2;
  getStream((function(stream3) {
    var isStreamLike = CombinedStream$1.isStreamLike(stream3);
    if (isStreamLike) {
      stream3.on("data", this._checkDataSize.bind(this));
      this._handleErrors(stream3);
    }
    this._pipeNext(stream3);
  }).bind(this));
};
CombinedStream$1.prototype._pipeNext = function(stream2) {
  this._currentStream = stream2;
  var isStreamLike = CombinedStream$1.isStreamLike(stream2);
  if (isStreamLike) {
    stream2.on("end", this._getNext.bind(this));
    stream2.pipe(this, { end: false });
    return;
  }
  var value = stream2;
  this.write(value);
  this._getNext();
};
CombinedStream$1.prototype._handleErrors = function(stream2) {
  var self2 = this;
  stream2.on("error", function(err) {
    self2._emitError(err);
  });
};
CombinedStream$1.prototype.write = function(data) {
  this.emit("data", data);
};
CombinedStream$1.prototype.pause = function() {
  if (!this.pauseStreams) {
    return;
  }
  if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function") this._currentStream.pause();
  this.emit("pause");
};
CombinedStream$1.prototype.resume = function() {
  if (!this._released) {
    this._released = true;
    this.writable = true;
    this._getNext();
  }
  if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function") this._currentStream.resume();
  this.emit("resume");
};
CombinedStream$1.prototype.end = function() {
  this._reset();
  this.emit("end");
};
CombinedStream$1.prototype.destroy = function() {
  this._reset();
  this.emit("close");
};
CombinedStream$1.prototype._reset = function() {
  this.writable = false;
  this._streams = [];
  this._currentStream = null;
};
CombinedStream$1.prototype._checkDataSize = function() {
  this._updateDataSize();
  if (this.dataSize <= this.maxDataSize) {
    return;
  }
  var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
  this._emitError(new Error(message));
};
CombinedStream$1.prototype._updateDataSize = function() {
  this.dataSize = 0;
  var self2 = this;
  this._streams.forEach(function(stream2) {
    if (!stream2.dataSize) {
      return;
    }
    self2.dataSize += stream2.dataSize;
  });
  if (this._currentStream && this._currentStream.dataSize) {
    this.dataSize += this._currentStream.dataSize;
  }
};
CombinedStream$1.prototype._emitError = function(err) {
  this._reset();
  this.emit("error", err);
};
var mimeTypes = {};
const require$$0 = {
  "application/1d-interleaved-parityfec": {
    source: "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/3gpp-ims+xml": {
    source: "iana",
    compressible: true
  },
  "application/3gpphal+json": {
    source: "iana",
    compressible: true
  },
  "application/3gpphalforms+json": {
    source: "iana",
    compressible: true
  },
  "application/a2l": {
    source: "iana"
  },
  "application/ace+cbor": {
    source: "iana"
  },
  "application/activemessage": {
    source: "iana"
  },
  "application/activity+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-costmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-costmapfilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-directory+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointcost+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointcostparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointprop+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointpropparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-error+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-networkmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-networkmapfilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-updatestreamcontrol+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-updatestreamparams+json": {
    source: "iana",
    compressible: true
  },
  "application/aml": {
    source: "iana"
  },
  "application/andrew-inset": {
    source: "iana",
    extensions: [
      "ez"
    ]
  },
  "application/applefile": {
    source: "iana"
  },
  "application/applixware": {
    source: "apache",
    extensions: [
      "aw"
    ]
  },
  "application/at+jwt": {
    source: "iana"
  },
  "application/atf": {
    source: "iana"
  },
  "application/atfx": {
    source: "iana"
  },
  "application/atom+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atom"
    ]
  },
  "application/atomcat+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomcat"
    ]
  },
  "application/atomdeleted+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomdeleted"
    ]
  },
  "application/atomicmail": {
    source: "iana"
  },
  "application/atomsvc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomsvc"
    ]
  },
  "application/atsc-dwd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dwd"
    ]
  },
  "application/atsc-dynamic-event-message": {
    source: "iana"
  },
  "application/atsc-held+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "held"
    ]
  },
  "application/atsc-rdt+json": {
    source: "iana",
    compressible: true
  },
  "application/atsc-rsat+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rsat"
    ]
  },
  "application/atxml": {
    source: "iana"
  },
  "application/auth-policy+xml": {
    source: "iana",
    compressible: true
  },
  "application/bacnet-xdd+zip": {
    source: "iana",
    compressible: false
  },
  "application/batch-smtp": {
    source: "iana"
  },
  "application/bdoc": {
    compressible: false,
    extensions: [
      "bdoc"
    ]
  },
  "application/beep+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/calendar+json": {
    source: "iana",
    compressible: true
  },
  "application/calendar+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xcs"
    ]
  },
  "application/call-completion": {
    source: "iana"
  },
  "application/cals-1840": {
    source: "iana"
  },
  "application/captive+json": {
    source: "iana",
    compressible: true
  },
  "application/cbor": {
    source: "iana"
  },
  "application/cbor-seq": {
    source: "iana"
  },
  "application/cccex": {
    source: "iana"
  },
  "application/ccmp+xml": {
    source: "iana",
    compressible: true
  },
  "application/ccxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ccxml"
    ]
  },
  "application/cdfx+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cdfx"
    ]
  },
  "application/cdmi-capability": {
    source: "iana",
    extensions: [
      "cdmia"
    ]
  },
  "application/cdmi-container": {
    source: "iana",
    extensions: [
      "cdmic"
    ]
  },
  "application/cdmi-domain": {
    source: "iana",
    extensions: [
      "cdmid"
    ]
  },
  "application/cdmi-object": {
    source: "iana",
    extensions: [
      "cdmio"
    ]
  },
  "application/cdmi-queue": {
    source: "iana",
    extensions: [
      "cdmiq"
    ]
  },
  "application/cdni": {
    source: "iana"
  },
  "application/cea": {
    source: "iana"
  },
  "application/cea-2018+xml": {
    source: "iana",
    compressible: true
  },
  "application/cellml+xml": {
    source: "iana",
    compressible: true
  },
  "application/cfw": {
    source: "iana"
  },
  "application/city+json": {
    source: "iana",
    compressible: true
  },
  "application/clr": {
    source: "iana"
  },
  "application/clue+xml": {
    source: "iana",
    compressible: true
  },
  "application/clue_info+xml": {
    source: "iana",
    compressible: true
  },
  "application/cms": {
    source: "iana"
  },
  "application/cnrp+xml": {
    source: "iana",
    compressible: true
  },
  "application/coap-group+json": {
    source: "iana",
    compressible: true
  },
  "application/coap-payload": {
    source: "iana"
  },
  "application/commonground": {
    source: "iana"
  },
  "application/conference-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/cose": {
    source: "iana"
  },
  "application/cose-key": {
    source: "iana"
  },
  "application/cose-key-set": {
    source: "iana"
  },
  "application/cpl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cpl"
    ]
  },
  "application/csrattrs": {
    source: "iana"
  },
  "application/csta+xml": {
    source: "iana",
    compressible: true
  },
  "application/cstadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/csvm+json": {
    source: "iana",
    compressible: true
  },
  "application/cu-seeme": {
    source: "apache",
    extensions: [
      "cu"
    ]
  },
  "application/cwt": {
    source: "iana"
  },
  "application/cybercash": {
    source: "iana"
  },
  "application/dart": {
    compressible: true
  },
  "application/dash+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpd"
    ]
  },
  "application/dash-patch+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpp"
    ]
  },
  "application/dashdelta": {
    source: "iana"
  },
  "application/davmount+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "davmount"
    ]
  },
  "application/dca-rft": {
    source: "iana"
  },
  "application/dcd": {
    source: "iana"
  },
  "application/dec-dx": {
    source: "iana"
  },
  "application/dialog-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/dicom": {
    source: "iana"
  },
  "application/dicom+json": {
    source: "iana",
    compressible: true
  },
  "application/dicom+xml": {
    source: "iana",
    compressible: true
  },
  "application/dii": {
    source: "iana"
  },
  "application/dit": {
    source: "iana"
  },
  "application/dns": {
    source: "iana"
  },
  "application/dns+json": {
    source: "iana",
    compressible: true
  },
  "application/dns-message": {
    source: "iana"
  },
  "application/docbook+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "dbk"
    ]
  },
  "application/dots+cbor": {
    source: "iana"
  },
  "application/dskpp+xml": {
    source: "iana",
    compressible: true
  },
  "application/dssc+der": {
    source: "iana",
    extensions: [
      "dssc"
    ]
  },
  "application/dssc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdssc"
    ]
  },
  "application/dvcs": {
    source: "iana"
  },
  "application/ecmascript": {
    source: "iana",
    compressible: true,
    extensions: [
      "es",
      "ecma"
    ]
  },
  "application/edi-consent": {
    source: "iana"
  },
  "application/edi-x12": {
    source: "iana",
    compressible: false
  },
  "application/edifact": {
    source: "iana",
    compressible: false
  },
  "application/efi": {
    source: "iana"
  },
  "application/elm+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/elm+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.cap+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/emergencycalldata.comment+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.control+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.deviceinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.ecall.msd": {
    source: "iana"
  },
  "application/emergencycalldata.providerinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.serviceinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.veds+xml": {
    source: "iana",
    compressible: true
  },
  "application/emma+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "emma"
    ]
  },
  "application/emotionml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "emotionml"
    ]
  },
  "application/encaprtp": {
    source: "iana"
  },
  "application/epp+xml": {
    source: "iana",
    compressible: true
  },
  "application/epub+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "epub"
    ]
  },
  "application/eshop": {
    source: "iana"
  },
  "application/exi": {
    source: "iana",
    extensions: [
      "exi"
    ]
  },
  "application/expect-ct-report+json": {
    source: "iana",
    compressible: true
  },
  "application/express": {
    source: "iana",
    extensions: [
      "exp"
    ]
  },
  "application/fastinfoset": {
    source: "iana"
  },
  "application/fastsoap": {
    source: "iana"
  },
  "application/fdt+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "fdt"
    ]
  },
  "application/fhir+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/fhir+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/fido.trusted-apps+json": {
    compressible: true
  },
  "application/fits": {
    source: "iana"
  },
  "application/flexfec": {
    source: "iana"
  },
  "application/font-sfnt": {
    source: "iana"
  },
  "application/font-tdpfr": {
    source: "iana",
    extensions: [
      "pfr"
    ]
  },
  "application/font-woff": {
    source: "iana",
    compressible: false
  },
  "application/framework-attributes+xml": {
    source: "iana",
    compressible: true
  },
  "application/geo+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "geojson"
    ]
  },
  "application/geo+json-seq": {
    source: "iana"
  },
  "application/geopackage+sqlite3": {
    source: "iana"
  },
  "application/geoxacml+xml": {
    source: "iana",
    compressible: true
  },
  "application/gltf-buffer": {
    source: "iana"
  },
  "application/gml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "gml"
    ]
  },
  "application/gpx+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "gpx"
    ]
  },
  "application/gxf": {
    source: "apache",
    extensions: [
      "gxf"
    ]
  },
  "application/gzip": {
    source: "iana",
    compressible: false,
    extensions: [
      "gz"
    ]
  },
  "application/h224": {
    source: "iana"
  },
  "application/held+xml": {
    source: "iana",
    compressible: true
  },
  "application/hjson": {
    extensions: [
      "hjson"
    ]
  },
  "application/http": {
    source: "iana"
  },
  "application/hyperstudio": {
    source: "iana",
    extensions: [
      "stk"
    ]
  },
  "application/ibe-key-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/ibe-pkg-reply+xml": {
    source: "iana",
    compressible: true
  },
  "application/ibe-pp-data": {
    source: "iana"
  },
  "application/iges": {
    source: "iana"
  },
  "application/im-iscomposing+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/index": {
    source: "iana"
  },
  "application/index.cmd": {
    source: "iana"
  },
  "application/index.obj": {
    source: "iana"
  },
  "application/index.response": {
    source: "iana"
  },
  "application/index.vnd": {
    source: "iana"
  },
  "application/inkml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ink",
      "inkml"
    ]
  },
  "application/iotp": {
    source: "iana"
  },
  "application/ipfix": {
    source: "iana",
    extensions: [
      "ipfix"
    ]
  },
  "application/ipp": {
    source: "iana"
  },
  "application/isup": {
    source: "iana"
  },
  "application/its+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "its"
    ]
  },
  "application/java-archive": {
    source: "apache",
    compressible: false,
    extensions: [
      "jar",
      "war",
      "ear"
    ]
  },
  "application/java-serialized-object": {
    source: "apache",
    compressible: false,
    extensions: [
      "ser"
    ]
  },
  "application/java-vm": {
    source: "apache",
    compressible: false,
    extensions: [
      "class"
    ]
  },
  "application/javascript": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "js",
      "mjs"
    ]
  },
  "application/jf2feed+json": {
    source: "iana",
    compressible: true
  },
  "application/jose": {
    source: "iana"
  },
  "application/jose+json": {
    source: "iana",
    compressible: true
  },
  "application/jrd+json": {
    source: "iana",
    compressible: true
  },
  "application/jscalendar+json": {
    source: "iana",
    compressible: true
  },
  "application/json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "json",
      "map"
    ]
  },
  "application/json-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/json-seq": {
    source: "iana"
  },
  "application/json5": {
    extensions: [
      "json5"
    ]
  },
  "application/jsonml+json": {
    source: "apache",
    compressible: true,
    extensions: [
      "jsonml"
    ]
  },
  "application/jwk+json": {
    source: "iana",
    compressible: true
  },
  "application/jwk-set+json": {
    source: "iana",
    compressible: true
  },
  "application/jwt": {
    source: "iana"
  },
  "application/kpml-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/kpml-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/ld+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "jsonld"
    ]
  },
  "application/lgr+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lgr"
    ]
  },
  "application/link-format": {
    source: "iana"
  },
  "application/load-control+xml": {
    source: "iana",
    compressible: true
  },
  "application/lost+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lostxml"
    ]
  },
  "application/lostsync+xml": {
    source: "iana",
    compressible: true
  },
  "application/lpf+zip": {
    source: "iana",
    compressible: false
  },
  "application/lxf": {
    source: "iana"
  },
  "application/mac-binhex40": {
    source: "iana",
    extensions: [
      "hqx"
    ]
  },
  "application/mac-compactpro": {
    source: "apache",
    extensions: [
      "cpt"
    ]
  },
  "application/macwriteii": {
    source: "iana"
  },
  "application/mads+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mads"
    ]
  },
  "application/manifest+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "webmanifest"
    ]
  },
  "application/marc": {
    source: "iana",
    extensions: [
      "mrc"
    ]
  },
  "application/marcxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mrcx"
    ]
  },
  "application/mathematica": {
    source: "iana",
    extensions: [
      "ma",
      "nb",
      "mb"
    ]
  },
  "application/mathml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mathml"
    ]
  },
  "application/mathml-content+xml": {
    source: "iana",
    compressible: true
  },
  "application/mathml-presentation+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-associated-procedure-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-deregister+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-envelope+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-msk+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-msk-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-protection-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-reception-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-register+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-register-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-schedule+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-user-service-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbox": {
    source: "iana",
    extensions: [
      "mbox"
    ]
  },
  "application/media-policy-dataset+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpf"
    ]
  },
  "application/media_control+xml": {
    source: "iana",
    compressible: true
  },
  "application/mediaservercontrol+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mscml"
    ]
  },
  "application/merge-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/metalink+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "metalink"
    ]
  },
  "application/metalink4+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "meta4"
    ]
  },
  "application/mets+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mets"
    ]
  },
  "application/mf4": {
    source: "iana"
  },
  "application/mikey": {
    source: "iana"
  },
  "application/mipc": {
    source: "iana"
  },
  "application/missing-blocks+cbor-seq": {
    source: "iana"
  },
  "application/mmt-aei+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "maei"
    ]
  },
  "application/mmt-usd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "musd"
    ]
  },
  "application/mods+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mods"
    ]
  },
  "application/moss-keys": {
    source: "iana"
  },
  "application/moss-signature": {
    source: "iana"
  },
  "application/mosskey-data": {
    source: "iana"
  },
  "application/mosskey-request": {
    source: "iana"
  },
  "application/mp21": {
    source: "iana",
    extensions: [
      "m21",
      "mp21"
    ]
  },
  "application/mp4": {
    source: "iana",
    extensions: [
      "mp4s",
      "m4p"
    ]
  },
  "application/mpeg4-generic": {
    source: "iana"
  },
  "application/mpeg4-iod": {
    source: "iana"
  },
  "application/mpeg4-iod-xmt": {
    source: "iana"
  },
  "application/mrb-consumer+xml": {
    source: "iana",
    compressible: true
  },
  "application/mrb-publish+xml": {
    source: "iana",
    compressible: true
  },
  "application/msc-ivr+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/msc-mixer+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/msword": {
    source: "iana",
    compressible: false,
    extensions: [
      "doc",
      "dot"
    ]
  },
  "application/mud+json": {
    source: "iana",
    compressible: true
  },
  "application/multipart-core": {
    source: "iana"
  },
  "application/mxf": {
    source: "iana",
    extensions: [
      "mxf"
    ]
  },
  "application/n-quads": {
    source: "iana",
    extensions: [
      "nq"
    ]
  },
  "application/n-triples": {
    source: "iana",
    extensions: [
      "nt"
    ]
  },
  "application/nasdata": {
    source: "iana"
  },
  "application/news-checkgroups": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-groupinfo": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-transmission": {
    source: "iana"
  },
  "application/nlsml+xml": {
    source: "iana",
    compressible: true
  },
  "application/node": {
    source: "iana",
    extensions: [
      "cjs"
    ]
  },
  "application/nss": {
    source: "iana"
  },
  "application/oauth-authz-req+jwt": {
    source: "iana"
  },
  "application/oblivious-dns-message": {
    source: "iana"
  },
  "application/ocsp-request": {
    source: "iana"
  },
  "application/ocsp-response": {
    source: "iana"
  },
  "application/octet-stream": {
    source: "iana",
    compressible: false,
    extensions: [
      "bin",
      "dms",
      "lrf",
      "mar",
      "so",
      "dist",
      "distz",
      "pkg",
      "bpk",
      "dump",
      "elc",
      "deploy",
      "exe",
      "dll",
      "deb",
      "dmg",
      "iso",
      "img",
      "msi",
      "msp",
      "msm",
      "buffer"
    ]
  },
  "application/oda": {
    source: "iana",
    extensions: [
      "oda"
    ]
  },
  "application/odm+xml": {
    source: "iana",
    compressible: true
  },
  "application/odx": {
    source: "iana"
  },
  "application/oebps-package+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "opf"
    ]
  },
  "application/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "ogx"
    ]
  },
  "application/omdoc+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "omdoc"
    ]
  },
  "application/onenote": {
    source: "apache",
    extensions: [
      "onetoc",
      "onetoc2",
      "onetmp",
      "onepkg"
    ]
  },
  "application/opc-nodeset+xml": {
    source: "iana",
    compressible: true
  },
  "application/oscore": {
    source: "iana"
  },
  "application/oxps": {
    source: "iana",
    extensions: [
      "oxps"
    ]
  },
  "application/p21": {
    source: "iana"
  },
  "application/p21+zip": {
    source: "iana",
    compressible: false
  },
  "application/p2p-overlay+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "relo"
    ]
  },
  "application/parityfec": {
    source: "iana"
  },
  "application/passport": {
    source: "iana"
  },
  "application/patch-ops-error+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xer"
    ]
  },
  "application/pdf": {
    source: "iana",
    compressible: false,
    extensions: [
      "pdf"
    ]
  },
  "application/pdx": {
    source: "iana"
  },
  "application/pem-certificate-chain": {
    source: "iana"
  },
  "application/pgp-encrypted": {
    source: "iana",
    compressible: false,
    extensions: [
      "pgp"
    ]
  },
  "application/pgp-keys": {
    source: "iana",
    extensions: [
      "asc"
    ]
  },
  "application/pgp-signature": {
    source: "iana",
    extensions: [
      "asc",
      "sig"
    ]
  },
  "application/pics-rules": {
    source: "apache",
    extensions: [
      "prf"
    ]
  },
  "application/pidf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/pidf-diff+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/pkcs10": {
    source: "iana",
    extensions: [
      "p10"
    ]
  },
  "application/pkcs12": {
    source: "iana"
  },
  "application/pkcs7-mime": {
    source: "iana",
    extensions: [
      "p7m",
      "p7c"
    ]
  },
  "application/pkcs7-signature": {
    source: "iana",
    extensions: [
      "p7s"
    ]
  },
  "application/pkcs8": {
    source: "iana",
    extensions: [
      "p8"
    ]
  },
  "application/pkcs8-encrypted": {
    source: "iana"
  },
  "application/pkix-attr-cert": {
    source: "iana",
    extensions: [
      "ac"
    ]
  },
  "application/pkix-cert": {
    source: "iana",
    extensions: [
      "cer"
    ]
  },
  "application/pkix-crl": {
    source: "iana",
    extensions: [
      "crl"
    ]
  },
  "application/pkix-pkipath": {
    source: "iana",
    extensions: [
      "pkipath"
    ]
  },
  "application/pkixcmp": {
    source: "iana",
    extensions: [
      "pki"
    ]
  },
  "application/pls+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "pls"
    ]
  },
  "application/poc-settings+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/postscript": {
    source: "iana",
    compressible: true,
    extensions: [
      "ai",
      "eps",
      "ps"
    ]
  },
  "application/ppsp-tracker+json": {
    source: "iana",
    compressible: true
  },
  "application/problem+json": {
    source: "iana",
    compressible: true
  },
  "application/problem+xml": {
    source: "iana",
    compressible: true
  },
  "application/provenance+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "provx"
    ]
  },
  "application/prs.alvestrand.titrax-sheet": {
    source: "iana"
  },
  "application/prs.cww": {
    source: "iana",
    extensions: [
      "cww"
    ]
  },
  "application/prs.cyn": {
    source: "iana",
    charset: "7-BIT"
  },
  "application/prs.hpub+zip": {
    source: "iana",
    compressible: false
  },
  "application/prs.nprend": {
    source: "iana"
  },
  "application/prs.plucker": {
    source: "iana"
  },
  "application/prs.rdf-xml-crypt": {
    source: "iana"
  },
  "application/prs.xsf+xml": {
    source: "iana",
    compressible: true
  },
  "application/pskc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "pskcxml"
    ]
  },
  "application/pvd+json": {
    source: "iana",
    compressible: true
  },
  "application/qsig": {
    source: "iana"
  },
  "application/raml+yaml": {
    compressible: true,
    extensions: [
      "raml"
    ]
  },
  "application/raptorfec": {
    source: "iana"
  },
  "application/rdap+json": {
    source: "iana",
    compressible: true
  },
  "application/rdf+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rdf",
      "owl"
    ]
  },
  "application/reginfo+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rif"
    ]
  },
  "application/relax-ng-compact-syntax": {
    source: "iana",
    extensions: [
      "rnc"
    ]
  },
  "application/remote-printing": {
    source: "iana"
  },
  "application/reputon+json": {
    source: "iana",
    compressible: true
  },
  "application/resource-lists+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rl"
    ]
  },
  "application/resource-lists-diff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rld"
    ]
  },
  "application/rfc+xml": {
    source: "iana",
    compressible: true
  },
  "application/riscos": {
    source: "iana"
  },
  "application/rlmi+xml": {
    source: "iana",
    compressible: true
  },
  "application/rls-services+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rs"
    ]
  },
  "application/route-apd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rapd"
    ]
  },
  "application/route-s-tsid+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sls"
    ]
  },
  "application/route-usd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rusd"
    ]
  },
  "application/rpki-ghostbusters": {
    source: "iana",
    extensions: [
      "gbr"
    ]
  },
  "application/rpki-manifest": {
    source: "iana",
    extensions: [
      "mft"
    ]
  },
  "application/rpki-publication": {
    source: "iana"
  },
  "application/rpki-roa": {
    source: "iana",
    extensions: [
      "roa"
    ]
  },
  "application/rpki-updown": {
    source: "iana"
  },
  "application/rsd+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "rsd"
    ]
  },
  "application/rss+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "rss"
    ]
  },
  "application/rtf": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtf"
    ]
  },
  "application/rtploopback": {
    source: "iana"
  },
  "application/rtx": {
    source: "iana"
  },
  "application/samlassertion+xml": {
    source: "iana",
    compressible: true
  },
  "application/samlmetadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/sarif+json": {
    source: "iana",
    compressible: true
  },
  "application/sarif-external-properties+json": {
    source: "iana",
    compressible: true
  },
  "application/sbe": {
    source: "iana"
  },
  "application/sbml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sbml"
    ]
  },
  "application/scaip+xml": {
    source: "iana",
    compressible: true
  },
  "application/scim+json": {
    source: "iana",
    compressible: true
  },
  "application/scvp-cv-request": {
    source: "iana",
    extensions: [
      "scq"
    ]
  },
  "application/scvp-cv-response": {
    source: "iana",
    extensions: [
      "scs"
    ]
  },
  "application/scvp-vp-request": {
    source: "iana",
    extensions: [
      "spq"
    ]
  },
  "application/scvp-vp-response": {
    source: "iana",
    extensions: [
      "spp"
    ]
  },
  "application/sdp": {
    source: "iana",
    extensions: [
      "sdp"
    ]
  },
  "application/secevent+jwt": {
    source: "iana"
  },
  "application/senml+cbor": {
    source: "iana"
  },
  "application/senml+json": {
    source: "iana",
    compressible: true
  },
  "application/senml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "senmlx"
    ]
  },
  "application/senml-etch+cbor": {
    source: "iana"
  },
  "application/senml-etch+json": {
    source: "iana",
    compressible: true
  },
  "application/senml-exi": {
    source: "iana"
  },
  "application/sensml+cbor": {
    source: "iana"
  },
  "application/sensml+json": {
    source: "iana",
    compressible: true
  },
  "application/sensml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sensmlx"
    ]
  },
  "application/sensml-exi": {
    source: "iana"
  },
  "application/sep+xml": {
    source: "iana",
    compressible: true
  },
  "application/sep-exi": {
    source: "iana"
  },
  "application/session-info": {
    source: "iana"
  },
  "application/set-payment": {
    source: "iana"
  },
  "application/set-payment-initiation": {
    source: "iana",
    extensions: [
      "setpay"
    ]
  },
  "application/set-registration": {
    source: "iana"
  },
  "application/set-registration-initiation": {
    source: "iana",
    extensions: [
      "setreg"
    ]
  },
  "application/sgml": {
    source: "iana"
  },
  "application/sgml-open-catalog": {
    source: "iana"
  },
  "application/shf+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "shf"
    ]
  },
  "application/sieve": {
    source: "iana",
    extensions: [
      "siv",
      "sieve"
    ]
  },
  "application/simple-filter+xml": {
    source: "iana",
    compressible: true
  },
  "application/simple-message-summary": {
    source: "iana"
  },
  "application/simplesymbolcontainer": {
    source: "iana"
  },
  "application/sipc": {
    source: "iana"
  },
  "application/slate": {
    source: "iana"
  },
  "application/smil": {
    source: "iana"
  },
  "application/smil+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "smi",
      "smil"
    ]
  },
  "application/smpte336m": {
    source: "iana"
  },
  "application/soap+fastinfoset": {
    source: "iana"
  },
  "application/soap+xml": {
    source: "iana",
    compressible: true
  },
  "application/sparql-query": {
    source: "iana",
    extensions: [
      "rq"
    ]
  },
  "application/sparql-results+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "srx"
    ]
  },
  "application/spdx+json": {
    source: "iana",
    compressible: true
  },
  "application/spirits-event+xml": {
    source: "iana",
    compressible: true
  },
  "application/sql": {
    source: "iana"
  },
  "application/srgs": {
    source: "iana",
    extensions: [
      "gram"
    ]
  },
  "application/srgs+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "grxml"
    ]
  },
  "application/sru+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sru"
    ]
  },
  "application/ssdl+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "ssdl"
    ]
  },
  "application/ssml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ssml"
    ]
  },
  "application/stix+json": {
    source: "iana",
    compressible: true
  },
  "application/swid+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "swidtag"
    ]
  },
  "application/tamp-apex-update": {
    source: "iana"
  },
  "application/tamp-apex-update-confirm": {
    source: "iana"
  },
  "application/tamp-community-update": {
    source: "iana"
  },
  "application/tamp-community-update-confirm": {
    source: "iana"
  },
  "application/tamp-error": {
    source: "iana"
  },
  "application/tamp-sequence-adjust": {
    source: "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    source: "iana"
  },
  "application/tamp-status-query": {
    source: "iana"
  },
  "application/tamp-status-response": {
    source: "iana"
  },
  "application/tamp-update": {
    source: "iana"
  },
  "application/tamp-update-confirm": {
    source: "iana"
  },
  "application/tar": {
    compressible: true
  },
  "application/taxii+json": {
    source: "iana",
    compressible: true
  },
  "application/td+json": {
    source: "iana",
    compressible: true
  },
  "application/tei+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "tei",
      "teicorpus"
    ]
  },
  "application/tetra_isi": {
    source: "iana"
  },
  "application/thraud+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "tfi"
    ]
  },
  "application/timestamp-query": {
    source: "iana"
  },
  "application/timestamp-reply": {
    source: "iana"
  },
  "application/timestamped-data": {
    source: "iana",
    extensions: [
      "tsd"
    ]
  },
  "application/tlsrpt+gzip": {
    source: "iana"
  },
  "application/tlsrpt+json": {
    source: "iana",
    compressible: true
  },
  "application/tnauthlist": {
    source: "iana"
  },
  "application/token-introspection+jwt": {
    source: "iana"
  },
  "application/toml": {
    compressible: true,
    extensions: [
      "toml"
    ]
  },
  "application/trickle-ice-sdpfrag": {
    source: "iana"
  },
  "application/trig": {
    source: "iana",
    extensions: [
      "trig"
    ]
  },
  "application/ttml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ttml"
    ]
  },
  "application/tve-trigger": {
    source: "iana"
  },
  "application/tzif": {
    source: "iana"
  },
  "application/tzif-leap": {
    source: "iana"
  },
  "application/ubjson": {
    compressible: false,
    extensions: [
      "ubj"
    ]
  },
  "application/ulpfec": {
    source: "iana"
  },
  "application/urc-grpsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/urc-ressheet+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rsheet"
    ]
  },
  "application/urc-targetdesc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "td"
    ]
  },
  "application/urc-uisocketdesc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vcard+json": {
    source: "iana",
    compressible: true
  },
  "application/vcard+xml": {
    source: "iana",
    compressible: true
  },
  "application/vemmi": {
    source: "iana"
  },
  "application/vividence.scriptfile": {
    source: "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "1km"
    ]
  },
  "application/vnd.3gpp-prose+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    source: "iana"
  },
  "application/vnd.3gpp.5gnas": {
    source: "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.bsf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.gmop+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.gtpc": {
    source: "iana"
  },
  "application/vnd.3gpp.interworking-data": {
    source: "iana"
  },
  "application/vnd.3gpp.lpp": {
    source: "iana"
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-payload": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-signalling": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mid-call+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.ngap": {
    source: "iana"
  },
  "application/vnd.3gpp.pfcp": {
    source: "iana"
  },
  "application/vnd.3gpp.pic-bw-large": {
    source: "iana",
    extensions: [
      "plb"
    ]
  },
  "application/vnd.3gpp.pic-bw-small": {
    source: "iana",
    extensions: [
      "psb"
    ]
  },
  "application/vnd.3gpp.pic-bw-var": {
    source: "iana",
    extensions: [
      "pvb"
    ]
  },
  "application/vnd.3gpp.s1ap": {
    source: "iana"
  },
  "application/vnd.3gpp.sms": {
    source: "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.ussd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp2.sms": {
    source: "iana"
  },
  "application/vnd.3gpp2.tcap": {
    source: "iana",
    extensions: [
      "tcap"
    ]
  },
  "application/vnd.3lightssoftware.imagescal": {
    source: "iana"
  },
  "application/vnd.3m.post-it-notes": {
    source: "iana",
    extensions: [
      "pwn"
    ]
  },
  "application/vnd.accpac.simply.aso": {
    source: "iana",
    extensions: [
      "aso"
    ]
  },
  "application/vnd.accpac.simply.imp": {
    source: "iana",
    extensions: [
      "imp"
    ]
  },
  "application/vnd.acucobol": {
    source: "iana",
    extensions: [
      "acu"
    ]
  },
  "application/vnd.acucorp": {
    source: "iana",
    extensions: [
      "atc",
      "acutc"
    ]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    source: "apache",
    compressible: false,
    extensions: [
      "air"
    ]
  },
  "application/vnd.adobe.flash.movie": {
    source: "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    source: "iana",
    extensions: [
      "fcdt"
    ]
  },
  "application/vnd.adobe.fxp": {
    source: "iana",
    extensions: [
      "fxp",
      "fxpl"
    ]
  },
  "application/vnd.adobe.partial-upload": {
    source: "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdp"
    ]
  },
  "application/vnd.adobe.xfdf": {
    source: "iana",
    extensions: [
      "xfdf"
    ]
  },
  "application/vnd.aether.imp": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    source: "iana"
  },
  "application/vnd.afpc.cmoca-cmresource": {
    source: "iana"
  },
  "application/vnd.afpc.foca-charset": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    source: "iana"
  },
  "application/vnd.afpc.modca": {
    source: "iana"
  },
  "application/vnd.afpc.modca-cmtable": {
    source: "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    source: "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    source: "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    source: "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    source: "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    source: "iana"
  },
  "application/vnd.age": {
    source: "iana",
    extensions: [
      "age"
    ]
  },
  "application/vnd.ah-barcode": {
    source: "iana"
  },
  "application/vnd.ahead.space": {
    source: "iana",
    extensions: [
      "ahead"
    ]
  },
  "application/vnd.airzip.filesecure.azf": {
    source: "iana",
    extensions: [
      "azf"
    ]
  },
  "application/vnd.airzip.filesecure.azs": {
    source: "iana",
    extensions: [
      "azs"
    ]
  },
  "application/vnd.amadeus+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.amazon.ebook": {
    source: "apache",
    extensions: [
      "azw"
    ]
  },
  "application/vnd.amazon.mobi8-ebook": {
    source: "iana"
  },
  "application/vnd.americandynamics.acc": {
    source: "iana",
    extensions: [
      "acc"
    ]
  },
  "application/vnd.amiga.ami": {
    source: "iana",
    extensions: [
      "ami"
    ]
  },
  "application/vnd.amundsen.maze+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.android.ota": {
    source: "iana"
  },
  "application/vnd.android.package-archive": {
    source: "apache",
    compressible: false,
    extensions: [
      "apk"
    ]
  },
  "application/vnd.anki": {
    source: "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    source: "iana",
    extensions: [
      "cii"
    ]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    source: "apache",
    extensions: [
      "fti"
    ]
  },
  "application/vnd.antix.game-component": {
    source: "iana",
    extensions: [
      "atx"
    ]
  },
  "application/vnd.apache.arrow.file": {
    source: "iana"
  },
  "application/vnd.apache.arrow.stream": {
    source: "iana"
  },
  "application/vnd.apache.thrift.binary": {
    source: "iana"
  },
  "application/vnd.apache.thrift.compact": {
    source: "iana"
  },
  "application/vnd.apache.thrift.json": {
    source: "iana"
  },
  "application/vnd.api+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.aplextor.warrp+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.apothekende.reservation+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.apple.installer+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpkg"
    ]
  },
  "application/vnd.apple.keynote": {
    source: "iana",
    extensions: [
      "key"
    ]
  },
  "application/vnd.apple.mpegurl": {
    source: "iana",
    extensions: [
      "m3u8"
    ]
  },
  "application/vnd.apple.numbers": {
    source: "iana",
    extensions: [
      "numbers"
    ]
  },
  "application/vnd.apple.pages": {
    source: "iana",
    extensions: [
      "pages"
    ]
  },
  "application/vnd.apple.pkpass": {
    compressible: false,
    extensions: [
      "pkpass"
    ]
  },
  "application/vnd.arastra.swi": {
    source: "iana"
  },
  "application/vnd.aristanetworks.swi": {
    source: "iana",
    extensions: [
      "swi"
    ]
  },
  "application/vnd.artisan+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.artsquare": {
    source: "iana"
  },
  "application/vnd.astraea-software.iota": {
    source: "iana",
    extensions: [
      "iota"
    ]
  },
  "application/vnd.audiograph": {
    source: "iana",
    extensions: [
      "aep"
    ]
  },
  "application/vnd.autopackage": {
    source: "iana"
  },
  "application/vnd.avalon+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.avistar+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.balsamiq.bmml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "bmml"
    ]
  },
  "application/vnd.balsamiq.bmpr": {
    source: "iana"
  },
  "application/vnd.banana-accounting": {
    source: "iana"
  },
  "application/vnd.bbf.usp.error": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.bekitzur-stech+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.bint.med-content": {
    source: "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.blink-idb-value-wrapper": {
    source: "iana"
  },
  "application/vnd.blueice.multipass": {
    source: "iana",
    extensions: [
      "mpm"
    ]
  },
  "application/vnd.bluetooth.ep.oob": {
    source: "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    source: "iana"
  },
  "application/vnd.bmi": {
    source: "iana",
    extensions: [
      "bmi"
    ]
  },
  "application/vnd.bpf": {
    source: "iana"
  },
  "application/vnd.bpf3": {
    source: "iana"
  },
  "application/vnd.businessobjects": {
    source: "iana",
    extensions: [
      "rep"
    ]
  },
  "application/vnd.byu.uapi+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cab-jscript": {
    source: "iana"
  },
  "application/vnd.canon-cpdl": {
    source: "iana"
  },
  "application/vnd.canon-lips": {
    source: "iana"
  },
  "application/vnd.capasystems-pg+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    source: "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    source: "iana"
  },
  "application/vnd.chemdraw+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cdxml"
    ]
  },
  "application/vnd.chess-pgn": {
    source: "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    source: "iana",
    extensions: [
      "mmd"
    ]
  },
  "application/vnd.ciedi": {
    source: "iana"
  },
  "application/vnd.cinderella": {
    source: "iana",
    extensions: [
      "cdy"
    ]
  },
  "application/vnd.cirpack.isdn-ext": {
    source: "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "csl"
    ]
  },
  "application/vnd.claymore": {
    source: "iana",
    extensions: [
      "cla"
    ]
  },
  "application/vnd.cloanto.rp9": {
    source: "iana",
    extensions: [
      "rp9"
    ]
  },
  "application/vnd.clonk.c4group": {
    source: "iana",
    extensions: [
      "c4g",
      "c4d",
      "c4f",
      "c4p",
      "c4u"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    source: "iana",
    extensions: [
      "c11amc"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    source: "iana",
    extensions: [
      "c11amz"
    ]
  },
  "application/vnd.coffeescript": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    source: "iana"
  },
  "application/vnd.collection+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.collection.doc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.collection.next+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.comicbook+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.comicbook-rar": {
    source: "iana"
  },
  "application/vnd.commerce-battelle": {
    source: "iana"
  },
  "application/vnd.commonspace": {
    source: "iana",
    extensions: [
      "csp"
    ]
  },
  "application/vnd.contact.cmsg": {
    source: "iana",
    extensions: [
      "cdbcmsg"
    ]
  },
  "application/vnd.coreos.ignition+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cosmocaller": {
    source: "iana",
    extensions: [
      "cmc"
    ]
  },
  "application/vnd.crick.clicker": {
    source: "iana",
    extensions: [
      "clkx"
    ]
  },
  "application/vnd.crick.clicker.keyboard": {
    source: "iana",
    extensions: [
      "clkk"
    ]
  },
  "application/vnd.crick.clicker.palette": {
    source: "iana",
    extensions: [
      "clkp"
    ]
  },
  "application/vnd.crick.clicker.template": {
    source: "iana",
    extensions: [
      "clkt"
    ]
  },
  "application/vnd.crick.clicker.wordbank": {
    source: "iana",
    extensions: [
      "clkw"
    ]
  },
  "application/vnd.criticaltools.wbs+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wbs"
    ]
  },
  "application/vnd.cryptii.pipe+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.crypto-shade-file": {
    source: "iana"
  },
  "application/vnd.cryptomator.encrypted": {
    source: "iana"
  },
  "application/vnd.cryptomator.vault": {
    source: "iana"
  },
  "application/vnd.ctc-posml": {
    source: "iana",
    extensions: [
      "pml"
    ]
  },
  "application/vnd.ctct.ws+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cups-pdf": {
    source: "iana"
  },
  "application/vnd.cups-postscript": {
    source: "iana"
  },
  "application/vnd.cups-ppd": {
    source: "iana",
    extensions: [
      "ppd"
    ]
  },
  "application/vnd.cups-raster": {
    source: "iana"
  },
  "application/vnd.cups-raw": {
    source: "iana"
  },
  "application/vnd.curl": {
    source: "iana"
  },
  "application/vnd.curl.car": {
    source: "apache",
    extensions: [
      "car"
    ]
  },
  "application/vnd.curl.pcurl": {
    source: "apache",
    extensions: [
      "pcurl"
    ]
  },
  "application/vnd.cyan.dean.root+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cybank": {
    source: "iana"
  },
  "application/vnd.cyclonedx+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cyclonedx+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.d3m-dataset": {
    source: "iana"
  },
  "application/vnd.d3m-problem": {
    source: "iana"
  },
  "application/vnd.dart": {
    source: "iana",
    compressible: true,
    extensions: [
      "dart"
    ]
  },
  "application/vnd.data-vision.rdz": {
    source: "iana",
    extensions: [
      "rdz"
    ]
  },
  "application/vnd.datapackage+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dataresource+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dbf": {
    source: "iana",
    extensions: [
      "dbf"
    ]
  },
  "application/vnd.debian.binary-package": {
    source: "iana"
  },
  "application/vnd.dece.data": {
    source: "iana",
    extensions: [
      "uvf",
      "uvvf",
      "uvd",
      "uvvd"
    ]
  },
  "application/vnd.dece.ttml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "uvt",
      "uvvt"
    ]
  },
  "application/vnd.dece.unspecified": {
    source: "iana",
    extensions: [
      "uvx",
      "uvvx"
    ]
  },
  "application/vnd.dece.zip": {
    source: "iana",
    extensions: [
      "uvz",
      "uvvz"
    ]
  },
  "application/vnd.denovo.fcselayout-link": {
    source: "iana",
    extensions: [
      "fe_launch"
    ]
  },
  "application/vnd.desmume.movie": {
    source: "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    source: "iana"
  },
  "application/vnd.dm.delegation+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dna": {
    source: "iana",
    extensions: [
      "dna"
    ]
  },
  "application/vnd.document+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dolby.mlp": {
    source: "apache",
    extensions: [
      "mlp"
    ]
  },
  "application/vnd.dolby.mobile.1": {
    source: "iana"
  },
  "application/vnd.dolby.mobile.2": {
    source: "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    source: "iana"
  },
  "application/vnd.dpgraph": {
    source: "iana",
    extensions: [
      "dpg"
    ]
  },
  "application/vnd.dreamfactory": {
    source: "iana",
    extensions: [
      "dfac"
    ]
  },
  "application/vnd.drive+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ds-keypoint": {
    source: "apache",
    extensions: [
      "kpxx"
    ]
  },
  "application/vnd.dtg.local": {
    source: "iana"
  },
  "application/vnd.dtg.local.flash": {
    source: "iana"
  },
  "application/vnd.dtg.local.html": {
    source: "iana"
  },
  "application/vnd.dvb.ait": {
    source: "iana",
    extensions: [
      "ait"
    ]
  },
  "application/vnd.dvb.dvbisl+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.dvbj": {
    source: "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    source: "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-container+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-generic+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-init+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.pfr": {
    source: "iana"
  },
  "application/vnd.dvb.service": {
    source: "iana",
    extensions: [
      "svc"
    ]
  },
  "application/vnd.dxr": {
    source: "iana"
  },
  "application/vnd.dynageo": {
    source: "iana",
    extensions: [
      "geo"
    ]
  },
  "application/vnd.dzr": {
    source: "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    source: "iana"
  },
  "application/vnd.ecdis-update": {
    source: "iana"
  },
  "application/vnd.ecip.rlp": {
    source: "iana"
  },
  "application/vnd.eclipse.ditto+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ecowin.chart": {
    source: "iana",
    extensions: [
      "mag"
    ]
  },
  "application/vnd.ecowin.filerequest": {
    source: "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    source: "iana"
  },
  "application/vnd.ecowin.series": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    source: "iana"
  },
  "application/vnd.efi.img": {
    source: "iana"
  },
  "application/vnd.efi.iso": {
    source: "iana"
  },
  "application/vnd.emclient.accessrequest+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.enliven": {
    source: "iana",
    extensions: [
      "nml"
    ]
  },
  "application/vnd.enphase.envoy": {
    source: "iana"
  },
  "application/vnd.eprints.data+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.epson.esf": {
    source: "iana",
    extensions: [
      "esf"
    ]
  },
  "application/vnd.epson.msf": {
    source: "iana",
    extensions: [
      "msf"
    ]
  },
  "application/vnd.epson.quickanime": {
    source: "iana",
    extensions: [
      "qam"
    ]
  },
  "application/vnd.epson.salt": {
    source: "iana",
    extensions: [
      "slt"
    ]
  },
  "application/vnd.epson.ssf": {
    source: "iana",
    extensions: [
      "ssf"
    ]
  },
  "application/vnd.ericsson.quickcall": {
    source: "iana"
  },
  "application/vnd.espass-espass+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.eszigno3+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "es3",
      "et3"
    ]
  },
  "application/vnd.etsi.aoc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.asic-e+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.etsi.asic-s+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.etsi.cug+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvcommand+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvservice+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsync+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.mcid+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.mheg5": {
    source: "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.pstn+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.sci+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.simservs+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.timestamp-token": {
    source: "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.tsl.der": {
    source: "iana"
  },
  "application/vnd.eu.kasparian.car+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.eudora.data": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    source: "iana"
  },
  "application/vnd.exstream-empower+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.exstream-package": {
    source: "iana"
  },
  "application/vnd.ezpix-album": {
    source: "iana",
    extensions: [
      "ez2"
    ]
  },
  "application/vnd.ezpix-package": {
    source: "iana",
    extensions: [
      "ez3"
    ]
  },
  "application/vnd.f-secure.mobile": {
    source: "iana"
  },
  "application/vnd.familysearch.gedcom+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.fastcopy-disk-image": {
    source: "iana"
  },
  "application/vnd.fdf": {
    source: "iana",
    extensions: [
      "fdf"
    ]
  },
  "application/vnd.fdsn.mseed": {
    source: "iana",
    extensions: [
      "mseed"
    ]
  },
  "application/vnd.fdsn.seed": {
    source: "iana",
    extensions: [
      "seed",
      "dataless"
    ]
  },
  "application/vnd.ffsns": {
    source: "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.filmit.zfc": {
    source: "iana"
  },
  "application/vnd.fints": {
    source: "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    source: "iana"
  },
  "application/vnd.flographit": {
    source: "iana",
    extensions: [
      "gph"
    ]
  },
  "application/vnd.fluxtime.clip": {
    source: "iana",
    extensions: [
      "ftc"
    ]
  },
  "application/vnd.font-fontforge-sfd": {
    source: "iana"
  },
  "application/vnd.framemaker": {
    source: "iana",
    extensions: [
      "fm",
      "frame",
      "maker",
      "book"
    ]
  },
  "application/vnd.frogans.fnc": {
    source: "iana",
    extensions: [
      "fnc"
    ]
  },
  "application/vnd.frogans.ltf": {
    source: "iana",
    extensions: [
      "ltf"
    ]
  },
  "application/vnd.fsc.weblaunch": {
    source: "iana",
    extensions: [
      "fsc"
    ]
  },
  "application/vnd.fujifilm.fb.docuworks": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.binder": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.jfi+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.fujitsu.oasys": {
    source: "iana",
    extensions: [
      "oas"
    ]
  },
  "application/vnd.fujitsu.oasys2": {
    source: "iana",
    extensions: [
      "oa2"
    ]
  },
  "application/vnd.fujitsu.oasys3": {
    source: "iana",
    extensions: [
      "oa3"
    ]
  },
  "application/vnd.fujitsu.oasysgp": {
    source: "iana",
    extensions: [
      "fg5"
    ]
  },
  "application/vnd.fujitsu.oasysprs": {
    source: "iana",
    extensions: [
      "bh2"
    ]
  },
  "application/vnd.fujixerox.art-ex": {
    source: "iana"
  },
  "application/vnd.fujixerox.art4": {
    source: "iana"
  },
  "application/vnd.fujixerox.ddd": {
    source: "iana",
    extensions: [
      "ddd"
    ]
  },
  "application/vnd.fujixerox.docuworks": {
    source: "iana",
    extensions: [
      "xdw"
    ]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    source: "iana",
    extensions: [
      "xbd"
    ]
  },
  "application/vnd.fujixerox.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    source: "iana"
  },
  "application/vnd.fut-misnet": {
    source: "iana"
  },
  "application/vnd.futoin+cbor": {
    source: "iana"
  },
  "application/vnd.futoin+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.fuzzysheet": {
    source: "iana",
    extensions: [
      "fzs"
    ]
  },
  "application/vnd.genomatix.tuxedo": {
    source: "iana",
    extensions: [
      "txd"
    ]
  },
  "application/vnd.gentics.grd+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geo+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geocube+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geogebra.file": {
    source: "iana",
    extensions: [
      "ggb"
    ]
  },
  "application/vnd.geogebra.slides": {
    source: "iana"
  },
  "application/vnd.geogebra.tool": {
    source: "iana",
    extensions: [
      "ggt"
    ]
  },
  "application/vnd.geometry-explorer": {
    source: "iana",
    extensions: [
      "gex",
      "gre"
    ]
  },
  "application/vnd.geonext": {
    source: "iana",
    extensions: [
      "gxt"
    ]
  },
  "application/vnd.geoplan": {
    source: "iana",
    extensions: [
      "g2w"
    ]
  },
  "application/vnd.geospace": {
    source: "iana",
    extensions: [
      "g3w"
    ]
  },
  "application/vnd.gerber": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    source: "iana"
  },
  "application/vnd.gmx": {
    source: "iana",
    extensions: [
      "gmx"
    ]
  },
  "application/vnd.google-apps.document": {
    compressible: false,
    extensions: [
      "gdoc"
    ]
  },
  "application/vnd.google-apps.presentation": {
    compressible: false,
    extensions: [
      "gslides"
    ]
  },
  "application/vnd.google-apps.spreadsheet": {
    compressible: false,
    extensions: [
      "gsheet"
    ]
  },
  "application/vnd.google-earth.kml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "kml"
    ]
  },
  "application/vnd.google-earth.kmz": {
    source: "iana",
    compressible: false,
    extensions: [
      "kmz"
    ]
  },
  "application/vnd.gov.sk.e-form+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.gov.sk.e-form+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.grafeq": {
    source: "iana",
    extensions: [
      "gqf",
      "gqs"
    ]
  },
  "application/vnd.gridmp": {
    source: "iana"
  },
  "application/vnd.groove-account": {
    source: "iana",
    extensions: [
      "gac"
    ]
  },
  "application/vnd.groove-help": {
    source: "iana",
    extensions: [
      "ghf"
    ]
  },
  "application/vnd.groove-identity-message": {
    source: "iana",
    extensions: [
      "gim"
    ]
  },
  "application/vnd.groove-injector": {
    source: "iana",
    extensions: [
      "grv"
    ]
  },
  "application/vnd.groove-tool-message": {
    source: "iana",
    extensions: [
      "gtm"
    ]
  },
  "application/vnd.groove-tool-template": {
    source: "iana",
    extensions: [
      "tpl"
    ]
  },
  "application/vnd.groove-vcard": {
    source: "iana",
    extensions: [
      "vcg"
    ]
  },
  "application/vnd.hal+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hal+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "hal"
    ]
  },
  "application/vnd.handheld-entertainment+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "zmm"
    ]
  },
  "application/vnd.hbci": {
    source: "iana",
    extensions: [
      "hbci"
    ]
  },
  "application/vnd.hc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hcl-bireports": {
    source: "iana"
  },
  "application/vnd.hdt": {
    source: "iana"
  },
  "application/vnd.heroku+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hhe.lesson-player": {
    source: "iana",
    extensions: [
      "les"
    ]
  },
  "application/vnd.hl7cda+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.hl7v2+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.hp-hpgl": {
    source: "iana",
    extensions: [
      "hpgl"
    ]
  },
  "application/vnd.hp-hpid": {
    source: "iana",
    extensions: [
      "hpid"
    ]
  },
  "application/vnd.hp-hps": {
    source: "iana",
    extensions: [
      "hps"
    ]
  },
  "application/vnd.hp-jlyt": {
    source: "iana",
    extensions: [
      "jlt"
    ]
  },
  "application/vnd.hp-pcl": {
    source: "iana",
    extensions: [
      "pcl"
    ]
  },
  "application/vnd.hp-pclxl": {
    source: "iana",
    extensions: [
      "pclxl"
    ]
  },
  "application/vnd.httphone": {
    source: "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    source: "iana",
    extensions: [
      "sfd-hdstx"
    ]
  },
  "application/vnd.hyper+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hyper-item+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hyperdrive+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hzn-3d-crossword": {
    source: "iana"
  },
  "application/vnd.ibm.afplinedata": {
    source: "iana"
  },
  "application/vnd.ibm.electronic-media": {
    source: "iana"
  },
  "application/vnd.ibm.minipay": {
    source: "iana",
    extensions: [
      "mpy"
    ]
  },
  "application/vnd.ibm.modcap": {
    source: "iana",
    extensions: [
      "afp",
      "listafp",
      "list3820"
    ]
  },
  "application/vnd.ibm.rights-management": {
    source: "iana",
    extensions: [
      "irm"
    ]
  },
  "application/vnd.ibm.secure-container": {
    source: "iana",
    extensions: [
      "sc"
    ]
  },
  "application/vnd.iccprofile": {
    source: "iana",
    extensions: [
      "icc",
      "icm"
    ]
  },
  "application/vnd.ieee.1905": {
    source: "iana"
  },
  "application/vnd.igloader": {
    source: "iana",
    extensions: [
      "igl"
    ]
  },
  "application/vnd.imagemeter.folder+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.imagemeter.image+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.immervision-ivp": {
    source: "iana",
    extensions: [
      "ivp"
    ]
  },
  "application/vnd.immervision-ivu": {
    source: "iana",
    extensions: [
      "ivu"
    ]
  },
  "application/vnd.ims.imsccv1p1": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    source: "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.informedcontrol.rms+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.informix-visionary": {
    source: "iana"
  },
  "application/vnd.infotech.project": {
    source: "iana"
  },
  "application/vnd.infotech.project+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.innopath.wamp.notification": {
    source: "iana"
  },
  "application/vnd.insors.igm": {
    source: "iana",
    extensions: [
      "igm"
    ]
  },
  "application/vnd.intercon.formnet": {
    source: "iana",
    extensions: [
      "xpw",
      "xpx"
    ]
  },
  "application/vnd.intergeo": {
    source: "iana",
    extensions: [
      "i2g"
    ]
  },
  "application/vnd.intertrust.digibox": {
    source: "iana"
  },
  "application/vnd.intertrust.nncp": {
    source: "iana"
  },
  "application/vnd.intu.qbo": {
    source: "iana",
    extensions: [
      "qbo"
    ]
  },
  "application/vnd.intu.qfx": {
    source: "iana",
    extensions: [
      "qfx"
    ]
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ipunplugged.rcprofile": {
    source: "iana",
    extensions: [
      "rcprofile"
    ]
  },
  "application/vnd.irepository.package+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "irp"
    ]
  },
  "application/vnd.is-xpr": {
    source: "iana",
    extensions: [
      "xpr"
    ]
  },
  "application/vnd.isac.fcs": {
    source: "iana",
    extensions: [
      "fcs"
    ]
  },
  "application/vnd.iso11783-10+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.jam": {
    source: "iana",
    extensions: [
      "jam"
    ]
  },
  "application/vnd.japannet-directory-service": {
    source: "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-registration": {
    source: "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-verification": {
    source: "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    source: "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    source: "iana",
    extensions: [
      "rms"
    ]
  },
  "application/vnd.jisp": {
    source: "iana",
    extensions: [
      "jisp"
    ]
  },
  "application/vnd.joost.joda-archive": {
    source: "iana",
    extensions: [
      "joda"
    ]
  },
  "application/vnd.jsk.isdn-ngn": {
    source: "iana"
  },
  "application/vnd.kahootz": {
    source: "iana",
    extensions: [
      "ktz",
      "ktr"
    ]
  },
  "application/vnd.kde.karbon": {
    source: "iana",
    extensions: [
      "karbon"
    ]
  },
  "application/vnd.kde.kchart": {
    source: "iana",
    extensions: [
      "chrt"
    ]
  },
  "application/vnd.kde.kformula": {
    source: "iana",
    extensions: [
      "kfo"
    ]
  },
  "application/vnd.kde.kivio": {
    source: "iana",
    extensions: [
      "flw"
    ]
  },
  "application/vnd.kde.kontour": {
    source: "iana",
    extensions: [
      "kon"
    ]
  },
  "application/vnd.kde.kpresenter": {
    source: "iana",
    extensions: [
      "kpr",
      "kpt"
    ]
  },
  "application/vnd.kde.kspread": {
    source: "iana",
    extensions: [
      "ksp"
    ]
  },
  "application/vnd.kde.kword": {
    source: "iana",
    extensions: [
      "kwd",
      "kwt"
    ]
  },
  "application/vnd.kenameaapp": {
    source: "iana",
    extensions: [
      "htke"
    ]
  },
  "application/vnd.kidspiration": {
    source: "iana",
    extensions: [
      "kia"
    ]
  },
  "application/vnd.kinar": {
    source: "iana",
    extensions: [
      "kne",
      "knp"
    ]
  },
  "application/vnd.koan": {
    source: "iana",
    extensions: [
      "skp",
      "skd",
      "skt",
      "skm"
    ]
  },
  "application/vnd.kodak-descriptor": {
    source: "iana",
    extensions: [
      "sse"
    ]
  },
  "application/vnd.las": {
    source: "iana"
  },
  "application/vnd.las.las+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.las.las+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lasxml"
    ]
  },
  "application/vnd.laszip": {
    source: "iana"
  },
  "application/vnd.leap+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.liberty-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    source: "iana",
    extensions: [
      "lbd"
    ]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lbe"
    ]
  },
  "application/vnd.logipipe.circuit+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.loom": {
    source: "iana"
  },
  "application/vnd.lotus-1-2-3": {
    source: "iana",
    extensions: [
      "123"
    ]
  },
  "application/vnd.lotus-approach": {
    source: "iana",
    extensions: [
      "apr"
    ]
  },
  "application/vnd.lotus-freelance": {
    source: "iana",
    extensions: [
      "pre"
    ]
  },
  "application/vnd.lotus-notes": {
    source: "iana",
    extensions: [
      "nsf"
    ]
  },
  "application/vnd.lotus-organizer": {
    source: "iana",
    extensions: [
      "org"
    ]
  },
  "application/vnd.lotus-screencam": {
    source: "iana",
    extensions: [
      "scm"
    ]
  },
  "application/vnd.lotus-wordpro": {
    source: "iana",
    extensions: [
      "lwp"
    ]
  },
  "application/vnd.macports.portpkg": {
    source: "iana",
    extensions: [
      "portpkg"
    ]
  },
  "application/vnd.mapbox-vector-tile": {
    source: "iana",
    extensions: [
      "mvt"
    ]
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.license+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.mdcf": {
    source: "iana"
  },
  "application/vnd.mason+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.maxar.archive.3tz+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.maxmind.maxmind-db": {
    source: "iana"
  },
  "application/vnd.mcd": {
    source: "iana",
    extensions: [
      "mcd"
    ]
  },
  "application/vnd.medcalcdata": {
    source: "iana",
    extensions: [
      "mc1"
    ]
  },
  "application/vnd.mediastation.cdkey": {
    source: "iana",
    extensions: [
      "cdkey"
    ]
  },
  "application/vnd.meridian-slingshot": {
    source: "iana"
  },
  "application/vnd.mfer": {
    source: "iana",
    extensions: [
      "mwf"
    ]
  },
  "application/vnd.mfmp": {
    source: "iana",
    extensions: [
      "mfm"
    ]
  },
  "application/vnd.micro+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.micrografx.flo": {
    source: "iana",
    extensions: [
      "flo"
    ]
  },
  "application/vnd.micrografx.igx": {
    source: "iana",
    extensions: [
      "igx"
    ]
  },
  "application/vnd.microsoft.portable-executable": {
    source: "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    source: "iana"
  },
  "application/vnd.miele+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.mif": {
    source: "iana",
    extensions: [
      "mif"
    ]
  },
  "application/vnd.minisoft-hp3000-save": {
    source: "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    source: "iana"
  },
  "application/vnd.mobius.daf": {
    source: "iana",
    extensions: [
      "daf"
    ]
  },
  "application/vnd.mobius.dis": {
    source: "iana",
    extensions: [
      "dis"
    ]
  },
  "application/vnd.mobius.mbk": {
    source: "iana",
    extensions: [
      "mbk"
    ]
  },
  "application/vnd.mobius.mqy": {
    source: "iana",
    extensions: [
      "mqy"
    ]
  },
  "application/vnd.mobius.msl": {
    source: "iana",
    extensions: [
      "msl"
    ]
  },
  "application/vnd.mobius.plc": {
    source: "iana",
    extensions: [
      "plc"
    ]
  },
  "application/vnd.mobius.txf": {
    source: "iana",
    extensions: [
      "txf"
    ]
  },
  "application/vnd.mophun.application": {
    source: "iana",
    extensions: [
      "mpn"
    ]
  },
  "application/vnd.mophun.certificate": {
    source: "iana",
    extensions: [
      "mpc"
    ]
  },
  "application/vnd.motorola.flexsuite": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    source: "iana"
  },
  "application/vnd.motorola.iprm": {
    source: "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xul"
    ]
  },
  "application/vnd.ms-3mfdocument": {
    source: "iana"
  },
  "application/vnd.ms-artgalry": {
    source: "iana",
    extensions: [
      "cil"
    ]
  },
  "application/vnd.ms-asf": {
    source: "iana"
  },
  "application/vnd.ms-cab-compressed": {
    source: "iana",
    extensions: [
      "cab"
    ]
  },
  "application/vnd.ms-color.iccprofile": {
    source: "apache"
  },
  "application/vnd.ms-excel": {
    source: "iana",
    compressible: false,
    extensions: [
      "xls",
      "xlm",
      "xla",
      "xlc",
      "xlt",
      "xlw"
    ]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlam"
    ]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsb"
    ]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsm"
    ]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "xltm"
    ]
  },
  "application/vnd.ms-fontobject": {
    source: "iana",
    compressible: true,
    extensions: [
      "eot"
    ]
  },
  "application/vnd.ms-htmlhelp": {
    source: "iana",
    extensions: [
      "chm"
    ]
  },
  "application/vnd.ms-ims": {
    source: "iana",
    extensions: [
      "ims"
    ]
  },
  "application/vnd.ms-lrm": {
    source: "iana",
    extensions: [
      "lrm"
    ]
  },
  "application/vnd.ms-office.activex+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-officetheme": {
    source: "iana",
    extensions: [
      "thmx"
    ]
  },
  "application/vnd.ms-opentype": {
    source: "apache",
    compressible: true
  },
  "application/vnd.ms-outlook": {
    compressible: false,
    extensions: [
      "msg"
    ]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    source: "apache"
  },
  "application/vnd.ms-pki.seccat": {
    source: "apache",
    extensions: [
      "cat"
    ]
  },
  "application/vnd.ms-pki.stl": {
    source: "apache",
    extensions: [
      "stl"
    ]
  },
  "application/vnd.ms-playready.initiator+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-powerpoint": {
    source: "iana",
    compressible: false,
    extensions: [
      "ppt",
      "pps",
      "pot"
    ]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppam"
    ]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    source: "iana",
    extensions: [
      "pptm"
    ]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    source: "iana",
    extensions: [
      "sldm"
    ]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppsm"
    ]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "potm"
    ]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-printing.printticket+xml": {
    source: "apache",
    compressible: true
  },
  "application/vnd.ms-printschematicket+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-project": {
    source: "iana",
    extensions: [
      "mpp",
      "mpt"
    ]
  },
  "application/vnd.ms-tnef": {
    source: "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    source: "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    source: "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    source: "iana",
    extensions: [
      "docm"
    ]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "dotm"
    ]
  },
  "application/vnd.ms-works": {
    source: "iana",
    extensions: [
      "wps",
      "wks",
      "wcm",
      "wdb"
    ]
  },
  "application/vnd.ms-wpl": {
    source: "iana",
    extensions: [
      "wpl"
    ]
  },
  "application/vnd.ms-xpsdocument": {
    source: "iana",
    compressible: false,
    extensions: [
      "xps"
    ]
  },
  "application/vnd.msa-disk-image": {
    source: "iana"
  },
  "application/vnd.mseq": {
    source: "iana",
    extensions: [
      "mseq"
    ]
  },
  "application/vnd.msign": {
    source: "iana"
  },
  "application/vnd.multiad.creator": {
    source: "iana"
  },
  "application/vnd.multiad.creator.cif": {
    source: "iana"
  },
  "application/vnd.music-niff": {
    source: "iana"
  },
  "application/vnd.musician": {
    source: "iana",
    extensions: [
      "mus"
    ]
  },
  "application/vnd.muvee.style": {
    source: "iana",
    extensions: [
      "msty"
    ]
  },
  "application/vnd.mynfc": {
    source: "iana",
    extensions: [
      "taglet"
    ]
  },
  "application/vnd.nacamar.ybrid+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ncd.control": {
    source: "iana"
  },
  "application/vnd.ncd.reference": {
    source: "iana"
  },
  "application/vnd.nearst.inv+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nebumind.line": {
    source: "iana"
  },
  "application/vnd.nervana": {
    source: "iana"
  },
  "application/vnd.netfpx": {
    source: "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    source: "iana",
    extensions: [
      "nlu"
    ]
  },
  "application/vnd.nimn": {
    source: "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    source: "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    source: "iana"
  },
  "application/vnd.nitf": {
    source: "iana",
    extensions: [
      "ntf",
      "nitf"
    ]
  },
  "application/vnd.noblenet-directory": {
    source: "iana",
    extensions: [
      "nnd"
    ]
  },
  "application/vnd.noblenet-sealer": {
    source: "iana",
    extensions: [
      "nns"
    ]
  },
  "application/vnd.noblenet-web": {
    source: "iana",
    extensions: [
      "nnw"
    ]
  },
  "application/vnd.nokia.catalogs": {
    source: "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.conml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.iptv.config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.isds-radio-presets": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ac"
    ]
  },
  "application/vnd.nokia.n-gage.data": {
    source: "iana",
    extensions: [
      "ngdat"
    ]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    source: "iana",
    extensions: [
      "n-gage"
    ]
  },
  "application/vnd.nokia.ncd": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.radio-preset": {
    source: "iana",
    extensions: [
      "rpst"
    ]
  },
  "application/vnd.nokia.radio-presets": {
    source: "iana",
    extensions: [
      "rpss"
    ]
  },
  "application/vnd.novadigm.edm": {
    source: "iana",
    extensions: [
      "edm"
    ]
  },
  "application/vnd.novadigm.edx": {
    source: "iana",
    extensions: [
      "edx"
    ]
  },
  "application/vnd.novadigm.ext": {
    source: "iana",
    extensions: [
      "ext"
    ]
  },
  "application/vnd.ntt-local.content-share": {
    source: "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    source: "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    source: "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    source: "iana",
    extensions: [
      "odc"
    ]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    source: "iana",
    extensions: [
      "otc"
    ]
  },
  "application/vnd.oasis.opendocument.database": {
    source: "iana",
    extensions: [
      "odb"
    ]
  },
  "application/vnd.oasis.opendocument.formula": {
    source: "iana",
    extensions: [
      "odf"
    ]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    source: "iana",
    extensions: [
      "odft"
    ]
  },
  "application/vnd.oasis.opendocument.graphics": {
    source: "iana",
    compressible: false,
    extensions: [
      "odg"
    ]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    source: "iana",
    extensions: [
      "otg"
    ]
  },
  "application/vnd.oasis.opendocument.image": {
    source: "iana",
    extensions: [
      "odi"
    ]
  },
  "application/vnd.oasis.opendocument.image-template": {
    source: "iana",
    extensions: [
      "oti"
    ]
  },
  "application/vnd.oasis.opendocument.presentation": {
    source: "iana",
    compressible: false,
    extensions: [
      "odp"
    ]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    source: "iana",
    extensions: [
      "otp"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    source: "iana",
    compressible: false,
    extensions: [
      "ods"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    source: "iana",
    extensions: [
      "ots"
    ]
  },
  "application/vnd.oasis.opendocument.text": {
    source: "iana",
    compressible: false,
    extensions: [
      "odt"
    ]
  },
  "application/vnd.oasis.opendocument.text-master": {
    source: "iana",
    extensions: [
      "odm"
    ]
  },
  "application/vnd.oasis.opendocument.text-template": {
    source: "iana",
    extensions: [
      "ott"
    ]
  },
  "application/vnd.oasis.opendocument.text-web": {
    source: "iana",
    extensions: [
      "oth"
    ]
  },
  "application/vnd.obn": {
    source: "iana"
  },
  "application/vnd.ocf+cbor": {
    source: "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oftn.l10n+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.cspg-hexbinary": {
    source: "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.pae.gem": {
    source: "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.spdlist+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.ueprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.userprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.olpc-sugar": {
    source: "iana",
    extensions: [
      "xo"
    ]
  },
  "application/vnd.oma-scws-config": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-request": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-response": {
    source: "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.imd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.ltkm": {
    source: "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.sgdu": {
    source: "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    source: "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.sprov+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.stkm": {
    source: "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-pcc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.dcd": {
    source: "iana"
  },
  "application/vnd.oma.dcdc": {
    source: "iana"
  },
  "application/vnd.oma.dd2+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dd2"
    ]
  },
  "application/vnd.oma.drm.risd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.group-usage-list+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.lwm2m+cbor": {
    source: "iana"
  },
  "application/vnd.oma.lwm2m+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.lwm2m+tlv": {
    source: "iana"
  },
  "application/vnd.oma.pal+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.final-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.groups+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.push": {
    source: "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.xcap-directory+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.omads-email+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omads-file+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omads-folder+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omaloc-supl-init": {
    source: "iana"
  },
  "application/vnd.onepager": {
    source: "iana"
  },
  "application/vnd.onepagertamp": {
    source: "iana"
  },
  "application/vnd.onepagertamx": {
    source: "iana"
  },
  "application/vnd.onepagertat": {
    source: "iana"
  },
  "application/vnd.onepagertatp": {
    source: "iana"
  },
  "application/vnd.onepagertatx": {
    source: "iana"
  },
  "application/vnd.openblox.game+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "obgx"
    ]
  },
  "application/vnd.openblox.game-binary": {
    source: "iana"
  },
  "application/vnd.openeye.oeb": {
    source: "iana"
  },
  "application/vnd.openofficeorg.extension": {
    source: "apache",
    extensions: [
      "oxt"
    ]
  },
  "application/vnd.openstreetmap.data+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "osm"
    ]
  },
  "application/vnd.opentimestamps.ots": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    source: "iana",
    compressible: false,
    extensions: [
      "pptx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    source: "iana",
    extensions: [
      "sldx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    source: "iana",
    extensions: [
      "ppsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    source: "iana",
    extensions: [
      "potx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    source: "iana",
    compressible: false,
    extensions: [
      "xlsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    source: "iana",
    extensions: [
      "xltx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    source: "iana",
    compressible: false,
    extensions: [
      "docx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    source: "iana",
    extensions: [
      "dotx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oracle.resource+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.orange.indata": {
    source: "iana"
  },
  "application/vnd.osa.netdeploy": {
    source: "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    source: "iana",
    extensions: [
      "mgp"
    ]
  },
  "application/vnd.osgi.bundle": {
    source: "iana"
  },
  "application/vnd.osgi.dp": {
    source: "iana",
    extensions: [
      "dp"
    ]
  },
  "application/vnd.osgi.subsystem": {
    source: "iana",
    extensions: [
      "esa"
    ]
  },
  "application/vnd.otps.ct-kip+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oxli.countgraph": {
    source: "iana"
  },
  "application/vnd.pagerduty+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.palm": {
    source: "iana",
    extensions: [
      "pdb",
      "pqa",
      "oprc"
    ]
  },
  "application/vnd.panoply": {
    source: "iana"
  },
  "application/vnd.paos.xml": {
    source: "iana"
  },
  "application/vnd.patentdive": {
    source: "iana"
  },
  "application/vnd.patientecommsdoc": {
    source: "iana"
  },
  "application/vnd.pawaafile": {
    source: "iana",
    extensions: [
      "paw"
    ]
  },
  "application/vnd.pcos": {
    source: "iana"
  },
  "application/vnd.pg.format": {
    source: "iana",
    extensions: [
      "str"
    ]
  },
  "application/vnd.pg.osasli": {
    source: "iana",
    extensions: [
      "ei6"
    ]
  },
  "application/vnd.piaccess.application-licence": {
    source: "iana"
  },
  "application/vnd.picsel": {
    source: "iana",
    extensions: [
      "efif"
    ]
  },
  "application/vnd.pmi.widget": {
    source: "iana",
    extensions: [
      "wg"
    ]
  },
  "application/vnd.poc.group-advertisement+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.pocketlearn": {
    source: "iana",
    extensions: [
      "plf"
    ]
  },
  "application/vnd.powerbuilder6": {
    source: "iana",
    extensions: [
      "pbd"
    ]
  },
  "application/vnd.powerbuilder6-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder7": {
    source: "iana"
  },
  "application/vnd.powerbuilder7-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder75": {
    source: "iana"
  },
  "application/vnd.powerbuilder75-s": {
    source: "iana"
  },
  "application/vnd.preminet": {
    source: "iana"
  },
  "application/vnd.previewsystems.box": {
    source: "iana",
    extensions: [
      "box"
    ]
  },
  "application/vnd.proteus.magazine": {
    source: "iana",
    extensions: [
      "mgz"
    ]
  },
  "application/vnd.psfs": {
    source: "iana"
  },
  "application/vnd.publishare-delta-tree": {
    source: "iana",
    extensions: [
      "qps"
    ]
  },
  "application/vnd.pvi.ptid1": {
    source: "iana",
    extensions: [
      "ptid"
    ]
  },
  "application/vnd.pwg-multiplexed": {
    source: "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.qualcomm.brew-app-res": {
    source: "iana"
  },
  "application/vnd.quarantainenet": {
    source: "iana"
  },
  "application/vnd.quark.quarkxpress": {
    source: "iana",
    extensions: [
      "qxd",
      "qxt",
      "qwd",
      "qwt",
      "qxl",
      "qxb"
    ]
  },
  "application/vnd.quobject-quoxdocument": {
    source: "iana"
  },
  "application/vnd.radisys.moml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-conf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.rainstor.data": {
    source: "iana"
  },
  "application/vnd.rapid": {
    source: "iana"
  },
  "application/vnd.rar": {
    source: "iana",
    extensions: [
      "rar"
    ]
  },
  "application/vnd.realvnc.bed": {
    source: "iana",
    extensions: [
      "bed"
    ]
  },
  "application/vnd.recordare.musicxml": {
    source: "iana",
    extensions: [
      "mxl"
    ]
  },
  "application/vnd.recordare.musicxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "musicxml"
    ]
  },
  "application/vnd.renlearn.rlprint": {
    source: "iana"
  },
  "application/vnd.resilient.logic": {
    source: "iana"
  },
  "application/vnd.restful+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.rig.cryptonote": {
    source: "iana",
    extensions: [
      "cryptonote"
    ]
  },
  "application/vnd.rim.cod": {
    source: "apache",
    extensions: [
      "cod"
    ]
  },
  "application/vnd.rn-realmedia": {
    source: "apache",
    extensions: [
      "rm"
    ]
  },
  "application/vnd.rn-realmedia-vbr": {
    source: "apache",
    extensions: [
      "rmvb"
    ]
  },
  "application/vnd.route66.link66+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "link66"
    ]
  },
  "application/vnd.rs-274x": {
    source: "iana"
  },
  "application/vnd.ruckus.download": {
    source: "iana"
  },
  "application/vnd.s3sms": {
    source: "iana"
  },
  "application/vnd.sailingtracker.track": {
    source: "iana",
    extensions: [
      "st"
    ]
  },
  "application/vnd.sar": {
    source: "iana"
  },
  "application/vnd.sbm.cid": {
    source: "iana"
  },
  "application/vnd.sbm.mid2": {
    source: "iana"
  },
  "application/vnd.scribus": {
    source: "iana"
  },
  "application/vnd.sealed.3df": {
    source: "iana"
  },
  "application/vnd.sealed.csf": {
    source: "iana"
  },
  "application/vnd.sealed.doc": {
    source: "iana"
  },
  "application/vnd.sealed.eml": {
    source: "iana"
  },
  "application/vnd.sealed.mht": {
    source: "iana"
  },
  "application/vnd.sealed.net": {
    source: "iana"
  },
  "application/vnd.sealed.ppt": {
    source: "iana"
  },
  "application/vnd.sealed.tiff": {
    source: "iana"
  },
  "application/vnd.sealed.xls": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    source: "iana"
  },
  "application/vnd.seemail": {
    source: "iana",
    extensions: [
      "see"
    ]
  },
  "application/vnd.seis+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.sema": {
    source: "iana",
    extensions: [
      "sema"
    ]
  },
  "application/vnd.semd": {
    source: "iana",
    extensions: [
      "semd"
    ]
  },
  "application/vnd.semf": {
    source: "iana",
    extensions: [
      "semf"
    ]
  },
  "application/vnd.shade-save-file": {
    source: "iana"
  },
  "application/vnd.shana.informed.formdata": {
    source: "iana",
    extensions: [
      "ifm"
    ]
  },
  "application/vnd.shana.informed.formtemplate": {
    source: "iana",
    extensions: [
      "itp"
    ]
  },
  "application/vnd.shana.informed.interchange": {
    source: "iana",
    extensions: [
      "iif"
    ]
  },
  "application/vnd.shana.informed.package": {
    source: "iana",
    extensions: [
      "ipk"
    ]
  },
  "application/vnd.shootproof+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.shopkick+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.shp": {
    source: "iana"
  },
  "application/vnd.shx": {
    source: "iana"
  },
  "application/vnd.sigrok.session": {
    source: "iana"
  },
  "application/vnd.simtech-mindmapper": {
    source: "iana",
    extensions: [
      "twd",
      "twds"
    ]
  },
  "application/vnd.siren+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.smaf": {
    source: "iana",
    extensions: [
      "mmf"
    ]
  },
  "application/vnd.smart.notebook": {
    source: "iana"
  },
  "application/vnd.smart.teacher": {
    source: "iana",
    extensions: [
      "teacher"
    ]
  },
  "application/vnd.snesdev-page-table": {
    source: "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "fo"
    ]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    source: "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sdkm",
      "sdkd"
    ]
  },
  "application/vnd.spotfire.dxp": {
    source: "iana",
    extensions: [
      "dxp"
    ]
  },
  "application/vnd.spotfire.sfs": {
    source: "iana",
    extensions: [
      "sfs"
    ]
  },
  "application/vnd.sqlite3": {
    source: "iana"
  },
  "application/vnd.sss-cod": {
    source: "iana"
  },
  "application/vnd.sss-dtf": {
    source: "iana"
  },
  "application/vnd.sss-ntf": {
    source: "iana"
  },
  "application/vnd.stardivision.calc": {
    source: "apache",
    extensions: [
      "sdc"
    ]
  },
  "application/vnd.stardivision.draw": {
    source: "apache",
    extensions: [
      "sda"
    ]
  },
  "application/vnd.stardivision.impress": {
    source: "apache",
    extensions: [
      "sdd"
    ]
  },
  "application/vnd.stardivision.math": {
    source: "apache",
    extensions: [
      "smf"
    ]
  },
  "application/vnd.stardivision.writer": {
    source: "apache",
    extensions: [
      "sdw",
      "vor"
    ]
  },
  "application/vnd.stardivision.writer-global": {
    source: "apache",
    extensions: [
      "sgl"
    ]
  },
  "application/vnd.stepmania.package": {
    source: "iana",
    extensions: [
      "smzip"
    ]
  },
  "application/vnd.stepmania.stepchart": {
    source: "iana",
    extensions: [
      "sm"
    ]
  },
  "application/vnd.street-stream": {
    source: "iana"
  },
  "application/vnd.sun.wadl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wadl"
    ]
  },
  "application/vnd.sun.xml.calc": {
    source: "apache",
    extensions: [
      "sxc"
    ]
  },
  "application/vnd.sun.xml.calc.template": {
    source: "apache",
    extensions: [
      "stc"
    ]
  },
  "application/vnd.sun.xml.draw": {
    source: "apache",
    extensions: [
      "sxd"
    ]
  },
  "application/vnd.sun.xml.draw.template": {
    source: "apache",
    extensions: [
      "std"
    ]
  },
  "application/vnd.sun.xml.impress": {
    source: "apache",
    extensions: [
      "sxi"
    ]
  },
  "application/vnd.sun.xml.impress.template": {
    source: "apache",
    extensions: [
      "sti"
    ]
  },
  "application/vnd.sun.xml.math": {
    source: "apache",
    extensions: [
      "sxm"
    ]
  },
  "application/vnd.sun.xml.writer": {
    source: "apache",
    extensions: [
      "sxw"
    ]
  },
  "application/vnd.sun.xml.writer.global": {
    source: "apache",
    extensions: [
      "sxg"
    ]
  },
  "application/vnd.sun.xml.writer.template": {
    source: "apache",
    extensions: [
      "stw"
    ]
  },
  "application/vnd.sus-calendar": {
    source: "iana",
    extensions: [
      "sus",
      "susp"
    ]
  },
  "application/vnd.svd": {
    source: "iana",
    extensions: [
      "svd"
    ]
  },
  "application/vnd.swiftview-ics": {
    source: "iana"
  },
  "application/vnd.sycle+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.syft+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.symbian.install": {
    source: "apache",
    extensions: [
      "sis",
      "sisx"
    ]
  },
  "application/vnd.syncml+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "xsm"
    ]
  },
  "application/vnd.syncml.dm+wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "bdm"
    ]
  },
  "application/vnd.syncml.dm+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "xdm"
    ]
  },
  "application/vnd.syncml.dm.notification": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "ddf"
    ]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.syncml.ds.notification": {
    source: "iana"
  },
  "application/vnd.tableschema+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tao.intent-module-archive": {
    source: "iana",
    extensions: [
      "tao"
    ]
  },
  "application/vnd.tcpdump.pcap": {
    source: "iana",
    extensions: [
      "pcap",
      "cap",
      "dmp"
    ]
  },
  "application/vnd.think-cell.ppttc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tml": {
    source: "iana"
  },
  "application/vnd.tmobile-livetv": {
    source: "iana",
    extensions: [
      "tmo"
    ]
  },
  "application/vnd.tri.onesource": {
    source: "iana"
  },
  "application/vnd.trid.tpt": {
    source: "iana",
    extensions: [
      "tpt"
    ]
  },
  "application/vnd.triscape.mxs": {
    source: "iana",
    extensions: [
      "mxs"
    ]
  },
  "application/vnd.trueapp": {
    source: "iana",
    extensions: [
      "tra"
    ]
  },
  "application/vnd.truedoc": {
    source: "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    source: "iana"
  },
  "application/vnd.ufdl": {
    source: "iana",
    extensions: [
      "ufd",
      "ufdl"
    ]
  },
  "application/vnd.uiq.theme": {
    source: "iana",
    extensions: [
      "utz"
    ]
  },
  "application/vnd.umajin": {
    source: "iana",
    extensions: [
      "umj"
    ]
  },
  "application/vnd.unity": {
    source: "iana",
    extensions: [
      "unityweb"
    ]
  },
  "application/vnd.uoml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "uoml"
    ]
  },
  "application/vnd.uplanet.alert": {
    source: "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.channel": {
    source: "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.list": {
    source: "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.signal": {
    source: "iana"
  },
  "application/vnd.uri-map": {
    source: "iana"
  },
  "application/vnd.valve.source.material": {
    source: "iana"
  },
  "application/vnd.vcx": {
    source: "iana",
    extensions: [
      "vcx"
    ]
  },
  "application/vnd.vd-study": {
    source: "iana"
  },
  "application/vnd.vectorworks": {
    source: "iana"
  },
  "application/vnd.vel+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.verimatrix.vcas": {
    source: "iana"
  },
  "application/vnd.veritone.aion+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.veryant.thin": {
    source: "iana"
  },
  "application/vnd.ves.encrypted": {
    source: "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    source: "iana"
  },
  "application/vnd.visio": {
    source: "iana",
    extensions: [
      "vsd",
      "vst",
      "vss",
      "vsw"
    ]
  },
  "application/vnd.visionary": {
    source: "iana",
    extensions: [
      "vis"
    ]
  },
  "application/vnd.vividence.scriptfile": {
    source: "iana"
  },
  "application/vnd.vsf": {
    source: "iana",
    extensions: [
      "vsf"
    ]
  },
  "application/vnd.wap.sic": {
    source: "iana"
  },
  "application/vnd.wap.slc": {
    source: "iana"
  },
  "application/vnd.wap.wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "wbxml"
    ]
  },
  "application/vnd.wap.wmlc": {
    source: "iana",
    extensions: [
      "wmlc"
    ]
  },
  "application/vnd.wap.wmlscriptc": {
    source: "iana",
    extensions: [
      "wmlsc"
    ]
  },
  "application/vnd.webturbo": {
    source: "iana",
    extensions: [
      "wtb"
    ]
  },
  "application/vnd.wfa.dpp": {
    source: "iana"
  },
  "application/vnd.wfa.p2p": {
    source: "iana"
  },
  "application/vnd.wfa.wsc": {
    source: "iana"
  },
  "application/vnd.windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.wmc": {
    source: "iana"
  },
  "application/vnd.wmf.bootstrap": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    source: "iana"
  },
  "application/vnd.wolfram.player": {
    source: "iana",
    extensions: [
      "nbp"
    ]
  },
  "application/vnd.wordperfect": {
    source: "iana",
    extensions: [
      "wpd"
    ]
  },
  "application/vnd.wqd": {
    source: "iana",
    extensions: [
      "wqd"
    ]
  },
  "application/vnd.wrq-hp3000-labelled": {
    source: "iana"
  },
  "application/vnd.wt.stf": {
    source: "iana",
    extensions: [
      "stf"
    ]
  },
  "application/vnd.wv.csp+wbxml": {
    source: "iana"
  },
  "application/vnd.wv.csp+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.wv.ssp+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xacml+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xara": {
    source: "iana",
    extensions: [
      "xar"
    ]
  },
  "application/vnd.xfdl": {
    source: "iana",
    extensions: [
      "xfdl"
    ]
  },
  "application/vnd.xfdl.webform": {
    source: "iana"
  },
  "application/vnd.xmi+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xmpie.cpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.dpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.plan": {
    source: "iana"
  },
  "application/vnd.xmpie.ppkg": {
    source: "iana"
  },
  "application/vnd.xmpie.xlim": {
    source: "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    source: "iana",
    extensions: [
      "hvd"
    ]
  },
  "application/vnd.yamaha.hv-script": {
    source: "iana",
    extensions: [
      "hvs"
    ]
  },
  "application/vnd.yamaha.hv-voice": {
    source: "iana",
    extensions: [
      "hvp"
    ]
  },
  "application/vnd.yamaha.openscoreformat": {
    source: "iana",
    extensions: [
      "osf"
    ]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "osfpvg"
    ]
  },
  "application/vnd.yamaha.remote-setup": {
    source: "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    source: "iana",
    extensions: [
      "saf"
    ]
  },
  "application/vnd.yamaha.smaf-phrase": {
    source: "iana",
    extensions: [
      "spf"
    ]
  },
  "application/vnd.yamaha.through-ngn": {
    source: "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    source: "iana"
  },
  "application/vnd.yaoweme": {
    source: "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    source: "iana",
    extensions: [
      "cmp"
    ]
  },
  "application/vnd.youtube.yt": {
    source: "iana"
  },
  "application/vnd.zul": {
    source: "iana",
    extensions: [
      "zir",
      "zirz"
    ]
  },
  "application/vnd.zzazz.deck+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "zaz"
    ]
  },
  "application/voicexml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "vxml"
    ]
  },
  "application/voucher-cms+json": {
    source: "iana",
    compressible: true
  },
  "application/vq-rtcpxr": {
    source: "iana"
  },
  "application/wasm": {
    source: "iana",
    compressible: true,
    extensions: [
      "wasm"
    ]
  },
  "application/watcherinfo+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wif"
    ]
  },
  "application/webpush-options+json": {
    source: "iana",
    compressible: true
  },
  "application/whoispp-query": {
    source: "iana"
  },
  "application/whoispp-response": {
    source: "iana"
  },
  "application/widget": {
    source: "iana",
    extensions: [
      "wgt"
    ]
  },
  "application/winhlp": {
    source: "apache",
    extensions: [
      "hlp"
    ]
  },
  "application/wita": {
    source: "iana"
  },
  "application/wordperfect5.1": {
    source: "iana"
  },
  "application/wsdl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wsdl"
    ]
  },
  "application/wspolicy+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wspolicy"
    ]
  },
  "application/x-7z-compressed": {
    source: "apache",
    compressible: false,
    extensions: [
      "7z"
    ]
  },
  "application/x-abiword": {
    source: "apache",
    extensions: [
      "abw"
    ]
  },
  "application/x-ace-compressed": {
    source: "apache",
    extensions: [
      "ace"
    ]
  },
  "application/x-amf": {
    source: "apache"
  },
  "application/x-apple-diskimage": {
    source: "apache",
    extensions: [
      "dmg"
    ]
  },
  "application/x-arj": {
    compressible: false,
    extensions: [
      "arj"
    ]
  },
  "application/x-authorware-bin": {
    source: "apache",
    extensions: [
      "aab",
      "x32",
      "u32",
      "vox"
    ]
  },
  "application/x-authorware-map": {
    source: "apache",
    extensions: [
      "aam"
    ]
  },
  "application/x-authorware-seg": {
    source: "apache",
    extensions: [
      "aas"
    ]
  },
  "application/x-bcpio": {
    source: "apache",
    extensions: [
      "bcpio"
    ]
  },
  "application/x-bdoc": {
    compressible: false,
    extensions: [
      "bdoc"
    ]
  },
  "application/x-bittorrent": {
    source: "apache",
    extensions: [
      "torrent"
    ]
  },
  "application/x-blorb": {
    source: "apache",
    extensions: [
      "blb",
      "blorb"
    ]
  },
  "application/x-bzip": {
    source: "apache",
    compressible: false,
    extensions: [
      "bz"
    ]
  },
  "application/x-bzip2": {
    source: "apache",
    compressible: false,
    extensions: [
      "bz2",
      "boz"
    ]
  },
  "application/x-cbr": {
    source: "apache",
    extensions: [
      "cbr",
      "cba",
      "cbt",
      "cbz",
      "cb7"
    ]
  },
  "application/x-cdlink": {
    source: "apache",
    extensions: [
      "vcd"
    ]
  },
  "application/x-cfs-compressed": {
    source: "apache",
    extensions: [
      "cfs"
    ]
  },
  "application/x-chat": {
    source: "apache",
    extensions: [
      "chat"
    ]
  },
  "application/x-chess-pgn": {
    source: "apache",
    extensions: [
      "pgn"
    ]
  },
  "application/x-chrome-extension": {
    extensions: [
      "crx"
    ]
  },
  "application/x-cocoa": {
    source: "nginx",
    extensions: [
      "cco"
    ]
  },
  "application/x-compress": {
    source: "apache"
  },
  "application/x-conference": {
    source: "apache",
    extensions: [
      "nsc"
    ]
  },
  "application/x-cpio": {
    source: "apache",
    extensions: [
      "cpio"
    ]
  },
  "application/x-csh": {
    source: "apache",
    extensions: [
      "csh"
    ]
  },
  "application/x-deb": {
    compressible: false
  },
  "application/x-debian-package": {
    source: "apache",
    extensions: [
      "deb",
      "udeb"
    ]
  },
  "application/x-dgc-compressed": {
    source: "apache",
    extensions: [
      "dgc"
    ]
  },
  "application/x-director": {
    source: "apache",
    extensions: [
      "dir",
      "dcr",
      "dxr",
      "cst",
      "cct",
      "cxt",
      "w3d",
      "fgd",
      "swa"
    ]
  },
  "application/x-doom": {
    source: "apache",
    extensions: [
      "wad"
    ]
  },
  "application/x-dtbncx+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "ncx"
    ]
  },
  "application/x-dtbook+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "dtb"
    ]
  },
  "application/x-dtbresource+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "res"
    ]
  },
  "application/x-dvi": {
    source: "apache",
    compressible: false,
    extensions: [
      "dvi"
    ]
  },
  "application/x-envoy": {
    source: "apache",
    extensions: [
      "evy"
    ]
  },
  "application/x-eva": {
    source: "apache",
    extensions: [
      "eva"
    ]
  },
  "application/x-font-bdf": {
    source: "apache",
    extensions: [
      "bdf"
    ]
  },
  "application/x-font-dos": {
    source: "apache"
  },
  "application/x-font-framemaker": {
    source: "apache"
  },
  "application/x-font-ghostscript": {
    source: "apache",
    extensions: [
      "gsf"
    ]
  },
  "application/x-font-libgrx": {
    source: "apache"
  },
  "application/x-font-linux-psf": {
    source: "apache",
    extensions: [
      "psf"
    ]
  },
  "application/x-font-pcf": {
    source: "apache",
    extensions: [
      "pcf"
    ]
  },
  "application/x-font-snf": {
    source: "apache",
    extensions: [
      "snf"
    ]
  },
  "application/x-font-speedo": {
    source: "apache"
  },
  "application/x-font-sunos-news": {
    source: "apache"
  },
  "application/x-font-type1": {
    source: "apache",
    extensions: [
      "pfa",
      "pfb",
      "pfm",
      "afm"
    ]
  },
  "application/x-font-vfont": {
    source: "apache"
  },
  "application/x-freearc": {
    source: "apache",
    extensions: [
      "arc"
    ]
  },
  "application/x-futuresplash": {
    source: "apache",
    extensions: [
      "spl"
    ]
  },
  "application/x-gca-compressed": {
    source: "apache",
    extensions: [
      "gca"
    ]
  },
  "application/x-glulx": {
    source: "apache",
    extensions: [
      "ulx"
    ]
  },
  "application/x-gnumeric": {
    source: "apache",
    extensions: [
      "gnumeric"
    ]
  },
  "application/x-gramps-xml": {
    source: "apache",
    extensions: [
      "gramps"
    ]
  },
  "application/x-gtar": {
    source: "apache",
    extensions: [
      "gtar"
    ]
  },
  "application/x-gzip": {
    source: "apache"
  },
  "application/x-hdf": {
    source: "apache",
    extensions: [
      "hdf"
    ]
  },
  "application/x-httpd-php": {
    compressible: true,
    extensions: [
      "php"
    ]
  },
  "application/x-install-instructions": {
    source: "apache",
    extensions: [
      "install"
    ]
  },
  "application/x-iso9660-image": {
    source: "apache",
    extensions: [
      "iso"
    ]
  },
  "application/x-iwork-keynote-sffkey": {
    extensions: [
      "key"
    ]
  },
  "application/x-iwork-numbers-sffnumbers": {
    extensions: [
      "numbers"
    ]
  },
  "application/x-iwork-pages-sffpages": {
    extensions: [
      "pages"
    ]
  },
  "application/x-java-archive-diff": {
    source: "nginx",
    extensions: [
      "jardiff"
    ]
  },
  "application/x-java-jnlp-file": {
    source: "apache",
    compressible: false,
    extensions: [
      "jnlp"
    ]
  },
  "application/x-javascript": {
    compressible: true
  },
  "application/x-keepass2": {
    extensions: [
      "kdbx"
    ]
  },
  "application/x-latex": {
    source: "apache",
    compressible: false,
    extensions: [
      "latex"
    ]
  },
  "application/x-lua-bytecode": {
    extensions: [
      "luac"
    ]
  },
  "application/x-lzh-compressed": {
    source: "apache",
    extensions: [
      "lzh",
      "lha"
    ]
  },
  "application/x-makeself": {
    source: "nginx",
    extensions: [
      "run"
    ]
  },
  "application/x-mie": {
    source: "apache",
    extensions: [
      "mie"
    ]
  },
  "application/x-mobipocket-ebook": {
    source: "apache",
    extensions: [
      "prc",
      "mobi"
    ]
  },
  "application/x-mpegurl": {
    compressible: false
  },
  "application/x-ms-application": {
    source: "apache",
    extensions: [
      "application"
    ]
  },
  "application/x-ms-shortcut": {
    source: "apache",
    extensions: [
      "lnk"
    ]
  },
  "application/x-ms-wmd": {
    source: "apache",
    extensions: [
      "wmd"
    ]
  },
  "application/x-ms-wmz": {
    source: "apache",
    extensions: [
      "wmz"
    ]
  },
  "application/x-ms-xbap": {
    source: "apache",
    extensions: [
      "xbap"
    ]
  },
  "application/x-msaccess": {
    source: "apache",
    extensions: [
      "mdb"
    ]
  },
  "application/x-msbinder": {
    source: "apache",
    extensions: [
      "obd"
    ]
  },
  "application/x-mscardfile": {
    source: "apache",
    extensions: [
      "crd"
    ]
  },
  "application/x-msclip": {
    source: "apache",
    extensions: [
      "clp"
    ]
  },
  "application/x-msdos-program": {
    extensions: [
      "exe"
    ]
  },
  "application/x-msdownload": {
    source: "apache",
    extensions: [
      "exe",
      "dll",
      "com",
      "bat",
      "msi"
    ]
  },
  "application/x-msmediaview": {
    source: "apache",
    extensions: [
      "mvb",
      "m13",
      "m14"
    ]
  },
  "application/x-msmetafile": {
    source: "apache",
    extensions: [
      "wmf",
      "wmz",
      "emf",
      "emz"
    ]
  },
  "application/x-msmoney": {
    source: "apache",
    extensions: [
      "mny"
    ]
  },
  "application/x-mspublisher": {
    source: "apache",
    extensions: [
      "pub"
    ]
  },
  "application/x-msschedule": {
    source: "apache",
    extensions: [
      "scd"
    ]
  },
  "application/x-msterminal": {
    source: "apache",
    extensions: [
      "trm"
    ]
  },
  "application/x-mswrite": {
    source: "apache",
    extensions: [
      "wri"
    ]
  },
  "application/x-netcdf": {
    source: "apache",
    extensions: [
      "nc",
      "cdf"
    ]
  },
  "application/x-ns-proxy-autoconfig": {
    compressible: true,
    extensions: [
      "pac"
    ]
  },
  "application/x-nzb": {
    source: "apache",
    extensions: [
      "nzb"
    ]
  },
  "application/x-perl": {
    source: "nginx",
    extensions: [
      "pl",
      "pm"
    ]
  },
  "application/x-pilot": {
    source: "nginx",
    extensions: [
      "prc",
      "pdb"
    ]
  },
  "application/x-pkcs12": {
    source: "apache",
    compressible: false,
    extensions: [
      "p12",
      "pfx"
    ]
  },
  "application/x-pkcs7-certificates": {
    source: "apache",
    extensions: [
      "p7b",
      "spc"
    ]
  },
  "application/x-pkcs7-certreqresp": {
    source: "apache",
    extensions: [
      "p7r"
    ]
  },
  "application/x-pki-message": {
    source: "iana"
  },
  "application/x-rar-compressed": {
    source: "apache",
    compressible: false,
    extensions: [
      "rar"
    ]
  },
  "application/x-redhat-package-manager": {
    source: "nginx",
    extensions: [
      "rpm"
    ]
  },
  "application/x-research-info-systems": {
    source: "apache",
    extensions: [
      "ris"
    ]
  },
  "application/x-sea": {
    source: "nginx",
    extensions: [
      "sea"
    ]
  },
  "application/x-sh": {
    source: "apache",
    compressible: true,
    extensions: [
      "sh"
    ]
  },
  "application/x-shar": {
    source: "apache",
    extensions: [
      "shar"
    ]
  },
  "application/x-shockwave-flash": {
    source: "apache",
    compressible: false,
    extensions: [
      "swf"
    ]
  },
  "application/x-silverlight-app": {
    source: "apache",
    extensions: [
      "xap"
    ]
  },
  "application/x-sql": {
    source: "apache",
    extensions: [
      "sql"
    ]
  },
  "application/x-stuffit": {
    source: "apache",
    compressible: false,
    extensions: [
      "sit"
    ]
  },
  "application/x-stuffitx": {
    source: "apache",
    extensions: [
      "sitx"
    ]
  },
  "application/x-subrip": {
    source: "apache",
    extensions: [
      "srt"
    ]
  },
  "application/x-sv4cpio": {
    source: "apache",
    extensions: [
      "sv4cpio"
    ]
  },
  "application/x-sv4crc": {
    source: "apache",
    extensions: [
      "sv4crc"
    ]
  },
  "application/x-t3vm-image": {
    source: "apache",
    extensions: [
      "t3"
    ]
  },
  "application/x-tads": {
    source: "apache",
    extensions: [
      "gam"
    ]
  },
  "application/x-tar": {
    source: "apache",
    compressible: true,
    extensions: [
      "tar"
    ]
  },
  "application/x-tcl": {
    source: "apache",
    extensions: [
      "tcl",
      "tk"
    ]
  },
  "application/x-tex": {
    source: "apache",
    extensions: [
      "tex"
    ]
  },
  "application/x-tex-tfm": {
    source: "apache",
    extensions: [
      "tfm"
    ]
  },
  "application/x-texinfo": {
    source: "apache",
    extensions: [
      "texinfo",
      "texi"
    ]
  },
  "application/x-tgif": {
    source: "apache",
    extensions: [
      "obj"
    ]
  },
  "application/x-ustar": {
    source: "apache",
    extensions: [
      "ustar"
    ]
  },
  "application/x-virtualbox-hdd": {
    compressible: true,
    extensions: [
      "hdd"
    ]
  },
  "application/x-virtualbox-ova": {
    compressible: true,
    extensions: [
      "ova"
    ]
  },
  "application/x-virtualbox-ovf": {
    compressible: true,
    extensions: [
      "ovf"
    ]
  },
  "application/x-virtualbox-vbox": {
    compressible: true,
    extensions: [
      "vbox"
    ]
  },
  "application/x-virtualbox-vbox-extpack": {
    compressible: false,
    extensions: [
      "vbox-extpack"
    ]
  },
  "application/x-virtualbox-vdi": {
    compressible: true,
    extensions: [
      "vdi"
    ]
  },
  "application/x-virtualbox-vhd": {
    compressible: true,
    extensions: [
      "vhd"
    ]
  },
  "application/x-virtualbox-vmdk": {
    compressible: true,
    extensions: [
      "vmdk"
    ]
  },
  "application/x-wais-source": {
    source: "apache",
    extensions: [
      "src"
    ]
  },
  "application/x-web-app-manifest+json": {
    compressible: true,
    extensions: [
      "webapp"
    ]
  },
  "application/x-www-form-urlencoded": {
    source: "iana",
    compressible: true
  },
  "application/x-x509-ca-cert": {
    source: "iana",
    extensions: [
      "der",
      "crt",
      "pem"
    ]
  },
  "application/x-x509-ca-ra-cert": {
    source: "iana"
  },
  "application/x-x509-next-ca-cert": {
    source: "iana"
  },
  "application/x-xfig": {
    source: "apache",
    extensions: [
      "fig"
    ]
  },
  "application/x-xliff+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xlf"
    ]
  },
  "application/x-xpinstall": {
    source: "apache",
    compressible: false,
    extensions: [
      "xpi"
    ]
  },
  "application/x-xz": {
    source: "apache",
    extensions: [
      "xz"
    ]
  },
  "application/x-zmachine": {
    source: "apache",
    extensions: [
      "z1",
      "z2",
      "z3",
      "z4",
      "z5",
      "z6",
      "z7",
      "z8"
    ]
  },
  "application/x400-bp": {
    source: "iana"
  },
  "application/xacml+xml": {
    source: "iana",
    compressible: true
  },
  "application/xaml+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xaml"
    ]
  },
  "application/xcap-att+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xav"
    ]
  },
  "application/xcap-caps+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xca"
    ]
  },
  "application/xcap-diff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdf"
    ]
  },
  "application/xcap-el+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xel"
    ]
  },
  "application/xcap-error+xml": {
    source: "iana",
    compressible: true
  },
  "application/xcap-ns+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xns"
    ]
  },
  "application/xcon-conference-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/xcon-conference-info-diff+xml": {
    source: "iana",
    compressible: true
  },
  "application/xenc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xenc"
    ]
  },
  "application/xhtml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xhtml",
      "xht"
    ]
  },
  "application/xhtml-voice+xml": {
    source: "apache",
    compressible: true
  },
  "application/xliff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xlf"
    ]
  },
  "application/xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xml",
      "xsl",
      "xsd",
      "rng"
    ]
  },
  "application/xml-dtd": {
    source: "iana",
    compressible: true,
    extensions: [
      "dtd"
    ]
  },
  "application/xml-external-parsed-entity": {
    source: "iana"
  },
  "application/xml-patch+xml": {
    source: "iana",
    compressible: true
  },
  "application/xmpp+xml": {
    source: "iana",
    compressible: true
  },
  "application/xop+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xop"
    ]
  },
  "application/xproc+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xpl"
    ]
  },
  "application/xslt+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xsl",
      "xslt"
    ]
  },
  "application/xspf+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xspf"
    ]
  },
  "application/xv+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mxml",
      "xhvml",
      "xvml",
      "xvm"
    ]
  },
  "application/yang": {
    source: "iana",
    extensions: [
      "yang"
    ]
  },
  "application/yang-data+json": {
    source: "iana",
    compressible: true
  },
  "application/yang-data+xml": {
    source: "iana",
    compressible: true
  },
  "application/yang-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/yang-patch+xml": {
    source: "iana",
    compressible: true
  },
  "application/yin+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "yin"
    ]
  },
  "application/zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "zip"
    ]
  },
  "application/zlib": {
    source: "iana"
  },
  "application/zstd": {
    source: "iana"
  },
  "audio/1d-interleaved-parityfec": {
    source: "iana"
  },
  "audio/32kadpcm": {
    source: "iana"
  },
  "audio/3gpp": {
    source: "iana",
    compressible: false,
    extensions: [
      "3gpp"
    ]
  },
  "audio/3gpp2": {
    source: "iana"
  },
  "audio/aac": {
    source: "iana"
  },
  "audio/ac3": {
    source: "iana"
  },
  "audio/adpcm": {
    source: "apache",
    extensions: [
      "adp"
    ]
  },
  "audio/amr": {
    source: "iana",
    extensions: [
      "amr"
    ]
  },
  "audio/amr-wb": {
    source: "iana"
  },
  "audio/amr-wb+": {
    source: "iana"
  },
  "audio/aptx": {
    source: "iana"
  },
  "audio/asc": {
    source: "iana"
  },
  "audio/atrac-advanced-lossless": {
    source: "iana"
  },
  "audio/atrac-x": {
    source: "iana"
  },
  "audio/atrac3": {
    source: "iana"
  },
  "audio/basic": {
    source: "iana",
    compressible: false,
    extensions: [
      "au",
      "snd"
    ]
  },
  "audio/bv16": {
    source: "iana"
  },
  "audio/bv32": {
    source: "iana"
  },
  "audio/clearmode": {
    source: "iana"
  },
  "audio/cn": {
    source: "iana"
  },
  "audio/dat12": {
    source: "iana"
  },
  "audio/dls": {
    source: "iana"
  },
  "audio/dsr-es201108": {
    source: "iana"
  },
  "audio/dsr-es202050": {
    source: "iana"
  },
  "audio/dsr-es202211": {
    source: "iana"
  },
  "audio/dsr-es202212": {
    source: "iana"
  },
  "audio/dv": {
    source: "iana"
  },
  "audio/dvi4": {
    source: "iana"
  },
  "audio/eac3": {
    source: "iana"
  },
  "audio/encaprtp": {
    source: "iana"
  },
  "audio/evrc": {
    source: "iana"
  },
  "audio/evrc-qcp": {
    source: "iana"
  },
  "audio/evrc0": {
    source: "iana"
  },
  "audio/evrc1": {
    source: "iana"
  },
  "audio/evrcb": {
    source: "iana"
  },
  "audio/evrcb0": {
    source: "iana"
  },
  "audio/evrcb1": {
    source: "iana"
  },
  "audio/evrcnw": {
    source: "iana"
  },
  "audio/evrcnw0": {
    source: "iana"
  },
  "audio/evrcnw1": {
    source: "iana"
  },
  "audio/evrcwb": {
    source: "iana"
  },
  "audio/evrcwb0": {
    source: "iana"
  },
  "audio/evrcwb1": {
    source: "iana"
  },
  "audio/evs": {
    source: "iana"
  },
  "audio/flexfec": {
    source: "iana"
  },
  "audio/fwdred": {
    source: "iana"
  },
  "audio/g711-0": {
    source: "iana"
  },
  "audio/g719": {
    source: "iana"
  },
  "audio/g722": {
    source: "iana"
  },
  "audio/g7221": {
    source: "iana"
  },
  "audio/g723": {
    source: "iana"
  },
  "audio/g726-16": {
    source: "iana"
  },
  "audio/g726-24": {
    source: "iana"
  },
  "audio/g726-32": {
    source: "iana"
  },
  "audio/g726-40": {
    source: "iana"
  },
  "audio/g728": {
    source: "iana"
  },
  "audio/g729": {
    source: "iana"
  },
  "audio/g7291": {
    source: "iana"
  },
  "audio/g729d": {
    source: "iana"
  },
  "audio/g729e": {
    source: "iana"
  },
  "audio/gsm": {
    source: "iana"
  },
  "audio/gsm-efr": {
    source: "iana"
  },
  "audio/gsm-hr-08": {
    source: "iana"
  },
  "audio/ilbc": {
    source: "iana"
  },
  "audio/ip-mr_v2.5": {
    source: "iana"
  },
  "audio/isac": {
    source: "apache"
  },
  "audio/l16": {
    source: "iana"
  },
  "audio/l20": {
    source: "iana"
  },
  "audio/l24": {
    source: "iana",
    compressible: false
  },
  "audio/l8": {
    source: "iana"
  },
  "audio/lpc": {
    source: "iana"
  },
  "audio/melp": {
    source: "iana"
  },
  "audio/melp1200": {
    source: "iana"
  },
  "audio/melp2400": {
    source: "iana"
  },
  "audio/melp600": {
    source: "iana"
  },
  "audio/mhas": {
    source: "iana"
  },
  "audio/midi": {
    source: "apache",
    extensions: [
      "mid",
      "midi",
      "kar",
      "rmi"
    ]
  },
  "audio/mobile-xmf": {
    source: "iana",
    extensions: [
      "mxmf"
    ]
  },
  "audio/mp3": {
    compressible: false,
    extensions: [
      "mp3"
    ]
  },
  "audio/mp4": {
    source: "iana",
    compressible: false,
    extensions: [
      "m4a",
      "mp4a"
    ]
  },
  "audio/mp4a-latm": {
    source: "iana"
  },
  "audio/mpa": {
    source: "iana"
  },
  "audio/mpa-robust": {
    source: "iana"
  },
  "audio/mpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "mpga",
      "mp2",
      "mp2a",
      "mp3",
      "m2a",
      "m3a"
    ]
  },
  "audio/mpeg4-generic": {
    source: "iana"
  },
  "audio/musepack": {
    source: "apache"
  },
  "audio/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "oga",
      "ogg",
      "spx",
      "opus"
    ]
  },
  "audio/opus": {
    source: "iana"
  },
  "audio/parityfec": {
    source: "iana"
  },
  "audio/pcma": {
    source: "iana"
  },
  "audio/pcma-wb": {
    source: "iana"
  },
  "audio/pcmu": {
    source: "iana"
  },
  "audio/pcmu-wb": {
    source: "iana"
  },
  "audio/prs.sid": {
    source: "iana"
  },
  "audio/qcelp": {
    source: "iana"
  },
  "audio/raptorfec": {
    source: "iana"
  },
  "audio/red": {
    source: "iana"
  },
  "audio/rtp-enc-aescm128": {
    source: "iana"
  },
  "audio/rtp-midi": {
    source: "iana"
  },
  "audio/rtploopback": {
    source: "iana"
  },
  "audio/rtx": {
    source: "iana"
  },
  "audio/s3m": {
    source: "apache",
    extensions: [
      "s3m"
    ]
  },
  "audio/scip": {
    source: "iana"
  },
  "audio/silk": {
    source: "apache",
    extensions: [
      "sil"
    ]
  },
  "audio/smv": {
    source: "iana"
  },
  "audio/smv-qcp": {
    source: "iana"
  },
  "audio/smv0": {
    source: "iana"
  },
  "audio/sofa": {
    source: "iana"
  },
  "audio/sp-midi": {
    source: "iana"
  },
  "audio/speex": {
    source: "iana"
  },
  "audio/t140c": {
    source: "iana"
  },
  "audio/t38": {
    source: "iana"
  },
  "audio/telephone-event": {
    source: "iana"
  },
  "audio/tetra_acelp": {
    source: "iana"
  },
  "audio/tetra_acelp_bb": {
    source: "iana"
  },
  "audio/tone": {
    source: "iana"
  },
  "audio/tsvcis": {
    source: "iana"
  },
  "audio/uemclip": {
    source: "iana"
  },
  "audio/ulpfec": {
    source: "iana"
  },
  "audio/usac": {
    source: "iana"
  },
  "audio/vdvi": {
    source: "iana"
  },
  "audio/vmr-wb": {
    source: "iana"
  },
  "audio/vnd.3gpp.iufp": {
    source: "iana"
  },
  "audio/vnd.4sb": {
    source: "iana"
  },
  "audio/vnd.audiokoz": {
    source: "iana"
  },
  "audio/vnd.celp": {
    source: "iana"
  },
  "audio/vnd.cisco.nse": {
    source: "iana"
  },
  "audio/vnd.cmles.radio-events": {
    source: "iana"
  },
  "audio/vnd.cns.anp1": {
    source: "iana"
  },
  "audio/vnd.cns.inf1": {
    source: "iana"
  },
  "audio/vnd.dece.audio": {
    source: "iana",
    extensions: [
      "uva",
      "uvva"
    ]
  },
  "audio/vnd.digital-winds": {
    source: "iana",
    extensions: [
      "eol"
    ]
  },
  "audio/vnd.dlna.adts": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    source: "iana"
  },
  "audio/vnd.dolby.mlp": {
    source: "iana"
  },
  "audio/vnd.dolby.mps": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2x": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2z": {
    source: "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    source: "iana"
  },
  "audio/vnd.dra": {
    source: "iana",
    extensions: [
      "dra"
    ]
  },
  "audio/vnd.dts": {
    source: "iana",
    extensions: [
      "dts"
    ]
  },
  "audio/vnd.dts.hd": {
    source: "iana",
    extensions: [
      "dtshd"
    ]
  },
  "audio/vnd.dts.uhd": {
    source: "iana"
  },
  "audio/vnd.dvb.file": {
    source: "iana"
  },
  "audio/vnd.everad.plj": {
    source: "iana"
  },
  "audio/vnd.hns.audio": {
    source: "iana"
  },
  "audio/vnd.lucent.voice": {
    source: "iana",
    extensions: [
      "lvp"
    ]
  },
  "audio/vnd.ms-playready.media.pya": {
    source: "iana",
    extensions: [
      "pya"
    ]
  },
  "audio/vnd.nokia.mobile-xmf": {
    source: "iana"
  },
  "audio/vnd.nortel.vbk": {
    source: "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    source: "iana",
    extensions: [
      "ecelp4800"
    ]
  },
  "audio/vnd.nuera.ecelp7470": {
    source: "iana",
    extensions: [
      "ecelp7470"
    ]
  },
  "audio/vnd.nuera.ecelp9600": {
    source: "iana",
    extensions: [
      "ecelp9600"
    ]
  },
  "audio/vnd.octel.sbc": {
    source: "iana"
  },
  "audio/vnd.presonus.multitrack": {
    source: "iana"
  },
  "audio/vnd.qcelp": {
    source: "iana"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    source: "iana"
  },
  "audio/vnd.rip": {
    source: "iana",
    extensions: [
      "rip"
    ]
  },
  "audio/vnd.rn-realaudio": {
    compressible: false
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    source: "iana"
  },
  "audio/vnd.vmx.cvsd": {
    source: "iana"
  },
  "audio/vnd.wave": {
    compressible: false
  },
  "audio/vorbis": {
    source: "iana",
    compressible: false
  },
  "audio/vorbis-config": {
    source: "iana"
  },
  "audio/wav": {
    compressible: false,
    extensions: [
      "wav"
    ]
  },
  "audio/wave": {
    compressible: false,
    extensions: [
      "wav"
    ]
  },
  "audio/webm": {
    source: "apache",
    compressible: false,
    extensions: [
      "weba"
    ]
  },
  "audio/x-aac": {
    source: "apache",
    compressible: false,
    extensions: [
      "aac"
    ]
  },
  "audio/x-aiff": {
    source: "apache",
    extensions: [
      "aif",
      "aiff",
      "aifc"
    ]
  },
  "audio/x-caf": {
    source: "apache",
    compressible: false,
    extensions: [
      "caf"
    ]
  },
  "audio/x-flac": {
    source: "apache",
    extensions: [
      "flac"
    ]
  },
  "audio/x-m4a": {
    source: "nginx",
    extensions: [
      "m4a"
    ]
  },
  "audio/x-matroska": {
    source: "apache",
    extensions: [
      "mka"
    ]
  },
  "audio/x-mpegurl": {
    source: "apache",
    extensions: [
      "m3u"
    ]
  },
  "audio/x-ms-wax": {
    source: "apache",
    extensions: [
      "wax"
    ]
  },
  "audio/x-ms-wma": {
    source: "apache",
    extensions: [
      "wma"
    ]
  },
  "audio/x-pn-realaudio": {
    source: "apache",
    extensions: [
      "ram",
      "ra"
    ]
  },
  "audio/x-pn-realaudio-plugin": {
    source: "apache",
    extensions: [
      "rmp"
    ]
  },
  "audio/x-realaudio": {
    source: "nginx",
    extensions: [
      "ra"
    ]
  },
  "audio/x-tta": {
    source: "apache"
  },
  "audio/x-wav": {
    source: "apache",
    extensions: [
      "wav"
    ]
  },
  "audio/xm": {
    source: "apache",
    extensions: [
      "xm"
    ]
  },
  "chemical/x-cdx": {
    source: "apache",
    extensions: [
      "cdx"
    ]
  },
  "chemical/x-cif": {
    source: "apache",
    extensions: [
      "cif"
    ]
  },
  "chemical/x-cmdf": {
    source: "apache",
    extensions: [
      "cmdf"
    ]
  },
  "chemical/x-cml": {
    source: "apache",
    extensions: [
      "cml"
    ]
  },
  "chemical/x-csml": {
    source: "apache",
    extensions: [
      "csml"
    ]
  },
  "chemical/x-pdb": {
    source: "apache"
  },
  "chemical/x-xyz": {
    source: "apache",
    extensions: [
      "xyz"
    ]
  },
  "font/collection": {
    source: "iana",
    extensions: [
      "ttc"
    ]
  },
  "font/otf": {
    source: "iana",
    compressible: true,
    extensions: [
      "otf"
    ]
  },
  "font/sfnt": {
    source: "iana"
  },
  "font/ttf": {
    source: "iana",
    compressible: true,
    extensions: [
      "ttf"
    ]
  },
  "font/woff": {
    source: "iana",
    extensions: [
      "woff"
    ]
  },
  "font/woff2": {
    source: "iana",
    extensions: [
      "woff2"
    ]
  },
  "image/aces": {
    source: "iana",
    extensions: [
      "exr"
    ]
  },
  "image/apng": {
    compressible: false,
    extensions: [
      "apng"
    ]
  },
  "image/avci": {
    source: "iana",
    extensions: [
      "avci"
    ]
  },
  "image/avcs": {
    source: "iana",
    extensions: [
      "avcs"
    ]
  },
  "image/avif": {
    source: "iana",
    compressible: false,
    extensions: [
      "avif"
    ]
  },
  "image/bmp": {
    source: "iana",
    compressible: true,
    extensions: [
      "bmp"
    ]
  },
  "image/cgm": {
    source: "iana",
    extensions: [
      "cgm"
    ]
  },
  "image/dicom-rle": {
    source: "iana",
    extensions: [
      "drle"
    ]
  },
  "image/emf": {
    source: "iana",
    extensions: [
      "emf"
    ]
  },
  "image/fits": {
    source: "iana",
    extensions: [
      "fits"
    ]
  },
  "image/g3fax": {
    source: "iana",
    extensions: [
      "g3"
    ]
  },
  "image/gif": {
    source: "iana",
    compressible: false,
    extensions: [
      "gif"
    ]
  },
  "image/heic": {
    source: "iana",
    extensions: [
      "heic"
    ]
  },
  "image/heic-sequence": {
    source: "iana",
    extensions: [
      "heics"
    ]
  },
  "image/heif": {
    source: "iana",
    extensions: [
      "heif"
    ]
  },
  "image/heif-sequence": {
    source: "iana",
    extensions: [
      "heifs"
    ]
  },
  "image/hej2k": {
    source: "iana",
    extensions: [
      "hej2"
    ]
  },
  "image/hsj2": {
    source: "iana",
    extensions: [
      "hsj2"
    ]
  },
  "image/ief": {
    source: "iana",
    extensions: [
      "ief"
    ]
  },
  "image/jls": {
    source: "iana",
    extensions: [
      "jls"
    ]
  },
  "image/jp2": {
    source: "iana",
    compressible: false,
    extensions: [
      "jp2",
      "jpg2"
    ]
  },
  "image/jpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpeg",
      "jpg",
      "jpe"
    ]
  },
  "image/jph": {
    source: "iana",
    extensions: [
      "jph"
    ]
  },
  "image/jphc": {
    source: "iana",
    extensions: [
      "jhc"
    ]
  },
  "image/jpm": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpm"
    ]
  },
  "image/jpx": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpx",
      "jpf"
    ]
  },
  "image/jxr": {
    source: "iana",
    extensions: [
      "jxr"
    ]
  },
  "image/jxra": {
    source: "iana",
    extensions: [
      "jxra"
    ]
  },
  "image/jxrs": {
    source: "iana",
    extensions: [
      "jxrs"
    ]
  },
  "image/jxs": {
    source: "iana",
    extensions: [
      "jxs"
    ]
  },
  "image/jxsc": {
    source: "iana",
    extensions: [
      "jxsc"
    ]
  },
  "image/jxsi": {
    source: "iana",
    extensions: [
      "jxsi"
    ]
  },
  "image/jxss": {
    source: "iana",
    extensions: [
      "jxss"
    ]
  },
  "image/ktx": {
    source: "iana",
    extensions: [
      "ktx"
    ]
  },
  "image/ktx2": {
    source: "iana",
    extensions: [
      "ktx2"
    ]
  },
  "image/naplps": {
    source: "iana"
  },
  "image/pjpeg": {
    compressible: false
  },
  "image/png": {
    source: "iana",
    compressible: false,
    extensions: [
      "png"
    ]
  },
  "image/prs.btif": {
    source: "iana",
    extensions: [
      "btif"
    ]
  },
  "image/prs.pti": {
    source: "iana",
    extensions: [
      "pti"
    ]
  },
  "image/pwg-raster": {
    source: "iana"
  },
  "image/sgi": {
    source: "apache",
    extensions: [
      "sgi"
    ]
  },
  "image/svg+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "svg",
      "svgz"
    ]
  },
  "image/t38": {
    source: "iana",
    extensions: [
      "t38"
    ]
  },
  "image/tiff": {
    source: "iana",
    compressible: false,
    extensions: [
      "tif",
      "tiff"
    ]
  },
  "image/tiff-fx": {
    source: "iana",
    extensions: [
      "tfx"
    ]
  },
  "image/vnd.adobe.photoshop": {
    source: "iana",
    compressible: true,
    extensions: [
      "psd"
    ]
  },
  "image/vnd.airzip.accelerator.azv": {
    source: "iana",
    extensions: [
      "azv"
    ]
  },
  "image/vnd.cns.inf2": {
    source: "iana"
  },
  "image/vnd.dece.graphic": {
    source: "iana",
    extensions: [
      "uvi",
      "uvvi",
      "uvg",
      "uvvg"
    ]
  },
  "image/vnd.djvu": {
    source: "iana",
    extensions: [
      "djvu",
      "djv"
    ]
  },
  "image/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "image/vnd.dwg": {
    source: "iana",
    extensions: [
      "dwg"
    ]
  },
  "image/vnd.dxf": {
    source: "iana",
    extensions: [
      "dxf"
    ]
  },
  "image/vnd.fastbidsheet": {
    source: "iana",
    extensions: [
      "fbs"
    ]
  },
  "image/vnd.fpx": {
    source: "iana",
    extensions: [
      "fpx"
    ]
  },
  "image/vnd.fst": {
    source: "iana",
    extensions: [
      "fst"
    ]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    source: "iana",
    extensions: [
      "mmr"
    ]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    source: "iana",
    extensions: [
      "rlc"
    ]
  },
  "image/vnd.globalgraphics.pgb": {
    source: "iana"
  },
  "image/vnd.microsoft.icon": {
    source: "iana",
    compressible: true,
    extensions: [
      "ico"
    ]
  },
  "image/vnd.mix": {
    source: "iana"
  },
  "image/vnd.mozilla.apng": {
    source: "iana"
  },
  "image/vnd.ms-dds": {
    compressible: true,
    extensions: [
      "dds"
    ]
  },
  "image/vnd.ms-modi": {
    source: "iana",
    extensions: [
      "mdi"
    ]
  },
  "image/vnd.ms-photo": {
    source: "apache",
    extensions: [
      "wdp"
    ]
  },
  "image/vnd.net-fpx": {
    source: "iana",
    extensions: [
      "npx"
    ]
  },
  "image/vnd.pco.b16": {
    source: "iana",
    extensions: [
      "b16"
    ]
  },
  "image/vnd.radiance": {
    source: "iana"
  },
  "image/vnd.sealed.png": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    source: "iana"
  },
  "image/vnd.svf": {
    source: "iana"
  },
  "image/vnd.tencent.tap": {
    source: "iana",
    extensions: [
      "tap"
    ]
  },
  "image/vnd.valve.source.texture": {
    source: "iana",
    extensions: [
      "vtf"
    ]
  },
  "image/vnd.wap.wbmp": {
    source: "iana",
    extensions: [
      "wbmp"
    ]
  },
  "image/vnd.xiff": {
    source: "iana",
    extensions: [
      "xif"
    ]
  },
  "image/vnd.zbrush.pcx": {
    source: "iana",
    extensions: [
      "pcx"
    ]
  },
  "image/webp": {
    source: "apache",
    extensions: [
      "webp"
    ]
  },
  "image/wmf": {
    source: "iana",
    extensions: [
      "wmf"
    ]
  },
  "image/x-3ds": {
    source: "apache",
    extensions: [
      "3ds"
    ]
  },
  "image/x-cmu-raster": {
    source: "apache",
    extensions: [
      "ras"
    ]
  },
  "image/x-cmx": {
    source: "apache",
    extensions: [
      "cmx"
    ]
  },
  "image/x-freehand": {
    source: "apache",
    extensions: [
      "fh",
      "fhc",
      "fh4",
      "fh5",
      "fh7"
    ]
  },
  "image/x-icon": {
    source: "apache",
    compressible: true,
    extensions: [
      "ico"
    ]
  },
  "image/x-jng": {
    source: "nginx",
    extensions: [
      "jng"
    ]
  },
  "image/x-mrsid-image": {
    source: "apache",
    extensions: [
      "sid"
    ]
  },
  "image/x-ms-bmp": {
    source: "nginx",
    compressible: true,
    extensions: [
      "bmp"
    ]
  },
  "image/x-pcx": {
    source: "apache",
    extensions: [
      "pcx"
    ]
  },
  "image/x-pict": {
    source: "apache",
    extensions: [
      "pic",
      "pct"
    ]
  },
  "image/x-portable-anymap": {
    source: "apache",
    extensions: [
      "pnm"
    ]
  },
  "image/x-portable-bitmap": {
    source: "apache",
    extensions: [
      "pbm"
    ]
  },
  "image/x-portable-graymap": {
    source: "apache",
    extensions: [
      "pgm"
    ]
  },
  "image/x-portable-pixmap": {
    source: "apache",
    extensions: [
      "ppm"
    ]
  },
  "image/x-rgb": {
    source: "apache",
    extensions: [
      "rgb"
    ]
  },
  "image/x-tga": {
    source: "apache",
    extensions: [
      "tga"
    ]
  },
  "image/x-xbitmap": {
    source: "apache",
    extensions: [
      "xbm"
    ]
  },
  "image/x-xcf": {
    compressible: false
  },
  "image/x-xpixmap": {
    source: "apache",
    extensions: [
      "xpm"
    ]
  },
  "image/x-xwindowdump": {
    source: "apache",
    extensions: [
      "xwd"
    ]
  },
  "message/cpim": {
    source: "iana"
  },
  "message/delivery-status": {
    source: "iana"
  },
  "message/disposition-notification": {
    source: "iana",
    extensions: [
      "disposition-notification"
    ]
  },
  "message/external-body": {
    source: "iana"
  },
  "message/feedback-report": {
    source: "iana"
  },
  "message/global": {
    source: "iana",
    extensions: [
      "u8msg"
    ]
  },
  "message/global-delivery-status": {
    source: "iana",
    extensions: [
      "u8dsn"
    ]
  },
  "message/global-disposition-notification": {
    source: "iana",
    extensions: [
      "u8mdn"
    ]
  },
  "message/global-headers": {
    source: "iana",
    extensions: [
      "u8hdr"
    ]
  },
  "message/http": {
    source: "iana",
    compressible: false
  },
  "message/imdn+xml": {
    source: "iana",
    compressible: true
  },
  "message/news": {
    source: "iana"
  },
  "message/partial": {
    source: "iana",
    compressible: false
  },
  "message/rfc822": {
    source: "iana",
    compressible: true,
    extensions: [
      "eml",
      "mime"
    ]
  },
  "message/s-http": {
    source: "iana"
  },
  "message/sip": {
    source: "iana"
  },
  "message/sipfrag": {
    source: "iana"
  },
  "message/tracking-status": {
    source: "iana"
  },
  "message/vnd.si.simp": {
    source: "iana"
  },
  "message/vnd.wfa.wsc": {
    source: "iana",
    extensions: [
      "wsc"
    ]
  },
  "model/3mf": {
    source: "iana",
    extensions: [
      "3mf"
    ]
  },
  "model/e57": {
    source: "iana"
  },
  "model/gltf+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "gltf"
    ]
  },
  "model/gltf-binary": {
    source: "iana",
    compressible: true,
    extensions: [
      "glb"
    ]
  },
  "model/iges": {
    source: "iana",
    compressible: false,
    extensions: [
      "igs",
      "iges"
    ]
  },
  "model/mesh": {
    source: "iana",
    compressible: false,
    extensions: [
      "msh",
      "mesh",
      "silo"
    ]
  },
  "model/mtl": {
    source: "iana",
    extensions: [
      "mtl"
    ]
  },
  "model/obj": {
    source: "iana",
    extensions: [
      "obj"
    ]
  },
  "model/step": {
    source: "iana"
  },
  "model/step+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "stpx"
    ]
  },
  "model/step+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "stpz"
    ]
  },
  "model/step-xml+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "stpxz"
    ]
  },
  "model/stl": {
    source: "iana",
    extensions: [
      "stl"
    ]
  },
  "model/vnd.collada+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dae"
    ]
  },
  "model/vnd.dwf": {
    source: "iana",
    extensions: [
      "dwf"
    ]
  },
  "model/vnd.flatland.3dml": {
    source: "iana"
  },
  "model/vnd.gdl": {
    source: "iana",
    extensions: [
      "gdl"
    ]
  },
  "model/vnd.gs-gdl": {
    source: "apache"
  },
  "model/vnd.gs.gdl": {
    source: "iana"
  },
  "model/vnd.gtw": {
    source: "iana",
    extensions: [
      "gtw"
    ]
  },
  "model/vnd.moml+xml": {
    source: "iana",
    compressible: true
  },
  "model/vnd.mts": {
    source: "iana",
    extensions: [
      "mts"
    ]
  },
  "model/vnd.opengex": {
    source: "iana",
    extensions: [
      "ogex"
    ]
  },
  "model/vnd.parasolid.transmit.binary": {
    source: "iana",
    extensions: [
      "x_b"
    ]
  },
  "model/vnd.parasolid.transmit.text": {
    source: "iana",
    extensions: [
      "x_t"
    ]
  },
  "model/vnd.pytha.pyox": {
    source: "iana"
  },
  "model/vnd.rosette.annotated-data-model": {
    source: "iana"
  },
  "model/vnd.sap.vds": {
    source: "iana",
    extensions: [
      "vds"
    ]
  },
  "model/vnd.usdz+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "usdz"
    ]
  },
  "model/vnd.valve.source.compiled-map": {
    source: "iana",
    extensions: [
      "bsp"
    ]
  },
  "model/vnd.vtu": {
    source: "iana",
    extensions: [
      "vtu"
    ]
  },
  "model/vrml": {
    source: "iana",
    compressible: false,
    extensions: [
      "wrl",
      "vrml"
    ]
  },
  "model/x3d+binary": {
    source: "apache",
    compressible: false,
    extensions: [
      "x3db",
      "x3dbz"
    ]
  },
  "model/x3d+fastinfoset": {
    source: "iana",
    extensions: [
      "x3db"
    ]
  },
  "model/x3d+vrml": {
    source: "apache",
    compressible: false,
    extensions: [
      "x3dv",
      "x3dvz"
    ]
  },
  "model/x3d+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "x3d",
      "x3dz"
    ]
  },
  "model/x3d-vrml": {
    source: "iana",
    extensions: [
      "x3dv"
    ]
  },
  "multipart/alternative": {
    source: "iana",
    compressible: false
  },
  "multipart/appledouble": {
    source: "iana"
  },
  "multipart/byteranges": {
    source: "iana"
  },
  "multipart/digest": {
    source: "iana"
  },
  "multipart/encrypted": {
    source: "iana",
    compressible: false
  },
  "multipart/form-data": {
    source: "iana",
    compressible: false
  },
  "multipart/header-set": {
    source: "iana"
  },
  "multipart/mixed": {
    source: "iana"
  },
  "multipart/multilingual": {
    source: "iana"
  },
  "multipart/parallel": {
    source: "iana"
  },
  "multipart/related": {
    source: "iana",
    compressible: false
  },
  "multipart/report": {
    source: "iana"
  },
  "multipart/signed": {
    source: "iana",
    compressible: false
  },
  "multipart/vnd.bint.med-plus": {
    source: "iana"
  },
  "multipart/voice-message": {
    source: "iana"
  },
  "multipart/x-mixed-replace": {
    source: "iana"
  },
  "text/1d-interleaved-parityfec": {
    source: "iana"
  },
  "text/cache-manifest": {
    source: "iana",
    compressible: true,
    extensions: [
      "appcache",
      "manifest"
    ]
  },
  "text/calendar": {
    source: "iana",
    extensions: [
      "ics",
      "ifb"
    ]
  },
  "text/calender": {
    compressible: true
  },
  "text/cmd": {
    compressible: true
  },
  "text/coffeescript": {
    extensions: [
      "coffee",
      "litcoffee"
    ]
  },
  "text/cql": {
    source: "iana"
  },
  "text/cql-expression": {
    source: "iana"
  },
  "text/cql-identifier": {
    source: "iana"
  },
  "text/css": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "css"
    ]
  },
  "text/csv": {
    source: "iana",
    compressible: true,
    extensions: [
      "csv"
    ]
  },
  "text/csv-schema": {
    source: "iana"
  },
  "text/directory": {
    source: "iana"
  },
  "text/dns": {
    source: "iana"
  },
  "text/ecmascript": {
    source: "iana"
  },
  "text/encaprtp": {
    source: "iana"
  },
  "text/enriched": {
    source: "iana"
  },
  "text/fhirpath": {
    source: "iana"
  },
  "text/flexfec": {
    source: "iana"
  },
  "text/fwdred": {
    source: "iana"
  },
  "text/gff3": {
    source: "iana"
  },
  "text/grammar-ref-list": {
    source: "iana"
  },
  "text/html": {
    source: "iana",
    compressible: true,
    extensions: [
      "html",
      "htm",
      "shtml"
    ]
  },
  "text/jade": {
    extensions: [
      "jade"
    ]
  },
  "text/javascript": {
    source: "iana",
    compressible: true
  },
  "text/jcr-cnd": {
    source: "iana"
  },
  "text/jsx": {
    compressible: true,
    extensions: [
      "jsx"
    ]
  },
  "text/less": {
    compressible: true,
    extensions: [
      "less"
    ]
  },
  "text/markdown": {
    source: "iana",
    compressible: true,
    extensions: [
      "markdown",
      "md"
    ]
  },
  "text/mathml": {
    source: "nginx",
    extensions: [
      "mml"
    ]
  },
  "text/mdx": {
    compressible: true,
    extensions: [
      "mdx"
    ]
  },
  "text/mizar": {
    source: "iana"
  },
  "text/n3": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "n3"
    ]
  },
  "text/parameters": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/parityfec": {
    source: "iana"
  },
  "text/plain": {
    source: "iana",
    compressible: true,
    extensions: [
      "txt",
      "text",
      "conf",
      "def",
      "list",
      "log",
      "in",
      "ini"
    ]
  },
  "text/provenance-notation": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    source: "iana"
  },
  "text/prs.lines.tag": {
    source: "iana",
    extensions: [
      "dsc"
    ]
  },
  "text/prs.prop.logic": {
    source: "iana"
  },
  "text/raptorfec": {
    source: "iana"
  },
  "text/red": {
    source: "iana"
  },
  "text/rfc822-headers": {
    source: "iana"
  },
  "text/richtext": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtx"
    ]
  },
  "text/rtf": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtf"
    ]
  },
  "text/rtp-enc-aescm128": {
    source: "iana"
  },
  "text/rtploopback": {
    source: "iana"
  },
  "text/rtx": {
    source: "iana"
  },
  "text/sgml": {
    source: "iana",
    extensions: [
      "sgml",
      "sgm"
    ]
  },
  "text/shaclc": {
    source: "iana"
  },
  "text/shex": {
    source: "iana",
    extensions: [
      "shex"
    ]
  },
  "text/slim": {
    extensions: [
      "slim",
      "slm"
    ]
  },
  "text/spdx": {
    source: "iana",
    extensions: [
      "spdx"
    ]
  },
  "text/strings": {
    source: "iana"
  },
  "text/stylus": {
    extensions: [
      "stylus",
      "styl"
    ]
  },
  "text/t140": {
    source: "iana"
  },
  "text/tab-separated-values": {
    source: "iana",
    compressible: true,
    extensions: [
      "tsv"
    ]
  },
  "text/troff": {
    source: "iana",
    extensions: [
      "t",
      "tr",
      "roff",
      "man",
      "me",
      "ms"
    ]
  },
  "text/turtle": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "ttl"
    ]
  },
  "text/ulpfec": {
    source: "iana"
  },
  "text/uri-list": {
    source: "iana",
    compressible: true,
    extensions: [
      "uri",
      "uris",
      "urls"
    ]
  },
  "text/vcard": {
    source: "iana",
    compressible: true,
    extensions: [
      "vcard"
    ]
  },
  "text/vnd.a": {
    source: "iana"
  },
  "text/vnd.abc": {
    source: "iana"
  },
  "text/vnd.ascii-art": {
    source: "iana"
  },
  "text/vnd.curl": {
    source: "iana",
    extensions: [
      "curl"
    ]
  },
  "text/vnd.curl.dcurl": {
    source: "apache",
    extensions: [
      "dcurl"
    ]
  },
  "text/vnd.curl.mcurl": {
    source: "apache",
    extensions: [
      "mcurl"
    ]
  },
  "text/vnd.curl.scurl": {
    source: "apache",
    extensions: [
      "scurl"
    ]
  },
  "text/vnd.debian.copyright": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.dmclientscript": {
    source: "iana"
  },
  "text/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "text/vnd.esmertec.theme-descriptor": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.familysearch.gedcom": {
    source: "iana",
    extensions: [
      "ged"
    ]
  },
  "text/vnd.ficlab.flt": {
    source: "iana"
  },
  "text/vnd.fly": {
    source: "iana",
    extensions: [
      "fly"
    ]
  },
  "text/vnd.fmi.flexstor": {
    source: "iana",
    extensions: [
      "flx"
    ]
  },
  "text/vnd.gml": {
    source: "iana"
  },
  "text/vnd.graphviz": {
    source: "iana",
    extensions: [
      "gv"
    ]
  },
  "text/vnd.hans": {
    source: "iana"
  },
  "text/vnd.hgl": {
    source: "iana"
  },
  "text/vnd.in3d.3dml": {
    source: "iana",
    extensions: [
      "3dml"
    ]
  },
  "text/vnd.in3d.spot": {
    source: "iana",
    extensions: [
      "spot"
    ]
  },
  "text/vnd.iptc.newsml": {
    source: "iana"
  },
  "text/vnd.iptc.nitf": {
    source: "iana"
  },
  "text/vnd.latex-z": {
    source: "iana"
  },
  "text/vnd.motorola.reflex": {
    source: "iana"
  },
  "text/vnd.ms-mediapackage": {
    source: "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    source: "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    source: "iana"
  },
  "text/vnd.senx.warpscript": {
    source: "iana"
  },
  "text/vnd.si.uricatalogue": {
    source: "iana"
  },
  "text/vnd.sosi": {
    source: "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "jad"
    ]
  },
  "text/vnd.trolltech.linguist": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.wap.si": {
    source: "iana"
  },
  "text/vnd.wap.sl": {
    source: "iana"
  },
  "text/vnd.wap.wml": {
    source: "iana",
    extensions: [
      "wml"
    ]
  },
  "text/vnd.wap.wmlscript": {
    source: "iana",
    extensions: [
      "wmls"
    ]
  },
  "text/vtt": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "vtt"
    ]
  },
  "text/x-asm": {
    source: "apache",
    extensions: [
      "s",
      "asm"
    ]
  },
  "text/x-c": {
    source: "apache",
    extensions: [
      "c",
      "cc",
      "cxx",
      "cpp",
      "h",
      "hh",
      "dic"
    ]
  },
  "text/x-component": {
    source: "nginx",
    extensions: [
      "htc"
    ]
  },
  "text/x-fortran": {
    source: "apache",
    extensions: [
      "f",
      "for",
      "f77",
      "f90"
    ]
  },
  "text/x-gwt-rpc": {
    compressible: true
  },
  "text/x-handlebars-template": {
    extensions: [
      "hbs"
    ]
  },
  "text/x-java-source": {
    source: "apache",
    extensions: [
      "java"
    ]
  },
  "text/x-jquery-tmpl": {
    compressible: true
  },
  "text/x-lua": {
    extensions: [
      "lua"
    ]
  },
  "text/x-markdown": {
    compressible: true,
    extensions: [
      "mkd"
    ]
  },
  "text/x-nfo": {
    source: "apache",
    extensions: [
      "nfo"
    ]
  },
  "text/x-opml": {
    source: "apache",
    extensions: [
      "opml"
    ]
  },
  "text/x-org": {
    compressible: true,
    extensions: [
      "org"
    ]
  },
  "text/x-pascal": {
    source: "apache",
    extensions: [
      "p",
      "pas"
    ]
  },
  "text/x-processing": {
    compressible: true,
    extensions: [
      "pde"
    ]
  },
  "text/x-sass": {
    extensions: [
      "sass"
    ]
  },
  "text/x-scss": {
    extensions: [
      "scss"
    ]
  },
  "text/x-setext": {
    source: "apache",
    extensions: [
      "etx"
    ]
  },
  "text/x-sfv": {
    source: "apache",
    extensions: [
      "sfv"
    ]
  },
  "text/x-suse-ymp": {
    compressible: true,
    extensions: [
      "ymp"
    ]
  },
  "text/x-uuencode": {
    source: "apache",
    extensions: [
      "uu"
    ]
  },
  "text/x-vcalendar": {
    source: "apache",
    extensions: [
      "vcs"
    ]
  },
  "text/x-vcard": {
    source: "apache",
    extensions: [
      "vcf"
    ]
  },
  "text/xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xml"
    ]
  },
  "text/xml-external-parsed-entity": {
    source: "iana"
  },
  "text/yaml": {
    compressible: true,
    extensions: [
      "yaml",
      "yml"
    ]
  },
  "video/1d-interleaved-parityfec": {
    source: "iana"
  },
  "video/3gpp": {
    source: "iana",
    extensions: [
      "3gp",
      "3gpp"
    ]
  },
  "video/3gpp-tt": {
    source: "iana"
  },
  "video/3gpp2": {
    source: "iana",
    extensions: [
      "3g2"
    ]
  },
  "video/av1": {
    source: "iana"
  },
  "video/bmpeg": {
    source: "iana"
  },
  "video/bt656": {
    source: "iana"
  },
  "video/celb": {
    source: "iana"
  },
  "video/dv": {
    source: "iana"
  },
  "video/encaprtp": {
    source: "iana"
  },
  "video/ffv1": {
    source: "iana"
  },
  "video/flexfec": {
    source: "iana"
  },
  "video/h261": {
    source: "iana",
    extensions: [
      "h261"
    ]
  },
  "video/h263": {
    source: "iana",
    extensions: [
      "h263"
    ]
  },
  "video/h263-1998": {
    source: "iana"
  },
  "video/h263-2000": {
    source: "iana"
  },
  "video/h264": {
    source: "iana",
    extensions: [
      "h264"
    ]
  },
  "video/h264-rcdo": {
    source: "iana"
  },
  "video/h264-svc": {
    source: "iana"
  },
  "video/h265": {
    source: "iana"
  },
  "video/iso.segment": {
    source: "iana",
    extensions: [
      "m4s"
    ]
  },
  "video/jpeg": {
    source: "iana",
    extensions: [
      "jpgv"
    ]
  },
  "video/jpeg2000": {
    source: "iana"
  },
  "video/jpm": {
    source: "apache",
    extensions: [
      "jpm",
      "jpgm"
    ]
  },
  "video/jxsv": {
    source: "iana"
  },
  "video/mj2": {
    source: "iana",
    extensions: [
      "mj2",
      "mjp2"
    ]
  },
  "video/mp1s": {
    source: "iana"
  },
  "video/mp2p": {
    source: "iana"
  },
  "video/mp2t": {
    source: "iana",
    extensions: [
      "ts"
    ]
  },
  "video/mp4": {
    source: "iana",
    compressible: false,
    extensions: [
      "mp4",
      "mp4v",
      "mpg4"
    ]
  },
  "video/mp4v-es": {
    source: "iana"
  },
  "video/mpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "mpeg",
      "mpg",
      "mpe",
      "m1v",
      "m2v"
    ]
  },
  "video/mpeg4-generic": {
    source: "iana"
  },
  "video/mpv": {
    source: "iana"
  },
  "video/nv": {
    source: "iana"
  },
  "video/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "ogv"
    ]
  },
  "video/parityfec": {
    source: "iana"
  },
  "video/pointer": {
    source: "iana"
  },
  "video/quicktime": {
    source: "iana",
    compressible: false,
    extensions: [
      "qt",
      "mov"
    ]
  },
  "video/raptorfec": {
    source: "iana"
  },
  "video/raw": {
    source: "iana"
  },
  "video/rtp-enc-aescm128": {
    source: "iana"
  },
  "video/rtploopback": {
    source: "iana"
  },
  "video/rtx": {
    source: "iana"
  },
  "video/scip": {
    source: "iana"
  },
  "video/smpte291": {
    source: "iana"
  },
  "video/smpte292m": {
    source: "iana"
  },
  "video/ulpfec": {
    source: "iana"
  },
  "video/vc1": {
    source: "iana"
  },
  "video/vc2": {
    source: "iana"
  },
  "video/vnd.cctv": {
    source: "iana"
  },
  "video/vnd.dece.hd": {
    source: "iana",
    extensions: [
      "uvh",
      "uvvh"
    ]
  },
  "video/vnd.dece.mobile": {
    source: "iana",
    extensions: [
      "uvm",
      "uvvm"
    ]
  },
  "video/vnd.dece.mp4": {
    source: "iana"
  },
  "video/vnd.dece.pd": {
    source: "iana",
    extensions: [
      "uvp",
      "uvvp"
    ]
  },
  "video/vnd.dece.sd": {
    source: "iana",
    extensions: [
      "uvs",
      "uvvs"
    ]
  },
  "video/vnd.dece.video": {
    source: "iana",
    extensions: [
      "uvv",
      "uvvv"
    ]
  },
  "video/vnd.directv.mpeg": {
    source: "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dvb.file": {
    source: "iana",
    extensions: [
      "dvb"
    ]
  },
  "video/vnd.fvt": {
    source: "iana",
    extensions: [
      "fvt"
    ]
  },
  "video/vnd.hns.video": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    source: "iana"
  },
  "video/vnd.motorola.video": {
    source: "iana"
  },
  "video/vnd.motorola.videop": {
    source: "iana"
  },
  "video/vnd.mpegurl": {
    source: "iana",
    extensions: [
      "mxu",
      "m4u"
    ]
  },
  "video/vnd.ms-playready.media.pyv": {
    source: "iana",
    extensions: [
      "pyv"
    ]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    source: "iana"
  },
  "video/vnd.nokia.mp4vr": {
    source: "iana"
  },
  "video/vnd.nokia.videovoip": {
    source: "iana"
  },
  "video/vnd.objectvideo": {
    source: "iana"
  },
  "video/vnd.radgamettools.bink": {
    source: "iana"
  },
  "video/vnd.radgamettools.smacker": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg1": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg4": {
    source: "iana"
  },
  "video/vnd.sealed.swf": {
    source: "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    source: "iana"
  },
  "video/vnd.uvvu.mp4": {
    source: "iana",
    extensions: [
      "uvu",
      "uvvu"
    ]
  },
  "video/vnd.vivo": {
    source: "iana",
    extensions: [
      "viv"
    ]
  },
  "video/vnd.youtube.yt": {
    source: "iana"
  },
  "video/vp8": {
    source: "iana"
  },
  "video/vp9": {
    source: "iana"
  },
  "video/webm": {
    source: "apache",
    compressible: false,
    extensions: [
      "webm"
    ]
  },
  "video/x-f4v": {
    source: "apache",
    extensions: [
      "f4v"
    ]
  },
  "video/x-fli": {
    source: "apache",
    extensions: [
      "fli"
    ]
  },
  "video/x-flv": {
    source: "apache",
    compressible: false,
    extensions: [
      "flv"
    ]
  },
  "video/x-m4v": {
    source: "apache",
    extensions: [
      "m4v"
    ]
  },
  "video/x-matroska": {
    source: "apache",
    compressible: false,
    extensions: [
      "mkv",
      "mk3d",
      "mks"
    ]
  },
  "video/x-mng": {
    source: "apache",
    extensions: [
      "mng"
    ]
  },
  "video/x-ms-asf": {
    source: "apache",
    extensions: [
      "asf",
      "asx"
    ]
  },
  "video/x-ms-vob": {
    source: "apache",
    extensions: [
      "vob"
    ]
  },
  "video/x-ms-wm": {
    source: "apache",
    extensions: [
      "wm"
    ]
  },
  "video/x-ms-wmv": {
    source: "apache",
    compressible: false,
    extensions: [
      "wmv"
    ]
  },
  "video/x-ms-wmx": {
    source: "apache",
    extensions: [
      "wmx"
    ]
  },
  "video/x-ms-wvx": {
    source: "apache",
    extensions: [
      "wvx"
    ]
  },
  "video/x-msvideo": {
    source: "apache",
    extensions: [
      "avi"
    ]
  },
  "video/x-sgi-movie": {
    source: "apache",
    extensions: [
      "movie"
    ]
  },
  "video/x-smv": {
    source: "apache",
    extensions: [
      "smv"
    ]
  },
  "x-conference/x-cooltalk": {
    source: "apache",
    extensions: [
      "ice"
    ]
  },
  "x-shader/x-fragment": {
    compressible: true
  },
  "x-shader/x-vertex": {
    compressible: true
  }
};
/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */
var mimeDb = require$$0;
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
(function(exports$1) {
  var db = mimeDb;
  var extname = path$1.extname;
  var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
  var TEXT_TYPE_REGEXP = /^text\//i;
  exports$1.charset = charset;
  exports$1.charsets = { lookup: charset };
  exports$1.contentType = contentType;
  exports$1.extension = extension;
  exports$1.extensions = /* @__PURE__ */ Object.create(null);
  exports$1.lookup = lookup;
  exports$1.types = /* @__PURE__ */ Object.create(null);
  populateMaps(exports$1.extensions, exports$1.types);
  function charset(type2) {
    if (!type2 || typeof type2 !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type2);
    var mime2 = match && db[match[1].toLowerCase()];
    if (mime2 && mime2.charset) {
      return mime2.charset;
    }
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
      return "UTF-8";
    }
    return false;
  }
  function contentType(str) {
    if (!str || typeof str !== "string") {
      return false;
    }
    var mime2 = str.indexOf("/") === -1 ? exports$1.lookup(str) : str;
    if (!mime2) {
      return false;
    }
    if (mime2.indexOf("charset") === -1) {
      var charset2 = exports$1.charset(mime2);
      if (charset2) mime2 += "; charset=" + charset2.toLowerCase();
    }
    return mime2;
  }
  function extension(type2) {
    if (!type2 || typeof type2 !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type2);
    var exts = match && exports$1.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
      return false;
    }
    return exts[0];
  }
  function lookup(path2) {
    if (!path2 || typeof path2 !== "string") {
      return false;
    }
    var extension2 = extname("x." + path2).toLowerCase().substr(1);
    if (!extension2) {
      return false;
    }
    return exports$1.types[extension2] || false;
  }
  function populateMaps(extensions, types) {
    var preference = ["nginx", "apache", void 0, "iana"];
    Object.keys(db).forEach(function forEachMimeType(type2) {
      var mime2 = db[type2];
      var exts = mime2.extensions;
      if (!exts || !exts.length) {
        return;
      }
      extensions[type2] = exts;
      for (var i = 0; i < exts.length; i++) {
        var extension2 = exts[i];
        if (types[extension2]) {
          var from = preference.indexOf(db[types[extension2]].source);
          var to = preference.indexOf(mime2.source);
          if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
            continue;
          }
        }
        types[extension2] = type2;
      }
    });
  }
})(mimeTypes);
var defer_1 = defer$1;
function defer$1(fn) {
  var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
  if (nextTick) {
    nextTick(fn);
  } else {
    setTimeout(fn, 0);
  }
}
var defer = defer_1;
var async_1 = async$2;
function async$2(callback) {
  var isAsync = false;
  defer(function() {
    isAsync = true;
  });
  return function async_callback(err, result) {
    if (isAsync) {
      callback(err, result);
    } else {
      defer(function nextTick_callback() {
        callback(err, result);
      });
    }
  };
}
var abort_1 = abort$2;
function abort$2(state2) {
  Object.keys(state2.jobs).forEach(clean.bind(state2));
  state2.jobs = {};
}
function clean(key) {
  if (typeof this.jobs[key] == "function") {
    this.jobs[key]();
  }
}
var async$1 = async_1, abort$1 = abort_1;
var iterate_1 = iterate$2;
function iterate$2(list, iterator2, state2, callback) {
  var key = state2["keyedList"] ? state2["keyedList"][state2.index] : state2.index;
  state2.jobs[key] = runJob(iterator2, key, list[key], function(error, output) {
    if (!(key in state2.jobs)) {
      return;
    }
    delete state2.jobs[key];
    if (error) {
      abort$1(state2);
    } else {
      state2.results[key] = output;
    }
    callback(error, state2.results);
  });
}
function runJob(iterator2, key, item, callback) {
  var aborter;
  if (iterator2.length == 2) {
    aborter = iterator2(item, async$1(callback));
  } else {
    aborter = iterator2(item, key, async$1(callback));
  }
  return aborter;
}
var state_1 = state;
function state(list, sortMethod) {
  var isNamedList = !Array.isArray(list), initState2 = {
    index: 0,
    keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
    jobs: {},
    results: isNamedList ? {} : [],
    size: isNamedList ? Object.keys(list).length : list.length
  };
  if (sortMethod) {
    initState2.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
      return sortMethod(list[a], list[b]);
    });
  }
  return initState2;
}
var abort = abort_1, async = async_1;
var terminator_1 = terminator$2;
function terminator$2(callback) {
  if (!Object.keys(this.jobs).length) {
    return;
  }
  this.index = this.size;
  abort(this);
  async(callback)(null, this.results);
}
var iterate$1 = iterate_1, initState$1 = state_1, terminator$1 = terminator_1;
var parallel_1 = parallel;
function parallel(list, iterator2, callback) {
  var state2 = initState$1(list);
  while (state2.index < (state2["keyedList"] || list).length) {
    iterate$1(list, iterator2, state2, function(error, result) {
      if (error) {
        callback(error, result);
        return;
      }
      if (Object.keys(state2.jobs).length === 0) {
        callback(null, state2.results);
        return;
      }
    });
    state2.index++;
  }
  return terminator$1.bind(state2, callback);
}
var serialOrdered$2 = { exports: {} };
var iterate = iterate_1, initState = state_1, terminator = terminator_1;
serialOrdered$2.exports = serialOrdered$1;
serialOrdered$2.exports.ascending = ascending;
serialOrdered$2.exports.descending = descending;
function serialOrdered$1(list, iterator2, sortMethod, callback) {
  var state2 = initState(list, sortMethod);
  iterate(list, iterator2, state2, function iteratorHandler(error, result) {
    if (error) {
      callback(error, result);
      return;
    }
    state2.index++;
    if (state2.index < (state2["keyedList"] || list).length) {
      iterate(list, iterator2, state2, iteratorHandler);
      return;
    }
    callback(null, state2.results);
  });
  return terminator.bind(state2, callback);
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function descending(a, b) {
  return -1 * ascending(a, b);
}
var serialOrderedExports = serialOrdered$2.exports;
var serialOrdered = serialOrderedExports;
var serial_1 = serial;
function serial(list, iterator2, callback) {
  return serialOrdered(list, iterator2, null, callback);
}
var asynckit$1 = {
  parallel: parallel_1,
  serial: serial_1,
  serialOrdered: serialOrderedExports
};
var esObjectAtoms = Object;
var esErrors = Error;
var _eval = EvalError;
var range = RangeError;
var ref = ReferenceError;
var syntax = SyntaxError;
var type;
var hasRequiredType;
function requireType() {
  if (hasRequiredType) return type;
  hasRequiredType = 1;
  type = TypeError;
  return type;
}
var uri = URIError;
var abs$1 = Math.abs;
var floor$1 = Math.floor;
var max$2 = Math.max;
var min$1 = Math.min;
var pow$1 = Math.pow;
var round$1 = Math.round;
var _isNaN = Number.isNaN || function isNaN2(a) {
  return a !== a;
};
var $isNaN = _isNaN;
var sign$1 = function sign(number) {
  if ($isNaN(number) || number === 0) {
    return number;
  }
  return number < 0 ? -1 : 1;
};
var gOPD = Object.getOwnPropertyDescriptor;
var $gOPD$1 = gOPD;
if ($gOPD$1) {
  try {
    $gOPD$1([], "length");
  } catch (e) {
    $gOPD$1 = null;
  }
}
var gopd = $gOPD$1;
var $defineProperty$2 = Object.defineProperty || false;
if ($defineProperty$2) {
  try {
    $defineProperty$2({}, "a", { value: 1 });
  } catch (e) {
    $defineProperty$2 = false;
  }
}
var esDefineProperty = $defineProperty$2;
var shams$1;
var hasRequiredShams$1;
function requireShams$1() {
  if (hasRequiredShams$1) return shams$1;
  hasRequiredShams$1 = 1;
  shams$1 = function hasSymbols2() {
    if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
      return false;
    }
    if (typeof Symbol.iterator === "symbol") {
      return true;
    }
    var obj = {};
    var sym = Symbol("test");
    var symObj = Object(sym);
    if (typeof sym === "string") {
      return false;
    }
    if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
      return false;
    }
    if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
      return false;
    }
    var symVal = 42;
    obj[sym] = symVal;
    for (var _ in obj) {
      return false;
    }
    if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
      return false;
    }
    if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
      return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
      return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
      return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === "function") {
      var descriptor = (
        /** @type {PropertyDescriptor} */
        Object.getOwnPropertyDescriptor(obj, sym)
      );
      if (descriptor.value !== symVal || descriptor.enumerable !== true) {
        return false;
      }
    }
    return true;
  };
  return shams$1;
}
var hasSymbols$1;
var hasRequiredHasSymbols;
function requireHasSymbols() {
  if (hasRequiredHasSymbols) return hasSymbols$1;
  hasRequiredHasSymbols = 1;
  var origSymbol = typeof Symbol !== "undefined" && Symbol;
  var hasSymbolSham = requireShams$1();
  hasSymbols$1 = function hasNativeSymbols() {
    if (typeof origSymbol !== "function") {
      return false;
    }
    if (typeof Symbol !== "function") {
      return false;
    }
    if (typeof origSymbol("foo") !== "symbol") {
      return false;
    }
    if (typeof Symbol("bar") !== "symbol") {
      return false;
    }
    return hasSymbolSham();
  };
  return hasSymbols$1;
}
var Reflect_getPrototypeOf;
var hasRequiredReflect_getPrototypeOf;
function requireReflect_getPrototypeOf() {
  if (hasRequiredReflect_getPrototypeOf) return Reflect_getPrototypeOf;
  hasRequiredReflect_getPrototypeOf = 1;
  Reflect_getPrototypeOf = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  return Reflect_getPrototypeOf;
}
var Object_getPrototypeOf;
var hasRequiredObject_getPrototypeOf;
function requireObject_getPrototypeOf() {
  if (hasRequiredObject_getPrototypeOf) return Object_getPrototypeOf;
  hasRequiredObject_getPrototypeOf = 1;
  var $Object2 = esObjectAtoms;
  Object_getPrototypeOf = $Object2.getPrototypeOf || null;
  return Object_getPrototypeOf;
}
var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
var toStr = Object.prototype.toString;
var max$1 = Math.max;
var funcType = "[object Function]";
var concatty = function concatty2(a, b) {
  var arr = [];
  for (var i = 0; i < a.length; i += 1) {
    arr[i] = a[i];
  }
  for (var j = 0; j < b.length; j += 1) {
    arr[j + a.length] = b[j];
  }
  return arr;
};
var slicy = function slicy2(arrLike, offset) {
  var arr = [];
  for (var i = offset, j = 0; i < arrLike.length; i += 1, j += 1) {
    arr[j] = arrLike[i];
  }
  return arr;
};
var joiny = function(arr, joiner) {
  var str = "";
  for (var i = 0; i < arr.length; i += 1) {
    str += arr[i];
    if (i + 1 < arr.length) {
      str += joiner;
    }
  }
  return str;
};
var implementation$1 = function bind(that) {
  var target = this;
  if (typeof target !== "function" || toStr.apply(target) !== funcType) {
    throw new TypeError(ERROR_MESSAGE + target);
  }
  var args = slicy(arguments, 1);
  var bound;
  var binder = function() {
    if (this instanceof bound) {
      var result = target.apply(
        this,
        concatty(args, arguments)
      );
      if (Object(result) === result) {
        return result;
      }
      return this;
    }
    return target.apply(
      that,
      concatty(args, arguments)
    );
  };
  var boundLength = max$1(0, target.length - args.length);
  var boundArgs = [];
  for (var i = 0; i < boundLength; i++) {
    boundArgs[i] = "$" + i;
  }
  bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
  if (target.prototype) {
    var Empty = function Empty2() {
    };
    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }
  return bound;
};
var implementation = implementation$1;
var functionBind = Function.prototype.bind || implementation;
var functionCall;
var hasRequiredFunctionCall;
function requireFunctionCall() {
  if (hasRequiredFunctionCall) return functionCall;
  hasRequiredFunctionCall = 1;
  functionCall = Function.prototype.call;
  return functionCall;
}
var functionApply;
var hasRequiredFunctionApply;
function requireFunctionApply() {
  if (hasRequiredFunctionApply) return functionApply;
  hasRequiredFunctionApply = 1;
  functionApply = Function.prototype.apply;
  return functionApply;
}
var reflectApply;
var hasRequiredReflectApply;
function requireReflectApply() {
  if (hasRequiredReflectApply) return reflectApply;
  hasRequiredReflectApply = 1;
  reflectApply = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
  return reflectApply;
}
var actualApply;
var hasRequiredActualApply;
function requireActualApply() {
  if (hasRequiredActualApply) return actualApply;
  hasRequiredActualApply = 1;
  var bind3 = functionBind;
  var $apply2 = requireFunctionApply();
  var $call2 = requireFunctionCall();
  var $reflectApply = requireReflectApply();
  actualApply = $reflectApply || bind3.call($call2, $apply2);
  return actualApply;
}
var callBindApplyHelpers;
var hasRequiredCallBindApplyHelpers;
function requireCallBindApplyHelpers() {
  if (hasRequiredCallBindApplyHelpers) return callBindApplyHelpers;
  hasRequiredCallBindApplyHelpers = 1;
  var bind3 = functionBind;
  var $TypeError2 = requireType();
  var $call2 = requireFunctionCall();
  var $actualApply = requireActualApply();
  callBindApplyHelpers = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== "function") {
      throw new $TypeError2("a function is required");
    }
    return $actualApply(bind3, $call2, args);
  };
  return callBindApplyHelpers;
}
var get;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet) return get;
  hasRequiredGet = 1;
  var callBind = requireCallBindApplyHelpers();
  var gOPD2 = gopd;
  var hasProtoAccessor;
  try {
    hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
    [].__proto__ === Array.prototype;
  } catch (e) {
    if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
      throw e;
    }
  }
  var desc = !!hasProtoAccessor && gOPD2 && gOPD2(
    Object.prototype,
    /** @type {keyof typeof Object.prototype} */
    "__proto__"
  );
  var $Object2 = Object;
  var $getPrototypeOf = $Object2.getPrototypeOf;
  get = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
    /** @type {import('./get')} */
    function getDunder(value) {
      return $getPrototypeOf(value == null ? value : $Object2(value));
    }
  ) : false;
  return get;
}
var getProto$1;
var hasRequiredGetProto;
function requireGetProto() {
  if (hasRequiredGetProto) return getProto$1;
  hasRequiredGetProto = 1;
  var reflectGetProto = requireReflect_getPrototypeOf();
  var originalGetProto = requireObject_getPrototypeOf();
  var getDunderProto = requireGet();
  getProto$1 = reflectGetProto ? function getProto2(O) {
    return reflectGetProto(O);
  } : originalGetProto ? function getProto2(O) {
    if (!O || typeof O !== "object" && typeof O !== "function") {
      throw new TypeError("getProto: not an object");
    }
    return originalGetProto(O);
  } : getDunderProto ? function getProto2(O) {
    return getDunderProto(O);
  } : null;
  return getProto$1;
}
var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind$1 = functionBind;
var hasown = bind$1.call(call, $hasOwn);
var undefined$1;
var $Object = esObjectAtoms;
var $Error = esErrors;
var $EvalError = _eval;
var $RangeError = range;
var $ReferenceError = ref;
var $SyntaxError = syntax;
var $TypeError$1 = requireType();
var $URIError = uri;
var abs = abs$1;
var floor = floor$1;
var max = max$2;
var min = min$1;
var pow = pow$1;
var round = round$1;
var sign2 = sign$1;
var $Function = Function;
var getEvalledConstructor = function(expressionSyntax) {
  try {
    return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
  } catch (e) {
  }
};
var $gOPD = gopd;
var $defineProperty$1 = esDefineProperty;
var throwTypeError = function() {
  throw new $TypeError$1();
};
var ThrowTypeError = $gOPD ? function() {
  try {
    arguments.callee;
    return throwTypeError;
  } catch (calleeThrows) {
    try {
      return $gOPD(arguments, "callee").get;
    } catch (gOPDthrows) {
      return throwTypeError;
    }
  }
}() : throwTypeError;
var hasSymbols = requireHasSymbols()();
var getProto = requireGetProto();
var $ObjectGPO = requireObject_getPrototypeOf();
var $ReflectGPO = requireReflect_getPrototypeOf();
var $apply = requireFunctionApply();
var $call = requireFunctionCall();
var needsEval = {};
var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined$1 : getProto(Uint8Array);
var INTRINSICS = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
  "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined$1,
  "%AsyncFromSyncIteratorPrototype%": undefined$1,
  "%AsyncFunction%": needsEval,
  "%AsyncGenerator%": needsEval,
  "%AsyncGeneratorFunction%": needsEval,
  "%AsyncIteratorPrototype%": needsEval,
  "%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
  "%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
  "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": $Error,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": $EvalError,
  "%Float16Array%": typeof Float16Array === "undefined" ? undefined$1 : Float16Array,
  "%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
  "%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
  "%Function%": $Function,
  "%GeneratorFunction%": needsEval,
  "%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
  "%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
  "%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
  "%JSON%": typeof JSON === "object" ? JSON : undefined$1,
  "%Map%": typeof Map === "undefined" ? undefined$1 : Map,
  "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": $Object,
  "%Object.getOwnPropertyDescriptor%": $gOPD,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
  "%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
  "%RangeError%": $RangeError,
  "%ReferenceError%": $ReferenceError,
  "%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set === "undefined" ? undefined$1 : Set,
  "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined$1,
  "%Symbol%": hasSymbols ? Symbol : undefined$1,
  "%SyntaxError%": $SyntaxError,
  "%ThrowTypeError%": ThrowTypeError,
  "%TypedArray%": TypedArray,
  "%TypeError%": $TypeError$1,
  "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
  "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
  "%URIError%": $URIError,
  "%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
  "%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
  "%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet,
  "%Function.prototype.call%": $call,
  "%Function.prototype.apply%": $apply,
  "%Object.defineProperty%": $defineProperty$1,
  "%Object.getPrototypeOf%": $ObjectGPO,
  "%Math.abs%": abs,
  "%Math.floor%": floor,
  "%Math.max%": max,
  "%Math.min%": min,
  "%Math.pow%": pow,
  "%Math.round%": round,
  "%Math.sign%": sign2,
  "%Reflect.getPrototypeOf%": $ReflectGPO
};
if (getProto) {
  try {
    null.error;
  } catch (e) {
    var errorProto = getProto(getProto(e));
    INTRINSICS["%Error.prototype%"] = errorProto;
  }
}
var doEval = function doEval2(name) {
  var value;
  if (name === "%AsyncFunction%") {
    value = getEvalledConstructor("async function () {}");
  } else if (name === "%GeneratorFunction%") {
    value = getEvalledConstructor("function* () {}");
  } else if (name === "%AsyncGeneratorFunction%") {
    value = getEvalledConstructor("async function* () {}");
  } else if (name === "%AsyncGenerator%") {
    var fn = doEval2("%AsyncGeneratorFunction%");
    if (fn) {
      value = fn.prototype;
    }
  } else if (name === "%AsyncIteratorPrototype%") {
    var gen = doEval2("%AsyncGenerator%");
    if (gen && getProto) {
      value = getProto(gen.prototype);
    }
  }
  INTRINSICS[name] = value;
  return value;
};
var LEGACY_ALIASES = {
  __proto__: null,
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
};
var bind2 = functionBind;
var hasOwn$2 = hasown;
var $concat = bind2.call($call, Array.prototype.concat);
var $spliceApply = bind2.call($apply, Array.prototype.splice);
var $replace = bind2.call($call, String.prototype.replace);
var $strSlice = bind2.call($call, String.prototype.slice);
var $exec = bind2.call($call, RegExp.prototype.exec);
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = function stringToPath2(string2) {
  var first = $strSlice(string2, 0, 1);
  var last = $strSlice(string2, -1);
  if (first === "%" && last !== "%") {
    throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
  } else if (last === "%" && first !== "%") {
    throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
  }
  var result = [];
  $replace(string2, rePropName, function(match, number, quote, subString) {
    result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
  });
  return result;
};
var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
  var intrinsicName = name;
  var alias;
  if (hasOwn$2(LEGACY_ALIASES, intrinsicName)) {
    alias = LEGACY_ALIASES[intrinsicName];
    intrinsicName = "%" + alias[0] + "%";
  }
  if (hasOwn$2(INTRINSICS, intrinsicName)) {
    var value = INTRINSICS[intrinsicName];
    if (value === needsEval) {
      value = doEval(intrinsicName);
    }
    if (typeof value === "undefined" && !allowMissing) {
      throw new $TypeError$1("intrinsic " + name + " exists, but is not available. Please file an issue!");
    }
    return {
      alias,
      name: intrinsicName,
      value
    };
  }
  throw new $SyntaxError("intrinsic " + name + " does not exist!");
};
var getIntrinsic = function GetIntrinsic(name, allowMissing) {
  if (typeof name !== "string" || name.length === 0) {
    throw new $TypeError$1("intrinsic name must be a non-empty string");
  }
  if (arguments.length > 1 && typeof allowMissing !== "boolean") {
    throw new $TypeError$1('"allowMissing" argument must be a boolean');
  }
  if ($exec(/^%?[^%]*%?$/, name) === null) {
    throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  }
  var parts = stringToPath(name);
  var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
  var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
  var intrinsicRealName = intrinsic.name;
  var value = intrinsic.value;
  var skipFurtherCaching = false;
  var alias = intrinsic.alias;
  if (alias) {
    intrinsicBaseName = alias[0];
    $spliceApply(parts, $concat([0, 1], alias));
  }
  for (var i = 1, isOwn = true; i < parts.length; i += 1) {
    var part = parts[i];
    var first = $strSlice(part, 0, 1);
    var last = $strSlice(part, -1);
    if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
      throw new $SyntaxError("property names with quotes must have matching quotes");
    }
    if (part === "constructor" || !isOwn) {
      skipFurtherCaching = true;
    }
    intrinsicBaseName += "." + part;
    intrinsicRealName = "%" + intrinsicBaseName + "%";
    if (hasOwn$2(INTRINSICS, intrinsicRealName)) {
      value = INTRINSICS[intrinsicRealName];
    } else if (value != null) {
      if (!(part in value)) {
        if (!allowMissing) {
          throw new $TypeError$1("base intrinsic for " + name + " exists, but the property is not available.");
        }
        return void 0;
      }
      if ($gOPD && i + 1 >= parts.length) {
        var desc = $gOPD(value, part);
        isOwn = !!desc;
        if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
          value = desc.get;
        } else {
          value = value[part];
        }
      } else {
        isOwn = hasOwn$2(value, part);
        value = value[part];
      }
      if (isOwn && !skipFurtherCaching) {
        INTRINSICS[intrinsicRealName] = value;
      }
    }
  }
  return value;
};
var shams;
var hasRequiredShams;
function requireShams() {
  if (hasRequiredShams) return shams;
  hasRequiredShams = 1;
  var hasSymbols2 = requireShams$1();
  shams = function hasToStringTagShams() {
    return hasSymbols2() && !!Symbol.toStringTag;
  };
  return shams;
}
var GetIntrinsic2 = getIntrinsic;
var $defineProperty = GetIntrinsic2("%Object.defineProperty%", true);
var hasToStringTag = requireShams()();
var hasOwn$1 = hasown;
var $TypeError = requireType();
var toStringTag = hasToStringTag ? Symbol.toStringTag : null;
var esSetTostringtag = function setToStringTag(object, value) {
  var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
  var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
  if (typeof overrideIfSet !== "undefined" && typeof overrideIfSet !== "boolean" || typeof nonConfigurable !== "undefined" && typeof nonConfigurable !== "boolean") {
    throw new $TypeError("if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans");
  }
  if (toStringTag && (overrideIfSet || !hasOwn$1(object, toStringTag))) {
    if ($defineProperty) {
      $defineProperty(object, toStringTag, {
        configurable: !nonConfigurable,
        enumerable: false,
        value,
        writable: false
      });
    } else {
      object[toStringTag] = value;
    }
  }
};
var populate$1 = function(dst, src2) {
  Object.keys(src2).forEach(function(prop) {
    dst[prop] = dst[prop] || src2[prop];
  });
  return dst;
};
var CombinedStream = combined_stream;
var util$1 = require$$1;
var path = path$1;
var http$1 = require$$3;
var https$1 = require$$4;
var parseUrl$2 = require$$0$3.parse;
var fs = fs$1;
var Stream = stream.Stream;
var crypto = require$$8;
var mime = mimeTypes;
var asynckit = asynckit$1;
var setToStringTag2 = esSetTostringtag;
var hasOwn = hasown;
var populate = populate$1;
function FormData$1(options) {
  if (!(this instanceof FormData$1)) {
    return new FormData$1(options);
  }
  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];
  CombinedStream.call(this);
  options = options || {};
  for (var option in options) {
    this[option] = options[option];
  }
}
util$1.inherits(FormData$1, CombinedStream);
FormData$1.LINE_BREAK = "\r\n";
FormData$1.DEFAULT_CONTENT_TYPE = "application/octet-stream";
FormData$1.prototype.append = function(field, value, options) {
  options = options || {};
  if (typeof options === "string") {
    options = { filename: options };
  }
  var append2 = CombinedStream.prototype.append.bind(this);
  if (typeof value === "number" || value == null) {
    value = String(value);
  }
  if (Array.isArray(value)) {
    this._error(new Error("Arrays are not supported."));
    return;
  }
  var header = this._multiPartHeader(field, value, options);
  var footer = this._multiPartFooter();
  append2(header);
  append2(value);
  append2(footer);
  this._trackLength(header, value, options);
};
FormData$1.prototype._trackLength = function(header, value, options) {
  var valueLength = 0;
  if (options.knownLength != null) {
    valueLength += Number(options.knownLength);
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === "string") {
    valueLength = Buffer.byteLength(value);
  }
  this._valueLength += valueLength;
  this._overheadLength += Buffer.byteLength(header) + FormData$1.LINE_BREAK.length;
  if (!value || !value.path && !(value.readable && hasOwn(value, "httpVersion")) && !(value instanceof Stream)) {
    return;
  }
  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};
FormData$1.prototype._lengthRetriever = function(value, callback) {
  if (hasOwn(value, "fd")) {
    if (value.end != void 0 && value.end != Infinity && value.start != void 0) {
      callback(null, value.end + 1 - (value.start ? value.start : 0));
    } else {
      fs.stat(value.path, function(err, stat) {
        if (err) {
          callback(err);
          return;
        }
        var fileSize = stat.size - (value.start ? value.start : 0);
        callback(null, fileSize);
      });
    }
  } else if (hasOwn(value, "httpVersion")) {
    callback(null, Number(value.headers["content-length"]));
  } else if (hasOwn(value, "httpModule")) {
    value.on("response", function(response) {
      value.pause();
      callback(null, Number(response.headers["content-length"]));
    });
    value.resume();
  } else {
    callback("Unknown stream");
  }
};
FormData$1.prototype._multiPartHeader = function(field, value, options) {
  if (typeof options.header === "string") {
    return options.header;
  }
  var contentDisposition = this._getContentDisposition(value, options);
  var contentType = this._getContentType(value, options);
  var contents = "";
  var headers2 = {
    // add custom disposition as third element or keep it two elements if not
    "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
    // if no content type. allow it to be empty array
    "Content-Type": [].concat(contentType || [])
  };
  if (typeof options.header === "object") {
    populate(headers2, options.header);
  }
  var header;
  for (var prop in headers2) {
    if (hasOwn(headers2, prop)) {
      header = headers2[prop];
      if (header == null) {
        continue;
      }
      if (!Array.isArray(header)) {
        header = [header];
      }
      if (header.length) {
        contents += prop + ": " + header.join("; ") + FormData$1.LINE_BREAK;
      }
    }
  }
  return "--" + this.getBoundary() + FormData$1.LINE_BREAK + contents + FormData$1.LINE_BREAK;
};
FormData$1.prototype._getContentDisposition = function(value, options) {
  var filename;
  if (typeof options.filepath === "string") {
    filename = path.normalize(options.filepath).replace(/\\/g, "/");
  } else if (options.filename || value && (value.name || value.path)) {
    filename = path.basename(options.filename || value && (value.name || value.path));
  } else if (value && value.readable && hasOwn(value, "httpVersion")) {
    filename = path.basename(value.client._httpMessage.path || "");
  }
  if (filename) {
    return 'filename="' + filename + '"';
  }
};
FormData$1.prototype._getContentType = function(value, options) {
  var contentType = options.contentType;
  if (!contentType && value && value.name) {
    contentType = mime.lookup(value.name);
  }
  if (!contentType && value && value.path) {
    contentType = mime.lookup(value.path);
  }
  if (!contentType && value && value.readable && hasOwn(value, "httpVersion")) {
    contentType = value.headers["content-type"];
  }
  if (!contentType && (options.filepath || options.filename)) {
    contentType = mime.lookup(options.filepath || options.filename);
  }
  if (!contentType && value && typeof value === "object") {
    contentType = FormData$1.DEFAULT_CONTENT_TYPE;
  }
  return contentType;
};
FormData$1.prototype._multiPartFooter = function() {
  return (function(next) {
    var footer = FormData$1.LINE_BREAK;
    var lastPart = this._streams.length === 0;
    if (lastPart) {
      footer += this._lastBoundary();
    }
    next(footer);
  }).bind(this);
};
FormData$1.prototype._lastBoundary = function() {
  return "--" + this.getBoundary() + "--" + FormData$1.LINE_BREAK;
};
FormData$1.prototype.getHeaders = function(userHeaders) {
  var header;
  var formHeaders = {
    "content-type": "multipart/form-data; boundary=" + this.getBoundary()
  };
  for (header in userHeaders) {
    if (hasOwn(userHeaders, header)) {
      formHeaders[header.toLowerCase()] = userHeaders[header];
    }
  }
  return formHeaders;
};
FormData$1.prototype.setBoundary = function(boundary) {
  if (typeof boundary !== "string") {
    throw new TypeError("FormData boundary must be a string");
  }
  this._boundary = boundary;
};
FormData$1.prototype.getBoundary = function() {
  if (!this._boundary) {
    this._generateBoundary();
  }
  return this._boundary;
};
FormData$1.prototype.getBuffer = function() {
  var dataBuffer = new Buffer.alloc(0);
  var boundary = this.getBoundary();
  for (var i = 0, len = this._streams.length; i < len; i++) {
    if (typeof this._streams[i] !== "function") {
      if (Buffer.isBuffer(this._streams[i])) {
        dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
      } else {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
      }
      if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData$1.LINE_BREAK)]);
      }
    }
  }
  return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
};
FormData$1.prototype._generateBoundary = function() {
  this._boundary = "--------------------------" + crypto.randomBytes(12).toString("hex");
};
FormData$1.prototype.getLengthSync = function() {
  var knownLength = this._overheadLength + this._valueLength;
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }
  if (!this.hasKnownLength()) {
    this._error(new Error("Cannot calculate proper length in synchronous way."));
  }
  return knownLength;
};
FormData$1.prototype.hasKnownLength = function() {
  var hasKnownLength = true;
  if (this._valuesToMeasure.length) {
    hasKnownLength = false;
  }
  return hasKnownLength;
};
FormData$1.prototype.getLength = function(cb) {
  var knownLength = this._overheadLength + this._valueLength;
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }
  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }
  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
    if (err) {
      cb(err);
      return;
    }
    values.forEach(function(length) {
      knownLength += length;
    });
    cb(null, knownLength);
  });
};
FormData$1.prototype.submit = function(params, cb) {
  var request;
  var options;
  var defaults2 = { method: "post" };
  if (typeof params === "string") {
    params = parseUrl$2(params);
    options = populate({
      port: params.port,
      path: params.pathname,
      host: params.hostname,
      protocol: params.protocol
    }, defaults2);
  } else {
    options = populate(params, defaults2);
    if (!options.port) {
      options.port = options.protocol === "https:" ? 443 : 80;
    }
  }
  options.headers = this.getHeaders(params.headers);
  if (options.protocol === "https:") {
    request = https$1.request(options);
  } else {
    request = http$1.request(options);
  }
  this.getLength((function(err, length) {
    if (err && err !== "Unknown stream") {
      this._error(err);
      return;
    }
    if (length) {
      request.setHeader("Content-Length", length);
    }
    this.pipe(request);
    if (cb) {
      var onResponse;
      var callback = function(error, responce) {
        request.removeListener("error", callback);
        request.removeListener("response", onResponse);
        return cb.call(this, error, responce);
      };
      onResponse = callback.bind(this, null);
      request.on("error", callback);
      request.on("response", onResponse);
    }
  }).bind(this));
  return request;
};
FormData$1.prototype._error = function(err) {
  if (!this.error) {
    this.error = err;
    this.pause();
    this.emit("error", err);
  }
};
FormData$1.prototype.toString = function() {
  return "[object FormData]";
};
setToStringTag2(FormData$1.prototype, "FormData");
var form_data = FormData$1;
const FormData$2 = /* @__PURE__ */ getDefaultExportFromCjs(form_data);
function isVisitable(thing) {
  return utils$2.isPlainObject(thing) || utils$2.isArray(thing);
}
function removeBrackets(key) {
  return utils$2.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path2, key, dots) {
  if (!path2) return key;
  return path2.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$2.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$2.toFlatObject(utils$2, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$2.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (FormData$2 || FormData)();
  options = utils$2.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils$2.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$2.isSpecCompliantForm(formData);
  if (!utils$2.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$2.isDate(value)) {
      return value.toISOString();
    }
    if (utils$2.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$2.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$2.isArrayBuffer(value) || utils$2.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path2) {
    let arr = value;
    if (value && !path2 && typeof value === "object") {
      if (utils$2.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$2.isArray(value) && isFlatArray(value) || (utils$2.isFileList(value) || utils$2.endsWith(key, "[]")) && (arr = utils$2.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils$2.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path2, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path2) {
    if (utils$2.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path2.join("."));
    }
    stack.push(value);
    utils$2.forEach(value, function each(el, key) {
      const result = !(utils$2.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$2.isString(key) ? key.trim() : key,
        path2,
        exposedHelpers
      );
      if (result === true) {
        build(el, path2 ? path2.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$2.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url2, params, options) {
  if (!params) {
    return url2;
  }
  const _encode = options && options.encode || encode;
  if (utils$2.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils$2.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url2.indexOf("#");
    if (hashmarkIndex !== -1) {
      url2 = url2.slice(0, hashmarkIndex);
    }
    url2 += (url2.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url2;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$2.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams = require$$0$3.URLSearchParams;
const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const DIGIT = "0123456789";
const ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
};
const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = "";
  const { length } = alphabet;
  const randomValues = new Uint32Array(size);
  require$$8.randomFillSync(randomValues);
  for (let i = 0; i < size; i++) {
    str += alphabet[randomValues[i] % length];
  }
  return str;
};
const platform$1 = {
  isNode: true,
  classes: {
    URLSearchParams,
    FormData: FormData$2,
    Blob: typeof Blob !== "undefined" && Blob || null
  },
  ALPHABET,
  generateString,
  protocols: ["http", "https", "file", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = {
  ...utils$1,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path2, helpers) {
      if (platform.isNode && utils$2.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$2.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path2, value, target, index) {
    let name = path2[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path2.length;
    name = !name && utils$2.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$2.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$2.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path2, value, target[name], index);
    if (result && utils$2.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$2.isFormData(formData) && utils$2.isFunction(formData.entries)) {
    const obj = {};
    utils$2.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser2, encoder) {
  if (utils$2.isString(rawValue)) {
    try {
      (parser2 || JSON.parse)(rawValue);
      return utils$2.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers2) {
    const contentType = headers2.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$2.isObject(data);
    if (isObjectPayload && utils$2.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$2.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$2.isArrayBuffer(data) || utils$2.isBuffer(data) || utils$2.isStream(data) || utils$2.isFile(data) || utils$2.isBlob(data) || utils$2.isReadableStream(data)) {
      return data;
    }
    if (utils$2.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$2.isURLSearchParams(data)) {
      headers2.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$2.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers2.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$2.isResponse(data) || utils$2.isReadableStream(data)) {
      return data;
    }
    if (data && utils$2.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data, this.parseReviver);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$2.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
const ignoreDuplicateOf = utils$2.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser2(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$2.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$2.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$2.isString(value)) return;
  if (utils$2.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$2.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$2.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers2) {
    headers2 && this.set(headers2);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$2.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers2, _rewrite) => utils$2.forEach(headers2, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$2.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$2.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$2.isObject(header) && utils$2.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$2.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$2.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser2) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$2.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser2) {
          return value;
        }
        if (parser2 === true) {
          return parseTokens(value);
        }
        if (utils$2.isFunction(parser2)) {
          return parser2.call(this, value, key);
        }
        if (utils$2.isRegExp(parser2)) {
          return parser2.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$2.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$2.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$2.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers2 = {};
    utils$2.forEach(this, (value, header) => {
      const key = utils$2.findKey(headers2, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers2[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$2.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$2.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$2.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$2.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$2.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config2 = this || defaults;
  const context = response || config2;
  const headers2 = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$2.forEach(fns, function transform(fn) {
    data = fn.call(config2, data, headers2.normalize(), response ? response.status : void 0);
  });
  headers2.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
function CanceledError$1(message, config2, request) {
  AxiosError$1.call(this, message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config2, request);
  this.name = "CanceledError";
}
utils$2.inherits(CanceledError$1, AxiosError$1, {
  __CANCEL__: true
});
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function isAbsoluteURL(url2) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url2);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
var proxyFromEnv = {};
var parseUrl$1 = require$$0$3.parse;
var DEFAULT_PORTS = {
  ftp: 21,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};
var stringEndsWith = String.prototype.endsWith || function(s) {
  return s.length <= this.length && this.indexOf(s, this.length - s.length) !== -1;
};
function getProxyForUrl(url2) {
  var parsedUrl = typeof url2 === "string" ? parseUrl$1(url2) : url2 || {};
  var proto = parsedUrl.protocol;
  var hostname = parsedUrl.host;
  var port = parsedUrl.port;
  if (typeof hostname !== "string" || !hostname || typeof proto !== "string") {
    return "";
  }
  proto = proto.split(":", 1)[0];
  hostname = hostname.replace(/:\d*$/, "");
  port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
  if (!shouldProxy(hostname, port)) {
    return "";
  }
  var proxy = getEnv("npm_config_" + proto + "_proxy") || getEnv(proto + "_proxy") || getEnv("npm_config_proxy") || getEnv("all_proxy");
  if (proxy && proxy.indexOf("://") === -1) {
    proxy = proto + "://" + proxy;
  }
  return proxy;
}
function shouldProxy(hostname, port) {
  var NO_PROXY = (getEnv("npm_config_no_proxy") || getEnv("no_proxy")).toLowerCase();
  if (!NO_PROXY) {
    return true;
  }
  if (NO_PROXY === "*") {
    return false;
  }
  return NO_PROXY.split(/[,\s]/).every(function(proxy) {
    if (!proxy) {
      return true;
    }
    var parsedProxy = proxy.match(/^(.+):(\d+)$/);
    var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
    var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
    if (parsedProxyPort && parsedProxyPort !== port) {
      return true;
    }
    if (!/^[.*]/.test(parsedProxyHostname)) {
      return hostname !== parsedProxyHostname;
    }
    if (parsedProxyHostname.charAt(0) === "*") {
      parsedProxyHostname = parsedProxyHostname.slice(1);
    }
    return !stringEndsWith.call(hostname, parsedProxyHostname);
  });
}
function getEnv(key) {
  return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || "";
}
proxyFromEnv.getProxyForUrl = getProxyForUrl;
var followRedirects$1 = { exports: {} };
var src = { exports: {} };
var browser = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type2 = typeof val;
    if (type2 === "string" && val.length > 0) {
      return parse2(val);
    } else if (type2 === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type2 = (match[2] || "ms").toLowerCase();
    switch (type2) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
  }
  return ms;
}
var common;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy2;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args) {
        if (!debug2.enabled) {
          return;
        }
        const self2 = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend2;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend2(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy2() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common = setup;
  return common;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module2, exports$1) {
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.storage = localstorage();
    exports$1.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports$1.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports$1.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports$1.storage.setItem("debug", namespaces);
        } else {
          exports$1.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports$1.storage.getItem("debug") || exports$1.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = requireCommon()(exports$1);
    const { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag) return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os = require$$0$4;
  const tty = require$$1$1;
  const hasFlag2 = requireHasFlag();
  const { env } = process;
  let forceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
    forceColor = 0;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
      return 3;
    }
    if (hasFlag2("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min2 = forceColor || 0;
    if (env.TERM === "dumb") {
      return min2;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign3) => sign3 in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min2;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version2 = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version2 >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min2;
  }
  function getSupportLevel(stream2) {
    const level = supportsColor(stream2, stream2 && stream2.isTTY);
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module2, exports$1) {
    const tty = require$$1$1;
    const util2 = require$$1;
    exports$1.init = init;
    exports$1.log = log2;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.destroy = util2.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports$1.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports$1.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports$1.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports$1.inspectOpts ? Boolean(exports$1.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports$1.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log2(...args) {
      return process.stderr.write(util2.formatWithOptions(exports$1.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys = Object.keys(exports$1.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports$1.inspectOpts[keys[i]];
      }
    }
    module2.exports = requireCommon()(exports$1);
    const { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src.exports;
  hasRequiredSrc = 1;
  if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
    src.exports = requireBrowser();
  } else {
    src.exports = requireNode();
  }
  return src.exports;
}
var debug$1;
var debug_1 = function() {
  if (!debug$1) {
    try {
      debug$1 = requireSrc()("follow-redirects");
    } catch (error) {
    }
    if (typeof debug$1 !== "function") {
      debug$1 = function() {
      };
    }
  }
  debug$1.apply(null, arguments);
};
var url = require$$0$3;
var URL$1 = url.URL;
var http = require$$3;
var https = require$$4;
var Writable = stream.Writable;
var assert = require$$4$1;
var debug = debug_1;
(function detectUnsupportedEnvironment() {
  var looksLikeNode = typeof process !== "undefined";
  var looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  var looksLikeV8 = isFunction$1(Error.captureStackTrace);
  if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
    console.warn("The follow-redirects package should be excluded from browser builds.");
  }
})();
var useNativeURL = false;
try {
  assert(new URL$1(""));
} catch (error) {
  useNativeURL = error.code === "ERR_INVALID_URL";
}
var preservedUrlFields = [
  "auth",
  "host",
  "hostname",
  "href",
  "path",
  "pathname",
  "port",
  "protocol",
  "query",
  "search",
  "hash"
];
var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
var eventHandlers = /* @__PURE__ */ Object.create(null);
events.forEach(function(event) {
  eventHandlers[event] = function(arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});
var InvalidUrlError = createErrorType(
  "ERR_INVALID_URL",
  "Invalid URL",
  TypeError
);
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  "Redirected request failed"
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded",
  RedirectionError
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);
var destroy = Writable.prototype.destroy || noop;
function RedirectableRequest(options, responseCallback) {
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];
  if (responseCallback) {
    this.on("response", responseCallback);
  }
  var self2 = this;
  this._onNativeResponse = function(response) {
    try {
      self2._processResponse(response);
    } catch (cause) {
      self2.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
    }
  };
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);
RedirectableRequest.prototype.abort = function() {
  destroyRequest(this._currentRequest);
  this._currentRequest.abort();
  this.emit("abort");
};
RedirectableRequest.prototype.destroy = function(error) {
  destroyRequest(this._currentRequest, error);
  destroy.call(this, error);
  return this;
};
RedirectableRequest.prototype.write = function(data, encoding, callback) {
  if (this._ending) {
    throw new WriteAfterEndError();
  }
  if (!isString(data) && !isBuffer(data)) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (isFunction$1(encoding)) {
    callback = encoding;
    encoding = null;
  }
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data, encoding });
    this._currentRequest.write(data, encoding, callback);
  } else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};
RedirectableRequest.prototype.end = function(data, encoding, callback) {
  if (isFunction$1(data)) {
    callback = data;
    data = encoding = null;
  } else if (isFunction$1(encoding)) {
    callback = encoding;
    encoding = null;
  }
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  } else {
    var self2 = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function() {
      self2._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};
RedirectableRequest.prototype.setHeader = function(name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};
RedirectableRequest.prototype.removeHeader = function(name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};
RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
  var self2 = this;
  function destroyOnTimeout(socket) {
    socket.setTimeout(msecs);
    socket.removeListener("timeout", socket.destroy);
    socket.addListener("timeout", socket.destroy);
  }
  function startTimer(socket) {
    if (self2._timeout) {
      clearTimeout(self2._timeout);
    }
    self2._timeout = setTimeout(function() {
      self2.emit("timeout");
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }
  function clearTimer() {
    if (self2._timeout) {
      clearTimeout(self2._timeout);
      self2._timeout = null;
    }
    self2.removeListener("abort", clearTimer);
    self2.removeListener("error", clearTimer);
    self2.removeListener("response", clearTimer);
    self2.removeListener("close", clearTimer);
    if (callback) {
      self2.removeListener("timeout", callback);
    }
    if (!self2.socket) {
      self2._currentRequest.removeListener("socket", startTimer);
    }
  }
  if (callback) {
    this.on("timeout", callback);
  }
  if (this.socket) {
    startTimer(this.socket);
  } else {
    this._currentRequest.once("socket", startTimer);
  }
  this.on("socket", destroyOnTimeout);
  this.on("abort", clearTimer);
  this.on("error", clearTimer);
  this.on("response", clearTimer);
  this.on("close", clearTimer);
  return this;
};
[
  "flushHeaders",
  "getHeader",
  "setNoDelay",
  "setSocketKeepAlive"
].forEach(function(method) {
  RedirectableRequest.prototype[method] = function(a, b) {
    return this._currentRequest[method](a, b);
  };
});
["aborted", "connection", "socket"].forEach(function(property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function() {
      return this._currentRequest[property];
    }
  });
});
RedirectableRequest.prototype._sanitizeOptions = function(options) {
  if (!options.headers) {
    options.headers = {};
  }
  if (options.host) {
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    } else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};
RedirectableRequest.prototype._performRequest = function() {
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    throw new TypeError("Unsupported protocol " + protocol);
  }
  if (this._options.agents) {
    var scheme = protocol.slice(0, -1);
    this._options.agent = this._options.agents[scheme];
  }
  var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
  request._redirectable = this;
  for (var event of events) {
    request.on(event, eventHandlers[event]);
  }
  this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : (
    // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path
  );
  if (this._isRedirect) {
    var i = 0;
    var self2 = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      if (request === self2._currentRequest) {
        if (error) {
          self2.emit("error", error);
        } else if (i < buffers.length) {
          var buffer = buffers[i++];
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        } else if (self2._ended) {
          request.end();
        }
      }
    })();
  }
};
RedirectableRequest.prototype._processResponse = function(response) {
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode
    });
  }
  var location = response.headers.location;
  if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);
    this._requestBodyBuffers = [];
    return;
  }
  destroyRequest(this._currentRequest);
  response.destroy();
  if (++this._redirectCount > this._options.maxRedirects) {
    throw new TooManyRedirectsError();
  }
  var requestHeaders;
  var beforeRedirect = this._options.beforeRedirect;
  if (beforeRedirect) {
    requestHeaders = Object.assign({
      // The Host header was set by nativeProtocol.request
      Host: response.req.getHeader("host")
    }, this._options.headers);
  }
  var method = this._options.method;
  if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
  // the server is redirecting the user agent to a different resource […]
  // A user agent can perform a retrieval request targeting that URI
  // (a GET or HEAD request if using HTTP) […]
  statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
    this._options.method = "GET";
    this._requestBodyBuffers = [];
    removeMatchingHeaders(/^content-/i, this._options.headers);
  }
  var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
  var currentUrlParts = parseUrl(this._currentUrl);
  var currentHost = currentHostHeader || currentUrlParts.host;
  var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, { host: currentHost }));
  var redirectUrl = resolveUrl(location, currentUrl);
  debug("redirecting to", redirectUrl.href);
  this._isRedirect = true;
  spreadUrlObject(redirectUrl, this._options);
  if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
    removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
  }
  if (isFunction$1(beforeRedirect)) {
    var responseDetails = {
      headers: response.headers,
      statusCode
    };
    var requestDetails = {
      url: currentUrl,
      method,
      headers: requestHeaders
    };
    beforeRedirect(this._options, responseDetails, requestDetails);
    this._sanitizeOptions(this._options);
  }
  this._performRequest();
};
function wrap(protocols) {
  var exports$1 = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024
  };
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function(scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports$1[scheme] = Object.create(nativeProtocol);
    function request(input, options, callback) {
      if (isURL(input)) {
        input = spreadUrlObject(input);
      } else if (isString(input)) {
        input = spreadUrlObject(parseUrl(input));
      } else {
        callback = options;
        options = validateUrl(input);
        input = { protocol };
      }
      if (isFunction$1(options)) {
        callback = options;
        options = null;
      }
      options = Object.assign({
        maxRedirects: exports$1.maxRedirects,
        maxBodyLength: exports$1.maxBodyLength
      }, input, options);
      options.nativeProtocols = nativeProtocols;
      if (!isString(options.host) && !isString(options.hostname)) {
        options.hostname = "::1";
      }
      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }
    function get2(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get2, configurable: true, enumerable: true, writable: true }
    });
  });
  return exports$1;
}
function noop() {
}
function parseUrl(input) {
  var parsed;
  if (useNativeURL) {
    parsed = new URL$1(input);
  } else {
    parsed = validateUrl(url.parse(input));
    if (!isString(parsed.protocol)) {
      throw new InvalidUrlError({ input });
    }
  }
  return parsed;
}
function resolveUrl(relative, base) {
  return useNativeURL ? new URL$1(relative, base) : parseUrl(url.resolve(base, relative));
}
function validateUrl(input) {
  if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  return input;
}
function spreadUrlObject(urlObject, target) {
  var spread2 = target || {};
  for (var key of preservedUrlFields) {
    spread2[key] = urlObject[key];
  }
  if (spread2.hostname.startsWith("[")) {
    spread2.hostname = spread2.hostname.slice(1, -1);
  }
  if (spread2.port !== "") {
    spread2.port = Number(spread2.port);
  }
  spread2.path = spread2.search ? spread2.pathname + spread2.search : spread2.pathname;
  return spread2;
}
function removeMatchingHeaders(regex, headers2) {
  var lastValue;
  for (var header in headers2) {
    if (regex.test(header)) {
      lastValue = headers2[header];
      delete headers2[header];
    }
  }
  return lastValue === null || typeof lastValue === "undefined" ? void 0 : String(lastValue).trim();
}
function createErrorType(code, message, baseClass) {
  function CustomError(properties) {
    if (isFunction$1(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor);
    }
    Object.assign(this, properties || {});
    this.code = code;
    this.message = this.cause ? message + ": " + this.cause.message : message;
  }
  CustomError.prototype = new (baseClass || Error)();
  Object.defineProperties(CustomError.prototype, {
    constructor: {
      value: CustomError,
      enumerable: false
    },
    name: {
      value: "Error [" + code + "]",
      enumerable: false
    }
  });
  return CustomError;
}
function destroyRequest(request, error) {
  for (var event of events) {
    request.removeListener(event, eventHandlers[event]);
  }
  request.on("error", noop);
  request.destroy(error);
}
function isSubdomain(subdomain, domain) {
  assert(isString(subdomain) && isString(domain));
  var dot = subdomain.length - domain.length - 1;
  return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}
function isString(value) {
  return typeof value === "string" || value instanceof String;
}
function isFunction$1(value) {
  return typeof value === "function";
}
function isBuffer(value) {
  return typeof value === "object" && "length" in value;
}
function isURL(value) {
  return URL$1 && value instanceof URL$1;
}
followRedirects$1.exports = wrap({ http, https });
followRedirects$1.exports.wrap = wrap;
var followRedirectsExports = followRedirects$1.exports;
const followRedirects = /* @__PURE__ */ getDefaultExportFromCjs(followRedirectsExports);
const VERSION$1 = "1.13.2";
function parseProtocol(url2) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url2);
  return match && match[1] || "";
}
const DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;
function fromDataURI(uri2, asBlob, options) {
  const _Blob = options && options.Blob || platform.classes.Blob;
  const protocol = parseProtocol(uri2);
  if (asBlob === void 0 && _Blob) {
    asBlob = true;
  }
  if (protocol === "data") {
    uri2 = protocol.length ? uri2.slice(protocol.length + 1) : uri2;
    const match = DATA_URL_PATTERN.exec(uri2);
    if (!match) {
      throw new AxiosError$1("Invalid URL", AxiosError$1.ERR_INVALID_URL);
    }
    const mime2 = match[1];
    const isBase64 = match[2];
    const body = match[3];
    const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? "base64" : "utf8");
    if (asBlob) {
      if (!_Blob) {
        throw new AxiosError$1("Blob is not supported", AxiosError$1.ERR_NOT_SUPPORT);
      }
      return new _Blob([buffer], { type: mime2 });
    }
    return buffer;
  }
  throw new AxiosError$1("Unsupported protocol " + protocol, AxiosError$1.ERR_NOT_SUPPORT);
}
const kInternals = Symbol("internals");
class AxiosTransformStream extends stream.Transform {
  constructor(options) {
    options = utils$2.toFlatObject(options, {
      maxRate: 0,
      chunkSize: 64 * 1024,
      minChunkSize: 100,
      timeWindow: 500,
      ticksRate: 2,
      samplesCount: 15
    }, null, (prop, source) => {
      return !utils$2.isUndefined(source[prop]);
    });
    super({
      readableHighWaterMark: options.chunkSize
    });
    const internals = this[kInternals] = {
      timeWindow: options.timeWindow,
      chunkSize: options.chunkSize,
      maxRate: options.maxRate,
      minChunkSize: options.minChunkSize,
      bytesSeen: 0,
      isCaptured: false,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null
    };
    this.on("newListener", (event) => {
      if (event === "progress") {
        if (!internals.isCaptured) {
          internals.isCaptured = true;
        }
      }
    });
  }
  _read(size) {
    const internals = this[kInternals];
    if (internals.onReadCallback) {
      internals.onReadCallback();
    }
    return super._read(size);
  }
  _transform(chunk, encoding, callback) {
    const internals = this[kInternals];
    const maxRate = internals.maxRate;
    const readableHighWaterMark = this.readableHighWaterMark;
    const timeWindow = internals.timeWindow;
    const divider = 1e3 / timeWindow;
    const bytesThreshold = maxRate / divider;
    const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;
    const pushChunk = (_chunk, _callback) => {
      const bytes = Buffer.byteLength(_chunk);
      internals.bytesSeen += bytes;
      internals.bytes += bytes;
      internals.isCaptured && this.emit("progress", internals.bytesSeen);
      if (this.push(_chunk)) {
        process.nextTick(_callback);
      } else {
        internals.onReadCallback = () => {
          internals.onReadCallback = null;
          process.nextTick(_callback);
        };
      }
    };
    const transformChunk = (_chunk, _callback) => {
      const chunkSize = Buffer.byteLength(_chunk);
      let chunkRemainder = null;
      let maxChunkSize = readableHighWaterMark;
      let bytesLeft;
      let passed = 0;
      if (maxRate) {
        const now = Date.now();
        if (!internals.ts || (passed = now - internals.ts) >= timeWindow) {
          internals.ts = now;
          bytesLeft = bytesThreshold - internals.bytes;
          internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
          passed = 0;
        }
        bytesLeft = bytesThreshold - internals.bytes;
      }
      if (maxRate) {
        if (bytesLeft <= 0) {
          return setTimeout(() => {
            _callback(null, _chunk);
          }, timeWindow - passed);
        }
        if (bytesLeft < maxChunkSize) {
          maxChunkSize = bytesLeft;
        }
      }
      if (maxChunkSize && chunkSize > maxChunkSize && chunkSize - maxChunkSize > minChunkSize) {
        chunkRemainder = _chunk.subarray(maxChunkSize);
        _chunk = _chunk.subarray(0, maxChunkSize);
      }
      pushChunk(_chunk, chunkRemainder ? () => {
        process.nextTick(_callback, null, chunkRemainder);
      } : _callback);
    };
    transformChunk(chunk, function transformNextChunk(err, _chunk) {
      if (err) {
        return callback(err);
      }
      if (_chunk) {
        transformChunk(_chunk, transformNextChunk);
      } else {
        callback(null);
      }
    });
  }
}
const { asyncIterator } = Symbol;
const readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream();
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer();
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
    yield blob;
  }
};
const BOUNDARY_ALPHABET = platform.ALPHABET.ALPHA_DIGIT + "-_";
const textEncoder = typeof TextEncoder === "function" ? new TextEncoder() : new require$$1.TextEncoder();
const CRLF = "\r\n";
const CRLF_BYTES = textEncoder.encode(CRLF);
const CRLF_BYTES_COUNT = 2;
class FormDataPart {
  constructor(name, value) {
    const { escapeName } = this.constructor;
    const isStringValue = utils$2.isString(value);
    let headers2 = `Content-Disposition: form-data; name="${escapeName(name)}"${!isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ""}${CRLF}`;
    if (isStringValue) {
      value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
    } else {
      headers2 += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
    }
    this.headers = textEncoder.encode(headers2 + CRLF);
    this.contentLength = isStringValue ? value.byteLength : value.size;
    this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;
    this.name = name;
    this.value = value;
  }
  async *encode() {
    yield this.headers;
    const { value } = this;
    if (utils$2.isTypedArray(value)) {
      yield value;
    } else {
      yield* readBlob(value);
    }
    yield CRLF_BYTES;
  }
  static escapeName(name) {
    return String(name).replace(/[\r\n"]/g, (match) => ({
      "\r": "%0D",
      "\n": "%0A",
      '"': "%22"
    })[match]);
  }
}
const formDataToStream = (form, headersHandler, options) => {
  const {
    tag = "form-data-boundary",
    size = 25,
    boundary = tag + "-" + platform.generateString(size, BOUNDARY_ALPHABET)
  } = options || {};
  if (!utils$2.isFormData(form)) {
    throw TypeError("FormData instance required");
  }
  if (boundary.length < 1 || boundary.length > 70) {
    throw Error("boundary must be 10-70 characters long");
  }
  const boundaryBytes = textEncoder.encode("--" + boundary + CRLF);
  const footerBytes = textEncoder.encode("--" + boundary + "--" + CRLF);
  let contentLength = footerBytes.byteLength;
  const parts = Array.from(form.entries()).map(([name, value]) => {
    const part = new FormDataPart(name, value);
    contentLength += part.size;
    return part;
  });
  contentLength += boundaryBytes.byteLength * parts.length;
  contentLength = utils$2.toFiniteNumber(contentLength);
  const computedHeaders = {
    "Content-Type": `multipart/form-data; boundary=${boundary}`
  };
  if (Number.isFinite(contentLength)) {
    computedHeaders["Content-Length"] = contentLength;
  }
  headersHandler && headersHandler(computedHeaders);
  return stream.Readable.from(async function* () {
    for (const part of parts) {
      yield boundaryBytes;
      yield* part.encode();
    }
    yield footerBytes;
  }());
};
class ZlibHeaderTransformStream extends stream.Transform {
  __transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
  _transform(chunk, encoding, callback) {
    if (chunk.length !== 0) {
      this._transform = this.__transform;
      if (chunk[0] !== 120) {
        const header = Buffer.alloc(2);
        header[0] = 120;
        header[1] = 156;
        this.push(header, encoding);
      }
    }
    this.__transform(chunk, encoding, callback);
  }
}
const callbackify = (fn, reducer) => {
  return utils$2.isAsyncFn(fn) ? function(...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err) {
        cb(err);
      }
    }, cb);
  } : fn;
};
function speedometer(samplesCount, min2) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min2 = min2 !== void 0 ? min2 : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min2) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle(fn, freq) {
  let timestamp2 = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp2 = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp2;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$2.asap(() => fn(...args));
function estimateDataURLDecodedBytes(url2) {
  if (!url2 || typeof url2 !== "string") return 0;
  if (!url2.startsWith("data:")) return 0;
  const comma = url2.indexOf(",");
  if (comma < 0) return 0;
  const meta = url2.slice(5, comma);
  const body = url2.slice(comma + 1);
  const isBase64 = /;base64/i.test(meta);
  if (isBase64) {
    let effectiveLen = body.length;
    const len = body.length;
    for (let i = 0; i < len; i++) {
      if (body.charCodeAt(i) === 37 && i + 2 < len) {
        const a = body.charCodeAt(i + 1);
        const b = body.charCodeAt(i + 2);
        const isHex = (a >= 48 && a <= 57 || a >= 65 && a <= 70 || a >= 97 && a <= 102) && (b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102);
        if (isHex) {
          effectiveLen -= 2;
          i += 2;
        }
      }
    }
    let pad = 0;
    let idx = len - 1;
    const tailIsPct3D = (j) => j >= 2 && body.charCodeAt(j - 2) === 37 && // '%'
    body.charCodeAt(j - 1) === 51 && // '3'
    (body.charCodeAt(j) === 68 || body.charCodeAt(j) === 100);
    if (idx >= 0) {
      if (body.charCodeAt(idx) === 61) {
        pad++;
        idx--;
      } else if (tailIsPct3D(idx)) {
        pad++;
        idx -= 3;
      }
    }
    if (pad === 1 && idx >= 0) {
      if (body.charCodeAt(idx) === 61) {
        pad++;
      } else if (tailIsPct3D(idx)) {
        pad++;
      }
    }
    const groups = Math.floor(effectiveLen / 4);
    const bytes = groups * 3 - (pad || 0);
    return bytes > 0 ? bytes : 0;
  }
  return Buffer.byteLength(body, "utf8");
}
const zlibOptions = {
  flush: zlib.constants.Z_SYNC_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH
};
const brotliOptions = {
  flush: zlib.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
};
const isBrotliSupported = utils$2.isFunction(zlib.createBrotliDecompress);
const { http: httpFollow, https: httpsFollow } = followRedirects;
const isHttps = /https:?/;
const supportedProtocols = platform.protocols.map((protocol) => {
  return protocol + ":";
});
const flushOnFinish = (stream2, [throttled, flush]) => {
  stream2.on("end", flush).on("error", flush);
  return throttled;
};
class Http2Sessions {
  constructor() {
    this.sessions = /* @__PURE__ */ Object.create(null);
  }
  getSession(authority, options) {
    options = Object.assign({
      sessionTimeout: 1e3
    }, options);
    let authoritySessions = this.sessions[authority];
    if (authoritySessions) {
      let len = authoritySessions.length;
      for (let i = 0; i < len; i++) {
        const [sessionHandle, sessionOptions] = authoritySessions[i];
        if (!sessionHandle.destroyed && !sessionHandle.closed && require$$1.isDeepStrictEqual(sessionOptions, options)) {
          return sessionHandle;
        }
      }
    }
    const session = http2.connect(authority, options);
    let removed;
    const removeSession = () => {
      if (removed) {
        return;
      }
      removed = true;
      let entries = authoritySessions, len = entries.length, i = len;
      while (i--) {
        if (entries[i][0] === session) {
          if (len === 1) {
            delete this.sessions[authority];
          } else {
            entries.splice(i, 1);
          }
          return;
        }
      }
    };
    const originalRequestFn = session.request;
    const { sessionTimeout } = options;
    if (sessionTimeout != null) {
      let timer;
      let streamsCount = 0;
      session.request = function() {
        const stream2 = originalRequestFn.apply(this, arguments);
        streamsCount++;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        stream2.once("close", () => {
          if (!--streamsCount) {
            timer = setTimeout(() => {
              timer = null;
              removeSession();
            }, sessionTimeout);
          }
        });
        return stream2;
      };
    }
    session.once("close", removeSession);
    let entry = [
      session,
      options
    ];
    authoritySessions ? authoritySessions.push(entry) : authoritySessions = this.sessions[authority] = [entry];
    return session;
  }
}
const http2Sessions = new Http2Sessions();
function dispatchBeforeRedirect(options, responseDetails) {
  if (options.beforeRedirects.proxy) {
    options.beforeRedirects.proxy(options);
  }
  if (options.beforeRedirects.config) {
    options.beforeRedirects.config(options, responseDetails);
  }
}
function setProxy(options, configProxy, location) {
  let proxy = configProxy;
  if (!proxy && proxy !== false) {
    const proxyUrl = proxyFromEnv.getProxyForUrl(location);
    if (proxyUrl) {
      proxy = new URL(proxyUrl);
    }
  }
  if (proxy) {
    if (proxy.username) {
      proxy.auth = (proxy.username || "") + ":" + (proxy.password || "");
    }
    if (proxy.auth) {
      if (proxy.auth.username || proxy.auth.password) {
        proxy.auth = (proxy.auth.username || "") + ":" + (proxy.auth.password || "");
      }
      const base64 = Buffer.from(proxy.auth, "utf8").toString("base64");
      options.headers["Proxy-Authorization"] = "Basic " + base64;
    }
    options.headers.host = options.hostname + (options.port ? ":" + options.port : "");
    const proxyHost = proxy.hostname || proxy.host;
    options.hostname = proxyHost;
    options.host = proxyHost;
    options.port = proxy.port;
    options.path = location;
    if (proxy.protocol) {
      options.protocol = proxy.protocol.includes(":") ? proxy.protocol : `${proxy.protocol}:`;
    }
  }
  options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
    setProxy(redirectOptions, configProxy, redirectOptions.href);
  };
}
const isHttpAdapterSupported = typeof process !== "undefined" && utils$2.kindOf(process) === "process";
const wrapAsync = (asyncExecutor) => {
  return new Promise((resolve, reject) => {
    let onDone;
    let isDone;
    const done = (value, isRejected) => {
      if (isDone) return;
      isDone = true;
      onDone && onDone(value, isRejected);
    };
    const _resolve = (value) => {
      done(value);
      resolve(value);
    };
    const _reject = (reason) => {
      done(reason, true);
      reject(reason);
    };
    asyncExecutor(_resolve, _reject, (onDoneHandler) => onDone = onDoneHandler).catch(_reject);
  });
};
const resolveFamily = ({ address, family }) => {
  if (!utils$2.isString(address)) {
    throw TypeError("address must be a string");
  }
  return {
    address,
    family: family || (address.indexOf(".") < 0 ? 6 : 4)
  };
};
const buildAddressEntry = (address, family) => resolveFamily(utils$2.isObject(address) ? address : { address, family });
const http2Transport = {
  request(options, cb) {
    const authority = options.protocol + "//" + options.hostname + ":" + (options.port || 80);
    const { http2Options, headers: headers2 } = options;
    const session = http2Sessions.getSession(authority, http2Options);
    const {
      HTTP2_HEADER_SCHEME,
      HTTP2_HEADER_METHOD,
      HTTP2_HEADER_PATH,
      HTTP2_HEADER_STATUS
    } = http2.constants;
    const http2Headers = {
      [HTTP2_HEADER_SCHEME]: options.protocol.replace(":", ""),
      [HTTP2_HEADER_METHOD]: options.method,
      [HTTP2_HEADER_PATH]: options.path
    };
    utils$2.forEach(headers2, (header, name) => {
      name.charAt(0) !== ":" && (http2Headers[name] = header);
    });
    const req = session.request(http2Headers);
    req.once("response", (responseHeaders) => {
      const response = req;
      responseHeaders = Object.assign({}, responseHeaders);
      const status = responseHeaders[HTTP2_HEADER_STATUS];
      delete responseHeaders[HTTP2_HEADER_STATUS];
      response.headers = responseHeaders;
      response.statusCode = +status;
      cb(response);
    });
    return req;
  }
};
const httpAdapter = isHttpAdapterSupported && function httpAdapter2(config2) {
  return wrapAsync(async function dispatchHttpRequest(resolve, reject, onDone) {
    let { data, lookup, family, httpVersion = 1, http2Options } = config2;
    const { responseType, responseEncoding } = config2;
    const method = config2.method.toUpperCase();
    let isDone;
    let rejected = false;
    let req;
    httpVersion = +httpVersion;
    if (Number.isNaN(httpVersion)) {
      throw TypeError(`Invalid protocol version: '${config2.httpVersion}' is not a number`);
    }
    if (httpVersion !== 1 && httpVersion !== 2) {
      throw TypeError(`Unsupported protocol version '${httpVersion}'`);
    }
    const isHttp2 = httpVersion === 2;
    if (lookup) {
      const _lookup = callbackify(lookup, (value) => utils$2.isArray(value) ? value : [value]);
      lookup = (hostname, opt, cb) => {
        _lookup(hostname, opt, (err, arg0, arg1) => {
          if (err) {
            return cb(err);
          }
          const addresses = utils$2.isArray(arg0) ? arg0.map((addr) => buildAddressEntry(addr)) : [buildAddressEntry(arg0, arg1)];
          opt.all ? cb(err, addresses) : cb(err, addresses[0].address, addresses[0].family);
        });
      };
    }
    const abortEmitter = new events$1.EventEmitter();
    function abort2(reason) {
      try {
        abortEmitter.emit("abort", !reason || reason.type ? new CanceledError$1(null, config2, req) : reason);
      } catch (err) {
        console.warn("emit error", err);
      }
    }
    abortEmitter.once("abort", reject);
    const onFinished = () => {
      if (config2.cancelToken) {
        config2.cancelToken.unsubscribe(abort2);
      }
      if (config2.signal) {
        config2.signal.removeEventListener("abort", abort2);
      }
      abortEmitter.removeAllListeners();
    };
    if (config2.cancelToken || config2.signal) {
      config2.cancelToken && config2.cancelToken.subscribe(abort2);
      if (config2.signal) {
        config2.signal.aborted ? abort2() : config2.signal.addEventListener("abort", abort2);
      }
    }
    onDone((response, isRejected) => {
      isDone = true;
      if (isRejected) {
        rejected = true;
        onFinished();
        return;
      }
      const { data: data2 } = response;
      if (data2 instanceof stream.Readable || data2 instanceof stream.Duplex) {
        const offListeners = stream.finished(data2, () => {
          offListeners();
          onFinished();
        });
      } else {
        onFinished();
      }
    });
    const fullPath = buildFullPath(config2.baseURL, config2.url, config2.allowAbsoluteUrls);
    const parsed = new URL(fullPath, platform.hasBrowserEnv ? platform.origin : void 0);
    const protocol = parsed.protocol || supportedProtocols[0];
    if (protocol === "data:") {
      if (config2.maxContentLength > -1) {
        const dataUrl = String(config2.url || fullPath || "");
        const estimated = estimateDataURLDecodedBytes(dataUrl);
        if (estimated > config2.maxContentLength) {
          return reject(new AxiosError$1(
            "maxContentLength size of " + config2.maxContentLength + " exceeded",
            AxiosError$1.ERR_BAD_RESPONSE,
            config2
          ));
        }
      }
      let convertedData;
      if (method !== "GET") {
        return settle(resolve, reject, {
          status: 405,
          statusText: "method not allowed",
          headers: {},
          config: config2
        });
      }
      try {
        convertedData = fromDataURI(config2.url, responseType === "blob", {
          Blob: config2.env && config2.env.Blob
        });
      } catch (err) {
        throw AxiosError$1.from(err, AxiosError$1.ERR_BAD_REQUEST, config2);
      }
      if (responseType === "text") {
        convertedData = convertedData.toString(responseEncoding);
        if (!responseEncoding || responseEncoding === "utf8") {
          convertedData = utils$2.stripBOM(convertedData);
        }
      } else if (responseType === "stream") {
        convertedData = stream.Readable.from(convertedData);
      }
      return settle(resolve, reject, {
        data: convertedData,
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders$1(),
        config: config2
      });
    }
    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError$1(
        "Unsupported protocol " + protocol,
        AxiosError$1.ERR_BAD_REQUEST,
        config2
      ));
    }
    const headers2 = AxiosHeaders$1.from(config2.headers).normalize();
    headers2.set("User-Agent", "axios/" + VERSION$1, false);
    const { onUploadProgress, onDownloadProgress } = config2;
    const maxRate = config2.maxRate;
    let maxUploadRate = void 0;
    let maxDownloadRate = void 0;
    if (utils$2.isSpecCompliantForm(data)) {
      const userBoundary = headers2.getContentType(/boundary=([-_\w\d]{10,70})/i);
      data = formDataToStream(data, (formHeaders) => {
        headers2.set(formHeaders);
      }, {
        tag: `axios-${VERSION$1}-boundary`,
        boundary: userBoundary && userBoundary[1] || void 0
      });
    } else if (utils$2.isFormData(data) && utils$2.isFunction(data.getHeaders)) {
      headers2.set(data.getHeaders());
      if (!headers2.hasContentLength()) {
        try {
          const knownLength = await require$$1.promisify(data.getLength).call(data);
          Number.isFinite(knownLength) && knownLength >= 0 && headers2.setContentLength(knownLength);
        } catch (e) {
        }
      }
    } else if (utils$2.isBlob(data) || utils$2.isFile(data)) {
      data.size && headers2.setContentType(data.type || "application/octet-stream");
      headers2.setContentLength(data.size || 0);
      data = stream.Readable.from(readBlob(data));
    } else if (data && !utils$2.isStream(data)) {
      if (Buffer.isBuffer(data)) ;
      else if (utils$2.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils$2.isString(data)) {
        data = Buffer.from(data, "utf-8");
      } else {
        return reject(new AxiosError$1(
          "Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream",
          AxiosError$1.ERR_BAD_REQUEST,
          config2
        ));
      }
      headers2.setContentLength(data.length, false);
      if (config2.maxBodyLength > -1 && data.length > config2.maxBodyLength) {
        return reject(new AxiosError$1(
          "Request body larger than maxBodyLength limit",
          AxiosError$1.ERR_BAD_REQUEST,
          config2
        ));
      }
    }
    const contentLength = utils$2.toFiniteNumber(headers2.getContentLength());
    if (utils$2.isArray(maxRate)) {
      maxUploadRate = maxRate[0];
      maxDownloadRate = maxRate[1];
    } else {
      maxUploadRate = maxDownloadRate = maxRate;
    }
    if (data && (onUploadProgress || maxUploadRate)) {
      if (!utils$2.isStream(data)) {
        data = stream.Readable.from(data, { objectMode: false });
      }
      data = stream.pipeline([data, new AxiosTransformStream({
        maxRate: utils$2.toFiniteNumber(maxUploadRate)
      })], utils$2.noop);
      onUploadProgress && data.on("progress", flushOnFinish(
        data,
        progressEventDecorator(
          contentLength,
          progressEventReducer(asyncDecorator(onUploadProgress), false, 3)
        )
      ));
    }
    let auth = void 0;
    if (config2.auth) {
      const username = config2.auth.username || "";
      const password = config2.auth.password || "";
      auth = username + ":" + password;
    }
    if (!auth && parsed.username) {
      const urlUsername = parsed.username;
      const urlPassword = parsed.password;
      auth = urlUsername + ":" + urlPassword;
    }
    auth && headers2.delete("authorization");
    let path2;
    try {
      path2 = buildURL(
        parsed.pathname + parsed.search,
        config2.params,
        config2.paramsSerializer
      ).replace(/^\?/, "");
    } catch (err) {
      const customErr = new Error(err.message);
      customErr.config = config2;
      customErr.url = config2.url;
      customErr.exists = true;
      return reject(customErr);
    }
    headers2.set(
      "Accept-Encoding",
      "gzip, compress, deflate" + (isBrotliSupported ? ", br" : ""),
      false
    );
    const options = {
      path: path2,
      method,
      headers: headers2.toJSON(),
      agents: { http: config2.httpAgent, https: config2.httpsAgent },
      auth,
      protocol,
      family,
      beforeRedirect: dispatchBeforeRedirect,
      beforeRedirects: {},
      http2Options
    };
    !utils$2.isUndefined(lookup) && (options.lookup = lookup);
    if (config2.socketPath) {
      options.socketPath = config2.socketPath;
    } else {
      options.hostname = parsed.hostname.startsWith("[") ? parsed.hostname.slice(1, -1) : parsed.hostname;
      options.port = parsed.port;
      setProxy(options, config2.proxy, protocol + "//" + parsed.hostname + (parsed.port ? ":" + parsed.port : "") + options.path);
    }
    let transport;
    const isHttpsRequest = isHttps.test(options.protocol);
    options.agent = isHttpsRequest ? config2.httpsAgent : config2.httpAgent;
    if (isHttp2) {
      transport = http2Transport;
    } else {
      if (config2.transport) {
        transport = config2.transport;
      } else if (config2.maxRedirects === 0) {
        transport = isHttpsRequest ? require$$4 : require$$3;
      } else {
        if (config2.maxRedirects) {
          options.maxRedirects = config2.maxRedirects;
        }
        if (config2.beforeRedirect) {
          options.beforeRedirects.config = config2.beforeRedirect;
        }
        transport = isHttpsRequest ? httpsFollow : httpFollow;
      }
    }
    if (config2.maxBodyLength > -1) {
      options.maxBodyLength = config2.maxBodyLength;
    } else {
      options.maxBodyLength = Infinity;
    }
    if (config2.insecureHTTPParser) {
      options.insecureHTTPParser = config2.insecureHTTPParser;
    }
    req = transport.request(options, function handleResponse(res) {
      if (req.destroyed) return;
      const streams = [res];
      const responseLength = utils$2.toFiniteNumber(res.headers["content-length"]);
      if (onDownloadProgress || maxDownloadRate) {
        const transformStream = new AxiosTransformStream({
          maxRate: utils$2.toFiniteNumber(maxDownloadRate)
        });
        onDownloadProgress && transformStream.on("progress", flushOnFinish(
          transformStream,
          progressEventDecorator(
            responseLength,
            progressEventReducer(asyncDecorator(onDownloadProgress), true, 3)
          )
        ));
        streams.push(transformStream);
      }
      let responseStream = res;
      const lastRequest = res.req || req;
      if (config2.decompress !== false && res.headers["content-encoding"]) {
        if (method === "HEAD" || res.statusCode === 204) {
          delete res.headers["content-encoding"];
        }
        switch ((res.headers["content-encoding"] || "").toLowerCase()) {
          case "gzip":
          case "x-gzip":
          case "compress":
          case "x-compress":
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "deflate":
            streams.push(new ZlibHeaderTransformStream());
            streams.push(zlib.createUnzip(zlibOptions));
            delete res.headers["content-encoding"];
            break;
          case "br":
            if (isBrotliSupported) {
              streams.push(zlib.createBrotliDecompress(brotliOptions));
              delete res.headers["content-encoding"];
            }
        }
      }
      responseStream = streams.length > 1 ? stream.pipeline(streams, utils$2.noop) : streams[0];
      const response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: new AxiosHeaders$1(res.headers),
        config: config2,
        request: lastRequest
      };
      if (responseType === "stream") {
        response.data = responseStream;
        settle(resolve, reject, response);
      } else {
        const responseBuffer = [];
        let totalResponseBytes = 0;
        responseStream.on("data", function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;
          if (config2.maxContentLength > -1 && totalResponseBytes > config2.maxContentLength) {
            rejected = true;
            responseStream.destroy();
            abort2(new AxiosError$1(
              "maxContentLength size of " + config2.maxContentLength + " exceeded",
              AxiosError$1.ERR_BAD_RESPONSE,
              config2,
              lastRequest
            ));
          }
        });
        responseStream.on("aborted", function handlerStreamAborted() {
          if (rejected) {
            return;
          }
          const err = new AxiosError$1(
            "stream has been aborted",
            AxiosError$1.ERR_BAD_RESPONSE,
            config2,
            lastRequest
          );
          responseStream.destroy(err);
          reject(err);
        });
        responseStream.on("error", function handleStreamError(err) {
          if (req.destroyed) return;
          reject(AxiosError$1.from(err, null, config2, lastRequest));
        });
        responseStream.on("end", function handleStreamEnd() {
          try {
            let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (responseType !== "arraybuffer") {
              responseData = responseData.toString(responseEncoding);
              if (!responseEncoding || responseEncoding === "utf8") {
                responseData = utils$2.stripBOM(responseData);
              }
            }
            response.data = responseData;
          } catch (err) {
            return reject(AxiosError$1.from(err, null, config2, response.request, response));
          }
          settle(resolve, reject, response);
        });
      }
      abortEmitter.once("abort", (err) => {
        if (!responseStream.destroyed) {
          responseStream.emit("error", err);
          responseStream.destroy();
        }
      });
    });
    abortEmitter.once("abort", (err) => {
      if (req.close) {
        req.close();
      } else {
        req.destroy(err);
      }
    });
    req.on("error", function handleRequestError(err) {
      reject(AxiosError$1.from(err, null, config2, req));
    });
    req.on("socket", function handleRequestSocket(socket) {
      socket.setKeepAlive(true, 1e3 * 60);
    });
    if (config2.timeout) {
      const timeout = parseInt(config2.timeout, 10);
      if (Number.isNaN(timeout)) {
        abort2(new AxiosError$1(
          "error trying to parse `config.timeout` to int",
          AxiosError$1.ERR_BAD_OPTION_VALUE,
          config2,
          req
        ));
        return;
      }
      req.setTimeout(timeout, function handleRequestTimeout() {
        if (isDone) return;
        let timeoutErrorMessage = config2.timeout ? "timeout of " + config2.timeout + "ms exceeded" : "timeout exceeded";
        const transitional2 = config2.transitional || transitionalDefaults;
        if (config2.timeoutErrorMessage) {
          timeoutErrorMessage = config2.timeoutErrorMessage;
        }
        abort2(new AxiosError$1(
          timeoutErrorMessage,
          transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
          config2,
          req
        ));
      });
    } else {
      req.setTimeout(0);
    }
    if (utils$2.isStream(data)) {
      let ended = false;
      let errored = false;
      data.on("end", () => {
        ended = true;
      });
      data.once("error", (err) => {
        errored = true;
        req.destroy(err);
      });
      data.on("close", () => {
        if (!ended && !errored) {
          abort2(new CanceledError$1("Request stream has been aborted", config2, req));
        }
      });
      data.pipe(req);
    } else {
      data && req.write(data);
      req.end();
    }
  });
};
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url2) => {
  url2 = new URL(url2, platform.origin);
  return origin2.protocol === url2.protocol && origin2.host === url2.host && (isMSIE || origin2.port === url2.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path2, domain, secure, sameSite) {
      if (typeof document === "undefined") return;
      const cookie = [`${name}=${encodeURIComponent(value)}`];
      if (utils$2.isNumber(expires)) {
        cookie.push(`expires=${new Date(expires).toUTCString()}`);
      }
      if (utils$2.isString(path2)) {
        cookie.push(`path=${path2}`);
      }
      if (utils$2.isString(domain)) {
        cookie.push(`domain=${domain}`);
      }
      if (secure === true) {
        cookie.push("secure");
      }
      if (utils$2.isString(sameSite)) {
        cookie.push(`SameSite=${sameSite}`);
      }
      document.cookie = cookie.join("; ");
    },
    read(name) {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config3 = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$2.isPlainObject(target) && utils$2.isPlainObject(source)) {
      return utils$2.merge.call({ caseless }, target, source);
    } else if (utils$2.isPlainObject(source)) {
      return utils$2.merge({}, source);
    } else if (utils$2.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$2.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$2.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils$2.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils$2.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$2.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils$2.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$2.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config3[prop] = configValue);
  });
  return config3;
}
const resolveConfig = (config2) => {
  const newConfig = mergeConfig$1({}, config2);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers: headers2, auth } = newConfig;
  newConfig.headers = headers2 = AxiosHeaders$1.from(headers2);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config2.params, config2.paramsSerializer);
  if (auth) {
    headers2.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  if (utils$2.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers2.setContentType(void 0);
    } else if (utils$2.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers2.set(key, val);
        }
      });
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$2.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers2.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config2) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config2);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config2,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config2, request));
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config2, request);
      err.event = event || null;
      reject(err);
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config2,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$2.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$2.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config2, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config2));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$2.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream2) {
  if (stream2[Symbol.asyncIterator]) {
    yield* stream2;
    return;
  }
  const reader = stream2.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream2, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream2, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const { isFunction } = utils$2;
const globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response
}))(utils$2.global);
const {
  ReadableStream: ReadableStream$1,
  TextEncoder: TextEncoder$1
} = utils$2.global;
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const factory = (env) => {
  env = utils$2.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction(Request);
  const isResponseSupported = isFunction(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
  const encodeText = isFetchSupported && (typeof TextEncoder$1 === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder$1()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream$1(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$2.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type2) => {
      !resolvers[type2] && (resolvers[type2] = (res, config2) => {
        let method = res && res[type2];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError$1(`Response type '${type2}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config2);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils$2.isBlob(body)) {
      return body.size;
    }
    if (utils$2.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils$2.isArrayBufferView(body) || utils$2.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils$2.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils$2.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers2, body) => {
    const length = utils$2.toFiniteNumber(headers2.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config2) => {
    let {
      url: url2,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers: headers2,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig(config2);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers2, data)) !== 0) {
        let _request = new Request(url2, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils$2.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers2.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils$2.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers2.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request(url2, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url2, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils$2.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils$2.findKey(resolvers, responseType) || "text"](response, config2);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config: config2,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config2, request),
          {
            cause: err.cause || err
          }
        );
      }
      throw AxiosError$1.from(err, err && err.code, config2, request);
    }
  };
};
const seedCache = /* @__PURE__ */ new Map();
const getFetch = (config2) => {
  let env = config2 && config2.env || {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [
    Request,
    Response,
    fetch2
  ];
  let len = seeds.length, i = len, seed, target, map2 = seedCache;
  while (i--) {
    seed = seeds[i];
    target = map2.get(seed);
    target === void 0 && map2.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
    map2 = target;
  }
  return target;
};
getFetch();
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: {
    get: getFetch
  }
};
utils$2.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$2.isFunction(adapter) || adapter === null || adapter === false;
function getAdapter$1(adapters2, config2) {
  adapters2 = utils$2.isArray(adapters2) ? adapters2 : [adapters2];
  const { length } = adapters2;
  let nameOrAdapter;
  let adapter;
  const rejectedReasons = {};
  for (let i = 0; i < length; i++) {
    nameOrAdapter = adapters2[i];
    let id;
    adapter = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter === void 0) {
        throw new AxiosError$1(`Unknown adapter '${id}'`);
      }
    }
    if (adapter && (utils$2.isFunction(adapter) || (adapter = adapter.get(config2)))) {
      break;
    }
    rejectedReasons[id || "#" + i] = adapter;
  }
  if (!adapter) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state2]) => `adapter ${id} ` + (state2 === false ? "is not supported by the environment" : "is not available in the build")
    );
    let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError$1(
      `There is no suitable adapter to dispatch the request ` + s,
      "ERR_NOT_SUPPORT"
    );
  }
  return adapter;
}
const adapters = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: getAdapter$1,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: knownAdapters
};
function throwIfCancellationRequested(config2) {
  if (config2.cancelToken) {
    config2.cancelToken.throwIfRequested();
  }
  if (config2.signal && config2.signal.aborted) {
    throw new CanceledError$1(null, config2);
  }
}
function dispatchRequest(config2) {
  throwIfCancellationRequested(config2);
  config2.headers = AxiosHeaders$1.from(config2.headers);
  config2.data = transformData.call(
    config2,
    config2.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config2.method) !== -1) {
    config2.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config2.adapter || defaults.adapter, config2);
  return adapter(config2).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config2);
    response.data = transformData.call(
      config2,
      config2.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config2);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config2,
          config2.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type2, i) => {
  validators$1[type2] = function validator2(thing) {
    return typeof thing === type2 || "a" + (i < 1 ? "n " : " ") + type2;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version2, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version2 ? " in " + version2 : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version2 && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version2 + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema2, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema2[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config2) {
    try {
      return await this._request(configOrUrl, config2);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config2) {
    if (typeof configOrUrl === "string") {
      config2 = config2 || {};
      config2.url = configOrUrl;
    } else {
      config2 = configOrUrl || {};
    }
    config2 = mergeConfig$1(this.defaults, config2);
    const { transitional: transitional2, paramsSerializer, headers: headers2 } = config2;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$2.isFunction(paramsSerializer)) {
        config2.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config2.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config2.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config2.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config2, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config2.method = (config2.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers2 && utils$2.merge(
      headers2.common,
      headers2[config2.method]
    );
    headers2 && utils$2.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers2[method];
      }
    );
    config2.headers = AxiosHeaders$1.concat(contextHeaders, headers2);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config2) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config2);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config2;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config2) {
    config2 = mergeConfig$1(this.defaults, config2);
    const fullPath = buildFullPath(config2.baseURL, config2.url, config2.allowAbsoluteUrls);
    return buildURL(fullPath, config2.params, config2.paramsSerializer);
  }
};
utils$2.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url2, config2) {
    return this.request(mergeConfig$1(config2 || {}, {
      method,
      url: url2,
      data: (config2 || {}).data
    }));
  };
});
utils$2.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url2, data, config2) {
      return this.request(mergeConfig$1(config2 || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: url2,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config2, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config2, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort2 = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort2);
    controller.signal.unsubscribe = () => this.unsubscribe(abort2);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap2(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$2.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind$2(Axios$1.prototype.request, context);
  utils$2.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$2.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$2.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
async function fetchPatchList(plistUrl) {
  var _a;
  try {
    const response = await axios.get(plistUrl, {
      responseType: "text",
      timeout: 3e4
    });
    const lines = response.data.split("\n").filter((line) => line.trim());
    const patches = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) {
        continue;
      }
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const index = parseInt(parts[0], 10);
        const filename = parts[1];
        if (!isNaN(index) && filename) {
          patches.push({ index, filename });
        }
      } else if (parts.length === 1) {
        patches.push({ index: patches.length, filename: parts[0] });
      }
    }
    patches.sort((a, b) => a.index - b.index);
    return patches;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (((_a = error.response) == null ? void 0 : _a.status) === 404) {
        return [];
      }
      throw new Error(`Failed to fetch patch list: ${error.message}`);
    }
    throw error;
  }
}
async function downloadPatch(url2, destPath, onProgress) {
  const writer = fs$1.createWriteStream(destPath);
  const response = await axios({
    url: url2,
    method: "GET",
    responseType: "stream",
    timeout: 0
    // No timeout for large files
  });
  const totalLength = parseInt(response.headers["content-length"] || "0", 10);
  const filename = url2.split("/").pop() || "unknown";
  let downloaded = 0;
  let lastTime = Date.now();
  let lastDownloaded = 0;
  let speed = 0;
  return new Promise((resolve, reject) => {
    response.data.on("data", (chunk) => {
      downloaded += chunk.length;
      const now = Date.now();
      const elapsed = (now - lastTime) / 1e3;
      if (elapsed >= 0.5) {
        speed = (downloaded - lastDownloaded) / elapsed;
        lastTime = now;
        lastDownloaded = downloaded;
      }
      if (onProgress) {
        onProgress({
          filename,
          downloaded,
          total: totalLength,
          speed,
          percentage: totalLength > 0 ? downloaded / totalLength * 100 : 0
        });
      }
    });
    response.data.pipe(writer);
    writer.on("finish", () => {
      writer.close();
      resolve();
    });
    writer.on("error", (err) => {
      fs$1.unlink(destPath, () => {
      });
      reject(err);
    });
    response.data.on("error", (err) => {
      writer.close();
      fs$1.unlink(destPath, () => {
      });
      reject(err);
    });
  });
}
var util = { exports: {} };
var constants = {
  /* The local file header */
  LOCHDR: 30,
  // LOC header size
  LOCSIG: 67324752,
  // "PK\003\004"
  LOCVER: 4,
  // version needed to extract
  LOCFLG: 6,
  // general purpose bit flag
  LOCHOW: 8,
  // compression method
  LOCTIM: 10,
  // modification time (2 bytes time, 2 bytes date)
  LOCCRC: 14,
  // uncompressed file crc-32 value
  LOCSIZ: 18,
  // compressed size
  LOCLEN: 22,
  // uncompressed size
  LOCNAM: 26,
  // filename length
  LOCEXT: 28,
  // extra field length
  /* The Data descriptor */
  EXTSIG: 134695760,
  // "PK\007\008"
  EXTHDR: 16,
  // EXT header size
  EXTCRC: 4,
  // uncompressed file crc-32 value
  EXTSIZ: 8,
  // compressed size
  EXTLEN: 12,
  // uncompressed size
  /* The central directory file header */
  CENHDR: 46,
  // CEN header size
  CENSIG: 33639248,
  // "PK\001\002"
  CENVEM: 4,
  // version made by
  CENVER: 6,
  // version needed to extract
  CENFLG: 8,
  // encrypt, decrypt flags
  CENHOW: 10,
  // compression method
  CENTIM: 12,
  // modification time (2 bytes time, 2 bytes date)
  CENCRC: 16,
  // uncompressed file crc-32 value
  CENSIZ: 20,
  // compressed size
  CENLEN: 24,
  // uncompressed size
  CENNAM: 28,
  // filename length
  CENEXT: 30,
  // extra field length
  CENCOM: 32,
  // file comment length
  CENDSK: 34,
  // volume number start
  CENATT: 36,
  // internal file attributes
  CENATX: 38,
  // external file attributes (host system dependent)
  CENOFF: 42,
  // LOC header offset
  /* The entries in the end of central directory */
  ENDHDR: 22,
  // END header size
  ENDSIG: 101010256,
  // "PK\005\006"
  ENDSUB: 8,
  // number of entries on this disk
  ENDTOT: 10,
  // total number of entries
  ENDSIZ: 12,
  // central directory size in bytes
  ENDOFF: 16,
  // offset of first CEN header
  ENDCOM: 20,
  // zip file comment length
  END64HDR: 20,
  // zip64 END header size
  END64SIG: 117853008,
  // zip64 Locator signature, "PK\006\007"
  END64START: 4,
  // number of the disk with the start of the zip64
  END64OFF: 8,
  // relative offset of the zip64 end of central directory
  END64NUMDISKS: 16,
  // total number of disks
  ZIP64SIG: 101075792,
  // zip64 signature, "PK\006\006"
  ZIP64HDR: 56,
  // zip64 record minimum size
  ZIP64LEAD: 12,
  // leading bytes at the start of the record, not counted by the value stored in ZIP64SIZE
  ZIP64SIZE: 4,
  // zip64 size of the central directory record
  ZIP64VEM: 12,
  // zip64 version made by
  ZIP64VER: 14,
  // zip64 version needed to extract
  ZIP64DSK: 16,
  // zip64 number of this disk
  ZIP64DSKDIR: 20,
  // number of the disk with the start of the record directory
  ZIP64SUB: 24,
  // number of entries on this disk
  ZIP64TOT: 32,
  // total number of entries
  ZIP64SIZB: 40,
  // zip64 central directory size in bytes
  ZIP64OFF: 48,
  // offset of start of central directory with respect to the starting disk number
  ZIP64EXTRA: 56,
  // extensible data sector
  /* Compression methods */
  STORED: 0,
  // no compression
  SHRUNK: 1,
  // shrunk
  REDUCED1: 2,
  // reduced with compression factor 1
  REDUCED2: 3,
  // reduced with compression factor 2
  REDUCED3: 4,
  // reduced with compression factor 3
  REDUCED4: 5,
  // reduced with compression factor 4
  IMPLODED: 6,
  // imploded
  // 7 reserved for Tokenizing compression algorithm
  DEFLATED: 8,
  // deflated
  ENHANCED_DEFLATED: 9,
  // enhanced deflated
  PKWARE: 10,
  // PKWare DCL imploded
  // 11 reserved by PKWARE
  BZIP2: 12,
  //  compressed using BZIP2
  // 13 reserved by PKWARE
  LZMA: 14,
  // LZMA
  // 15-17 reserved by PKWARE
  IBM_TERSE: 18,
  // compressed using IBM TERSE
  IBM_LZ77: 19,
  // IBM LZ77 z
  AES_ENCRYPT: 99,
  // WinZIP AES encryption method
  /* General purpose bit flag */
  // values can obtained with expression 2**bitnr
  FLG_ENC: 1,
  // Bit 0: encrypted file
  FLG_COMP1: 2,
  // Bit 1, compression option
  FLG_COMP2: 4,
  // Bit 2, compression option
  FLG_DESC: 8,
  // Bit 3, data descriptor
  FLG_ENH: 16,
  // Bit 4, enhanced deflating
  FLG_PATCH: 32,
  // Bit 5, indicates that the file is compressed patched data.
  FLG_STR: 64,
  // Bit 6, strong encryption (patented)
  // Bits 7-10: Currently unused.
  FLG_EFS: 2048,
  // Bit 11: Language encoding flag (EFS)
  // Bit 12: Reserved by PKWARE for enhanced compression.
  // Bit 13: encrypted the Central Directory (patented).
  // Bits 14-15: Reserved by PKWARE.
  FLG_MSK: 4096,
  // mask header values
  /* Load type */
  FILE: 2,
  BUFFER: 1,
  NONE: 0,
  /* 4.5 Extensible data fields */
  EF_ID: 0,
  EF_SIZE: 2,
  /* Header IDs */
  ID_ZIP64: 1,
  ID_AVINFO: 7,
  ID_PFS: 8,
  ID_OS2: 9,
  ID_NTFS: 10,
  ID_OPENVMS: 12,
  ID_UNIX: 13,
  ID_FORK: 14,
  ID_PATCH: 15,
  ID_X509_PKCS7: 20,
  ID_X509_CERTID_F: 21,
  ID_X509_CERTID_C: 22,
  ID_STRONGENC: 23,
  ID_RECORD_MGT: 24,
  ID_X509_PKCS7_RL: 25,
  ID_IBM1: 101,
  ID_IBM2: 102,
  ID_POSZIP: 18064,
  EF_ZIP64_OR_32: 4294967295,
  EF_ZIP64_OR_16: 65535,
  EF_ZIP64_SUNCOMP: 0,
  EF_ZIP64_SCOMP: 8,
  EF_ZIP64_RHO: 16,
  EF_ZIP64_DSN: 24
};
var errors = {};
(function(exports$1) {
  const errors2 = {
    /* Header error messages */
    INVALID_LOC: "Invalid LOC header (bad signature)",
    INVALID_CEN: "Invalid CEN header (bad signature)",
    INVALID_END: "Invalid END header (bad signature)",
    /* Descriptor */
    DESCRIPTOR_NOT_EXIST: "No descriptor present",
    DESCRIPTOR_UNKNOWN: "Unknown descriptor format",
    DESCRIPTOR_FAULTY: "Descriptor data is malformed",
    /* ZipEntry error messages*/
    NO_DATA: "Nothing to decompress",
    BAD_CRC: "CRC32 checksum failed {0}",
    FILE_IN_THE_WAY: "There is a file in the way: {0}",
    UNKNOWN_METHOD: "Invalid/unsupported compression method",
    /* Inflater error messages */
    AVAIL_DATA: "inflate::Available inflate data did not terminate",
    INVALID_DISTANCE: "inflate::Invalid literal/length or distance code in fixed or dynamic block",
    TO_MANY_CODES: "inflate::Dynamic block code description: too many length or distance codes",
    INVALID_REPEAT_LEN: "inflate::Dynamic block code description: repeat more than specified lengths",
    INVALID_REPEAT_FIRST: "inflate::Dynamic block code description: repeat lengths with no first length",
    INCOMPLETE_CODES: "inflate::Dynamic block code description: code lengths codes incomplete",
    INVALID_DYN_DISTANCE: "inflate::Dynamic block code description: invalid distance code lengths",
    INVALID_CODES_LEN: "inflate::Dynamic block code description: invalid literal/length code lengths",
    INVALID_STORE_BLOCK: "inflate::Stored block length did not match one's complement",
    INVALID_BLOCK_TYPE: "inflate::Invalid block type (type == 3)",
    /* ADM-ZIP error messages */
    CANT_EXTRACT_FILE: "Could not extract the file",
    CANT_OVERRIDE: "Target file already exists",
    DISK_ENTRY_TOO_LARGE: "Number of disk entries is too large",
    NO_ZIP: "No zip file was loaded",
    NO_ENTRY: "Entry doesn't exist",
    DIRECTORY_CONTENT_ERROR: "A directory cannot have content",
    FILE_NOT_FOUND: 'File not found: "{0}"',
    NOT_IMPLEMENTED: "Not implemented",
    INVALID_FILENAME: "Invalid filename",
    INVALID_FORMAT: "Invalid or unsupported zip format. No END header found",
    INVALID_PASS_PARAM: "Incompatible password parameter",
    WRONG_PASSWORD: "Wrong Password",
    /* ADM-ZIP */
    COMMENT_TOO_LONG: "Comment is too long",
    // Comment can be max 65535 bytes long (NOTE: some non-US characters may take more space)
    EXTRA_FIELD_PARSE_ERROR: "Extra field parsing error"
  };
  function E(message) {
    return function(...args) {
      if (args.length) {
        message = message.replace(/\{(\d)\}/g, (_, n) => args[n] || "");
      }
      return new Error("ADM-ZIP: " + message);
    };
  }
  for (const msg of Object.keys(errors2)) {
    exports$1[msg] = E(errors2[msg]);
  }
})(errors);
const fsystem = fs$1;
const pth$2 = path$1;
const Constants$3 = constants;
const Errors$1 = errors;
const isWin = typeof process === "object" && "win32" === process.platform;
const is_Obj = (obj) => typeof obj === "object" && obj !== null;
const crcTable = new Uint32Array(256).map((t, c) => {
  for (let k = 0; k < 8; k++) {
    if ((c & 1) !== 0) {
      c = 3988292384 ^ c >>> 1;
    } else {
      c >>>= 1;
    }
  }
  return c >>> 0;
});
function Utils$5(opts) {
  this.sep = pth$2.sep;
  this.fs = fsystem;
  if (is_Obj(opts)) {
    if (is_Obj(opts.fs) && typeof opts.fs.statSync === "function") {
      this.fs = opts.fs;
    }
  }
}
var utils = Utils$5;
Utils$5.prototype.makeDir = function(folder) {
  const self2 = this;
  function mkdirSync(fpath) {
    let resolvedPath = fpath.split(self2.sep)[0];
    fpath.split(self2.sep).forEach(function(name) {
      if (!name || name.substr(-1, 1) === ":") return;
      resolvedPath += self2.sep + name;
      var stat;
      try {
        stat = self2.fs.statSync(resolvedPath);
      } catch (e) {
        self2.fs.mkdirSync(resolvedPath);
      }
      if (stat && stat.isFile()) throw Errors$1.FILE_IN_THE_WAY(`"${resolvedPath}"`);
    });
  }
  mkdirSync(folder);
};
Utils$5.prototype.writeFileTo = function(path2, content, overwrite, attr) {
  const self2 = this;
  if (self2.fs.existsSync(path2)) {
    if (!overwrite) return false;
    var stat = self2.fs.statSync(path2);
    if (stat.isDirectory()) {
      return false;
    }
  }
  var folder = pth$2.dirname(path2);
  if (!self2.fs.existsSync(folder)) {
    self2.makeDir(folder);
  }
  var fd;
  try {
    fd = self2.fs.openSync(path2, "w", 438);
  } catch (e) {
    self2.fs.chmodSync(path2, 438);
    fd = self2.fs.openSync(path2, "w", 438);
  }
  if (fd) {
    try {
      self2.fs.writeSync(fd, content, 0, content.length, 0);
    } finally {
      self2.fs.closeSync(fd);
    }
  }
  self2.fs.chmodSync(path2, attr || 438);
  return true;
};
Utils$5.prototype.writeFileToAsync = function(path2, content, overwrite, attr, callback) {
  if (typeof attr === "function") {
    callback = attr;
    attr = void 0;
  }
  const self2 = this;
  self2.fs.exists(path2, function(exist) {
    if (exist && !overwrite) return callback(false);
    self2.fs.stat(path2, function(err, stat) {
      if (exist && stat.isDirectory()) {
        return callback(false);
      }
      var folder = pth$2.dirname(path2);
      self2.fs.exists(folder, function(exists) {
        if (!exists) self2.makeDir(folder);
        self2.fs.open(path2, "w", 438, function(err2, fd) {
          if (err2) {
            self2.fs.chmod(path2, 438, function() {
              self2.fs.open(path2, "w", 438, function(err3, fd2) {
                self2.fs.write(fd2, content, 0, content.length, 0, function() {
                  self2.fs.close(fd2, function() {
                    self2.fs.chmod(path2, attr || 438, function() {
                      callback(true);
                    });
                  });
                });
              });
            });
          } else if (fd) {
            self2.fs.write(fd, content, 0, content.length, 0, function() {
              self2.fs.close(fd, function() {
                self2.fs.chmod(path2, attr || 438, function() {
                  callback(true);
                });
              });
            });
          } else {
            self2.fs.chmod(path2, attr || 438, function() {
              callback(true);
            });
          }
        });
      });
    });
  });
};
Utils$5.prototype.findFiles = function(path2) {
  const self2 = this;
  function findSync(dir, pattern, recursive) {
    let files = [];
    self2.fs.readdirSync(dir).forEach(function(file) {
      const path3 = pth$2.join(dir, file);
      const stat = self2.fs.statSync(path3);
      {
        files.push(pth$2.normalize(path3) + (stat.isDirectory() ? self2.sep : ""));
      }
      if (stat.isDirectory() && recursive) files = files.concat(findSync(path3, pattern, recursive));
    });
    return files;
  }
  return findSync(path2, void 0, true);
};
Utils$5.prototype.findFilesAsync = function(dir, cb) {
  const self2 = this;
  let results = [];
  self2.fs.readdir(dir, function(err, list) {
    if (err) return cb(err);
    let list_length = list.length;
    if (!list_length) return cb(null, results);
    list.forEach(function(file) {
      file = pth$2.join(dir, file);
      self2.fs.stat(file, function(err2, stat) {
        if (err2) return cb(err2);
        if (stat) {
          results.push(pth$2.normalize(file) + (stat.isDirectory() ? self2.sep : ""));
          if (stat.isDirectory()) {
            self2.findFilesAsync(file, function(err3, res) {
              if (err3) return cb(err3);
              results = results.concat(res);
              if (!--list_length) cb(null, results);
            });
          } else {
            if (!--list_length) cb(null, results);
          }
        }
      });
    });
  });
};
Utils$5.prototype.getAttributes = function() {
};
Utils$5.prototype.setAttributes = function() {
};
Utils$5.crc32update = function(crc, byte) {
  return crcTable[(crc ^ byte) & 255] ^ crc >>> 8;
};
Utils$5.crc32 = function(buf) {
  if (typeof buf === "string") {
    buf = Buffer.from(buf, "utf8");
  }
  let len = buf.length;
  let crc = -1;
  for (let off = 0; off < len; ) crc = Utils$5.crc32update(crc, buf[off++]);
  return ~crc >>> 0;
};
Utils$5.methodToString = function(method) {
  switch (method) {
    case Constants$3.STORED:
      return "STORED (" + method + ")";
    case Constants$3.DEFLATED:
      return "DEFLATED (" + method + ")";
    default:
      return "UNSUPPORTED (" + method + ")";
  }
};
Utils$5.canonical = function(path2) {
  if (!path2) return "";
  const safeSuffix = pth$2.posix.normalize("/" + path2.split("\\").join("/"));
  return pth$2.join(".", safeSuffix);
};
Utils$5.zipnamefix = function(path2) {
  if (!path2) return "";
  const safeSuffix = pth$2.posix.normalize("/" + path2.split("\\").join("/"));
  return pth$2.posix.join(".", safeSuffix);
};
Utils$5.findLast = function(arr, callback) {
  if (!Array.isArray(arr)) throw new TypeError("arr is not array");
  const len = arr.length >>> 0;
  for (let i = len - 1; i >= 0; i--) {
    if (callback(arr[i], i, arr)) {
      return arr[i];
    }
  }
  return void 0;
};
Utils$5.sanitize = function(prefix, name) {
  prefix = pth$2.resolve(pth$2.normalize(prefix));
  var parts = name.split("/");
  for (var i = 0, l = parts.length; i < l; i++) {
    var path2 = pth$2.normalize(pth$2.join(prefix, parts.slice(i, l).join(pth$2.sep)));
    if (path2.indexOf(prefix) === 0) {
      return path2;
    }
  }
  return pth$2.normalize(pth$2.join(prefix, pth$2.basename(name)));
};
Utils$5.toBuffer = function toBuffer(input, encoder) {
  if (Buffer.isBuffer(input)) {
    return input;
  } else if (input instanceof Uint8Array) {
    return Buffer.from(input);
  } else {
    return typeof input === "string" ? encoder(input) : Buffer.alloc(0);
  }
};
Utils$5.readBigUInt64LE = function(buffer, index) {
  var slice = Buffer.from(buffer.slice(index, index + 8));
  slice.swap64();
  return parseInt(`0x${slice.toString("hex")}`);
};
Utils$5.fromDOS2Date = function(val) {
  return new Date((val >> 25 & 127) + 1980, Math.max((val >> 21 & 15) - 1, 0), Math.max(val >> 16 & 31, 1), val >> 11 & 31, val >> 5 & 63, (val & 31) << 1);
};
Utils$5.fromDate2DOS = function(val) {
  let date = 0;
  let time = 0;
  if (val.getFullYear() > 1979) {
    date = (val.getFullYear() - 1980 & 127) << 9 | val.getMonth() + 1 << 5 | val.getDate();
    time = val.getHours() << 11 | val.getMinutes() << 5 | val.getSeconds() >> 1;
  }
  return date << 16 | time;
};
Utils$5.isWin = isWin;
Utils$5.crcTable = crcTable;
const pth$1 = path$1;
var fattr = function(path2, { fs: fs2 }) {
  var _path = path2 || "", _obj = newAttr(), _stat = null;
  function newAttr() {
    return {
      directory: false,
      readonly: false,
      hidden: false,
      executable: false,
      mtime: 0,
      atime: 0
    };
  }
  if (_path && fs2.existsSync(_path)) {
    _stat = fs2.statSync(_path);
    _obj.directory = _stat.isDirectory();
    _obj.mtime = _stat.mtime;
    _obj.atime = _stat.atime;
    _obj.executable = (73 & _stat.mode) !== 0;
    _obj.readonly = (128 & _stat.mode) === 0;
    _obj.hidden = pth$1.basename(_path)[0] === ".";
  } else {
    console.warn("Invalid path: " + _path);
  }
  return {
    get directory() {
      return _obj.directory;
    },
    get readOnly() {
      return _obj.readonly;
    },
    get hidden() {
      return _obj.hidden;
    },
    get mtime() {
      return _obj.mtime;
    },
    get atime() {
      return _obj.atime;
    },
    get executable() {
      return _obj.executable;
    },
    decodeAttributes: function() {
    },
    encodeAttributes: function() {
    },
    toJSON: function() {
      return {
        path: _path,
        isDirectory: _obj.directory,
        isReadOnly: _obj.readonly,
        isHidden: _obj.hidden,
        isExecutable: _obj.executable,
        mTime: _obj.mtime,
        aTime: _obj.atime
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
};
var decoder = {
  efs: true,
  encode: (data) => Buffer.from(data, "utf8"),
  decode: (data) => data.toString("utf8")
};
util.exports = utils;
util.exports.Constants = constants;
util.exports.Errors = errors;
util.exports.FileAttr = fattr;
util.exports.decoder = decoder;
var utilExports = util.exports;
var headers = {};
var Utils$4 = utilExports, Constants$2 = Utils$4.Constants;
var entryHeader = function() {
  var _verMade = 20, _version = 10, _flags = 0, _method = 0, _time = 0, _crc = 0, _compressedSize = 0, _size = 0, _fnameLen = 0, _extraLen = 0, _comLen = 0, _diskStart = 0, _inattr = 0, _attr = 0, _offset = 0;
  _verMade |= Utils$4.isWin ? 2560 : 768;
  _flags |= Constants$2.FLG_EFS;
  const _localHeader = {
    extraLen: 0
  };
  const uint32 = (val) => Math.max(0, val) >>> 0;
  const uint8 = (val) => Math.max(0, val) & 255;
  _time = Utils$4.fromDate2DOS(/* @__PURE__ */ new Date());
  return {
    get made() {
      return _verMade;
    },
    set made(val) {
      _verMade = val;
    },
    get version() {
      return _version;
    },
    set version(val) {
      _version = val;
    },
    get flags() {
      return _flags;
    },
    set flags(val) {
      _flags = val;
    },
    get flags_efs() {
      return (_flags & Constants$2.FLG_EFS) > 0;
    },
    set flags_efs(val) {
      if (val) {
        _flags |= Constants$2.FLG_EFS;
      } else {
        _flags &= ~Constants$2.FLG_EFS;
      }
    },
    get flags_desc() {
      return (_flags & Constants$2.FLG_DESC) > 0;
    },
    set flags_desc(val) {
      if (val) {
        _flags |= Constants$2.FLG_DESC;
      } else {
        _flags &= ~Constants$2.FLG_DESC;
      }
    },
    get method() {
      return _method;
    },
    set method(val) {
      switch (val) {
        case Constants$2.STORED:
          this.version = 10;
        case Constants$2.DEFLATED:
        default:
          this.version = 20;
      }
      _method = val;
    },
    get time() {
      return Utils$4.fromDOS2Date(this.timeval);
    },
    set time(val) {
      this.timeval = Utils$4.fromDate2DOS(val);
    },
    get timeval() {
      return _time;
    },
    set timeval(val) {
      _time = uint32(val);
    },
    get timeHighByte() {
      return uint8(_time >>> 8);
    },
    get crc() {
      return _crc;
    },
    set crc(val) {
      _crc = uint32(val);
    },
    get compressedSize() {
      return _compressedSize;
    },
    set compressedSize(val) {
      _compressedSize = uint32(val);
    },
    get size() {
      return _size;
    },
    set size(val) {
      _size = uint32(val);
    },
    get fileNameLength() {
      return _fnameLen;
    },
    set fileNameLength(val) {
      _fnameLen = val;
    },
    get extraLength() {
      return _extraLen;
    },
    set extraLength(val) {
      _extraLen = val;
    },
    get extraLocalLength() {
      return _localHeader.extraLen;
    },
    set extraLocalLength(val) {
      _localHeader.extraLen = val;
    },
    get commentLength() {
      return _comLen;
    },
    set commentLength(val) {
      _comLen = val;
    },
    get diskNumStart() {
      return _diskStart;
    },
    set diskNumStart(val) {
      _diskStart = uint32(val);
    },
    get inAttr() {
      return _inattr;
    },
    set inAttr(val) {
      _inattr = uint32(val);
    },
    get attr() {
      return _attr;
    },
    set attr(val) {
      _attr = uint32(val);
    },
    // get Unix file permissions
    get fileAttr() {
      return (_attr || 0) >> 16 & 4095;
    },
    get offset() {
      return _offset;
    },
    set offset(val) {
      _offset = uint32(val);
    },
    get encrypted() {
      return (_flags & Constants$2.FLG_ENC) === Constants$2.FLG_ENC;
    },
    get centralHeaderSize() {
      return Constants$2.CENHDR + _fnameLen + _extraLen + _comLen;
    },
    get realDataOffset() {
      return _offset + Constants$2.LOCHDR + _localHeader.fnameLen + _localHeader.extraLen;
    },
    get localHeader() {
      return _localHeader;
    },
    loadLocalHeaderFromBinary: function(input) {
      var data = input.slice(_offset, _offset + Constants$2.LOCHDR);
      if (data.readUInt32LE(0) !== Constants$2.LOCSIG) {
        throw Utils$4.Errors.INVALID_LOC();
      }
      _localHeader.version = data.readUInt16LE(Constants$2.LOCVER);
      _localHeader.flags = data.readUInt16LE(Constants$2.LOCFLG);
      _localHeader.method = data.readUInt16LE(Constants$2.LOCHOW);
      _localHeader.time = data.readUInt32LE(Constants$2.LOCTIM);
      _localHeader.crc = data.readUInt32LE(Constants$2.LOCCRC);
      _localHeader.compressedSize = data.readUInt32LE(Constants$2.LOCSIZ);
      _localHeader.size = data.readUInt32LE(Constants$2.LOCLEN);
      _localHeader.fnameLen = data.readUInt16LE(Constants$2.LOCNAM);
      _localHeader.extraLen = data.readUInt16LE(Constants$2.LOCEXT);
      const extraStart = _offset + Constants$2.LOCHDR + _localHeader.fnameLen;
      const extraEnd = extraStart + _localHeader.extraLen;
      return input.slice(extraStart, extraEnd);
    },
    loadFromBinary: function(data) {
      if (data.length !== Constants$2.CENHDR || data.readUInt32LE(0) !== Constants$2.CENSIG) {
        throw Utils$4.Errors.INVALID_CEN();
      }
      _verMade = data.readUInt16LE(Constants$2.CENVEM);
      _version = data.readUInt16LE(Constants$2.CENVER);
      _flags = data.readUInt16LE(Constants$2.CENFLG);
      _method = data.readUInt16LE(Constants$2.CENHOW);
      _time = data.readUInt32LE(Constants$2.CENTIM);
      _crc = data.readUInt32LE(Constants$2.CENCRC);
      _compressedSize = data.readUInt32LE(Constants$2.CENSIZ);
      _size = data.readUInt32LE(Constants$2.CENLEN);
      _fnameLen = data.readUInt16LE(Constants$2.CENNAM);
      _extraLen = data.readUInt16LE(Constants$2.CENEXT);
      _comLen = data.readUInt16LE(Constants$2.CENCOM);
      _diskStart = data.readUInt16LE(Constants$2.CENDSK);
      _inattr = data.readUInt16LE(Constants$2.CENATT);
      _attr = data.readUInt32LE(Constants$2.CENATX);
      _offset = data.readUInt32LE(Constants$2.CENOFF);
    },
    localHeaderToBinary: function() {
      var data = Buffer.alloc(Constants$2.LOCHDR);
      data.writeUInt32LE(Constants$2.LOCSIG, 0);
      data.writeUInt16LE(_version, Constants$2.LOCVER);
      data.writeUInt16LE(_flags, Constants$2.LOCFLG);
      data.writeUInt16LE(_method, Constants$2.LOCHOW);
      data.writeUInt32LE(_time, Constants$2.LOCTIM);
      data.writeUInt32LE(_crc, Constants$2.LOCCRC);
      data.writeUInt32LE(_compressedSize, Constants$2.LOCSIZ);
      data.writeUInt32LE(_size, Constants$2.LOCLEN);
      data.writeUInt16LE(_fnameLen, Constants$2.LOCNAM);
      data.writeUInt16LE(_localHeader.extraLen, Constants$2.LOCEXT);
      return data;
    },
    centralHeaderToBinary: function() {
      var data = Buffer.alloc(Constants$2.CENHDR + _fnameLen + _extraLen + _comLen);
      data.writeUInt32LE(Constants$2.CENSIG, 0);
      data.writeUInt16LE(_verMade, Constants$2.CENVEM);
      data.writeUInt16LE(_version, Constants$2.CENVER);
      data.writeUInt16LE(_flags, Constants$2.CENFLG);
      data.writeUInt16LE(_method, Constants$2.CENHOW);
      data.writeUInt32LE(_time, Constants$2.CENTIM);
      data.writeUInt32LE(_crc, Constants$2.CENCRC);
      data.writeUInt32LE(_compressedSize, Constants$2.CENSIZ);
      data.writeUInt32LE(_size, Constants$2.CENLEN);
      data.writeUInt16LE(_fnameLen, Constants$2.CENNAM);
      data.writeUInt16LE(_extraLen, Constants$2.CENEXT);
      data.writeUInt16LE(_comLen, Constants$2.CENCOM);
      data.writeUInt16LE(_diskStart, Constants$2.CENDSK);
      data.writeUInt16LE(_inattr, Constants$2.CENATT);
      data.writeUInt32LE(_attr, Constants$2.CENATX);
      data.writeUInt32LE(_offset, Constants$2.CENOFF);
      return data;
    },
    toJSON: function() {
      const bytes = function(nr) {
        return nr + " bytes";
      };
      return {
        made: _verMade,
        version: _version,
        flags: _flags,
        method: Utils$4.methodToString(_method),
        time: this.time,
        crc: "0x" + _crc.toString(16).toUpperCase(),
        compressedSize: bytes(_compressedSize),
        size: bytes(_size),
        fileNameLength: bytes(_fnameLen),
        extraLength: bytes(_extraLen),
        commentLength: bytes(_comLen),
        diskNumStart: _diskStart,
        inAttr: _inattr,
        attr: _attr,
        offset: _offset,
        centralHeaderSize: bytes(Constants$2.CENHDR + _fnameLen + _extraLen + _comLen)
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
};
var Utils$3 = utilExports, Constants$1 = Utils$3.Constants;
var mainHeader = function() {
  var _volumeEntries = 0, _totalEntries = 0, _size = 0, _offset = 0, _commentLength = 0;
  return {
    get diskEntries() {
      return _volumeEntries;
    },
    set diskEntries(val) {
      _volumeEntries = _totalEntries = val;
    },
    get totalEntries() {
      return _totalEntries;
    },
    set totalEntries(val) {
      _totalEntries = _volumeEntries = val;
    },
    get size() {
      return _size;
    },
    set size(val) {
      _size = val;
    },
    get offset() {
      return _offset;
    },
    set offset(val) {
      _offset = val;
    },
    get commentLength() {
      return _commentLength;
    },
    set commentLength(val) {
      _commentLength = val;
    },
    get mainHeaderSize() {
      return Constants$1.ENDHDR + _commentLength;
    },
    loadFromBinary: function(data) {
      if ((data.length !== Constants$1.ENDHDR || data.readUInt32LE(0) !== Constants$1.ENDSIG) && (data.length < Constants$1.ZIP64HDR || data.readUInt32LE(0) !== Constants$1.ZIP64SIG)) {
        throw Utils$3.Errors.INVALID_END();
      }
      if (data.readUInt32LE(0) === Constants$1.ENDSIG) {
        _volumeEntries = data.readUInt16LE(Constants$1.ENDSUB);
        _totalEntries = data.readUInt16LE(Constants$1.ENDTOT);
        _size = data.readUInt32LE(Constants$1.ENDSIZ);
        _offset = data.readUInt32LE(Constants$1.ENDOFF);
        _commentLength = data.readUInt16LE(Constants$1.ENDCOM);
      } else {
        _volumeEntries = Utils$3.readBigUInt64LE(data, Constants$1.ZIP64SUB);
        _totalEntries = Utils$3.readBigUInt64LE(data, Constants$1.ZIP64TOT);
        _size = Utils$3.readBigUInt64LE(data, Constants$1.ZIP64SIZE);
        _offset = Utils$3.readBigUInt64LE(data, Constants$1.ZIP64OFF);
        _commentLength = 0;
      }
    },
    toBinary: function() {
      var b = Buffer.alloc(Constants$1.ENDHDR + _commentLength);
      b.writeUInt32LE(Constants$1.ENDSIG, 0);
      b.writeUInt32LE(0, 4);
      b.writeUInt16LE(_volumeEntries, Constants$1.ENDSUB);
      b.writeUInt16LE(_totalEntries, Constants$1.ENDTOT);
      b.writeUInt32LE(_size, Constants$1.ENDSIZ);
      b.writeUInt32LE(_offset, Constants$1.ENDOFF);
      b.writeUInt16LE(_commentLength, Constants$1.ENDCOM);
      b.fill(" ", Constants$1.ENDHDR);
      return b;
    },
    toJSON: function() {
      const offset = function(nr, len) {
        let offs = nr.toString(16).toUpperCase();
        while (offs.length < len) offs = "0" + offs;
        return "0x" + offs;
      };
      return {
        diskEntries: _volumeEntries,
        totalEntries: _totalEntries,
        size: _size + " bytes",
        offset: offset(_offset, 4),
        commentLength: _commentLength
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
};
headers.EntryHeader = entryHeader;
headers.MainHeader = mainHeader;
var methods = {};
var deflater = function(inbuf) {
  var zlib$1 = zlib;
  var opts = { chunkSize: (parseInt(inbuf.length / 1024) + 1) * 1024 };
  return {
    deflate: function() {
      return zlib$1.deflateRawSync(inbuf, opts);
    },
    deflateAsync: function(callback) {
      var tmp = zlib$1.createDeflateRaw(opts), parts = [], total = 0;
      tmp.on("data", function(data) {
        parts.push(data);
        total += data.length;
      });
      tmp.on("end", function() {
        var buf = Buffer.alloc(total), written = 0;
        buf.fill(0);
        for (var i = 0; i < parts.length; i++) {
          var part = parts[i];
          part.copy(buf, written);
          written += part.length;
        }
        callback && callback(buf);
      });
      tmp.end(inbuf);
    }
  };
};
const version = +(process.versions ? process.versions.node : "").split(".")[0] || 0;
var inflater = function(inbuf, expectedLength) {
  var zlib$1 = zlib;
  const option = version >= 15 && expectedLength > 0 ? { maxOutputLength: expectedLength } : {};
  return {
    inflate: function() {
      return zlib$1.inflateRawSync(inbuf, option);
    },
    inflateAsync: function(callback) {
      var tmp = zlib$1.createInflateRaw(option), parts = [], total = 0;
      tmp.on("data", function(data) {
        parts.push(data);
        total += data.length;
      });
      tmp.on("end", function() {
        var buf = Buffer.alloc(total), written = 0;
        buf.fill(0);
        for (var i = 0; i < parts.length; i++) {
          var part = parts[i];
          part.copy(buf, written);
          written += part.length;
        }
        callback && callback(buf);
      });
      tmp.end(inbuf);
    }
  };
};
const { randomFillSync } = require$$8;
const Errors = errors;
const crctable = new Uint32Array(256).map((t, crc) => {
  for (let j = 0; j < 8; j++) {
    if (0 !== (crc & 1)) {
      crc = crc >>> 1 ^ 3988292384;
    } else {
      crc >>>= 1;
    }
  }
  return crc >>> 0;
});
const uMul = (a, b) => Math.imul(a, b) >>> 0;
const crc32update = (pCrc32, bval) => {
  return crctable[(pCrc32 ^ bval) & 255] ^ pCrc32 >>> 8;
};
const genSalt = () => {
  if ("function" === typeof randomFillSync) {
    return randomFillSync(Buffer.alloc(12));
  } else {
    return genSalt.node();
  }
};
genSalt.node = () => {
  const salt = Buffer.alloc(12);
  const len = salt.length;
  for (let i = 0; i < len; i++) salt[i] = Math.random() * 256 & 255;
  return salt;
};
const config$1 = {
  genSalt
};
function Initkeys(pw) {
  const pass = Buffer.isBuffer(pw) ? pw : Buffer.from(pw);
  this.keys = new Uint32Array([305419896, 591751049, 878082192]);
  for (let i = 0; i < pass.length; i++) {
    this.updateKeys(pass[i]);
  }
}
Initkeys.prototype.updateKeys = function(byteValue) {
  const keys = this.keys;
  keys[0] = crc32update(keys[0], byteValue);
  keys[1] += keys[0] & 255;
  keys[1] = uMul(keys[1], 134775813) + 1;
  keys[2] = crc32update(keys[2], keys[1] >>> 24);
  return byteValue;
};
Initkeys.prototype.next = function() {
  const k = (this.keys[2] | 2) >>> 0;
  return uMul(k, k ^ 1) >> 8 & 255;
};
function make_decrypter(pwd) {
  const keys = new Initkeys(pwd);
  return function(data) {
    const result = Buffer.alloc(data.length);
    let pos = 0;
    for (let c of data) {
      result[pos++] = keys.updateKeys(c ^ keys.next());
    }
    return result;
  };
}
function make_encrypter(pwd) {
  const keys = new Initkeys(pwd);
  return function(data, result, pos = 0) {
    if (!result) result = Buffer.alloc(data.length);
    for (let c of data) {
      const k = keys.next();
      result[pos++] = c ^ k;
      keys.updateKeys(c);
    }
    return result;
  };
}
function decrypt(data, header, pwd) {
  if (!data || !Buffer.isBuffer(data) || data.length < 12) {
    return Buffer.alloc(0);
  }
  const decrypter = make_decrypter(pwd);
  const salt = decrypter(data.slice(0, 12));
  const verifyByte = (header.flags & 8) === 8 ? header.timeHighByte : header.crc >>> 24;
  if (salt[11] !== verifyByte) {
    throw Errors.WRONG_PASSWORD();
  }
  return decrypter(data.slice(12));
}
function _salter(data) {
  if (Buffer.isBuffer(data) && data.length >= 12) {
    config$1.genSalt = function() {
      return data.slice(0, 12);
    };
  } else if (data === "node") {
    config$1.genSalt = genSalt.node;
  } else {
    config$1.genSalt = genSalt;
  }
}
function encrypt(data, header, pwd, oldlike = false) {
  if (data == null) data = Buffer.alloc(0);
  if (!Buffer.isBuffer(data)) data = Buffer.from(data.toString());
  const encrypter = make_encrypter(pwd);
  const salt = config$1.genSalt();
  salt[11] = header.crc >>> 24 & 255;
  if (oldlike) salt[10] = header.crc >>> 16 & 255;
  const result = Buffer.alloc(data.length + 12);
  encrypter(salt, result);
  return encrypter(data, result, 12);
}
var zipcrypto = { decrypt, encrypt, _salter };
methods.Deflater = deflater;
methods.Inflater = inflater;
methods.ZipCrypto = zipcrypto;
var Utils$2 = utilExports, Headers$1 = headers, Constants = Utils$2.Constants, Methods = methods;
var zipEntry = function(options, input) {
  var _centralHeader = new Headers$1.EntryHeader(), _entryName = Buffer.alloc(0), _comment = Buffer.alloc(0), _isDirectory = false, uncompressedData = null, _extra = Buffer.alloc(0), _extralocal = Buffer.alloc(0), _efs = true;
  const opts = options;
  const decoder2 = typeof opts.decoder === "object" ? opts.decoder : Utils$2.decoder;
  _efs = decoder2.hasOwnProperty("efs") ? decoder2.efs : false;
  function getCompressedDataFromZip() {
    if (!input || !(input instanceof Uint8Array)) {
      return Buffer.alloc(0);
    }
    _extralocal = _centralHeader.loadLocalHeaderFromBinary(input);
    return input.slice(_centralHeader.realDataOffset, _centralHeader.realDataOffset + _centralHeader.compressedSize);
  }
  function crc32OK(data) {
    if (!_centralHeader.flags_desc) {
      if (Utils$2.crc32(data) !== _centralHeader.localHeader.crc) {
        return false;
      }
    } else {
      const descriptor = {};
      const dataEndOffset = _centralHeader.realDataOffset + _centralHeader.compressedSize;
      if (input.readUInt32LE(dataEndOffset) == Constants.LOCSIG || input.readUInt32LE(dataEndOffset) == Constants.CENSIG) {
        throw Utils$2.Errors.DESCRIPTOR_NOT_EXIST();
      }
      if (input.readUInt32LE(dataEndOffset) == Constants.EXTSIG) {
        descriptor.crc = input.readUInt32LE(dataEndOffset + Constants.EXTCRC);
        descriptor.compressedSize = input.readUInt32LE(dataEndOffset + Constants.EXTSIZ);
        descriptor.size = input.readUInt32LE(dataEndOffset + Constants.EXTLEN);
      } else if (input.readUInt16LE(dataEndOffset + 12) === 19280) {
        descriptor.crc = input.readUInt32LE(dataEndOffset + Constants.EXTCRC - 4);
        descriptor.compressedSize = input.readUInt32LE(dataEndOffset + Constants.EXTSIZ - 4);
        descriptor.size = input.readUInt32LE(dataEndOffset + Constants.EXTLEN - 4);
      } else {
        throw Utils$2.Errors.DESCRIPTOR_UNKNOWN();
      }
      if (descriptor.compressedSize !== _centralHeader.compressedSize || descriptor.size !== _centralHeader.size || descriptor.crc !== _centralHeader.crc) {
        throw Utils$2.Errors.DESCRIPTOR_FAULTY();
      }
      if (Utils$2.crc32(data) !== descriptor.crc) {
        return false;
      }
    }
    return true;
  }
  function decompress(async2, callback, pass) {
    if (typeof callback === "undefined" && typeof async2 === "string") {
      pass = async2;
      async2 = void 0;
    }
    if (_isDirectory) {
      if (async2 && callback) {
        callback(Buffer.alloc(0), Utils$2.Errors.DIRECTORY_CONTENT_ERROR());
      }
      return Buffer.alloc(0);
    }
    var compressedData = getCompressedDataFromZip();
    if (compressedData.length === 0) {
      if (async2 && callback) callback(compressedData);
      return compressedData;
    }
    if (_centralHeader.encrypted) {
      if ("string" !== typeof pass && !Buffer.isBuffer(pass)) {
        throw Utils$2.Errors.INVALID_PASS_PARAM();
      }
      compressedData = Methods.ZipCrypto.decrypt(compressedData, _centralHeader, pass);
    }
    var data = Buffer.alloc(_centralHeader.size);
    switch (_centralHeader.method) {
      case Utils$2.Constants.STORED:
        compressedData.copy(data);
        if (!crc32OK(data)) {
          if (async2 && callback) callback(data, Utils$2.Errors.BAD_CRC());
          throw Utils$2.Errors.BAD_CRC();
        } else {
          if (async2 && callback) callback(data);
          return data;
        }
      case Utils$2.Constants.DEFLATED:
        var inflater2 = new Methods.Inflater(compressedData, _centralHeader.size);
        if (!async2) {
          const result = inflater2.inflate(data);
          result.copy(data, 0);
          if (!crc32OK(data)) {
            throw Utils$2.Errors.BAD_CRC(`"${decoder2.decode(_entryName)}"`);
          }
          return data;
        } else {
          inflater2.inflateAsync(function(result) {
            result.copy(result, 0);
            if (callback) {
              if (!crc32OK(result)) {
                callback(result, Utils$2.Errors.BAD_CRC());
              } else {
                callback(result);
              }
            }
          });
        }
        break;
      default:
        if (async2 && callback) callback(Buffer.alloc(0), Utils$2.Errors.UNKNOWN_METHOD());
        throw Utils$2.Errors.UNKNOWN_METHOD();
    }
  }
  function compress(async2, callback) {
    if ((!uncompressedData || !uncompressedData.length) && Buffer.isBuffer(input)) {
      if (async2 && callback) callback(getCompressedDataFromZip());
      return getCompressedDataFromZip();
    }
    if (uncompressedData.length && !_isDirectory) {
      var compressedData;
      switch (_centralHeader.method) {
        case Utils$2.Constants.STORED:
          _centralHeader.compressedSize = _centralHeader.size;
          compressedData = Buffer.alloc(uncompressedData.length);
          uncompressedData.copy(compressedData);
          if (async2 && callback) callback(compressedData);
          return compressedData;
        default:
        case Utils$2.Constants.DEFLATED:
          var deflater2 = new Methods.Deflater(uncompressedData);
          if (!async2) {
            var deflated = deflater2.deflate();
            _centralHeader.compressedSize = deflated.length;
            return deflated;
          } else {
            deflater2.deflateAsync(function(data) {
              compressedData = Buffer.alloc(data.length);
              _centralHeader.compressedSize = data.length;
              data.copy(compressedData);
              callback && callback(compressedData);
            });
          }
          deflater2 = null;
          break;
      }
    } else if (async2 && callback) {
      callback(Buffer.alloc(0));
    } else {
      return Buffer.alloc(0);
    }
  }
  function readUInt64LE(buffer, offset) {
    return (buffer.readUInt32LE(offset + 4) << 4) + buffer.readUInt32LE(offset);
  }
  function parseExtra(data) {
    try {
      var offset = 0;
      var signature, size, part;
      while (offset + 4 < data.length) {
        signature = data.readUInt16LE(offset);
        offset += 2;
        size = data.readUInt16LE(offset);
        offset += 2;
        part = data.slice(offset, offset + size);
        offset += size;
        if (Constants.ID_ZIP64 === signature) {
          parseZip64ExtendedInformation(part);
        }
      }
    } catch (error) {
      throw Utils$2.Errors.EXTRA_FIELD_PARSE_ERROR();
    }
  }
  function parseZip64ExtendedInformation(data) {
    var size, compressedSize, offset, diskNumStart;
    if (data.length >= Constants.EF_ZIP64_SCOMP) {
      size = readUInt64LE(data, Constants.EF_ZIP64_SUNCOMP);
      if (_centralHeader.size === Constants.EF_ZIP64_OR_32) {
        _centralHeader.size = size;
      }
    }
    if (data.length >= Constants.EF_ZIP64_RHO) {
      compressedSize = readUInt64LE(data, Constants.EF_ZIP64_SCOMP);
      if (_centralHeader.compressedSize === Constants.EF_ZIP64_OR_32) {
        _centralHeader.compressedSize = compressedSize;
      }
    }
    if (data.length >= Constants.EF_ZIP64_DSN) {
      offset = readUInt64LE(data, Constants.EF_ZIP64_RHO);
      if (_centralHeader.offset === Constants.EF_ZIP64_OR_32) {
        _centralHeader.offset = offset;
      }
    }
    if (data.length >= Constants.EF_ZIP64_DSN + 4) {
      diskNumStart = data.readUInt32LE(Constants.EF_ZIP64_DSN);
      if (_centralHeader.diskNumStart === Constants.EF_ZIP64_OR_16) {
        _centralHeader.diskNumStart = diskNumStart;
      }
    }
  }
  return {
    get entryName() {
      return decoder2.decode(_entryName);
    },
    get rawEntryName() {
      return _entryName;
    },
    set entryName(val) {
      _entryName = Utils$2.toBuffer(val, decoder2.encode);
      var lastChar = _entryName[_entryName.length - 1];
      _isDirectory = lastChar === 47 || lastChar === 92;
      _centralHeader.fileNameLength = _entryName.length;
    },
    get efs() {
      if (typeof _efs === "function") {
        return _efs(this.entryName);
      } else {
        return _efs;
      }
    },
    get extra() {
      return _extra;
    },
    set extra(val) {
      _extra = val;
      _centralHeader.extraLength = val.length;
      parseExtra(val);
    },
    get comment() {
      return decoder2.decode(_comment);
    },
    set comment(val) {
      _comment = Utils$2.toBuffer(val, decoder2.encode);
      _centralHeader.commentLength = _comment.length;
      if (_comment.length > 65535) throw Utils$2.Errors.COMMENT_TOO_LONG();
    },
    get name() {
      var n = decoder2.decode(_entryName);
      return _isDirectory ? n.substr(n.length - 1).split("/").pop() : n.split("/").pop();
    },
    get isDirectory() {
      return _isDirectory;
    },
    getCompressedData: function() {
      return compress(false, null);
    },
    getCompressedDataAsync: function(callback) {
      compress(true, callback);
    },
    setData: function(value) {
      uncompressedData = Utils$2.toBuffer(value, Utils$2.decoder.encode);
      if (!_isDirectory && uncompressedData.length) {
        _centralHeader.size = uncompressedData.length;
        _centralHeader.method = Utils$2.Constants.DEFLATED;
        _centralHeader.crc = Utils$2.crc32(value);
        _centralHeader.changed = true;
      } else {
        _centralHeader.method = Utils$2.Constants.STORED;
      }
    },
    getData: function(pass) {
      if (_centralHeader.changed) {
        return uncompressedData;
      } else {
        return decompress(false, null, pass);
      }
    },
    getDataAsync: function(callback, pass) {
      if (_centralHeader.changed) {
        callback(uncompressedData);
      } else {
        decompress(true, callback, pass);
      }
    },
    set attr(attr) {
      _centralHeader.attr = attr;
    },
    get attr() {
      return _centralHeader.attr;
    },
    set header(data) {
      _centralHeader.loadFromBinary(data);
    },
    get header() {
      return _centralHeader;
    },
    packCentralHeader: function() {
      _centralHeader.flags_efs = this.efs;
      _centralHeader.extraLength = _extra.length;
      var header = _centralHeader.centralHeaderToBinary();
      var addpos = Utils$2.Constants.CENHDR;
      _entryName.copy(header, addpos);
      addpos += _entryName.length;
      _extra.copy(header, addpos);
      addpos += _centralHeader.extraLength;
      _comment.copy(header, addpos);
      return header;
    },
    packLocalHeader: function() {
      let addpos = 0;
      _centralHeader.flags_efs = this.efs;
      _centralHeader.extraLocalLength = _extralocal.length;
      const localHeaderBuf = _centralHeader.localHeaderToBinary();
      const localHeader = Buffer.alloc(localHeaderBuf.length + _entryName.length + _centralHeader.extraLocalLength);
      localHeaderBuf.copy(localHeader, addpos);
      addpos += localHeaderBuf.length;
      _entryName.copy(localHeader, addpos);
      addpos += _entryName.length;
      _extralocal.copy(localHeader, addpos);
      addpos += _extralocal.length;
      return localHeader;
    },
    toJSON: function() {
      const bytes = function(nr) {
        return "<" + (nr && nr.length + " bytes buffer" || "null") + ">";
      };
      return {
        entryName: this.entryName,
        name: this.name,
        comment: this.comment,
        isDirectory: this.isDirectory,
        header: _centralHeader.toJSON(),
        compressedData: bytes(input),
        data: bytes(uncompressedData)
      };
    },
    toString: function() {
      return JSON.stringify(this.toJSON(), null, "	");
    }
  };
};
const ZipEntry$1 = zipEntry;
const Headers = headers;
const Utils$1 = utilExports;
var zipFile = function(inBuffer, options) {
  var entryList = [], entryTable = {}, _comment = Buffer.alloc(0), mainHeader2 = new Headers.MainHeader(), loadedEntries = false;
  const temporary = /* @__PURE__ */ new Set();
  const opts = options;
  const { noSort, decoder: decoder2 } = opts;
  if (inBuffer) {
    readMainHeader(opts.readEntries);
  } else {
    loadedEntries = true;
  }
  function makeTemporaryFolders() {
    const foldersList = /* @__PURE__ */ new Set();
    for (const elem of Object.keys(entryTable)) {
      const elements = elem.split("/");
      elements.pop();
      if (!elements.length) continue;
      for (let i = 0; i < elements.length; i++) {
        const sub = elements.slice(0, i + 1).join("/") + "/";
        foldersList.add(sub);
      }
    }
    for (const elem of foldersList) {
      if (!(elem in entryTable)) {
        const tempfolder = new ZipEntry$1(opts);
        tempfolder.entryName = elem;
        tempfolder.attr = 16;
        tempfolder.temporary = true;
        entryList.push(tempfolder);
        entryTable[tempfolder.entryName] = tempfolder;
        temporary.add(tempfolder);
      }
    }
  }
  function readEntries() {
    loadedEntries = true;
    entryTable = {};
    if (mainHeader2.diskEntries > (inBuffer.length - mainHeader2.offset) / Utils$1.Constants.CENHDR) {
      throw Utils$1.Errors.DISK_ENTRY_TOO_LARGE();
    }
    entryList = new Array(mainHeader2.diskEntries);
    var index = mainHeader2.offset;
    for (var i = 0; i < entryList.length; i++) {
      var tmp = index, entry = new ZipEntry$1(opts, inBuffer);
      entry.header = inBuffer.slice(tmp, tmp += Utils$1.Constants.CENHDR);
      entry.entryName = inBuffer.slice(tmp, tmp += entry.header.fileNameLength);
      if (entry.header.extraLength) {
        entry.extra = inBuffer.slice(tmp, tmp += entry.header.extraLength);
      }
      if (entry.header.commentLength) entry.comment = inBuffer.slice(tmp, tmp + entry.header.commentLength);
      index += entry.header.centralHeaderSize;
      entryList[i] = entry;
      entryTable[entry.entryName] = entry;
    }
    temporary.clear();
    makeTemporaryFolders();
  }
  function readMainHeader(readNow) {
    var i = inBuffer.length - Utils$1.Constants.ENDHDR, max2 = Math.max(0, i - 65535), n = max2, endStart = inBuffer.length, endOffset = -1, commentEnd = 0;
    const trailingSpace = typeof opts.trailingSpace === "boolean" ? opts.trailingSpace : false;
    if (trailingSpace) max2 = 0;
    for (i; i >= n; i--) {
      if (inBuffer[i] !== 80) continue;
      if (inBuffer.readUInt32LE(i) === Utils$1.Constants.ENDSIG) {
        endOffset = i;
        commentEnd = i;
        endStart = i + Utils$1.Constants.ENDHDR;
        n = i - Utils$1.Constants.END64HDR;
        continue;
      }
      if (inBuffer.readUInt32LE(i) === Utils$1.Constants.END64SIG) {
        n = max2;
        continue;
      }
      if (inBuffer.readUInt32LE(i) === Utils$1.Constants.ZIP64SIG) {
        endOffset = i;
        endStart = i + Utils$1.readBigUInt64LE(inBuffer, i + Utils$1.Constants.ZIP64SIZE) + Utils$1.Constants.ZIP64LEAD;
        break;
      }
    }
    if (endOffset == -1) throw Utils$1.Errors.INVALID_FORMAT();
    mainHeader2.loadFromBinary(inBuffer.slice(endOffset, endStart));
    if (mainHeader2.commentLength) {
      _comment = inBuffer.slice(commentEnd + Utils$1.Constants.ENDHDR);
    }
    if (readNow) readEntries();
  }
  function sortEntries() {
    if (entryList.length > 1 && !noSort) {
      entryList.sort((a, b) => a.entryName.toLowerCase().localeCompare(b.entryName.toLowerCase()));
    }
  }
  return {
    /**
     * Returns an array of ZipEntry objects existent in the current opened archive
     * @return Array
     */
    get entries() {
      if (!loadedEntries) {
        readEntries();
      }
      return entryList.filter((e) => !temporary.has(e));
    },
    /**
     * Archive comment
     * @return {String}
     */
    get comment() {
      return decoder2.decode(_comment);
    },
    set comment(val) {
      _comment = Utils$1.toBuffer(val, decoder2.encode);
      mainHeader2.commentLength = _comment.length;
    },
    getEntryCount: function() {
      if (!loadedEntries) {
        return mainHeader2.diskEntries;
      }
      return entryList.length;
    },
    forEach: function(callback) {
      this.entries.forEach(callback);
    },
    /**
     * Returns a reference to the entry with the given name or null if entry is inexistent
     *
     * @param entryName
     * @return ZipEntry
     */
    getEntry: function(entryName) {
      if (!loadedEntries) {
        readEntries();
      }
      return entryTable[entryName] || null;
    },
    /**
     * Adds the given entry to the entry list
     *
     * @param entry
     */
    setEntry: function(entry) {
      if (!loadedEntries) {
        readEntries();
      }
      entryList.push(entry);
      entryTable[entry.entryName] = entry;
      mainHeader2.totalEntries = entryList.length;
    },
    /**
     * Removes the file with the given name from the entry list.
     *
     * If the entry is a directory, then all nested files and directories will be removed
     * @param entryName
     * @returns {void}
     */
    deleteFile: function(entryName, withsubfolders = true) {
      if (!loadedEntries) {
        readEntries();
      }
      const entry = entryTable[entryName];
      const list = this.getEntryChildren(entry, withsubfolders).map((child) => child.entryName);
      list.forEach(this.deleteEntry);
    },
    /**
     * Removes the entry with the given name from the entry list.
     *
     * @param {string} entryName
     * @returns {void}
     */
    deleteEntry: function(entryName) {
      if (!loadedEntries) {
        readEntries();
      }
      const entry = entryTable[entryName];
      const index = entryList.indexOf(entry);
      if (index >= 0) {
        entryList.splice(index, 1);
        delete entryTable[entryName];
        mainHeader2.totalEntries = entryList.length;
      }
    },
    /**
     *  Iterates and returns all nested files and directories of the given entry
     *
     * @param entry
     * @return Array
     */
    getEntryChildren: function(entry, subfolders = true) {
      if (!loadedEntries) {
        readEntries();
      }
      if (typeof entry === "object") {
        if (entry.isDirectory && subfolders) {
          const list = [];
          const name = entry.entryName;
          for (const zipEntry2 of entryList) {
            if (zipEntry2.entryName.startsWith(name)) {
              list.push(zipEntry2);
            }
          }
          return list;
        } else {
          return [entry];
        }
      }
      return [];
    },
    /**
     *  How many child elements entry has
     *
     * @param {ZipEntry} entry
     * @return {integer}
     */
    getChildCount: function(entry) {
      if (entry && entry.isDirectory) {
        const list = this.getEntryChildren(entry);
        return list.includes(entry) ? list.length - 1 : list.length;
      }
      return 0;
    },
    /**
     * Returns the zip file
     *
     * @return Buffer
     */
    compressToBuffer: function() {
      if (!loadedEntries) {
        readEntries();
      }
      sortEntries();
      const dataBlock = [];
      const headerBlocks = [];
      let totalSize = 0;
      let dindex = 0;
      mainHeader2.size = 0;
      mainHeader2.offset = 0;
      let totalEntries = 0;
      for (const entry of this.entries) {
        const compressedData = entry.getCompressedData();
        entry.header.offset = dindex;
        const localHeader = entry.packLocalHeader();
        const dataLength = localHeader.length + compressedData.length;
        dindex += dataLength;
        dataBlock.push(localHeader);
        dataBlock.push(compressedData);
        const centralHeader = entry.packCentralHeader();
        headerBlocks.push(centralHeader);
        mainHeader2.size += centralHeader.length;
        totalSize += dataLength + centralHeader.length;
        totalEntries++;
      }
      totalSize += mainHeader2.mainHeaderSize;
      mainHeader2.offset = dindex;
      mainHeader2.totalEntries = totalEntries;
      dindex = 0;
      const outBuffer = Buffer.alloc(totalSize);
      for (const content of dataBlock) {
        content.copy(outBuffer, dindex);
        dindex += content.length;
      }
      for (const content of headerBlocks) {
        content.copy(outBuffer, dindex);
        dindex += content.length;
      }
      const mh = mainHeader2.toBinary();
      if (_comment) {
        _comment.copy(mh, Utils$1.Constants.ENDHDR);
      }
      mh.copy(outBuffer, dindex);
      inBuffer = outBuffer;
      loadedEntries = false;
      return outBuffer;
    },
    toAsyncBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
      try {
        if (!loadedEntries) {
          readEntries();
        }
        sortEntries();
        const dataBlock = [];
        const centralHeaders = [];
        let totalSize = 0;
        let dindex = 0;
        let totalEntries = 0;
        mainHeader2.size = 0;
        mainHeader2.offset = 0;
        const compress2Buffer = function(entryLists) {
          if (entryLists.length > 0) {
            const entry = entryLists.shift();
            const name = entry.entryName + entry.extra.toString();
            if (onItemStart) onItemStart(name);
            entry.getCompressedDataAsync(function(compressedData) {
              if (onItemEnd) onItemEnd(name);
              entry.header.offset = dindex;
              const localHeader = entry.packLocalHeader();
              const dataLength = localHeader.length + compressedData.length;
              dindex += dataLength;
              dataBlock.push(localHeader);
              dataBlock.push(compressedData);
              const centalHeader = entry.packCentralHeader();
              centralHeaders.push(centalHeader);
              mainHeader2.size += centalHeader.length;
              totalSize += dataLength + centalHeader.length;
              totalEntries++;
              compress2Buffer(entryLists);
            });
          } else {
            totalSize += mainHeader2.mainHeaderSize;
            mainHeader2.offset = dindex;
            mainHeader2.totalEntries = totalEntries;
            dindex = 0;
            const outBuffer = Buffer.alloc(totalSize);
            dataBlock.forEach(function(content) {
              content.copy(outBuffer, dindex);
              dindex += content.length;
            });
            centralHeaders.forEach(function(content) {
              content.copy(outBuffer, dindex);
              dindex += content.length;
            });
            const mh = mainHeader2.toBinary();
            if (_comment) {
              _comment.copy(mh, Utils$1.Constants.ENDHDR);
            }
            mh.copy(outBuffer, dindex);
            inBuffer = outBuffer;
            loadedEntries = false;
            onSuccess(outBuffer);
          }
        };
        compress2Buffer(Array.from(this.entries));
      } catch (e) {
        onFail(e);
      }
    }
  };
};
const Utils = utilExports;
const pth = path$1;
const ZipEntry = zipEntry;
const ZipFile = zipFile;
const get_Bool = (...val) => Utils.findLast(val, (c) => typeof c === "boolean");
const get_Str = (...val) => Utils.findLast(val, (c) => typeof c === "string");
const get_Fun = (...val) => Utils.findLast(val, (c) => typeof c === "function");
const defaultOptions = {
  // option "noSort" : if true it disables files sorting
  noSort: false,
  // read entries during load (initial loading may be slower)
  readEntries: false,
  // default method is none
  method: Utils.Constants.NONE,
  // file system
  fs: null
};
var admZip = function(input, options) {
  let inBuffer = null;
  const opts = Object.assign(/* @__PURE__ */ Object.create(null), defaultOptions);
  if (input && "object" === typeof input) {
    if (!(input instanceof Uint8Array)) {
      Object.assign(opts, input);
      input = opts.input ? opts.input : void 0;
      if (opts.input) delete opts.input;
    }
    if (Buffer.isBuffer(input)) {
      inBuffer = input;
      opts.method = Utils.Constants.BUFFER;
      input = void 0;
    }
  }
  Object.assign(opts, options);
  const filetools = new Utils(opts);
  if (typeof opts.decoder !== "object" || typeof opts.decoder.encode !== "function" || typeof opts.decoder.decode !== "function") {
    opts.decoder = Utils.decoder;
  }
  if (input && "string" === typeof input) {
    if (filetools.fs.existsSync(input)) {
      opts.method = Utils.Constants.FILE;
      opts.filename = input;
      inBuffer = filetools.fs.readFileSync(input);
    } else {
      throw Utils.Errors.INVALID_FILENAME();
    }
  }
  const _zip = new ZipFile(inBuffer, opts);
  const { canonical, sanitize, zipnamefix } = Utils;
  function getEntry(entry) {
    if (entry && _zip) {
      var item;
      if (typeof entry === "string") item = _zip.getEntry(pth.posix.normalize(entry));
      if (typeof entry === "object" && typeof entry.entryName !== "undefined" && typeof entry.header !== "undefined") item = _zip.getEntry(entry.entryName);
      if (item) {
        return item;
      }
    }
    return null;
  }
  function fixPath(zipPath) {
    const { join, normalize, sep } = pth.posix;
    return join(".", normalize(sep + zipPath.split("\\").join(sep) + sep));
  }
  function filenameFilter(filterfn) {
    if (filterfn instanceof RegExp) {
      return /* @__PURE__ */ function(rx) {
        return function(filename) {
          return rx.test(filename);
        };
      }(filterfn);
    } else if ("function" !== typeof filterfn) {
      return () => true;
    }
    return filterfn;
  }
  const relativePath = (local, entry) => {
    let lastChar = entry.slice(-1);
    lastChar = lastChar === filetools.sep ? filetools.sep : "";
    return pth.relative(local, entry) + lastChar;
  };
  return {
    /**
     * Extracts the given entry from the archive and returns the content as a Buffer object
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @param {Buffer|string} [pass] - password
     * @return Buffer or Null in case of error
     */
    readFile: function(entry, pass) {
      var item = getEntry(entry);
      return item && item.getData(pass) || null;
    },
    /**
     * Returns how many child elements has on entry (directories) on files it is always 0
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @returns {integer}
     */
    childCount: function(entry) {
      const item = getEntry(entry);
      if (item) {
        return _zip.getChildCount(item);
      }
    },
    /**
     * Asynchronous readFile
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @param {callback} callback
     *
     * @return Buffer or Null in case of error
     */
    readFileAsync: function(entry, callback) {
      var item = getEntry(entry);
      if (item) {
        item.getDataAsync(callback);
      } else {
        callback(null, "getEntry failed for:" + entry);
      }
    },
    /**
     * Extracts the given entry from the archive and returns the content as plain text in the given encoding
     * @param {ZipEntry|string} entry - ZipEntry object or String with the full path of the entry
     * @param {string} encoding - Optional. If no encoding is specified utf8 is used
     *
     * @return String
     */
    readAsText: function(entry, encoding) {
      var item = getEntry(entry);
      if (item) {
        var data = item.getData();
        if (data && data.length) {
          return data.toString(encoding || "utf8");
        }
      }
      return "";
    },
    /**
     * Asynchronous readAsText
     * @param {ZipEntry|string} entry ZipEntry object or String with the full path of the entry
     * @param {callback} callback
     * @param {string} [encoding] - Optional. If no encoding is specified utf8 is used
     *
     * @return String
     */
    readAsTextAsync: function(entry, callback, encoding) {
      var item = getEntry(entry);
      if (item) {
        item.getDataAsync(function(data, err) {
          if (err) {
            callback(data, err);
            return;
          }
          if (data && data.length) {
            callback(data.toString(encoding || "utf8"));
          } else {
            callback("");
          }
        });
      } else {
        callback("");
      }
    },
    /**
     * Remove the entry from the file or the entry and all it's nested directories and files if the given entry is a directory
     *
     * @param {ZipEntry|string} entry
     * @returns {void}
     */
    deleteFile: function(entry, withsubfolders = true) {
      var item = getEntry(entry);
      if (item) {
        _zip.deleteFile(item.entryName, withsubfolders);
      }
    },
    /**
     * Remove the entry from the file or directory without affecting any nested entries
     *
     * @param {ZipEntry|string} entry
     * @returns {void}
     */
    deleteEntry: function(entry) {
      var item = getEntry(entry);
      if (item) {
        _zip.deleteEntry(item.entryName);
      }
    },
    /**
     * Adds a comment to the zip. The zip must be rewritten after adding the comment.
     *
     * @param {string} comment
     */
    addZipComment: function(comment) {
      _zip.comment = comment;
    },
    /**
     * Returns the zip comment
     *
     * @return String
     */
    getZipComment: function() {
      return _zip.comment || "";
    },
    /**
     * Adds a comment to a specified zipEntry. The zip must be rewritten after adding the comment
     * The comment cannot exceed 65535 characters in length
     *
     * @param {ZipEntry} entry
     * @param {string} comment
     */
    addZipEntryComment: function(entry, comment) {
      var item = getEntry(entry);
      if (item) {
        item.comment = comment;
      }
    },
    /**
     * Returns the comment of the specified entry
     *
     * @param {ZipEntry} entry
     * @return String
     */
    getZipEntryComment: function(entry) {
      var item = getEntry(entry);
      if (item) {
        return item.comment || "";
      }
      return "";
    },
    /**
     * Updates the content of an existing entry inside the archive. The zip must be rewritten after updating the content
     *
     * @param {ZipEntry} entry
     * @param {Buffer} content
     */
    updateFile: function(entry, content) {
      var item = getEntry(entry);
      if (item) {
        item.setData(content);
      }
    },
    /**
     * Adds a file from the disk to the archive
     *
     * @param {string} localPath File to add to zip
     * @param {string} [zipPath] Optional path inside the zip
     * @param {string} [zipName] Optional name for the file
     * @param {string} [comment] Optional file comment
     */
    addLocalFile: function(localPath2, zipPath, zipName, comment) {
      if (filetools.fs.existsSync(localPath2)) {
        zipPath = zipPath ? fixPath(zipPath) : "";
        const p = pth.win32.basename(pth.win32.normalize(localPath2));
        zipPath += zipName ? zipName : p;
        const _attr = filetools.fs.statSync(localPath2);
        const data = _attr.isFile() ? filetools.fs.readFileSync(localPath2) : Buffer.alloc(0);
        if (_attr.isDirectory()) zipPath += filetools.sep;
        this.addFile(zipPath, data, comment, _attr);
      } else {
        throw Utils.Errors.FILE_NOT_FOUND(localPath2);
      }
    },
    /**
     * Callback for showing if everything was done.
     *
     * @callback doneCallback
     * @param {Error} err - Error object
     * @param {boolean} done - was request fully completed
     */
    /**
     * Adds a file from the disk to the archive
     *
     * @param {(object|string)} options - options object, if it is string it us used as localPath.
     * @param {string} options.localPath - Local path to the file.
     * @param {string} [options.comment] - Optional file comment.
     * @param {string} [options.zipPath] - Optional path inside the zip
     * @param {string} [options.zipName] - Optional name for the file
     * @param {doneCallback} callback - The callback that handles the response.
     */
    addLocalFileAsync: function(options2, callback) {
      options2 = typeof options2 === "object" ? options2 : { localPath: options2 };
      const localPath2 = pth.resolve(options2.localPath);
      const { comment } = options2;
      let { zipPath, zipName } = options2;
      const self2 = this;
      filetools.fs.stat(localPath2, function(err, stats) {
        if (err) return callback(err, false);
        zipPath = zipPath ? fixPath(zipPath) : "";
        const p = pth.win32.basename(pth.win32.normalize(localPath2));
        zipPath += zipName ? zipName : p;
        if (stats.isFile()) {
          filetools.fs.readFile(localPath2, function(err2, data) {
            if (err2) return callback(err2, false);
            self2.addFile(zipPath, data, comment, stats);
            return setImmediate(callback, void 0, true);
          });
        } else if (stats.isDirectory()) {
          zipPath += filetools.sep;
          self2.addFile(zipPath, Buffer.alloc(0), comment, stats);
          return setImmediate(callback, void 0, true);
        }
      });
    },
    /**
     * Adds a local directory and all its nested files and directories to the archive
     *
     * @param {string} localPath - local path to the folder
     * @param {string} [zipPath] - optional path inside zip
     * @param {(RegExp|function)} [filter] - optional RegExp or Function if files match will be included.
     */
    addLocalFolder: function(localPath2, zipPath, filter2) {
      filter2 = filenameFilter(filter2);
      zipPath = zipPath ? fixPath(zipPath) : "";
      localPath2 = pth.normalize(localPath2);
      if (filetools.fs.existsSync(localPath2)) {
        const items = filetools.findFiles(localPath2);
        const self2 = this;
        if (items.length) {
          for (const filepath of items) {
            const p = pth.join(zipPath, relativePath(localPath2, filepath));
            if (filter2(p)) {
              self2.addLocalFile(filepath, pth.dirname(p));
            }
          }
        }
      } else {
        throw Utils.Errors.FILE_NOT_FOUND(localPath2);
      }
    },
    /**
     * Asynchronous addLocalFolder
     * @param {string} localPath
     * @param {callback} callback
     * @param {string} [zipPath] optional path inside zip
     * @param {RegExp|function} [filter] optional RegExp or Function if files match will
     *               be included.
     */
    addLocalFolderAsync: function(localPath2, callback, zipPath, filter2) {
      filter2 = filenameFilter(filter2);
      zipPath = zipPath ? fixPath(zipPath) : "";
      localPath2 = pth.normalize(localPath2);
      var self2 = this;
      filetools.fs.open(localPath2, "r", function(err) {
        if (err && err.code === "ENOENT") {
          callback(void 0, Utils.Errors.FILE_NOT_FOUND(localPath2));
        } else if (err) {
          callback(void 0, err);
        } else {
          var items = filetools.findFiles(localPath2);
          var i = -1;
          var next = function() {
            i += 1;
            if (i < items.length) {
              var filepath = items[i];
              var p = relativePath(localPath2, filepath).split("\\").join("/");
              p = p.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
              if (filter2(p)) {
                filetools.fs.stat(filepath, function(er0, stats) {
                  if (er0) callback(void 0, er0);
                  if (stats.isFile()) {
                    filetools.fs.readFile(filepath, function(er1, data) {
                      if (er1) {
                        callback(void 0, er1);
                      } else {
                        self2.addFile(zipPath + p, data, "", stats);
                        next();
                      }
                    });
                  } else {
                    self2.addFile(zipPath + p + "/", Buffer.alloc(0), "", stats);
                    next();
                  }
                });
              } else {
                process.nextTick(() => {
                  next();
                });
              }
            } else {
              callback(true, void 0);
            }
          };
          next();
        }
      });
    },
    /**
     * Adds a local directory and all its nested files and directories to the archive
     *
     * @param {object | string} options - options object, if it is string it us used as localPath.
     * @param {string} options.localPath - Local path to the folder.
     * @param {string} [options.zipPath] - optional path inside zip.
     * @param {RegExp|function} [options.filter] - optional RegExp or Function if files match will be included.
     * @param {function|string} [options.namefix] - optional function to help fix filename
     * @param {doneCallback} callback - The callback that handles the response.
     *
     */
    addLocalFolderAsync2: function(options2, callback) {
      const self2 = this;
      options2 = typeof options2 === "object" ? options2 : { localPath: options2 };
      localPath = pth.resolve(fixPath(options2.localPath));
      let { zipPath, filter: filter2, namefix } = options2;
      if (filter2 instanceof RegExp) {
        filter2 = /* @__PURE__ */ function(rx) {
          return function(filename) {
            return rx.test(filename);
          };
        }(filter2);
      } else if ("function" !== typeof filter2) {
        filter2 = function() {
          return true;
        };
      }
      zipPath = zipPath ? fixPath(zipPath) : "";
      if (namefix == "latin1") {
        namefix = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "");
      }
      if (typeof namefix !== "function") namefix = (str) => str;
      const relPathFix = (entry) => pth.join(zipPath, namefix(relativePath(localPath, entry)));
      const fileNameFix = (entry) => pth.win32.basename(pth.win32.normalize(namefix(entry)));
      filetools.fs.open(localPath, "r", function(err) {
        if (err && err.code === "ENOENT") {
          callback(void 0, Utils.Errors.FILE_NOT_FOUND(localPath));
        } else if (err) {
          callback(void 0, err);
        } else {
          filetools.findFilesAsync(localPath, function(err2, fileEntries) {
            if (err2) return callback(err2);
            fileEntries = fileEntries.filter((dir) => filter2(relPathFix(dir)));
            if (!fileEntries.length) callback(void 0, false);
            setImmediate(
              fileEntries.reverse().reduce(function(next, entry) {
                return function(err3, done) {
                  if (err3 || done === false) return setImmediate(next, err3, false);
                  self2.addLocalFileAsync(
                    {
                      localPath: entry,
                      zipPath: pth.dirname(relPathFix(entry)),
                      zipName: fileNameFix(entry)
                    },
                    next
                  );
                };
              }, callback)
            );
          });
        }
      });
    },
    /**
     * Adds a local directory and all its nested files and directories to the archive
     *
     * @param {string} localPath - path where files will be extracted
     * @param {object} props - optional properties
     * @param {string} [props.zipPath] - optional path inside zip
     * @param {RegExp|function} [props.filter] - optional RegExp or Function if files match will be included.
     * @param {function|string} [props.namefix] - optional function to help fix filename
     */
    addLocalFolderPromise: function(localPath2, props) {
      return new Promise((resolve, reject) => {
        this.addLocalFolderAsync2(Object.assign({ localPath: localPath2 }, props), (err, done) => {
          if (err) reject(err);
          if (done) resolve(this);
        });
      });
    },
    /**
     * Allows you to create a entry (file or directory) in the zip file.
     * If you want to create a directory the entryName must end in / and a null buffer should be provided.
     * Comment and attributes are optional
     *
     * @param {string} entryName
     * @param {Buffer | string} content - file content as buffer or utf8 coded string
     * @param {string} [comment] - file comment
     * @param {number | object} [attr] - number as unix file permissions, object as filesystem Stats object
     */
    addFile: function(entryName, content, comment, attr) {
      entryName = zipnamefix(entryName);
      let entry = getEntry(entryName);
      const update = entry != null;
      if (!update) {
        entry = new ZipEntry(opts);
        entry.entryName = entryName;
      }
      entry.comment = comment || "";
      const isStat = "object" === typeof attr && attr instanceof filetools.fs.Stats;
      if (isStat) {
        entry.header.time = attr.mtime;
      }
      var fileattr = entry.isDirectory ? 16 : 0;
      let unix = entry.isDirectory ? 16384 : 32768;
      if (isStat) {
        unix |= 4095 & attr.mode;
      } else if ("number" === typeof attr) {
        unix |= 4095 & attr;
      } else {
        unix |= entry.isDirectory ? 493 : 420;
      }
      fileattr = (fileattr | unix << 16) >>> 0;
      entry.attr = fileattr;
      entry.setData(content);
      if (!update) _zip.setEntry(entry);
      return entry;
    },
    /**
     * Returns an array of ZipEntry objects representing the files and folders inside the archive
     *
     * @param {string} [password]
     * @returns Array
     */
    getEntries: function(password) {
      _zip.password = password;
      return _zip ? _zip.entries : [];
    },
    /**
     * Returns a ZipEntry object representing the file or folder specified by ``name``.
     *
     * @param {string} name
     * @return ZipEntry
     */
    getEntry: function(name) {
      return getEntry(name);
    },
    getEntryCount: function() {
      return _zip.getEntryCount();
    },
    forEach: function(callback) {
      return _zip.forEach(callback);
    },
    /**
     * Extracts the given entry to the given targetPath
     * If the entry is a directory inside the archive, the entire directory and it's subdirectories will be extracted
     *
     * @param {string|ZipEntry} entry - ZipEntry object or String with the full path of the entry
     * @param {string} targetPath - Target folder where to write the file
     * @param {boolean} [maintainEntryPath=true] - If maintainEntryPath is true and the entry is inside a folder, the entry folder will be created in targetPath as well. Default is TRUE
     * @param {boolean} [overwrite=false] - If the file already exists at the target path, the file will be overwriten if this is true.
     * @param {boolean} [keepOriginalPermission=false] - The file will be set as the permission from the entry if this is true.
     * @param {string} [outFileName] - String If set will override the filename of the extracted file (Only works if the entry is a file)
     *
     * @return Boolean
     */
    extractEntryTo: function(entry, targetPath, maintainEntryPath, overwrite, keepOriginalPermission, outFileName) {
      overwrite = get_Bool(false, overwrite);
      keepOriginalPermission = get_Bool(false, keepOriginalPermission);
      maintainEntryPath = get_Bool(true, maintainEntryPath);
      outFileName = get_Str(keepOriginalPermission, outFileName);
      var item = getEntry(entry);
      if (!item) {
        throw Utils.Errors.NO_ENTRY();
      }
      var entryName = canonical(item.entryName);
      var target = sanitize(targetPath, outFileName && !item.isDirectory ? outFileName : maintainEntryPath ? entryName : pth.basename(entryName));
      if (item.isDirectory) {
        var children = _zip.getEntryChildren(item);
        children.forEach(function(child) {
          if (child.isDirectory) return;
          var content2 = child.getData();
          if (!content2) {
            throw Utils.Errors.CANT_EXTRACT_FILE();
          }
          var name = canonical(child.entryName);
          var childName = sanitize(targetPath, maintainEntryPath ? name : pth.basename(name));
          const fileAttr2 = keepOriginalPermission ? child.header.fileAttr : void 0;
          filetools.writeFileTo(childName, content2, overwrite, fileAttr2);
        });
        return true;
      }
      var content = item.getData(_zip.password);
      if (!content) throw Utils.Errors.CANT_EXTRACT_FILE();
      if (filetools.fs.existsSync(target) && !overwrite) {
        throw Utils.Errors.CANT_OVERRIDE();
      }
      const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
      filetools.writeFileTo(target, content, overwrite, fileAttr);
      return true;
    },
    /**
     * Test the archive
     * @param {string} [pass]
     */
    test: function(pass) {
      if (!_zip) {
        return false;
      }
      for (var entry in _zip.entries) {
        try {
          if (entry.isDirectory) {
            continue;
          }
          var content = _zip.entries[entry].getData(pass);
          if (!content) {
            return false;
          }
        } catch (err) {
          return false;
        }
      }
      return true;
    },
    /**
     * Extracts the entire archive to the given location
     *
     * @param {string} targetPath Target location
     * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
     *                  Default is FALSE
     * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
     *                  Default is FALSE
     * @param {string|Buffer} [pass] password
     */
    extractAllTo: function(targetPath, overwrite, keepOriginalPermission, pass) {
      keepOriginalPermission = get_Bool(false, keepOriginalPermission);
      pass = get_Str(keepOriginalPermission, pass);
      overwrite = get_Bool(false, overwrite);
      if (!_zip) throw Utils.Errors.NO_ZIP();
      _zip.entries.forEach(function(entry) {
        var entryName = sanitize(targetPath, canonical(entry.entryName));
        if (entry.isDirectory) {
          filetools.makeDir(entryName);
          return;
        }
        var content = entry.getData(pass);
        if (!content) {
          throw Utils.Errors.CANT_EXTRACT_FILE();
        }
        const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
        filetools.writeFileTo(entryName, content, overwrite, fileAttr);
        try {
          filetools.fs.utimesSync(entryName, entry.header.time, entry.header.time);
        } catch (err) {
          throw Utils.Errors.CANT_EXTRACT_FILE();
        }
      });
    },
    /**
     * Asynchronous extractAllTo
     *
     * @param {string} targetPath Target location
     * @param {boolean} [overwrite=false] If the file already exists at the target path, the file will be overwriten if this is true.
     *                  Default is FALSE
     * @param {boolean} [keepOriginalPermission=false] The file will be set as the permission from the entry if this is true.
     *                  Default is FALSE
     * @param {function} callback The callback will be executed when all entries are extracted successfully or any error is thrown.
     */
    extractAllToAsync: function(targetPath, overwrite, keepOriginalPermission, callback) {
      callback = get_Fun(overwrite, keepOriginalPermission, callback);
      keepOriginalPermission = get_Bool(false, keepOriginalPermission);
      overwrite = get_Bool(false, overwrite);
      if (!callback) {
        return new Promise((resolve, reject) => {
          this.extractAllToAsync(targetPath, overwrite, keepOriginalPermission, function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this);
            }
          });
        });
      }
      if (!_zip) {
        callback(Utils.Errors.NO_ZIP());
        return;
      }
      targetPath = pth.resolve(targetPath);
      const getPath = (entry) => sanitize(targetPath, pth.normalize(canonical(entry.entryName)));
      const getError = (msg, file) => new Error(msg + ': "' + file + '"');
      const dirEntries = [];
      const fileEntries = [];
      _zip.entries.forEach((e) => {
        if (e.isDirectory) {
          dirEntries.push(e);
        } else {
          fileEntries.push(e);
        }
      });
      for (const entry of dirEntries) {
        const dirPath = getPath(entry);
        const dirAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
        try {
          filetools.makeDir(dirPath);
          if (dirAttr) filetools.fs.chmodSync(dirPath, dirAttr);
          filetools.fs.utimesSync(dirPath, entry.header.time, entry.header.time);
        } catch (er) {
          callback(getError("Unable to create folder", dirPath));
        }
      }
      fileEntries.reverse().reduce(function(next, entry) {
        return function(err) {
          if (err) {
            next(err);
          } else {
            const entryName = pth.normalize(canonical(entry.entryName));
            const filePath = sanitize(targetPath, entryName);
            entry.getDataAsync(function(content, err_1) {
              if (err_1) {
                next(err_1);
              } else if (!content) {
                next(Utils.Errors.CANT_EXTRACT_FILE());
              } else {
                const fileAttr = keepOriginalPermission ? entry.header.fileAttr : void 0;
                filetools.writeFileToAsync(filePath, content, overwrite, fileAttr, function(succ) {
                  if (!succ) {
                    next(getError("Unable to write file", filePath));
                  }
                  filetools.fs.utimes(filePath, entry.header.time, entry.header.time, function(err_2) {
                    if (err_2) {
                      next(getError("Unable to set times", filePath));
                    } else {
                      next();
                    }
                  });
                });
              }
            });
          }
        };
      }, callback)();
    },
    /**
     * Writes the newly created zip file to disk at the specified location or if a zip was opened and no ``targetFileName`` is provided, it will overwrite the opened zip
     *
     * @param {string} targetFileName
     * @param {function} callback
     */
    writeZip: function(targetFileName, callback) {
      if (arguments.length === 1) {
        if (typeof targetFileName === "function") {
          callback = targetFileName;
          targetFileName = "";
        }
      }
      if (!targetFileName && opts.filename) {
        targetFileName = opts.filename;
      }
      if (!targetFileName) return;
      var zipData = _zip.compressToBuffer();
      if (zipData) {
        var ok = filetools.writeFileTo(targetFileName, zipData, true);
        if (typeof callback === "function") callback(!ok ? new Error("failed") : null, "");
      }
    },
    /**
             *
             * @param {string} targetFileName
             * @param {object} [props]
             * @param {boolean} [props.overwrite=true] If the file already exists at the target path, the file will be overwriten if this is true.
             * @param {boolean} [props.perm] The file will be set as the permission from the entry if this is true.
    
             * @returns {Promise<void>}
             */
    writeZipPromise: function(targetFileName, props) {
      const { overwrite, perm } = Object.assign({ overwrite: true }, props);
      return new Promise((resolve, reject) => {
        if (!targetFileName && opts.filename) targetFileName = opts.filename;
        if (!targetFileName) reject("ADM-ZIP: ZIP File Name Missing");
        this.toBufferPromise().then((zipData) => {
          const ret = (done) => done ? resolve(done) : reject("ADM-ZIP: Wasn't able to write zip file");
          filetools.writeFileToAsync(targetFileName, zipData, overwrite, perm, ret);
        }, reject);
      });
    },
    /**
     * @returns {Promise<Buffer>} A promise to the Buffer.
     */
    toBufferPromise: function() {
      return new Promise((resolve, reject) => {
        _zip.toAsyncBuffer(resolve, reject);
      });
    },
    /**
     * Returns the content of the entire zip file as a Buffer object
     *
     * @prop {function} [onSuccess]
     * @prop {function} [onFail]
     * @prop {function} [onItemStart]
     * @prop {function} [onItemEnd]
     * @returns {Buffer}
     */
    toBuffer: function(onSuccess, onFail, onItemStart, onItemEnd) {
      if (typeof onSuccess === "function") {
        _zip.toAsyncBuffer(onSuccess, onFail, onItemStart, onItemEnd);
        return null;
      }
      return _zip.compressToBuffer();
    }
  };
};
const AdmZip = /* @__PURE__ */ getDefaultExportFromCjs(admZip);
const GRF_HEADER_SIZE = 46;
const GRF_SIGNATURE = "Master of Magic";
var GrfFlags = /* @__PURE__ */ ((GrfFlags2) => {
  GrfFlags2[GrfFlags2["File"] = 1] = "File";
  GrfFlags2[GrfFlags2["MixedCrypt"] = 2] = "MixedCrypt";
  GrfFlags2[GrfFlags2["DesCrypt"] = 4] = "DesCrypt";
  return GrfFlags2;
})(GrfFlags || {});
class GrfReader {
  constructor(filePath) {
    __publicField(this, "filePath");
    __publicField(this, "descriptor", null);
    this.filePath = filePath;
  }
  close() {
    if (this.descriptor !== null) {
      fs$1.closeSync(this.descriptor);
      this.descriptor = null;
    }
  }
  open() {
    if (!fs$1.existsSync(this.filePath)) {
      throw new Error(`GRF file not found: ${this.filePath}`);
    }
    this.descriptor = fs$1.openSync(this.filePath, "r");
  }
  readHeader() {
    if (this.descriptor === null) this.open();
    const buffer = Buffer.alloc(GRF_HEADER_SIZE);
    fs$1.readSync(this.descriptor, buffer, 0, GRF_HEADER_SIZE, 0);
    const signature = buffer.toString("latin1", 0, 15);
    if (signature !== GRF_SIGNATURE) {
      throw new Error("Invalid GRF signature");
    }
    const key = buffer.subarray(15, 29);
    const fileTableOffset = Number(buffer.readBigUInt64LE(30));
    const seed = buffer.readInt32LE(38);
    const rawFileCount = buffer.readInt32LE(42);
    const realFileCount = rawFileCount - seed - 7;
    const version2 = 512;
    return {
      signature,
      key,
      fileTableOffset,
      realFileCount,
      version: version2
    };
  }
  async readFileTable(header) {
    if (this.descriptor === null) this.open();
    const tableInfoBuffer = Buffer.alloc(8);
    const absoluteTableOffset = header.fileTableOffset + GRF_HEADER_SIZE;
    fs$1.readSync(this.descriptor, tableInfoBuffer, 0, 8, absoluteTableOffset);
    const compressedSize = tableInfoBuffer.readInt32LE(0);
    const realSize = tableInfoBuffer.readInt32LE(4);
    const compressedData = Buffer.alloc(compressedSize);
    fs$1.readSync(this.descriptor, compressedData, 0, compressedSize, absoluteTableOffset + 8);
    const data = zlib.unzipSync(compressedData);
    if (data.length !== realSize) {
      console.warn(`Warning: Decompressed table size mismatch. Expected ${realSize}, got ${data.length}`);
    }
    const entries = /* @__PURE__ */ new Map();
    let offset = 0;
    let fileCount = 0;
    while (offset < data.length && fileCount < header.realFileCount) {
      let endName = offset;
      while (endName < data.length && data[endName] !== 0) {
        endName++;
      }
      const filename = data.toString("latin1", offset, endName);
      offset = endName + 1;
      const entryCompressedSize = data.readInt32LE(offset);
      offset += 4;
      const entryCompressedSizeAligned = data.readInt32LE(offset);
      offset += 4;
      const entryRealSize = data.readInt32LE(offset);
      offset += 4;
      const entryFlags = data.readUInt8(offset);
      offset += 1;
      const entryOffset = data.readInt32LE(offset);
      offset += 4;
      entries.set(filename.toLowerCase(), {
        filename,
        compressedSize: entryCompressedSize,
        compressedSizeAligned: entryCompressedSizeAligned,
        realSize: entryRealSize,
        flags: entryFlags,
        offset: entryOffset
      });
      fileCount++;
    }
    return entries;
  }
}
class GrfWriter {
  /**
   * Applies changes to a GRF file using the QuickMerge strategy.
   * Overwrites the previous file table with new file data, then appends a new table.
   */
  async quickMerge(filePath, existingHeader, existingTable, newFiles, filesToRemove) {
    let appendOffset = existingHeader.fileTableOffset + GRF_HEADER_SIZE;
    const fd = fs$1.openSync(filePath, "r+");
    try {
      for (const file of filesToRemove) {
        existingTable.delete(file.toLowerCase());
      }
      fs$1.closeSync(fd);
      const writeFd = fs$1.openSync(filePath, "r+");
      let currentOffset = appendOffset;
      for (const [filename, content] of newFiles) {
        const compressed = zlib.deflateSync(content);
        const realSize = content.length;
        const compressedSize = compressed.length;
        const alignedSize = compressedSize + 7 & ~7;
        const padding = alignedSize - compressedSize;
        const writeBuffer = Buffer.alloc(alignedSize);
        compressed.copy(writeBuffer);
        fs$1.writeSync(writeFd, writeBuffer, 0, alignedSize, currentOffset);
        const entryOffset = currentOffset - GRF_HEADER_SIZE;
        existingTable.set(filename.toLowerCase(), {
          filename,
          compressedSize,
          compressedSizeAligned: alignedSize,
          realSize,
          flags: GrfFlags.File,
          offset: entryOffset
        });
        currentOffset += alignedSize;
      }
      const entriesBuffer = this.serializeFileTable(existingTable);
      const compressedTable = zlib.deflateSync(entriesBuffer);
      const tableInfoHeader = Buffer.alloc(8);
      tableInfoHeader.writeInt32LE(compressedTable.length, 0);
      tableInfoHeader.writeInt32LE(entriesBuffer.length, 4);
      fs$1.writeSync(writeFd, tableInfoHeader, 0, 8, currentOffset);
      fs$1.writeSync(writeFd, compressedTable, 0, compressedTable.length, currentOffset + 8);
      const newTableOffset = currentOffset - GRF_HEADER_SIZE;
      const finalFileSize = currentOffset + 8 + compressedTable.length;
      const seed = 0;
      const realFileCount = existingTable.size;
      const rawFileCount = realFileCount + seed + 7;
      const headerBuffer = Buffer.alloc(GRF_HEADER_SIZE);
      headerBuffer.write(GRF_SIGNATURE, "latin1");
      if (existingHeader.key) {
        Buffer.from(existingHeader.key).copy(headerBuffer, 15);
      } else {
      }
      const bigOffset = BigInt(newTableOffset);
      headerBuffer.writeBigUInt64LE(bigOffset, 30);
      headerBuffer.writeInt32LE(seed, 38);
      headerBuffer.writeInt32LE(rawFileCount, 42);
      fs$1.writeSync(writeFd, headerBuffer, 0, GRF_HEADER_SIZE, 0);
      try {
        fs$1.ftruncateSync(writeFd, finalFileSize);
      } catch (e) {
        console.warn("Failed to truncate file, size might be larger than needed", e);
      }
      fs$1.closeSync(writeFd);
    } catch (error) {
      try {
        fs$1.closeSync(fd);
      } catch {
      }
      throw error;
    }
  }
  serializeFileTable(entries) {
    const chunks = [];
    let totalSize = 0;
    for (const entry of entries.values()) {
      const nameBuf = Buffer.from(entry.filename, "latin1");
      const entryLen = nameBuf.length + 1 + 17;
      const buf = Buffer.alloc(entryLen);
      nameBuf.copy(buf, 0);
      buf[nameBuf.length] = 0;
      let pos = nameBuf.length + 1;
      buf.writeInt32LE(entry.compressedSize, pos);
      pos += 4;
      buf.writeInt32LE(entry.compressedSizeAligned, pos);
      pos += 4;
      buf.writeInt32LE(entry.realSize, pos);
      pos += 4;
      buf.writeUInt8(entry.flags, pos);
      pos += 1;
      buf.writeInt32LE(entry.offset, pos);
      pos += 4;
      chunks.push(buf);
      totalSize += entryLen;
    }
    return Buffer.concat(chunks, totalSize);
  }
}
async function extractThorPatch(thorPath, targetDir, defaultGrfName) {
  if (!fs$1.existsSync(thorPath)) {
    throw new Error(`THOR patch file not found: ${thorPath}`);
  }
  const zip = new AdmZip(thorPath);
  const entries = zip.getEntries();
  const grfFiles = /* @__PURE__ */ new Map();
  const diskFiles = [];
  const grfPath = path$1.join(targetDir, defaultGrfName);
  const useGrf = fs$1.existsSync(grfPath);
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const entryName = entry.entryName;
    const normalized = entryName.replace(/\\/g, "/");
    if (useGrf && (normalized.startsWith("data/") || normalized.startsWith("data\\"))) {
      grfFiles.set(normalized, entry.getData());
    } else {
      diskFiles.push(entry);
    }
  }
  for (const entry of diskFiles) {
    const entryName = entry.entryName;
    const targetPath = path$1.join(targetDir, entryName);
    const targetDirPath = path$1.dirname(targetPath);
    if (!fs$1.existsSync(targetDirPath)) {
      fs$1.mkdirSync(targetDirPath, { recursive: true });
    }
    const content = entry.getData();
    fs$1.writeFileSync(targetPath, content);
  }
  if (grfFiles.size > 0) {
    console.log(`Patching ${grfFiles.size} files into ${defaultGrfName}...`);
    const reader = new GrfReader(grfPath);
    const writer = new GrfWriter();
    try {
      const header = reader.readHeader();
      const table = await reader.readFileTable(header);
      reader.close();
      await writer.quickMerge(grfPath, header, table, grfFiles, /* @__PURE__ */ new Set());
    } catch (error) {
      console.error("Failed to patch GRF:", error);
      throw new Error(`Failed to patch GRF ${defaultGrfName}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
const __filename$1 = require$$0$3.fileURLToPath(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("main.js", document.baseURI).href);
const __dirname$1 = path$1.dirname(__filename$1);
let mainWindow = null;
let config = null;
function createWindow() {
  const preloadPath = path$1.join(__dirname$1, "preload.js");
  console.log("Preload path:", preloadPath);
  const windowConfig = (config == null ? void 0 : config.window) || { width: 900, height: 600, resizable: false };
  mainWindow = new electron.BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    frame: false,
    resizable: windowConfig.resizable,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    },
    backgroundColor: "#0f172a",
    icon: path$1.join(__dirname$1, "../public/icon.ico"),
    title: windowConfig.title || "Kafra Client"
  });
  if (process.env.NODE_ENV === "development" || !electron.app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path$1.join(__dirname$1, "../dist/index.html"));
  }
  mainWindow.on("minimize", () => {
    mainWindow == null ? void 0 : mainWindow.webContents.send("window-minimized");
  });
  mainWindow.on("restore", () => {
    mainWindow == null ? void 0 : mainWindow.webContents.send("window-restored");
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
function setupIpcHandlers() {
  electron.ipcMain.on("window-minimize", () => mainWindow == null ? void 0 : mainWindow.minimize());
  electron.ipcMain.on("window-close", () => mainWindow == null ? void 0 : mainWindow.close());
  electron.ipcMain.handle("get-config", () => {
    return config;
  });
  electron.ipcMain.handle("start-update", async () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    if (!config) {
      return { success: false, error: "No configuration loaded" };
    }
    try {
      mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", { status: "checking" });
      const patchServer = config.web.patch_servers[0];
      if (!patchServer) {
        throw new Error("No patch server configured");
      }
      const patches = await fetchPatchList(patchServer.plist_url);
      if (patches.length === 0) {
        mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", { status: "ready" });
        return { success: true, message: "Already up to date" };
      }
      for (let i = 0; i < patches.length; i++) {
        const patch = patches[i];
        const patchUrl = `${patchServer.patch_url}/${patch.filename}`;
        const tempPath = path$1.join(electron.app.getPath("temp"), patch.filename);
        mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", {
          status: "downloading",
          current: i + 1,
          total: patches.length,
          filename: patch.filename
        });
        try {
          await downloadPatch(patchUrl, tempPath, (progress) => {
            mainWindow == null ? void 0 : mainWindow.webContents.send("download-progress", progress);
          });
        } catch (e) {
          const msg = ((_b = (_a = config == null ? void 0 : config.messages) == null ? void 0 : _a.patching) == null ? void 0 : _b.error_download) || "Download failed";
          throw new Error(msg);
        }
        mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", {
          status: "patching",
          current: i + 1,
          total: patches.length,
          filename: patch.filename
        });
        const targetDir = path$1.dirname(electron.app.getPath("exe"));
        try {
          await extractThorPatch(tempPath, targetDir, ((_c = config.client) == null ? void 0 : _c.default_grf_name) || "data.grf");
        } catch (e) {
          const msg = ((_e = (_d = config == null ? void 0 : config.messages) == null ? void 0 : _d.patching) == null ? void 0 : _e.error_extract) || "Extraction failed";
          throw new Error(msg);
        }
        try {
          fs$1.unlinkSync(tempPath);
        } catch (e) {
        }
      }
      mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", { status: "ready" });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const isCustomError = ((_g = (_f = config == null ? void 0 : config.messages) == null ? void 0 : _f.patching) == null ? void 0 : _g.error_download) && errorMsg === config.messages.patching.error_download || ((_i = (_h = config == null ? void 0 : config.messages) == null ? void 0 : _h.patching) == null ? void 0 : _i.error_extract) && errorMsg === config.messages.patching.error_extract;
      const finalError = isCustomError ? errorMsg : ((_k = (_j = config == null ? void 0 : config.messages) == null ? void 0 : _j.patching) == null ? void 0 : _k.error_generic) || errorMsg;
      mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", { status: "error", error: finalError });
      return { success: false, error: finalError };
    }
  });
  electron.ipcMain.on("cancel-update", () => {
    mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", { status: "idle" });
  });
  electron.ipcMain.handle("launch-game", async () => {
    var _a, _b, _c;
    if (!((_a = config == null ? void 0 : config.play) == null ? void 0 : _a.path)) {
      return { success: false, error: "Game path not configured" };
    }
    try {
      const gamePath = path$1.resolve(path$1.dirname(electron.app.getPath("exe")), config.play.path);
      const args = config.play.arguments || [];
      child_process.spawn(gamePath, args, {
        detached: true,
        stdio: "ignore",
        cwd: path$1.dirname(gamePath)
      }).unref();
      if (config.play.exit_on_success !== false) {
        electron.app.quit();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: ((_c = (_b = config.messages) == null ? void 0 : _b.game) == null ? void 0 : _c.launch_error) || (error instanceof Error ? error.message : "Failed to launch game") };
    }
  });
  electron.ipcMain.handle("launch-setup", async () => {
    var _a;
    if (!((_a = config == null ? void 0 : config.setup) == null ? void 0 : _a.path)) {
      return { success: false, error: "Setup path not configured" };
    }
    try {
      const setupPath = path$1.resolve(path$1.dirname(electron.app.getPath("exe")), config.setup.path);
      const args = config.setup.arguments || [];
      child_process.spawn(setupPath, args, {
        detached: true,
        stdio: "ignore",
        cwd: path$1.dirname(setupPath)
      }).unref();
      if (config.setup.exit_on_success === true) {
        electron.app.quit();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to launch setup" };
    }
  });
  electron.ipcMain.handle("sso-login", async (_, credentials) => {
    var _a;
    if (!((_a = config == null ? void 0 : config.play) == null ? void 0 : _a.path)) {
      return { success: false, error: "Game path not configured" };
    }
    try {
      const gamePath = path$1.resolve(path$1.dirname(electron.app.getPath("exe")), config.play.path);
      const args = [...config.play.arguments || [], "-t", credentials.username, credentials.password];
      child_process.spawn(gamePath, args, {
        detached: true,
        stdio: "ignore",
        cwd: path$1.dirname(gamePath)
      }).unref();
      if (config.play.exit_on_success !== false) {
        electron.app.quit();
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to launch with SSO" };
    }
  });
  electron.ipcMain.handle("manual-patch", async () => {
    var _a;
    const result = await electron.dialog.showOpenDialog(mainWindow, {
      title: "Select THOR Patch File",
      filters: [{ name: "THOR Patches", extensions: ["thor"] }],
      properties: ["openFile"]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: "No file selected" };
    }
    try {
      mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", {
        status: "patching",
        filename: path$1.basename(result.filePaths[0])
      });
      const targetDir = path$1.dirname(electron.app.getPath("exe"));
      await extractThorPatch(result.filePaths[0], targetDir, ((_a = config == null ? void 0 : config.client) == null ? void 0 : _a.default_grf_name) || "data.grf");
      mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", { status: "ready" });
      mainWindow == null ? void 0 : mainWindow.webContents.send("patch-applied", { filename: path$1.basename(result.filePaths[0]) });
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to apply patch";
      mainWindow == null ? void 0 : mainWindow.webContents.send("patching-status", { status: "error", error: errorMsg });
      return { success: false, error: errorMsg };
    }
  });
  electron.ipcMain.handle("reset-cache", async () => {
    try {
      const cachePath = path$1.join(electron.app.getPath("userData"), "patch-cache.json");
      if (fs$1.existsSync(cachePath)) {
        fs$1.unlinkSync(cachePath);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to reset cache" };
    }
  });
  electron.ipcMain.on("open-external", (_, url2) => {
    electron.shell.openExternal(url2);
  });
  electron.ipcMain.handle("toggle-grf", async (_, { normal, gray }) => {
    try {
      const dataIniPath = path$1.resolve(path$1.dirname(electron.app.getPath("exe")), "data.ini");
      let content = "";
      if (fs$1.existsSync(dataIniPath)) {
        content = fs$1.readFileSync(dataIniPath, "utf-8");
      }
      const isGrayFirst = content.includes(`0=${gray}`);
      const newContent = `[Data]\r
0=${isGrayFirst ? normal : gray}\r
1=${isGrayFirst ? gray : normal}\r
`;
      fs$1.writeFileSync(dataIniPath, newContent, { encoding: "utf-8" });
      return { success: true, isGray: !isGrayFirst };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to toggle GRF" };
    }
  });
  electron.ipcMain.handle("launch-exe", async (_, exePath) => {
    try {
      const fullPath = path$1.resolve(path$1.dirname(electron.app.getPath("exe")), exePath);
      if (!fs$1.existsSync(fullPath)) {
        throw new Error(`File not found: ${exePath}`);
      }
      child_process.spawn(fullPath, [], {
        detached: true,
        stdio: "ignore",
        cwd: path$1.dirname(fullPath)
      }).unref();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to launch EXE" };
    }
  });
}
electron.app.whenReady().then(async () => {
  const configPath = path$1.join(path$1.dirname(electron.app.getPath("exe")), "config.yml");
  const devConfigPath = path$1.join(__dirname$1, "../config.yml");
  try {
    if (fs$1.existsSync(configPath)) {
      config = await loadConfig(configPath);
    } else if (fs$1.existsSync(devConfigPath)) {
      config = await loadConfig(devConfigPath);
    } else {
      config = {
        window: { title: "Kafra Client", width: 900, height: 600, resizable: false },
        play: { path: "ragnarok.exe", arguments: [], exit_on_success: true },
        web: { index_url: "", patch_servers: [] },
        client: { default_grf_name: "data.grf" },
        patching: { in_place: true, check_integrity: true, create_grf: false }
      };
    }
  } catch (error) {
    console.error("Failed to load config:", error);
  }
  setupIpcHandlers();
  createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

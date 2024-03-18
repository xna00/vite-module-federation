import { walk } from "estree-walker";
import MagicString from "magic-string";
import { basename, resolve } from "path";
import type { Plugin, ResolvedConfig } from "vite";
export default function shareModules({
  shared,
  entry,
  remoteEntries,
  exposeFile,
}: {
  shared: string[];
  entry: string;
  remoteEntries: Record<string, string>;
  exposeFile: string;
}): Plugin {
  const bootstrapId = "/bootstrap";
  const resolvedBootstrapId = "\0" + bootstrapId;
  let counter = 0;
  const sharedMap: [string, string][] = shared.map((s) => [s, "S" + counter++]);
  let config: ResolvedConfig;

  return {
    name: "share-modules",
    config(_config, env) {
      return {
        build: {
          lib: {
            entry: "./index.html",
            formats: ["es"],
          },
        },
      };
    },
    configResolved(_config) {
      config = _config;
    },
    buildStart: {
      order: "post",
      handler(options) {
        if (config.mode === "production") {
          this.emitFile({
            type: "chunk",
            fileName: basename(exposeFile.replace(".ts", ".js")),
            id: exposeFile,
            preserveSignature: "exports-only",
          });
        }
      },
    },

    resolveId(source, importer) {
      if (source === bootstrapId) {
        return { id: resolvedBootstrapId, moduleSideEffects: true };
      }
    },
    async load(id) {
      if (id === resolvedBootstrapId) {
        const entry_2 = resolve(entry);
        const ret = `
        ${sharedMap.map(([m, n]) => `import * as ${n} from "${m}";`).join("\n")}
        window.__shared_modules__ = {
        ${sharedMap.map(([m, n]) => `"${m}": ${n},`).join("\n")}
        };
        window.__remote_modules__ = ${JSON.stringify(remoteEntries)};
        import("${entry_2}");`;
        return ret;
      }
    },
    transformIndexHtml: {
      order: "pre",
      handler: (html) => {
        return {
          html,
          tags: [
            {
              tag: "script",
              attrs: {
                src: bootstrapId,
                type: "module",
              },
              injectTo: "body-prepend",
            },
          ],
        };
      },
    },

    transform(code, id, options) {
      type AcornNode = ReturnType<typeof this.parse>;
      let ast: AcornNode;
      let magic: MagicString;
      if (id === resolvedBootstrapId) {
        return;
      }
      try {
        ast = this.parse(code);
        magic = new MagicString(code);
      } catch {
        return;
      }
      let dirty = false;
      // @ts-ignore
      walk(ast, {
        enter: (node) => {
          if (
            node.type === "ImportDeclaration" &&
            shared.includes(node.source.value?.toString() ?? "")
          ) {
            dirty = true;
            const source = `window.__shared_modules__[${node.source.raw}]`;

            const newImport = node.specifiers
              .map((specifier) => {
                if (specifier.type === "ImportDefaultSpecifier") {
                  return `const { default: ${specifier.local.name}} = ${source};`;
                } else if (specifier.type === "ImportSpecifier") {
                  return `const { ${specifier.imported.name}: ${specifier.local.name}} = ${source};`;
                } else if (specifier.type === "ImportNamespaceSpecifier") {
                  return `const ${specifier.local.name} = ${source};`;
                } else {
                  throw new Error("unknown import specifier");
                }
              })
              .join("\n");
            // @ts-ignore
            magic.overwrite(node.start, node.end, newImport);
          }
          if (
            node.type === "ImportExpression" &&
            // @ts-ignore
            Object.keys(remoteEntries).includes(node.source.value)
          ) {
            magic.overwrite(
              // @ts-ignore
              node.start,
              // @ts-ignore
              node.end,
              // @ts-ignore
              `import(/* @vite-ignore */ window.__remote_modules__[${node.source.raw}])`
            );
          }
        },
      });
      if (dirty) {
        return {
          code: magic.toString(),
          map: magic.generateMap({ hires: true }),
        };
      }
    },
  };
}

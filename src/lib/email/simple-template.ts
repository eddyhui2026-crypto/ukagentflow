export type SimpleTemplateVars = {
  name: string;
  email: string;
};

/** Replace {{name}} and {{email}} in subject/body (global, case-sensitive keys as written). */
export function applySimpleTemplate(template: string, vars: SimpleTemplateVars): string {
  return template
    .replace(/\{\{name\}\}/g, vars.name)
    .replace(/\{\{email\}\}/g, vars.email);
}

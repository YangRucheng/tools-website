import type { Tool, Category } from './types';

const toolMap = new Map<string, Tool>();

export const registerTool = (tool: Tool): void => {
  if (toolMap.has(tool.id)) {
    console.warn(`Tool "${tool.id}" is already registered, skipping duplicate.`);
    return;
  }
  toolMap.set(tool.id, tool);
};

export const getTools = (): Tool[] => [...toolMap.values()];

export const getToolById = (id: string): Tool | undefined => toolMap.get(id);

export const getToolByRoute = (route: string): Tool | undefined =>
  getTools().find((t) => t.route === route);

export const getToolsByCategory = (cat: Category): Tool[] =>
  getTools().filter((t) => t.category === cat);

export const searchTools = (query: string): Tool[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return getTools().filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q)),
  );
};

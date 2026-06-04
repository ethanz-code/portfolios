export function isAdminMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === 'true';
}

export function getVisitorDescription(project: { description: string; visitorDescription?: string }): string {
  return project.visitorDescription || project.description;
}

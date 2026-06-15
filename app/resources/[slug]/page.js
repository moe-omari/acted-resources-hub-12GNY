import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import ResourceDetail from '../ResourceDetail';

// This dynamic route pre-renders static paths but allows new additions on-demand
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), 'public', 'iec', 'materials.json');
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const materials = JSON.parse(fileContent);
    return materials.map((m) => ({ slug: m.key }));
  } catch (err) {
    console.error('Failed to generate static params:', err);
    return [];
  }
}

export default async function ResourcePage({ params }) {
  const { slug } = await params;
  
  const filePath = path.join(process.cwd(), 'public', 'iec', 'materials.json');
  let materials = [];
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    materials = JSON.parse(fileContent);
  } catch (err) {
    console.error('Failed to read materials.json in dynamic page.js', err);
    notFound();
  }

  const resource = materials.find((m) => m.key === slug);

  if (!resource) {
    notFound();
  }

  return <ResourceDetail resource={resource} />;
}

import dynamic from 'next/dynamic';

const WindowSurf = dynamic(() => import('@/components/WindowSurf'), { ssr: false });

export default function Home() {
  return <WindowSurf />;
}

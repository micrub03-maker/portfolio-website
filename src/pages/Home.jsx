import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Html, OrbitControls } from '@react-three/drei';
import { Loader } from '../components/Loader';
import { useBackground } from '../contexts/BackgroundContext';

export default function Home() {
    const [isZooming, setIsZooming] = useState(false);
    const { homeLoaded, setHomeLoaded } = useBackground();

    const handleZoomStart = () => {
        setIsZooming(true);
    };

    return (
         <section className='w-full h-screen relative'>
            {!homeLoaded && <Loader setIsLoaded={setHomeLoaded} />}
            <Canvas className="w-full h-screen bg-transparent z-0" camera={{ near: 0.1, far: 1000 }}>
                <Suspense fallback={null}>
                    {/* <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        maxPolarAngle={Math.PI / 1.5}
                        minDistance={1}
                        maxDistance={10}
                        target={[0, -1, 2]}
                    /> */}
                    <Soccer
                        position={[0, -0.9, 5]}
                        rotation={[0, 0, 0]}
                        onZoomStart={handleZoomStart}
                    />
                    <Environment preset="night" />
                </Suspense>
            </Canvas>
        </section>
    );
}
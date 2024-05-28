import {PHASE_DEVELOPMENT_SERVER} from 'next/constants.js';

export default async (phase, {defaultConfig}) => {
    
    const env = {
        dataAPI: phase === PHASE_DEVELOPMENT_SERVER? 'http://localhost:3091': 'https://nickmorrison.me:3091'
    }

    /** @type {import('next').NextConfig} */
    const nextConfig = {    
        env,
        basePath: '/ssh-dashboard',
        output: 'export'
    }

    return nextConfig;
}

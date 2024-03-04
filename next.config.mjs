import {PHASE_DEVELOPMENT_SERVER} from 'next/constants.js';

export default async (phase, {defaultConfig}) => {
    
    const env = {
        dataAPI: phase === PHASE_DEVELOPMENT_SERVER? 'localhost:3091': null
    }

    /** @type {import('next').NextConfig} */
    const nextConfig = {    
        env
    }

    return nextConfig;
}

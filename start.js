#!/usr/bin/env node

/**
 * Development Start Script
 * Quick way to start the Lost Ark Raid Manager in development mode
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if we're in the right directory
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Please run this script from the project root directory.');
    process.exit(1);
}

// Set development environment
process.env.NODE_ENV = 'development';

console.log('🚀 Starting Lost Ark Raid Manager in development mode...\n');

// Function to start the application
function startApp() {
    // Check if electron is installed
    const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
    
    if (!fs.existsSync(electronPath)) {
        console.log('📦 Installing dependencies first...');
        installDependencies().then(() => {
            startElectron();
        });
    } else {
        startElectron();
    }
}

// Function to install dependencies
function installDependencies() {
    return new Promise((resolve, reject) => {
        console.log('📦 Running npm install...');
        
        const install = spawn('npm', ['install'], {
            stdio: 'inherit',
            shell: true
        });

        install.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Dependencies installed successfully');
                resolve();
            } else {
                console.error('❌ Failed to install dependencies');
                reject(new Error(`npm install exited with code ${code}`));
            }
        });

        install.on('error', (error) => {
            console.error('❌ Error installing dependencies:', error.message);
            reject(error);
        });
    });
}

// Function to start Electron
function startElectron() {
    console.log('⚡ Starting Electron...\n');
    
    const mainPath = path.join(__dirname, 'src', 'main.js');
    
    if (!fs.existsSync(mainPath)) {
        console.error('❌ Main process file not found:', mainPath);
        process.exit(1);
    }

    const electron = spawn('npx', ['electron', mainPath], {
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: 'development',
            ELECTRON_IS_DEV: 'true'
        }
    });

    electron.on('close', (code) => {
        if (code === 0) {
            console.log('\n👋 Application closed successfully');
        } else {
            console.log(`\n⚠️  Application exited with code ${code}`);
        }
        process.exit(code);
    });

    electron.on('error', (error) => {
        console.error('❌ Error starting Electron:', error.message);
        process.exit(1);
    });

    // Handle process termination
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down...');
        electron.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down...');
        electron.kill('SIGTERM');
    });
}

// Function to check system requirements
function checkSystemRequirements() {
    console.log('🔍 Checking system requirements...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (nodeMajor < 16) {
        console.error('❌ Node.js 16 or higher is required. Current version:', nodeVersion);
        console.log('💡 Please update Node.js from https://nodejs.org/');
        process.exit(1);
    }
    
    console.log(`✅ Node.js version: ${nodeVersion}`);
    
    // Check npm version
    const npmVersion = require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm version: ${npmVersion}`);
    
    // Check if we're on a supported platform
    const platform = process.platform;
    const supportedPlatforms = ['win32', 'darwin', 'linux'];
    
    if (!supportedPlatforms.includes(platform)) {
        console.warn(`⚠️  Platform ${platform} is not officially supported`);
    } else {
        console.log(`✅ Platform: ${platform}`);
    }
    
    console.log('');
}

// Main execution
async function main() {
    try {
        checkSystemRequirements();
        startApp();
    } catch (error) {
        console.error('❌ Failed to start application:', error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = { startApp, checkSystemRequirements };
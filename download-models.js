import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
    {
        url: 'https://media.githubusercontent.com/media/tanh911/cruise-ship-halora/main/public/models/cruise-ship-opt.glb',
        dest: path.join(__dirname, 'public', 'models', 'cruise-ship-opt.glb')
    },
    {
        url: 'https://media.githubusercontent.com/media/tanh911/cruise-ship-halora/main/public/models/premiumTripleRoom.glb',
        dest: path.join(__dirname, 'public', 'models', 'premiumTripleRoom.glb')
    }
];

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${url} to ${dest}...`);
        const file = fs.createWriteStream(dest);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Successfully downloaded ${dest}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

const run = async () => {
    try {
        for (const model of models) {
            // Create models directory if it doesn't exist
            const dir = path.dirname(model.dest);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Check if file is small (LFS pointer)
            let needsDownload = true;
            if (fs.existsSync(model.dest)) {
                const stats = fs.statSync(model.dest);
                if (stats.size > 1000) {
                    needsDownload = false; // Already downloaded the real file, not a pointer
                    console.log(`${model.dest} already exists and is large enough. Skipping.`);
                }
            }

            if (needsDownload) {
                await downloadFile(model.url, model.dest);
            }
        }
    } catch (err) {
        console.error('Error downloading models:', err);
        process.exit(1);
    }
};

run();
